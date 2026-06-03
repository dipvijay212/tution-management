import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const { message, roomId } = await req.json();

    // The WhatsApp microservice URL from environment variables
    const whatsappApiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'http://localhost:3001';

    // Fetch phone numbers of chat participants
    const { data: participants, error: participantError } = await supabaseAdmin
      .from('chat_participants')
      .select('user_id')
      .eq('room_id', roomId);

    let toNumbers = [];
    if (!participantError && participants?.length) {
      const userIds = participants.map(p => p.user_id).filter(id => id !== message.sender_id);
      
      if (userIds.length > 0) {
        const { data: usersData } = await supabaseAdmin
          .from('users')
          .select('phone')
          .in('id', userIds)
          .not('phone', 'is', null);

        if (usersData) {
          toNumbers = usersData.map(u => u.phone);
        }
      }
    }

    if (toNumbers.length > 0) {
      fetch(`${whatsappApiUrl}/api/notify-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'NEW_MESSAGE',
          data: {
            roomId,
            senderName: message.sender?.full_name || 'Someone',
            messageType: message.message_type,
            content: message.message_type === 'text' ? message.message : 'Sent an attachment',
            toNumbers
          }
        }),
      }).catch(e => console.error("Error triggering whatsapp service:", e));
    }

    return NextResponse.json({ success: true, message: 'Notification queued' });
  } catch (error) {
    console.error('Chat Notify API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
