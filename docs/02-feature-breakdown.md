# 2. Feature Breakdown

## Epics

| ID | Epic |
|---|---|
| E-01 | Authentication & Session Management |
| E-02 | Ticket Submission (Employee) |
| E-03 | Ticket Management (Support Staff) |
| E-04 | Manager Dashboard & Administration |

---

## User Stories & Tasks

### E-01: Authentication

| ID | Story | Role | Depends On |
|---|---|---|---|
| US-01 | As a user, I can log in with email and password | All | — |
| US-02 | As a user, I am automatically logged out when my session expires | All | US-01 |
| US-03 | As a user, I can log out explicitly | All | US-01 |
| US-04 | As a manager, I can create user accounts and assign roles | Manager | US-01 |

**Tasks for E-01:**
- T-001: Design User schema
- T-002: Implement auth module (NestJS): local strategy, JWT strategy, guards
- T-003: Implement POST /auth/login, /auth/refresh, /auth/logout endpoints
- T-004: Build Login page with React Hook Form + Zod
- T-005: Implement AuthProvider + axios interceptors
- T-006: Implement Next.js middleware for route protection

---

### E-02: Ticket Submission

| ID | Story | Role | Depends On |
|---|---|---|---|
| US-05 | As an employee, I can submit a ticket with title, description, priority, and category | Employee | US-01 |
| US-06 | As an employee, I can view a list of my submitted tickets | Employee | US-05 |
| US-07 | As an employee, I can view the full detail of one of my tickets | Employee | US-06 |
| US-08 | As an employee, I can add a comment to my own ticket | Employee | US-07 |
| US-09 | As an employee, I can close my own ticket | Employee | US-07 |

**Tasks for E-02:**
- T-007: Design Ticket and Comment schemas
- T-008: Implement Tickets module CRUD (NestJS)
- T-009: Implement Comments module (NestJS)
- T-010: Build New Ticket form page
- T-011: Build My Tickets list page with status badges
- T-012: Build Ticket Detail page with comment thread

---

### E-03: Ticket Management

| ID | Story | Role | Depends On |
|---|---|---|---|
| US-10 | As support staff, I can view all open tickets in a queue | Support | US-05 |
| US-11 | As support staff, I can assign a ticket to myself | Support | US-10 |
| US-12 | As support staff, I can update ticket status | Support | US-10 |
| US-13 | As support staff, I can add internal notes to tickets | Support | US-10 |
| US-14 | As support staff, I can filter tickets by status, priority, and category | Support | US-10 |
| US-15 | As support staff, I can search tickets by keyword | Support | US-10 |

**Tasks for E-03:**
- T-013: Add assign/status endpoints + role guard on ticket endpoints
- T-014: Add `isInternal` comment flag + guard (support/manager only)
- T-015: Add filter + search query params to GET /tickets
- T-016: Build Support queue page with filter panel
- T-017: Build ticket status + assignee management UI within ticket detail

---

### E-04: Manager Dashboard

| ID | Story | Role | Depends On |
|---|---|---|---|
| US-16 | As a manager, I can view summary statistics (open, in-progress, resolved) | Manager | US-05 |
| US-17 | As a manager, I can assign tickets to any support agent | Manager | US-10 |
| US-18 | As a manager, I can view a breakdown of tickets per agent | Manager | US-10 |
| US-19 | As a manager, I can create, edit, and deactivate user accounts | Manager | US-04 |

**Tasks for E-04:**
- T-018: Implement Stats module endpoints
- T-019: Implement User management endpoints (CRUD)
- T-020: Build Manager dashboard page with StatsGrid
- T-021: Build User management pages (list, create, edit)
- T-022: Add assign-to-any endpoint
