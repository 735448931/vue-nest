<template>
    <div class="message-item" :class="{ 'is-self': props.message.flow === 'out' }">
        <div class="avatar">
            <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        </div>
        <div class="message-content">
            <div class="image-bubble" @click="handlePreview">
                <el-image 
                    :src="imageUrl" 
                    :preview-src-list="[originalUrl]"
                    fit="cover"
                    :initial-index="0"
                    preview-teleported
                    hide-on-click-modal
                >
                    <template #placeholder>
                        <div class="image-loading">
                            <el-icon class="is-loading"><Loading /></el-icon>
                        </div>
                    </template>
                    <template #error>
                        <div class="image-error">
                            <el-icon><Picture /></el-icon>
                            <span>加载失败</span>
                        </div>
                    </template>
                </el-image>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading, Picture } from '@element-plus/icons-vue'

interface Props {
    message: any
}

const props = defineProps<Props>()

// 腾讯云 IM 图片消息的 payload 结构:
// payload.imageInfoArray 包含不同尺寸的图片信息
// - imageInfoArray[0]: 原图
// - imageInfoArray[1]: 大图
// - imageInfoArray[2]: 缩略图

// 获取缩略图或小图用于展示
const imageUrl = computed(() => {
    const imageInfoArray = props.message.payload?.imageInfoArray
    if (imageInfoArray && imageInfoArray.length > 0) {
        // 优先使用缩略图（索引2），如果没有则使用大图（索引1），最后使用原图（索引0）
        return imageInfoArray[2]?.url || imageInfoArray[1]?.url || imageInfoArray[0]?.url
    }
    return ''
})

// 获取原图用于预览
const originalUrl = computed(() => {
    const imageInfoArray = props.message.payload?.imageInfoArray
    if (imageInfoArray && imageInfoArray.length > 0) {
        // 预览时使用原图
        return imageInfoArray[0]?.url || imageInfoArray[1]?.url
    }
    return ''
})

const handlePreview = () => {
    // el-image 组件会自动处理预览
}
</script>

<style scoped lang="scss">
.message-item {
    display: flex;
    margin-bottom: 20px;
    animation: slideIn 0.3s ease-out;

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 12px;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .message-content {
        display: flex;
        flex-direction: column;
        max-width: 60%;
    }

    .image-bubble {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        background: #f5f5f5;

        :deep(.el-image) {
            display: block;
            max-width: 200px;
            max-height: 200px;
            min-width: 80px;
            min-height: 80px;
            
            img {
                object-fit: cover;
            }
        }

        .image-loading,
        .image-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 120px;
            color: #909399;
            font-size: 12px;
            gap: 8px;

            .el-icon {
                font-size: 24px;
            }
        }

        &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
    }

    &.is-self {
        flex-direction: row-reverse;

        .message-content {
            align-items: flex-end;
        }

        .avatar {
            margin-left: 12px;
            margin-right: 0;
        }

        .image-bubble {
            background: #95ec69;
        }
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>