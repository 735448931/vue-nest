import request from "@/utils/request"


// 获取可用的语言模型提供商列表
export const getAllProvidersApi = () => {
	return request.get('/langchain/providers')
}



export const ask1Api = (data: { question: string }) => {
	return request.get('/langchain/ask1', data)
}

