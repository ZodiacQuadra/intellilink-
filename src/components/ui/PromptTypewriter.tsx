import { useEffect, useState } from 'react';

// Types a rotating set of prompts into a text area. Unlike the Workshop Typewriter it wraps inside its box (that one
// forces a single unbroken line) and reserves the height of the longest prompt, so nothing jumps while typing.
export default function PromptTypewriter({
  texts,
  typingSpeed = 42,
  pauseDuration = 1800,
}: {
  texts: string[];
  typingSpeed?: number;
  pauseDuration?: number;
}) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState('');
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const target = texts[index];
    if (shown.length < target.length) {
      const t = setTimeout(() => setShown(target.slice(0, shown.length + 1)), typingSpeed);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setShown('');
      setIndex((i) => (i + 1) % texts.length);
    }, pauseDuration);
    return () => clearTimeout(t);
  }, [shown, index, texts, typingSpeed, pauseDuration]);

  const longest = texts.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <div style={{ position: 'relative' }}>
      {/* Invisible copy of the longest prompt keeps the box the same height for every prompt */}
      <span aria-hidden="true" style={{ visibility: 'hidden', display: 'block' }}>
        {longest}
      </span>
      <span style={{ position: 'absolute', inset: 0 }}>
        {shown}
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: '1.05em',
            marginLeft: 2,
            verticalAlign: 'text-bottom',
            background: '#4f46e5',
            opacity: cursorOn ? 1 : 0,
            transition: 'opacity 0.1s ease',
          }}
        />
      </span>
    </div>
  );
}
