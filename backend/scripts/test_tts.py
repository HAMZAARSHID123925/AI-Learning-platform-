import asyncio
from app.config import get_settings
from app.shared.tts_client import synthesize_narration

async def test_tts():
    print("Testing TTS...", flush=True)
    settings = get_settings()
    
    if settings.TTS_MOCK_MODE:
        print("TTS_MOCK_MODE is enabled. Real TTS is NOT verified.", flush=True)
        return
        
    if settings.TTS_PROVIDER == "openai_tts" and not settings.OPENAI_TTS_API_KEY:
        print("OPENAI_TTS_API_KEY not configured. Real TTS is NOT verified.", flush=True)
        return
        
    if settings.TTS_PROVIDER == "elevenlabs" and not settings.ELEVENLABS_API_KEY:
        print("ELEVENLABS_API_KEY not configured. Real TTS is NOT verified.", flush=True)
        return
        
    try:
        result = await synthesize_narration(text="Hello, this is a test clip.", override_provider=None, override_voice=None)
        audio_bytes = result.audio_bytes
        if audio_bytes and len(audio_bytes) > 1000:
            print("REAL TTS: VERIFIED", flush=True)
            print(f"Generated {len(audio_bytes)} bytes of audio.", flush=True)
        else:
            print("REAL TTS: NOT VERIFIED (Empty or too small audio)", flush=True)
    except Exception as e:
        print(f"REAL TTS: NOT VERIFIED (Exception: {e})", flush=True)

if __name__ == "__main__":
    asyncio.run(test_tts())
