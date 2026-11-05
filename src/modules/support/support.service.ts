import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface ChatMessage {
  sender: 'user' | 'ai-bot';
  text: string;
  timestamp: string;
}

@Injectable()
export class SupportService {
  private promoIntervals = new Map<string, NodeJS.Timeout>();

  handleUserConnection(
    client: Socket,
    sendResponse: (msg: ChatMessage) => void,
  ) {
    console.log(`Client connected: ${client.id}`);

    setTimeout(() => {
      sendResponse({
        sender: 'ai-bot',
        text: 'Hello! Welcome to our shoe store support. How can I help you find your perfect pair today?',
        timestamp: new Date().toISOString(),
      });
    }, 500);

    const promoTimer = setInterval(() => {
      sendResponse({
        sender: 'ai-bot',
        text: '🔥 Flash Sale Alert! Get 15% off your entire order today using code KICK15 at checkout!',
        timestamp: new Date().toISOString(),
      });
    }, 180000);

    this.promoIntervals.set(client.id, promoTimer);
  }

  handleUserDisconnection(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const timer = this.promoIntervals.get(client.id);
    if (timer) {
      clearInterval(timer);
      this.promoIntervals.delete(client.id);
    }
  }

  processUserMessage(userText: string): string {
    const text = userText.toLowerCase();
    let botReply =
      "I'm your virtual shopping assistant! I can help you with shoe sizes, shipping details, or return policies.";

    if (
      text.includes('size') ||
      text.includes('fit') ||
      text.includes('sizing')
    ) {
      botReply =
        'We use standard international sizing. If you are between sizes, we generally recommend sizing up for a comfortable fit!';
    } else if (
      text.includes('shipping') ||
      text.includes('delivery') ||
      text.includes('arrive')
    ) {
      botReply =
        'We offer standard shipping (3-5 business days) and express delivery. Free shipping applies to orders over $50!';
    } else if (
      text.includes('return') ||
      text.includes('refund') ||
      text.includes('exchange')
    ) {
      botReply =
        'Returns are totally free within 30 days of purchase, provided the shoes are unworn and in their original box.';
    } else if (
      text.includes('discount') ||
      text.includes('sale') ||
      text.includes('promo')
    ) {
      botReply =
        'You can use code EVE15 for 15% off right now, or keep an eye out for our flash sales!';
    }

    return botReply;
  }
}
