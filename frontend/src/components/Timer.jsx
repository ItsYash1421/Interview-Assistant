import React from 'react'
import { ClockCircleOutlined } from '@ant-design/icons'

const Timer = ({ timeRemaining }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeRemaining <= 10) return '#ea4335' // Red for last 10 seconds
    if (timeRemaining <= 30) return '#fbbc04' // Yellow for last 30 seconds
    return '#34a853' // Green for normal time
  }

  return (
    <div 
      className="timer-display"
      style={{ 
        background: `linear-gradient(135deg, ${getTimerColor()}, ${getTimerColor()}dd)`,
        animation: timeRemaining <= 10 ? 'timer-pulse 1s infinite' : 'none'
      }}
    >
      <ClockCircleOutlined style={{ marginRight: '8px' }} />
      {formatTime(timeRemaining)}
    </div>
  )
}

export default Timer