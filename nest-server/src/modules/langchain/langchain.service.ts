import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod'
import { tool } from 'langchain';

export enum AIProvider {
	DEEPSEEK = 'deepseek',
	// XIAOAI = 'xiaoai',
	BAILIAN = 'bailian'
}

@Injectable()
export class LangchainService {
	private modelInstances: Map<AIProvider, ChatOpenAI> = new Map()

	constructor(private readonly configService: ConfigService) {
		this.initializeModels()
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
		)

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
		)
	}

	/**
	 * 获取指定供应商的模型实例
	 * @param provider AI供应商
	 * @returns ChatOpenAI实例
	 */
	getChatModel(provider: AIProvider = AIProvider.DEEPSEEK): ChatOpenAI {
		const model = this.modelInstances.get(provider)
		if (!model) {
			throw new Error(`AI provider ${provider} not found`)
		}
		return model
	}

	/**
	 * 获取流式响应以支持 SSE 推送
	 */
	async streamChatResponse(
		question: string,
		provider: AIProvider = AIProvider.DEEPSEEK
	): Promise<AsyncIterable<unknown>> {
		const model = this.getChatModel(provider)
		return model.stream(question)
	}

	/**
	 * 获取所有可用的供应商
	 */
	getAvailableProviders(): AIProvider[] {
		return Array.from(this.modelInstances.keys())
	}

	async invokeWithTools(
		provider: AIProvider = AIProvider.DEEPSEEK
	): Promise<any> {
		// 1. 定义一个简单的工具（例如：加法计算器）
		const calculatorSchema = z.object({
			a: z.number().describe('第一个数字'),
			b: z.number().describe('第二个数字')
		})

		const calculatorTool = tool(
			async ({ a, b }) => {
				return `${a + b}`
			},
			{
				name: 'calculator',
				description: '计算两个数字的和',
				schema: calculatorSchema
			}
		)

		// 2. 获取模型实例并绑定工具
		const model = this.getChatModel(provider)
		const modelWithTools = model.bindTools([calculatorTool])

		try {
			// 3. 发送一个需要使用工具的问题
			const result = await modelWithTools.invoke(
				'请帮我计算 100 加 200 等于多少？'
			)

			// 4. 检查结果
			if (result.tool_calls && result.tool_calls.length > 0) {
				console.log('✅ 模型支持工具调用！')
				console.log(
					'工具调用详情:',
					JSON.stringify(result.tool_calls, null, 2)
				)
				return { supported: true, tool_calls: result.tool_calls }
			} else {
				console.log('❌ 模型未调用工具，可能不支持或未识别意图。')
				return { supported: false, response: result.content }
			}
		} catch (error) {
			console.error('❌ 测试过程中发生错误:', error)
			return { supported: false, error }
		}
	}
}
