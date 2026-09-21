import React from 'react';
import { InfiniteSlider } from './infinite-slider';

export type CloudLogo = {
  /** Stable key and accessible name. */
  name: string;
  /** Any node: an <img>, an inline <svg>, or a full pill. */
  node: React.ReactNode;
};

type LogoCloudProps = React.ComponentProps<'div'> & {
  logos: CloudLogo[];
  gap?: number;
  speed?: number;
  speedOnHover?: number;
};

// Adapted from the 21st.dev logo-cloud-3: an infinite marquee that eases out at both edges.
// Same behaviour and props; inline styles instead of Tailwind classes; logos are nodes so they can be pills.
export function LogoCloud({ logos, gap = 42, speed = 80, speedOnHover, style, ...props }: LogoCloudProps) {
  const edgeFade = 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)';
  return (
    <div
      {...props}
      style={{
        overflow: 'hidden',
        padding: '4px 0',
        WebkitMaskImage: edgeFade,
        maskImage: edgeFade,
        ...style,
      }}
    >
      <InfiniteSlider gap={gap} reverse speed={speed} speedOnHover={speedOnHover}>
        {logos.map((logo) => (
          <div key={logo.name} aria-label={logo.name} style={{ flexShrink: 0, userSelect: 'none' }}>
            {logo.node}
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
