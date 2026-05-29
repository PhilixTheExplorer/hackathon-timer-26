import { useRef } from "react";

export function GlitchText({ text, className = "", as = "div" }) {
  const Tag = as;
  return (
    <Tag className={"glitch " + className} data-text={text}>
      {text}
    </Tag>
  );
}

export function CRTOverlay() {
  return (
    <div className="crt" aria-hidden="true">
      <div className="crt-scan" />
      <div className="crt-beam" />
      <div className="crt-vignette" />
      <div className="crt-flicker" />
    </div>
  );
}

export function Sparkles({ count = 6 }) {
  const items = useRef(
    Array.from({ length: count }).map(() => ({
      top: Math.random() * 70 + 5,
      left: Math.random() * 90 + 5,
      size: Math.random() * 14 + 8,
      delay: Math.random() * 4,
      dur: Math.random() * 3 + 2.5,
    }))
  );
  return (
    <div className="sparkles" aria-hidden="true">
      {items.current.map((s, i) => (
        <svg
          key={i}
          className="sparkle"
          viewBox="0 0 24 24"
          style={{
            top: s.top + "%",
            left: s.left + "%",
            width: s.size,
            height: s.size,
            animationDelay: s.delay + "s",
            animationDuration: s.dur + "s",
          }}
        >
          <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" />
        </svg>
      ))}
    </div>
  );
}
