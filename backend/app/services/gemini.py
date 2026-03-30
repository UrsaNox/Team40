import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-generativeai package not installed")


class GeminiService:
    """Service for interacting with Google Gemini Flash API"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-1.5-flash"
        self.ready = False
        
        if GENAI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model_name)
                self.ready = True
                logger.info("Gemini service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                self.ready = False
        elif not GENAI_AVAILABLE:
            logger.warning("google-generativeai package not available")
        else:
            logger.warning("GEMINI_API_KEY not set in environment")
    
    async def generate_natural_text(self, sign_text: str, context: str = "") -> str:
        """
        Generate natural language from a sign translation.
        
        Args:
            sign_text: The recognized sign (e.g., "hello", "water")
            context: Optional context for better translation
            
        Returns:
            Natural language text response
        """
        if not self.ready:
            return f"You signed: {sign_text.replace('_', ' ')}"
        
        try:
            prompt = f"""Given a sign language sign: "{sign_text}"
            {f'Context: {context}' if context else ''}
            
            Generate a natural, conversational English response (1-2 sentences max) as if the person just used that sign. 
            Be casual and friendly. No explanation needed.
            
            Response:"""
            
            response = self.client.generate_content(prompt)
            return response.text.strip()
        
        except Exception as e:
            logger.error(f"Gemini error in generate_natural_text: {e}")
            return f"You signed: {sign_text.replace('_', ' ')}"
    
    async def combine_signs(self, sign_texts: list) -> str:
        """
        Combine multiple signs into coherent natural language.
        
        Args:
            sign_texts: List of sign names/texts
            
        Returns:
            Combined natural language sentence
        """
        if not self.ready:
            return " ".join(sign_texts)
        
        try:
            signs_str = ", ".join(sign_texts)
            prompt = f"""These are sign language signs in sequence: {signs_str}

            Create a natural, coherent English sentence combining these signs (2-3 sentences max).
            Keep it conversational and natural.
            
            Response:"""
            
            response = self.client.generate_content(prompt)
            return response.text.strip()
        
        except Exception as e:
            logger.error(f"Gemini error in combine_signs: {e}")
            return " ".join(sign_texts)
    
    async def translate_to_signs(self, text: str) -> list:
        """
        Get semantic meaning from text to map to signs.
        
        Args:
            text: Input text
            
        Returns:
            List of sign concepts/keywords
        """
        if not self.ready:
            return text.lower().split()
        
        try:
            prompt = f"""Analyze this text for sign language concepts:
            "{text}"
            
            Return a JSON array of key words/concepts that would be represented by individual signs.
            Example: "I like water" -> ["I", "like", "water"]
            
            Return ONLY the JSON array, nothing else."""
            
            response = self.client.generate_content(prompt)
            import json
            try:
                concepts = json.loads(response.text.strip())
                return concepts if isinstance(concepts, list) else text.lower().split()
            except:
                return text.lower().split()
        
        except Exception as e:
            logger.error(f"Gemini error in translate_to_signs: {e}")
            return text.lower().split()
    
    def is_ready(self) -> bool:
        """Check if service is initialized"""
        return self.ready
