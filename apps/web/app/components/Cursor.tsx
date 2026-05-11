"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        const moveCursor = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const animate = () => {
            const dt = 1.0 - Math.pow(1.0 - 0.2, 1); // Helper for smooth lerp

            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;

            if (cursor) {
                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            }

            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', moveCursor);
        const animationId = requestAnimationFrame(animate);

        // Hover States
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.getAttribute('data-cursor') === 'hover' || target.closest('[data-cursor="hover"]')) {
                cursor.classList.add('hovered');
            } else {
                cursor.classList.remove('hovered');
            }
        };

        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div ref={cursorRef} className="hidden md:block cursor-dot fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference" />
    );
}
