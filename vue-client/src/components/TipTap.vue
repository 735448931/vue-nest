<template>
    <EditorContent :editor="editor" />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const modelValue = defineModel<string>({ default: '' })

const editor = useEditor({
    content: modelValue.value,
    extensions: [StarterKit],
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

// 暴露 editor 给父组件
defineExpose({
    editor
})
</script>

<style scoped>
:deep(.ProseMirror:focus) {
    outline: none;
    border: none;
}
</style>