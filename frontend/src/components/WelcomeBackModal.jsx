import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Button, Typography, Space } from 'antd'
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { setShowWelcomeBack, setTimerActive, resetInterview } from '../store/slices/interviewSlice'

const { Title, Text } = Typography

const WelcomeBackModal = () => {
  const dispatch = useDispatch()
  const { showWelcomeBack, currentInterview, currentQuestion, currentQuestionIndex } = useSelector((state) => state.interview)

  const handleContinue = () => {
    dispatch(setShowWelcomeBack(false))
    if (currentQuestion) {
      dispatch(setTimerActive(true))
    }
  }

  const handleStartOver = () => {
    dispatch(resetInterview())
    dispatch(setShowWelcomeBack(false))
  }

  const handleClose = () => {
    dispatch(setShowWelcomeBack(false))
  }

  if (!showWelcomeBack || !currentInterview) {
    return null
  }

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Welcome Back!
          </Title>
        </div>
      }
      open={showWelcomeBack}
      onCancel={handleClose}
      footer={null}
      className="welcome-back-modal"
      centered
      width={500}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <PlayCircleOutlined style={{ fontSize: '64px', color: '#1a73e8', marginBottom: '16px' }} />
        
        <Text style={{ fontSize: '16px', color: '#5f6368', display: 'block', marginBottom: '24px' }}>
          You have an unfinished interview in progress.
        </Text>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text><strong>Candidate:</strong> {currentInterview.candidateName}</Text>
            <Text><strong>Progress:</strong> Question {(currentQuestionIndex || 0) + 1} of 6</Text>
            <Text><strong>Status:</strong> {currentInterview.status.replace('_', ' ')}</Text>
          </Space>
        </div>

        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleContinue}
            className="meet-button"
          >
            Continue Interview
          </Button>
          
          <Button
            size="large"
            icon={<DeleteOutlined />}
            onClick={handleStartOver}
            className="meet-button"
            danger
          >
            Start Over
          </Button>
        </Space>
      </div>
    </Modal>
  )
}

export default WelcomeBackModal