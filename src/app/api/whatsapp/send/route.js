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

    if (!userProfile || !['admin', 'teacher'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, teacherId, parentPhone, messageType, messageBody } = body;

    if (!parentPhone || !messageBody || !messageType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let status = 'PENDING';
    let waErrorMsg = null;
    try {
      await whatsappService.sendMessage(parentPhone, messageBody);
      status = 'SENT';
    } catch (waError) {
      console.error('WhatsApp Error:', waError);
      status = 'FAILED';
      waErrorMsg = waError.message || 'Failed to send message via WhatsApp';
    }

    const { data: log, error: logError } = await supabaseAdmin
      .from('whatsapp_logs')
      .insert({
        student_id: studentId || null,
        teacher_id: teacherId || null,
        parent_phone: parentPhone,
        message_type: messageType,
        message_body: messageBody,
        status: status,
        sent_by: user.id
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log message:', logError);
    }

    if (status === 'FAILED') {
      return NextResponse.json({ error: waErrorMsg }, { status: 400 });
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Send message API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
