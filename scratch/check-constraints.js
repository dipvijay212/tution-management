global.WebSocket = class {};

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const processEnv = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      processEnv[key] = val;
    }
  }
});

const supabaseUrl = processEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = processEnv.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'public.attendance'::regclass;
    `
  });
  
  if (error) {
    // If RPC doesn't exist, we can fetch via query or write a direct query
    console.log('RPC error (probably does not exist):', error.message);
    
    // Let's try select to see if we can do a test insert/upsert
    console.log('Trying test select on attendance columns...');
    const { data: colData } = await supabase.from('attendance').select('*').limit(1);
    console.log('Columns in attendance:', colData ? Object.keys(colData[0] || {}) : 'No data');
  } else {
    console.log('Constraints:', data);
  }
}

run();
