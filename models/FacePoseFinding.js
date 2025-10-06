// models/FacePoseFinding.js
const mongoose = require('mongoose');

const FacePoseFindingSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  session:   { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSession', required: true, index: true },
  pose:      { type: String, required: true },     
  cheating:  { type: Boolean, default: true },     
  imagePath: { type: String, required: true },     
  thumbPath: { type: String },                     
  detectedAt:{ type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('FacePoseFinding', FacePoseFindingSchema);
