import os
import re

def update_env(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    keys = {}
    for i, line in enumerate(lines):
        if line.strip() and not line.strip().startswith('#') and '=' in line:
            k = line.split('=', 1)[0].strip()
            keys[k] = i

    updates = False

    # Update LLM_PROVIDER
    if 'LLM_PROVIDER' in keys:
        idx = keys['LLM_PROVIDER']
        if lines[idx].startswith('LLM_PROVIDER='):
            # Change to openai, keep comments if any
            parts = lines[idx].split('LLM_PROVIDER=', 1)
            val_part = parts[1]
            comment = ''
            if '#' in val_part:
                comment = '#' + val_part.split('#', 1)[1]
            lines[idx] = f"LLM_PROVIDER=openai {comment}".strip()
            updates = True

    # Ensure OPENAI_LLM_MODEL exists
    if 'OPENAI_LLM_MODEL' not in keys:
        if 'LLM_PROVIDER' in keys:
            idx = keys['LLM_PROVIDER']
            lines.insert(idx + 1, "OPENAI_LLM_MODEL=")
        else:
            lines.append("OPENAI_LLM_MODEL=")
        updates = True

    # Update TTS_PROVIDER
    if 'TTS_PROVIDER' in keys:
        idx = keys['TTS_PROVIDER']
        if lines[idx].strip() == 'TTS_PROVIDER=' or lines[idx].strip().startswith('TTS_PROVIDER='):
            parts = lines[idx].split('TTS_PROVIDER=', 1)
            val_part = parts[1]
            comment = ''
            if '#' in val_part:
                comment = '#' + val_part.split('#', 1)[1]
            lines[idx] = f"TTS_PROVIDER=openai_tts {comment}".strip()
            updates = True

    if updates:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print("Updated .env successfully.")
    else:
        print("No updates needed.")

update_env('backend/.env')
