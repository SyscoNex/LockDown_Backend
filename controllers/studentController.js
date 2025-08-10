// controllers/studentController.js
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const ExamSession = require('../models/ExamSession');

function generateShortStudentId() {
  const randomHex = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `STU${randomHex.toUpperCase()}`;
}

exports.registerStudent = async (req, res) => {
  const { nameF, nameL, email, password } = req.body;

  try {
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to generate a unique ID
    let studentId;
    let isUnique = false;
    while (!isUnique) {
      studentId = generateShortStudentId();
      const exists = await Student.findOne({ studentId });
      if (!exists) isUnique = true;
    }

    const newStudent = await Student.create({
      studentId,
      nameF,
      nameL,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "Registered successfully", student: newStudent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    student.loggedInAt = new Date();
    await student.save();

    res.json({ message: "Login successful", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logoutStudent = async (req, res) => {
  const { email } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ error: "Student not found" });

    student.loggedOutAt = new Date();
    await student.save();

    res.json({ message: "Logout successful", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');

    const studentsWithSessionCount = await Promise.all(
      students.map(async (student) => {
        const sessionCount = await ExamSession.countDocuments({ student: student._id });
        return {
          ...student.toObject(),
          sessionCount
        };
      })
    );

    res.status(200).json(studentsWithSessionCount);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getExamSessionsByStudentId = async (req, res) => {
  const { studentId } = req.body;

  try {
    const sessions = await ExamSession.find({ student: studentId }).sort({ startedAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions by body:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getSessionsByCustomStudentId = async (req, res) => {
  const { studentId } = req.query;

  try {
    let sessions;

    if (!studentId) {
      // No search, return all sessions
      sessions = await ExamSession.find()
        .populate('student', 'studentId nameF nameL email')
        .sort({ startedAt: -1 });
    } else {
      const student = await Student.findOne({ studentId });
      if (!student) return res.status(404).json({ message: 'Student not found' });

      sessions = await ExamSession.find({ student: student._id })
        .populate('student', 'studentId nameF nameL email')
        .sort({ startedAt: -1 });
    }

    // Don't return modelResults
    const sanitized = sessions.map(session => ({
      _id: session._id,
      studentId: session.student?._id,
      studentCustomId: session.student?.studentId,
      name: `${session.student?.nameF} ${session.student?.nameL}`,
      email: session.student?.email,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.duration,
      summary: session.summary,
    }));

    res.status(200).json(sanitized);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
