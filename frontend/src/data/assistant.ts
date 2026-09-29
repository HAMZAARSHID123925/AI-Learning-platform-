import { AssistantReply } from '../types/assistant';

export const assistantSuggestions: string[] = [
'Help me with fractions',
'Explain photosynthesis',
'Give me a challenge'];


/** Checked in order — first match wins. */
export const assistantReplies: AssistantReply[] = [
{ keywords: ['another'], text: 'Try this one: which is bigger, 1/3 or 1/5?', followUps: ['1/3', '1/5'] },
{ keywords: ['1/3'], text: 'Right! Fewer parts means bigger pieces.', followUps: ['Another challenge'] },
{ keywords: ['1/5'], text: 'Not quite. 1/3 is bigger — the whole is cut into fewer parts, so each piece is larger.', followUps: ['Another challenge'] },
{ keywords: ['3/4'], text: 'Correct! 1/2 is the same as 2/4, and 2/4 + 1/4 = 3/4.', followUps: ['Another challenge'] },
{ keywords: ['2/6', '1/6'], text: 'Close! Make the bottoms match first: 1/2 = 2/4. Now add 1/4.', followUps: ['3/4', 'Another challenge'] },
{ keywords: ['challenge', 'quiz'], text: 'Here’s one: what is 1/2 + 1/4?', followUps: ['3/4', '2/6', '1/6'] },
{ keywords: ['2/4'], text: '2/4 is the same as 1/2 — exactly half of the whole.', followUps: ['Give me a challenge'] },
{ keywords: ['fraction', 'half', 'quarter'], text: 'A fraction is part of a whole. Cut a pizza into 4 equal slices — one slice is 1/4.', followUps: ['What is 2/4?', 'Give me a challenge'] },
{ keywords: ['green'], text: 'Leaves have chlorophyll. It soaks up sunlight and looks green to our eyes.', followUps: ['Explain photosynthesis'] },
{ keywords: ['photosynthesis', 'plant', 'leaf', 'leaves', 'sunlight'], text: 'Plants make their own food! Leaves use sunlight, water and air to make sugar. That’s photosynthesis.', followUps: ['Why are leaves green?', 'Give me a challenge'] },
{ keywords: ['read', 'story', 'book', 'main idea'], text: 'After each page, say in one sentence what it was about. That’s the main idea!', followUps: ['Give me a challenge'] },
{ keywords: ['computer', 'coding', 'code', 'typing'], text: 'Computers follow steps called instructions. Put the steps in order, and the computer does the job.', followUps: ['Give me a challenge'] },
{ keywords: ['hi', 'hello', 'hey'], text: 'Hi Alex! What would you like to explore today?', followUps: ['Help me with fractions', 'Explain photosynthesis'] }];


export const assistantFallback: AssistantReply = {
  keywords: [],
  text: 'Good question! I can help with math, science, reading and computers. Try one of these:',
  followUps: ['Help me with fractions', 'Explain photosynthesis', 'Give me a challenge']
};