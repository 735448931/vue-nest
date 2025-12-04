<template>
    <div class="message-input-wrapper">
        <div class="input-container">
            <div class="tiptap-container">
                <el-scrollbar max-height="160px">
                    <TipTap v-model="text" ref="tipTapRef" @enter="handleSend" />
                </el-scrollbar>
            </div>
            <!-- 图片选择按钮 -->
            <button class="image-button" @click="triggerImageSelect" title="选择图片">
                <svg class="image-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <input 
                type="file" 
                ref="imageInputRef" 
                accept="image/*" 
                style="display: none" 
                @change="handleImageSelect"
            />
            <button class="send-button" @click="handleSend" :disabled="!text">
                <svg class="send-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import useChatStore from '@/store/chat';
import { ref, useTemplateRef } from 'vue';


const text = ref('')
const tiptapRef = useTemplateRef('tipTapRef')
const imageInputRef = useTemplateRef<HTMLInputElement>('imageInputRef')

// 存储选择的图片文件，用于发送
const selectedImages = ref<Map<string, File>>(new Map())

const chatStore = useChatStore()

// 触发图片选择
const triggerImageSelect = () => {
    imageInputRef.value?.click()
}

// 处理图片选择
const handleImageSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (file) {
        // 创建本地预览 URL
        const previewUrl = URL.createObjectURL(file)
        
        // 存储文件引用
        selectedImages.value.set(previewUrl, file)
        
        // 插入图片到编辑器
        tiptapRef.value?.insertImage(previewUrl)
        
        // 清空 input，允许重复选择同一张图片
        input.value = ''
    }
}

const handleSend = async () => {
    if (!text.value) return

    const editorJSON = tiptapRef.value!.editor.getJSON()

    const content:any = []
    handleEditorContent(editorJSON, content)

    if (
        content.length > 0 &&
        content[content.length - 1] &&
        content[content.length - 1]?.type === 'text' &&
        content[content.length - 1]?.payload?.text?.endsWith('\n')
    ) {
        const text = content[content.length - 1].payload.text
        content[content.length - 1].payload.text = text?.substring(0, text.lastIndexOf('\n'))
    }

    // 发送消息
    for (const item of content) {
        if (item.type === 'text' && item.payload.text) {
            await chatStore.sendTextMessage(chatStore.conversation.chatID!, item.payload.text)
        } else if (item.type === 'image' && item.payload.file) {
            await chatStore.sendImageMessage(chatStore.conversation.chatID!, item.payload.file)
        }
    }
    
    // 清理图片预览 URL
    selectedImages.value.forEach((_, url) => {
        URL.revokeObjectURL(url)
    })
    selectedImages.value.clear()
    
    text.value = ''
}

// ===================== 直接粘贴来的 =====================
const fileMap = new Map<string, any>()

interface ITipTapEditorContent {
    type: 'text' | 'image' | 'video' | 'file'
    payload: {
        text?: string
        file?: File
        atUserList?: string[]
    }
}



function handleEditorContent(root: any, content: Array<ITipTapEditorContent>) {
    if (!root || !root.type) {
        return
    }
    if (root.type !== 'text' && root.type !== 'custom-image' && root.type !== 'mention' && root.type !== 'image') {
        if (root.type === 'paragraph') {
            handleEditorNode(root, content)
        }
        if (root.content?.length) {
            root.content.forEach((item: any) => {
                handleEditorContent(item, content)
            })
        }
        return
    } else {
        handleEditorNode(root, content)
    }
}

function handleEditorNode(node: any, content: Array<ITipTapEditorContent>) {
    // handle enter
    if (node.type === 'paragraph') {
        if (content.length > 0 && content[content.length - 1] && content[content.length - 1]?.type === 'text') {
            content[content.length - 1]!.payload.text += '\n'
        }
    } else if (node.type === 'text' || (node.type === 'custom-image' && node?.attrs?.class === 'emoji')) {
        // 处理 text 和 emoji
        const text = node.type === 'text' ? node?.text : node?.attrs?.alt
        if (content.length > 0 && content[content.length - 1] && content[content.length - 1]?.type === 'text') {
            content[content.length - 1]!.payload.text += text
        } else {
            content.push({
                type: 'text',
                payload: { text: text }
            })
        }
    } else if (node.type === 'image') {
        // 处理 TipTap Image 扩展的图片
        const src = node?.attrs?.src
        const file = selectedImages.value.get(src)
        if (file) {
            content.push({
                type: 'image',
                payload: { file }
            })
        }
    } else if (node.type === 'custom-image' && node?.attrs?.class === 'normal') {
        // 处理富文本图像
        content.push({
            type: 'image',
            payload: { file: fileMap?.get(node?.attrs?.src) }
        })
    } else if (node.type === 'custom-image' && node?.attrs?.class === 'file') {
        const file = fileMap?.get(node?.attrs?.src)
        content.push({
            type: file?.type?.includes('video') ? 'video' : 'file',
            payload: { file }
        })
    } else if (node.type === 'mention') {
        const text = '@' + node?.attrs?.label + ' '
        if (content.length > 0 && content[content.length - 1] && content[content.length - 1]?.type === 'text') {
            content[content.length - 1]!.payload.text += text
        } else {
            content.push({
                type: 'text',
                payload: { text: text }
            })
        }
        if (content[content.length - 1]?.payload?.atUserList) {
            content[content.length - 1]?.payload?.atUserList?.push(node?.attrs?.id)
        } else {
            content[content.length - 1]!.payload.atUserList = [node?.attrs?.id]
        }
    }
}
    
</script>

<style scoped lang="scss">
.message-input-wrapper {
    padding: 16px;
    background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.input-container {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    background: #ffffff;
    border-radius: 16px;
    padding: 12px;
    box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.04),
        0 1px 2px rgba(0, 0, 0, 0.06);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.08),
            0 2px 4px rgba(0, 0, 0, 0.08);
    }

    &:focus-within {
        box-shadow: 
            0 0 0 3px rgba(64, 158, 255, 0.12),
            0 4px 12px rgba(64, 158, 255, 0.15);
    }
}

.tiptap-container {
    flex: 1;
    min-width: 0;
}

.image-button {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: #f0f2f5;
    color: #606266;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        background: #e4e7ed;
        color: #409eff;
        transform: translateY(-2px) scale(1.05);
    }

    &:active {
        transform: translateY(0) scale(0.98);
    }

    .image-icon {
        width: 20px;
        height: 20px;
    }
}

.send-button {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: #409eff;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);

    &:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
        background: #66b1ff;
    }

    &:active:not(:disabled) {
        transform: translateY(0) scale(0.98);
    }

    &:disabled {
        background: #a0cfff;
        cursor: not-allowed;
        opacity: 0.6;
        box-shadow: none;
    }

    .send-icon {
        width: 20px;
        height: 20px;
    }
}

:deep(.ProseMirror) {
    min-height: 60px;
    max-height: 160px;
    outline: none;
    font-size: 15px;
    line-height: 1.6;
    color: #1a1a1a;
    padding: 4px 0;
    
    p {
        margin: 0;
    }
    
    &.is-editor-empty:first-child::before {
        color: #9ca3af;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
        font-weight: 400;
    }
}

:deep(.el-scrollbar__view) {
    padding: 0;
}
</style>