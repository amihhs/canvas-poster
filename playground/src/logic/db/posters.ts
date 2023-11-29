import { db } from './init'
import type { PosterDB } from '@/interface'

export async function getPosters() {
  const posters = await db.posters.where('id').above(0).toArray()
  const sourceUrls = posters.map(item => item.poster)
  const sources = await db.sources.where('url').anyOf(sourceUrls).toArray()
  return posters.map((item) => {
    const source = sources.find(source => source.url === item.poster)
    return {
      ...item,
      poster: source?.blob ? URL.createObjectURL(source.blob) : '',
    }
  })
}

export function getPoster(id: number) {
  return db.posters.get(id)
}

export function addPoster(poster: Omit<PosterDB, 'id' | 'createdAt' | 'updatedAt'>) {
  return db.posters.add({ ...poster, createdAt: Date.now(), updatedAt: Date.now() }, ['id'])
}

export function updatePoster(id: number, poster: Partial<Omit<PosterDB, 'id' | 'createdAt' | 'updatedAt'>>) {
  return db.posters.update(id, { ...poster, updatedAt: Date.now() })
}

export function deletePoster(id: number) {
  return db.posters.delete(id)
}
