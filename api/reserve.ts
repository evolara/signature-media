import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// expect body { ticketType: 'vip'|'classic', seats: [{row,number},...] }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ticketType, seats } = body;
  if (!ticketType || !Array.isArray(seats)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // fetch current
  const key = ticketType === 'vip' ? 'reserved_vip' : 'reserved_classic';
  const current: string[] = (await kv.get(key)) || [];
  const currentSet = new Set(current);

  const conflicts = seats.filter((s: any) => currentSet.has(`${s.row}-${s.number}`));
  if (conflicts.length > 0) {
    return NextResponse.json({ error: 'conflict', conflicts }, { status: 409 });
  }

  seats.forEach((s: any) => currentSet.add(`${s.row}-${s.number}`));
  await kv.set(key, Array.from(currentSet));

  const vipArr = await kv.get('reserved_vip') as string[] | null;
  const classicArr = await kv.get('reserved_classic') as string[] | null;
  return NextResponse.json({ success: true, reserved: { vip: vipArr || [], classic: classicArr || [] } });
}
