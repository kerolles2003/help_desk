# 9. Sprint Planning

## Sprint 1 — Foundation & Authentication

**Goal:** A working, authenticated system where users can log in and access role-appropriate pages.

**Duration:** Days 1–5

| Story | Effort |
|---|---|
| Project setup (both repos) | 1 day |
| US-01: Login | 2 days |
| US-02: Session/token refresh | 0.5 day |
| US-03: Logout | 0.5 day |
| Role-aware routing (Next.js middleware) | 1 day |

**Dependencies:** None — this is the foundation.

**Definition of Done:** A user with each role can log in, see a role-appropriate dashboard shell, and be redirected to `/login` if their token expires.

---

## Sprint 2 — Ticket Submission

**Goal:** Employees can submit support requests and track them.

**Duration:** Days 6–9

| Story | Effort |
|---|---|
| US-05: Create ticket | 1.5 days |
| US-06: View own ticket list | 1 day |
| US-07: View ticket detail | 0.5 day |
| US-08: Add comment | 0.5 day |
| US-09: Close own ticket | 0.5 day |

**Dependencies:** Sprint 1 complete (auth required for all ticket operations).

**Definition of Done:** An employee can submit a ticket, view it in their list, open the detail page, add a comment, and close it.

---

## Sprint 3 — Ticket Management

**Goal:** Support staff can work the ticket queue end-to-end.

**Duration:** Days 10–13

| Story | Effort |
|---|---|
| US-10: View all open tickets (support queue) | 1 day |
| US-11: Self-assign ticket | 0.5 day |
| US-12: Update ticket status | 0.5 day |
| US-13: Internal notes (comments) | 0.5 day |
| US-14: Filter tickets | 0.5 day |
| US-15: Search tickets | 0.5 day |
| Role-based API guards | 0.5 day |

**Dependencies:** Sprint 2 complete (tickets must exist to manage).

**Definition of Done:** A support agent can open their queue, filter by priority, assign a ticket to themselves, update its status, and leave an internal note invisible to the employee.

---

## Sprint 4 — Manager Dashboard & Administration

**Goal:** Managers have full visibility and control.

**Duration:** Days 14–17

| Story | Effort |
|---|---|
| US-16: View stats overview | 1 day |
| US-17: Assign ticket to any agent | 0.5 day |
| US-18: Breakdown by agent | 0.5 day |
| US-19: Create/edit/deactivate users | 1.5 days |
| Error handling + loading states | 0.5 day |

**Dependencies:** Sprint 3 complete (agents and tickets must exist for stats to be meaningful).

**Definition of Done:** A manager can view ticket stats, assign tickets to specific agents, and manage user accounts.

---

## Sprint 5 — Quality & Hardening

**Goal:** Production-ready robustness and test coverage.

**Duration:** Days 18–19

| Task | Effort |
|---|---|
| Unit tests: AuthService, TicketsService | 0.5 day |
| E2E test: full employee journey | 0.5 day |
| Swagger documentation pass | 0.5 day |
| Empty states, error boundaries, edge cases | 0.5 day |

**Dependencies:** Sprints 1–4 complete.

**Definition of Done:** CI passes, Swagger is complete, critical paths have test coverage, no unhandled loading or error states in the UI.
