import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings"""
    
    # API Config
    API_TITLE = "Sign Language Communication API"
    API_VERSION = "0.1.0"
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # Server Config
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    RELOAD = os.getenv("RELOAD", "True").lower() == "true"
    
    # Gemini Config
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = "gemini-1.5-flash"
    
    # Backend URL (for frontend)
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # CORS
    ALLOWED_ORIGINS = ["*"]
    
    # ML Model Config
    MODEL_PATH = os.getenv("MODEL_PATH", "models/lstm_model")
    MODEL_LABELS = os.getenv("MODEL_LABELS", "models/labels.json")
    
    # Validation
    MIN_CONFIDENCE = 0.3
    MIN_GESTURE_LENGTH = 5  # Minimum frames for valid gesture
    MAX_GESTURE_LENGTH = 300  # Maximum frames to track


settings = Settings()
