class WhatsAppService {
  constructor() {
    // In production, NEXT_PUBLIC_WHATSAPP_API_URL should point to your Render/Railway deployed microservice
    // In local development, it can point to the locally running microservice (http://localhost:3001)
    this.apiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'http://localhost:3001';
  }

  async getStatus() {
    try {
      const res = await fetch(`${this.apiUrl}/api/whatsapp/status`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Microservice is down');
      return await res.json();
    } catch (error) {
      console.error('Failed to get status from microservice:', error);
      return { status: 'ERROR', qr: null };
    }
  }

  async logout() {
    try {
      await fetch(`${this.apiUrl}/api/whatsapp/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  async sendMessage(to, text) {
    try {
      const res = await fetch(`${this.apiUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, text })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Failed to send message via microservice:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
