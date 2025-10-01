import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, Button, message } from 'antd'
import { LogoutOutlined, DashboardOutlined } from '@ant-design/icons'
import { logout } from '../store/slices/authSlice'
import DashboardTable from '../components/DashboardTable'
import CandidateDetailModal from '../components/CandidateDetailModal'

const { Header, Content } = Layout

const InterviewerPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)

  const handleLogout = () => {
    dispatch(logout())
    message.success('Logged out successfully')
  }

  const handleViewCandidate = (candidateId) => {
    setSelectedCandidateId(candidateId)
  }

  const handleCloseModal = () => {
    setSelectedCandidateId(null)
  }

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
            <DashboardOutlined style={{ fontSize: '20px', color: '#ffffff' }} />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '500',
            color: '#202124'
          }}>
            Interview Dashboard
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
                Interviewer
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
          maxWidth: '1400px', 
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
          border: '1px solid #dadce0',
          padding: '24px'
        }}>
          <DashboardTable onViewCandidate={handleViewCandidate} />
        </div>
      </Content>

      <CandidateDetailModal
        candidateId={selectedCandidateId}
        visible={!!selectedCandidateId}
        onClose={handleCloseModal}
      />
    </Layout>
  )
}

export default InterviewerPage