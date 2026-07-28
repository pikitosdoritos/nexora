"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dead: boolean;
  flicker: number;
}

/**
 * A 2D canvas network. `integrity` (0..1) controls how healthy it looks:
 * below 1, nodes shake, lose links, and drop out — the risk lab's collapse.
 * `illumination` brightens links for the finale. Rendering pauses off-screen.
 */
export function NetworkField({
  integrity = 1,
  illumination = 0.5,
  density = 46,
  className,
}: {
  integrity?: number;
  illumination?: number;
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ integrity, illumination });
  const reduced = useReducedMotion();

  stateRef.current.integrity = integrity;
  stateRef.current.illumination = illumination;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let visible = true;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];

    const styles = getComputedStyle(document.documentElement);
    const cyan = `rgb(${styles.getPropertyValue("--cyan").trim().split(" ").join(",")})`;
    const violet = `rgb(${styles.getPropertyValue("--violet").trim().split(" ").join(",")})`;
    const fall = "rgb(255,107,122)";

    const seedNodes = () => {
      nodes = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        dead: false,
        flicker: Math.random(),
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) seedNodes();
    };

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const { integrity: integ, illumination: illum } = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      const linkDist = Math.min(width, height) * 0.28;
      const damageShake = (1 - integ) * 2.4;
      const aliveTarget = Math.round(density * (0.35 + integ * 0.65));

      nodes.forEach((n, i) => {
        n.dead = i >= aliveTarget;
        if (n.dead) return;
        if (!reduced) {
          n.x += n.vx + (Math.random() - 0.5) * damageShake;
          n.y += n.vy + (Math.random() - 0.5) * damageShake;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          n.x = Math.max(0, Math.min(width, n.x));
          n.y = Math.max(0, Math.min(height, n.y));
        }
      });

      // Links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (a.dead) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          if (b.dead) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > linkDist) continue;
          // Damaged networks randomly drop links
          if (integ < 0.999 && (a.flicker + b.flicker + Math.sin(t * 0.003 + i)) % 1 > integ) continue;
          const alpha = (1 - dist / linkDist) * (0.1 + illum * 0.3);
          ctx.strokeStyle = integ < 0.55 ? fall : violet;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Nodes
      nodes.forEach((n) => {
        if (n.dead) return;
        ctx.globalAlpha = 0.55 + illum * 0.45;
        ctx.fillStyle = integ < 0.55 && n.flicker > integ ? fall : cyan;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.8 + illum * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, [density, reduced]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
