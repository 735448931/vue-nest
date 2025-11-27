# Socket.io 单聊系统集成文档

## 功能概述

这是一个基于 Nest.js 和 Socket.io 实现的实时单聊系统，支持以下功能：

- ✅ 实时消息推送
- ✅ 消息持久化存储
- ✅ 聊天历史记录
- ✅ 未读消息统计
- ✅ 用户在线状态管理
- ✅ 会话列表管理

## 后端架构

### 核心文件

```
nest-server/src/modules/chat/
├── entities/
│   └── message.entity.ts          # 消息实体（数据库表结构）
├── chat.gateway.ts                # WebSocket 网关
├── chat.service.ts                # 业务逻辑服务
├── chat.controller.ts             # HTTP 控制器
└── chat.module.ts                 # 模块配置
```

### 数据库表结构

**messages 表**
- id: 主键
- sender_id: 发送者ID
- receiver_id: 接收者ID
- content: 消息内容
- message_type: 消息类型（text/image/file）
- is_read: 是否已读
- created_at: 创建时间

### WebSocket 事件

#### 客户端发送事件

1. **online** - 用户上线
```typescript
socket.emit('online', { userId: 1 })
```

2. **sendMessage** - 发送消息
```typescript
socket.emit('sendMessage', {
  senderId: 1,
  receiverId: 2,
  content: 'Hello',
  messageType: 'text'
})
```

3. **markAsRead** - 标记已读
```typescript
socket.emit('markAsRead', {
  messageId: 123,
  userId: 1
})
```

#### 服务端发送事件

1. **receiveMessage** - 接收新消息
```typescript
socket.on('receiveMessage', (message) => {
  console.log('收到新消息:', message)
})
```

### HTTP API 接口

1. **获取会话列表**
```
GET /api/chat/conversations/:userId
```

2. **获取聊天历史**
```
GET /api/chat/history?userId1=1&userId2=2&limit=50
```

3. **获取未读消息数**
```
GET /api/chat/unread/:userId
```

4. **标记所有消息为已读**
```
GET /api/chat/mark-read?userId=1&senderId=2
```

## 前端架构

### 核心文件

```
vue-client/src/
├── composables/
│   └── useSocket.ts               # Socket.io 封装 Hook
├── components/
│   └── ChatRoom.vue               # 聊天室组件
└── views/
    └── ChatDemo.vue               # 演示页面
```

### 使用方式

#### 1. 在组件中使用

```vue
<template>
  <ChatRoom :user-id="1" />
</template>

<script setup>
import ChatRoom from '@/components/ChatRoom.vue'
</script>
```

#### 2. 使用 useSocket Hook

```typescript
import { useSocket } from '@/composables/useSocket'

const { connected, messages, connect, goOnline, sendMessage } = useSocket()

// 连接服务器
connect('http://localhost:3000')

// 用户上线
goOnline(userId)

// 发送消息
await sendMessage({
  senderId: 1,
  receiverId: 2,
  content: 'Hello',
  messageType: 'text'
})
```

## 启动项目

### 1. 启动后端

```bash
cd nest-server
pnpm install
pnpm start
```

后端将运行在: `http://localhost:3000`

### 2. 启动前端

```bash
cd vue-client
pnpm install
pnpm dev
```

前端将运行在: `http://localhost:5173`

### 3. 测试聊天功能

1. 打开浏览器访问 `http://localhost:5173`（如果有 ChatDemo 路由）
2. 选择用户1
3. 在新标签页中打开同一地址，选择用户2
4. 在两个页面中互相发送消息

## 技术栈

### 后端
- Nest.js - Node.js 框架
- Socket.io - WebSocket 库
- TypeORM - ORM 框架
- MySQL - 数据库

### 前端
- Vue 3 - 前端框架
- Socket.io-client - WebSocket 客户端
- Element Plus - UI 组件库
- TypeScript - 类型支持

## 扩展功能建议

1. **消息类型扩展**
   - 图片消息
   - 文件消息
   - 语音消息
   - 视频消息

2. **群聊功能**
   - 创建群组
   - 群组消息
   - 群组成员管理

3. **消息增强**
   - 消息撤回
   - 消息转发
   - @提醒
   - 消息搜索

4. **用户体验**
   - 输入状态提示
   - 消息送达回执
   - 离线消息推送
   - 消息加密

5. **性能优化**
   - 消息分页加载
   - 虚拟滚动
   - 消息缓存
   - CDN 加速

## 注意事项

1. **安全性**
   - 生产环境需要配置正确的 CORS 域名
   - 添加用户认证和权限验证
   - 对消息内容进行 XSS 防护

2. **性能**
   - 大量并发时考虑使用 Redis 管理在线用户
   - 消息队列处理离线消息
   - 数据库索引优化

3. **可靠性**
   - 添加消息重发机制
   - 心跳检测保持连接
   - 断线重连处理

## 故障排查

### WebSocket 连接失败
- 检查服务端是否启动
- 检查 CORS 配置
- 检查防火墙设置

### 消息发送失败
- 检查用户是否在线
- 检查数据库连接
- 查看服务端日志

### 消息未实时接收
- 检查 Socket 连接状态
- 检查事件监听是否正确
- 检查用户映射关系

## 相关资源

- [Socket.io 官方文档](https://socket.io/docs/v4/)
- [Nest.js WebSocket 文档](https://docs.nestjs.com/websockets/gateways)
- [TypeORM 官方文档](https://typeorm.io/)
