'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonContent, WeaknessTopic } from '@/app/types/lesson';
import { useGameStore } from '@/app/lib/store/gameStore';
import TeachingSlide from './TeachingSlide';
import QuizComponent from './QuizComponent';
import TypeScriptEditor from '../editor/TypeScriptEditor';
import XPProgress from '../gamification/XPProgress';
import Confetti from '../gamification/Confetti';
import PhaseProgress from './PhaseProgress';
import { validateTypeScript } from '@/app/lib/compiler/tsPatternValidator';
import ExerciseRenderer from '../exercises/ExerciseRenderer';
import { getExerciseById } from '@/app/data/exercises';
import { ValidationResult, ExerciseFeedback } from '@/app/types/exercises';
import { TiltCard } from '../ui/TiltCard';
import { SpotlightCard } from '../ui/SpotlightCard';
import LessonTimeline from './LessonTimeline';
// AITutorChat removed - using SlideAIAssistant instead

interface LessonViewProps {
  lesson: LessonContent;
}

type Phase = 'intro' | 'teaching' | 'exercise' | 'quiz' | 'practice';

export default function LessonView({ lesson }: LessonViewProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [code, setCode] = useState(lesson.starterCode);
  const [output, setOutput] = useState<string>('');
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [weaknesses, setWeaknesses] = useState<WeaknessTopic[]>([]);
  const [practiceHints, setPracticeHints] = useState<string[]>([]);

  const { completeLesson } = useGameStore();

  // Check if lesson uses new section-based structure
  const usingSections = !!lesson.teachingSections;
  const sections = lesson.teachingSections || [];
  const totalSections = sections.length;

  // Phase transitions
  const handleTeachingComplete = () => {
    if (usingSections) {
      const currentSection = sections[currentSectionIndex];

      // Check if this section has an exercise
      if (currentSection.exerciseId) {
        setPhase('exercise');
      } else {
        // No exercise, move to next section or quiz
        if (currentSectionIndex < totalSections - 1) {
          setCurrentSectionIndex(currentSectionIndex + 1);
          setPhase('teaching');
        } else {
          setPhase('quiz');
        }
      }
    } else {
      // Legacy: all teaching done, go to quiz
      setPhase('quiz');
    }
  };

  const handleExerciseComplete = (result: ValidationResult, feedback: ExerciseFeedback) => {
    // Exercise completed, move to next section or quiz
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setPhase('teaching');
    } else {
      setPhase('quiz');
    }
  };

  const handleQuizComplete = (quizWeaknesses: WeaknessTopic[], quizHints: string[]) => {
    setWeaknesses(quizWeaknesses);
    setPracticeHints(quizHints);
    setPhase('practice');
  };

  // Practice phase handlers
  const handleRunCode = async (code: string) => {
    setOutput('🔍 Validating TypeScript code...\n');
    try {
      const result = await validateTypeScript(code, lesson.solution);
      setOutput(result.output);

      if (result.success) {
        await completeLesson(lesson.id, lesson.xpReward);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      setOutput(
        '❌ Validation error:\n\n' +
        (error instanceof Error ? error.message : 'Unknown error') +
        '\n\nCheck the hints if you need help!'
      );
    }
  };

  const showNextHint = () => {
    if (currentHintIndex < lesson.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  // Render appropriate phase

  // ... (keep existing imports)

  // ... inside LessonView function ...

  if (phase === 'intro') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-surface-secondary text-foreground"
        >
          {/* Noise Texture */}
          <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

          {/* Hero Section */}
          <div className="relative z-10 pt-32 pb-20 px-6">
            {/* Back Nav */}
            <div className="max-w-4xl mx-auto mb-16">
              <Link
                href="/lessons"
                className="inline-flex items-center gap-2 text-foreground-tertiary hover:text-foreground transition-colors text-sm font-medium tracking-wide uppercase"
              >
                ← Curriculum
              </Link>
            </div>

            <div className="max-w-4xl mx-auto text-center">
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 mb-8 bg-surface-elevated px-4 py-2 rounded-full border border-[var(--border-default)] shadow-sm"
              >
                <div className={`w-2 h-2 rounded-full
                    ${lesson.difficulty === 'beginner' ? 'bg-green-500' : 'bg-blue-500'}
                `} />
                <span className="text-xs font-bold uppercase tracking-widest text-foreground-secondary">
                  {lesson.difficulty}
                </span>
                <div className="w-px h-3 bg-[var(--border-default)] mx-2" />
                <span className="text-xs font-bold text-foreground-tertiary">
                  +{lesson.xpReward} XP
                </span>
              </motion.div>

              {/* Swiss Typography Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter-swiss text-foreground mb-8 leading-[0.9]"
              >
                {lesson.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl md:text-2xl text-foreground-secondary max-w-2xl mx-auto font-medium leading-relaxed"
              >
                {lesson.description}
              </motion.p>

              {/* Start Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12"
              >
                <button
                  onClick={() => setPhase('teaching')}
                  className="group relative inline-flex items-center gap-4 px-10 py-5 bg-zinc-900 text-white rounded-full font-bold text-lg shadow-xl hover:bg-zinc-800 hover:scale-105 transition-all duration-300"
                >
                  <span>Start Lesson</span>
                  <span className="bg-white/20 rounded-full p-1 group-hover:bg-white group-hover:text-black transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="relative z-10 px-6 pb-40">
            <div className="max-w-3xl mx-auto mb-12 border-t border-[var(--border-default)] pt-16">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground-tertiary mb-8">Lesson Syllabus</h3>
            </div>

            {lesson.teachingSections ? (
              <LessonTimeline sections={lesson.teachingSections} />
            ) : (
              <div className="max-w-3xl mx-auto text-center p-12 bg-surface-secondary rounded-2xl border border-dashed border-[var(--border-default)]">
                <span className="text-foreground-tertiary">Legacy Lesson Format (Timeline unavailable)</span>
              </div>
            )}
          </div>

        </motion.div >
      </AnimatePresence >
    );
  }

  if (phase === 'teaching') {
    // Get slides for current section (or all slides for legacy lessons)
    const slidesToShow = usingSections
      ? sections[currentSectionIndex].slides
      : (lesson.teachingSlides || []);

    const sectionTitle = usingSections
      ? sections[currentSectionIndex].sectionTitle
      : undefined;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`teaching-${currentSectionIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <TeachingSlide
            slides={slidesToShow}
            onComplete={handleTeachingComplete}
            lessonTitle={lesson.title}
            transitionMessage={
              usingSections && sections[currentSectionIndex].exerciseId
                ? "Great! Now let's practice what you just learned..."
                : lesson.narrative.quizTransition
            }
          />

        </motion.div>
      </AnimatePresence>
    );
  }

  if (phase === 'exercise') {
    const currentSection = sections[currentSectionIndex];
    const exercise = currentSection.exerciseId
      ? getExerciseById(currentSection.exerciseId)
      : null;

    if (!exercise) {
      // No exercise found, skip to next section
      handleExerciseComplete({} as ValidationResult, {} as ExerciseFeedback);
      return null;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`exercise-${currentSectionIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-surface-secondary pt-24 sm:pt-32 pb-20 px-6 sm:px-12 lg:px-20"
        >
          <div className="max-w-6xl mx-auto">


            {/* Exercise Component */}
            <ExerciseRenderer
              exercise={exercise}
              onComplete={handleExerciseComplete}
            />

          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (phase === 'quiz') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="quiz"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >

          <QuizComponent
            questions={lesson.quiz}
            passThreshold={lesson.quizPassThreshold}
            onComplete={handleQuizComplete}
            transitionMessage={lesson.narrative.practiceTransition}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Practice phase
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="practice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-screen bg-surface-secondary"
      >
        <Confetti show={showConfetti} />


        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Instructions & Hints */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-surface border-r border-[var(--border-default)]">
            <div className="mb-8">
              <XPProgress />
            </div>

            <div className="max-w-2xl">
              {/* Practice Transition Message */}
              <div className="mb-6 p-5 bg-[#4A90D9]/10 border-2 border-[#4A90D9]/20 rounded-2xl">
                <h2 className="text-xl font-bold text-[#4A90D9] flex items-center gap-2">
                  {lesson.narrative.practiceTransition}
                </h2>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-3">{lesson.title}</h1>
              <p className="text-lg text-foreground-secondary mb-6">{lesson.description}</p>

              {/* Personalized Hints from Quiz */}
              {practiceHints.length > 0 && (
                <div className="mb-6 p-5 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl">
                  <h3 className="font-bold text-amber-500 mb-3 flex items-center gap-2">
                    Based on your quiz:
                  </h3>
                  <ul className="space-y-2">
                    {practiceHints.map((hint, index) => (
                      <li key={index} className="text-foreground-secondary">
                        • {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regular Hints */}
              <div className="mb-8">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-secondary text-foreground hover:bg-[var(--border-default)] transition-colors rounded-xl font-medium"
                >
                  💡 {showHints ? 'Hide' : 'Show'} Hints
                </button>

                <AnimatePresence>
                  {showHints && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {lesson.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-[#4A90D9]/5 border border-[#4A90D9]/20 rounded-xl text-foreground"
                        >
                          <span className="font-medium">Hint {index + 1}:</span> {hint}
                        </motion.div>
                      ))}

                      {currentHintIndex < lesson.hints.length - 1 && (
                        <button
                          onClick={showNextHint}
                          className="text-sm text-[#4A90D9] hover:text-[#6BB5FF] font-medium"
                        >
                          Show next hint →
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col bg-surface-secondary overflow-hidden">
            <div className="flex-1 min-h-0 mb-4">
              <TypeScriptEditor
                defaultValue={lesson.starterCode}
                onChange={setCode}
                onRun={handleRunCode}
                height="100%"
              />
            </div>

            {/* Output Console */}
            <div className="h-48 shrink-0 bg-surface border-2 border-[var(--border-default)] rounded-2xl p-4 overflow-y-auto">
              <div className="text-xs text-foreground-tertiary font-semibold mb-3 uppercase tracking-wider">
                Compilation Output:
              </div>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {output || 'Click "Validate & Run" to compile and test your solution...'}
              </pre>
            </div>
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
