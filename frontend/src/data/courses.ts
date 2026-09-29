import { Course } from '../types/learning';

export const courses: Course[] = [
// Grade 1
{ id: 'counting-1', title: 'Counting to 100', subject: 'math', grade: 1, lessonCount: 6, completedLessons: 0, progress: 0, moduleTitles: ['Numbers to 20', 'Counting by tens', 'Numbers to 100'] },
{ id: 'senses-1', title: 'My Five Senses', subject: 'science', grade: 1, lessonCount: 5, completedLessons: 0, progress: 0, moduleTitles: ['Seeing & hearing', 'Touch & taste', 'Using my senses'] },
{ id: 'phonics-1', title: 'Letter Sounds', subject: 'english', grade: 1, lessonCount: 8, completedLessons: 0, progress: 0, moduleTitles: ['Short vowels', 'Blends', 'First words'] },
{ id: 'computer-1', title: 'Meet the Computer', subject: 'cs', grade: 1, lessonCount: 5, completedLessons: 0, progress: 0, moduleTitles: ['Parts of a computer', 'Mouse & keyboard', 'Staying safe'] },

// Grade 2
{ id: 'addition-2', title: 'Adding & Subtracting', subject: 'math', grade: 2, lessonCount: 8, completedLessons: 8, progress: 100, moduleTitles: ['Adding to 100', 'Subtracting to 100', 'Word problems'] },
{ id: 'weather-2', title: 'Weather & Seasons', subject: 'science', grade: 2, lessonCount: 6, completedLessons: 6, progress: 100, moduleTitles: ['Types of weather', 'The four seasons', 'Measuring weather'] },
{ id: 'sentences-2', title: 'Building Sentences', subject: 'english', grade: 2, lessonCount: 6, completedLessons: 6, progress: 100, moduleTitles: ['Nouns & verbs', 'Capitals & periods', 'Longer sentences'] },
{ id: 'patterns-2', title: 'Patterns & Sequences', subject: 'cs', grade: 2, lessonCount: 5, completedLessons: 0, progress: 0, moduleTitles: ['Spotting patterns', 'Making sequences', 'Repeat it'] },

// Grade 3
{
  id: 'fractions-3', title: 'Fractions', subject: 'math', grade: 3, lessonCount: 8, completedLessons: 5, progress: 72,
  moduleTitles: ['Understanding Fractions', 'Comparing Fractions', 'Equivalent Fractions'],
  lessonTitles: ['What is a fraction?', 'Parts of a whole', 'Fractions on a line', 'Same denominator', 'Same numerator', 'Equal parts', 'Simplifying', 'Final Challenge']
},
{
  id: 'plants-3', title: 'Plants & Animals', subject: 'science', grade: 3, lessonCount: 8, completedLessons: 3, progress: 41,
  moduleTitles: ['How Plants Grow', 'Animal Groups', 'Habitats'],
  lessonTitles: ['Parts of a plant', 'What plants need', 'Seeds & growth', 'Mammals & birds', 'Fish & reptiles', 'Where animals live', 'Food chains', 'Final Challenge']
},
{
  id: 'reading-3', title: 'Reading Skills', subject: 'english', grade: 3, lessonCount: 8, completedLessons: 7, progress: 88,
  moduleTitles: ['Main Idea', 'Characters', 'Predictions'],
  lessonTitles: ['Finding the main idea', 'Key details', 'Who is in the story?', 'How characters feel', 'Clues in the text', 'What happens next?', 'Checking predictions', 'Final Challenge']
},
{
  id: 'digital-3', title: 'Digital Basics', subject: 'cs', grade: 3, lessonCount: 8, completedLessons: 2, progress: 25,
  moduleTitles: ['Files & Folders', 'Typing Skills', 'Online Safety'],
  lessonTitles: ['What is a file?', 'Making folders', 'Home row keys', 'Typing words', 'Typing sentences', 'Strong passwords', 'Being kind online', 'Final Challenge']
},
{ id: 'multiplication-3', title: 'Multiplication Facts', subject: 'math', grade: 3, lessonCount: 6, completedLessons: 6, progress: 100, moduleTitles: ['Equal groups', 'Times tables', 'Arrays'] },
{ id: 'rocks-3', title: 'Rocks & Minerals', subject: 'science', grade: 3, lessonCount: 6, completedLessons: 0, progress: 0, moduleTitles: ['Types of rocks', 'Minerals', 'How rocks change'] },

// Grade 4
{ id: 'multiply-4', title: 'Long Multiplication', subject: 'math', grade: 4, lessonCount: 8, completedLessons: 0, progress: 0, moduleTitles: ['Place value', 'Multiply by 1 digit', 'Multiply by 2 digits'] },
{ id: 'energy-4', title: 'Energy & Forces', subject: 'science', grade: 4, lessonCount: 7, completedLessons: 0, progress: 0, moduleTitles: ['Forms of energy', 'Push & pull', 'Simple machines'] },
{ id: 'writing-4', title: 'Writing Stories', subject: 'english', grade: 4, lessonCount: 7, completedLessons: 0, progress: 0, moduleTitles: ['Planning', 'Characters & setting', 'Editing'] },
{ id: 'algorithms-4', title: 'Algorithms', subject: 'cs', grade: 4, lessonCount: 6, completedLessons: 0, progress: 0, moduleTitles: ['Step by step', 'Loops', 'Fixing bugs'] },

// Grade 5
{ id: 'decimals-5', title: 'Decimals', subject: 'math', grade: 5, lessonCount: 8, completedLessons: 0, progress: 0, moduleTitles: ['Tenths & hundredths', 'Comparing decimals', 'Adding decimals'] },
{ id: 'solar-5', title: 'The Solar System', subject: 'science', grade: 5, lessonCount: 7, completedLessons: 0, progress: 0, moduleTitles: ['The Sun', 'The planets', 'Moons & more'] },
{ id: 'grammar-5', title: 'Grammar Power', subject: 'english', grade: 5, lessonCount: 6, completedLessons: 0, progress: 0, moduleTitles: ['Parts of speech', 'Punctuation', 'Clauses'] },
{ id: 'coding-5', title: 'Coding with Blocks', subject: 'cs', grade: 5, lessonCount: 8, completedLessons: 0, progress: 0, moduleTitles: ['Events', 'Loops & conditions', 'Build a game'] }];