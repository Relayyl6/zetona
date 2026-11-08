const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// Read .env.local manually
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
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  console.log('Connecting to Neon with DATABASE_URL...');
  const result = await sql`SELECT version(), current_database(), current_user, inet_server_addr() as host;`;
  console.log('Neon Postgres connected successfully:', result);
}

main().catch((err) => {
  console.error('Connection failed:', err);
  process.exit(1);
});
