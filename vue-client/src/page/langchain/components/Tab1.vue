<template>
    <div>
        <span>支持模型:</span>
        <template v-for="item in modelInfo?.available">
            <span>{{ item }}</span>
        </template>

        <span>默认模型: {{ modelInfo?.default }}</span>
    </div>

    <div>
        <h4>基础使用</h4>
        <div>
            <el-input v-model="inputInvoke" style="width: 240px" placeholder="请输入" />
            <el-button @click="handleInvoke">发送(invoke)</el-button>
        </div>
        <div>结果: {{ invokeRes }}</div>

        <h4>流式返回</h4>
        <div>
            <el-input v-model="streamInvoke" style="width: 240px" placeholder="请输入" />
            <el-button @click="handleStream">发送(stream)</el-button>
        </div>
        <div style="white-space: pre-wrap;">结果:{{ streamRes }}</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getAllProvidersApi, invokeApi } from '@/api/langchain';
import type { ModelInfo } from '@/api/interface/langchain';
import { sseManager } from '@/utils/sse';
import { pa } from 'element-plus/es/locales.mjs';

const inputInvoke = ref()
const streamInvoke = ref()
const modelInfo = ref<ModelInfo>()
const invokeRes = ref<string>('')
const streamRes = ref<string>('')


const getAllProviders = async () => {
    const { data } = await getAllProvidersApi()
    modelInfo.value = data
}

const handleInvoke = async () => {
    const { data } = await invokeApi({
        question: inputInvoke.value
    })
    console.log('🍿🍿🍿🍿🍿data:', data);
    invokeRes.value = data
}

// const handleStream = () => {
//     streamRes.value = ''
//     if(!streamInvoke.value) return

//     const eventSource = new EventSource(`http://localhost:3000/api/langchain/stream?question=${streamInvoke.value}`)

//     eventSource.onmessage = (event) => {
//         try {
//             const parsedData = JSON.parse(event.data)
//             if (parsedData.data.content) {
//                 streamRes.value += parsedData.data.content
//             }

//             if (parsedData.data.done) {
//                 console.log('传输完成')
//                 eventSource.close()
//             }
//         } catch (error) {
//             console.error('JSON解析错误:', error)
//         }
//     }

//     eventSource.onerror = (err) => {
//         console.error('SSE Error:', err)
//         eventSource.close()
//     }
// }

const handleStream = () => {
    streamRes.value = ''
    if (!streamInvoke.value) return

    sseManager.connect({
        url: 'http://localhost:3000/api/langchain/stream',
        query: {
            question: streamInvoke.value
        },
    })

    sseManager.on('message', (data:any) => {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

        if (parsedData?.data?.content) {
            streamRes.value += parsedData.data.content
        }
        
        if (parsedData?.data?.done) {
            sseManager.disconnect()
        }
        
    })

}


onMounted(() => {
    getAllProviders()
})


</script>

<style scoped></style>