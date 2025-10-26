// routes/pasteRoutes.js (or add into your existing routes file)
const express = require('express');
const router = express.Router();
const { uploadPasteScreenshot } = require('../utils/pasteStorage');
const { uploadPasteScreenshot: uploadCtrl, listPasteScreenshots } = require('../controllers/pasteScreenshotController');

// POST /paste/upload  (multipart/form-data: file, studentId, sessionId, capturedAt?)
router.post('/upload', uploadPasteScreenshot.single('file'), uploadCtrl);

// GET  /paste/list?sessionId=...&studentId=...
router.get('/list', listPasteScreenshots);

module.exports = router;
