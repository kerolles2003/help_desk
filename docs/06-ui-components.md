# 6. UI Components

## Layout Components

| Component | Purpose |
|---|---|
| `RootLayout` | HTML shell, font loading, global providers |
| `DashboardLayout` | Sidebar + topbar wrapper for authenticated pages |
| `AuthLayout` | Centered card wrapper for login page |

## Navigation Components

| Component | Purpose |
|---|---|
| `Navbar` | Top bar: logo, page title, UserMenu |
| `Sidebar` | Role-aware navigation links with active state |
| `MobileNav` | Sheet-based sidebar for small screens |
| `UserMenu` | Avatar dropdown: profile link, logout |
| `Breadcrumb` | Contextual path navigation |

## Common / Primitive Components

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

## Ticket Components

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

## User Components

| Component | Purpose |
|---|---|
| `UserTable` | Table of users with role, status, actions |
| `UserForm` | Create/edit user form (RHF + Zod) |

## Dashboard Components

| Component | Purpose |
|---|---|
| `StatsCard` | Single metric: label, value, optional trend indicator |
| `StatsGrid` | Responsive grid of StatsCards |
| `ByAgentTable` | Tabular view of ticket counts per support agent |
| `StatusDistributionChart` | Simple horizontal bar chart by status |
