# Quick Start Guide

Get the Sign Language Communication System running locally in 10 minutes!

## Prerequisites

- Node.js 16+ and npm
- Python 3.9+
- Git
- A webcam and microphone

## 1️⃣ Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend will open at `http://localhost:3000`

## 2️⃣ Setup Backend

In a new terminal:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run server
python -m uvicorn app.main:app --reload
```

Backend API runs at `http://localhost:8000`

API Docs: `http://localhost:8000/docs`

## 3️⃣ Test the System

### Option A: Same Machine (Local Testing)

1. Open frontend in one browser window
2. Copy your Peer ID from the interface
3. Open frontend in another browser window (or tab)
4. Paste Peer ID and click "Call"
5. Both sides should see each other's video and pose detection

### Option B: Different Machines

1. Make sure backend firewall allows port 8000
2. Update frontend `.env` to point to your backend IP:
   ```
   VITE_API_URL=http://<your-ip>:8000
   ```
3. Share your Peer ID with another machine
4. They call you using PeerJS

## 4️⃣ Try Sign Recognition

1. Once connected, perform sign language gestures in front of the camera
2. The system will:
   - Detect your pose in real-time (green skeleton)
   - Buffer 30 frames (1 second)
   - Run LSTM inference
   - Send recognized sign to backend
   - Gemini API converts to natural language
   - Display translation

## 🎯 Next Steps

### Train Your Own Model

```bash
cd ml-training

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Prepare dataset
# Create data/ directory with sign videos organized by sign type
# data/
#   ├── hello/
#   │   ├── video1.mp4
#   │   └── video2.mp4
#   ├── goodbye/
#   │   └── ...

# Extract pose landmarks from videos
python extract_landmarks.py --data-dir data/

# Train model
python train.py --epochs 50 --batch-size 32

# Export to TensorFlow.js
python export_to_tfjs.py --model models/lstm_model.h5 --output ../frontend/public/models/
```

### Deploy to Production

Frontend:
```bash
npm run build
# Deploy dist/ to any static hosting (Vercel, Netlify, etc.)
```

Backend:
```bash
# Deploy to cloud (Heroku, AWS, Google Cloud, etc.)
# Update CORS and backend URLs accordingly
```

## 🔧 Troubleshooting

**"Failed to connect to backend"**
- Make sure backend is running on port 8000
- Check CORS settings in `app/main.py`
- Verify firewall allows the connection

**"Cannot access webcam"**
- Allow browser permission to access camera
- Check if another app is using the camera
- Try incognito/private browser window

**"Low sign recognition accuracy"**
- Train model with more diverse data
- Ensure good lighting
- Position yourself fully in frame
- Perform signs more deliberately

**"Gemini API errors"**
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota at console.cloud.google.com
- Ensure internet connection is stable

## 📊 Architecture Overview

```
Browser (Frontend)
├── WebRTC/PeerJS (Video Call)
├── MediaPipe (Pose Detection) → Canvas Rendering
├── TensorFlow.js LSTM (Sign Recognition)
└── HTTP → FastAPI Backend

FastAPI Backend
├── Sign→Text Translation (Gemini Flash)
└── Text→Sign Conversion

Optional: ML Training Pipeline
├── Extract Landmarks (MediaPipe)
├── Train LSTM Model (Keras)
└── Export to TensorFlow.js
```

## 📱 Mobile Support

The system is designed to work on mobile phones! 

To test on mobile:
1. Make sure backend is accessible from mobile
2. Update frontend to use your computer's IP:
   ```
   VITE_API_URL=http://<your-computer-ip>:8000
   ```
3. Access frontend from phone's browser

Note: Performance depends on device capabilities. Modern phones (last 2-3 years) work best.

## 🚀 Performance Tips

- **Better Accuracy**: 
  - Better lighting and clear background
  - Position camera at shoulder height
  - Use gestures that clearly show hands/body

- **Lower Latency**:
  - Reduce video resolution if needed
  - Use local backend (not remote)
  - Close other browser tabs/apps

- **Mobile Optimization**:
  - Reduce model complexity (model_complexity: 0)
  - Use lower video resolution
  - Disable video recording/streaming features

## 📚 Documentation

- [Frontend Docs](frontend/README.md)
- [Backend Docs](backend/README.md)
- [ML Training Docs](ml-training/README.md)

## 🤝 Contributing

Found a bug? Want to add features? 
- Create an issue
- Submit a pull request
- Suggest improvements!

## 📄 License

This project is open source. Feel free to use and modify!

---

**Happy signing! 🤟**
