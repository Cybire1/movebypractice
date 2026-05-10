'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CodeCompletionExercise,
  CodeCompletionAnswer,
  ValidationResult,
  ExerciseFeedback
} from '../../types/exercises';

interface CodeCompletionExerciseProps {
  exercise: CodeCompletionExercise;
  onComplete: (result: ValidationResult, feedback: ExerciseFeedback) => void;
  onHintRequest?: () => void;
}

export default function CodeCompletionExerciseComponent({
  exercise,
  onComplete,
  onHintRequest
}: CodeCompletionExerciseProps) {
  const [answers, setAnswers] = useState<CodeCompletionAnswer>({});
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [focusedBlank, setFocusedBlank] = useState<string | null>(null);
  const [validatedBlanks, setValidatedBlanks] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  // Calculate progress
  const filledBlanks = Object.values(answers).filter(a => a && a.trim().length > 0).length;
  const totalBlanks = exercise.blanks.length;
  const progressPercent = (filledBlanks / totalBlanks) * 100;

  const handleBlankChange = (blankId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [blankId]: value
    }));
    setValidatedBlanks(prev => ({ ...prev, [blankId]: null }));
  };

  const normalizeAnswer = (answer: string): string => {
    if (!exercise.caseSensitive) {
      answer = answer.toLowerCase();
    }
    if (!exercise.strictMode) {
      answer = answer.trim().replace(/\s+/g, ' ');
    }
    return answer;
  };

  const validateAnswers = (): ValidationResult => {
    const totalBlanks = exercise.blanks.length;
    let correctBlanks = 0;
    const errors: { location: string; message: string; severity: 'error' | 'warning' | 'info'; hint?: string }[] = [];
    const newValidatedBlanks: Record<string, 'correct' | 'incorrect'> = {};

    exercise.blanks.forEach(blank => {
      const userAnswer = answers[blank.id] || '';
      const normalizedAnswer = normalizeAnswer(userAnswer);
      const normalizedCorrect = normalizeAnswer(blank.correctAnswer);

      const isCorrect = normalizedAnswer === normalizedCorrect ||
        blank.acceptableAnswers?.some(
          acc => normalizeAnswer(acc) === normalizedAnswer
        );

      if (isCorrect) {
        correctBlanks++;
        newValidatedBlanks[blank.id] = 'correct';
      } else {
        newValidatedBlanks[blank.id] = 'incorrect';
        errors.push({
          location: `Blank: ${blank.placeholder}`,
          message: `Expected something different`,
          severity: 'error',
          hint: blank.hint || exercise.hints[0]
        });
      }
    });

    setValidatedBlanks(newValidatedBlanks);

    const score = Math.round((correctBlanks / totalBlanks) * 100);
    const isCorrect = score === 100;

    return {
      isCorrect,
      score,
      feedback: isCorrect
        ? `Perfect! All ${totalBlanks} blanks filled correctly!`
        : `${correctBlanks} out of ${totalBlanks} correct. Keep trying!`,
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
        message: 'Good progress! Almost there.',
        details: 'Check the highlighted errors and try again.',
        earnedXP,
        showHint: true
      };
    } else {
      return {
        type: 'incorrect',
        message: 'Not quite right. Try again or use a hint.',
        earnedXP: 0,
        showHint: true
      };
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    await new Promise(resolve => setTimeout(resolve, 600));

    const validation = validateAnswers();
    const feedbackResult = generateFeedback(validation);

    setFeedback(feedbackResult);
    setIsSubmitting(false);

    if (validation.isCorrect) {
      setShowConfetti(true);
      setTimeout(() => {
        onComplete(validation, feedbackResult);
      }, 2500);
    }
  };

  const handleHint = () => {
    if (hintsUsed < exercise.hints.length) {
      setHintsUsed(hintsUsed + 1);
      onHintRequest?.();
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setValidatedBlanks({});
  };

  // Tokenize code for syntax highlighting
  const tokenizeLine = (text: string): { type: string; value: string }[] => {
    const tokens: { type: string; value: string }[] = [];
    const patterns = [
      { type: 'keyword', regex: /\b(module|fun|public|let|mut|const|struct|use|if|else|while|return|true|false|entry)\b/g },
      { type: 'type', regex: /\b(u8|u64|u128|bool|address|vector|signer)\b/g },
      { type: 'comment', regex: /(\/\/.*)$/g },
      { type: 'string', regex: /(".*?")/g },
      { type: 'number', regex: /\b(\d+)\b/g },
    ];

    let remaining = text;
    let position = 0;

    while (remaining.length > 0) {
      let earliestMatch: { type: string; match: RegExpExecArray; index: number } | null = null;

      for (const pattern of patterns) {
        pattern.regex.lastIndex = 0;
        const match = pattern.regex.exec(remaining);
        if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
          earliestMatch = { type: pattern.type, match, index: match.index };
        }
      }

      if (earliestMatch) {
        if (earliestMatch.index > 0) {
          tokens.push({ type: 'plain', value: remaining.slice(0, earliestMatch.index) });
        }
        tokens.push({ type: earliestMatch.type, value: earliestMatch.match[0] });
        remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length);
      } else {
        tokens.push({ type: 'plain', value: remaining });
        break;
      }
    }

    return tokens;
  };

  // Get color class for token type
  const getTokenColor = (type: string): string => {
    switch (type) {
      case 'keyword': return 'text-purple-600';
      case 'type': return 'text-amber-600';
      case 'comment': return 'text-foreground-tertiary';
      case 'string': return 'text-green-600';
      case 'number': return 'text-orange-500';
      default: return 'text-foreground';
    }
  };

  // Render code with inline blanks
  const renderCodeWithBlanks = () => {
    const lines = exercise.codeTemplate.split('\n');

    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\{blank:\w+\})/g);

      return (
        <div key={lineIndex} className="flex items-center min-h-[32px] group hover:bg-surface-secondary/50 transition-colors">
          {/* Line number */}
          <span className="w-10 text-right pr-4 text-foreground-tertiary text-sm font-mono select-none">
            {lineIndex + 1}
          </span>
          {/* Line content */}
          <div className="flex items-center flex-wrap py-1">
            {parts.map((part, partIndex) => {
              const blankMatch = part.match(/\{blank:(\w+)\}/);

              if (blankMatch) {
                const blankId = blankMatch[1];
                const blank = exercise.blanks.find(b => b.id === blankId);
                const value = answers[blankId] || '';
                const isFocused = focusedBlank === blankId;
                const validationState = validatedBlanks[blankId];

                return (
                  <motion.div
                    key={partIndex}
                    className="relative inline-flex mx-1"
                    animate={validationState === 'incorrect' ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleBlankChange(blankId, e.target.value)}
                      onFocus={() => setFocusedBlank(blankId)}
                      onBlur={() => setFocusedBlank(null)}
                      placeholder={blank?.placeholder || '___'}
                      className={`
                        min-w-[100px] max-w-[200px] px-3 py-1.5 
                        font-mono text-sm
                        rounded-lg border-2 outline-none
                        transition-all duration-200
                        placeholder:text-foreground-tertiary
                        ${validationState === 'correct'
                          ? 'bg-green-50 border-green-400 text-green-700'
                          : validationState === 'incorrect'
                            ? 'bg-red-50 border-red-400 text-red-700'
                            : isFocused
                              ? 'bg-surface-elevated border-zinc-900 text-foreground ring-4 ring-zinc-900/10'
                              : 'bg-surface-secondary border-[var(--border-default)] text-foreground hover:border-zinc-300'
                        }
                      `}
                      style={{ width: `${Math.max(100, value.length * 10 + 40)}px` }}
                    />
                    {/* Validation icon */}
                    {validationState && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`absolute -right-2 -top-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold
                          ${validationState === 'correct' ? 'bg-green-500' : 'bg-red-500'}
                        `}
                      >
                        {validationState === 'correct' ? '✓' : '✕'}
                      </motion.div>
                    )}
                  </motion.div>
                );
              }

              // Tokenize and render code with proper colors
              const tokens = tokenizeLine(part);
              return (
                <span key={partIndex} className="font-mono text-sm whitespace-pre">
                  {tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={getTokenColor(token.type)}>
                      {token.value}
                    </span>
                  ))}
                </span>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-32">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER CARD - Clean White Design
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-elevated rounded-[2rem] border border-[var(--border-default)] p-8 shadow-xl shadow-zinc-200/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-surface-secondary to-transparent rounded-bl-full" />

        <div className="relative z-10 flex items-start justify-between gap-6">
          <div className="flex-1">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${exercise.difficulty === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                  exercise.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                }`}>
                {exercise.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-surface-secondary text-foreground-secondary border border-[var(--border-default)]">
                {exercise.topic.replace('_', ' ')}
              </span>
            </div>

            <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">
              {exercise.title}
            </h2>
            <p className="text-lg text-foreground-secondary font-medium leading-relaxed">
              {exercise.description}
            </p>
          </div>

          {/* Progress Ring */}
          <div className="flex-shrink-0 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e4e4e7"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="#18181b"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={251.2}
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * progressPercent / 100) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground">{filledBlanks}</span>
              <span className="text-xs text-foreground-tertiary font-bold">/ {totalBlanks}</span>
            </div>
          </div>
        </div>

        {/* XP Badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full">
          <span className="text-yellow-400">⚡</span>
          <span className="text-sm font-bold">{exercise.baseXP} XP</span>
          {exercise.perfectScoreXP && (
            <span className="text-xs text-zinc-400">+{exercise.perfectScoreXP} bonus</span>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          CODE EDITOR - Light Theme with Clear Text
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-elevated rounded-2xl overflow-hidden shadow-xl border border-[var(--border-default)]"
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-secondary border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs font-mono text-foreground-tertiary font-medium">exercise.move</span>
          <div className="w-16" />
        </div>

        {/* Code Editor with Inline Blanks */}
        <div className="p-4 bg-surface-elevated overflow-x-auto">
          <div className="space-y-0">
            {renderCodeWithBlanks()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 px-4 py-3 bg-surface-secondary border-t border-[var(--border-default)]">
          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
            <div className="w-4 h-4 rounded border-2 border-[var(--border-default)] bg-surface-secondary" />
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <div className="w-4 h-4 rounded border-2 border-zinc-900 bg-surface-elevated" />
            <span>Focused</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <div className="w-4 h-4 rounded border-2 border-green-400 bg-green-50" />
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-red-700">
            <div className="w-4 h-4 rounded border-2 border-red-400 bg-red-50" />
            <span>Incorrect</span>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          HINTS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      {exercise.hints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-elevated rounded-2xl border border-[var(--border-default)] p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-foreground">
              💡 Hints ({hintsUsed}/{exercise.hints.length})
            </h4>
            {hintsUsed < exercise.hints.length && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHint}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-semibold text-sm transition-colors"
              >
                Reveal Hint
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {hintsUsed > 0 && (
              <div className="space-y-3">
                {exercise.hints.slice(0, hintsUsed).map((hint, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-amber-50 border border-amber-200 rounded-xl p-4"
                  >
                    <p className="text-amber-900 font-medium">{hint}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY ACTION BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="sticky bottom-6 z-20">
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className={`rounded-2xl p-6 shadow-2xl border-2 backdrop-blur-xl flex items-center justify-between gap-6 ${feedback.type === 'success' ? 'bg-green-50/95 border-green-400' :
                  feedback.type === 'partial' ? 'bg-amber-50/95 border-amber-400' :
                    'bg-red-50/95 border-red-400'
                }`}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${feedback.type === 'success' ? 'bg-green-200' :
                      feedback.type === 'partial' ? 'bg-amber-200' :
                        'bg-red-200'
                    }`}
                >
                  {feedback.type === 'success' ? '🎉' : feedback.type === 'partial' ? '💪' : '😅'}
                </motion.div>
                <div>
                  <h4 className={`font-bold text-xl ${feedback.type === 'success' ? 'text-green-900' :
                      feedback.type === 'partial' ? 'text-amber-900' :
                        'text-red-900'
                    }`}>
                    {feedback.message}
                  </h4>
                  {feedback.earnedXP > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-bold mt-1"
                    >
                      <span className="text-yellow-600">⚡ +{feedback.earnedXP} XP earned!</span>
                    </motion.p>
                  )}
                </div>
              </div>

              {feedback.type !== 'success' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetry}
                  className="px-6 py-3 bg-surface-elevated hover:bg-surface-secondary rounded-xl font-bold text-foreground shadow-lg border border-[var(--border-default)] transition-colors"
                >
                  Try Again
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting || filledBlanks < totalBlanks}
              className="w-full bg-zinc-900 text-white rounded-2xl py-5 font-bold text-xl shadow-2xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  />
                  Checking...
                </>
              ) : (
                <>Check Answers</>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONFETTI OVERLAY
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: -20,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
                  rotate: Math.random() * 720 - 360,
                  x: `+=${Math.random() * 200 - 100}`
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  ease: "linear"
                }}
                className={`absolute w-3 h-3 rounded-sm ${['bg-green-400', 'bg-blue-400', 'bg-yellow-400', 'bg-pink-400', 'bg-purple-400'][i % 5]
                  }`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
