import { useState, useEffect } from "react";

/** Ticks every `interval` ms and returns the current epoch ms. */
export function useNow(interval = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}
