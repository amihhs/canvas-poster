<!-- eslint-disable no-console -->
<script setup lang='ts'>
import { useContentDrag } from './hooks'

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
      class="shadow-md rounded-md border-(1 slate-3) mt-3 p-3"
      :value="index"
      @dragstart="dragStartHandler"
      @dragend="dragEndHandler"
      @dragenter="dragEnterHandler"
    >
      <div class="flex items-center justify-between w-full">
        <span class="font-bold">类型：{{ value.type }}</span>
        <span class="flex-shrink-0 cursor-pointer text-slate">
          <i class="i-material-symbols:edit-road-outline-rounded mr-3 text-blue-5" @click="showChangeJson(index)" />
          <i class="i-material-symbols:delete" @click="deleteJson(index, true)" />
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
