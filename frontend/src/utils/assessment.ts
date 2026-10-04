import type {
  AssessmentAttempt,
  ChallengeQuestion,
  LegacyCourseData,
  LearningAnalysis,
  LessonStep,
  PersonalizedPlan,
  PracticeItem,
  PracticeMode,
  QuestionStep,
  SkillResult } from
'@/types/learning';

export function scoreAnswers(questions: ChallengeQuestion[], answers: (number | null)[]): number {
  return questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
}

function levelFor(percent: number): SkillResult['level'] {
  if (percent >= 75) return 'strong';
  if (percent >= 50) return 'developing';
  return 'needs_work';
}

export function analyzeAttempt(course: LegacyCourseData, questions: ChallengeQuestion[], attempt: AssessmentAttempt): LearningAnalysis {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const tally = new Map<string, {correct: number;total: number;}>();
  attempt.questionIds.forEach((id, i) => {
    const q = byId.get(id);
    if (!q) return;
    const t = tally.get(q.skill) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (attempt.answers[i] === q.answer) t.correct += 1;
    tally.set(q.skill, t);
  });

  const order = course.skills.length ? course.skills : Array.from(tally.keys());
  const skills: SkillResult[] = order.
  filter((s) => tally.has(s)).
  map((skill) => {
    const t = tally.get(skill)!;
    const percent = Math.round(t.correct / t.total * 100);
    return { skill, correct: t.correct, total: t.total, percent, level: levelFor(percent) };
  });

  const strong = skills.filter((s) => s.level === 'strong');
  const developing = skills.filter((s) => s.level === 'developing');
  const needsWork = [...skills.filter((s) => s.level === 'needs_work')].sort((a, b) => a.percent - b.percent);
  const scorePercent = Math.round(attempt.correct / attempt.total * 100);

  return { attemptId: attempt.id, scorePercent, strong, developing, needsWork, skills, summary: buildSummary(course, strong, developing, needsWork, scorePercent) };
}

function buildSummary(course: LegacyCourseData, strong: SkillResult[], developing: SkillResult[], needsWork: SkillResult[], score: number): string {
  const list = (items: SkillResult[]) => items.map((s) => s.skill.toLowerCase()).join(' and ');
  if (!needsWork.length && !developing.length) {
    return `Outstanding! You showed strong understanding across every part of ${course.title}. Try the challenge questions to push even further.`;
  }
  const opener = strong.length ? `You’re confident with ${list(strong)}. ` : score >= 50 ? 'You’ve got a solid start. ' : 'Great effort — every question teaches your brain something. ';
  const focus = needsWork.length ? needsWork : developing;
  return `${opener}The trickiest part for you was ${list(focus.slice(0, 2))}. A few picture-based practice rounds should make it click.`;
}

export function weakestSkills(analysis: LearningAnalysis): SkillResult[] {
  return [...analysis.needsWork, ...[...analysis.developing].sort((a, b) => a.percent - b.percent)];
}

function questionPool(lessonSteps: LessonStep[], challenge: ChallengeQuestion[]): QuestionStep[] {
  const seen = new Set<string>();
  const pool: QuestionStep[] = [];
  [...lessonSteps.filter((s): s is QuestionStep => s.kind === 'question'), ...challenge].forEach((q) => {
    if (seen.has(q.prompt)) return;
    seen.add(q.prompt);
    pool.push(q);
  });
  return pool;
}

export function buildPlan(course: LegacyCourseData, analysis: LearningAnalysis, lessonSteps: LessonStep[], challenge: ChallengeQuestion[]): PersonalizedPlan {
  const pool = questionPool(lessonSteps, challenge);
  const weak = weakestSkills(analysis).slice(0, 2);
  const items: PracticeItem[] = weak.map((s) => ({
    key: `skill:${s.skill}`,
    mode: 'skill',
    skill: s.skill,
    title: s.skill,
    reason: `You got ${s.correct} of ${s.total} right. Rebuild it step by step with a quick visual refresher.`,
    questionCount: Math.min(5, pool.filter((q) => q.skill === s.skill).length)
  }));
  items.push({
    key: 'visual',
    mode: 'visual',
    title: 'Visual Problems',
    reason: 'See it, then solve it — questions you answer by reading a picture.',
    questionCount: Math.min(5, pool.filter((q) => q.visual).length)
  });
  items.push({
    key: 'challenge',
    mode: 'challenge',
    title: 'Challenge Questions',
    reason: 'Stretch questions that mix skills together, for when you feel ready.',
    questionCount: Math.min(5, Math.max(3, pool.filter((q) => q.level === 'stretch').length))
  });

  const focusSkill = weak[0]?.skill ?? null;
  return {
    courseId: course.id,
    focusSkill,
    headline: focusSkill ? `Let’s strengthen ${focusSkill.toLowerCase()}` : `You’ve mastered ${course.title} — time to stretch`,
    items: items.filter((i) => i.questionCount > 0)
  };
}

export function buildPracticeSteps(mode: PracticeMode, skill: string | undefined, lessonSteps: LessonStep[], challenge: ChallengeQuestion[]): LessonStep[] {
  const pool = questionPool(lessonSteps, challenge);
  if (mode === 'skill' && skill) {
    const questions = pool.filter((q) => q.skill === skill).slice(0, 5);
    const firstIndex = lessonSteps.findIndex((s) => s.kind === 'question' && s.skill === skill);
    const concept = firstIndex >= 0 ?
    [...lessonSteps.slice(0, firstIndex)].reverse().find((s) => s.kind === 'concept') :
    undefined;
    return concept ? [concept, ...questions] : questions;
  }
  if (mode === 'visual') return pool.filter((q) => q.visual).slice(0, 5);
  const stretch = pool.filter((q) => q.level === 'stretch');
  const filler = pool.filter((q) => q.level !== 'stretch').slice(-Math.max(0, 3 - stretch.length));
  return [...stretch, ...filler].slice(0, 5);
}

export function practiceTitle(mode: PracticeMode, skill?: string): string {
  if (mode === 'skill' && skill) return `Practice: ${skill}`;
  if (mode === 'visual') return 'Visual Problems';
  return 'Challenge Questions';
}