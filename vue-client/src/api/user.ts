import request from '@/utils/request'
import type { LoginParams, RegisterParams } from './interface/user'

export const loginApi = (loginParams: LoginParams) => {
	return request.post('/user/login', loginParams)
}

export const registerApi = (registerParams: RegisterParams) => {
	return request.post('/user/register', registerParams)
}

// 获取邮箱验证码
export const getEmailCodeApi = (query: { email: string }) => {
	return request.get<string>('/email/code', query)
}
