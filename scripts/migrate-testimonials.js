const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

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

const INITIAL_TESTIMONIALS = [
  {
    id: "test_01",
    author: "Laurent Shaha",
    role: "Creative Director",
    location: "Northline Studio",
    quote: "Zetona brings a very distinctive eye to every portrait session. What stood out most was the attention to natural light and small, almost unnoticed expressions that ultimately became the strongest images of the shoot. The process was thoughtful, collaborative, and incredibly well considered from beginning to end.",
    sortOrder: 1,
    visible: true,
  },
  {
    id: "test_02",
    author: "Osasere Ighodaro",
    role: "Editorial Lead",
    location: "Edo Contemporary Arts",
    quote: "Working with Zetona in Benin City was an extraordinary experience. She has this calm mastery that immediately puts you at ease. The resulting portraits captured an elegance and quiet dignity that went far beyond what we had envisioned for the editorial feature.",
    sortOrder: 2,
    visible: true,
  },
  {
    id: "test_03",
    author: "Chukwuemeka Obi",
    role: "Founder & Curator",
    location: "Atelier V",
    quote: "Every frame felt like fine art. Zetona didn't just document the session; she sculpted atmosphere and contrast with studio light. Our brand campaign was celebrated across Lagos and Accra for its sheer cinematic depth.",
    sortOrder: 3,
    visible: true,
  },
  {
    id: "test_04",
    author: "Aminat Bello",
    role: "Fashion Stylist",
    location: "Benin City",
    quote: "The precision with lighting and skin tone fidelity is unmatched. She understands the weight of a gaze and the poetry of shadow. We booked two full-day studio sessions and the results were gallery-grade.",
    sortOrder: 4,
    visible: true,
  },
  {
    id: "test_05",
    author: "Kouame Diop",
    role: "Managing Director",
    location: "Pan-African Design Hub",
    quote: "A photographer who truly listens and creates an intimate, refined atmosphere. Our executive portrait suite received unanimous acclaim from our board and clients alike.",
    sortOrder: 5,
    visible: true,
  },
  {
    id: "test_06",
    author: "Efe Osazee",
    role: "Architect & Collector",
    location: "Benin City, Nigeria",
    quote: "Zetona is a generational talent. The sensitivity she brings to natural form and personal storytelling creates images you hold onto for decades.",
    sortOrder: 6,
    visible: true,
  },
];

async function main() {
  console.log('Ensuring testimonials table exists in Neon PostgreSQL...');
  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      role TEXT,
      location TEXT,
      quote TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      visible BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const rows = await sql`SELECT COUNT(*) FROM testimonials;`;
  console.log(`Current testimonials in Neon: ${rows[0].count}`);

  if (Number(rows[0].count) === 0) {
    console.log('Seeding initial testimonials into Neon...');
    for (const t of INITIAL_TESTIMONIALS) {
      await sql`
        INSERT INTO testimonials (id, author, role, location, quote, sort_order, visible)
        VALUES (${t.id}, ${t.author}, ${t.role}, ${t.location}, ${t.quote}, ${t.sortOrder}, ${t.visible})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log('Seeded initial testimonials successfully.');
  }

  // Also write to data/site-content.json
  const contentPath = path.resolve('data/site-content.json');
  if (fs.existsSync(contentPath)) {
    const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    if (!content.testimonials || content.testimonials.length === 0) {
      content.testimonials = INITIAL_TESTIMONIALS;
      fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
      console.log('Synchronized data/site-content.json testimonials.');
    }
  }
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
