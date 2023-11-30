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
    <ElementFont v-model="baseSetting.defaultFont" pr-0>
      {{ t('setting.defaultFont') }}
    </ElementFont>
    <div class="form-item">
      <span class="text-3.5">Debug</span>
      <Switch v-model="baseSetting.debug" />
    </div>
  </template>
</template>

<style lang="scss" scoped>

</style>
