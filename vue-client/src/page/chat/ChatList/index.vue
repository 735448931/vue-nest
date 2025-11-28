<template>
    <div ref="chatListRef" class="chat-page ">
        <div class="chat-header">
            <div>消息</div>
        </div>

        <div class="chat-list">
            <div v-for="user in userList" :key="user.id" class="chat-item" @click="handleUserClick(user)">
                <div class="avatar">
                    <img :src="user.avatar" :alt="user.name" />
                </div>
                <div class="info">
                    <div class="name-time">
                        <span class="name">{{ user.name }}</span>
                        <span class="time">{{ user.lastMessageTime }}</span>
                    </div>
                    <div class="last-message">{{ user.lastMessage }}</div>
                </div>
                <!-- 未读消息数量徽章 -->
                <div v-if="user.unreadCount > 0" class="unread-badge">
                    {{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import type { ChatUser } from '@/api/interface/chat';
import { onMounted, ref } from 'vue'

interface Emits {
    handleClick: [user: any]
}



// ===================== 数据 =====================
const userList = ref<ChatUser[]>([])
const emits = defineEmits<Emits>()
// 暴露 ref 给父组件
const chatListRef = ref<HTMLElement>()
// ===================== 方法 =====================

// 获取用户列表
const getUserList = async () => {
    userList.value = [
        {
            id: 1,
            name: '张三',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            lastMessage: '你好！',
            lastMessageTime: '10-27 18:30',
            unreadCount: 2
        },
        {
            id: 2,
            name: '李四',
            avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
            lastMessage: '我们明天见！',
            lastMessageTime: '10-27 17:45',
            unreadCount: 0
        }
    ]
}

// 处理用户点击-跳转详情
const handleUserClick = (user: ChatUser) => {
    emits('handleClick', user)
}




// ===================== 生命周期 =====================
onMounted(() => {
    getUserList()
})

defineExpose({
    chatListRef
})




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
    /* 默认显示在正常位置 */
    transform: translateX(0);
}

.chat-header {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    border-bottom: 1px solid #eee;
    font-size: 18px;
    font-weight: 500;
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
        top: 36px; // 改为固定距离顶部，而不是居中
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
