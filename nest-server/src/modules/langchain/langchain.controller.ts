import { Controller, Get, Query } from '@nestjs/common';
import { LangchainService, AIProvider } from './langchain.service';


@Controller('langchain')
export class LangchainController {
	constructor(private readonly langchainService: LangchainService) {}

	@Get('providers')
	getAllProviders() {
		return {
			available: this.langchainService.getAvailableProviders(),
			default: AIProvider.DEEPSEEK
		}
	}

	@Get('invoke')
	async getInvoke(
		@Query('question') question: string,
		@Query('provider') provider?: string
	) {
		// 根据查询参数选择供应商，默认使用 Deepseek
		const aiProvider = (provider as AIProvider) || AIProvider.DEEPSEEK
		const model = this.langchainService.getChatModel(aiProvider)

		const response: any = await model.invoke(question)

		return {
			provider: aiProvider,
			content: response.content,
		}
  }
  
  @Get('stream')
  async getStream() { }
  
}
