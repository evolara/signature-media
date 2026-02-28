#!/usr/bin/env node
/**
 * نسخ ولصق القيم مباشرة من Supabase Settings → API
 */

const TEST_URL = 'https://ujbxsmwjgvvpwkdgbkcu.supabase.co';
const TEST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYnhzbXdqZ3Z2cHdrZGdia2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODM1NzMsImV4cCI6MjA4Nzg1OTU1N30.IXFp6cAfiQK8XEs9hOIhcJsdWG47HTaKNo5_nAZfOB4';

console.log('\n✅ تحقق من طول المفتاح:');
console.log('URL length:', TEST_URL.length);
console.log('Key length:', TEST_KEY.length);

if (TEST_KEY.split('.').length !== 3) {
  console.error('\n❌ المفتاح بدون صيغة صحيحة!');
  console.error('JWT key يجب أن يحتوي على 3 أجزاء مفصولة بـ نقطة (.)');
  process.exit(1);
}

console.log('✅ صيغة JWT صحيحة\n');

console.log('🔍 معلومات المشروع:');
try {
  const parts = TEST_KEY.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('Role:', payload.role);
  console.log('Reference:', payload.ref);
  console.log('Issue Date:', new Date(payload.iat * 1000));
  console.log('Expires:', new Date(payload.exp * 1000));
} catch (e) {
  console.log('Cannot decode payload');
}

// الآن حفظ في .env
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

const envContent = `VITE_SUPABASE_URL=${TEST_URL}
VITE_SUPABASE_ANON_KEY=${TEST_KEY}`;

fs.writeFileSync(envPath, envContent);
console.log('\n✅ تم التحديث في .env\n');
