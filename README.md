# MentorHub AI: AI-Powered College Project Lifecycle Management System

An intelligent, full-stack, production-style academic SaaS platform designed for higher education institutions to manage the complete academic capstone and thesis project lifecycle. MentorHub AI connects students, faculty mentors, and institutional administrators in a centralized, role-governed workspace.

---

## 1. Product Architecture & Overview

MentorHub AI solves the problem of academic projects fragmented across WhatsApp chats, email attachments, unindexed cloud folders, and manual spreadsheets by unifying:
- **Student Cohort & Team Management:** Group formation, peer invitations, and shared project spaces.
- **Project Proposal Lifecycle:** Drafts, versioning, structured revision requests, and committee sign-offs.
- **Smart Faculty Discovery:** Searchable directory with department filtering, research tags, and workload capacity.
- **Mentorship Request Engine:** Request validation, conflict checks, and approval/rejection workflows.
- **Milestone & Sprint Management:** List and Kanban board views with task priorities, deadlines, and evidence submission.
- **Document Management & Version Control:** Categorized deliverables (proposals, reports, code archives) with automatic version increments and secure downloads.
- **Sync Meetings:** Request, confirm, and record outcome summaries with Google Meet integration.
- **Configurable Rubric Evaluations:** 7-criteria grading rubrics (max 100 points) and final grade publishing.
- **AI-Powered Project Assistance:** Powered by Google's Gemini 1.5 API with resilient intelligent fallback modes.
- **Administrative Governance:** User management, departments, academic sessions, domain categories, faculty workload tracking, CSV report exports, and immutable audit logs.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS with modern academic SaaS aesthetic
- **Routing:** React Router DOM (v7) with role-based and public route guards
- **HTTP Client:** Axios with request token interceptors and 401 handling
- **State Management:** React Context API (`AuthContext`)
- **Icons:** Lucide React
- **Analytics Charts:** Recharts (Bar & Pie visualizations)
- **Notifications:** Sonner rich toast notifications
- **Typography:** Plus Jakarta Sans, Inter, IBM Plex Mono

### Backend
- **Runtime:** Node.js (v20+) & Express.js (ES Modules)
- **Database:** MongoDB with Mongoose ODM
- **Zero-Config Database Fallback:** Automatic `mongodb-memory-server` fallback for zero-configuration testing out of the box
- **Authentication:** JWT (JSON Web Tokens) with 7-day persistence
- **Security:** bcryptjs password hashing, role authorization middleware, resource ownership checks, audit logging
- **Storage Abstraction:** Multer local disk storage with 25MB limits, MIME validation, and support for Cloudinary
- **AI Integration:** Google Gemini API (`@google/generative-ai`) with fallback responses

---

## 3. Pre-Seeded Demo Accounts

MentorHub AI auto-seeds realistic academic records on first startup. You can sign in using these accounts or use the **⚡ 1-Click Demo Switcher** directly in the top navbar or login page:

| Role | Account Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Student (Lead)** | Alex Rivera | `alex.student@college.edu` | `student123` |
| **Student (Member)** | Maya Lin | `maya.student@college.edu` | `student123` |
| **Student (Lead)** | Sophia Patel | `sophia.student@college.edu` | `student123` |
| **Faculty Mentor** | Dr. Marcus Vance | `dr.marcus@college.edu` | `faculty123` |
| **Faculty Mentor** | Prof. Sarah Jenkins | `prof.sarah@college.edu` | `faculty123` |
| **Faculty Mentor** | Dr. Arun Sharma | `dr.arun@college.edu` | `faculty123` |
| **Administrator** | Dr. Eleanor Vance (Dean) | `admin@college.edu` | `admin123` |

---

## 4. Quick Start & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone & Install Dependencies
From the project root:
```bash
# Install root orchestration tools
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install --legacy-peer-deps
cd ..
```

### 2. Environment Variables (Optional)
A `.env.example` file is provided in both the root and `server/` directory:
```bash
cp .env.example server/.env
```
> **Note:** If `MONGODB_URI` or `GEMINI_API_KEY` are left blank, MentorHub AI automatically spins up an in-memory MongoDB instance and activates intelligent academic AI fallbacks so that all features work immediately with zero external prerequisites.

### 3. Run the Full Application
From the root directory, run both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Running Verification Tests
Execute the automated test suite verifying health, role authorization, project lookups, and AI endpoints:
```bash
npm run test
```

---

## 5. System Workflows & Roles

### Student Portal (`/student/*`)
- **Dashboard (`/student/dashboard`):** Real-time project progress bar, upcoming deadlines, recent tasks, and quick actions.
- **My Team (`/student/team`):** Form project squads, send peer invitations by email, accept/reject invitations, and view teammate profiles.
- **Project Proposals (`/student/projects`):** Create draft proposals, submit for faculty review, track revision history, and trigger AI completeness audits.
- **Find Mentors (`/student/mentors`):** Filter faculty by department and research areas, view active project load, and submit personalized mentorship requests.
- **Tasks & Kanban (`/student/tasks`):** Toggle between Kanban board and List views, filter by priority (Low, Medium, High, Urgent), assign members, and transition statuses.
- **Milestones (`/student/milestones`):** Track semester deadlines, submit evidence documents, and review faculty sign-offs.
- **Documents (`/student/documents`):** Upload deliverables (proposals, reports, presentations, code archives) with version tracking and secure downloads.
- **Sync Meetings (`/student/meetings`):** Schedule sync check-ins with assigned mentors and join Google Meet calls.
- **AI Assistant (`/student/ai-assistant`):** Interactive chat for brainstorming capstone ideas, refining abstracts, tech stack choices, and viva defense prep.

### Faculty Portal (`/faculty/*`)
- **Dashboard (`/faculty/dashboard`):** Active mentorship count, incoming proposals, upcoming student meetings, and pending evaluations.
- **Mentor Requests (`/faculty/requests`):** Inspect student proposals, approve mentorships, request changes with detailed notes, or decline requests.
- **Assigned Projects (`/faculty/projects`):** Review milestone deliverables, inspect submitted evidence, and approve checkpoints.
- **Document Review (`/faculty/documents`):** Inspect submitted student files, annotate review notes, and request revisions.
- **Sync Meetings (`/faculty/meetings`):** Confirm meetings and record official discussion outcomes.
- **Evaluations (`/faculty/evaluations`):** 7-criteria rubrics (max 100 points) with real-time score computation, draft saving, and final grade publishing.
- **AI Advisory Suite (`/faculty/ai-assistant`):** Formulate 8 challenging viva voce questions, summarize 40-page reports, and draft constructive feedback.

### Admin Portal (`/admin/*`)
- **Dashboard (`/admin/dashboard`):** Institutional metrics and Recharts visualizations (Projects by Domain, Cohorts by Department).
- **User Management (`/admin/users`):** Search users, filter by role/department, provision accounts, and activate/deactivate accounts with self-lockout prevention.
- **Departments (`/admin/departments`):** Manage institutional engineering divisions and codes.
- **Academic Sessions (`/admin/sessions`):** Configure semester dates, proposal intake deadlines, and review periods.
- **Project Domains (`/admin/domains`):** Maintain database-driven project domain categories.
- **Project Master Registry (`/admin/projects`):** Search all institutional projects and export real CSV reports (`/api/admin/export-csv`).
- **Faculty Workload (`/admin/workload`):** Balance mentorship load across faculty members.
- **Audit Logs (`/admin/audit-logs`):** Chronological compliance logs tracking logins, status changes, and approvals.

---

## 6. AI Capabilities & Safety

MentorHub AI integrates Google's Gemini API via dedicated backend services:
- **Server-Side Key Isolation:** The API key is stored strictly on the server and is never exposed to the frontend.
- **Input Validation & Sanitization:** Limits payload sizes and validates inputs before invoking model endpoints.
- **Academic Advisory Principle:** AI outputs are suggestions. Final grading, milestone approvals, and consequential academic decisions remain under the authority of faculty mentors and committees.
- **Resilient Fallback Mode:** In environments without an external API key or during network rate-limiting, the backend returns structured, domain-accurate academic fallbacks so the user experience is uninterrupted.

---

## 7. Security Best Practices Implemented

- **Password Hashing:** Implemented with `bcryptjs` using 10 salt rounds.
- **JWT Authentication:** Cryptographically signed tokens with role and user claims.
- **Role-Based Authorization:** Backend route middleware (`authorizeRoles('student', 'faculty', 'admin')`) prevents unauthorized access regardless of client state.
- **Resource Ownership Checks:** Students cannot access or edit other teams' private projects by guessing URL parameters.
- **File Upload Safeguards:** Strict MIME type checking, extension validation, 25MB file size limits, and randomized collision-resistant storage filenames.
- **Admin Lockout Safeguard:** Prevents accidental deactivation of the last active administrator.
- **Zero Information Leaks:** Passwords and stack traces are omitted from API responses.

---

## 8. License

This project is licensed under the MIT License.
