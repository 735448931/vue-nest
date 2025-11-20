<template>
    <div>

    </div>
</template>

<script setup lang="ts">
import { getAllProvidersApi } from '@/api/langchain';
import { useSSE } from '@/hooks/useSSE';
import { onMounted } from 'vue';

const getAllProviders = async () => {
    const { data } = await getAllProvidersApi()
}

const { connect,on } = useSSE()

const sseInstance = connect({
    url:'http://localhost:3000/api/stream'
})

const unsub1 = on('change', (data) => {
    console.log('🍿🍿🍿🍿🍿data:', data);
    
})
const unsub2 = on('message', (data) => {
    console.log('接收到message：',data);
    

})
onMounted(() => {
    getAllProviders()
})


</script>

<style scoped>

</style>