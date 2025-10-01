import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Input, Button, Space, Tag, Typography, Card } from 'antd'
import { SearchOutlined, EyeOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons'
import { fetchCandidates, setFilters } from '../store/slices/candidateSlice'
import dayjs from 'dayjs'

const { Text } = Typography

const DashboardTable = ({ onViewCandidate }) => {
  const dispatch = useDispatch()
  const { candidates, pagination, filters, isLoading } = useSelector((state) => state.candidate)
  const [searchText, setSearchText] = useState(filters.search)

  useEffect(() => {
    dispatch(fetchCandidates(filters))
  }, [dispatch, filters])

  const handleSearch = (value) => {
    setSearchText(value)
    dispatch(setFilters({ search: value, page: 1 }))
  }

  const handleTableChange = (paginationConfig, filtersConfig, sorter) => {
    const newFilters = {
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }

    if (sorter.field) {
      newFilters.sortBy = sorter.field
      newFilters.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc'
    }

    dispatch(setFilters(newFilters))
  }

  const getScoreColor = (score) => {
    if (score >= 45) return 'success'
    if (score >= 30) return 'warning'
    return 'error'
  }

  const getScoreBadgeColor = (score) => {
    if (score >= 45) return '#34a853'
    if (score >= 30) return '#fbbc04'
    return '#ea4335'
  }

  const columns = [
    {
      title: 'Candidate Name',
      dataIndex: 'candidateName',
      key: 'candidateName',
      sorter: true,
      render: (text) => (
        <Text strong style={{ color: '#202124' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'candidateEmail',
      key: 'candidateEmail',
      render: (text) => (
        <Text style={{ color: '#5f6368' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'candidatePhone',
      key: 'candidatePhone',
      render: (text) => (
        <Text style={{ color: '#5f6368' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (score) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{
              background: `linear-gradient(135deg, ${getScoreBadgeColor(score)}, ${getScoreBadgeColor(score)}dd)`,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <TrophyOutlined />
            {score}/60
          </div>
          <Tag color={getScoreColor(score)}>
            {score >= 45 ? 'Excellent' : score >= 30 ? 'Good' : 'Needs Improvement'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Completed',
      dataIndex: 'completedAt',
      key: 'completedAt',
      sorter: true,
      render: (date) => (
        <Text style={{ color: '#5f6368' }}>
          {dayjs(date).format('MMM DD, YYYY HH:mm')}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onViewCandidate(record._id)}
          className="meet-button"
        >
          View Details
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: '32px' }}>
      <Card className="meet-card" style={{
        border: '1px solid #dadce0',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
      }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a73e8, #1557b0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              boxShadow: '0 2px 8px rgba(26,115,232,.3)'
            }}>
              <UserOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#202124', fontSize: '24px', fontWeight: '500' }}>
                Interview Candidates
              </h2>
              <Text style={{ color: '#5f6368', fontSize: '16px' }}>
                {pagination.total} candidates completed interviews
              </Text>
            </div>
          </div>
          
          <Input.Search
            placeholder="Search by name or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
            className="meet-input"
          />
        </div>

        <Table
          columns={columns}
          dataSource={candidates}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} candidates`,
          }}
          onChange={handleTableChange}
          className="meet-table"
          style={{ 
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        />
      </Card>
    </div>
  )
}

export default DashboardTable