/**
 * API Routes - File Management
 * Handle download dan listing file dari Google Drive
 */

const express = require('express');
const router = express.Router();
const googleDriveService = require('../services/googleDriveService');

// GET - List file dalam folder
router.get('/:folderId', async (req, res) => {
    try {
        const { folderId } = req.params;
        const files = await googleDriveService.listFilesInFolder(folderId);
        
        res.json({
            status: 'success',
            message: 'File berhasil diambil',
            count: files.length,
            data: files
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil file',
            error: error.message
        });
    }
});

// GET - Download file
router.get('/download/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        res.json({
            status: 'success',
            message: 'File siap didownload',
            data: {
                fileId: fileId,
                downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal download file',
            error: error.message
        });
    }
});

// GET - Share file
router.post('/:fileId/share', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { email } = req.body;
        
        await googleDriveService.shareFile(fileId, email);
        
        res.json({
            status: 'success',
            message: 'File berhasil dishare',
            data: {
                fileId: fileId,
                sharedWith: email || 'Publik'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal membagikan file',
            error: error.message
        });
    }
});

// DELETE - Delete file
router.delete('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        await googleDriveService.deleteFile(fileId);
        
        res.json({
            status: 'success',
            message: 'File berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal menghapus file',
            error: error.message
        });
    }
});

module.exports = router;
