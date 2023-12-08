<script setup lang='ts'>
const { outputCode } = useOutputHandler()
</script>

<template>
  <div>
    <CodeMirror v-model="outputCode" language="javascript" />
  </div>
</template>

<style lang='scss' scoped>

</style>
