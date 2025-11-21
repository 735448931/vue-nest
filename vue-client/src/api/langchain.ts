import request from "@/utils/request"
import type { ModelInfo } from "./interface/langchain"


// 获取可用的语言模型提供商列表
export const getAllProvidersApi = () => {
	return request.get<ModelInfo>('/langchain/providers')
}


// invoke 接口
export const invokeApi = (data: { question: string,provider?:string }) => {
	return request.get('/langchain/invoke', data)
}

