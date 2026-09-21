import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import ReactDOM from 'react-dom';

export interface FullPageSnowfallRef {
  /** Release a meltwater drop from a logo tip (1 = left, 2 = right); it freezes into a crystal and drifts down. */
  spawnFromTip: (tip: 1 | 2) => void;
}

interface CrystalInstance {
  id: number;
  variant: 0 | 1 | 2;
  spawnX: number;
  spawnY: number;
  scale: number;
  opacity: number;
  blur: number;
  duration: number;
  dist: number;
  gravityDist: number;
  settleDist: number;
  swayA1: number;
  swayP1: number;
  swayA2: number;
  swayP2: number;
  flipP: number;
  fx0: number;
  fy0: number;
  spinP: number;
  spinDir: 1 | -1;
  spin0: number;
}

// Where each drop lets go, in the 340×340 logo box: the two bottom vertices, a little below the tip
// so the falling bead picks up exactly where the pendant drop detached.
const TIP_OFFSET: Record<1 | 2, { x: number; y: number }> = {
  1: { x: 113.4, y: 337 },
  2: { x: 224.2, y: 338 },
};

const MAX_ALIVE = 20;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const FullPageSnowfallLayer = forwardRef<FullPageSnowfallRef, Record<string, never>>((_props, ref) => {
  const [crystals, setCrystals] = useState<CrystalInstance[]>([]);
  const idCounter = useRef(0);
  const aliveRef = useRef(0);
  const [mountTarget, setMountTarget] = useState<HTMLElement | null>(null);

  // Snow lives in a root-level layer outside the hero, so hero transforms and scroll never touch it.
  useEffect(() => {
    let target = document.getElementById('fullpage-snowfall-root');
    if (!target) {
      target = document.createElement('div');
      target.id = 'fullpage-snowfall-root';
      target.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;min-height:100vh;pointer-events:none;z-index:90;overflow:hidden';
      document.body.appendChild(target);
    }
    setMountTarget(target);
  }, []);

  const getTipDocumentCoords = useCallback((tip: 1 | 2) => {
    // hero-logo-stage carries the pointer parallax, so measuring it keeps the release point exactly on the tip.
    const logoEl = document.getElementById('hero-logo-stage') ?? document.getElementById('hero-logo-bg');
    const off = TIP_OFFSET[tip];
    if (!logoEl) {
      const cx = window.innerWidth / 2;
      return { x: tip === 1 ? cx - 56 : cx + 54, y: 340 };
    }
    const r = logoEl.getBoundingClientRect();
    return {
      x: r.left + window.pageXOffset + (off.x / 340) * r.width,
      y: r.top + window.pageYOffset + (off.y / 340) * r.height,
    };
  }, []);

  const fallDistance = useCallback((fromY: number) => {
    const footer = document.querySelector('footer');
    const docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const bottom = footer ? footer.getBoundingClientRect().top + window.pageYOffset + footer.offsetHeight : docHeight;
    return Math.max(1200, bottom - 40 - fromY);
  }, []);

  const remove = useCallback((id: number) => {
    aliveRef.current = Math.max(0, aliveRef.current - 1);
    setCrystals((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const spawnFromTip = useCallback(
    (tip: 1 | 2) => {
      if (prefersReducedMotion() || document.hidden || aliveRef.current >= MAX_ALIVE) return;
      const { x, y } = getTipDocumentCoords(tip);
      const dist = fallDistance(y);

      // Depth classes: small = far (slow, faint, soft), large = near (faster, crisp).
      const roll = Math.random();
      const depth =
        roll < 0.34
          ? { scale: rand(0.5, 0.66), speed: rand(54, 68), opacity: 0.78, blur: 0.5 }
          : roll < 0.8
            ? { scale: rand(0.82, 1.0), speed: rand(76, 92), opacity: 0.96, blur: 0 }
            : { scale: rand(1.15, 1.38), speed: rand(104, 124), opacity: 1, blur: 0 };

      aliveRef.current += 1;
      const instance: CrystalInstance = {
        id: ++idCounter.current,
        variant: Math.floor(Math.random() * 3) as 0 | 1 | 2,
        spawnX: x,
        spawnY: y,
        scale: depth.scale,
        opacity: depth.opacity,
        blur: depth.blur,
        duration: dist / depth.speed,
        dist,
        gravityDist: rand(46, 62),
        settleDist: rand(58, 84),
        swayA1: rand(9, 24),
        swayP1: rand(3.6, 5.4),
        swayA2: rand(3, 8),
        swayP2: rand(1.35, 2.3),
        flipP: rand(5.5, 9.5),
        fx0: rand(0, 360),
        fy0: rand(0, 360),
        spinP: rand(14, 30),
        spinDir: Math.random() > 0.5 ? 1 : -1,
        spin0: rand(0, 360),
      };
      setCrystals((prev) => [...prev, instance]);
    },
    [fallDistance, getTipDocumentCoords]
  );

  useImperativeHandle(ref, () => ({ spawnFromTip }), [spawnFromTip]);

  if (!mountTarget || crystals.length === 0) return null;

  return ReactDOM.createPortal(
    <>
      {crystals.map((c) => (
        <SnowParticle key={c.id} instance={c} onComplete={remove} />
      ))}
    </>,
    mountTarget
  );
});

// ── One flake. Every layer is a compositor-only CSS animation, so nothing re-renders while it falls. ──
//   drift   constant fall to the footer (linear)
//   gravity the freshly-detached water bead accelerates for the first half second
//   settle  once frozen it sheds that speed (air drag) and finds its drift
//   sway×2  two unrelated periods so the flutter never looks like a loop
//   spin+flip  slow in-plane turn plus a perspective flip, so it catches the light edge-on
const LAYER: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: 0, height: 0 };

const SnowParticle = React.memo<{ instance: CrystalInstance; onComplete: (id: number) => void }>(
  ({ instance: c, onComplete }) => {
    const fadeAt = Math.max(1, c.duration - 4.5);
    return (
      <div style={{ ...LAYER, transform: `translate3d(${c.spawnX}px, ${c.spawnY}px, 0)` }}>
        <div
          style={
            {
              ...LAYER,
              animation: `snowDrift ${c.duration}s linear forwards, snowFadeOut 4.5s ease-in ${fadeAt}s forwards`,
              '--dist': `${c.dist}px`,
            } as React.CSSProperties
          }
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && e.animationName === 'snowDrift') onComplete(c.id);
          }}
        >
          <div
            style={
              {
                ...LAYER,
                animation: 'snowGravity 0.55s cubic-bezier(0.5, 0, 0.9, 0.6) forwards',
                '--g': `${c.gravityDist}px`,
              } as React.CSSProperties
            }
          >
            <div
              style={
                {
                  ...LAYER,
                  animation: 'snowSettle 1.7s cubic-bezier(0.1, 0.7, 0.3, 1) 0.55s both',
                  '--s': `${c.settleDist}px`,
                } as React.CSSProperties
              }
            >
              <div style={{ ...LAYER, animation: `snowSway ${c.swayP1}s ease-in-out infinite`, '--a': `${c.swayA1}px` } as React.CSSProperties}>
                <div style={{ ...LAYER, animation: `snowSway ${c.swayP2}s ease-in-out infinite`, '--a': `${c.swayA2}px` } as React.CSSProperties}>
                  {/* Water bead: falls fast, then freezes */}
                  <div style={{ ...LAYER, animation: 'snowLiquid 0.62s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0 }}>
                    <WaterBead />
                  </div>
                  <div style={{ ...LAYER, animation: 'snowFreeze 0.34s ease-out 0.46s both', opacity: 0 }}>
                    <FreezeGlint />
                  </div>

                  {/* Crystal: scaled by depth, then turning and flipping in 3D */}
                  <div
                    style={{
                      ...LAYER,
                      transform: `scale(${c.scale})`,
                      opacity: c.opacity,
                      filter: c.blur ? `blur(${c.blur}px)` : undefined,
                    }}
                  >
                    <div style={{ ...LAYER, animation: 'snowCrystalIn 0.42s cubic-bezier(0.34, 1.3, 0.64, 1) 0.5s both', opacity: 0 }}>
                      <div
                        style={
                          {
                            ...LAYER,
                            animation: `snowSpin ${c.spinP}s linear infinite`,
                            '--r0': `${c.spin0}deg`,
                            '--dir': c.spinDir,
                          } as React.CSSProperties
                        }
                      >
                        <div
                          style={
                            {
                              position: 'absolute',
                              left: -14,
                              top: -14,
                              width: 28,
                              height: 28,
                              animation: `snowFlip ${c.flipP}s linear infinite`,
                              '--fx0': `${c.fx0}deg`,
                              '--fy0': `${c.fy0}deg`,
                            } as React.CSSProperties
                          }
                        >
                          {c.variant === 0 && <Dendrite />}
                          {c.variant === 1 && <HexPlate />}
                          {c.variant === 2 && <StellarPlate />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  () => true
);

const keyframes = `
@keyframes snowDrift { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(0, var(--dist), 0); } }
@keyframes snowGravity { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(0, var(--g), 0); } }
@keyframes snowSettle { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(0, var(--s), 0); } }
@keyframes snowFadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes snowSway {
  0%   { transform: translate3d(0, 0, 0); }
  25%  { transform: translate3d(var(--a), 0, 0); }
  50%  { transform: translate3d(0, 0, 0); }
  75%  { transform: translate3d(calc(-1 * var(--a)), 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
@keyframes snowSpin {
  from { transform: rotate(var(--r0)); }
  to   { transform: rotate(calc(var(--r0) + var(--dir) * 360deg)); }
}
@keyframes snowFlip {
  from { transform: perspective(170px) rotateX(var(--fx0)) rotateY(var(--fy0)); }
  to   { transform: perspective(170px) rotateX(calc(var(--fx0) + 360deg)) rotateY(calc(var(--fy0) + 250deg)); }
}
@keyframes snowLiquid {
  0%   { opacity: 0; transform: scale(0.55, 0.55); }
  14%  { opacity: 1; transform: scale(0.88, 1.22); }
  58%  { opacity: 1; transform: scale(1, 1); }
  100% { opacity: 0; transform: scale(0.6, 0.6); }
}
@keyframes snowFreeze {
  0%   { opacity: 0; transform: scale(0.2) rotate(0deg); }
  45%  { opacity: 1; transform: scale(1.25) rotate(45deg); }
  100% { opacity: 0; transform: scale(0.4) rotate(90deg); }
}
@keyframes snowCrystalIn {
  from { opacity: 0; transform: scale(0.35); }
  to   { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  #fullpage-snowfall-root * { animation: none !important; }
}
`;

if (typeof document !== 'undefined') {
  document.getElementById('snowfall-compositor-keyframes')?.remove();
  if (!document.getElementById('snowfall-keyframes-v2')) {
    const el = document.createElement('style');
    el.id = 'snowfall-keyframes-v2';
    el.textContent = keyframes;
    document.head.appendChild(el);
  }
}

// ── Shapes. Crisp white ice with a cool edge so it reads on a light page; no colored glow. ──
const EDGE = '#b4d3ea';
const SVG_PROPS = { width: 28, height: 28, viewBox: '-14 -14 28 28', fill: 'none' } as const;
const CAP = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const WaterBead: React.FC = () => (
  <svg width="15" height="17" viewBox="-7.5 -8.5 15 17" fill="none" style={{ position: 'absolute', left: -7.5, top: -8.5 }}>
    <defs>
      <linearGradient id="snowBeadGrad" x1="0" y1="-8" x2="0" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f3fbff" stopOpacity="0.97" />
        <stop offset="100%" stopColor="#8fcdf8" stopOpacity="0.93" />
      </linearGradient>
    </defs>
    <path
      d="M 0,-7 C 2.8,-4.2 5,-0.8 5,3 C 5,6 2.8,8 0,8 C -2.8,8 -5,6 -5,3 C -5,-0.8 -2.8,-4.2 0,-7 Z"
      fill="url(#snowBeadGrad)"
      stroke="#ffffff"
      strokeWidth="0.7"
    />
    <ellipse cx="-1.4" cy="1.6" rx="0.95" ry="2.3" transform="rotate(-14 -1.4 1.6)" fill="#ffffff" opacity="0.95" />
  </svg>
);

const FreezeGlint: React.FC = () => (
  <svg width="22" height="22" viewBox="-11 -11 22 22" fill="none" style={{ position: 'absolute', left: -11, top: -11 }}>
    <path
      d="M 0 -10 C 0.9 -1.6 1.6 -0.9 10 0 C 1.6 0.9 0.9 1.6 0 10 C -0.9 1.6 -1.6 0.9 -10 0 C -1.6 -0.9 -0.9 -1.6 0 -10 Z"
      fill="#ffffff"
      stroke={EDGE}
      strokeWidth="0.5"
    />
  </svg>
);

// Six fern-like arms with side branches: a stellar dendrite.
const Dendrite: React.FC = () => {
  const arm = 'M0 0 L0 -12 M0 -4.8 L-3.5 -8.3 M0 -4.8 L3.5 -8.3 M0 -8.2 L-2.3 -10.6 M0 -8.2 L2.3 -10.6';
  return (
    <svg {...SVG_PROPS}>
      {[0, 60, 120, 180, 240, 300].map((d) => (
        <path key={`e${d}`} d={arm} transform={`rotate(${d})`} stroke={EDGE} strokeWidth="2.1" {...CAP} />
      ))}
      {[0, 60, 120, 180, 240, 300].map((d) => (
        <path key={`w${d}`} d={arm} transform={`rotate(${d})`} stroke="#ffffff" strokeWidth="1" {...CAP} />
      ))}
      <polygon points="0,-2.6 2.25,-1.3 2.25,1.3 0,2.6 -2.25,1.3 -2.25,-1.3" fill="#ffffff" stroke={EDGE} strokeWidth="0.6" />
    </svg>
  );
};

// A thin hexagonal plate with a ringed interior.
const HexPlate: React.FC = () => (
  <svg {...SVG_PROPS}>
    <polygon points="0,-10.5 9.1,-5.25 9.1,5.25 0,10.5 -9.1,5.25 -9.1,-5.25" fill="rgba(255,255,255,0.86)" stroke={EDGE} strokeWidth="0.9" strokeLinejoin="round" />
    <polygon points="0,-5.4 4.68,-2.7 4.68,2.7 0,5.4 -4.68,2.7 -4.68,-2.7" fill="none" stroke={EDGE} strokeWidth="0.6" strokeLinejoin="round" />
    {[0, 60, 120, 180, 240, 300].map((d) => (
      <line key={d} x1="0" y1="-5.4" x2="0" y2="-10.5" transform={`rotate(${d})`} stroke={EDGE} strokeWidth="0.5" />
    ))}
    <circle r="1.2" fill="#ffffff" stroke={EDGE} strokeWidth="0.4" />
  </svg>
);

// A six-pointed stellar plate.
const StellarPlate: React.FC = () => {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const r = i % 2 === 0 ? 12 : 5.8;
    const a = (i * 30 - 90) * (Math.PI / 180);
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(' ');
  return (
    <svg {...SVG_PROPS}>
      <polygon points={pts} fill="rgba(255,255,255,0.92)" stroke={EDGE} strokeWidth="0.9" strokeLinejoin="round" />
      <polygon points="0,-3.4 2.94,-1.7 2.94,1.7 0,3.4 -2.94,1.7 -2.94,-1.7" fill="none" stroke={EDGE} strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  );
};

export default FullPageSnowfallLayer;
