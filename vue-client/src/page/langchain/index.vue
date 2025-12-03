<template>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="基础" name="first">
            <Tab1></Tab1>
        </el-tab-pane>
        <el-tab-pane label="Config" name="second">
            <Tab2></Tab2>
        </el-tab-pane>
    </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Tab1 from './components/Tab1.vue'
import Tab2 from './components/Tab2.vue'
import type { TabsPaneContext } from 'element-plus'

const activeName = ref('first')

const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
}
</script>

<style>

</style>
