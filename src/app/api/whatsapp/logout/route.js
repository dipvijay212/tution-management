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
      return NextResponse.json({ error: 'Forbidden. Only admins can manage WhatsApp connection.' }, { status: 403 });
    }

    await whatsappService.logout();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
