import { Controller, Get, Query } from '@nestjs/common';
import { LangchainService } from './langchain.service';
import { ChatOpenAI } from '@langchain/openai';


@Controller('langchain')
export class LangchainController {
  constructor(private readonly langchainService: LangchainService) { }

  @Get('ask1')
  async getAsk1(@Query('question') question: string) {
		const model = new ChatOpenAI({
			model: 'deepseek-chat',
			apiKey: 'my-key',
			configuration: {
				baseURL: 'https://api.deepseek.com'
			}
    })
    
    const response: any = await model.invoke(question)
    

    console.log('🍿🍿🍿🍿🍿response:', response.content);
    


    return response
    
  }

}
