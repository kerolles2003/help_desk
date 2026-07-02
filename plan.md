# HelpDesk Lite — Technical Design Document

**Version:** 1.0
**Date:** 2026-06-25
**Status:** Planning

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Feature Breakdown](#2-feature-breakdown)
3. [Database Design](#3-database-design)
4. [REST API Design](#4-rest-api-design)
5. [Frontend Pages](#5-frontend-pages)
6. [UI Components](#6-ui-components)
7. [Project Folder Structure](#7-project-folder-structure)
8. [Development Roadmap](#8-development-roadmap)
9. [Sprint Planning](#9-sprint-planning)
10. [Risks & Assumptions](#10-risks--assumptions)

---

## 1. System Architecture

### Overview

HelpDesk Lite follows a decoupled client-server architecture. The frontend is a Next.js 15 App Router SPA-hybrid. The backend is a NestJS REST API. Both communicate via JSON over HTTP with JWT authentication.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / Client                    │
│              Next.js 15 (App Router + RSC)              │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   NestJS REST API                       │
│         Guards → Controllers → Services → DB            │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     MongoDB Atlas                       │
│         users / tickets / comments / sessions           │
└─────────────────────────────────────────────────────────┘
```

---

### Frontend Architecture

**Framework:** Next.js 15 with App Router.

**Rendering Strategy:**
- Server Components (RSC) for initial page shells and SEO-sensitive content.
- Client Components for interactive forms, lists with filtering, real-time state.
- No server-side data fetching via RSC for protected data — all protected data fetched client-side via TanStack Query to keep auth logic in one place and avoid leaking tokens into server context.

**State Management:**
- Server state: TanStack Query (caching, invalidation, pagination, background refetch).
- Client/UI state: React local state (`useState`, `useReducer`).
- Auth state: React Context (`AuthProvider`) backed by tokens stored in memory + `httpOnly` cookie for refresh token.
- No Redux or Zustand — unnecessary for this scope.

**Why this approach:**
TanStack Query eliminates the need for manual loading/error state management across dozens of components. It also gives cache invalidation for free after mutations, keeping the UI consistent without manual refetch logic.

**Form Handling:**
React Hook Form with Zod resolver. Zod schemas are the single source of truth — they validate both at the form layer and can be reused as TypeScript types.

---

### Backend Architecture

**Framework:** NestJS with feature-based module organization.

**Layers per module:**
```
Controller → Service → Repository (Mongoose Model) → MongoDB
```

**Cross-cutting concerns handled via:**
- `Guards` — JWT authentication, RBAC role checks
- `Interceptors` — Response envelope transformation (`{ data, meta }`)
- `Pipes` — Request DTO validation via class-validator; ObjectId format validation
- `Filters` — Global exception filter for consistent error shape
- `Decorators` — `@CurrentUser()`, `@Roles()`

**Why NestJS:** Strong opinions on module structure eliminate architectural drift. Dependency injection makes services easily testable in isolation. First-class Swagger support reduces documentation effort.

---

### Authentication Flow

```
1. POST /auth/login  → { accessToken, refreshToken }
2. accessToken stored in memory (JS variable in AuthProvider)
3. refreshToken stored in httpOnly cookie (server sets via Set-Cookie)
4. Every API request: Authorization: Bearer <accessToken>
5. Axios interceptor catches 401 → calls POST /auth/refresh
6. If refresh succeeds → retry original request with new accessToken
7. If refresh fails → clear auth state → redirect to /login
8. POST /auth/logout → invalidates refresh token on server
```

**Why httpOnly cookie for refresh token:** Prevents XSS from stealing the refresh token. Access token in memory means it is lost on page refresh, which triggers the refresh flow automatically — a good UX tradeoff.

---

### Data Flow (Example: Employee submits a ticket)

```
User fills TicketForm
  → RHF + Zod validates locally
  → onSubmit calls ticketsService.create(dto)
  → Axios POST /api/tickets with Bearer token
  → NestJS JwtAuthGuard validates token
  → TicketsController.create() receives validated DTO
  → TicketsService.create() generates ticket number, saves to MongoDB
  → Response: 201 { data: { ticket } }
  → TanStack Query invalidates ['tickets'] cache
  → UI navigates to /tickets/:id
```

---

### Role Model

| Role | Can Do |
|---|---|
| `employee` | Submit tickets, view own tickets, comment on own tickets |
| `support` | View all tickets, assign to self, update status, comment |
| `manager` | All of the above + manage users, view stats, assign to anyone |

---

## 2. Feature Breakdown

### Epics

| ID | Epic |
|---|---|
| E-01 | Authentication & Session Management |
| E-02 | Ticket Submission (Employee) |
| E-03 | Ticket Management (Support Staff) |
| E-04 | Manager Dashboard & Administration |

---

### User Stories & Tasks

#### E-01: Authentication

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

#### E-02: Ticket Submission

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

#### E-03: Ticket Management

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

#### E-04: Manager Dashboard

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

---

## 3. Database Design

### Collection: `users`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `email` | String | yes | Unique, lowercase |
| `password` | String | yes | bcrypt hashed, never returned |
| `firstName` | String | yes | |
| `lastName` | String | yes | |
| `role` | String (enum) | yes | `employee` \| `support` \| `manager` |
| `isActive` | Boolean | yes | Default: `true`. Soft delete |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

**Indexes:** `email` (unique), `role`

**Relationships:** Referenced by `tickets.submittedBy`, `tickets.assignedTo`, `comments.author`

---

### Collection: `tickets`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `ticketNumber` | String | yes | Unique. Auto-generated: `TKT-00001` |
| `title` | String | yes | Max 150 chars |
| `description` | String | yes | Max 2000 chars |
| `status` | String (enum) | yes | `open` \| `in_progress` \| `resolved` \| `closed`. Default: `open` |
| `priority` | String (enum) | yes | `low` \| `medium` \| `high` \| `critical`. Default: `medium` |
| `category` | String (enum) | yes | `IT` \| `HR` \| `Finance` \| `Facilities` \| `Other` |
| `submittedBy` | ObjectId → users | yes | Immutable after creation |
| `assignedTo` | ObjectId → users | no | Nullable. Must have `support` or `manager` role |
| `resolvedAt` | Date | no | Set when status → `resolved` |
| `closedAt` | Date | no | Set when status → `closed` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:** `status`, `priority`, `category`, `submittedBy`, `assignedTo`, `ticketNumber` (unique), `createdAt` (desc)

**Compound Index:** `{ status, priority, createdAt }` — supports the default support queue sort.

---

### Collection: `comments`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `ticket` | ObjectId → tickets | yes | Parent ticket |
| `author` | ObjectId → users | yes | Comment author |
| `content` | String | yes | Max 1000 chars |
| `isInternal` | Boolean | yes | Default: `false`. If `true`, hidden from `employee` role |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:** `ticket` (for fetching all comments of a ticket), `author`

---

### Collection: `refreshtokens`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `user` | ObjectId → users | yes | |
| `tokenHash` | String | yes | SHA-256 hash of the refresh token |
| `expiresAt` | Date | yes | TTL index for auto-expiry |
| `createdAt` | Date | auto | |

**Indexes:** `tokenHash` (unique), `user`, `expiresAt` (TTL index — MongoDB auto-deletes expired documents)

**Why:** Enables token revocation on logout without keeping a large blocklist. Hashing the token value means a database breach does not expose raw refresh tokens.

---

## 4. REST API Design

**Base URL:** `/api/v1`
**Auth:** `Authorization: Bearer <accessToken>` unless marked Public

---

### Auth

| Method | URL | Purpose | Auth | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/auth/login` | Login, receive tokens | Public | `{ email, password }` | `{ accessToken, user }` + Set-Cookie refresh |
| POST | `/auth/refresh` | Get new access token | Cookie (refresh token) | — | `{ accessToken }` |
| POST | `/auth/logout` | Invalidate refresh token | Bearer | — | `{ message }` |

---

### Users

| Method | URL | Purpose | Auth | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/users` | List all users | Manager | Query: `?role=&isActive=&page=&limit=` | `{ data: [user], meta: { total, page } }` |
| GET | `/users/me` | Get own profile | Any | — | `{ data: user }` |
| GET | `/users/:id` | Get user by ID | Manager | — | `{ data: user }` |
| POST | `/users` | Create user | Manager | `{ email, password, firstName, lastName, role }` | `{ data: user }` |
| PATCH | `/users/:id` | Update user | Manager | `{ firstName?, lastName?, role?, isActive? }` | `{ data: user }` |
| PATCH | `/users/me/password` | Change own password | Any | `{ currentPassword, newPassword }` | `{ message }` |

---

### Tickets

| Method | URL | Purpose | Auth | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/tickets` | Create ticket | Any | `{ title, description, priority, category }` | `{ data: ticket }` |
| GET | `/tickets` | List tickets (role-filtered) | Any | Query: `?status=&priority=&category=&assignedTo=&search=&page=&limit=&sortBy=&sortOrder=` | `{ data: [ticket], meta }` |
| GET | `/tickets/:id` | Get ticket detail | Any (owner or staff) | — | `{ data: ticket }` |
| PATCH | `/tickets/:id` | Update ticket fields | Support/Manager | `{ title?, description?, priority?, category? }` | `{ data: ticket }` |
| PATCH | `/tickets/:id/status` | Change ticket status | Support/Manager (or owner to close) | `{ status }` | `{ data: ticket }` |
| PATCH | `/tickets/:id/assign` | Assign ticket | Support (self only) / Manager | `{ assignedTo: userId \| null }` | `{ data: ticket }` |
| DELETE | `/tickets/:id` | Delete ticket | Manager | — | `{ message }` |

**Role-based GET /tickets behavior:**
- `employee` → only sees own tickets (`submittedBy = currentUser._id`)
- `support` / `manager` → sees all tickets; optional filter by `assignedTo=me`

---

### Comments

| Method | URL | Purpose | Auth | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/tickets/:ticketId/comments` | List comments (role-filtered) | Any (owner or staff) | — | `{ data: [comment] }` |
| POST | `/tickets/:ticketId/comments` | Add comment | Any (owner or staff) | `{ content, isInternal? }` | `{ data: comment }` |
| PATCH | `/tickets/:ticketId/comments/:commentId` | Edit own comment | Comment author | `{ content }` | `{ data: comment }` |
| DELETE | `/tickets/:ticketId/comments/:commentId` | Delete comment | Author or Manager | — | `{ message }` |

**Filtering rule:** `isInternal = true` comments are excluded from responses when the requester has the `employee` role.

---

### Stats

| Method | URL | Purpose | Auth | Response |
|---|---|---|---|---|
| GET | `/stats/overview` | Counts by status | Manager | `{ open, inProgress, resolved, closed, total }` |
| GET | `/stats/by-priority` | Counts by priority | Manager/Support | `{ low, medium, high, critical }` |
| GET | `/stats/by-agent` | Ticket count per support agent | Manager | `{ data: [{ agent, open, inProgress, resolved }] }` |
| GET | `/stats/trends` | Tickets created per day (last 30 days) | Manager | `{ data: [{ date, count }] }` |

---

### Standard Response Envelope

**Success:**
```json
{
  "statusCode": 200,
  "data": {},
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

**Error:**
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Ticket TKT-00042 does not exist"
}
```

---

## 5. Frontend Pages

### Public (no auth required)

**`/login`**
- Purpose: Authenticate existing users
- Components: AuthLayout, LoginForm (email, password), Button, ErrorAlert
- API: POST /auth/login
- Validation: email format, password min 8 chars
- Interactions: Submit → store accessToken → redirect to `/dashboard`; show inline errors on 401

---

### All Authenticated Roles

**`/dashboard`**
- Purpose: Role-aware landing page after login
- Components: DashboardLayout, StatsGrid (employee: own ticket counts; support: queue summary; manager: full stats), RecentTicketsList
- API: GET /tickets (filtered), GET /stats/overview (manager)
- Interactions: Quick-link to submit ticket, click ticket to navigate to detail

**`/profile`**
- Purpose: View and update own profile info and password
- Components: ProfileForm (name fields), PasswordChangeForm
- API: GET /users/me, PATCH /users/me/password
- Validation: password confirmation match

**`/tickets`**
- Purpose: Ticket list (employees see own; support/manager see all)
- Components: TicketTable or TicketList, TicketFilters, SearchBar, Pagination, StatusBadge, PriorityBadge
- API: GET /tickets (with query params)
- Interactions: Click row → navigate to detail; filter by status/priority/category; keyword search with debounce

**`/tickets/new`**
- Purpose: Submit a new support request
- Components: TicketForm (title, description, priority select, category select), FormField wrappers
- API: POST /tickets
- Validation: title 5–150 chars, description 10–2000 chars, category required
- Interactions: Submit → navigate to `/tickets/:id`; cancel → `/tickets`

**`/tickets/[id]`**
- Purpose: Full ticket view with comment thread
- Components: TicketDetail (header, metadata, description), CommentList, CommentForm, StatusBadge, PriorityBadge
- Additional for support/manager: TicketStatusSelect, AssigneeSelect, internal comment toggle
- API: GET /tickets/:id, GET /tickets/:id/comments, POST /tickets/:id/comments, PATCH /tickets/:id/status, PATCH /tickets/:id/assign
- Interactions: Employee can add comments and close own ticket; support can change status and assign

---

### Support Staff Only

**`/support`**
- Purpose: Primary ticket queue — tickets that are open or assigned to current user
- Components: TicketTable with queue-specific defaults (sorted by priority + age), QuickFilterTabs (All Open / Assigned to Me / Unassigned)
- API: GET /tickets?status=open,in_progress&sortBy=priority
- Interactions: Assign ticket to self inline; click to full detail

---

### Manager Only

**`/manager`**
- Purpose: Executive overview
- Components: StatsGrid (all metrics), TicketsByStatusChart, ByAgentTable, RecentActivityList
- API: GET /stats/overview, GET /stats/by-agent, GET /stats/trends

**`/manager/tickets`**
- Purpose: Full ticket list with all filters including assignee filter
- Components: Same as `/tickets` + additional filter for assigned agent
- API: GET /tickets (no role filter restriction)

**`/manager/users`**
- Purpose: User directory with management actions
- Components: UserTable (name, email, role, status, created date), RoleBadge, ActionButtons (edit, deactivate)
- API: GET /users
- Interactions: Create user button → `/manager/users/new`; row click → `/manager/users/:id`

**`/manager/users/new`**
- Purpose: Create a new user account
- Components: UserForm (email, firstName, lastName, role select, temporary password)
- API: POST /users
- Validation: email unique, password min 8 chars, role required

**`/manager/users/[id]`**
- Purpose: Edit user or deactivate account
- Components: UserForm (pre-filled), DeactivateSection with ConfirmDialog
- API: GET /users/:id, PATCH /users/:id

---

### Error Pages

**`/unauthorized`** — 403 page with role explanation and back link

**`not-found.tsx`** — 404 page with navigation

---

## 6. UI Components

### Layout Components

| Component | Purpose |
|---|---|
| `RootLayout` | HTML shell, font loading, global providers |
| `DashboardLayout` | Sidebar + topbar wrapper for authenticated pages |
| `AuthLayout` | Centered card wrapper for login page |

### Navigation Components

| Component | Purpose |
|---|---|
| `Navbar` | Top bar: logo, page title, UserMenu |
| `Sidebar` | Role-aware navigation links with active state |
| `MobileNav` | Sheet-based sidebar for small screens |
| `UserMenu` | Avatar dropdown: profile link, logout |
| `Breadcrumb` | Contextual path navigation |

### Common / Primitive Components

| Component | Purpose |
|---|---|
| `StatusBadge` | Colored badge for ticket status (`open` → blue, `in_progress` → yellow, `resolved` → green, `closed` → gray) |
| `PriorityBadge` | Colored badge for priority (`critical` → red, `high` → orange, etc.) |
| `RoleBadge` | Badge for user role |
| `Avatar` | User avatar with initials fallback, size variants |
| `LoadingSpinner` | Centered spinner for async states |
| `LoadingSkeleton` | Skeleton placeholder for lists/cards |
| `EmptyState` | Icon + message for empty lists, with optional CTA button |
| `ErrorState` | Error icon + message + retry button |
| `PageHeader` | Page title + description + right-side action slot |
| `ConfirmDialog` | Modal with confirm/cancel for destructive actions |
| `SearchBar` | Debounced search input with clear button |
| `Pagination` | Page controls with item count display |
| `DateDisplay` | Formatted date with relative time tooltip |
| `FormField` | RHF-aware label + input + error message wrapper |

### Ticket Components

| Component | Purpose |
|---|---|
| `TicketCard` | Compact card: number, title, status, priority, age |
| `TicketTable` | Sortable table with columns for all key fields |
| `TicketForm` | Controlled form for create/edit (RHF + Zod) |
| `TicketDetail` | Full read view: header metadata + description block |
| `TicketStatusSelect` | Dropdown to change status (respects valid transitions) |
| `AssigneeSelect` | Combobox to assign ticket to a support agent |
| `TicketFilters` | Collapsible filter panel: status, priority, category, assignee |
| `CommentList` | Ordered list of CommentItems |
| `CommentItem` | Single comment: avatar, author, timestamp, content, internal badge |
| `CommentForm` | Textarea + submit + internal toggle (support/manager only) |

### User Components

| Component | Purpose |
|---|---|
| `UserTable` | Table of users with role, status, actions |
| `UserForm` | Create/edit user form (RHF + Zod) |

### Dashboard Components

| Component | Purpose |
|---|---|
| `StatsCard` | Single metric: label, value, optional trend indicator |
| `StatsGrid` | Responsive grid of StatsCards |
| `ByAgentTable` | Tabular view of ticket counts per support agent |
| `StatusDistributionChart` | Simple horizontal bar chart by status |

---

## 7. Project Folder Structure

### Frontend — `helpdesk-web/`

```
helpdesk-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── support/
│   │   │   │   └── page.tsx
│   │   │   ├── manager/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tickets/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── users/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── new/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── unauthorized/
│   │   │   └── page.tsx
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui — do not edit manually
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── tickets/
│   │   │   ├── TicketCard.tsx
│   │   │   ├── TicketTable.tsx
│   │   │   ├── TicketForm.tsx
│   │   │   ├── TicketDetail.tsx
│   │   │   ├── TicketStatusSelect.tsx
│   │   │   ├── AssigneeSelect.tsx
│   │   │   ├── TicketFilters.tsx
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   └── CommentForm.tsx
│   │   ├── users/
│   │   │   ├── UserTable.tsx
│   │   │   └── UserForm.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── ByAgentTable.tsx
│   │   │   └── StatusDistributionChart.tsx
│   │   └── common/
│   │       ├── StatusBadge.tsx
│   │       ├── PriorityBadge.tsx
│   │       ├── RoleBadge.tsx
│   │       ├── Avatar.tsx
│   │       ├── PageHeader.tsx
│   │       ├── SearchBar.tsx
│   │       ├── Pagination.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── DateDisplay.tsx
│   │       └── FormField.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTickets.ts
│   │   ├── useTicket.ts
│   │   ├── useComments.ts
│   │   ├── useUsers.ts
│   │   ├── useStats.ts
│   │   └── useDebounce.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── tickets.service.ts
│   │   ├── comments.service.ts
│   │   ├── users.service.ts
│   │   └── stats.service.ts
│   │
│   ├── lib/
│   │   ├── api.ts                    # Axios instance + interceptors
│   │   ├── queryClient.ts            # TanStack Query client config
│   │   └── utils.ts                  # cn(), formatDate(), getInitials()
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   └── QueryProvider.tsx
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── ticket.schema.ts
│   │   └── user.schema.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── ticket.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   └── middleware.ts
│
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── components.json
├── tsconfig.json
└── package.json
```

**Why this structure scales:**
- Route groups `(auth)` and `(dashboard)` share layouts without nesting URL segments.
- Feature folders in `components/` keep ticket, user, and dashboard logic isolated.
- `services/` holds pure functions with no React dependency — easily unit tested.
- `hooks/` are thin TanStack Query wrappers — one hook per resource, consistent API.
- `schemas/` are the single source of truth for form validation and TypeScript types.

---

### Backend — `helpdesk-api/`

```
helpdesk-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── parse-object-id.pipe.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   └── enums/
│   │       ├── role.enum.ts
│   │       ├── ticket-status.enum.ts
│   │       ├── ticket-priority.enum.ts
│   │       └── ticket-category.enum.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── user.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── tickets/
│   │   │   ├── tickets.module.ts
│   │   │   ├── tickets.controller.ts
│   │   │   ├── tickets.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── ticket.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-ticket.dto.ts
│   │   │       ├── update-ticket.dto.ts
│   │   │       ├── assign-ticket.dto.ts
│   │   │       ├── update-ticket-status.dto.ts
│   │   │       └── filter-tickets.dto.ts
│   │   │
│   │   ├── comments/
│   │   │   ├── comments.module.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── comment.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-comment.dto.ts
│   │   │       └── update-comment.dto.ts
│   │   │
│   │   └── stats/
│   │       ├── stats.module.ts
│   │       ├── stats.controller.ts
│   │       └── stats.service.ts
│   │
│   └── database/
│       └── database.module.ts
│
├── test/
│   ├── auth.e2e-spec.ts
│   └── tickets.e2e-spec.ts
│
├── .env
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

**Why this structure scales:**
- Each feature module is self-contained: its own controller, service, schema, and DTOs. Adding a feature means adding one folder — no cross-cutting changes.
- `common/` holds infrastructure shared by all modules but introduces zero business logic — it stays stable as features grow.
- Enums in `common/enums/` are the single source of truth for magic strings, preventing drift between validation DTOs and schemas.

---

## 8. Development Roadmap

| Phase | Name | Days | Deliverable |
|---|---|---|---|
| 1 | Project Setup | 1–2 | Both repos initialized, tooling configured, DB connected, Swagger running |
| 2 | Authentication | 3–5 | Login/logout working end-to-end, protected routes, token refresh |
| 3 | Ticket Submission | 6–9 | Employee can submit, list, and view their tickets |
| 4 | Ticket Management | 10–13 | Support staff can manage queue, update status, add comments |
| 5 | Manager Dashboard | 14–16 | Stats visible, user management working, assign-to-any working |
| 6 | Polish & Testing | 17–19 | Error handling, loading states, unit tests, Swagger complete |

### Phase 1 — Project Setup

- Initialize NestJS with `@nestjs/cli`; connect Mongoose to MongoDB Atlas
- Initialize Next.js 15 with TypeScript strict mode
- Configure Tailwind CSS and initialize shadcn/ui
- Set up ESLint + Prettier with shared config across both repos
- Configure Swagger in NestJS `main.ts`
- Verify environment variable loading on both sides

### Phase 2 — Authentication

- Backend: User schema, bcrypt hashing, local strategy, JWT strategy, refresh token flow, auth module
- Frontend: Login page, AuthProvider with token storage, Axios interceptor for refresh, Next.js middleware for route protection, UserMenu with logout

### Phase 3 — Ticket Submission

- Backend: Ticket schema with auto-incrementing ticketNumber, CRUD endpoints with role-filtered GET
- Frontend: New ticket form with Zod validation, My tickets list with StatusBadge/PriorityBadge, Ticket detail page with metadata display

### Phase 4 — Ticket Management

- Backend: Assign endpoint, status transition endpoint (with valid-transition guard), Comments module with isInternal filtering
- Frontend: Support queue page with QuickFilterTabs, TicketStatusSelect and AssigneeSelect in ticket detail, CommentForm with internal toggle

### Phase 5 — Manager Dashboard

- Backend: Stats aggregation endpoints using MongoDB aggregation pipeline, User CRUD endpoints
- Frontend: Manager dashboard with StatsGrid and charts, User management pages

### Phase 6 — Polish & Testing

- Consistent loading skeletons on all list pages
- EmptyState components on all empty lists
- Error boundaries and ErrorState components
- NestJS unit tests for TicketsService and AuthService
- E2E test for login → create ticket → update status flow
- Swagger descriptions on all endpoints and DTOs

---

## 9. Sprint Planning

### Sprint 1 — Foundation & Authentication

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

### Sprint 2 — Ticket Submission

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

### Sprint 3 — Ticket Management

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

### Sprint 4 — Manager Dashboard & Administration

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

### Sprint 5 — Quality & Hardening

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

---

## 10. Risks & Assumptions

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| MongoDB Atlas connection issues in dev | Medium | High | Use local MongoDB via Docker as fallback; `.env.example` documents both |
| JWT refresh race condition (multiple simultaneous 401s trigger multiple refresh calls) | Medium | Medium | Use a single in-flight refresh promise in the Axios interceptor; queue subsequent requests |
| Next.js App Router + TanStack Query hydration mismatch | Medium | Medium | Keep all protected data fetching client-side; use `use client` boundaries clearly |
| Ticket number auto-increment collisions under concurrent inserts | Low | Medium | Use a MongoDB counter collection with `findOneAndUpdate` + `$inc` with `upsert` — atomic operation |
| Role escalation via PATCH /users/:id (user changing own role) | Low | High | Explicitly prevent role self-modification in UsersService; only managers can change roles |

---

### Business Risks

| Risk | Impact | Mitigation |
|---|---|---|
| No email notification system | High — users won't know when their ticket is updated | Out of scope for MVP; document as Phase 2 feature; add a visible in-app "last updated" indicator |
| No file attachment support | Medium — users may need to attach screenshots | Out of scope for MVP; comment field can accept URLs as workaround |
| No audit trail / activity log | Medium — no history of who changed what | `updatedAt` timestamps provide minimal trail; full audit log is Phase 2 |
| Single language (English only) | Low for internal tool | Acceptable for MVP; i18n can be added later with `next-intl` |

---

### Missing Requirements — Assumptions Made

| Assumption | Reasoning |
|---|---|
| Registration is manager-only, not self-serve | Internal helpdesk systems typically require admin-provisioned accounts to control access |
| No email verification required | Manager creates accounts with known corporate emails; verification adds complexity without clear MVP value |
| Ticket number format is `TKT-XXXXX` (5 digits, zero-padded) | Provides a human-readable reference without exposing sequential IDs |
| Status transitions follow a one-way flow: `open → in_progress → resolved → closed` | Prevents re-opening confusion; if re-opening is needed it becomes a Phase 2 feature |
| Password reset is not in scope | Internal tool — assume IT/manager can reset via user edit endpoint |
| No real-time updates (WebSocket) | MVP uses TanStack Query polling or manual refresh; real-time is Phase 2 |
| Comments cannot be deleted by employees | Prevents evidence destruction on tickets; only managers can delete |

---

### Suggested Phase 2 Enhancements (Post-MVP)

1. Email notifications on ticket status changes
2. File attachment support (S3 / Cloudinary)
3. Real-time updates via WebSocket (Socket.io)
4. Full audit log (who changed what, when)
5. SLA tracking (due dates, overdue alerts)
6. Bulk ticket operations (mass assign, mass close)
7. Dashboard date range filters and trend charts
8. Password reset via email link

---

*End of Technical Design Document*
