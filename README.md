# Real-Time Bidirectional Sign Language Communication System

A lightweight, browser-based system enabling seamless real-time sign language communication over video calls.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Browser)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WebRTC/PeerJS Video Call (Real-time video stream)   │   │
│  └──────────────────────────────────────────────────────┘   │
│         ↓                                        ↑            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MediaPipe Holistic (Pose + Hand + Face Detection)   │   │
│  │  • Runs on-device for low latency                     │   │
│  │  • Extracts keypoints in real-time                    │   │
│  └──────────────────────────────────────────────────────┘   │
│         ↓                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TensorFlow.js LSTM Model (Sign Recognition)         │   │
│  │  • Recognizes sign language in browser                │   │
│  │  • Low latency, mobile-friendly                       │   │
│  └──────────────────────────────────────────────────────┘   │
│         ↓                                        ↑            │
└─────────────┼─────────────────────────────────┼─────────────┘
              │                                  │
              ↓ (Sign → Text)        (Text → Sign) ↑
        ┌─────────────────────────────────┐
        │    BACKEND (FastAPI + Gemini)   │
        │  • Sign recognition to speech   │
        │  • Text to sign translation     │
        └─────────────────────────────────┘
```

## Key Features

- **On-Device Processing**: MediaPipe + TensorFlow.js run directly in the browser
- **Real-Time Communication**: WebRTC/PeerJS for P2P video calls
- **Bidirectional Translation**: 
  - Sign → Text via Gemini Flash API
  - Text → Sign via pose-based avatar
- **Mobile Friendly**: Lightweight, no heavy installations
- **Low Latency**: Optimized for smooth, responsive communication

## Project Structure

```
.
├── frontend/                 # Vue/React app with WebRTC + MediaPipe
│   ├── public/
│   ├── src/
│   │   ├── components/       # React/Vue components
│   │   ├── services/         # WebRTC, MediaPipe, TF.js services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                  # FastAPI server
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # Pydantic models
│   │   └── services/
│   │       ├── gemini.py    # Gemini integration
│   │       └── translation.py
│   └── requirements.txt
├── ml-training/             # Model training pipeline
│   ├── train.py
│   ├── models/
│   └── requirements.txt
└── README.md
```

## Getting Started

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### ML Model Training
```bash
cd ml-training
pip install -r requirements.txt
python train.py
```

## Tech Stack

- **Frontend**: React/Vue, WebRTC, PeerJS, MediaPipe, TensorFlow.js
- **Backend**: FastAPI, Python
- **ML**: Keras, TensorFlow, MediaPipe
- **Deployment**: Browser-based (on-device) + FastAPI backend

## Development

1. Start with WebRTC implementation (peer connection)
2. Integrate MediaPipe for pose detection
3. Add TensorFlow.js LSTM inference
4. Connect FastAPI backend for translation
5. Implement pose avatar rendering
6. Deploy and test

## Next Steps

See individual README files in `frontend/`, `backend/`, and `ml-training/` for detailed setup and development instructions.
