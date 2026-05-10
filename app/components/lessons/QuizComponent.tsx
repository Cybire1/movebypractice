'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion, WeaknessTopic } from '@/app/types/lesson';
import { useGameStore } from '@/app/lib/store/gameStore';

interface QuizComponentProps {
  questions: QuizQuestion[];
  passThreshold: number;
  onComplete: (weaknesses: WeaknessTopic[], practiceHints: string[]) => void;
  transitionMessage: string;
}

export default function QuizComponent({
  questions,
  passThreshold,
  onComplete,
  transitionMessage,
}: QuizComponentProps) {
  const { addXP } = useGameStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [weaknesses, setWeaknesses] = useState<WeaknessTopic[]>([]);
  const [practiceHints, setPracticeHints] = useState<string[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const totalQuestions = questions.length;
  const requiredScore = Math.ceil(totalQuestions * passThreshold);
  const passed = score >= requiredScore;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return; // Prevent changing answer after submission
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowFeedback(true);

    if (isCorrect) {
      setScore(score + 1);
      addXP(10); // Small XP reward for correct answer
    } else {
      // Track weaknesses
      if (currentQuestion.weaknessTopic) {
        setWeaknesses([...weaknesses, currentQuestion.weaknessTopic]);
      }
      if (currentQuestion.practiceHint) {
        setPracticeHints([...practiceHints, currentQuestion.practiceHint]);
      }
    }

    setAnsweredQuestions([...answeredQuestions, currentQuestionIndex]);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setQuizComplete(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnsweredQuestions([]);
    setWeaknesses([]);
    setPracticeHints([]);
    setQuizComplete(false);
  };

  const handleContinueToPractice = () => {
    // Award XP for passing quiz
    if (passed) {
      addXP(50);
    }
    onComplete(weaknesses, practiceHints);
  };

  if (quizComplete) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full bg-surface-elevated rounded-[2.5rem] shadow-2xl p-12 md:p-16 border border-[var(--border-default)] text-center relative overflow-hidden"
        >
          {/* Confetti Background */}
          {passed && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />}

          {/* Score Display circle */}
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center text-6xl font-black shadow-xl ring-8 ring-white ${passed ? 'bg-zinc-900 text-white' : 'bg-red-500 text-white'
                }`}
            >
              {Math.round((score / totalQuestions) * 100)}%
            </motion.div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-sm font-bold shadow-md border border-zinc-100 whitespace-nowrap">
              {score} / {totalQuestions} Correct
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight">
            {passed ? 'Lesson Mastered!' : 'Keep Going!'}
          </h2>

          <p className="text-xl text-foreground-secondary mb-12 font-medium leading-relaxed max-w-lg mx-auto">
            {passed
              ? "You've crushed the concepts. You're ready to prove your skills in the code editor."
              : "You're getting there! Review the concepts and try again to unlock the practice."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!passed && (
              <button
                onClick={handleRetry}
                className="px-10 py-5 bg-surface-elevated text-foreground border-2 border-[var(--border-default)] rounded-full font-bold text-lg hover:border-foreground transition-all"
              >
                Try Again
              </button>
            )}
            {passed && (
              <button
                onClick={handleContinueToPractice}
                className="group relative px-10 py-5 bg-zinc-900 text-white rounded-full font-bold text-lg shadow-xl hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2">
                  {transitionMessage}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <div key={idx} className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${idx < currentQuestionIndex ? 'bg-zinc-900' :
                  idx === currentQuestionIndex ? 'bg-blue-500' : 'bg-surface-secondary'
                }`} />
            ))}
          </div>
          <div className="text-xs font-bold text-foreground-tertiary uppercase tracking-widest">
            Question {currentQuestionIndex + 1}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2 }}
          >
            {/* Question Card */}
            <div className="bg-transparent mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = showFeedback;

                let cardStyle = "bg-surface-elevated border-[var(--border-default)] hover:border-foreground-tertiary hover:shadow-lg";
                let textStyle = "text-foreground-secondary";
                let icon = null;

                if (showResult) {
                  if (isCorrect) {
                    cardStyle = "bg-green-500 border-green-500 shadow-green-200 shadow-xl";
                    textStyle = "text-white font-bold";
                    icon = "✅";
                  } else if (isSelected) {
                    cardStyle = "bg-red-500 border-red-500 shadow-red-200 shadow-xl";
                    textStyle = "text-white font-bold";
                    icon = "❌";
                  } else {
                    cardStyle = "bg-surface-elevated opacity-50";
                  }
                } else if (isSelected) {
                  cardStyle = "bg-zinc-900 border-zinc-900 shadow-xl ring-2 ring-zinc-900 ring-offset-2";
                  textStyle = "text-white font-bold";
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    className={`w-full p-6 md:p-8 rounded-[2rem] border-2 text-left transition-all duration-300 relative group overflow-hidden ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className={`text-xl ${textStyle}`}>{option}</span>
                      {icon && <span className="text-2xl">{icon}</span>}

                      {!showFeedback && !isSelected && (
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--border-default)] flex items-center justify-center group-hover:border-zinc-300 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-foreground-tertiary group-hover:bg-foreground-secondary" />
                        </div>
                      )}
                      {!showFeedback && isSelected && (
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-zinc-900" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Bottom Action Area */}
            <div className="mt-12 flex items-center justify-between">
              {showFeedback ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 mr-8"
                >
                  <p className="text-foreground-secondary leading-relaxed font-medium">
                    <span className="text-foreground font-bold block mb-1">Why?</span>
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              ) : <div className="flex-1" />}

              <button
                onClick={showFeedback ? handleNextQuestion : handleSubmitAnswer}
                disabled={!showFeedback && selectedAnswer === null}
                className={`px-10 py-5 rounded-full font-bold text-lg transition-all duration-300
                     ${!showFeedback && selectedAnswer === null
                    ? 'bg-surface-secondary text-foreground-tertiary cursor-not-allowed'
                    : 'bg-zinc-900 text-white shadow-xl hover:scale-105 active:scale-95'
                  }
                  `}
              >
                {showFeedback ? (isLastQuestion ? 'Complete Quiz' : 'Next Question') : 'Check Answer'}
              </button>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
