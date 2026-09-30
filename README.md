# 💼 RecruitHub — Full-Stack Recruitment Portal

A production-ready Recruitment & Applicant Tracking Portal built with **Node.js, Express.js, React (Vite), Tailwind CSS**, and a **dual-database architecture** combining **MySQL** (relational core) and **MongoDB** (flexible activity audit & notes).

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Dual-Database Architecture & Rationale](#-dual-database-architecture--rationale)
3. [Tech Stack](#-tech-stack)
4. [Folder Structure](#-folder-structure)
5. [Default Demo Credentials](#-default-demo-credentials)
6. [Prerequisites & Environment Variables](#-prerequisites--environment-variables)
7. [Installation & Setup](#-installation--setup)
8. [Running the Application](#-running-the-application)
9. [Running Integration Tests](#-running-integration-tests)
10. [Complete REST API Specification](#-complete-rest-api-specification)
11. [Security & Engineering Highlights](#-security--engineering-highlights)
12. [Git Commit History](#-git-commit-history)

---

## 🌟 Project Overview

RecruitHub enables organizations to manage their end-to-end recruitment lifecycle while giving candidates a frictionless job search and application experience:

### 1. Job Seekers & Candidates
- **Explore Job Openings**: Search vacancies by title or keyword, filter by work location and job type (Full-time, Part-time, Contract, Remote), with server-side pagination.
- **Detailed Job Position View**: Inspect complete job descriptions, salary brackets, team details, and requirements.
- **Resume Upload**: Apply directly with a PDF resume (max 5 MB) and an optional cover note. Duplicate applications to the same position are strictly prevented.
- **My Applications Tracker**: Real-time visual tracking of application status across the recruitment pipeline (`Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Offered` / `Rejected`).

### 2. Recruiters & Admins
- **Interactive Dashboard**: Summary metrics for total jobs, open/closed counts, total candidate pool, and real-time status counts.
- **Job Management**: Full CRUD operations (create new positions, edit details, close/reopen postings, delete postings).
- **Applicant Review & Pipeline Management**: Filter candidates per job by pipeline stage, view profiles and cover notes, securely stream/download candidate PDF resumes.
- **Status Progression Pipeline**: Advance candidates through validated stages (`Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Offered` / `Rejected`).
- **Internal Applicant Notes**: Save private evaluation feedback and interview notes per applicant (backed by MongoDB).
- **Activity Audit Trail**: Chronological timeline of all system and recruitment actions.

### 3. Real-Time External Job Market Feeds (Adzuna & Jooble Integration)
- **Live Indian Market Search**: Search real-time tech opportunities across major hubs (Bengaluru, Delhi NCR, Mumbai, Hyderabad, Pune, Remote).
- **Direct Aggregator Endpoints**: Integrated with **Adzuna API** (dedicated India endpoint `api.adzuna.com/v1/api/jobs/in`) and **Jooble API** (`jooble.org/api`), with automatic zero-config live fallback.
- **1-Click Admin Import**: Administrators can browse external opportunities and import any job into the portal database with 1 click, instantly accepting internal candidate applications and tracking applicants through the hiring pipeline.

---

## 🗄️ Dual-Database Architecture & Rationale

Why use both **MySQL** and **MongoDB**? Each database is purposefully chosen for the workload it excels at:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RecruitHub Application                          │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌─────────────────────────┐
       │   MySQL (Relational)   │       │   MongoDB (Document)    │
       ├────────────────────────┤       ├─────────────────────────┤
       │ • users                │       │ • activity_logs         │
       │ • jobs                 │       │ • applicant_notes       │
       │ • applications         │       │                         │
       └────────────────────────┘       └─────────────────────────┘
         ACID Guarantees, Foreign          High-write Append-only,
         Keys, Unique Composite Keys,      Flexible Schema, Nested
         Relational Integrity              Metadata
```

### 1. MySQL (Relational Core)
- **Entities**: `users`, `jobs`, `applications`.
- **Reasoning**:
  - **Relational Integrity & ACID Compliance**: Job postings, user authentication, and applications require strict foreign key constraints (`ON DELETE CASCADE` or `RESTRICT`) and transactional reliability.
  - **Unique Composite Constraints**: Prevents candidate race conditions and duplicate applications using `UNIQUE KEY uq_job_user (job_id, user_id)`.
  - **Structured Enums & Strict Typing**: Enforces valid role types (`admin`, `candidate`), job statuses (`open`, `closed`), and core pipeline statuses (`applied`, `shortlisted`, `interview`, `offered`, `rejected`).
  - **Indexed Foreign Keys & Query Optimization**: Rapid lookups on `job_id`, `user_id`, `status`, and `email`.

### 2. MongoDB (Flexible Documents)
- **Entities**: `activity_logs`, `applicant_notes`.
- **Reasoning**:
  - **Audit Logging (`activity_logs`)**: Generates high-volume, append-only records with dynamic metadata payloads (e.g. status changes carry `{ previousStatus, newStatus }`, job creation carries snapshots). A document store handles polymorphic payloads without altering table schemas.
  - **Internal Evaluation Notes (`applicant_notes`)**: Admins write contextual evaluation notes and interview feedback for applicants. MongoDB allows flexible commenting and threading without placing table locks on the core transactional `applications` table.
  - **Fault Resilience**: If MongoDB is temporarily undergoing maintenance, the application gracefully logs a warning while continuing all core MySQL recruitment operations.

---

## 💻 Tech Stack

- **Backend**: Node.js, Express.js (REST API, prefix `/api`)
- **Databases**:
  - MySQL (`mysql2/promise` connection pool, 100% parameterized queries)
  - MongoDB (`mongoose` models with lifecycle events)
- **Authentication**: JSON Web Tokens (JWT), `bcryptjs` password hashing, Role-Based Access Control (`admin`, `candidate`)
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Lucide React icons
- **File Uploads**: `multer` (PDF format only, 5 MB limit, stored outside web root, served only via authenticated admin endpoint)
- **Validation**: `express-validator` with centralized input sanitization
- **Security**: `helmet`, `cors`, `express-rate-limit` on auth routes
- **Testing**: Jest 29, Supertest 7 (23 passing integration tests)
- **Version Control**: Git

---

## 📂 Folder Structure

```
RecruitMent-Portal-Proj/
├── package.json                 # Monorepo workspace commands
├── .gitignore                   # Ignores node_modules, .env, and uploaded resumes
├── README.md                    # Project documentation
├── backend/
│   ├── app.js                   # Express app with helmet, cors, router, error handler
│   ├── server.js                # Server entry point with DB health checks
│   ├── package.json             # Backend dependencies & test scripts
│   ├── jest.config.js           # Jest configuration
│   ├── .env.example             # Documented environment variables
│   ├── config/
│   │   ├── index.js             # Centralized configuration
│   │   ├── db.mysql.js          # MySQL connection pool & parameterized query runner
│   │   └── db.mongo.js          # MongoDB connection via Mongoose
│   ├── controllers/             # Request handlers (auth, job, application, admin)
│   ├── middleware/              # Auth, role check, error handler, multer upload, rate limit
│   ├── models/
│   │   ├── mysql/               # UserModel, JobModel, ApplicationModel
│   │   └── mongo/               # ActivityLog, ApplicantNote
│   ├── routes/                  # Express routers mounted under /api
│   ├── services/                # Business logic & DB interaction layer
│   ├── validators/              # express-validator schemas
│   ├── uploads/resumes/         # Secure PDF resume storage (outside public root)
│   ├── scripts/
│   │   ├── schema.sql           # MySQL DDL with constraints and indexes
│   │   ├── initDb.js            # Automated database and table creation
│   │   └── seed.js              # Seeds default admin, candidates, and sample jobs
│   └── tests/                   # Jest + Supertest integration tests
│       ├── auth.test.js
│       ├── jobs.test.js
│       └── applicationFlow.test.js
└── frontend/
    ├── index.html               # HTML entry point with Inter font
    ├── vite.config.js           # Vite dev server & proxy configuration
    ├── tailwind.config.js       # Tailwind CSS configuration
    ├── src/
    │   ├── api/client.js        # Axios instance with auth token interceptor
    │   ├── context/AuthContext.jsx # Global auth state & user session
    │   ├── components/
    │   │   ├── common/          # Navbar, Badge, Modal, ProtectedRoute
    │   │   ├── jobs/            # JobCard, ApplyModal
    │   │   └── admin/           # StatCard, NotesDrawer
    │   ├── pages/
    │   │   ├── public/          # HomePage, JobDetailPage, LoginPage, RegisterPage
    │   │   ├── candidate/       # MyApplicationsPage
    │   │   └── admin/           # AdminDashboardPage, ManageJobsPage, JobApplicantsPage
    │   ├── App.jsx              # Client routing configuration
    │   └── main.jsx             # React DOM root
```

---

## 🔑 Default Demo Credentials

Pre-seeded accounts ready for testing:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@recruitment.com` | `Password@123` | Post/Edit/Close jobs, Review applicants, Download resumes, Advance status, Add notes |
| **Candidate** | `john.doe@example.com` | `Password@123` | Browse jobs, Submit applications, Track application status |
| **Candidate** | `jane.smith@example.com` | `Password@123` | Browse jobs, Submit applications, Track application status |

*(Quick-click demo autofill buttons are built directly into the login page for convenience).*

---

## ⚙️ Prerequisites & Environment Variables

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 tested)
- **MySQL**: v8.0 or MariaDB
- **MongoDB**: v5.0 or higher (Local or MongoDB Atlas URI)

### Backend `.env` Configuration
Copy `backend/.env.example` to `backend/.env`:
```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=recruitment_portal_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=recruitment_portal

# MongoDB Database
MONGODB_URI=mongodb://127.0.0.1:27017/recruitment_portal
```

---

## 🚀 Installation & Setup

### 1. Install Dependencies
Run the following from the project root directory:
```bash
# Using root helper
npm run install:all

# Or individually
cd backend && npm install
cd ../frontend && npm install
```

### 2. Initialize and Seed Databases
Ensure your MySQL server is running, then run:
```bash
cd backend
npm run db:init
npm run db:seed
```
This will:
1. Create the `recruitment_portal` database and tables (`users`, `jobs`, `applications`) with foreign keys and indexes.
2. Seed the default Admin user, candidate accounts, sample jobs, and initial audit logs.

---

## 🏃 Running the Application

### Option A: Run Both Services from Root
```bash
# Terminal 1 - Backend Server (Port 5000)
npm run backend:dev

# Terminal 2 - Frontend Client (Port 5173)
npm run frontend:dev
```

### Option B: Run Directly in Respective Directories
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Visit the application in your browser:
👉 **Frontend Application**: `http://localhost:5173`  
👉 **Backend Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Running Integration Tests

The test suite includes **26 comprehensive integration tests** covering Authentication, Job CRUD, Public Search/Pagination, Multer PDF Uploads, Duplicate Application Prevention, Admin Status Progression, and Real-Time External Job Search/Import:

```bash
# Run tests from backend
cd backend
npm test
```

### Test Suite Summary:
- `tests/auth.test.js`: Registration, field validation, duplicate email protection, login, password comparison, token verification, and `/api/auth/me`.
- `tests/jobs.test.js`: Public job listing, search & pagination metadata, single job lookup, 404 handling, role-based protection (401/403), admin job creation, update, deletion, live external job search (`GET /api/jobs/external/live`), admin 1-click import (`POST /api/jobs/external/import`), and unauthorized candidate prevention (403).
- `tests/applicationFlow.test.js`: Candidate apply flow with PDF resume, non-PDF rejection, duplicate submission block (409 Conflict), candidate "My Applications" listing, admin pipeline status advancement (`applied` ➔ `shortlisted` ➔ `interview` ➔ `offered`), invalid status transition rejection (400), and non-admin role restrictions (403).

---

## 📡 Complete REST API Specification

Base URL: `/api`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | Public | Register new candidate or admin (rate-limited, validated) |
| `POST` | `/api/auth/login` | None | Public | Authenticate user & return JWT token (rate-limited) |
| `GET` | `/api/auth/me` | Bearer | Any | Get current authenticated user profile |

### 2. Jobs (`/api/jobs`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/jobs` | Optional | Public | Paginated open jobs with `search`, `location`, `jobType`, and `status` query filters |
| `GET` | `/api/jobs/external/live` | None | Public | Real-time Indian job aggregation from **Adzuna India** & **Jooble** |
| `POST` | `/api/jobs/external/import` | Bearer | Admin | 1-Click import external job posting into portal database |
| `GET` | `/api/jobs/:id` | None | Public | Get full details of a specific job |
| `POST` | `/api/jobs` | Bearer | Admin | Create a new job posting (logged in MongoDB) |
| `PUT` | `/api/jobs/:id` | Bearer | Admin | Update job details or change status to `closed`/`open` |
| `DELETE`| `/api/jobs/:id` | Bearer | Admin | Delete a job posting and associated applications |
| `POST` | `/api/jobs/:id/apply` | Bearer | Candidate | Apply to job with multipart form (`resume` PDF file, `cover_note` text) |

### 3. Candidate Applications (`/api/applications`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/applications/mine` | Bearer | Candidate | List current candidate's submitted applications with statuses |

### 4. Admin Management (`/api/admin`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/admin/stats` | Bearer | Admin | Summary metrics (total jobs, applicants, counts per status) |
| `GET` | `/api/admin/activity` | Bearer | Admin | Recent timeline of system activity from MongoDB |
| `GET` | `/api/admin/jobs/:id/applications`| Bearer | Admin | List applications for a job (with optional `status` filter) |
| `GET` | `/api/admin/applications/:id` | Bearer | Admin | Detailed application view with candidate details & internal notes |
| `GET` | `/api/admin/applications/:id/resume`| Bearer | Admin | Authorized download/stream of candidate's PDF resume |
| `PATCH`| `/api/admin/applications/:id/status` | Bearer | Admin | Advance application status through pipeline |
| `POST` | `/api/admin/applications/:id/notes` | Bearer | Admin | Add internal evaluation note on applicant (saved in MongoDB) |
| `GET` | `/api/admin/applications/:id/notes` | Bearer | Admin | Retrieve evaluation notes for an applicant from MongoDB |

---

## 🔒 Security & Engineering Highlights

1. **Resume File Upload Security**:
   - Resumes stored in `backend/uploads/resumes/` outside public web directories.
   - File extensions and MIME types strictly validated (`application/pdf`). Non-PDFs are rejected.
   - Maximum upload size capped at 5 MB.
   - Filenames randomized with timestamps and random integers to prevent path traversal and collisions.
   - Resumes are protected by authentication: only verified admins can view or download resumes via `/api/admin/applications/:id/resume`.
2. **SQL Injection Defense**:
   - Zero string concatenation in database queries. 100% of queries use parameterized prepared statements (`?` placeholders) via `mysql2/promise`.
3. **Role-Based Access Control**:
   - Distinct authorization middleware (`authorize('admin')`, `authorize('candidate')`) protecting routes.
4. **Hiring Pipeline State Validation**:
   - Status updates are validated against explicit transition rules:
     `applied` ➔ `shortlisted` ➔ `interview` ➔ `offered` / `rejected`.
5. **Rate Limiting & HTTP Headers**:
   - `helmet` secures HTTP response headers.
   - `express-rate-limit` guards against brute-force attacks on auth routes.
6. **Centralized Error Handling**:
   - Custom `AppError` operational class catches duplicate records (`ER_DUP_ENTRY` ➔ 409), invalid foreign keys (400), JWT failures (401), and Multer limit violations with consistent JSON output.

---

## 📜 Git Commit History

The project was developed in iterative milestones with clean Git commits:

1. `feat(core): initialize backend setup, dual-database connections, schema and seed scripts`
2. `feat(auth): implement JWT authentication, bcrypt hashing, role guards, and auth rate limiting`
3. `feat(jobs): implement public job listings, search/filters, admin CRUD, and MongoDB activity logging`
4. `feat(applications): candidate apply flow with Multer PDF upload, duplicate check, and tracking`
5. `feat(admin): implement dashboard stats, applicant review, status progression pipeline, and MongoDB notes`
6. `feat(frontend): build React Vite client with Tailwind, candidate apply flow, and admin dashboard`
7. `test: add integration test suites for auth, jobs CRUD, apply flow, and hiring pipeline`
8. `docs: complete README with architecture, API docs, dual-DB rationale, and root scripts`
