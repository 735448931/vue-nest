<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>聊天系统</h2>
      <div class="status">
        <span :class="{ online: connected, offline: !connected }">
          {{ connected ? '已连接' : '未连接' }}
        </span>
      </div>
    </div>

    <div class="chat-body">
      <!-- 会话列表 -->
      <div class="conversation-list">
        <h3>联系人</h3>
        <div
          v-for="conv in conversations"
          :key="conv.userId"
          class="conversation-item"
          :class="{ active: currentReceiver?.id === conv.userId }"
          @click="selectConversation(conv)"
        >
          <div class="conv-info">
            <div class="conv-name">{{ conv.userName }}</div>
            <div class="conv-last-message">{{ conv.lastMessage }}</div>
          </div>
          <div v-if="conv.unreadCount > 0" class="unread-badge">
            {{ conv.unreadCount }}
          </div>
        </div>
      </div>

      <!-- 聊天区域 -->
      <div class="chat-area">
        <div v-if="currentReceiver" class="chat-content">
          <div class="chat-info">
            <h3>{{ currentReceiver.name }}</h3>
          </div>

          <div ref="messageListRef" class="message-list">
            <div
              v-for="msg in currentMessages"
              :key="msg.id"
              class="message-item"
              :class="{ sent: msg.senderId === currentUserId, received: msg.senderId !== currentUserId }"
            >
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">
                  {{ formatTime(msg.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <div class="message-input">
            <el-input
              v-model="messageText"
              type="textarea"
              :rows="3"
              placeholder="输入消息..."
              @keydown.enter.prevent="handleSendMessage"
            />
            <el-button type="primary" @click="handleSendMessage">
              发送
            </el-button>
          </div>
        </div>
        <div v-else class="empty-chat">
          <p>选择一个联系人开始聊天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useSocket } from '../composables/useSocket';
import axios from 'axios';

// Props
interface Props {
  userId: number; // 当前登录用户ID
}

const props = defineProps<Props>();

// 使用 Socket composable
const { connected, messages, connect, goOnline, sendMessage } = useSocket();

// 状态
const currentUserId = ref(props.userId);
const currentReceiver = ref<{ id: number; name: string } | null>(null);
const messageText = ref('');
const conversations = ref<any[]>([]);
const chatHistory = ref<any[]>([]);
const messageListRef = ref<HTMLElement | null>(null);

// 当前聊天消息
const currentMessages = computed(() => {
  if (!currentReceiver.value) return [];
  
  // 合并历史消息和新消息
  const allMessages = [...chatHistory.value, ...messages.value.filter(
    msg => 
      (msg.senderId === currentUserId.value && msg.receiverId === currentReceiver.value?.id) ||
      (msg.senderId === currentReceiver.value?.id && msg.receiverId === currentUserId.value)
  )];
  
  // 按时间排序
  return allMessages.sort((a, b) => 
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );
});

// 加载会话列表
const loadConversations = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/chat/conversations/${currentUserId.value}`);
    conversations.value = response.data;
  } catch (error) {
    console.error('加载会话列表失败:', error);
  }
};

// 加载聊天历史
const loadChatHistory = async (userId1: number, userId2: number) => {
  try {
    const response = await axios.get('http://localhost:3000/api/chat/history', {
      params: { userId1, userId2, limit: 50 },
    });
    chatHistory.value = response.data.reverse(); // 反转顺序，最早的在前
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('加载聊天历史失败:', error);
  }
};

// 选择会话
const selectConversation = async (conv: any) => {
  currentReceiver.value = {
    id: conv.userId,
    name: conv.userName,
  };
  
  // 加载聊天历史
  await loadChatHistory(currentUserId.value, conv.userId);
  
  // 标记消息为已读
  if (conv.unreadCount > 0) {
    await axios.get('http://localhost:3000/api/chat/mark-read', {
      params: {
        userId: currentUserId.value,
        senderId: conv.userId,
      },
    });
    
    // 重新加载会话列表
    await loadConversations();
  }
};

// 发送消息
const handleSendMessage = async () => {
  if (!messageText.value.trim() || !currentReceiver.value) return;

  try {
    const message = {
      senderId: currentUserId.value,
      receiverId: currentReceiver.value.id,
      content: messageText.value,
      messageType: 'text',
    };

    await sendMessage(message);
    
    // 添加到本地消息列表
    chatHistory.value.push({
      ...message,
      createdAt: new Date(),
      isRead: false,
    });
    
    messageText.value = '';
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    
    // 重新加载会话列表
    await loadConversations();
  } catch (error) {
    console.error('发送消息失败:', error);
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
};

// 格式化时间
const formatTime = (date: any) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// 监听新消息
watch(messages, async () => {
  await nextTick();
  scrollToBottom();
  
  // 重新加载会话列表
  await loadConversations();
}, { deep: true });

// 初始化
onMounted(async () => {
  // 连接 WebSocket
  connect();
  
  // 等待连接成功后上线
  setTimeout(() => {
    if (connected.value) {
      goOnline(currentUserId.value);
    }
  }, 1000);
  
  // 加载会话列表
  await loadConversations();
});
</script>

<style scoped lang="scss">
.chat-container {
  width: 100%;
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 18px;
  }

  .status {
    span {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;

      &.online {
        background: #67c23a;
        color: #fff;
      }

      &.offline {
        background: #909399;
        color: #fff;
      }
    }
  }
}

.chat-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.conversation-list {
  width: 250px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;

  h3 {
    padding: 12px 16px;
    margin: 0;
    font-size: 14px;
    background: #f5f7fa;
  }

  .conversation-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
    }

    .conv-info {
      flex: 1;

      .conv-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .conv-last-message {
        font-size: 12px;
        color: #909399;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .unread-badge {
      background: #f56c6c;
      color: #fff;
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 12px;
      min-width: 18px;
      text-align: center;
    }
  }
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;

  .empty-chat {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
  }

  .chat-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .chat-info {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f5f7fa;

      h3 {
        margin: 0;
        font-size: 16px;
      }
    }

    .message-list {
      flex: 1;
      padding: 16px;
      overflow-y: auto;

      .message-item {
        margin-bottom: 16px;
        display: flex;

        &.sent {
          justify-content: flex-end;

          .message-content {
            background: #409eff;
            color: #fff;
          }
        }

        &.received {
          justify-content: flex-start;

          .message-content {
            background: #f0f0f0;
            color: #303133;
          }
        }

        .message-content {
          max-width: 60%;
          padding: 8px 12px;
          border-radius: 8px;

          .message-text {
            word-wrap: break-word;
          }

          .message-time {
            font-size: 11px;
            margin-top: 4px;
            opacity: 0.7;
          }
        }
      }
    }

    .message-input {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;

      :deep(.el-textarea) {
        flex: 1;
      }
    }
  }
}
</style>
