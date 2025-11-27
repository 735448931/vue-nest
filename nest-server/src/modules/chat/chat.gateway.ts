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
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // 生产环境请配置具体域名
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  
  // 存储用户 ID 和 socket ID 的映射
  private userSocketMap = new Map<number, string>();

  constructor(private readonly chatService: ChatService) {}

  // 处理客户端连接
  handleConnection(client: Socket) {
    this.logger.log(`客户端连接: ${client.id}`);
  }

  // 处理客户端断开连接
  handleDisconnect(client: Socket) {
    // 从映射中移除断开连接的用户
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        this.logger.log(`用户 ${userId} 断开连接`);
        break;
      }
    }
  }

  // 用户上线，建立 userId 和 socketId 的映射
  @SubscribeMessage('online')
  handleOnline(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    this.userSocketMap.set(userId, client.id);
    this.logger.log(`用户 ${userId} 上线，socket ID: ${client.id}`);
    
    return {
      event: 'online',
      data: { success: true, message: '上线成功' },
    };
  }

  // 发送私聊消息
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: {
      senderId: number;
      receiverId: number;
      content: string;
      messageType?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { senderId, receiverId, content, messageType = 'text' } = data;

    try {
      // 保存消息到数据库
      const message = await this.chatService.saveMessage({
        senderId,
        receiverId,
        content,
        messageType,
      });

      // 获取接收者的 socket ID
      const receiverSocketId = this.userSocketMap.get(receiverId);

      // 如果接收者在线，发送消息给接收者
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('receiveMessage', {
          id: message.id,
          senderId,
          receiverId,
          content,
          messageType,
          createdAt: message.createdAt,
          isRead: false,
        });
        this.logger.log(`消息已发送给用户 ${receiverId}`);
      } else {
        this.logger.log(`用户 ${receiverId} 不在线，消息已保存`);
      }

      // 返回确认给发送者
      return {
        event: 'sendMessage',
        data: {
          success: true,
          message: '消息发送成功',
          messageData: message,
        },
      };
    } catch (error) {
      this.logger.error(`发送消息失败: ${error.message}`);
      return {
        event: 'sendMessage',
        data: { success: false, message: '消息发送失败' },
      };
    }
  }

  // 标记消息为已读
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: number; userId: number },
  ) {
    const { messageId, userId } = data;
    
    try {
      await this.chatService.markMessageAsRead(messageId, userId);
      
      return {
        event: 'markAsRead',
        data: { success: true, messageId },
      };
    } catch (error) {
      this.logger.error(`标记已读失败: ${error.message}`);
      return {
        event: 'markAsRead',
        data: { success: false, message: '标记已读失败' },
      };
    }
  }

  // 获取用户在线状态
  getUserOnlineStatus(userId: number): boolean {
    return this.userSocketMap.has(userId);
  }
}
