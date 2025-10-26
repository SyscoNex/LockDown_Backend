// models/PasteScreenshot.js
const mongoose = require('mongoose');

const PasteScreenshotSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSession', required: true },
  imagePath: { type: String, required: true }, // public-relative path like /uploads/...
  capturedAt: { type: Date, default: Date.now }
}, { versionKey: false });

PasteScreenshotSchema.index({ session: 1, capturedAt: 1 });

module.exports = mongoose.model('PasteScreenshot', PasteScreenshotSchema);
