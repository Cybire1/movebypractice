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

  // Initialize and optionally shuffle options
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
      // Toggle for multiple selection
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Single selection only
      setSelectedOptions([optionId]);
    }
    // Hide explanations when user changes selection
    setShowExplanations(false);
  };

  const validateAnswers = (): ValidationResult => {
    const correctOptions = exercise.options.filter(opt => opt.isCorrect);
    const correctIds = new Set(correctOptions.map(opt => opt.id));
    const selectedIds = new Set(selectedOptions);

    // Check if selection matches correct answers exactly
    const isCorrect =
      correctIds.size === selectedIds.size &&
      [...correctIds].every(id => selectedIds.has(id));

    // Calculate partial score
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

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validateAnswers();
    const feedbackResult = generateFeedback(validation);

    setFeedback(feedbackResult);
    setIsSubmitting(false);

    // Show explanations after submission if enabled
    if (exercise.showExplanationOnWrong || validation.isCorrect) {
      setShowExplanations(true);
    }

    // If correct, complete the exercise
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
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto pb-32">
      {/* Header Card */}
      <div className="bg-surface-elevated rounded-[1.5rem] md:rounded-[2rem] border border-[var(--border-default)] p-5 md:p-8 shadow-xl shadow-zinc-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700 border-green-200' :
                  exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                  {exercise.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-surface-secondary text-foreground-secondary border border-[var(--border-default)]">
                  {exercise.topic.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-foreground mb-2 md:mb-3 tracking-tight">
                {exercise.title}
              </h3>
              <p className="text-lg text-foreground-secondary font-medium leading-relaxed max-w-2xl">
                {exercise.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Question & Code Column */}
        <div className="space-y-8">
          <div className="bg-surface-elevated rounded-[2rem] border border-[var(--border-default)] p-8 shadow-sm">
            <h4 className="text-sm font-bold text-foreground-tertiary uppercase tracking-widest mb-6">Challenge</h4>
            <p className="text-2xl font-bold text-foreground leading-snug">
              {exercise.question}
            </p>
          </div>

          {/* Code Snippet (Mac Style) */}
          {exercise.codeSnippet && (
            <div className="bg-[#1E1E2E] rounded-xl overflow-hidden shadow-2xl ring-4 ring-zinc-900/5">
              <div className="flex items-center px-4 py-3 bg-[#181825] border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <span className="ml-4 text-xs font-mono text-foreground-secondary">task_reference.move</span>
              </div>
              <div className="p-4">
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
            </div>
          )}
        </div>

        {/* Options Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground-tertiary uppercase tracking-widest">
              {exercise.allowMultipleAnswers ? 'Select all that apply' : 'Choose the best answer'}
            </h4>
            {/* Hints Button */}
            {exercise.hints.length > 0 && (
              <button
                onClick={handleHint}
                disabled={hintsUsed >= exercise.hints.length}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hintsUsed < exercise.hints.length ? `Need a Hint? (${hintsUsed}/${exercise.hints.length})` : 'All Hints Used'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {shuffledOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              const showCorrect = showExplanations && option.isCorrect;
              const showIncorrect = showExplanations && isSelected && !option.isCorrect;

              return (
                <motion.button
                  key={option.id}
                  whileHover={!showExplanations ? { scale: 1.01, y: -2 } : {}}
                  whileTap={!showExplanations ? { scale: 0.99 } : {}}
                  onClick={() => handleOptionToggle(option.id)}
                  disabled={showExplanations}
                  className={`w-full text-left p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all relative overflow-hidden group ${showCorrect
                    ? 'bg-green-50 border-green-500 shadow-green-100 shadow-lg'
                    : showIncorrect
                      ? 'bg-red-50 border-red-500 shadow-red-100 shadow-lg message-shake'
                      : isSelected
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl'
                        : 'bg-surface-elevated border-[var(--border-default)] hover:border-zinc-300 hover:shadow-lg'
                    }`}
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-${exercise.allowMultipleAnswers ? 'md' : 'full'} border-2 flex items-center justify-center transition-colors ${showCorrect ? 'border-green-600 bg-green-600 text-white' :
                      showIncorrect ? 'border-red-600 bg-red-600 text-white' :
                        isSelected ? 'border-white bg-white text-zinc-900' :
                          'border-[var(--border-default)] group-hover:border-foreground-tertiary'
                      }`}>
                      {(isSelected || showCorrect || showIncorrect) && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          {showIncorrect
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          }
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-base md:text-lg font-medium ${isSelected && !showExplanations ? 'text-white' :
                        showCorrect ? 'text-green-900' :
                          showIncorrect ? 'text-red-900' :
                            'text-foreground'
                        }`}>
                        {option.text}
                      </span>

                      {/* Hint/Explanation Expansion */}
                      <AnimatePresence>
                        {showExplanations && option.explanation && (option.isCorrect || isSelected) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            className={`text-sm ${option.isCorrect ? 'text-green-700' : 'text-red-700'
                              }`}
                          >
                            <span className="font-bold mr-1">{option.isCorrect ? 'Correct:' : 'Incorrect:'}</span>
                            {option.explanation}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hints Display */}
      <AnimatePresence>
        {hintsUsed > 0 && (
          <div className="space-y-4">
            {exercise.hints.slice(0, hintsUsed).map((hint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex gap-4"
              >
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-1">Hint {index + 1}</h4>
                  <p className="text-yellow-900 font-medium">{hint}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Feedback & Action Area */}
      <div className="sticky bottom-4 md:bottom-6 z-20">
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className={`rounded-3xl p-6 shadow-2xl border-2 flex items-center justify-between gap-6 backdrop-blur-md ${feedback.type === 'success' ? 'bg-green-50/90 border-green-500' :
                feedback.type === 'partial' ? 'bg-yellow-50/90 border-yellow-500' :
                  'bg-red-50/90 border-red-500'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${feedback.type === 'success' ? 'bg-green-200 text-green-700' :
                  feedback.type === 'partial' ? 'bg-yellow-200 text-yellow-700' :
                    'bg-red-200 text-red-700'
                  }`}>
                  {feedback.type === 'success' ? '🎉' : feedback.type === 'partial' ? '⚠️' : '❌'}
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${feedback.type === 'success' ? 'text-green-900' :
                    feedback.type === 'partial' ? 'text-yellow-900' :
                      'text-red-900'
                    }`}>
                    {feedback.message} - <span className="text-base font-normal opacity-80">{feedback.details}</span>
                  </h4>
                </div>
              </div>

              {feedback.type !== 'success' && (
                <button
                  onClick={() => { setFeedback(null); setShowExplanations(false); }}
                  className="px-6 py-3 bg-surface-elevated rounded-xl font-bold text-sm shadow-sm hover:bg-surface-secondary transition-colors"
                >
                  Try Again
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedOptions.length === 0}
                className="w-full bg-zinc-900 text-white rounded-full py-5 font-bold text-xl shadow-xl hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Verifying...' : 'Check Answer'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
