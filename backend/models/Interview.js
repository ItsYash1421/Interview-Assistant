import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  timeLimit: {
    type: Number,
    required: true // in seconds
  },
  answer: {
    type: String,
    default: ''
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  }
});

const interviewSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  candidatePhone: {
    type: String,
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  totalScore: {
    type: Number,
    default: 0
  },
  aiSummary: {
    type: String,
    default: ''
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  allowReattempt: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate total score before saving
interviewSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalScore = this.questions.reduce((sum, q) => sum + q.score, 0);
  }
  next();
});

export default mongoose.model('Interview', interviewSchema);