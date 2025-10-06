// utils/storage.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.join(__dirname, '..', 'uploads'); // absolute
const PUBLIC_PREFIX = '/uploads'; 

function facePoseStoragePath(studentId, sessionId) {
  return path.join(UPLOAD_ROOT, String(studentId), String(sessionId), 'facepose');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { studentId, sessionId } = req.body;
    const dest = facePoseStoragePath(studentId, sessionId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 15); 
    const ext = (file.mimetype === 'image/png') ? '.png' : '.jpg';
    cb(null, `facepose_${stamp}${ext}`);
  }
});

const uploadFacePose = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(jpe?g|png)$/i.test(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { uploadFacePose, facePoseStoragePath, UPLOAD_ROOT, PUBLIC_PREFIX };
