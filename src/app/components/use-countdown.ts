import { useState, useEffect, useRef } from 'react';

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  expired: boolean;
}

/**
 * Shared countdown hook — single source of truth for all sections.
 * Pass a stable Date object (or use useMemo) to avoid re-subscribing.
 */
export function useCountdown(target: Date): Countdown {
  const compute = (): Countdown => {
    let diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: '0', hours: '00', minutes: '00', seconds: '00', expired: true };
    const d = Math.floor(diff / 86_400_000); diff -= d * 86_400_000;
    const h = Math.floor(diff / 3_600_000);  diff -= h * 3_600_000;
    const m = Math.floor(diff / 60_000);     diff -= m * 60_000;
    const s = Math.floor(diff / 1_000);
    return {
      days:    `${d}`,
      hours:   String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0'),
      expired: false,
    };
  };

  const [countdown, setCountdown] = useState<Countdown>(compute);
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    if (countdown.expired) return;
    const id = setInterval(() => {
      const next = compute();
      setCountdown(next);
      if (next.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown.expired]);

  return countdown;
}
