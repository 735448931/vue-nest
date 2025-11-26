<template>
    <div class="header-container">
        <el-button type="primary" @click="chatStore.toggleDrawer()">
            {{ chatStore.chatDrawerShow ? '关闭聊天' : '打开聊天' }}
        </el-button>
    </div>
</template>

<script setup lang="ts">
import useChatStore from '@/store/chat'

const chatStore = useChatStore()
</script>

<style scoped lang="scss">
.header-container {
    display: flex;
    align-items: center;
    padding: 16px;
}
</style>