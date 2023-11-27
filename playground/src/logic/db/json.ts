import { db } from './init'
import type { PosterJsonDB } from '@/interface'

export function getPosterJson(posterId: number) {
  return db.postersJson.where({ posterId }).first()
}

export function addPosterJson(data: Omit<PosterJsonDB, 'id' | 'createdAt' | 'updatedAt'>) {
  return db.postersJson.add({
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}

export async function updatePosterJson(posterId: number, data: Partial<PosterJsonDB>) {
  const { id } = (await db.postersJson.where({ posterId }).first()) || {}
  if (id)
    return db.postersJson.update(id, { ...JSON.parse(JSON.stringify(data)), updatedAt: Date.now() })

  throw new Error('not search posterId json')
}
