#!/bin/bash

echo "🚀 Starting Wanderbricks Travel Platform Development Server..."

# Check for Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found! Please install Python 3."
    exit 1
fi

echo "Using Python command: $PYTHON_CMD"

# Navigate to backend directory
cd backend

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Starting FastAPI server..."
$PYTHON_CMD startup.py