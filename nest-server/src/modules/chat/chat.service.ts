import { Injectable } from '@nestjs/common'
import { LangchainService } from '../langchain/langchain.service'

@Injectable()
export class ChatService {
	constructor(private readonly langchainService: LangchainService) {}
    
    // 现在你可以在这里使用 this.langchainService 调用其方法
    // 例如：
    // async chat(question: string) {
    //   const stream = await this.langchainService.streamChatResponse(question);
    //   return stream;
    // }
}
