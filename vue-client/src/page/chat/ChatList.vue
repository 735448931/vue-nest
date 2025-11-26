<template>
    <div ref="chatListRef" class="chat-page chat-list-page">
        <div class="chat-header">
            <h3>消息</h3>
        </div>
        <div class="chat-list">
            <div v-for="user in userList" :key="user.id" class="chat-item" @click="handleUserClick(user)">
                <div class="avatar">
                    <img :src="user.avatar" :alt="user.name" />
                </div>
                <div class="info">
                    <div class="name-time">
                        <span class="name">{{ user.name }}</span>
                        <span class="time">{{ user.lastTime }}</span>
                    </div>
                    <div class="last-message">{{ user.lastMessage }}</div>
                </div>
                <div v-if="user.unread" class="unread-badge">{{ user.unread }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义 props
defineProps<{
    userList: any[]
}>()

// 定义 emits
const emit = defineEmits<{
    userClick: [user: any]
}>()

// 暴露 ref 给父组件
const chatListRef = ref<HTMLElement>()
defineExpose({
    chatListRef
})

// 处理用户点击
const handleUserClick = (user: any) => {
    emit('userClick', user)
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
}

.chat-list {
    flex: 1;
    overflow-y: auto;
}

.chat-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.3s;
    position: relative;

    &:hover {
        background: #f5f5f5;
    }

    .avatar {
        width: 48px;
        height: 48px;
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

    .info {
        flex: 1;
        min-width: 0;

        .name-time {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;

            .name {
                font-weight: 500;
                font-size: 16px;
            }

            .time {
                font-size: 12px;
                color: #999;
            }
        }

        .last-message {
            font-size: 14px;
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .unread-badge {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        background: #f56c6c;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 12px;
        min-width: 18px;
        text-align: center;
    }
}
</style>
