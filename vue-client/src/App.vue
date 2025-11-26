<template>
  <el-config-provider :locale="zhCn">
    <router-view />
    <Chat></Chat>
  </el-config-provider>
</template>

<script setup lang="ts">
import Chat from '@/page/chat/index.vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<style scoped>

</style>