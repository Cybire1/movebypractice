#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

// Read migration file
const migrationPath = path.join(__dirname, 'supabase/migrations/001_add_livekit_tables.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Split SQL into individual statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

async function runMigration() {
  console.log(`Running migration with ${statements.length} statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: statement + ';' })
      });

      if (!response.ok) {
        const error = await response.text();
        console.log(`Statement: ${statement.substring(0, 100)}...`);
        console.error(`Failed: ${error}`);

        // Try alternative approach using pg-promise
        console.log('Trying alternative approach with direct database connection...');
        break;
      }

      console.log('✓ Success');
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
}

// Alternative: Use direct SQL execution
async function runWithDirectSQL() {
  console.log('\nAttempting direct SQL execution...');

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Execute migration via Supabase client's rpc method
  try {
    // First verify connection
    const { data, error } = await supabase.from('classes').select('id').limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      process.exit(1);
    }

    console.log('✓ Connection successful');

    // Since we can't execute raw DDL through REST API, let's provide instructions
    console.log('\n⚠️  Database migration needs to be executed via Supabase SQL Editor:');
    console.log('\n1. Go to: https://supabase.com/dashboard/project/ygdhvrquxbxbyxsnytbk/sql');
    console.log('2. Click "New query"');
    console.log('3. Copy and paste the contents of: supabase/migrations/001_add_livekit_tables.sql');
    console.log('4. Click "Run" or press Cmd/Ctrl + Enter');
    console.log('\nAlternatively, use the Supabase CLI:');
    console.log('  supabase db push');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

runWithDirectSQL();
