"use client";

import { useEffect, useRef } from "react";

interface Particle {
  angle: number;
  baseRadius: number;
  size: number;
  speed: number;
  depth: number;
  vx: number;
  vy: number;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const particleCount = isMobile ? 180 : 480;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    particlesRef.current = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const baseRadius = 80 + Math.random() * 280;

      return {
        angle,
        baseRadius,
        size: Math.random() * 1.8 + 0.3,
        speed: (Math.random() - 0.5) * 0.0006 + 0.00015,
        depth: Math.random(),
        vx: 0,
        vy: 0,
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isActive = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let isVisible = !document.hidden;

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    const draw = () => {
      if (!isVisible) return;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
      ctx.fillRect(0, 0, w, h);

      const centerX = w * 0.65;
      const centerY = h * 0.5;

      timeRef.current += 1;

      particlesRef.current.forEach((p) => {
        const angle = p.angle + timeRef.current * p.speed;
        const depthScale = 0.4 + p.depth * 0.6;
        const rx = p.baseRadius * depthScale;
        const ry = p.baseRadius * depthScale * 0.65;

        let x = centerX + Math.cos(angle) * rx;
        let y = centerY + Math.sin(angle) * ry;

        if (mouseRef.current.isActive) {
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const force = Math.pow(1 - distance / 150, 2) * 0.8;
            const repulsionAngle = Math.atan2(dy, dx);

            p.vx += Math.cos(repulsionAngle) * force * 0.4;
            p.vy += Math.sin(repulsionAngle) * force * 0.4;
          }
        }

        p.vx *= 0.88;
        p.vy *= 0.88;

        x += p.vx;
        y += p.vy;

        const maxDist = Math.sqrt(rx * rx + ry * ry) + 100;
        const distFromCenter = Math.sqrt(
          (x - centerX) ** 2 + (y - centerY) ** 2,
        );
        if (distFromCenter > maxDist) {
          const pullForce = (distFromCenter - maxDist) * 0.02;
          const pullAngle = Math.atan2(y - centerY, x - centerX);
          x -= Math.cos(pullAngle) * pullForce;
          y -= Math.sin(pullAngle) * pullForce;
        }

        const gradientPos = (y - (centerY - Math.max(ry))) / (Math.max(ry) * 2);
        let color: string;

        if (gradientPos < 0.35) {
          const t = gradientPos / 0.35;
          const intensity = 0.25 + p.depth * 0.55;
          color = `rgba(${Math.round(96 + t * 30)}, ${Math.round(125 + t * 40)}, ${Math.round(240 - t * 60)}, ${intensity})`;
        } else if (gradientPos < 0.65) {
          const t = (gradientPos - 0.35) / 0.3;
          const intensity = 0.25 + p.depth * 0.55;
          color = `rgba(${Math.round(168 - t * 20)}, ${Math.round(85 + t * 30)}, ${Math.round(220 - t * 30)}, ${intensity})`;
        } else {
          const t = Math.min(1, (gradientPos - 0.65) / 0.35);
          const intensity = 0.25 + p.depth * 0.55;
          color = `rgba(${Math.round(249 - t * 50)}, ${Math.round(115 - t * 50)}, ${Math.round(22 + t * 30)}, ${intensity})`;
        }

        ctx.beginPath();
        ctx.fillStyle = color;

        const particleSize = p.size * (0.8 + p.depth * 1.2);
        const softness = Math.max(2, particleSize * 0.45);

        ctx.roundRect(
          x - particleSize / 2,
          y - particleSize / 2,
          particleSize,
          particleSize,
          softness,
        );
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl bg-violet-600/20 opacity-60" />
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-95"
      />

      <div className="absolute inset-0 md:hidden bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
