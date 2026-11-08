import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { PhotoDTO, CollectionDTO, SiteSettingsDTO, TestimonialDTO, mockPhotos, mockCollections, mockSettings, mockTestimonials } from "./queries";

interface SiteData {
  settings: SiteSettingsDTO;
  photos: PhotoDTO[];
  collections: CollectionDTO[];
  testimonials?: TestimonialDTO[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "site-content.json");

// Helper for Neon SQL client
function getNeonSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// In-memory cache for fast file reads / fallback
let fileCache: SiteData | null = null;

function ensureDataFile(): SiteData {
  if (fileCache) return fileCache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initialData: SiteData = {
      settings: mockSettings,
      photos: mockPhotos,
      collections: mockCollections,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf8");
    fileCache = initialData;
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    fileCache = JSON.parse(raw);
    return fileCache!;
  } catch {
    const fallback: SiteData = {
      settings: mockSettings,
      photos: mockPhotos,
      collections: mockCollections,
    };
    fileCache = fallback;
    return fallback;
  }
}

function persistFile(data: SiteData) {
  fileCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to persist backup to disk:", e);
  }
}

// ──────────────── SETTINGS ────────────────

export async function getSiteSettings(): Promise<SiteSettingsDTO> {
  const sql = getNeonSql();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM site_settings WHERE id = 1 LIMIT 1;`;
      if (rows.length > 0) {
        const row = rows[0];
        const settings: SiteSettingsDTO = {
          headline: row.headline,
          subline: row.subline,
          bio: row.bio,
          showStats: Boolean(row.show_stats),
          showAwards: Boolean(row.show_awards),
          showTestimonials: Boolean(row.show_testimonials),
          homeSelectorMode: (row.home_selector_mode as any) || "collections",
          homeVariant: (row.home_variant as any) || "collage",
          instagramUrl: row.instagram_url,
          facebookUrl: row.facebook_url,
          tiktokUrl: row.tiktok_url,
          xUrl: row.x_url,
        };
        return settings;
      }
    } catch (err) {
      console.warn("Neon query failed, using local store:", err);
    }
  }

  const data = ensureDataFile();
  return { ...data.settings };
}

export async function updateSiteSettings(updates: Partial<SiteSettingsDTO>): Promise<SiteSettingsDTO> {
  const sql = getNeonSql();
  let updatedSettings: SiteSettingsDTO | null = null;

  if (sql) {
    try {
      const current = await getSiteSettings();
      const merged = { ...current, ...updates };

      await sql`
        INSERT INTO site_settings (
          id, headline, subline, bio, show_stats, show_awards, show_testimonials,
          home_selector_mode, home_variant, instagram_url, facebook_url, tiktok_url, x_url, updated_at
        ) VALUES (
          1,
          ${merged.headline || null},
          ${merged.subline || null},
          ${merged.bio || null},
          ${merged.showStats ?? false},
          ${merged.showAwards ?? false},
          ${merged.showTestimonials ?? false},
          ${merged.homeSelectorMode || 'collections'},
          ${merged.homeVariant || 'collage'},
          ${merged.instagramUrl || null},
          ${merged.facebookUrl || null},
          ${merged.tiktokUrl || null},
          ${merged.xUrl || null},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          headline = EXCLUDED.headline,
          subline = EXCLUDED.subline,
          bio = EXCLUDED.bio,
          show_stats = EXCLUDED.show_stats,
          show_awards = EXCLUDED.show_awards,
          show_testimonials = EXCLUDED.show_testimonials,
          home_selector_mode = EXCLUDED.home_selector_mode,
          home_variant = EXCLUDED.home_variant,
          instagram_url = EXCLUDED.instagram_url,
          facebook_url = EXCLUDED.facebook_url,
          tiktok_url = EXCLUDED.tiktok_url,
          x_url = EXCLUDED.x_url,
          updated_at = NOW();
      `;
      updatedSettings = merged;
    } catch (err) {
      console.warn("Neon update failed, writing to local store:", err);
    }
  }

  // Also persist to local file as immediate backup
  const data = ensureDataFile();
  data.settings = {
    ...data.settings,
    ...updates,
  };
  persistFile(data);

  return updatedSettings || data.settings;
}

// ──────────────── PHOTOS ────────────────

function rowToPhotoDTO(row: any): PhotoDTO {
  return {
    id: row.id,
    title: row.title ?? undefined,
    alt: row.alt || "",
    caption: row.caption ?? undefined,
    displayKey: row.display_key,
    originalKey: row.original_key ?? undefined,
    width: row.width || 1200,
    height: row.height || 1500,
    dominantColor: row.dominant_color ?? undefined,
    thumbhash: row.thumbhash ?? undefined,
    focal: {
      x: Number(row.focal_x ?? 0.5),
      y: Number(row.focal_y ?? 0.35),
    },
    featuredHome: Boolean(row.featured_home),
    featuredAbout: Boolean(row.featured_about),
    status: row.status || "published",
    collectionId: row.collection_id ?? undefined,
    sortOrder: Number(row.sort_order || 0),
    collection: row.collection_id
      ? {
          id: row.collection_id,
          slug: row.col_slug || "",
          title: row.col_title || "",
        }
      : undefined,
  };
}

export async function getAllPhotos(): Promise<PhotoDTO[]> {
  const sql = getNeonSql();
  if (sql) {
    try {
      const rows = await sql`
        SELECT 
          p.*,
          c.slug as col_slug,
          c.title as col_title
        FROM photos p
        LEFT JOIN collections c ON p.collection_id = c.id
        WHERE p.status != 'trashed'
        ORDER BY p.sort_order ASC, p.created_at DESC;
      `;
      if (rows.length > 0) {
        return rows.map(rowToPhotoDTO);
      }
    } catch (err) {
      console.warn("Neon query failed, using local store:", err);
    }
  }

  const data = ensureDataFile();
  return [...data.photos];
}

export async function getPhotoById(id: string): Promise<PhotoDTO | null> {
  const sql = getNeonSql();
  if (sql) {
    try {
      const rows = await sql`
        SELECT 
          p.*,
          c.slug as col_slug,
          c.title as col_title
        FROM photos p
        LEFT JOIN collections c ON p.collection_id = c.id
        WHERE p.id = ${id}
        LIMIT 1;
      `;
      if (rows.length > 0) {
        return rowToPhotoDTO(rows[0]);
      }
    } catch (err) {
      console.warn("Neon query failed, using local store:", err);
    }
  }

  const data = ensureDataFile();
  const photo = data.photos.find((p) => p.id === id);
  return photo ? { ...photo } : null;
}

export async function savePhoto(id: string, updates: Partial<PhotoDTO>): Promise<PhotoDTO | null> {
  const colMap: Record<string, { id: string; slug: string; title: string }> = {
    col_portraits_01: { id: "col_portraits_01", slug: "portraits", title: "Portraits" },
    col_studio_02: { id: "col_studio_02", slug: "studio", title: "Studio Sessions" },
    col_editorial_03: { id: "col_editorial_03", slug: "editorial", title: "Editorial & Mood" },
  };

  const sql = getNeonSql();
  if (sql) {
    try {
      const existing = await getPhotoById(id);
      if (existing) {
        const merged = { ...existing, ...updates };
        const targetColId = updates.collectionId !== undefined
          ? updates.collectionId
          : (updates.collection?.id || existing.collectionId || existing.collection?.id || null);

        await sql`
          UPDATE photos SET
            title = ${merged.title || null},
            alt = ${merged.alt || null},
            caption = ${merged.caption || null},
            display_key = ${merged.displayKey},
            focal_x = ${merged.focal?.x ?? 0.5},
            focal_y = ${merged.focal?.y ?? 0.35},
            collection_id = ${targetColId},
            status = ${merged.status || 'published'},
            featured_home = ${merged.featuredHome ?? false},
            featured_about = ${merged.featuredAbout ?? false},
            updated_at = NOW()
          WHERE id = ${id};
        `;
      }
    } catch (err) {
      console.warn("Neon update failed, writing to local store:", err);
    }
  }

  const data = ensureDataFile();
  const index = data.photos.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const targetColId = updates.collectionId !== undefined
    ? updates.collectionId
    : (updates.collection?.id || data.photos[index].collectionId || data.photos[index].collection?.id);

  data.photos[index] = {
    ...data.photos[index],
    ...updates,
    collectionId: targetColId || undefined,
    collection: targetColId && colMap[targetColId] ? colMap[targetColId] : data.photos[index].collection,
  };

  // Recalculate collection photo counts
  if (data.collections) {
    data.collections = data.collections.map((c) => ({
      ...c,
      photoCount: data.photos.filter((p) => p.collectionId === c.id || p.collection?.id === c.id).length,
    }));
  }

  persistFile(data);
  return data.photos[index];
}

export async function createPhoto(photo: Omit<PhotoDTO, "id"> & { id?: string }): Promise<PhotoDTO> {
  const newId = photo.id || `ph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPhoto: PhotoDTO = {
    ...photo,
    id: newId,
  };

  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        INSERT INTO photos (
          id, collection_id, title, alt, caption, display_key, original_key,
          width, height, dominant_color, thumbhash, focal_x, focal_y,
          status, featured_home, featured_about
        ) VALUES (
          ${newId},
          ${newPhoto.collection ? newPhoto.collection.id : null},
          ${newPhoto.title || null},
          ${newPhoto.alt || null},
          ${newPhoto.caption || null},
          ${newPhoto.displayKey},
          ${newPhoto.originalKey || null},
          ${newPhoto.width || 1200},
          ${newPhoto.height || 1500},
          ${newPhoto.dominantColor || null},
          ${newPhoto.thumbhash || null},
          ${newPhoto.focal?.x ?? 0.5},
          ${newPhoto.focal?.y ?? 0.35},
          'published',
          ${newPhoto.featuredHome ?? false},
          ${newPhoto.featuredAbout ?? false}
        );
      `;
    } catch (err) {
      console.warn("Neon insert failed, writing to local store:", err);
    }
  }

  const data = ensureDataFile();
  data.photos.unshift(newPhoto);
  persistFile(data);
  return newPhoto;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`UPDATE photos SET status = 'trashed', trashed_at = NOW() WHERE id = ${id};`;
    } catch (err) {
      console.warn("Neon delete failed, updating local store:", err);
    }
  }

  const data = ensureDataFile();
  const index = data.photos.findIndex((p) => p.id === id);
  if (index === -1) return false;

  data.photos.splice(index, 1);
  persistFile(data);
  return true;
}

// ──────────────── COLLECTIONS ────────────────

export async function getAllCollections(): Promise<CollectionDTO[]> {
  const sql = getNeonSql();
  if (sql) {
    try {
      const rows = await sql`
        SELECT 
          c.*,
          COUNT(p.id)::int as photo_count,
          (
            SELECT display_key 
            FROM photos 
            WHERE collection_id = c.id AND status != 'trashed' 
            ORDER BY sort_order ASC, created_at ASC 
            LIMIT 1
          ) as cover_photo_url
        FROM collections c
        LEFT JOIN photos p ON p.collection_id = c.id AND p.status != 'trashed'
        GROUP BY c.id
        ORDER BY c.sort_order ASC;
      `;
      if (rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          description: r.description,
          coverPhoto: r.cover_photo_url ? {
            id: `ph_cov_${r.id}`,
            displayKey: r.cover_photo_url,
            alt: r.title,
            caption: null,
            width: 1200,
            height: 1500,
            focal: { x: 0.5, y: 0.35 },
          } : undefined,
          photoCount: Number(r.photo_count || 0),
          sortOrder: Number(r.sort_order || 0),
        }));
      }
    } catch (err) {
      console.warn("Neon query failed, using local store:", err);
    }
  }

  const data = ensureDataFile();
  return [...data.collections];
}

export async function createCollection(col: {
  title: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
}): Promise<CollectionDTO> {
  const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const slug = col.slug || col.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sortOrder = col.sortOrder ?? 99;

  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        INSERT INTO collections (id, slug, title, description, sort_order, status, created_at, updated_at)
        VALUES (${id}, ${slug}, ${col.title}, ${col.description || null}, ${sortOrder}, 'published', NOW(), NOW());
      `;
    } catch (err) {
      console.warn("Neon insert collection failed:", err);
    }
  }

  const data = ensureDataFile();
  const newCol: CollectionDTO = {
    id,
    slug,
    title: col.title,
    description: col.description || null,
    photoCount: 0,
    sortOrder,
  };
  data.collections.push(newCol);
  persistFile(data);
  return newCol;
}

export async function updateCollection(
  id: string,
  updates: Partial<CollectionDTO>
): Promise<CollectionDTO | null> {
  const sql = getNeonSql();
  if (sql) {
    try {
      const current = await sql`SELECT * FROM collections WHERE id = ${id} LIMIT 1;`;
      if (current.length > 0) {
        const title = updates.title ?? current[0].title;
        const slug = updates.slug ?? current[0].slug;
        const description = updates.description !== undefined ? updates.description : current[0].description;
        const sortOrder = updates.sortOrder ?? current[0].sort_order;

        await sql`
          UPDATE collections
          SET 
            title = ${title},
            slug = ${slug},
            description = ${description},
            sort_order = ${sortOrder},
            updated_at = NOW()
          WHERE id = ${id};
        `;
      }
    } catch (err) {
      console.warn("Neon update collection failed:", err);
    }
  }

  const data = ensureDataFile();
  const idx = data.collections.findIndex((c) => c.id === id);
  if (idx !== -1) {
    data.collections[idx] = { ...data.collections[idx], ...updates };
    persistFile(data);
    return data.collections[idx];
  }
  return null;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`UPDATE photos SET collection_id = NULL WHERE collection_id = ${id};`;
      await sql`DELETE FROM collections WHERE id = ${id};`;
    } catch (err) {
      console.warn("Neon delete collection failed:", err);
    }
  }

  const data = ensureDataFile();
  data.collections = data.collections.filter((c) => c.id !== id);
  data.photos.forEach((p) => {
    if (p.collection && p.collection.id === id) {
      p.collection = null as any;
    }
  });
  persistFile(data);
  return true;
}

// ──────────────── ENQUIRIES ────────────────

export interface EnquiryDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  sessionType?: string | null;
  message: string;
  emailStatus: string;
  createdAt: string;
  handledAt?: string | null;
}

export async function createEnquiry(enquiry: Omit<EnquiryDTO, "id" | "createdAt" | "emailStatus">): Promise<EnquiryDTO> {
  const id = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const newEnquiry: EnquiryDTO = {
    id,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone || null,
    sessionType: enquiry.sessionType || null,
    message: enquiry.message,
    emailStatus: "pending",
    createdAt: now,
    handledAt: null,
  };

  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        INSERT INTO enquiries (
          id, name, email, phone, session_type, message, email_status, created_at
        ) VALUES (
          ${newEnquiry.id},
          ${newEnquiry.name},
          ${newEnquiry.email},
          ${newEnquiry.phone},
          ${newEnquiry.sessionType},
          ${newEnquiry.message},
          ${newEnquiry.emailStatus},
          NOW()
        );
      `;
    } catch (err) {
      console.warn("Neon insert enquiry failed, falling back to local file:", err);
    }
  }

  // Backup to disk
  try {
    const data = ensureDataFile() as any;
    if (!data.enquiries) data.enquiries = [];
    data.enquiries.unshift(newEnquiry);
    persistFile(data);
  } catch (err) {
    console.error("Failed to backup enquiry to disk:", err);
  }

  return newEnquiry;
}

export async function getAllEnquiries(): Promise<EnquiryDTO[]> {
  const sql = getNeonSql();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM enquiries ORDER BY created_at DESC;`;
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone ?? null,
          sessionType: r.session_type ?? null,
          message: r.message,
          emailStatus: r.email_status || "pending",
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          handledAt: r.handled_at ? new Date(r.handled_at).toISOString() : null,
        }));
      }
    } catch (err) {
      console.warn("Neon get enquiries failed, using local file:", err);
    }
  }

  const data = ensureDataFile() as any;
  return data.enquiries || [];
}

export async function toggleEnquiryHandled(id: string): Promise<boolean> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        UPDATE enquiries 
        SET handled_at = CASE WHEN handled_at IS NULL THEN NOW() ELSE NULL END
        WHERE id = ${id};
      `;
    } catch (err) {
      console.warn("Neon toggle enquiry failed:", err);
    }
  }

  const data = ensureDataFile() as any;
  if (data.enquiries) {
    const item = data.enquiries.find((e: any) => e.id === id);
    if (item) {
      item.handledAt = item.handledAt ? null : new Date().toISOString();
      persistFile(data);
    }
  }
  return true;
}

// ──────────────── TESTIMONIALS ────────────────

export async function getAllTestimonials(): Promise<TestimonialDTO[]> {
  const sql = getNeonSql();
  if (sql) {
    try {
      const rows = await sql`
        SELECT * FROM testimonials 
        WHERE visible = true 
        ORDER BY sort_order ASC, created_at ASC;
      `;
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          author: r.author,
          role: r.role || null,
          location: r.location || null,
          quote: r.quote,
          sortOrder: r.sort_order ?? 0,
          visible: Boolean(r.visible),
        }));
      }
    } catch (err) {
      console.warn("Neon get testimonials failed, using local store:", err);
    }
  }

  const data = ensureDataFile() as any;
  if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
    return data.testimonials.filter((t: any) => t.visible !== false);
  }
  return mockTestimonials;
}

export async function saveTestimonial(item: TestimonialDTO): Promise<TestimonialDTO> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        INSERT INTO testimonials (id, author, role, location, quote, sort_order, visible, updated_at)
        VALUES (
          ${item.id},
          ${item.author},
          ${item.role || null},
          ${item.location || null},
          ${item.quote},
          ${item.sortOrder ?? 0},
          ${item.visible !== false},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          author = EXCLUDED.author,
          role = EXCLUDED.role,
          location = EXCLUDED.location,
          quote = EXCLUDED.quote,
          sort_order = EXCLUDED.sort_order,
          visible = EXCLUDED.visible,
          updated_at = NOW();
      `;
    } catch (err) {
      console.warn("Neon save testimonial failed:", err);
    }
  }

  const data = ensureDataFile() as any;
  if (!data.testimonials) data.testimonials = [...mockTestimonials];
  const idx = data.testimonials.findIndex((t: any) => t.id === item.id);
  if (idx >= 0) {
    data.testimonials[idx] = { ...data.testimonials[idx], ...item };
  } else {
    data.testimonials.push(item);
  }
  persistFile(data);
  return item;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`DELETE FROM testimonials WHERE id = ${id};`;
    } catch (err) {
      console.warn("Neon delete testimonial failed:", err);
    }
  }

  const data = ensureDataFile() as any;
  if (data.testimonials) {
    data.testimonials = data.testimonials.filter((t: any) => t.id !== id);
    persistFile(data);
  }
  return true;
}
