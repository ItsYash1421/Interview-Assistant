import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Descriptions, Card, List, Tag, Typography, Space, Spin, Divider, Button, message } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { fetchCandidateDetails, clearSelectedCandidate, enableReattempt, disableReattempt } from '../store/slices/candidateSlice'
import dayjs from 'dayjs'

const { Text, Title } = Typography

const CandidateDetailModal = ({ candidateId, visible, onClose }) => {
  const dispatch = useDispatch()
  const { selectedCandidate, isLoading } = useSelector((state) => state.candidate)

  useEffect(() => {
    if (candidateId && visible) {
      dispatch(fetchCandidateDetails(candidateId))
    }
  }, [candidateId, visible, dispatch])

  const handleClose = () => {
    dispatch(clearSelectedCandidate())
    onClose()
  }

  const handleEnableReattempt = async () => {
    try {
      const id = selectedCandidate?._id || candidateId
      await dispatch(enableReattempt(id)).unwrap()
      message.success('Re-attempt enabled for candidate')
    } catch (error) {
      message.error(error)
    }
  }

  const handleDisableReattempt = async () => {
    try {
      const id = selectedCandidate?._id || candidateId
      await dispatch(disableReattempt(id)).unwrap()
      message.success('Re-attempt disabled for candidate')
    } catch (error) {
      message.error(error)
    }
  }

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

  if (!selectedCandidate) {
    return (
      <Modal
        title="Candidate Details"
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={800}
        className="meet-card"
        centered
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserOutlined style={{ color: '#1a73e8' }} />
          <span>Candidate Details</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text style={{ color: '#5f6368', fontSize: '14px' }}>
              Re-attempt Status: 
              <Tag 
                color={selectedCandidate?.allowReattempt ? 'green' : 'red'} 
                style={{ marginLeft: '8px' }}
              >
                {selectedCandidate?.allowReattempt ? 'Enabled' : 'Disabled'}
              </Tag>
            </Text>
          </div>
          <Space>
            {selectedCandidate?.allowReattempt ? (
              <Button 
                icon={<CloseCircleOutlined />}
                onClick={handleDisableReattempt}
                danger
              >
                Disable Re-attempt
              </Button>
            ) : (
              <Button 
                icon={<CheckCircleOutlined />}
                onClick={handleEnableReattempt}
                type="primary"
              >
                Enable Re-attempt
              </Button>
            )}
            <Button onClick={handleClose}>
              Close
            </Button>
          </Space>
        </div>
      }
      width={900}
      className="meet-card"
      centered
      maskClosable={false}
      destroyOnClose
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Candidate Info */}
        <Card className="meet-card" style={{ marginBottom: '16px' }}>
          <Descriptions title="Personal Information" column={2}>
            <Descriptions.Item label="Name" span={2}>
              <Space>
                <UserOutlined style={{ color: '#5f6368' }} />
                <Text strong>{selectedCandidate.candidateName}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined style={{ color: '#5f6368' }} />
                <Text>{selectedCandidate.candidateEmail}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <Space>
                <PhoneOutlined style={{ color: '#5f6368' }} />
                <Text>{selectedCandidate.candidatePhone}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Interview Date">
              <Space>
                <ClockCircleOutlined style={{ color: '#5f6368' }} />
                <Text>{dayjs(selectedCandidate.completedAt).format('MMMM DD, YYYY HH:mm')}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Total Score">
              <div 
                style={{
                  background: `linear-gradient(135deg, ${getScoreColor(selectedCandidate.totalScore)}, ${getScoreColor(selectedCandidate.totalScore)}dd)`,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <TrophyOutlined />
                {selectedCandidate.totalScore}/60
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* AI Summary */}
        {selectedCandidate.aiSummary && (
          <Card className="meet-card" style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ marginBottom: '12px', color: '#202124' }}>
              AI Assessment Summary
            </Title>
            <div style={{ 
              padding: '16px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              borderLeft: '4px solid #1a73e8'
            }}>
              <Text style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {selectedCandidate.aiSummary}
              </Text>
            </div>
          </Card>
        )}

        {/* Questions and Answers */}
        <Card className="meet-card">
          <Title level={5} style={{ marginBottom: '16px', color: '#202124' }}>
            Interview Questions & Answers
          </Title>
          
          <List
            dataSource={selectedCandidate.questions}
            renderItem={(question, index) => (
              <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #e8eaed' }}>
                <div style={{ width: '100%' }}>
                  {/* Question Header */}
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Space style={{ marginBottom: '8px' }}>
                        <Text strong style={{ color: '#202124' }}>
                          Question {index + 1}
                        </Text>
                        <Tag color={getDifficultyColor(question.difficulty)}>
                          {question.difficulty.toUpperCase()}
                        </Tag>
                        <Text style={{ color: '#5f6368', fontSize: '12px' }}>
                          {question.timeLimit}s limit
                        </Text>
                      </Space>
                      <div style={{ 
                        background: '#f1f3f4', 
                        padding: '12px', 
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}>
                        <Text>{question.question}</Text>
                      </div>
                    </div>
                    <div 
                      style={{
                        background: `linear-gradient(135deg, ${getScoreColor(question.score)}, ${getScoreColor(question.score)}dd)`,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginLeft: '16px'
                      }}
                    >
                      {question.score}/10
                    </div>
                  </div>

                  {/* Answer */}
                  <div>
                    <Text strong style={{ color: '#202124', fontSize: '14px' }}>
                      Answer:
                    </Text>
                    <div style={{ 
                      background: 'white', 
                      border: '1px solid #e8eaed',
                      padding: '12px', 
                      borderRadius: '8px',
                      marginTop: '8px'
                    }}>
                      <Text style={{ whiteSpace: 'pre-wrap' }}>
                        {question.answer || 'No answer provided'}
                      </Text>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Text style={{ color: '#5f6368', fontSize: '12px' }}>
                        Time spent: {question.timeSpent}s / {question.timeLimit}s
                      </Text>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Resume Text */}
        {selectedCandidate.resumeText && (
          <Card className="meet-card" style={{ marginTop: '16px' }}>
            <Title level={5} style={{ marginBottom: '12px', color: '#202124' }}>
              Resume Content
            </Title>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              fontSize: '12px',
              lineHeight: '1.4'
            }}>
              <Text style={{ whiteSpace: 'pre-wrap' }}>
                {selectedCandidate.resumeText}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  )
}

export default CandidateDetailModal