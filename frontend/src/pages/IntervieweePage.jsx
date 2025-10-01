import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, Tabs, Button, message, Card, Typography, Space, Alert } from 'antd'
import { LogoutOutlined, UserOutlined, MessageOutlined, CheckCircleOutlined, InfoCircleOutlined, TrophyOutlined } from '@ant-design/icons'
import { logout } from '../store/slices/authSlice'
import { resetInterview, clearCompletedInterview } from '../store/slices/interviewSlice'
import ResumeUpload from '../components/ResumeUpload'
import ChatWindow from '../components/ChatWindow'
import InterviewHistory from '../components/InterviewHistory'

const { Header, Content } = Layout
const { Title, Text } = Typography

const IntervieweePage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { currentInterview, hasCompletedInterview, completedInterviewData } = useSelector((state) => state.interview)
  const [activeTab, setActiveTab] = useState('interview')

  const handleLogout = () => {
    dispatch(logout())
    dispatch(resetInterview())
    dispatch(clearCompletedInterview())
    message.success('Logged out successfully')
  }

  // Component to show completed interview message
  const CompletedInterviewMessage = () => (
    <div style={{ padding: '32px' }}>
      <Card className="meet-card" style={{ 
        textAlign: 'center', 
        maxWidth: '600px', 
        margin: '0 auto',
        border: '1px solid #dadce0',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #34a853, #137333)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 2px 8px rgba(52,168,83,.3)'
        }}>
          <CheckCircleOutlined style={{ fontSize: '40px', color: '#ffffff' }} />
        </div>
        
        <Title level={2} style={{ color: '#202124', marginBottom: '16px', fontWeight: '500' }}>
          Interview Successfully Completed!
        </Title>
        <Text style={{ color: '#5f6368', fontSize: '16px', display: 'block', marginBottom: '32px' }}>
          You have successfully attempted the interview
        </Text>
        
        {completedInterviewData && (
          <div style={{
            background: '#e8f5e8',
            border: '1px solid #34a853',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <TrophyOutlined style={{ color: '#34a853', fontSize: '16px' }} />
              <Text style={{ color: '#137333', fontWeight: '500', fontSize: '16px' }}>
                Your Score: {completedInterviewData.totalScore}/60
              </Text>
            </div>
            <Text style={{ color: '#5f6368', fontSize: '14px' }}>
              Completed on: {new Date(completedInterviewData.completedAt).toLocaleDateString()}
            </Text>
          </div>
        )}
        
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e8eaed',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <InfoCircleOutlined style={{ color: '#1a73e8', fontSize: '16px' }} />
            <Text style={{ color: '#202124', fontWeight: '500', fontSize: '16px' }}>
              Interview Completed
            </Text>
          </div>
          <Text style={{ color: '#5f6368', fontSize: '14px' }}>
            You have successfully completed your interview. You can view your detailed results or check your interview history.
          </Text>
        </div>
        
        <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<TrophyOutlined />}
            onClick={() => window.location.href = '/results'}
            className="meet-button"
            style={{ height: '48px', fontSize: '16px', minWidth: '180px' }}
          >
            View Detailed Results
          </Button>
          <Button 
            size="large"
            icon={<UserOutlined />}
            onClick={() => setActiveTab('history')}
            className="meet-button"
            style={{ height: '48px', fontSize: '16px', minWidth: '180px' }}
          >
            My Interview History
          </Button>
        </Space>
      </Card>
    </div>
  )

  const tabItems = [
    {
      key: 'interview',
      label: (
        <span>
          <MessageOutlined />
          Interview
        </span>
      ),
      children: hasCompletedInterview ? <CompletedInterviewMessage /> : (currentInterview ? <ChatWindow /> : <ResumeUpload />),
    },
    {
      key: 'history',
      label: (
        <span>
          <UserOutlined />
          My Interviews
        </span>
      ),
      children: <InterviewHistory />,
    },
  ]

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
            <MessageOutlined style={{ fontSize: '20px', color: '#ffffff' }} />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '500',
            color: '#202124'
          }}>
            Swipe AI Interview
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User Profile Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            boxShadow: '0 1px 2px 0 rgba(60,64,67,.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(60,64,67,.15)'
            e.currentTarget.style.borderColor = '#1a73e8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,.1)'
            e.currentTarget.style.borderColor = '#dadce0'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a73e8, #1557b0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(26,115,232,.2)'
            }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ 
                color: '#202124', 
                fontSize: '14px', 
                fontWeight: '500',
                lineHeight: '1.2'
              }}>
                {user?.name}
              </span>
              <span style={{ 
                color: '#5f6368', 
                fontSize: '12px',
                lineHeight: '1.2'
              }}>
                Candidate
              </span>
            </div>
          </div>
          
          {/* Logout Button */}
          <Button 
            type="text" 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ 
              color: '#5f6368',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              height: '40px',
              padding: '0 16px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ea4335'
              e.currentTarget.style.color = '#ea4335'
              e.currentTarget.style.background = '#fce8e6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#dadce0'
              e.currentTarget.style.color = '#5f6368'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Logout
          </Button>
        </div>
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
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            style={{ 
              padding: '0 24px',
              background: '#ffffff'
            }}
            tabBarStyle={{
              marginBottom: 0,
              borderBottom: '1px solid #e8eaed'
            }}
          />
        </div>
      </Content>
    </Layout>
  )
}

export default IntervieweePage