# Future Leaps Roadmap & Agent Handoff Specification

> **Project:** Stevens Marketplace  
> **Target Audience:** Professor Carlo Lippizzi, Lead Developer, and Any Successor AI Agent / Pair Programmer  
> **Handoff Status:** 100% Operational, Fully Deployed, Live on Public Web

---

## 1. System Inventory & Live Artifacts

| Component | Technology | Live URL / Access Point |
|:---|:---|:---|
| **Frontend Web App** | React (Vite), SPA, CSS Glassmorphism | [https://stevens-marketplace.vercel.app/](https://stevens-marketplace.vercel.app/) |
| **Backend API** | Node.js, Express, ES Modules, `express-session` | [https://stevens-marketplace-backend.onrender.com/](https://stevens-marketplace-backend.onrender.com/) |
| **Database** | MongoDB Atlas (Shared M0 Cluster) | `mongodb+srv://...stevens-marketplace.an59san.mongodb.net` |
| **Source Code** | Git / GitHub Monorepo | [https://github.com/jyoad3003/stevens-marketplace](https://github.com/jyoad3003/stevens-marketplace) |

---

## 2. Open Strategic Questions for Professor Carlo Lippizzi

When presenting the prototype to Professor Lippizzi, use these open architecture questions to guide his feedback:

### Question 1: Project Ownership & Decentralization
- **Current Prototype State:** Mentors create projects; Students apply.
- **Professor Decision Needed:** Can Students also launch their own peer-to-peer capstone teams or startup projects and recruit other students? Or should every project strictly require a Faculty/Mentor sponsor to maintain university academic oversight?

### Question 2: Transition from Mock AI to Production Vector AI
- **Current Prototype State:** Rule-based skill overlap algorithm ($Jaccard$ matching percentage).
- **Professor Decision Needed:** Does the department want to provide a Google Cloud / Gemini API key to implement real vector embeddings? (See Section 3 below for the technical design).

### Question 3: Messaging & Interactivity
- **Current Prototype State:** Application notes submitted with join requests; acceptance/rejection status displayed on dashboard.
- **Professor Decision Needed:** Should we implement real-time 1-on-1 direct messaging (WebSockets) between mentors and students, or should the platform encourage them to transition to Stevens Canvas/Email once accepted?

---

## 3. The AI Leap: Migrating from Mock AI to MongoDB Atlas Vector Search

The current schemas were intentionally designed to support vector embeddings without requiring a database migration. Here is the step-by-step technical plan for the next leap:

```
+---------------------------------------------------------------+
|                   VECTOR EMBEDDING PIPELINE                   |
|                                                               |
|  [User Profile: Skills + Bio]                                 |
|               |                                               |
|               v                                               |
|  [Google Gemini text-embedding-004] =====> [768-dim Vector]   |
|                                                    |          |
|  [Project: Title + Description + Skills]           |          |
|               |                                    v          |
|               v                         [MongoDB Atlas]       |
|  [Google Gemini text-embedding-004] ==> [$vectorSearch Index] |
|                                                    |          |
|                                                    v          |
|                                         [Cosine Similarity]   |
|                                         Top 5 Recommended     |
+---------------------------------------------------------------+
```

### Technical Steps for Implementation:
1. **Embedding Generation:**
   - When a Mentor creates/updates a project, concatenate `title + " " + description + " " + requiredSkills.join(" ")`.
   - Send string to Gemini's `text-embedding-004` API to produce a 768-dimensional float array.
   - Store array in `projects.embedding`.
2. **Student Vector Representation:**
   - When a Student updates their profile, vectorize `degree + " " + bio + " " + skills.join(" ") + " " + interests.join(" ")`.
   - Store array in `users.embedding`.
3. **Atlas Vector Search Query:**
   - In MongoDB Atlas, define a Vector Search index:
     ```json
     {
       "fields": [
         {
           "type": "vector",
           "path": "embedding",
           "numDimensions": 768,
           "similarity": "cosine"
         }
       ]
     }
     ```
   - In `server/data/projects.js`, replace the client-side Jaccard calculation with a single `$vectorSearch` aggregation query.

---

## 4. Infrastructure Polish & Next Technical Sprints

### Sprint A: Production Session Store (`connect-mongo`)
- **Current Warning in Render Logs:** `"Warning: connect.session() MemoryStore is not designed for a production environment"`
- **Why It Happens:** `express-session` currently stores active session IDs in server RAM. When Render restarts or sleeps, logged-in users must re-authenticate.
- **The Upgrade:** Install `connect-mongo` and configure session persistence directly in the MongoDB `sessions` collection.

### Sprint B: Real-Time Direct Messaging (Socket.io)
- Add a floating chat drawer on the Project Detail and Mentor Dashboard pages.
- Allows Mentors to conduct short interviews with applicants before clicking "Accept".

### Sprint C: Automated Email Notifications (SendGrid / Nodemailer)
- Send automated Stevens email notifications whenever:
  1. A student submits a join application (notifies mentor).
  2. A mentor accepts or rejects an application (notifies student).

---

## 5. Specification for Successor AI Agent

If a new AI agent, assistant, or team member takes over this repository, here are the non-negotiable operational guidelines:

1. **Monorepo Directory Integrity:**
   - Backend logic resides in `server/`. Frontend logic resides in `client/`.
   - Always run frontend commands with working directory `stevens-marketplace/client` and backend commands from `stevens-marketplace/`.
2. **Authentication Protocol:**
   - Never remove `credentials: 'include'` from frontend fetch calls; doing so breaks session cookie transmission across Vercel and Render.
3. **Database Rules:**
   - Never store student applicants as an embedded array on project documents. Always use the relational `connections` collection to preserve MongoDB scalability.
4. **Environment Variables:**
   - Backend requires `MONGODB_URI` and `SESSION_SECRET`.
   - Frontend requires `client/vercel.json` rewrite routing.
