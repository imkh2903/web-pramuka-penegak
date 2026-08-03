/**
 * API Routes - Publikasi & Karya
 * Mengelola data publikasi dari Google Sheets & Drive
 */

const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');
const googleDriveService = require('../services/googleDriveService');

// GET - Ambil semua publikasi
router.get('/', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_PUBLICATIONS_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Publikasi');
        
        res.json({
            status: 'success',
            message: 'Data publikasi berhasil diambil',
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data publikasi',
            error: error.message
        });
    }
});

// GET - Publikasi berdasarkan kategori
router.get('/kategori/:kategori', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_PUBLICATIONS_ID;
        const kategori = req.params.kategori;
        const data = await googleSheetsService.getSheetData(sheetId, 'Publikasi');
        
        const filtered = data.filter(pub => 
            pub.Kategori?.toLowerCase() === kategori.toLowerCase()
        );
        
        res.json({
            status: 'success',
            kategori: kategori,
            count: filtered.length,
            data: filtered
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal filter publikasi',
            error: error.message
        });
    }
});

// GET - Blog/Artikel terbaru
router.get('/blog/latest', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_PUBLICATIONS_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Publikasi');
        
        const sorted = data.sort((a, b) => 
            new Date(b.Tanggal) - new Date(a.Tanggal)
        ).slice(0, 10);
        
        res.json({
            status: 'success',
            message: 'Blog artikel terbaru',
            count: sorted.length,
            data: sorted
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil blog terbaru',
            error: error.message
        });
    }
});

// GET - Galeri foto
router.get('/gallery', async (req, res) => {
    try {
        const folderId = process.env.GOOGLE_DRIVE_GALERI_FOLDER;
        const files = await googleDriveService.listFilesInFolder(folderId);
        
        // Filter hanya file gambar
        const images = files.filter(f => 
            f.mimeType.startsWith('image/')
        );
        
        res.json({
            status: 'success',
            message: 'Galeri foto berhasil diambil',
            count: images.length,
            data: images
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil galeri',
            error: error.message
        });
    }
});

// POST - Publish artikel baru
router.post('/', async (req, res) => {
    try {
        const { judul, kategori, konten, author, tags } = req.body;
        
        if (!judul || !konten || !author) {
            return res.status(400).json({
                status: 'error',
                message: 'Data tidak lengkap'
            });
        }
        
        const sheetId = process.env.GOOGLE_SHEET_PUBLICATIONS_ID;
        const newPublication = [
            judul,
            kategori || 'Umum',
            new Date().toLocaleDateString('id-ID'),
            author,
            konten,
            tags || '',
            '0', // views
            new Date().toLocaleString('id-ID')
        ];
        
        await googleSheetsService.appendSheetData(sheetId, 'Publikasi', newPublication);
        
        res.status(201).json({
            status: 'success',
            message: 'Artikel berhasil dipublikasikan',
            data: { judul, kategori, author, tanggal: new Date().toLocaleDateString('id-ID') }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mempublikasikan artikel',
            error: error.message
        });
    }
});

module.exports = router;
