// routes/studentRoutes.js
const express = require('express');


const router = express.Router();
const {
  updateExamSession,
  endExamSession,
  sessionSummaryByModelType,
  addBackgroundApps,
  addCopiedText,
  addTypedText
  
} = require('../controllers/examSessionController');

router.post('/updateSession', updateExamSession);
router.post('/endExamSession', endExamSession)
router.post('/sessionSummaryByModelType', sessionSummaryByModelType)
router.post('/addBackgroundAppData', addBackgroundApps)
router.post('/addCopiedText', addCopiedText)
router.post('/addTypedText', addTypedText)


module.exports = router;
