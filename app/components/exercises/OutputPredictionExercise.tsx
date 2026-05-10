'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  OutputPredictionExercise,
  OutputPredictionAnswer,
  ValidationResult,
  ExerciseFeedback
} from '../../types/exercises';

interface OutputPredictionExerciseProps {
  exercise: OutputPredictionExercise;
  onComplete: (result: ValidationResult, feedback: ExerciseFeedback) => void;
  onHintRequest?: () => void;
}

export default function OutputPredictionExerciseComponent({
  exercise,
  onComplete,
  onHintRequest
}: OutputPredictionExerciseProps) {
  const [prediction, setPrediction] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExecutionTrace, setShowExecutionTrace] = useState(false);

  const normalizeOutput = (output: string): string => {
    return output.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const validatePrediction = (): ValidationResult => {
    let userAnswer: string;

    if (exercise.answerFormat === 'multiple_choice' && selectedOption !== null) {
      userAnswer = selectedOption;
    } else {
      userAnswer = prediction;
    }

    const normalizedUser = normalizeOutput(userAnswer);
    const normalizedCorrect = normalizeOutput(exercise.correctOutput);

    // Check if answer is correct
    const isCorrect =
      normalizedUser === normalizedCorrect ||
      exercise.allowableAnswers?.some(
        answer => normalizeOutput(answer) === normalizedUser
      ) ||
      false;

    // Calculate partial score based on similarity
    let score = 0;
    if (isCorrect) {
      score = 100;
    } else if (exercise.outputType === 'value' || exercise.outputType === 'type') {
      // Check for partial matches in the answer
      const correctWords = normalizedCorrect.split(' ');
      const userWords = normalizedUser.split(' ');
      const matchingWords = userWords.filter(word => correctWords.includes(word));
      score = Math.round((matchingWords.length / correctWords.length) * 100);
    }

    const errors = isCorrect ? [] : [{
      message: `Expected: ${exercise.correctOutput}`,
      severity: 'error' as const,
      hint: exercise.hints[0]
    }];

    return {
      isCorrect,
      score,
      feedback: isCorrect
        ? 'Correct prediction!'
        : `Not quite. Your answer: "${userAnswer}"`,
      errors: errors.length > 0 ? errors : undefined
    };
  };

  const generateFeedback = (validation: ValidationResult): ExerciseFeedback => {
    const earnedXP = Math.round((validation.score / 100) * exercise.baseXP);

    if (validation.isCorrect) {
      return {
        type: 'success',
        message: 'Excellent! You predicted the output correctly.',
        details: exercise.explanation,
        earnedXP: hintsUsed === 0 ? earnedXP + (exercise.perfectScoreXP || 0) : earnedXP,
        correctAnswer: exercise.correctOutput
      };
    } else if (validation.score >= 50) {
      return {
        type: 'partial',
        message: 'Close, but not quite right.',
        details: 'Review the code execution flow and try again.',
        earnedXP,
        showHint: true
      };
    } else {
      return {
        type: 'incorrect',
        message: 'Incorrect prediction.',
        earnedXP: 0,
        showHint: true,
        correctAnswer: hintsUsed >= 2 ? exercise.correctOutput : undefined
      };
    }
  };

  const handleSubmit = async () => {
    if (exercise.answerFormat === 'text' && !prediction) return;
    if (exercise.answerFormat === 'multiple_choice' && !selectedOption) return;

    setIsSubmitting(true);
    setFeedback(null);

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validatePrediction();
    const feedbackResult = generateFeedback(validation);

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

  const getOutputTypeIcon = () => {
    switch (exercise.outputType) {
      case 'value':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'type':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'boolean':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${
            exercise.outputType === 'value' ? 'bg-green-100' :
            exercise.outputType === 'type' ? 'bg-blue-100' :
            exercise.outputType === 'error' ? 'bg-red-100' : 'bg-purple-100'
          } rounded-xl flex items-center justify-center flex-shrink-0`}>
            {getOutputTypeIcon()}
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
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
            {exercise.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sui-sky/30 text-sui-ocean border border-sui-ocean/20">
            {exercise.topic.replace('_', ' ')}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            exercise.outputType === 'value' ? 'bg-green-100 text-green-700 border-green-300' :
            exercise.outputType === 'type' ? 'bg-blue-100 text-blue-700 border-blue-300' :
            exercise.outputType === 'error' ? 'bg-red-100 text-red-700 border-red-300' :
            'bg-purple-100 text-purple-700 border-purple-300'
          }`}>
            Predict {exercise.outputType}
          </span>
        </div>
      </div>

      {/* Code to Analyze */}
      <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-bold text-sui-navy mb-4">
          Analyze This Code
        </h4>
        <div className="border-2 border-sui-gray-200 rounded-xl overflow-hidden">
          <Editor
            height="300px"
            defaultLanguage={exercise.language === 'move' ? 'rust' : exercise.language}
            value={exercise.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: exercise.showLineNumbers ? 'on' : 'off',
              scrollBeyondLastLine: false,
              wordWrap: 'on'
            }}
          />
        </div>
      </div>

      {/* Execution Trace (if available) */}
      {exercise.executionSteps && exercise.executionSteps.length > 0 && (
        <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg sm:text-xl font-bold text-sui-navy">
              Execution Trace
            </h4>
            <button
              onClick={() => setShowExecutionTrace(!showExecutionTrace)}
              className="text-sm text-sui-ocean hover:text-sui-ocean-dark font-semibold"
            >
              {showExecutionTrace ? 'Hide' : 'Show'} Steps
            </button>
          </div>

          {showExecutionTrace && (
            <div className="space-y-3">
              {exercise.executionSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface-secondary border-2 border-[var(--border-default)] rounded-lg p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-2 py-1 bg-sui-ocean text-white text-xs font-bold rounded">
                      Step {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-sui-gray-700 mb-2">{step.description}</p>
                      {step.variables && Object.keys(step.variables).length > 0 && (
                        <div className="bg-surface-elevated rounded p-2 font-mono text-xs">
                          {Object.entries(step.variables).map(([key, value]) => (
                            <div key={key} className="text-sui-navy">
                              <span className="text-purple-600">{key}</span> = <span className="text-green-600">{JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer Input */}
      <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-bold text-sui-navy mb-4">
          What will be the output?
        </h4>

        {exercise.answerFormat === 'text' ? (
          <div className="space-y-3">
            <input
              type="text"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder={`Enter the predicted ${exercise.outputType}...`}
              className="w-full px-4 py-3 border-2 border-sui-gray-300 rounded-xl focus:border-sui-ocean focus:ring-2 focus:ring-sui-ocean/20 outline-none transition-all font-mono text-sm sm:text-base"
            />

            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Explain your reasoning (optional)..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-sui-gray-300 rounded-xl focus:border-sui-ocean focus:ring-2 focus:ring-sui-ocean/20 outline-none transition-all text-sm sm:text-base resize-none"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {exercise.multipleChoiceOptions?.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedOption(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedOption === option
                    ? 'border-sui-ocean bg-sui-ocean/10 font-semibold'
                    : 'border-sui-gray-200 hover:border-sui-ocean/50'
                }`}
              >
                <span className="font-mono text-sm sm:text-base">{option}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

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
        disabled={
          isSubmitting ||
          (exercise.answerFormat === 'text' && !prediction) ||
          (exercise.answerFormat === 'multiple_choice' && !selectedOption)
        }
        className="w-full bg-gradient-to-r from-sui-ocean to-sui-ocean-dark text-white rounded-xl py-3 sm:py-4 font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-sui-ocean/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Checking...' : 'Submit Prediction'}
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
                {feedback.correctAnswer && (
                  <div className="mt-3 p-3 bg-surface-elevated rounded-lg border-2 border-[var(--border-default)]">
                    <div className="text-xs font-semibold text-foreground-secondary mb-1">Correct Answer:</div>
                    <div className="font-mono text-sm text-sui-navy">{feedback.correctAnswer}</div>
                  </div>
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
