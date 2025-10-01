import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Form, Input, Button, Tabs, Select, message, Row, Col, Typography } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, SafetyOutlined, ThunderboltOutlined, BarChartOutlined } from '@ant-design/icons'
import { login, register, clearError } from '../store/slices/authSlice'

const { Title, Text } = Typography

const { Option } = Select

const AuthPage = () => {
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async (values) => {
    try {
      await dispatch(login(values)).unwrap()
      message.success('Login successful!')
    } catch (error) {
      message.error(error)
    }
  }

  const handleRegister = async (values) => {
    try {
      await dispatch(register(values)).unwrap()
      message.success('Registration successful!')
    } catch (error) {
      message.error(error)
    }
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
    dispatch(clearError())
  }

  const loginForm = (
    <Form
      name="login"
      onFinish={handleLogin}
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="Enter your email"
          className="meet-input"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="Enter your password"
          className="meet-input"
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={isLoading}
          block
          className="meet-button"
          style={{ height: '48px', fontSize: '16px' }}
        >
          Sign In
        </Button>
      </Form.Item>
    </Form>
  )

  const registerForm = (
    <Form
      name="register"
      onFinish={handleRegister}
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="name"
        label="Full Name"
        rules={[{ required: true, message: 'Please input your name!' }]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Enter your full name"
          className="meet-input"
        />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="Enter your email"
          className="meet-input"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Please input your password!' },
          { min: 6, message: 'Password must be at least 6 characters!' }
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="Enter your password"
          className="meet-input"
        />
      </Form.Item>

      <Form.Item
        name="role"
        label="Role"
        rules={[{ required: true, message: 'Please select your role!' }]}
      >
        <Select 
          placeholder="Select your role"
          className="meet-input"
        >
          <Option value="interviewee">Interviewee (Candidate)</Option>
          <Option value="interviewer">Interviewer (HR/Manager)</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={isLoading}
          block
          className="meet-button"
          style={{ height: '48px', fontSize: '16px' }}
        >
          Create Account
        </Button>
      </Form.Item>
    </Form>
  )

  const tabItems = [
    {
      key: 'login',
      label: 'Sign In',
      children: loginForm,
    },
    {
      key: 'register',
      label: 'Create Account',
      children: registerForm,
    },
  ]

  return (
    <div className="landing-page" style={{ 
      display: 'flex',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      
      <Row justify="center" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Left Side - Features */}
        <Col xs={24} lg={12} style={{ padding: '0 20px', marginBottom: '40px' }}>
          <div style={{ color: 'white', maxWidth: '500px' }}>
            <Title level={1} style={{ 
              color: 'white', 
              fontSize: '48px', 
              fontWeight: '700', 
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              Welcome to Swipe AI
            </Title>
            
            <Text style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '20px', 
              display: 'block',
              marginBottom: '48px',
              lineHeight: '1.5'
            }}>
              Your all-in-one solution for AI-powered interviews and candidate assessment
            </Text>

            {/* Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SafetyOutlined style={{ fontSize: '24px', color: 'white' }} />
                  </div>
                  <Title level={4} style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    Secure Authentication
                  </Title>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.5' }}>
                  Enterprise-grade security with JWT authentication and role-based access control
                </Text>
              </div>

              <div className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ThunderboltOutlined style={{ fontSize: '24px', color: 'white' }} />
                  </div>
                  <Title level={4} style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    Fast & Efficient
                  </Title>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.5' }}>
                  Lightning-fast AI question generation and real-time interview analytics
                </Text>
              </div>

              <div className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BarChartOutlined style={{ fontSize: '24px', color: 'white' }} />
                  </div>
                  <Title level={4} style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    Smart Analytics
                  </Title>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.5' }}>
                  Advanced AI insights and comprehensive performance tracking for candidates
                </Text>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Side - Login Card */}
        <Col xs={24} lg={12} style={{ padding: '0 20px' }}>
          <Card 
            className="auth-card"
            style={{ 
              maxWidth: '400px',
              margin: '0 auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2} style={{ 
                color: '#1a73e8', 
                fontSize: '28px', 
                fontWeight: '700', 
                marginBottom: '8px'
              }}>
                Get Started
              </Title>
              <Text style={{ 
                color: '#5f6368', 
                fontSize: '16px'
              }}>
                Sign in to access your dashboard
              </Text>
            </div>

            <Tabs 
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems}
              centered
              size="large"
              style={{ marginTop: '20px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AuthPage