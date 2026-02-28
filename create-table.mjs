#!/usr/bin/env node
/**
 * Create booked_seats table using Supabase REST API
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing env variables');
  process.exit(1);
}

console.log('\n🔨 إنشاء جدول booked_seats\n');

// Note: We can't directly execute SQL via REST API without admin privileges
// So we'll show the user how to create it manually

const sqlScript = `-- أنشئ جدول المقاعد المحجوزة
CREATE TABLE IF NOT EXISTS public.booked_seats (
  seat_key TEXT PRIMARY KEY,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('vip', 'classic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.booked_seats ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY IF NOT EXISTS "Allow public SELECT" 
  ON public.booked_seats 
  FOR SELECT 
  USING (true);

-- السماح للجميع بالإدراج
CREATE POLICY IF NOT EXISTS "Allow public INSERT" 
  ON public.booked_seats 
  FOR INSERT 
  WITH CHECK (true);

-- إنشاء فهرس
CREATE INDEX IF NOT EXISTS idx_booked_seats_ticket_type 
  ON public.booked_seats(ticket_type);`;

console.log('📋 KSql Script:\n');
console.log(sqlScript);
console.log('\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ خطوات الإنشاء:\n');
console.log('1. اذهب إلى: https://app.supabase.com/project/ujbxsmwjgvvpwkdgbkcu');
console.log('2. اضغط على "SQL Editor" (الأيسر)');
console.log('3. اضغط "New Query"');
console.log('4. انسخ الـ script أعلاه بالتمام');
console.log('5. اضغط "▶️ Run"');
console.log('6. عد إلى الـ terminal وشغل: node test-supabase.mjs');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
