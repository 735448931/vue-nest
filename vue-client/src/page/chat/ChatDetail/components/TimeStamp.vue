<template>
    <div class="time-stamp">
        {{ formatTime(time) }}
    </div>
</template>

<script setup lang="ts">
interface Props {
    // 消息时间
    time: string | number | Date
}

defineProps<Props>()

// 格式化时间 - 参考微信显示方式
const formatTime = (time: string | number | Date) => {
    const date = new Date(time)
    const now = new Date()
    
    // 判断是否是今天
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
        // 今天只显示时:分
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }
    
    // 判断是否是昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    if (isYesterday) {
        // 昨天显示 "昨天 时:分"
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }
    
    // 判断是否是今年
    const isThisYear = date.getFullYear() === now.getFullYear()
    if (isThisYear) {
        // 今年显示 "MM-DD HH:mm"
        return date.toLocaleString('zh-CN', { 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        }).replace(/\//g, '-')
    }
    
    // 更早显示 "YYYY-MM-DD HH:mm"
    return date.toLocaleString('zh-CN', { 
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).replace(/\//g, '-')
}
</script>

<style scoped lang="scss">
.time-stamp {
    text-align: center;
    font-size: 12px;
    color: #999;
    margin: 16px 0;
    padding: 4px 12px;
    display: inline-block;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    width: 100%;
    
    // 让时间戳居中显示
    display: flex;
    justify-content: center;
    align-items: center;
    
    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(0, 0, 0, 0.05);
        margin: 0 12px;
    }
}
</style>
