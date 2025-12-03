<template>
    <el-drawer v-model="chatStore.chatDrawerShow" :with-header="false" modal size="500px" destroy-on-close @close="handleClose">
        <div class="chat-wrapper">
            <!-- 聊天列表页面 -->
            <ChatList ref="chatListRef" @handleClick="openChatDetail" />

            <!-- 聊天详情页面 -->
            <template v-if="chatStore.conversation.chatID">
                <ChatDetail ref="chatDetailRef" @back="backToChatList" />
            </template>
        </div>
    </el-drawer>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import useChatStore from '@/store/chat'
import ChatList from './ChatList/index.vue'
import ChatDetail from './ChatDetail/index.vue'
import { onMounted, useTemplateRef, nextTick } from 'vue'

// ===================== 数据 =====================
const chatStore = useChatStore()
const chatListRef = useTemplateRef<InstanceType<typeof ChatList>>('chatListRef')
const chatDetailRef = useTemplateRef<InstanceType<typeof ChatDetail>>('chatDetailRef')

// ===================== 方法 =====================
const openChatDetail = async (chatId: string) => {
    chatStore.conversation.chatID = chatId
    // 使用 GSAP 实现页面切换动画 需要获取真实的 DOM 元素
    const chatListDomRef = chatListRef.value?.chatListRef
    
    if (!chatListDomRef) return
    
    // 列表页向左滑出
    gsap.to(chatListDomRef, {
        x: '-100%',
        duration: 0.3,
        ease: 'power2.inOut'
    })

    // 等待 Vue 渲染 ChatDetail 组件后执行动画
    await nextTick()
    
    const chatDetailDomRef = chatDetailRef.value?.chatDetailRef
    if (chatDetailDomRef) {
        // 详情页从右侧滑入
        gsap.fromTo(chatDetailDomRef, 
            {
                x: '100%',
                display: 'flex'
            },
            {
                x: '0%',
                duration: 0.3,
                ease: 'power2.inOut'
            }
        )
    }
}

const backToChatList = () => {
    const chatListDomRef = chatListRef.value?.chatListRef
    const chatDetailDomRef = chatDetailRef.value?.chatDetailRef
    
    if (!chatListDomRef || !chatDetailDomRef) return
    
    const timeline = gsap.timeline()
    
    // 详情页向右滑出
    timeline.to(chatDetailDomRef, {
        x: '100%',
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
            // 动画完成后先隐藏再销毁组件
            if (chatDetailDomRef) {
                chatDetailDomRef.style.display = 'none'
            }
            chatStore.conversation.chatID = undefined
            chatListRef.value?.getUserList()
        }
    })
    
    // 列表页从左侧滑入
    timeline.fromTo(chatListDomRef,
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
}

const handleClose = () => {
    // 关闭抽屉时重置聊天状态
    chatStore.conversation.chatID = undefined
}

</script>

<style scoped lang="scss">
.chat-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>