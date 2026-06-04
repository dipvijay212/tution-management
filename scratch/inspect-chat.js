global.WebSocket = class {};

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
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
  console.log('--- Fetching Rooms ---');
  const { data: rooms, error: errRooms } = await supabase.from('chat_rooms').select('*');
  console.log('Rooms:', rooms);

  console.log('--- Fetching Participants for xsafd ---');
  const xsafdRoom = rooms.find(r => r.title === 'xsafd');
  if (xsafdRoom) {
    const { data: participants, error: errParts } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('room_id', xsafdRoom.id);
    
    // Resolve user details for participants
    const userIds = participants.map(p => p.user_id);
    const { data: users } = await supabase.from('users').select('auth_id, full_name, role').in('auth_id', userIds);
    
    const detailedParticipants = participants.map(p => ({
      ...p,
      user: users.find(u => u.auth_id === p.user_id)
    }));
    
    console.log('XSafd Participants:', detailedParticipants);
  } else {
    console.log('Room "xsafd" not found');
  }

  console.log('--- Fetching Student-Batch Links ---');
  const { data: studentBatches } = await supabase
    .from('student_batches')
    .select(`
      id,
      student_id,
      batch_id,
      student:students(full_name, user_id, email),
      batch:batches(batch_name, teacher_id, teacher:teachers(full_name, user_id))
    `);
  console.log('Student Batches Details:', JSON.stringify(studentBatches, null, 2));

  console.log('--- Fetching Users with Auth ID ---');
  const { data: allUsers } = await supabase.from('users').select('*');
  console.log('All Users:', allUsers);
}

run();
