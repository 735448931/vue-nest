<template>
    <div>

    </div>
</template>

<script setup lang="ts">
import { getAllProvidersApi } from '@/api/langchain';
import { onMounted } from 'vue';


const getAllProviders = async () => {
    const { data } = await getAllProvidersApi()
}

onMounted(() => {
    getAllProviders()
})


</script>

<style scoped>

</style>