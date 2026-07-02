# HelpDesk Lite — Prototype

An internal helpdesk / ticketing prototype. Employees submit tickets, support
staff work a queue (assign + change status + internal notes), and managers get
stats and user management.

This is a **demo prototype**: it runs with **zero database setup** using an
in-memory MongoDB that is re-seeded with demo accounts on every start.

- **Backend** — `helpdesk-api/` (NestJS + Mongoose, JWT auth, Swagger)
- **Frontend** — `helpdesk-web/` (Next.js 16 App Router, TanStack Query, Tailwind + shadcn/base-ui)

---

## Quick start

Open two terminals.

**1. API** (http://localhost:3001)

```bash
cd helpdesk-api
npm install        # first time only
npm run start:dev
```

On boot it starts an in-memory MongoDB, seeds demo users + sample tickets, and
prints the demo logins. Swagger docs: http://localhost:3001/api/docs

**2. Web** (http://localhost:3000)

```bash
cd helpdesk-web
npm install        # first time only
npm run dev
```

Then open http://localhost:3000 and log in.

---

## Demo accounts

All use the password **`password123`** (the login screen has one-click buttons):

| Role     | Email              | Can do                                               |
|----------|--------------------|------------------------------------------------------|
| Employee | employee@demo.io   | Submit tickets, view/comment on own tickets, close   |
| Support  | support@demo.io    | See all tickets, self-assign, change status, notes   |
| Manager  | manager@demo.io    | Everything + stats dashboard + user management       |

> Data lives in memory only. **Restarting the API wipes everything and re-seeds**
> the demo accounts and sample tickets.

---

## What works end-to-end

- Email/password login with JWT access token + httpOnly refresh-token cookie (auto-refresh)
- Create / list / search / filter tickets (role-scoped: employees see only their own)
- Ticket detail with comment thread; support/manager can post internal notes
- Support queue with quick filters (all open / assigned to me / unassigned)
- Assign tickets (support self-assign; manager assign to anyone) + status transitions
- Manager dashboard (counts by status, tickets-per-agent) and user CRUD
- Profile page with password change

---

## Configuration

Both apps read env files (already provided for local dev):

- `helpdesk-api/.env` — `PORT`, `JWT_*`, `FRONTEND_URL`. `MONGODB_URI` is ignored
  unless `NODE_ENV=production` (the prototype always uses in-memory Mongo otherwise).
- `helpdesk-web/.env.local` — `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001/api/v1`).

To run against a real persistent MongoDB, set `NODE_ENV=production` and a valid
`MONGODB_URI` in `helpdesk-api/.env`, then create users via the manager account.
