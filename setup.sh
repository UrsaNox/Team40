#!/bin/bash

# Setup Script for Sign Language Communication System
# Automates initial setup of frontend, backend, and ML training environments

set -e

echo "================================"
echo "🤟 Sign Language Comm System Setup"
echo "================================"
echo ""

# Check dependencies
echo "✓ Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 16+"
    exit 1
fi

if ! command -v python &> /dev/null; then
    echo "✗ Python not found. Please install Python 3.9+"
    exit 1
fi

echo "✓ Dependencies found"
echo ""

# Setup Frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Setting up Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
else
    echo "npm packages already installed"
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file (edit with your API keys)"
fi

cd ..
echo "✓ Frontend setup complete"
echo ""

# Setup Backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Setting up Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file (add your GEMINI_API_KEY)"
fi

cd ..
echo "✓ Backend setup complete"
echo ""

# Setup ML Training
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Setting up ML Training..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ml-training
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Installing ML dependencies..."
pip install -r requirements.txt

cd ..
echo "✓ ML Training setup complete"
echo ""

# Final instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Edit configuration files:"
echo "   - frontend/.env (optional)"
echo "   - backend/.env (add GEMINI_API_KEY)"
echo ""
echo "2. Start the Backend:"
echo "   cd backend"
echo "   source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "   python -m uvicorn app.main:app --reload"
echo ""
echo "3. Start the Frontend (new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📖 For detailed instructions, see QUICKSTART.md"
echo ""
