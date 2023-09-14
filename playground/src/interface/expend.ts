import type { PosterJson } from '@amihhs/canvas-poster'

export type DrawJson = PosterJson & { id: string }

export type CanvasControlLocationJson = DrawJson & { sort: number }
