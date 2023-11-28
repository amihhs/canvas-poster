<script setup lang='ts'>
import { currentLang } from '@/modules/i18n'
import { langs, toggleLocales } from '@/composables/toggleLocales'
</script>

<template>
  <div class="group cursor-pointer relative text-0">
    <i i-carbon-language text-lg />
    <ul class="hidden group-hover:block p-2 rounded bg-white text-3 shadow">
      <li
        v-for="value, key in langs" :key="key"
        class="hover:(bg-teal-6 text-white) px-2 py-1 rounded mb-0.5"
        :class="key === currentLang ? 'bg-teal-6 text-white' : 'bg-white'"
        @click="toggleLocales(key)"
      >
        {{ value }}
      </li>
    </ul>
  </div>
</template>
