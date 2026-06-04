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
  // Let's query the column names of attendance from postgres information_schema via RPC or raw query if possible,
  // or simply query the API to see if we can get fields.
  // We can also check by inserting different statuses: 'present', 'absent', 'Present', 'Absent', 'PRESENT', 'ABSENT', 'LATE', 'late', 'Late'
  const statuses = ['Present', 'Absent', 'present', 'absent', 'PRESENT', 'ABSENT', 'late', 'Late', 'LATE', 'leave', 'Leave', 'LEAVE'];
  for (const status of statuses) {
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        student_id: 'c413a71a-fdfb-4414-94b4-82a7d5cf15a1',
        batch_id: '94e84e69-8530-419e-a7cb-a783b6670c8d',
        attendance_date: '2026-06-04',
        status: status
      })
      .select();
    if (error) {
      console.log(`Status "${status}" failed:`, error.message);
    } else {
      console.log(`Status "${status}" SUCCEEDED:`, data);
      // Delete the inserted row
      await supabase.from('attendance').delete().eq('student_id', 'c413a71a-fdfb-4414-94b4-82a7d5cf15a1').eq('batch_id', '94e84e69-8530-419e-a7cb-a783b6670c8d').eq('attendance_date', '2026-06-04');
    }
  }
}

run();
