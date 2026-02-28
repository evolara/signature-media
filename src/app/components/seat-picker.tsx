import React, { useState } from 'react';
import { Seat, allSeats, seatLayout } from './seat-layout';

interface SeatPickerProps {
  type: 'vip' | 'classic';
  available: Set<string>; // occupied seat keys like "A-1"
  quantity: number;
  onChange: (seats: Seat[]) => void;
}

export default function SeatPicker({ type, available, quantity, onChange }: SeatPickerProps) {
  const seats = allSeats(type);
  const [selected, setSelected] = useState<Seat[]>([]);

  function toggle(seat: Seat) {
    const key = `${seat.row}-${seat.number}`;
    if (available.has(key)) return; // already taken
    const idx = selected.findIndex(s => s.row === seat.row && s.number === seat.number);
    let next = [...selected];
    if (idx >= 0) {
      next.splice(idx, 1);
    } else if (next.length < quantity) {
      next.push(seat);
    }
    setSelected(next);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {Object.entries(seatLayout[type]).map(([row, count]) => (
        <div key={row} className="flex items-center gap-1">
          <span className="w-6 font-medium text-white">{row}</span>
          {Array.from({ length: count as number }, (_, i) => {
            const seat = { row, number: i + 1 };
            const key = `${row}-${seat.number}`;
            const busy = available.has(key);
            const sel = selected.some(s => s.row === row && s.number === seat.number);
            return (
              <button
                key={key}
                disabled={busy}
                onClick={() => toggle(seat)}
                className={`w-6 h-6 text-xs flex items-center justify-center rounded transition-colors ${
                  busy ? 'bg-gray-400 cursor-not-allowed' :
                  sel ? 'bg-primary text-white' :
                  'bg-green-200 text-black hover:bg-green-300'
                }`}
                aria-label={`Row ${row} seat ${seat.number}${busy ? ' occupied' : ''}`}
              >
                {seat.number}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
