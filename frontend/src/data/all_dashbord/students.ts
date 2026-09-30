'use client';

import type { StudentRecord } from '@/types/all_dashbord/index';

const g5 = ['g5-math', 'g5-science', 'g5-english', 'g5-computer'];
const g4 = ['g4-math', 'g4-science', 'g4-english', 'g4-computer'];
const g3 = ['g3-math', 'g3-science', 'g3-english', 'g3-computer'];
const g2 = ['g2-math', 'g2-science', 'g2-english', 'g2-computer'];
const g1 = ['g1-math', 'g1-science', 'g1-english', 'g1-computer'];

export const students: StudentRecord[] = [
{ id: 's-ali', name: 'Ali Hassan', grade: 5, courseIds: g5, progress: 82, avgScore: 88, weakAreas: ['Mixed numbers'], lastActive: '2 hours ago', assessments: [{ title: 'Quiz 1 · Halves & Quarters', score: 9, total: 10 }, { title: 'Quiz 2 · Equivalent Fractions', score: 8, total: 10 }, { title: 'Checkpoint · Comparing', score: 17, total: 20 }] },
{ id: 's-sara', name: 'Sara Malik', grade: 5, courseIds: g5, progress: 94, avgScore: 95, weakAreas: ['Word problems'], lastActive: '30 min ago', assessments: [{ title: 'Quiz 1 · Halves & Quarters', score: 10, total: 10 }, { title: 'Quiz 2 · Equivalent Fractions', score: 9, total: 10 }, { title: 'Checkpoint · Comparing', score: 19, total: 20 }] },
{ id: 's-ahmed', name: 'Ahmed Khan', grade: 5, courseIds: g5, progress: 58, avgScore: 64, weakAreas: ['Comparing fractions', 'Equivalent fractions'], lastActive: 'Yesterday', assessments: [{ title: 'Quiz 1 · Halves & Quarters', score: 7, total: 10 }, { title: 'Quiz 2 · Equivalent Fractions', score: 5, total: 10 }, { title: 'Checkpoint · Comparing', score: 12, total: 20 }] },
{ id: 's-maya', name: 'Maya Chen', grade: 5, courseIds: g5, progress: 71, avgScore: 79, weakAreas: ['Improper fractions'], lastActive: '5 hours ago', assessments: [{ title: 'Quiz 1 · Halves & Quarters', score: 8, total: 10 }, { title: 'Quiz 2 · Equivalent Fractions', score: 8, total: 10 }, { title: 'Checkpoint · Comparing', score: 14, total: 20 }] },
{ id: 's-yusuf', name: 'Yusuf Ali', grade: 5, courseIds: g5, progress: 42, avgScore: 55, weakAreas: ['Equal parts', 'Number line fractions'], lastActive: '3 days ago', assessments: [{ title: 'Quiz 1 · Halves & Quarters', score: 6, total: 10 }, { title: 'Quiz 2 · Equivalent Fractions', score: 5, total: 10 }] },
{ id: 's-lina', name: 'Lina Park', grade: 5, courseIds: g5, progress: 88, avgScore: 91, weakAreas: ['Mixed numbers'], lastActive: '1 hour ago', assessments: [{ title: 'Quiz 1 · Halves & Quarters', score: 10, total: 10 }, { title: 'Quiz 2 · Equivalent Fractions', score: 9, total: 10 }, { title: 'Checkpoint · Comparing', score: 17, total: 20 }] },
{ id: 's-omar', name: 'Omar Siddiqui', grade: 5, courseIds: g5, progress: 66, avgScore: 72, weakAreas: ['Word problems'], lastActive: 'Yesterday', assessments: [{ title: 'Quiz 1 · Halves & Quarters', score: 8, total: 10 }, { title: 'Quiz 2 · Equivalent Fractions', score: 7, total: 10 }, { title: 'Checkpoint · Comparing', score: 13, total: 20 }] },
{ id: 's-zara', name: 'Zara Ahmed', grade: 5, courseIds: g5, progress: 77, avgScore: 84, weakAreas: ['Comparing fractions'], lastActive: '4 hours ago', assessments: [{ title: 'Quiz 1 · Halves & Quarters', score: 9, total: 10 }, { title: 'Quiz 2 · Equivalent Fractions', score: 8, total: 10 }, { title: 'Checkpoint · Comparing', score: 16, total: 20 }] },

{ id: 's-hamza', name: 'Hamza Qureshi', grade: 4, courseIds: g4, progress: 63, avgScore: 70, weakAreas: ['Remainders'], lastActive: 'Yesterday', assessments: [{ title: 'Quiz 1 · Sharing Equally', score: 7, total: 10 }, { title: 'Quiz 2 · Division Facts', score: 7, total: 10 }] },
{ id: 's-noor', name: 'Noor Fatima', grade: 4, courseIds: g4, progress: 90, avgScore: 93, weakAreas: ['Long division'], lastActive: '1 hour ago', assessments: [{ title: 'Quiz 1 · Sharing Equally', score: 10, total: 10 }, { title: 'Quiz 2 · Division Facts', score: 9, total: 10 }] },
{ id: 's-ethan', name: 'Ethan Brooks', grade: 4, courseIds: g4, progress: 51, avgScore: 60, weakAreas: ['Number patterns', 'Remainders'], lastActive: '2 days ago', assessments: [{ title: 'Quiz 1 · Sharing Equally', score: 6, total: 10 }, { title: 'Quiz 2 · Division Facts', score: 6, total: 10 }] },
{ id: 's-aisha', name: 'Aisha Rahman', grade: 4, courseIds: g4, progress: 79, avgScore: 85, weakAreas: ['Word problems'], lastActive: '3 hours ago', assessments: [{ title: 'Quiz 1 · Sharing Equally', score: 9, total: 10 }, { title: 'Quiz 2 · Division Facts', score: 8, total: 10 }] },

{ id: 's-leo', name: 'Leo Martins', grade: 3, courseIds: g3, progress: 68, avgScore: 76, weakAreas: ['7 times table'], lastActive: 'Today', assessments: [] },
{ id: 's-emma', name: 'Emma Wilson', grade: 3, courseIds: g3, progress: 85, avgScore: 89, weakAreas: ['Rock types'], lastActive: 'Today', assessments: [] },
{ id: 's-ibrahim', name: 'Ibrahim Saleh', grade: 2, courseIds: g2, progress: 47, avgScore: 58, weakAreas: ['Subtraction'], lastActive: '4 days ago', assessments: [] },
{ id: 's-mia', name: 'Mia Johnson', grade: 2, courseIds: g2, progress: 73, avgScore: 81, weakAreas: ['Word families'], lastActive: 'Yesterday', assessments: [] },
{ id: 's-adam', name: 'Adam Yousef', grade: 1, courseIds: g1, progress: 55, avgScore: 70, weakAreas: ['Short vowels'], lastActive: 'Today', assessments: [] },
{ id: 's-sofia', name: 'Sofia Rossi', grade: 1, courseIds: g1, progress: 81, avgScore: 88, weakAreas: ['Counting by tens'], lastActive: '2 hours ago', assessments: [] }];