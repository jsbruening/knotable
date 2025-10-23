@echo off
REM SonarQube Analysis Script for Knotable (Windows)
REM This script runs a complete code quality analysis

echo 🔍 Starting SonarQube Analysis for Knotable...

REM Check if SONAR_TOKEN is set
if "%SONAR_TOKEN%"=="" (
    echo ❌ SONAR_TOKEN environment variable is not set
    echo Please set your SonarQube token:
    echo set SONAR_TOKEN=your_token_here
    pause
    exit /b 1
)

REM Check if SonarQube is running
echo 📡 Checking SonarQube connection...
curl -s http://localhost:9000/api/system/status >nul 2>&1
if errorlevel 1 (
    echo ❌ SonarQube is not running on localhost:9000
    echo Please start your local SonarQube instance first
    pause
    exit /b 1
)

echo ✅ SonarQube is running

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Run tests with coverage
echo 🧪 Running tests with coverage...
npm run test:coverage

REM Run linting
echo 🔧 Running ESLint...
npm run lint

REM Run type checking
echo 📝 Running TypeScript type check...
npm run typecheck

REM Run SonarQube analysis
echo 🔍 Running SonarQube analysis...
npm run sonar:local

echo ✅ Analysis complete!
echo 📊 View results at: http://localhost:9000/dashboard?id=knotable
pause
