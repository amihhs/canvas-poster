<script setup lang="ts">

</script>

<template>
  <main class=" bg-gray-2 p-3 font-mono">
    <div class="fixed top-sm left-sm z-999 flex items-start gap-3">
      <RouterLink v-if="$route.name !== 'index'" to="/" class="bg-white rounded p-1 text-0 hover:(bg-teal-6 text-white)">
        <i i-carbon-home text-lg />
      </RouterLink>
      <UtilsI18n class="p-1" />
    </div>
    <RouterView />
  </main>
</template>

<style lang="scss">
html,body,#app {
  --uno: bg-gray-2;
}
</style>
