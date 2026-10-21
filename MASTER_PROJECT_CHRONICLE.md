# 🎓 STEVENS MARKETPLACE: MASTER TUTORING & ARCHITECTURE RECORD
### Comprehensive Project Chronicle, Technical Documentation, & Agent Handoff Dossier

> **Project:** Stevens Marketplace (AI-Powered University Collaboration Platform)  
> **Course / Background:** CS 546 Web Programming -> Scaled Full-Stack MERN Architecture  
> **Stakeholders:** Graduate Developer (`jyoad3003`), Professor Carlo Lippizzi, Stevens Community  
> **Repository:** [https://github.com/jyoad3003/stevens-marketplace](https://github.com/jyoad3003/stevens-marketplace)  
> **Live Web App:** [https://stevens-marketplace.vercel.app/](https://stevens-marketplace.vercel.app/)  
> **Live API Backend:** [https://stevens-marketplace-backend.onrender.com/](https://stevens-marketplace-backend.onrender.com/)

---

## 📌 Master Navigation & Documentation Index

All technical documentation, tutoring lessons, architectural rationales, and debugging sagas have been organized into deep-dive chapters inside the [`docs/`](./docs/) directory. Click any chapter below to explore:

1. [**01. Pedagogical Foundations & The CS 546 Bridge**](./docs/01_TUTORING_CHRONICLE_CS546_TO_MERN_BRIDGE.md)
   * The shift from Server-Side Handlebars (SSR) to Decoupled MERN.
   * The Restaurant Analogy: Kitchen (Express: 3000) vs. Dining Room (React: 5173).
   * Why Vite replaced `create-react-app` (Native ES Modules & Esbuild speed).
   * The React State Paradigm Shift: Declarative UI ($UI = f(State)$) vs. Imperative DOM (`document.getElementById`).
   * Core React Hooks Masterclass: `useState`, `useEffect`, `useContext` (`AuthContext`).

2. [**02. Vertical Slices Chronicle: Slices 1 Through 6**](./docs/02_VERTICAL_SLICES_CHRONICLE_SLICES_1_TO_6.md)
   * **Slice 1:** Monorepo architecture, CORS middleware, and pre-requisite bridge health check.
   * **Slice 2:** Authentication, `bcrypt` password hashing (16 salt rounds), `express-session`, and the `credentials: 'include'` cross-origin cookie rule.
   * **Slice 3:** Profiles & Extensible Schemas (Skills & Interests arrays designed for future AI).
   * **Slice 4:** Project Creation with strict Mentor role authorization middleware.
   * **Slice 5:** Dynamic Project Discovery (Explore Page with instant client-side keyword and skill badge filtering).
   * **Slice 6:** Project Detail & Deep-Dive View with role-aware UI and dynamic route parameters.

3. [**03. Vertical Slices Chronicle: Slices 7 Through 11 & Advanced Architecture**](./docs/03_VERTICAL_SLICES_CHRONICLE_SLICES_7_TO_11.md)
   * **Slice 7:** Connection & Join Workflow (Relational NoSQL architecture using a dedicated `connections` collection, duplicate prevention, dynamic application status button).
   * **Slice 8:** Dynamic Project Team representation aggregating accepted collaborators.
   * **Slice 9:** The Mentor Dashboard (The real-world MVP debate, application management UI, one-click accept/reject actions).
   * **Slice 10:** Mock AI Matching vs. Real Semantic Vector Search (Jaccard similarity algorithm, matching score badges, why Mock AI is the perfect prototype strategy).
   * **Slice 11:** The "Walled Garden" & 3-State Personalized Home Hub (Protected routes, MongoDB aggregation analytics for trending projects, locked preview teaser, and fixing the "Below the Fold" and "Identity Crisis" UX flaws).

4. [**04. Profile Split, UI Polish, & Context Debugging**](./docs/04_PROFILE_SPLIT_AND_UI_POLISH.md)
   * The Split Profile Architecture: Students as technical resumes (degree, graduation year, GitHub link, bio); Mentors as digital business cards (title, department, bio).
   * The Great Profile Context Bug: Root Cause Analysis (RCA) of the dual "Profile updated" + "Network error" message and the surgical state desync fix.
   * Dynamic Browser Tab Titles via custom hook `useDocumentTitle` (eliminating generic "client" / "Vite + React" branding).
   * Modern Glassmorphism Styling: Deep dark mode canvas, ambient glow gradients, and micro-animations.
   * Memory-Safe Database Seeding (`server/tasks/seed.js`): Idempotent seed script respecting the 512 MB Atlas free-tier quota.

5. [**05. DevOps Deployment Manual & Troubleshooting Sagas**](./docs/05_DEVOPS_DEPLOYMENT_AND_TROUBLESHOOTING_SAGAS.md)
   * Monorepo cloud deployment guide: Render (Backend) + Vercel (Frontend) + MongoDB Atlas (Database).
   * The magic of `client/vercel.json`: API proxy rewrites bypassing CORS, and SPA routing fallback for React Router.
   * The Render Root Directory gotcha (`package.json` at root).
   * **Troubleshooting Saga 1:** MongoDB Atlas `SSL alert number 80` (IP whitelist `0.0.0.0/0`).
   * **Troubleshooting Saga 2:** Stevens Guest Wi-Fi / DNS Port 27017 timeout bypass.
   * **Troubleshooting Saga 3:** Environment variable mismatch (`MONGO_URI` vs. `MONGODB_URI`).
   * **Troubleshooting Saga 4:** Render free-tier cold-start behavior and the 5-minute pre-demo warmup protocol.

6. [**06. Future Leaps Roadmap & Agent Handoff Specification**](./docs/06_FUTURE_LEAPS_AND_AGENT_HANDOFF_ROADMAP.md)
   * Strategic open questions for Professor Carlo Lippizzi (Student project creation permissions, messaging system).
   * The AI Migration Blueprint: Upgrading from Mock AI to Google Gemini `text-embedding-004` and MongoDB Atlas Vector Search (`$vectorSearch`).
   * Upcoming technical sprints: `connect-mongo` session persistence, real-time WebSockets chat, automated email notifications.
   * Complete operational guide for successor AI agents and pair programmers.

7. [**07. Stevens Marketplace v2.0: Enterprise Architecture & Budget Blueprint**](./docs/07_V2_ENTERPRISE_ARCHITECTURE_AND_BUDGET_BLUEPRINT.md)
   * **The 3-Tier Enterprise Collaboration Ecosystem:** External Organizations & Internal Stevens Depts $\rightarrow$ Faculty Mentors (PIs) $\rightarrow$ Student Talent.
   * **The "Buffet of Funding" Taxonomy:** Corporate Sponsorships, Grants, Fellowships, Bounties, Hourly Pay, and Capstone Credits.
   * **Multi-Plugin Student Credential Engine:** PDF Resumes (LLM extracted), verified GitHub repos/commits, Stevens transcripts, and external badges.
   * **Real-Time AI Interviewer & Vetting Gateway:** Automated technical & behavioral candidate interviews generating an Evidence Dossier for Mentors.
   * **Comprehensive Infrastructure Billing Report for Prof. Lippizzi:** Cost-optimized monthly budget ($30.50 – $68.50/mo for pilot; $170 – $220/mo for full rollout).
   * **Developer Tooling Strategy:** Claude Pro subscriptions vs. Anthropic API cost-risk analysis for the student dev team.

---

## 🛠️ Quick Start Reference for Developers

### Running Locally (Two Terminals):
```bash
# Terminal 1: Backend API (Express on Port 3000)
cd stevens-marketplace
npm install
npm start

# Terminal 2: Frontend App (Vite React on Port 5173)
cd stevens-marketplace/client
npm install
npm run dev
```

### Seeding Test Data:
```bash
cd stevens-marketplace
node server/tasks/seed.js
```

### Default Seed Accounts:
- **Mentor:** `clippizzi@stevens.edu` / `Password123!`
- **Student:** `jdoe@stevens.edu` / `Password123!`
