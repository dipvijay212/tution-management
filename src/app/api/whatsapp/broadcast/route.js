import { NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsapp/baileys.service';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Only admins can broadcast.' }, { status: 403 });
    }

    const body = await request.json();
    const { recipients, messageType, messageBody } = body;

    if (!recipients || !Array.isArray(recipients) || !messageBody || !messageType) {
      return NextResponse.json({ error: 'Missing required fields or invalid format' }, { status: 400 });
    }

    const results = [];
    
    // Process sequentially to avoid rate limiting
    for (const recipient of recipients) {
      const { parentPhone, studentId } = recipient;
      let status = 'PENDING';
      
      try {
        await whatsappService.sendMessage(parentPhone, messageBody);
        status = 'SENT';
      } catch (waError) {
        console.error(`WhatsApp Error sending to ${parentPhone}:`, waError);
        status = 'FAILED';
      }

      const { data: log } = await supabaseAdmin
        .from('whatsapp_logs')
        .insert({
          student_id: studentId || null,
          parent_phone: parentPhone,
          message_type: messageType,
          message_body: messageBody,
          status: status,
          sent_by: user.id
        })
        .select()
        .single();
        
      results.push({ phone: parentPhone, status, log });
      
      // Delay to avoid spam block (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Broadcast API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
