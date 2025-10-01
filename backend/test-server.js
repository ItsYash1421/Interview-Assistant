// Simple server test without PDF dependencies
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running successfully!',
    timestamp: new Date().toISOString()
  });
});

// Test MongoDB connection (optional)
app.get('/api/test-db', async (req, res) => {
  try {
    // This would test MongoDB connection
    res.json({ 
      status: 'OK', 
      message: 'Database connection would be tested here',
      mongoUri: process.env.MONGODB_URI ? 'Configured' : 'Not configured'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 DB test: http://localhost:${PORT}/api/test-db`);
});