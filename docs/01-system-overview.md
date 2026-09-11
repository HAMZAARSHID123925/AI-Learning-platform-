# AI-Powered Adaptive Learning & Assessment Platform
Developer Technical Overview — LMS + Agentic AI Architecture

This document extracts the technical architecture, technology stack, system flow, data model, LMS scope, and AI
components from the project proposal.

1. System Overview
The platform is an integrated Learning Management System (LMS) and AI-powered adaptive learning platform.
The LMS provides the structured learning environment: courses, modules, lessons, content, enrollment, access
control, assessments, and progress.
The AI engine operates on top of the LMS and continuously analyzes learning activity and assessment
performance. It identifies strengths and weaknesses, generates personalized assessments, recommends learning
activities, and updates the student's learning profile.
The initial course is IELTS / English, but the architecture is intended to be generic enough to support additional
courses and subjects later.

2. Core Student Journey
Student → Login / LMS Dashboard → Select / Access Course → Open Module & Study Lesson Material →
Complete Learning Activity → AI Creates Initial Assessment → Student Takes Test → AI Evaluates Answers →
Performance & Skill Analysis → Strengths + Weaknesses Identified → AI Creates Personalized Learning
Recommendation & Test → Student Studies Recommended Material → Student Takes Personalized Test →
Progress Updated in LMS → Continuous Improvement Loop.
The loop repeats as new learning activity and test results become available, allowing personalization to improve
over time.

3. Adaptive Learning Engine
Input data: LMS learning activity, assessments, test attempts, historical performance, and course content.
Processing flow: Student Performance → AI Skill Analysis → Identify Strong Areas / Weak Areas → Create
Individual Learning Strategy → Generate Personalized Questions → Evaluate New Attempt → Update Student
Performance Profile in LMS → Repeat.
The system should use historical data rather than relying only on the most recent score.

4. Agentic AI Architecture
The platform uses a coordinated set of specialized AI components rather than a single general-purpose chatbot.
These agents read relevant course structure, content, and learning history from the LMS and write
recommendations, assessments, and progress-related results back into the platform.
Test Generation Agent: Generates assessments using course content, student level, learning history, previous
performance, and weak areas.
Evaluation Agent: Evaluates answers at question and skill level, including skills such as grammar, vocabulary,
reading, and writing.
Skill Analysis Agent: Analyzes historical LMS and assessment data to identify strengths, weaknesses, and
sub-skills requiring improvement.
Personalization / Learning Agent: Determines what the student should learn or practice next and communicates
the recommendation through the LMS.
AI Tutor: Provides explanations, examples, feedback, and learning guidance within the LMS learning experience.

5. AI Course Understanding & RAG
AI-generated tests and tutoring responses must be grounded in the actual course material managed inside the
LMS.
Supported course sources include LMS-managed PDFs and documents, course notes and lesson content,
uploaded learning material, and question banks.
Conceptual flow: LMS Course Content → AI Processing / Knowledge Layer → Organize & Store Course
Knowledge (RAG) → Retrieve Relevant Learning Context → AI Assessment / Tutor / Personalization.
RAG uses the LMS-managed content as the source material so generated assessments and tutoring responses
remain relevant to the course.

6. LMS Functional Layer
Course Management: Courses, descriptions, structure, modules, lessons, topics, and learning objectives.
Learning Content Management: PDFs, documents, lesson notes, videos, text-based lessons, and question
banks.
Student Management: Registration, login, profiles, enrollment, course access control, and role-based access.
Progress: Course progress, module progress, lesson completion, learning activity, assessment history, and test
attempts.
Assessments: Quizzes, assessments, submissions, test attempts, results, and assessment history.
The LMS and AI engine are integrated components of one platform: LMS = structured learning/platform layer; AI =
intelligence and personalization layer.

7. Integrated LMS + AI Loop
Student → LMS Course / Module / Lesson → Learning Activity → Assessment → AI Evaluation → Skill Analysis →
Weakness Detection → Personalization Agent → Recommended Lesson / Practice + Personalized Assessment →
Updated Student Progress → Back to LMS → Continuous Learning Loop.

8. Test Evaluation
Student Answers → AI Evaluation → Question-Level Analysis → Skill-Level Analysis → Overall Score → Detailed
Feedback stored in LMS.
The evaluation model can also support sub-skill detection, for example vocabulary: synonyms, academic words,
contextual usage; grammar: tenses, articles, prepositions.

9. Personalized Test Generation
Previous Test Results → Student Weak Areas → LMS Course Content & Learning History → AI Test Generation
Agent → Difficulty + Skill Selection → Personalized Test → Delivered via LMS.
The generator should reduce unnecessary focus on already-strong skills, increase focus on weak areas, surface
related LMS learning material, and gradually adjust difficulty as performance improves.

10. Progress & Dashboard
The dashboard is the student's LMS home base and can show enrolled courses, course/module/lesson progress,
skill performance, test history, weak areas, improvement over time, and AI recommendations.
Progress analysis combines LMS learning activity, assessment results, and historical performance, then produces
personalized recommendations.

11. Conceptual Data Model
LMS entities: Users & Roles, Courses, Modules, Lessons, Learning Materials, Enrollments, Progress.
AI & Assessment entities: Assessments & Questions, Attempts, Answers / Submissions, Skill Scores, AI
Recommendations, Learning History.
Detailed schema design is to be finalized during platform foundation and should support the LMS and AI layers
through shared data.

12. Technology Stack
Frontend: Next.js, TypeScript, Tailwind CSS, Responsive UI.
Backend: Python, FastAPI.
Database: PostgreSQL.
AI / LLM: OpenAI / Google Gemini / Groq-compatible models.
AI Architecture: Agentic AI workflow and specialized AI agents.
Knowledge: RAG (Retrieval-Augmented Generation).
Vector Search: PostgreSQL + pgvector.
Authentication: Secure login and role management.
File Storage: AWS S3 / Cloudflare R2.
Deployment: Docker + cloud hosting.
Monitoring: Application and AI usage monitoring.

13. High-Level Technical Architecture
Student → Web Platform → LMS Layer → Courses / Modules / Lessons / Enrollment / Progress / Assessments →
Backend / API → AI & Adaptive Learning Engine → Test Agent / Evaluation / Skill Analysis / Personalization Agent
/ AI Tutor → Personalized Learning / Assessment → Back to LMS → Student.
The LMS layer is implemented using the same overall technology stack rather than requiring a separate LMS
framework. It consists of additional data models, screens, and API endpoints within the architecture.

14. Initial Technical Scope
Student registration/login; LMS course access; course/module/lesson structure; LMS learning content upload and
management; enrollment and access control; learning progress tracking; AI-generated assessments; test attempts;
AI evaluation; skill-level analysis; weak-area detection; personalized tests; test history; progress comparison; AI
learning recommendations; AI learning assistant/chat; LMS + AI integration with shared data and a unified
dashboard.

15. Future Architecture Direction
The architecture should remain extensible for a dedicated instructor dashboard, advanced admin dashboard,
course authoring tools, assignment management, certificates, attendance tracking, notifications, advanced
analytics, multiple learning programs / additional subjects, and additional content types.
