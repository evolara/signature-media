import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// expect body { ticketType: 'vip'|'classic', seats: [{row,number},...] }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ticketType, seats } = body;
  if (!ticketType || !Array.isArray(seats)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const supabase = getSupabase();
  // check existing conflicts
  const seatIds = seats.map((s: any) => `${s.row}-${s.number}`);
  const { data: existing, error: selectErr } = await supabase
    .from('reservations')
    .select('seat_id')
    .in('seat_id', seatIds);
  if (selectErr) {
    console.error('Supabase select error', selectErr);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  if (existing && existing.length > 0) {
    const conflicts = existing.map((r: any) => r.seat_id);
    return NextResponse.json({ error: 'conflict', conflicts }, { status: 409 });
  }

  // insert new reservation rows
  const inserts = seats.map((s: any) => ({ seat_id: `${s.row}-${s.number}`, ticket_type: ticketType }));
  const { error: insertErr } = await supabase.from('reservations').insert(inserts);
  if (insertErr) {
    console.error('Supabase insert error', insertErr);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  // return new full set
  const { data: allRows, error: allErr } = await supabase
    .from('reservations')
    .select('seat_id, ticket_type');
  if (allErr) {
    console.error('Supabase select all error', allErr);
    return NextResponse.json({ success: true, reserved: { vip: [], classic: [] } });
  }
  const vip: string[] = [];
  const classic: string[] = [];
  allRows?.forEach((row: any) => {
    if (row.ticket_type === 'vip') vip.push(row.seat_id);
    else if (row.ticket_type === 'classic') classic.push(row.seat_id);
  });
  return NextResponse.json({ success: true, reserved: { vip, classic } });
}
