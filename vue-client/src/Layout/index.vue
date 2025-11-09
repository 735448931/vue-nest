<template>
        <div class="layout">
            <div class="layout-header">
               <Header></Header>
            </div>

            <div class="layout-body">

                <div class="layout-sidebar">
                    <Sidebar></Sidebar>
                </div>

                <div class="layout-content">
                    <Content></Content>
                </div>
                
            </div>

            <div class="layout-footer">
                <Footer></Footer>
            </div>
        </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import Footer from './components/Footer.vue';
import Content from './components/Content.vue';
</script>

<style scoped>
.layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.layout-header {
    height: 64px;
    padding: 0 16px;
    box-sizing: border-box;
    border-bottom: 1px solid #eaeaea;
    background: #fff;
}

.layout-body {
    flex: 1 1 auto;
    display: flex;
    min-height: 0;
}

.layout-sidebar {
    width: 240px;
    border-right: 1px solid #eaeaea;
    padding: 16px;
    overflow: auto;
    background: #fafafa;
}

.layout-content {
    flex: 1 1 auto;
    padding: 16px;
    overflow: auto;
    min-height: 0;
}


.layout-footer {
    height: 40px;
    padding: 0 16px;
    border-top: 1px solid #eaeaea;
    background: #fff;
}
</style>