import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { store, persistor } from './store/store.js'
import App from './App.jsx'
import './index.css'


const theme = {
  token: {
    colorPrimary: '#1a73e8',
    colorSuccess: '#34a853',
    colorWarning: '#fbbc04',
    colorError: '#ea4335',
    colorInfo: '#1a73e8',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#dadce0',
    colorBorderSecondary: '#e8eaed',
    colorText: '#202124',
    colorTextSecondary: '#5f6368',
    colorTextTertiary: '#9aa0a6',
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusXL: 16,
    fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 18,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,
    lineHeight: 1.6,
    fontWeightStrong: 600,
    boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
    boxShadowSecondary: '0 1px 2px 0 rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15)',
    boxShadowTertiary: '0 4px 8px 3px rgba(60,64,67,.15), 0 1px 3px 0 rgba(60,64,67,.3)',
    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.1s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 500,
      fontSize: 14,
      height: 40,
      paddingInline: 20,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
      paddingLG: 24,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    Modal: {
      borderRadius: 16,
      boxShadow: '0 4px 8px 3px rgba(60,64,67,.15), 0 1px 3px 0 rgba(60,64,67,.3)',
      paddingLG: 24,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      boxShadow: '0 1px 2px 0 rgba(60,64,67,.1)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      boxShadow: '0 1px 2px 0 rgba(60,64,67,.1)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    Tabs: {
      borderRadius: 8,
      cardPadding: '20px 24px',
      itemPadding: '12px 16px',
    },
    Upload: {
      borderRadius: 12,
      padding: 20,
    },
    Typography: {
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
      fontWeightStrong: 600,
    },
    Layout: {
      bodyBg: '#f8f9fa',
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8f9fa',
      rowHoverBg: '#f8f9fa',
    },
    Progress: {
      borderRadius: 4,
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ConfigProvider theme={theme}>
            <App />
          </ConfigProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)