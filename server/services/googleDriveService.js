/**
 * Google Drive Service
 * Handle upload, download, dan manajemen file di Google Drive
 */

const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

class GoogleDriveService {
    constructor() {
        this.auth = null;
    }

    /**
     * Inisialisasi Authentication
     */
    async initAuth() {
        try {
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
                scopes: ['https://www.googleapis.com/auth/drive'],
            });

            console.log('✅ Google Drive Auth initialized');
            return this.auth;
        } catch (error) {
            console.error('Error initializing Drive auth:', error);
            throw error;
        }
    }

    /**
     * Upload file ke Google Drive
     */
    async uploadFile(filePath, fileName, folderId) {
        try {
            const auth = await this.initAuth();
            const drive = google.drive({ version: 'v3', auth });

            const fileMetadata = {
                name: fileName,
                mimeType: this.getMimeType(fileName),
                parents: [folderId],
            };

            const media = {
                mimeType: this.getMimeType(fileName),
                body: fs.createReadStream(filePath),
            };

            const response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink, name',
            });

            console.log(`✅ File ${fileName} berhasil diupload ke Drive`);
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Download file dari Google Drive
     */
    async downloadFile(fileId, outputPath) {
        try {
            const auth = await this.initAuth();
            const drive = google.drive({ version: 'v3', auth });

            const dest = fs.createWriteStream(outputPath);

            return await new Promise((resolve, reject) => {
                drive.files.get(
                    { fileId: fileId, alt: 'media' },
                    { responseType: 'stream' },
                    (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            res.data
                                .on('end', () => {
                                    console.log(`✅ File ${fileId} berhasil didownload`);
                                    resolve(outputPath);
                                })
                                .on('error', (err) => {
                                    reject(err);
                                })
                                .pipe(dest);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    /**
     * List file dalam folder Drive
     */
    async listFilesInFolder(folderId) {
        try {
            const auth = await this.initAuth();
            const drive = google.drive({ version: 'v3', auth });

            const response = await drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                spaces: 'drive',
                fields: 'files(id, name, mimeType, webViewLink, createdTime, size)',
                pageSize: 50,
            });

            return response.data.files || [];
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    }

    /**
     * Delete file dari Google Drive
     */
    async deleteFile(fileId) {
        try {
            const auth = await this.initAuth();
            const drive = google.drive({ version: 'v3', auth });

            await drive.files.delete({
                fileId: fileId,
            });

            console.log(`✅ File ${fileId} berhasil dihapus dari Drive`);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * Get MIME type berdasarkan ekstensi file
     */
    getMimeType(fileName) {
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.txt': 'text/plain',
            '.zip': 'application/zip',
        };

        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Share file ke publik (optional)
     */
    async shareFile(fileId, emailAddress = null) {
        try {
            const auth = await this.initAuth();
            const drive = google.drive({ version: 'v3', auth });

            let permission = {
                type: 'anyone',
                role: 'reader',
            };

            if (emailAddress) {
                permission = {
                    type: 'user',
                    role: 'reader',
                    emailAddress: emailAddress,
                };
            }

            const response = await drive.permissions.create({
                fileId: fileId,
                resource: permission,
            });

            console.log(`✅ File ${fileId} berhasil dishare`);
            return response.data;
        } catch (error) {
            console.error('Error sharing file:', error);
            throw error;
        }
    }
}

module.exports = new GoogleDriveService();
