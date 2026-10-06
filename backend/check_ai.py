import asyncio
from app.shared.ai_client import get_embedding, generate_llm_completion

async def test():
    try:
        print("Testing get_embedding...")
        vec = await get_embedding("test")
        print("Embedding len:", len(vec))
    except Exception as e:
        print("Embedding failed:", e)

    try:
        print("Testing generate_llm_completion...")
        ans = await generate_llm_completion("System prompt", "User prompt", max_retries=1)
        print("Completion response:", ans)
    except Exception as e:
        print("Completion failed:", e)

asyncio.run(test())
