import React, { useState, useEffect } from 'react';
import EnterpriseLogoCloud from './EnterpriseLogoCloud';

interface RealProductUICardProps {
  onStateChange?: (state: 'prompt' | 'analyzing' | 'resolved') => void;
  style?: React.CSSProperties;
}

const DEFAULT_PROMPT =
  'Analyze all incidents and identify which ones appear linked by symptoms, CI, or category. Tell me which incidents should become problem candidates, and whether any existing problems match them. Then show me if any of the change requests might impact these CIs';

const SUGGESTIONS = [
  {
    title: 'Incident–Problem–Change ...',
    desc: 'Analyze all incidents and identify which ones appear linked by...',
    prompt:
      'Analyze all incidents and identify which ones appear linked by symptoms, CI, or category. Tell me which incidents should become problem candidates, and whether any existing problems match them.',
  },
  {
    title: 'Catalog Request Fulfillment...',
    desc: 'Show me the status of all catalog requests and identify any that a...',
    prompt:
      'Show me the status of all catalog requests and identify any that are overdue or stalled across ServiceNow fulfillment workflows.',
  },
];

type Part = string | { b: string };

interface Script {
  prompt: string;
  steps: string[];
  intro: Part[];
  bullets: { lead: string; text: string }[];
  chips: string[];
}

// The demo that plays on a loop: each entry is one full exchange (question, the assistant's working steps, the answer).
const SCRIPTS: Script[] = [
  {
    prompt: DEFAULT_PROMPT,
    steps: ['Connecting to ServiceNow MCP', 'Cross-referencing 142 active incidents', 'Mapping change requests to affected CIs'],
    intro: ['I found ', { b: '4 recurring incident patterns' }, ' that share configuration items and symptoms with recent change requests.'],
    bullets: [
      { lead: 'Problem candidates:', text: '4 patterns are eligible for root-cause investigation.' },
      { lead: 'Matching records:', text: 'correlated with known problem records for database timeout symptoms.' },
      { lead: 'Change impact:', text: 'the upcoming maintenance window may intersect with affected CIs.' },
    ],
    chips: ['Open problem records', 'Notify change board'],
  },
  {
    prompt: SUGGESTIONS[1].prompt,
    steps: ['Connecting to ServiceNow MCP', 'Reading 318 open catalog requests', 'Checking fulfillment workflow SLAs'],
    intro: ['Of 318 open requests, ', { b: '27 are overdue or stalled' }, ' across three fulfillment workflows.'],
    bullets: [
      { lead: 'Stalled approvals:', text: '12 requests have waited more than 5 days for a manager approval.' },
      { lead: 'Blocked tasks:', text: '9 fulfillment tasks are assigned to a group with no active members.' },
      { lead: 'SLA risk:', text: '6 requests will breach their target within 48 hours.' },
    ],
    chips: ['Reassign blocked tasks', 'Escalate approvals'],
  },
];

const Avatar = () => (
  <div
    style={{
      width: 28,
      height: 28,
      borderRadius: 9,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <img src="/intellilink-icon-3d.png" alt="" style={{ width: 17, height: 17, objectFit: 'contain' }} />
  </div>
);

// Text that streams in word by word: each word rises, unblurs and fades in a beat after the one before it.
const WORD_STEP = 0.028;
const Words: React.FC<{ text: string; from: number; bold?: boolean; color?: string }> = ({ text, from, bold, color }) => (
  <>
    {text.trim().split(' ').map((w, i) => (
      <span
        key={i}
        style={{
          display: 'inline-block',
          whiteSpace: 'pre',
          fontWeight: bold ? 600 : undefined,
          color: bold ? color ?? '#0f172a' : undefined,
          animation: `wordIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(from + i * WORD_STEP).toFixed(3)}s both`,
        }}
      >
        {w + ' '}
      </span>
    ))}
  </>
);

// The conversation shown after a prompt is sent: the user's message, then the assistant working through its steps and
// answering, with a follow-up composer underneath. Fixed height so the card never jumps between states.
const ChatThread: React.FC<{
  script: Script;
  promptText: string;
  stage: 'analyzing' | 'resolved';
  progress: number;
  height: number;
}> = ({ script, promptText, stage, progress, height }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    // Only scroll when the exchange really overflows; otherwise keep the top of the thread in view.
    if (el) el.scrollTo({ top: el.scrollHeight - el.clientHeight > 24 ? el.scrollHeight : 0, behavior: 'smooth' });
  }, [stage]);

  const rise = (delay: number): React.CSSProperties => ({ animation: `chatIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both` });

  // Running word counter so the whole answer streams in one continuous beat.
  let cursor = 0.15;
  const next = (text: string) => {
    const at = cursor;
    cursor += text.split(' ').length * WORD_STEP + 0.12;
    return at;
  };

  return (
    <div style={{ height, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', paddingTop: 4, animation: 'chatIn 0.4s ease both' }}>
      <div
        ref={scrollRef}
        className="chat-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2 }}
      >
        {/* User message */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', ...rise(0) }}>
          <div
            style={{
              maxWidth: '86%',
              background: '#eef2ff',
              border: '1px solid #dfe6ff',
              color: '#1e293b',
              fontSize: 12.5,
              lineHeight: 1.5,
              padding: '10px 14px',
              borderRadius: '16px 16px 4px 16px',
            }}
          >
            {promptText}
          </div>
        </div>

        {/* Assistant message */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', ...rise(0.12) }}>
          <Avatar />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 2, letterSpacing: '-0.01em' }}>IntelliLink</div>

            {stage === 'analyzing' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {script.steps.map((s, i) => {
                  const done = progress >= Math.min(100, (i + 1) * 33);
                  const active = !done && progress >= i * 33;
                  const shown = done || active;
                  return (
                    <div
                      key={s}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        fontSize: 12.5,
                        color: done ? '#64748b' : '#0f172a',
                        opacity: shown ? 1 : 0.35,
                        transition: 'opacity 0.3s ease, color 0.3s ease',
                      }}
                    >
                      <span style={{ width: 16, height: 16, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        {done ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12.5 10 17.5 19 7.5" />
                          </svg>
                        ) : active ? (
                          <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #c7d2fe', borderTopColor: '#4f46e5', animation: 'chatSpin 0.8s linear infinite' }} />
                        ) : (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />
                        )}
                      </span>
                      {s}
                    </div>
                  );
                })}
                <div style={{ display: 'flex', gap: 4, paddingTop: 4 }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#a5b4fc', animation: `chatDot 1.1s ease-in-out ${d * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: '#334155' }}>
                <p style={{ margin: '0 0 6px' }}>
                  {(() => {
                    const from = cursor;
                    let acc = from;
                    const out = script.intro.map((p, i) => {
                      const text = typeof p === 'string' ? p : p.b;
                      const el = <Words key={i} text={text.trim() === '' ? ' ' : text.replace(/ $/, '')} from={acc} bold={typeof p !== 'string'} />;
                      acc += text.split(' ').length * WORD_STEP;
                      return el;
                    });
                    cursor = acc + 0.12;
                    return out;
                  })()}
                </p>
                <ul style={{ margin: '0 0 8px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3, color: '#475569' }}>
                  {script.bullets.map((b) => {
                    const at = next(b.lead + ' ' + b.text);
                    return (
                      <li key={b.lead}>
                        <Words text={b.lead} from={at} bold color="#1e293b" />
                        <Words text={b.text} from={at + b.lead.split(' ').length * WORD_STEP} />
                      </li>
                    );
                  })}
                </ul>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, ...rise(cursor + 0.05) }}>
                  {script.chips.map((c) => (
                    <span
                      key={c}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 500,
                        color: '#4338ca',
                        background: '#f5f7ff',
                        border: '1px solid #dfe6ff',
                        borderRadius: 999,
                        padding: '5px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up composer */}
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          borderRadius: 999,
          padding: '6px 6px 6px 16px',
          boxShadow: '0 3px 14px rgba(0, 0, 0, 0.04)',
        }}
      >
        <span style={{ flex: 1, fontSize: 12.5, color: '#94a3b8' }}>Ask a follow-up...</span>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: stage === 'analyzing' ? '#cbd5e1' : '#4f46e5',
            display: 'grid',
            placeItems: 'center',
            transition: 'background 0.2s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export const RealProductUICard: React.FC<RealProductUICardProps> = ({ onStateChange, style }) => {
  const [stage, setStage] = useState<'prompt' | 'analyzing' | 'resolved'>('prompt');
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // With motion allowed the composer starts empty and the demo types the first prompt in itself.
  const [promptText, setPromptText] = useState<string>(reducedMotion ? DEFAULT_PROMPT : '');
  const [typeKey, setTypeKey] = useState<number>(0);
  const [pressed, setPressed] = useState<boolean>(false);
  const [fade, setFade] = useState<boolean>(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const visibleRef = React.useRef<boolean>(false);
  const interactedAt = React.useRef<number>(0);
  const runRef = React.useRef<(p?: string) => Promise<void>>(() => Promise.resolve());
  const notifyRef = React.useRef(onStateChange);
  notifyRef.current = onStateChange;
  const [progress, setProgress] = useState<number>(0);
  // The prompt view's height is measured and reused by the chat view, so the card keeps the same size when it switches.
  const promptRef = React.useRef<HTMLDivElement>(null);
  const [lockedH, setLockedH] = useState<number>(360);
  useEffect(() => {
    const el = promptRef.current;
    if (!el || stage !== 'prompt') return;
    const measure = () => setLockedH(Math.max(300, el.offsetHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stage]);

  // Trigger analysis sequence. Resolves once the answer is on screen.
  const runAnalysis = (customPrompt?: string): Promise<void> =>
    new Promise((resolve) => {
      if (customPrompt) {
        setPromptText(customPrompt);
      }
      setStage('analyzing');
      setProgress(0);
      onStateChange?.('analyzing');

      let current = 0;
      const interval = setInterval(() => {
        current += 4.6;
        if (current >= 100) {
          current = 100;
          setProgress(100);
          clearInterval(interval);
          setTimeout(() => {
            setStage('resolved');
            onStateChange?.('resolved');
            resolve();
          }, 320);
        } else {
          setProgress(Math.round(current));
        }
      }, 110);
    });
  runRef.current = runAnalysis;

  // The demo plays itself on a loop, like a screen recording: the prompt types in word by word, send is pressed, the
  // assistant works through its steps and streams the answer, the exchange holds for a moment, fades and the next one
  // begins. Pointer use pauses it for a while, and it only runs while the card is on screen.
  useEffect(() => {
    if (reducedMotion) return;
    const el = rootRef.current;
    let dead = false;
    const io = el
      ? new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0.3 })
      : null;
    if (el && io) io.observe(el);

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    // Waits while the card is off-screen or was just used; reports whether it had to wait.
    const idle = async () => {
      let waited = false;
      while (!dead && (!visibleRef.current || Date.now() - interactedAt.current < 12000)) {
        waited = true;
        await sleep(400);
      }
      return waited;
    };

    (async () => {
      await sleep(3200);
      let i = 0;
      while (!dead) {
        if (await idle()) { setFade(false); continue; }
        const script = SCRIPTS[i++ % SCRIPTS.length];
        setStage('prompt');
        setProgress(0);
        notifyRef.current?.('prompt');
        setPromptText(script.prompt);
        setTypeKey((k) => k + 1);
        await sleep(60);
        setFade(false);
        await sleep(script.prompt.split(' ').length * 42 + 1100);
        if (dead || (await idle())) continue;
        setPressed(true);
        await sleep(280);
        setPressed(false);
        await runRef.current(script.prompt);
        await sleep(7500);
        if (dead) break;
        if (await idle()) continue;
        setFade(true);
        await sleep(500);
      }
    })();

    return () => {
      dead = true;
      io?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    setStage('prompt');
    setProgress(0);
    onStateChange?.('prompt');
  };

  return (
    <div
      ref={rootRef}
      onPointerDown={() => { interactedAt.current = Date.now(); }}
      className="hero-card-frame"
      style={{
        width: '100%',
        maxWidth: 960,
        borderRadius: 36,
        padding: 'clamp(28px, 3.8vw, 46px) clamp(24px, 4.4vw, 56px)',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 4,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'left',
        ...style,
      }}
    >
      {/* Depth and edge live on their own layers (not on the frame) so the backdrop can expand past the
          card's box on scroll without the shadow or border being clipped along with it. */}
      <div
        className="hero-card-shadow"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 36,
          boxShadow: '0 32px 84px -12px rgba(8, 48, 120, 0.22), 0 14px 40px rgba(9, 174, 255, 0.18)',
          pointerEvents: 'none',
        }}
      />

      {/* Backdrop: at rest it fills the card. On scroll, JS sizes it to the viewport and opens a clip-path
          from the card's rectangle out to the full screen, so the texture is revealed rather than scaled. */}
      <div
        className="hero-card-bleed"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 36,
          overflow: 'hidden',
          backgroundColor: '#8fd8ff',
          pointerEvents: 'none',
        }}
      >
        <div
          className="hero-card-media"
          style={{
            position: 'absolute',
            inset: '-6%',
            backgroundImage: 'url(/hero-card-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            willChange: 'transform',
          }}
        />
      </div>

      <div
        className="hero-card-ring"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 36,
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: 'inset 0 1.5px 2.5px rgba(255, 255, 255, 0.95)',
          pointerEvents: 'none',
        }}
      />

      {/* ── INNER WHITE CONTENT CARD (Header, Prompt Box, Suggestions) ── */}
      <div
        className="hero-card-panel"
        style={{
          width: '100%',
          maxWidth: 720,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 1)',
          boxShadow:
            '0 12px 32px -8px rgba(12, 38, 88, 0.08), 0 2px 8px rgba(12, 38, 88, 0.04), 0 0 0 1px rgba(210, 228, 250, 0.45)',
          borderRadius: 22,
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 3,
          margin: '0 auto',
        }}
      >
      {/* ── 1. COMPACT HEADER (Small squircle icon + title) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          paddingBottom: 16,
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
        }}
      >
        {/* App Icon Badge */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src="/intellilink-icon-3d.png"
            alt="IntelliLink"
            style={{ width: 22, height: 22, objectFit: 'contain' }}
          />
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 15.5,
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            IntelliLink for ServiceNow MCP
          </span>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500, letterSpacing: '-0.01em' }}>
            Connected to enterprise incident & change stack
          </span>
        </div>
        {stage !== 'prompt' && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 999,
              padding: '5px 11px',
              fontSize: 11.5,
              fontWeight: 500,
              color: '#475569',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
        )}
      </div>

      <div style={{ opacity: fade ? 0 : 1, transition: 'opacity 0.45s ease' }}>
      {/* ── 2. PROMPT INPUT BOX (Recreated from real product UI) ── */}
      {stage === 'prompt' && (
      <div ref={promptRef} style={{ display: 'flow-root' }}>
      <div
        style={{
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 3px 14px rgba(0, 0, 0, 0.04)',
          padding: '16px 18px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 195,
          position: 'relative',
          margin: '14px 0',
        }}
      >
        {/* Expand Icon (Top Right) */}
        <button
          type="button"
          aria-label="Expand prompt"
          style={{
            position: 'absolute',
            top: 13,
            right: 13,
            background: 'transparent',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>

        {/* Prompt Instruction Content */}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: '#334155',
            paddingRight: 24,
            wordBreak: 'break-word',
          }}
        >
          {promptText === '' ? (
            <span style={{ color: '#94a3b8' }}>Ask anything about your incidents, changes and requests...</span>
          ) : (
            <span key={typeKey}>
              {promptText.split(' ').map((w, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    whiteSpace: 'pre',
                    animation: typeKey > 0 ? `wordIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${(i * 0.042).toFixed(3)}s both` : undefined,
                  }}
                >
                  {w + ' '}
                </span>
              ))}
            </span>
          )}
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 14,
              backgroundColor: '#4f46e5',
              marginLeft: 3,
              verticalAlign: 'middle',
              animation: 'promptBlink 1s step-end infinite',
            }}
          />
        </div>

        {/* Bottom Action Row (+ on left, mic + blue arrow button on right) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid rgba(241, 245, 249, 0.9)',
          }}
        >
          {/* Plus button */}
          <button
            type="button"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: '#f8fafc',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
            title="Attach context or document"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Right actions: Mic & Submit Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {/* Mic icon */}
            <button
              type="button"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: 'none',
                background: '#f8fafc',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Voice input"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>

            {/* Indigo Submit Button */}
            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={stage === 'analyzing'}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: stage === 'analyzing' ? '#94a3b8' : '#4f46e5',
                color: '#ffffff',
                cursor: stage === 'analyzing' ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: pressed ? '0 0 0 6px rgba(79, 70, 229, 0.18), 0 2px 10px rgba(79, 70, 229, 0.45)' : '0 2px 10px rgba(79, 70, 229, 0.35)',
                transform: pressed ? 'scale(0.9)' : 'scale(1)',
                transition: 'all 0.18s ease',
              }}
              title="Execute analysis"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. STATE-BASED LOWER CONTAINER ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', letterSpacing: '0.01em' }}>
            Suggested prompts from ServiceNow MCP
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
            }}
          >
            {SUGGESTIONS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => runAnalysis(item.prompt)}
                style={{
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 98, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.02)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {/* Chat Bubble Icon with dots */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#3b82f6">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>
                      {item.title}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#64748b', lineHeight: 1.38, paddingLeft: 28 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {stage !== 'prompt' && (
        <ChatThread script={SCRIPTS.find((x) => x.prompt === promptText) ?? SCRIPTS[0]} promptText={promptText} stage={stage} progress={progress} height={lockedH} />
      )}
      </div>

      {/* Close inner white content card */}
      </div>

      <EnterpriseLogoCloud />

      {/* Global CSS animation for cursor */}
      <style>{`
        @keyframes chatIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wordIn {
          from { opacity: 0; transform: translateY(6px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes chatSpin { to { transform: rotate(360deg); } }
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .chat-scroll { scrollbar-width: none; }
        .chat-scroll::-webkit-scrollbar { display: none; }
        @keyframes promptBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default RealProductUICard;
