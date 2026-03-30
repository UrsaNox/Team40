@echo off
REM Setup Script for Sign Language Communication System
REM Windows batch version

echo.
echo ================================
echo 🤟 Sign Language Comm System Setup
echo ================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Python not found. Please install Python 3.9+
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js not found. Please install Node.js 16+
    exit /b 1
)

echo ✓ Dependencies found
echo.

REM Frontend Setup
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📱 Setting up Frontend...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd frontend
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
) else (
    echo npm packages already installed
)

if not exist ".env" (
    copy .env.example .env
    echo Created .env file
)

cd ..
echo ✓ Frontend setup complete
echo.

REM Backend Setup
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔧 Setting up Backend...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd backend
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

if not exist ".env" (
    copy .env.example .env
    echo Created .env file
)

cd ..
echo ✓ Backend setup complete
echo.

REM ML Training Setup
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🤖 Setting up ML Training...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd ml-training
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing ML dependencies...
pip install -r requirements.txt

cd ..
echo ✓ ML Training setup complete
echo.

REM Final instructions
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Setup Complete!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🚀 Next steps:
echo.
echo 1. Edit configuration files:
echo    - backend\.env (add GEMINI_API_KEY)
echo.
echo 2. Start Backend (Command Prompt 1):
echo    cd backend
echo    venv\Scripts\activate
echo    python -m uvicorn app.main:app --reload
echo.
echo 3. Start Frontend (Command Prompt 2):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📖 For detailed instructions, see QUICKSTART.md
echo.
pause
