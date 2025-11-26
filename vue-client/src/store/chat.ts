import { defineStore } from 'pinia'
import { ref } from 'vue'

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

	// 返回需要暴露的状态和方法
	return {
		chatDrawerShow,
		openDrawer,
		closeDrawer,
		toggleDrawer
	}
})

export default useChatStore
