
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true },
  nameF: { type: String, required: true },
  nameL: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loggedInAt: { type: Date },
  loggedOutAt: { type: Date }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Student', studentSchema);
