<template>
	<div class="message-list">
		<template v-for="(item, index) in messages" :key="item.id">
			<!-- 时间戳 - 根据条件显示 -->
			<TimeStamp v-if="shouldShowTime(item, index)" :time="item.time" />

			<!-- 消息组件 -->
			<TextMessage :message="item" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextMessage from './components/TextMessage.vue'
import TimeStamp from './components/TimeStamp.vue'

// 消息数据类型
interface Message {
	id: number | string
	content: string
	isSelf: boolean
	avatar?: string
	name?: string
	time: string | number | Date
}

// 模拟消息数据
const messages = ref<Message[]>([
	{
		id: 1,
		content: '你好！',
		isSelf: false,
		avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
		name: '张三',
		time: new Date('2024-01-20 09:00:00')
	},
	{
		id: 2,
		content: '你好，很高兴认识你！',
		isSelf: true,
		avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
		name: '我',
		time: new Date('2024-01-20 09:01:00')
	},
	{
		id: 3,
		content: '最近在忙什么呢？',
		isSelf: false,
		avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
		name: '张三',
		time: new Date('2024-01-20 09:02:00')
	},
	{
		id: 4,
		content: '在学习 Vue 和 Nest.js',
		isSelf: true,
		avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
		name: '我',
		time: new Date('2024-01-20 09:10:00') // 间隔超过5分钟，会显示时间
	},
	{
		id: 5,
		content: '不错啊，加油！',
		isSelf: false,
		avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
		name: '张三',
		time: new Date('2024-01-20 09:11:00')
	},
	{
		id: 6,
		content: '谢谢！一起进步',
		isSelf: true,
		avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
		name: '我',
		time: new Date() // 当前时间
	}
])

/**
 * 判断是否应该显示时间戳
 * 参考微信的规则：
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
