import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportService, ChatMessage } from './support.service.js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'support',
})
export class SupportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly supportService: SupportService) {}

  handleConnection(client: Socket) {
    const sendResponse = (msg: ChatMessage) => {
      client.emit('receiveMessage', msg);
    };

    this.supportService.handleUserConnection(client, sendResponse);
  }

  handleDisconnect(client: Socket) {
    this.supportService.handleUserDisconnection(client);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { text: string },
  ) {
    const botReply = this.supportService.processUserMessage(data.text);

    setTimeout(() => {
      client.emit('receiveMessage', {
        sender: 'ai-bot',
        text: botReply,
        timestamp: new Date().toISOString(),
      });
    }, 800);
  }
}
