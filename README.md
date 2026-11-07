# CareerTrack – Full-Stack Job Portal & Recruitment Management System

[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![React.js](https://img.shields.io/badge/React.js-18.x-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20In--Memory-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)]()

> **Major Project Submission Deliverable**  
> Complete full-stack recruitment platform connecting high-impact candidates with verified employers, featuring zero-barrier public job applications and a secured administrative management suite.

---

## 1. Project Overview & Objectives

**CareerTrack** is an enterprise-grade recruitment platform built on the **MERN** stack (MongoDB, Express.js, React.js, and Node.js). It eliminates candidate application fatigue by allowing job seekers to browse verified openings, filter by multiple criteria, and apply with résumé uploads **without creating an account or logging in**. 

For recruitment teams, CareerTrack delivers a secured, high-telemetry Command Center with token-based administrative authentication, real-time KPI metrics, recruitment pipeline funnel tracking, stage updates, private notes, and one-click CSV candidate data export.

---

## 2. Key Features & User Roles

### Public Job Seekers
- **Live Job Catalog:** Browse published and active career openings across engineering, product, and design.
- **Search & Multi-Filters:** Instant search by keywords (title, company, skills), location, employment type (`Full-time`, `Contract`, `Internship`), experience level, and remote flexibility.
- **Detailed Job Views:** Comprehensive breakdown of responsibilities, qualifications, benefits, compensation, and application deadlines.
- **Frictionless Application:** Submit name, email, phone, education, experience, technical skills, cover letter, and résumé without account registration.
- **Strict File Validation:** Validates PDF and DOCX formats with a 5 MB file size limit.
- **Duplicate Application Prevention:** Automatic engine-level rejection of duplicate applications for the same position.
- **Confirmation & Tracking:** Immediate generation of a unique reference tracking ID (e.g., `CT-2026-Q8X1A`).

### Authorized Recruitment Administrators
- **Secured Authentication:** Password hashing via `bcryptjs` and token-based authentication via `JWT`.
- **Command Center Dashboard:** Real-time KPI counters (Total Postings, Active Jobs, Closed Jobs, Total Candidates) and an interactive visual recruitment pipeline funnel.
- **Job Management:** Create, view, edit, publish, unpublish, close, and delete job postings with cascade deletion.
- **Application Pipeline Management:** Review candidate credentials, filter by opening and status, update recruitment stages (`Submitted`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Selected`, `Rejected`).
- **Internal Recruitment Notes:** Log timestamped evaluator notes associated with candidates.
- **Protected Résumé Downloads:** Secure token-authenticated file downloads preventing unauthorized public access.
- **CSV Data Export:** One-click export of applicant records for external reporting.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Lucide React, Vite, Vanilla CSS Design System with Glassmorphism |
| **Backend** | Node.js v22, Express.js 4.x, Multer, Express-Validator, Morgan Logger |
| **Database** | MongoDB, Mongoose ODM 8.x, MongoMemoryServer (automated fallback) |
| **Security** | Helmet, Express-Rate-Limit, CORS, Bcryptjs, JSON Web Tokens (JWT) |
| **Tooling & Docs**| Git, npm, Postman, Markdown, Mermaid Diagrams |

---

## 4. Project Architecture & Directory Structure

```
CareerTrack_Major_Project/
├── frontend/                     # React Single-Page Application (Vite)
│   ├── src/
│   │   ├── components/           # Reusable UI (Navbar, Footer, JobCard, Modals, Badges)
│   │   ├── context/              # AuthContext and ToastContext
│   │   ├── pages/                # HomePage, JobDetailPage, Admin views
│   │   ├── services/             # API service fetch layer
│   │   ├── index.css             # Core Glassmorphic Design System
│   │   ├── App.jsx               # Client-side routing configuration
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── backend/                      # Express.js REST API
│   ├── src/
│   │   ├── config/               # Database connection (Atlas / In-Memory fallback)
│   │   ├── controllers/          # Auth, Job, and Application controllers
│   │   ├── middleware/           # Auth, file upload, error handling, validator
│   │   ├── models/               # Admin, Job, and Application Mongoose models
│   │   ├── routes/               # API routes definitions
│   │   ├── utils/                # Database seeder script
│   │   ├── app.js                # Express app setup & security middlewares
│   │   └── server.js             # Server startup entry point
│   ├── uploads/resumes/          # Uploaded candidate résumés directory
│   ├── package.json
│   └── .env.example
├── docs/                         # Comprehensive Technical Documentation
│   ├── API_Documentation.md      # Full REST API endpoint reference
│   ├── Database_Schema.md        # Mongoose schemas, ER diagram & sample records
│   ├── Test_Cases.md             # Detailed test matrix & results
│   └── Test_Cases.csv            # Spreadsheet test case matrix
├── screenshots/                  # Authentic application UI screenshots
│   ├── public_portal.png
│   ├── search_and_filters.png
│   ├── job_details.png
│   ├── application_form.png
│   ├── admin_dashboard.png
│   └── application_management.png
├── Project_Report.md             # Complete 20-section Major Project Report
├── README.md                     # Master project documentation
├── .gitignore
├── GitHub_Repository_Link.txt
└── Deployment_Links.txt
```

---

## 5. Prerequisites & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22.x recommended)
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional)*: Local MongoDB instance or MongoDB Atlas URI. If no MongoDB daemon is detected, the server automatically starts an in-memory database with realistic seed data!

---

### Step 1: Clone or Open the Repository
```bash
git clone https://github.com/your-username/careertrack-major-project.git
cd CareerTrack_Major_Project
```

---

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```
Default configuration values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/careertrack
JWT_SECRET=super_secret_jwt_key_careertrack_2026_recruitment_auth
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/resumes
CLIENT_URL=http://localhost:5173
```
*(Note: If the local MongoDB connection fails, the server seamlessly boots an in-memory database for zero-setup execution!)*

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
Default configuration value:
```env
VITE_API_URL=
```
*(Leave blank in local development to utilize Vite's built-in `/api` proxy.)*

---

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 4: Run the Application Locally

Open two terminal windows:

**Terminal 1 — Backend API:**
```bash
cd backend
npm run dev
# or: node src/server.js
```
The backend starts on `http://localhost:5000`, initializes database collections, and seeds initial jobs and admin credentials.

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm run dev
```
The frontend dev server starts on `http://localhost:5173`.

---

## 6. Demonstration Administrator Credentials

Evaluators can access the secured administrator portal using the following pre-configured demonstration credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Administrator** | `admin@careertrack.com` | `AdminPassword123!` |

*(The Admin Login page also includes a **"Quick Fill"** button that automatically pre-populates these credentials for quick evaluation.)*

---

## 7. Major Deliverables & Documentation Index

- **Project Report (20 Sections):** [Project_Report.md](file:///c:/Users/91990/Downloads/CareerTrack_Major_project/Project_Report.md)
- **Database Schema & ER Diagram:** [docs/Database_Schema.md](file:///c:/Users/91990/Downloads/CareerTrack_Major_project/docs/Database_Schema.md)
- **API Endpoint Specification:** [docs/API_Documentation.md](file:///c:/Users/91990/Downloads/CareerTrack_Major_project/docs/API_Documentation.md)
- **Test Case Execution Matrix:** [docs/Test_Cases.md](file:///c:/Users/91990/Downloads/CareerTrack_Major_project/docs/Test_Cases.md) & [docs/Test_Cases.csv](file:///c:/Users/91990/Downloads/CareerTrack_Major_project/docs/Test_Cases.csv)
- **Screenshots Evidence:** [screenshots/](file:///c:/Users/91990/Downloads/CareerTrack_Major_project/screenshots/)

---

## 8. Deployment Procedure

### Backend Deployment (e.g. Render / Railway / AWS EC2)
1. Set the root directory to `backend`.
2. Configure build command: `npm install`.
3. Configure start command: `node src/server.js`.
4. Supply environment variables: `PORT`, `NODE_ENV=production`, `MONGODB_URI` (MongoDB Atlas connection string), `JWT_SECRET`, `CLIENT_URL`.

### Frontend Deployment (e.g. Vercel / Netlify)
1. Set the root directory to `frontend`.
2. Configure build command: `npm run build`.
3. Configure output directory: `dist`.
4. Set environment variable: `VITE_API_URL=https://your-backend-api.onrender.com`.

---

## 9. License & Academic Integrity

Developed for academic evaluation as a Major Project Capstone in Full-Stack Web Development. Released under the ISC License.
