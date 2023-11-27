<script setup lang="ts">

</script>

<template>
  <main class=" bg-gray-2 p-3 font-mono">
    <div class="fixed top-sm left-sm z-999">
      <UtilsI18n />
    </div>
    <RouterView />
  </main>
</template>

<style lang="scss">
html,body,#app {
  --uno: bg-gray-2;
}
</style>
