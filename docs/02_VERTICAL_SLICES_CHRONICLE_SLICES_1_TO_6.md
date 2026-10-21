# Vertical Slices Chronicle: Slices 1 Through 6

> **Project:** Stevens Marketplace  
> **Architecture:** Decoupled MERN Stack (Express Backend + Vite React Frontend + MongoDB Atlas)  
> **Development Strategy:** Strict Vertical Slices (Database -> Data Layer -> API Route -> React UI -> End-to-End Test)

---

## 1. Slice 1: Foundation & The React Bridge

### Objective
Establish the foundational infrastructure for both the backend and frontend, connect to cloud-hosted MongoDB Atlas, configure Cross-Origin Resource Sharing (CORS), and confirm the two decoupled systems communicate flawlessly over HTTP.

### Technical Implementation

#### A. Monorepo Directory Organization
Rather than keeping frontend and backend in separate repositories, we established a clean monorepo architecture:
```
stevens-marketplace/
├── package.json          # Root scripts (starts server)
├── .env                  # Secrets & Database connection string
├── server/               # Express Backend (Port 3000)
│   ├── app.js            # Express app configuration & middleware
│   ├── config/           # MongoDB Atlas connection pool
│   ├── data/             # Business logic & Database queries
│   ├── routes/           # Modular Express routers
│   └── tasks/            # Database seed scripts
└── client/               # React Frontend via Vite (Port 5173)
    ├── package.json      # Client dependencies
    ├── vite.config.js    # Vite configuration
    └── src/              # React source code (components, pages, hooks)
```

#### B. The CORS Problem & Solution
Because the frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:3000`, the browser's **Same-Origin Policy (SOP)** blocks requests by default. In `server/app.js`, we installed and configured the `cors` middleware:
```javascript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173', // Allows Vite dev server
  credentials: true                // CRITICAL: Allows session cookies to pass across origins
}));
```

#### C. Verification Milestone
Ran a health check endpoint `GET /api/health` that verified MongoDB connection state. The React frontend fetched this endpoint and rendered a visual confirmation banner.

---

## 2. Slice 2: Authentication & Session Management (Translating CS 546 Lab 10)

### Objective
Provide secure registration and login functionality for Stevens community members, supporting two distinct user roles: `STUDENT` and `MENTOR`.

### CS 546 Lab 10 Translation
In Lab 10, authentication used `express-session` and `bcrypt`, but submitted forms rendered full-page Handlebars templates (`res.render('login', { error })`). In the MERN stack:
- Forms submit asynchronously via `fetch('/api/auth/login', { method: 'POST' })`.
- The server responds with `{ user: { _id, email, firstName, lastName, role } }` as JSON.
- The session cookie (`connect.sid`) is automatically stored in browser cookie storage.

### Data Layer: `server/data/users.js`
1. **Password Hashing:** Implemented with `bcryptjs` using **16 salt rounds** to exceed industry standards and match Stevens CS security requirements.
2. **Stevens Email Validation:** Strictly enforces valid email structure and Stevens identity.
3. **User Document Schema:**
```javascript
{
  _id: ObjectId("..."),
  firstName: "Jane",
  lastName: "Doe",
  email: "jdoe@stevens.edu",
  hashedPassword: "$2a$16$...",
  role: "STUDENT", // or "MENTOR"
  skills: [],
  interests: [],
  bio: "",
  degree: "",
  gradYear: "",
  githubLink: "",
  title: "",
  department: "",
  createdAt: ISODate("...")
}
```

### The `credentials: 'include'` Rule
When fetching authenticated endpoints in a decoupled setup, the browser will NOT send session cookies by default across different ports unless explicitly told to do so:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // MANDATORY: Sends connect.sid session cookie
  body: JSON.stringify({ email, password })
});
```

### Global Auth Context (`client/src/context/AuthContext.jsx`)
Created a React Context provider that wraps `<App />`. On page load, it queries `GET /api/auth/me`. If a valid session cookie exists, the user is immediately restored without re-logging in.

---

## 3. Slice 3: User Profiles & Extensible Schemas for AI

### Objective
Allow logged-in users to update their profile information. Crucially, we introduced **Skills** and **Interests** arrays from day one so the database would be ready for future semantic AI matching without structural migrations.

### Architectural Rationale
In traditional relational databases (SQL), tags require junction tables (`User_Skills`, `User_Interests`). In MongoDB, storing skills as an array of lowercase strings (`['python', 'react', 'machine-learning']`) allows:
- $O(1)$ fast document retrieval.
- Simple tag intersection matching.
- Future vectorization (converting the array into embeddings).

### Implementation
- **Backend Route:** `PUT /api/auth/profile`
  - Validates session to ensure a student can only edit their own profile.
  - Trims, sanitizes, and normalizes skills and interests into clean arrays.
- **Frontend UI:** `ProfilePage.jsx`
  - Tag input interface where users type a skill and hit Enter or comma to create dynamic chips.

---

## 4. Slice 4: Project Creation (Mentor Role Enforcement)

### Objective
Allow Mentors to create collaboration projects, establishing titles, detailed project descriptions, domains, and lists of required skills needed for their research or startup teams.

### Security & Role Authorization Middleware
Created an Express route guard in `server/routes/projects.js`:
```javascript
function requireMentor(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }
  if (req.session.user.role !== 'MENTOR') {
    return res.status(403).json({ error: 'Access forbidden: Only mentors can create projects.' });
  }
  next();
}
```

### Project Document Schema:
```javascript
{
  _id: ObjectId("..."),
  title: "AI-Driven Healthcare Diagnoser",
  description: "Building an automated image recognition tool for medical scans...",
  domain: "Artificial Intelligence",
  requiredSkills: ["python", "pytorch", "computer-vision"],
  mentorId: ObjectId("..."),
  mentorName: "Prof. Carlo Lippizzi",
  mentorEmail: "clippizzi@stevens.edu",
  createdAt: ISODate("..."),
  status: "OPEN" // "OPEN" | "IN_PROGRESS" | "COMPLETED"
}
```

### Frontend UI (`CreateProjectPage.jsx`)
A clean, card-based form with real-time tag generation for required skills and validation that rejects empty titles or descriptions.

---

## 5. Slice 5: Dynamic Project Browsing (The Explore Page)

### Objective
Allow students to discover all active projects across Stevens, filter by domain, and perform instant keyword/skill searches with zero page refreshes.

### Why React Excels Over Handlebars Here
In CS 546 Lab 9, building a search filter required listening to keyup events, firing AJAX calls, clearing innerHTML, and constructing table rows using string concatenation. In React, the entire discovery UI is declarative:
```jsx
// Real-time client-side filtering logic in ExplorePage.jsx
const filteredProjects = projects.filter(project => {
  const matchesSearch = 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesSkill = selectedSkill 
    ? project.requiredSkills.includes(selectedSkill)
    : true;

  return matchesSearch && matchesSkill;
});
```

### Dynamic Tag Cloud
The Explore page extracts all unique skills across all available projects and displays clickable filter chips (e.g., `[Python]`, `[React]`, `[Data Analysis]`). Clicking a chip instantly filters the project cards on screen.

---

## 6. Slice 6: Project Detail & Deep-Dive View

### Objective
Allow users to click on any project card in the Explore page and view a comprehensive detail view (`/projects/:id`), including complete project descriptions, required skill badges, and mentor contact cards.

### React Router Dynamic Parameters
Configured in `client/src/App.jsx`:
```jsx
<Route path="/projects/:id" element={<ProjectDetailPage />} />
```
In `ProjectDetailPage.jsx`, the hook `useParams()` extracts the MongoDB ObjectId from the URL, triggers `useEffect`, and queries `GET /api/projects/:id`.

### Role-Aware UI Presentation
The Project Detail page adapts depending on who is viewing it:
- If a **Mentor** who owns the project views it: They see administrative badges and an invitation to check their Mentor Dashboard.
- If a **Student** views it: They see an interactive "Apply to Join" button.
- If a **Guest** attempts to access it: They are stopped by our protected route layer and redirected to login.
