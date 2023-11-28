<script setup lang='ts'>
import type { BaseSetting } from '@/interface'

const { t } = useI18n()

const baseSetting = inject<Ref<BaseSetting>>(BASE_SETTING_KEY, ref(baseSettingDefault))
</script>

<template>
  <h1 class="font-bold text-4.5">
    {{ t('setting.base') }}
  </h1>
  <template v-if="baseSetting">
    <div v-for="key in (['width', 'height', 'dpi'] as const)" :key="key" class="form-item">
      <span class="text-3.5">{{ t(`setting.${key}`) }}</span>
      <input v-model.number="baseSetting[key]" type="text" class="input">
    </div>
    <div class="form-item">
      <span class="text-3.5">{{ t('setting.defaultColor') }}</span>
      <input v-model="baseSetting.defaultColor" type="color" class="w-20 h-8">
    </div>
    <div class="border-(b-1 slate-1) p-3 pr-0">
      <div class="text-4 font-bold mb-2">
        {{ t('setting.defaultFont') }}
      </div>
      <div v-for="key in (['fontSize', 'lineHeight', 'fontWeight'] as const)" :key="key" class="form-item">
        <span class="text-3.5">{{ t(`setting.${key}`) }}</span>
        <input v-model="baseSetting.defaultFont[key]" type="text" class="input">
      </div>
      <div class="form-item">
        <span class="text-3.5 flex-shrink-0">{{ t('setting.fontStyle') }}</span>
        <div class="flex-wrap flex w-53">
          <button
            v-for="v in (['normal', 'italic', 'oblique'] as const)" :key="v"
            class="px-2 py-1 mr-1 mb-1 rounded-md text-3 border-(1 slate-2) "
            :class="[baseSetting.defaultFont.fontStyle === v ? 'bg-teal-6 text-white' : '']"
            @click="baseSetting.defaultFont.fontStyle = v"
          >
            {{ v }}
          </button>
        </div>
      </div>
      <div class="form-item">
        <span class="text-3.5">{{ t('setting.fontFamily') }}</span>
        <input v-model="baseSetting.defaultFont.fontFamily" type="text" class="input">
      </div>
    </div>
  </template>
</template>

<style lang="scss" scoped>

</style>
