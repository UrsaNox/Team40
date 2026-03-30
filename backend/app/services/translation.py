"""
Translation service for sign ↔ text conversions
"""

import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class TranslationService:
    """Handles sign ↔ text translation logic"""
    
    def __init__(self):
        # Sign database mapping sign IDs to concepts
        self.sign_database = {
            0: {"name": "hello", "keywords": ["hello", "hi", "greet"]},
            1: {"name": "goodbye", "keywords": ["goodbye", "bye", "farewell"]},
            2: {"name": "thank_you", "keywords": ["thank", "thanks", "appreciate"]},
            3: {"name": "yes", "keywords": ["yes", "yeah", "affirmative"]},
            4: {"name": "no", "keywords": ["no", "nope", "negative"]},
            5: {"name": "water", "keywords": ["water", "drink"]},
            6: {"name": "food", "keywords": ["food", "eat", "hungry"]},
            7: {"name": "happy", "keywords": ["happy", "joyful", "glad"]},
            8: {"name": "sad", "keywords": ["sad", "unhappy", "depressed"]},
            9: {"name": "help", "keywords": ["help", "assist", "support"]},
        }
    
    def sign_to_keywords(self, sign_id: int) -> Optional[List[str]]:
        """Get keywords for a sign"""
        if sign_id not in self.sign_database:
            return None
        return self.sign_database[sign_id].get("keywords", [])
    
    def keywords_to_signs(self, keywords: List[str]) -> List[int]:
        """Map keywords to sign IDs"""
        sign_ids = []
        keywords_lower = [k.lower() for k in keywords]
        
        for sign_id, sign_data in self.sign_database.items():
            for keyword in sign_data.get("keywords", []):
                if keyword.lower() in keywords_lower:
                    sign_ids.append(sign_id)
                    break
        
        return sign_ids if sign_ids else [0]  # Default to hello
