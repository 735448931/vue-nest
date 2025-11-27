import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  messageType?: string;
  createdAt?: Date;
  isRead?: boolean;
}

export function useSocket() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const messages = ref<Message[]>([]);

  // 连接 Socket.io 服务器
  const connect = (url: string = 'http://localhost:3000') => {
    socket.value = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.value.on('connect', () => {
      connected.value = true;
      console.log('WebSocket 连接成功');
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
      console.log('WebSocket 断开连接');
    });

    socket.value.on('receiveMessage', (message: Message) => {
      console.log('收到新消息:', message);
      messages.value.push(message);
    });

    socket.value.on('connect_error', (error) => {
      console.error('连接错误:', error);
    });
  };

  // 用户上线
  const goOnline = (userId: number) => {
    if (socket.value) {
      socket.value.emit('online', { userId }, (response: any) => {
        console.log('上线响应:', response);
      });
    }
  };

  // 发送消息
  const sendMessage = (message: Message) => {
    return new Promise((resolve, reject) => {
      if (!socket.value) {
        reject(new Error('Socket 未连接'));
        return;
      }

      socket.value.emit('sendMessage', message, (response: any) => {
        if (response.data.success) {
          console.log('消息发送成功:', response);
          resolve(response.data.messageData);
        } else {
          console.error('消息发送失败:', response);
          reject(new Error(response.data.message));
        }
      });
    });
  };

  // 标记消息为已读
  const markAsRead = (messageId: number, userId: number) => {
    if (socket.value) {
      socket.value.emit('markAsRead', { messageId, userId }, (response: any) => {
        console.log('标记已读响应:', response);
      });
    }
  };

  // 断开连接
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    connected,
    messages,
    connect,
    goOnline,
    sendMessage,
    markAsRead,
    disconnect,
  };
}
