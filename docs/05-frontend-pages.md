# 5. Frontend Pages

## Public (no auth required)

**`/login`**
- Purpose: Authenticate existing users
- Components: AuthLayout, LoginForm (email, password), Button, ErrorAlert
- API: POST /auth/login
- Validation: email format, password min 8 chars
- Interactions: Submit → store accessToken → redirect to `/dashboard`; show inline errors on 401

---

## All Authenticated Roles

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

## Support Staff Only

**`/support`**
- Purpose: Primary ticket queue — tickets that are open or assigned to current user
- Components: TicketTable with queue-specific defaults (sorted by priority + age), QuickFilterTabs (All Open / Assigned to Me / Unassigned)
- API: GET /tickets?status=open,in_progress&sortBy=priority
- Interactions: Assign ticket to self inline; click to full detail

---

## Manager Only

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

## Error Pages

**`/unauthorized`** — 403 page with role explanation and back link

**`not-found.tsx`** — 404 page with navigation
