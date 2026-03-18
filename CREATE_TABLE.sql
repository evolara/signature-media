-- =====================================================
-- إنشاء جدول المقاعد المحجوزة - Create booked_seats table
-- =====================================================
-- انسخ هذا الـ script بالتمام إلى Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.booked_seats (
  seat_key TEXT PRIMARY KEY,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('vip', 'classic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS (Row Level Security)
-- Enable RLS to allow public access
ALTER TABLE public.booked_seats ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة البيانات
-- Allow public SELECT
DROP POLICY IF EXISTS "Allow public SELECT" ON public.booked_seats;
CREATE POLICY "Allow public SELECT" 
  ON public.booked_seats 
  FOR SELECT 
  USING (true);

-- السماح للجميع بإدراج البيانات الجديدة
-- Allow public INSERT
DROP POLICY IF EXISTS "Allow public INSERT" ON public.booked_seats;
CREATE POLICY "Allow public INSERT" 
  ON public.booked_seats 
  FOR INSERT 
  WITH CHECK (true);

-- إنشاء فهرس لتحسين البحث
-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_booked_seats_ticket_type 
  ON public.booked_seats(ticket_type);

-- ✅ بدون بعد النسخ - اضغط Run
-- ✅ After pasting - click Run
