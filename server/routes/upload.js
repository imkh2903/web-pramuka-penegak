/**
 * API Routes - Upload File
 * Handle upload file ke Google Drive
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const googleDriveService = require('../services/googleDriveService');
const { requireRole } = require('../middleware/rbac');

// Setup multer untuk temporary file storage
const upload = multer({
    dest: path.join(__dirname, '../../uploads/temp'),
    limits: { fileSize: 52428800 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedExts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        const ext = path.extname(file.originalname).slice(1).toLowerCase();
        
        if (allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'));
        }
    }
});

// POST - Upload bukti tugas/portfolio
router.post('/bukti-tugas', requireRole(['Admin','Juru Uang','Pembina']), upload.single('file'), async (req, res) => {
    try {
        const { namaAnggota, jenisTugas } = req.body;
        
        if (!req.file || !namaAnggota) {
            return res.status(400).json({
                status: 'error',
                message: 'File dan nama anggota diperlukan'
            });
        }
        
        const folderId = process.env.GOOGLE_DRIVE_BUKTI_FOLDER;
        if (!folderId) {
            // Hapus temp file
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ status: 'error', message: 'GOOGLE_DRIVE_BUKTI_FOLDER belum diset di environment' });
        }

        const fileName = `${namaAnggota}_${jenisTugas}_${Date.now()}${path.extname(req.file.originalname)}`;
        
        // Upload ke Google Drive
        const result = await googleDriveService.uploadFile(
            req.file.path,
            fileName,
            folderId
        );
        
        // Hapus file temporary
        fs.unlinkSync(req.file.path);
        
        res.json({
            status: 'success',
            message: 'File berhasil diupload',
            data: {
                fileName: result.name,
                fileId: result.id,
                link: result.webViewLink,
                uploadedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        // Hapus file temporary jika error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengupload file',
            error: error.message
        });
    }
});

// POST - Upload dokumen resmi
router.post('/dokumen-resmi', requireRole(['Admin','Pembina']), upload.single('file'), async (req, res) => {
    try {
        const { namaFile, kategori } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'File diperlukan'
            });
        }
        
        const folderId = process.env.GOOGLE_DRIVE_DOCS_FOLDER;
        if (!folderId) {
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ status: 'error', message: 'GOOGLE_DRIVE_DOCS_FOLDER belum diset di environment' });
        }

        const fileName = namaFile || req.file.originalname;
        
        const result = await googleDriveService.uploadFile(
            req.file.path,
            fileName,
            folderId
        );
        
        fs.unlinkSync(req.file.path);
        
        res.json({
            status: 'success',
            message: 'Dokumen berhasil diupload',
            data: {
                fileName: result.name,
                fileId: result.id,
                link: result.webViewLink,
                kategori: kategori || 'Umum'
            }
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengupload dokumen',
            error: error.message
        });
    }
});

// POST - Upload galeri foto
router.post('/galeri', requireRole(['Admin','Pembina']), upload.single('file'), async (req, res) => {
    try {
        const { judul, deskripsi } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'File foto diperlukan'
            });
        }
        
        const folderId = process.env.GOOGLE_DRIVE_GALERI_FOLDER;
        if (!folderId) {
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ status: 'error', message: 'GOOGLE_DRIVE_GALERI_FOLDER belum diset di environment' });
        }

        const fileName = judul || req.file.originalname;
        
        const result = await googleDriveService.uploadFile(
            req.file.path,
            fileName,
            folderId
        );
        
        fs.unlinkSync(req.file.path);
        
        res.json({
            status: 'success',
            message: 'Foto berhasil diupload ke galeri',
            data: {
                fileName: result.name,
                fileId: result.id,
                link: result.webViewLink,
                deskripsi: deskripsi || ''
            }
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengupload foto',
            error: error.message
        });
    }
});

module.exports = router;
