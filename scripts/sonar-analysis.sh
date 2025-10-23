#!/bin/bash
# SonarQube Analysis Script for Knotable
# This script runs a complete code quality analysis

echo "🔍 Starting SonarQube Analysis for Knotable..."

# Check if SONAR_TOKEN is set
if [ -z "$SONAR_TOKEN" ]; then
    echo "❌ SONAR_TOKEN environment variable is not set"
    echo "Please set your SonarQube token:"
    echo "export SONAR_TOKEN=your_token_here"
    exit 1
fi

# Check if SonarQube is running
echo "📡 Checking SonarQube connection..."
if ! curl -s http://localhost:9000/api/system/status > /dev/null; then
    echo "❌ SonarQube is not running on localhost:9000"
    echo "Please start your local SonarQube instance first"
    exit 1
fi

echo "✅ SonarQube is running"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage

# Run linting
echo "🔧 Running ESLint..."
npm run lint

# Run type checking
echo "📝 Running TypeScript type check..."
npm run typecheck

# Run SonarQube analysis
echo "🔍 Running SonarQube analysis..."
npm run sonar:local

echo "✅ Analysis complete!"
echo "📊 View results at: http://localhost:9000/dashboard?id=knotable"
