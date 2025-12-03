import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import TencentCloudChat, { Message } from '@tencentcloud/chat'
import TIMUploadPlugin from 'tim-upload-plugin'
import useUserStore from './user'

// 腾讯云即时通信 IM SDK 配置
const options = {
	SDKAppID: 1600115490
}
const chat = TencentCloudChat.create(options)
chat.setLogLevel(3)
chat.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin })


// SDK 进入 ready 状态时触发，接入侧监听此事件，然后可调用 SDK 发送消息等 API，使用 SDK 的各项功能。
chat.on(TencentCloudChat.EVENT.SDK_READY, onSdkReady)
// SDK 收到推送的单聊、群聊、群提示、群系统通知的新消息，接入侧可通过遍历 event.data 获取消息列表数据并渲染到页面。
chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived)

chat.on(TencentCloudChat.EVENT.CONVERSATION_LIST_UPDATED,onConversationListUpdated)


async function onSdkReady(event: any) {
	console.log('sdk准备就绪');
}

async function onMessageReceived(event: any) { 
	console.log('收到消息', event.data)
}

async function onConversationListUpdated(event: { data: any }) {
	
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

	const unreadMessageCount = ref(0)

	const messageData = reactive({
		messageList: [],
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
		conversationRole: undefined as string | undefined,
		conversationID: '',
		// 聊天ID  对方
		chatID: undefined as string | undefined,
		// 用户ID  自己
		userID: undefined as number | undefined
	})

	// 登录
	async function login(userId: string, userSig: string) {
		const result = await chat.login({ userID: userId, userSig: userSig })
		
		imIsLogin.value = true

		console.log('🍿🍿🍿🍿🍿登录后返回的结果:', result);

		return result
	}



	// 发送文本消息
	async function sendTextMessage(chatID: string, text: string) {
		const message = chat.createTextMessage({
			to: chatID,
			conversationType: TencentCloudChat.TYPES.CONV_C2C,
			payload: { text },
		})
		await sendMessage(message)
	}

	// 发送图片消息
	async function sendImageMessage(chatID: string, file: File) { 
		const message = chat.createImageMessage({
			to: chatID,
			conversationType: TencentCloudChat.TYPES.CONV_C2C,
			payload: { file}
		})
		await sendMessage(message)
	}


	// 发送消息的通用方法
	async function sendMessage(message: Message) {
		
		await chat.sendMessage(message, {
			offlinePushInfo: {
				extension:`userId=${message.from}`
			}
		})
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

		const { messageList, nextReqMessageID, isCompleted } = data
		
		messageData.messageList = [...messageData.messageList, ...messageList] as any
		messageData.nextReqMessageID = nextReqMessageID
		messageData.isCompleted = isCompleted
		
		console.log('🍿🍿🍿🍿🍿messageList:', messageList);
		
		

	}


	// 返回需要暴露的状态和方法
	return {
		chatDrawerShow,
		messageData,
		conversation,
		openDrawer,
		closeDrawer,
		toggleDrawer,
		login,
		sendTextMessage,
		changeConversation
	}
})

export default useChatStore
