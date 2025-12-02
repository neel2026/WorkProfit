# WorkProfit Implementation Plan

## Goal Description
To build the **WorkProfit** SaaS application using a **Python (FastAPI)** backend and **React (Vite)** frontend. The development is broken down into small, isolated, and testable "Vertical Slices" to ensure zero-bug progression and scalability.

## User Review Required
> [!IMPORTANT]
> **Strict Testing Protocol**: Every step includes a mandatory "Verification" phase. We will not proceed to the next step until the current one passes all automated tests.

## Technology Stack
*   **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy (Async), Pytest.
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand, Vitest.
*   **Database**: PostgreSQL.
*   **Infrastructure**: Docker (for local DB), Alembic (Migrations).

## Development Roadmap (Vertical Slices)

### Phase 1: Foundation & Authentication (The Gatekeeper)
**Goal**: Set up the project structure and secure the application.
1.  **Project Setup**: Initialize Git, Python venv, React app, and Docker for Postgres.
2.  **Database Schema (Users)**: Create `users` table with password hashing.
3.  **Backend Auth API**: Implement `/login` (JWT) and `/register` endpoints.
4.  **Frontend Auth Pages**: Build Login and Sign-up forms.
5.  **Integration**: Connect Frontend forms to Backend API.
6.  **Verification**: Automated tests for login success/failure, token validation.

### Phase 2: User Management (The Actors)
**Goal**: Manage employees, roles, and departments.
1.  **Database Schema (Roles)**: Add `role` and `department` fields to Users.
2.  **Backend User CRUD**: API to Create, Read, Update, Delete users (Admin only).
3.  **Frontend User List**: Display table of employees with filters.
4.  **Frontend User Forms**: "Add Employee" modal with dynamic Department dropdown.
5.  **Verification**: Test that "Staff" cannot create users, only "Admin" can.

### Phase 3: Project Management (The Containers)
**Goal**: Create and track projects.
1.  **Database Schema (Projects)**: Create `projects` and `project_members` tables.
2.  **Backend Project API**: CRUD for Projects. Logic for "Timeline" calculation.
3.  **Frontend Project List**: Card/List view of projects.
4.  **Frontend Project Details**: View project info, assigned members, and progress.
5.  **Verification**: Test that a Project Manager can create a project and assign members.

### Phase 4: Task Management (The Work)
**Goal**: The core daily workflow.
1.  **Database Schema (Tasks)**: Create `tasks` table linked to Projects and Users.
2.  **Backend Task API**: Create, Assign, Update Status/Priority.
3.  **Frontend Task Board**: List view of tasks with status indicators.
4.  **Frontend Task Actions**: Edit task, change status (To Do -> Done).
5.  **Verification**: Test that completing a task updates the project progress.

### Phase 5: Dashboard & Reporting (The Report)
**Goal**: High-level insights.
1.  **Backend Stats API**: Endpoints for "Total Tasks", "Productivity %", "Overdue Count".
2.  **Frontend Dashboard**: Integrate Charts and Stat Cards with real data.
3.  **Verification**: Compare calculated stats against actual database records.

## Detailed Step-by-Step Execution Plan

### Step 1: Project Initialization
*   [ ] Create root directory `workprofit`.
*   [ ] **Backend**: `mkdir backend`, `poetry init` (or pip), install `fastapi uvicorn sqlalchemy asyncpg alembic pytest`.
*   [ ] **Frontend**: `npm create vite@latest frontend -- --template react-ts`, install `tailwindcss axios zustand`.
*   [ ] **Database**: Create `docker-compose.yml` for PostgreSQL.
*   [ ] **Test**: Run "Hello World" on both servers to ensure they start.

### Step 2: Database & User Model
*   [ ] **Backend**: Configure `database.py` (AsyncSession).
*   [ ] **Backend**: Create `models/user.py` (SQLAlchemy model).
*   [ ] **Backend**: Create migration `alembic revision --autogenerate -m "init_users"`.
*   [ ] **Test**: Run migration, verify table creation in DB.

### Step 3: Authentication Logic (Backend)
*   [ ] **Backend**: Install `passlib[bcrypt] python-jose`.
*   [ ] **Backend**: Create `core/security.py` (Hash password, Create JWT).
*   [ ] **Backend**: Create `schemas/user.py` (Pydantic models for Register/Login).
*   [ ] **Backend**: Create `api/v1/auth.py` (Endpoints).
*   [ ] **Test (Auto)**: Write `tests/test_auth.py`. Test: Register User -> Login -> Receive Token.

### Step 4: Frontend Authentication UI
*   [ ] **Frontend**: Setup `axios` interceptor for JWT.
*   [ ] **Frontend**: Create `pages/Login.tsx`.
*   [ ] **Frontend**: Create `store/authStore.ts` (Zustand) to save token.
*   [ ] **Integration**: Connect Login form to Backend `/token` endpoint.
*   [ ] **Test (Manual)**: Log in with the user created in Step 3. Verify redirection to Home.

*(Plan continues for subsequent phases...)*
