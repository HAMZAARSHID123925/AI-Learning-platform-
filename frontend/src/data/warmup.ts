import type { WarmupQuestion } from '@/types';

export const earlyWarmup: WarmupQuestion[] = [
{ prompt: 'What is 4 + 3?', options: ['6', '7', '8'], answer: 1 },
{ prompt: 'Which word rhymes with “cat”?', options: ['Hat', 'Dog', 'Sun'], answer: 0 },
{ prompt: 'What do plants need to grow?', options: ['Candy', 'Sunlight', 'Toys'], answer: 1 },
{ prompt: 'Which number is bigger?', options: ['12', '21', '9'], answer: 1 },
{ prompt: 'What do you use to click on a computer?', options: ['Mouse', 'Spoon', 'Pencil'], answer: 0 }];


export const upperWarmup: WarmupQuestion[] = [
{ prompt: 'Which fraction is the same as 1/2?', options: ['2/3', '3/6', '1/4'], answer: 1 },
{ prompt: 'What is 36 ÷ 4?', options: ['8', '9', '7'], answer: 1 },
{ prompt: 'In a food chain, what eats the grass?', options: ['A rabbit', 'A hawk', 'The sun'], answer: 0 },
{ prompt: 'Which word is a verb?', options: ['Quickly', 'Jump', 'Blue'], answer: 1 },
{ prompt: 'Which is the safest password?', options: ['12345', 'myname', 'Tr33!Blue7'], answer: 2 }];