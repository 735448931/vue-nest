import request from '@/utils/request'

// 获取聊天用户列表 - 后端除了自己
export const chatUserListApi = (data: { userId: string }) => {
	return request.get('/user/allExceptSelf', data)
}

// 获取聊天用户详情
export const chatUserDetailApi = (userId: string) => {
    return request.get(`/chat/user-detail`)
}

