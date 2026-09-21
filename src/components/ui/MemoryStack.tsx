import { useEffect, useRef } from 'react';

// A dotted stack of three layers on a square dot grid. The top layer is a full hexagonal ring; the two beneath it show
// only their lower half (side wings and a V), so together they read as a stack seen slightly from above.
// It assembles when the card scrolls into view, then idles quietly: each dot slowly drifts between deep and light
// blue, and every few seconds a soft pulse passes down the stack. Paused off-screen, static for reduced motion.

const A = 15; // half-width in dot columns
const B_UP = 8.4; // half-height above the side tips
const B_DOWN = 7.3; // half-height below the side tips
const BAND = 2.4; // ring thickness in rows
const LAYER_STEP = 8.2; // rows between layers: each layer's tips sit at the previous layer's bottom
const LAYERS = 3;
const LAND_DELAY = [0.34, 0.17, 0]; // top layer lands last
const PULSE_EVERY = 5;

const DEEP: [number, number, number] = [10, 88, 255];
const LIGHT: [number, number, number] = [138, 184, 255];

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const hash = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type Dot = { i: number; j: number; layer: number; row: number; seed: number };

// Builds every dot of the stack once, in grid units (x = column, y = row).
const buildDots = (): Dot[] => {
  const out: Dot[] = [];
  for (let L = 0; L < LAYERS; L++) {
    const top = L === 0 ? -Math.ceil(B_UP) : -1; // lower layers keep only their lower half
    for (let j = top; j <= Math.ceil(B_DOWN); j++) {
      const B = j < 0 ? B_UP : B_DOWN;
      const bandFrac = BAND / B;
      for (let i = -Math.ceil(A); i < Math.ceil(A); i++) {
        const x = i + 0.5;
        const d = Math.abs(x) / A + Math.abs(j) / B;
        if (d > 1 || d < 1 - bandFrac) continue;
        out.push({ i: x, j: j + L * LAYER_STEP, layer: L, row: j, seed: hash(x + L * 9, j) });
      }
    }
  }
  return out;
};

export default function MemoryStack({ height = 320 }: { height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dots = buildDots();
    // Vertical middle of the whole stack, so it sits centred in the card.
    const midRow = (-B_UP + (LAYERS - 1) * LAYER_STEP + B_DOWN) / 2;
    const spanRows = B_UP + (LAYERS - 1) * LAYER_STEP + B_DOWN + 2;

    let w = 0;
    let h = 0;
    let g = 10;
    let raf = 0;
    let visible = false;
    let startedAt = 0;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      g = Math.max(6, Math.min(12, h / spanRows, w / (A * 2 + 4)));
    };

    const draw = (t: number, settled: boolean) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const pulse = (t % PULSE_EVERY) / PULSE_EVERY;

      for (let n = 0; n < dots.length; n++) {
        const d = dots[n];
        // Layers land bottom to top; inside a layer the dots settle from the top row down.
        const local = settled ? 1 : ease((t - LAND_DELAY[d.layer] - (d.row + B_UP) * 0.012) / 0.8);
        if (local <= 0) continue;

        // Slow drift between deep and light blue; phases differ per dot so it shimmers instead of blinking.
        const drift = settled ? d.seed : 0.5 + 0.5 * Math.sin(d.seed * 6.283 + t * 0.7);
        // The pulse travels down the stack and briefly deepens the dots it passes.
        const front = pulse * 1.5 * (LAYERS * LAYER_STEP + B_UP) - 4;
        const dist = Math.abs(d.j - front);
        const glow = settled ? 0 : Math.max(0, 1 - dist / 4.5);

        const k = Math.min(1, Math.max(0, drift * 0.95 - glow * 0.45));
        const r = DEEP[0] + (LIGHT[0] - DEEP[0]) * k;
        const gr = DEEP[1] + (LIGHT[1] - DEEP[1]) * k;
        const b = DEEP[2] + (LIGHT[2] - DEEP[2]) * k;

        ctx.globalAlpha = local;
        ctx.fillStyle = `rgb(${r | 0},${gr | 0},${b | 0})`;
        ctx.beginPath();
        ctx.arc(cx + d.i * g, cy + (d.j - midRow + (1 - local) * -3) * g, g * (0.34 + glow * 0.04), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (!visible) return;
      draw((now - startedAt) / 1000, false);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced || !visible) draw(0, reduced);
    });
    ro.observe(wrap);

    if (reduced) {
      draw(0, true);
      return () => ro.disconnect();
    }

    draw(0, false);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !visible) {
          visible = true;
          startedAt = performance.now();
          raf = requestAnimationFrame(loop);
        } else if (!e.isIntersecting && visible) {
          visible = false;
          cancelAnimationFrame(raf);
          draw(0, false); // resets so it assembles again next time
        }
      },
      { threshold: 0.35 }
    );
    io.observe(wrap);

    return () => {
      visible = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%', height, position: 'relative' }} aria-hidden="true">
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
