<template>
    <div>
        <!-- <img :src="src" alt=""> -->
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';

const src = ref('')


// function queryStatus(id) {
//     axios.get('http://localhost:3000//api/qrcode/check?id=' + id).then(res => {
//         const status = res.data.status;

//         let content = '';
//         switch (status) {
//             case 'noscan': content = '未扫码'; break;
//             case 'scan-wait-confirm': content = '已扫码，等待确认'; break;
//             case 'scan-confirm': content = '已确认'; break;
//             case 'scan-cancel': content = '已取消'; break;
//         }
//         document.getElementById('info').textContent = content;

//         if (status === 'noscan' || status === 'scan-wait-confirm') {
//             setTimeout(() => queryStatus(id), 1000);
//         }
//     })
// }


// onMounted(async () => {
//     const res = await axios.get('http://localhost:3000/api/qrcode/generate')
//     src.value = res.data.img
// })
</script>

<style scoped lang="scss">

</style>