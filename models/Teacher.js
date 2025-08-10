const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loggedInAt: { type: Date },
  loggedOutAt: { type: Date }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Teacher', teacherSchema);