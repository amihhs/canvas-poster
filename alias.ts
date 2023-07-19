import { resolve } from 'node:path'

const r = (p: string) => resolve(__dirname, p)

export const alias: Record<string, string> = {
  '@amihhs/canvas-poster': r('./packages/core/src/'),
}
