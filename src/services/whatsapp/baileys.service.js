import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';

// Keep connection alive across Next.js HMR in development
const globalForWhatsApp = globalThis;

class WhatsAppService {
  constructor() {
    this.sock = globalForWhatsApp.waSock || null;
    this.qrCode = null;
    this.status = 'DISCONNECTED';
    if (!globalForWhatsApp.waSock) {
      this.init();
    } else {
      this.status = 'CONNECTED';
    }
  }

  async init() {
    try {
      this.status = 'INITIALIZING';
      const { state, saveCreds } = await useMultiFileAuthState('./.whatsapp-auth');

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }), // Disable excessive logging
      });

      globalForWhatsApp.waSock = this.sock;

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = await QRCode.toDataURL(qr);
          this.status = 'QR_READY';
        }

        if (connection === 'close') {
          this.qrCode = null;
          const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('WhatsApp connection closed. Reconnecting:', shouldReconnect);
          
          if (shouldReconnect) {
            this.init();
          } else {
            this.status = 'DISCONNECTED';
            this.sock = null;
            globalForWhatsApp.waSock = null;
          }
        } else if (connection === 'open') {
          console.log('WhatsApp connection opened');
          this.status = 'CONNECTED';
          this.qrCode = null;
        }
      });
    } catch (error) {
      console.error('Failed to initialize WhatsApp:', error);
      this.status = 'ERROR';
    }
  }

  async getStatus() {
    return {
      status: this.status,
      qr: this.qrCode
    };
  }

  async logout() {
    if (this.sock) {
        await this.sock.logout();
        this.sock = null;
        globalForWhatsApp.waSock = null;
        this.status = 'DISCONNECTED';
    }
  }

  async sendMessage(to, text) {
    if (this.status !== 'CONNECTED' || !this.sock) {
      throw new Error('WhatsApp is not connected.');
    }
    
    // Format number to include country code (assuming India +91 if not provided)
    let formattedNumber = to.replace(/\D/g, '');
    if (formattedNumber.length === 10) {
      formattedNumber = `91${formattedNumber}`;
    }
    
    const jid = `${formattedNumber}@s.whatsapp.net`;
    
    try {
      const [result] = await this.sock.onWhatsApp(jid);
      if (!result?.exists) {
         throw new Error(`Number ${formattedNumber} is not on WhatsApp.`);
      }

      await this.sock.sendMessage(jid, { text });
      return { success: true, jid };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
