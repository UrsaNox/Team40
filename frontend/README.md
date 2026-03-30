# Frontend - Real-Time Sign Language Communication

Browser-based frontend handling video calls, sign detection, and real-time translation.

## Features

- **WebRTC Video Calls**: PeerJS-based P2P video communication
- **Real-Time Pose Detection**: MediaPipe Holistic running on-device
- **Sign Recognition**: TensorFlow.js LSTM model inference
- **Bidirectional Translation**: 
  - Display recognized signs as text
  - Render text as pose-based sign animation

## Setup

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── VideoCall.jsx        # Main video call UI component
│   ├── PoseCanvas.jsx       # Pose visualization
│   ├── TranscriptDisplay.jsx # Text/translation display
│   └── AvatarRenderer.jsx   # Pose-based avatar
├── services/
│   ├── webrtcService.js     # PeerJS + WebRTC logic
│   ├── mediapipeService.js  # MediaPipe Holistic setup
│   ├── tfjsService.js       # TensorFlow.js model inference
│   ├── poseAvatarService.js # Avatar rendering from pose data
│   └── translationService.js # Backend API calls
├── App.jsx
└── main.jsx
public/
└── index.html
```

## Key Implementation Steps

1. **PeerJS Connection** (WebRTC):
   - Set up peer connections
   - Handle offer/answer exchange
   - Stream video/audio

2. **MediaPipe Integration**:
   - Initialize Holistic detector
   - Extract pose landmarks from webcam
   - Normalize and prepare for ML model

3. **TensorFlow.js LSTM**:
   - Load pre-trained model
   - Real-time inference on pose data
   - Output sign predictions

4. **Backend Translation**:
   - Send recognized signs to FastAPI
   - Receive natural language text
   - Send received text for sign translation

5. **Pose Avatar**:
   - Render skeleton from pose landmarks
   - Animate transitions smoothly
   - Display incoming translations

## API Endpoints (Backend Integration)

```
POST /sign-to-text
- Input: { sign_id, confidence }
- Output: { text, natural_language }

POST /text-to-sign
- Input: { text }
- Output: { pose_sequence, frames }
```

## Deployment

Build for production:
```bash
npm run build
```

Outputs optimized build to `dist/` for deployment.
