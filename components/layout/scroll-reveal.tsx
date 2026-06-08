"use client";

import { motion, useInView, useAnimation, Variant } from "framer-motion";
import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  width = "100%",
  className,
  delay = 0.2,
  direction = "up",
  distance = 40,
  duration = 0.8,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    } else if (!once) {
      mainControls.start("hidden");
    }
  }, [isInView, mainControls, once]);

  const getVariants = () => {
    const hidden: any = { opacity: 0 };
    const visible: any = { 
      opacity: 1,
      transition: { 
        duration, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    };

    switch (direction) {
      case "up":
        hidden.y = distance;
        visible.y = 0;
        break;
      case "down":
        hidden.y = -distance;
        visible.y = 0;
        break;
      case "left":
        hidden.x = distance;
        visible.x = 0;
        break;
      case "right":
        hidden.x = -distance;
        visible.x = 0;
        break;
    }

    return { hidden, visible };
  };

  return (
    <div 
      ref={ref} 
      style={{ position: "relative", width, overflow: "visible" }} 
      className={className}
    >
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={mainControls}
      >
        {children}
      </motion.div>
    </div>
  );
}
