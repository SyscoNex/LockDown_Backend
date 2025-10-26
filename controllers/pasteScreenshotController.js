// controllers/pasteScreenshotController.js
const path = require('path');
const ExamSession = require('../models/ExamSession');
const PasteScreenshot = require('../models/PasteScreenshot'); // model below
const { PUBLIC_PREFIX } = require('../utils/pasteStorage');

exports.uploadPasteScreenshot = async (req, res) => {
  try {
    const { studentId, sessionId, capturedAt } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });
    if (!studentId || !sessionId) {
      return res.status(400).json({ message: 'studentId and sessionId are required' });
    }

    // verify session belongs to student
    const session = await ExamSession.findOne({ _id: sessionId, student: studentId });
    if (!session) return res.status(404).json({ message: 'Session not found for student' });

    // build a public URL-ish relative path (like your FacePose code)
    const rel = req.file.path.split('uploads')[1].replace(/\\/g, '/'); // '/{student}/{session}/paste/..'
    const imagePath = `${PUBLIC_PREFIX}${rel}`; // '/uploads/{student}/{session}/paste/...'

    const doc = await PasteScreenshot.create({
      student: studentId,
      session: sessionId,
      imagePath,
      capturedAt: capturedAt ? new Date(capturedAt) : new Date()
    });

    return res.status(201).json({ message: 'Saved', screenshot: doc });
  } catch (err) {
    console.error('uploadPasteScreenshot error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listPasteScreenshots = async (req, res) => {
  try {
    const { sessionId, studentId } = req.query;
    const q = {};
    if (sessionId) q.session = sessionId;
    if (studentId) q.student = studentId;

    const items = await PasteScreenshot.find(q).sort({ capturedAt: 1 }).lean();
    return res.json(items);
  } catch (err) {
    console.error('listPasteScreenshots error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
