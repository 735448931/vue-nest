<template>
    <div class="message-input-wrapper">
        <el-scrollbar height="160px">
                <div class="tiptap-container">
                    <TipTap v-model="text" />
                </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const text = ref('')
</script>

<style scoped lang="scss">
.message-input-wrapper {
    padding: 10px 0;
}

.tiptap-container {
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    padding: 8px 12px;
    background-color: #fff;
    transition: all 0.3s;
    cursor: text;

    &:hover {
        border-color: #c0c4cc;
    }

    &:focus-within {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
}

:deep(.ProseMirror) {
    min-height: 24px;
    outline: none;
    font-size: 14px;
    line-height: 1.5;
    color: #303133;
    
    p {
        margin: 0;
    }
    
    /* 占位符样式 (如果使用了 Placeholder 扩展) */
    &.is-editor-empty:first-child::before {
        color: #a8abb2;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
    }
}
</style>