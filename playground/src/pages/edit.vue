<script setup lang="ts">
const { t } = useI18n()
const {
  posterId,
  state,
  canvasRef,
  posterJson,
  baseSetting,
  initHandler,
} = posterDetailHandler()

initHandler()

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
        <EditSelected />
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
