<template>
    <el-drawer v-model="chatStore.chatDrawerShow" :with-header="false" modal size="500px">
        <div class="chat-wrapper">
            <!-- 聊天列表页面 -->
            <ChatList ref="chatListComponentRef" @handle-click="openChatDetail" />

            <!-- 聊天详情页面 -->
            <ChatDetail ref="chatDetailComponentRef" :current-user="currentUser" @back="backToChatList" />
        </div>
    </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useChatStore from '@/store/chat'
import { gsap } from 'gsap'
import ChatList from './ChatList/index.vue'
import ChatDetail from './ChatDetail/index.vue'

// ===================== 数据 =====================
const chatStore = useChatStore()

// 当前选中的用户
const currentUser = ref<any>(null)

// 组件引用
const chatListComponentRef = ref<InstanceType<typeof ChatList>>()
const chatDetailComponentRef = ref<InstanceType<typeof ChatDetail>>()


// ===================== 方法 =====================
// 打开聊天详情
const openChatDetail = (user: any) => {
    currentUser.value = user
    
    // 使用 GSAP 实现页面切换动画
    const chatListRef = chatListComponentRef.value?.chatListRef
    const chatDetailRef = chatDetailComponentRef.value?.chatDetailRef
    
    if (!chatListRef || !chatDetailRef) return
    
    const timeline = gsap.timeline()
    
    // 列表页向左滑出
    timeline.to(chatListRef, {
        x: '-100%',
        duration: 0.3,
        ease: 'power2.inOut'
    })

    // 详情页从右侧滑入
    timeline.fromTo(chatDetailRef, 
        {
            x: '100%',
            display: 'flex'
        },
        {
            x: '0%',
            duration: 0.3,
            ease: 'power2.inOut'
        },
        '<' // 与上一个动画同时开始
    )
}
// 返回聊天列表
const backToChatList = () => {
    const chatListRef = chatListComponentRef.value?.chatListRef
    const chatDetailRef = chatDetailComponentRef.value?.chatDetailRef
    
    if (!chatListRef || !chatDetailRef) return
    
    const timeline = gsap.timeline()
    
    // 详情页向右滑出
    timeline.to(chatDetailRef, {
        x: '100%',
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
            if (chatDetailRef) {
                chatDetailRef.style.display = 'none'
            }
        }
    })
    
    // 列表页从左侧滑入
    timeline.fromTo(chatListRef,
        {
            x: '-100%'
        },
        {
            x: '0%',
            duration: 0.3,
            ease: 'power2.inOut'
        },
        '<' // 与上一个动画同时开始
    )
    
    currentUser.value = null
}


// ===================== 生命周期 =====================
onMounted(() => {
    
})
</script>

<style scoped lang="scss">
.chat-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>