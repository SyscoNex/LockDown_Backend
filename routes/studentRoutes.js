// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  logoutStudent,
  getAllStudents,
  getExamSessionsByStudentId,
  getSessionsByCustomStudentId
} = require('../controllers/studentController');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/logout', logoutStudent);
router.get('/', getAllStudents)
router.post('/getSessionsByStudentId', getExamSessionsByStudentId)
router.get('/getSessionsByCustomStudentId', getSessionsByCustomStudentId)


module.exports = router;
