
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

exports.registerTeacher = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = await Teacher.create({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken(newTeacher);

    res.status(201).json({
      message: 'Teacher registered successfully',
      teacher: {
        id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    teacher.loggedInAt = new Date();
    await teacher.save();

    const token = generateToken(teacher);

    // Split full name for frontend compatibility (simulate firstname/lastname)
    const [firstname, ...rest] = teacher.name.split(' ');
    const lastname = rest.join(' ') || '';

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: teacher._id,
        firstname,
        lastname,
        email: teacher.email,
        usertype: 99 // You can use a different code for teacher if needed
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logoutTeacher = async (req, res) => {
  const { email } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    teacher.loggedOutAt = new Date();
    await teacher.save();

    res.json({ message: 'Logout successful', teacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
