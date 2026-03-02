import { useState, useEffect, useRef } from 'react';
import { Seat, allSeats, seatLayout } from './seat-layout';

interface SeatPickerProps {
  type: 'vip' | 'classic';
  available: Set<string>;
  quantity: number;
  onChange: (seats: Seat[]) => void;
}

export default function SeatPicker({ type, available, quantity, onChange }: SeatPickerProps) {
  const seats = allSeats(type);
  const [selected, setSelected] = useState<Seat[]>([]);

  // ✅ Keep a ref to onChange to avoid stale closure issues
  //    without adding it to the dependency array (prevents infinite re-renders
  //    when the parent passes an inline or non-memoized callback)
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Reset when quantity changes
  useEffect(() => {
    setSelected([]);
    onChangeRef.current([]);
  }, [quantity]); // ✅ onChange intentionally omitted via ref

  function toggle(seat: Seat) {
    const key = `${seat.row}-${seat.number}`;
    if (available.has(key)) return;
    setSelected(prev => {
      const idx = prev.findIndex(s => s.row === seat.row && s.number === seat.number);
      const next = idx >= 0
        ? prev.filter((_, i) => i !== idx)
        : prev.length < quantity ? [...prev, seat] : prev;
      onChangeRef.current(next);
      return next;
    });
  }

  return (
    <div className="space-y-2 p-2 bg-white/3 rounded-lg max-w-full overflow-x-auto">
      {Object.entries(seatLayout[type]).map(([row, count]) => (
        <div key={row} className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-5 text-center font-bold text-white/80 text-xs flex-shrink-0">{row}</span>
          <div className="flex gap-0.5 flex-wrap">
            {Array.from({ length: count as number }, (_, i) => {
              const seat   = { row, number: i + 1 };
              const key    = `${row}-${seat.number}`;
              const busy   = available.has(key);
              const sel    = selected.some(s => s.row === row && s.number === seat.number);
              return (
                <button
                  key={key}
                  disabled={busy}
                  onClick={() => toggle(seat)}
                  className={`w-5 h-5 text-[9px] flex items-center justify-center rounded transition-colors font-bold flex-shrink-0 ${
                    busy ? 'bg-red-300/30 text-white/20 cursor-not-allowed' :
                    sel  ? 'bg-[#C6A04C] text-[#080808] ring-2 ring-[#C6A04C]/50' :
                           'bg-white/8 text-white hover:bg-white/15'
                  }`}
                  aria-label={`Row ${row} seat ${seat.number}${busy ? ' occupied' : sel ? ' selected' : ''}`}
                  aria-pressed={sel}
                  title={`${row}${seat.number}`}
                >
                  {seat.number}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
