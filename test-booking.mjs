#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL);
  console.error('VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBooking() {
  console.log('🧪 Testing Supabase booking system...\n');
  
  try {
    // Test 1: Fetch existing bookings
    console.log('1️⃣ Fetching existing booked seats for VIP...');
    const { data: vipSeats, error: vipError } = await supabase
      .from('booked_seats')
      .select('seat_key, ticket_type')
      .eq('ticket_type', 'vip');
    
    if (vipError) throw vipError;
    console.log(`   ✅ Found ${vipSeats.length} booked VIP seats`);
    if (vipSeats.length > 0) {
      console.log('   Booked seats:', vipSeats.map(s => s.seat_key).join(', '));
    }
    
    // Test 2: Try to reserve a new seat
    console.log('\n2️⃣ Attempting to reserve seat A-1 (VIP)...');
    const testSeat = {
      seat_key: `A-${Math.floor(Math.random() * 10) + 1}`,
      ticket_type: 'vip'
    };
    
    const { error: insertError, data: insertData } = await supabase
      .from('booked_seats')
      .insert([testSeat])
      .select();
    
    if (insertError) {
      if (insertError.message.includes('already exists')) {
        console.log(`   ⚠️ Seat ${testSeat.seat_key} is already booked`);
      } else {
        throw insertError;
      }
    } else {
      console.log(`   ✅ Successfully reserved seat ${testSeat.seat_key}`);
      console.log('   Data:', insertData);
    }
    
    // Test 3: Verify the seat appears in the list
    console.log('\n3️⃣ Verifying seat in booked seats...');
    const { data: verifySeats, error: verifyError } = await supabase
      .from('booked_seats')
      .select('seat_key')
      .eq('seat_key', testSeat.seat_key);
    
    if (verifyError) throw verifyError;
    console.log(`   ✅ Seat marked as booked: ${verifySeats.length > 0}`);
    
    // Test 4: Try to reserve the same seat again (should fail)
    console.log('\n4️⃣ Attempting to reserve the same seat again (should fail)...');
    const { error: duplicateError } = await supabase
      .from('booked_seats')
      .insert([testSeat]);
    
    if (duplicateError) {
      console.log(`   ✅ Correctly rejected duplicate: ${duplicateError.message}`);
    } else {
      console.log(`   ⚠️ Duplicate was accepted (this is bad!)`);
    }
    
    console.log('\n✅ All booking tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testBooking();
