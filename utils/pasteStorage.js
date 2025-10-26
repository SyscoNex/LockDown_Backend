// utils/pasteStorage.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.join(__dirname, '..', 'uploads');
const PUBLIC_PREFIX = '/uploads';

function pasteStoragePath(studentId, sessionId) {
  return path.join(UPLOAD_ROOT, String(studentId), String(sessionId), 'paste');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Read from body, query, or headers so we don't depend on part order
    const studentId = (req.body && req.body.studentId) || req.query.studentId || req.headers['x-student-id'];
    const sessionId = (req.body && req.body.sessionId) || req.query.sessionId || req.headers['x-session-id'];

    // DEBUG (optional):
    // console.log('[pasteStorage] ids =>', { studentId, sessionId, headers: req.headers });

    if (!studentId || !sessionId) {
      const tmp = path.join(UPLOAD_ROOT, 'tmp');
      fs.mkdirSync(tmp, { recursive: true });
      return cb(null, tmp); // <-- DO NOT THROW
    }

    const dest = pasteStoragePath(studentId, sessionId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 15);
    const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
    cb(null, `paste_${stamp}${ext}`);
  }
});

const uploadPasteScreenshot = multer({
  storage,
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpe?g|png)$/i.test(file.mimetype)),
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { uploadPasteScreenshot, pasteStoragePath, UPLOAD_ROOT, PUBLIC_PREFIX };
