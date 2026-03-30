from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import services
try:
    from app.services.gemini import GeminiService
    gemini_service = GeminiService()
except Exception as e:
    logger.error(f"Failed to initialize Gemini service: {e}")
    gemini_service = None

# Initialize FastAPI app
app = FastAPI(
    title="Sign Language Communication API",
    description="Real-time bidirectional sign language translation service",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# DATA MODELS
# ============================================================================

class SignToTextRequest(BaseModel):
    """Sign recognition result to text conversion"""
    sign_id: int
    confidence: float
    context: Optional[str] = None


class SignToTextResponse(BaseModel):
    """Text translation response"""
    text: str
    natural_language: str
    confidence: float


class TextToSignRequest(BaseModel):
    """Text to sign translation request"""
    text: str


class TextToSignResponse(BaseModel):
    """Sign pose sequence response"""
    signs: List[int]
    duration_ms: int
    description: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    services: dict


class BatchSignToTextRequest(BaseModel):
    """Batch sign to text conversion"""
    signs: List[dict]  # [{sign_id, confidence}, ...]


class BatchSignToTextResponse(BaseModel):
    """Batch translation response"""
    translations: List[SignToTextResponse]
    combined_text: str


# ============================================================================
# SIGN MAPPING (Placeholder - Replace with actual sign database)
# ============================================================================

SIGN_DATABASE = {
    0: "hello",
    1: "goodbye",
    2: "thank_you",
    3: "yes",
    4: "no",
    5: "water",
    6: "food",
    7: "happy",
    8: "sad",
    9: "help",
    # Add more signs as needed
}


def get_sign_name(sign_id: int) -> str:
    """Get sign name from ID"""
    return SIGN_DATABASE.get(sign_id, f"sign_{sign_id}")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        version="0.1.0",
        services={
            "gemini": "ok" if gemini_service else "not_initialized",
            "database": "ok"
        }
    )


@app.post("/api/sign-to-text", response_model=SignToTextResponse)
async def sign_to_text(request: SignToTextRequest):
    """
    Convert recognized sign to natural language text.
    
    Uses Gemini Flash API to generate natural, conversational text
    from the recognized sign ID and context.
    
    Args:
        request: SignToTextRequest with sign_id, confidence, context
        
    Returns:
        SignToTextResponse with text and natural language translation
    """
    try:
        sign_name = get_sign_name(request.sign_id)
        
        # If Gemini service is available, use it for natural language
        if gemini_service and request.confidence > 0.5:
            natural_language = await gemini_service.generate_natural_text(
                sign_name,
                request.context or ""
            )
        else:
            natural_language = f"You signed: {sign_name.replace('_', ' ')}"
        
        return SignToTextResponse(
            text=sign_name,
            natural_language=natural_language,
            confidence=request.confidence
        )
    
    except Exception as e:
        logger.error(f"Error in sign_to_text: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/text-to-sign", response_model=TextToSignResponse)
async def text_to_sign(request: TextToSignRequest):
    """
    Convert text to sign pose sequence IDs.
    
    Processes text input and maps it to sign IDs that can be rendered
    as pose animations on the avatar.
    
    Args:
        request: TextToSignRequest with text
        
    Returns:
        TextToSignResponse with sign IDs and metadata
    """
    try:
        text = request.text.lower()
        
        # Simple keyword-to-sign mapping (placeholder)
        # In production, use NLP + more sophisticated mapping
        sign_mapping = {
            "hello": [0],
            "hi": [0],
            "goodbye": [1],
            "bye": [1],
            "thank": [2],
            "thanks": [2],
            "yes": [3],
            "no": [4],
            "water": [5],
            "food": [6],
            "happy": [7],
            "sad": [8],
            "help": [9],
        }
        
        # Find mapped signs
        signs = []
        for word, sign_ids in sign_mapping.items():
            if word in text:
                signs.extend(sign_ids)
        
        # Default if no match
        if not signs:
            signs = [0]  # Default to "hello"
        
        duration_ms = len(signs) * 500  # ~500ms per sign
        
        return TextToSignResponse(
            signs=signs,
            duration_ms=duration_ms,
            description=f"Sequence of {len(signs)} signs"
        )
    
    except Exception as e:
        logger.error(f"Error in text_to_sign: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/batch-sign-to-text", response_model=BatchSignToTextResponse)
async def batch_sign_to_text(request: BatchSignToTextRequest):
    """
    Batch convert multiple recognized signs to text.
    
    Useful for processing a sequence of signs and combining them
    into a single coherent text output.
    
    Args:
        request: BatchSignToTextRequest with list of signs
        
    Returns:
        BatchSignToTextResponse with individual and combined translations
    """
    try:
        translations = []
        sign_texts = []
        
        for sign_data in request.signs:
            sign_req = SignToTextRequest(
                sign_id=sign_data.get("sign_id"),
                confidence=sign_data.get("confidence", 1.0),
                context=sign_data.get("context", "")
            )
            translation = await sign_to_text(sign_req)
            translations.append(translation)
            sign_texts.append(translation.text)
        
        # Combine into single text
        combined_text = " ".join(sign_texts)
        
        # Use Gemini for better sentence formation if available
        if gemini_service and len(sign_texts) > 1:
            combined_text = await gemini_service.combine_signs(sign_texts)
        
        return BatchSignToTextResponse(
            translations=translations,
            combined_text=combined_text
        )
    
    except Exception as e:
        logger.error(f"Error in batch_sign_to_text: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signs")
async def get_signs():
    """Get all available signs in database"""
    return {
        "signs": SIGN_DATABASE,
        "total": len(SIGN_DATABASE)
    }


@app.get("/api/signs/{sign_id}")
async def get_sign(sign_id: int):
    """Get specific sign information"""
    if sign_id not in SIGN_DATABASE:
        raise HTTPException(status_code=404, detail=f"Sign {sign_id} not found")
    
    return {
        "sign_id": sign_id,
        "name": SIGN_DATABASE[sign_id]
    }


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
