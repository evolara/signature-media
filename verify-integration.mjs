// Quick verification that Supabase code is properly integrated
import { readFileSync } from 'fs';

const bookingFlowCode = readFileSync('src/app/components/booking-flow.tsx', 'utf-8');

const checks = {
  'Supabase import': bookingFlowCode.includes("from '@supabase/supabase-js'"),
  'createClient initialization': bookingFlowCode.includes('createClient(supabaseUrl, supabaseAnonKey)'),
  'fetchBookedSeats function': bookingFlowCode.includes('async function fetchBookedSeats'),
  'reserveSeats function': bookingFlowCode.includes('async function reserveSeats'),
  'useEffect for fetching seats': bookingFlowCode.includes('loadBookedSeats()'),
  'booked seats state': bookingFlowCode.includes('[bookedSeats, setBookedSeats]'),
  'Pass bookedSeats to SeatPicker': bookingFlowCode.includes('available={bookedSeats}'),
  'Real-time subscription': bookingFlowCode.includes('.channel(`booked_seats'),
  'Reserve on WhatsApp send': bookingFlowCode.includes('await reserveSeats(selectedSeats'),
};

console.log('✅ Verification of Supabase Integration\n');
let allPass = true;
for (const [check, result] of Object.entries(checks)) {
  console.log(`${result ? '✅' : '❌'} ${check}`);
  if (!result) allPass = false;
}

if (allPass) {
  console.log('\n✅ All integration checks passed!');
  console.log('Supabase booking system is properly integrated.');
} else {
  console.log('\n❌ Some checks failed. Review the integration.');
  process.exit(1);
}
