import type { AssessmentAttempt, ChallengeSet, LegacyCourseData, LessonProgress, Recommendation } from '@/types/learning';
import { analyzeAttempt, weakestSkills } from './assessment';
import { getCourseProgress, isCourseComplete } from './progress';

export function buildRecommendations(
courses: LegacyCourseData[],
lessons: Record<string, LessonProgress>,
attempts: AssessmentAttempt[],
challenges: ChallengeSet[])
: Recommendation[] {
  const recs: Recommendation[] = [];
  const playable = courses.filter((c) => c.lessons && c.lessons.length > 0);

  // 1. Weak skill from the most recent assessment
  const latest = [...attempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
  if (latest) {
    const course = playable.find((c) => c.id === latest.courseId);
    const set = challenges.find((s) => s.courseId === latest.courseId);
    if (course && set) {
      const weak = weakestSkills(analyzeAttempt(course, set.questions, latest))[0];
      if (weak) {
        recs.push({
          id: `rec-weak-${course.id}`,
          subject: course.subject,
          title: `Practice ${weak.skill.toLowerCase()}`,
          reason: `You scored ${weak.correct}/${weak.total} on this in your ${course.title} Challenge Test.`,
          cta: 'Start practice',
          to: `/student/courses/${course.id}/personalized`
        });
      }
    }
  }

  // 2. A course whose lessons are done but hasn't been tested yet
  const readyToTest = playable.find((c) => isCourseComplete(c, lessons) && !attempts.some((a) => a.courseId === c.id));
  if (readyToTest) {
    recs.push({
      id: `rec-test-${readyToTest.id}`,
      subject: readyToTest.subject,
      title: `Take the ${readyToTest.title} Challenge`,
      reason: 'You finished every lesson. 10 questions will show what you’ve mastered.',
      cta: 'Start test',
      to: `/student/challenge/${readyToTest.id}`
    });
  }

  // 3. Nearly finished lesson
  const inProgress = playable.
  map((c) => ({ c, p: getCourseProgress(c, lessons) })).
  filter(({ p }) => p.nextLesson && p.nextLessonProgress > 0).
  sort((a, b) => b.p.nextLessonProgress - a.p.nextLessonProgress);
  const almost = inProgress.find(({ c }) => !recs.some((r) => r.id.endsWith(c.id)));
  if (almost?.p.nextLesson) {
    recs.push({
      id: `rec-finish-${almost.c.id}`,
      subject: almost.c.subject,
      title: `Finish “${almost.p.nextLesson.title}”`,
      reason: `You’re ${almost.p.nextLessonProgress}% through — a few minutes will wrap it up.`,
      cta: 'Resume',
      to: `/student/learn/${almost.c.id}/${almost.p.nextLesson.id}`
    });
  }

  // 4. Something new in a subject that's been quiet
  const fresh = playable.find((c) => !getCourseProgress(c, lessons).started && !recs.some((r) => r.subject === c.subject));
  if (fresh) {
    recs.push({
      id: `rec-new-${fresh.id}`,
      subject: fresh.subject,
      title: `Try ${fresh.title}`,
      reason: `${fresh.description} A good match for what you’ve been learning.`,
      cta: 'Start course',
      to: `/student/courses/${fresh.id}`
    });
  }

  return recs.slice(0, 3);
}