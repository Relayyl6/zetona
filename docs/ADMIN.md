# ADMIN.md: Photo Management Dashboard

Deliberately small. The client said he needs **no complex admin pane**, only a way to
**create, read, update and delete pictures** (stored on Cloudflare). Everything below serves
that, plus a few tiny conveniences.

Related: [MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) · [DATA-MODEL.md](./DATA-MODEL.md) · [SECURITY.md](./SECURITY.md) · [DESIGN.md](./DESIGN.md) §6.10

---

## 1. Scope

| In | Out |
|----|-----|
| Upload photos (single/batch) | Page builder / free-form CMS |
| View all photos (grid) | Multi-user roles |
| Edit title, alt text, caption, collection, focal point, flags | Analytics dashboard (use Cloudflare/Plausible UI) |
| Reorder within a collection | Image editing/retouching |
| Publish / unpublish | Comments, orders, bookings |
| Delete to Trash, restore, permanently delete | |
| Manage collections (CRUD, cover, order) | |
| Tiny settings: bio text, headline, social links, section toggles | |
| View enquiries (read-only list; mark handled) | |

## 2. Access

- Route group `/admin/**`, **noindex**, disallowed in robots.
- **Clerk** session required; `requireAdmin()` re-validates on **every** route handler and server action: signed-in **and** email ∈ `ADMIN_ALLOWLIST` (default: `Osakpolorobazee01@gmail.com`; confirm Q16).
- Middleware gate is a convenience only; **server-side checks are the security boundary**.
- Session length 7 days; sign-out button always visible.
- Optional second layer `[SUGGESTED]`: Cloudflare Access policy on `/admin*` (one-time PIN to the owner's email).

## 3. Information architecture

```
/admin                    Photos (default)       [+ Add photos]
  ├─ filters: All · Published · Drafts · Trash · by collection
  ├─ grid of tiles (thumb, status dot, ★ home, collection chip)
  └─ bulk bar: Publish · Unpublish · Move to collection · Delete
/admin/photos/[id]        Edit photo
/admin/collections        Collections
/admin/enquiries          Messages from the contact form (read-only + "handled")
/admin/settings           Bio · headline · socials · toggles
```
Persistent top bar: `Zetona_E admin` · `View site ↗` · `Sign out`. On mobile: bottom tab bar (Photos · Collections · Messages · Settings).

## 4. Screens

### 4.1 Photos grid
- Tile = thumbnail (4:5), status dot (green published / amber draft / grey trashed), ★ if featured on Home, drag handle (desktop), checkbox on long-press (mobile).
- **Add photos**: opens `UploadDropzone` (drop, click, or camera roll). New tiles appear instantly in a "Uploading" row with progress, then become Drafts.
- **Empty state:** "No photos yet. Add your first photos." with a large button.
- Reorder: drag-and-drop within a collection filter (`Reorder.Group`, persisted via `/photos/reorder` with the full ordered id list).
- Search by title/alt/filename.

### 4.2 Edit photo
| Field | Control | Rules |
|-------|---------|-------|
| Preview | Image + **Focal point picker** (tap the face/subject) + live crop previews (collage card, hero, thumb) | Writes `focal_x/y` |
| Title | text | optional, ≤ 120 |
| **Alt text** | textarea + guidance ([CONTENT.md](./CONTENT.md) §5) | **Required to publish**, ≥ 8 chars |
| Caption | textarea | optional, ≤ 500 |
| Collection | select | optional |
| Featured on Home | switch | max 12; shows count `7/12` |
| Featured on About | switch | |
| Status | Draft / Published | publish blocked until alt present |
| Replace file | button → upload flow | keeps metadata |
| Delete | destructive button → confirm | → Trash |
Autosave is **off**; explicit **Save** with unsaved-changes guard. Keyboard: `⌘/Ctrl+S` saves.

### 4.3 Collections
CRUD; slug auto-generated from title (editable, validated, unique); description; **cover** chosen from its photos; drag to reorder; **Publish** toggle (needs ≥ 1 published photo). Deleting a collection explains that photos stay.

### 4.4 Enquiries
Read-only list (newest first): name, email (mailto), phone (WhatsApp link), type, message, time, **email status** badge (`sent / failed`), "Mark handled". No replies from the dashboard (reply from his own email/WhatsApp).

### 4.5 Settings
`headline`, `subline`, `bio` (plain text, blank line = paragraph), social URLs (validated https), toggles: **Show stats / awards / testimonials** (disabled with note "Ask your developer to add content" until those tables exist), Home variant (`collage | split`). "Save" with success toast.

## 5. UX rules for a non-technical owner

- Plain language. "Publish" / "Hide from site" / "Delete" (not "soft-delete").
- Every destructive action is reversible for 30 days (Trash), and says so.
- **Cannot break the site:** the public pages degrade gracefully for any data state (empty, 1 photo, 200 photos).
- Show "Live on site ✓" with a link after publish; **View on site** deep-links to the collection/photo.
- Mobile-first: all primary tasks (upload, alt text, publish, delete) must be doable one-handed on a phone.
- Never show technical identifiers (ULIDs, keys) except in a collapsible "Details".

## 6. API surface

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/admin/uploads/presign` | POST | presigned PUT URLs | admin |
| `/api/admin/photos` | POST | create draft after upload (verifies R2 objects) | admin |
| `/api/admin/photos` | GET | list with filters/pagination | admin |
| `/api/admin/photos/[id]` | PATCH | update metadata/status | admin |
| `/api/admin/photos/[id]` | DELETE | trash (`?permanent=1` from Trash only) | admin |
| `/api/admin/photos/[id]/restore` | POST | restore from trash | admin |
| `/api/admin/photos/reorder` | POST | ordered id list | admin |
| `/api/admin/collections` (+`/[id]`) | CRUD | | admin |
| `/api/admin/settings` | PATCH | | admin |
| `/api/admin/enquiries/[id]` | PATCH | mark handled | admin |
| `/api/enquiries` | POST | public contact form | public + Turnstile + rate limit |

All admin mutations: `requireAdmin()` → Zod parse → DB write → `admin_audit` → `revalidateTag(...)` → typed JSON result. CSRF: same-site cookies + `Origin` header check on mutations.

## 7. Audit & safety nets

- `admin_audit` records `photo.create|update|publish|trash|restore|purge`, `collection.*`, `settings.update`.
- Bulk delete requires confirming the **count**.
- D1 Time Travel + weekly JSON backup ([DATA-MODEL.md](./DATA-MODEL.md) §9).

## 8. Acceptance checklist

- [ ] Unauthenticated request to any `/api/admin/*` → 401; non-allowlisted signed-in user → 403.
- [ ] Owner can upload 5 photos, add alt text, publish, and see them live in < 2 minutes on a phone.
- [ ] Publish blocked when alt is empty (UI and API).
- [ ] Delete → Trash → Restore round-trip works; permanent delete removes R2 objects.
- [ ] Reorder persists and reflects on the public gallery.
- [ ] Editing `bio` updates the About page after revalidation.
- [ ] Admin works at 360 px width with no horizontal scroll.
