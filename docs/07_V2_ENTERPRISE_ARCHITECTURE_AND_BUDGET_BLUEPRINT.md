# Stevens Marketplace v2.0: Enterprise Architecture, AI Vetting Engine, & Budget Blueprint

> **Document Type:** System Architecture Specification, Product Roadmap & Financial Planning Dossier  
> **Prepared For:** Professor Carlo Lippizzi, School of Systems and Enterprises / Stevens Institute of Technology  
> **Prepared By:** Lead Full-Stack Engineering Team (`jyoad3003`)  
> **System Objective:** Elevating the Stevens Marketplace from a peer prototype into an enterprise-grade, multi-sided marketplace connecting External/Internal Organizations, Faculty Mentors, and Vetted Student Talent.

---

## 1. Executive Summary & The Paradigm Shift

Following the demonstration of the Stevens Marketplace prototype, Professor Carlo Lippizzi outlined a visionary evolution. The platform must transition from a simple internal matching board into a **3-Tier Enterprise Collaboration Ecosystem**:

```
+-----------------------------------------------------------------------------------+
|                        THE 3-TIER ENTERPRISE COLLABORATION ECOSYSTEM              |
|                                                                                   |
|  [TIER 1: THE SPONSORS]                                                           |
|  External Organizations (Corporations, Startups, MNCs) & Internal Stevens Depts  |
|         |                                                                         |
|         | Publishes Project RFPs with Funding Buffet & Project Scopes             |
|         v                                                                         |
|  [TIER 2: THE PRINCIPAL INVESTIGATORS (MENTORS)]                                  |
|  Stevens Faculty, Lab Directors, & Accredited Senior Mentors                      |
|         |                                                                         |
|         | Matches with Sponsor, Claims Project Leadership, Establishes Milestones |
|         v                                                                         |
|  [THE AI VETTING & CREDENTIAL GATEWAY]                                            |
|  Multi-Plugin Credentials + Real-Time AI Technical/Behavioral Interviewer         |
|         |                                                                         |
|         | Generates Evidence-Based Candidate Dossier (Competency & Authenticity)  |
|         v                                                                         |
|  [TIER 3: THE STUDENT TALENT]                                                     |
|  Stevens Undergraduate & Graduate Students Assembled into High-Performance Teams  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Entity Architecture & The Multi-Sided Data Model

To support this new paradigm, MongoDB schemas must introduce `organizations` as a primary actor, elevate `projects` with sponsorship metadata, and introduce `interviews` and `credentials`.

### A. The Organization Entity (`organizations` collection)
```javascript
{
  _id: ObjectId("..."),
  name: "Pfizer Digital Health Innovation Lab",
  orgType: "EXTERNAL_ENTERPRISE", // "EXTERNAL_ENTERPRISE" | "EXTERNAL_STARTUP" | "STEVENS_INTERNAL_DEPT"
  industry: "Biomedical & Healthcare Technology",
  contactPerson: {
    name: "Dr. Marcus Vance",
    title: "Head of AI Research Partnerships",
    email: "marcus.vance@pfizer.com",
    verifiedDomain: "pfizer.com"
  },
  departmentOrUnit: "Clinical Machine Learning Division",
  description: "Accelerating patient clinical trial matching through multimodal vision-language models.",
  website: "https://pfizer.com/innovation",
  logoUrl: "https://storage.../pfizer-logo.png",
  billingAccountStatus: "ACTIVE", // Verified funding source
  createdAt: ISODate("...")
}
```

---

### B. The Project Sponsorship Model & "Buffet of Funding" Taxonomy

Projects published by organizations require structured scoping and a granular funding taxonomy so mentors and students understand compensation and deliverables immediately.

#### The Funding Taxonomy ("The Buffet"):
1. **Industry R&D Contract / Corporate Sponsorship:** Dedicated budget for deliverables; includes student hourly compensation or fellowships + mentor institutional overhead.
2. **Federal / Institutional Grant Sub-Award:** NSF, NIH, DoD, or DARPA sub-contract with strict academic compliance and publication mandates.
3. **Internal Stevens Fellowship / Departmental Endowment:** Provost or school-sponsored funding (e.g., SSE research fellowship).
4. **Startup Venture Equity / Milestone Bounty:** Early-stage venture capital or accelerator funding with equity or bounty payouts.
5. **Paid Student Stipend / Hourly Research Assistantship (RA):** Hourly on-campus or sponsor-backed pay (e.g., $25–$40/hr).
6. **Academic Credit / Capstone / Master's Thesis:** Zero cash funding; compensated via official Stevens 3-credit course registration (CS 800 / SYS 800).
7. **Open Source & Voluntary Collaboration:** Pro-bono, community-driven, portfolio-building projects.

#### Enhanced Project Document Schema (`projects` collection):
```javascript
{
  _id: ObjectId("..."),
  title: "Multimodal Oncology Diagnostic Assistant",
  organizationId: ObjectId("..."),
  organizationName: "Pfizer Digital Health Innovation Lab",
  orgType: "EXTERNAL_ENTERPRISE",
  
  // The Funding Buffet Specification
  fundingDetails: {
    isFunded: true,
    category: "INDUSTRY_CORPORATE_SPONSORSHIP",
    totalGrantBudgetUSD: 45000,
    studentCompensationType: "HOURLY_STIPEND",
    studentPayRate: "$32.00 / hour",
    estimatedHoursPerWeek: 15,
    equipmentProvided: "NVIDIA H100 Cloud Compute Access provided by sponsor"
  },

  // Project Scoping & Deliverables
  scopingQuestionnaire: {
    projectMaturity: "RESEARCH_TO_PROTOTYPE", // "CONCEPT" | "RESEARCH_TO_PROTOTYPE" | "PRODUCTION_SCALING"
    durationWeeks: 16,
    requiredCommitment: "15-20 hrs/week",
    intellectualPropertyTerms: "SPONSOR_EXCLUSIVE_WITH_ACADEMIC_PUBLICATION_RIGHTS",
    deliverables: [
      "Benchmarked fine-tuned Vision-Language Model on MIMIC-IV dataset",
      "Interactive Streamlit / React clinical evaluation demo",
      "Final technical whitepaper for peer review submission"
    ]
  },

  requiredSkills: ["PyTorch", "HuggingFace", "Computer Vision", "Docker", "FastAPI"],
  preferredCoursework: ["CS 584 (Natural Language Processing)", "CS 559 (Machine Learning)"],
  
  // Two-Stage Lifecycle State
  lifecycleStatus: "MENTOR_MATCHING", // "DRAFT" | "MENTOR_MATCHING" | "STUDENT_RECRUITMENT" | "ACTIVE" | "COMPLETED"
  assignedMentorId: ObjectId("..."),  // Assigned once Prof. Lippizzi or another mentor claims leadership
  assignedMentorName: "Prof. Carlo Lippizzi",
  createdAt: ISODate("...")
}
```

---

## 3. The Multi-Plugin Student Credential Engine

The current prototype profile is too basic. To give mentors a full mental model of a student's real capabilities, we establish a **Pluggable Footprint of Evidence**:

```
+---------------------------------------------------------------------------------+
|                       STUDENT CREDENTIAL PLUGINS                                |
|                                                                                 |
|  [1. Resume Parsing Plugin] =====> PDF Upload -> OCR & Gemini LLM Extraction    |
|                                    (Structured: Education, Experience, Awards)  |
|                                                                                 |
|  [2. GitHub Verification Plugin] => Octokit API Sync (Repos, Commits, PRs, Langs)|
|                                                                                 |
|  [3. Coursework & Transcripts] ===> Verified Stevens Courses (CS 546, CS 584)  |
|                                                                                 |
|  [4. External Portfolio Badges] => Kaggle Grandmaster, AWS/GCP Certifications   |
+---------------------------------------------------------------------------------+
```

### Data Representation in `users` collection:
```javascript
{
  _id: ObjectId("..."),
  role: "STUDENT",
  firstName: "Jane",
  lastName: "Doe",
  email: "jdoe@stevens.edu",
  degree: "M.S. in Computer Science",
  gradYear: 2025,
  gpa: 3.92,
  
  // Pluggable Footprints
  credentials: {
    resumeUrl: "https://r2.stevens-marketplace.org/resumes/jdoe-resume.pdf",
    resumeParsedData: {
      workExperience: [
        { company: "Amazon", role: "SDE Intern", duration: "Summer 2024", highlights: ["Built low-latency DynamoDB cache"] }
      ],
      publications: ["Co-author: Workshop on Efficient LLM Inference (ICML 2024)"]
    },
    githubSync: {
      username: "janedoe-cs",
      publicRepos: 24,
      totalStars: 142,
      topLanguages: ["Python (62%)", "TypeScript (28%)", "C++ (10%)"],
      verifiedCommitCountLastYear: 840
    },
    verifiedCoursework: [
      { code: "CS 546", name: "Web Programming", grade: "A", instructor: "Prof. Hill" },
      { code: "CS 584", name: "Natural Language Processing", grade: "A", instructor: "Prof. Subbalakshmi" }
    ],
    externalBadges: [
      { provider: "AWS Certified", title: "Solutions Architect Associate", verifiedDate: "2024-05" },
      { provider: "Kaggle", title: "Competition Expert", rank: "Top 3%" }
    ]
  }
}
```

---

## 4. The Real-Time AI Interviewer & Candidate Vetting Protocol

Even with verifiable credentials, professors and mentors do not have time to interview 40 applicants manually. However, static matching percentages ($65\%$, $80\%$) lack credibility. 

We introduce an **Automated AI Technical & Behavioral Vetting Gateway**:

### How the AI Interview Protocol Works:
1. **Trigger:** A student clicks "Apply to Join" on a project.
2. **Context Synthesis:** The AI engine ingests:
   - The specific Project Scoping & Required Skills.
   - The Student's uploaded Resume, GitHub history, and Coursework.
3. **Dynamic Interview Generation:** The AI creates an interactive, 4-stage technical and situational assessment tailored specifically to test the intersection of the student's claimed background against the project's actual challenges:
   - *Stage 1 (Authenticity Verification):* "I see on your GitHub you built a distributed caching project. What was the exact concurrency challenge you encountered with locking?"
   - *Stage 2 (Domain Deep-Dive):* "This Pfizer project requires handling unbalanced medical imagery in PyTorch. How would you design your loss function to prevent model collapse?"
   - *Stage 3 (Commitment & Team Fit):* "This project requires 15 hours a week with bi-weekly Pfizer syncs. What does your current course load look like, and how do you prioritize conflicting deadlines?"
4. **Interactive Modal:** Can be completed via structured audio/video voice interaction (using WebRTC + Whisper/Gemini Live) or rich interactive text chat.
5. **Evaluation Matrix:** The AI analyzes responses for depth, clarity, and truthfulness, outputting an **Executive Candidate Dossier** directly to the Mentor Dashboard.

### Candidate Vetting Dossier Schema (`interviews` collection):
```javascript
{
  _id: ObjectId("..."),
  projectId: ObjectId("..."),
  studentId: ObjectId("..."),
  mentorId: ObjectId("..."),
  interviewCompletedAt: ISODate("..."),
  
  evaluationScores: {
    overallCompetencyScore: 88, // 1-100
    technicalDepthScore: 92,
    codeAuthenticityConfidence: 95,
    communicationClarityScore: 84,
    availabilityFeasibilityScore: 80
  },

  aiVettingSummary: "Jane demonstrated exceptional familiarity with PyTorch loss formulation, immediately identifying focal loss as the ideal candidate for unbalanced classes. Her explanation of her past Amazon internship demonstrates authentic system design experience. Recommended for primary Machine Learning lead.",
  
  redFlagsOrRisks: [
    "Taking 12 graduate credits this semester; mentor should verify 15 hr/week availability during finals week."
  ],
  
  fullTranscript: [
    { speaker: "AI_INTERVIEWER", text: "..." },
    { speaker: "STUDENT", text: "..." }
  ]
}
```

---

## 5. Comprehensive Infrastructure Billing & Monthly Cost Estimation

Professor Carlo Lippizzi has committed to funding the real-world deployment of this system. However, **wasteful over-provisioning is unacceptable**. 

Below is an engineered, cost-optimized multi-phase infrastructure budget plan designed to maximize every dollar.

### A. The 3-Phase Deployment Scale Model

```
+---------------------------------------------------------------------------------------+
| PHASE 1: PILOT LAUNCH               PHASE 2: SSE DEPT ROLLOUT    PHASE 3: ENTERPRISE  |
| (Current -> Next 3 Mo.)             (3 -> 6 Months)              (6 -> 12 Months)     |
| 1-3 Orgs, 5 Mentors, 100 Students   10 Orgs, 30 Mentors, 1K Std  50+ Orgs, Campus-wide|
| Estimated: $32.00 - $68.00 / month  Estimated: $145 - $220 / mo  Estimated: $450 - $750|
+---------------------------------------------------------------------------------------+
```

---

### B. Detailed Monthly Cost Breakdown Table (Phase 1 & Phase 2)

| Layer | Service / Provider | Purpose | Phase 1 (Pilot) | Phase 2 (Rollout) | Optimization Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Compute** | **Render / Railway** | Node.js Express REST API | **$7.00 / mo** (Starter Instance, 512MB RAM, 24/7 uptime, 0 cold starts) | **$25.00 / mo** (Pro 2GB RAM, auto-scaling) | Eliminates free-tier sleep delays while avoiding $100+ AWS ECS overhead. |
| **Frontend CDN** | **Vercel** | React Vite Single Page App | **$0.00 / mo** (Hobby) or **$20.00 / mo** (Pro) | **$20.00 / mo** (Team Seat, 1TB bandwidth) | Global edge caching, instant preview branches for team PRs. |
| **Database** | **MongoDB Atlas** | Document Store & Vector Search | **$9.00 / mo** (M2 Tier: 2GB storage, dedicated RAM) | **$57.00 / mo** (M10 Dedicated: Automated daily backups, Vector search indexes) | Upgrading from M0 free tier unlocks native Vector Search indexes without standalone Pinecone costs. |
| **Blob / Resume Storage** | **Cloudflare R2** | PDF Resumes, Portfolios, Org Logos | **$0.00 / mo** (10GB free tier, $0.00 egress fees) | **$3.00 / mo** (50GB storage, $0.00 egress) | **Zero Egress Fees:** AWS S3 charges exorbitant bandwidth fees for downloads; Cloudflare R2 is 100% free for outbound downloads. |
| **AI LLM & Interview API** | **Google Gemini 2.0 Flash / 1.5 Flash** | AI Candidate Interviews, Resume Parsing, Embeddings | **$12.00 / mo** (~100 interviews/mo @ ~$0.12/interview) | **$45.00 / mo** (~500 interviews/mo) | Gemini 2.0 Flash costs only **$0.075 / MTok input**, making each 10-turn AI interview cost pennies compared to $1.50+ on GPT-4o. |
| **Domain & Security** | **Cloudflare + Namecheap** | `stevensmarketplace.com` + SSL + WAF DDoS Protection | **$2.50 / mo** ($14/year domain + free Cloudflare SSL/WAF) | **$5.00 / mo** | Enterprise-grade TLS encryption and bot protection at zero operational markup. |
| **Transactional Email** | **Resend / SendGrid** | Stevens email notifications for applications & acceptances | **$0.00 / mo** (Free tier: 3,000 emails/month) | **$20.00 / mo** (Paid tier: 50,000 emails/month) | Free tier easily supports up to 100 students and mentors daily. |
| **TOTAL ESTIMATED MONTHLY COST** | — | — | **$30.50 – $68.50 / month** | **$170.00 – $220.00 / month** | **Maximum ROI:** Delivers full enterprise capability at a fraction of typical startup cloud bills. |

---

## 6. Team Agentic AI Coding Subscriptions: Analysis & Recommendation

Your team needs high-velocity coding tools to implement this architecture quickly. You mentioned wanting to purchase **Claude subscriptions / Claude Code** for your developers.

### Comparative Analysis: Claude Pro vs. Anthropic API vs. Alternatives

| Tool / Model | Cost per Developer | How Claude Code Works With It | Risk / Bottleneck | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Claude Pro (Subscription)** | **$20.00 / month** (Flat Rate) | Authenticates via `claude login`. Draws from your normal Claude.ai usage pool. | **Session Rolling Caps:** Heavy terminal coding that crawls entire repos can exhaust the 5-hour quota quickly. | ⭐ **RECOMMENDED PRIMARY** (Provides predictable, fixed monthly cost for student devs). |
| **Anthropic API (Pay-As-You-Go)** | **Variable** ($40–$120/mo depending on hours coded) | Authenticates via `ANTHROPIC_API_KEY`. Unthrottled, pure token billing ($3/MTok in, $15/MTok out for 3.5 Sonnet). | **Budget Spikes:** If a student accidentally triggers an infinite file inspection loop, it can burn $20 in an afternoon. | ⭐ **RECOMMENDED BACKUP** (Equip team with a hard **$25.00/mo spending cap** as an emergency buffer). |
| **Claude Team Plan** | **$25.00–$30.00 / seat / mo** (Min. 5 seats) | Centralized billing, shared team projects, higher administrative visibility. | Requires minimum seat commitments. | Best once team grows to 5+ full-time student contributors. |
| **Gemini / Cursor Alternative** | **$20.00 / month** (Cursor Pro) or Free (Antigravity IDE) | Antigravity IDE (Gemini 3.8 Flash High) is **$0.00** right now on your machine. | Different UI from Claude Code CLI. | Utilize Antigravity for large file reviews; use Claude Code for terminal tasks. |

### The Winning Developer Tooling Strategy:
1. **Fund 1 to 2 Claude Pro Subscriptions ($20/mo each)** for the primary student developers. They can connect Claude Code terminal directly to their Pro account for unlimited daily problem solving with zero unexpected API charges.
2. **Create one Anthropic Console API account with a strict $30/month Hard Spending Limit**. If a developer hits a 5-hour cool-down on Pro during an urgent sprint, they temporarily toggle to the API key to finish their commit.
3. **Monthly Developer AI Budget:** **$40.00 – $70.00 / month total** for the entire dev team.

---

## 7. Master Implementation Roadmap for Professor Lippizzi

### Phase 1: Organizational Sponsorship & Funding Buffet (Weeks 1 – 3)
- [ ] Build the `organizations` database collection and registration portal.
- [ ] Create the **"Buffet of Funding"** multi-select and project scoping questionnaire on `CreateProjectPage.jsx`.
- [ ] Implement Tier 1 Organization $\rightarrow$ Mentor matchmaking (Mentors review incoming sponsored RFPs and claim PI leadership).

### Phase 2: Multi-Plugin Student Credential Engine (Weeks 4 – 6)
- [ ] Implement Cloudflare R2 integration for secure PDF resume uploads.
- [ ] Build resume parsing worker using Gemini LLM structured outputs.
- [ ] Connect GitHub API integration (displaying verified repositories, commit consistency, and top languages).

### Phase 3: The Real-Time AI Vetting & Interviewer Gateway (Weeks 7 – 9)
- [ ] Develop the dynamic AI interview question generation engine based on project skills and candidate resume data.
- [ ] Build the interactive applicant interview modal on `ProjectDetailPage.jsx`.
- [ ] Implement the automated Candidate Evaluation Dossier and integrate it into `MentorDashboard.jsx`.

### Phase 4: Production Pilot & Department Launch (Weeks 10 – 12)
- [ ] Upgrade Render to Starter instance ($7/mo) and MongoDB Atlas to M2/M10 ($9–$57/mo).
- [ ] Configure `stevensmarketplace.com` custom domain on Cloudflare with SSL.
- [ ] Present the finalized live platform to Professor Carlo Lippizzi, Stevens School of Systems and Enterprises chairs, and initial corporate partner representatives.
