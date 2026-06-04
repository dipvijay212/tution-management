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
  console.log('--- Database Chat Repair ---');
  
  const roomId = '2c4ddd89-450a-4ad4-a230-537e94b7ec51';
  const batchId = '94e84e69-8530-419e-a7cb-a783b6670c8d';
  const studentAuthId = '53975394-4f13-4513-8ea0-9cc10780f830'; // vijay
  
  // 1. Update room's class_id
  const { data: updateRoom, error: errRoom } = await supabase
    .from('chat_rooms')
    .update({ class_id: batchId })
    .eq('id', roomId)
    .select();
    
  if (errRoom) {
    console.error('Error updating room:', errRoom);
  } else {
    console.log('Room updated successfully:', updateRoom);
  }
  
  // 2. Insert vijay into participants
  const { data: insertPart, error: errPart } = await supabase
    .from('chat_participants')
    .insert({
      room_id: roomId,
      user_id: studentAuthId,
      role: 'member'
    })
    .select();
    
  if (errPart) {
    console.error('Error inserting participant:', errPart);
  } else {
    console.log('Participant inserted successfully:', insertPart);
  }
}

run();
