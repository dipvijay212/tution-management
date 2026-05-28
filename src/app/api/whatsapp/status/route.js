import { NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsapp/baileys.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await whatsappService.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
