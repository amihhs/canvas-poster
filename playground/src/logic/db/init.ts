import type { Table } from 'dexie'
import Dexie from 'dexie'

export type JsonString = string
export interface Poster {
  id?: number
  name: string
  dataFormat: JsonString
  poster: string
  createdAt: number
  updatedAt: number
}
export interface PosterSource {
  id: number
  type: 'image' | 'file'
  blob: Blob
}
export class PosterClassedDexie extends Dexie {
  posters!: Table<Poster>
  sources!: Table<PosterSource>

  constructor() {
    super('PosterDatabase')
    this.version(1).stores({
      posters: '++id, name, dataFormat, createdAt, updatedAt', // Primary key and indexed props
      sources: '++id, type, blob',
    })
  }
}

export const db = new PosterClassedDexie()
