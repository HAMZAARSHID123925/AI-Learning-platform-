"""
Local demo content for the personalized-video flow.

The seeded courses (seed_courses.py) have lesson titles only - no lesson text and
no skill tags - so tests (and therefore weak-point videos) cannot be generated.
This script fills the Grade 5 "Digital Basics" course with real lesson text and
tags each lesson with a skill. Safe to run more than once.

Usage (from backend/):  venv\Scripts\python.exe -m scripts.seed_video_demo
"""
import asyncio
import uuid
from sqlalchemy import text
from app.database import get_db_session

COURSE_SLUG = "g5-digital-basics"

LESSONS = {
    "What is a Computer?": ("digital.what-is-computer", "What is a Computer", "Knowing what a computer is and the input-process-output-storage cycle.", """
A computer is an electronic machine that follows instructions to work with information. It takes in information, works on it, and gives back a result.

Every computer follows four steps:
1. **Input** - information goes in. A keyboard, a mouse, a microphone and a touch screen are input devices.
2. **Processing** - the computer works on the information. This is done by the CPU (Central Processing Unit), often called the brain of the computer.
3. **Output** - the result comes out. A monitor, a printer and speakers are output devices.
4. **Storage** - the computer saves information to use later, on a hard drive or SSD.

Example: when you type the word "cat" (input), the CPU turns each key press into letters (processing), and the letters appear on the screen (output). When you click Save, the file is kept on the hard drive (storage).

Computers come in many shapes: desktop computers, laptops, tablets, smartphones and even smart watches are all computers.
"""),
    "Hardware and Software": ("digital.hardware-software", "Hardware and Software", "Telling hardware apart from software and naming key parts like CPU, RAM and storage.", """
A computer is made of two kinds of things: hardware and software.

**Hardware** is every part of the computer you can touch. Examples: the monitor, keyboard, mouse, CPU, RAM and hard drive.

**Software** is the set of instructions that tells the hardware what to do. You cannot touch software. Examples: Windows, a web browser, a game, or a drawing app.

Important hardware parts:
- **CPU** - the brain. It follows instructions and does calculations very fast.
- **RAM** (Random Access Memory) - short-term memory. It holds what you are working on right now. When the computer turns off, RAM is emptied.
- **Hard drive / SSD** - long-term storage. Files stay saved even when the computer is off.
- **Motherboard** - the main board that connects all the parts so they can talk to each other.

A common mistake is to think RAM and the hard drive are the same. RAM is temporary and fast; the hard drive keeps files for a long time.

Hardware and software need each other: hardware without software cannot do anything, and software needs hardware to run on.
"""),
    "Internet Basics": ("digital.internet-basics", "Internet Basics", "Understanding the internet as a network of computers, websites, browsers and staying safe online.", """
The **internet** is a giant network that connects millions of computers around the world so they can share information.

- A **network** is two or more computers connected together.
- A **website** is a collection of pages stored on a special computer called a **server**.
- A **web browser** (like Chrome or Edge) is the software you use to visit websites.
- A **URL** is the address of a website, for example www.example.com.

How it works: when you type a URL into a browser, your computer sends a request through the internet to the server. The server sends the web page back, and the browser shows it on your screen.

The internet and the World Wide Web are not the same thing. The internet is the network of connected computers; the Web is the websites we visit using that network. Email and video calls also use the internet.

Staying safe online: never share your password or home address, only download from websites a grown-up trusts, and tell an adult if something online makes you feel uncomfortable.
"""),
    "Introduction to Coding": ("digital.intro-coding", "Introduction to Coding", "Understanding code, algorithms, sequence, loops and bugs.", """
**Coding** means writing instructions for a computer. The instructions are called **code**, and a set of code that does a job is called a **program**.

An **algorithm** is a list of steps, in the right order, to solve a problem. A recipe for making a sandwich is an algorithm: get bread, add butter, add filling, put the second slice on top.

Key ideas:
- **Sequence** - computers follow steps exactly in order. If the order is wrong, the result is wrong.
- **Loop** - repeating steps. Instead of writing "jump" ten times, a loop says "repeat jump 10 times".
- **Bug** - a mistake in the code. Finding and fixing bugs is called **debugging**.

Example: to draw a square, a robot can follow: move forward, turn right, move forward, turn right, move forward, turn right, move forward, turn right. With a loop this becomes: repeat 4 times (move forward, turn right).

Computers do not guess what you mean - they only do exactly what the code says. That is why clear, ordered instructions matter.
"""),
}

async def main():
    async with get_db_session() as db:
        course = (await db.execute(text("SELECT id FROM courses WHERE slug=:s"), {"s": COURSE_SLUG})).scalar_one_or_none()
        if not course:
            raise SystemExit("Course g5-digital-basics not found - run scripts.seed_courses first")
        parent = (await db.execute(text("SELECT id FROM skill_taxonomy WHERE slug='programming'"))).scalar_one_or_none()
        for title, (slug, name, desc, md) in LESSONS.items():
            await db.execute(text("""
                INSERT INTO skill_taxonomy (id, slug, name, description, parent_id, version, created_at)
                VALUES (:id, :slug, :name, :desc, :parent, 1, NOW())
                ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description
            """), {"id": uuid.uuid4(), "slug": slug, "name": name, "desc": desc, "parent": parent})
            skill_id = (await db.execute(text("SELECT id FROM skill_taxonomy WHERE slug=:s"), {"s": slug})).scalar_one()
            lesson_id = (await db.execute(text("""
                SELECT l.id FROM lessons l JOIN course_modules m ON m.id=l.module_id
                WHERE m.course_id=:c AND l.title=:t
            """), {"c": course, "t": title})).scalar_one_or_none()
            if not lesson_id:
                print(f"  [!] lesson '{title}' not found, skipped"); continue
            await db.execute(text("UPDATE lessons SET body_markdown=:md, status='published', updated_at=NOW() WHERE id=:id"),
                             {"md": md.strip(), "id": lesson_id})
            await db.execute(text("INSERT INTO lesson_skills (lesson_id, skill_id) VALUES (:l,:s) ON CONFLICT DO NOTHING"),
                             {"l": lesson_id, "s": skill_id})
            print(f"  [+] {title}: content added, tagged '{name}'")
        await db.commit()
    print("[SUCCESS] Digital Basics (Grade 5) is ready for tests and videos.")

if __name__ == "__main__":
    asyncio.run(main())
