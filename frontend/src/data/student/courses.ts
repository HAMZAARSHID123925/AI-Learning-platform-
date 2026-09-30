import type { Course } from '@/types/student/learning';
import { subjectImages, topicImages } from './illustrations';

export const courses: Course[] = [
/* ---------- Grade 5 · Mathematics ---------- */
{
  id: 'g5-fractions', grade: 5, subject: 'math', title: 'Fractions', image: topicImages.fractions,
  description: 'Split, share and compare parts of a whole.',
  skills: ['Basic fractions', 'Equivalent fractions', 'Comparing fractions', 'Adding fractions'],
  lessons: [
  { id: 'fr-1', title: 'What is a fraction?', minutes: 6 },
  { id: 'fr-2', title: 'Equivalent fractions', minutes: 8 },
  { id: 'fr-3', title: 'Comparing fractions', minutes: 7 },
  { id: 'fr-4', title: 'Adding fractions', minutes: 8 }]

},
{
  id: 'g5-decimals', grade: 5, subject: 'math', title: 'Decimals', image: topicImages.decimals,
  description: 'Tenths, hundredths and how decimals link to fractions.',
  skills: ['Place value', 'Decimals & fractions', 'Comparing decimals'],
  lessons: [
  { id: 'dec-1', title: 'Tenths and hundredths', minutes: 7 },
  { id: 'dec-2', title: 'Decimals as fractions', minutes: 6 },
  { id: 'dec-3', title: 'Comparing decimals', minutes: 6 }]

},
{
  id: 'g5-geometry', grade: 5, subject: 'math', title: 'Geometry', image: topicImages.geometry,
  description: 'Polygons, angles and measuring around shapes.',
  skills: ['Shapes & sides', 'Angles', 'Perimeter'],
  lessons: [
  { id: 'geo-1', title: 'Polygons', minutes: 6 },
  { id: 'geo-2', title: 'Angles', minutes: 7 },
  { id: 'geo-3', title: 'Perimeter', minutes: 7 }]

},
{
  id: 'g5-algebra', grade: 5, subject: 'math', title: 'Basic Algebra', image: topicImages.algebra,
  description: 'Mystery numbers, patterns and balancing equations.',
  skills: ['Unknowns', 'Patterns', 'Equations'],
  lessons: [
  { id: 'alg-1', title: 'Mystery numbers', minutes: 6 },
  { id: 'alg-2', title: 'Number patterns', minutes: 6 },
  { id: 'alg-3', title: 'Solving equations', minutes: 8 }]

},

/* ---------- Grade 5 · Science ---------- */
{
  id: 'g5-plants-animals', grade: 5, subject: 'science', title: 'Plants & Animals', image: topicImages.plantsAnimals,
  description: 'Food chains, habitats and how life connects.',
  skills: ['Living things', 'Food chains', 'Habitats'],
  lessons: [
  { id: 'pa-1', title: 'What living things need', minutes: 6 },
  { id: 'pa-2', title: 'Food chains', minutes: 7 },
  { id: 'pa-3', title: 'Habitats', minutes: 6 }]

},
{
  id: 'g5-photosynthesis', grade: 5, subject: 'science', title: 'Photosynthesis', image: topicImages.photosynthesis,
  description: 'How plants turn sunlight into food.',
  skills: ['Ingredients', 'Plant parts', 'Oxygen & energy'],
  lessons: [
  { id: 'ps-1', title: 'Plants make food', minutes: 7 },
  { id: 'ps-2', title: 'Parts of a plant', minutes: 6 },
  { id: 'ps-3', title: 'Why it matters', minutes: 6 }]

},
{
  id: 'g5-human-body', grade: 5, subject: 'science', title: 'Human Body', image: topicImages.humanBody,
  description: 'Organs, body systems and staying healthy.',
  skills: ['Organs', 'Body systems', 'Healthy habits'],
  lessons: [
  { id: 'hb-1', title: 'Organs at work', minutes: 6 },
  { id: 'hb-2', title: 'Body systems', minutes: 7 },
  { id: 'hb-3', title: 'Staying healthy', minutes: 5 }]

},

/* ---------- Grade 5 · English ---------- */
{
  id: 'g5-reading', grade: 5, subject: 'english', title: 'Reading Skills', image: subjectImages.english,
  description: 'Find main ideas and read between the lines.',
  skills: ['Main idea', 'Inference', 'Sequencing'],
  lessons: [
  { id: 'rd-1', title: 'Finding the main idea', minutes: 7 },
  { id: 'rd-2', title: 'Reading between the lines', minutes: 7 },
  { id: 'rd-3', title: 'Story order', minutes: 6 }]

},
{
  id: 'g5-vocabulary', grade: 5, subject: 'english', title: 'Vocabulary', image: topicImages.vocabulary,
  description: 'Synonyms, opposites and clever context clues.',
  skills: ['Synonyms', 'Antonyms', 'Context clues'],
  lessons: [
  { id: 'voc-1', title: 'Synonyms', minutes: 5 },
  { id: 'voc-2', title: 'Antonyms', minutes: 5 },
  { id: 'voc-3', title: 'Context clues', minutes: 7 }]

},
{
  id: 'g5-grammar', grade: 5, subject: 'english', title: 'Grammar', image: topicImages.grammar,
  description: 'Build strong sentences one word at a time.',
  skills: ['Nouns & verbs', 'Adjectives', 'Punctuation'],
  lessons: [
  { id: 'gr-1', title: 'Nouns and verbs', minutes: 6 },
  { id: 'gr-2', title: 'Adjectives', minutes: 5 },
  { id: 'gr-3', title: 'Punctuation', minutes: 6 }]

},

/* ---------- Grade 5 · Computer Science ---------- */
{
  id: 'g5-digital-basics', grade: 5, subject: 'computer', title: 'Digital Basics', image: subjectImages.computer,
  description: 'Computers, the internet and your first steps in code.',
  skills: ['Computer basics', 'Hardware & software', 'Internet', 'Coding'],
  lessons: [
  { id: 'db-1', title: 'What is a Computer?', minutes: 6 },
  { id: 'db-2', title: 'Hardware and Software', minutes: 6 },
  { id: 'db-3', title: 'Internet Basics', minutes: 7 },
  { id: 'db-4', title: 'Introduction to Coding', minutes: 8 }]

},

/* ---------- Grades 1–4 (interactive paths coming soon) ---------- */
{ id: 'g1-math', grade: 1, subject: 'math', title: 'Counting & Numbers', image: subjectImages.math, description: 'Count, compare and order numbers up to 100.', skills: [], lessons: [] },
{ id: 'g1-science', grade: 1, subject: 'science', title: 'Living Things', image: subjectImages.science, description: 'Discover what plants and animals need to grow.', skills: [], lessons: [] },
{ id: 'g1-english', grade: 1, subject: 'english', title: 'Letters & Sounds', image: subjectImages.english, description: 'Blend sounds together to read your first words.', skills: [], lessons: [] },
{ id: 'g1-computer', grade: 1, subject: 'computer', title: 'Meet the Computer', image: subjectImages.computer, description: 'Learn the parts of a computer and how to use them safely.', skills: [], lessons: [] },
{ id: 'g2-math', grade: 2, subject: 'math', title: 'Adding & Taking Away', image: subjectImages.math, description: 'Add and subtract with pictures, number lines and tens.', skills: [], lessons: [] },
{ id: 'g2-science', grade: 2, subject: 'science', title: 'Weather & Seasons', image: subjectImages.science, description: 'Find out why it rains, snows and gets sunny.', skills: [], lessons: [] },
{ id: 'g2-english', grade: 2, subject: 'english', title: 'Word Families', image: subjectImages.english, description: 'Spot patterns in words to read faster.', skills: [], lessons: [] },
{ id: 'g2-computer', grade: 2, subject: 'computer', title: 'Mouse & Keyboard', image: subjectImages.computer, description: 'Click, drag and type like a pro.', skills: [], lessons: [] },
{ id: 'g3-math', grade: 3, subject: 'math', title: 'Multiplication', image: subjectImages.math, description: 'Groups, arrays and the times tables made visual.', skills: [], lessons: [] },
{ id: 'g3-science', grade: 3, subject: 'science', title: 'Rocks & Soil', image: subjectImages.science, description: 'Dig into the ground beneath your feet.', skills: [], lessons: [] },
{ id: 'g3-english', grade: 3, subject: 'english', title: 'Story Explorers', image: subjectImages.english, description: 'Characters, settings and how stories are built.', skills: [], lessons: [] },
{ id: 'g3-computer', grade: 3, subject: 'computer', title: 'Typing Adventures', image: subjectImages.computer, description: 'Learn the home row and type without looking.', skills: [], lessons: [] },
{ id: 'g4-math', grade: 4, subject: 'math', title: 'Division & Patterns', image: subjectImages.math, description: 'Share things equally and find number patterns.', skills: [], lessons: [] },
{ id: 'g4-science', grade: 4, subject: 'science', title: 'Energy & Motion', image: subjectImages.science, description: 'Pushes, pulls and what makes things move.', skills: [], lessons: [] },
{ id: 'g4-english', grade: 4, subject: 'english', title: 'Grammar Quest', image: subjectImages.english, description: 'Build strong sentences one word at a time.', skills: [], lessons: [] },
{ id: 'g4-computer', grade: 4, subject: 'computer', title: 'Coding with Blocks', image: subjectImages.computer, description: 'Snap blocks together to make things happen.', skills: [], lessons: [] }];