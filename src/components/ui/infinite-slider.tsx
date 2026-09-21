'use client';
import React, { useEffect, useState } from 'react';
import { useMotionValue, animate, motion } from 'framer-motion';
import useMeasure from 'react-use-measure';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  /** Seconds for one full loop. Ignored when `speed` is given. */
  duration?: number;
  durationOnHover?: number;
  /** Pixels per second. Takes precedence over `duration`. */
  speed?: number;
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

// Ported from ibelick/infinite-slider. Styling is inline (this project has no Tailwind), and it accepts
// `speed` / `speedOnHover` (px per second) as well as `duration`, since the logo cloud is written in speeds.
export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  speed,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
  style,
}: InfiniteSliderProps) {
  const [hovered, setHovered] = useState(false);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const size = direction === 'horizontal' ? width : height;
    if (!size) return;

    // Children are rendered twice, so one period is half the measured size (plus half a gap).
    const contentSize = size + gap;
    const distance = contentSize / 2;
    const from = reverse ? -distance : 0;
    const to = reverse ? 0 : -distance;

    const loopSeconds = hovered
      ? speedOnHover
        ? distance / speedOnHover
        : (durationOnHover ?? duration)
      : speed
        ? distance / speed
        : duration;

    let controls: ReturnType<typeof animate>;

    if (isTransitioning) {
      // Speed just changed: finish the current lap at the new speed, then restart the loop cleanly.
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration: loopSeconds * Math.abs((translation.get() - to) / distance),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((k) => k + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: loopSeconds,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        onRepeat: () => translation.set(from),
      });
    }

    return () => controls?.stop();
  }, [key, translation, hovered, width, height, gap, isTransitioning, direction, reverse, speed, speedOnHover, duration, durationOnHover]);

  const canChangeOnHover = Boolean(speedOnHover || durationOnHover);
  const hoverProps = canChangeOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setHovered(true);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setHovered(false);
        },
      }
    : {};

  return (
    <div className={className} style={{ overflow: 'hidden', ...style }}>
      <motion.div
        ref={ref}
        style={{
          display: 'flex',
          width: 'max-content',
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          ...(direction === 'horizontal' ? { x: translation } : { y: translation }),
        }}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
