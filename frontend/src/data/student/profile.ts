import type { Subject } from '@/types/student';

export const profileStats = {
  xp: 2480,
  streak: 7,
  lessonsCompleted: 34,
  coursesCompleted: 3,
  joined: 'March 2026',
  dailyGoalMinutes: 15,
  minutesToday: 9
};

export const weeklyXp = [
{ day: 'Mon', xp: 120 },
{ day: 'Tue', xp: 180 },
{ day: 'Wed', xp: 90 },
{ day: 'Thu', xp: 240 },
{ day: 'Fri', xp: 160 },
{ day: 'Sat', xp: 60 },
{ day: 'Sun', xp: 210 }];


export type BadgeIcon = 'sigma' | 'leaf' | 'flame' | 'book' | 'code';

export const badges: {id: string;name: string;description: string;icon: BadgeIcon;tone: Subject | 'streak';earned: boolean;progress?: number;}[] = [
{ id: 'b-math', name: 'Mathematics Explorer', description: 'Finished 5 math lessons', icon: 'sigma', tone: 'math', earned: true },
{ id: 'b-science', name: 'Science Starter', description: 'Completed your first science lesson', icon: 'leaf', tone: 'science', earned: true },
{ id: 'b-streak', name: '7 Day Learning Streak', description: 'Learned something 7 days in a row', icon: 'flame', tone: 'streak', earned: true },
{ id: 'b-reading', name: 'Reading Ranger', description: 'Finish 5 reading lessons', icon: 'book', tone: 'english', earned: false, progress: 40 },
{ id: 'b-code', name: 'Code Cadet', description: 'Finish Digital Basics', icon: 'code', tone: 'computer', earned: false, progress: 25 }];


export const recentActivity: {id: string;subject: Subject;text: string;time: string;xp: number;}[] = [
{ id: 'a1', subject: 'math', text: 'Completed Lesson 3 · Comparing Fractions', time: 'Today, 9:12 AM', xp: 40 },
{ id: 'a2', subject: 'science', text: 'Aced the Living Things lesson with 2/2', time: 'Yesterday', xp: 60 },
{ id: 'a3', subject: 'english', text: 'Started Finding the Main Idea', time: 'Yesterday', xp: 30 },
{ id: 'a4', subject: 'math', text: 'Joined live class · Fraction Walls', time: 'Sep 26', xp: 25 },
{ id: 'a5', subject: 'computer', text: 'Completed What is a Computer?', time: 'Sep 25', xp: 10 }];