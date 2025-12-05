<template>
    <div class="input-toolbar">
        <div class="left-tools">
            <!-- 深度思考按钮 -->
            <div class="tool-btn feature-btn" :class="{ 'is-active': isDeepThinking }" @click="toggleDeepThinking">
                <el-icon class="icon">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                        <path fill="currentColor"
                            d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 832a384 384 0 1 0 0-768 384 384 0 0 0 0 768zm-48-528a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm48-144a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z">
                        </path>
                    </svg>
                </el-icon>
                <span>深度思考</span>
            </div>

            <!-- 联网搜索按钮 -->
            <div class="tool-btn feature-btn" :class="{ 'is-active': isWebSearch }" @click="toggleWebSearch">
                <el-icon class="icon">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                        <path fill="currentColor"
                            d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zM512 232a280 280 0 1 0 0 560 280 280 0 0 0 0-560zm0 480a200 200 0 1 1 0-400 200 200 0 0 1 0 400z">
                        </path>
                    </svg>
                </el-icon>
                <span>联网搜索</span>
            </div>

            <div class="divider"></div>

            <!-- 上传附件按钮 -->
            <el-popover content="上传附件" placement="top">

                <template #reference>
                    <div class="tool-btn icon-only">
                        <el-icon>
                            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                                <path fill="currentColor"
                                    d="M771.195 380.715 490.522 661.388a161.655 161.655 0 0 1-228.614 0 161.655 161.655 0 0 1 0-228.614l327.45-327.452a96.993 96.993 0 0 1 137.169 0 96.993 96.993 0 0 1 0 137.17L445.673 523.346a32.331 32.331 0 0 1-45.723 0 32.331 32.331 0 0 1 0-45.723l280.854-280.854a32.331 32.331 0 0 0-45.723-45.723L354.227 431.9a96.993 96.993 0 0 0 0 137.17 96.993 96.993 0 0 0 137.17 0l280.853-280.854a161.655 161.655 0 0 0 0-228.614 161.655 161.655 0 0 0-228.614 0L216.185 387.054a226.317 226.317 0 0 0 0 320.068 226.317 226.317 0 0 0 320.068 0l280.665-280.665a32.331 32.331 0 0 0-45.723-45.742z">
                                </path>
                            </svg>
                        </el-icon>
                    </div>
                </template>

            </el-popover>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Emoji from './components/Emoji.vue'

// 状态管理
const isDeepThinking = ref(false)
const isWebSearch = ref(false)

// 切换功能状态
const toggleDeepThinking = () => {
    isDeepThinking.value = !isDeepThinking.value
}

const toggleWebSearch = () => {
    isWebSearch.value = !isWebSearch.value
}
</script>

<style scoped lang="scss">
.input-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    user-select: none;
}

.left-tools {
    display: flex;
    align-items: center;
    gap: 8px;
}

.right-tools {
    display: flex;
    align-items: center;
    gap: 12px;
}

.tool-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    color: #606266;
    background-color: #f4f4f5;
    transition: all 0.3s ease;
    border: 1px solid transparent;

    &:hover {
        background-color: #e9e9eb;
        color: #303133;
    }

    &.feature-btn {
        .icon {
            font-size: 14px;
        }
    }

    &.is-active {
        background-color: #ecf5ff;
        color: #409eff;
        border-color: #d9ecff;
        
        .icon {
            color: #409eff;
        }
    }

    &.icon-only {
        padding: 8px;
        border-radius: 50%;
        background-color: transparent;
        
        &:hover {
            background-color: #f0f2f5;
        }
        
        .el-icon {
            font-size: 18px;
        }
    }
}

.divider {
    width: 1px;
    height: 16px;
    background-color: #dcdfe6;
    margin: 0 4px;
}

.send-info {
    .shortcut-tip {
        font-size: 12px;
        color: #909399;
        margin-right: 8px;
    }
}

.send-btn {
    padding: 8px 20px;
    font-weight: 500;
}
</style>
