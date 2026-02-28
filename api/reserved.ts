import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// small helper to build supabase client from env
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// returns reservations from Supabase table
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reservations')
    .select('seat_id, ticket_type');
  if (error) {
    console.error('Supabase error GET /reserved', error);
    return NextResponse.json({ vip: [], classic: [] }, { status: 500 });
  }
  const vip: string[] = [];
  const classic: string[] = [];
  data?.forEach((row: any) => {
    if (row.ticket_type === 'vip') vip.push(row.seat_id);
    else if (row.ticket_type === 'classic') classic.push(row.seat_id);
  });
  return NextResponse.json({ vip, classic });
}
