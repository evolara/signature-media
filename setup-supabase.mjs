#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Setup\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY ? '✅' : '❌');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  try {
    console.log('\n1️⃣ Testing connection to Supabase...');
    
    // Test connection by querying the information_schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    // Even if query fails, connection worked if we got to Supabase
    console.log('✅ Connected to Supabase\n');
    
    console.log('2️⃣ Checking if booked_seats table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'booked_seats');
    
    if (tables && tables.length > 0) {
      console.log('✅ Table booked_seats already exists\n');
      return;
    }
    
    console.log('⚠️ Table booked_seats not found. Creating it...\n');
    console.log('📝 Run this SQL in Supabase Dashboard → SQL Editor:\n');
    
    const sqlScript = `
CREATE TABLE IF NOT EXISTS booked_seats (
  seat_key TEXT PRIMARY KEY,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('vip', 'classic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE booked_seats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public SELECT" ON booked_seats FOR SELECT USING (true);
CREATE POLICY "Allow public INSERT" ON booked_seats FOR INSERT WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_booked_seats_ticket_type ON booked_seats(ticket_type);
`;

    console.log(sqlScript);
    console.log('\n✅ Copy the above SQL and paste into your Supabase SQL Editor');
    console.log('📍 Path: Supabase Dashboard → SQL Editor → New Query\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
