'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGameStore } from '@/app/lib/store/gameStore';
import { ogLesson1 } from '@/app/lib/lessons/0g-lesson1';
import { ogLesson2 } from '@/app/lib/lessons/0g-lesson2';
import { ogLesson3 } from '@/app/lib/lessons/0g-lesson3';
import { ogLesson4 } from '@/app/lib/lessons/0g-lesson4';
import { ogLesson5 } from '@/app/lib/lessons/0g-lesson5';
import { ogLesson6 } from '@/app/lib/lessons/0g-lesson6';
import { ogLesson7 } from '@/app/lib/lessons/0g-lesson7';
import { ogLesson8 } from '@/app/lib/lessons/0g-lesson8';
import { ogLesson9 } from '@/app/lib/lessons/0g-lesson9';
import { ogLesson10 } from '@/app/lib/lessons/0g-lesson10';

const LESSONS = [
  ogLesson1, ogLesson2, ogLesson3, ogLesson4, ogLesson5,
  ogLesson6, ogLesson7, ogLesson8, ogLesson9, ogLesson10,
];

/* Which layer each lesson lands in. Taken from the dominant weaknessTopic of the
   lesson's own quiz, so the label can never drift from the content. */
const LAYER_LABEL: Record<string, string> = {
  '0g-chain': 'Chain',
  '0g-compute': 'Compute',
  '0g-router': 'Router',
  '0g-storage': 'Storage',
  '0g-da': 'Data availability',
  '0g-identity': 'Identity',
  '0g-verification': 'Verification',
  '0g-economics': 'Economics',
};

function dominantLayer(lesson: (typeof LESSONS)[number]): string {
  const counts = new Map<string, number>();
  for (const q of lesson.quiz) {
    if (!q.weaknessTopic) continue;
    counts.set(q.weaknessTopic, (counts.get(q.weaknessTopic) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? (LAYER_LABEL[top[0]] ?? top[0]) : '0G';
}

export default function ZeroGCoursePage() {
  const { completedLessons } = useGameStore();
  const done = LESSONS.filter((l) => completedLessons.includes(l.id)).length;
  const totalXp = LESSONS.reduce((sum, l) => sum + l.xpReward, 0);

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs font-bold tracking-[0.18em] text-foreground-tertiary uppercase">
            Course
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            The 0G Stack
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground-secondary">
            Ten lessons from a wallet with nothing in it to a verified inference
            response, a storage root you can recompute yourself, and a contract
            live on chain. Built from 0G&rsquo;s own repos and docs, not from blog
            posts.
          </p>
        </motion.div>

        {/* The rule that separates this from every other 0G tutorial. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5 sm:p-6"
        >
          <div className="text-xs font-bold tracking-[0.14em] text-emerald-500 uppercase">
            How this course works
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground-secondary">
            Every lesson ends in a <strong className="text-foreground">proof artefact</strong>: a
            transaction hash, a storage root hash, a deployed contract address. A lesson is not
            finished because you read it. It is finished when the artefact exists and a stranger
            could verify it without taking your word for anything.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <span className="text-foreground-secondary">
            <strong className="text-foreground">{LESSONS.length}</strong> lessons
          </span>
          <span className="text-foreground-secondary">
            <strong className="text-foreground">{done}</strong> completed
          </span>
          <span className="text-foreground-secondary">
            <strong className="text-foreground">{totalXp.toLocaleString()}</strong> XP available
          </span>
          <span className="text-foreground-secondary">Beginner. No 0G experience assumed.</span>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {LESSONS.map((lesson, i) => {
            const isDone = completedLessons.includes(lesson.id);
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Link
                  href={`/lessons/${lesson.id}`}
                  className={`group flex h-full flex-col rounded-2xl border p-5 transition-all hover:-translate-y-0.5 sm:p-6 ${
                    isDone
                      ? 'border-emerald-500/30 bg-emerald-500/[0.05]'
                      : 'border-surface-tertiary bg-surface-secondary hover:border-foreground-tertiary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-foreground-tertiary tabular-nums">
                      {String(lesson.order).padStart(2, '0')}
                    </span>
                    <span className="rounded-full bg-surface-tertiary px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-foreground-secondary uppercase">
                      {dominantLayer(lesson)}
                    </span>
                    {isDone && (
                      <span className="ml-auto text-xs font-bold text-emerald-500">Done</span>
                    )}
                  </div>

                  <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground">
                    {lesson.title}
                  </h2>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-foreground-secondary">
                    {lesson.description}
                  </p>

                  {lesson.proof && (
                    <div className="mt-auto pt-4">
                      <div className="text-[11px] font-bold tracking-[0.12em] text-foreground-tertiary uppercase">
                        Proof required
                      </div>
                      <div className="mt-1 text-[13.5px] text-foreground-secondary">
                        {lesson.proof.label}
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-surface-tertiary bg-surface-secondary p-6">
          <h3 className="text-lg font-bold text-foreground">After these ten</h3>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-foreground-secondary">
            Intermediate covers fine-tuning, ERC-8004, precompiles and running a storage node.
            Advanced reaches data availability end to end, alt-DA rollups, the real ERC-7857
            transfer machinery, and the provider side of the marketplace. Both are written and
            waiting.
          </p>
        </div>
      </div>
    </div>
  );
}
