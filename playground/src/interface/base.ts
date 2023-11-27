import type { PosterConfig } from '@amihhs/canvas-poster'

export type JsonString = string

export type RightState = 'base' | 'list' | 'add' | 'edit'
export type BaseSetting = Required<Omit<PosterConfig, 'cors' | 'proxy'>>
