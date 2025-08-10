// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.post('/register', teacherController.registerTeacher);
router.post('/login', teacherController.loginTeacher);
router.post('/logout', teacherController.logoutTeacher);

module.exports = router;
