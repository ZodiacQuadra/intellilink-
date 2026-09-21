import React, { useState, useEffect } from 'react';

interface HeroProductWorkflowProps {
  onStateChange?: (step: number) => void;
}

export const HeroProductWorkflow: React.FC<HeroProductWorkflowProps> = ({ onStateChange }) => {
  // 0: Query, 1: Connecting Sources, 2: Analyzing, 3: Insight, 4: Action Ready
  const [step, setStep] = useState<number>(3); // start in resolved state for immediate high visual fidelity
  const [progress, setProgress] = useState<number>(100);
  const [activeSources, setActiveSources] = useState<string[]>(['Salesforce', 'SAP', 'Azure SQL']);
  const [actionDone, setActionDone] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let timer: NodeJS.Timeout;
    
    // Controlled loop: realistic enterprise workflow pace
    const runCycle = () => {
      // Step 0: User Prompt ready
      setStep(0);
      setProgress(15);
      setActionDone(false);
      if (onStateChange) onStateChange(0);

      // Step 1: Connecting Sources (after 1.8s)
      timer = setTimeout(() => {
        setStep(1);
        setProgress(38);
        if (onStateChange) onStateChange(1);

        // Step 2: Analyzing Data (after 1.6s)
        timer = setTimeout(() => {
          setStep(2);
          setProgress(76);
          if (onStateChange) onStateChange(2);

          // Step 3: Insight Formed (after 1.8s)
          timer = setTimeout(() => {
            setStep(3);
            setProgress(100);
            if (onStateChange) onStateChange(3);

            // Step 4: Action Ready (after 1.4s)
            timer = setTimeout(() => {
              setStep(4);
              if (onStateChange) onStateChange(4);

              // Rest in completed state for 8 seconds before quiet loop
              timer = setTimeout(() => {
                runCycle();
              }, 8000);
            }, 1400);
          }, 1800);
        }, 1600);
      }, 1800);
    };

    // Initial delay before first subtle cycle
    timer = setTimeout(() => {
      runCycle();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onStateChange]);

  const handleManualAction = () => {
    setActionDone(true);
    setTimeout(() => {
      setActionDone(false);
    }, 3000);
  };

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 4,
        width: 660,
        background: '#ffffff',
        borderRadius: 22,
        boxShadow: '0 24px 64px -12px rgba(12, 38, 88, 0.11), 0 4px 16px rgba(12, 38, 88, 0.04), 0 0 0 1px rgba(226, 232, 240, 0.85)',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        minHeight: 360,
        transition: 'box-shadow 0.3s ease',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: 175,
          background: '#ffffff',
          borderRight: '1px solid #f1f5f9',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px 16px' }}>
          <img
            src="/intellilink-icon-3d.png"
            alt="IntelliLink"
            style={{ width: 22, height: 22, objectFit: 'contain' }}
          />
          <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0d1b3e', letterSpacing: '-0.02em' }}>IntelliLink</span>
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 10px' }}>
          {/* Home (Active) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              background: '#edf5fd',
              color: '#0062ff',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0062ff" stroke="none">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0062ff', letterSpacing: '-0.01em' }}>Home</span>
          </div>

          {/* Sources */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 8,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Sources</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, background: '#f1f5f9', color: '#0062ff', padding: '1px 6px', borderRadius: 10 }}>6</span>
          </div>

          {/* Agents */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
              <path d="M12 12 2.1 12.5" />
              <path d="m12 12 7 7" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Agents</span>
          </div>

          {/* Workflows */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M13 6h3a2 2 0 0 1 2 2v7" />
              <line x1="6" y1="9" x2="6" y2="21" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Workflows</span>
          </div>

          {/* Settings */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Settings</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
        }}
      >
        {/* Top Row: User Prompt Pill Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            background: '#ffffff',
            borderRadius: 9999,
            padding: '6px 6px 6px 14px',
            border: step === 0 ? '1.5px solid #0062ff' : '1.5px solid #e2e8f0',
            boxShadow: step === 0 ? '0 0 0 3px rgba(0, 98, 255, 0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.3s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0062ff" style={{ flexShrink: 0 }}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span
            style={{
              fontSize: 12.8,
              color: '#334155',
              fontWeight: 500,
              flex: 1,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Show me top revenue opportunities this quarter
          </span>
          <div
            onClick={handleManualAction}
            title="Execute query"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#0062ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,98,255,0.32)',
              cursor: 'pointer',
              transform: step === 0 ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Status & Animated Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '6px 0 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: step >= 3 ? '#dcfce7' : '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.3s ease',
                }}
              >
                {step >= 3 ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, letterSpacing: '-0.005em' }}>
                {step === 0 && 'Parsing enterprise prompt context...'}
                {step === 1 && 'Connecting Salesforce, SAP & Azure SQL...'}
                {step === 2 && 'Analyzing 4 connected enterprise sources...'}
                {step >= 3 && 'Analysis complete across connected stack'}
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: step >= 3 ? '#16a34a' : '#0284c7' }}>
              {progress}%
            </span>
          </div>

          {/* Sleek horizontal progress track */}
          <div style={{ width: '100%', height: 4.5, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: step >= 3
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(90deg, #0062ff 0%, #00d2ff 85%, #a5f3fc 100%)',
                borderRadius: 9999,
                boxShadow: step >= 3 ? '0 0 10px rgba(16, 185, 129, 0.6)' : '0 0 10px rgba(0, 210, 255, 0.75)',
                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Bottom Result Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '14px 18px',
            border: step >= 3 ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
            boxShadow: step >= 3 ? '0 4px 14px rgba(0, 98, 255, 0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
            transform: step >= 3 ? 'translateY(0)' : 'translateY(2px)',
            transition: 'all 0.35s ease',
          }}
        >
          {/* Header with line chart */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /><path d="M19 5h-4v4" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
                  Top opportunity
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Enterprise Account A
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: '#f8fafc', borderRadius: 9999, border: '1px solid #e2e8f0' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#475569' }}>Live Signal</span>
            </div>
          </div>

          {/* Metric row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                $2.4M
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                Potential revenue
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Green Percentage pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 9px',
                  borderRadius: 6,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: '-0.01em' }}>+18%</span>
              </div>

              {/* Action button */}
              <button
                onClick={handleManualAction}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: actionDone ? '1px solid #16a34a' : 'none',
                  background: actionDone ? '#16a34a' : '#0062ff',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  boxShadow: actionDone ? '0 2px 8px rgba(22, 163, 74, 0.35)' : '0 2px 8px rgba(0, 98, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  transform: step === 4 && !actionDone ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {actionDone ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Follow-up created</span>
                  </>
                ) : (
                  <>
                    <span>Create follow-up</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroProductWorkflow;
