<!-- eslint-disable ts/ban-ts-comment -->
<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const { t } = useI18n()

function updateEllipsis(value: boolean) {
  if (!CURRENT_CHANGE_JSON.value || CURRENT_CHANGE_JSON.value.type !== PosterType.text)
    return
  if (value)
    CURRENT_CHANGE_JSON.value.ellipsis = CURRENT_CHANGE_JSON.value.ellipsis || '...'
  else
    CURRENT_CHANGE_JSON.value.ellipsis = undefined
}

const selects = {
  textAlign: ['left', 'center', 'right', 'start', 'end'],
  textBaseline: ['top', 'middle', 'bottom', 'alphabetic', 'hanging', 'ideographic'],
  renderType: ['fill', 'stroke', 'fillAndStroke', 'strokeAndFill'],
}
</script>

<template>
  <div v-if="CURRENT_CHANGE_JSON && CURRENT_CHANGE_JSON.type === PosterType.text">
    <div class="form-item">
      <label class="label">Text</label>
      <input v-model="CURRENT_CHANGE_JSON.text" class="input">
    </div>
    <ElementBase />
    <div v-for="v, key in selects" :key="key" class="form-item">
      <label class="label">{{ t(`setting.${key}`) }}</label>
      <select v-model="CURRENT_CHANGE_JSON[key]" class="input">
        <option v-for="value, index in v" :key="value" :value="value" :selected="index === 0">
          {{ value }}
        </option>
      </select>
    </div>
    <ElementFont v-model="CURRENT_CHANGE_JSON" />
    <div class="form-item">
      <label class="label">Ellipsis</label>
      <div flex items-center gap-2 min-h-14>
        <input
          v-if="CURRENT_CHANGE_JSON.ellipsis"
          v-model="CURRENT_CHANGE_JSON.ellipsis"
          placeholder="default: ..."
          class="input flex-grow w-30"
        >
        <Switch flex-shrink-0 :model-value="Boolean(CURRENT_CHANGE_JSON.ellipsis)" @update:model-value="updateEllipsis" />
      </div>
    </div>
    <div class="p-3 border-(b-1 slate-1)">
      <div class="mb-2 font-bold">
        {{ t('setting.fontColor') }}
      </div>
      <UtilsColor v-model="CURRENT_CHANGE_JSON.color" />
    </div>
    <div
      v-if="CURRENT_CHANGE_JSON.renderType
        && ['fillAndStroke', 'strokeAndFill'].includes(CURRENT_CHANGE_JSON.renderType)"
      class="p-3 border-(b-1 slate-1)"
    >
      <div class="mb-2 font-bold">
        {{ t('setting.strokeColor') }}
      </div>
      <UtilsColor v-model="CURRENT_CHANGE_JSON.strokeColor" />
    </div>
    <ElementShadow />
  </div>
</template>

<style lang='scss' scoped>

</style>
