// controllers/facePoseFindingController.js
const path = require('path');
const FacePoseFinding = require('../models/FacePoseFinding');
const ExamSession = require('../models/ExamSession');
const { PUBLIC_PREFIX } = require('../utils/storage');


exports.uploadFinding = async (req, res) => {
  try {
    const { studentId, sessionId, pose, cheating } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });
    if (!studentId || !sessionId || !pose) {
      return res.status(400).json({ message: 'studentId, sessionId, pose are required' });
    }

    
    const session = await ExamSession.findOne({ _id: sessionId, student: studentId });
    if (!session) return res.status(404).json({ message: 'Session not found for student' });

    
    const idx = req.file.path.indexOf(path.sep + 'uploads' + path.sep);
    
    const rel = req.file.path.split('uploads')[1].replace(/\\/g, '/'); 
    const imagePath = `${PUBLIC_PREFIX}${rel}`;

    

    const doc = await FacePoseFinding.create({
      student: studentId,
      session: sessionId,
      pose,
      cheating: cheating === 'false' ? false : true, 
      imagePath,
      // thumbPath: thumbRel,
      detectedAt: new Date()
    });

    return res.status(201).json({ message: 'Saved', finding: doc });
  } catch (err) {
    console.error('uploadFinding error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listFindings = async (req, res) => {
  try {
    const { sessionId, studentId } = req.query; 
    const q = {};
    if (sessionId) q.session = sessionId;
    if (studentId) q.student = studentId;

    const items = await FacePoseFinding.find(q).sort({ detectedAt: 1 }).lean();
    return res.json(items);
  } catch (err) {
    console.error('listFindings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
