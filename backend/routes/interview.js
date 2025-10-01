import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { generateAiQuestions, scoreAnswerWithAI } from '../services/ai.js';
import Interview from '../models/Interview.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

const requireAIEnv = (process.env.REQUIRE_AI || '').toLowerCase();
const REQUIRE_AI = requireAIEnv === '1' || requireAIEnv.startsWith('t') || requireAIEnv.startsWith('y');

// Question generator: prefers AI, optional fallback
const generateQuestions = async (context) => {
  try {
    const aiQuestions = await generateAiQuestions(context);
    if (aiQuestions && Array.isArray(aiQuestions) && aiQuestions.length === 6) {
      console.log('[AI] Questions generated via provider');
      return aiQuestions;
    }
    if (REQUIRE_AI) {
      throw new Error('AI did not return 6 questions');
    }
  } catch (e) {
    if (REQUIRE_AI) {
      console.error('[AI] Question generation failed, REQUIRE_AI=true. Error:', e?.message);
      throw e;
    }
    console.warn('[AI] Question generation failed, using fallback:', e?.message);
  }
  const timeLimits = { easy: 20, medium: 60, hard: 120 };
  const pool = {
    easy: [
      'Explain React components and props.',
      'Difference between let/const/var in JavaScript.',
      'Purpose of package.json in Node.js.'
    ],
    medium: [
      'Describe closures in JavaScript with an example.',
      'Explain React hooks compared to class components.'
    ],
    hard: [
      'Design a scalable real-time chat architecture with React/Node.',
      'Optimize React app performance for large datasets.'
    ]
  };
  const fallback = [
    { question: pool.easy[0], difficulty: 'easy', timeLimit: timeLimits.easy },
    { question: pool.easy[1], difficulty: 'easy', timeLimit: timeLimits.easy },
    { question: pool.medium[0], difficulty: 'medium', timeLimit: timeLimits.medium },
    { question: pool.medium[1], difficulty: 'medium', timeLimit: timeLimits.medium },
    { question: pool.hard[0], difficulty: 'hard', timeLimit: timeLimits.hard },
    { question: pool.hard[1], difficulty: 'hard', timeLimit: timeLimits.hard }
  ];
  console.warn('[AI] Using fallback questions');
  return fallback;
};

// Extract text from uploaded resume
const extractTextFromFile = async (file) => {
  try {
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      return data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }
    throw new Error('Unsupported file type');
  } catch (error) {
    throw new Error('Failed to extract text from file: ' + error.message);
  }
};

// Extract candidate info from resume text
const extractCandidateInfo = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const nameRegex = /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m;

  const email = text.match(emailRegex)?.[0] || '';
  const phone = text.match(phoneRegex)?.[0] || '';
  const name = text.match(nameRegex)?.[0] || '';

  return { name, email, phone };
};

// Upload resume and start interview
router.post('/upload-resume', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    // Check if user has already completed an interview
    const existingInterview = await Interview.findOne({ 
      candidateId: req.user._id, 
      status: 'completed' 
    });

    if (existingInterview && !existingInterview.allowReattempt) {
      return res.status(403).json({ 
        message: 'You have already completed an interview. Please contact the interviewer to enable re-attempt.',
        hasCompletedInterview: true,
        completedInterview: {
          _id: existingInterview._id,
          totalScore: existingInterview.totalScore,
          completedAt: existingInterview.completedAt
        }
      });
    }

    // Extract text from resume
    const resumeText = await extractTextFromFile(req.file);
    
    // Extract candidate information
    const candidateInfo = extractCandidateInfo(resumeText);

    // Generate interview questions (prefer AI with resume context)
    const questions = await generateQuestions({ resumeText });
    if (!questions || questions.length !== 6) {
      return res.status(500).json({ message: 'Failed to generate interview questions. Ensure AI is configured.' });
    }

    // Create new interview
    const interview = new Interview({
      candidateId: req.user._id,
      candidateName: candidateInfo.name || req.user.name,
      candidateEmail: candidateInfo.email || req.user.email,
      candidatePhone: candidateInfo.phone || '',
      resumeText,
      questions,
      status: 'pending'
    });

    await interview.save();

    res.json({
      message: 'Resume uploaded successfully',
      interview: {
        _id: interview._id,
        id: interview._id, // For backward compatibility
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        candidatePhone: interview.candidatePhone,
        status: interview.status,
        questions: interview.questions,
        candidateInfo,
        missingFields: {
          name: !candidateInfo.name,
          email: !candidateInfo.email,
          phone: !candidateInfo.phone
        }
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error processing resume', error: error.message });
  }
});

// Update candidate information
router.put('/update-candidate/:interviewId', authenticateToken, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { name, email, phone } = req.body;

    // Validate ObjectId
    if (!interviewId || interviewId === 'undefined' || !interviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }

    const interview = await Interview.findOneAndUpdate(
      { _id: interviewId, candidateId: req.user._id },
      {
        candidateName: name,
        candidateEmail: email,
        candidatePhone: phone
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ message: 'Candidate information updated', interview });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ message: 'Error updating candidate information', error: error.message });
  }
});

// Start interview
router.post('/start/:interviewId', authenticateToken, async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Validate ObjectId
    if (!interviewId || interviewId === 'undefined' || !interviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }

    const interview = await Interview.findOneAndUpdate(
      { _id: interviewId, candidateId: req.user._id },
      {
        status: 'in_progress',
        startedAt: new Date(),
        currentQuestionIndex: 0
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({
      message: 'Interview started',
      interview,
      currentQuestion: interview.questions[0]
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: 'Error starting interview', error: error.message });
  }
});

// Submit answer and get next question
router.post('/submit-answer/:interviewId', authenticateToken, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { answer, timeSpent } = req.body;

    // Validate ObjectId
    if (!interviewId || interviewId === 'undefined' || !interviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }

    const interview = await Interview.findOne({ _id: interviewId, candidateId: req.user._id });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const currentIndex = interview.currentQuestionIndex;
    
    // Update current question with answer and score (AI or fallback)
    interview.questions[currentIndex].answer = answer;
    interview.questions[currentIndex].timeSpent = timeSpent;
    const difficulty = interview.questions[currentIndex].difficulty;
    const scored = await scoreAnswerWithAI({
      question: interview.questions[currentIndex].question,
      answer,
      difficulty,
      resumeText: interview.resumeText
    });
    interview.questions[currentIndex].score = scored.score;

    // Move to next question
    const nextIndex = currentIndex + 1;
    interview.currentQuestionIndex = nextIndex;

    // Check if interview is complete
    if (nextIndex >= interview.questions.length) {
      interview.status = 'completed';
      interview.completedAt = new Date();
      
      // Generate comprehensive AI summary (mock)
      const totalScore = interview.questions.reduce((sum, q) => sum + q.score, 0);
      const averageScore = totalScore / 6;
      const easyScores = interview.questions.slice(0, 2).reduce((sum, q) => sum + q.score, 0);
      const mediumScores = interview.questions.slice(2, 4).reduce((sum, q) => sum + q.score, 0);
      const hardScores = interview.questions.slice(4, 6).reduce((sum, q) => sum + q.score, 0);
      
      let summary = `Overall Performance: ${averageScore >= 7.5 ? 'Excellent' : averageScore >= 6 ? 'Good' : averageScore >= 4 ? 'Fair' : 'Needs Improvement'} (${totalScore}/60). `;
      
      // Detailed breakdown
      summary += `Fundamentals: ${easyScores >= 16 ? 'Strong' : easyScores >= 12 ? 'Good' : 'Weak'} (${easyScores}/20). `;
      summary += `Intermediate Skills: ${mediumScores >= 16 ? 'Strong' : mediumScores >= 12 ? 'Good' : 'Weak'} (${mediumScores}/20). `;
      summary += `Advanced Concepts: ${hardScores >= 16 ? 'Strong' : hardScores >= 12 ? 'Good' : 'Weak'} (${hardScores}/20). `;
      
      // Recommendation
      if (totalScore >= 45) {
        summary += 'Recommendation: Strong candidate, proceed to next round. Shows solid understanding across all difficulty levels.';
      } else if (totalScore >= 35) {
        summary += 'Recommendation: Good candidate with potential. Consider for further technical evaluation or pair programming session.';
      } else if (totalScore >= 25) {
        summary += 'Recommendation: Average candidate. May benefit from additional training or junior-level position with mentorship.';
      } else {
        summary += 'Recommendation: Candidate needs significant improvement in technical skills before considering for this role.';
      }
      
      interview.aiSummary = summary;
    }

    await interview.save();

    const response = {
      message: nextIndex >= interview.questions.length ? 'Interview completed' : 'Answer submitted',
      interview,
      isComplete: nextIndex >= interview.questions.length,
      nextQuestion: nextIndex < interview.questions.length ? interview.questions[nextIndex] : null
    };

    res.json(response);
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Error submitting answer', error: error.message });
  }
});

// Get interview details
router.get('/:interviewId', authenticateToken, async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    // Validate ObjectId
    if (!interviewId || interviewId === 'undefined' || !interviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }
    
    const interview = await Interview.findOne({ 
      _id: interviewId, 
      candidateId: req.user._id 
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ interview });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ message: 'Error fetching interview', error: error.message });
  }
});

export default router;