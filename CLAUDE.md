# CLAUDE.md — Stevens Marketplace Project Intelligence & Guide

Welcome to **Stevens Marketplace**, an enterprise-grade university collaboration platform connecting External/Internal Organizations, Faculty Mentors (Principal Investigators), and Vetted Student Talent.

This repository was evolved from a CS 546 (Web Programming) foundation into a decoupled, production-deployed MERN stack platform under the guidance of **Professor Carlo Lippizzi** (School of Systems and Enterprises, Stevens Institute of Technology).

---

## 🛠️ Repository Architecture & Quick Commands

This is a **monorepo** containing both the Express backend and the Vite/React frontend.

### Primary Local Commands:
```bash
# 1. Start Backend API (Express on Port 3000)
npm install
npm start                  # Executes 'node server/app.js' from the root

# 2. Start Frontend App (Vite React on Port 5173)
cd client
npm install
npm run dev                # Starts Vite development server with instant HMR

# 3. Seed Database with Realistic Demo Data (Idempotent & Memory-Safe)
node server/tasks/seed.js  # Seeds Mentors, Students, Projects, and Active Connections

# 4. Production Build (Frontend)
cd client && npm run build
```

---

## 🌐 Live Production Deployment

- **Frontend (Vercel):** [https://stevens-marketplace.vercel.app/](https://stevens-marketplace.vercel.app/)
- **Backend (Render):** [https://stevens-marketplace-backend.onrender.com/](https://stevens-marketplace-backend.onrender.com/)
- **Database (MongoDB Atlas):** Multi-region cloud cluster with global network access (`0.0.0.0/0`)
- **API Routing:** `client/vercel.json` proxies all `/api/*` requests directly to Render, bypassing browser CORS restrictions, and provides SPA client-side fallback routing (`/(.*)` $\rightarrow$ `/index.html`).

---

## 🏛️ System Core Rules & Invariants (Strictly Enforce)

When developing in this codebase, you must adhere to these established engineering decisions:

1. **Decoupled Architecture:**
   - The backend (`server/`) serves **strictly JSON**. It never renders HTML directly.
   - The frontend (`client/`) is an SPA that communicates asynchronously via `fetch`.
2. **Session Authentication & Cookies:**
   - Authentication uses `express-session` and `bcryptjs` (16 salt rounds).
   - **CRITICAL:** All frontend `fetch()` requests to authenticated endpoints must include `credentials: 'include'`. Omitting this breaks session cookies across the decoupled domains.
3. **Relational NoSQL Design:**
   - **Never** embed student applicants directly as subdocument arrays in `projects`.
   - All join requests, team memberships, and application notes live in the normalized `connections` collection (`projectId`, `studentId`, `mentorId`, `status: 'PENDING' | 'ACCEPTED' | 'REJECTED'`).
4. **Role Separation & Profile Symmetry:**
   - `STUDENT`: Profile represents a **technical resume** (Degree, Grad Year, GitHub/Portfolio, Bio, Skills, Interests).
   - `MENTOR`: Profile represents a **digital business card** (Title, Department, Lab Mission/Bio). Do NOT ask Mentors for coding skills.
   - `ORGANIZATION`: Newly introduced v2.0 entity representing corporate sponsors and Stevens internal departments.
5. **The Walled Garden & 3-State Home Hub:**
   - Guests see a locked teaser with blurred project descriptions and 🔒 lock icons.
   - Logged-in Students see their personalized workspace (Explore matches + Profile).
   - Logged-in Mentors see their administrative workspace (Review applications + Post projects).

---

## 📖 Deep-Dive Documentation Index (`docs/`)

Comprehensive pedagogical chronicles, architectural diagrams, debugging post-mortems, and future blueprints are located in `docs/`:

- [`MASTER_PROJECT_CHRONICLE.md`](./MASTER_PROJECT_CHRONICLE.md) — Master index and high-level project status.
- [`docs/01_TUTORING_CHRONICLE_CS546_TO_MERN_BRIDGE.md`](./docs/01_TUTORING_CHRONICLE_CS546_TO_MERN_BRIDGE.md) — The CS 546 Handlebars-to-React transition, the Kitchen/Dining Room analogy, and React hooks deep dive.
- [`docs/02_VERTICAL_SLICES_CHRONICLE_SLICES_1_TO_6.md`](./docs/02_VERTICAL_SLICES_CHRONICLE_SLICES_1_TO_6.md) — Slices 1–6: Auth, Profiles, Project Creation, and Real-Time Explore Filtering.
- [`docs/03_VERTICAL_SLICES_CHRONICLE_SLICES_7_TO_11.md`](./docs/03_VERTICAL_SLICES_CHRONICLE_SLICES_7_TO_11.md) — Slices 7–11: Connections collection, Mentor Dashboard, Mock AI Matching, and the Walled Garden.
- [`docs/04_PROFILE_SPLIT_AND_UI_POLISH.md`](./docs/04_PROFILE_SPLIT_AND_UI_POLISH.md) — Student/Mentor profile split, the React Context state desync fix, and glassmorphism styling.
- [`docs/05_DEVOPS_DEPLOYMENT_AND_TROUBLESHOOTING_SAGAS.md`](./docs/05_DEVOPS_DEPLOYMENT_AND_TROUBLESHOOTING_SAGAS.md) — Production deployment manual, SSL Alert 80 fix, and campus Wi-Fi DNS bypass.
- [`docs/06_FUTURE_LEAPS_AND_AGENT_HANDOFF_ROADMAP.md`](./docs/06_FUTURE_LEAPS_AND_AGENT_HANDOFF_ROADMAP.md) — Roadmap for vector embeddings (`text-embedding-004`) and persistent session stores.
- [`docs/07_V2_ENTERPRISE_ARCHITECTURE_AND_BUDGET_BLUEPRINT.md`](./docs/07_V2_ENTERPRISE_ARCHITECTURE_AND_BUDGET_BLUEPRINT.md) — **The v2.0 Blueprint:** 3-tier ecosystem, "Buffet of Funding", Multi-Plugin Credentials, Real-Time AI Interviewer, and Cost-Optimized Cloud Budget ($30.50–$68.50/mo).

---

## ⏸️ REPOSITORY STATUS: AWAITING OFFICIAL PROFESSOR CARLO & STEVE MEETING

> **CRITICAL DIRECTIVE FOR CLAUDE CODE IN THIS REPOSITORY:**  
> **DO NOT IMPLEMENT, MODIFY, OR EXECUTE ANY SPRINTS IN THIS DIRECTORY.**  
> This repository represents the pristine, live production baseline currently deployed on Render and Vercel. It must remain stable and untouched until the official university collaboration begins.

### Latest Project Update (October 2024 / Present):
**Professor Carlo Lipizzi, Ph.D.** (Director, Center for Complex Systems & Enterprises) has connected lead developer Jyotiraditya with **Naveen** (lead on the Stevens STEVE platform) with the following mandate:
> *"I'm working with Jyotiraditya and a few other former students of mine on a project to create a 'marketplace' for Stevens research projects.*
> *This would facilitate students, mentors and sponsors to start research initiatives (that could end up as papers, prototypes, funded activities, proposals, added value to education).*
> *Like most of the web services, it's a match game, maximizing the matching of the needs of the actors. The better the identification of the individual characteristics, the more successful the match would be.*
> *In this system, the student part would benefit from the data gathering portion of **Steve**: reading the resume and getting the key points, along with an interview, generating a profile for the matches.*
> *If this is compatible with the current developments for Steve, could we schedule a meeting to explore how it could be done?"*

### Action Protocol for this Repository:
1. **Stand By:** Wait for further updates from the developer after the joint meeting between Professor Carlo, Naveen, and Jyotiraditya.
2. **Funding Gate:** Official implementation sprints and integration with STEVE will be executed in this repository once university funding, enterprise subscriptions, and technical API specifications are finalized.
3. **Personal Experimentation Sandbox:** If the developer wishes to build or test v2 features independently for portfolio purposes, that work is carried out strictly in the separate cloned repository: `stevens-marketplace-personal-v2`.
