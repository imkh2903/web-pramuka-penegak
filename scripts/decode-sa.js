#!/usr/bin/env node
// Usage: set env GOOGLE_SERVICE_ACCOUNT_JSON (raw JSON or base64), then run `node scripts/decode-sa.js` or `node scripts/decode-sa.js --write` to write temporary server/credentials.json
const fs = require('fs');
const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!b64) {
  console.error('Environment variable GOOGLE_SERVICE_ACCOUNT_JSON is not set');
  process.exit(1);
}
let json = null;
try {
  json = JSON.parse(b64);
} catch (e) {
  try {
    json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch (err) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON as raw JSON or base64 JSON');
    process.exit(2);
  }
}
console.log('Service account client_email:', json.client_email || '(missing)');
if (process.argv.includes('--write')) {
  const out = 'server/credentials.json';
  fs.mkdirSync('server', { recursive: true });
  fs.writeFileSync(out, JSON.stringify(json, null, 2), { mode: 0o600 });
  console.log('Wrote', out, '\nWARNING: Remove the file after testing. Do NOT commit to git.');
}
process.exit(0);
