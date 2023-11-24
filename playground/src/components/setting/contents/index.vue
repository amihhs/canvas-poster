<!-- eslint-disable no-console -->
<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { useContentDrag } from './hooks'

const components = {
  [PosterType.image]: defineAsyncComponent(() => import('@/components/element/imageShow.vue')),
  [PosterType.text]: defineAsyncComponent(() => import('@/components/element/textShow.vue')),
  [PosterType.rect]: defineAsyncComponent(() => import('@/components/element/rectShow.vue')),
  [PosterType.line]: defineAsyncComponent(() => import('@/components/element/lineShow.vue')),
}

const {
  dropContainerEl,
  json,

  dragStartHandler,
  dragEnterHandler,
  dragEndHandler,
} = useContentDrag()

const { deleteJson } = useControlJson()
const { showChangeJson } = useCurrentChangeJson()
</script>

<template>
  <div ref="dropContainerEl" class="overflow-auto">
    <div
      v-for="value, index in json" :key="value.id"
      draggable="true"
      class="shadow-md rounded-md border-(1 slate-3) mt-3 px-sm pt-2xl pb-lg relative overflow-hidden"
      :value="index"
      @dragstart="dragStartHandler"
      @dragend="dragEndHandler"
      @dragenter="dragEnterHandler"
    >
      <span class="bg-teal-7 text-white text-3 font-bold absolute top-0 left-0 px-sm">{{ value.type }}</span>
      <span class="flex-shrink-0 cursor-pointer text-slate absolute top-0 right-0 p-2">
        <i class="i-material-symbols:edit-road-outline-rounded mr-3 text-blue-5" title="编辑" @click="showChangeJson(index)" />
        <i class="i-material-symbols:delete" title="移除" @click="deleteJson(index, true)" />
      </span>
      <component :is="components[value.type]" :value="(value as any)" />
      <div class="absolute text-2.5 text-slate-3 right-1 bottom-1">
        ID: {{ value.id }}
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.moving {
  --uno:  opacity-20 border-(3 dashed slate-4);
}
</style>
