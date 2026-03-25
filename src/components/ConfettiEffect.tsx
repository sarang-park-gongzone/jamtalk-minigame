import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

interface ConfettiEffectProps {
  active: boolean;
  intensity?: 'small' | 'large';
  colors?: string[];
}

const DEFAULT_COLORS = ['#6C5CE7', '#00CEC9', '#FD79A8', '#FDCB6E', '#FFD700', '#C0C0C0'];

export default function ConfettiEffect({
  active,
  intensity = 'small',
  colors = DEFAULT_COLORS,
}: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to parent
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    // Create particles
    const count = intensity === 'large' ? 100 : 30;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width * Math.random(),
        y: intensity === 'large' ? -20 * Math.random() : canvas.height * 0.3 * Math.random(),
        vx: (Math.random() - 0.5) * 6,
        vy: intensity === 'large'
          ? Math.random() * 2 + 1
          : -(Math.random() * 4 + 2),
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }
    particlesRef.current = particles;

    let startTime = performance.now();
    const duration = intensity === 'large' ? 3000 : 1500;

    function animate(now: number) {
      if (!ctx || !canvas) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.vy += 0.15; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - progress * 0.8);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, intensity, colors]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-40 pointer-events-none"
    />
  );
}
