import { QuestionStepData } from '../types/learning';

export const warmupQuestions: QuestionStepData[] = [
{
  kind: 'question',
  id: 'wu-1',
  prompt: 'Which fraction is shaded?',
  visual: { type: 'pie', parts: 4, filled: 3 },
  options: ['1/4', '2/4', '3/4', '4/4'],
  answer: 2,
  explanation: '3 of the 4 equal parts are shaded.'
},
{
  kind: 'question',
  id: 'wu-2',
  prompt: 'How many dots?',
  visual: { type: 'dots', rows: 3, cols: 4 },
  options: ['7', '12', '10', '14'],
  answer: 1,
  explanation: '3 rows of 4 is 3 × 4 = 12.'
},
{
  kind: 'question',
  id: 'wu-3',
  prompt: 'What comes next?',
  visual: { type: 'pattern', items: ['circle', 'square', 'circle', 'square', 'circle'] },
  options: ['Circle', 'Square', 'Triangle', 'Star'],
  answer: 1,
  explanation: 'The pattern goes circle, square, circle, square…'
},
{
  kind: 'question',
  id: 'wu-4',
  prompt: 'What do plants need to make food?',
  visual: { type: 'icon', icon: 'sprout' },
  options: ['Sand', 'Sunlight', 'Plastic', 'Noise'],
  answer: 1,
  explanation: 'Leaves use sunlight to make food.'
},
{
  kind: 'question',
  id: 'wu-5',
  prompt: 'Which word is a noun?',
  options: ['jump', 'happy', 'river', 'slowly'],
  answer: 2,
  explanation: 'A noun names a person, place or thing. A river is a place.'
}];