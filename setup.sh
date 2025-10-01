#!/bin/bash

echo "🚀 Setting up Swipe AI Interview Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application:"
echo "   npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📝 Default accounts you can create:"
echo "   Interviewer: role = 'interviewer'"
echo "   Interviewee: role = 'interviewee'"
echo ""
echo "🎉 Happy interviewing!"