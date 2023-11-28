<script setup lang='ts'>
const modelValue = defineModel<boolean>({
  default: false,
})
</script>

<template>
  <div class="switch" @click="modelValue = !modelValue">
    <input v-model="modelValue" type="checkbox">
    <span class="slider round" />
  </div>
</template>

<style lang='scss' scoped>
.switch {
  --uno: relative inline-block w-15 h-7;
}

/* Hide default HTML checkbox */
.switch input {
  --uno: opacity-0 w-0  h-0;
}

/* The slider */
.slider {
  --uno: absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-slate-3 transition-all;
}

.slider:before {
  --uno: absolute content-empty h-6 w-6 left-0.5 bottom-0.5 bg-white transition-all;
}

input:checked + .slider {
  --uno: bg-teal-6;
}

input:checked + .slider:before {
  --uno: translate-x-8;
}

/* Rounded sliders */
.slider.round {
  --uno: rounded-full;
}

.slider.round:before {
  --uno: rounded-full;
}
</style>
