// simple seat map definitions for VIP and classic tickets
export const seatLayout = {
  vip: { A: 7, B: 8, C: 8 },
  classic: {
    A: 15, B: 17, C: 22, D: 23, E: 23,
    F: 22, G: 24, H: 30, I: 28, J: 30,
    K: 10, L: 10,
  },
};

export type Seat = { row: string; number: number };

export function allSeats(type: keyof typeof seatLayout): Seat[] {
  return Object.entries(seatLayout[type]).flatMap(([row, count]) =>
    Array.from({ length: count }, (_, i) => ({ row, number: i + 1 }))
  );
}
