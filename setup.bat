@echo off
echo 🚀 Setting up Swipe AI Interview Assistant...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

REM Install root dependencies
call npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

echo ✅ Setup complete!
echo.
echo 🎯 To start the application:
echo    npm run dev
echo.
echo 🌐 The application will be available at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo 📝 Default accounts you can create:
echo    Interviewer: role = 'interviewer'
echo    Interviewee: role = 'interviewee'
echo.
echo 📄 Note: PDF parsing uses mock data for demo
echo    See README.md for production PDF setup
echo.
echo 🎉 Happy interviewing!
pause