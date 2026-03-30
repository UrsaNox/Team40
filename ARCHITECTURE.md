# Architecture & System Design

## Overview

Real-Time Bidirectional Sign Language Communication System consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT SIDE (Browser)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           WebRTC with PeerJS (Video Call)             │  │
│  │  • P2P video/audio connection                         │  │
│  │  • Low latency real-time communication                │  │
│  │  • Fallback TURN servers for NAT traversal            │  │
│  └──────────────────────────────────────────────────────┘  │
│                ↑                              ↓               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      MediaPipe Holistic (On-Device)                   │  │
│  │  • Detects 33 pose landmarks                          │  │
│  │  • Tracks 21 hand landmarks per hand                  │  │
│  │  • Extracts 468 face landmarks (optional)            │  │
│  │  • Runs at ~30 FPS on modern hardware                 │  │
│  │  • Low latency (<50ms per frame)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                ↓                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    TensorFlow.js LSTM Inference (On-Device)          │  │
│  │  • Buffered 30-frame sequence (~1 second)             │  │
│  │  • LSTM layers for temporal understanding             │  │
│  │  • Sign classification output                          │  │
│  │  • Confidence score per prediction                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                ↓                                             │
└────────────────┼─────────────────────────────────────────────┘
                 │ (HTTP REST API)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVER SIDE (FastAPI)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Translation Services                        │  │
│  │  • Sign ID + Context → Natural Language (Gemini)     │  │
│  │  • Text → Sign Sequence Mapping                       │  │
│  │  • Database lookup for common signs                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Gemini Flash API Integration                     │  │
│  │  • Contextual understanding of signs                  │  │
│  │  • Natural language generation                        │  │
│  │  • Semantic sign combination                          │  │
│  │  • Low latency (streaming response)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Sign Recognition & Translation

```
User Performs Sign
    ↓
MediaPipe extracts pose (33 pts) + hands (21×2 pts) + face (468 pts)
    ↓
Normalize: (1280, 720) → [0-1] range
    ↓
Buffer 30 frames @ 30 FPS = 1 second sequence
    ↓
TensorFlow.js LSTM inference
    ↓
Output: Sign ID + Confidence score
    ↓
Send to backend: POST /api/sign-to-text
    ↓
Backend Gemini API: "hello" → "Hey there! Good to see you!"
    ↓
Display in transcript
    ↓
Send to remote peer via PeerJS data channel
```

### 2. Speech/Text to Sign Display

```
Backend receives text: "hello how are you"
    ↓
NLP breakdown: ["hello", "how", "are", "you"]
    ↓
Map to sign IDs: [0, ?, ?, ?]
    ↓
Generate pose sequences for each sign
    ↓
Send JSON pose data to frontend
    ↓
PoseAvatarService animates skeleton
    ↓
Display on remote canvas/avatar
```

## Key Components

### Frontend

**Services:**
- `webrtcService.js` - PeerJS connections, signaling
- `mediapipeService.js` - Pose detection & landmark extraction
- `tfjsService.js` - LSTM model loading & inference
- `translationService.js` - Backend API integration
- `poseAvatarService.js` - Pose rendering & animation

**Components:**
- `VideoCall` - Main component, orchestrates all services
- Video elements with canvas overlay for pose visualization

### Backend

**Endpoints:**
- `POST /api/sign-to-text` - Translate recognized sign to text
- `POST /api/text-to-sign` - Convert text to sign sequence
- `POST /api/batch-sign-to-text` - Batch sign translation
- `GET /api/health` - Health check

**Services:**
- `gemini.py` - Google Gemini Flash API wrapper
- `translation.py` - Sign↔text translation logic

### ML Training

**Pipeline:**
1. Extract landmarks from videos using MediaPipe
2. Normalize and sequence data
3. Train LSTM model with Keras
4. Export to TensorFlow.js format
5. Deploy in browser

## Latency Analysis

| Component | Latency | Notes |
|-----------|---------|-------|
| Webcam capture | ~16-33ms | Depends on FPS (30-60) |
| MediaPipe inference | ~20-50ms | Pose extraction |
| Buffering 30 frames | ~1000ms | Sequential, but perceived latency lower |
| TensorFlow.js inference | ~10-30ms | LSTM on device |
| Backend round-trip | ~50-500ms | Network + Gemini API |
| **Total (one-way)** | ~1.1-2.6s | Acceptable for real-time communication |

## Scalability Considerations

### On-Device Processing
- **Advantage**: No server load, instant response, works offline
- **Disadvantage**: Device CPU/GPU limited

### Cloud Processing
- **Advantage**: More powerful models, better accuracy
- **Disadvantage**: Network latency, server cost

### Hybrid Approach (Recommended)
- MediaPipe + TensorFlow.js on device (fast, low latency)
- Gemini API on backend (better NLU, context)
- Cache common translations

## Mobile Optimization

For faster performance on mobile devices:

1. **Reduce pose complexity**: `model_complexity: 0`
2. **Lower video resolution**: 480p instead of 720p
3. **Increase buffering time**: 2 seconds instead of 1
4. **Disable face mesh**: Full FACEMESH adds overhead
5. **Batch inference**: Process fewer than 30 frames

## Security Considerations

1. **API Key Management**: Keep GEMINI_API_KEY in environment variables
2. **CORS**: Currently open (`allow_origins=["*"]`), restrict in production
3. **Rate Limiting**: Add to FastAPI endpoints for abuse prevention
4. **Peer Verification**: Validate peer IDs before connecting
5. **WebRTC Encryption**: PeerJS handles DTLS/SRTP automatically

## Deployment Checklist

- [ ] Update CORS settings with specific domains
- [ ] Set up proper STUN/TURN servers for NAT traversal
- [ ] Use HTTPS in production (required for WebRTC)
- [ ] Configure rate limiting on backend
- [ ] Set up monitoring/logging
- [ ] Database for storing conversations (optional)
- [ ] Test on various devices/networks
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling if needed

## Future Enhancements

1. **Better Models**: Fine-tune on real sign language videos
2. **Multi-user**: Support group calls (WebRTC mesh/SFU)
3. **Recording**: Store video conversations
4. **Translation Memory**: Improve consistency with context history
5. **Mobile Apps**: Native iOS/Android apps
6. **Accessibility**: Support for other disabilities
7. **Customization**: User-trained custom signs
8. **Gamification**: Learn signs through games/exercises
