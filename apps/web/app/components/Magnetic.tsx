"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

export default function Magnetic({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        if (ref.current) {
            const { height, width, left, top } = ref.current.getBoundingClientRect();
            const xVal = clientX - (left + width / 2);
            const yVal = clientY - (top + height / 2);
            x.set(xVal * 0.35);
            y.set(yVal * 0.35);
        }
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: mouseX, y: mouseY }}
            className="inline-block"
        >
            {children}
        </motion.div>
    );
}
