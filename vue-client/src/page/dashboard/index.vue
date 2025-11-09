<template>
    <el-upload :auto-upload="false" :on-change="handleImageChange" drag>
        单张上传
    </el-upload>

    <el-upload :auto-upload="false" :on-change="onchange" drag>
        分片上传
    </el-upload>

    <el-upload :auto-upload="false" :on-change="onchange" drag>
        上传到阿里云
    </el-upload>
</template>

<script setup lang="ts">
import { uploadImageApi, uploadImagesApi } from '@/api/upload'
import axios from 'axios';
import type { UploadFile, UploadFiles } from 'element-plus'



// 单张上传
const handleImageChange = async (uploadFile: UploadFile) => {
    if (!uploadFile.raw) return
    const form = new FormData()
    form.append('image', uploadFile.raw)
    form.append('field', '传到后端body中的其他数据')
    await uploadImageApi(form)
}



const chunkSize = 2 * 1024;

const onchange = async (uploadFile:any) => {

    const file = uploadFile.raw;

    const chunks = [];
    let startPos = 0;
    while (startPos < file.size) {
        chunks.push(file.slice(startPos, startPos + chunkSize));
        startPos += chunkSize;
    }

    const tasks:any = [];
    chunks.map((chunk, index) => {
        const data = new FormData();
        data.set('name', file.name + '-' + index)
        data.append('files', chunk);
        tasks.push(axios.post('http://localhost:3000/api/upload/big-file', data))

    })

    await Promise.all(tasks)
    axios.get('http://localhost:3000/api/upload/merge?name=' + file.name)
}






</script>