import { BadRequestException, Controller, Get, MessageEvent, Query, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
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
			content: response.content
		}
	}

	@Sse('stream')
	getStream(
		@Query('question') question: string,
		@Query('provider') provider?: string
	): Observable<MessageEvent> {
		if (!question) {
			throw new BadRequestException('question is required')
		}

		const aiProvider = (provider as AIProvider) || AIProvider.DEEPSEEK

		return new Observable<MessageEvent>((observer) => {
			let stream: any = null

			const processStream = async () => {
				try {
					stream = await this.langchainService.streamChatResponse(
						question,
						aiProvider
					)

					for await (const chunk of stream) {
						if (observer.closed) break

						const content = this.extractChunkText(chunk)
						if (content) {
							observer.next({
								data: { provider: aiProvider, content }
							})
						}
					}

					if (!observer.closed) {
						observer.next({
							data: { provider: aiProvider, done: true }
						})
						observer.complete()
					}
				} catch (error: any) {
					if (!observer.closed) {
						observer.next({
							type: 'error',
							data: {
								provider: aiProvider,
								message: error?.message || 'Stream failed'
							}
						})
						observer.complete()
					}
				}
			}

			processStream()

			return () => {
				if (stream?.cancel && typeof stream.cancel === 'function') {
					stream.cancel('client disconnected').catch(() => {})
				}
			}
		})
	}

	private extractChunkText(chunk: unknown): string {
		if (!chunk) {
			return ''
		}
		const content =
			(chunk as any)?.content ?? (chunk as any)?.message?.content
		if (typeof content === 'string') {
			return content
		}
		if (Array.isArray(content)) {
			return content
				.map((part) => {
					if (typeof part === 'string') {
						return part
					}
					return part?.text ?? ''
				})
				.join('')
		}
		return ''
	}

	@Get('invoke-with-tools')
	async getInvokeWithTools(
		@Query('question') question: string,
		@Query('provider') provider?: string
	) {
		const aiProvider = (provider as AIProvider) || AIProvider.DEEPSEEK

		const response = await this.langchainService.invokeWithTools(aiProvider)


		return {
			provider: aiProvider,
			content: response
		}
	}
}
