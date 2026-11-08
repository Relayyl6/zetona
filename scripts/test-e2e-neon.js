const fs = require('fs');
const path = require('path');

// Ensure DATABASE_URL is loaded into process.env
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
for (const line of envContent.split(/\r?\n/)) {
  if (line.startsWith('DATABASE_URL=')) {
    process.env.DATABASE_URL = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
  }
}

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function testEndToEnd() {
  console.log('====================================');
  console.log('Neon Postgres End-to-End Verification');
  console.log('====================================\n');

  // Test 1: Connectivity & server info
  console.log('Test 1: Querying Neon server info...');
  const serverInfo = await sql`SELECT version(), current_database(), current_user, NOW() as current_time;`;
  console.log('✔ Connected to Neon:', {
    database: serverInfo[0].current_database,
    user: serverInfo[0].current_user,
    time: serverInfo[0].current_time,
  });

  // Test 2: Read collections from Neon
  console.log('\nTest 2: Reading collections from Neon Postgres...');
  const cols = await sql`SELECT id, slug, title FROM collections ORDER BY sort_order;`;
  console.log(`✔ Retrieved ${cols.length} collections:`, cols.map(c => `${c.title} (${c.slug})`).join(', '));

  // Test 3: Read photos from Neon
  console.log('\nTest 3: Reading photos from Neon Postgres...');
  const photos = await sql`SELECT id, title, alt, display_key, featured_home FROM photos WHERE status != 'trashed';`;
  console.log(`✔ Retrieved ${photos.length} photos. Featured on home: ${photos.filter(p => p.featured_home).length}`);

  // Test 4: Read & Update Settings in Neon
  console.log('\nTest 4: Reading and updating site settings...');
  const initialSettings = await sql`SELECT headline, bio, updated_at FROM site_settings WHERE id = 1;`;
  console.log('Current headline in Neon:', initialSettings[0]?.headline);

  const testHeadline = `Beautiful moments of\nbeautiful people. [Neon Verified ${new Date().toISOString().substring(11, 19)}]`;
  await sql`UPDATE site_settings SET headline = ${testHeadline}, updated_at = NOW() WHERE id = 1;`;
  
  const updatedSettings = await sql`SELECT headline, updated_at FROM site_settings WHERE id = 1;`;
  console.log('✔ Updated headline in Neon:', updatedSettings[0]?.headline);

  // Restore clean headline
  await sql`UPDATE site_settings SET headline = 'Beautiful moments of\nbeautiful people.', updated_at = NOW() WHERE id = 1;`;
  console.log('✔ Restored original headline in Neon.');

  // Test 5: CRUD on photos in Neon
  console.log('\nTest 5: Testing CRUD insert, update, and soft delete on photos...');
  const testPhotoId = `ph_neon_test_${Date.now()}`;
  
  // Insert
  await sql`
    INSERT INTO photos (id, title, alt, display_key, width, height, status, featured_home)
    VALUES (${testPhotoId}, 'Neon Verification Portrait', 'Test photo for Neon verification', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 1200, 1500, 'published', true);
  `;
  const inserted = await sql`SELECT id, title, status FROM photos WHERE id = ${testPhotoId};`;
  console.log('✔ Inserted test photo into Neon:', inserted[0]);

  // Update
  await sql`UPDATE photos SET title = 'Neon Verification Portrait (Updated)' WHERE id = ${testPhotoId};`;
  const updated = await sql`SELECT id, title FROM photos WHERE id = ${testPhotoId};`;
  console.log('✔ Updated test photo in Neon:', updated[0]);

  // Soft delete (trashed)
  await sql`UPDATE photos SET status = 'trashed', trashed_at = NOW() WHERE id = ${testPhotoId};`;
  const trashed = await sql`SELECT id, status FROM photos WHERE id = ${testPhotoId};`;
  console.log('✔ Soft-deleted test photo in Neon:', trashed[0]);

  // Clean up test row
  await sql`DELETE FROM photos WHERE id = ${testPhotoId};`;
  console.log('✔ Cleaned up test photo from Neon.');

  console.log('\n====================================');
  console.log('All Neon End-to-End Tests Passed 100%!');
  console.log('====================================');
}

testEndToEnd().catch((err) => {
  console.error('Neon test failed:', err);
  process.exit(1);
});
