import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// stored as JSON arrays under keys 'reserved_vip' and 'reserved_classic'
export async function GET(request: NextRequest) {
  const vip = await kv.get('reserved_vip') as string[] | null;
  const classic = await kv.get('reserved_classic') as string[] | null;
  return NextResponse.json({ vip: vip || [], classic: classic || [] });
}
