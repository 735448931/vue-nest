<template>
  <div class="chat-demo-page">
    <h1>单聊系统演示</h1>
    
    <div class="user-selector">
      <el-select v-model="currentUserId" placeholder="选择当前用户" @change="handleUserChange">
        <el-option label="用户 1" :value="1" />
        <el-option label="用户 2" :value="2" />
        <el-option label="用户 3" :value="3" />
      </el-select>
    </div>

    <ChatRoom v-if="currentUserId" :key="currentUserId" :user-id="currentUserId" />

    <div class="instructions">
      <h3>使用说明：</h3>
      <ol>
        <li>选择一个用户ID作为当前登录用户</li>
        <li>在新标签页中打开同一页面，选择另一个用户ID</li>
        <li>在联系人列表中选择对方开始聊天</li>
        <li>发送消息后，对方会实时收到消息</li>
      </ol>
      
      <h3>API 接口：</h3>
      <ul>
        <li><code>GET /api/chat/conversations/:userId</code> - 获取会话列表</li>
        <li><code>GET /api/chat/history?userId1=&userId2=&limit=</code> - 获取聊天历史</li>
        <li><code>GET /api/chat/unread/:userId</code> - 获取未读消息数</li>
        <li><code>GET /api/chat/mark-read?userId=&senderId=</code> - 标记已读</li>
      </ul>

      <h3>WebSocket 事件：</h3>
      <ul>
        <li><code>online</code> - 用户上线</li>
        <li><code>sendMessage</code> - 发送消息</li>
        <li><code>receiveMessage</code> - 接收消息</li>
        <li><code>markAsRead</code> - 标记消息已读</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChatRoom from '../components/ChatRoom.vue';

const currentUserId = ref<number>(1);

const handleUserChange = () => {
  console.log('切换用户:', currentUserId.value);
};
</script>

<style scoped lang="scss">
.chat-demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .user-selector {
    margin-bottom: 20px;
    text-align: center;

    :deep(.el-select) {
      width: 200px;
    }
  }

  .instructions {
    margin-top: 40px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;

    h3 {
      margin-top: 20px;
      margin-bottom: 10px;
      
      &:first-child {
        margin-top: 0;
      }
    }

    ol, ul {
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
    }

    code {
      background: #e6e6e6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
  }
}
</style>
