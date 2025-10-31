const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  skills: [{
    name: String,
    score: Number,
    recommendations: [String]
  }],
  overallScore: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  recommendations: [{
    skill: String,
    resources: [{
      type: String,
      title: String,
      url: String,
      difficulty: String
    }]
  }]
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;