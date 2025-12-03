<template>
    <div class="ai-chat-container">
        <!-- 聊天消息区域 -->
        <div ref="messageListRef" class="message-list">
            <div 
                v-for="(msg, index) in messages" 
                :key="index" 
                class="message-item"
                :class="msg.role"
            >
                <div class="avatar">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
                <div class="content">
                    <!-- 附件预览 -->
                    <div v-if="msg.attachments?.length" class="attachments">
                        <div v-for="(file, i) in msg.attachments" :key="i" class="file-item">
                            <img v-if="file.type === 'image'" :src="file.url" class="img-preview" />
                            <span v-else>📄 {{ file.name }}</span>
                        </div>
                    </div>
                    <!-- 消息文本 -->
                    <div class="text">{{ msg.content }}</div>
                    <div v-if="msg.webSearch" class="tag">🌐 联网搜索</div>
                </div>
            </div>
            <!-- 加载中 -->
            <div v-if="loading" class="message-item assistant">
                <div class="avatar">AI</div>
                <div class="content">
                    <div class="loading">思考中...</div>
                </div>
            </div>
        </div>

        <!-- 上传文件预览 -->
        <div v-if="uploadFiles.length > 0" class="upload-area">
            <div v-for="(file, index) in uploadFiles" :key="index" class="upload-item">
                <img v-if="file.type === 'image'" :src="file.url" class="preview" />
                <span v-else>📄 {{ file.name }}</span>
                <span class="close" @click="removeFile(index)">×</span>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
            <div class="toolbar">
                <button 
                    :class="['btn', { active: webSearchEnabled }]"
                    @click="toggleWebSearch"
                >
                    🌐 联网搜索
                </button>
                <button class="btn" @click="triggerImageUpload">📷 图片</button>
                <button class="btn" @click="triggerPdfUpload">📄 PDF</button>
            </div>

            <input 
                ref="imageInputRef"
                type="file" 
                accept="image/*" 
                multiple
                style="display: none"
                @change="handleImageUpload"
            />
            <input 
                ref="pdfInputRef"
                type="file" 
                accept=".pdf" 
                style="display: none"
                @change="handlePdfUpload"
            />

            <div class="input-box">
                <textarea
                    v-model="inputMessage"
                    placeholder="输入消息，Enter 发送，Shift+Enter 换行"
                    @keydown.enter.exact.prevent="sendMessage"
                />
                <button 
                    class="send-btn" 
                    :disabled="!canSend"
                    @click="sendMessage"
                >
                    {{ loading ? '发送中...' : '发送' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useSSE } from '@/hooks/useSSE'

// ===================== 类型定义 =====================
interface Attachment {
    type: 'image' | 'pdf'
    name: string
    url: string
    file?: File
}

interface Message {
    role: 'user' | 'assistant'
    content: string
    attachments?: Attachment[]
    webSearch?: boolean
}

const {
    answer,
    fetchDocumentAnswerAsync,
} = useSSE()
// ===================== 数据 =====================
const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const webSearchEnabled = ref(false)
const uploadFiles = ref<Attachment[]>([])

const messageListRef = ref<HTMLElement>()
const imageInputRef = ref<HTMLInputElement>()
const pdfInputRef = ref<HTMLInputElement>()

// ===================== 计算属性 =====================
const canSend = computed(() => {
    return (inputMessage.value.trim() || uploadFiles.value.length > 0) && !loading.value
})

// ===================== 方法 =====================

// 切换联网搜索
const toggleWebSearch = () => {
    webSearchEnabled.value = !webSearchEnabled.value
    ElMessage.success(webSearchEnabled.value ? '已开启联网搜索' : '已关闭联网搜索')
}

// 触发图片上传
const triggerImageUpload = () => {
    imageInputRef.value?.click()
}

// 触发PDF上传
const triggerPdfUpload = () => {
    pdfInputRef.value?.click()
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (!files) return

    for (const file of files) {
        if (!file.type.startsWith('image/')) {
            ElMessage.warning('请选择图片文件')
            continue
        }
        if (file.size > 10 * 1024 * 1024) {
            ElMessage.warning('图片大小不能超过10MB')
            continue
        }
        uploadFiles.value.push({
            type: 'image',
            name: file.name,
            url: URL.createObjectURL(file),
            file
        })
    }
    target.value = ''
}

// 处理PDF上传
const handlePdfUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
        ElMessage.warning('请选择PDF文件')
        return
    }
    if (file.size > 20 * 1024 * 1024) {
        ElMessage.warning('PDF大小不能超过20MB')
        return
    }

    uploadFiles.value.push({
        type: 'pdf',
        name: file.name,
        url: URL.createObjectURL(file),
        file
    })
    target.value = ''
}

// 移除文件
const removeFile = (index: number) => {
    const file = uploadFiles.value[index]
    if (file) {
        URL.revokeObjectURL(file.url)
        uploadFiles.value.splice(index, 1)
    }
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (messageListRef.value) {
            messageListRef.value.scrollTop = messageListRef.value.scrollHeight
        }
    })
}

// 发送消息
const sendMessage = async () => {
    if (!canSend.value) return

    const content = inputMessage.value.trim()
    const attachments = [...uploadFiles.value]
    const isWebSearch = webSearchEnabled.value

    // 添加用户消息
    messages.value.push({
        role: 'user',
        content: content || '请分析这些文件',
        attachments: attachments.length > 0 ? attachments : undefined,
        webSearch: isWebSearch
    })

    // 清空输入
    inputMessage.value = ''
    uploadFiles.value = []
    
    scrollToBottom()
    loading.value = true

    try {
        // // 构建请求数据
        // const formData = new FormData()
        // formData.append('message', content)
        // formData.append('webSearch', String(isWebSearch))
        
        // // 添加文件
        // attachments.forEach((attachment) => {
        //     if (attachment.file) {
        //         formData.append('files', attachment.file)
        //     }
        // })

        // TODO: 替换为实际的 API 调用
        // import { aiChatApi } from '@/api/langchain'
        // const { data } = await aiChatApi(formData)
        // messages.value.push({
        //     role: 'assistant',
        //     content: data.response
        // })

        const result = await fetchDocumentAnswerAsync('ai现状如何 用30个字以内说明');

        console.log('🍿🍿🍿🍿🍿result:', result);
        
                
        let response = ''
        if (isWebSearch) response += '🌐 已联网搜索\n\n'
        if (attachments.length > 0) {
            const imgs = attachments.filter(a => a.type === 'image').length
            const pdfs = attachments.filter(a => a.type === 'pdf').length
            if (imgs > 0) response += `📷 已接收 ${imgs} 张图片\n`
            if (pdfs > 0) response += `📄 已接收 ${pdfs} 个PDF\n`
            response += '\n'
        }
        response += `收到您的消息："${content || '文件分析'}"\n\n这是答案:${result}`
        
        messages.value.push({
            role: 'assistant',
            content: response
        })
        
    } catch (error) {
        ElMessage.error('发送失败，请重试')
        console.error(error)
    } finally {
        loading.value = false
        scrollToBottom()
    }
}
</script>

<style scoped lang="scss">
.ai-chat-container {
    display: flex;
    flex-direction: column;
    height: 600px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
}

.message-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 3px;
    }
}

.empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
}

.message-item {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    
    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        flex-shrink: 0;
    }
    
    .content {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 8px;
        background: #f5f7fa;
        
        .text {
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
        }
        
        .tag {
            margin-top: 6px;
            font-size: 12px;
            color: #909399;
        }
        
        .loading {
            color: #909399;
        }
    }
    
    &.user {
        flex-direction: row-reverse;
        
        .avatar {
            background: #409eff;
            color: #fff;
        }
        
        .content {
            background: #409eff;
            color: #fff;
            
            .tag {
                color: rgba(255, 255, 255, 0.8);
            }
        }
    }
}

.attachments {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
    
    .file-item {
        .img-preview {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
        }
    }
}

.upload-area {
    display: flex;
    gap: 8px;
    padding: 10px 16px;
    background: #f5f7fa;
    border-top: 1px solid #e4e7ed;
    
    .upload-item {
        position: relative;
        
        .preview {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .close {
            position: absolute;
            top: -6px;
            right: -6px;
            width: 16px;
            height: 16px;
            background: #f56c6c;
            color: #fff;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
    }
}

.input-area {
    border-top: 1px solid #e4e7ed;
    padding: 12px;
    
    .toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        
        .btn {
            padding: 6px 12px;
            border: 1px solid #dcdfe6;
            background: #fff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.3s;
            
            &:hover {
                border-color: #409eff;
                color: #409eff;
            }
            
            &.active {
                background: #409eff;
                color: #fff;
                border-color: #409eff;
            }
        }
    }
    
    .input-box {
        display: flex;
        gap: 8px;
        
        textarea {
            flex: 1;
            padding: 8px;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            resize: none;
            height: 60px;
            font-size: 14px;
            font-family: inherit;
            
            &:focus {
                outline: none;
                border-color: #409eff;
            }
        }
        
        .send-btn {
            padding: 0 20px;
            background: #409eff;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            
            &:hover {
                background: #66b1ff;
            }
            
            &:disabled {
                background: #a0cfff;
                cursor: not-allowed;
            }
        }
    }
}
</style>
<style scoped>

</style>