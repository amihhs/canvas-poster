<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'

const { t } = useI18n()
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
  <h1 class="font-bold text-lg">
    {{ t('edit.detail.title') }}
  </h1>
  <div v-if="itemType">
    <component :is="components[itemType]" />
  </div>
  <div v-else class="text-3.5 text-center mt-xl text-slate-4">
    <div>{{ t('edit.detail.emptyTips') }}</div>
  </div>
</template>
