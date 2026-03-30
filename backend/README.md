# Backend - FastAPI Server

FastAPI backend for natural language translation using Gemini Flash API.

## Features

- **Sign to Text**: Translates recognized signs into natural language using Gemini Flash
- **Text to Sign**: Converts text/speech into sign pose sequences
- **Real-Time API**: Low-latency REST endpoints for frontend

## Setup

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

API runs on `http://localhost:8000`

## Environment Variables

Create `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

## Project Structure

```
app/
├── main.py              # FastAPI app + routes
├── models.py            # Pydantic request/response models
├── config.py            # Environment & config
└── services/
    ├── gemini.py        # Gemini API integration
    ├── translation.py   # Sign ↔ Text translation logic
    └── pose_generator.py # Generate pose sequences from text
```

## API Endpoints

### 1. Sign Recognition Result → Text
```
POST /api/sign-to-text
Content-Type: application/json

{
  "sign_id": 15,
  "confidence": 0.92,
  "context": "greeting"
}

Response:
{
  "text": "Hello",
  "natural_language": "Hello! How are you doing?",
  "confidence": 0.92
}
```

### 2. Text/Speech → Sign Pose Sequence
```
POST /api/text-to-sign
Content-Type: application/json

{
  "text": "Hello, how are you?"
}

Response:
{
  "signs": [12, 45, 78],        # Sign IDs
  "poses": [                     # Pose sequences
    { "landmarks": [...] },
    { "landmarks": [...] }
  ],
  "duration_ms": 2500
}
```

### 3. Health Check
```
GET /api/health

Response:
{
  "status": "ok",
  "version": "0.1.0"
}
```

## Integration with Gemini Flash

Gemini is used for:
- **Contextual sign recognition**: Improving accuracy by understanding context
- **Natural language generation**: Converting sign sequences to fluent text
- **Understanding intent**: Detecting meaning behind sign combinations

## Development

To add new features:
1. Define request/response models in `models.py`
2. Implement service logic in `services/`
3. Create API route in `main.py`
4. Test with provided curl examples
