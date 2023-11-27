<script setup lang='ts'>
import { onClickOutside } from '@vueuse/core'
import { addPoster, getPoster, updatePoster } from '@/logic/db'

const props = withDefaults(defineProps<{
  id?: number
}>(), {})

const router = useRouter()
const { t } = useI18n()
const modal = ref(false)
const modalRef = ref(null)
onClickOutside(modalRef, () => {
  modal.value = false
})

const errorMessage = ref('')
const formData = ref({
  name: '',
  data: '{\n  "title": "Hello World"\n}',
})

watch(() => props.id, async () => {
  if (!props.id)
    return
  const poster = await getPoster(props.id)
  if (!poster)
    return
  formData.value.name = poster.name
  formData.value.data = JSON.stringify(poster.dataFormat, null, 2)
}, { immediate: true })
watch(formData, validate, { deep: true })
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

async function createPoster() {
  if (!validate())
    return

  try {
    const id = await addPoster({
      name: formData.value.name,
      dataFormat: JSON.parse(formData.value.data),
      poster: 0,
    })
    modal.value = false
    router.push(`/edit/${id}`)
  }
  catch (e: any) {
    console.error(e)
    errorMessage.value = e.message
  }
}
async function updateHandler() {
  if (!props.id || !validate())
    return

  try {
    await updatePoster(props.id, {
      name: formData.value.name,
      dataFormat: JSON.parse(formData.value.data),
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
        {{ t('button.create') }}
      </button>
    </slot>
  </div>
  <teleport to="body">
    <div v-if="modal" class="z-99 bg-black bg-opacity-30 fixed inset-0" />
    <div
      v-if="modal"
      ref="modalRef"
      class="fixed left-1/2 top-1/2 -translate-1/2 w-180 h-130 p-3 bg-white flex flex-col shadow-lg rounded z-100"
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
        <code-mirror v-model="formData.data" />
        <p v-if="errorMessage" class="text-red-6 text-sm p-2 bg-red-2 max-h-20">
          {{ errorMessage }}
        </p>
        <div class="flex justify-end mt-sm absolute bottom-0 w-full">
          <button class="px-sm py-1 rounded bg-slate-6 text-white font-bold mr-sm" @click="modal = false">
            {{ t('button.cancel') }}
          </button>
          <button v-if="props.id" class="px-sm py-1 rounded bg-teal-6 text-white font-bold" @click="updateHandler">
            {{ t('button.update') }}
          </button>
          <button v-else class="px-sm py-1 rounded bg-teal-6 text-white font-bold" @click="createPoster">
            {{ t('button.create') }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>
