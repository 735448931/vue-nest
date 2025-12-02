import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { z } from 'zod'
import { tool } from 'langchain'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { Observable } from 'rxjs'

import { TextLoader } from '@langchain/classic/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter'

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

	// ===================== 初始化文档数据 =====================
	async initDocument1() {
		const loader = new TextLoader('./src/modules/langchain/document_1.txt')
		const docs = await loader.load()

		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 400,
			chunkOverlap: 0
		})
		const chunks = await splitter.splitDocuments(docs)

		const embeddings = new OpenAIEmbeddings({
			model: 'text-embedding-v4',
			apiKey: this.configService.get('BAILIAN_API_KEY'),
			configuration: {
				baseURL: this.configService.get('BAILIAN_BASE_URL')
			},
			batchSize: 10 // 设置批量大小为10，符合阿里云API限制
		})

		const vectorStore = new Chroma(embeddings, {
			collectionName: 'document_1'
		})
		const res = await vectorStore.addDocuments(chunks)
		return res
	}

	// ===================== 根据文档中的内容返回答案 =====================
	async getDocumentAnswer(question: string) {
		const model = new ChatOpenAI({
			model: 'qwen3-max',
			apiKey: this.configService.get('BAILIAN_API_KEY'),
			temperature: 0,
			configuration: {
				baseURL: this.configService.get('BAILIAN_BASE_URL')
			}
		})

		const embeddings = new OpenAIEmbeddings({
			model: 'text-embedding-v4',
			apiKey: this.configService.get('BAILIAN_API_KEY'),
			configuration: {
				baseURL: this.configService.get('BAILIAN_BASE_URL')
			}
		})

		const vectorStore = new Chroma(embeddings, {
			collectionName: 'document_1'
		})

		// 生成问题变体
		const prompt = `你是一个 AI 语言模型助手。你的任务是为给定的用户问题生成 3 个不同版本的变体，以便从向量数据库中检索相关文档。
						通过从多个角度生成用户问题，你的目标是帮助用户克服基于距离的相似性搜索的一些局限性。
						请只返回生成的问题，每行一个，不要包含其他文字。
						原始问题: ${question}`

		const variationResponse = await model.invoke(prompt)

		const { content } = variationResponse

		const variations = content
			.toString()
			.split('\n')
			.map((v) => v.trim())
			.filter((v) => v.length > 0)

		// 将原始问题和变体问题一起进行检索
		const query = [question, ...variations]

		// 并行执行所有搜索
		const searchPromises = query.map((q) =>
			vectorStore.similaritySearch(q, 2)
		)
		const results = await Promise.all(searchPromises)

		// 结果去重
		const uniqueDocsMap = new Map()
		results.flat().forEach((doc) => {
			if (!uniqueDocsMap.has(doc.pageContent)) {
				uniqueDocsMap.set(doc.pageContent, doc)
			}
		})

		const uniqueDocs = Array.from(uniqueDocsMap.values())

		const context = uniqueDocs.map((doc) => doc.pageContent).join('\n\n')

		const promptText = `根据以下提供的上下文内容，回答用户的问题。如果上下文中没有相关信息，请回答“无法从提供的内容中找到答案。”。
							上下文:
							${context}

							问题：
							${question}

							答案:
					`

		const response = await model.invoke(promptText)

		const result = response.content.toString().trim()

		return result
	}

	// ===================== 使用 Observable 模式流式返回文档答案 =====================
	getDocumentAnswerObservable(question: string): Observable<any> {
		return new Observable((subscriber) => {
			this.processDocumentAnswerStream(question, subscriber)
		})
	}

	/**
	 * 处理文档答案流的核心逻辑
	 */
	private async processDocumentAnswerStream(question: string, subscriber: any) {
		try {
			// 1. 输出开始处理的状态
			subscriber.next({
				type: 'status',
				message: '🔄 开始处理问题...',
				step: 'start'
			})

			const model = new ChatOpenAI({
				model: 'qwen3-max',
				apiKey: this.configService.get('BAILIAN_API_KEY'),
				temperature: 0,
				configuration: {
					baseURL: this.configService.get('BAILIAN_BASE_URL')
				}
			})

			const embeddings = new OpenAIEmbeddings({
				model: 'text-embedding-v4',
				apiKey: this.configService.get('BAILIAN_API_KEY'),
				configuration: {
					baseURL: this.configService.get('BAILIAN_BASE_URL')
				}
			})

			const vectorStore = new Chroma(embeddings, {
				collectionName: 'document_1'
			})

			// 2. 生成问题变体
			subscriber.next({
				type: 'status',
				message: '🤔 正在生成问题变体...',
				step: 'generate_variations'
			})

			const prompt = `你是一个 AI 语言模型助手。你的任务是为给定的用户问题生成 3 个不同版本的变体,以便从向量数据库中检索相关文档。
							通过从多个角度生成用户问题,你的目标是帮助用户克服基于距离的相似性搜索的一些局限性。
							请只返回生成的问题,每行一个,不要包含其他文字。
							原始问题: ${question}`

			const variationResponse = await model.invoke(prompt)
			const { content } = variationResponse

			const variations = content
				.toString()
				.split('\n')
				.map((v) => v.trim())
				.filter((v) => v.length > 0)

			subscriber.next({
				type: 'status',
				message: `✅ 已生成 ${variations.length} 个问题变体`,
				step: 'variations_generated',
				data: { variations }
			})

			// 3. 检索相关文档
			subscriber.next({
				type: 'status',
				message: '🔍 正在检索相关文档...',
				step: 'search_documents'
			})

			const query = [question, ...variations]
			const searchPromises = query.map((q) =>
				vectorStore.similaritySearch(q, 2)
			)
			const results = await Promise.all(searchPromises)

			// 结果去重
			const uniqueDocsMap = new Map()
			results.flat().forEach((doc) => {
				if (!uniqueDocsMap.has(doc.pageContent)) {
					uniqueDocsMap.set(doc.pageContent, doc)
				}
			})

			const uniqueDocs = Array.from(uniqueDocsMap.values())

			subscriber.next({
				type: 'status',
				message: `📄 找到 ${uniqueDocs.length} 个相关文档片段`,
				step: 'documents_found',
				data: { documentCount: uniqueDocs.length }
			})

			// 4. 构建上下文并生成答案
			subscriber.next({
				type: 'status',
				message: '💭 正在生成答案...',
				step: 'generate_answer'
			})

			const context = uniqueDocs.map((doc) => doc.pageContent).join('\n\n')

			const promptText = `根据以下提供的上下文内容,回答用户的问题。如果上下文中没有相关信息,请回答"无法从提供的内容中找到答案。"。
								上下文:
								${context}

								问题：
								${question}

								答案:
						`

		// 5. 流式输出最终答案
		subscriber.next({
			type: 'answer_start',
			message: '📝 开始输出答案',
			step: 'answer_streaming'
		})

		const stream = await model.stream(promptText)

		for await (const chunk of stream) {
			// 直接发送原始的 chunk.content,保持 LangChain 的原始流式输出粒度
			subscriber.next({
				type: 'answer',
				content: chunk.content
			})
			}
			
			// 6. 完成
			subscriber.next({
				type: 'status',
				message: '✅ 答案生成完成',
				step: 'completed'
			})

			subscriber.complete()
		} catch (error) {
			subscriber.error(error)
		}
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
