'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeachingSlide as TeachingSlideType } from '@/app/types/lesson';
import DragDropInteractive from './interactive/DragDropInteractive';
import ClickRevealInteractive from './interactive/ClickRevealInteractive';
import CodeHighlightInteractive from './interactive/CodeHighlightInteractive';
import SlideAIAssistant from './SlideAIAssistant';

interface TeachingSlideProps {
  slides: TeachingSlideType[];
  onComplete: () => void;
  transitionMessage: string;
  lessonTitle?: string;
}

export default function TeachingSlide({ slides, onComplete, transitionMessage, lessonTitle = 'Current Lesson' }: TeachingSlideProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentSlide = slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === slides.length - 1;
  const isFirstSlide = currentSlideIndex === 0;

  const goToNextSlide = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (!isFirstSlide) {
      setDirection(-1);
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const renderInteractiveElement = () => {
    if (!currentSlide.interactiveElement) return null;

    switch (currentSlide.interactiveElement.type) {
      case 'drag-drop':
        return <DragDropInteractive config={currentSlide.interactiveElement.config} />;
      case 'click-reveal':
        return <ClickRevealInteractive config={currentSlide.interactiveElement.config} />;
      case 'code-highlight':
        return <CodeHighlightInteractive config={currentSlide.interactiveElement.config} />;
      default:
        return null;
    }
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextSlide();
      if (e.key === 'ArrowLeft') goToPreviousSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Progress Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 flex gap-1.5 px-4 py-3 bg-[var(--surface-overlay)] backdrop-blur-md border-b border-[var(--border-subtle)]">
        {slides.map((_, index) => (
          <div
            key={index}
            className="h-1 flex-1 rounded-full bg-surface-secondary overflow-hidden"
          >
            <motion.div
              className="h-full bg-zinc-900"
              initial={{ width: "0%" }}
              animate={{
                width: index <= currentSlideIndex ? "100%" : "0%"
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      <div className="flex-1 w-full pt-16 pb-24 lg:pb-0 lg:pt-0"> {/* Added padding bottom for sticky mobile nav */}
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] lg:h-screen">

          {/* LEFT: Narrative Panel */}
          <div className="w-full lg:w-[45%] p-6 md:p-8 lg:p-16 overflow-y-auto flex flex-col justify-center relative z-10 order-1 lg:order-none">
            {/* Desktop Navigation / Tools - Fixed Top Right */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
              {/* Live Help Button (New) */}
              <motion.button
                className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-[var(--surface-overlay)] backdrop-blur-md border border-[var(--border-default)] rounded-full shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert("Connecting to live instructor queue...")}
              >
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                </div>
                <span className="text-sm font-semibold text-foreground-secondary group-hover:text-foreground">Live Help</span>
              </motion.button>


            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col h-full justify-center"
              >
                {/* Badge / Emoji */}
                {/* Badge / Emoji / Illustration */}
                {currentSlide.illustration ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                  >
                    <div className="relative w-32 h-32 md:w-40 md:h-40">
                      <div className="absolute inset-0 bg-sui-accent/20 blur-[40px] rounded-full opacity-50" />
                      <img
                        src={currentSlide.illustration}
                        alt="Icon"
                        className="relative w-full h-full object-contain drop-shadow-2xl"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-surface-secondary border border-[var(--border-subtle)] flex items-center justify-center text-3xl mb-8 shadow-sm"
                  >
                    {currentSlide.emoji}
                  </motion.div>
                )}

                {/* Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter-swiss mb-6 text-foreground leading-[0.9]">
                  {currentSlide.title}
                </h2>

                {/* Content */}
                <div className="text-lg md:text-xl font-medium text-foreground-secondary leading-relaxed max-w-xl">
                  {currentSlide.content}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Desktop Navigation (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-4 mt-12">
              {!isFirstSlide && (
                <button
                  onClick={goToPreviousSlide}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all text-foreground-secondary hover:bg-surface-secondary hover:text-foreground border border-transparent hover:border-[var(--border-default)]"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
              )}
              <button
                onClick={goToNextSlide}
                className="group px-8 h-14 bg-zinc-900 text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all flex items-center gap-3 hover:translate-x-1 shadow-xl hover:shadow-2xl hover:shadow-zinc-900/20"
              >
                <span>{isLastSlide ? 'Complete Lesson' : 'Continue'}</span>
                <svg className={`w-5 h-5 transition-transform ${isLastSlide ? '' : 'group-hover:translate-x-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isLastSlide
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* RIGHT: Interactive/Visual Panel */}
          <div className={`w-full lg:w-[55%] bg-surface-secondary/50 order-2 lg:order-none relative overflow-hidden flex items-center justify-center p-4 lg:p-12
            ${!currentSlide.interactiveElement ? 'min-h-[200px] lg:h-auto' : 'min-h-[400px] lg:h-auto'}
          `}>
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 bg-grid-zinc opacity-[0.05]" />

            {/* Radial Fade */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-surface lg:hidden" />

            <div className="relative w-full max-w-3xl z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full"
                >
                  {currentSlide.interactiveElement ? (
                    <div className="max-h-[60vh] lg:max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                      {renderInteractiveElement()}
                    </div>
                  ) : currentSlide.image ? (
                    <div className="relative group perspective-1000">
                      <motion.div
                        initial={{ rotateX: 5, rotateY: 5, scale: 0.95 }}
                        whileHover={{ rotateX: 0, rotateY: 0, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="glass-panel-subtle rounded-2xl md:rounded-3xl shadow-2xl shadow-zinc-200/50 border border-zinc-200/60 overflow-hidden relative z-10"
                      >
                        <div className="aspect-video relative bg-white flex items-center justify-center p-8">
                          <img
                            src={currentSlide.image}
                            alt={currentSlide.title}
                            className="w-full h-full object-contain filter drop-shadow-xl"
                          />
                          {/* Reflection/Sheen */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                      </motion.div>
                      {/* Ambient Glow */}
                      <div className="absolute -inset-4 bg-sui-accent/20 rounded-[3rem] blur-3xl -z-10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                    </div>
                  ) : (
                    <div className="glass-panel-subtle rounded-2xl md:rounded-3xl p-8 md:p-16 text-center border-2 border-dashed border-[var(--border-default)]">
                      <span className="text-foreground-tertiary font-bold tracking-widest uppercase text-sm">Concept Illustration</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface-overlay)] backdrop-blur-xl border-t border-[var(--border-subtle)] lg:hidden z-50 safe-area-bottom">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          {!isFirstSlide && (
            <button
              onClick={goToPreviousSlide}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-secondary text-foreground hover:bg-[var(--border-default)] transition-colors"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <button
            onClick={goToNextSlide}
            className="flex-1 h-12 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 active:scale-95 transition-transform"
          >
            {isLastSlide ? 'Complete' : 'Continue'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <SlideAIAssistant
        slide={currentSlide}
        lessonTitle={lessonTitle}
        slideIndex={currentSlideIndex}
        totalSlides={slides.length}
      />
    </div>
  );
}
