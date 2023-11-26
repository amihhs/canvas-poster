<script setup lang='ts'>
import { onClickOutside } from '@vueuse/core'
import { EditorView, basicSetup } from 'codemirror'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { addPoster, getPoster, updatePoster } from '@/logic/db'

const props = withDefaults(defineProps<{
  id?: number
}>(), {})

const modal = ref(false)
const modalRef = ref(null)
onClickOutside(modalRef, () => {
  modal.value = false
})

const formData = ref({
  name: '',
  data: '',
})

const editorRef = ref<HTMLDivElement | null>(null)
const theme = EditorView.theme({
  '&': { height: '17rem' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content': { height: 'auto' },
  '.cm-line': { 'font-family': 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace' },
})

const editor = new EditorView({
  doc: '{\n  "title": "Hello World"\n}',
  extensions: [
    basicSetup,
    theme,
    json(),
    EditorView.updateListener.of(() => {
      formData.value.data = getContent()
    }),
  ],
})

watch(editorRef, () => {
  if (!editorRef.value)
    return
  editorRef.value.appendChild(editor.dom)
})
watch(() => props.id, async () => {
  if (!props.id)
    return
  const poster = await getPoster(props.id)
  if (!poster)
    return
  formData.value.name = poster.name
  formData.value.data = JSON.parse(poster.dataFormat)
  editor.state.update({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: poster.dataFormat,
    },
  })
}, { immediate: true })

const errorMessage = ref('')

function validate() {
  if (!formData.value.name) {
    errorMessage.value = 'Name is required'
    return
  }
  if (!formData.value.data) {
    errorMessage.value = 'Data is required'
    return
  }
  errorMessage.value = ''
  return true
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
    return JSON.parse(editor.state.doc.toString())
  }
  catch (e: any) {
    errorMessage.value = e.message
  }
}

async function createPoster() {
  validate()
  try {
    const id = await addPoster({
      name: formData.value.name,
      dataFormat: JSON.stringify(formData.value.data),
      poster: '',
    })
    modal.value = false
    useRouter().push(`/edit/${id}`)
  }
  catch (e: any) {
    console.error(e)
    errorMessage.value = e.message
  }
}
async function updateHandler() {
  if (!props.id)
    return

  validate()

  try {
    await updatePoster(props.id, {
      name: formData.value.name,
      dataFormat: JSON.stringify(formData.value.data),
    })
    modal.value = false
  }
  catch (e: any) {
    console.error(e)
    errorMessage.value = e.message
  }
}
</script>

<template>
  <div @click="modal = true">
    <slot>
      <button class="px-sm py-1 rounded bg-teal-6 text-white font-bold">
        Create
      </button>
    </slot>
  </div>
  <teleport to="body">
    <div v-if="modal" class="z-99 bg-black bg-opacity-30 fixed inset-0" />
    <div
      v-if="modal"
      ref="modalRef"
      class="fixed left-1/2 top-1/2 -translate-1/2 w-180 h-120 p-3 bg-white flex flex-col shadow-lg rounded z-100"
    >
      <button class="absolute top-1 right-1 text-2xl i-carbon-close" title="Close" @click="modal = false" />
      <h1 class="text-2xl font-bold mb-2">
        {{ props.id ? 'Edit' : 'Create' }} Poster
      </h1>
      <div class="relative overflow-auto flex-grow h-0">
        <h2 class="text-(slate-3 text-md) font-bold mb-1">
          Poster Name
        </h2>
        <input v-model="formData.name" class="w-full border border-slate-3 rounded px-2 py-1">
        <h2 class="text-(slate-3 text-md) font-bold mb-1 mt-sm">
          Define Data Format
        </h2>
        <div ref="editorRef" class="relative">
          <p v-if="errorMessage" class="text-red-6 text-sm p-2 absolute bottom-0 left-0 right-0 z-100 bg-red-2 max-h-20">
            {{ errorMessage }}
          </p>
        </div>

        <div class="flex justify-end mt-sm absolute bottom-0 w-full">
          <button class="px-sm py-1 rounded bg-slate-6 text-white font-bold mr-sm" @click="modal = false">
            Cancel
          </button>
          <button v-if="props.id" class="px-sm py-1 rounded bg-teal-6 text-white font-bold" @click="updateHandler">
            Update
          </button>
          <button v-else class="px-sm py-1 rounded bg-teal-6 text-white font-bold" @click="createPoster">
            Create
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>
