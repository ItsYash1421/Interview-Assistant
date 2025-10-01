import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { login, register } from './authSlice'

// Async thunks
export const uploadResume = createAsyncThunk(
  'interview/uploadResume',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const response = await api.post('/interview/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      // If it's a completed interview error, pass the full error data
      if (error.response?.status === 403 && error.response?.data?.hasCompletedInterview) {
        return rejectWithValue(JSON.stringify(error.response.data))
      }
      return rejectWithValue(error.response?.data?.message || 'Resume upload failed')
    }
  }
)

export const updateCandidateInfo = createAsyncThunk(
  'interview/updateCandidateInfo',
  async ({ interviewId, candidateInfo }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/interview/update-candidate/${interviewId}`, candidateInfo)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed')
    }
  }
)

export const startInterview = createAsyncThunk(
  'interview/start',
  async (interviewId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interview/start/${interviewId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start interview')
    }
  }
)

export const submitAnswer = createAsyncThunk(
  'interview/submitAnswer',
  async ({ interviewId, answer, timeSpent }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interview/submit-answer/${interviewId}`, {
        answer,
        timeSpent
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer')
    }
  }
)

export const getInterview = createAsyncThunk(
  'interview/getInterview',
  async (interviewId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/interview/${interviewId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interview')
    }
  }
)

const interviewSlice = createSlice({
  name: 'interview',
  initialState: {
    currentInterview: null,
    currentQuestion: null,
    currentQuestionIndex: 0,
    timeRemaining: 0,
    isTimerActive: false,
    chatHistory: [],
    isLoading: false,
    error: null,
    showWelcomeBack: false,
    hasCompletedInterview: false,
    completedInterviewData: null,
  },
  reducers: {
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload
    },
    setTimerActive: (state, action) => {
      state.isTimerActive = action.payload
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload)
    },
    clearChatHistory: (state) => {
      state.chatHistory = []
    },
    setShowWelcomeBack: (state, action) => {
      state.showWelcomeBack = action.payload
    },
    resetInterview: (state) => {
      state.currentInterview = null
      state.currentQuestion = null
      state.currentQuestionIndex = 0
      state.timeRemaining = 0
      state.isTimerActive = false
      state.chatHistory = []
      state.error = null
    },
    setCompletedInterview: (state, action) => {
      state.hasCompletedInterview = true
      state.completedInterviewData = action.payload
    },
    clearCompletedInterview: (state) => {
      state.hasCompletedInterview = false
      state.completedInterviewData = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload resume
      .addCase(uploadResume.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentInterview = action.payload.interview
        state.error = null
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.isLoading = false
        // Check if it's a completed interview error
        try {
          const errorData = JSON.parse(action.payload)
          if (errorData.hasCompletedInterview) {
            state.hasCompletedInterview = true
            state.completedInterviewData = errorData.completedInterview
            state.error = errorData.message
          } else {
            state.error = action.payload
          }
        } catch (e) {
          state.error = action.payload
        }
      })
      // Update candidate info
      .addCase(updateCandidateInfo.fulfilled, (state, action) => {
        state.currentInterview = action.payload.interview
      })
      // Start interview
      .addCase(startInterview.pending, (state) => {
        state.isLoading = true
      })
      .addCase(startInterview.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentInterview = action.payload.interview
        state.currentQuestion = action.payload.currentQuestion
        state.currentQuestionIndex = 0
        state.timeRemaining = action.payload.currentQuestion.timeLimit
        state.isTimerActive = true
        state.chatHistory = []
        // Add first question to chat
        state.chatHistory.push({
          type: 'ai',
          content: action.payload.currentQuestion.question,
          timestamp: new Date().toISOString(),
          difficulty: action.payload.currentQuestion.difficulty,
          timeLimit: action.payload.currentQuestion.timeLimit
        })
      })
      // Submit answer
      .addCase(submitAnswer.pending, (state) => {
        state.isLoading = true
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentInterview = action.payload.interview
        
        if (action.payload.isComplete) {
          state.currentQuestion = null
          state.isTimerActive = false
          state.timeRemaining = 0
          // Add completion message
          state.chatHistory.push({
            type: 'ai',
            content: `Interview completed! Your total score: ${action.payload.interview.totalScore}/60. ${action.payload.interview.aiSummary}`,
            timestamp: new Date().toISOString(),
            isComplete: true
          })
        } else {
          state.currentQuestion = action.payload.nextQuestion
          state.currentQuestionIndex += 1
          state.timeRemaining = action.payload.nextQuestion.timeLimit
          state.isTimerActive = true
          // Add next question to chat
          state.chatHistory.push({
            type: 'ai',
            content: action.payload.nextQuestion.question,
            timestamp: new Date().toISOString(),
            difficulty: action.payload.nextQuestion.difficulty,
            timeLimit: action.payload.nextQuestion.timeLimit
          })
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Get interview
      .addCase(getInterview.fulfilled, (state, action) => {
        const interview = action.payload.interview
        state.currentInterview = interview
        
        // Check if there's an unfinished interview
        if (interview.status === 'in_progress') {
          state.showWelcomeBack = true
          state.currentQuestionIndex = interview.currentQuestionIndex
          
          if (interview.currentQuestionIndex < interview.questions.length) {
            state.currentQuestion = interview.questions[interview.currentQuestionIndex]
            state.timeRemaining = state.currentQuestion.timeLimit
          }
          
          // Rebuild chat history
          state.chatHistory = []
          interview.questions.forEach((q, index) => {
            if (index <= interview.currentQuestionIndex) {
              // Add question
              state.chatHistory.push({
                type: 'ai',
                content: q.question,
                timestamp: new Date().toISOString(),
                difficulty: q.difficulty,
                timeLimit: q.timeLimit
              })
              
              // Add answer if exists
              if (q.answer && index < interview.currentQuestionIndex) {
                state.chatHistory.push({
                  type: 'user',
                  content: q.answer,
                  timestamp: new Date().toISOString()
                })
              }
            }
          })
        }
      })
      // Clear completed interview state when user logs in/registers
      .addCase(login.fulfilled, (state) => {
        state.hasCompletedInterview = false
        state.completedInterviewData = null
      })
      .addCase(register.fulfilled, (state) => {
        state.hasCompletedInterview = false
        state.completedInterviewData = null
      })
  },
})

export const {
  setCurrentQuestion,
  setTimeRemaining,
  setTimerActive,
  addChatMessage,
  clearChatHistory,
  setShowWelcomeBack,
  resetInterview,
  setCompletedInterview,
  clearCompletedInterview,
  clearError,
} = interviewSlice.actions

export default interviewSlice.reducer