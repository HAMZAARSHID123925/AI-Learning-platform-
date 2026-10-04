import type { Subject } from '@/types';

export const lessonStepsBySubject: Record<Subject, any[]> = {
  math: [
  { kind: 'explain', id: 'm-1', text: '2 of 4 equal parts are shaded. That’s 2/4.', visual: { type: 'pie', parts: 4, filled: 2 } },
  { kind: 'explain', id: 'm-2', text: '1 of 2 parts is shaded. That’s 1/2 — the same amount!', visual: { type: 'bar', parts: 2, filled: 1 } },
  { kind: 'question', id: 'm-3', prompt: 'Which fraction equals 1/2?', visual: { type: 'pie', parts: 6, filled: 3 }, options: ['2/6', '3/6', '1/6', '4/6'], answer: 1, explanation: '3 of 6 parts is half of the whole.' },
  { kind: 'question', id: 'm-4', prompt: 'Which fraction is shaded?', visual: { type: 'bar', parts: 8, filled: 4 }, options: ['3/8', '5/8', '4/8', '1/8'], answer: 2, explanation: '4 of the 8 parts are shaded.' }],

  science: [
  { kind: 'explain', id: 's-1', text: 'Plants use sunlight to make their own food.', visual: { type: 'icon', icon: 'sun' } },
  { kind: 'explain', id: 's-2', text: 'Roots drink water from the soil.', visual: { type: 'icon', icon: 'droplets' } },
  { kind: 'question', id: 's-3', prompt: 'Which part of a plant makes food?', visual: { type: 'icon', icon: 'leaf' }, options: ['Roots', 'Leaves', 'Stem', 'Seeds'], answer: 1, explanation: 'Leaves catch sunlight and make food.' },
  { kind: 'question', id: 's-4', prompt: 'Which animal is a mammal?', visual: { type: 'icon', icon: 'paw' }, options: ['Frog', 'Eagle', 'Shark', 'Dog'], answer: 3, explanation: 'Dogs have fur and feed milk to their babies.' }],

  english: [
  { kind: 'explain', id: 'e-1', text: 'The main idea is what a text is mostly about.', visual: { type: 'icon', icon: 'book' } },
  { kind: 'question', id: 'e-2', prompt: 'Who is this sentence about?', visual: { type: 'word', text: 'Mia fed her puppy.' }, options: ['The puppy', 'Mia', 'The food', 'A cat'], answer: 1, explanation: 'Mia is the one doing the action.' },
  { kind: 'question', id: 'e-3', prompt: 'What is the main idea?', visual: { type: 'word', text: 'Bees make honey. Bees help flowers grow.' }, options: ['Flowers', 'Honey', 'Bees are helpful', 'Gardens'], answer: 2, explanation: 'Both sentences tell how bees help.' }],

  computer: [
  { kind: 'explain', id: 'c-1', text: 'A keyboard lets you type letters and numbers.', visual: { type: 'icon', icon: 'keyboard' } },
  { kind: 'explain', id: 'c-2', text: 'A mouse lets you point and click.', visual: { type: 'icon', icon: 'mouse' } },
  { kind: 'question', id: 'c-3', prompt: 'Which one shows pictures and words?', options: ['Keyboard', 'Mouse', 'Screen', 'Speaker'], answer: 2, explanation: 'The screen shows what the computer is doing.' }]

};