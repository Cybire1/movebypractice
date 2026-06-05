'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DragDropConfig {
  items?: { id: string; label: string; emoji: string }[];
  targets?: { id: string; label: string }[];
  correctPairs?: { itemId: string; targetId: string }[];
}

interface DragDropInteractiveProps {
  config: DragDropConfig;
}

export default function DragDropInteractive({ config }: DragDropInteractiveProps) {
  const { items = [], targets = [], correctPairs = [] } = config;
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    const touch = typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsTouchDevice(!!touch);
  }, []);

  // Store refs to drop zones for collision detection (desktop drag mode)
  const dropZoneRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleDragEnd = (event: any, info: any, itemId: string) => {
    const dropPoint = {
      x: info.point.x,
      y: info.point.y
    };

    // Check collision with all drop zones
    let landedZoneId: string | null = null;

    for (const [zoneId, element] of Object.entries(dropZoneRefs.current)) {
      if (!element) continue;
      const rect = element.getBoundingClientRect();

      if (
        dropPoint.x >= rect.left &&
        dropPoint.x <= rect.right &&
        dropPoint.y >= rect.top &&
        dropPoint.y <= rect.bottom
      ) {
        landedZoneId = zoneId;
        break;
      }
    }

    if (landedZoneId) {
      handleDrop(landedZoneId, itemId);
    }
  };

  const handleDrop = (targetId: string, itemId: string) => {
    const existingItem = Object.entries(placements).find(([_, tid]) => tid === targetId);
    if (existingItem) {
      setFeedback({ message: 'Slot already occupied!', type: 'error' });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    const newPlacements = { ...placements, [itemId]: targetId };
    setPlacements(newPlacements);
    setSelectedItemId(null);

    const correctPair = correctPairs.find((pair) => pair.itemId === itemId);
    const isCorrect = correctPair?.targetId === targetId;

    if (isCorrect) {
      setFeedback({ message: 'Correct! Great job.', type: 'success' });
    } else {
      setFeedback({ message: 'Not quite right. Try again.', type: 'error' });
    }

    setTimeout(() => setFeedback(null), 2500);
  };

  const handleItemTap = (itemId: string) => {
    setSelectedItemId(prev => prev === itemId ? null : itemId);
  };

  const handleTargetTap = (targetId: string) => {
    if (selectedItemId) {
      handleDrop(targetId, selectedItemId);
    }
  };

  const isItemPlaced = (itemId: string) => !!placements[itemId];
  const getItemInTarget = (targetId: string) => {
    const entry = Object.entries(placements).find(([_, target]) => target === targetId);
    return entry ? items.find((item) => item.id === entry[0]) : null;
  };

  const placedCount = Object.keys(placements).length;
  const totalItems = items.length;
  const progress = (placedCount / totalItems) * 100;

  return (
    <div className="space-y-4 sm:space-y-8 py-2 sm:py-4 select-none">
      <div className="text-center space-y-1 sm:space-y-2">
        <div className="flex items-center justify-center gap-2 text-foreground-secondary font-medium text-xs sm:text-sm uppercase tracking-widest">
          <span>Drag & Drop Challenge</span>
          <span>🎯</span>
        </div>
        {isTouchDevice && (
          <p className="text-[11px] sm:text-xs text-foreground-tertiary">
            Tap an item, then tap a slot to place it
          </p>
        )}
        <div className="w-full max-w-xs mx-auto h-1.5 bg-surface-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-sui-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Items Pool */}
      <div className="min-h-[80px] sm:min-h-[120px] z-10 relative flex items-center justify-center p-3 sm:p-6 bg-surface-secondary/50 rounded-2xl sm:rounded-3xl border border-[var(--border-subtle)] inner-shadow">
        <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center w-full">
          <AnimatePresence>
            {items.map((item) => {
              if (isItemPlaced(item.id)) return null;
              const isSelected = selectedItemId === item.id;

              // Touch device → tap-to-select mode. Desktop → drag mode.
              if (isTouchDevice) {
                return (
                  <motion.button
                    key={item.id}
                    layoutId={item.id}
                    type="button"
                    onClick={() => handleItemTap(item.id)}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: isSelected ? 1.05 : 1,
                      opacity: 1,
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className={`relative z-0 group px-3 sm:px-5 py-2 sm:py-3 rounded-xl border flex items-center gap-2 sm:gap-3 transition-colors ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-sui-accent shadow-lg ring-2 ring-sui-accent/40'
                        : 'bg-surface-elevated border-[var(--border-default)] shadow-sm hover:border-sui-accent/50'
                    }`}
                  >
                    <span className={`text-xl sm:text-2xl transition-all duration-300 ${isSelected ? 'grayscale-0' : 'filter grayscale group-hover:grayscale-0'}`}>
                      {item.emoji}
                    </span>
                    <span className={`font-bold font-mono text-xs sm:text-sm ${isSelected ? 'text-white' : 'text-foreground-secondary'}`}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              }

              // Desktop: drag-and-drop
              return (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  drag
                  dragSnapToOrigin
                  dragElastic={0.1}
                  dragMomentum={false}
                  onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
                  whileHover={{ scale: 1.05, cursor: "grab" }}
                  whileDrag={{ scale: 1.15, cursor: "grabbing", zIndex: 100, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)" }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative z-0 group px-5 py-3 bg-surface-elevated rounded-xl border border-[var(--border-default)] shadow-sm flex items-center gap-3 hover:border-sui-accent/50 transition-colors"
                >
                  <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-300">{item.emoji}</span>
                  <span className="font-bold text-foreground-secondary font-mono text-sm">{item.label}</span>
                  <div className="flex flex-col gap-0.5 opacity-20 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <div className="w-1 h-1 bg-black rounded-full" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {items.every(item => isItemPlaced(item.id)) && (
            <div className="text-zinc-400 italic text-sm">All items placed!</div>
          )}
        </div>
      </div>

      {/* Drop Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 relative z-0">
        {targets.map((target) => {
          const placedItem = getItemInTarget(target.id);
          const isAwaitingPlacement = isTouchDevice && selectedItemId && !placedItem;

          return (
            <button
              key={target.id}
              type="button"
              ref={(el) => { dropZoneRefs.current[target.id] = el; }}
              onClick={isTouchDevice ? () => handleTargetTap(target.id) : undefined}
              disabled={!isAwaitingPlacement && isTouchDevice && !placedItem}
              className={`relative overflow-hidden group min-h-[88px] sm:min-h-[140px] p-3 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 sm:gap-4 text-left ${
                placedItem
                  ? 'border-[var(--border-default)] bg-surface-elevated cursor-default'
                  : isAwaitingPlacement
                    ? 'border-sui-accent bg-sui-accent/5 cursor-pointer ring-2 ring-sui-accent/30 animate-pulse'
                    : 'border-dashed border-[var(--border-default)] bg-surface-secondary/30'
              }`}
            >
              <h4 className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${placedItem ? 'text-foreground-tertiary' : 'text-foreground-secondary'}`}>
                {target.label}
              </h4>

              <AnimatePresence mode="wait">
                {placedItem ? (
                  <motion.div
                    layoutId={placedItem.id}
                    key={placedItem.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-zinc-900 text-white rounded-xl shadow-xl"
                  >
                    <span className="text-base sm:text-xl">{placedItem.emoji}</span>
                    <span className="font-bold font-mono text-xs sm:text-base">{placedItem.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPlacements = { ...placements };
                        delete newPlacements[placedItem.id];
                        setPlacements(newPlacements);
                      }}
                      className="ml-1 sm:ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ) : (
                  <div className="p-2 sm:p-4 rounded-full transition-colors bg-surface-secondary">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-foreground-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Floating Feedback Toast — raised on mobile so it doesn't collide with the AI tutor button */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center gap-2 sm:gap-3 shadow-2xl border z-50 ${feedback.type === 'success'
                ? 'bg-zinc-900 text-white border-zinc-800'
                : 'bg-surface-elevated text-foreground border-red-100'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${feedback.type === 'success' ? 'bg-sui-accent' : 'bg-red-500 animate-pulse'}`} />
            <span className="font-bold text-xs sm:text-sm">{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
