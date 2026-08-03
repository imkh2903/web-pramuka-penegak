/**
 * Google Sheets Service
 * Handle pembacaan dan penulisan data ke Google Sheets
 */

const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

class GoogleSheetsService {
    constructor() {
        this.auth = null;
    }

    /**
     * Inisialisasi Authentication
     */
    async initAuth() {
        try {
            // Untuk development, gunakan API key atau service account
            // Sesuaikan dengan setup Anda di Google Cloud Console
            
            // Support full service account JSON via GOOGLE_SERVICE_ACCOUNT_JSON (raw JSON or base64)
            let email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'your-service-account@your-project.iam.gserviceaccount.com';
            let key = process.env.GOOGLE_PRIVATE_KEY || 'your-private-key';

            if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
                try {
                    const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                    email = parsed.client_email || email;
                    key = parsed.private_key || key;
                } catch (e) {
                    try {
                        const parsed = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString());
                        email = parsed.client_email || email;
                        key = parsed.private_key || key;
                    } catch (err) {
                        console.warn('Unable to parse GOOGLE_SERVICE_ACCOUNT_JSON');
                    }
                }
            }

            this.auth = new JWT({
                email: email,
                key: key?.replace(/\\n/g, '\n'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            console.log('✅ Google Sheets Auth initialized');
            return this.auth;
        } catch (error) {
            console.error('Error initializing auth:', error);
            throw error;
        }
    }

    /**
     * Ambil data dari Google Sheets
     */
    async getSheetData(sheetId, sheetName = 'Sheet1') {
        try {
            if (!sheetId) {
                throw new Error('Missing required parameter: spreadsheetId (sheetId). Pastikan GOOGLE_SHEET_* environment variable diset.');
            }

            const auth = await this.initAuth();
            const sheets = google.sheets({ version: 'v4', auth });
            
            // First attempt: use requested sheetName
            let response;
            try {
                response = await sheets.spreadsheets.values.get({
                    spreadsheetId: sheetId,
                    range: `'${sheetName}'!A:Z`,
                });
            } catch (err) {
                // If range parse error, try to auto-detect sheet title (case-insensitive) and retry
                const msg = err && (err.message || err.toString());
                if (msg && msg.toLowerCase().includes('unable to parse range')) {
                    console.warn(`Requested sheet '${sheetName}' not found in spreadsheet; attempting to detect matching sheet title...`);
                    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties.title' });
                    const titles = (meta.data.sheets || []).map(s => s.properties && s.properties.title).filter(Boolean);

                    // Try exact case-insensitive match, then includes
                    let candidate = titles.find(t => t.toLowerCase() === sheetName.toLowerCase());
                    if (!candidate) candidate = titles.find(t => t.toLowerCase().includes(sheetName.toLowerCase()));
                    if (!candidate) candidate = titles.find(t => sheetName.toLowerCase().includes(t.toLowerCase()));

                    if (candidate) {
                        console.log(`Auto-detected sheet title: '${candidate}' — retrying read`);
                        response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `'${candidate}'!A:Z` });
                    } else if (titles.length > 0) {
                        // fallback to first sheet
                        console.log(`No matching sheet title found. Falling back to first sheet: '${titles[0]}'`);
                        response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `'${titles[0]}'!A:Z` });
                    } else {
                        throw err; // rethrow original
                    }
                } else {
                    throw err;
                }
            }

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                console.log(`Tidak ada data di sheet ${sheetName}`);
                return [];
            }

            // Konversi ke format JSON
            const headers = rows[0];
            const data = rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });

            return data;
        } catch (error) {
            console.error('Error mengambil data sheet:', error && (error.stack || error.message) || error);
            throw error;
        }
    }

    /**
     * Tambah baris data ke Google Sheets
     */
    async appendSheetData(sheetId, sheetName = 'Sheet1', values = []) {
        try {
            if (!sheetId) {
                throw new Error('Missing required parameter: spreadsheetId (sheetId). Pastikan GOOGLE_SHEET_* environment variable diset.');
            }

            const auth = await this.initAuth();
            const sheets = google.sheets({ version: 'v4', auth });

            const response = await sheets.spreadsheets.values.append({
                spreadsheetId: sheetId,
                range: `'${sheetName}'!A:Z`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [values],
                },
            });

            console.log(`✅ Data berhasil ditambahkan ke ${sheetName}`);
            return response.data;
        } catch (error) {
            console.error('Error menambah data ke sheet:', error && (error.stack || error.message) || error);
            throw error;
        }
    }

    /**
     * Update data di Google Sheets
     */
    async updateSheetData(sheetId, sheetName = 'Sheet1', rowIndex = 2, values = []) {
        try {
            if (!sheetId) {
                throw new Error('Missing required parameter: spreadsheetId (sheetId). Pastikan GOOGLE_SHEET_* environment variable diset.');
            }

            const auth = await this.initAuth();
            const sheets = google.sheets({ version: 'v4', auth });

            const response = await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `'${sheetName}'!A${rowIndex}:Z${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [values],
                },
            });

            console.log(`✅ Data di baris ${rowIndex} berhasil diperbarui`);
            return response.data;
        } catch (error) {
            console.error('Error mengupdate data sheet:', error && (error.stack || error.message) || error);
            throw error;
        }
    }

    /**
     * Hitung summary dari kolom numeric
     */
    getSummary(data, field) {
        return data.reduce((total, row) => {
            return total + (parseFloat(row[field]) || 0);
        }, 0);
    }

    /**
     * Hitung jumlah baris
     */
    getCount(data) {
        return data.length;
    }
}

module.exports = new GoogleSheetsService();
