import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  depth: number;
  hue: number;
  phase: number;
}

interface Pulse {
  x: number;
  y: number;
  age: number;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isCompactScreen = () => window.innerWidth < 720;
const isMidScreen = () => window.innerWidth < 1200;
const particleEffectsStorageKey = 'personal-universe-particle-effects';
const particleEffectsEvent = 'personal-universe-particle-effects-change';

const getParticleEffectsEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(particleEffectsStorageKey) === 'on';
};

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEnabled, setIsEnabled] = useState(getParticleEffectsEnabled);

  useEffect(() => {
    const syncSetting = () => setIsEnabled(getParticleEffectsEnabled());

    window.addEventListener('storage', syncSetting);
    window.addEventListener(particleEffectsEvent, syncSetting);

    return () => {
      window.removeEventListener('storage', syncSetting);
      window.removeEventListener(particleEffectsEvent, syncSetting);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isEnabled) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTime = performance.now();
    let lastDrawTime = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let scrollDocHeight = document.documentElement.scrollHeight;
    let interactionBoost = 0;
    let gradientCache: CanvasGradient | null = null;
    const reducedMotion = prefersReducedMotion();
    const particles: Particle[] = [];
    const pulses: Pulse[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const particleCount = () => {
      if (reducedMotion) return 22;
      if (isCompactScreen()) return 32;
      if (isMidScreen()) return 50;
      return 62;
    };

    const linkLimit = () => {
      if (reducedMotion) return 18;
      if (isCompactScreen()) return 28;
      if (isMidScreen()) return 42;
      return 54;
    };

    const targetInterval = () => {
      if (reducedMotion) return 80;
      if (interactionBoost > 0.08 || pulses.length > 0) return 24;
      return isCompactScreen() ? 52 : 44;
    };

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      size: 0.8 + Math.random() * 1.8,
      depth: 0.45 + Math.random() * 1.2,
      hue: [204, 226, 258, 282][Math.floor(Math.random() * 4)],
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, isCompactScreen() ? 1 : 1.15);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      gradientCache = null;

      const nextCount = particleCount();
      while (particles.length < nextCount) particles.push(createParticle());
      particles.length = nextCount;
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      interactionBoost = 1;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const updateScrollCache = () => {
      scrollDocHeight = document.documentElement.scrollHeight;
    };

    const addPulse = (x: number, y: number) => {
      pulses.push({ x, y, age: 0 });
      if (pulses.length > 3) pulses.shift();
      interactionBoost = 1;
    };

    const handlePointerDown = (event: PointerEvent) => addPulse(event.clientX, event.clientY);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        return;
      }

      lastTime = performance.now();
      lastDrawTime = 0;
      animationFrame = requestAnimationFrame(draw);
    };

    const drawBackground = (hueShift: number) => {
      if (!gradientCache) {
        gradientCache = context.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.52, Math.max(width, height) * 0.82);
        gradientCache.addColorStop(0, 'rgb(18, 27, 54)');
        gradientCache.addColorStop(0.52, 'rgb(7, 10, 27)');
        gradientCache.addColorStop(1, 'rgb(2, 3, 11)');
      }

      context.fillStyle = gradientCache;
      context.fillRect(0, 0, width, height);

      context.globalAlpha = 0.1;
      context.fillStyle = 'hsl(' + (220 + hueShift) + ', 95%, 72%)';
      context.beginPath();
      context.arc(width * 0.18, height * 0.22, Math.min(width, height) * 0.2, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'hsl(' + (275 + hueShift) + ', 85%, 70%)';
      context.beginPath();
      context.arc(width * 0.82, height * 0.68, Math.min(width, height) * 0.24, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
    };

    const draw = (time: number) => {
      if (document.hidden) return;

      if (time - lastDrawTime < targetInterval()) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      const delta = Math.min(46, time - lastTime);
      lastTime = time;
      lastDrawTime = time;
      interactionBoost *= 0.92;

      const scrollDelta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      scrollVelocity += (scrollDelta - scrollVelocity) * 0.05;
      const scrollMax = scrollDocHeight - height;
      const scrollProgress = scrollMax > 0
        ? window.scrollY / scrollMax
        : 0;
      const hueShift = Math.sin(scrollProgress * Math.PI * 2) * 10;

      drawBackground(hueShift);

      for (const particle of particles) {
        if (!reducedMotion) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distanceSquared = dx * dx + dy * dy;
          const influenceRadius = 128;
          if (pointer.active && distanceSquared < influenceRadius * influenceRadius) {
            const distance = Math.sqrt(distanceSquared) || 1;
            const force = (1 - distance / influenceRadius) * 0.024 * particle.depth;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }

          for (const pulse of pulses) {
            const pdx = particle.x - pulse.x;
            const pdy = particle.y - pulse.y;
            const pdSquared = pdx * pdx + pdy * pdy;
            const radius = 36 + pulse.age * 420;
            const band = 44;
            if (pdSquared > (radius - band) * (radius - band) && pdSquared < (radius + band) * (radius + band)) {
              const pd = Math.sqrt(pdSquared) || 1;
              const force = (1 - Math.abs(pd - radius) / band) * 0.042;
              particle.vx += (pdx / pd) * force;
              particle.vy += (pdy / pd) * force;
            }
          }

          particle.vx += Math.cos(time * 0.00016 + particle.phase) * 0.0011 * particle.depth;
          particle.vy += Math.sin(time * 0.00014 + particle.phase) * 0.0011 * particle.depth;
          particle.x += (particle.vx + scrollVelocity * 0.0009 * particle.depth) * delta;
          particle.y += (particle.vy + Math.sin(scrollProgress * Math.PI) * 0.0045 * particle.depth) * delta;
          particle.vx *= 0.982;
          particle.vy *= 0.982;
        }

        const margin = 70;
        if (particle.x < -margin) particle.x = width + margin;
        if (particle.x > width + margin) particle.x = -margin;
        if (particle.y < -margin) particle.y = height + margin;
        if (particle.y > height + margin) particle.y = -margin;
      }

      const maxLinks = linkLimit();
      let links = 0;
      for (let i = 0; i < particles.length && links < maxLinks; i += 2) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length && links < maxLinks; j += 3) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const maxDistance = 88 * Math.min(a.depth, b.depth);
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < maxDistance * maxDistance) {
            const alpha = (1 - Math.sqrt(distanceSquared) / maxDistance) * 0.1;
            context.strokeStyle = 'hsla(' + (220 + hueShift) + ', 88%, 74%, ' + alpha + ')';
            context.lineWidth = 0.55;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
            links += 1;
          }
        }
      }

      for (const particle of particles) {
        context.fillStyle = 'hsla(' + (particle.hue + hueShift) + ', 96%, 76%, ' + clamp(0.42 + particle.depth * 0.2, 0.45, 0.72) + ')';
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * particle.depth, 0, Math.PI * 2);
        context.fill();
      }

      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        const pulse = pulses[i];
        pulse.age += delta / 1000;
        const radius = 36 + pulse.age * 420;
        const alpha = Math.max(0, 0.42 - pulse.age * 0.58);
        context.strokeStyle = 'rgba(148, 204, 255, ' + alpha + ')';
        context.lineWidth = 1.25;
        context.beginPath();
        context.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
        context.stroke();
        if (alpha <= 0) pulses.splice(i, 1);
      }

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScrollCache, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScrollCache);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled]);

  return <canvas ref={canvasRef} className={isEnabled ? 'particle-field' : 'particle-field particle-field-disabled'} aria-hidden="true" />;
}
