<template>
    <div class="message-item" :class="{ 'is-self': props.message.flow === 'out' }">
        <div class="avatar">
            <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"  />
        </div>
        <div class="message-content">
            <div class="message-bubble">
                {{ props.message.payload.text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    message:any
}

const props = defineProps<Props>()

</script>

<style scoped lang="scss">
.message-item {
    display: flex;
    margin-bottom: 20px;
    animation: slideIn 0.3s ease-out;

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 12px;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .message-content {
        display: flex;
        flex-direction: column;
        max-width: 60%;
    }

    .message-bubble {
        position: relative;
        background: white;
        padding: 10px 14px;
        border-radius: 8px;
        word-wrap: break-word;
        word-break: break-word;
        line-height: 1.5;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

        &::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 10px;
            width: 0;
            height: 0;
            border-right: 8px solid white;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
        }
    }

    &.is-self {
        flex-direction: row-reverse;

        .message-content {
            align-items: flex-end;
        }

        .message-info {
            flex-direction: row-reverse;
        }

        .message-bubble {
            background: #95ec69;

            &::before {
                display: none;
            }

            &::after {
                content: '';
                position: absolute;
                right: -8px;
                top: 10px;
                width: 0;
                height: 0;
                border-left: 8px solid #95ec69;
                border-top: 6px solid transparent;
                border-bottom: 6px solid transparent;
            }
        }

        .avatar {
            margin-left: 12px;
            margin-right: 0;
        }
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>