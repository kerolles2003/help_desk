# 8. Development Roadmap

| Phase | Name | Days | Deliverable |
|---|---|---|---|
| 1 | Project Setup | 1–2 | Both repos initialized, tooling configured, DB connected, Swagger running |
| 2 | Authentication | 3–5 | Login/logout working end-to-end, protected routes, token refresh |
| 3 | Ticket Submission | 6–9 | Employee can submit, list, and view their tickets |
| 4 | Ticket Management | 10–13 | Support staff can manage queue, update status, add comments |
| 5 | Manager Dashboard | 14–16 | Stats visible, user management working, assign-to-any working |
| 6 | Polish & Testing | 17–19 | Error handling, loading states, unit tests, Swagger complete |

## Phase 1 — Project Setup

- Initialize NestJS with `@nestjs/cli`; connect Mongoose to MongoDB Atlas
- Initialize Next.js 15 with TypeScript strict mode
- Configure Tailwind CSS and initialize shadcn/ui
- Set up ESLint + Prettier with shared config across both repos
- Configure Swagger in NestJS `main.ts`
- Verify environment variable loading on both sides

## Phase 2 — Authentication

- Backend: User schema, bcrypt hashing, local strategy, JWT strategy, refresh token flow, auth module
- Frontend: Login page, AuthProvider with token storage, Axios interceptor for refresh, Next.js middleware for route protection, UserMenu with logout

## Phase 3 — Ticket Submission

- Backend: Ticket schema with auto-incrementing ticketNumber, CRUD endpoints with role-filtered GET
- Frontend: New ticket form with Zod validation, My tickets list with StatusBadge/PriorityBadge, Ticket detail page with metadata display

## Phase 4 — Ticket Management

- Backend: Assign endpoint, status transition endpoint (with valid-transition guard), Comments module with isInternal filtering
- Frontend: Support queue page with QuickFilterTabs, TicketStatusSelect and AssigneeSelect in ticket detail, CommentForm with internal toggle

## Phase 5 — Manager Dashboard

- Backend: Stats aggregation endpoints using MongoDB aggregation pipeline, User CRUD endpoints
- Frontend: Manager dashboard with StatsGrid and charts, User management pages

## Phase 6 — Polish & Testing

- Consistent loading skeletons on all list pages
- EmptyState components on all empty lists
- Error boundaries and ErrorState components
- NestJS unit tests for TicketsService and AuthService
- E2E test for login → create ticket → update status flow
- Swagger descriptions on all endpoints and DTOs
