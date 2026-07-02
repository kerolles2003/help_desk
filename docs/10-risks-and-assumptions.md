# 10. Risks & Assumptions

## Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| MongoDB Atlas connection issues in dev | Medium | High | Use local MongoDB via Docker as fallback; `.env.example` documents both |
| JWT refresh race condition (multiple simultaneous 401s trigger multiple refresh calls) | Medium | Medium | Use a single in-flight refresh promise in the Axios interceptor; queue subsequent requests |
| Next.js App Router + TanStack Query hydration mismatch | Medium | Medium | Keep all protected data fetching client-side; use `use client` boundaries clearly |
| Ticket number auto-increment collisions under concurrent inserts | Low | Medium | Use a MongoDB counter collection with `findOneAndUpdate` + `$inc` with `upsert` — atomic operation |
| Role escalation via PATCH /users/:id (user changing own role) | Low | High | Explicitly prevent role self-modification in UsersService; only managers can change roles |

---

## Business Risks

| Risk | Impact | Mitigation |
|---|---|---|
| No email notification system | High — users won't know when their ticket is updated | Out of scope for MVP; document as Phase 2 feature; add a visible in-app "last updated" indicator |
| No file attachment support | Medium — users may need to attach screenshots | Out of scope for MVP; comment field can accept URLs as workaround |
| No audit trail / activity log | Medium — no history of who changed what | `updatedAt` timestamps provide minimal trail; full audit log is Phase 2 |
| Single language (English only) | Low for internal tool | Acceptable for MVP; i18n can be added later with `next-intl` |

---

## Missing Requirements — Assumptions Made

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

## Suggested Phase 2 Enhancements (Post-MVP)

1. Email notifications on ticket status changes
2. File attachment support (S3 / Cloudinary)
3. Real-time updates via WebSocket (Socket.io)
4. Full audit log (who changed what, when)
5. SLA tracking (due dates, overdue alerts)
6. Bulk ticket operations (mass assign, mass close)
7. Dashboard date range filters and trend charts
8. Password reset via email link
