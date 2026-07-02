# 4. REST API Design

**Base URL:** `/api/v1`
**Auth:** `Authorization: Bearer <accessToken>` unless marked Public

---

## Auth

| Method | URL | Purpose | Auth | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/auth/login` | Login, receive tokens | Public | `{ email, password }` | `{ accessToken, user }` + Set-Cookie refresh |
| POST | `/auth/refresh` | Get new access token | Cookie (refresh token) | — | `{ accessToken }` |
| POST | `/auth/logout` | Invalidate refresh token | Bearer | — | `{ message }` |

---

## Users

| Method | URL | Purpose | Auth | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/users` | List all users | Manager | Query: `?role=&isActive=&page=&limit=` | `{ data: [user], meta: { total, page } }` |
| GET | `/users/me` | Get own profile | Any | — | `{ data: user }` |
| GET | `/users/:id` | Get user by ID | Manager | — | `{ data: user }` |
| POST | `/users` | Create user | Manager | `{ email, password, firstName, lastName, role }` | `{ data: user }` |
| PATCH | `/users/:id` | Update user | Manager | `{ firstName?, lastName?, role?, isActive? }` | `{ data: user }` |
| PATCH | `/users/me/password` | Change own password | Any | `{ currentPassword, newPassword }` | `{ message }` |

---

## Tickets

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

## Comments

| Method | URL | Purpose | Auth | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/tickets/:ticketId/comments` | List comments (role-filtered) | Any (owner or staff) | — | `{ data: [comment] }` |
| POST | `/tickets/:ticketId/comments` | Add comment | Any (owner or staff) | `{ content, isInternal? }` | `{ data: comment }` |
| PATCH | `/tickets/:ticketId/comments/:commentId` | Edit own comment | Comment author | `{ content }` | `{ data: comment }` |
| DELETE | `/tickets/:ticketId/comments/:commentId` | Delete comment | Author or Manager | — | `{ message }` |

**Filtering rule:** `isInternal = true` comments are excluded from responses when the requester has the `employee` role.

---

## Stats

| Method | URL | Purpose | Auth | Response |
|---|---|---|---|---|
| GET | `/stats/overview` | Counts by status | Manager | `{ open, inProgress, resolved, closed, total }` |
| GET | `/stats/by-priority` | Counts by priority | Manager/Support | `{ low, medium, high, critical }` |
| GET | `/stats/by-agent` | Ticket count per support agent | Manager | `{ data: [{ agent, open, inProgress, resolved }] }` |
| GET | `/stats/trends` | Tickets created per day (last 30 days) | Manager | `{ data: [{ date, count }] }` |

---

## Standard Response Envelope

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
