import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, Card, Typography, Progress, Tag, Space, Button, Row, Col, Divider, List } from 'antd'
import { ArrowLeftOutlined, TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography
const { Header, Content } = Layout

const ResultsPage = () => {
  const navigate = useNavigate()
  const { currentInterview } = useSelector((state) => state.interview)

  useEffect(() => {
    // Redirect if no completed interview
    if (!currentInterview || currentInterview.status !== 'completed') {
      navigate('/')
    }
  }, [currentInterview, navigate])

  if (!currentInterview || currentInterview.status !== 'completed') {
    return null
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

  const getScorePercentage = (score) => {
    return Math.round((score / 10) * 100)
  }

  const getOverallGrade = (totalScore) => {
    if (totalScore >= 50) return { grade: 'A+', color: '#34a853', text: 'Excellent' }
    if (totalScore >= 45) return { grade: 'A', color: '#34a853', text: 'Very Good' }
    if (totalScore >= 40) return { grade: 'B+', color: '#fbbc04', text: 'Good' }
    if (totalScore >= 35) return { grade: 'B', color: '#fbbc04', text: 'Satisfactory' }
    if (totalScore >= 30) return { grade: 'C+', color: '#fbbc04', text: 'Fair' }
    if (totalScore >= 25) return { grade: 'C', color: '#ea4335', text: 'Below Average' }
    return { grade: 'D', color: '#ea4335', text: 'Needs Improvement' }
  }

  const overallGrade = getOverallGrade(currentInterview.totalScore)

  // Calculate scores by difficulty
  const easyScores = currentInterview.questions.slice(0, 2).reduce((sum, q) => sum + q.score, 0)
  const mediumScores = currentInterview.questions.slice(2, 4).reduce((sum, q) => sum + q.score, 0)
  const hardScores = currentInterview.questions.slice(4, 6).reduce((sum, q) => sum + q.score, 0)

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header style={{ 
        background: '#ffffff',
        borderBottom: '1px solid #dadce0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        height: '64px',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1a73e8, #1557b0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <TrophyOutlined style={{ fontSize: '20px', color: '#ffffff' }} />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '500',
            color: '#202124'
          }}>
            Interview Results
          </h1>
        </div>
        
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          className="meet-button"
          style={{ height: '40px' }}
        >
          Go to Home
        </Button>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
          border: '1px solid #dadce0',
          overflow: 'hidden'
        }}>
          
          {/* Overall Score Section */}
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #1a73e8, #1557b0)', 
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <TrophyOutlined style={{ fontSize: '40px', color: '#ffffff' }} />
            </div>
            
            <Title level={2} style={{ color: '#ffffff', marginBottom: '16px', fontWeight: '500' }}>
              Interview Completed!
            </Title>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: '16px', 
              padding: '32px',
              display: 'inline-block',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '8px', lineHeight: 1 }}>
                {currentInterview.totalScore}/60
              </div>
              <div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px', color: 'rgba(255,255,255,0.9)' }}>
                Grade: {overallGrade.grade} ({overallGrade.text})
              </div>
              <Progress 
                percent={Math.round((currentInterview.totalScore / 60) * 100)} 
                strokeColor="#ffffff"
                trailColor="rgba(255,255,255,0.3)"
                style={{ maxWidth: '300px', margin: '0 auto' }}
                strokeWidth={8}
              />
            </div>
          </div>

          {/* Score Breakdown */}
          <div style={{ padding: '32px' }}>
            <Title level={3} style={{ marginBottom: '24px', textAlign: 'center' }}>
              Performance Breakdown
            </Title>
            
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
              <Col xs={24} md={8}>
                <Card className="meet-card" style={{ textAlign: 'center' }}>
                  <Tag color="success" style={{ fontSize: '16px', padding: '8px 16px', marginBottom: '16px' }}>
                    EASY QUESTIONS
                  </Tag>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#34a853', marginBottom: '8px' }}>
                    {easyScores}/20
                  </div>
                  <Progress 
                    percent={Math.round((easyScores / 20) * 100)} 
                    strokeColor="#34a853"
                    style={{ marginBottom: '8px' }}
                  />
                  <Text style={{ color: '#5f6368' }}>
                    Average: {Math.round(easyScores / 2)}/10 per question
                  </Text>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card className="meet-card" style={{ textAlign: 'center' }}>
                  <Tag color="warning" style={{ fontSize: '16px', padding: '8px 16px', marginBottom: '16px' }}>
                    MEDIUM QUESTIONS
                  </Tag>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fbbc04', marginBottom: '8px' }}>
                    {mediumScores}/20
                  </div>
                  <Progress 
                    percent={Math.round((mediumScores / 20) * 100)} 
                    strokeColor="#fbbc04"
                    style={{ marginBottom: '8px' }}
                  />
                  <Text style={{ color: '#5f6368' }}>
                    Average: {Math.round(mediumScores / 2)}/10 per question
                  </Text>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card className="meet-card" style={{ textAlign: 'center' }}>
                  <Tag color="error" style={{ fontSize: '16px', padding: '8px 16px', marginBottom: '16px' }}>
                    HARD QUESTIONS
                  </Tag>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ea4335', marginBottom: '8px' }}>
                    {hardScores}/20
                  </div>
                  <Progress 
                    percent={Math.round((hardScores / 20) * 100)} 
                    strokeColor="#ea4335"
                    style={{ marginBottom: '8px' }}
                  />
                  <Text style={{ color: '#5f6368' }}>
                    Average: {Math.round(hardScores / 2)}/10 per question
                  </Text>
                </Card>
              </Col>
            </Row>

            {/* AI Summary */}
            {currentInterview.aiSummary && (
              <Card className="meet-card" style={{ marginBottom: '32px' }}>
                <Title level={4} style={{ marginBottom: '16px', color: '#202124' }}>
                  AI Assessment Summary
                </Title>
                <div style={{ 
                  padding: '20px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #1a73e8'
                }}>
                  <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                    {currentInterview.aiSummary}
                  </Paragraph>
                </div>
              </Card>
            )}

            {/* Detailed Q&A */}
            <Card className="meet-card">
              <Title level={4} style={{ marginBottom: '24px', color: '#202124' }}>
                Detailed Question & Answer Review
              </Title>
              
              <List
                dataSource={currentInterview.questions}
                renderItem={(question, index) => (
                  <List.Item style={{ padding: '24px 0', borderBottom: '1px solid #e8eaed' }}>
                    <div style={{ width: '100%' }}>
                      {/* Question Header */}
                      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <Space style={{ marginBottom: '12px' }}>
                            <Text strong style={{ color: '#202124', fontSize: '18px' }}>
                              Question {index + 1}
                            </Text>
                            <Tag color={getDifficultyColor(question.difficulty)} style={{ fontSize: '12px', padding: '4px 12px' }}>
                              {question.difficulty.toUpperCase()}
                            </Tag>
                            <Space>
                              <ClockCircleOutlined style={{ color: '#5f6368' }} />
                              <Text style={{ color: '#5f6368', fontSize: '14px' }}>
                                {question.timeLimit}s limit
                              </Text>
                            </Space>
                          </Space>
                          <div style={{ 
                            background: '#f1f3f4', 
                            padding: '16px', 
                            borderRadius: '8px',
                            marginBottom: '16px'
                          }}>
                            <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
                              {question.question}
                            </Text>
                          </div>
                        </div>
                        <div 
                          style={{
                            background: `linear-gradient(135deg, ${getScoreColor(question.score)}, ${getScoreColor(question.score)}dd)`,
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            marginLeft: '16px',
                            minWidth: '80px',
                            textAlign: 'center'
                          }}
                        >
                          {question.score}/10
                        </div>
                      </div>

                      {/* Answer */}
                      <div>
                        <Text strong style={{ color: '#202124', fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                          Your Answer:
                        </Text>
                        <div style={{ 
                          background: 'white', 
                          border: '1px solid #e8eaed',
                          padding: '16px', 
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}>
                          <Text style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: '1.5' }}>
                            {question.answer || 'No answer provided'}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: '#5f6368', fontSize: '14px' }}>
                            Time spent: {question.timeSpent}s / {question.timeLimit}s
                          </Text>
                          <Progress 
                            percent={getScorePercentage(question.score)} 
                            strokeColor={getScoreColor(question.score)}
                            style={{ width: '120px' }}
                            showInfo={false}
                          />
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default ResultsPage
