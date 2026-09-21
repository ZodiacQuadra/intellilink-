import React from 'react';
import { LogoCloud, type CloudLogo } from '../ui/logo-cloud-3';

// Bare logos in their own brand colours, with no plate behind them.
const LOGO: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  height: 34,
};
const LABEL: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 600,
  color: '#0b2a55',
  letterSpacing: '-0.015em',
  whiteSpace: 'nowrap',
};

const mark = (name: string, icon: React.ReactNode, showLabel = true): CloudLogo => ({
  name,
  node: (
    <div className="cloud-logo" style={LOGO}>
      {icon}
      {showLabel && <span style={LABEL}>{name}</span>}
    </div>
  ),
});

const LOGOS: CloudLogo[] = [
  // Salesforce and SAP artwork already carries the company name, so no extra label.
  mark('Salesforce', <img src="/assets/67KAgefBnY8ob2OZJF2YtXB62lQ.svg" alt="" style={{ height: 32, width: 'auto' }} />, false),
  mark('SAP', <img src="/assets/5fphMC36hxroLfd9XXAGK3gdBgs.svg" alt="" style={{ height: 22, width: 'auto' }} />, false),
  mark('Oracle', <img src="/assets/Ia3vfbrJ2ZYAKOWYt7ViYWKH0qE.svg" alt="" style={{ height: 18, width: 'auto' }} />),
  mark(
    'ServiceNow',
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 3.82 2.14 7.14 5.3 8.84l1.45-2.52C6.55 17.07 5.2 14.71 5.2 12c0-3.76 3.04-6.8 6.8-6.8s6.8 3.04 6.8 6.8c0 2.71-1.35 5.07-3.55 6.32l1.45 2.52C19.86 19.14 22 15.82 22 12c0-5.523-4.477-10-10-10z" fill="#81B5A1" />
      <circle cx="12" cy="12" r="3.2" fill="#293E40" />
    </svg>
  ),
  mark(
    'Microsoft 365',
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  ),
  mark(
    'Azure SQL',
    <svg width="22" height="22" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="az-cloud-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#114A8B" />
          <stop offset="100%" stopColor="#0078D4" />
        </linearGradient>
      </defs>
      <path fill="url(#az-cloud-grad)" d="M33 4L8 72h20l9-22h22L33 4z" />
      <path fill="#0078D4" d="M55 50L40 88h48L55 50z" />
    </svg>
  ),
];

/**
 * The "connects with your systems" strip. It sits in the band of backdrop that opens below the product card
 * (animated in gsap-animations.ts); the band's height arrives as the --band CSS variable.
 */
export const EnterpriseLogoCloud: React.FC = () => (
  <div
    className="hero-logo-cloud"
    style={{
      position: 'absolute',
      left: 'calc(50% - 50vw)',
      top: '100%',
      width: '100vw',
      height: 'var(--band, 110px)',
      zIndex: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    }}
  >
    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, letterSpacing: '0.005em', color: 'rgba(7, 24, 56, 0.78)' }}>
      Connects with the systems your business already uses
    </p>
    <LogoCloud logos={LOGOS} gap={56} speed={38} style={{ width: 'min(100%, 1100px)' }} />

    <style>{`
      .cloud-logo {
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cloud-logo:hover {
        transform: translateY(-2px);
      }
    `}</style>
  </div>
);

export default EnterpriseLogoCloud;
