// composables/useSSE.ts
import { ref, onUnmounted } from 'vue'

export function useSSE() {
	const answer = ref<string>('')
	const isLoading = ref<boolean>(false)
	const error = ref<string | null>(null)

	let eventSource: EventSource | null = null

    const fetchDocumentAnswer = (question: string) => {
        
		answer.value = ''
		isLoading.value = true
		error.value = null

		const baseURL = import.meta.env.VITE_BASE_API

		const params = new URLSearchParams({
			question: question
		})


		const composeUrl = `${baseURL}/langchain/documentAnswerObservable?${params.toString()}`

		eventSource = new EventSource(composeUrl)

		eventSource.onmessage = (event) => {
			const message = JSON.parse(event.data)

			try {
				const chunk = JSON.parse(message.data)
				
				if (chunk.message) {
				answer.value += chunk.message
					
				} 
				
				if (chunk.content) {
					answer.value += chunk.content
				}

				if(chunk.step && chunk.step === 'complete') {
					isLoading.value = false
					closeConnection()
				}


				
				
			} catch (err) {
				console.error('解析 SSE 数据错误:', err)
				answer.value += event.data.message
			}
		}

		eventSource.onerror = (err) => {
			console.error('SSE 连接错误:', err)
			error.value = 'SSE 连接失败'
			isLoading.value = false
			closeConnection()
		}

		eventSource.onopen = () => {
			console.log('SSE 连接已建立')
		}
	}

	// 等待流式答案完成的异步方法
	const fetchDocumentAnswerAsync = (question: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			answer.value = ''
			isLoading.value = true
			error.value = null
			let isCompleted = false // 标记是否正常完成

			const baseURL = import.meta.env.VITE_BASE_API

			const params = new URLSearchParams({
				question: question
			})

			const composeUrl = `${baseURL}/langchain/documentAnswerObservable?${params.toString()}`

			eventSource = new EventSource(composeUrl)

			eventSource.onmessage = (event) => {
				const message = JSON.parse(event.data)

				

				try {
					const chunk = JSON.parse(message.data)
					
					if (chunk.message) {
						answer.value += chunk.message
					} 
					
					if (chunk.content) {
						answer.value += chunk.content
					}

					if (chunk.step && chunk.step === 'completed') {
						
						isCompleted = true // 标记为正常完成
						isLoading.value = false
						closeConnection() // 先关闭连接
						resolve(answer.value) // 完成时返回完整答案
					}
				} catch (err) {
					console.error('解析 SSE 数据错误:', err)
					answer.value += event.data.message
				}
			}

			eventSource.onerror = (err) => {
				// 只有在非正常完成的情况下才处理错误
				if (!isCompleted) {
					console.error('SSE 连接错误:', err)
					error.value = 'SSE 连接失败'
					isLoading.value = false
					closeConnection()
					reject(new Error('SSE 连接失败'))
				}
			}

			eventSource.onopen = () => {
				console.log('SSE 连接已建立')
			}
		})
	}

	const closeConnection = () => {
		if (eventSource) {
			eventSource.close()
			eventSource = null
			isLoading.value = false
		}
	}

	onUnmounted(() => {
		closeConnection()
	})

	return {
		answer,
		isLoading,
		error,
		fetchDocumentAnswer,
		fetchDocumentAnswerAsync,
		closeConnection
	}
}
