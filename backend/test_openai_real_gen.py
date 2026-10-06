import asyncio
import os
import json
from app.shared.ai_client import generate_llm_completion
from app.modules.module5_assessment.services.generation_service import ASSESSMENT_SYSTEM_PROMPT

async def test_openai_real_gen():
    prompt = ASSESSMENT_SYSTEM_PROMPT.format(
        num_questions=10,
        lesson_title="Quantum Physics Intro"
    )
    user_prompt = "LESSON CONTENT:\nQuantum physics describes nature at the smallest scales of energy levels of atoms and subatomic particles.\n"
    
    resp = await generate_llm_completion(prompt, user_prompt, json_mode=True, max_retries=1)
    print("Raw output:")
    print(resp)

asyncio.run(test_openai_real_gen())
