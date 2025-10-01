import express from 'express';
import Interview from '../models/Interview.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all candidates (for interviewers)
router.get('/', authenticateToken, requireRole(['interviewer']), async (req, res) => {
  try {
    const { search, sortBy = 'totalScore', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    // Build search query
    let searchQuery = { status: 'completed' };
    if (search) {
      searchQuery.$or = [
        { candidateName: { $regex: search, $options: 'i' } },
        { candidateEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const candidates = await Interview.find(searchQuery)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('candidateName candidateEmail candidatePhone totalScore aiSummary completedAt createdAt');

    const total = await Interview.countDocuments(searchQuery);

    res.json({
      candidates,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Error fetching candidates', error: error.message });
  }
});

// Get my interviews (for interviewees)
router.get('/my/interviews', authenticateToken, async (req, res) => {
  try {
    const interviews = await Interview.find({ candidateId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ interviews });
  } catch (error) {
    console.error('Get my interviews error:', error);
    res.status(500).json({ message: 'Error fetching interviews', error: error.message });
  }
});

// Get candidate details (for interviewers)
router.get('/:candidateId', authenticateToken, requireRole(['interviewer']), async (req, res) => {
  try {
    const { candidateId } = req.params;

    const interview = await Interview.findById(candidateId)
      .populate('candidateId', 'name email');

    if (!interview) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ interview });
  } catch (error) {
    console.error('Get candidate details error:', error);
    res.status(500).json({ message: 'Error fetching candidate details', error: error.message });
  }
});

// Enable re-attempt for a candidate (for interviewers)
router.put('/:candidateId/enable-reattempt', authenticateToken, requireRole(['interviewer']), async (req, res) => {
  try {
    const { candidateId } = req.params;

    // First try by interview _id
    let interview = await Interview.findByIdAndUpdate(
      candidateId,
      { allowReattempt: true },
      { new: true }
    );

    // If not found, treat candidateId as user id and enable on latest interview
    if (!interview) {
      const latestInterview = await Interview.findOne({ candidateId }).sort({ createdAt: -1 });
      if (!latestInterview) {
        return res.status(404).json({ message: 'Interview not found' });
      }
      latestInterview.allowReattempt = true;
      interview = await latestInterview.save();
    }

    res.json({ 
      message: 'Re-attempt enabled for candidate',
      interview: {
        _id: interview._id,
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        allowReattempt: interview.allowReattempt
      }
    });
  } catch (error) {
    console.error('Enable re-attempt error:', error);
    res.status(500).json({ message: 'Error enabling re-attempt', error: error.message });
  }
});

// Disable re-attempt for a candidate (for interviewers)
router.put('/:candidateId/disable-reattempt', authenticateToken, requireRole(['interviewer']), async (req, res) => {
  try {
    const { candidateId } = req.params;

    // First try by interview _id
    let interview = await Interview.findByIdAndUpdate(
      candidateId,
      { allowReattempt: false },
      { new: true }
    );

    // If not found, treat candidateId as user id and disable on latest interview
    if (!interview) {
      const latestInterview = await Interview.findOne({ candidateId }).sort({ createdAt: -1 });
      if (!latestInterview) {
        return res.status(404).json({ message: 'Interview not found' });
      }
      latestInterview.allowReattempt = false;
      interview = await latestInterview.save();
    }

    res.json({ 
      message: 'Re-attempt disabled for candidate',
      interview: {
        _id: interview._id,
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        allowReattempt: interview.allowReattempt
      }
    });
  } catch (error) {
    console.error('Disable re-attempt error:', error);
    res.status(500).json({ message: 'Error disabling re-attempt', error: error.message });
  }
});

export default router;