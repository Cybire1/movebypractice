'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  BugFixExercise,
  BugFixAnswer,
  ValidationResult,
  ExerciseFeedback
} from '../../types/exercises';

interface BugFixExerciseProps {
  exercise: BugFixExercise;
  onComplete: (result: ValidationResult, feedback: ExerciseFeedback) => void;
  onHintRequest?: () => void;
}

export default function BugFixExerciseComponent({
  exercise,
  onComplete,
  onHintRequest
}: BugFixExerciseProps) {
  const [code, setCode] = useState(exercise.buggyCode);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBugLocations, setShowBugLocations] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: number; total: number } | null>(null);

  const normalizeCode = (codeStr: string): string => {
    return codeStr
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};,()])\s*/g, '$1');
  };

  const findFixedLines = (originalCode: string, fixedCode: string): number[] => {
    const originalLines = originalCode.split('\n');
    const fixedLines = fixedCode.split('\n');
    const changedLines: number[] = [];

    const maxLength = Math.max(originalLines.length, fixedLines.length);
    for (let i = 0; i < maxLength; i++) {
      const origLine = originalLines[i]?.trim() || '';
      const fixedLine = fixedLines[i]?.trim() || '';
      if (origLine !== fixedLine) {
        changedLines.push(i + 1); // Line numbers start at 1
      }
    }

    return changedLines;
  };

  const validateCode = (): ValidationResult => {
    const normalizedUserCode = normalizeCode(code);
    const normalizedCorrectCode = normalizeCode(exercise.correctCode);

    const isCorrect = normalizedUserCode === normalizedCorrectCode;
    const fixedLines = findFixedLines(exercise.buggyCode, code);

    // Check how many bugs were fixed
    let fixedBugs = 0;
    if (exercise.bugs) {
      fixedBugs = exercise.bugs.filter(bug =>
        fixedLines.includes(bug.lineNumber)
      ).length;
    }

    const bugFixRate = exercise.bugs.length > 0
      ? (fixedBugs / exercise.bugs.length) * 100
      : 0;

    const errors = isCorrect ? [] : exercise.bugs
      .filter(bug => !fixedLines.includes(bug.lineNumber))
      .map(bug => ({
        location: `Line ${bug.lineNumber}`,
        message: bug.description,
        severity: 'error' as const,
        hint: bug.hint
      }));

    return {
      isCorrect,
      score: isCorrect ? 100 : Math.round(bugFixRate),
      feedback: isCorrect
        ? `Perfect! All ${exercise.bugs.length} bugs fixed!`
        : `${fixedBugs} out of ${exercise.bugs.length} bugs fixed. Keep trying!`,
      errors: errors.length > 0 ? errors : undefined,
      partialCredit: exercise.allowPartialCredit && !isCorrect ? {
        earned: fixedBugs,
        possible: exercise.bugs.length,
        breakdown: fixedLines.map(line => `Fixed line ${line}`)
      } : undefined
    };
  };

  const generateFeedback = (validation: ValidationResult): ExerciseFeedback => {
    const baseXP = exercise.baseXP;
    const earnedXP = Math.round((validation.score / 100) * baseXP);

    if (validation.isCorrect) {
      return {
        type: 'success',
        message: 'Excellent! All bugs fixed correctly.',
        details: exercise.explanation,
        earnedXP: hintsUsed === 0 ? earnedXP + (exercise.perfectScoreXP || 0) : earnedXP
      };
    } else if (validation.score >= 50 && exercise.allowPartialCredit) {
      return {
        type: 'partial',
        message: 'Good progress! You fixed most of the bugs.',
        details: 'Review the remaining errors and try again.',
        earnedXP,
        showHint: true
      };
    } else {
      return {
        type: 'incorrect',
        message: 'Not quite right. Try reviewing the bugs more carefully.',
        earnedXP: 0,
        showHint: true
      };
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validateCode();
    const feedbackResult = generateFeedback(validation);

    // Simulate running test cases
    if (exercise.testCases && validation.isCorrect) {
      setTestResults({ passed: exercise.testCases.length, total: exercise.testCases.length });
    } else if (exercise.testCases) {
      const passedTests = Math.floor(exercise.testCases.length * (validation.score / 100));
      setTestResults({ passed: passedTests, total: exercise.testCases.length });
    }

    setFeedback(feedbackResult);
    setIsSubmitting(false);

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

  const handleReset = () => {
    setCode(exercise.buggyCode);
    setFeedback(null);
    setTestResults(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-sui-navy mb-2">
              {exercise.title}
            </h3>
            <p className="text-sm sm:text-base text-sui-gray-600">
              {exercise.description}
            </p>
          </div>
        </div>

        {/* Difficulty & Topic */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
            {exercise.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sui-sky/30 text-sui-ocean border border-sui-ocean/20">
            {exercise.topic.replace('_', ' ')}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-secondary text-foreground-secondary border border-gray-300">
            {exercise.bugs.length} bugs to fix
          </span>
        </div>
      </div>

      {/* Bug Information Panel */}
      <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg sm:text-xl font-bold text-sui-navy">
            Known Bugs ({exercise.bugs.length})
          </h4>
          <button
            onClick={() => setShowBugLocations(!showBugLocations)}
            className="text-sm text-sui-ocean hover:text-sui-ocean-dark font-semibold"
          >
            {showBugLocations ? 'Hide' : 'Show'} Locations
          </button>
        </div>

        {showBugLocations && (
          <div className="space-y-2">
            {exercise.bugs.map((bug, index) => (
              <div key={index} className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="px-2 py-1 bg-red-200 text-red-800 text-xs font-mono rounded">
                    Line {bug.lineNumber}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-red-600 uppercase mb-1">
                      {bug.bugType}
                    </div>
                    <p className="text-sm text-red-900">{bug.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg sm:text-xl font-bold text-sui-navy">
            Fix the Code
          </h4>
          <button
            onClick={handleReset}
            className="text-sm text-sui-ocean hover:text-sui-ocean-dark font-semibold"
          >
            Reset Code
          </button>
        </div>

        <div className="border-2 border-sui-gray-200 rounded-xl overflow-hidden">
          <Editor
            height="400px"
            defaultLanguage={exercise.language === 'move' ? 'rust' : exercise.language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              glyphMargin: exercise.highlightBugLines,
              lineDecorationsWidth: exercise.highlightBugLines ? 10 : 0
            }}
          />
        </div>
      </div>

      {/* Test Cases */}
      {exercise.testCases && exercise.testCases.length > 0 && (
        <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-sui-navy mb-4">
            Test Cases {testResults && `(${testResults.passed}/${testResults.total} passed)`}
          </h4>

          <div className="space-y-2">
            {exercise.testCases.map((testCase, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 text-sm ${
                  testResults && index < testResults.passed
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-surface-secondary border-2 border-[var(--border-default)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sui-gray-600 font-medium">{testCase.description}</div>
                  {testResults && (
                    <div className="text-xs">
                      {index < testResults.passed ? '✅ Passed' : '❌ Failed'}
                    </div>
                  )}
                </div>
                <div className="font-mono text-xs text-sui-navy">
                  Expected: {testCase.expectedOutput}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hints Section */}
      {exercise.hints.length > 0 && (
        <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg sm:text-xl font-bold text-sui-navy">
              Hints ({hintsUsed}/{exercise.hints.length})
            </h4>
            {hintsUsed < exercise.hints.length && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHint}
                className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-2 border-yellow-300 rounded-lg font-semibold text-sm transition-colors"
              >
                Get Hint
              </motion.button>
            )}
          </div>

          {hintsUsed > 0 && (
            <div className="space-y-2">
              {exercise.hints.slice(0, hintsUsed).map((hint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3"
                >
                  <p className="text-sm text-blue-900">{hint}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-sui-ocean to-sui-ocean-dark text-white rounded-xl py-3 sm:py-4 font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-sui-ocean/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Checking...' : 'Submit Solution'}
      </motion.button>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 sm:p-6 rounded-xl border-2 ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-300'
                : feedback.type === 'partial'
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {feedback.type === 'success' ? '✅' : feedback.type === 'partial' ? '⚠️' : '❌'}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-lg mb-1 ${
                  feedback.type === 'success' ? 'text-green-700' :
                  feedback.type === 'partial' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {feedback.message}
                </h4>
                {feedback.details && (
                  <p className="text-sm text-foreground-secondary mt-2">{feedback.details}</p>
                )}
                {feedback.earnedXP > 0 && (
                  <div className="mt-3 px-3 py-2 bg-surface-elevated rounded-lg border-2 border-sui-ocean/20">
                    <span className="text-sui-ocean font-bold">+{feedback.earnedXP} XP</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
