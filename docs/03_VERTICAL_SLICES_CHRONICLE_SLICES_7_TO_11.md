# Vertical Slices Chronicle: Slices 7 Through 11 & Advanced Architecture

> **Project:** Stevens Marketplace  
> **Key Milestones:** Relational NoSQL Design, Team Management, Mock AI Matching Engine, The Walled Garden Strategy, and 3-State Personalized Hub

---

## 1. Slice 7: Connection & Join Workflow (Relational Thinking in NoSQL)

### The Architectural Dilemma: Embedding vs. Referencing
In CS 546 Lab 6, students learned about subdocuments in MongoDB. When designing the "Join Project" feature, an amateur approach is to embed an `applicants` array directly inside the Project document:
```javascript
// ❌ AMATEUR APPROACH (Anti-pattern for large apps)
{
  title: "AI Project",
  applicants: [
    { studentId: "123", status: "pending", note: "..." }
  ]
}
```
**Why this fails in production:**
1. **Unbounded Document Growth:** MongoDB documents have a strict 16MB limit. If hundreds of students apply, or multiple projects exist, embedded arrays cause document bloat and performance degradation.
2. **Concurrency & Race Conditions:** If two students click "Apply" at the same exact millisecond, concurrent writes to the same project document can overwrite each other.
3. **Complex Querying:** Querying "All applications submitted by Student X" requires complex unwind pipelines across all projects.

### The Production Solution: Dedicated `connections` Collection
We implemented a normalized, relational join collection in `server/data/connections.js`:
```javascript
{
  _id: ObjectId("..."),
  projectId: ObjectId("..."),
  projectTitle: "AI Healthcare Diagnoser",
  studentId: ObjectId("..."),
  studentName: "John Doe",
  studentEmail: "jdoe@stevens.edu",
  mentorId: ObjectId("..."),
  status: "PENDING", // "PENDING" | "ACCEPTED" | "REJECTED"
  applicationNote: "I have 2 years of PyTorch experience from CS 584.",
  appliedAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Duplicate Prevention & Compound Indexing
In `server/data/connections.js`, we prevent duplicate spam by checking existing records before insertion:
```javascript
const existing = await connectionsCol.findOne({
  projectId: new ObjectId(projectId),
  studentId: new ObjectId(studentId)
});
if (existing) {
  throw new Error('You have already applied to this project.');
}
```

### The Dynamic Status Button
On the frontend (`ProjectDetailPage.jsx`), the application button intelligently reflects the student's live status:
- If unapplied: Primary gradient button: `"Apply to Join"`.
- If `PENDING`: Disabled grey pill: `"⏳ Pending Application"`.
- If `ACCEPTED`: Disabled green pill: `"✓ Accepted"`.
- If `REJECTED`: Disabled red pill: `"❌ Not Accepted"`.

---

## 2. Slice 8: Dynamic Team Representation

### Objective
Once a Mentor accepts a student's application, that student is officially part of the project team. The Project Detail page must dynamically display the accepted roster without manual database edits.

### Technical Implementation
1. **Backend Aggregation Route:** `GET /api/connections/project/:projectId/team`
   - Queries `connections` where `projectId == :projectId` and `status == "ACCEPTED"`.
   - Populates student profiles with their primary skills.
2. **Frontend Component:** The "Project Team" section on `ProjectDetailPage.jsx`:
   - Renders cards for all accepted team members.
   - Shows their name, Stevens email, and skill badges so students can see their prospective collaborators.

---

## 3. Slice 9: The Mentor Dashboard (The Real-World MVP Debate)

### The Debate: Why Wasn't This in the Initial 9 Slices?
When we first planned the project, the original implementation plan omitted an interactive Mentor review dashboard. The user noticed this and astutely asked: *"Why did you say building a Mentor Dashboard is a huge extra slice? Is there a technical bug?"*

**The Pedagogical Lesson (Agile Engineering & Scope Management):**
There was zero technical limitation. Rather, it was a classic demonstration of the **MVP (Minimum Viable Product)** mindset vs. **Scope Creep**:
- In early MVP planning, engineers often defer management dashboards to test basic connection plumbing first (accepting records manually via database scripts).
- However, the user identified that for a real demo to Professor Carlo Lippizzi, a Mentor must be able to click "Accept" and "Reject" live on screen.
- The user instructed: *"Make this an official Slice 9, and bump the future slices to Slice 10."* This was a senior product leadership decision.

### Technical Implementation (`MentorDashboard.jsx`)
Built a dedicated administrative workspace for Mentors:
1. **Mentor Verification:** Only users with `role === 'MENTOR'` can access `/mentor-dashboard`.
2. **Project Application Inbox:**
   - Mentors view all incoming `PENDING` applications across all projects they own.
   - Each card displays the applicant's name, degree, graduation year, application note, and GitHub portfolio link.
3. **One-Click Actions:**
   - `PUT /api/connections/:id/status` with `{ status: 'ACCEPTED' }` or `{ status: 'REJECTED' }`.
   - React immediately removes or transitions the card in state, updating counts in real time.

---

## 4. Slice 10: Mock AI Matching vs. Real Semantic Vector AI

### The Discussion: What is the Difference?
When planning the AI feature, the user asked: *"Is there really an AI matching or is it just JavaScript code? What is the difference and what do we need for Professor Lippizzi?"*

We conducted an in-depth breakdown comparing **Mock AI** vs. **Vector Semantic AI**:

| Dimension | Mock AI (Rule-Based Heuristic) | Production Semantic AI (Vector Search) |
| :--- | :--- | :--- |
| **Technology** | Pure JavaScript logic (Client/Server) | LLM Embeddings (Gemini / OpenAI) + Vector DB |
| **Matching Mechanism** | Exact keyword & tag intersection | High-dimensional geometric distance (Cosine Similarity) |
| **Synonym Understanding** | Fails: "ML" does not match "Machine Learning" | Excels: Knows "Deep Learning" is closely related to "Neural Networks" |
| **Infrastructure Cost** | $0 (Free, zero API dependencies) | API costs per token + Dedicated Vector Database cluster |
| **Setup Time** | 1 Hour | 1-2 Weeks (Embedding pipeline, index tuning) |
| **Suitability for Prototype** | **100% Ideal** (Demonstrates UX & business logic) | Next Phase Leap (Post-feedback implementation) |

### The Stevens Marketplace Mock AI Algorithm (`ExplorePage.jsx`)
We implemented a Jaccard-inspired heuristic matching algorithm:
```javascript
function calculateMatchScore(projectSkills, userSkills) {
  if (!userSkills || userSkills.length === 0 || !projectSkills || projectSkills.length === 0) {
    return 0;
  }
  const normalizedUser = userSkills.map(s => s.toLowerCase().trim());
  const normalizedProject = projectSkills.map(s => s.toLowerCase().trim());
  
  const overlappingSkills = normalizedProject.filter(skill => 
    normalizedUser.includes(skill)
  );

  // Score is percentage of required skills possessed by the student
  const matchPercentage = Math.round((overlappingSkills.length / normalizedProject.length) * 100);
  return matchPercentage;
}
```

### Visual Experience on Explore Page
- Projects are sorted dynamically so the student's highest matching project appears at the top.
- A glowing badge displays: `🎯 100% Match (Matches: React, Node.js)` or `🎯 67% Match`.
- If no skills are added to the profile, a polite prompt nudges: *"Update your profile skills to activate AI matching!"*

---

## 5. Slice 11: The "Walled Garden" & 3-State Personalized Home Hub

### Product Debate: Gated Community vs. Public Portal
The user raised an insightful product concern: Should a random visitor who is not logged in be able to see all project details and explore the university marketplace?

We analyzed two product strategies:
- **Strategy A (Public Teaser - Upwork/LinkedIn):** Lets anyone browse, but blocks interaction.
- **Strategy B (The Walled Garden - University Exclusive):** Keeps university research, capstone ideas, and student identities private behind Stevens authentication.

The user selected **The Walled Garden with a Locked Preview Teaser**.

### 1. The Walled Garden Lockdown
- Removed the `Explore` link from the top navigation bar for guests.
- Created `<ProtectedRoute>` in `App.jsx`. Any attempt by a guest to manually navigate to `/explore`, `/projects/:id`, or `/profile` automatically intercepts and redirects them to `/login`.

### 2. The Analytics Engine: MongoDB Aggregation Pipeline
To make the teaser authentic, we created an analytics function in `server/data/projects.js` (`getTrendingProjects`):
```javascript
export async function getTrendingProjects(limit = 3) {
  const connCol = await connections();
  
  // Pipeline: Group applications by projectId, count them, sort descending
  const trendingStats = await connCol.aggregate([
    { $group: { _id: '$projectId', applicationCount: { $sum: 1 } } },
    { $sort: { applicationCount: -1 } },
    { $limit: limit }
  ]).toArray();

  // Hydrate with project details
  const projectsCol = await projects();
  const trendingProjects = await Promise.all(
    trendingStats.map(async (stat) => {
      const proj = await projectsCol.findOne({ _id: stat._id });
      return { ...proj, applicationCount: stat.applicationCount };
    })
  );
  return trendingProjects.filter(Boolean);
}
```

### 3. The Locked Preview Teaser UI
On the landing page, trending projects display:
- Project Title and Required Skill Chips.
- Real-time Engagement Badge: `🔥 3 Students Applied!`.
- **The Hook:** The description is visually **blurred** using CSS `filter: blur(4px);` with a floating 🔒 lock icon overlay. Clicking it routes to registration with the message: *"Join Stevens Marketplace to unlock project details and apply!"*

### 4. Resolving the "Below the Fold" & "Identity Crisis" UX Bugs
The user identified two critical UX flaws during live testing:
1. **"Below the Fold":** The trending teaser was placed at the very bottom, requiring extensive scrolling.
   - *Fix:* Reordered the layout, placing `🔥 Trending at Stevens` directly below the primary call-to-action buttons.
2. **"The Logged-In Identity Crisis":** When a logged-in student or mentor clicked the Stevens Marketplace logo to go home (`/`), they were shown the guest "Create an Account" screen.
   - *Fix:* Implemented the **3-State Personalized Home Hub**:
     - **State 1 (Guest):** Hero CTA + Locked Trending Teaser.
     - **State 2 (Logged-in Student):** "Welcome back, [Name]!" + Quick Action cards: `🧭 Explore Matches` & `👤 Update Profile`.
     - **State 3 (Logged-in Mentor):** "Welcome back, [Name]!" + Quick Action cards: `📋 Review Applications` & `➕ Post New Project`.
