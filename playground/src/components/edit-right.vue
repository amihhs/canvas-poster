<script setup lang='ts'>
import type { RightState } from '@/interface'

const menuTabs = [
  {
    title: 'Base Setting',
    type: 'base',
    icon: 'i-carbon:settings',
  },
  {
    title: 'Contents',
    type: 'list',
    icon: 'i-material-symbols:list-alt-outline-rounded',
  },
  {
    title: 'content Details',
    type: 'edit',
    icon: 'i-fluent:content-settings-24-regular',
  },
  {
    title: 'Add Content',
    type: 'add',
    icon: 'i-carbon:add',
  },
] as const

const rightState = ref<RightState>('base')
function changeRightState(state: RightState) {
  rightState.value = state
}
watch(CURRENT_CHANGE_JSON, () => {
  if (unref(CURRENT_CHANGE_JSON))
    rightState.value = 'edit'
})
</script>

<template>
  <div class="fixed right-3 top-3 w-25% flex-shrink-0 bg-white h-95vh overflow-auto scrollbar p-3 rounded-md select-none">
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
    <SettingBase v-if="rightState === 'base'" />
    <SettingContents v-else-if="rightState === 'list'" class="h-[calc(95vh-4.75rem)]" />
    <SettingAdd v-else-if="rightState === 'add'" />
    <SettingEdit v-else-if="rightState === 'edit'" />
  </div>
</template>

<style lang='scss' scoped>

</style>
