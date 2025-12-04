<template>
    <el-scrollbar height="200px">
        <template v-for="(value, key) in basicEmojiMap" :key="key">
            <img @click="handleClick(key)" :src="basicEmojiUrl + value" class="emoji">
            </img>
        </template>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { basicEmojiMap, basicEmojiUrl } from '@/utils/emojiList';

interface Emit {
    sendEmoji: [any]
}
const emits = defineEmits<Emit>()

const handleClick = (key: keyof typeof basicEmojiMap) => {
    emits('sendEmoji', {
        name: key,
        type: 'basic',
        url: basicEmojiUrl + basicEmojiMap[key]
    })
}

</script>

<style scoped>
.emoji {
    width: 30px;
    height: 30px;
    padding: 5px;
}
</style>