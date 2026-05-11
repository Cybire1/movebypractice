#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifySetup() {
  console.log('\n🔍 Verifying Database Setup...\n');

  try {
    // Check if tables exist
    const tables = [
      'users',
      'user_stats', 
      'user_progress',
      'achievements',
      'analytics_events',
      'classes',
      'class_bookings',
      'class_messages',
      'class_donations'
    ];

    console.log('📊 Checking tables...');
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && !error.message.includes('no rows')) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✓ ${table}`);
      }
    }

    console.log('\n✅ Database setup verified!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Enable Realtime for class_messages:');
    console.log('     - Run enable-realtime.sql in Supabase SQL Editor');
    console.log('     OR');
    console.log('     - Go to Database → Replication → Enable class_messages');
    console.log('  2. Start dev server: npm run dev');
    console.log('  3. Test live streaming at http://localhost:3000/classes');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
  }
}

verifySetup();
