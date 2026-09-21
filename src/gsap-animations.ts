/**
 * IntelliLink Master GSAP & Motion System
 * Benchmark: TRIONN (interaction quality, narrative transitions, spatial composition)
 * Uses: gsap core + ScrollTrigger + Lenis kinetic smooth scroll
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ─── Easing Presets ─────────────────────────────────────────────────────────
const EASE_OUT = 'power3.out';
const EASE_EXPO = 'expo.out';
const EASE_IN_OUT = 'power2.inOut';

let lenisInstance: Lenis | null = null;

// ─── Lenis Smooth Scroll Initialization ─────────────────────────────────────
export function initSmoothScroll(): Lenis | null {
  if (typeof window === 'undefined') return null;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  if (lenisInstance) {
    lenisInstance.destroy();
  }

  try {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    lenisInstance = lenis;
    return lenis;
  } catch (err) {
    console.warn('Lenis smooth scroll fallback to native:', err);
    return null;
  }
}

export function destroySmoothScroll() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export function smoothScrollTo(target: string | HTMLElement, offset: number = 0) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset, duration: 1.1 });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({
        top: scrollTop + rect.top + offset,
        behavior: 'smooth',
      });
    }
  }
}

// ─── ScrollTrigger Helper ───────────────────────────────────────────────────
const st = (trigger: string | Element, scrub: boolean | number = false) => ({
  scrollTrigger: {
    trigger,
    start: 'top 85%',
    end: 'bottom 20%',
    scrub,
    toggleActions: 'play none none none',
  },
});

// ─── 1. Cinematic Hero Entrance Sequence (Step 4.1 & Round 5 Gated Reveal) ──
// Headline, subtext, CTAs and the card start hidden (inline opacity 0 in App.tsx) and are released
// once the logo has locked together. A safety timer guarantees they can never stay hidden.
let heroRevealed = false;
let heroSafetyCall: gsap.core.Tween | null = null;

export function prepareHeroElements() {
  if (typeof document === 'undefined') return;

  // Background soft glow
  if (document.querySelector('#hero-bg-glow')) {
    gsap.fromTo(
      '#hero-bg-glow',
      { opacity: 0, scale: 0.9 },
      { opacity: 0.92, scale: 1, duration: 1.0, ease: 'power2.out', delay: 0.1 }
    );
  }

  heroSafetyCall?.kill();
  heroSafetyCall = gsap.delayedCall(4.5, () => {
    if (!heroRevealed) animateHeroContentReveal();
  });
}

export function animateHeroContentReveal() {
  if (typeof document === 'undefined' || heroRevealed) return null;
  heroRevealed = true;
  heroSafetyCall?.kill();

  const tl = gsap.timeline({ delay: 0.05 });

  // 0. The top bar stays hidden while the logo assembles, then eases in with the rest of the hero.
  if (document.querySelector('#site-header')) {
    tl.fromTo('#site-header', { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: EASE_OUT, clearProps: 'transform' }, 0);
  }

  // 1. Headline reveals smoothly
  if (document.querySelector('#hero-heading')) {
    tl.fromTo(
      '#hero-heading',
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: EASE_OUT }
    );
  }

  // 2. Description reveals
  if (document.querySelector('#hero-subtext')) {
    tl.fromTo(
      '#hero-subtext',
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: EASE_OUT },
      '-=0.45'
    );
  }

  // 3. CTAs reveal
  if (document.querySelector('#hero-buttons')) {
    tl.fromTo(
      '#hero-buttons',
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: EASE_OUT },
      '-=0.4'
    );
  }

  // 4. Connection paths draw & illuminate
  if (document.querySelector('#hero-wiring-svg')) {
    tl.fromTo(
      '#hero-wiring-svg',
      { opacity: 0 },
      { opacity: 1, duration: 0.75, ease: 'power2.inOut' },
      '-=0.35'
    );
  }

  // 5. Enterprise nodes appear
  const nodes = gsap.utils.toArray<HTMLElement>('.hero-node-pill');
  if (nodes.length) {
    tl.fromTo(
      nodes,
      { opacity: 0, scale: 0.92, y: 14 },
      { opacity: 1, scale: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'back.out(1.2)' },
      '-=0.55'
    );
  }

  // 6. Product UI card emerges
  if (document.querySelector('#hero-dashboard-card')) {
    tl.fromTo(
      '#hero-dashboard-card',
      { y: 20, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: EASE_EXPO },
      '-=0.45'
    );
  }

  // 7. Integration Row reveals ("Connects with your enterprise stack")
  if (document.querySelector('#logos-section')) {
    tl.fromTo(
      '#logos-section',
      { y: 16, opacity: 0.6 },
      { y: 0, opacity: 1, duration: 0.65, ease: EASE_OUT },
      '-=0.4'
    );
  }

  return tl;
}

// ─── 2. Hero-to-"How It Works" Narrative Scroll Transition (Step 4.4) ────────
export function animateHeroScrollTransition() {
  if (!document.querySelector('#hero') || !document.querySelector('#how-it-works')) return;

  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom 20%',
      scrub: 1.1,
    },
  });

  // Hero headline and copy lift gently with natural scroll. Opacity is deliberately not tweened here:
  // GSAP records start values at creation, and these elements start hidden until the logo intro reveals them.
  scrollTl.to(
    '#hero-heading, #hero-subtext, #hero-buttons',
    { y: -20, ease: 'none' },
    0
  );

  // Background logo fades and settles
  if (document.querySelector('#hero-logo-bg')) {
    scrollTl.to(
      '#hero-logo-bg',
      { opacity: 0.05, y: -20, ease: 'none' },
      0
    );
  }

  // Background wave moves in soft parallax
  if (document.querySelector('#hero-bg-wave')) {
    gsap.to('#hero-bg-wave', {
      y: 60,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }
}

// ─── 2b. Product card: pinned scroll expand to full screen ───────────────────
// Stage A (free scroll): the card eases up from slightly recessed to its natural size as it rises in.
// Stage B (pinned): the card is held in the centre of the viewport while scroll opens its backdrop out to
// the full screen. The backdrop is a viewport-sized layer whose clip-path grows from the card's rectangle
// to the whole window, so the (purpose-made, full-size) texture is revealed rather than scaled up and
// never gets coarser. The white panel only zooms slightly; the texture dollies a few percent behind it.
// Reduced-motion users get the finished card with no pinning or scroll motion.
let heroZoomMM: gsap.MatchMedia | null = null;

export function animateHeroCardZoom() {
  const card = document.querySelector<HTMLElement>('#hero-card');
  const frame = document.querySelector<HTMLElement>('#hero-card .hero-card-frame');
  const bleed = document.querySelector<HTMLElement>('#hero-card .hero-card-bleed');
  const media = document.querySelector<HTMLElement>('#hero-card .hero-card-media');
  const panel = document.querySelector<HTMLElement>('#hero-card .hero-card-panel');
  const shadow = document.querySelector<HTMLElement>('#hero-card .hero-card-shadow');
  const ring = document.querySelector<HTMLElement>('#hero-card .hero-card-ring');
  const cloud = document.querySelector<HTMLElement>('#hero-card .hero-logo-cloud');
  const spacer = document.querySelector<HTMLElement>('#hero-card-clearance');
  if (!card || !frame || !bleed || !media || !panel || !shadow || !ring) return;

  heroZoomMM?.revert();
  heroZoomMM = gsap.matchMedia();
  heroZoomMM.add('(prefers-reduced-motion: no-preference)', () => {
    const RADIUS = 36;
    // offsetWidth/Height are layout sizes, so they ignore the transforms we animate.
    // `band` is the strip of backdrop that opens above and below the card. It is normally whatever is left of the
    // viewport, but never less than MIN_BAND so the logo strip always has room (on a phone the card is nearly
    // full height, so the backdrop is made taller than the viewport instead).
    const MIN_BAND = 100;
    const geo = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const fw = frame.offsetWidth;
      const fh = frame.offsetHeight;
      const band = Math.max(MIN_BAND, (H - fh) / 2);
      return { W, H, fw, fh, band, bleedH: fh + 2 * band };
    };
    const startClip = () => {
      const { W, fw, band } = geo();
      const l = Math.max(0, (W - fw) / 2);
      return `inset(${band}px ${l}px ${band}px ${l}px round ${RADIUS}px)`;
    };
    const endClip = 'inset(0px 0px 0px 0px round 0px)';

    // Size the backdrop to the viewport, centred on the card, and clip it back to the card's rectangle.
    const sizeBleed = () => {
      const { W, fw, fh, bleedH } = geo();
      gsap.set(bleed, { left: (fw - W) / 2, top: (fh - bleedH) / 2, width: W, height: bleedH, right: 'auto', bottom: 'auto', borderRadius: 0, clipPath: startClip() });
    };
    sizeBleed();

    // The open backdrop extends past the card's layout box by this much on the top and bottom. The strip of
    // logos sits in the bottom band, and the spacer after the card reserves the same room in the page flow.
    const clearance = () => {
      const band = Math.round(geo().band);
      frame.style.setProperty('--band', `${band}px`);
      if (spacer) spacer.style.height = `${band}px`;
    };
    const spacerBase = spacer ? spacer.style.height : '';
    clearance();
    if (cloud) gsap.set(cloud, { opacity: 0, y: 14 });

    // Stage A
    gsap
      .timeline({
        scrollTrigger: { trigger: card, start: 'top 100%', end: 'center center', scrub: 1 },
      })
      .fromTo(frame, { scale: 0.92 }, { scale: 1, ease: 'power2.out' }, 0)
      .fromTo(panel, { scale: 1.03, yPercent: 2 }, { scale: 1, yPercent: 0, ease: 'power2.out' }, 0)
      .fromTo(media, { scale: 1.08, yPercent: 2 }, { scale: 1.05, yPercent: 1, ease: 'none' }, 0);

    // Stage B: expand over the first 70% of the pin, then hold so the card can be read and used.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: card,
          start: 'center center',
          end: () => `+=${Math.round(window.innerHeight * 1.2)}`,
          pin: true,
          pinSpacing: true,
          scrub: 1.5,
          invalidateOnRefresh: true,
          // Higher refreshPriority refreshes first (verified against the live trigger order, contrary to the skill
          // note). The pin must lay out its spacer before every trigger below it measures its position.
          refreshPriority: 1,
          onRefreshInit: sizeBleed,
          onRefresh: clearance,
        },
      })
      .fromTo(bleed, { clipPath: () => startClip() }, { clipPath: endClip, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, 0)
      .to([shadow, ring], { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0)
      // The logos arrive once the backdrop has opened far enough to hold them.
      .fromTo(cloud ?? {}, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', immediateRender: false }, 0.42)
      .fromTo(panel, { scale: 1 }, { scale: 1.085, duration: 1, ease: 'none', immediateRender: false }, 0)
      .fromTo(media, { scale: 1.05, yPercent: 1 }, { scale: 1, yPercent: -2, duration: 0.7, ease: 'none', immediateRender: false }, 0)
      .to({}, { duration: 0.3 });

    // The panel changes height as the demo runs (prompt, analysing, result): re-measure when it does.
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    ro.observe(panel);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      frame.style.removeProperty('--band');
      if (spacer) spacer.style.height = spacerBase;
    };
  });
}

// ─── 3. Partner Logos — Stagger reveal ───────────────────────────────────────
export function animateLogos() {
  if (!document.querySelector('#logos-section') || !document.querySelector('.partner-logo')) return;
  gsap.fromTo(
    '.partner-logo',
    { opacity: 0, y: 14, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: EASE_OUT,
      stagger: 0.06,
      ...st('#logos-section'),
    }
  );
}

// ─── 4. Section Headings — Controlled reveal ────────────────────────────────
export function animateSectionHeadings() {
  const headings = gsap.utils.toArray<HTMLElement>('.section-heading');
  if (!headings.length) return;
  headings.forEach((el) => {
    gsap.fromTo(
      el,
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: EASE_OUT,
        ...st(el),
      }
    );
  });
}

// ─── 5. "How It Works" 4-Steps Cards — Choreographed Sequence ───────────────
// Builds a word-split copy of an element's children (every word in an inline-block span; for the heading, also
// inside a mask so words can rise out of it). The element's ORIGINAL child nodes are kept untouched, so the
// settled state can put them straight back: separate inline-blocks lose kerning across spaces, and the resting
// text must be exactly the design's own.
const splitWords = (el: HTMLElement, mask: boolean) => {
  const origNodes = Array.from(el.childNodes);
  const words: HTMLElement[] = [];
  const build = (node: Node): Node[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      const out: Node[] = [];
      (node.textContent ?? '').split(/(\s+)/).forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          out.push(document.createTextNode(token));
          return;
        }
        const inner = document.createElement('span');
        inner.textContent = token;
        inner.style.display = 'inline-block';
        words.push(inner);
        if (mask) {
          // The padding gives descenders room inside the mask; the negative margin cancels it, so the line box is unchanged.
          const outer = document.createElement('span');
          outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.14em;margin-bottom:-0.14em';
          outer.appendChild(inner);
          out.push(outer);
        } else {
          out.push(inner);
        }
      });
      return out;
    }
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== 'BR') {
      const clone = node.cloneNode(false) as Element;
      Array.from(node.childNodes).forEach((c) => build(c).forEach((k) => clone.appendChild(k)));
      return [clone];
    }
    return [node.cloneNode(true)]; // <br> and anything else is copied as-is
  };
  const splitNodes = origNodes.flatMap(build);
  return {
    words,
    showSplit: () => el.replaceChildren(...splitNodes),
    showOriginal: () => el.replaceChildren(...origNodes),
  };
};


// Builds a line-split copy of an element: every line (text between <br>s) sits in its own overflow mask, so lines can
// rise out of it one after another. As with splitWords, the ORIGINAL child nodes are kept untouched so the settled
// state can put them straight back.
const splitLines = (el: HTMLElement) => {
  const origNodes = Array.from(el.childNodes);
  const lines: HTMLElement[] = [];
  const masks: HTMLElement[] = [];
  let current: DocumentFragment | null = null;
  const flush = () => {
    if (!current) return;
    const mask = document.createElement('span');
    // The padding gives descenders room inside the mask; the negative margin cancels it, so the line box is unchanged.
    mask.style.cssText = 'display:block;overflow:hidden;padding-bottom:0.16em;margin-bottom:-0.16em';
    const inner = document.createElement('span');
    inner.style.display = 'block';
    inner.appendChild(current);
    mask.appendChild(inner);
    masks.push(mask);
    lines.push(inner);
    current = null;
  };
  origNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'BR') {
      flush();
      return;
    }
    if (!current) current = document.createDocumentFragment();
    current.appendChild(n.cloneNode(true));
  });
  flush();
  return {
    lines,
    showSplit: () => el.replaceChildren(...masks),
    showOriginal: () => el.replaceChildren(...origNodes),
  };
};

// "From question to action, in 4 steps": no flip. Like the reference, each line of the heading and copy rises out
// of its own mask, and the three cards then tilt up out of the page in 3D, one after another, slowly. It is all tied
// to scroll with heavy smoothing, so it stays fluid and reverses when you scroll back. Everything is put back exactly
// as designed once it settles. Phones and reduced-motion get the original simple entrance.
let hiwMM: gsap.MatchMedia | null = null;

export function animateHowItWorksCards() {
  const section = document.querySelector<HTMLElement>('#how-it-works');
  const cards = gsap.utils.toArray<HTMLElement>('.how-it-works-card');
  if (!section || !cards.length) return;

  hiwMM?.revert();
  hiwMM = gsap.matchMedia();

  const scrubbed = (o: { tilt: number; yaw: number; rise: number }) => {
    const heading = section.querySelector<HTMLElement>('h2');
    const copy = section.querySelector<HTMLElement>('h2 + p');
    const headingSplit = heading ? splitLines(heading) : null;
    const copySplit = copy ? splitLines(copy) : null;
    const headingLines = headingSplit?.lines ?? [];
    const copyLines = copySplit?.lines ?? [];

    // Split text while the entrance is running; the untouched original once it has settled.
    let splitShown = false;
    const setSplit = (on: boolean) => {
      if (on === splitShown) return;
      splitShown = on;
      (on ? headingSplit?.showSplit : headingSplit?.showOriginal)?.();
      (on ? copySplit?.showSplit : copySplit?.showOriginal)?.();
    };
    setSplit(true);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      // A long range with heavy smoothing: it begins as the section's top edge appears and finishes near the top.
      scrollTrigger: { trigger: section, start: 'top 92%', end: 'top 2%', scrub: 2.2, invalidateOnRefresh: true },
      onUpdate: () => setSplit(tl.progress() < 1),
      onComplete: () => {
        setSplit(false);
        gsap.set([...cards, ...headingLines, ...copyLines], { clearProps: 'transform,opacity,filter,willChange' });
      },
    });

    // Lines rise out of their masks with a slight lean that straightens as they land.
    if (headingLines.length) {
      tl.fromTo(
        headingLines,
        { yPercent: 108, rotation: 3.5, transformOrigin: '0% 100%', willChange: 'transform' },
        { yPercent: 0, rotation: 0, duration: 0.42, ease: 'power4.out', stagger: 0.12 },
        0
      );
    }
    if (copyLines.length) {
      tl.fromTo(
        copyLines,
        { yPercent: 108, opacity: 0, willChange: 'transform, opacity' },
        { yPercent: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.1 },
        0.2
      );
    }

    // Cards: each tips up out of the page in 3D, hinged on its bottom edge, with a slight yaw that fans them out;
    // they follow one another at an unhurried pace.
    const yaws = cards.map((_, i) => (i - (cards.length - 1) / 2) * o.yaw);
    cards.forEach((card, i) => {
      tl.fromTo(
        card,
        {
          y: o.rise,
          rotationX: o.tilt,
          rotationY: yaws[i],
          scale: 0.94,
          opacity: 0,
          transformPerspective: 1100,
          transformOrigin: '50% 100%',
          willChange: 'transform, opacity',
        },
        { y: 0, rotationX: 0, rotationY: 0, scale: 1, opacity: 1, duration: 0.62, ease: 'power3.out' },
        0.3 + i * 0.2
      );
    });

    return () => setSplit(false);
  };

  const simple = () => {
    gsap.fromTo(
      cards,
      { y: 55, opacity: 0, scale: 0.97 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: EASE_OUT,
        stagger: 0.16,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '#how-it-works', start: 'top 80%', toggleActions: 'play none none none' },
      }
    );
  };

  hiwMM.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => scrubbed({ tilt: 34, yaw: 9, rise: 110 }));
  hiwMM.add('(min-width: 641px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)', () =>
    scrubbed({ tilt: 20, yaw: 4, rise: 60 })
  );
  hiwMM.add('(max-width: 640px), (prefers-reduced-motion: reduce)', simple);
}

// ─── 6. Feature Tabs & Preview Elevation ────────────────────────────────────
export function animateFeatureNav() {
  if (!document.querySelector('#features') || !document.querySelector('.feature-tab-btn')) return;
  gsap.fromTo(
    '.feature-tab-btn',
    { x: -25, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.6,
      ease: EASE_OUT,
      stagger: 0.09,
      ...st('#features'),
    }
  );
}

// ─── 6b. Features: the whole section pops out, then hands over to the next ───
// The entire section (heading, tabs and all four cards) moves as one unit, tied to scroll. It rises and swells
// forward into place as it scrolls in, holds still while you use it (the tabs and stacking cards inside work
// exactly as before), and as it leaves it recedes and fades so the next section takes over. The state is
// computed from scroll position and layout offsets (which ignore transforms), so the animation never moves its
// own triggers; while the section is at rest every transform is cleared, leaving the design's own layout.
let featureSectionMM: gsap.MatchMedia | null = null;

export function animateFeatureSection() {
  const section = document.querySelector<HTMLElement>('#features');
  if (!section) return;

  featureSectionMM?.revert();
  featureSectionMM = gsap.matchMedia();

  featureSectionMM.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const pageTop = (el: HTMLElement) => {
      let y = 0;
      for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
      return y;
    };

    let top = 0;
    let bottom = 0;
    const measure = () => {
      top = pageTop(section);
      bottom = top + section.offsetHeight;
    };

    let neutral = true;
    const render = () => {
      const y = window.pageYOffset;
      const vh = window.innerHeight;
      // Pop: from the section's top edge showing at the bottom of the screen to it sitting ~30% down.
      const inT = clamp01((y + vh * 0.96 - top) / (vh * 0.66));
      // Hand-over: from the section's bottom edge at 75% of the screen to just off the top.
      const exitT = clamp01((vh * 0.75 - (bottom - y)) / (vh * 0.7));

      if (inT >= 1 && exitT <= 0) {
        if (!neutral) {
          gsap.set(section, { clearProps: 'transform,opacity,willChange' });
          neutral = true;
        }
        return;
      }
      neutral = false;
      const pop = 1 - Math.pow(1 - inT, 3);
      const ex = exitT * exitT * (3 - 2 * exitT);
      const entering = exitT <= 0;
      gsap.set(section, {
        transformOrigin: entering ? '50% 0%' : '50% 100%',
        scale: entering ? 0.9 + 0.1 * pop : 1 - 0.07 * ex,
        y: entering ? 90 * (1 - pop) : 0,
        opacity: entering ? 0.25 + 0.75 * pop : 1 - 0.65 * ex,
        willChange: 'transform, opacity',
      });
    };

    measure();
    render();
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      invalidateOnRefresh: true,
      onRefresh: () => {
        measure();
        render();
      },
      onUpdate: render,
    });

    return () => {
      trigger.kill();
      gsap.set(section, { clearProps: 'transform,opacity,willChange' });
    };
  });
}

// ─── 7. Capabilities 2x2 Bento Grid Elevation ──────────────────────────────
export function animateCapabilitiesBento() {
  const bentoCards = gsap.utils.toArray<HTMLElement>('.bento-capability-card');
  if (!bentoCards.length) return;
  gsap.fromTo(
    bentoCards,
    { y: 40, opacity: 0, scale: 0.98 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: EASE_OUT,
      stagger: 0.12,
      scrollTrigger: {
        trigger: '#capabilities',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    }
  );
}

// ─── 8. Metrics Counters — Viewport Number Count-Up ─────────────────────────
export function animateMetrics() {
  if (!document.querySelector('#metrics')) return;
  const cards = gsap.utils.toArray<HTMLElement>('#metrics-cards-grid > *');
  if (!cards.length) return;

  gsap.fromTo(
    cards,
    { y: 35, opacity: 0, scale: 0.95 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.75,
      ease: EASE_OUT,
      stagger: 0.12,
      scrollTrigger: {
        trigger: '#metrics',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    }
  );
}

// ─── 9. Industry Cards — Stagger Grid ───────────────────────────────────────
// The whole "Built for the way your enterprise works" section (heading, copy and all six cards) is one page of a
// book lying open on the floor. Its spine is the section's top edge: at first the page is laid back, its lower
// part receding away from you and foreshortened, then scroll swings it open toward you until it faces you
// squarely. Inside it the heading words rise out of a mask, the copy follows, and the cards slide in from the
// right one by one. Only the entrance changes: everything is put back exactly as designed once it settles.
//   - the wrapper (.industries-stage) holds the perspective, with its vanishing point near the top spine, and is
//     the scroll trigger: it never rotates, so ScrollTrigger measures it correctly, and an element-local
//     perspective() would skew the page
let industriesMM: gsap.MatchMedia | null = null;

export function animateIndustryCards() {
  const stage = document.querySelector<HTMLElement>('.industries-stage');
  const section = document.querySelector<HTMLElement>('#industries');
  const cards = gsap.utils.toArray<HTMLElement>('#industries .industry-card');
  if (!stage || !section || !cards.length) return;

  industriesMM?.revert();
  industriesMM = gsap.matchMedia();

  const openBook = (o: { perspective: number; angle: number; lift: number; slide: number }) => {
    const heading = section.querySelector<HTMLElement>('h2');
    const copy = section.querySelector<HTMLElement>('h2 + p');
    const headingSplit = heading ? splitWords(heading, true) : null;
    const copySplit = copy ? splitWords(copy, false) : null;
    const headingWords = headingSplit?.words ?? [];
    const copyWords = copySplit?.words ?? [];

    // Split text while the page is mid-swing; the untouched original once it has settled.
    let splitShown = false;
    const setSplit = (on: boolean) => {
      if (on === splitShown) return;
      splitShown = on;
      (on ? headingSplit?.showSplit : headingSplit?.showOriginal)?.();
      (on ? copySplit?.showSplit : copySplit?.showOriginal)?.();
    };
    setSplit(true);

    // Perspective is only present while the page is mid-swing, so the settled layout carries no extra styles.
    const setDepth = (on: boolean) => {
      stage.style.perspective = on ? `${o.perspective}px` : '';
      stage.style.perspectiveOrigin = on ? '50% 8%' : '';
    };
    setDepth(true);

    const tl = gsap.timeline({
      // Sudden, not scrubbed: the moment the section's top edge is well into view the page snaps open in a single
      // fast move (an explosive start that settles almost at once). Scrolling back above it plays it back shut.
      scrollTrigger: { trigger: stage, start: 'top 45%', toggleActions: 'play none none reverse', invalidateOnRefresh: true },
      onUpdate: () => {
        const inRange = tl.progress() < 1;
        setDepth(inRange);
        setSplit(inRange);
      },
      onComplete: () => {
        setDepth(false);
        setSplit(false);
        gsap.set([section, ...cards, ...headingWords, ...copyWords], { clearProps: 'transform,opacity,filter,willChange' });
      },
    });

    // The whole page: hinged on its top edge, swung back so the bottom edge recedes, then opened to face you.
    tl.fromTo(
      section,
      { rotationX: -o.angle, y: o.lift, scale: 0.94, transformOrigin: '50% 0%', willChange: 'transform' },
      { rotationX: 0, y: 0, scale: 1, duration: 0.7, ease: 'expo.out', force3D: true },
      0
    );

    // Text: heading words rise out of their mask, blur clearing as each lands; the copy follows more quietly.
    if (headingWords.length) {
      tl.fromTo(
        headingWords,
        { yPercent: 110, opacity: 0, willChange: 'transform, opacity' },
        { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power4.out', stagger: 0.045 },
        0.08
      );
    }
    if (copyWords.length) {
      tl.fromTo(
        copyWords,
        { y: 14, opacity: 0, willChange: 'transform, opacity' },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.008 },
        0.2
      );
    }

    // Cards: they slide in from the right one by one, riding the page as it opens.
    cards.forEach((card, i) => {
      tl.fromTo(card, { x: o.slide, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'power4.out' }, 0.16 + i * 0.06);
    });

    return () => {
      setDepth(false);
      setSplit(false);
    };
  };

  // The original entrance for phones and for reduced motion: no 3D, nothing wide enough to overflow.
  const simpleReveal = () => {
    gsap.fromTo(
      cards,
      { y: 35, opacity: 0, scale: 0.97 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: EASE_OUT,
        stagger: { amount: 0.5, from: 'start' },
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '#industries', start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  };

  industriesMM.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () =>
    openBook({ perspective: 1500, angle: 76, lift: 40, slide: 220 })
  );
  industriesMM.add('(min-width: 641px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)', () =>
    openBook({ perspective: 1200, angle: 42, lift: 24, slide: 90 })
  );
  industriesMM.add('(max-width: 640px), (prefers-reduced-motion: reduce)', simpleReveal);
}

// ─── 10. Security Section — Atmospheric Dark Reveal ─────────────────────────
export function animateSecuritySection() {
  if (!document.querySelector('#security')) return;
  gsap.fromTo(
    '#security',
    { opacity: 0.8 },
    {
      opacity: 1,
      duration: 0.9,
      ease: EASE_OUT,
      scrollTrigger: {
        trigger: '#security',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    }
  );
}

// ─── 11. Testimonials Stagger ───────────────────────────────────────────────
export function animateTestimonials() {
  if (!document.querySelector('#testimonials-section')) return;
  gsap.fromTo(
    '#testimonials-section',
    { opacity: 0, y: 25 },
    {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: EASE_OUT,
      ...st('#testimonials-section'),
    }
  );
}

// ─── 12. FAQ Cards — Accordion Stagger ──────────────────────────────────────
export function animateFAQs() {
  if (!document.querySelector('#faqs-section') || !document.querySelector('.faq-card')) return;
  gsap.fromTo(
    '.faq-card',
    { y: 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: EASE_OUT,
      stagger: 0.06,
      ...st('#faqs-section'),
    }
  );
}

// ─── 13. CTA Section ────────────────────────────────────────────────────────
export function animateCTA() {
  if (!document.querySelector('#cta-section')) return;
  gsap.fromTo(
    '#cta-section',
    { scale: 0.96, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.85,
      ease: EASE_OUT,
      ...st('#cta-section'),
    }
  );
}

// ─── Master Initializer ─────────────────────────────────────────────────────
export function initGSAPAnimations() {
  // Initialize Lenis Kinetic Smooth Scroll
  initSmoothScroll();

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
  });

  if (document.querySelector('#hero-heading')) {
    prepareHeroElements();
    animateHeroScrollTransition();
    animateHeroCardZoom();
  }

  requestAnimationFrame(() => {
    animateLogos();
    animateSectionHeadings();
    animateHowItWorksCards();
    animateFeatureNav();
    animateFeatureSection();
    animateCapabilitiesBento();
    animateMetrics();
    animateIndustryCards();
    animateSecuritySection();
    animateTestimonials();
    animateFAQs();
    animateCTA();
  });
}

// ─── Cleanup ───────────────────────────────────────────────────────────────
export function destroyGSAPAnimations() {
  featureSectionMM?.revert();
  featureSectionMM = null;
  hiwMM?.revert();
  hiwMM = null;
  industriesMM?.revert();
  industriesMM = null;
  heroZoomMM?.revert();
  heroZoomMM = null;
  heroRevealed = false;
  heroSafetyCall = null;
  destroySmoothScroll();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
}
