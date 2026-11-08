const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// Load environment variables from .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let dbUrl = '';
for (const line of envContent.split(/\r?\n/)) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrate() {
  console.log('--- Step 1: Creating Neon Postgres tables ---');

  await sql`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      cover_photo_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
      title TEXT,
      alt TEXT,
      caption TEXT,
      display_key TEXT NOT NULL,
      original_key TEXT,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      bytes INTEGER,
      mime TEXT,
      thumbhash TEXT,
      dominant_color TEXT,
      focal_x REAL NOT NULL DEFAULT 0.5,
      focal_y REAL NOT NULL DEFAULT 0.35,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      featured_home BOOLEAN NOT NULL DEFAULT false,
      featured_about BOOLEAN NOT NULL DEFAULT false,
      taken_at TEXT,
      content_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      trashed_at TIMESTAMPTZ
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      headline TEXT,
      subline TEXT,
      bio TEXT,
      show_stats BOOLEAN NOT NULL DEFAULT false,
      show_awards BOOLEAN NOT NULL DEFAULT false,
      show_testimonials BOOLEAN NOT NULL DEFAULT false,
      home_selector_mode TEXT NOT NULL DEFAULT 'collections',
      home_variant TEXT NOT NULL DEFAULT 'collage',
      instagram_url TEXT,
      facebook_url TEXT,
      tiktok_url TEXT,
      x_url TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      session_type TEXT,
      message TEXT NOT NULL,
      email_status TEXT NOT NULL DEFAULT 'pending',
      ip_hash TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      handled_at TIMESTAMPTZ
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit (
      id TEXT PRIMARY KEY,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_id TEXT,
      meta TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('Tables created or verified in Neon Postgres.');

  // Step 2: Seed data if empty
  console.log('--- Step 2: Checking existing data & seeding ---');
  const dataPath = path.resolve('data/site-content.json');
  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, 'utf8');
    const localData = JSON.parse(raw);

    // Seed collections
    const existingCollections = await sql`SELECT COUNT(*)::int as count FROM collections;`;
    if (existingCollections[0].count === 0 && localData.collections) {
      console.log(`Seeding ${localData.collections.length} collections...`);
      for (const col of localData.collections) {
        await sql`
          INSERT INTO collections (id, slug, title, description, cover_photo_id, sort_order, status)
          VALUES (${col.id}, ${col.slug}, ${col.title}, ${col.description || null}, ${col.coverPhotoId || null}, ${col.sortOrder || 0}, 'published')
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Seed photos
    const existingPhotos = await sql`SELECT COUNT(*)::int as count FROM photos;`;
    if (existingPhotos[0].count === 0 && localData.photos) {
      console.log(`Seeding ${localData.photos.length} photos...`);
      for (const p of localData.photos) {
        await sql`
          INSERT INTO photos (
            id, collection_id, title, alt, caption, display_key, original_key,
            width, height, bytes, mime, thumbhash, dominant_color,
            focal_x, focal_y, sort_order, status, featured_home, featured_about
          ) VALUES (
            ${p.id},
            ${p.collection ? p.collection.id : null},
            ${p.title || null},
            ${p.alt || null},
            ${p.caption || null},
            ${p.displayKey},
            ${p.originalKey || null},
            ${p.width || 1200},
            ${p.height || 1500},
            ${p.bytes || null},
            ${p.mime || null},
            ${p.thumbhash || null},
            ${p.dominantColor || null},
            ${p.focal?.x ?? 0.5},
            ${p.focal?.y ?? 0.35},
            ${p.sortOrder || 0},
            'published',
            ${p.featuredHome ?? false},
            ${p.featuredAbout ?? false}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Seed settings
    const existingSettings = await sql`SELECT COUNT(*)::int as count FROM site_settings WHERE id = 1;`;
    if (existingSettings[0].count === 0 && localData.settings) {
      console.log('Seeding site settings...');
      const s = localData.settings;
      await sql`
        INSERT INTO site_settings (
          id, headline, subline, bio, show_stats, show_awards, show_testimonials,
          home_selector_mode, home_variant, instagram_url, facebook_url, tiktok_url, x_url
        ) VALUES (
          1,
          ${s.headline || null},
          ${s.subline || null},
          ${s.bio || null},
          ${s.showStats ?? false},
          ${s.showAwards ?? false},
          ${s.showTestimonials ?? false},
          ${s.homeSelectorMode || 'collections'},
          ${s.homeVariant || 'collage'},
          ${s.instagramUrl || null},
          ${s.facebookUrl || null},
          ${s.tiktokUrl || null},
          ${s.xUrl || null}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }

  // Verify counts
  const finalCols = await sql`SELECT COUNT(*)::int as count FROM collections;`;
  const finalPhotos = await sql`SELECT COUNT(*)::int as count FROM photos;`;
  const finalSettings = await sql`SELECT * FROM site_settings WHERE id = 1;`;

  console.log('--- Migration & Seeding Complete ---');
  console.log(`Collections in Neon: ${finalCols[0].count}`);
  console.log(`Photos in Neon: ${finalPhotos[0].count}`);
  console.log(`Site settings in Neon headline: "${finalSettings[0]?.headline || ''}"`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
