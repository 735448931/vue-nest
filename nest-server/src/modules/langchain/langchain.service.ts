import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';

export enum AIProvider {
	DEEPSEEK = 'deepseek',
	// XIAOAI = 'xiaoai',
	BAILIAN = 'bailian'
}

@Injectable()
export class LangchainService {
	private modelInstances: Map<AIProvider, ChatOpenAI> = new Map();

	constructor(private readonly configService: ConfigService) {
		this.initializeModels();
	}

	/**
	 * 初始化所有AI模型实例（单例模式）
	 */
	private initializeModels() {
		// Deepseek
		this.modelInstances.set(
			AIProvider.DEEPSEEK,
			new ChatOpenAI({
				model: 'deepseek-chat',
				apiKey: this.configService.get<string>('DEEPSEEK_API_KEY'),
				configuration: {
					baseURL: this.configService.get<string>('DEEPSEEK_BASE_URL')
				}
			})
		);

		// 小爱 AI
		// this.modelInstances.set(
		// 	AIProvider.XIAOAI,
		// 	new ChatOpenAI({
		// 		model: 'gpt-4o-mini',
		// 		apiKey: this.configService.get<string>('XIAOAI_API_KEY'),
		// 		configuration: {
		// 			baseURL: this.configService.get<string>('XIAOAI_BASE_URL')
		// 		}
		// 	})
		// );

		// 百炼
		this.modelInstances.set(
			AIProvider.BAILIAN,
			new ChatOpenAI({
				model: 'qwen-plus',
				apiKey: this.configService.get<string>('BAILIAN_API_KEY'),
				configuration: {
					baseURL: this.configService.get<string>('BAILIAN_BASE_URL')
				}
			})
		);
	}

	/**
	 * 获取指定供应商的模型实例
	 * @param provider AI供应商
	 * @returns ChatOpenAI实例
	 */
	getChatModel(provider: AIProvider = AIProvider.DEEPSEEK): ChatOpenAI {
		const model = this.modelInstances.get(provider);
		if (!model) {
			throw new Error(`AI provider ${provider} not found`);
		}
		return model;
	}

	/**
	 * 获取流式响应以支持 SSE 推送
	 */
	async streamChatResponse(
		question: string,
		provider: AIProvider = AIProvider.DEEPSEEK
	): Promise<AsyncIterable<unknown>> {
		const model = this.getChatModel(provider);
		return model.stream(question);
	}

	/**
	 * 获取所有可用的供应商
	 */
	getAvailableProviders(): AIProvider[] {
		return Array.from(this.modelInstances.keys());
	}
}
