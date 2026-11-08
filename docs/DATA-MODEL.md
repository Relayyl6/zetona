# DATA-MODEL.md

D1 (SQLite) via Drizzle. IDs are **ULIDs** (sortable, URL-safe). Timestamps are ISO-8601 UTC text.
Related: [ARCHITECTURE.md](./ARCHITECTURE.md) · [MEDIA-PIPELINE.md](./MEDIA-PIPELINE.md) · [ADMIN.md](./ADMIN.md) · [CONTENT.md](./CONTENT.md).

## 1. ER overview

```
collections 1 ──── * photos
photos      * ──── 1 collections (nullable → "Uncollected" still shows in Archive)
site_settings (singleton row)
enquiries (append-only)
admin_audit (append-only)
```

## 2. Drizzle schema (`lib/db/schema.ts`)

```ts
import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const collections = sqliteTable("collections", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverPhotoId: text("cover_photo_id"),           // FK → photos.id (nullable; app-enforced)
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({ slugIdx: uniqueIndex("collections_slug_uq").on(t.slug) }));

export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  collectionId: text("collection_id").references(() => collections.id, { onDelete: "set null" }),
  title: text("title"),
  alt: text("alt"),                                // REQUIRED to publish (validator)
  caption: text("caption"),
  // storage keys (never full URLs)
  displayKey: text("display_key").notNull(),       // public bucket, e.g. photos/{id}/display.jpg
  originalKey: text("original_key"),               // private bucket
  width: integer("width").notNull(),               // of display image
  height: integer("height").notNull(),
  bytes: integer("bytes"),
  mime: text("mime"),
  thumbhash: text("thumbhash"),                    // base64, ≈ 28 bytes
  dominantColor: text("dominant_color"),           // #rrggbb for skeletons / backdrops
  focalX: real("focal_x").notNull().default(0.5),  // 0..1
  focalY: real("focal_y").notNull().default(0.35), // faces sit high
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status", { enum: ["draft", "published", "trashed"] }).notNull().default("draft"),
  featuredHome: integer("featured_home", { mode: "boolean" }).notNull().default(false),
  featuredAbout: integer("featured_about", { mode: "boolean" }).notNull().default(false),
  takenAt: text("taken_at"),
  contentHash: text("content_hash"),               // sha-256 of display file → de-dupe + cache-busting
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  trashedAt: text("trashed_at"),
}, (t) => ({
  byCollection: index("photos_collection_idx").on(t.collectionId, t.status, t.sortOrder),
  byStatus: index("photos_status_idx").on(t.status, t.createdAt),
  homeFeatured: index("photos_home_idx").on(t.featuredHome, t.status),
}));

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),                  // always 1
  headline: text("headline"),
  subline: text("subline"),
  bio: text("bio"),                                // paragraphs separated by blank lines
  showStats: integer("show_stats", { mode: "boolean" }).notNull().default(false),
  showAwards: integer("show_awards", { mode: "boolean" }).notNull().default(false),
  showTestimonials: integer("show_testimonials", { mode: "boolean" }).notNull().default(false),
  homeSelectorMode: text("home_selector_mode", { enum: ["photos", "collections"] }).notNull().default("collections"),
  homeVariant: text("home_variant", { enum: ["collage", "split"] }).notNull().default("collage"),
  instagramUrl: text("instagram_url"), facebookUrl: text("facebook_url"),
  tiktokUrl: text("tiktok_url"), xUrl: text("x_url"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  sessionType: text("session_type"),
  message: text("message").notNull(),
  emailStatus: text("email_status", { enum: ["pending", "sent", "failed"] }).notNull().default("pending"),
  ipHash: text("ip_hash"),                         // salted hash for rate-limit forensics; never raw IP
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  handledAt: text("handled_at"),
});

export const adminAudit = sqliteTable("admin_audit", {
  id: text("id").primaryKey(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),               // photo.create | photo.update | photo.delete | …
  entityId: text("entity_id"),
  meta: text("meta"),                              // JSON string
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

## 3. Optional tables (**only when the client supplies real content**, Q8)

```ts
awards:        id, title, year, sort_order, preview_photo_id, visible
testimonials:  id, quote, author, role, avatar_photo_id, sort_order, visible
stats:         id, label, value, suffix, sort_order        // e.g. label "Years of experience"
```
Migrations for these are written but **not applied** in v1 (kept in `drizzle/optional/`). Components exist and are hidden.

## 4. Invariants (enforced in code, covered by unit tests)

1. `photo.status = 'published'` requires non-empty `alt`, valid `displayKey`, `width/height > 0`.
2. `collections.status = 'published'` requires ≥ 1 published photo (otherwise public pages 404 it).
3. Deleting a collection **never** deletes photos; they become uncollected.
4. `sort_order` is dense per collection (re-normalised on reorder).
5. `featured_home` limited to 12; collage needs ≥ 5 to render.
6. `site_settings` has exactly one row (`id=1`), created by migration.
7. `trashed` photos are invisible publicly and purged (R2 + row) after 30 days by a Cron Trigger.
8. R2 keys are immutable once written; replacing a file creates new keys and deletes the old ones **after** the row update succeeds.

## 5. Zod schemas (`lib/validators/*`)

```ts
export const photoUpdateSchema = z.object({
  title: z.string().trim().max(120).optional().nullable(),
  alt: z.string().trim().max(240).optional().nullable(),
  caption: z.string().trim().max(500).optional().nullable(),
  collectionId: z.string().ulid().nullable().optional(),
  focalX: z.number().min(0).max(1).optional(),
  focalY: z.number().min(0).max(1).optional(),
  featuredHome: z.boolean().optional(),
  featuredAbout: z.boolean().optional(),
  status: z.enum(["draft", "published", "trashed"]).optional(),
});

export const photoPublishGuard = z.object({
  alt: z.string().trim().min(8, "Describe the photo (min 8 characters)"),
});

export const uploadRequestSchema = z.object({
  files: z.array(z.object({
    name: z.string().max(200),
    contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    displayBytes: z.number().int().positive().max(8 * 1024 * 1024),
    originalBytes: z.number().int().positive().max(40 * 1024 * 1024),
  })).min(1).max(20),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional(),
  sessionType: z.enum(["portrait", "studio", "other"]).optional(),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional(),     // honeypot must be empty
  turnstileToken: z.string().min(1),
});

export const collectionSchema = z.object({
  title: z.string().trim().min(2).max(80),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60),
  description: z.string().trim().max(300).optional().nullable(),
});
```

## 6. DTOs

```ts
export type PhotoDTO = {
  id: string; alt: string; title?: string; caption?: string;
  width: number; height: number;
  displayKey: string;                  // loader builds URLs from this
  thumbhash?: string; dominantColor?: string;
  focal: { x: number; y: number };
  collection?: { id: string; slug: string; title: string };
};
```
Public DTOs **never** include `originalKey`, `contentHash`, admin metadata or trashed items.

## 7. Seed (`lib/db/seed.ts`)

- Production: only the `site_settings` row (`id=1`) with all toggles false and `headline` = suggested headline.
- Development (`NODE_ENV !== production`): two collections + 12 placeholder photos pointing at `/dev-placeholders/*`, flagged `[PLACEHOLDER]` in title and alt. **Seeding is refused in production** (guard in script).

## 8. Migrations

`drizzle-kit generate` → SQL in `/drizzle` → `wrangler d1 migrations apply`. Migrations are forward-only; destructive changes need a two-step (add → backfill → drop). Local dev uses `wrangler d1 ... --local`.

## 9. Backups

D1 Time Travel (point-in-time restore, 30 days) + a weekly Cron Trigger exporting `photos`, `collections`, `site_settings` to JSON in a private R2 prefix `backups/`. Originals live in the private bucket (so the collection is rebuildable). Restore procedure in [DEPLOYMENT.md](./DEPLOYMENT.md) §9.
