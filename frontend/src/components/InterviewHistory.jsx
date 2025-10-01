import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, List, Tag, Typography, Empty, Spin, Space } from 'antd'
import { CalendarOutlined, TrophyOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { fetchMyInterviews } from '../store/slices/candidateSlice'
import dayjs from 'dayjs'

const { Text, Title } = Typography

const InterviewHistory = () => {
  const dispatch = useDispatch()
  const { myInterviews, isLoading } = useSelector((state) => state.candidate)

  useEffect(() => {
    dispatch(fetchMyInterviews())
  }, [dispatch])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'processing'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 45) return '#34a853' // Green
    if (score >= 30) return '#fbbc04' // Yellow
    return '#ea4335' // Red
  }

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!myInterviews || myInterviews.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty
          description="No interviews found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={4} style={{ marginBottom: '24px', color: '#202124' }}>
        My Interview History
      </Title>
      
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
        dataSource={myInterviews}
        renderItem={(interview) => (
          <List.Item>
            <Card 
              className="meet-card"
              hoverable
              style={{ height: '100%' }}
            >
              <div style={{ marginBottom: '16px' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Tag color={getStatusColor(interview.status)}>
                    {interview.status.replace('_', ' ').toUpperCase()}
                  </Tag>
                  {interview.status === 'completed' && (
                    <div 
                      className="score-badge"
                      style={{ 
                        background: `linear-gradient(135deg, ${getScoreColor(interview.totalScore)}, ${getScoreColor(interview.totalScore)}dd)`
                      }}
                    >
                      <TrophyOutlined style={{ marginRight: '4px' }} />
                      {interview.totalScore}/60
                    </div>
                  )}
                </Space>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <Text strong style={{ color: '#202124', fontSize: '16px' }}>
                  Full-Stack Developer Interview
                </Text>
              </div>

              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <CalendarOutlined style={{ color: '#5f6368' }} />
                  <Text style={{ color: '#5f6368', fontSize: '14px' }}>
                    {dayjs(interview.createdAt).format('MMM DD, YYYY')}
                  </Text>
                </Space>

                {interview.completedAt && (
                  <Space>
                    <ClockCircleOutlined style={{ color: '#5f6368' }} />
                    <Text style={{ color: '#5f6368', fontSize: '14px' }}>
                      Completed: {dayjs(interview.completedAt).format('MMM DD, YYYY HH:mm')}
                    </Text>
                  </Space>
                )}

                {interview.status === 'completed' && interview.aiSummary && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #1a73e8'
                  }}>
                    <Text style={{ fontSize: '14px', color: '#202124' }}>
                      {interview.aiSummary}
                    </Text>
                  </div>
                )}

                {interview.status === 'in_progress' && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    background: '#fff3cd', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #fbbc04'
                  }}>
                    <Text style={{ fontSize: '14px', color: '#856404' }}>
                      Interview in progress - Question {(interview.currentQuestionIndex || 0) + 1} of 6
                    </Text>
                  </div>
                )}
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  )
}

export default InterviewHistory