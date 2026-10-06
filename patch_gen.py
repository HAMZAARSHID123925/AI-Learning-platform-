import re
import os

path = r"backend/app/modules/module5_assessment/services/generation_service.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update ASSESSMENT_SYSTEM_PROMPT
old_sys_prompt = '''ASSESSMENT_SYSTEM_PROMPT = """
You are an expert psychometric assessment engineer for the ELARION Adaptive Learning Platform.
Your mission is to generate a rigorous, fair, and curriculum-grounded assessment based strictly
on the provided authoritative lesson excerpts.

RULES:
1. Every question must directly test concepts present in the provided context excerpts.
2. Produce a mix of Multiple Choice Questions (MCQ) and Short Answer Questions.
3. For MCQ: Provide 4 options. Exactly ONE option must have "is_correct": true. Provide realistic distractors.
4. For Short Answer: Provide a clear, granular rubric explaining criteria for 1.0 (full credit), 0.5 (partial credit), and 0.0 (no credit).
5. Output MUST be strictly valid JSON matching the requested schema. Do not include markdown codeblocks or commentary outside the JSON.
"""'''

new_sys_prompt = '''ASSESSMENT_SYSTEM_PROMPT = """
You are an expert psychometric assessment engineer for the ELARION Adaptive Learning Platform.
Your mission is to generate a rigorous, fair, and curriculum-grounded assessment based strictly
on the provided authoritative lesson excerpts.

RULES:
1. Every question must directly test concepts present in the provided context excerpts.
2. Produce ONLY Multiple Choice Questions (MCQ). Do NOT generate short answer questions.
3. For MCQ: Provide 4 options. Exactly ONE option must have "is_correct": true. Provide realistic distractors. Every option must have an "id" and "text".
4. Output MUST be strictly valid JSON matching the requested schema. Do not include markdown codeblocks or commentary outside the JSON.
"""'''

content = content.replace(old_sys_prompt, new_sys_prompt)

# 2. Update generate_lesson_assessment user prompt
old_user_prompt_lesson = '''Generate a structured test with exactly {num_questions} Multiple Choice Questions (MCQ) ONLY. Do not generate short answer questions.

JSON SCHEMA TO RETURN:
{{
  "title": "{lesson.title} - Mastery Assessment",
  "questions": [
    {{
      "question_type": "mcq",
      "prompt": "Question text here?",
      "options": [
        {{"id": "opt-1", "text": "Correct explanation", "is_correct": true}},
        {{"id": "opt-2", "text": "Distractor 1", "is_correct": false}},
        {{"id": "opt-3", "text": "Distractor 2", "is_correct": false}},
        {{"id": "opt-4", "text": "Distractor 3", "is_correct": false}}
      ],
      "rubric": null,
      "max_score": 1.0,
      "skill_name": "{target_skill_list[0].name if target_skill_list else 'Core Knowledge'}"
    }},
    {{
      "question_type": "short_answer",
      "prompt": "Open-ended prompt asking student to explain or apply a concept?",
      "options": null,
      "rubric": "Full credit (1.0) requires... Partial credit (0.5) if... No credit (0.0) if...",
      "max_score": 1.0,
      "skill_name": "{target_skill_list[0].name if target_skill_list else 'Core Knowledge'}"
    }}
  ]
}}'''

new_user_prompt_lesson = '''Generate a structured test with exactly {num_questions} Multiple Choice Questions (MCQ) ONLY. Do not generate short answer questions.

JSON SCHEMA TO RETURN:
{{
  "title": "{lesson.title} - Mastery Assessment",
  "questions": [
    {{
      "question_type": "mcq",
      "prompt": "Question text here?",
      "options": [
        {{"id": "opt-1", "text": "Correct explanation", "is_correct": true}},
        {{"id": "opt-2", "text": "Distractor 1", "is_correct": false}},
        {{"id": "opt-3", "text": "Distractor 2", "is_correct": false}},
        {{"id": "opt-4", "text": "Distractor 3", "is_correct": false}}
      ],
      "rubric": null,
      "max_score": 1.0,
      "skill_name": "{target_skill_list[0].name if target_skill_list else 'Core Knowledge'}"
    }}
  ]
}}'''

content = content.replace(old_user_prompt_lesson, new_user_prompt_lesson)

# 3. Add retry loop to generate_lesson_assessment
old_llm_call_lesson = '''    # 4. Invoke LLM
    raw_response = await generate_llm_completion(
        system_prompt=ASSESSMENT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.2,
        json_mode=True
    )

    try:
        data = json.loads(raw_response)
    except Exception as e:
        logger.error("llm_json_parse_failed", error=str(e), raw=raw_response[:200])
        raise BusinessRuleError("AI generation failed to produce valid structured JSON")

    # 5. Persist Test and Questions'''

new_llm_call_lesson = '''    # 4. Invoke LLM with retry validation
    max_retries = 3
    data = None
    import asyncio
    for attempt in range(max_retries):
        try:
            raw_response = await generate_llm_completion(
                system_prompt=ASSESSMENT_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.2,
                json_mode=True
            )
            data = json.loads(raw_response)
            questions = data.get("questions", [])
            if len(questions) != num_questions:
                raise ValueError(f"Expected {num_questions} questions, got {len(questions)}")
            
            for q in questions:
                if q.get("question_type") != "mcq":
                    raise ValueError(f"Expected MCQ only, got {q.get('question_type')}")
                opts = q.get("options")
                if not opts or len(opts) != 4:
                    raise ValueError("MCQ must have exactly 4 options")
                if sum(1 for o in opts if o.get("is_correct")) != 1:
                    raise ValueError("Exactly ONE option must be correct")
                for o in opts:
                    if "id" not in o or "text" not in o:
                        raise ValueError("Options must have id and text")
            
            # Validation passed
            break
        except Exception as e:
            logger.warning("llm_validation_failed", attempt=attempt, error=str(e))
            if attempt == max_retries - 1:
                logger.error("llm_json_parse_failed", error=str(e))
                raise BusinessRuleError(f"AI generation failed to produce valid structured JSON: {e}")
            await asyncio.sleep(1)

    # 5. Persist Test and Questions'''

content = content.replace(old_llm_call_lesson, new_llm_call_lesson)

# 4. Add retry loop to generate_course_assessment
old_llm_call_course = '''    raw_response = await generate_llm_completion(
        system_prompt=ASSESSMENT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.2,
        json_mode=True
    )

    try:
        data = json.loads(raw_response)
    except Exception as e:
        logger.error("llm_json_parse_failed", error=str(e), raw=raw_response[:200])
        raise BusinessRuleError("AI generation failed to produce valid structured JSON")

    # We need a default Skill ID for the DB relationship'''

new_llm_call_course = '''    max_retries = 3
    data = None
    import asyncio
    for attempt in range(max_retries):
        try:
            raw_response = await generate_llm_completion(
                system_prompt=ASSESSMENT_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.2,
                json_mode=True
            )
            data = json.loads(raw_response)
            questions = data.get("questions", [])
            if len(questions) != 10:
                raise ValueError(f"Expected 10 questions, got {len(questions)}")
            
            for q in questions:
                if q.get("question_type") != "mcq":
                    raise ValueError(f"Expected MCQ only, got {q.get('question_type')}")
                opts = q.get("options")
                if not opts or len(opts) != 4:
                    raise ValueError("MCQ must have exactly 4 options")
                if sum(1 for o in opts if o.get("is_correct")) != 1:
                    raise ValueError("Exactly ONE option must be correct")
                for o in opts:
                    if "id" not in o or "text" not in o:
                        raise ValueError("Options must have id and text")
            
            break
        except Exception as e:
            logger.warning("llm_course_validation_failed", attempt=attempt, error=str(e))
            if attempt == max_retries - 1:
                logger.error("llm_json_parse_failed", error=str(e))
                raise BusinessRuleError(f"AI generation failed to produce valid structured JSON: {e}")
            await asyncio.sleep(1)

    # We need a default Skill ID for the DB relationship'''

content = content.replace(old_llm_call_course, new_llm_call_course)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patching complete.")
