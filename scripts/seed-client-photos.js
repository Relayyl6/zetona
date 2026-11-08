const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MANIFEST_PATH = path.join(__dirname, "../data/drive-upload-manifest.json");
const SITE_CONTENT_PATH = path.join(__dirname, "../data/site-content.json");

// Read .env.local
const envFile = path.join(__dirname, "../.env.local");
const env = Object.fromEntries(
  fs.readFileSync(envFile, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, "")];
    })
);

async function getGoogleDriveFiles() {
  const folderUrl = "https://drive.google.com/drive/folders/1b_tM8slqa7MNiPH2ULWVnVug3abSSu-9";
  console.log("Fetching Google Drive folder listing...");
  const res = await fetch(folderUrl);
  const html = await res.text();
  const match = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'(.*?)';/);
  if (!match) throw new Error("Could not find _DRIVE_ivd in Google Drive page");

  const decoded = unescape(match[1].replace(/\\x([0-9A-Fa-f]{2})/g, "%$1"));
  const data = JSON.parse(decoded);

  const map = new Map();
  function walk(arr) {
    if (!Array.isArray(arr)) return;
    if (
      typeof arr[0] === "string" &&
      typeof arr[2] === "string" &&
      typeof arr[3] === "string" &&
      arr[3].startsWith("image/")
    ) {
      if (!map.has(arr[0])) {
        map.set(arr[0], {
          id: arr[0],
          name: arr[2],
          mime: arr[3],
          size: arr[13] || arr[27] || 0,
        });
      }
      return;
    }
    for (const item of arr) {
      walk(item);
    }
  }
  walk(data);

  const files = Array.from(map.values());
  console.log(`Found ${files.length} unique image files in Google Drive folder.`);
  return files;
}

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    } catch {
      return {};
    }
  }
  return {};
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
}

async function uploadBufferToCloudinary(buffer, filename) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "zetona";
  const paramsToSign = { folder, timestamp };
  const sortedKeys = Object.keys(paramsToSign).sort();
  const signatureString = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join("&") + env.CLOUDINARY_API_SECRET;
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  const fd = new FormData();
  const blob = new Blob([buffer]);
  fd.append("file", blob, filename);
  fd.append("api_key", env.CLOUDINARY_API_KEY);
  fd.append("timestamp", timestamp);
  fd.append("folder", folder);
  fd.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

async function downloadDriveFile(fileId) {
  const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
  const res = await fetch(driveUrl);
  if (!res.ok) throw new Error(`Drive download failed for ${fileId} (${res.status})`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function syncAllToCloudinary(files) {
  const manifest = loadManifest();

  // Check if first test file is already uploaded
  if (!manifest["15TbDZOYDA7WEQJNiVs_a5fZWu03tBw3s"]) {
    manifest["15TbDZOYDA7WEQJNiVs_a5fZWu03tBw3s"] = {
      name: "_MG_7564.jpg",
      secure_url: "https://res.cloudinary.com/drgwnkllv/image/upload/v1794171645/zetona/ilzulvfc226tqfjr5jyr.jpg",
      width: 4034,
      height: 6051,
      public_id: "zetona/ilzulvfc226tqfjr5jyr",
      format: "jpg",
    };
  }

  let count = 0;
  const concurrency = 3;

  for (let i = 0; i < files.length; i += concurrency) {
    const chunk = files.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (file) => {
        if (manifest[file.id] && manifest[file.id].secure_url) {
          count++;
          console.log(`[${count}/${files.length}] Already uploaded: ${file.name}`);
          return;
        }

        try {
          console.log(`[${count + 1}/${files.length}] Downloading: ${file.name}...`);
          const buf = await downloadDriveFile(file.id);
          console.log(`[${count + 1}/${files.length}] Uploading to Cloudinary: ${file.name} (${buf.length} bytes)...`);
          const cRes = await uploadBufferToCloudinary(buf, file.name);

          manifest[file.id] = {
            name: file.name,
            secure_url: cRes.secure_url,
            width: cRes.width,
            height: cRes.height,
            public_id: cRes.public_id,
            format: cRes.format,
          };
          saveManifest(manifest);
          count++;
          console.log(`[${count}/${files.length}] DONE: ${file.name} -> ${cRes.secure_url}`);
        } catch (err) {
          console.error(`Failed ${file.name}:`, err.message);
        }
      })
    );
  }

  console.log(`All uploads complete! Total in manifest: ${Object.keys(manifest).length}`);
  return manifest;
}

// Collections definition
const COLLECTIONS = [
  {
    id: "col_portraits_01",
    slug: "portraits",
    title: "Portraits",
    description: "Intimate studio and environmental portraiture capturing authentic character, depth, and human emotion.",
  },
  {
    id: "col_studio_02",
    slug: "studio",
    title: "Studio Sessions",
    description: "High-end studio sessions featuring structured light, vivid contrast, and refined composition.",
  },
  {
    id: "col_editorial_03",
    slug: "editorial",
    title: "Editorial & Mood",
    description: "Narrative-driven editorial and mood photography blending styling, fashion, and contemporary artistry.",
  },
];

const CURATED_TITLES = [
  "Aura", "Presence", "Silhouettes of Grace", "Vesper", "Golden Hour Study",
  "Solitude", "Lumina", "Charcoal & Velvet", "Echoes", "Gaze",
  "Nocturne", "Form & Light", "Serenade", "Stillness", "Resonance",
  "Portraits of Benin", "Illusion", "Ethereal", "Contour", "Elegance",
  "Halcyon", "Monolith", "Shadowplay", "Reflections", "Sovereign",
  "Chiaroscuro", "The Quiet Frame", "Dusk", "Solace", "Oasis",
  "Velvet Tone", "Harmattan Light", "Poise", "Amber", "Reverie",
  "Symmetry", "Eminence", "Zephyr", "Cadence", "Verve",
  "Ivory & Obsidian", "Timeless", "Aperture", "Spectra", "Luminescence",
  "Starlight", "Sublime", "Grace Note", "Kinship", "Radiance"
];

function titleFromFilename(filename, index) {
  if (index !== undefined && CURATED_TITLES[index % CURATED_TITLES.length]) {
    return CURATED_TITLES[index % CURATED_TITLES.length];
  }
  return (filename || "Untitled").replace(/\.[^/.]+$/, "");
}

async function buildDatabaseRecords(manifest) {
  const fileEntries = Object.entries(manifest).filter(([_, v]) => v && v.secure_url);

  console.log(`Building database records for ${fileEntries.length} photos...`);

  // Distribute photos across the 3 collections:
  // col_portraits_01 (~17 photos)
  // col_studio_02 (~17 photos)
  // col_editorial_03 (~16 photos)
  const photos = [];

  for (let idx = 0; idx < fileEntries.length; idx++) {
    const [driveId, item] = fileEntries[idx];
    const colIndex = idx % 3;
    const col = COLLECTIONS[colIndex];
    const photoId = `ph_client_${idx + 1}_${item.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 15)}`;
    const title = titleFromFilename(item.name, idx);

    // Exactly 10 featured home photos, as in the previous site state
    const featuredHome = idx < 10;
    // 4 featured about photos
    const featuredAbout = idx >= 10 && idx < 14;

    const photo = {
      id: photoId,
      title,
      alt: `${title} - Studio and portrait photography by Zetona_E in Benin City (${item.name})`,
      caption: `Original client session photography by Zetona_E, captured in Benin City.`,
      width: item.width || 1200,
      height: item.height || 1500,
      displayKey: item.secure_url,
      dominantColor: "#121212",
      focal: { x: 0.5, y: 0.35 },
      featuredHome,
      featuredAbout,
      status: "published",
      collectionId: col.id,
      sortOrder: idx + 1,
      collection: {
        id: col.id,
        slug: col.slug,
        title: col.title,
      },
    };
    photos.push(photo);
  }

  // Update collections with cover photos from each section
  const collectionsWithCovers = COLLECTIONS.map((c) => {
    const colPhotos = photos.filter((p) => p.collectionId === c.id);
    const cover = colPhotos[0] || photos[0];
    return {
      ...c,
      coverPhotoId: cover?.id,
      coverPhoto: cover,
      photoCount: colPhotos.length,
    };
  });

  // Read current site content for settings preservation
  let settings = {};
  if (fs.existsSync(SITE_CONTENT_PATH)) {
    try {
      const current = JSON.parse(fs.readFileSync(SITE_CONTENT_PATH, "utf8"));
      settings = current.settings || {};
    } catch {}
  }

  const updatedSiteContent = {
    settings,
    collections: collectionsWithCovers,
    photos,
  };

  fs.writeFileSync(SITE_CONTENT_PATH, JSON.stringify(updatedSiteContent, null, 2), "utf8");
  console.log(`Saved updated site content to ${SITE_CONTENT_PATH}: ${photos.length} photos, ${collectionsWithCovers.length} collections.`);

  // Attempt Neon update if available
  if (env.DATABASE_URL) {
    try {
      const { neon } = require("@neondatabase/serverless");
      const sql = neon(env.DATABASE_URL);

      console.log("Updating Neon database...");

      // 1. First upsert all photos
      for (const p of photos) {
        await sql`
          INSERT INTO photos (
            id, title, alt, caption, display_key, width, height, dominant_color,
            focal_x, focal_y, featured_home, featured_about, status, collection_id, sort_order, created_at, updated_at
          ) VALUES (
            ${p.id},
            ${p.title},
            ${p.alt},
            ${p.caption},
            ${p.displayKey},
            ${p.width},
            ${p.height},
            ${p.dominantColor},
            ${p.focal.x},
            ${p.focal.y},
            ${p.featuredHome},
            ${p.featuredAbout},
            ${p.status},
            ${p.collectionId},
            ${p.sortOrder},
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            alt = EXCLUDED.alt,
            caption = EXCLUDED.caption,
            display_key = EXCLUDED.display_key,
            width = EXCLUDED.width,
            height = EXCLUDED.height,
            featured_home = EXCLUDED.featured_home,
            featured_about = EXCLUDED.featured_about,
            status = EXCLUDED.status,
            collection_id = EXCLUDED.collection_id,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW();
        `;
      }

      // 2. Update collections with valid cover_photo_id
      for (const col of collectionsWithCovers) {
        await sql`
          INSERT INTO collections (id, slug, title, description, cover_photo_id, updated_at)
          VALUES (${col.id}, ${col.slug}, ${col.title}, ${col.description}, ${col.coverPhotoId}, NOW())
          ON CONFLICT (id) DO UPDATE SET
            slug = EXCLUDED.slug,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            cover_photo_id = EXCLUDED.cover_photo_id,
            updated_at = NOW();
        `;
      }

      // 3. Delete old mock photos
      const newIds = photos.map((p) => p.id);
      await sql`DELETE FROM photos WHERE id NOT IN ${sql(newIds)};`;

      console.log("Neon database successfully synchronized with new photos!");
    } catch (dbErr) {
      console.warn("Neon DB update warning (will rely on local JSON store):", dbErr.message);
    }
  }

  return { photos, collections: collectionsWithCovers };
}

async function main() {
  const files = await getGoogleDriveFiles();
  const manifest = await syncAllToCloudinary(files);
  await buildDatabaseRecords(manifest);
  console.log("All done!");
}

main().catch(console.error);
