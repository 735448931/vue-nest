export interface SSEConfig {
	url: string
	query?: Record<string, string | number | boolean>
	withCredentials?: boolean
}

class GlobalSSEManager {
	private eventSource: EventSource | null = null
	constructor() {}

	connect(config: SSEConfig): EventSource {
		const { url, query = {}, withCredentials } = config
		let formatUrl = url

		if (query && Object.keys(query).length !== 0) {
			const searchParams = new URLSearchParams()
			Object.entries(query).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					searchParams.append(key, String(value))
				}
			})
			formatUrl = `${url}?${searchParams.toString()}`
		}

		if (this.eventSource) {
			console.log('复用现有 SSE 连接')
			return this.eventSource
		}

		this.eventSource = new EventSource(formatUrl, {
			withCredentials
		})

		this.eventSource.onopen = () => {
			console.log(`SSE 连接已打开: ${formatUrl}`)
		}

		this.eventSource.onerror = (error) => {
			console.error(`SSE 连接错误: ${formatUrl}`, error)
		}

		return this.eventSource
	}

	disconnect() {
		if (!this.eventSource) {
			return
		}
		console.log('断开SSE连接')
		this.eventSource.close()
		this.eventSource = null
	}

	on(eventName: string, listener: EventListener) {
		if (!this.eventSource) {
			console.warn('SSE 未连接，请先调用 connect 方法建立连接')
			return () => {}
		}

		const wrappedListener = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data)
				listener(data)
			} catch (error) {
				listener(event.data)
			}
		}

		this.eventSource.addEventListener(eventName, wrappedListener)

		return () => this.eventSource!.removeEventListener(eventName, wrappedListener)
	}

}

export const sseManager = new GlobalSSEManager()
