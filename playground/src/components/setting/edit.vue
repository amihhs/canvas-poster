<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'

const itemType = computed(() => {
  return CURRENT_CHANGE_JSON.value ? CURRENT_CHANGE_JSON.value.type : null
})

const components = {
  [PosterType.text]: defineAsyncComponent(() => import('@/components/element/text.vue')),
  [PosterType.image]: defineAsyncComponent(() => import('@/components/element/image.vue')),
  [PosterType.rect]: defineAsyncComponent(() => import('@/components/element/rect.vue')),
  [PosterType.line]: defineAsyncComponent(() => import('@/components/element/line.vue')),
}
</script>

<template>
  <h1 class="font-bold text-4">
    详细参数
  </h1>
  <div v-if="itemType">
    <component :is="components[itemType]" />
  </div>
  <div v-else>
    <div>请先选择一个内容</div>
  </div>
</template>
