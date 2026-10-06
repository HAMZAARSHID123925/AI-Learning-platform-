import asyncio
from app.shared.ai_client import generate_llm_completion

async def test_openai():
    try:
        print("Testing direct connectivity to OpenAI...")
        resp = await generate_llm_completion("You are a helpful assistant.", "Say 'hello'.", json_mode=False, max_retries=1)
        print("Success:", resp)
    except Exception as e:
        print("Failure:", e)

if __name__ == '__main__':
    asyncio.run(test_openai())
