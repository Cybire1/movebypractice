export { moveLesson1 } from './move-lesson1';
export { moveLesson2 } from './move-lesson2';
export { moveLesson3 } from './move-lesson3';
export { moveLesson4 } from './move-lesson4';
export { moveLesson5 } from './move-lesson5';
export { moveLesson6 } from './move-lesson6';
export { moveLesson7 } from './move-lesson7';
export { msgLesson1 } from './msg-lesson1';
export { msgLesson2 } from './msg-lesson2';
export { msgLesson3 } from './msg-lesson3';
export { msgLesson4 } from './msg-lesson4';
export { msgLesson5 } from './msg-lesson5';
export { msgLesson6 } from './msg-lesson6';
export { msgLesson7 } from './msg-lesson7';
export { msgLesson8 } from './msg-lesson8';
export { predictLesson1 } from './predict-lesson1';
export { predictLesson2 } from './predict-lesson2';
export { predictLesson3 } from './predict-lesson3';
export { predictLesson4 } from './predict-lesson4';
export { predictLesson5 } from './predict-lesson5';
export { predictLesson6 } from './predict-lesson6';
export { predictLesson7 } from './predict-lesson7';
export { predictLesson8 } from './predict-lesson8';
export { ogLesson1 } from './0g-lesson1';
export { ogLesson2 } from './0g-lesson2';
export { ogLesson3 } from './0g-lesson3';
export { ogLesson4 } from './0g-lesson4';
export { ogLesson5 } from './0g-lesson5';
export { ogLesson6 } from './0g-lesson6';
export { ogLesson7 } from './0g-lesson7';
export { ogLesson8 } from './0g-lesson8';
export { ogLesson9 } from './0g-lesson9';
export { ogLesson10 } from './0g-lesson10';

import { LessonContent } from '../types/lesson';
import { moveLesson1 } from './move-lesson1';
import { moveLesson2 } from './move-lesson2';
import { moveLesson3 } from './move-lesson3';
import { moveLesson4 } from './move-lesson4';
import { moveLesson5 } from './move-lesson5';
import { moveLesson6 } from './move-lesson6';
import { moveLesson7 } from './move-lesson7';
import { msgLesson1 } from './msg-lesson1';
import { msgLesson2 } from './msg-lesson2';
import { msgLesson3 } from './msg-lesson3';
import { msgLesson4 } from './msg-lesson4';
import { msgLesson5 } from './msg-lesson5';
import { msgLesson6 } from './msg-lesson6';
import { msgLesson7 } from './msg-lesson7';
import { msgLesson8 } from './msg-lesson8';
import { predictLesson1 } from './predict-lesson1';
import { predictLesson2 } from './predict-lesson2';
import { predictLesson3 } from './predict-lesson3';
import { predictLesson4 } from './predict-lesson4';
import { predictLesson5 } from './predict-lesson5';
import { predictLesson6 } from './predict-lesson6';
import { predictLesson7 } from './predict-lesson7';
import { predictLesson8 } from './predict-lesson8';
import { ogLesson1 } from './0g-lesson1';
import { ogLesson2 } from './0g-lesson2';
import { ogLesson3 } from './0g-lesson3';
import { ogLesson4 } from './0g-lesson4';
import { ogLesson5 } from './0g-lesson5';
import { ogLesson6 } from './0g-lesson6';
import { ogLesson7 } from './0g-lesson7';
import { ogLesson8 } from './0g-lesson8';
import { ogLesson9 } from './0g-lesson9';
import { ogLesson10 } from './0g-lesson10';

export const allLessons: LessonContent[] = [
  moveLesson1, moveLesson2, moveLesson3, moveLesson4, moveLesson5, moveLesson6, moveLesson7,
  msgLesson1, msgLesson2, msgLesson3, msgLesson4, msgLesson5, msgLesson6, msgLesson7, msgLesson8,
  predictLesson1, predictLesson2, predictLesson3, predictLesson4, predictLesson5, predictLesson6, predictLesson7, predictLesson8,
  ogLesson1, ogLesson2, ogLesson3, ogLesson4, ogLesson5, ogLesson6, ogLesson7, ogLesson8, ogLesson9, ogLesson10,
];

export function getLessonById(id: string): LessonContent | undefined {
  return allLessons.find(lesson => lesson.id === id);
}

export function getLessonsByModule(module: 'move' | 'msg' | 'predict' | '0g'): LessonContent[] {
  return allLessons.filter(lesson => lesson.id.startsWith(module));
}

/** Lessons whose completion requires a verifiable artefact, not just a passing quiz. */
export function getLessonsRequiringProof(): LessonContent[] {
  return allLessons.filter(lesson => Boolean(lesson.proof));
}
