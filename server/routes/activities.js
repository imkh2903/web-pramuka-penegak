/**
 * API Routes - Kegiatan & Inventaris
 * Mengelola data kegiatan dari Google Sheets
 */

const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');
const { requireRole } = require('../middleware/rbac');

// GET - Ambil semua kegiatan
router.get('/', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_ACTIVITIES_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Kegiatan');
        
        res.json({
            status: 'success',
            message: 'Data kegiatan berhasil diambil',
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data kegiatan',
            error: error.message
        });
    }
});

// GET - Kegiatan mendatang
router.get('/upcoming', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_ACTIVITIES_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Kegiatan');
        
        const today = new Date();
        const upcoming = data.filter(activity => {
            const actDate = new Date(activity.Tanggal);
            return actDate >= today;
        }).sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal));
        
        res.json({
            status: 'success',
            count: upcoming.length,
            data: upcoming
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil kegiatan mendatang',
            error: error.message
        });
    }
});

// GET - Kegiatan berdasarkan kategori
router.get('/kategori/:kategori', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_ACTIVITIES_ID;
        const kategori = req.params.kategori;
        const data = await googleSheetsService.getSheetData(sheetId, 'Kegiatan');
        
        const filtered = data.filter(activity => 
            activity.Kategori?.toLowerCase() === kategori.toLowerCase()
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
            message: 'Gagal filter data kegiatan',
            error: error.message
        });
    }
});

// POST - Buat kegiatan baru
router.post('/', requireRole(['Admin','Pembina']), async (req, res) => {
    try {
        const { nama, tanggal, lokasi, kategori, deskripsi, pembina } = req.body;
        
        if (!nama || !tanggal || !lokasi) {
            return res.status(400).json({
                status: 'error',
                message: 'Data tidak lengkap'
            });
        }
        
        const sheetId = process.env.GOOGLE_SHEET_ACTIVITIES_ID;
        const newActivity = [
            nama,
            tanggal,
            lokasi,
            kategori || 'Latihan Rutin',
            deskripsi || '',
            pembina || '',
            '0', // peserta awal
            'Perencanaan',
            '',
            new Date().toLocaleDateString('id-ID')
        ];
        
        await googleSheetsService.appendSheetData(sheetId, 'Kegiatan', newActivity);
        
        res.status(201).json({
            status: 'success',
            message: 'Kegiatan berhasil dibuat',
            data: { nama, tanggal, lokasi, kategori, deskripsi }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal membuat kegiatan',
            error: error.message
        });
    }
});

// POST - RSVP kegiatan
router.post('/:id/rsvp', async (req, res) => {
    try {
        const { nama, email, wa, status } = req.body;
        
        if (!nama || !status) {
            return res.status(400).json({
                status: 'error',
                message: 'Data tidak lengkap'
            });
        }
        
        res.json({
            status: 'success',
            message: 'RSVP berhasil dicatat',
            data: { nama, email, wa, status, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mencatat RSVP',
            error: error.message
        });
    }
});

// GET - Inventaris
router.get('/inventaris/list', async (req, res) => {
    try {
        const sheetId = process.env.GOOGLE_SHEET_ACTIVITIES_ID;
        const data = await googleSheetsService.getSheetData(sheetId, 'Inventaris');
        
        res.json({
            status: 'success',
            message: 'Data inventaris berhasil diambil',
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data inventaris',
            error: error.message
        });
    }
});

module.exports = router;
