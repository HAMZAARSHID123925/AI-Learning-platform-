'use client';

import type { Course } from '@/types/all_dashbord/index';

export const courses: Course[] = [
{ id: 'g1-math', grade: 1, subject: 'math', title: 'Counting & Numbers', lessons: 6, completedLessons: 3, description: 'Count, compare and order numbers up to 100.', nextLesson: { number: 4, title: 'Counting by Tens', progress: 40 } },
{ id: 'g1-science', grade: 1, subject: 'science', title: 'Living Things', lessons: 7, completedLessons: 1, description: 'Discover what plants and animals need to grow.', nextLesson: { number: 2, title: 'What Do Plants Need?', progress: 15 } },
{ id: 'g1-english', grade: 1, subject: 'english', title: 'Letters & Sounds', lessons: 8, completedLessons: 5, description: 'Blend sounds together to read your first words.', nextLesson: { number: 6, title: 'Short Vowels', progress: 60 } },
{ id: 'g1-computer', grade: 1, subject: 'computer', title: 'Meet the Computer', lessons: 5, completedLessons: 0, description: 'Learn the parts of a computer and how to use them safely.', nextLesson: { number: 1, title: 'Screen, Mouse & Keys', progress: 0 } },

{ id: 'g2-math', grade: 2, subject: 'math', title: 'Adding & Taking Away', lessons: 7, completedLessons: 4, description: 'Add and subtract with pictures, number lines and tens.', nextLesson: { number: 5, title: 'Subtract with Pictures', progress: 55 } },
{ id: 'g2-science', grade: 2, subject: 'science', title: 'Weather & Seasons', lessons: 6, completedLessons: 2, description: 'Find out why it rains, snows and gets sunny.', nextLesson: { number: 3, title: 'Why It Rains', progress: 30 } },
{ id: 'g2-english', grade: 2, subject: 'english', title: 'Word Families', lessons: 8, completedLessons: 3, description: 'Spot patterns in words to read faster.', nextLesson: { number: 4, title: 'The -at Family', progress: 20 } },
{ id: 'g2-computer', grade: 2, subject: 'computer', title: 'Mouse & Keyboard', lessons: 5, completedLessons: 1, description: 'Click, drag and type like a pro.', nextLesson: { number: 2, title: 'Click, Drag, Drop', progress: 45 } },

{ id: 'g3-math', grade: 3, subject: 'math', title: 'Multiplication', lessons: 8, completedLessons: 5, description: 'Groups, arrays and the times tables made visual.', nextLesson: { number: 6, title: 'Arrays & Groups', progress: 64 } },
{ id: 'g3-science', grade: 3, subject: 'science', title: 'Rocks & Soil', lessons: 6, completedLessons: 1, description: 'Dig into the ground beneath your feet.', nextLesson: { number: 2, title: 'Three Kinds of Rock', progress: 10 } },
{ id: 'g3-english', grade: 3, subject: 'english', title: 'Story Explorers', lessons: 7, completedLessons: 4, description: 'Characters, settings and how stories are built.', nextLesson: { number: 5, title: 'Characters & Feelings', progress: 35 } },
{ id: 'g3-computer', grade: 3, subject: 'computer', title: 'Typing Adventures', lessons: 6, completedLessons: 2, description: 'Learn the home row and type without looking.', nextLesson: { number: 3, title: 'Home Row Heroes', progress: 50 } },

{ id: 'g4-math', grade: 4, subject: 'math', title: 'Division & Patterns', lessons: 8, completedLessons: 4, description: 'Share things equally and find number patterns.', nextLesson: { number: 5, title: 'Remainders', progress: 48 } },
{ id: 'g4-science', grade: 4, subject: 'science', title: 'Energy & Motion', lessons: 7, completedLessons: 3, description: 'Pushes, pulls and what makes things move.', nextLesson: { number: 4, title: 'Pushes and Pulls', progress: 25 } },
{ id: 'g4-english', grade: 4, subject: 'english', title: 'Grammar Quest', lessons: 6, completedLessons: 2, description: 'Build strong sentences one word at a time.', nextLesson: { number: 3, title: 'Nouns vs Verbs', progress: 70 } },
{ id: 'g4-computer', grade: 4, subject: 'computer', title: 'Coding with Blocks', lessons: 7, completedLessons: 1, description: 'Snap blocks together to make things happen.', nextLesson: { number: 2, title: 'Loops', progress: 15 } },

{ id: 'g5-math', grade: 5, subject: 'math', title: 'Fractions', lessons: 6, completedLessons: 5, description: 'Split, share and compare parts of a whole.', nextLesson: { number: 6, title: 'Equal Parts', progress: 72 } },
{ id: 'g5-science', grade: 5, subject: 'science', title: 'Plants & Animals', lessons: 8, completedLessons: 3, description: 'Food chains, habitats and how life connects.', nextLesson: { number: 4, title: 'Food Chains', progress: 40 } },
{ id: 'g5-english', grade: 5, subject: 'english', title: 'Reading Skills', lessons: 7, completedLessons: 2, description: 'Find main ideas and read between the lines.', nextLesson: { number: 3, title: 'Finding the Main Idea', progress: 20 } },
{ id: 'g5-computer', grade: 5, subject: 'computer', title: 'Digital Basics', lessons: 6, completedLessons: 1, description: 'Files, folders and staying safe online.', nextLesson: { number: 2, title: 'Files & Folders', progress: 30 } }];