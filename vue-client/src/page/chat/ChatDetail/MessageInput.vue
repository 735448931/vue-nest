<template>
    <div class="message-input-wrapper">
        <div class="input-container">
            <div class="tiptap-container">
                <el-scrollbar max-height="160px">
                    <TipTap v-model="text" />
                </el-scrollbar>
            </div>
            <button 
                class="send-button" 
                @click="handleSend" 
                :disabled="!text"
            >
                <svg class="send-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
    (e: 'send', text: string): void
}>()

const text = ref('')

const handleSend = () => {
    if (!text.value) return

    console.log('🍿🍿🍿🍿🍿text.value:', text.value);

    text.value = ''

    // 追加一条消息 

    // 发起请求
    
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