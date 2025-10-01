// Utility functions for interview handling

/**
 * Safely extract interview ID from interview object
 * @param {Object} interview - Interview object from Redux state
 * @returns {string|null} - Valid interview ID or null
 */
export const getInterviewId = (interview) => {
  if (!interview) return null;
  
  const id = interview._id || interview.id;
  
  // Validate ObjectId format (24 character hex string)
  if (id && typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
    return id;
  }
  
  console.warn('Invalid interview ID detected:', id, 'Full interview object:', interview);
  return null;
};

/**
 * Check if interview object is valid and has required fields
 * @param {Object} interview - Interview object
 * @returns {boolean} - True if interview is valid
 */
export const isValidInterview = (interview) => {
  if (!interview) return false;
  
  const id = getInterviewId(interview);
  return id !== null;
};

/**
 * Format interview data for display
 * @param {Object} interview - Interview object
 * @returns {Object} - Formatted interview data
 */
export const formatInterviewData = (interview) => {
  if (!interview) return null;
  
  return {
    id: getInterviewId(interview),
    candidateName: interview.candidateName || '',
    candidateEmail: interview.candidateEmail || '',
    candidatePhone: interview.candidatePhone || '',
    status: interview.status || 'pending',
    currentQuestionIndex: interview.currentQuestionIndex || 0,
    totalScore: interview.totalScore || 0,
    questions: interview.questions || [],
    aiSummary: interview.aiSummary || ''
  };
};