import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunks
export const fetchCandidates = createAsyncThunk(
  'candidate/fetchCandidates',
  async ({ search = '', sortBy = 'totalScore', sortOrder = 'desc', page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString()
      })
      const response = await api.get(`/candidates?${params}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidates')
    }
  }
)

export const fetchCandidateDetails = createAsyncThunk(
  'candidate/fetchCandidateDetails',
  async (candidateId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/candidates/${candidateId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidate details')
    }
  }
)

export const enableReattempt = createAsyncThunk(
  'candidate/enableReattempt',
  async (candidateId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/candidates/${candidateId}/enable-reattempt`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enable re-attempt')
    }
  }
)

export const disableReattempt = createAsyncThunk(
  'candidate/disableReattempt',
  async (candidateId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/candidates/${candidateId}/disable-reattempt`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disable re-attempt')
    }
  }
)

export const fetchMyInterviews = createAsyncThunk(
  'candidate/fetchMyInterviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/candidates/my/interviews')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interviews')
    }
  }
)

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: {
    candidates: [],
    selectedCandidate: null,
    myInterviews: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      pages: 0
    },
    filters: {
      search: '',
      sortBy: 'totalScore',
      sortOrder: 'desc'
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearSelectedCandidate: (state) => {
      state.selectedCandidate = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch candidates
      .addCase(fetchCandidates.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.isLoading = false
        state.candidates = action.payload.candidates
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch candidate details
      .addCase(fetchCandidateDetails.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCandidateDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedCandidate = action.payload.interview
      })
      .addCase(fetchCandidateDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch my interviews
      .addCase(fetchMyInterviews.fulfilled, (state, action) => {
        state.myInterviews = action.payload.interviews
      })
      // Enable re-attempt
      .addCase(enableReattempt.fulfilled, (state, action) => {
        if (state.selectedCandidate && state.selectedCandidate._id === action.payload.interview._id) {
          state.selectedCandidate.allowReattempt = true
        }
      })
      // Disable re-attempt
      .addCase(disableReattempt.fulfilled, (state, action) => {
        if (state.selectedCandidate && state.selectedCandidate._id === action.payload.interview._id) {
          state.selectedCandidate.allowReattempt = false
        }
      })
  },
})

export const { setFilters, clearSelectedCandidate, clearError } = candidateSlice.actions
export default candidateSlice.reducer