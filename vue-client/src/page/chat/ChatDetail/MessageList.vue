<template>
	<div class="message-list" ref="scrollRef">
		<template v-for="(item, index) in chatStore.messageData.messageList" :key="index">
			<!-- 时间戳 - 根据条件显示 -->
			<!-- <TimeStamp v-if="shouldShowTime(item, index)" :time="item.time" /> -->

			<!-- 消息组件 -->
			<TextMessage :message="item"  v-if="item.type === TencentCloudChat.TYPES.MSG_TEXT" />

			<ImageMessage :message="item" v-if="item.type === TencentCloudChat.TYPES.MSG_IMAGE" ></ImageMessage>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'
import TextMessage from './components/TextMessage.vue'
import TimeStamp from './components/TimeStamp.vue'
import useChatStore from '@/store/chat'
import TencentCloudChat from '@tencentcloud/chat'
import ImageMessage from './components/ImageMessage.vue'
import  { useInfiniteScroll, useScroll } from '@vueuse/core'

// 消息数据类型
interface Message {
	id: number | string
	content: string
	isSelf: boolean
	avatar?: string
	name?: string
	time: string | number | Date
}

const chatStore = useChatStore()

// 模拟消息数据
const messages = ref<any>([])

const smooth = ref(true)
const refreshing = ref(false)
const scrollRef = useTemplateRef('scrollRef')
const behavior = computed(() => {
	return smooth.value ? 'smooth' : 'instant'
})

const { y } = useScroll(scrollRef, { behavior })

useInfiniteScroll(scrollRef, async () => {
	const oldScrollHeight = scrollRef.value?.scrollHeight || 0
	if (chatStore.messageData.nextReqMessageID && !refreshing.value) {
		smooth.value = false
		refreshing.value = true
		await chatStore.getMessageList()
		await nextTick()
		// todo:暂时不动
		y.value = (scrollRef.value?.scrollHeight || 0) - oldScrollHeight
		refreshing.value = false
	}
}, {
	distance: 120,
	direction: 'top',
})



const scrollToBottom = async () => {
	await nextTick()
	y.value = scrollRef.value?.scrollHeight || 0
	smooth.value = true
}

onMounted(() => {
	scrollToBottom()
})


/**
 * 判断是否应该显示时间戳
 * 1. 第一条消息必显示
 * 2. 与上一条消息间隔超过5分钟才显示
 */
const shouldShowTime = (currentMsg: Message, index: number): boolean => {
	// 第一条消息必显示时间
	if (index === 0) return true

	// 获取上一条消息
	const prevMsg = messages.value[index - 1]
	if (!prevMsg) return true

	// 计算时间差（毫秒）
	const currentTime = new Date(currentMsg.time).getTime()
	const prevTime = new Date(prevMsg.time).getTime()
	const timeDiff = currentTime - prevTime

	// 超过5分钟（300000毫秒）显示时间
	const FIVE_MINUTES = 5 * 60 * 1000
	return timeDiff > FIVE_MINUTES
}

// 暴露给父组件的方法
defineExpose({
	messages
})
</script>

<style scoped lang="scss">
.message-list {
	// 消息列表容器
	display: flex;
	flex-direction: column;
}
</style>
