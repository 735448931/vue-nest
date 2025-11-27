import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { LangchainService } from '../langchain/langchain.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly langchainService: LangchainService,
  ) {}

  // 保存消息
  async saveMessage(data: {
    senderId: number;
    receiverId: number;
    content: string;
    messageType: string;
  }): Promise<Message> {
    const message = this.messageRepository.create(data);
    return await this.messageRepository.save(message);
  }

  // 获取两个用户之间的聊天历史
  async getChatHistory(userId1: number, userId2: number, limit = 50): Promise<Message[]> {
    return await this.messageRepository
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :userId1 AND message.receiverId = :userId2) OR (message.senderId = :userId2 AND message.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  // 获取用户的未读消息数量
  async getUnreadCount(userId: number): Promise<number> {
    return await this.messageRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  // 标记消息为已读
  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    await this.messageRepository.update(
      {
        id: messageId,
        receiverId: userId,
      },
      {
        isRead: true,
      },
    );
  }

  // 标记与某个用户的所有消息为已读
  async markAllMessagesAsRead(userId: number, senderId: number): Promise<void> {
    await this.messageRepository.update(
      {
        receiverId: userId,
        senderId: senderId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );
  }

  // 获取用户的会话列表（最近联系人）
  async getConversationList(userId: number) {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    // 按对话对象分组，保留每个对话的最新消息
    const conversationMap = new Map();
    
    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          userName: message.senderId === userId ? message.receiver?.username : message.sender?.username,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: 0,
        });
      }
    });

    // 计算每个会话的未读消息数
    for (const [otherUserId, conversation] of conversationMap) {
      const unreadCount = await this.messageRepository.count({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false,
        },
      });
      conversation.unreadCount = unreadCount;
    }

    return Array.from(conversationMap.values());
  }
}
