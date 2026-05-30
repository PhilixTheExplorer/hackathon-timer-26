import { useState, useEffect, useRef } from "react";

function FlipDigit({ digit }) {
  const [prev, setPrev] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (digit !== prev) {
      setFlipping(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setPrev(digit);
        setFlipping(false);
      }, 480);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digit]);

  return (
    <div className="fd">
      <div className="fd-top"><span>{digit}</span></div>
      <div className="fd-bottom"><span>{prev}</span></div>
      {flipping && (
        <>
          <div className="fd-flip-top"><span>{prev}</span></div>
          <div className="fd-flip-bottom"><span>{digit}</span></div>
        </>
      )}
      <div className="fd-glare" />
    </div>
  );
}

function FlipUnit({ value, label, pad = 2 }) {
  const str = String(Math.max(0, value)).padStart(pad, "0");
  return (
    <div className="unit">
      <div className="digits">
        {str.split("").map((d, i) => (
          <FlipDigit key={i} digit={d} />
        ))}
      </div>
      <div className="unit-label">{label}</div>
    </div>
  );
}

export default function FlipClock({ t, showDays }) {
  const hours = showDays ? t.hours : Math.floor(t.total / 3600);

  return (
    <div className="clock">
      {showDays && (
        <>
          <FlipUnit value={t.days} label="DAYS" />
          <div className="sep">:</div>
        </>
      )}
      <FlipUnit value={hours} label="HOURS" />
      <div className="sep">:</div>
      <FlipUnit value={t.minutes} label="MINUTES" />
      <div className="sep">:</div>
      <FlipUnit value={t.seconds} label="SECONDS" />
    </div>
  );
}
