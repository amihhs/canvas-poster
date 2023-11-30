<script setup lang='ts'>
import type { FontConfig } from '@amihhs/canvas-poster'

const modelValue = defineModel<FontConfig>({
  default: () => (Object.assign({}, baseSettingDefault.defaultFont)),
})
const { t } = useI18n()
</script>

<template>
  <div class="p-3 border-(b-1 slate-1)">
    <div class="mb-2 font-bold">
      <slot>{{ t('setting.font') }}</slot>
    </div>
    <div v-for="key in (['fontSize', 'lineHeight', 'letterSpacing'] as const)" :key="key" class="form-item">
      <span class="text-3.5">{{ t(`setting.${key}`) }}</span>
      <input v-model.number="modelValue[key]" type="number" class="input">
    </div>
    <div class="form-item">
      <span class="text-3.5">{{ t(`setting.fontWeight`) }}</span>
      <select v-model="modelValue.fontWeight" class="input">
        <option v-for="v in ['normal', 'bold', 'bolder', 'lighter']" :key="v" :value="v">
          {{ v }}
        </option>
        <option v-for="v in 9" :key="v" :value="v * 100">
          {{ v * 100 }}
        </option>
      </select>
    </div>
    <div class="form-item">
      <span class="text-3.5 flex-shrink-0">{{ t('setting.fontStyle') }}</span>
      <div class="flex-wrap flex w-53">
        <button
          v-for="v in (['normal', 'italic', 'oblique'] as const)" :key="v"
          class="px-2 py-1 mr-1 mb-1 rounded-md text-3 border-(1 slate-2) "
          :class="[modelValue.fontStyle === v ? 'bg-teal-6 text-white' : '']"
          @click="modelValue.fontStyle = v"
        >
          {{ v }}
        </button>
      </div>
    </div>
    <div class="form-item">
      <span class="text-3.5">{{ t('setting.fontFamily') }}</span>
      <input v-model="modelValue.fontFamily" type="text" class="input">
    </div>
  </div>
</template>

<style lang='scss' scoped>

</style>
