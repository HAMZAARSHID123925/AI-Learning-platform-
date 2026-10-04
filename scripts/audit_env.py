import os

def parse_env_keys(filepath):
    keys = []
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key = line.split('=', 1)[0].strip()
                if key:
                    keys.append(key)
    return keys

print(f"backend/.env keys: {parse_env_keys('backend/.env')}")
print(f"backend/.env.example keys: {parse_env_keys('backend/.env.example')}")
print(f"frontend/.env.local keys: {parse_env_keys('frontend/.env.local')}")
print(f"frontend/.env.example keys: {parse_env_keys('frontend/.env.example')}")
