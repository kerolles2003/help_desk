# 7. Project Folder Structure

## Frontend — `helpdesk-web/`

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

## Backend — `helpdesk-api/`

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
