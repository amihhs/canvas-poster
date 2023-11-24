import antfu from '@antfu/eslint-config'

export default await antfu({
  ignores: [
    '*.global.js',
    'build',
    'node_modules',
    'defaultConfig.ts',
    'dist',
  ],
  overrides: {
    vue: {
      'vue/dot-location': 'off',
    },
  },
})
