import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface HeroIntelligenceCoreProps {
  onNodeHovered?: string | null;
  interactiveEnergy?: number;
  style?: React.CSSProperties;
  onIntroComplete?: () => void;
  onLogoHoverChange?: (isHovered: boolean) => void;
  /** Fired the moment a meltwater drop detaches from a logo tip (1 = left, 2 = right). */
  onDrip?: (tip: 1 | 2) => void;
}

type Tip = 1 | 2;

const LOGO_SRC = '/hero-3d-glass-logo-brandblue.png';
const BOX = 340;

// Melt channels: measured from the logo PNG's alpha silhouette (340×340 box), inset ~4px so the
// water rides the outer rim. Left: down the left face, round the corner, along the lower diagonal
// to the bottom vertex. Right mirrors it.
const MELT: Record<Tip, { d: string; tip: { x: number; y: number } }> = {
  1: { d: 'M 24 170 L 24 262 Q 24 268 29 271 L 112 324', tip: { x: 113.4, y: 326.4 } },
  2: { d: 'M 316 170 L 316 262 Q 316 268 311 271 L 226 325', tip: { x: 224.2, y: 327.6 } },
};

// Centre of the logo's hollow, where the two blocks interlock.
const HUB = { x: 171, y: 199 };

// Outer vertices that catch the light at impact.
const GLINTS: Array<{ x: number; y: number; s: number; delay: number }> = [
  { x: 163, y: 14, s: 15, delay: 0 },
  { x: 42, y: 146, s: 11, delay: 0.07 },
  { x: 297, y: 146, s: 11, delay: 0.1 },
  { x: 114, y: 327, s: 13, delay: 0.2 },
  { x: 224, y: 328, s: 13, delay: 0.24 },
];

const BLOCK_SHADOW = 'drop-shadow(0 12px 36px rgba(0, 172, 236, 0.35)) drop-shadow(0 2px 8px rgba(0, 88, 173, 0.22))';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  size: number;
  cool: boolean;
  phase: number;
}

interface MeltEls {
  trail: SVGPathElement | null;
  core: SVGPathElement | null;
  spec: SVGPathElement | null;
  head: SVGGElement | null;
  pendant: SVGGElement | null;
}

export const HeroIntelligenceCore: React.FC<HeroIntelligenceCoreProps> = ({
  onNodeHovered,
  interactiveEnergy = 0,
  style,
  onIntroComplete,
  onLogoHoverChange,
  onDrip,
}) => {
  const [isIntroComplete, setIsIntroComplete] = useState<boolean>(false);

  const parallaxRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const block1Ref = useRef<HTMLDivElement>(null);
  const block2Ref = useRef<HTMLDivElement>(null);
  const unifiedLogoRef = useRef<HTMLImageElement>(null);
  const impactGlowRef = useRef<HTMLDivElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);
  const ringARef = useRef<SVGCircleElement>(null);
  const ringBRef = useRef<SVGCircleElement>(null);
  const sparkleRefs = useRef<Array<SVGPathElement | null>>([]);
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);

  const meltEls = useRef<Record<Tip, MeltEls>>({
    1: { trail: null, core: null, spec: null, head: null, pendant: null },
    2: { trail: null, core: null, spec: null, head: null, pendant: null },
  });
  const meltBusy = useRef<Record<Tip, gsap.core.Timeline | null>>({ 1: null, 2: null });
  const isHoveredRef = useRef(false);
  const introDoneRef = useRef(false);

  const hasAnimatedRef = useRef<boolean>(false);
  const onIntroCompleteRef = useRef(onIntroComplete);
  onIntroCompleteRef.current = onIntroComplete;
  const onDripRef = useRef(onDrip);
  onDripRef.current = onDrip;

  // 1. Pointer parallax (4–6px). quickTo reuses one tween per axis and never re-renders React.
  useEffect(() => {
    if (prefersReducedMotion() || !parallaxRef.current) return;
    const xTo = gsap.quickTo(parallaxRef.current, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(parallaxRef.current, 'y', { duration: 0.5, ease: 'power3.out' });
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      xTo(((e.clientX - cx) / cx) * 5.5);
      yTo(((e.clientY - cy) / cy) * 4.5);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // 2. Intro: two rigid glass blocks arc in, interlock, and the impact reads as light on glass.
  useLayoutEffect(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    if (prefersReducedMotion()) {
      introDoneRef.current = true;
      setIsIntroComplete(true);
      onIntroCompleteRef.current?.();
      return;
    }

    const blocks = [block1Ref.current, block2Ref.current];
    const blurOn = `blur(6px) ${BLOCK_SHADOW}`;
    const blurOff = `blur(0px) ${BLOCK_SHADOW}`;

    gsap.set(block1Ref.current, { x: -300, y: -230, rotation: -720, scale: 1.5, opacity: 0, filter: blurOn, transformOrigin: '50% 50%' });
    gsap.set(block2Ref.current, { x: 300, y: 230, rotation: 720, scale: 1.5, opacity: 0, filter: blurOn, transformOrigin: '50% 50%' });
    gsap.set(unifiedLogoRef.current, { opacity: 0 });
    gsap.set(impactGlowRef.current, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
    gsap.set(glintRef.current, { opacity: 0 });
    gsap.set([ringARef.current, ringBRef.current], { opacity: 0, attr: { r: 8 } });
    gsap.set(sparkleRefs.current, { scale: 0, opacity: 0 });

    // Ice dust: small soft particles with drag. Drawn on one bounded canvas, only while alive.
    const canvas = dustCanvasRef.current;
    const ctx = canvas?.getContext('2d') ?? null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const PAD = 170;
    if (canvas && ctx) {
      canvas.width = (BOX + PAD * 2) * dpr;
      canvas.height = (BOX + PAD * 2) * dpr;
    }
    const sprite = (rgb: string) => {
      const c = document.createElement('canvas');
      c.width = c.height = 32;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, `rgba(${rgb}, 1)`);
      grad.addColorStop(0.35, `rgba(${rgb}, 0.55)`);
      grad.addColorStop(1, `rgba(${rgb}, 0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, 32, 32);
      return c;
    };
    const warm = sprite('255,255,255');
    const cool = sprite('170,222,255');
    let dust: Dust[] = [];
    let dustTick: ((time: number, dt: number) => void) | null = null;

    const stopDust = () => {
      if (dustTick) gsap.ticker.remove(dustTick);
      dustTick = null;
      dust = [];
      ctx?.clearRect(0, 0, canvas!.width, canvas!.height);
    };

    const burstDust = () => {
      if (!ctx || !canvas) return;
      dust = Array.from({ length: 58 }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const ring = 10 + Math.random() * 46;
        const speed = 70 + Math.pow(Math.random(), 0.7) * 250;
        return {
          x: HUB.x + Math.cos(a) * ring,
          y: HUB.y + Math.sin(a) * ring,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 20,
          life: 0.9 + Math.random() * 0.8,
          age: 0,
          size: 1.3 + Math.random() * 2.6,
          cool: i % 3 !== 0,
          phase: Math.random() * 6.28,
        };
      });
      dustTick = (_t, dtMs) => {
        const dt = Math.min(0.05, dtMs / 1000);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, BOX + PAD * 2, BOX + PAD * 2);
        let alive = 0;
        for (const p of dust) {
          p.age += dt;
          if (p.age >= p.life) continue;
          alive++;
          const drag = Math.exp(-2.7 * dt);
          p.vx *= drag;
          p.vy = p.vy * drag + 46 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const t = p.age / p.life;
          const twinkle = 0.72 + 0.28 * Math.sin(p.age * 34 + p.phase);
          ctx.globalAlpha = Math.pow(1 - t, 1.5) * twinkle;
          const s = p.size * 3.2 * (1 - t * 0.35);
          ctx.drawImage(p.cool ? cool : warm, p.x + PAD - s / 2, p.y + PAD - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
        if (alive === 0) stopDust();
      };
      gsap.ticker.add(dustTick);
    };

    const tI = 1.3; // impact
    const tl = gsap.timeline({ delay: 0.1 });

    // Approach: curved paths (different eases per axis), decelerating spin, focus pulling in.
    tl.to(blocks, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0);
    tl.to(blocks, { filter: blurOff, duration: 0.95, ease: 'power2.out' }, 0);
    tl.to(block1Ref.current, { x: 0, duration: tI, ease: 'power3.inOut' }, 0);
    tl.to(block1Ref.current, { y: 0, duration: tI, ease: 'power2.inOut' }, 0);
    tl.to(block2Ref.current, { x: 0, duration: tI, ease: 'power3.inOut' }, 0);
    tl.to(block2Ref.current, { y: 0, duration: tI, ease: 'power2.inOut' }, 0);
    tl.to(blocks, { rotation: 0, duration: tI, ease: 'power3.out' }, 0);
    tl.to(blocks, { scale: 1, duration: tI, ease: 'power2.inOut' }, 0);

    // Anticipation: cold light gathers in the hollow as the pieces close.
    tl.to(impactGlowRef.current, { opacity: 0.5, scale: 0.85, duration: 0.75, ease: 'power2.in' }, tI - 0.75);

    // Impact: a brief squash held for a beat (hit-stop), then released.
    tl.to(blocks, { scale: 0.945, duration: 0.06, ease: 'power3.out' }, tI);
    tl.to(blocks, { scale: 1, duration: 0.6, ease: 'expo.out' }, tI + 0.13);
    tl.to(shakeRef.current, { x: -3, y: 2, duration: 0.045, ease: 'power2.out' }, tI);
    tl.to(shakeRef.current, { x: 2.5, y: -1.5, duration: 0.05, ease: 'power2.out' }, tI + 0.045);
    tl.to(shakeRef.current, { x: 0, y: 0, duration: 0.22, ease: 'expo.out' }, tI + 0.095);

    // Hand off to the single-piece logo so edges never double up.
    tl.to(unifiedLogoRef.current, { opacity: 1, duration: 0.07 }, tI + 0.02);
    tl.set(blocks, { opacity: 0 }, tI + 0.1);

    // Light: flare, then a specular sweep that only exists on the glass surface (masked to the logo).
    tl.to(impactGlowRef.current, { opacity: 0.95, scale: 1.05, duration: 0.05, ease: 'power2.out' }, tI);
    tl.to(impactGlowRef.current, { opacity: 0, scale: 1.75, duration: 0.85, ease: 'expo.out' }, tI + 0.05);
    tl.fromTo(
      glintRef.current,
      { opacity: 1, backgroundPosition: '84% 0' },
      { backgroundPosition: '16% 0', duration: 0.95, ease: 'power2.inOut', immediateRender: false },
      tI + 0.06
    );
    tl.to(glintRef.current, { opacity: 0, duration: 0.25, ease: 'power1.in' }, tI + 0.8);

    // Two thin refraction rings, not a fat white halo.
    tl.fromTo(ringARef.current, { opacity: 0.9, attr: { r: 8, 'stroke-width': 1.8 } }, { opacity: 0, attr: { r: 175, 'stroke-width': 0.4 }, duration: 0.9, ease: 'expo.out', immediateRender: false }, tI);
    tl.fromTo(ringBRef.current, { opacity: 0.6, attr: { r: 8, 'stroke-width': 1.2 } }, { opacity: 0, attr: { r: 130, 'stroke-width': 0.3 }, duration: 0.75, ease: 'expo.out', immediateRender: false }, tI + 0.08);

    // Vertex glints, staggered so the eye travels the outline.
    GLINTS.forEach((g, i) => {
      const el = sparkleRefs.current[i];
      tl.fromTo(el, { scale: 0, opacity: 1, rotation: -20 }, { scale: 1, rotation: 25, duration: 0.22, ease: 'power3.out', immediateRender: false }, tI + 0.22 + g.delay);
      tl.to(el, { scale: 0, opacity: 0, rotation: 60, duration: 0.42, ease: 'power2.in' }, tI + 0.44 + g.delay);
    });

    tl.call(burstDust, [], tI + 0.02);

    // Release the headline while the light is still travelling, then start the idle life.
    tl.call(() => onIntroCompleteRef.current?.(), [], tI + 0.35);
    tl.call(() => {
      introDoneRef.current = true;
      setIsIntroComplete(true);
    }, [], tI + 0.5);

    return () => {
      tl.kill();
      stopDust();
    };
  }, []);

  // 3. Melt: water runs the marked rim, swells at the vertex, stretches, and lets go.
  const runMelt = useCallback((tip: Tip, fast = false) => {
    const els = meltEls.current[tip];
    if (!els.trail || !els.core || !els.spec || !els.head || !els.pendant) return;

    const running = meltBusy.current[tip];
    if (running) {
      if (fast) running.timeScale(3);
      return;
    }

    const path = els.core;
    const len = path.getTotalLength();
    const pos = { head: 0, tail: 0 };
    const headDot = els.head;
    const draw = () => {
      const vis = Math.max(0, pos.head - pos.tail);
      const dash = `${vis.toFixed(1)} ${(len * 2).toFixed(1)}`;
      const off = (-pos.tail).toFixed(1);
      for (const p of [els.trail!, path, els.spec!]) {
        p.setAttribute('stroke-dasharray', dash);
        p.setAttribute('stroke-dashoffset', off);
        p.style.opacity = vis < 0.6 ? '0' : '1';
      }
      const pt = path.getPointAtLength(Math.min(len, pos.head));
      headDot.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
    };

    const run = fast ? 0.55 : 2.5;
    const swell = fast ? 0.22 : 1.0;
    // Anchor scaling at the drop's top edge so it hangs from the vertex instead of growing from its middle.
    gsap.set(els.pendant, { transformOrigin: '50% 0%' });
    const tl = gsap.timeline({
      onComplete: () => {
        meltBusy.current[tip] = null;
      },
    });
    meltBusy.current[tip] = tl;

    tl.set(headDot, { opacity: 1 }, 0);
    tl.set(els.pendant, { opacity: 0 }, 0);
    // Gravity: the run speeds up as it descends; the tail follows and thins the film out behind.
    tl.to(pos, { head: len, duration: run, ease: 'power2.in', onUpdate: draw }, 0);
    // The tail lags well behind so a visible ribbon of water trails the bead, and it drains away after the drop forms.
    tl.to(pos, { tail: len, duration: run * 1.05, ease: 'power1.in', onUpdate: draw }, run * 0.28);
    tl.to(headDot, { opacity: 0, duration: 0.08 }, run);

    // The pendant drop hangs from the vertex: grows, elongates, releases.
    const { x, y } = MELT[tip].tip;
    const tHang = run - 0.04;
    tl.set(els.pendant, { opacity: 1, x, y, scaleX: 0.1, scaleY: 0.1 }, tHang);
    tl.to(els.pendant, { scaleX: 1, scaleY: 1, duration: swell, ease: 'power2.out' }, tHang);
    tl.to(els.pendant, { scaleX: 0.86, scaleY: 1.42, y: y + 2.5, duration: swell * 0.32, ease: 'power2.in' }, tHang + swell);
    tl.call(() => onDripRef.current?.(tip), [], tHang + swell * 1.32);
    tl.set(els.pendant, { opacity: 0 }, tHang + swell * 1.32);
    // Tiny residual bead so the tip doesn't look severed.
    tl.fromTo(els.pendant, { opacity: 0.9, scaleX: 0.28, scaleY: 0.28, y }, { opacity: 0, scaleX: 0.1, scaleY: 0.1, duration: 0.5, ease: 'power2.out' }, tHang + swell * 1.32 + 0.02);
  }, []);

  // Idle rhythm: one calm drip every few seconds, alternating sides. Paused while hovered or hidden.
  useEffect(() => {
    if (!isIntroComplete || prefersReducedMotion()) return;
    let timer: ReturnType<typeof setTimeout>;
    let next: Tip = 1;

    const schedule = (first: boolean) => {
      timer = setTimeout(() => {
        if (!document.hidden && !isHoveredRef.current) {
          runMelt(next);
          const other: Tip = next === 1 ? 2 : 1;
          if (Math.random() < 0.22) setTimeout(() => runMelt(other), 1500);
          next = other;
        }
        schedule(false);
      }, first ? 1300 : 5600 + Math.random() * 2400);
    };
    schedule(true);
    return () => clearTimeout(timer);
  }, [isIntroComplete, runMelt]);

  useEffect(() => {
    return () => {
      meltBusy.current[1]?.kill();
      meltBusy.current[2]?.kill();
    };
  }, []);

  // Click melts immediately (no wind-up); a second wave follows so it feels like a real thaw.
  const handleClick = () => {
    if (!introDoneRef.current || prefersReducedMotion()) return;
    runMelt(1, true);
    runMelt(2, true);
    setTimeout(() => {
      runMelt(1, true);
      runMelt(2, true);
    }, 1250);
  };

  const isResonating = Boolean(onNodeHovered || interactiveEnergy > 0);

  const setMeltRef = (tip: Tip, key: keyof MeltEls) => (el: SVGElement | null) => {
    (meltEls.current[tip][key] as SVGElement | null) = el;
  };

  return (
    <div
      id="hero-logo-bg"
      onClick={handleClick}
      onMouseEnter={() => {
        isHoveredRef.current = true;
        onLogoHoverChange?.(true);
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        onLogoHoverChange?.(false);
      }}
      style={{
        position: 'relative',
        pointerEvents: 'auto',
        cursor: 'pointer',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'min(86vw, 340px)',
        height: 'min(86vw, 340px)',
        margin: '0 auto',
        ...style,
      }}
    >
      {/* Atmospheric brand-blue glow behind the logo */}
      <div
        id="hero-bg-glow"
        style={{
          position: 'absolute',
          inset: '-25%',
          background: isResonating
            ? 'radial-gradient(circle at 50% 50%, rgba(0, 172, 236, 0.60) 0%, rgba(0, 88, 173, 0.38) 38%, rgba(125, 217, 255, 0.16) 58%, rgba(255, 255, 255, 0) 75%)'
            : 'radial-gradient(circle at 50% 50%, rgba(0, 172, 236, 0.44) 0%, rgba(0, 88, 173, 0.25) 42%, rgba(125, 217, 255, 0.10) 62%, rgba(255, 255, 255, 0) 74%)',
          filter: 'blur(36px)',
          opacity: isResonating ? 1 : 0.92,
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      <div id="hero-logo-stage" ref={parallaxRef} style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none', willChange: 'transform' }}>
      <div ref={shakeRef} style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
        {/* Breathing loop starts only once the logo has settled; the melt rides the same transform */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            animation: isIntroComplete ? 'heroHexagonBreath 7.5s ease-in-out infinite' : 'none',
            pointerEvents: 'none',
          }}
        >
          {/* Rigid block 1 — upper/left */}
          <div
            ref={block1Ref}
            style={{ position: 'absolute', inset: 0, opacity: 0, filter: BLOCK_SHADOW, willChange: 'transform, opacity' }}
          >
            <img src="/hero-3d-block-upper.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>

          {/* Rigid block 2 — lower/right */}
          <div
            ref={block2Ref}
            style={{ position: 'absolute', inset: 0, opacity: 0, filter: BLOCK_SHADOW, willChange: 'transform, opacity' }}
          >
            <img src="/hero-3d-block-lower.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>

          {/* Assembled logo */}
          <img
            ref={unifiedLogoRef}
            src={LOGO_SRC}
            alt="IntelliLink 3D Logo"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              opacity: isIntroComplete ? 1 : 0,
              filter: isResonating
                ? 'drop-shadow(0 0 38px rgba(0, 172, 236, 0.68)) drop-shadow(0 0 18px rgba(255, 255, 255, 0.9))'
                : 'drop-shadow(0 8px 32px rgba(0, 172, 236, 0.32)) drop-shadow(0 1px 6px rgba(0, 88, 173, 0.18))',
              transition: 'filter 0.4s ease',
            }}
          />

          {/* Impact light gathering in the hollow */}
          <div
            ref={impactGlowRef}
            style={{
              position: 'absolute',
              left: HUB.x - 130,
              top: HUB.y - 130,
              width: 260,
              height: 260,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 50% 50%, rgba(214, 244, 255, 0.95) 0%, rgba(96, 192, 255, 0.5) 30%, rgba(0, 160, 255, 0) 68%)',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Specular sweep, clipped to the logo's own alpha so it can only live on the glass */}
          <div
            ref={glintRef}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              pointerEvents: 'none',
              backgroundImage:
                'linear-gradient(115deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.92) 50%, rgba(255,255,255,0) 62%)',
              backgroundSize: '300% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '84% 0',
              WebkitMaskImage: `url(${LOGO_SRC})`,
              maskImage: `url(${LOGO_SRC})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          />

          {/* Ice dust, on one bounded canvas that extends past the logo */}
          <canvas
            ref={dustCanvasRef}
            style={{
              position: 'absolute',
              left: -170,
              top: -170,
              width: BOX + 340,
              height: BOX + 340,
              pointerEvents: 'none',
            }}
          />

          {/* Rings, vertex glints and the melt channels share one overlay in logo coordinates */}
          <svg
            viewBox={`0 0 ${BOX} ${BOX}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="meltFilm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eaf8ff" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#7cc6f7" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="meltDrop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f3fbff" stopOpacity="0.96" />
                <stop offset="100%" stopColor="#8fcdf8" stopOpacity="0.92" />
              </linearGradient>
              <radialGradient id="meltBead" cx="0.38" cy="0.34" r="0.7">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#a5d8fb" />
              </radialGradient>
            </defs>

            <circle ref={ringARef} cx={HUB.x} cy={HUB.y} r="8" fill="none" stroke="rgba(214, 242, 255, 0.95)" opacity="0" />
            <circle ref={ringBRef} cx={HUB.x} cy={HUB.y} r="8" fill="none" stroke="rgba(170, 224, 255, 0.85)" opacity="0" />

            {GLINTS.map((g, i) => (
              <g key={i} transform={`translate(${g.x} ${g.y}) scale(${g.s})`}>
                <path
                  ref={(el) => {
                    sparkleRefs.current[i] = el;
                  }}
                  d="M 0 -1 C 0.09 -0.15 0.15 -0.09 1 0 C 0.15 0.09 0.09 0.15 0 1 C -0.09 0.15 -0.15 0.09 -1 0 C -0.15 -0.09 -0.09 -0.15 0 -1 Z"
                  fill="#ffffff"
                  opacity="0"
                />
              </g>
            ))}

            {([1, 2] as Tip[]).map((tip) => (
              <g key={tip}>
                {/* Meltwater film in three layers so it reads as liquid on pale glass: a cool wet-edge shadow,
                    the water body, and a thin specular line riding the top of it. */}
                <path ref={setMeltRef(tip, 'trail')} d={MELT[tip].d} fill="none" stroke="rgba(0, 105, 195, 0.32)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0 }} />
                <path ref={setMeltRef(tip, 'core')} d={MELT[tip].d} fill="none" stroke="url(#meltFilm)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0 }} />
                <path ref={setMeltRef(tip, 'spec')} d={MELT[tip].d} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(-0.8 -0.6)" style={{ opacity: 0 }} />
                <g ref={setMeltRef(tip, 'head')} opacity="0">
                  <circle r="5" fill="url(#meltBead)" stroke="rgba(0, 105, 195, 0.5)" strokeWidth="0.8" />
                  <circle cx="-1.6" cy="-1.7" r="1.4" fill="#ffffff" />
                </g>
                {/* Pendant drop: anchored at its top so it grows downward from the vertex */}
                <g ref={setMeltRef(tip, 'pendant')} opacity="0">
                  <path
                    d="M 0 0 C 2 2 4.6 5.2 4.6 8.6 C 4.6 11.3 2.6 13.2 0 13.2 C -2.6 13.2 -4.6 11.3 -4.6 8.6 C -4.6 5.2 -2 2 0 0 Z"
                    fill="url(#meltDrop)"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="0.6"
                  />
                  <ellipse cx="-1.5" cy="8" rx="0.9" ry="2.3" fill="#ffffff" opacity="0.9" transform="rotate(-12 -1.5 8)" />
                </g>
              </g>
            ))}
          </svg>
        </div>
      </div>
      </div>

      <style>{`
        @keyframes heroHexagonBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
      `}</style>
    </div>
  );
};

export default HeroIntelligenceCore;
