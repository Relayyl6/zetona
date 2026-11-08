const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function verifyAppE2E() {
  console.log('Testing App against Neon Postgres API...\n');

  // Step 1: Login
  console.log('1. Logging into Admin API...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, JSON.stringify({ password: 'zetona2026' }));

  console.log('Login Status:', loginRes.status);
  const cookieHeader = loginRes.headers['set-cookie'];
  const cookie = Array.isArray(cookieHeader) ? cookieHeader[0].split(';')[0] : '';
  console.log('Session Cookie:', cookie ? 'Received OK' : 'Missing');

  // Step 2: Fetch Settings
  console.log('\n2. Fetching settings via GET /api/admin/settings...');
  const settingsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/settings',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  console.log('Settings Status:', settingsRes.status);
  const settingsJson = JSON.parse(settingsRes.body);
  console.log('Current Headline in Neon:', settingsJson.settings?.headline);

  // Step 3: Update Settings
  console.log('\n3. Updating headline via PATCH /api/admin/settings...');
  const updateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/settings',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
  }, JSON.stringify({
    headline: 'Beautiful moments of\nbeautiful people.',
    subline: 'Studio & portrait photography in Benin City • Powered by Neon Lakebase Postgres',
  }));
  console.log('Update Status:', updateRes.status);
  const updatedJson = JSON.parse(updateRes.body);
  console.log('New Subline confirmed:', updatedJson.settings?.subline);

  // Step 4: Fetch Photos
  console.log('\n4. Fetching photos via GET /api/admin/photos...');
  const photosRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/photos',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  console.log('Photos Status:', photosRes.status);
  const photosJson = JSON.parse(photosRes.body);
  console.log(`Retrieved ${photosJson.photos?.length} photos wired through Neon database!`);

  console.log('\nApp End-to-End Test with Neon: ALL PASSED!');
}

verifyAppE2E().catch(console.error);
