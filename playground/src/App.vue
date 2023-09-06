<script setup lang="ts">
import type { RightState } from '@/interface'

const { canvasRef, baseSetting, json } = handler()

const style = computed(() => ({
  width: `${baseSetting.value.canvasWidth}px`,
  height: `${baseSetting.value.canvasHeight}px`,
}))

const rightState = ref<RightState>('add')
function changeRightState(state: RightState) {
  rightState.value = state
}
provide(CANVAS_EL_KEY, canvasRef)
provide(BASE_SETTING_KEY, baseSetting)
provide(CONTENT_JSON_KEY, json)
</script>

<template>
  <div class=" bg-gray-2 p-3">
    <div class="fixed left-3 top-3 w-25% flex-shrink-0 bg-white h-95vh overflow-auto p-3 rounded-md select-none">
      <h1 class="font-bold text-4.5 border-(b-1 gray-2) pb-3">
        资源
      </h1>
    </div>
    <div class="pt-5 grid place-content-center">
      <canvas ref="canvasRef" class="origin-top-center" :style="style" />
    </div>
    <div class="fixed right-3 top-3 w-25% flex-shrink-0 bg-white h-95vh overflow-auto p-3 rounded-md select-none ">
      <div class="grid grid-cols-5 justify-items-center text-5 pb-1 mb-3 border-(b-3 slate-2)">
        <div class="cursor-pointer " title="基础设置" @click="changeRightState('base')">
          <i class="i-carbon:settings" />
        </div>
        <div class="cursor-pointer" title="全部内容" @click="changeRightState('content')">
          <i class="i-fluent:content-view-24-regular" />
        </div>
        <div class="cursor-pointer" title="添加" @click="changeRightState('add')">
          <i class="i-carbon:add" />
        </div>
      </div>
      <div v-if="rightState === 'base'">
        <h1 class="font-bold text-4">
          基础设置
        </h1>
        <SettingBase />
      </div>
      <div v-else-if="rightState === 'content'" class="flex flex-col h-[calc(95vh-4.75rem)]">
        <h1 class="font-bold text-4 flex-shrink-0">
          全部内容
        </h1>
        <SettingContents class="flex-grow" />
      </div>
      <div v-else-if="rightState === 'add'">
        <h1 class="font-bold text-4">
          添加内容
        </h1>
        <SettingAdd />
      </div>
      <div v-else-if="rightState === 'edit'">
        <h1 class="font-bold text-4">
          内容编辑
        </h1>
        <SettingEdit />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
html,body,#app {
  --uno: bg-gray-2;
}
</style>
