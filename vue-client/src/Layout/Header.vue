<template>
    <div class="header-container">
        <el-button type="primary" @click="chatStore.toggleDrawer()">
            {{ chatStore.chatDrawerShow ? '关闭聊天' : '打开聊天' }}
        </el-button>


        <div class="avatar-container">
            <el-dropdown trigger="hover" @command="handleCommand" class="user-dropdown">
                <span class="user-wrap" aria-hidden>
                    <el-avatar :size="30" :src="userStore.userInfo.headPic" />
                    <span class="user-name">{{ userStore.userInfo.username }}</span>
                </span>

                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                        <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>


    <Profile ref="profileRef"></Profile>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import useChatStore from '@/store/chat'
import useUserStore from '@/store/user';
import Profile from '@/components/profile.vue';

const chatStore = useChatStore()
const userStore = useUserStore()

const profileRef = ref<InstanceType<typeof Profile> | null>(null);
const handleCommand = (command: string) => {
    if (command === 'profile') {
        profileRef.value?.open()
    } else if (command === 'logout') {

    }    
}
</script>

<style scoped lang="scss">
.header-container {
    display: flex;
    align-items: center;
    padding: 16px;
}
.user-wrap {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.user-name {
  margin-left: 8px;
  color: var(--el-text-color-regular, #303133);
  font-size: 14px;
}

.user-dropdown ::v-deep .el-dropdown-menu {
  min-width: 140px;
}

:deep(.el-dialog) {
    padding: 0;
}
</style>