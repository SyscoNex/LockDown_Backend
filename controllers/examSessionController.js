
const ExamSession = require('../models/ExamSession');
const Student = require('../models/Student');

exports.updateExamSession = async (req, res) => {
  const { studentId, inputType,  modelOutput, confidence } = req.body;

  // detectAI must go via addCopiedText
  if (inputType && inputType.toLowerCase() === 'detectai') {
    return res.status(400).json({
      message: "detectAI results must be sent with the pasted text via /addCopiedText"
    });
  }


  let session = await ExamSession.findOne({ student: studentId, endedAt: null });

  if (!session) {
    session = await ExamSession.create({ student: studentId });
  }

  session.modelResults.push({
    type: inputType,
    //inputDataId,
    modelOutput,
    confidence
  });

  await session.save();
  res.status(200).json({ message: "Model result saved" , sessionId: session._id,});
}



exports.endExamSession = async (req, res) => {
  const { studentId } = req.body;

  try {
    // Update ExamSession: set endedAt = now and optionally calculate duration
    const session = await ExamSession.findOne({ student: studentId, endedAt: null });
    if (!session) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    session.endedAt = new Date();
    session.duration = Math.floor((session.endedAt - session.startedAt) / 1000); // duration in seconds
    await session.save();

    // Update Student: set loggedOutAt = now
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.loggedOutAt = new Date();
    await student.save();

    res.status(200).json({ message: 'Exam session ended and student logged out successfully' });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ message: 'Server error while ending exam session' });
  }
};




//session summary

exports.sessionSummaryByModelType = async (req, res) => {
  const { studentId, sessionId } = req.body;

  try {
    const session = await ExamSession.findOne({
      _id: sessionId,
      student: studentId
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found for student" });
    }

    const summary = {};
    let cheatingThresholdExceeded = false;

    session.modelResults.forEach(result => {
      const { type, modelOutput, confidence } = result;

      if (!summary[type]) {
        summary[type] = {
          total: 0,
          trueCount: 0,
          falseCount: 0,
          confidenceSum: 0,
          confidenceCount: 0
        };
      }

      summary[type].total += 1;

      //handling for keystroke
      if (type === 'keystroke') {
        // modelOutput is a stringified number like "0.019050"
        const score = parseFloat(modelOutput);
        if (!Number.isNaN(score)) {
          if (score > 0.95) {
            summary[type].trueCount += 1;
          } else {
            summary[type].falseCount += 1;
          }
        }
      } else {
        
        if (typeof modelOutput === 'string') {
          const v = modelOutput.trim().toLowerCase();
          if (v === 'true' || v === '1') summary[type].trueCount += 1;
          if (v === 'false' || v === '0') summary[type].falseCount += 1;
        }
      }

      // Confidence aggregation (unchanged)
      if (typeof confidence === 'number') {
        summary[type].confidenceSum += confidence;
        summary[type].confidenceCount += 1;
      }
    });

    // Compute average confidence
    Object.keys(summary).forEach(type => {
      const { confidenceSum, confidenceCount, total, trueCount } = summary[type];
      summary[type].averageConfidence =
        confidenceCount > 0 ? Number((confidenceSum / confidenceCount).toFixed(4)) : null;

      delete summary[type].confidenceSum;
      delete summary[type].confidenceCount;

      // Threshold check
      const threshold = Math.floor(total / 2); 
      if (trueCount > threshold) {
        cheatingThresholdExceeded = true;
      }

    });

    // collect TRUE multihuman events with time and humans detected
    const multiHumanTrueEvents = (session.modelResults || [])
      .filter(r => {
        const t = (r.type || '').toLowerCase();
        const isMultiHuman = t === 'multihuman' || t === 'multihuman'; 
        const out = (r.modelOutput || '').toString().trim().toLowerCase();
        return isMultiHuman && (out === 'true' || out === '1');
      })
      .map(r => {
        // prefer subdoc timestamp; fallback to ObjectId timestamp if needed
        const when = r.timestamp
          ? new Date(r.timestamp)
          : (r._id && typeof r._id.getTimestamp === 'function')
              ? r._id.getTimestamp()
              : null;

        // humans detected is stored in `confidence` for this type in your app
        const humansNum = Number(r.confidence);
        return {
          detectedAt: when ? when.toISOString() : null,
          humans: Number.isFinite(humansNum) ? humansNum : null
        };
      })
      
      .sort((a, b) => new Date(a.detectedAt) - new Date(b.detectedAt));





    // Duration in minutes (if stored as seconds)
    let durationMinutes = null;
    if (typeof session.duration === 'number') {
      durationMinutes = Number((session.duration / 60).toFixed(2));
    }

    // Background apps + copied texts
    const backgroundApps = session.backgroundApps?.map(app => ({
      name: app.name,
      path: app.path || '-',
      firstDetectedAt: app.firstDetectedAt?.toISOString() || '-'
    })) || [];

    const copiedTexts = session.copiedTexts?.map(item => ({
      text: item.text,
      timestamp: item.timestamp?.toISOString() || '-',
      modelOutput: item.modelOutput || null,
      confidence:
        typeof item.confidence === 'number' ? item.confidence : null
    })) || [];

    const typedTexts = session.typedTexts?.map(item => ({
      text: item.text,
      timestamp: item.timestamp?.toISOString() || '-',
      modelOutput: item.modelOutput || null,
      confidence:
        typeof item.confidence === 'number' ? item.confidence : null
    })) || [];

    return res.status(200).json({
      sessionId: session._id,
      studentId: session.student,
      durationMinutes,
      summary,
      backgroundApps,
      copiedTexts,
      typedTexts,
      cheatingThresholdExceeded,
      multiHumanTrueEvents
    });

  } catch (error) {
    console.error("Error generating session summary:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



/*exports.sessionSummaryByModelType = async (req, res) => {
  const { studentId, sessionId, fromTime, toTime } = req.body;

  try {
    const session = await ExamSession.findOne({
      _id: sessionId,
      student: studentId
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found for student" });
    }

    const summary = {};

    const from = fromTime ? new Date(fromTime) : null;
    const to = toTime ? new Date(toTime) : null;

    session.modelResults.forEach(result => {
      if (from && result.timestamp < from) return;
      if (to && result.timestamp > to) return;

      const { type, modelOutput, confidence } = result;

      if (!summary[type]) {
        summary[type] = {
          total: 0,
          trueCount: 0,
          falseCount: 0,
          confidenceSum: 0,
          confidenceCount: 0
        };
      }

      summary[type].total += 1;

      if (typeof modelOutput === "string") {
        if (modelOutput.toLowerCase() === "true") summary[type].trueCount += 1;
        if (modelOutput.toLowerCase() === "false") summary[type].falseCount += 1;
      }

      if (typeof confidence === "number") {
        summary[type].confidenceSum += confidence;
        summary[type].confidenceCount += 1;
      }
    });

    Object.keys(summary).forEach(type => {
      const { confidenceSum, confidenceCount } = summary[type];
      summary[type].averageConfidence =
        confidenceCount > 0 ? (confidenceSum / confidenceCount).toFixed(4) : null;

      delete summary[type].confidenceSum;
      delete summary[type].confidenceCount;
    });

    const durationMinutes =
      typeof session.duration === "number"
        ? (session.duration / 60).toFixed(2)
        : null;

    return res.status(200).json({
      sessionId: session._id,
      studentId: session.student,
      durationMinutes,
      summary
    });

  } catch (error) {
    console.error("Error generating session summary:", error);
    return res.status(500).json({ message: "Server error" });
  }
};*/





exports.addBackgroundApps = async (req, res) => {
  const { studentId, apps } = req.body;

  if (!studentId || !Array.isArray(apps)) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const session = await ExamSession.findOne({ student: studentId, endedAt: null });
    if (!session) {
      return res.status(404).json({ message: "Active session not found" });
    }

    // Avoid duplicates: only push new app names
    const existingNames = session.backgroundApps.map(app => app.name);
    const newApps = apps.filter(app => !existingNames.includes(app.name));

    session.backgroundApps.push(...newApps);
    await session.save();

    res.status(200).json({ message: "Background apps updated" });
  } catch (error) {
    console.error("Error saving background apps:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.addCopiedText = async (req, res) => {
  const { studentId, pastedText, modelOutput, confidence, timestamp } = req.body;

  if (!studentId || !pastedText) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const session = await ExamSession.findOne({ student: studentId, endedAt: null });
    if (!session) {
      return res.status(404).json({ message: "Active session not found" });
    }

    session.copiedTexts.push({
      text: pastedText,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      modelOutput: typeof modelOutput === 'string' ? modelOutput : undefined,
      confidence: typeof confidence === 'number' ? confidence : undefined
    });

    await session.save();
    res.status(200).json({ message: "Copied text with model result saved" });
  } catch (error) {
    console.error("Error saving copied text:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addTypedText = async (req, res) => {
  const { studentId, typedText, modelOutput, confidence, timestamp } = req.body;

  if (!studentId || !typedText) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const session = await ExamSession.findOne({ student: studentId, endedAt: null });
    if (!session) {
      return res.status(404).json({ message: "Active session not found" });
    }

    session.typedTexts.push({
      text: typedText,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      modelOutput: typeof modelOutput === 'string' ? modelOutput : undefined,
      confidence: typeof confidence === 'number' ? confidence : undefined
    });

    await session.save();
    res.status(200).json({ message: "Typed text with model result saved" });
  } catch (error) {
    console.error("Error saving Typed text:", error);
    res.status(500).json({ message: "Server error" });
  }
};




