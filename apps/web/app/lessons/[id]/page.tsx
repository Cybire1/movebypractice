import Link from 'next/link';
import LessonView from '@/app/components/lessons/LessonView';
import { moveLesson1 } from '@/app/lib/lessons/move-lesson1';
import { moveLesson2 } from '@/app/lib/lessons/move-lesson2';
import { moveLesson3 } from '@/app/lib/lessons/move-lesson3';
import { moveLesson4 } from '@/app/lib/lessons/move-lesson4';
import { moveLesson5 } from '@/app/lib/lessons/move-lesson5';
import { moveLesson6 } from '@/app/lib/lessons/move-lesson6';
import { moveLesson7 } from '@/app/lib/lessons/move-lesson7';
import { msgLesson1 } from '@/app/lib/lessons/msg-lesson1';
import { msgLesson2 } from '@/app/lib/lessons/msg-lesson2';
import { msgLesson3 } from '@/app/lib/lessons/msg-lesson3';
import { msgLesson4 } from '@/app/lib/lessons/msg-lesson4';
import { msgLesson5 } from '@/app/lib/lessons/msg-lesson5';
import { msgLesson6 } from '@/app/lib/lessons/msg-lesson6';
import { msgLesson7 } from '@/app/lib/lessons/msg-lesson7';
import { msgLesson8 } from '@/app/lib/lessons/msg-lesson8';
import { predictLesson1 } from '@/app/lib/lessons/predict-lesson1';
import { predictLesson2 } from '@/app/lib/lessons/predict-lesson2';
import { predictLesson3 } from '@/app/lib/lessons/predict-lesson3';
import { predictLesson4 } from '@/app/lib/lessons/predict-lesson4';
import { predictLesson5 } from '@/app/lib/lessons/predict-lesson5';
import { predictLesson6 } from '@/app/lib/lessons/predict-lesson6';
import { predictLesson7 } from '@/app/lib/lessons/predict-lesson7';
import { predictLesson8 } from '@/app/lib/lessons/predict-lesson8';
import { hashiLesson1 } from '@/app/lib/lessons/hashi-lesson1';
import { hashiLesson2 } from '@/app/lib/lessons/hashi-lesson2';
import { hashiLesson3 } from '@/app/lib/lessons/hashi-lesson3';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Lesson map - all lessons
  const lessonMap: Record<string, typeof msgLesson1> = {
    // Move Fundamentals lessons
    'move-1': moveLesson1,
    'move-2': moveLesson2,
    'move-3': moveLesson3,
    'move-4': moveLesson4,
    'move-5': moveLesson5,
    'move-6': moveLesson6,
    'move-7': moveLesson7,
    // Messaging SDK lessons
    'msg-1': msgLesson1,
    'msg-2': msgLesson2,
    'msg-3': msgLesson3,
    'msg-4': msgLesson4,
    'msg-5': msgLesson5,
    'msg-6': msgLesson6,
    'msg-7': msgLesson7,
    'msg-8': msgLesson8,
    // DeepBook Predict lessons
    'predict-1': predictLesson1,
    'predict-2': predictLesson2,
    'predict-3': predictLesson3,
    'predict-4': predictLesson4,
    'predict-5': predictLesson5,
    'predict-6': predictLesson6,
    'predict-7': predictLesson7,
    'predict-8': predictLesson8,
    // Hashi (native Bitcoin on Sui) lessons
    'hashi-1': hashiLesson1,
    'hashi-2': hashiLesson2,
    'hashi-3': hashiLesson3,
  };

  const lesson = lessonMap[id];

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Lesson Not Found</h1>
          <p className="text-foreground-tertiary mb-8">This lesson doesn&apos;t exist yet!</p>
          <Link
            href="/"
            className="px-6 py-3 bg-sui-accent text-sui-navy font-bold rounded-lg hover:bg-sui-accent/90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return <LessonView lesson={lesson} />;
}
