<!-- eslint-disable no-console -->
<script setup lang='ts'>
import type { UnwrapNestedRefs } from 'vue'
import type { DrawJson } from '@/interface'

const json = inject<UnwrapNestedRefs<DrawJson[]>>(CONTENT_JSON_KEY, [])

const dropContainerEl = ref<HTMLElement | null>(null)
const currentDragEl = ref<HTMLElement | null>(null)
function changeJsonSort() {
  if (!dropContainerEl.value)
    return
  const childrenNodes = Array.from(dropContainerEl.value.children)
  const newIndex = childrenNodes.map((el) => {
    return Number(el.getAttribute('value') as unknown as string)
  })
  const newJson = newIndex.map(index => json[index])
  json.splice(0, json.length, ...newJson)
}
function getDragElement(el: HTMLElement): HTMLElement {
  if (el.parentElement === dropContainerEl.value)
    return el
  return getDragElement(el.parentElement as HTMLElement)
}
function dragStartHandler(event: DragEvent) {
  if (event.dataTransfer?.dropEffect)
    event.dataTransfer.dropEffect = 'move'

  currentDragEl.value = event.target as HTMLElement
  setTimeout(() => {
    currentDragEl.value?.classList.add('moving')
  }, 0)
}
function dragEnterHandler(e: DragEvent) {
  e.preventDefault()

  let el = e.target as HTMLElement
  if (el.parentElement !== dropContainerEl.value && el !== dropContainerEl.value)
    el = getDragElement(el)

  if (!currentDragEl.value || !dropContainerEl.value || el === currentDragEl.value || el === dropContainerEl.value)
    return

  const childrenNodes = Array.from(dropContainerEl.value.children)
  const currentIndex = childrenNodes.indexOf(currentDragEl.value) // 获取到拖动元素的下标
  const targetIndex = childrenNodes.indexOf(el) // 获取到目标元素的下标

  if (targetIndex === -1)
    return

  if (currentIndex < targetIndex)
    dropContainerEl.value.insertBefore(currentDragEl.value, el.nextElementSibling)
  else
    dropContainerEl.value.insertBefore(currentDragEl.value, el)
}
function dragEndHandler() {
  currentDragEl.value?.classList.remove('moving')
  currentDragEl.value = null
  changeJsonSort()
}
</script>

<template>
  <div ref="dropContainerEl" class="overflow-auto">
    <div
      v-for="value, index in json" :key="value.id"
      draggable="true"
      class="shadow-md rounded-md border-(1 slate-3) mt-3 p-3"
      :value="index"
      @dragstart="dragStartHandler"
      @dragend="dragEndHandler"
      @dragenter="dragEnterHandler"
    >
      <div class="flex items-center justify-between w-full">
        <span class="font-bold">类型：{{ value.type }}</span>
        <span class="flex-shrink-0 cursor-pointer text-slate">
          <i class="i-material-symbols:edit-road-outline-rounded mr-3 text-blue-5" />
          <i class="i-material-symbols:delete" />
        </span>
      </div>
      <div>{{ value }}</div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.moving {
  --uno:  opacity-20 border-(3 dashed slate-4);
}
</style>
