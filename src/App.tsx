import React, { useState, useEffect, useRef } from 'react';
import { initGSAPAnimations, destroyGSAPAnimations, smoothScrollTo, animateHeroContentReveal } from './gsap-animations';

// WebGL & Elevated Interactive Components
import HeroIntelligenceCore from './components/webgl/HeroIntelligenceCore';
import FullPageSnowfallLayer, { FullPageSnowfallRef } from './components/snowfall/FullPageSnowfallLayer';
import SecurityKeyMatrix from './components/webgl/SecurityKeyMatrix';
import RealProductUICard from './components/hero/RealProductUICard';
import { INDUSTRY_ICONS, IndustryIconStyles } from './components/ui/IndustryIcons';
import MemoryStack from './components/ui/MemoryStack';
import WorkspacePreview from './components/ui/WorkspacePreview';
import MetricsGrowthGraph from './components/ui/MetricsGrowthGraph';
import SideSmoke from './components/ui/SideSmoke';
import PromptTypewriter from './components/ui/PromptTypewriter';

// Fine cyan speckle (fractal noise thresholded to sparse dots) used as the dither grain in the page-top wash.
const WASH_GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.05  0 0 0 0 0.55  0 0 0 0 0.95  2.6 0 0 0 -1.15'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

// Space above the nav bar at rest, and the primary button blue (hero + nav).
const NAV_TOP_GAP = 22;
// Same look as the "Request a demo" button in the footer.
const PRIMARY_BLUE = '#012bff';
const PRIMARY_BLUE_HOVER = '#0020cc';
const PRIMARY_BLUE_SHADOW = '0 4px 16px rgba(1, 43, 255, 0.35)';
const PRIMARY_BLUE_SHADOW_HOVER = '0 6px 20px rgba(1, 43, 255, 0.45)';

// Framer Design Components (18)
import Button from '../framer/Button.js';
import NavigationBar from '../framer/NavigationBar.js';
import Footer from '../framer/Footer.js';
import Tag from '../framer/Tag.js';
import PromptCard from '../framer/PromptCard.js';
import UICardLoading from '../framer/UICardLoading.js';
import RippleLoader from '../framer/modules/Square_loading.js';
import FeatureIndicator from '../framer/FeatureIndicator.js';
import UserRolesCard from '../framer/UserRolesCard.js';
import MultimodalCard from '../framer/MultimodalCard.js';
import CapabilityCard from '../framer/CapabilityCard.js';
import IndustryCard from '../framer/IndustryCard.js';
import MetricsCard from '../framer/MetricsCard.js';
import PricingPlanCard from '../framer/PricingPlanCard.js';
import PricingList from '../framer/PricingList.js';
import ToggleButton from '../framer/ToggleButton.js';
import PricingToggleCards from '../framer/PricingToggleCards.js';
import FAQCard from '../framer/FAQCard.js';
import FAQsCardContainer from '../framer/FAQsCardContainer.js';

// Motion Code Components (12)
import Animated_beam from '../components/Animated_beam.tsx';
import Animated_lines from '../components/Animated_lines.tsx';
import Animated_lines_2 from '../components/Animated_lines_2.tsx';
import Animated_arc from '../components/Animated_arc.tsx';
import Animated_pixels from '../components/Animated_pixels.tsx';
import DottedIcon from '../components/DottedIcon.tsx';
import GrowthGraph from '../components/GrowthGraph.tsx';
import ImpactGraph from '../components/ImpactGraph.tsx';
import LogoGrid from '../components/LogoGrid.tsx';
import SlotCounter from '../components/SlotCounter.tsx';
import StaggerTestimonials from '../components/StaggerTestimonials.tsx';
import Typewriter from '../components/Workshop/Typewriter.tsx';

const testimonialsData = [
  {
    quote: "Intellilink gives our team one clear place to turn scattered customer signals into action.",
    name: "Maya Chen",
    role: "Chief Operating Officer",
    company: "Northstar",
    initials: "MC",
    portrait: { src: "https://i.pravatar.cc/160?img=47", alt: "Maya Chen" },
  },
  {
    quote: "We spend less time collecting updates and more making the decisions that move work forward.",
    name: "Daniel Ross",
    role: "Head of Product",
    company: "Frame",
    initials: "DR",
    portrait: { src: "https://i.pravatar.cc/160?img=12", alt: "Daniel Ross" },
  },
  {
    quote: "It feels less like another tool and more like a dependable operator embedded in our team.",
    name: "Lina Ortiz",
    role: "VP, Customer Experience",
    company: "Relay",
    initials: "LO",
    portrait: { src: "https://i.pravatar.cc/160?img=32", alt: "Lina Ortiz" },
  },
  {
    quote: "Intellilink helped us coordinate launches without adding another layer of meetings or reporting.",
    name: "Jordan Blake",
    role: "Chief Technology Officer",
    company: "Meridian",
    initials: "JB",
    portrait: { src: "https://i.pravatar.cc/160?img=11", alt: "Jordan Blake" },
  },
  {
    quote: "The system is calm, precise, and flexible enough to match how our people actually work.",
    name: "Priya Shah",
    role: "Director of Operations",
    company: "Common Thread",
    initials: "PS",
    portrait: { src: "https://i.pravatar.cc/160?img=44", alt: "Priya Shah" },
  },
  {
    quote: "We launched in days, saw value immediately, and now have an operating model that scales.",
    name: "Eli Morgan",
    role: "Founder",
    company: "Current",
    initials: "EM",
    portrait: { src: "https://i.pravatar.cc/160?img=15", alt: "Eli Morgan" },
  },
  {
    quote: "Our information is easier to find, our handoffs are cleaner, and nothing important gets buried.",
    name: "Amara Lewis",
    role: "Program Lead",
    company: "Tandem",
    initials: "AL",
    portrait: { src: "https://i.pravatar.cc/160?img=49", alt: "Amara Lewis" },
  },
];

const faqsData = [
  {
    question: "How quickly can we get started?",
    answer: "Most teams can begin with one focused workflow, then expand as their needs grow.",
  },
  {
    question: "What tools can Intellilink connect to?",
    answer: "Intellilink connects with the tools your team already uses to keep information and work in sync.",
  },
  {
    question: "Can we start with one workflow?",
    answer: "Yes. Start small, validate the setup with your team, and add more workflows when ready.",
  },
  {
    question: "Does Intellilink replace our existing tools?",
    answer: "No. Intellilink works across your current stack, helping your tools operate as one connected system.",
  },
  {
    question: "Can we control what Intellilink can access?",
    answer: "Yes. You decide which tools, information, and actions are available to each workflow.",
  },
  {
    question: "How is our company data protected?",
    answer: "Intellilink uses secure access controls and keeps your information within the permissions you define.",
  },
  {
    question: "Can workflows be customized for our team?",
    answer: "Yes. Each workflow can match your processes, terminology, tools, and approval requirements.",
  },
  {
    question: "What support is included during rollout?",
    answer: "We help with setup, workflow planning, testing, and team adoption throughout the rollout.",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'catalog' | '404'>('landing');
  const [componentFilter, setComponentFilter] = useState<'all' | 'framer' | 'code'>('all');
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [heroEnergy, setHeroEnergy] = useState<number>(0);
  const [heroParallax, setHeroParallax] = useState({
    logo: { x: 0, y: 0 },
    network: { x: 0, y: 0 },
    dashboard: { x: 0, y: 0 },
    background: { x: 0, y: 0 },
  });

  // Snowfall is a decoupled overlay: the logo reports each meltwater drop, the layer turns it into a crystal.
  const snowfallRef = useRef<FullPageSnowfallRef>(null);

  // Continuous scroll-scrubbed navbar interpolation (Fix C: 0 -> 100px range)
  useEffect(() => {
    let ticking = false;
    let lastProgress = -1;

    const updateNavProgress = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const maxScroll = 100; // Scrub range 0 to 100px
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      // Pin at end states without redundant DOM writes
      if (progress === lastProgress && (progress === 0 || progress === 1)) {
        ticking = false;
        return;
      }
      lastProgress = progress;

      const header = document.getElementById('site-header');
      const pill = document.getElementById('site-nav-pill');
      const centerNav = document.getElementById('site-center-nav');
      if (!header || !pill) {
        ticking = false;
        return;
      }

      // Write CSS variable for any dependent rules
      header.style.setProperty('--nav-progress', progress.toFixed(3));

      // 1. Header side and top insets (0px -> 12px top, 0px -> 16px sides)
      const topPad = (progress * 12).toFixed(1);
      const sidePad = (progress * 16).toFixed(1);
      header.style.padding = `${topPad}px ${sidePad}px 0`;
      // Extra space above the bar at rest, easing away as it becomes the floating pill (transform: no layout shift).
      pill.style.transform = `translateY(${((1 - progress) * NAV_TOP_GAP).toFixed(1)}px)`;

      // 2. Pill geometry: 1152px -> 1104px width, 58px -> 52px height, 0px -> 999px radius
      const maxWidth = (1152 - progress * 48).toFixed(1);
      const height = (58 - progress * 6).toFixed(1);
      const radius = (progress * 999).toFixed(1);
      const innerPad = (24 - progress * 4).toFixed(1);

      pill.style.maxWidth = `${maxWidth}px`;
      pill.style.height = `${height}px`;
      pill.style.borderRadius = `${radius}px`;
      pill.style.padding = `0 ${innerPad}px`;

      // 3. Glass surface: background 0 -> 0.82, blur 0px -> 16px, shadow 0 -> 0.08
      const bgAlpha = (progress * 0.92).toFixed(3);
      const borderAlpha = (progress * 0.07).toFixed(3);
      const rimAlpha = (progress * 0.65).toFixed(3);
      const blurPx = (progress * 16).toFixed(1);
      const shadowY = (progress * 8).toFixed(1);
      const shadowBlur = (progress * 24).toFixed(1);
      const shadowAlpha = (progress * 0.08).toFixed(3);

      pill.style.backgroundColor = `rgba(255, 255, 255, ${bgAlpha})`;

      if (progress > 0.005) {
        pill.style.backdropFilter = `blur(${blurPx}px)`;
        pill.style.webkitBackdropFilter = `blur(${blurPx}px)`;
        pill.style.border = `1px solid rgba(0, 0, 0, ${borderAlpha})`;
        pill.style.boxShadow = `0 0 0 1px rgba(255, 255, 255, ${rimAlpha}) inset, 0 ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha})`;
      } else {
        pill.style.backdropFilter = 'none';
        pill.style.webkitBackdropFilter = 'none';
        pill.style.border = '1px solid transparent';
        pill.style.boxShadow = 'none';
      }

      // 4. Center links spacing: 32px -> 26px
      if (centerNav) {
        const gap = (32 - progress * 6).toFixed(1);
        centerNav.style.gap = `${gap}px`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateNavProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateNavProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleNodeHover = (nodeName: string | null) => {
    setHoveredNode(nodeName);
    setHeroEnergy(nodeName ? 0.85 : 0);
  };

  // Desktop subtle pointer parallax (Step 4.2: logo 4-6px, network 3-5px, dashboard 5-8px, background 2-4px)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      setHeroParallax({
        logo: { x: dx * 5, y: dy * 4.5 },
        network: { x: dx * 4, y: dy * 3 },
        dashboard: { x: dx * 7, y: dy * 5.5 },
        background: { x: dx * 3, y: dy * 2.5 },
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      const map: Record<string, string> = {
        ':B5_U9VCRp': 'hero',
        'B5_U9VCRp': 'hero',
        ':DXn5Hibuv': 'features',
        'DXn5Hibuv': 'features',
        ':W_2F8FmqT': 'capabilities',
        'W_2F8FmqT': 'capabilities',
        ':UMje28XpX': 'how-it-works',
        'UMje28XpX': 'how-it-works',
        ':WYSe0v1Nz': 'security',
        'WYSe0v1Nz': 'security',
      };
      const targetId = map[hash] || hash;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Features section: Scroll spy to update active feature tab as cards roll up
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('features');
      if (!section) return;
      const sectionRect = section.getBoundingClientRect();
      // Only process when features section is active or in view
      if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) return;

      const threshold = 150; // trigger as card nears sticky top (110px)
      for (let i = 3; i >= 0; i--) {
        const el = document.getElementById(`feature-card-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            setActiveFeatureTab(i);
            return;
          }
        }
      }
      setActiveFeatureTab(0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP animations: init when landing tab is active
  useEffect(() => {
    if (activeTab !== 'landing') return;
    // Small delay ensures DOM is painted before GSAP measures elements
    const timer = setTimeout(() => {
      initGSAPAnimations();
    }, 120);
    return () => {
      clearTimeout(timer);
      destroyGSAPAnimations();
    };
  }, [activeTab]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', color: '#111', position: 'relative' }}>
      {/* Full-Page Drifting Snowfall Layer (Round 8 - Fix U) */}
      <div
        id="fullpage-snowfall-root"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 90,
          overflow: 'hidden',
        }}
      />
      {/* View Switcher Controls (Fixed Bottom-Right) */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          gap: 6,
          background: 'rgba(7, 11, 62, 0.92)',
          backdropFilter: 'blur(16px)',
          padding: '5px 7px',
          borderRadius: 30,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }}
      >
        <button
          onClick={() => setActiveTab('landing')}
          style={{
            padding: '7px 16px',
            borderRadius: 20,
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === 'landing' ? '#012bff' : 'transparent',
            color: activeTab === 'landing' ? '#fff' : 'rgba(255, 255, 255, 0.75)'
          }}
        >
          Full Landing Page
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '7px 16px',
            borderRadius: 20,
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === 'catalog' ? '#012bff' : 'transparent',
            color: activeTab === 'catalog' ? '#fff' : 'rgba(255, 255, 255, 0.75)'
          }}
        >
          Components ({18 + 12})
        </button>
        <button
          onClick={() => setActiveTab('404')}
          style={{
            padding: '7px 16px',
            borderRadius: 20,
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === '404' ? '#012bff' : 'transparent',
            color: activeTab === '404' ? '#fff' : 'rgba(255, 255, 255, 0.75)'
          }}
        >
          404 Page
        </button>
      </div>

      {activeTab === 'landing' && (
        <>
          {/* ── Round 10 (Fix X, Y, Z) & Round 11 (Fix AA): Decoupled Full-Page Snowfall Layer ── */}
          <FullPageSnowfallLayer ref={snowfallRef} />

          {/* NAVIGATION BAR — Transparent at top, continuously scroll-scrubbed into floating pill (Fix C) */}
          <header
            id="site-header"
            style={{
              opacity: 0, // revealed once the hero logo has assembled (animateHeroContentReveal)
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              width: '100%',
              pointerEvents: 'none',
              display: 'flex',
              justifyContent: 'center',
              padding: '0px 0px 0',
              boxSizing: 'border-box',
            }}
          >
            <div
              id="site-nav-pill"
              className="nav-pill-capsule"
              style={{
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: 1152,
                height: 58,
                borderRadius: 0,
                transform: `translateY(${NAV_TOP_GAP}px)`,
                background: 'transparent',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                border: '1px solid transparent',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                margin: '0 auto',
                boxSizing: 'border-box',
              }}
            >
              {/* Logo — real IntelliLink brand mark (icon only) + wordmark text */}
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' }}>
                <img
                  src="/intellilink-icon-3d.png"
                  alt="IntelliLink logo"
                  style={{
                    width: 26,
                    height: 26,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                {/* Wordmark with the brand's three forward chevrons under "Link" (right-aligned), as in the logo lockup */}
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span style={{ fontSize: 16.5, fontWeight: 600, color: '#0d1b3e', letterSpacing: '-0.02em', fontFamily: 'inherit', lineHeight: 1 }}>IntelliLink</span>
                  <svg width="20" height="7" viewBox="0 0 20 7" fill="none" stroke="#0ea5e9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block', marginRight: 1 }}>
                    <path d="M1.5 1 4.5 3.5 1.5 6" />
                    <path d="M7.5 1 10.5 3.5 7.5 6" />
                    <path d="M13.5 1 16.5 3.5 13.5 6" />
                  </svg>
                </span>
              </a>

              {/* Center nav links */}
              <nav id="site-center-nav" className="header-center-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                {[
                  { label: 'Solution', href: '/#features' },
                  { label: 'Platform', href: '/#capabilities' },
                  { label: 'Integrations', href: '/#integrations' },
                  { label: 'Security', href: '/#security' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('/#')) {
                        e.preventDefault();
                        smoothScrollTo(item.href.replace('/', ''), -50);
                      }
                    }}
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'rgba(13,27,62,0.65)',
                      textDecoration: 'none',
                      fontFamily: 'inherit',
                      letterSpacing: '-0.01em',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#0d1b3e'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(13,27,62,0.65)'; }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Right CTA buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <a
                  className="nav-secondary-cta"
                  href="/#features"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '7px 16px',
                    borderRadius: 9999,
                    border: '1px solid rgba(13,27,62,0.14)',
                    background: 'rgba(255,255,255,0.85)',
                    fontSize: 13.5, fontWeight: 500,
                    color: '#0d1b3e',
                    textDecoration: 'none', fontFamily: 'inherit',
                    cursor: 'pointer', letterSpacing: '-0.01em',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(13,27,62,0.28)'; e.currentTarget.style.background = 'rgba(255,255,255,1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(13,27,62,0.14)'; e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; }}
                >
                  Explore Solutions
                </a>
                <a
                  href="/"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '7px 18px',
                    borderRadius: 9999,
                    border: 'none',
                    background: PRIMARY_BLUE,
                    fontSize: 13.5, fontWeight: 500,
                    color: '#ffffff',
                    textDecoration: 'none', fontFamily: 'inherit',
                    cursor: 'pointer', letterSpacing: '-0.01em',
                    boxShadow: PRIMARY_BLUE_SHADOW,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = PRIMARY_BLUE_HOVER; e.currentTarget.style.boxShadow = PRIMARY_BLUE_SHADOW_HOVER; }}
                  onMouseLeave={e => { e.currentTarget.style.background = PRIMARY_BLUE; e.currentTarget.style.boxShadow = PRIMARY_BLUE_SHADOW; }}
                >
                  Request a demo
                </a>
              </div>
            </div>
          </header>

          <main
            style={{
              width: '100%',
              position: 'relative',
              overflowX: 'clip',
              marginTop: '-64px',
              backgroundColor: '#ffffff',
              // Soft blurred sky-blue wash across the top of the page (same treatment as the reference), fading to white.
              backgroundImage: [
                // A little extra blue at the very top so the wash is as strong as the reference's.
                'linear-gradient(180deg, rgba(14, 150, 235, 0.2) 0px, rgba(14, 150, 235, 0.08) 220px, rgba(14, 150, 235, 0) 470px)',
                'radial-gradient(ellipse 1400px 900px at 15% 1600px, rgba(147, 197, 253, 0.10), transparent 65%)',
                'radial-gradient(ellipse 1400px 900px at 85% 2600px, rgba(147, 197, 253, 0.08), transparent 65%)',
                'radial-gradient(ellipse 1600px 1000px at 50% 3800px, rgba(147, 197, 253, 0.05), transparent 70%)',
              ].join(', '),
              backgroundSize: '100% 470px, auto, auto, auto',
              backgroundPosition: '0 0, 0 0, 0 0, 0 0',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Page-top wash: the blurred sky-blue plate, nudged toward the brand cyan, with a fine dithered grain that
                matches the hero card's texture. Sits behind everything and fades out on its own. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1250,
                zIndex: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'url(/page-blur-bg.png)',
                  backgroundSize: 'auto 1250px',
                  backgroundPosition: 'center top',
                  backgroundRepeat: 'no-repeat',
                  filter: 'hue-rotate(-12deg) saturate(1.1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: WASH_GRAIN,
                  backgroundSize: '220px 220px',
                  opacity: 0.4,
                  WebkitMaskImage: 'linear-gradient(180deg, #000 0px, rgba(0,0,0,0.55) 380px, transparent 800px)',
                  maskImage: 'linear-gradient(180deg, #000 0px, rgba(0,0,0,0.55) 380px, transparent 800px)',
                }}
              />
            </div>

            {/* 1. UNIFIED HERO SECTION — Restructured vertical order (Fix J): Nav -> Logo -> Soft Transition -> Headline -> Description -> CTAs -> Network/Card -> Integration Rail */}
          <section
            id="hero"
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              position: 'relative',
              overflow: 'hidden',
              paddingTop: `calc(clamp(96px, 12vh, 128px) + ${NAV_TOP_GAP}px)`,
              paddingBottom: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div id=":B5_U9VCRp" style={{ position: 'relative', top: -100 }} />

            {/* ── 1. INTELLILINK 3D LOGO STAGE (Fix J: Large, fully visible, unmasked, no text overlapping it) ── */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
                padding: '4px 20px 0',
                marginBottom: 'clamp(24px, 3.2vh, 36px)',
              }}
            >
              <HeroIntelligenceCore
                onNodeHovered={hoveredNode}
                interactiveEnergy={heroEnergy}
                onIntroComplete={() => {
                  animateHeroContentReveal();
                }}
                onDrip={(tip) => snowfallRef.current?.spawnFromTip(tip)}
              />
            </div>

            {/* ── 2. HERO CONTENT (Headline, Description, CTAs in their own clear space — gated by Fix P) ── */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: 1400,
                width: '100%',
                margin: '0 auto',
                padding: '0 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Headline — single line on desktop, highest contrast navy, Inter 600, tight tracking matching Nguyen */}
              <h1
                id="hero-heading"
                style={{
                  fontFamily: "var(--font-inter, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif)",
                  fontSize: 'clamp(38px, 5vw, 68px)',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  letterSpacing: '-0.035em',
                  color: '#0a192f',
                  margin: '0 auto clamp(14px, 1.8vh, 20px)',
                  maxWidth: 960,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                }}
              >
                Connect. Understand. Act.
              </h1>

              {/* Subtext — Inter 400, muted slate color, refined line-height matching Nguyen */}
              <p
                id="hero-subtext"
                style={{
                  fontFamily: "var(--font-inter, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif)",
                  fontSize: 'clamp(16.5px, 1.4vw, 20px)',
                  fontWeight: 400,
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em',
                  color: '#0b1230',
                  maxWidth: 760,
                  margin: '0 auto clamp(28px, 3.6vh, 40px)',
                  opacity: 0,
                }}
              >
                The enterprise AI platform that connects your systems, data,{' '}<br className="hero-subtext-br" />
                and AI agents — so your teams can get answers and get work done.
              </p>

              {/* CTA Buttons — refined pill buttons with subtle depth matching Nguyen */}
              <div id="hero-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 'clamp(36px, 4.5vh, 48px)', opacity: 0 }}>
                {/* Explore solutions button */}
                <a
                  href="/#features"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '9px 24px',
                    borderRadius: 9999,
                    border: '1px solid rgba(13,27,62,0.15)',
                    background: '#ffffff',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#0a192f',
                    textDecoration: 'none',
                    fontFamily: "var(--font-inter, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif)",
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    letterSpacing: '-0.01em',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.borderColor = 'rgba(13,27,62,0.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(13,27,62,0.15)'; }}
                >
                  Explore solutions
                </a>
                {/* Request a demo button */}
                <a
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 24px',
                    borderRadius: 9999,
                    border: 'none',
                    background: PRIMARY_BLUE,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontFamily: "var(--font-inter, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif)",
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    letterSpacing: '-0.01em',
                    boxShadow: PRIMARY_BLUE_SHADOW,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = PRIMARY_BLUE_HOVER; e.currentTarget.style.boxShadow = PRIMARY_BLUE_SHADOW_HOVER; }}
                  onMouseLeave={e => { e.currentTarget.style.background = PRIMARY_BLUE; e.currentTarget.style.boxShadow = PRIMARY_BLUE_SHADOW; }}
                >
                  Request a demo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* ── REAL PRODUCT UI CARD (Clean, Static, Centered — Zero Wires, Zero Scroll Distortion) ── */}
              <div
                id="hero-card"
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 1152,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  padding: '12px 16px',
                }}
              >
                <div
                  id="hero-dashboard-card"
                  style={{
                    zIndex: 4,
                    width: '100%',
                    maxWidth: 960,
                    margin: '0 auto',
                    opacity: 0,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <RealProductUICard />
                </div>
              </div>

              {/* The "connects with your systems" strip now lives inside the product card's backdrop (EnterpriseLogoCloud).
                  This spacer reserves the room that backdrop opens into below the card; its height is set in gsap-animations.ts. */}
              <div id="integrations" />
              <div id="hero-card-clearance" style={{ height: 110 }} />
            </div>

            {/* Mobile-specific rule to hide surrounding floating nodes and collapse nav on small viewports */}
            <style>{`
              @media (max-width: 860px) {
                .header-center-nav {
                  display: none !important;
                }
              }
              .hero-subtext-br { display: none; }
              @media (min-width: 640px) {
                .hero-subtext-br { display: inline; }
              }
              @media (max-width: 640px) {
                .nav-secondary-cta { display: none !important; }
                #site-nav-pill { padding-left: 16px !important; padding-right: 16px !important; }
              }
              @media (max-width: 900px) {
                .features-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
                .features-tabs { position: static !important; flex-direction: row !important; flex-wrap: wrap; }
                .feature-split { grid-template-columns: 1fr !important; }
                .bento-grid { grid-template-columns: 1fr !important; }
                .bento-grid > * { grid-column: auto !important; grid-row: auto !important; }
                .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 28px 20px !important; max-width: 100% !important; }
                .industry-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                .security-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 24px !important; }
              }
              @media (max-width: 1023px) {
                .hero-surrounding-nodes {
                  display: none !important;
                }
                .hero-wiring-desktop {
                  display: none !important;
                }
                #hero-heading {
                  white-space: normal !important;
                }
              }
            `}</style>
          </section>


          {/* 3. HOW IT WORKS (3 CARDS MATCHING REFERENCE SCREENSHOT) */}
          <div id=":UMje28XpX" style={{ position: 'relative', top: -100 }} />
          <section id="how-it-works" style={{ padding: '48px 20px 96px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 54, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Circular badge icon at the top */}
              <div style={{ marginBottom: 18 }}>
                <Tag variant="BYnhqdO_k" X2sPxkebi="How it works" />
              </div>

              <h2
                className="section-heading"
                style={{
                  fontSize: 'clamp(36px, 4.5vw, 54px)',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#070b3e',
                  margin: '0 auto 16px',
                  maxWidth: 720,
                  textAlign: 'center'
                }}
              >
                From question to<br />
                action, in 3 steps
              </h2>

              <p
                style={{
                  fontSize: 'clamp(15px, 1.8vw, 17px)',
                  lineHeight: 1.5,
                  color: 'rgba(0, 0, 0, 0.6)',
                  maxWidth: 520,
                  margin: '0 auto',
                  textAlign: 'center'
                }}
              >
                Connect your systems. Understand your data.<br />
                Take action with confidence.
              </p>
            </div>

            {/* 3 Cards Row */}
            <div
              className="hiw-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 24,
                alignItems: 'stretch'
              }}
            >
              {/* CARD 1: Connect */}
              <div className="how-it-works-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    width: '100%',
                    height: 330,
                    borderRadius: 24,
                    backgroundImage: 'url(/assets/7JLgNnHNWS2ZheqZrTXBTaVCv6Q.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(9, 174, 255, 0.08)',
                    border: '1px solid rgba(9, 174, 255, 0.2)'
                  }}
                >
                  <Animated_beam
                    centerImage="/assets/5rnS6ZCipvO1sGwgHOoGCHbeQ.png"
                    leftNodes={[
                      { image: "/assets/67KAgefBnY8ob2OZJF2YtXB62lQ.svg" },
                      { image: "/assets/Ia3vfbrJ2ZYAKOWYt7ViYWKH0qE.svg" },
                      { image: "/assets/A9rVxbOn8Rbsb7NkSerXtcObU.svg" }
                    ]}
                    rightNodes={[
                      { image: "/assets/cUjvFWsC0dpnKqAJewNpZrnN0Y.svg" },
                      { image: "/assets/uQoI3ZJydrnLmgJ8Zp1rKkaHDg.svg" },
                      { image: "/assets/elza3OAAVaAmSXHYWWHVybQHT5I.svg" }
                    ]}
                    nodeSize={48}
                    centerSize={62}
                    padding={18}
                    gap={24}
                    nodeBackground="#ffffff"
                    nodeBorderColor="rgba(229, 231, 235, 0.9)"
                    nodeBorderWidth={1}
                    nodeRadius={12}
                    pathColor="rgb(9, 174, 255)"
                    pathWidth={2.5}
                    pathOpacity={0.4}
                    gradientStartColor="rgb(1, 43, 255)"
                    gradientStopColor="rgba(1, 43, 255, 0.2)"
                    curvature={75}
                    endYOffset={10}
                    duration={2}
                    delay={0}
                    stagger={0.25}
                    repeatDelay={0}
                    speedVariation={1}
                    easing="linear"
                    reverseFlow={false}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div style={{ padding: '20px 4px' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px', color: '#111827' }}>Connect</h3>
                  <p style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.6)', margin: 0, lineHeight: 1.5 }}>
                    Connect your enterprise systems, data, documents and knowledge.
                  </p>
                </div>
              </div>

              {/* CARD 2: Understand */}
              <div className="how-it-works-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    width: '100%',
                    height: 330,
                    borderRadius: 24,
                    backgroundImage: 'url(/assets/svSq1hHi3TFnZce7BPcnb7uXyFw.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '24px 20px',
                    boxShadow: '0 8px 30px rgba(9, 174, 255, 0.08)',
                    border: '1px solid rgba(9, 174, 255, 0.2)'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 320,
                      minHeight: 180,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 18,
                      padding: '22px 20px 16px',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      zIndex: 1
                    }}
                  >
                    <div style={{ minHeight: 64, fontSize: 14.5, color: '#111', lineHeight: 1.45, fontWeight: 450 }}>
                      <PromptTypewriter
                        texts={[
                          'Flag any transactions above $10,000 from this week.',
                          'Summarise all expenses from last month by category.',
                          'Show invoices that are overdue by more than 30 days.',
                        ]}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(17, 22, 46, 0.65)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', paddingTop: 14 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
                      </svg>
                      <span>New suggestion</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '20px 4px' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px', color: '#111827' }}>Understand</h3>
                  <p style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.6)', margin: 0, lineHeight: 1.5 }}>
                    AI understands context, relationships and business rules.
                  </p>
                </div>
              </div>

              {/* CARD 3: Act */}
              <div className="how-it-works-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    width: '100%',
                    height: 330,
                    borderRadius: 24,
                    backgroundImage: 'url(/assets/3zE3eLjjpwMLVNUEK5PAUEZaCJk.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '24px 20px',
                    boxShadow: '0 8px 30px rgba(9, 174, 255, 0.08)',
                    border: '1px solid rgba(9, 174, 255, 0.2)'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 320,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 18,
                      padding: '16px 18px',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      zIndex: 1
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '1px solid rgba(0, 0, 0, 0.06)', marginBottom: 12 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>Agent running</span>
                    </div>

                    {/* List of 5 items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#374151' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Collecting recent updates</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#374151' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Identifying completed work</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#374151' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Reviewing open decisions</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#4b5563' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" strokeOpacity="0.85" />
                        </svg>
                        <span>Preparing recommended actions</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#4b5563' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" strokeOpacity="0.85" />
                        </svg>
                        <span>Creating the final brief</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '20px 4px' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px', color: '#111827' }}>Act</h3>
                  <p style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.6)', margin: 0, lineHeight: 1.5 }}>
                    Get an answer, recommendation, report or execute the task.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. INTELLIGENCE THAT WORKS ACROSS YOUR ENTERPRISE */}
          <div id="solution" />
          <div id=":DXn5Hibuv" style={{ position: 'relative', top: -100 }} />
          <section id="features" style={{ padding: '90px 20px 110px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 54, textAlign: 'center' }}>
              {/* Badge with 2x2 grid icon */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 100,
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  marginBottom: 20,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>

              <h2
                className="section-heading"
                style={{
                  fontSize: 'clamp(36px, 4.5vw, 54px)',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#070b3e',
                  margin: '0 auto 16px',
                  maxWidth: 720,
                }}
              >
                Intelligence that works<br />
                across your enterprise.
              </h2>

              <p
                style={{
                  fontSize: 'clamp(15px, 1.8vw, 17px)',
                  lineHeight: 1.5,
                  color: 'rgba(0, 0, 0, 0.6)',
                  maxWidth: 540,
                  margin: '0 auto',
                }}
              >
                One intelligent workspace to search, understand, orchestrate, and act across your business systems.
              </p>
            </div>

            {/* Main Content Layout: Sticky Left Tabs + Stacked Right Cards */}
            <div
              className="features-layout"
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                gap: 48,
                alignItems: 'start',
              }}
            >
              {/* Left Column: Sticky Tabs */}
              <div
                className="features-tabs"
                style={{
                  position: 'sticky',
                  top: 110,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  zIndex: 10,
                }}
              >
                {[
                  { id: 0, num: '01', label: 'Intelligent search' },
                  { id: 1, num: '02', label: 'Workflow automation' },
                  { id: 2, num: '03', label: 'Live activity' },
                  { id: 3, num: '04', label: 'Flexible workspace' },
                ].map((tab) => {
                  const isActive = activeFeatureTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      className="feature-tab-btn"
                      onClick={() => {
                        setActiveFeatureTab(tab.id);
                        smoothScrollTo(`#feature-card-${tab.id}`, -110);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 14px',
                        borderRadius: 10,
                        border: isActive ? '1px solid rgba(0, 0, 0, 0.25)' : '1px solid rgba(0, 0, 0, 0.08)',
                        background: '#ffffff',
                        boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: isActive ? '#111827' : 'rgba(0, 0, 0, 0.45)',
                          background: 'rgba(0, 0, 0, 0.04)',
                          padding: '2px 6px',
                          borderRadius: 5,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {tab.num}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#111827' : 'rgba(0, 0, 0, 0.75)',
                        }}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Stack of 4 Cards that roll up one by one */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 40 }}>
                {/* CARD 1: Find answers across all your work */}
                <div
                  id="feature-card-0"
                  className="feature-split"
                  onClick={() => setActiveFeatureTab(0)}
                  style={{
                    position: 'sticky',
                    top: 110,
                    zIndex: 1,
                    background: '#ffffff',
                    borderRadius: 24,
                    border: activeFeatureTab === 0 ? '1.5px solid #2563eb' : '1px solid rgba(0, 0, 0, 0.09)',
                    boxShadow: activeFeatureTab === 0
                      ? '0 -4px 20px rgba(0, 0, 0, 0.04), 0 16px 36px rgba(37, 99, 235, 0.08)'
                      : '0 -4px 20px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.04)',
                    display: 'grid',
                    gridTemplateColumns: '45% 55%',
                    overflow: 'hidden',
                    transition: 'border 0.2s ease, box-shadow 0.2s ease',
                    marginBottom: 60,
                  }}
                >
                  <div style={{ padding: '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <h3 style={{ fontSize: 21, fontWeight: 600, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.015em' }}>
                      Find answers<br />across all your work
                    </h3>
                    <p style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.6)', lineHeight: 1.55, margin: 0 }}>
                      Search documents, conversations, projects, and connected tools from one place using everyday language.
                    </p>
                  </div>
                  <div
                    style={{
                      height: 380,
                      backgroundImage: 'url(/assets/7hinuK1ca5NnE0jxQx6Xp0Rgc.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        width: '88%',
                        maxWidth: 340,
                        background: 'rgba(255, 255, 255, 0.94)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: 18,
                        padding: '18px 20px',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(0, 0, 0, 0.4)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span style={{ fontSize: 13.5, color: 'rgba(0, 0, 0, 0.5)' }}>Searching across your system</span>
                      </div>
                      <div
                        style={{
                          background: 'rgba(0, 0, 0, 0.035)',
                          borderRadius: 12,
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 450 }}>Documents</span>
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 450 }}>Conversations</span>
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 450 }}>Tasks</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Automate repetitive work */}
                <div
                  id="feature-card-1"
                  className="feature-split"
                  onClick={() => setActiveFeatureTab(1)}
                  style={{
                    position: 'sticky',
                    top: 110,
                    zIndex: 2,
                    background: '#ffffff',
                    borderRadius: 24,
                    border: activeFeatureTab === 1 ? '1.5px solid #2563eb' : '1px solid rgba(0, 0, 0, 0.09)',
                    boxShadow: activeFeatureTab === 1
                      ? '0 -6px 24px rgba(0, 0, 0, 0.06), 0 16px 36px rgba(37, 99, 235, 0.08)'
                      : '0 -6px 24px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.04)',
                    display: 'grid',
                    gridTemplateColumns: '45% 55%',
                    overflow: 'hidden',
                    transition: 'border 0.2s ease, box-shadow 0.2s ease',
                    marginBottom: 60,
                  }}
                >
                  <div style={{ padding: '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <h3 style={{ fontSize: 21, fontWeight: 600, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.015em' }}>
                      Automate repetitive work
                    </h3>
                    <p style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.6)', lineHeight: 1.55, margin: 0 }}>
                      Create reliable workflows that handle recurring tasks, updates, notifications, and handoffs automatically.
                    </p>
                  </div>
                  <div
                    style={{
                      height: 380,
                      backgroundImage: 'url(/assets/uQIV8SHQg9uwGTWj9BcWtwDTp9E.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'rgba(255, 255, 255, 0.96)',
                        backdropFilter: 'blur(12px)',
                        padding: '11px 22px',
                        borderRadius: 100,
                        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.9)',
                        zIndex: 2,
                      }}
                    >
                      <RippleLoader
                        cellSize={3.5}
                        spacing={1.2}
                        radius={2}
                        duration={1.5}
                        delay={0.1}
                        startColor="rgb(49, 91, 232)"
                        endColor="rgb(49, 91, 232)"
                      />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>Automating</span>
                    </div>

                    {/* Converging cyan glowing lines beneath */}
                    <svg
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: 200,
                        pointerEvents: 'none',
                      }}
                      viewBox="0 0 400 200"
                      fill="none"
                    >
                      <path d="M70 200 C 130 140, 185 80, 200 45" stroke="rgba(9, 174, 255, 0.35)" strokeWidth="2" />
                      <path d="M200 200 L 200 45" stroke="rgba(9, 174, 255, 0.45)" strokeWidth="2.2" />
                      <path d="M330 200 C 270 140, 215 80, 200 45" stroke="rgba(9, 174, 255, 0.35)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* CARD 3: See what's happening in real time */}
                <div
                  id="feature-card-2"
                  className="feature-split"
                  onClick={() => setActiveFeatureTab(2)}
                  style={{
                    position: 'sticky',
                    top: 110,
                    zIndex: 3,
                    background: '#ffffff',
                    borderRadius: 24,
                    border: activeFeatureTab === 2 ? '1.5px solid #2563eb' : '1px solid rgba(0, 0, 0, 0.09)',
                    boxShadow: activeFeatureTab === 2
                      ? '0 -6px 24px rgba(0, 0, 0, 0.06), 0 16px 36px rgba(37, 99, 235, 0.08)'
                      : '0 -6px 24px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.04)',
                    display: 'grid',
                    gridTemplateColumns: '45% 55%',
                    overflow: 'hidden',
                    transition: 'border 0.2s ease, box-shadow 0.2s ease',
                    marginBottom: 60,
                  }}
                >
                  <div style={{ padding: '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <h3 style={{ fontSize: 21, fontWeight: 600, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.015em' }}>
                      See what's<br />happening in real time
                    </h3>
                    <p style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.6)', lineHeight: 1.55, margin: 0 }}>
                      Follow current activity, completed actions, errors, and upcoming work from one clear operational view.
                    </p>
                  </div>
                  <div
                    style={{
                      height: 380,
                      backgroundImage: 'url(/assets/GomaCIogYngvxNRqv2ME24dcRUs.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 14,
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        width: '88%',
                        maxWidth: 340,
                        background: 'rgba(255, 255, 255, 0.94)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: 100,
                        padding: '10px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#012bff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1.5s linear infinite' }}>
                        <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
                        <path d="M12 3a9 9 0 0 1 9 9" />
                      </svg>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Intellilink is automating your tasks</span>
                    </div>
                    <div
                      style={{
                        width: '88%',
                        maxWidth: 340,
                        background: 'rgba(255, 255, 255, 0.94)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: 18,
                        padding: '18px 20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      <p style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.65)', lineHeight: 1.55, margin: 0 }}>
                        AI handles repetitive tasks in the background, from organizing information and updating records to assigning work and sending notifications. Automated
                      </p>
                    </div>
                  </div>
                </div>

                {/* CARD 4: Work your way, in one place */}
                <div
                  id="feature-card-3"
                  className="feature-split"
                  onClick={() => setActiveFeatureTab(3)}
                  style={{
                    position: 'sticky',
                    top: 110,
                    zIndex: 4,
                    background: '#ffffff',
                    borderRadius: 24,
                    border: activeFeatureTab === 3 ? '1.5px solid #2563eb' : '1px solid rgba(0, 0, 0, 0.09)',
                    boxShadow: activeFeatureTab === 3
                      ? '0 -6px 24px rgba(0, 0, 0, 0.06), 0 16px 36px rgba(37, 99, 235, 0.08)'
                      : '0 -6px 24px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.04)',
                    display: 'grid',
                    gridTemplateColumns: '45% 55%',
                    overflow: 'hidden',
                    transition: 'border 0.2s ease, box-shadow 0.2s ease',
                    marginBottom: 0,
                  }}
                >
                  <div style={{ padding: '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <h3 style={{ fontSize: 21, fontWeight: 600, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.015em' }}>
                      Work your way, in one place
                    </h3>
                    <p style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.6)', lineHeight: 1.55, margin: 0 }}>
                      Bring conversations, insights, tasks, and business context together in a workspace built around how your teams work.
                    </p>
                  </div>
                  <div
                    style={{
                      height: 380,
                      backgroundImage: 'url(/assets/um0Pkcj6XWmxCznDT9BJPaQKV8.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                      overflow: 'hidden',
                    }}
                  >
                    <WorkspacePreview />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. CAPABILITIES - "Built to handle complex work." */}
          <div id="platform" />
          <div id=":W_2F8FmqT" style={{ position: 'relative', top: -100 }} />
          <section id="capabilities" style={{ padding: '96px 24px', maxWidth: 1240, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Circular Anchor Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#fff',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  marginBottom: 20,
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111827"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="5" r="3" />
                  <line x1="12" y1="22" x2="12" y2="8" />
                  <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                </svg>
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: 'clamp(36px, 4.5vw, 54px)',
                  fontWeight: 600,
                  color: '#070b3e',
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  margin: '0 0 16px 0',
                  textAlign: 'center',
                }}
              >
                Built to handle<br />complex work.
              </h2>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 16.5,
                  color: 'rgba(0, 0, 0, 0.65)',
                  lineHeight: 1.6,
                  maxWidth: 520,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                Advanced intelligence for understanding information, reasoning through problems, and producing reliable outcomes.
              </p>
            </div>

            {/* 2x2 Bento Grid */}
            <div
              className="bento-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
              }}
            >
              {/* Card 1: Multimodal understanding (1 col) */}
              <div
                className="bento-capability-card"
                style={{
                  gridColumn: 'span 1',
                  background: '#ffffff',
                  borderRadius: 20,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  padding: 8,
                  boxSizing: 'border-box',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    background: '#fafbfc',
                    borderRadius: 16,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    minHeight: 510,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {/* The pills scroll past the card's edges: fade them out instead of cutting them off */}
                    <div
                      style={{
                        transform: 'scale(0.95)',
                        transformOrigin: 'center',
                        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)',
                        maskImage: 'linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)',
                      }}
                    >
                      <MultimodalCard />
                    </div>
                  </div>
                  <div style={{ padding: '24px 24px 28px 24px' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#070b3e', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
                      Multimodal understanding
                    </h3>
                    <p style={{ fontSize: 14.5, color: 'rgba(0, 0, 0, 0.62)', margin: 0, lineHeight: 1.5 }}>
                      Understand every format within one shared context.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Persistent memory (2 cols) */}
              <div
                className="bento-capability-card"
                style={{
                  gridColumn: 'span 2',
                  background: '#ffffff',
                  borderRadius: 20,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  padding: 8,
                  boxSizing: 'border-box',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    background: '#fafbfc',
                    borderRadius: 16,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    minHeight: 510,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      minHeight: 340,
                    }}
                  >
                    <MemoryStack height={320} />
                  </div>
                  <div style={{ padding: '24px 24px 28px 24px' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#070b3e', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
                      Persistent memory
                    </h3>
                    <p style={{ fontSize: 14.5, color: 'rgba(0, 0, 0, 0.62)', margin: 0, lineHeight: 1.5 }}>
                      Remember preferences, decisions, and important project context.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Parallel execution (2 cols) */}
              <div
                className="bento-capability-card"
                style={{
                  gridColumn: 'span 2',
                  background: '#ffffff',
                  borderRadius: 20,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  padding: 8,
                  boxSizing: 'border-box',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    background: '#fafbfc',
                    borderRadius: 16,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    minHeight: 510,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: 340,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 20, left: 30, right: 30, bottom: 65 }}>
                      <Animated_lines_2
                        mode="converge"
                        lineCount={5}
                        flipVertical={true}
                        flipHorizontal={false}
                        convergeX={0.5}
                        convergeY={0.9}
                        bend={0.45}
                        meetIcon="/intellilink-icon-3d.png"
                        meetIconSize={48}
                        meetIconBackground="#ffffff"
                        meetIconBorderColor="rgba(0, 0, 0, 0.12)"
                        meetIconBorderWidth={1}
                        meetIconRadius={999}
                        meetIconPadding={10}
                        showCards={true}
                        cards={[
                          { text: 'Research' },
                          { text: 'Analysis' },
                          { text: 'Writing' },
                          { text: 'Documenting' },
                          { text: 'Storing' },
                        ]}
                        cardBackground="#ffffff"
                        cardTextColor="#000000"
                        cardBorderColor="rgba(0, 0, 0, 0.12)"
                        cardBorderWidth={1}
                        cardRadius={40}
                        cardPaddingX={16}
                        cardPaddingY={8}
                        cardIconSize={18}
                        fontSize={14}
                        fontWeight={500}
                        pathColor="rgba(0, 0, 0, 0.25)"
                        pathWidth={1.5}
                        pathOpacity={0.4}
                        gradientStartColor="rgb(1, 43, 255)"
                        gradientStopColor="rgba(1, 43, 255, 0.1)"
                        beamLength={24}
                        duration={2.2}
                        delay={0}
                        stagger={0.15}
                        repeatDelay={0}
                        speedVariation={0}
                        easing="linear"
                        reverse={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                  <div style={{ padding: '24px 24px 28px 24px' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#070b3e', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
                      Parallel execution
                    </h3>
                    <p style={{ fontSize: 14.5, color: 'rgba(0, 0, 0, 0.62)', margin: 0, lineHeight: 1.5 }}>
                      Run multiple workstreams and combine their results.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Model routing (1 col) */}
              <div
                className="bento-capability-card"
                style={{
                  gridColumn: 'span 1',
                  background: '#ffffff',
                  borderRadius: 20,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  padding: 8,
                  boxSizing: 'border-box',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    background: '#fafbfc',
                    borderRadius: 16,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    minHeight: 510,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 24,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: 18,
                        padding: '14px 20px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        width: '100%',
                        maxWidth: 290,
                        boxSizing: 'border-box',
                      }}
                    >
                      <div style={{ width: 22, height: 22, flexShrink: 0 }}>
                        <RippleLoader
                          cellSize={5}
                          spacing={1}
                          radius={3}
                          startColor="rgb(49, 91, 232)"
                          endColor="rgb(49, 91, 232)"
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 14.5,
                          color: 'rgba(0, 0, 0, 0.65)',
                          letterSpacing: '-0.01em',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Summarising spreadsheet
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '24px 24px 28px 24px' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#070b3e', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
                      Model routing
                    </h3>
                    <p style={{ fontSize: 14.5, color: 'rgba(0, 0, 0, 0.62)', margin: 0, lineHeight: 1.5 }}>
                      Select the best model for each task.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. METRICS - "What teams achieve with Intellilink" */}
          <section
            id="metrics"
            style={{
              position: 'relative',
              backgroundColor: '#fafafa',
              overflow: 'hidden',
              padding: '100px 24px 260px 24px',
            }}
          >
            {/* Background Growth Curve */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 635,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <MetricsGrowthGraph startHeight={15} endHeight={100} duration={2.8} />
            </div>

            {/* Foreground Content */}
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Header */}
              <div style={{ maxWidth: 540, marginBottom: 48 }}>
                {/* Circular Badge with diagonal arrow up-right */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    marginBottom: 20,
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 54px)',
                    fontWeight: 600,
                    color: '#070b3e',
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    margin: '0 0 16px 0',
                  }}
                >
                  What teams achieve<br />with Intellilink
                </h2>

                <p
                  style={{
                    fontSize: 16.5,
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Advanced intelligence for understanding information, reasoning through problems, and producing reliable outcomes.
                </p>
              </div>

              {/* 2x2 Metric Cards Grid */}
              <div
                id="metrics-cards-grid"
                className="metrics-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(200px, 240px))',
                  gap: '36px 40px',
                  maxWidth: 520,
                }}
              >
                <MetricsCard number="3.2×" title="workflow throughput" />
                <MetricsCard number="68%" title="Faster resolution" />
                <MetricsCard number="42%" title="less manual work" />
                <MetricsCard number="99.2%" title="Task accuracy" />
              </div>
            </div>
          </section>

          {/* 7. INDUSTRIES - "Built for the way your enterprise works." */}
          {/* Layout-neutral stage: holds the perspective and the scroll trigger for the section's 3D flip-up */}
          <div className="industries-stage">
          <section
            id="industries"
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '110px 24px 120px 24px',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Centered Header */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 64,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Circular Tag Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    marginBottom: 20,
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 54px)',
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    margin: '0 0 16px 0',
                    textAlign: 'center',
                  }}
                >
                  Built for the way your<br />enterprise works.
                </h2>

                <p
                  style={{
                    fontSize: 16.5,
                    color: 'rgba(255, 255, 255, 0.65)',
                    lineHeight: 1.6,
                    maxWidth: 580,
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  Connect business data, AI agents, and enterprise systems to understand complex requests and turn intelligence into action.
                </p>
              </div>

              <IndustryIconStyles />
              {/* 3x2 Grid of Industry Cards */}
              <div
                className="industry-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '40px 24px',
                }}
              >
                {[
                  {
                    name: 'Financial services',
                    description: 'Organize information, support reviews, and streamline recurring reporting.',
                    icon: '/industry-financial.svg',
                  },
                  {
                    name: 'Retail and e-commerce',
                    description: 'Manage product information, customer requests, and operational updates.',
                    icon: '/industry-retail.svg',
                  },
                  {
                    name: 'Education',
                    description: 'Organize learning resources, administrative work, and student support.',
                    icon: '/industry-education.svg',
                  },
                  {
                    name: 'Healthcare',
                    description: 'Coordinate administrative workflows, summarize information, and support care teams.',
                    icon: '/industry-healthcare.svg',
                  },
                  {
                    name: 'Media and marketing',
                    description: 'Research audiences, create content, and coordinate campaign delivery.',
                    icon: '/industry-media.svg',
                  },
                  {
                    name: 'Technology',
                    description: 'Coordinate product development, customer insights, and internal operations.',
                    icon: '/industry-technology.svg',
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="industry-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 28,
                      padding: '32px 28px',
                      borderRadius: 16,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}
                    >
                      {INDUSTRY_ICONS[item.name]}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#ffffff',
                          margin: '0 0 8px 0',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {item.name}
                      </h4>
                      <p
                        style={{
                          fontSize: 14.5,
                          color: 'rgba(255, 255, 255, 0.65)',
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          </div>

          {/* 8. SECURITY - "We take security and privacy seriously" */}
          <div id=":WYSe0v1Nz" style={{ position: 'relative', top: -100 }} />
          <section
            id="security"
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '110px 24px 100px 24px',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Centered Header */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 44,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Circular Shield Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    marginBottom: 24,
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 54px)',
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  We take security and<br />privacy seriously
                </h2>
              </div>

              {/* WebGL/Shader Dotted Security Key Matrix */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 54 }}>
                <SecurityKeyMatrix />
              </div>

              {/* 4 Feature Columns */}
              <div
                className="security-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 32,
                  maxWidth: 960,
                  margin: '0 auto',
                  textAlign: 'left',
                }}
              >
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                    Secure access
                  </h4>
                  <p style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, margin: 0 }}>
                    Security controls independently assessed over an extended period.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                    Governance
                  </h4>
                  <p style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, margin: 0 }}>
                    Apply enterprise policies, permissions, and governance across connected systems
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                    Observability
                  </h4>
                  <p style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, margin: 0 }}>
                    Maintain visibility into AI activity, data access, workflows, and actions across the platform.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
                    Enterprise privacy
                  </h4>
                  <p style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, margin: 0 }}>
                    Designed to work within your existing enterprise security and privacy framework.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 9. TESTIMONIALS - "Trusted by Customers moved business forward." */}
          <section
            id="testimonials-section"
            style={{
              padding: '100px 0 60px 0',
              background: '#fafafa',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              {/* Centered Header */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Circular Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    marginBottom: 20,
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                  </svg>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 54px)',
                    fontWeight: 600,
                    color: '#070b3e',
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    margin: '0 0 16px 0',
                    textAlign: 'center',
                  }}
                >
                  Trusted by Customers<br />moved business forward.
                </h2>

                <p
                  style={{
                    fontSize: 16.5,
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: 1.5,
                    maxWidth: 580,
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  See how connected intelligence helps Customer find answers faster, reduce manual work, and act with confidence.
                </p>
              </div>
            </div>

            {/* Testimonials Carousel */}
            <div
              style={{
                width: '100%',
                position: 'relative',
                height: 680,
              }}
            >
              <SideSmoke side="left" color="#fafafa" />
              <SideSmoke side="right" color="#fafafa" />
              <StaggerTestimonials
                testimonials={testimonialsData}
                autoplay={false}
                pauseOnHover={false}
                interval={2000}
                surface="#fafafa"
                inactiveCard="#ffffff"
                activeCard="#ffffff"
                borderColor="rgba(0, 0, 0, 0.08)"
                accent="#012bff"
                inactiveText="rgba(0, 0, 0, 0.85)"
                activeText="#000000"
                mutedText="rgba(0, 0, 0, 0.55)"
                cardWidth={350}
                cardHeight={390}
                cardGap={235}
                activeLift={56}
                cardRadius="16px"
                quoteFont={{
                  fontSize: '20px',
                  letterSpacing: '0em',
                  lineHeight: 1.35,
                  fontWeight: 500,
                }}
                metaFont={{
                  fontSize: '12px',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.35,
                  fontStyle: 'normal',
                }}
                style={{
                  height: 680,
                  background: '#fafafa',
                }}
              />
            </div>
          </section>

          {/* 10. FAQS - "Questions about Intellilink, answered." */}
          <section
            id="faqs-section"
            style={{
              padding: '110px 24px 0 24px',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Centered Header */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 48,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <h2
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 54px)',
                    fontWeight: 600,
                    color: '#000000',
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    margin: '0 0 16px 0',
                    textAlign: 'center',
                  }}
                >
                  Questions about<br />Intellilink, answered.
                </h2>
                <p
                  style={{
                    fontSize: 16.5,
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: 1.5,
                    maxWidth: 500,
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  Learn how Intellilink connects your tools,<br />protects data, and supports your rollout.
                </p>
              </div>

              {/* FAQ Accordion List */}
              <div
                style={{
                  maxWidth: 640,
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {faqsData.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="faq-card"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: 14,
                        padding: '20px 26px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isOpen ? '0 4px 16px rgba(0, 0, 0, 0.03)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#111111',
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {faq.question}
                        </h4>
                        <span
                          style={{
                            fontSize: 20,
                            fontWeight: 300,
                            color: 'rgba(0, 0, 0, 0.45)',
                            userSelect: 'none',
                            lineHeight: 1,
                            minWidth: 16,
                            textAlign: 'center',
                          }}
                        >
                          {isOpen ? '—' : '+'}
                        </span>
                      </div>
                      {isOpen && (
                        <p
                          style={{
                            fontSize: 13.5,
                            color: 'rgba(0, 0, 0, 0.6)',
                            lineHeight: 1.55,
                            margin: '10px 0 0 0',
                            maxWidth: '90%',
                          }}
                        >
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 11. CTA + FOOTER SECTION - Sleek Black */}
          <footer
            id="cta-section"
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '120px 24px 0 24px',
              marginTop: 80,
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* CTA conversion message */}
              <div style={{ maxWidth: 680, marginBottom: 110 }}>
                <h2
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 56px)',
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    margin: '0 0 20px 0',
                  }}
                >
                  You’ve seen how Intellilink<br />works. Now put it to work.
                </h2>
                <p
                  style={{
                    fontSize: 16.5,
                    color: 'rgba(255, 255, 255, 0.75)',
                    lineHeight: 1.55,
                    margin: '0 0 32px 0',
                  }}
                >
                  Start with one goal, connect the right context,<br />and see what your team can move forward.
                </p>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 26px',
                    backgroundColor: '#012bff',
                    color: '#ffffff',
                    borderRadius: 999,
                    fontSize: 15,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(1, 43, 255, 0.35)',
                    transition: 'transform 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0020cc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#012bff')}
                >
                  Request a demo <span style={{ fontSize: 16 }}>&rarr;</span>
                </button>
              </div>

              {/* Brand and Product Links Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingBottom: 70,
                }}
              >
                {/* Left: Brand Logo & Tagline */}
                <div>
                  <img
                    src="/assets/5rnS6ZCipvO1sGwgHOoGCHbeQ.png"
                    alt="IntelliLink"
                    style={{
                      width: 140,
                      height: 'auto',
                      display: 'block',
                      marginBottom: 16,
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.65)',
                      margin: 0,
                    }}
                  >
                    A smarter way to get things done.
                  </p>
                </div>

                {/* Right: Product Navigation Column */}
                <div style={{ textAlign: 'left', minWidth: 160 }}>
                  <h5
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#ffffff',
                      margin: '0 0 16px 0',
                    }}
                  >
                    Product
                  </h5>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <a
                      href="#how-it-works"
                      style={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        textDecoration: 'none',
                        fontSize: 14.5,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
                    >
                      How it works
                    </a>
                    <a
                      href="#features"
                      style={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        textDecoration: 'none',
                        fontSize: 14.5,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
                    >
                      Features
                    </a>
                    <a
                      href="#capabilities"
                      style={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        textDecoration: 'none',
                        fontSize: 14.5,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
                    >
                      Capabilities
                    </a>
                    <a
                      href="#security"
                      style={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        textDecoration: 'none',
                        fontSize: 14.5,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
                    >
                      Security
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright Rail */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '24px 0 50px 0',
                }}
              >
                <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                  © 2026 Intellilink . All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </>
    )}

      {activeTab === 'catalog' && (
        <div style={{ flex: 1, padding: '70px 20px 100px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#070b3e', marginBottom: 12 }}>
              IntelliLink Component Catalog
            </h1>
            <p style={{ color: 'rgba(0,0,0,0.65)', maxWidth: 650, margin: '0 auto 24px' }}>
              All 18 Framer canvas design components and 12 TypeScript motion code components exported and running cleanly in React.
            </p>

            <div style={{ display: 'inline-flex', gap: 8, background: 'rgba(0,0,0,0.06)', padding: 4, borderRadius: 24 }}>
              <button
                onClick={() => setComponentFilter('all')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: componentFilter === 'all' ? '#012bff' : 'transparent',
                  color: componentFilter === 'all' ? '#fff' : '#444'
                }}
              >
                All Components (30)
              </button>
              <button
                onClick={() => setComponentFilter('framer')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: componentFilter === 'framer' ? '#012bff' : 'transparent',
                  color: componentFilter === 'framer' ? '#fff' : '#444'
                }}
              >
                Framer Design (18)
              </button>
              <button
                onClick={() => setComponentFilter('code')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: componentFilter === 'code' ? '#012bff' : 'transparent',
                  color: componentFilter === 'code' ? '#fff' : '#444'
                }}
              >
                Motion Code (12)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
            {(componentFilter === 'all' || componentFilter === 'framer') && (
              <>
                <CatalogCard title="Button" source="framer/Button.js" desc="Call-to-action button with arrow transition">
                  <Button />
                </CatalogCard>

                <CatalogCard title="Tag" source="framer/Tag.js" desc="Category & status label tag badge">
                  <Tag />
                </CatalogCard>

                <CatalogCard title="PromptCard" source="framer/PromptCard.js" desc="Interactive query prompt card with animated states">
                  <PromptCard />
                </CatalogCard>

                <CatalogCard title="UICardLoading" source="framer/UICardLoading.js" desc="AI generation skeleton & progress card">
                  <UICardLoading />
                </CatalogCard>

                <CatalogCard title="FeatureIndicator" source="framer/FeatureIndicator.js" desc="Visual status indicator for pipeline steps">
                  <FeatureIndicator />
                </CatalogCard>

                <CatalogCard title="ToggleButton" source="framer/ToggleButton.js" desc="Switch toggle for monthly / annual pricing">
                  <ToggleButton />
                </CatalogCard>

                <CatalogCard title="CapabilityCard" source="framer/CapabilityCard.js" desc="System capability highlight card">
                  <CapabilityCard />
                </CatalogCard>

                <CatalogCard title="IndustryCard" source="framer/IndustryCard.js" desc="Domain vertical card">
                  <IndustryCard />
                </CatalogCard>

                <CatalogCard title="MetricsCard" source="framer/MetricsCard.js" desc="KPI metric statistics card">
                  <MetricsCard />
                </CatalogCard>

                <CatalogCard title="PricingPlanCard" source="framer/PricingPlanCard.js" desc="Full subscription tier card">
                  <PricingPlanCard />
                </CatalogCard>

                <CatalogCard title="FAQCard" source="framer/FAQCard.js" desc="Collapsible FAQ item with accordion animation">
                  <FAQCard />
                </CatalogCard>

                <CatalogCard title="MultimodalCard" source="framer/MultimodalCard.js" desc="Multi-modal pipeline processing card">
                  <MultimodalCard />
                </CatalogCard>

                <CatalogCard title="UserRolesCard" source="framer/UserRolesCard.js" desc="Role-based permissions & security card">
                  <UserRolesCard />
                </CatalogCard>

                <CatalogCard title="PricingList" source="framer/PricingList.js" desc="Feature checklist and comparison list">
                  <PricingList />
                </CatalogCard>
              </>
            )}

            {(componentFilter === 'all' || componentFilter === 'code') && (
              <>
                <CatalogCard title="Animated_beam" source="components/Animated_beam.tsx" desc="Flowing particles connecting network nodes">
                  <div style={{ height: 180, overflow: 'hidden' }}><Animated_beam /></div>
                </CatalogCard>

                <CatalogCard title="Typewriter" source="components/Workshop/Typewriter.tsx" desc="Animated cycling typewriter text input prompt">
                  <Typewriter />
                </CatalogCard>

                <CatalogCard title="Animated_lines" source="components/Animated_lines.tsx" desc="Flowing line system with SVG gradient beams">
                  <div style={{ height: 160, overflow: 'hidden' }}><Animated_lines /></div>
                </CatalogCard>

                <CatalogCard title="Animated_lines_2" source="components/Animated_lines_2.tsx" desc="Curved branching line animations with cards">
                  <div style={{ height: 160, overflow: 'hidden' }}><Animated_lines_2 /></div>
                </CatalogCard>

                <CatalogCard title="SlotCounter" source="components/SlotCounter.tsx" desc="Animated rolling numerical slot ticker">
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#012bff' }}><SlotCounter /></div>
                </CatalogCard>

                <CatalogCard title="Animated_arc" source="components/Animated_arc.tsx" desc="Radial arc sweep rotation indicator">
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Animated_arc /></div>
                </CatalogCard>

                <CatalogCard title="Animated_pixels" source="components/Animated_pixels.tsx" desc="Pulsing pixel matrix indicator">
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Animated_pixels /></div>
                </CatalogCard>

                <CatalogCard title="ImpactGraph" source="components/ImpactGraph.tsx" desc="Area & trend graph with entry animation">
                  <div style={{ height: 200 }}><ImpactGraph /></div>
                </CatalogCard>

                <CatalogCard title="GrowthGraph" source="components/GrowthGraph.tsx" desc="Performance growth line chart">
                  <div style={{ height: 200 }}><GrowthGraph /></div>
                </CatalogCard>

                <CatalogCard title="DottedIcon" source="components/DottedIcon.tsx" desc="Interactive particle and dotted icon glyph">
                  <div style={{ display: 'flex', justifyContent: 'center' }}><DottedIcon /></div>
                </CatalogCard>

                <CatalogCard title="LogoGrid" source="components/LogoGrid.tsx" desc="Infinite carousel grid of brand logos">
                  <div style={{ height: 140, overflow: 'hidden' }}><LogoGrid /></div>
                </CatalogCard>

                <CatalogCard title="StaggerTestimonials" source="components/StaggerTestimonials.tsx" desc="Interactive card stack with depth transition">
                  <div style={{ height: 240, overflow: 'hidden' }}><StaggerTestimonials /></div>
                </CatalogCard>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === '404' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: 96, fontWeight: 800, color: '#012bff', letterSpacing: '-0.04em', lineHeight: 1 }}>404</span>
          <h2 style={{ fontSize: 32, fontWeight: 600, color: '#070b3e', margin: '16px 0 8px' }}>Page Not Found</h2>
          <p style={{ color: 'rgba(0,0,0,0.6)', maxWidth: 460, marginBottom: 32 }}>
            The requested page does not exist or has been moved. Reconstructed from Framer 404 canvas definition.
          </p>
          <Button />
        </div>
      )}
    </div>
  );
}

function CatalogCard({ title, source, desc, children }: { title: string; source: string; desc: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 20,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', background: 'rgba(0,0,0,0.01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#070b3e' }}>{title}</h3>
          <code style={{ fontSize: 11, background: 'rgba(1, 43, 255, 0.08)', color: '#012bff', padding: '2px 8px', borderRadius: 6 }}>
            {source}
          </code>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(0, 0, 0, 0.55)' }}>{desc}</p>
      </div>
      <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
        {children}
      </div>
    </div>
  );
}
