// routes/facepose.js
const express = require('express');
const router = express.Router();
const { uploadFacePose } = require('../utils/storage');
const ctrl = require('../controllers/facePoseFindingController');

router.post('/upload', uploadFacePose.single('file'), ctrl.uploadFinding);
router.get('/list', ctrl.listFindings);

module.exports = router;
