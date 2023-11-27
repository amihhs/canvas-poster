import type { PosterConfig } from '@amihhs/canvas-poster'
import type { DrawJson } from './expend'

export interface PosterDB {
  id?: number
  name: string
  dataFormat: Record<string, unknown>
  poster: number
  createdAt: number
  updatedAt: number
}
export interface PosterSourceDB {
  id?: number
  type: 'image'
  tags: string[]
  blob: Blob
}
export interface PosterJsonDB {
  id?: string
  posterId: number
  base: Omit<PosterConfig, 'proxy' | 'cors'>
  json: DrawJson[]
  createdAt: number
  updatedAt: number
}
