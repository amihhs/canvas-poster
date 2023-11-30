<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const { t } = useI18n()
function addDash() {
  if (!CURRENT_CHANGE_JSON.value || CURRENT_CHANGE_JSON.value.type !== PosterType.line)
    return

  if (!CURRENT_CHANGE_JSON.value.lineDash)
    CURRENT_CHANGE_JSON.value.lineDash = []

  CURRENT_CHANGE_JSON.value.lineDash.push(0)
}
function removeDash(index: number) {
  if (!CURRENT_CHANGE_JSON.value || CURRENT_CHANGE_JSON.value.type !== PosterType.line)
    return

  CURRENT_CHANGE_JSON.value.lineDash?.splice(index, 1)
}
function addPath(index = -1) {
  if (!CURRENT_CHANGE_JSON.value || CURRENT_CHANGE_JSON.value.type !== PosterType.line)
    return

  if (!CURRENT_CHANGE_JSON.value.paths)
    CURRENT_CHANGE_JSON.value.paths = []

  CURRENT_CHANGE_JSON.value.paths.splice(index + 1, 0, [0, 0])
}
function removePath(index: number) {
  if (!CURRENT_CHANGE_JSON.value || CURRENT_CHANGE_JSON.value.type !== PosterType.line)
    return

  CURRENT_CHANGE_JSON.value.paths?.splice(index, 1)
}

function updatePath(index: number, value: boolean) {
  if (!CURRENT_CHANGE_JSON.value || CURRENT_CHANGE_JSON.value.type !== PosterType.line)
    return
  CURRENT_CHANGE_JSON.value.paths[index][2] = value ? 'moveTo' : undefined
}
</script>

<template>
  <div v-if="CURRENT_CHANGE_JSON && CURRENT_CHANGE_JSON.type === PosterType.line">
    <div class="p-3 border-(b-1 slate-1)">
      <div class="mb-2 font-bold">
        {{ t('setting.color') }}
      </div>
      <UtilsColor v-model="CURRENT_CHANGE_JSON.color" />
    </div>
    <div class="form-item">
      <label class="label"> {{ t('setting.lineWidth') }}</label>
      <input v-model.number="CURRENT_CHANGE_JSON.lineWidth" class="input">
    </div>
    <div class="p-3 border-(b-1 slate-1)">
      <div class="mb-2 font-bold flex items-center gap-2">
        {{ t('setting.lineDash') }}
        <UtilsTips
          to="https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash"
          :text="t('tips.lineDash')"
        />
      </div>
      <template v-if="CURRENT_CHANGE_JSON.lineDash">
        <div class="grid grid-cols-3 gap-3 flex-wrap">
          <div v-for="_, i in CURRENT_CHANGE_JSON.lineDash" :key="i" flex items-center>
            <input
              v-model.number="CURRENT_CHANGE_JSON.lineDash[i]"
              class="input w-18"
            >
            <span class="p-1 text-0 bg-red-5 rounded-md flex-shrink-0 cursor-pointer text-white ml-1" @click="removeDash(i)">
              <i class="i-material-symbols:close text-2.75 " />
            </span>
          </div>
        </div>
        <span class="mt-3 py-1 px-sm bg-teal-5 rounded-md cursor-pointer block text-center text-white" @click="addDash()">
          <i class="i-material-symbols:add text-3.5" />
        </span>
      </template>
    </div>
    <div class="p-3 border-(b-1 slate-1)">
      <div class="mb-2 font-bold flex items-center gap-2">
        {{ t('setting.paths') }}
      </div>
      <template v-if="CURRENT_CHANGE_JSON.paths">
        <div
          v-for="_, i in CURRENT_CHANGE_JSON.paths" :key="i"
          class="flex items-center gap-3"
        >
          <input v-model.number="CURRENT_CHANGE_JSON.paths[i][0]" title="x" class="input w-18">
          <input v-model.number="CURRENT_CHANGE_JSON.paths[i][1]" title="y" class="input w-18">
          <Switch
            flex-shrink-0
            title="moveTo"
            :model-value="!!CURRENT_CHANGE_JSON.paths[i][2]"
            @update:model-value="(value) => updatePath(i, value)"
          />
          <div class="flex items-center gap-1 text-white flex-shrink-0">
            <span class="p-1 text-0 bg-teal-5 rounded-md flex-shrink-0 cursor-pointer" @click="addPath(i)">
              <i class="i-material-symbols:add text-3" />
            </span>
            <span class="p-1 text-0 bg-red-5 rounded-md flex-shrink-0 cursor-pointer" @click="removePath(i)">
              <i class="i-material-symbols:close text-2.75" />
            </span>
          </div>
        </div>
        <span
          class="mt-3 py-1 px-sm bg-teal-5 rounded-md cursor-pointer block text-center text-white"
          @click="addPath()"
        >
          <i class="i-material-symbols:add text-3.5" />
        </span>
      </template>
    </div>
  </div>
</template>

<style lang='scss' scoped>

</style>
