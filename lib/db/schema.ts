import { pgTable, text, integer, real, boolean, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";

export const collections = pgTable(
  "collections",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    coverPhotoId: text("cover_photo_id"), // FK -> photos.id (nullable; app-enforced)
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("collections_slug_uq").on(t.slug),
  ]
);

export const photos = pgTable(
  "photos",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id").references(() => collections.id, { onDelete: "set null" }),
    title: text("title"),
    alt: text("alt"),
    caption: text("caption"),
    displayKey: text("display_key").notNull(),
    originalKey: text("original_key"),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    bytes: integer("bytes"),
    mime: text("mime"),
    thumbhash: text("thumbhash"),
    dominantColor: text("dominant_color"),
    focalX: real("focal_x").notNull().default(0.5),
    focalY: real("focal_y").notNull().default(0.35),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("draft"),
    featuredHome: boolean("featured_home").notNull().default(false),
    featuredAbout: boolean("featured_about").notNull().default(false),
    takenAt: text("taken_at"),
    contentHash: text("content_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    trashedAt: timestamp("trashed_at", { withTimezone: true }),
  },
  (t) => [
    index("photos_collection_idx").on(t.collectionId, t.status, t.sortOrder),
    index("photos_status_idx").on(t.status, t.createdAt),
    index("photos_home_idx").on(t.featuredHome, t.status),
  ]
);

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey(), // always 1
  headline: text("headline"),
  subline: text("subline"),
  bio: text("bio"),
  showStats: boolean("show_stats").notNull().default(false),
  showAwards: boolean("show_awards").notNull().default(false),
  showTestimonials: boolean("show_testimonials").notNull().default(false),
  homeSelectorMode: text("home_selector_mode").notNull().default("collections"),
  homeVariant: text("home_variant").notNull().default("collage"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  tiktokUrl: text("tiktok_url"),
  xUrl: text("x_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enquiries = pgTable("enquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  sessionType: text("session_type"),
  message: text("message").notNull(),
  emailStatus: text("email_status").notNull().default("pending"),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  handledAt: timestamp("handled_at", { withTimezone: true }),
});

export const adminAudit = pgTable("admin_audit", {
  id: text("id").primaryKey(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityId: text("entity_id"),
  meta: text("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
