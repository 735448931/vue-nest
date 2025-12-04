import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import TencentCloudChat, { Message } from '@tencentcloud/chat'
import TIMUploadPlugin from 'tim-upload-plugin'
import useUserStore from './user'
// @ts-ignore
import LibGenerateTestUserSig from '@/utils/lib-generate-test-usersig-es.min.js'

// 腾讯云即时通信 IM SDK 配置
const options = {
	SDKAppID: 1600115490
}

const secretKey = '1e09080518204bf956eeb692c56027402b82000993c792083a1c9d64cd51f384'
const chat = TencentCloudChat.create(options)
chat.setLogLevel(3)
chat.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin })

// SDK 进入 ready 状态时触发，接入侧监听此事件，然后可调用 SDK 发送消息等 API，使用 SDK 的各项功能。
chat.on(TencentCloudChat.EVENT.SDK_READY, onSdkReady)
// SDK 收到推送的单聊、群聊、群提示、群系统通知的新消息，接入侧可通过遍历 event.data 获取消息列表数据并渲染到页面。
chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived)

// 会话列表更新
chat.on(
	TencentCloudChat.EVENT.CONVERSATION_LIST_UPDATED,
	onConversationListUpdated
)

// 未读消息总数变化 
chat.on(TencentCloudChat.EVENT.TOTAL_UNREAD_MESSAGE_COUNT_UPDATED, onTotalUnreadMessageCountUpdated)


async function onTotalUnreadMessageCountUpdated(event: { data: any }) {
	const chatStore = useChatStore()
	chatStore.unreadMessageCount = event.data
}


async function onSdkReady(event: any) {
	console.log('sdk准备就绪')
}

async function onMessageReceived(event: any) {
	console.log('收到消息', event.data)

	const messageList = event.data

	const chatStore = useChatStore()

	// 仅当前聊天对象为发送消息对象时，才追加消息 否则不需要 因为每次点开会重新获取
	if (!chatStore.conversation.chatID) return

	messageList.forEach((message: any) => {
		// 消息可能会被合并发送 对于不是当前聊天对象的消息 直接跳过
		if (message.from != chatStore.conversation.chatID) {
			return
		}

		if (message.type === TencentCloudChat.TYPES.MSG_TEXT) {
			chatStore.messageData.messageList.push(message)
		} else if (message.type === TencentCloudChat.TYPES.MSG_IMAGE) {
			chatStore.messageData.messageList.push(message)
		}
	})
}

async function onConversationListUpdated(event: { data: any }) {
	const chatStore = useChatStore()

	chatStore.conversation.conversationList = event.data

}

const useChatStore = defineStore('chat', () => {
	const chatDrawerShow = ref(false)

	// actions - 直接定义函数
	const openDrawer = () => {
		chatDrawerShow.value = true
	}

	const closeDrawer = () => {
		chatDrawerShow.value = false
	}

	const toggleDrawer = () => {
		chatDrawerShow.value = !chatDrawerShow.value
	}

	// ===================== IM 相关 =====================

	// IM 登录状态
	const imIsLogin = ref(false)

	// 总计的未读消息数 包括单聊和群聊
	const unreadMessageCount = ref(0)

	const messageData = reactive({
		messageList: [] as any,
		nextReqMessageID: null,
		isCompleted: false
	})

	// 会话相关状态
	const conversation = reactive({
		currentConversation: {},
		// 会话列表
		conversationList: [],
		// 模糊搜索用户名称
		queryString: '',
		conversationMark: 0,
		conversationID: '',
		// 聊天ID  对方
		chatID: undefined as string | undefined,
		// 用户ID  自己
		userID: undefined as number | undefined
	})

	// 登录
	async function login() {
		const userStore = useUserStore()
		const userId = userStore.userId.toString()

		// 生成 userSig
		const generator = new LibGenerateTestUserSig(
			options.SDKAppID,
			secretKey,
			604800
		)
		const userSig = generator.genTestUserSig(userId)

		const result = await chat.login({ userID: userId, userSig: userSig })
		imIsLogin.value = true
		return result
	}
	// 登出
	async function logout() {
		resetData()
		imIsLogin.value = false
		await chat.logout()
	}

	// 重置数据
	function resetData() {
		conversation.conversationID = ''
		conversation.chatID = undefined
		conversation.userID = undefined
		conversation.currentConversation = {}
		conversation.conversationList = []
		conversation.queryString = ''
		conversation.conversationMark = 0
	}

	// 发送文本消息
	async function sendTextMessage(chatID: string, text: string) {
		const message = chat.createTextMessage({
			to: chatID,
			conversationType: TencentCloudChat.TYPES.CONV_C2C,
			payload: { text }
		})
		await sendMessage(message)
	}

	// 发送图片消息
	async function sendImageMessage(chatID: string, file: File) {
		const message = chat.createImageMessage({
			to: chatID,
			conversationType: TencentCloudChat.TYPES.CONV_C2C,
			payload: { file }
		})
		await sendMessage(message)
	}

	// 发送消息的通用方法
	async function sendMessage(message: any) {
		await chat.sendMessage(message, {
			offlinePushInfo: {
				extension: `userId=${message.from}`
			}
		})

		// 追加消息到消息列表
		messageData.messageList.push(message)
	}

	// 切换会话
	async function changeConversation(chatID: string) {
		const userStore = useUserStore()
		conversation.conversationID = `C2C${chatID}`
		conversation.chatID = chatID
		conversation.userID = Number(userStore.userId)
		messageData.messageList = []
		messageData.nextReqMessageID = null
		// 获取消息列表
		await getMessageList()
	}

	// 获取消息列表
	async function getMessageList() {
		const { data } = await chat.getMessageList({
			conversationID: conversation.conversationID,
			nextReqMessageID: messageData.nextReqMessageID || undefined
		})

		console.log('🍿🍿🍿🍿🍿data:聊天消息列表数据', data);
		

		const { messageList, nextReqMessageID, isCompleted } = data

		messageData.messageList = [
			...messageList,
			...messageData.messageList,
		] as any
		messageData.nextReqMessageID = nextReqMessageID
		messageData.isCompleted = isCompleted


		// 上报已读
		const res = await chat.setMessageRead({
			conversationID: conversation.conversationID
		})

		console.log('🍃 上报已读的结果', res);
		
		
	}

	// 返回需要暴露的状态和方法
	return {
		chatDrawerShow,
		messageData,
		conversation,
		unreadMessageCount,
		openDrawer,
		closeDrawer,
		toggleDrawer,
		login,
		sendTextMessage,
		sendImageMessage,
		changeConversation
	}
})

export default useChatStore
