<script setup lang="ts">
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const { t } = useI18n()
const {
  posterId,
  state,
  canvasRef,
  posterJson,
  baseSetting,
} = posterDetailHandler()

provide(CANVAS_EL_KEY, canvasRef)
provide(BASE_SETTING_KEY, baseSetting)
provide(CONTENT_JSON_KEY, posterJson)

const style = computed(() => {
  if (!baseSetting.value)
    return {}

  return {
    width: `${baseSetting.value.width}px`,
    height: `${baseSetting.value.height}px`,
  }
})

const selectStyle = computed(() => {
  if (!CURRENT_CHANGE_JSON.value || !canvasRef.value)
    return {}

  const { offsetLeft, offsetTop } = canvasRef.value
  return {
    left: `${CURRENT_CHANGE_JSON.value.x + offsetLeft}px`,
    top: `${CURRENT_CHANGE_JSON.value.y + offsetTop}px`,
    width: `${CURRENT_CHANGE_JSON.value.width}px`,
    height: `${CURRENT_CHANGE_JSON.value.height}px`,
  }
})

onBeforeRouteLeave(() => {
  // update poster cover picture
  if (!canvasRef.value)
    return
  // callback get is not null
  const id = posterId.value
  canvasRef.value.toBlob(async (blob) => {
    if (!blob)
      return
    updatePosterPictureHandler(id, blob)
  }, 'image/png')
})
</script>

<template>
  <div>
    <div v-if="state === 'success'" class=" bg-gray-2 p-3 font-mono">
      <div id="container" class="pt-5 grid place-content-center relative">
        <canvas ref="canvasRef" class="origin-top-center" :style="style" />
        <div
          v-if="CURRENT_CHANGE_JSON"
          class="absolute bg-teal-6 bg-opacity-40 select-none pointer-events-none border-(1 teal-6)"
          :style="selectStyle"
        >
          <span class="w-2 h-2 inline-block bg-teal-6 top-0 left-0 absolute pointer-events-auto" @click="console.log('1')" />
          <span class="w-2 h-2 inline-block bg-teal-6 top-0 right-0 absolute" />
          <span class="w-2 h-2 inline-block bg-teal-6 bottom-0 left-0 absolute" />
          <span class="w-2 h-2 inline-block bg-teal-6 bottom-0 right-0 absolute" />
        </div>
      </div>
      <EditRight />
    </div>
    <div v-if="state === 'init'" class="flex justify-center items-center h-80">
      <i class="text-teal-6 i-carbon-loading" />
    </div>
    <div
      v-if="state === 'null'"
      class="flex justify-center items-center flex-col h-100 bg-white w-200 m-auto rounded shadow"
    >
      <i class="i-custom:undraw-notify?bg text-40" />
      <span mt-4xl font-bold text-xl>
        {{ t('first-create') }}!!!
        <RouterLink class="text-teal-6 hover:underline-(~ 2 dashed)" to="/">>>></RouterLink>
      </span>
    </div>
  </div>
</template>

<style lang="scss">
html,body,#app {
  --uno: bg-gray-2;
}
</style>
