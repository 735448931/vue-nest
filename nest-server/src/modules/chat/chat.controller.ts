import { Controller, Get, Query, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}


  // 获取聊天用户列表
  @Get('userList')
  async getUserList(@Query('userId') userId: string) {
    return await this.chatService.getUserList(userId)
   }


  // 获取聊天用户列表（会话列表）
  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: string) {
    return await this.chatService.getConversationList(Number(userId));
  }

  // 获取聊天历史
  @Get('history')
  async getChatHistory(
    @Query('userId1') userId1: string,
    @Query('userId2') userId2: string,
    @Query('limit') limit?: string,
  ) {
    return await this.chatService.getChatHistory(
      Number(userId1),
      Number(userId2),
      limit ? Number(limit) : 50,
    );
  }

  // 获取未读消息数量
  @Get('unread/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.chatService.getUnreadCount(Number(userId));
    return { unreadCount: count };
  }

  // 标记所有消息为已读
  @Get('mark-read')
  async markAllAsRead(
    @Query('userId') userId: string,
    @Query('senderId') senderId: string,
  ) {
    await this.chatService.markAllMessagesAsRead(Number(userId), Number(senderId));
    return { success: true };
  }
}
