import type { Poster } from './init'
import { db } from './init'

export function getPosters() {
  return db.posters.where('id').above(0).toArray()
}

export function getPoster(id: number) {
  return db.posters.get(id)
}

export function addPoster(poster: Omit<Poster, 'id' | 'createdAt' | 'updatedAt'>) {
  return db.posters.add({ ...poster, createdAt: Date.now(), updatedAt: Date.now() }, ['id'])
}

export function updatePoster(id: number, poster: Partial<Omit<Poster, 'id' | 'createdAt' | 'updatedAt'>>) {
  return db.posters.update(id, { ...poster, updatedAt: Date.now() })
}

export function deletePoster(id: number) {
  return db.posters.delete(id)
}
