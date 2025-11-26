<template>
    <div ref="chatDetailRef" class="chat-page chat-detail-page">
        <div class="chat-header">
            <span class="back-btn" @click="handleBack">
                ←
            </span>
            <h3>{{ currentUser?.name }}</h3>
        </div>
        <div class="chat-content" ref="chatContentRef">
            <div 
                v-for="msg in messages" 
                :key="msg.id"
                class="message-item"
                :class="{ 'is-self': msg.isSelf }"
            >
                <div class="avatar">
                    <img :src="msg.avatar" :alt="msg.name" />
                </div>
                <div class="message-content">
                    <div class="message-bubble">{{ msg.content }}</div>
                </div>
            </div>
        </div>
        <div class="chat-footer">
            <el-input 
                v-model="inputMessage"
                placeholder="请输入消息..."
                @keyup.enter="handleSendMessage"
            >
                <template #append>
                    <el-button @click="handleSendMessage">发送</el-button>
                </template>
            </el-input>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义 props
defineProps<{
    currentUser: any
    messages: any[]
}>()

// 定义 emits
const emit = defineEmits<{
    back: []
    sendMessage: [message: string]
}>()

// 暴露 ref 给父组件
const chatDetailRef = ref<HTMLElement>()
const chatContentRef = ref<HTMLElement>()
defineExpose({
    chatDetailRef,
    chatContentRef
})

// 输入框内容
const inputMessage = ref('')

// 处理返回
const handleBack = () => {
    emit('back')
}

// 处理发送消息
const handleSendMessage = () => {
    if (!inputMessage.value.trim()) return
    
    emit('sendMessage', inputMessage.value)
    inputMessage.value = ''
}
</script>

<style scoped lang="scss">
.chat-page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
}

.chat-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
    background: white;
    
    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
    }
    
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

.chat-footer {
    padding: 16px;
    border-top: 1px solid #eee;
    background: white;
}
</style>
