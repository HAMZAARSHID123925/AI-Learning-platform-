import os
from dotenv import load_dotenv

load_dotenv()

keys = [
    "DATABASE_URL",
    "REDIS_URL",
    "LLM_PROVIDER",
    "GROQ_API_KEY",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "TTS_PROVIDER",
    "ELEVENLABS_API_KEY",
    "OPENAI_TTS_API_KEY",
    "S3_ENDPOINT_URL",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_BUCKET_NAME",
    "ENVIRONMENT",
    "CORS_ALLOWED_ORIGINS"
]

for k in keys:
    val = os.getenv(k)
    if val:
        masked = val[:4] + "***" if len(val) > 4 else "***"
        print(f"{k}: CONFIGURED ({masked})")
    else:
        print(f"{k}: MISSING/INVALID")
