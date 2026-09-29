import { DayAverage, Student, WeekDay } from '../types/student';

export const student: Student = {
  name: 'Alex',
  grade: 3,
  streakDays: 5,
  skillsPracticed: 18,
  currentCourseId: 'fractions-3'
};

export const thisWeek: WeekDay[] = [
{ short: 'Mon', done: true, isToday: false },
{ short: 'Tue', done: false, isToday: false },
{ short: 'Wed', done: true, isToday: false },
{ short: 'Thu', done: true, isToday: false },
{ short: 'Fri', done: true, isToday: false },
{ short: 'Sat', done: true, isToday: false },
{ short: 'Sun', done: true, isToday: true }];


export const dayAverages: DayAverage[] = [
{ day: 'Monday', short: 'Mon', lessons: 2 },
{ day: 'Tuesday', short: 'Tue', lessons: 3 },
{ day: 'Wednesday', short: 'Wed', lessons: 4 },
{ day: 'Thursday', short: 'Thu', lessons: 2 },
{ day: 'Friday', short: 'Fri', lessons: 3 },
{ day: 'Saturday', short: 'Sat', lessons: 1 },
{ day: 'Sunday', short: 'Sun', lessons: 2 }];