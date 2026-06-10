"use client";

import { useEffect, useRef } from "react";

export function FloatingSigils() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let isVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) draw();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const neuralLayers = [3, 5, 4, 2];
    const neuralNodes: { x: number; y: number; layer: number }[] = [];

    // 2. Circuit Board Nodes & Paths
    const circuitNodes: { x: number; y: number; connectedTo: number[] }[] = [];
    const pulses: {
      x: number;
      y: number;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      progress: number;
      speed: number;
      color: string;
      type: "neural" | "circuit";
    }[] = [];

    function initNarrative() {
      neuralNodes.length = 0;
      circuitNodes.length = 0;
      pulses.length = 0;

      const isMobile = window.innerWidth < 768;

      // Generate Neural Net Motif in the middle-left area
      const startX = isMobile ? w * 0.1 : w * 0.15;
      const startY = h * 0.35;
      const layerSpacing = isMobile ? w * 0.18 : w * 0.08;
      const nodeSpacing = isMobile ? 40 : 55;

      neuralLayers.forEach((count, lIdx) => {
        const lx = startX + lIdx * layerSpacing;
        const totalHeight = (count - 1) * nodeSpacing;
        const layerStartY = startY - totalHeight / 2;

        for (let i = 0; i < count; i++) {
          neuralNodes.push({
            x: lx,
            y: layerStartY + i * nodeSpacing,
            layer: lIdx,
          });
        }
      });

      // Generate Circuit Board Motif in top-right and bottom-right areas
      // Top Right terminal
      const trX = isMobile ? w * 0.85 : w * 0.8;
      const trY = h * 0.25;
      circuitNodes.push({ x: trX, y: trY, connectedTo: [1, 2] });
      circuitNodes.push({
        x: trX - (isMobile ? 40 : 80),
        y: trY + 40,
        connectedTo: [3],
      });
      circuitNodes.push({
        x: trX + (isMobile ? 30 : 60),
        y: trY + 60,
        connectedTo: [],
      });
      circuitNodes.push({
        x: trX - (isMobile ? 40 : 80),
        y: trY + 120,
        connectedTo: [4],
      });
      circuitNodes.push({ x: trX, y: trY + 160, connectedTo: [] });

      // Bottom Left terminal
      const blX = isMobile ? w * 0.75 : w * 0.75;
      const blY = h * 0.7;
      circuitNodes.push({ x: blX, y: blY, connectedTo: [6, 7] });
      circuitNodes.push({ x: blX - 50, y: blY - 50, connectedTo: [] });
      circuitNodes.push({ x: blX + 70, y: blY + 40, connectedTo: [8] });
      circuitNodes.push({ x: blX + 70, y: blY - 30, connectedTo: [] });
    }

    initNarrative();

    // Spawn a pulse along a neural connection or circuit path
    function spawnPulse() {
      if (Math.random() < 0.5 && neuralNodes.length > 0) {
        const fromNodeIdx = Math.floor(Math.random() * neuralNodes.length);
        const fromNode = neuralNodes[fromNodeIdx];
        const nextLayerNodes = neuralNodes.filter(
          (n) => n.layer === fromNode.layer + 1,
        );

        if (nextLayerNodes.length > 0) {
          const toNode =
            nextLayerNodes[Math.floor(Math.random() * nextLayerNodes.length)];
          pulses.push({
            x: fromNode.x,
            y: fromNode.y,
            startX: fromNode.x,
            startY: fromNode.y,
            endX: toNode.x,
            endY: toNode.y,
            progress: 0,
            speed: 0.006 + Math.random() * 0.01,
            color: "rgba(138, 43, 226, 0.45)", // Primary glow
            type: "neural",
          });
        }
      } else if (circuitNodes.length > 0) {
        const fromIdx = Math.floor(Math.random() * circuitNodes.length);
        const fromNode = circuitNodes[fromIdx];
        if (fromNode.connectedTo.length > 0) {
          const toIdx =
            fromNode.connectedTo[
              Math.floor(Math.random() * fromNode.connectedTo.length)
            ];
          const toNode = circuitNodes[toIdx];
          pulses.push({
            x: fromNode.x,
            y: fromNode.y,
            startX: fromNode.x,
            startY: fromNode.y,
            endX: toNode.x,
            endY: toNode.y,
            progress: 0,
            speed: 0.004 + Math.random() * 0.008,
            color: "rgba(0, 240, 255, 0.45)", // Accent glow
            type: "circuit",
          });
        }
      }
    }

    let frame = 0;

    function draw() {
      if (!isVisible) return;
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // 1. Subtle Background Circuit blueprint grid (dots) at 1% opacity
      ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
      const dotSpacing = 36;
      for (let x = 0; x < w; x += dotSpacing) {
        for (let y = 0; y < h; y += dotSpacing) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // 2. Draw Neural connections line grid at 4% opacity
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(138, 43, 226, 0.04)";
      for (let i = 0; i < neuralNodes.length; i++) {
        const n1 = neuralNodes[i];
        for (let j = i + 1; j < neuralNodes.length; j++) {
          const n2 = neuralNodes[j];
          if (n2.layer === n1.layer + 1) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw Neural Nodes (Terminals) at 6% opacity
      neuralNodes.forEach((n) => {
        ctx.fillStyle = "rgba(138, 43, 226, 0.06)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Faint outer halo ring
        ctx.strokeStyle = "rgba(138, 43, 226, 0.03)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 4. Draw Circuit board path lines at 4% opacity
      ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
      circuitNodes.forEach((n) => {
        n.connectedTo.forEach((toIdx) => {
          const target = circuitNodes[toIdx];
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);

          // Structured orthogonal routing
          const midX = (n.x + target.x) / 2;
          ctx.lineTo(midX, n.y);
          ctx.lineTo(midX, target.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });
      });

      // 5. Draw Circuit board node endpoints at 6% opacity
      circuitNodes.forEach((n) => {
        ctx.fillStyle = "rgba(0, 240, 255, 0.06)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(0, 240, 255, 0.03)";
        ctx.strokeRect(n.x - 3, n.y - 3, 6, 6);
      });

      // 6. Draw running signal pulses at 8% opacity
      pulses.forEach((p, idx) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          pulses.splice(idx, 1);
          return;
        }

        // Interpolate pulse position
        if (p.type === "neural") {
          p.x = p.startX + (p.endX - p.startX) * p.progress;
          p.y = p.startY + (p.endY - p.startY) * p.progress;
        } else {
          // Orthogonal path tracking
          const midX = (p.startX + p.endX) / 2;
          if (p.progress < 0.5) {
            const localProg = p.progress * 2;
            p.x = p.startX + (midX - p.startX) * localProg;
            p.y = p.startY;
          } else if (p.progress < 0.8) {
            const localProg = (p.progress - 0.5) / 0.3;
            p.x = midX;
            p.y = p.startY + (p.endY - p.startY) * localProg;
          } else {
            const localProg = (p.progress - 0.8) / 0.2;
            p.x = midX + (p.endX - midX) * localProg;
            p.y = p.endY;
          }
        }

        // Draw pulse glow gradient
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.4, p.color.replace("0.45", "0.15"));
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Faint center core
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      frame++;
      if (frame % 45 === 0 && pulses.length < 12) {
        spawnPulse();
      }

      requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initNarrative();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    />
  );
}
