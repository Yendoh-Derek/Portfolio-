"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CursorEffect() {
    const [isMobile, setIsMobile] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for the cursor follower
    const springConfig = { damping: 25, stiffness: 700 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        // Detect mobile - disable cursor effect on touch devices to save performance/ux
        const checkMobile = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", moveMouse);
        return () => {
            window.removeEventListener("mousemove", moveMouse);
            window.removeEventListener("resize", checkMobile);
        };
    }, [mouseX, mouseY]);

    if (isMobile) return null;

    return (
        <div className="hidden md:block fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* The "Torch" Light Source */}
            <motion.div
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                className="absolute w-[600px] h-[600px] bg-primary/15 rounded-full blur-[100px] mix-blend-screen"
            />

            {/* Secondary Accent Glow (smaller, tighter) */}
            <motion.div
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                className="absolute w-[200px] h-[200px] bg-accent/10 rounded-full blur-[50px] mix-blend-screen"
            />
        </div>
    );
}
