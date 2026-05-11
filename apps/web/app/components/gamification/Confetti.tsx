'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  show: boolean;
  duration?: number;
}

export default function Confetti({ show, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number }>>([]);

  useEffect(() => {
    if (show) {
      const colors = ['#6FBCF0', '#4DA2D9', '#4CA3D9', '#0A2540', '#E5F3FF'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      }));

      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
      }, duration);
    }
  }, [show, duration]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: particle.color,
            left: `${particle.x}%`,
          }}
          initial={{
            y: particle.y,
            opacity: 1,
            rotate: particle.rotation,
          }}
          animate={{
            y: window.innerHeight + 100,
            opacity: 0,
            rotate: particle.rotation + 360,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}
