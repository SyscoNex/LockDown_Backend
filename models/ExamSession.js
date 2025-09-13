const mongoose = require('mongoose');

const ModelResultSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['multiHUman', 'facePose', 'cheatingObjects', 'audio', 'keystroke'], required: true },
  
  modelOutput: { type: String }, 
  confidence: { type: Number },  
});

const BackgroundAppSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String },  
  firstDetectedAt: { type: Date, default: Date.now }
});

const CopiedTextSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  modelOutput: { type: String },         
  confidence: { type: Number } 
});

const TypedTextSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  modelOutput: { type: String },         
  confidence: { type: Number } 
});




const ExamSessionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  duration: { type: Number }, 
  modelResults: [ModelResultSchema], 
  backgroundApps: [BackgroundAppSchema],
  copiedTexts: [CopiedTextSchema],
  typedTexts: [TypedTextSchema],
  summary: { type: String },
});

module.exports = mongoose.model('ExamSession', ExamSessionSchema);
