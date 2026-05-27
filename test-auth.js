const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.join(__dirname, '.env');
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
const supabaseAnonKey = processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = processEnv.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseAnonKey);
console.log('Service Role Key exists:', !!supabaseServiceRoleKey);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function run() {
  try {
    console.log('Initializing test...');
    
    const dummyJwt = 'invalid_jwt_token_format';
    
    console.log('Testing dummy JWT with supabaseAdmin.auth.getUser()...');
    const resAdmin = await supabaseAdmin.auth.getUser(dummyJwt);
    console.log('Admin client result:', { error: resAdmin.error?.message, status: resAdmin.error?.status });
    
    console.log('Testing dummy JWT with supabaseAnon.auth.getUser()...');
    const resAnon = await supabaseAnon.auth.getUser(dummyJwt);
    console.log('Anon client result:', { error: resAnon.error?.message, status: resAnon.error?.status });
  } catch (err) {
    console.error('Test error:', err);
  }
}

run();
