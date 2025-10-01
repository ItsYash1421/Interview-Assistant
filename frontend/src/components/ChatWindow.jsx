import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Input, Button, Space, Typography, message, Modal, Progress, Tag, Divider } from 'antd'
import { SendOutlined, PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons'
import { startInterview, submitAnswer, addChatMessage, setTimeRemaining, setTimerActive } from '../store/slices/interviewSlice'
import { getInterviewId } from '../utils/interviewUtils'
import Timer from './Timer'

const { TextArea } = Input
const { Text, Title } = Typography

const ChatWindow = () => {
  const dispatch = useDispatch()
  const { 
    currentInterview, 
    currentQuestion, 
    chatHistory, 
    timeRemaining, 
    isTimerActive, 
    isLoading 
  } = useSelector((state) => state.interview)
  
  const [answer, setAnswer] = useState('')
  const [startTime, setStartTime] = useState(null)
  const messagesEndRef = useRef(null)
  const timerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  // Timer logic (auto-submit on timeout)
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        dispatch(setTimeRemaining(timeRemaining - 1))
      }, 1000)
    } else if (timeRemaining === 0 && isTimerActive) {
      handleTimeUp()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, isTimerActive, dispatch])

  const handleStartInterview = async () => {
    try {
      const interviewId = getInterviewId(currentInterview)
      if (!interviewId) {
        message.error('Interview ID not found. Please try uploading your resume again.')
        return
      }
      await dispatch(startInterview(interviewId)).unwrap()
      setStartTime(Date.now())
      message.success('Interview started! Good luck!')
    } catch (error) {
      message.error(error)
    }
  }

  const handleTimeUp = () => {
    if (currentQuestion) {
      // Auto-submit current answer on timeout
      handleSubmitAnswer(true)
    }
  }

  const handleSubmitAnswer = async (isAuto = false) => {
    if (!answer.trim()) {
      if (!isAuto) message.warning('Please provide an answer before submitting')
      // Submit empty answer on auto to progress
      if (!isAuto) return
    }

    const timeSpent = currentQuestion.timeLimit - timeRemaining
    
    // Add user message to chat
    dispatch(addChatMessage({
      type: 'user',
      content: answer,
      timestamp: new Date().toISOString()
    }))

    try {
      const interviewId = getInterviewId(currentInterview)
      if (!interviewId) {
        message.error('Interview ID not found. Please try restarting the interview.')
        return
      }
      
      await dispatch(submitAnswer({
        interviewId,
        answer: answer.trim(),
        timeSpent
      })).unwrap()

      setAnswer('')
      setStartTime(Date.now())
    } catch (error) {
      message.error(error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const isInterviewComplete = currentInterview?.status === 'completed'
  const hasStarted = currentInterview?.status === 'in_progress'

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 8) return '#34a853'
    if (score >= 6) return '#fbbc04'
    return '#ea4335'
  }

  return (
    <div style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Header */}
      <div style={{ 
        background: '#ffffff',
        borderRadius: '12px 12px 0 0',
        padding: '24px',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
        flexShrink: 0,
        border: '1px solid #dadce0',
        borderBottom: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a73e8, #1557b0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            boxShadow: '0 2px 8px rgba(26,115,232,.3)'
          }}>
            <MessageOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#202124', fontWeight: '500' }}>
            Interview Chat
          </Title>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: '#5f6368', fontSize: '16px', fontWeight: '500' }}>
            {isInterviewComplete 
              ? `Final Score: ${currentInterview.totalScore}/60`
              : hasStarted 
              ? `Question ${(currentInterview.currentQuestionIndex || 0) + 1} of 6`
              : 'Ready to start your interview'
            }
          </Text>
          {hasStarted && !isInterviewComplete && (
            <div style={{ marginTop: '16px' }}>
              <Timer timeRemaining={timeRemaining} />
            </div>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <Card className="chat-container meet-card" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '0 0 12px 12px',
        marginTop: 0,
        overflow: 'hidden',
        minHeight: '500px',
        border: '1px solid #dadce0',
        borderTop: 'none',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
      }}>
        {/* Messages */}
        <div 
          className="chat-messages" 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '20px',
            height: '100%'
          }}
        >
          {!hasStarted && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <PlayCircleOutlined style={{ fontSize: '64px', color: '#1a73e8', marginBottom: '16px' }} />
              <Title level={3} style={{ color: '#202124', marginBottom: '8px' }}>
                Ready to Begin?
              </Title>
              <Text style={{ color: '#5f6368', fontSize: '16px', display: 'block', marginBottom: '24px' }}>
                You'll have 6 questions total: 2 Easy (20s each), 2 Medium (60s each), 2 Hard (120s each)
              </Text>
              <Button 
                type="primary" 
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleStartInterview}
                loading={isLoading}
                className="meet-button"
                style={{ height: '48px', fontSize: '16px' }}
              >
                Start Interview
              </Button>
            </div>
          )}

          {chatHistory.map((message, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              {message.type === 'ai' && !message.isComplete && (
                <div className="message-bubble message-ai" style={{ marginBottom: '8px' }}>
                  <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag color={getDifficultyColor(message.difficulty)}>
                      {message.difficulty?.toUpperCase()}
                    </Tag>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#5f6368' }} />
                      <Text style={{ fontSize: '12px', color: '#5f6368' }}>
                        {message.timeLimit}s
                      </Text>
                    </Space>
                  </div>
                  <div style={{ fontSize: '16px', lineHeight: '1.5' }}>{message.content}</div>
                </div>
              )}
              
              {message.type === 'user' && (
                <div className="message-bubble message-user" style={{ marginLeft: 'auto', marginRight: 0 }}>
                  <div style={{ fontSize: '16px', lineHeight: '1.5' }}>{message.content}</div>
                </div>
              )}

              {message.isComplete && (
                <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '12px', marginTop: '16px' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#34a853', marginBottom: '12px' }} />
                  <Title level={4} style={{ color: '#202124', marginBottom: '8px' }}>
                    Interview Completed!
                  </Title>
                  <Text style={{ fontSize: '16px', color: '#5f6368' }}>
                    Your total score: {currentInterview?.totalScore}/60
                  </Text>
                  <Divider />
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<TrophyOutlined />}
                    onClick={() => window.location.href = '/results'}
                    className="meet-button"
                    style={{ height: '48px', fontSize: '16px' }}
                  >
                    View Detailed Results
                  </Button>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {hasStarted && !isInterviewComplete && currentQuestion && (
          <div className="chat-input-container" style={{ padding: '20px', borderTop: '1px solid #e8eaed', flexShrink: 0 }}>
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here... (Press Enter to submit, Shift+Enter for new line)"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ borderRadius: '8px 0 0 8px' }}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleSubmitAnswer}
                loading={isLoading}
                disabled={!answer.trim()}
                style={{ 
                  height: 'auto',
                  borderRadius: '0 8px 8px 0',
                  minHeight: '64px'
                }}
              >
                Submit
              </Button>
            </Space.Compact>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ChatWindow