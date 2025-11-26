import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }
  
  @Get('user-list')
  getChatUserList() { 
    return [
      {id:'1', name: 'test'},
    ]
  }
}
