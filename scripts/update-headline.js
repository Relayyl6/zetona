const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// 1. Update data/site-content.json
const dataPath = path.resolve('data/site-content.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
data.settings.headline = 'Beautiful moments\nof beautiful people.';
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('✔ Local data file updated with 2-line headline.');

// 2. Update Neon Postgres
const envContent = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of envContent.split(/\r?\n/)) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (dbUrl) {
  const sql = neon(dbUrl);
  sql`UPDATE site_settings SET headline = 'Beautiful moments\nof beautiful people.', updated_at = NOW() WHERE id = 1;`
    .then(() => console.log('✔ Neon Postgres updated with 2-line headline.'))
    .catch(console.error);
}
