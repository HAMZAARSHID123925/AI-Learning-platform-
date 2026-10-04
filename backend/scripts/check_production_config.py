import sys
import os
from dotenv import load_dotenv

load_dotenv()

def check_production_config():
    errors = []
    env = os.getenv("ENVIRONMENT", "development")
    
    print(f"Checking configuration for ENVIRONMENT={env}...\n")
    
    if env == "production":
        # Check Core
        if not os.getenv("DATABASE_URL"):
            errors.append("DATABASE_URL is missing")
        if not os.getenv("REDIS_URL"):
            errors.append("REDIS_URL is missing")
            
        # Check AI
        llm = os.getenv("LLM_PROVIDER")
        if not llm:
            errors.append("LLM_PROVIDER is missing")
        elif llm == "groq" and not os.getenv("GROQ_API_KEY"):
            errors.append("GROQ_API_KEY is missing")
        elif llm == "anthropic" and not os.getenv("ANTHROPIC_API_KEY"):
            errors.append("ANTHROPIC_API_KEY is missing")
        elif llm == "openai" and not os.getenv("OPENAI_API_KEY"):
            errors.append("OPENAI_API_KEY is missing for OpenAI LLM")
            
        # Check TTS
        if os.getenv("TTS_MOCK_MODE", "").lower() == "true":
            errors.append("TTS_MOCK_MODE=True is not allowed in production")
            
        tts = os.getenv("TTS_PROVIDER")
        if not tts:
            errors.append("TTS_PROVIDER is missing")
        elif tts == "openai_tts" and not os.getenv("OPENAI_TTS_API_KEY") and not os.getenv("OPENAI_API_KEY"):
            errors.append("OPENAI_TTS_API_KEY or OPENAI_API_KEY is missing")
        elif tts == "elevenlabs" and not os.getenv("ELEVENLABS_API_KEY"):
            errors.append("ELEVENLABS_API_KEY is missing")
            
        # Check Storage
        if not os.getenv("S3_ACCESS_KEY_ID") or not os.getenv("S3_SECRET_ACCESS_KEY"):
            errors.append("S3_ACCESS_KEY_ID or S3_SECRET_ACCESS_KEY is missing")
            
        if "localhost" in os.getenv("CORS_ALLOWED_ORIGINS", ""):
            errors.append("CORS_ALLOWED_ORIGINS contains localhost")
            
    if errors:
        print("PRODUCTION CONFIGURATION ERRORS:")
        for e in errors:
            print(f" - {e}")
        sys.exit(1)
    else:
        print("Configuration is valid for production.")
        sys.exit(0)

if __name__ == "__main__":
    check_production_config()
