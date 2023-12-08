<script setup lang='ts'>
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { javascript } from '@codemirror/lang-javascript'
import beautify from 'js-beautify'

const props = withDefaults(defineProps<{
  language?: 'json' | 'javascript'
  languageConfig?: Record<string, any>
  disabled?: boolean
}>(), {
  language: 'json',
  disabled: false,
})

const LANGUAGE_PARSE = {
  json: jsonParseLinter(),
  javascript: null,
}
const LANGUAGE_EXT = computed(() => {
  switch (props.language) {
    case 'json':
      return [json()]
    case 'javascript':
      return [javascript(props.languageConfig)]
  }
})

const modelValue = defineModel<string>()
const errorMessage = ref<string>('')
const editorRef = ref<HTMLDivElement | null>(null)
const editor = shallowRef<EditorView | null>(null)

const theme = computed(() => {
  return {
    '&': { height: '17rem' },
    '.cm-scroller': { overflow: 'auto' },
    '.cm-content': { height: 'auto' },
    '.cm-line': { 'font-family': 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace' },
  }
})

function createEditorViewTheme(...args: Parameters<typeof EditorView.theme>) {
  return EditorView.theme(...args)
}
function createEditorView() {
  const languageExt = LANGUAGE_EXT.value
  const config = {
    doc: modelValue.value,
    extensions: [
      basicSetup,
      createEditorViewTheme(theme.value),
      updateListener(),
      ...languageExt,
    ],
  }
  if (props.disabled)
    config.extensions.push(EditorState.readOnly.of(true))

  const editor = new EditorView(config)
  return editor
}

function updateListener() {
  return EditorView.updateListener.of(() => {
    const content = getContent()
    if (!errorMessage.value && modelValue.value !== content && content !== undefined)
      modelValue.value = getContent()
  })
}
function getContent() {
  if (!editor.value)
    return

  const parse = LANGUAGE_PARSE[props.language]
  if (parse && typeof parse === 'function') {
    const e = parse(editor.value)
    if (e.length) {
      errorMessage.value = e.map(e => e.message).join('\n')
      return
    }
  }

  errorMessage.value = ''

  try {
    return editor.value.state.doc.toString()
  }
  catch (e: any) {
    errorMessage.value = e.message
    throw e
  }
}

function _format(content?: string) {
  if (!editor.value)
    return

  content = content || getContent() || ''

  const js = beautify.js(content, {
    indent_size: 2,
    brace_style: 'collapse',
    break_chained_methods: false,
  })
  editor.value.dispatch({
    changes: {
      from: 0,
      to: editor.value.state.doc.length,
      insert: js,
    },
  })
}

watch(editorRef, () => {
  if (!editorRef.value)
    return
  if (!editor.value)
    editor.value = createEditorView()

  editorRef.value.appendChild(editor.value.dom)
  _format()
}, { immediate: true })

watch(modelValue, (v) => {
  if (v === getContent() || !editor.value)
    return

  _format(v)
}, { immediate: true })
</script>

<template>
  <div ref="editorRef" class="relative">
    <p v-if="errorMessage" class="text-red-6 text-sm p-2 absolute bottom-0 left-0 right-0 z-100 bg-red-2 max-h-20">
      {{ errorMessage }}
    </p>
  </div>
  <button @click="_format()">
    Format
  </button>
</template>
