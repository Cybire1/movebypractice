'use client';

import { useRef } from 'react';
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame
} from 'framer-motion';

export const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface ParallaxProps {
    children: string;
    baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });

    /**
     * This is a magic wrapping for the length of the text - you
     * have to replace for wrapping that works for you or dynamically
     * calculate
     */
    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        /**
         * This is what changes the direction of the scroll once we
         * switch scrolling directions.
         */
        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    /**
     * The number of times to repeat the child text should be dynamically calculated
     * based on the size of the text and viewport. Likewise, the x motion value is
     * currently wrapped between -20 and -45% - this 25% is derived from the fact
     * that we have four children (100% / 4). This would also want leading from the
     * dynamically calculated number of children.
     */
    return (
        <div className="parallax">
            <motion.div className="scroller" style={{ x }}>
                {/* Repeat enough times to cover screen and then some for wrapping */}
                <span>{children} </span>
                <span>{children} </span>
                <span>{children} </span>
                <span>{children} </span>
                <span>{children} </span>
                <span>{children} </span>
                <span>{children} </span>
                <span>{children} </span>
            </motion.div>
        </div>
    );
}

export default function VelocityScroll() {
    return (
        <section className="relative w-full py-12 md:py-24 bg-white overflow-hidden flex flex-col justify-center items-center border-b border-gray-100/50">

            {/* Background Polish */}
            <div className="absolute inset-0 bg-grid-graph opacity-30 pointer-events-none" />

            <div className="w-full relative z-10 mix-blend-difference text-white">
                <ParallaxText baseVelocity={2}>
                    MASTER MOVE • SHIP ON SUI • BUILD THE FUTURE •
                </ParallaxText>
                <div className="h-4 md:h-12" /> {/* Spacing */}
                <ParallaxText baseVelocity={-2}>
                    FASTEST L1 • SECURE SMART CONTRACTS • ON-CHAIN •
                </ParallaxText>
            </div>

            <style jsx>{`
        .parallax {
          overflow: hidden;
          letter-spacing: -2px;
          line-height: 0.85;
          margin: 0;
          white-space: nowrap;
          display: flex;
          flex-wrap: nowrap;
        }

        .scroller {
          font-weight: 900;
          text-transform: uppercase;
          font-size: 64px;
          display: flex;
          white-space: nowrap;
          display: flex;
          flex-wrap: nowrap;
        }
        
        @media (min-width: 768px) {
            .scroller {
                font-size: 128px;
            }
        }

        .scroller span {
          display: block;
          margin-right: 30px;
          color: #111; /* Dark text for contrast against white bg */
        }
      `}</style>
        </section>
    );
}
