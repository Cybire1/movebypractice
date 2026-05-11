'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function CinematicScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Scroll progress for the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Smooth scrubbing physics
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, 63]);
    const smoothFrame = useSpring(frameIndex, { stiffness: 50, damping: 20 });

    // Text Animations - Multi-stage narrative
    // Stage 1: Intro
    const textKp1_Opacity = useTransform(scrollYProgress, [0.1, 0.25, 0.35], [0, 1, 0]);
    const textKp1_Y = useTransform(scrollYProgress, [0.1, 0.35], [20, -20]);

    // Stage 2: Value Prop
    const textKp2_Opacity = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 1, 0]);
    const textKp2_Y = useTransform(scrollYProgress, [0.35, 0.65], [20, -20]);

    // Stage 3: Call to Action
    const textKp3_Opacity = useTransform(scrollYProgress, [0.65, 0.8, 0.95], [0, 1, 0]);
    const textKp3_Y = useTransform(scrollYProgress, [0.65, 0.95], [20, -20]);


    // Resize Observer for robust sizing
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setCanvasSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }
        };

        // Initial size
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Preload Images
    useEffect(() => {
        let loadedCount = 0;
        const totalFrames = 64;
        const loadedImages: HTMLImageElement[] = [];

        const loadImages = async () => {
            for (let i = 1; i <= totalFrames; i++) {
                const img = new Image();
                const paddedIndex = i.toString().padStart(3, '0');
                img.src = `/sequences/boy/ezgif-frame-${paddedIndex}.jpg`;

                await new Promise((resolve) => {
                    img.onload = () => {
                        loadedCount++;
                        setLoadProgress((loadedCount / totalFrames) * 100);
                        resolve(true);
                    };
                    img.onerror = () => {
                        resolve(true);
                    }
                });
                loadedImages[i - 1] = img;
            }
            setImages(loadedImages);
            setIsLoaded(true);
        };

        loadImages();
    }, []);

    // Render Loop
    useEffect(() => {
        if (!isLoaded || images.length === 0 || !canvasRef.current || canvasSize.width === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;

        canvas.width = canvasSize.width * dpr;
        canvas.height = canvasSize.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const render = () => {
            const idx = Math.min(
                Math.max(Math.round(smoothFrame.get()), 0),
                images.length - 1
            );

            const img = images[idx];
            if (img) {
                const w = canvasSize.width;
                const h = canvasSize.height;
                const imgRatio = img.width / img.height;
                const canvasRatio = w / h;

                let drawW, drawH, offsetX, offsetY;

                if (canvasRatio > imgRatio) {
                    drawW = w;
                    drawH = w / imgRatio;
                    offsetX = 0;
                    offsetY = (h - drawH) / 2;
                } else {
                    drawH = h;
                    drawW = h * imgRatio;
                    offsetX = (w - drawW) / 2;
                    offsetY = 0;
                }

                ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
            }

            requestAnimationFrame(render);
        };

        const animationId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationId);

    }, [isLoaded, images, smoothFrame, canvasSize]);


    return (
        <div ref={containerRef} className="relative h-[500vh] bg-white">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-white">

                {/* Loading Spinner */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-mono tracking-widest text-zinc-400">LOADING EXPERIENCE</p>
                        </div>
                    </div>
                )}

                {/* The Frame Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className={`relative w-[90%] md:w-[94%] h-[85%] md:h-[90%] overflow-hidden rounded-[2rem] shadow-2xl shadow-zinc-200/50 bg-gray-100 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                >
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full object-cover"
                    />

                    {/* Overlay Content - Sides */}
                    <div className="absolute inset-0 z-20 pointer-events-none">

                        {/* Slide 1: Introduction (Left) */}
                        <motion.div
                            style={{ opacity: textKp1_Opacity, y: textKp1_Y }}
                            className="absolute bottom-20 left-6 md:left-16 text-left max-w-xl"
                        >
                            <div className="inline-block px-4 py-2 mb-6 border border-white/20 rounded-full bg-black/10 backdrop-blur-xl">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">
                                    The Next Generation
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.85] shadow-black/20 drop-shadow-2xl">
                                Build for <br />
                                Billions.
                            </h2>
                        </motion.div>

                        {/* Slide 2: Value Prop (Right) */}
                        <motion.div
                            style={{ opacity: textKp2_Opacity, y: textKp2_Y }}
                            className="absolute bottom-20 right-6 md:right-16 text-right max-w-xl flex flex-col items-end"
                        >
                            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.9] drop-shadow-2xl">
                                Secure. <br />
                                <span className="text-blue-200">Scalable.</span> <br />
                                Move.
                            </h2>
                            <p className="text-white/90 text-lg md:text-xl font-medium max-w-md leading-relaxed drop-shadow-md">
                                Master the language of the future blockchain.
                            </p>
                        </motion.div>

                        {/* Slide 3: Action (Left) */}
                        <motion.div
                            style={{ opacity: textKp3_Opacity, y: textKp3_Y }}
                            className="absolute bottom-20 left-6 md:left-16 text-left max-w-xl"
                        >
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9] drop-shadow-2xl">
                                Your Journey <br />
                                Starts Here.
                            </h2>
                        </motion.div>

                    </div>

                    {/* Subtle Inner Border/Bezel */}
                    <div className="absolute inset-0 border-[1px] border-white/10 rounded-[2rem] pointer-events-none z-30 mix-blend-overlay"></div>
                </motion.div>

            </div>
        </div>
    );
}
