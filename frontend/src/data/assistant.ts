import { AssistantReply } from '../types/assistant';

export const assistantSuggestions: string[] = [
  'Help me with fractions',
  'Explain photosynthesis',
  'Give me computer science course',
  'Give me a challenge'
];

/** Checked in order — first match wins. */
export const assistantReplies: AssistantReply[] = [
  {
    keywords: ['computer science', 'cs', 'coding', 'python', 'code'],
    text: 'Computer science covers everything from basic programming to complex algorithms. Jump in here to build your coding foundations.',
    secondaryText: 'Start building programs from the ground up with this core introduction to Python & Logic.',
    recommendation: {
      tag: 'RECOMMENDED',
      title: 'Variables & Coding',
      subtitle: 'Thinking in Python · Level 1',
      description: 'Learn to assign and update variables to build a strong foundation for creating with code.',
      buttonText: 'Start',
      courseId: 'digital-3',
      icon: '🐍'
    },
    followUps: ['Show another lesson', 'Help me with fractions', 'Give me a challenge']
  },
  {
    keywords: ['math', 'fraction', 'fractions'],
    text: 'Fractions are equal parts of a whole! Understanding numerators and denominators makes visual math easy.',
    secondaryText: 'Explore equal parts, half, quarters, and comparing fractions step-by-step.',
    recommendation: {
      tag: 'RECOMMENDED',
      title: 'Fractions',
      subtitle: 'Primary Mathematics · Grade 3',
      description: 'Understand parts of a whole, halves, and quarters with interactive visual models.',
      buttonText: 'Start',
      courseId: 'fractions-3',
      icon: '🍕'
    },
    followUps: ['What is 2/4?', 'Give me a challenge']
  },
  {
    keywords: ['science', 'photosynthesis', 'plant', 'plants'],
    text: 'Plants make their own food! Leaves use sunlight, water, and air to make energy and release oxygen.',
    secondaryText: 'Dive into botany, ecosystems, and animal habitats with interactive flashcards.',
    recommendation: {
      tag: 'RECOMMENDED',
      title: 'Plants & Animals',
      subtitle: 'Living Science · Grade 3',
      description: 'Explore parts of a plant, what seeds need to grow, and diverse animal habitats.',
      buttonText: 'Start',
      courseId: 'plants-3',
      icon: '🌱'
    },
    followUps: ['Why are leaves green?', 'Give me a challenge']
  },
  {
    keywords: ['another'],
    text: 'Try this one: which is bigger, 1/3 or 1/5?',
    followUps: ['1/3', '1/5']
  },
  {
    keywords: ['1/3'],
    text: 'Right! Fewer parts means bigger pieces.',
    followUps: ['Give me computer science course', 'Another challenge']
  },
  {
    keywords: ['1/5'],
    text: 'Not quite. 1/3 is bigger — the whole is cut into fewer parts, so each piece is larger.',
    followUps: ['Give me a challenge']
  },
  {
    keywords: ['3/4'],
    text: 'Correct! 1/2 is the same as 2/4, and 2/4 + 1/4 = 3/4.',
    followUps: ['Give me a challenge']
  },
  {
    keywords: ['challenge', 'quiz'],
    text: 'Here’s one: what is 1/2 + 1/4?',
    followUps: ['3/4', '2/6', '1/6']
  },
  {
    keywords: ['hi', 'hello', 'hey'],
    text: 'Hi there! I am your AI learning assistant. What would you like to explore today?',
    followUps: ['Give me computer science course', 'Help me with fractions', 'Explain photosynthesis']
  }
];

export const assistantFallback: AssistantReply = {
  keywords: [],
  text: 'Computer science covers everything from basic programming to complex algorithms. Jump in here to build your coding foundations.',
  secondaryText: 'Start building programs from the ground up with this core introduction to Python.',
  recommendation: {
    tag: 'RECOMMENDED',
    title: 'Variables',
    subtitle: 'Thinking in Python · Level 1',
    description: 'Learn to assign and update variables to build a strong foundation for creating with code.',
    buttonText: 'Start',
    courseId: 'digital-3',
    icon: '🐍'
  },
  followUps: ['Give me computer science course', 'Help me with fractions', 'Give me a challenge']
};