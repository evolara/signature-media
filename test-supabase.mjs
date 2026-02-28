#!/usr/bin/env node
/**
 * اختبار حجز المقاعد في Supabase
 * Testing Supabase Booking System
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('\n🎫 Testing Booking System\n');

async function testBooking() {
  try {
    // 1. محاولة إدراج مقعد
    console.log('1️⃣ محاولة حجز مقعد A-1 (نوع: VIP)');
    const testSeat = {
      seat_key: `A-${Math.floor(Math.random() * 10) + 1}`,
      ticket_type: 'vip'
    };
    
    const { data, error } = await supabase
      .from('booked_seats')
      .insert([testSeat])
      .select();
    
    if (error) {
      if (error.message.includes('relation "booked_seats" does not exist')) {
        throw new Error('❌ جدول booked_seats غير موجود!\n⚠️ تحتاج لإنشاء الجدول أولاً في SQL Editor');
      }
      throw error;
    }
    
    console.log(`✅ تم حجز المقعد: ${testSeat.seat_key}\n`);
    
    // 2. جلب جميع المقاعد المحجوزة
    console.log('2️⃣ جلب جميع المقاعد المحجوزة (VIP)');
    const { data: bookedSeats, error: fetchError } = await supabase
      .from('booked_seats')
      .select('*')
      .eq('ticket_type', 'vip');
    
    if (fetchError) throw fetchError;
    
    console.log(`✅ عدد المقاعد المحجوزة: ${bookedSeats.length}`);
    if (bookedSeats.length > 0) {
      console.log('المقاعد:');
      bookedSeats.forEach(seat => {
        console.log(`  - ${seat.seat_key} (${seat.created_at})`);
      });
    }
    
    console.log('\n✅ النظام يعمل بشكل صحيح!\n');
    
  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.message.includes('does not exist')) {
      console.error('\n⚠️ IMPORTANT - اتبع هذه الخطوات:\n');
      console.error('1. اذهب إلى: https://app.supabase.com');
      console.error('2. اختر المشروع: ujbxsmwjgvvpwkdgbkcu');
      console.error('3. اذهب إلى SQL Editor');
      console.error('4. انسخ والصق SQL من ملف BOOKING_INTEGRATION.md');
      console.error('5. اضغط Run');
      console.error('6. ثم حاول مرة أخرى\n');
    }
    process.exit(1);
  }
}

testBooking();
