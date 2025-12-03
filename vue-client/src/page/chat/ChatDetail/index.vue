<template>
    <div ref="chatDetailRef" class="chat-page">
        <div class="chat-header">
            <span class="back-btn" @click="handleBack"> ← </span>
            <span>{{ chatStore.conversation.chatID }}</span>
            <span>...</span>
        </div>
        <div class="chat-content" >
            <MessageList></MessageList>
        </div>
        <div class="chat-input-toolbar">
            <InputToolBar></InputToolBar>
        </div>
        <div class="chat-input">
            <MessageInput></MessageInput>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MessageList from './MessageList.vue';
import InputToolBar from './InputToolBar.vue';
import MessageInput from './MessageInput.vue';
import type { ChatUser } from '@/api/interface/chat';
import useChatStore from '@/store/chat';


interface Props {}

interface Emits {
    back:[]
}

// ===================== 数据 =====================
const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const chatStore = useChatStore()
// 暴露 ref 给父组件
const chatDetailRef = ref<HTMLElement>()



// ===================== 方法 =====================

// 获取聊天记录
const getMessageList = async () => {
    if (!chatStore.conversation.chatID) return
    const result = await chatStore.changeConversation(chatStore.conversation.chatID.toString())
    console.log('🍿🍿🍿🍿🍿result:', result);
}

onMounted(() => {
    getMessageList()
})


const handleBack = () => {
    emits('back')
}





defineExpose({
    chatDetailRef,
})



</script>

<style scoped lang="scss">
.chat-page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    flex-direction: column;
    background: white;
    /* 默认隐藏，通过 GSAP 控制显示 */
    display: none;
    transform: translateX(100%);
}

.chat-header {
    display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        border-bottom: 1px solid #eee;
        font-size: 18px;
        font-weight: 500;
    
    .back-btn {
        margin-right: 12px;
        font-size: 20px;
        cursor: pointer;
        transition: color 0.3s;
        
        &:hover {
            color: #409eff;
        }
    }
}


.chat-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #f5f5f5;
}

.message-item {
    display: flex;
    margin-bottom: 16px;
    
    &.is-self {
        flex-direction: row-reverse;
        
        .message-bubble {
            background: #95ec69;
            
            &::before {
                display: none;
            }
            
            &::after {
                content: '';
                position: absolute;
                right: -8px;
                top: 10px;
                width: 0;
                height: 0;
                border-left: 8px solid #95ec69;
                border-top: 6px solid transparent;
                border-bottom: 6px solid transparent;
            }
        }
        
        .avatar {
            margin-left: 12px;
            margin-right: 0;
        }
    }
    
    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        overflow: hidden;
        margin-right: 12px;
        flex-shrink: 0;
        
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
    
    .message-content {
        max-width: 60%;
    }
    
    .message-bubble {
        position: relative;
        background: white;
        padding: 10px 12px;
        border-radius: 4px;
        word-wrap: break-word;
        
        &::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 10px;
            width: 0;
            height: 0;
            border-right: 8px solid white;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
        }
    }
}

</style>
