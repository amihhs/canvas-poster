<script setup lang='ts'>
const props = withDefaults(defineProps<{
  to?: string
  text?: string
}>(), {})
</script>

<template>
  <a
    :href="props.to" target="_blank" rel="noopener noreferrer"
    class="inline-block text-center bg-slate-2 text-gray-500 rounded-full w-3.5 h-3.5 flex items-center justify-center"
  >
    <i class="i-ion:information-outline" />
  </a>
</template>

<style lang='scss' scoped>

</style>
