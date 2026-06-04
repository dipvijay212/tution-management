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

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function run() {
  const batchId = '94e84e69-8530-419e-a7cb-a783b6670c8d'; // xsafd batch

  // 1. Fetch batch details
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select('*, subject:subjects(name)')
    .eq('id', batchId)
    .single();
  
  console.log('Batch fetch result:', { batch, error: batchError?.message });

  // 2. Fetch students in this batch (joined from student_batches to students)
  const { data: studentList, error: studentsError } = await supabase
    .from('student_batches')
    .select('students(*)')
    .eq('batch_id', batchId);
  
  console.log('Students in batch count:', studentList?.length);
  if (studentList) {
    console.log('Students detail:', studentList.map(item => item.students));
  }

  // 3. Fetch attendance for this batch on a given date
  // Note: the date column is attendance_date, let's query it
  const date = '2026-06-04';
  const { data: attendanceData, error: attendanceError } = await supabase
    .from('attendance')
    .select('*')
    .eq('batch_id', batchId)
    .eq('attendance_date', date);
  
  console.log('Attendance list:', { attendanceData, error: attendanceError?.message });
}

run();
