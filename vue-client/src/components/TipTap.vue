<template>
    <EditorContent :editor="editor" />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useEditor, EditorContent, Extension } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

const modelValue = defineModel<string>({ default: '' })

const emit = defineEmits<{
    enter: []
}>()

// 创建自定义扩展来处理 Enter 键
const EnterHandler = Extension.create({
    name: 'enterHandler',
    addKeyboardShortcuts() {
        return {
            Enter: () => {
                emit('enter')
                return true // 返回 true 阻止默认行为
            }
        }
    }
})

// 自定义 Image 扩展，设置默认样式
const CustomImage = Image.extend({
    name:'custom-image',
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: 'max-width: 200px; max-height: 200px; border-radius: 8px;',
            },
            class: {
                default: 'image',
                rendered:false
            }
        }
    },
})

const editor = useEditor({
    content: modelValue.value,
    extensions: [StarterKit, EnterHandler, CustomImage],
    onUpdate: ({ editor }) => {
        modelValue.value = editor.getHTML()
    },
    autofocus: true,
    editable: true,
    injectCSS:false
})

watch(modelValue, (value) => {
    if (!editor.value) {
        return
    }

    const isSame = editor.value.getHTML() === value

    if (isSame) {
        return
    }

    editor.value.commands.setContent(value)
})

// 插入图片方法
const insertImage = (src: string) => {
    if (editor.value) {
        editor.value.chain().focus().setImage({ src }).run()
    }
}

// 暴露 editor 和 insertImage 给父组件
defineExpose({
    editor,
    insertImage
})
</script>

<style scoped>
:deep(.ProseMirror:focus) {
    outline: none;
    border: none;
}
</style>