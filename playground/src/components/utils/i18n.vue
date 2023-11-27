<script setup lang='ts'>
import { currentLang } from '@/modules/i18n'
import { langs, toggleLocales } from '@/composables/toggleLocales'
</script>

<template>
  <div class="group cursor-pointer">
    <i i-carbon-language />
    <ul class="hidden inline-block group-hover:block p-2 rounded bg-white text-3">
      <li
        v-for="value, key in langs" :key="key"
        class="hover:(bg-teal-6 text-white) px-2 py-1 rounded mb-1"
        :class="key === currentLang ? 'bg-teal-6 text-white' : 'bg-white'"
        @click="toggleLocales(key)"
      >
        {{ value }}
      </li>
    </ul>
  </div>
</template>
