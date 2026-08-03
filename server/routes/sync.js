/**
 * API Route - Sync from Google Sheets
 * POST /api/sync/sheets  -> force reload data from Google Sheets
 * GET  /api/sync/last    -> return last sync metadata
 * Protected: requireRole(['Admin'])
 */

const express = require('express');
const router = express.Router();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const { requireRole } = require('../middleware/rbac');

// Helper: load service account credentials (env var or server/credentials.json)
function loadServiceAccountCreds() {
  let creds = null;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      try {
        creds = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString());
      } catch (err) {
        throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON env var: ' + err.message);
      }
    }
  } else {
    try {
      creds = require('../credentials.json');
    } catch (e) {
      throw new Error('No local credentials.json found and GOOGLE_SERVICE_ACCOUNT_JSON not set.');
    }
  }

  if (!creds || !creds.client_email || !creds.private_key) {
    throw new Error('Service account credentials not found or incomplete. Ensure client_email and private_key exist.');
  }

  return creds;
}

// POST /sheets -> force sync
router.post('/sheets', requireRole(['Admin']), async (req, res) => {
  try {
    const creds = loadServiceAccountCreds();
    const sheetId = process.env.GOOGLE_SHEET_MEMBERS_ID;
    if (!sheetId) return res.status(400).json({ status: 'error', message: 'GOOGLE_SHEET_MEMBERS_ID is not set' });

    const auth = new JWT({
      email: creds.client_email,
      key: creds.private_key ? creds.private_key.replace(/\\n/g, '\n') : undefined,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    const titles = doc.sheetsByIndex.map(s => s.title);

    // Try to read 'Anggota' sheet rows if it exists
    let anggotaRows = [];
    const anggotaSheet = doc.sheetsByTitle['Anggota'] || doc.sheetsByIndex[0];
    if (anggotaSheet) {
      const rows = await anggotaSheet.getRows();
      anggotaRows = rows.map(r => r._rawData || r); // best-effort
    }

    // Persist cache and last-sync metadata to server/data
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const now = new Date().toISOString();
    const meta = {
      timestamp: now,
      sheetId,
      titles,
      anggotaCount: anggotaRows.length
    };
    fs.writeFileSync(path.join(dataDir, 'last_sync.json'), JSON.stringify(meta, null, 2));
    try {
      fs.writeFileSync(path.join(dataDir, 'members_cache.json'), JSON.stringify(anggotaRows, null, 2));
    } catch (e) {
      // non-fatal
      console.warn('Failed to write members_cache.json:', e.message);
    }

    return res.json({ status: 'success', message: 'Sync completed', meta });
  } catch (error) {
    console.error('Sync error:', error && error.stack || error);
    return res.status(500).json({ status: 'error', message: 'Failed to sync from Google Sheets', error: error.message });
  }
});

// GET /last -> last sync info (Admin)
router.get('/last', requireRole(['Admin']), (req, res) => {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'last_sync.json');
    if (!fs.existsSync(dataPath)) return res.status(404).json({ status: 'error', message: 'No sync metadata found' });
    const meta = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return res.json({ status: 'success', meta });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to read last sync', error: error.message });
  }
});

module.exports = router;
