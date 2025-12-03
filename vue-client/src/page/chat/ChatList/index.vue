<template>
    <div ref="chatListRef" class="chat-page ">
        <div class="chat-header">
            <div>消息</div>
        </div>

        <div class="chat-list">
            <div v-for="user in userList" :key="user.id" class="chat-item" @click="handleClick(user.id)">
                <div class="avatar">
                    <img :src="user.avatar" />
                </div>
                <div class="info">
                    <div class="name-time">
                        <span class="name">{{ user.username }}</span>
                        <span class="time">{{ user.lastMessageTime || '10-22' }}</span>
                    </div>
                    <div class="last-message">{{ user.lastMessage || 'Ceshi' }}</div>
                </div>
                <!-- <div v-if="user.unreadCount > 0" class="unread-badge">
                        {{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
                    </div> -->
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { chatUserListApi } from '@/api/chat';
import type { ChatUser } from '@/api/interface/chat';
import useUserStore from '@/store/user';
import { onMounted, ref } from 'vue'

interface Emits {
    handleClick: [chatId: string]
}



// ===================== 数据 =====================
const emits = defineEmits<Emits>()
const userList = ref<any[]>([])
const chatListRef = ref<HTMLElement>()
const userStore = useUserStore()
// ===================== 方法 =====================

// 获取用户列表
const getUserList = async () => {
    const { data } = await chatUserListApi({ userId: userStore.userId })
    userList.value = data
}

// 处理用户点击-跳转详情
const handleClick = (chatId: string) => {
    emits('handleClick', chatId)
}




// ===================== 生命周期 =====================
onMounted(() => {
    console.log('组件挂载了++++++++++++');
     getUserList()
})

defineExpose({
    chatListRef,
    getUserList
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

// 骨架屏样式
.skeleton-item {
    .skeleton-content {
        display: flex;
        align-items: center;
        width: 100%;
    }

    .skeleton-avatar {
        width: 48px !important;
        height: 48px !important;
        border-radius: 4px !important;
        flex-shrink: 0;
        margin-right: 12px;
    }

    .skeleton-info {
        flex: 1;
        min-width: 0;
    }

    .skeleton-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .skeleton-name {
        width: 80px !important;
        height: 18px !important;
    }

    .skeleton-time {
        width: 50px !important;
        height: 14px !important;
    }

    .skeleton-message {
        width: 60% !important;
        height: 14px !important;
    }
}
</style>
