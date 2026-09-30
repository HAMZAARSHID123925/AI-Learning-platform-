'use client';

import type { AdminCourse, Teacher } from '@/types/all_dashbord/index';

export const platformStats = [
{ label: 'Total students', value: '820', change: '+48 this month' },
{ label: 'Total teachers', value: '24', change: '+2 this month' },
{ label: 'Total courses', value: '20', change: '4 per grade' },
{ label: 'Active today', value: '612', change: '75% of students' }];


export const studentsByGrade = [
{ grade: 'Grade 1', students: 120 },
{ grade: 'Grade 2', students: 150 },
{ grade: 'Grade 3', students: 170 },
{ grade: 'Grade 4', students: 180 },
{ grade: 'Grade 5', students: 200 }];


export const weeklyActiveUsers = [
{ day: 'Mon', users: 540 },
{ day: 'Tue', users: 588 },
{ day: 'Wed', users: 602 },
{ day: 'Thu', users: 571 },
{ day: 'Fri', users: 634 },
{ day: 'Sat', users: 410 },
{ day: 'Sun', users: 612 }];


export const teachers: Teacher[] = [
{ id: 't-ahmed', name: 'Mr Ahmed', subject: 'math', assignedCourseIds: ['g4-math', 'g5-math'], students: 430 },
{ id: 't-hana', name: 'Ms Hana', subject: 'math', assignedCourseIds: ['g1-math', 'g2-math', 'g3-math'], students: 440 },
{ id: 't-fatima', name: 'Ms Fatima', subject: 'science', assignedCourseIds: ['g1-science', 'g2-science', 'g3-science', 'g4-science', 'g5-science'], students: 790 },
{ id: 't-clara', name: 'Ms Clara', subject: 'english', assignedCourseIds: ['g1-english', 'g2-english', 'g3-english', 'g4-english', 'g5-english'], students: 805 },
{ id: 't-omar', name: 'Mr Omar', subject: 'computer', assignedCourseIds: ['g1-computer', 'g2-computer', 'g3-computer', 'g4-computer', 'g5-computer'], students: 760 },
{ id: 't-daniel', name: 'Mr Daniel', subject: 'science', assignedCourseIds: [], students: 0 }];


export const adminCourses: AdminCourse[] = [
{ id: 'g5-math', grade: 5, subject: 'math', enrolled: 250, teacherId: 't-ahmed', status: 'published', avgProgress: 72 },
{ id: 'g5-science', grade: 5, subject: 'science', enrolled: 214, teacherId: 't-fatima', status: 'published', avgProgress: 58 },
{ id: 'g5-english', grade: 5, subject: 'english', enrolled: 221, teacherId: 't-clara', status: 'published', avgProgress: 49 },
{ id: 'g5-computer', grade: 5, subject: 'computer', enrolled: 190, teacherId: 't-omar', status: 'published', avgProgress: 34 },
{ id: 'g4-math', grade: 4, subject: 'math', enrolled: 180, teacherId: 't-ahmed', status: 'published', avgProgress: 61 },
{ id: 'g4-science', grade: 4, subject: 'science', enrolled: 172, teacherId: 't-fatima', status: 'published', avgProgress: 44 },
{ id: 'g4-english', grade: 4, subject: 'english', enrolled: 176, teacherId: 't-clara', status: 'published', avgProgress: 52 },
{ id: 'g4-computer', grade: 4, subject: 'computer', enrolled: 160, teacherId: 't-omar', status: 'draft', avgProgress: 12 },
{ id: 'g3-math', grade: 3, subject: 'math', enrolled: 170, teacherId: 't-hana', status: 'published', avgProgress: 66 },
{ id: 'g3-science', grade: 3, subject: 'science', enrolled: 158, teacherId: 't-fatima', status: 'published', avgProgress: 31 },
{ id: 'g3-english', grade: 3, subject: 'english', enrolled: 165, teacherId: 't-clara', status: 'published', avgProgress: 55 },
{ id: 'g3-computer', grade: 3, subject: 'computer', enrolled: 149, teacherId: 't-omar', status: 'published', avgProgress: 40 },
{ id: 'g2-math', grade: 2, subject: 'math', enrolled: 150, teacherId: 't-hana', status: 'published', avgProgress: 57 },
{ id: 'g2-science', grade: 2, subject: 'science', enrolled: 141, teacherId: 't-fatima', status: 'published', avgProgress: 38 },
{ id: 'g2-english', grade: 2, subject: 'english', enrolled: 148, teacherId: 't-clara', status: 'published', avgProgress: 42 },
{ id: 'g2-computer', grade: 2, subject: 'computer', enrolled: 120, teacherId: null, status: 'draft', avgProgress: 0 },
{ id: 'g1-math', grade: 1, subject: 'math', enrolled: 120, teacherId: 't-hana', status: 'published', avgProgress: 50 },
{ id: 'g1-science', grade: 1, subject: 'science', enrolled: 112, teacherId: 't-fatima', status: 'published', avgProgress: 22 },
{ id: 'g1-english', grade: 1, subject: 'english', enrolled: 118, teacherId: 't-clara', status: 'published', avgProgress: 63 },
{ id: 'g1-computer', grade: 1, subject: 'computer', enrolled: 96, teacherId: 't-omar', status: 'published', avgProgress: 8 }];