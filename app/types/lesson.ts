// Interactive element types for teaching slides
export interface InteractiveElement {
  type: 'drag-drop' | 'click-reveal' | 'code-highlight' | 'animation';
  config: {
    // For drag-drop
    items?: { id: string; label: string; emoji: string }[];
    targets?: { id: string; label: string }[];
    correctPairs?: { itemId: string; targetId: string }[];

    // For click-reveal
    reveals?: { label: string; content: string }[];

    // For code-highlight
    code?: string;
    highlights?: { line: number; explanation: string }[];

    // For animation
    animationType?: 'flow' | 'transform' | 'sequence';
    animationData?: Record<string, unknown>;

    // General explanation for AI context
    explanation?: string;
  };
}

export interface TeachingSlide {
  title: string;
  content: string;
  emoji: string;
  image?: string;
  illustration?: string;
  interactiveElement?: InteractiveElement;
}

// Teaching section with optional exercise after
export interface TeachingSection {
  slides: TeachingSlide[];
  exerciseId?: string; // Optional exercise ID to practice what was just learned
  sectionTitle?: string; // Optional title for the section
}

// Quiz weakness topics for personalized practice
export type WeaknessTopic = 'abilities' | 'ownership' | 'entry-functions' | 'types' | 'structs' | 'modules'
  | 'messaging-concepts' | 'sdk-setup' | 'channels' | 'encryption' | 'walrus-storage' | 'react-patterns' | 'production-config'
  | 'move-basics' | 'move-types' | 'control-flow' | 'structs-objects' | 'collections' | 'ownership-transfer' | 'generics'
  | 'deepbook-predict';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation: string;
  weaknessTopic?: WeaknessTopic; // Track what concept user struggles with
  practiceHint?: string; // Custom hint if user gets this wrong
}

// Narrative elements for story-driven transitions
export interface LessonNarrative {
  welcomeMessage: string; // Start of teaching phase
  quizTransition: string; // End of teaching → quiz
  practiceTransition: string; // End of quiz → practice
  celebrationMessage: string; // After successful practice
  nextLessonTease?: string; // Hook for next lesson
}

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  order: number;
  language?: 'move' | 'typescript';

  // Narrative-driven storytelling
  narrative: LessonNarrative;

  // Phase 1: Interactive Teaching with interleaved exercises (DataCamp/DataQuest style)
  // Use EITHER teachingSections (new style) OR teachingSlides (legacy)
  teachingSections?: TeachingSection[]; // New: Sections with embedded exercises
  teachingSlides?: TeachingSlide[]; // Legacy: All slides at once

  // Phase 1.5: Interactive Exercises (optional, for legacy lessons)
  exercises?: string[]; // Array of exercise IDs from exercise database

  // Phase 2: Diagnostic Quiz (test understanding, track weaknesses)
  quiz: QuizQuestion[];
  quizPassThreshold: number; // e.g., 0.8 for 80% to pass

  // Phase 3: Practice (IDE coding with tests)
  starterCode: string;
  solution: string;
  hints: string[];
  unitTests?: UnitTest[]; // Optional tests for "Run Tests" feature

  // Requirements
  prerequisiteLessons: string[];
}

// Unit test structure for practice phase
export interface UnitTest {
  name: string;
  description: string;
  code: string; // Test code to run
  expectedResult: string;
}

export interface TestCase {
  name: string;
  input: string;
  expectedOutput: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  attempts: number;
  lastAttemptDate?: Date;
  codeSubmitted?: string;
}
