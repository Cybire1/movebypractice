'use client';

import { MouseEvent } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`group relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 mix-blend-multiply"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(37, 99, 235, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            {children}
        </div>
    );
}
