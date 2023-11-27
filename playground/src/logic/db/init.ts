import type { Table } from 'dexie'
import Dexie from 'dexie'
import type { PosterDB, PosterJsonDB, PosterSourceDB } from '@/interface'

export class PosterClassedDexie extends Dexie {
  posters!: Table<PosterDB>
  postersJson!: Table<PosterJsonDB>
  sources!: Table<PosterSourceDB>

  constructor() {
    super('PosterDatabase')
    this.version(1).stores({
      posters: '++id, name, dataFormat, createdAt, updatedAt', // Primary key and indexed props
      postersJson: '++id, posterId, base, json, createdAt, updatedAt', // Primary key and indexed props
      sources: '++id, type, blob',
    })
  }
}

export const db = new PosterClassedDexie()
