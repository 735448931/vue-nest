<template>
    <el-upload :auto-upload="false" :on-change="handleImageChange" drag>
        单张上传
    </el-upload>

    <el-upload :auto-upload="false" :on-change="handleSharding" drag>
        分片上传
    </el-upload>

    <el-upload :auto-upload="false" :on-change="handleAliOss" drag>
        上传到阿里云
    </el-upload>
</template>

<script setup lang="ts">
import { uploadImageApi, uploadChunkApi, mergeChunkApi, uploadAliOssApi } from '@/api/upload'
import type { UploadFile } from 'element-plus'



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



</script>