<script setup lang="ts">
import type { RightState } from '@/interface'

const menuTabs = [
  {
    title: '基础设置',
    type: 'base',
    icon: 'i-carbon:settings',
  },
  {
    title: '全部内容',
    type: 'list',
    icon: 'i-material-symbols:list-alt-outline-rounded',
  },
  {
    title: '详细参数',
    type: 'edit',
    icon: 'i-fluent:content-settings-24-regular',
  },
  {
    title: '添加',
    type: 'add',
    icon: 'i-carbon:add',
  },
] as const

const { canvasRef, baseSetting } = globalInitHandler()
provide(CANVAS_EL_KEY, canvasRef)
provide(BASE_SETTING_KEY, baseSetting)

const style = computed(() => ({
  width: `${baseSetting.value.canvasWidth}px`,
  height: `${baseSetting.value.canvasHeight}px`,
}))

const rightState = ref<RightState>('add')
function changeRightState(state: RightState) {
  rightState.value = state
}

watch(CURRENT_CHANGE_JSON, () => {
  if (unref(CURRENT_CHANGE_JSON))
    rightState.value = 'edit'
})
</script>

<template>
  <div class=" bg-gray-2 p-3">
    <!-- <div class="fixed left-3 top-3 w-25% flex-shrink-0 bg-white h-95vh overflow-auto p-3 rounded-md select-none">
      <h1 class="font-bold text-4.5 border-(b-1 gray-2) pb-3">
        资源
      </h1>
    </div> -->
    <div class="pt-5 grid place-content-center">
      <canvas ref="canvasRef" class="origin-top-center" :style="style" />
    </div>
    <div class="fixed right-3 top-3 w-25% flex-shrink-0 bg-white h-95vh overflow-auto p-3 rounded-md select-none ">
      <div class="grid grid-cols-5 gap-2 justify-items-center text-5 mb-3 border-(b-3 slate-2)">
        <div
          v-for="v in menuTabs" :key="v.type"
          class="cursor-pointer rounded-t-md w-full grid place-content-center py-2"
          :class="[v.type === rightState ? 'bg-teal-6 text-white' : 'bg-slate-2 ']"
          :title="v.title"
          @click="changeRightState(v.type)"
        >
          <i :class="v.icon" />
        </div>
      </div>
      <div v-if="rightState === 'base'">
        <h1 class="font-bold text-4">
          基础设置
        </h1>
        <SettingBase />
      </div>
      <div v-else-if="rightState === 'list'" class="flex flex-col h-[calc(95vh-4.75rem)]">
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
          详细参数
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
