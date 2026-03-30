# Sign Language Communication System - Files Overview

## 📋 Project Structure

```
sign-lang-comm/
├── README.md                          # Main documentation
├── QUICKSTART.md                      # 10-minute quick start guide
├── ARCHITECTURE.md                    # System design & components
├── DOCKER.md                          # Docker deployment guide
├── setup.sh / setup.bat               # Automated setup scripts
│
├── frontend/                          # React/Vite web application
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Build configuration
│   ├── .env.example                   # Environment template
│   ├── public/
│   │   └── index.html                 # HTML entry point
│   └── src/
│       ├── main.jsx                   # React entry point
│       ├── App.jsx                    # Main app component
│       ├── App.css                    # Global styles
│       ├── index.css                  # Base styles
│       ├── components/
│       │   ├── VideoCall.jsx          # Video call component (main UI)
│       │   └── VideoCall.css          # Video call styles
│       └── services/
│           ├── webrtcService.js       # PeerJS WebRTC connections ⭐
│           ├── mediapipeService.js    # MediaPipe pose detection ⭐
│           ├── tfjsService.js         # TensorFlow.js LSTM inference ⭐
│           ├── translationService.js  # Backend API integration
│           └── poseAvatarService.js   # Pose visualization & animation
│
├── backend/                           # FastAPI Python server
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment template
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app & routes ⭐
│   │   ├── config.py                  # Configuration
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── gemini.py              # Google Gemini API wrapper ⭐
│   │       └── translation.py         # Translation logic
│   
├── ml-training/                       # Model training pipeline
│   ├── requirements.txt               # ML dependencies
│   ├── train.py                       # Training script ⭐
│   └── export_to_tfjs.py              # Export to TensorFlow.js ⭐
│
└── .gitignore                         # Git ignore rules
```

## 🔄 Data Flow

### User Signing → Translation
1. **User performs sign** → MediaPipe detects pose
2. **Landmarks extracted** → Normalized to [0-1] range
3. **30-frame sequence buffered** → Sent to TensorFlow.js
4. **LSTM inference** → Sign ID + confidence
5. **Backend translation** → Gemini API converts to natural language
6. **Display result** → Show in UI + send to peer

### Speech/Text → Sign Avatar
1. **Text input received** → Backend processes
2. **Sign sequence generated** → Maps to sign IDs
3. **Pose sequences created** → Landmarks for animation
4. **Frontend receives** → PoseAvatarService renders
5. **Avatar animates** → Shows corresponding signs

## 🎯 Key Files Explained

### Frontend (React + WebRTC + ML)
- **webrtcService.js** - Handles P2P video calls using PeerJS
  - Manages peer connections
  - Handles video/audio streams
  - Data channel for pose/sign sharing
  
- **mediapipeService.js** - Real-time pose detection
  - Initializes MediaPipe Holistic
  - Extracts 1662 landmarks (pose + hands + face)
  - Normalizes coordinates
  - ~30 FPS on modern devices

- **tfjsService.js** - Sign recognition inference
  - Loads LSTM model from TensorFlow.js format
  - Buffers 30-frame sequences
  - Runs prediction when ready
  - Returns sign ID + confidence

- **VideoCall.jsx** - Main orchestration component
  - Coordinates all services
  - Manages UI state
  - Handles user interactions

### Backend (FastAPI + Gemini)
- **main.py** - REST API endpoints
  - `/api/sign-to-text` - Translate recognized signs
  - `/api/text-to-sign` - Generate sign sequences
  - `/api/health` - Service status

- **gemini.py** - AI translation layer
  - Calls Google Gemini Flash API
  - Generates natural language from signs
  - Contextual understanding

### ML Training
- **train.py** - LSTM model training
  - Builds model architecture
  - Trains on landmark sequences
  - Evaluates performance

- **export_to_tfjs.py** - Model conversion
  - Converts Keras to TensorFlow.js format
  - Exports for browser deployment

## 🚀 Getting Started

### Option 1: Automated Setup (Recommended)
```bash
# Windows
setup.bat

# Linux/macOS
bash setup.sh
```

### Option 2: Manual Setup
```bash
# Frontend
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000

# Backend (new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload  # http://localhost:8000
```

## ⭐ Critical Components by Priority

**Phase 1 (MVP):**
1. WebRTC video call (VideoCall.jsx + webrtcService.js)
2. MediaPipe pose detection (mediapipeService.js)
3. Basic sign display (PoseAvatarService)

**Phase 2:**
1. TensorFlow.js inference (tfjsService.js)
2. Backend API integration (translationService.js)
3. Sign recognition

**Phase 3:**
1. Gemini API integration
2. Model training (train.py)
3. Performance optimization

## 📊 File Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| Frontend Components | 2 | UI and orchestration |
| Frontend Services | 5 | Core functionality (WebRTC, ML, etc.) |
| Backend Endpoints | 4+ | REST API routes |
| Backend Services | 2 | Translation & AI |
| Config Files | 4 | Environment setup |
| Documentation | 4 | Guides and architecture |
| Scripts | 2 | Setup automation |

## 🔧 Configuration Files

- `.env` files contain sensitive keys (API keys, URLs)
- `.env.example` files show what variables are needed
- Never commit `.env` files to version control

## 📦 Dependencies Overview

### Frontend
- `react`, `react-dom` - UI framework
- `peerjs` - WebRTC abstraction
- `@tensorflow/tfjs` - ML inference
- `@mediapipe/holistic` - Pose detection
- `axios` - HTTP client
- `vite` - Build tool

### Backend
- `fastapi` - Web framework
- `google-generativeai` - Gemini API
- `pydantic` - Data validation
- `uvicorn` - ASGI server

### ML Training
- `tensorflow`, `keras` - Model building
- `mediapipe` - Pose extraction
- `numpy`, `scipy` - Numerical computing
- `scikit-learn` - ML utilities

## 🎓 Learning Path

1. Start with QUICKSTART.md
2. Read ARCHITECTURE.md to understand the system
3. Review [VideoCall.jsx](frontend/src/components/VideoCall.jsx) for integration
4. Study individual services for deep dive
5. Check main.py for backend logic
6. Explore train.py for ML pipeline

---

**Happy building! 🤟**
