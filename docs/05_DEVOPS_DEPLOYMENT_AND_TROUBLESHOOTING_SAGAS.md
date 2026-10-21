# DevOps Deployment Manual & Troubleshooting Sagas

> **Project:** Stevens Marketplace  
> **Production URLs:**  
> - **Frontend (Vercel):** [https://stevens-marketplace.vercel.app/](https://stevens-marketplace.vercel.app/)  
> - **Backend (Render):** [https://stevens-marketplace-backend.onrender.com/](https://stevens-marketplace-backend.onrender.com/)  
> - **Repository (GitHub):** [https://github.com/jyoad3003/stevens-marketplace](https://github.com/jyoad3003/stevens-marketplace)

---

## 1. The Monorepo Cloud Hosting Architecture

A common dilemma in web engineering is hosting a monorepo containing both a Node.js backend and a React frontend on free cloud platforms. We selected a best-of-breed decoupled hosting strategy:

```
                  +--------------------------------+
                  |         GITHUB REPO            |
                  | jyoad3003/stevens-marketplace  |
                  +---------------+----------------+
                                  |
              +-------------------+-------------------+
              |                                       |
              v (Pushes to client/)                   v (Pushes to root/server)
+---------------------------+           +---------------------------+
|          VERCEL           |           |          RENDER           |
|  Static & SPA CDN Hosting |           | Node.js Web Service       |
|  stevens-marketplace      |           | stevens-marketplace-      |
|  .vercel.app              |           | backend.onrender.com      |
+-------------+-------------+           +-------------+-------------+
              |                                       |
              | /api/* Proxy Rewrite                  | MongoDB Connection
              v                                       v
    (Bypasses CORS in Cloud)            +---------------------------+
                                        |       MONGODB ATLAS       |
                                        | Cloud Document Database   |
                                        +---------------------------+
```

---

## 2. Step-by-Step Render Backend Deployment

### The Root Directory Gotcha
When first deploying on Render, the UI prompts for a **Root Directory**. 
- *Initial Instinct:* Set Root Directory to `server`.
- *The Problem:* In our project structure, the main `package.json` that defines dependencies and `npm start` (`node server/app.js`) is located in the **ROOT** of `stevens-marketplace`, not inside the `server/` subfolder.
- *The Solution:* Leave **Root Directory completely blank** so Render executes commands from the repository root.

### Render Web Service Configuration:
- **Service Type:** Web Service
- **Name:** `stevens-marketplace-backend`
- **Region:** US East (Ohio)
- **Branch:** `main`
- **Root Directory:** *(Blank)*
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### Critical Environment Variable:
Under **Environment Variables**:
- **Key:** `MONGODB_URI`
- **Value:** `mongodb+srv://jyoad3003_db_user:<password>@stevens-marketplace.an59san.mongodb.net/?retryWrites=true&w=majority&appName=Stevens-Marketplace`

---

## 3. Step-by-Step Vercel Frontend Deployment

### Configuration Settings
1. Import repository `jyoad3003/stevens-marketplace` in Vercel.
2. In **Project Settings > General**:
   - **Framework Preset:** Vite
   - **Root Directory:** `client` *(Tells Vercel where `index.html` and `vite.config.js` live)*
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### The Magic of `client/vercel.json`
To make React talk to Render seamlessly without CORS cross-origin errors and to fix React Router deep linking, we authored `client/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:match*",
      "destination": "https://stevens-marketplace-backend.onrender.com/api/:match*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### What this accomplishes:
1. **API Proxying (Bypassing CORS):** Whenever React requests `/api/projects`, Vercel's edge network proxies that request directly to Render behind the scenes. To the user's browser, the request looks like a local call to `stevens-marketplace.vercel.app`, completely avoiding browser CORS rejections.
2. **Single Page Application (SPA) Fallback:** Without the second rewrite, refreshing the browser while on `https://stevens-marketplace.vercel.app/profile` would return a raw "404 Not Found" from Vercel's CDN because no physical file named `profile.html` exists. The rewrite tells Vercel to route all traffic to `/index.html`, allowing React Router to handle page routing inside the browser.

---

## 4. The Production Troubleshooting Sagas

### Saga 1: The MongoDB Atlas `SSL alert number 80` Error
#### The Phenomenon:
Right after deploying to Vercel and Render, logging in failed with this cryptic OpenSSL error in the logs:
```
40EDBE11167F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:
../deps/openssl/openssl/ssl/record/rec_layer_s3.c:918:SSL alert number 80
```
Furthermore, the "Trending at Stevens" section on the landing page disappeared.

#### Root Cause:
MongoDB Atlas includes a firewall that restricts database connections to known IP addresses. Initially, Atlas was configured to only permit the developer's laptop IP address. When Render's cloud servers attempted to connect, Atlas immediately terminated the TLS handshake with `SSL alert number 80`.

#### The Fix:
1. Navigated to MongoDB Atlas Dashboard -> **Security** -> **Network Access**.
2. Clicked **+ Add IP Address**.
3. Selected **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Once Atlas transitioned the entry to "Active", Render successfully connected, and all database operations resumed.

---

### Saga 2: The Stevens Guest Wi-Fi / DNS Port 27017 Timeout
#### The Phenomenon:
During campus testing, the application suddenly threw:
```
querySrv ETIMEOUT _mongodb._tcp.stevens-marketplace.an59san.mongodb.net
```
Or infinite hanging on `Mongoose/MongoDB connect()`.

#### Root Cause:
Institutional Wi-Fi networks (specifically Stevens Institute of Technology Guest Wi-Fi) enforce strict firewall policies:
1. Outbound traffic on MongoDB standard port `27017` is blocked.
2. Special DNS SRV records (`_mongodb._tcp...`) used by `mongodb+srv://` connection strings are filtered by campus DNS servers to prevent unauthorized database tunneling.

#### The Fix:
Switching to a personal mobile hotspot or setting laptop DNS to Google Public DNS (`8.8.8.8` / `8.8.4.4`) immediately bypasses campus firewalls.

---

### Saga 3: The Environment Variable Typo (`MONGO_URI` vs. `MONGODB_URI`)
#### The Phenomenon:
Render logs reported:
```
MongoServerError: Invalid connection string: ""
```
#### Root Cause:
The environment variable key in Render was initially saved as `MONGO_URI`. However, our server code in `server/config/mongoConnection.js` explicitly looked for:
```javascript
const mongoConfig = {
  serverUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/',
  database: 'stevens-marketplace'
};
```
Because `process.env.MONGODB_URI` was undefined, the backend fell back to localhost, which does not exist in the Render container.

#### The Fix:
Renamed the key in Render's Environment settings to **`MONGODB_URI`**. Render automatically triggered an instantaneous redeploy with the correct database connection string.

---

### Saga 4: Render Free-Tier Cold Starts (Demo Survival Guide)
#### The Phenomenon:
Render's free tier automatically spins down web services after 15 minutes of inactivity to conserve cloud compute resources.

#### The Demo Pro-Tip for Professor Lippizzi:
If someone opens `https://stevens-marketplace.vercel.app/` when the backend is asleep, the first request will take **30 to 50 seconds** while Render spins the container back up. 

**Pre-Demo Protocol:**
5 minutes before your meeting with Professor Carlo Lippizzi:
1. Open your phone or laptop.
2. Visit `https://stevens-marketplace.vercel.app/` and log in once.
3. This sends an HTTP wake-up ping to Render. By the time Professor Lippizzi views your screen or tests the site, the backend will be fully awake and responses will be instantaneous (< 150ms).
