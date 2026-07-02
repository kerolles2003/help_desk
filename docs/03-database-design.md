# 3. Database Design

## Collection: `users`

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

## Collection: `tickets`

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

## Collection: `comments`

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

## Collection: `refreshtokens`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `user` | ObjectId → users | yes | |
| `tokenHash` | String | yes | SHA-256 hash of the refresh token |
| `expiresAt` | Date | yes | TTL index for auto-expiry |
| `createdAt` | Date | auto | |

**Indexes:** `tokenHash` (unique), `user`, `expiresAt` (TTL index — MongoDB auto-deletes expired documents)

**Why:** Enables token revocation on logout without keeping a large blocklist. Hashing the token value means a database breach does not expose raw refresh tokens.
