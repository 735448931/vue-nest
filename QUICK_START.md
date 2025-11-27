# Socket.io 单聊系统 - 快速开始

## ✅ 已完成的工作

### 后端 (Nest.js)
1. ✅ 创建 Message 实体（数据库表）
2. ✅ 创建 ChatGateway（WebSocket 处理）
3. ✅ 创建 ChatService（业务逻辑）
4. ✅ 创建 ChatController（HTTP API）
5. ✅ 配置 ChatModule
6. ✅ 更新 AppModule 添加 Message 实体

### 前端 (Vue 3)
1. ✅ 创建 useSocket 组合式函数
2. ✅ 创建 ChatRoom 聊天组件
3. ✅ 创建 ChatDemo 演示页面

### 测试工具
1. ✅ 创建 HTML 测试页面（可直接在浏览器中测试）

## 🚀 快速测试

### 方法 1: 使用 HTML 测试页面（推荐）

1. 确保后端服务正在运行
```bash
cd nest-server
pnpm start
```

2. 打开浏览器访问:
```
http://localhost:3000/static/chat-test.html
```

3. 打开第二个标签页，访问相同地址

4. 在第一个标签页选择"用户 1"并连接

5. 在第二个标签页选择"用户 2"并连接

6. 在任一标签页发送消息，另一个标签页会实时收到

### 方法 2: 使用 Vue 前端

1. 首先需要在路由中添加 ChatDemo 页面

在 `vue-client/src/router/index.ts` 中添加：
```typescript
{
  path: '/chat-demo',
  name: 'ChatDemo',
  component: () => import('../views/ChatDemo.vue')
}
```

2. 启动前端
```bash
cd vue-client
pnpm dev
```

3. 访问 `http://localhost:5173/chat-demo`

## 📋 功能清单

### WebSocket 功能
- [x] 用户上线/下线管理
- [x] 实时消息推送
- [x] 消息发送确认
- [x] 消息已读标记

### HTTP API 功能
- [x] 获取会话列表
- [x] 获取聊天历史
- [x] 获取未读消息数
- [x] 批量标记已读

### 数据库功能
- [x] 消息持久化
- [x] 用户关联
- [x] 时间戳记录
- [x] 已读状态

## 📝 API 使用示例

### WebSocket 连接
```javascript
const socket = io('http://localhost:3000')

// 用户上线
socket.emit('online', { userId: 1 })

// 发送消息
socket.emit('sendMessage', {
  senderId: 1,
  receiverId: 2,
  content: 'Hello',
  messageType: 'text'
})

// 接收消息
socket.on('receiveMessage', (message) => {
  console.log('收到消息:', message)
})
```

### HTTP API
```javascript
// 获取会话列表
GET http://localhost:3000/api/chat/conversations/1

// 获取聊天历史
GET http://localhost:3000/api/chat/history?userId1=1&userId2=2&limit=50

// 获取未读消息数
GET http://localhost:3000/api/chat/unread/1

// 标记已读
GET http://localhost:3000/api/chat/mark-read?userId=1&senderId=2
```

## 🔧 数据库表结构

启动项目后，TypeORM 会自动创建 `messages` 表，结构如下：

```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(255) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 下一步建议

### 1. 添加用户认证
- 在 WebSocket 连接时验证用户身份
- 使用 JWT 进行身份验证

### 2. 优化性能
- 使用 Redis 存储在线用户映射
- 消息分页加载
- 添加消息缓存

### 3. 扩展功能
- 添加群聊功能
- 支持图片/文件消息
- 消息撤回功能
- 消息转发功能

### 4. 用户体验
- 添加输入中提示
- 消息送达回执
- 离线消息推送
- 表情支持

## 🐛 故障排查

### 问题 1: WebSocket 连接失败
**解决方案:**
- 确保后端服务正在运行（端口 3000）
- 检查 CORS 配置
- 查看浏览器控制台错误信息

### 问题 2: 消息发送失败
**解决方案:**
- 确保已连接到 WebSocket
- 确保已调用 `online` 事件
- 检查发送的数据格式

### 问题 3: 数据库连接错误
**解决方案:**
- 确保 MySQL 服务正在运行
- 检查数据库配置（用户名、密码、数据库名）
- 确保数据库 `nest-server` 已创建

## 📚 相关文档

详细文档请查看：[CHAT_INTEGRATION.md](../CHAT_INTEGRATION.md)

## 💡 提示

1. 测试时建议打开多个浏览器标签页，模拟多个用户
2. 可以使用浏览器的开发者工具查看 WebSocket 连接状态
3. 查看后端控制台日志了解详细的运行信息

## 🎉 开始使用

现在就运行 `pnpm start` 启动项目，然后访问测试页面开始体验吧！
