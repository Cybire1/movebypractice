'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '../../types/challenges';
import Editor from '@monaco-editor/react';

interface ChallengeInterfaceProps {
  challenge: Challenge;
  onComplete: (earnedXP: number, timeSpent: number, hintsUsed: number) => void;
  onExit: () => void;
}

export default function ChallengeInterface({
  challenge,
  onComplete,
  onExit
}: ChallengeInterfaceProps) {
  const [code, setCode] = useState(
    challenge.starterCode || challenge.buggyCode || challenge.predictionCode || ''
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRevealHint = () => {
    if (hintsRevealed < 3) {
      setHintsRevealed(hintsRevealed + 1);
      setShowHint(true);
    }
  };

  const getCurrentHint = (): string => {
    switch (hintsRevealed) {
      case 1: return challenge.hint1;
      case 2: return challenge.hint2;
      case 3: return challenge.hint3;
      default: return '';
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let isCorrect = false;

    // Validate based on challenge type
    if (challenge.type === 'output_prediction' && challenge.multipleChoiceOptions) {
      isCorrect = selectedOption === challenge.correctOptionIndex;
    } else {
      // For code challenges, compare normalized code
      const normalizedCode = code.trim().replace(/\s+/g, ' ');
      const normalizedSolution = challenge.solution.trim().replace(/\s+/g, ' ');
      isCorrect = normalizedCode === normalizedSolution;
    }

    if (isCorrect) {
      // Calculate XP
      let earnedXP = challenge.baseXP;

      // Time bonus (if completed within 3 minutes)
      if (timeElapsed <= 180) {
        earnedXP += challenge.timeBonus;
      }

      // No hint bonus
      if (hintsRevealed === 0) {
        earnedXP += challenge.noHintBonus;
      }

      setFeedback({
        type: 'success',
        message: `Correct! You earned ${earnedXP} XP!`
      });

      // Complete challenge after short delay
      setTimeout(() => {
        onComplete(earnedXP, timeElapsed, hintsRevealed);
      }, 2000);
    } else {
      setFeedback({
        type: 'error',
        message: 'Not quite right. Try again or use a hint!'
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sui-sky/20 to-white pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header with Timer */}
        <div className="bg-surface-elevated rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border-2 border-sui-navy">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-sui-navy mb-1 sm:mb-2">
                {challenge.title}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-sui-gray-600">
                {challenge.description}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Timer */}
              <div className="flex flex-col items-center bg-sui-ocean/10 rounded-lg sm:rounded-xl p-2 sm:p-3 min-w-[70px] sm:min-w-[80px]">
                <div className="text-[10px] sm:text-xs text-sui-gray-600 mb-0.5 sm:mb-1">Time</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-sui-ocean font-mono">
                  {formatTime(timeElapsed)}
                </div>
              </div>

              {/* Exit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExit}
                className="p-1.5 sm:p-2 md:p-3 bg-surface-secondary hover:bg-gray-200 rounded-lg sm:rounded-xl transition-colors"
                title="Exit challenge"
              >
                <svg className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:grid xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Code Editor or Multiple Choice */}
          <div className="bg-surface-elevated rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-sui-gray-200 w-full">
            <h3 className="text-lg sm:text-xl font-bold text-sui-navy mb-4">
              {challenge.type === 'output_prediction' ? 'Select Your Answer' : 'Your Solution'}
            </h3>

            {challenge.type === 'output_prediction' && challenge.multipleChoiceOptions ? (
              // Multiple Choice Interface
              <div className="space-y-3">
                <div className="bg-sui-navy text-white p-4 rounded-xl font-mono text-sm sm:text-base mb-4">
                  <pre className="whitespace-pre-wrap">{challenge.predictionCode}</pre>
                </div>

                <div className="space-y-2">
                  {challenge.multipleChoiceOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOption(index)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedOption === index
                          ? 'border-sui-ocean bg-sui-ocean/10 font-semibold'
                          : 'border-sui-gray-200 hover:border-sui-ocean/50'
                      }`}
                    >
                      <span className="font-mono text-base sm:text-lg">{option}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              // Code Editor Interface
              <div className="border-2 border-sui-gray-200 rounded-xl overflow-hidden">
                <Editor
                  height="300px"
                  defaultLanguage="rust"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on'
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-6 bg-gradient-to-r from-sui-ocean to-sui-ocean-dark text-white rounded-xl py-3 sm:py-4 font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-sui-ocean/40 transition-all disabled:opacity-50"
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
                  className={`mt-4 p-4 rounded-xl border-2 ${
                    feedback.type === 'success'
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-red-50 border-red-300 text-red-700'
                  }`}
                >
                  <div className="font-semibold">{feedback.message}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Hints & Info */}
          <div className="space-y-4 sm:space-y-6 w-full">
            {/* Hints Panel */}
            <div className="bg-surface-elevated rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-sui-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-sui-navy">
                  Hints ({hintsRevealed}/3)
                </h3>
                <span className="text-xs sm:text-sm text-sui-gray-600">
                  Costs -{challenge.noHintBonus / 3} XP each
                </span>
              </div>

              {hintsRevealed < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRevealHint}
                  className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-2 border-yellow-300 rounded-xl py-3 sm:py-4 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Reveal Hint {hintsRevealed + 1}
                </motion.button>
              ) : (
                <div className="text-center text-sm text-sui-gray-600 py-4">
                  All hints revealed!
                </div>
              )}

              {/* Display hints */}
              <div className="mt-4 space-y-2">
                {hintsRevealed >= 1 && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-600 mb-1">HINT 1</div>
                    <p className="text-sm text-blue-900">{challenge.hint1}</p>
                  </div>
                )}
                {hintsRevealed >= 2 && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-purple-600 mb-1">HINT 2</div>
                    <p className="text-sm text-purple-900">{challenge.hint2}</p>
                  </div>
                )}
                {hintsRevealed >= 3 && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-orange-600 mb-1">HINT 3</div>
                    <p className="text-sm text-orange-900">{challenge.hint3}</p>
                  </div>
                )}
              </div>
            </div>

            {/* XP Breakdown */}
            <div className="bg-surface-elevated rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-sui-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-sui-navy mb-4">
                Potential Rewards
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-sui-gray-700">Base XP:</span>
                  <span className="font-bold text-sui-ocean text-base sm:text-lg">{challenge.baseXP}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-sui-gray-700 flex items-center gap-2">
                    Speed Bonus:
                    <span className="text-xs text-sui-gray-500">(≤3 min)</span>
                  </span>
                  <span className={`font-bold text-base sm:text-lg ${timeElapsed <= 180 ? 'text-purple-600' : 'text-foreground-tertiary line-through'}`}>
                    +{challenge.timeBonus}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-sui-gray-700 flex items-center gap-2">
                    No Hints:
                  </span>
                  <span className={`font-bold text-base sm:text-lg ${hintsRevealed === 0 ? 'text-green-600' : 'text-foreground-tertiary line-through'}`}>
                    +{challenge.noHintBonus}
                  </span>
                </div>

                <div className="border-t-2 border-sui-gray-200 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-sui-navy">Total Possible:</span>
                    <span className="font-bold text-sui-ocean text-xl sm:text-2xl">
                      {challenge.baseXP +
                        (timeElapsed <= 180 ? challenge.timeBonus : 0) +
                        (hintsRevealed === 0 ? challenge.noHintBonus : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Cases (if available) */}
            {challenge.testCases && challenge.testCases.length > 0 && (
              <div className="bg-surface-elevated rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-sui-gray-200">
                <h3 className="text-lg sm:text-xl font-bold text-sui-navy mb-4">
                  Test Cases
                </h3>
                <div className="space-y-2">
                  {challenge.testCases.map((testCase, index) => (
                    <div key={index} className="bg-surface-secondary rounded-lg p-3 text-sm">
                      <div className="text-sui-gray-600">{testCase.description}</div>
                      <div className="font-mono text-sui-navy mt-1">
                        Expected: {testCase.expectedOutput}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
