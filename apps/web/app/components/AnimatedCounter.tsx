'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
}

export default function AnimatedCounter({ from, to, duration = 2, suffix = '' }: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    if (suffix === 's' || suffix === 'min') {
      return Math.round(latest);
    }
    return Math.round(latest);
  });

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [count, to, duration]);

  return (
    <motion.span>
      {suffix === 's' || suffix === 'min' ? (
        <motion.span>{rounded}</motion.span>
      ) : (
        <motion.span>{rounded}</motion.span>
      )}
      {suffix}
    </motion.span>
  );
}
