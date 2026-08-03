/**
/**
 * Main Server - Pramuka Penegak Portal
 * Integrasi Google Sheets + Google Drive + Express
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// 1. Load credentials: prefer env var GOOGLE_SERVICE_ACCOUNT_JSON (raw JSON or base64), fallback to local credentials.json
let creds = null;
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  } catch (e) {
    try {
      creds = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString());
    } catch (err) {
      console.error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON env var:', err.message);
    }
  }
} else {
  try {
    creds = require('./credentials.json');
  } catch (e) {
    console.warn('No local credentials.json found and GOOGLE_SERVICE_ACCOUNT_JSON not set.');
  }
}

// Guard: if credentials missing or incomplete, print actionable error and exit.
// This prevents creating a JWT without key and avoids confusing runtime errors.
if (!creds || !creds.client_email || !creds.private_key) {
  console.error('Service account credentials not found or incomplete.');
  console.error('Options to fix:');
  console.error('  1) Set environment variable GOOGLE_SERVICE_ACCOUNT_JSON to the service account JSON (raw or base64).');
  console.error("  2) Place the downloaded JSON key at server/credentials.json (client_email and private_key required).");
  console.error('Also ensure the Google Sheet is shared to the service account (client_email) as Editor and set GOOGLE_SHEET_MEMBERS_ID.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Audit logging untuk mencatat aktivitas penting
app.use(require('./middleware/auditLog'));

// Rate limiting untuk API umum
const { apiLimiter, loginLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

// Serve static files dari folder public
app.use(express.static(path.join(__dirname, '../public')));

// Serve OpenAPI (Swagger UI) interaktif di /api/docs
try {
  const swaggerUi = require('swagger-ui-express');
  const openapiSpec = require('./openapi.json');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  // also keep raw JSON available
  app.get('/api/docs.json', (req, res) => res.json(openapiSpec));
} catch (e) {
  console.warn('swagger-ui-express tidak tersedia — jalankan `npm install swagger-ui-express` untuk mengaktifkan docs UI');
  app.get('/api/docs.json', (req, res) => {
    try {
      res.sendFile(path.join(__dirname, 'openapi.json'));
    } catch (e) {
      res.status(500).json({ error: 'Gagal memuat dokumentasi API' });
    }
  });
}

// Authentication middleware (JWT-based). Letakkan setelah docs agar docs publik dapat diakses.
app.use(require('./middleware/auth'));


// ---------------------------------------------------------
// KONFIGURASI SERVICE ACCOUNT & GOOGLE SHEETS
// ---------------------------------------------------------
// 2. Gunakan JWT dengan kredensial yang tersedia (env var atau file)
const serviceAccountAuth = new JWT({
  email: creds?.client_email,
  key: creds?.private_key ? creds.private_key.replace(/\\n/g, '\n') : undefined,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});

// Targetkan ID Dokumen Google Sheet Anggota
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_MEMBERS_ID, serviceAccountAuth);

// Fungsi untuk mengecek koneksi ke Google Sheets saat server menyala
async function testGoogleSheetsConnection() {
  try {
    console.log("Mencoba terhubung ke Google Sheets...");
    // Debug info
    console.log('Menggunakan service account:', creds && creds.client_email);
    console.log('Menggunakan GOOGLE_SHEET_MEMBERS_ID:', process.env.GOOGLE_SHEET_MEMBERS_ID);

    await doc.loadInfo(); 
    console.log("✅ Berhasil terhubung ke Google Sheets!");
    console.log(`✅ Judul Dokumen: ${doc.title}`);
    
    console.log("Daftar Tab yang tersedia di Spreadsheet:");
    for (let i = 0; i < doc.sheetCount; i++) {
        console.log(` - ${doc.sheetsByIndex[i].title}`);
    }
  } catch (error) {
    console.error("❌ Gagal terhubung ke Google Sheets.");
    // Debug: tampilkan detail error HTTP jika ada
    try {
      console.error('Full error stack:', error && error.stack);
      if (error && error.response) {
        console.error('HTTP status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      } else if (error && typeof error.toJSON === 'function') {
        console.error('Error JSON:', JSON.stringify(error.toJSON(), null, 2));
      } else {
        const props = Object.getOwnPropertyNames(error || {}).reduce((acc, k) => { acc[k] = error[k]; return acc; }, {});
        console.error('Error object props:', JSON.stringify(props, null, 2));
      }
    } catch (dumpErr) {
      console.error('Failed to stringify error:', dumpErr);
      console.error('Raw error:', error);
    }
    console.error('Pesan singkat:', error && error.message);
    console.error("Periksa hal berikut:\n  - Pastikan GOOGLE_SHEET_MEMBERS_ID diisi dengan ID yang benar.\n  - Pastikan Google Sheet dibagikan ke client_email dari service account sebagai Editor.\n  - Pastikan Google Sheets & Drive APIs diaktifkan pada project GCP yang sama.\n  - Pastikan service account tidak dinonaktifkan dan kredensial valid.\n  - Jika masalah berlanjut, periksa koneksi jaringan dan apakah firewall/proxy memblokir akses ke oauth2.googleapis.com");
  }
}
// ---------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------
// Pastikan folder 'routes' dan file-filenya sudah dibuat di dalam folder server
console.log('Mounting API route: /api/members -> ./routes/members');
app.use('/api/members', require('./routes/members'));
console.log('Mounting API route: /api/finances -> ./routes/finances');
app.use('/api/finances', require('./routes/finances'));
console.log('Mounting API route: /api/activities -> ./routes/activities');
app.use('/api/activities', require('./routes/activities'));
console.log('Mounting API route: /api/publications -> ./routes/publications');
app.use('/api/publications', require('./routes/publications'));
console.log('Mounting API route: /api/upload -> ./routes/upload');
app.use('/api/upload', require('./routes/upload'));
console.log('Mounting API route: /api/files -> ./routes/files');
app.use('/api/files', require('./routes/files'));
console.log('Mounting API route: /api/auth -> ./routes/auth');
app.use('/api/auth', require('./routes/auth'));
console.log('Mounting API route: /api/sync -> ./routes/sync');
app.use('/api/sync', require('./routes/sync'));
console.log('Finished mounting API routes: /api/members, /api/finances, /api/activities, /api/publications, /api/upload, /api/files, /api/auth, /api/sync');

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Pramuka Penegak Portal is running'
    });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Selamat Datang di API Portal Pramuka Penegak!');
});

// 404 Handler - log request for easier debugging
app.use((req, res) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl} - from ${req.ip}`);
    res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║   🚀 Pramuka Penegak Portal Running        ║
    ║   📍 http://localhost:${PORT}              ║
    ║   🔗 API: http://localhost:${PORT}/api     ║
    ║   ✅ Status: ONLINE                        ║
    ╚════════════════════════════════════════════╝
    `);
    
    // Jalankan tes koneksi Google Sheets
    testGoogleSheetsConnection();
});

module.exports = app;