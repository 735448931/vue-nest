<template>
    <!-- <el-upload :auto-upload="false" :on-change="handleImageChange" drag>
        单张上传
    </el-upload>

    <el-upload :auto-upload="false" :on-change="handleSharding" drag>
        分片上传
    </el-upload>

    <el-upload :auto-upload="false" :on-change="handleAliOss" drag>
        上传到阿里云
    </el-upload> -->


    <!-- <el-input v-model="input" style="width: 240px" placeholder="Please input" />



    <el-button @click="goLangChain">跳转</el-button> -->

    <!-- <div>{{ answer }}</div> -->


    <el-button @click="user1login">用户1登录</el-button>
    <el-button @click="user2login">用户2登录</el-button>

    <el-input v-model="user1input"></el-input>   <el-button @click="sendUser1Message">用户1发送消息</el-button>
    <el-input v-model="user2input"></el-input>   <el-button @click="sendUser2Message">用户2发送消息</el-button>
</template>

<script setup lang="ts">

import { getDocumentAnswerApi } from '@/api/langchain'
import { uploadImageApi, uploadChunkApi, mergeChunkApi, uploadAliOssApi } from '@/api/upload'
import { getWeatherApi } from '@/api/user'
import TipTap from '@/components/TipTap.vue'
import { useSSE } from '@/hooks/useSSE'
import useChatStore from '@/store/chat'
import type { UploadFile } from 'element-plus'
import { onMounted } from 'vue'


import { ref } from 'vue'
import { useRouter } from 'vue-router'

const chatStore = useChatStore()

const user1input = ref('')
const user2input = ref('')
const sendUser1Message = async () => {
  await chatStore.sendTextMessage('2', user1input.value)
}

const sendUser2Message = async () => {
  await chatStore.sendTextMessage('1', user2input.value)
}
const input = ref('')

const user1login = async () => {
  await chatStore.login('1', 'eJyrVgrxCdYrSy1SslIy0jNQ0gHzM1NS80oy0zLBwoZQweKU7MSCgswUJStDMwMDQ0NTE0sDiExqRUFmUSpQ3NTU1MjAACpakpkLEjM3MzEzMTI3MIKakpkONLM8o6wiuSAjKCczq9TUx8A-Rj9cOyk01SLUszJFO7KiOL-UPNwzNNHXv7LI0VapFgBWrjC*')
}

const user2login = async () => {
  await chatStore.login('2', 'eJyrVgrxCdYrSy1SslIy0jNQ0gHzM1NS80oy0zIhwlDB4pTsxIKCzBQlK0MzAwNDQ1MTSwOITGpFQWZRKlDc1NTUyMAAKlqSmQsSMzczMTMxNjC3hJqSmQ40MyrSPdI128g9zSTPtDhGPym-OCIor9Cs0KzAL60sPcvD3DfHzyfMwDulyKXcVqkWAD4KMDU_')
}


const router = useRouter()

const goLangChain = () => {
    router.push('/langchain')
}

// 单张上传
const handleImageChange = async (uploadFile: UploadFile) => {
    if (!uploadFile.raw) return
    const form = new FormData()
    form.append('image', uploadFile.raw)
    form.append('field', '传到后端body中的其他数据')
    await uploadImageApi(form)
}

// 分片上传 
const handleSharding = async (uploadFile: UploadFile) => {
    if (!uploadFile.raw) return
    const chunkSize = 200 * 1024;  // 200kB 一个切片
    const chunks = [];
    const tasks: Promise<unknown>[] = [];

    const file = uploadFile.raw;
    let startPos = 0;

    while (startPos < file.size) {
        chunks.push(file.slice(startPos, startPos + chunkSize));
        startPos += chunkSize;
    }

    chunks.forEach((chunk, index) => {
        const data = new FormData();
        data.set('name', file.name + '-' + index)
        data.append('files', chunk);
        tasks.push(uploadChunkApi(data))
    })    

    await Promise.all(tasks)
    await mergeChunkApi(file.name)
}


// 上传到阿里云
const handleAliOss = async (uploadFile: UploadFile) => {
    if (!uploadFile.raw) return
    const form = new FormData()
    form.append('image', uploadFile.raw)
    await uploadAliOssApi(form)
}

const getWeather = async () => {
    const res = await getWeatherApi()
    console.log('🍿🍿🍿🍿🍿res:', res);
}






// const {
//     answer,
//     isLoading,
//     error,
//     fetchDocumentAnswer,
//     closeConnection
// } = useSSE()



onMounted(async() => {
    getWeather()

    console.log('sse start--------');
    
    // const eventSource = new EventSource('http://localhost:3000/api/stream')
    // eventSource.onmessage = ({ data }) => {
    //     console.log('New ::::',JSON.parse(data));
    // }

    // fetchDocumentAnswer('今天的天气怎么样?')
})

</script>