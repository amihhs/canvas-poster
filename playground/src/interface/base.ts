import type { PosterConfig } from '@amihhs/canvas-poster'

export type JsonString = string

export type RightState = 'base' | 'list' | 'add' | 'edit' | 'output'
export type BaseSetting = Required<Omit<PosterConfig, 'cors' | 'proxy'>>
