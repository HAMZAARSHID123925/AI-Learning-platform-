import type { ChallengeSet } from '@/types/student/learning';

export const computerChallenges: ChallengeSet[] = [
{
  courseId: 'g5-digital-basics',
  questions: [
  { id: 'db-c1', kind: 'question', prompt: 'A computer takes input, processes it and gives…', options: ['Output', 'Electricity', 'Paper'], answer: 0, explanation: 'Input → process → output.', skill: 'Computer basics' },
  { id: 'db-c2', kind: 'question', prompt: 'Which is an output device?', options: ['Microphone', 'Monitor', 'Keyboard'], answer: 1, explanation: 'A monitor shows results to you.', skill: 'Computer basics' },
  { id: 'db-c3', kind: 'question', prompt: 'Which part is called the “brain” of the computer?', options: ['CPU', 'Mouse', 'Speaker'], answer: 0, explanation: 'The CPU processes all the instructions.', skill: 'Computer basics' },
  { id: 'db-c4', kind: 'question', prompt: 'Which one is hardware?', options: ['A spreadsheet app', 'A printer', 'A game'], answer: 1, explanation: 'You can touch a printer.', skill: 'Hardware & software' },
  { id: 'db-c5', kind: 'question', prompt: 'An operating system (like Windows) is…', options: ['Hardware', 'Software', 'A cable'], answer: 1, explanation: 'It’s a program that runs the computer.', skill: 'Hardware & software', level: 'stretch' },
  { id: 'db-c6', kind: 'question', prompt: 'What connects your device to the internet at home?', visual: { type: 'flow', nodes: [{ icon: 'laptop', label: 'Laptop' }, { icon: 'wifi', label: '?' }, { icon: 'globe', label: 'Internet' }] }, options: ['A router', 'A keyboard', 'A monitor'], answer: 0, explanation: 'The router links your home to the internet.', skill: 'Internet' },
  { id: 'db-c7', kind: 'question', prompt: 'What should you do if a stranger online asks for your address?', options: ['Share it', 'Tell a trusted adult', 'Ignore adults'], answer: 1, explanation: 'Never share personal info — tell a trusted adult.', skill: 'Internet' },
  { id: 'db-c8', kind: 'question', prompt: 'A website address is also called a…', options: ['URL', 'CPU', 'USB'], answer: 0, explanation: 'URLs like www.example.com point to websites.', skill: 'Internet' },
  { id: 'db-c9', kind: 'question', prompt: 'A mistake in code is called a…', options: ['Bug', 'Loop', 'Byte'], answer: 0, explanation: 'Programmers “debug” to fix bugs.', skill: 'Coding' },
  { id: 'db-c10', kind: 'question', prompt: 'A robot must walk 4 steps. Which code is shortest?', options: ['Step, step, step, step', 'Repeat 4 times: step', 'Step 1 time'], answer: 1, explanation: 'A loop repeats the step without rewriting it.', skill: 'Coding', level: 'stretch' }]

}];