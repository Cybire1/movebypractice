'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  MultipleChoiceExercise,
  MultipleChoiceAnswer,
  MultipleChoiceOption,
  ValidationResult,
  ExerciseFeedback
} from '../../types/exercises';

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceExercise;
  onComplete: (result: ValidationResult, feedback: ExerciseFeedback) => void;
  onHintRequest?: () => void;
}

export default function MultipleChoiceExerciseComponent({
  exercise,
  onComplete,
  onHintRequest
}: MultipleChoiceExerciseProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<MultipleChoiceOption[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    if (exercise.shuffleOptions) {
      const shuffled = [...exercise.options].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
    } else {
      setShuffledOptions(exercise.options);
    }
  }, [exercise]);

  const handleOptionToggle = (optionId: string) => {
    if (exercise.allowMultipleAnswers) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
    setShowExplanations(false);
  };

  const validateAnswers = (): ValidationResult => {
    const correctOptions = exercise.options.filter(opt => opt.isCorrect);
    const correctIds = new Set(correctOptions.map(opt => opt.id));
    const selectedIds = new Set(selectedOptions);

    const isCorrect =
      correctIds.size === selectedIds.size &&
      [...correctIds].every(id => selectedIds.has(id));

    const correctlySelected = selectedOptions.filter(id => correctIds.has(id)).length;
    const incorrectlySelected = selectedOptions.filter(id => !correctIds.has(id)).length;
    const missedCorrect = correctOptions.length - correctlySelected;

    const score = correctOptions.length > 0
      ? Math.max(0, Math.round(((correctlySelected - incorrectlySelected) / correctOptions.length) * 100))
      : 0;

    const errors = isCorrect ? [] : [{
      message: `Selected ${selectedOptions.length} option(s). ${correctlySelected} correct, ${incorrectlySelected} incorrect, ${missedCorrect} missed.`,
      severity: 'error' as const
    }];

    return {
      isCorrect,
      score: isCorrect ? 100 : score,
      feedback: isCorrect
        ? correctOptions.length > 1
          ? `Perfect! All ${correctOptions.length} correct answers selected!`
          : 'Correct!'
        : `Not quite right. ${correctlySelected}/${correctOptions.length} correct answers selected.`,
      errors: errors.length > 0 ? errors : undefined
    };
  };

  const generateFeedback = (validation: ValidationResult): ExerciseFeedback => {
    const earnedXP = Math.round((validation.score / 100) * exercise.baseXP);

    if (validation.isCorrect) {
      return {
        type: 'success',
        message: 'Excellent work! You got it right.',
        details: exercise.explanation,
        earnedXP: hintsUsed === 0 ? earnedXP + (exercise.perfectScoreXP || 0) : earnedXP
      };
    } else if (validation.score >= 50) {
      return {
        type: 'partial',
        message: 'Partially correct. Review the explanations.',
        details: 'Some answers are correct, but not all.',
        earnedXP,
        showHint: true
      };
    } else {
      return {
        type: 'incorrect',
        message: 'Incorrect. Try again or use a hint.',
        earnedXP: 0,
        showHint: true
      };
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) return;

    setIsSubmitting(true);
    setFeedback(null);

    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validateAnswers();
    const feedbackResult = generateFeedback(validation);

    setFeedback(feedbackResult);
    setIsSubmitting(false);

    if (exercise.showExplanationOnWrong || validation.isCorrect) {
      setShowExplanations(true);
    }

    if (validation.isCorrect) {
      setTimeout(() => {
        onComplete(validation, feedbackResult);
      }, 2000);
    }
  };

  const handleHint = () => {
    if (hintsUsed < exercise.hints.length) {
      setHintsUsed(hintsUsed + 1);
      onHintRequest?.();
    }
  };

  return (
    <div className="w-full p-6 md:p-12">
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 mb-6"
        >
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            exercise.difficulty === 'beginner'
              ? 'bg-green-500 text-white'
              : exercise.difficulty === 'intermediate'
                ? 'bg-amber-500 text-white'
                : 'bg-red-500 text-white'
          }`}>
            {exercise.difficulty}
          </span>
          <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-elevated text-foreground-tertiary border border-[var(--border-default)]">
            {exercise.topic.replace('_', ' ')}
          </span>
        </motion.div>

        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight mb-3">
            {exercise.title}
          </h2>
          <p className="text-lg text-foreground-secondary font-medium">
            {exercise.description}
          </p>
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-xs font-bold text-foreground-tertiary uppercase tracking-widest mb-3">Challenge</p>
          <p className="text-2xl md:text-3xl font-bold leading-snug text-foreground">
            {exercise.question}
          </p>
        </motion.div>

        {/* Code Snippet */}
        {exercise.codeSnippet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[2rem] overflow-hidden border-2 border-[var(--border-default)] mb-10"
          >
            <div className="flex items-center justify-between px-5 py-3 bg-surface-elevated border-b border-[var(--border-default)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-xs font-mono text-foreground-tertiary">task_reference.move</span>
            </div>
            <div className="bg-[#0D1117]">
              <Editor
                height="200px"
                defaultLanguage="rust"
                value={exercise.codeSnippet}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 16, bottom: 16 }
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Options Label + Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-5"
        >
          <p className="text-xs font-bold text-foreground-tertiary uppercase tracking-widest">
            {exercise.allowMultipleAnswers ? 'Select all that apply' : 'Choose the best answer'}
          </p>
          {exercise.hints.length > 0 && (
            <button
              onClick={handleHint}
              disabled={hintsUsed >= exercise.hints.length}
              className="text-xs font-bold text-[#4A90D9] hover:text-[#6BB5FF] uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {hintsUsed < exercise.hints.length ? `Need a Hint? (${hintsUsed}/${exercise.hints.length})` : 'All Hints Used'}
            </button>
          )}
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {shuffledOptions.map((option, i) => {
            const isSelected = selectedOptions.includes(option.id);
            const showCorrect = showExplanations && option.isCorrect;
            const showIncorrect = showExplanations && isSelected && !option.isCorrect;

            let cardStyle = 'bg-surface-elevated border-[var(--border-default)] hover:border-foreground-tertiary hover:shadow-lg';
            let textStyle = 'text-foreground-secondary';

            if (showCorrect) {
              cardStyle = 'bg-green-500 border-green-500 shadow-green-500/20 shadow-xl';
              textStyle = 'text-white font-bold';
            } else if (showIncorrect) {
              cardStyle = 'bg-red-500 border-red-500 shadow-red-500/20 shadow-xl';
              textStyle = 'text-white font-bold';
            } else if (showExplanations) {
              cardStyle = 'bg-surface-elevated opacity-50';
              textStyle = 'text-foreground-secondary';
            } else if (isSelected) {
              cardStyle = 'bg-zinc-900 border-zinc-900 shadow-xl ring-2 ring-zinc-900 ring-offset-2';
              textStyle = 'text-white font-bold';
            }

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + i * 0.04 }}
                whileHover={!showExplanations ? { scale: 1.02 } : {}}
                whileTap={!showExplanations ? { scale: 0.98 } : {}}
                onClick={() => handleOptionToggle(option.id)}
                disabled={showExplanations}
                className={`w-full p-6 md:p-8 rounded-[2rem] border-2 text-left transition-all duration-300 relative group overflow-hidden ${cardStyle}`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className={`text-lg md:text-xl ${textStyle}`}>{option.text}</span>

                  {showCorrect && (
                    <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {showIncorrect && (
                    <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}

                  {!showExplanations && !isSelected && (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--border-default)] flex items-center justify-center group-hover:border-foreground-tertiary transition-colors flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-foreground-tertiary group-hover:bg-foreground-secondary" />
                    </div>
                  )}
                  {!showExplanations && isSelected && (
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-zinc-900" />
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showExplanations && option.explanation && (option.isCorrect || isSelected) && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      className="text-sm text-white/80 relative z-10"
                    >
                      {option.explanation}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Hints */}
        <AnimatePresence>
          {hintsUsed > 0 && (
            <div className="space-y-4 mb-8">
              {exercise.hints.slice(0, hintsUsed).map((hint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-elevated border-2 border-amber-500/30 rounded-[2rem] p-6 md:p-8 flex gap-4"
                >
                  <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Hint {index + 1}</p>
                    <p className="text-foreground-secondary text-base font-medium">{hint}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Bottom Action Area */}
        <div className="mt-4 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {feedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 mr-8"
              >
                <p className={`font-bold text-lg mb-1 ${
                  feedback.type === 'success' ? 'text-green-500' :
                  feedback.type === 'partial' ? 'text-amber-500' :
                  'text-red-500'
                }`}>
                  {feedback.message}
                </p>
                {feedback.earnedXP !== undefined && feedback.earnedXP > 0 && (
                  <p className="text-sm text-foreground-tertiary">+{feedback.earnedXP} XP earned</p>
                )}
                {feedback.details && (
                  <p className="text-foreground-secondary mt-2 font-medium">{feedback.details}</p>
                )}
              </motion.div>
            ) : (
              <div className="flex-1" />
            )}
          </AnimatePresence>

          {feedback && feedback.type !== 'success' ? (
            <button
              onClick={() => { setFeedback(null); setShowExplanations(false); }}
              className="px-10 py-5 rounded-full font-bold text-lg bg-zinc-900 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex-shrink-0"
            >
              Try Again
            </button>
          ) : !feedback ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedOptions.length === 0}
              className={`px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 flex-shrink-0 ${
                isSubmitting || selectedOptions.length === 0
                  ? 'bg-surface-secondary text-foreground-tertiary cursor-not-allowed'
                  : 'bg-zinc-900 text-white shadow-xl hover:scale-105 active:scale-95'
              }`}
            >
              {isSubmitting ? 'Verifying...' : 'Check Answer'}
            </button>
          ) : null}
        </div>
    </div>
  );
}
