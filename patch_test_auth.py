import re

path = r"backend/tests/integration/module5/test_module07.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_content = '''    inst_token = create_access_token({"sub": str(inst.id), "email": inst.email})
    stud_token = create_access_token({"sub": str(stud.id), "email": stud.email})'''

new_content = '''    inst_token = create_access_token(user_id=str(inst.id), email=inst.email, first_name=inst.first_name, roles=["Instructor"], permissions=[])
    stud_token = create_access_token(user_id=str(stud.id), email=stud.email, first_name=stud.first_name, roles=["Student"], permissions=[])'''

content = content.replace(old_content, new_content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patching test auth complete.")
