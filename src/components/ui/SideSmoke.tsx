// Soft white smoke along the left and right edges of a wide carousel: the outer cards dissolve into it instead of being
// cut off. Three layers: a haze that softly blurs whatever is underneath, a solid fade to the page colour at the very
// edge, and a few slowly drifting light clouds so the edge feels alive rather than like a flat gradient.

const KEYFRAMES = `
@keyframes smokeDriftA { 0% { transform: translate3d(0, 0, 0) scale(1); } 100% { transform: translate3d(6%, -4%, 0) scale(1.12); } }
@keyframes smokeDriftB { 0% { transform: translate3d(0, 0, 0) scale(1.05); } 100% { transform: translate3d(-5%, 5%, 0) scale(1); } }
@media (prefers-reduced-motion: reduce) { .side-smoke-cloud { animation: none !important; } }
`;

export default function SideSmoke({ side, color = '#fafafa', width = '24%' }: { side: 'left' | 'right'; color?: string; width?: string }) {
  const dir = side === 'left' ? 'to right' : 'to left';
  const edge = side === 'left' ? 'left' : 'right';
  // Colour with alpha, built from a #rrggbb page colour.
  const rgb = (a: number) => {
    const n = parseInt(color.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };
  const cloud = (cx: string, cy: string, rx: string, ry: string, a: number) => `radial-gradient(ellipse ${rx} ${ry} at ${cx} ${cy}, ${rgb(a)}, ${rgb(0)} 70%)`;
  const at = (x: number) => (side === 'left' ? `${x}%` : `${100 - x}%`);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [edge]: 0,
        width,
        zIndex: 6,
        pointerEvents: 'none',
        overflow: 'hidden',
        // Everything inside dissolves toward the inner side, so there is no visible seam where the smoke ends.
        WebkitMaskImage: `linear-gradient(${dir}, #000 0%, #000 55%, transparent 100%)`,
        maskImage: `linear-gradient(${dir}, #000 0%, #000 55%, transparent 100%)`,
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Haze: blurs the card edges under it, strongest at the outer edge */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          WebkitMaskImage: `linear-gradient(${dir}, #000 0%, rgba(0,0,0,0.6) 45%, transparent 100%)`,
          maskImage: `linear-gradient(${dir}, #000 0%, rgba(0,0,0,0.6) 45%, transparent 100%)`,
        }}
      />

      {/* Fade to the page colour */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(${dir}, ${rgb(1)} 0%, ${rgb(0.92)} 22%, ${rgb(0.55)} 55%, ${rgb(0)} 100%)`,
        }}
      />

      {/* Drifting clouds */}
      <div
        className="side-smoke-cloud"
        style={{
          position: 'absolute',
          inset: '-10%',
          backgroundImage: [cloud(at(18), '26%', '60%', '34%', 0.95), cloud(at(30), '72%', '70%', '38%', 0.85), cloud(at(8), '52%', '50%', '46%', 1)].join(', '),
          animation: 'smokeDriftA 14s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />
      <div
        className="side-smoke-cloud"
        style={{
          position: 'absolute',
          inset: '-10%',
          backgroundImage: [cloud(at(38), '40%', '55%', '30%', 0.55), cloud(at(24), '88%', '60%', '30%', 0.7)].join(', '),
          animation: 'smokeDriftB 19s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
