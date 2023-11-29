<script setup lang='ts'>
import { useFileDialog } from '@vueuse/core'

const modelValue = defineModel({
  default: '',
})

const { open, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: false,
  reset: true,
})
onChange((files) => {
  new Promise<string>((resolve) => {
    if (!files?.length)
      return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = async function (e) {
      const result = e.target?.result
      if (!e.target || !result || !(result instanceof ArrayBuffer))
        throw new Error('FileReader is null or not ArrayBuffer')

      const blob = new Blob([new Uint8Array(result)], { type: file.type })
      const url = `image|${URL.createObjectURL(file)}`
      await addSource({ url, blob })

      resolve(url)
    }
    reader.readAsArrayBuffer(file)
  }).then((src) => {
    modelValue.value = src
  })
})
</script>

<template>
  <div>
    <input v-model="modelValue" class="input block w-full">
    <button type="button" class="mt-2 px-sm py-1 text-3 rounded bg-teal-6 text-white" @click="open()">
      Choose file
    </button>
  </div>
</template>

<style lang='scss' scoped>

</style>
