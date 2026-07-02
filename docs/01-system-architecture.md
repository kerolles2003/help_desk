# 1. System Architecture

## Overview

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

## Frontend Architecture

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

## Backend Architecture

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

## Authentication Flow

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

## Data Flow (Example: Employee submits a ticket)

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

## Role Model

| Role | Can Do |
|---|---|
| `employee` | Submit tickets, view own tickets, comment on own tickets |
| `support` | View all tickets, assign to self, update status, comment |
| `manager` | All of the above + manage users, view stats, assign to anyone |
