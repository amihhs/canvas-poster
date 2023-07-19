<script setup lang='ts'>
import type { PosterJson } from '@amihhs/canvas-poster'

const json = inject<PosterJson[]>(CONTENT_JSON_KEY, [])
</script>

<template>
  <div>
    <div v-for="v, i in json" :key="i" class="shadow-md rounded-md border-(1 slate-3) mt-3 p-3">
      <div class="flex items-center justify-between w-full">
        <span class="font-bold">类型：{{ v.type }}</span>
        <span class="flex-shrink-0 cursor-pointer text-slate">
          <i class="i-material-symbols:edit-road-outline-rounded mr-3 text-blue-5" />
          <i class="i-material-symbols:delete" />
        </span>
      </div>
      <div>{{ v }}</div>
    </div>
  </div>
</template>

<style lang='scss' scoped>

</style>
