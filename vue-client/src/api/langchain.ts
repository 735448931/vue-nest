import request from "@/utils/request"


export const ask1Api = (data: { question: string }) => {
	return request.get('/langchain/ask1', data)
}