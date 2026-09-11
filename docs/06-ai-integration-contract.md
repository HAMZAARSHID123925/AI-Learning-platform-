# 06 AI Integration Contract

Clear division of responsibilities to avoid blocking between Web and AI teams.

## Your Scope (Web Developer)
* **Course Materials**: Build upload forms, store PDFs in S3, save metadata in Postgres.
* **Quizzes & Tests**: Render quiz UI, collect student answers, save raw answers to database via FastAPI.
* **Grading**: Save scores and feedback text in DB, display colorful feedback badges to student.
* **Recommendations**: Build "Recommended For You" UI cards on the dashboard.
* **AI Chat Assistant**: Build chat UI window, handle text input, stream responses.

## AI Team Scope (AI Developer)
* **Course Materials**: Read PDFs from S3/Postgres, chunk text, generate vector embeddings, store in pgvector (RAG).
* **Quizzes & Tests**: Write prompt/agent that analyzes student history and outputs new questions in JSON format.
* **Grading**: Run Evaluation Agent to evaluate grammar/vocabulary and calculate sub-skill scores.
* **Recommendations**: Run Skill Analysis Agent to decide which lesson or topic the student needs to review.
* **AI Chat Assistant**: Manage system prompts, context retrieval from course documents, and LLM API calls.
