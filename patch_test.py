import re

path = r"backend/tests/integration/module5/test_module07.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_content = '''    inst = User(email="mod7_inst@test.com", password_hash="1", first_name="I", last_name="I", status=UserStatus.active)
    stud = User(email="mod7_stud@test.com", password_hash="1", first_name="S", last_name="S", status=UserStatus.active)
    db.add_all([inst, stud])
    await db.flush()
    
    await db.execute(text("INSERT INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'mod7_inst@test.com' AND r.name = 'Instructor' ON CONFLICT DO NOTHING"))
    
    course = Course(title="Mod7 Course", slug=f"m7-c-{uuid.uuid4().hex[:6]}", instructor_id=inst.id, status=CourseStatus.published)
    db.add(course)
    await db.flush()
    mod = CourseModule(course_id=course.id, title="M", sequence_order=1)
    db.add(mod)
    await db.flush()
    lesson = Lesson(module_id=mod.id, title="L", slug=f"l-{uuid.uuid4().hex[:6]}", body_markdown="Test content", sequence_order=1, status=LessonStatus.published, content_version=1)
    db.add(lesson)
    await db.commit()'''

new_content = '''    inst = User(email="mod7_inst@test.com", password_hash="1", first_name="I", last_name="I", status=UserStatus.active)
    stud = User(email="mod7_stud@test.com", password_hash="1", first_name="S", last_name="S", status=UserStatus.active)
    db.add_all([inst, stud])
    await db.flush()
    
    await db.execute(text("INSERT INTO user_roles (user_id, role_id) SELECT :uid, id FROM roles WHERE name='Instructor' ON CONFLICT DO NOTHING"), {"uid": inst.id})
    await db.commit()
    
    course = Course(title="Mod7 Course", slug=f"m7-c-{uuid.uuid4().hex[:6]}", instructor_id=inst.id, status=CourseStatus.published)
    db.add(course)
    await db.flush()
    mod = CourseModule(course_id=course.id, title="M", sequence_order=1)
    db.add(mod)
    await db.flush()
    
    realistic_body = """# Quantum Physics Foundations

Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. 
1. **Wave-Particle Duality**: Every particle or quantum entity may be described as either a particle or a wave.
2. **Quantization**: Energy, momentum, angular momentum, and other quantities of a bound system are restricted to discrete values.
3. **Uncertainty Principle**: Proposed by Werner Heisenberg, it states that you cannot simultaneously know both the position and momentum of a particle with absolute precision.
4. **Superposition**: A quantum system can be in multiple states at the same time until it is measured.
5. **Entanglement**: Particles can become entangled, meaning the state of one particle instantly influences the state of another, no matter the distance.
6. **Schrödinger's Cat**: A thought experiment illustrating superposition, where a cat is simultaneously alive and dead until observed.
7. **Planck's Constant**: A fundamental physical constant denoted as 'h', which relates the energy of a photon to its frequency.
8. **Quantum Tunneling**: The quantum mechanical phenomenon where a wavefunction can propagate through a potential barrier.
9. **Fermions and Bosons**: Particles are divided into two types based on their spin. Fermions have half-integer spin (like electrons), while bosons have integer spin (like photons).
10. **The Standard Model**: The theoretical framework describing three of the four known fundamental forces (electromagnetic, weak, and strong interactions).
"""
    lesson = Lesson(module_id=mod.id, title="L", slug=f"l-{uuid.uuid4().hex[:6]}", body_markdown=realistic_body, sequence_order=1, status=LessonStatus.published, content_version=1)
    db.add(lesson)
    await db.commit()'''

content = content.replace(old_content, new_content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patching test complete.")
