import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Upload, Button, Form, Input, message, Space, Typography, Row, Col, Alert } from 'antd'
import { InboxOutlined, FileTextOutlined, UserOutlined, MailOutlined, PhoneOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { uploadResume, updateCandidateInfo, clearCompletedInterview } from '../store/slices/interviewSlice'
import { getInterviewId } from '../utils/interviewUtils'

const { Dragger } = Upload
const { Title, Text } = Typography

const ResumeUpload = () => {
  const dispatch = useDispatch()
  const { 
    currentInterview, 
    isLoading, 
    hasCompletedInterview, 
    completedInterviewData 
  } = useSelector((state) => state.interview)
  const [form] = Form.useForm()
  const [showCandidateForm, setShowCandidateForm] = useState(false)


  const handleFileUpload = async (file) => {
    try {
      const result = await dispatch(uploadResume(file)).unwrap()
      
      // Check if any required fields are missing
      const missingFields = result.interview.missingFields
      if (missingFields.name || missingFields.email || missingFields.phone) {
        setShowCandidateForm(true)
        
        // Pre-fill form with extracted data
        form.setFieldsValue({
          name: result.interview.candidateInfo.name || '',
          email: result.interview.candidateInfo.email || '',
          phone: result.interview.candidateInfo.phone || ''
        })
        
        message.info('Please complete your information before starting the interview')
      } else {
        message.success('Resume uploaded successfully! You can now start the interview.')
      }
    } catch (error) {
      // The error handling is now done in the Redux slice
      message.error(error)
    }
    
    return false // Prevent default upload behavior
  }

  const handleCandidateInfoSubmit = async (values) => {
    try {
      const interviewId = getInterviewId(currentInterview)
      if (!interviewId) {
        message.error('Interview ID not found. Please try uploading your resume again.')
        return
      }
      
      await dispatch(updateCandidateInfo({
        interviewId,
        candidateInfo: values
      })).unwrap()
      
      setShowCandidateForm(false)
      message.success('Information updated successfully! You can now start the interview.')
    } catch (error) {
      message.error(error)
    }
  }

  const uploadProps = {
    name: 'resume',
    multiple: false,
    accept: '.pdf,.docx',
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      if (!isValidType) {
        message.error('Only PDF and DOCX files are allowed')
        return Upload.LIST_IGNORE
      }
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('File must be smaller than 10MB')
        return Upload.LIST_IGNORE
      }
      return handleFileUpload(file)
    },
    showUploadList: false,
  }

  // Show completed interview message
  if (hasCompletedInterview) {
    return (
      <div style={{ padding: '32px' }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <Card className="meet-card" style={{ 
              textAlign: 'center',
              border: '1px solid #dadce0',
              boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34a853, #137333)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 2px 8px rgba(52,168,83,.3)'
              }}>
                <CheckCircleOutlined style={{ fontSize: '32px', color: '#ffffff' }} />
              </div>
              
              <Title level={3} style={{ color: '#202124', marginBottom: '12px', fontWeight: '500' }}>
                Interview Already Completed
              </Title>
              <Text style={{ color: '#5f6368', fontSize: '16px', display: 'block', marginBottom: '24px' }}>
                You have successfully attempted the interview
              </Text>
              
              {completedInterviewData && (
                <div style={{
                  background: '#e8f5e8',
                  border: '1px solid #34a853',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <InfoCircleOutlined style={{ color: '#34a853', fontSize: '16px' }} />
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
                background: '#fef7e0',
                border: '1px solid #fbbc04',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <InfoCircleOutlined style={{ color: '#fbbc04', fontSize: '16px' }} />
                  <Text style={{ color: '#b06000', fontWeight: '500', fontSize: '16px' }}>
                    Re-attempt Required
                  </Text>
                </div>
                <Text style={{ color: '#5f6368', fontSize: '14px' }}>
                  To take the interview again, please contact the interviewer to enable re-attempt from their dashboard.
                </Text>
              </div>
              
              <Button 
                type="primary" 
                size="large"
                onClick={() => window.location.href = '/results'}
                className="meet-button"
                style={{ height: '48px', fontSize: '16px', minWidth: '200px' }}
              >
                View Previous Results
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  if (showCandidateForm && currentInterview) {
    return (
      <div style={{ padding: '24px' }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <Card className="meet-card" style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: '48px', color: '#1a73e8', marginBottom: '16px' }} />
              <Title level={3} style={{ color: '#202124', marginBottom: '8px' }}>
                Complete Your Information
              </Title>
              <Text style={{ color: '#5f6368', fontSize: '16px', display: 'block', marginBottom: '32px' }}>
                We need some additional information before starting your interview
              </Text>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleCandidateInfoSubmit}
                size="large"
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Enter your full name"
                    className="meet-input"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Enter your email address"
                    className="meet-input"
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input 
                    prefix={<PhoneOutlined />} 
                    placeholder="Enter your phone number"
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
                    Continue to Interview
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card className="meet-card" style={{ 
            textAlign: 'center',
            border: '1px solid #dadce0',
            boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a73e8, #1557b0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 2px 8px rgba(26,115,232,.3)'
            }}>
              <FileTextOutlined style={{ fontSize: '32px', color: '#ffffff' }} />
            </div>
            
            <Title level={2} style={{ color: '#202124', marginBottom: '12px', fontWeight: '500' }}>
              Upload Your Resume
            </Title>
            <Text style={{ color: '#5f6368', fontSize: '16px', display: 'block', marginBottom: '32px' }}>
              Upload your resume to start the AI-powered interview process
            </Text>

            <Dragger {...uploadProps} style={{ 
              marginBottom: '24px',
              background: '#f8f9fa',
              border: '2px dashed #dadce0',
              borderRadius: '12px',
              padding: '40px 20px',
              transition: 'all 0.2s ease'
            }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#1a73e8', fontSize: '48px' }} />
              </p>
              <p className="ant-upload-text" style={{ color: '#202124', fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint" style={{ color: '#5f6368', fontSize: '14px' }}>
                Support for PDF and DOCX files only. Maximum file size: 10MB
              </p>
            </Dragger>

            <div style={{
              background: '#f8f9fa',
              border: '1px solid #e8eaed',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'left'
            }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#34a853',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>✓</div>
                  <Text style={{ color: '#202124', fontSize: '14px', fontWeight: '500' }}>
                    We'll extract your name, email, and phone number automatically
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#34a853',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>✓</div>
                  <Text style={{ color: '#202124', fontSize: '14px', fontWeight: '500' }}>
                    6 AI-generated questions (2 Easy, 2 Medium, 2 Hard)
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#34a853',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>✓</div>
                  <Text style={{ color: '#202124', fontSize: '14px', fontWeight: '500' }}>
                    Timed interview with automatic progression
                  </Text>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ResumeUpload