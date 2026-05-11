'use client';

import { Exercise, ValidationResult, ExerciseFeedback } from '../../types/exercises';
import CodeCompletionExerciseComponent from './CodeCompletionExercise';
import BugFixExerciseComponent from './BugFixExercise';
import MultipleChoiceExerciseComponent from './MultipleChoiceExercise';
import OutputPredictionExerciseComponent from './OutputPredictionExercise';

interface ExerciseRendererProps {
  exercise: Exercise;
  onComplete: (result: ValidationResult, feedback: ExerciseFeedback) => void;
  onHintRequest?: () => void;
}

/**
 * Smart component that renders the appropriate exercise type
 * based on the exercise's type property.
 *
 * Uses TypeScript discriminated unions to safely determine
 * which component to render and ensure type safety.
 */
export default function ExerciseRenderer({
  exercise,
  onComplete,
  onHintRequest
}: ExerciseRendererProps) {
  // Type guard and render the appropriate component
  switch (exercise.type) {
    case 'code_completion':
      return (
        <CodeCompletionExerciseComponent
          exercise={exercise}
          onComplete={onComplete}
          onHintRequest={onHintRequest}
        />
      );

    case 'bug_fix':
      return (
        <BugFixExerciseComponent
          exercise={exercise}
          onComplete={onComplete}
          onHintRequest={onHintRequest}
        />
      );

    case 'multiple_choice':
      return (
        <MultipleChoiceExerciseComponent
          exercise={exercise}
          onComplete={onComplete}
          onHintRequest={onHintRequest}
        />
      );

    case 'output_prediction':
      return (
        <OutputPredictionExerciseComponent
          exercise={exercise}
          onComplete={onComplete}
          onHintRequest={onHintRequest}
        />
      );

    default:
      // TypeScript exhaustiveness check
      // If a new exercise type is added, this will cause a compile error
      const _exhaustiveCheck: never = exercise;
      return (
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-xl">
          <p className="text-red-700 font-semibold">
            Unknown exercise type. Please check the exercise configuration.
          </p>
        </div>
      );
  }
}
