from app.config import get_settings
settings = get_settings()
print("LLM_PROVIDER:", settings.LLM_PROVIDER)
print("OPENAI_API_KEY PRESENT:", bool(settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("#")))
print("Completion model:", getattr(settings, "OPENAI_LLM_MODEL", "Not Set"))
print("Embedding provider:", settings.EMBEDDING_PROVIDER)
print("Embedding model:", getattr(settings, "EMBEDDING_MODEL", "Not Set"))
