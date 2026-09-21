// "Work your way, in one place": a small unified-workspace card. A question, the answer with its sources, and the
// follow-up tasks sit together in one panel instead of in separate tools.

const BLUE = '#2563eb';
const INK = '#0b1230';
const MUTED = 'rgba(11, 18, 48, 0.56)';
const LINE = 'rgba(11, 18, 48, 0.08)';

const label = (text: string) => (
  <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED, marginBottom: 6 }}>
    {text}
  </div>
);

const Source = ({ name, color }: { name: string; color: string }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      fontWeight: 500,
      color: INK,
      background: '#f4f7fb',
      border: `1px solid ${LINE}`,
      borderRadius: 999,
      padding: '3px 9px 3px 7px',
    }}
  >
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
    {name}
  </span>
);

const Task = ({ text, who, done }: { text: string; who: string; done?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: 5,
        flexShrink: 0,
        border: done ? 'none' : '1.5px solid rgba(11, 18, 48, 0.22)',
        background: done ? BLUE : '#fff',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {done && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.4 5 8.8 9.5 3.6" />
        </svg>
      )}
    </span>
    <span style={{ flex: 1, fontSize: 12.5, color: done ? MUTED : INK, textDecoration: done ? 'line-through' : 'none' }}>{text}</span>
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: '#e8efff',
        color: BLUE,
        fontSize: 9.5,
        fontWeight: 700,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {who}
    </span>
  </div>
);

export default function WorkspacePreview() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255, 255, 255, 0.96)',
        borderRadius: 18,
        border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 24px 60px rgba(30, 90, 170, 0.22), 0 2px 8px rgba(30, 90, 170, 0.08)',
        padding: '13px 16px 6px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        textAlign: 'left',
      }}
    >
      {/* Header: the workspace and the three kinds of work it holds */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/intellilink-icon-3d.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Payments workspace</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Chat', 'Insights', 'Tasks'].map((t, i) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: '3px 9px',
                borderRadius: 999,
                background: i === 1 ? '#eaf1ff' : 'transparent',
                color: i === 1 ? BLUE : MUTED,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 9 }}>
        <div
          style={{
            background: '#ffffff',
            color: INK,
            border: `1px solid ${LINE}`,
            boxShadow: '0 2px 8px rgba(30, 60, 120, 0.08)',
            fontSize: 12.5,
            lineHeight: 1.45,
            padding: '8px 12px',
            borderRadius: '14px 14px 4px 14px',
            maxWidth: '82%',
          }}
        >
          Which incidents are linked to the payments outage?
        </div>
      </div>

      {/* Insight with its sources */}
      <div style={{ background: '#f4f8ff', border: '1px solid rgba(37, 99, 235, 0.14)', borderRadius: 12, padding: '9px 12px 10px', marginBottom: 6 }}>
        {label('Insight')}
        <div style={{ fontSize: 12.5, lineHeight: 1.45, color: INK, marginBottom: 8 }}>
          <b style={{ fontWeight: 600 }}>3 incidents</b> point to the same configuration item. A problem record is recommended.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Source name="ServiceNow" color="#22a06b" />
          <Source name="Slack" color="#9333ea" />
          <Source name="Jira" color={BLUE} />
        </div>
      </div>

      {/* Follow-up work */}
      <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 8 }}>
        {label('Next steps')}
        <Task text="Review linked incidents" who="AK" done />
        <Task text="Open problem record" who="SM" />
        <Task text="Notify change advisory board" who="RP" />
      </div>
    </div>
  );
}
