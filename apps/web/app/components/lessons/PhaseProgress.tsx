'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

type Phase = 'intro' | 'teaching' | 'quiz' | 'practice';

interface PhaseProgressProps {
  currentPhase: Phase;
  lessonTitle: string;
  lessonId: string;
}

const phases = [
  {
    id: 'intro',
    label: 'Introduction',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: 'teaching',
    label: 'Teaching',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75m-6-6.75h3" />
      </svg>
    ),
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
  },
];

export default function PhaseProgress({ currentPhase, lessonTitle, lessonId }: PhaseProgressProps) {
  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);

  return (
    <div className="bg-surface border-b border-[var(--border-default)]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-sui-gray-600 mb-4">
          <Link href="/lessons" className="hover:text-sui-ocean transition-colors">
            Lessons
          </Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <Link href={`/lessons/${lessonId}`} className="hover:text-sui-ocean transition-colors">
            {lessonTitle}
          </Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sui-navy font-medium capitalize">
            {phases[currentPhaseIndex]?.label || currentPhase}
          </span>
        </div>

        {/* Phase Indicators */}
        <div className="flex items-center justify-between gap-2">
          {phases.map((phase, index) => {
            const isActive = phase.id === currentPhase;
            const isCompleted = index < currentPhaseIndex;
            const isUpcoming = index > currentPhaseIndex;

            return (
              <div key={phase.id} className="flex items-center flex-1">
                {/* Phase Step */}
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isCompleted
                        ? 'rgb(0, 131, 143)'
                        : isActive
                        ? 'rgb(0, 131, 143)'
                        : 'rgb(229, 231, 235)',
                    }}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive ? 'ring-4 ring-sui-ocean/20' : ''
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={`${isActive || isCompleted ? 'text-white' : 'text-sui-gray-500'}`}>
                        {phase.icon}
                      </div>
                    )}
                  </motion.div>

                  {/* Phase Label */}
                  <div className="hidden md:block">
                    <div
                      className={`text-sm font-semibold ${
                        isActive ? 'text-sui-ocean' : isCompleted ? 'text-sui-gray-700' : 'text-sui-gray-400'
                      }`}
                    >
                      {phase.label}
                    </div>
                    <div className="text-xs text-sui-gray-500">
                      {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Upcoming'}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < phases.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-sui-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{
                        width: isCompleted ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="h-full bg-sui-ocean"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
