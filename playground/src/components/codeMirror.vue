<script setup lang='ts'>
import { EditorView, basicSetup } from 'codemirror'
import { json, jsonParseLinter } from '@codemirror/lang-json'

const modelValue = defineModel<string>()

const errorMessage = ref<string>('')
const editorRef = ref<HTMLDivElement | null>(null)

const theme = EditorView.theme({
  '&': { height: '17rem' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content': { height: 'auto' },
  '.cm-line': { 'font-family': 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace' },
})

const editor = new EditorView({
  doc: modelValue.value,
  extensions: [
    basicSetup,
    theme,
    json(),
    updateListener(),
  ],
})
function updateListener() {
  return EditorView.updateListener.of(() => {
    const content = getContent()
    if (!errorMessage.value && modelValue.value !== content && content !== undefined)
      modelValue.value = getContent()
  })
}
function getContent() {
  const parse = jsonParseLinter()
  const e = parse(editor)
  if (e.length) {
    errorMessage.value = e.map(e => e.message).join('\n')
    return
  }
  errorMessage.value = ''

  try {
    return editor.state.doc.toString()
  }
  catch (e: any) {
    errorMessage.value = e.message
    throw e
  }
}

watch(editorRef, () => {
  if (!editorRef.value)
    return
  editorRef.value.appendChild(editor.dom)
})

watch(modelValue, (v) => {
  if (v === getContent())
    return
  editor.state.update({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: v,
    },
  })
})
</script>

<template>
  <div ref="editorRef" class="relative">
    <p v-if="errorMessage" class="text-red-6 text-sm p-2 absolute bottom-0 left-0 right-0 z-100 bg-red-2 max-h-20">
      {{ errorMessage }}
    </p>
  </div>
</template>
