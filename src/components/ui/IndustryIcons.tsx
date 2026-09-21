import React, { useId } from 'react';

// Clean vector line icons for the industry cards (the original /industry-*.svg files are 32px pixel bitmaps drawn
// as hundreds of 1×1 squares, which look jagged at any size). Geometry follows Lucide's icon set (ISC licence);
// stroke-based, so they stay razor sharp at every pixel ratio.
//
// Each icon is drawn in an electric-blue gradient with a soft white shine that sweeps diagonally across it.
// The shine is a bright band masked to the icon's own strokes, so it can only light up the glyph, never spill.
// `draw(paint)` returns the geometry so it can be rendered twice: once in the gradient, once white for the mask.
type Draw = (paint: string) => React.ReactNode;

const CSS = `
@keyframes industryIconSweep {
  0%   { transform: translateX(-14px); }
  42%  { transform: translateX(38px); }
  100% { transform: translateX(38px); }
}
.industry-icon-sweep { animation: industryIconSweep 4.2s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
.industry-card:hover .industry-icon-sweep { animation-duration: 1.6s; }
@media (prefers-reduced-motion: reduce) { .industry-icon-sweep { animation: none; opacity: 0; } }
`;

const Icon: React.FC<{ label: string; delay: number; draw: Draw; size?: number }> = ({ label, delay, draw, size = 44 }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const grad = `ig${uid}`;
  const mask = `im${uid}`;
  const band = `ib${uid}`;
  const stroke = { strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0a4cff" />
          <stop offset="0.55" stopColor="#0a8cff" />
          <stop offset="1" stopColor="#3cc8ff" />
        </linearGradient>
        <linearGradient id={band} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id={mask} maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28">
          <g {...stroke} stroke="#ffffff">
            {draw('#ffffff')}
          </g>
        </mask>
      </defs>

      <g {...stroke} stroke={`url(#${grad})`}>
        {draw(`url(#${grad})`)}
      </g>

      <g mask={`url(#${mask})`}>
        <g className="industry-icon-sweep" style={{ animationDelay: `${delay}s` }}>
          <rect x="-3" y="-8" width="7.5" height="40" fill={`url(#${band})`} transform="rotate(24 0 12)" />
        </g>
      </g>
    </svg>
  );
};

export const IndustryIconStyles: React.FC = () => <style>{CSS}</style>;

export const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  'Financial services': (
    <Icon
      label="Financial services"
      delay={0}
      draw={() => (
        <>
          <line x1="3" x2="21" y1="22" y2="22" />
          <line x1="6" x2="6" y1="18" y2="11" />
          <line x1="10" x2="10" y1="18" y2="11" />
          <line x1="14" x2="14" y1="18" y2="11" />
          <line x1="18" x2="18" y1="18" y2="11" />
          <polygon points="12 2 20 7 4 7" />
        </>
      )}
    />
  ),
  'Retail and e-commerce': (
    <Icon
      label="Retail and e-commerce"
      delay={0.35}
      draw={() => (
        <>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </>
      )}
    />
  ),
  Education: (
    <Icon
      label="Education"
      delay={0.7}
      draw={() => (
        <>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </>
      )}
    />
  ),
  Healthcare: (
    <Icon
      label="Healthcare"
      delay={1.05}
      draw={() => (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </>
      )}
    />
  ),
  'Media and marketing': (
    <Icon
      label="Media and marketing"
      delay={1.4}
      draw={(paint) => (
        <>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
          <circle cx="19.5" cy="19.5" r="1.6" fill={paint} stroke="none" />
        </>
      )}
    />
  ),
  Technology: (
    <Icon
      label="Technology"
      delay={1.75}
      draw={() => (
        <>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" x2="20" y1="19" y2="19" />
        </>
      )}
    />
  ),
};
