import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Layout, Spin } from 'antd'
import { checkAuthStatus } from './store/slices/authSlice'
import { fetchMyInterviews } from './store/slices/candidateSlice'
import { getInterview, setCompletedInterview } from './store/slices/interviewSlice'
import AuthPage from './pages/AuthPage'
import IntervieweePage from './pages/IntervieweePage'
import InterviewerPage from './pages/InterviewerPage'
import ResultsPage from './pages/ResultsPage'
import WelcomeBackModal from './components/WelcomeBackModal'

const { Content } = Layout

function App() {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.auth)
  const { currentInterview } = useSelector((state) => state.interview)

  useEffect(() => {
    dispatch(checkAuthStatus())
  }, [dispatch])

  // On auth ready, try to restore any in-progress interview from server
  useEffect(() => {
    const tryRestoreInterview = async () => {
      if (!user) return
      // If we already have an in-memory interview, skip
      if (currentInterview && currentInterview.status === 'in_progress') return
      try {
        const res = await dispatch(fetchMyInterviews()).unwrap()
        const interviews = res?.interviews || []
        
        // Only check for completed interview if there are actually interviews
        if (interviews.length > 0) {
          const completed = interviews.find((i) => i.status === 'completed')
          if (completed && !completed.allowReattempt) {
            dispatch(setCompletedInterview({
              _id: completed._id,
              totalScore: completed.totalScore,
              completedAt: completed.completedAt
            }))
            return
          }
          
          // Check for in-progress interview
          const inProgress = interviews.find((i) => i.status === 'in_progress')
          if (inProgress?._id) {
            await dispatch(getInterview(inProgress._id))
          }
        }
      } catch (e) {
        // ignore
      }
    }
    tryRestoreInterview()
  }, [dispatch, user, currentInterview])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Layout className="meet-container">
      <Content>
        <Routes>
          <Route 
            path="/auth" 
            element={!user ? <AuthPage /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/" 
            element={
              user ? (
                user.role === 'interviewer' ? (
                  <InterviewerPage />
                ) : (
                  <IntervieweePage />
                )
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/results" 
            element={user ? <ResultsPage /> : <Navigate to="/auth" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <WelcomeBackModal />
      </Content>
    </Layout>
  )
}

export default App