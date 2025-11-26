<template>
    <el-drawer v-model="chatStore.chatDrawerShow" title="聊天" :with-header="false" modal size="500px">
        <div class="chat-wrapper">
            <!-- 聊天列表页面 -->
            <ChatList ref="chatListComponentRef" :user-list="userList" @user-click="openChat" />

            <!-- 聊天详情页面 -->
            <ChatDetail ref="chatDetailComponentRef" :current-user="currentUser" :messages="messages" @back="backToList"
                @send-message="sendMessage" />
        </div>
    </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useChatStore from '@/store/chat'
import { gsap } from 'gsap'
import ChatList from './ChatList.vue'
import ChatDetail from './ChatDetail.vue'
import { chatUserListApi } from '@/api/chat'


// 组件引用
const chatListComponentRef = ref<InstanceType<typeof ChatList>>()
const chatDetailComponentRef = ref<InstanceType<typeof ChatDetail>>()


const chatStore = useChatStore()


// 当前选中的用户
const currentUser = ref<any>(null)

// 消息列表
const messages = ref<any[]>([])



// 打开聊天详情
const openChat = (user: any) => {
    currentUser.value = user
    
    // 模拟加载消息
    messages.value = [
        {
            id: 1,
            content: '你好！',
            isSelf: false,
            avatar: user.avatar,
            name: user.name
        },
        {
            id: 2,
            content: '你好，有什么事吗？',
            isSelf: true,
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            name: '我'
        },
        {
            id: 3,
            content: user.lastMessage,
            isSelf: false,
            avatar: user.avatar,
            name: user.name
        }
    ]
    
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

// 返回列表
const backToList = () => {
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

// 发送消息
const sendMessage = (message: string) => {
    messages.value.push({
        id: Date.now(),
        content: message,
        isSelf: true,
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        name: '我'
    })
    
    // 滚动到底部
    setTimeout(() => {
        const chatContentRef = chatDetailComponentRef.value?.chatContentRef
        if (chatContentRef) {
            chatContentRef.scrollTop = chatContentRef.scrollHeight
        }
    }, 100)
}

// 初始化页面位置
onMounted(() => {
    const chatDetailRef = chatDetailComponentRef.value?.chatDetailRef
    if (chatDetailRef) {
        gsap.set(chatDetailRef, {
            x: '100%',
            display: 'none'
        })
    }
})

// ===================== 数据 =====================
const userList = ref<any>([])

// 获取用户列表数据
const getUserList = async () => {
    const { data } = await chatUserListApi()
    userList.value = data
}

// ===================== 生命周期 =====================
onMounted(() => {
    getUserList()
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