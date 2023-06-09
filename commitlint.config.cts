import type { UserConfig } from '@commitlint/types'

// https://commitlint.js.org/#/reference-rules
const Configuration: UserConfig = {
  /*
   * Resolve and load @commitlint/config-conventional from node_modules.
   * Referenced packages must be installed
   */
  extends: ['@commitlint/config-conventional'],
  /*
   * Any rules defined here will override rules from @commitlint/config-conventional
   */
  rules: {
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      [
        'chore',
        'ci',
        'docs',
        'perf',
        'fix',
        'feat',
        'test',
        'build',
        'release',
        'revert',
        'refactor',
      ],
    ],
  },
}

export default Configuration
