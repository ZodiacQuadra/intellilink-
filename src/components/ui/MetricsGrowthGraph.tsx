import { useEffect, useId, useMemo, useRef } from 'react';
import gsap from 'gsap';

// The growth curve behind "What teams achieve". When it scrolls into view the curve is drawn left to right with its
// area and vertical rules revealed by the same sweep (so they stay attached to the line instead of fading in on their
// own), and a small glowing point rides the tip, fading out as it reaches the top. Plays once; static when motion is
// reduced. Kept separate from components/GrowthGraph.tsx, which the Components tab still uses.

const W = 320;
const H = 120;
const SAMPLES = 240;

interface Props {
  startHeight?: number;
  endHeight?: number;
  duration?: number;
}

export default function MetricsGrowthGraph({ startHeight = 15, endHeight = 100, duration = 2.8 }: Props) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<SVGRectElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const { curve, area } = useMemo(() => {
    const startY = H - (Math.max(0, Math.min(100, startHeight)) / 100) * H;
    const endY = H - (Math.max(0, Math.min(100, endHeight)) / 100) * H;
    const rise = startY - endY;
    const c = `M0 ${startY} C64 ${startY} 124 ${startY - rise * 0.05} 178 ${startY - rise * 0.24} C236 ${startY - rise * 0.46} 278 ${startY - rise * 0.73} 320 ${endY}`;
    return { curve: c, area: `${c} L${W} ${H} L0 ${H} Z` };
  }, [startHeight, endHeight]);

  useEffect(() => {
    const root = rootRef.current;
    const wipe = wipeRef.current;
    const tip = tipRef.current;
    const measure = root?.querySelector<SVGPathElement>('path[data-curve]');
    if (!root || !wipe || !tip || !measure) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      wipe.setAttribute('width', String(W));
      tip.style.opacity = '0';
      return;
    }

    // The curve only ever moves right, so its height at any x can be looked up from a sampled table.
    const len = measure.getTotalLength();
    const ys = new Float32Array(SAMPLES + 1);
    for (let i = 0; i <= SAMPLES; i++) ys[i] = measure.getPointAtLength((i / SAMPLES) * len).y;
    const xs = new Float32Array(SAMPLES + 1);
    for (let i = 0; i <= SAMPLES; i++) xs[i] = measure.getPointAtLength((i / SAMPLES) * len).x;
    const yAt = (x: number) => {
      let lo = 0;
      let hi = SAMPLES;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (xs[mid] < x) lo = mid;
        else hi = mid;
      }
      const t = xs[hi] === xs[lo] ? 0 : (x - xs[lo]) / (xs[hi] - xs[lo]);
      return ys[lo] + (ys[hi] - ys[lo]) * t;
    };

    const state = { p: 0 };
    wipe.setAttribute('width', '0');
    tip.style.opacity = '0';

    const render = () => {
      const x = state.p * W;
      wipe.setAttribute('width', x.toFixed(2));
      tip.style.left = `${(x / W) * 100}%`;
      tip.style.top = `${(yAt(x) / H) * 100}%`;
      // Fades in over the first stretch and out over the last, so it never sits clipped at the edge.
      tip.style.opacity = String(Math.min(1, state.p / 0.06) * Math.min(1, (1 - state.p) / 0.12));
    };

    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || tween) return;
        tween = gsap.to(state, { p: 1, duration, ease: 'power2.inOut', onUpdate: render, onComplete: () => { tip.style.opacity = '0'; } });
        io.disconnect();
      },
      { threshold: 0.3 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [duration, curve]);

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} role="img" aria-label="Accelerating growth curve">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <clipPath id={`${uid}-wipe`}>
            <rect ref={wipeRef} x="0" y="0" width={W} height={H} />
          </clipPath>
          <clipPath id={`${uid}-area`}>
            <path d={area} />
          </clipPath>
          <linearGradient id={`${uid}-fill`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="rgb(9, 174, 255)" stopOpacity="0.03" />
            <stop offset="1" stopColor="rgb(9, 174, 255)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id={`${uid}-line`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(9, 174, 255, 0.45)" />
            <stop offset="1" stopColor="rgb(9, 153, 224)" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${uid}-wipe)`}>
          <path d={area} fill={`url(#${uid}-fill)`} />
          <g clipPath={`url(#${uid}-area)`}>
            {Array.from({ length: 101 }, (_, i) => i * 3.2).map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2={H} stroke="rgba(0, 0, 0, 0.07)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <path d={curve} fill="none" stroke={`url(#${uid}-line)`} strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </g>

        {/* Unclipped copy used only for measuring the curve. */}
        <path data-curve d={curve} fill="none" stroke="none" />
      </svg>

      {/* Point riding the tip of the line */}
      <div
        ref={tipRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          borderRadius: '50%',
          background: '#ffffff',
          border: '2.5px solid rgb(9, 153, 224)',
          boxShadow: '0 0 0 6px rgba(9, 174, 255, 0.16), 0 0 18px rgba(9, 174, 255, 0.55)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
