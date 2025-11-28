import request from '@/utils/request'

// 获取聊天用户列表
export const chatUserListApi = () => {
	return request.get('/chat/userList')
}

// 获取聊天用户详情
export const chatUserDetailApi = (userId: string) => {
    return request.get(`/chat/user-detail`)
}
