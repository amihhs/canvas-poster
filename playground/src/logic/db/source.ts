import { db } from './init'
import type { PosterSourceDB } from '@/interface'

export async function sourceUrl(id: number) {
  const source = await getSource(id)
  if (!source || !source.blob)
    throw new Error('source not found')

  return blobToUrl(source.blob)
}

export function getSource(id: number) {
  return db.sources.get(id)
}

export function addSource(data: PosterSourceDB) {
  return db.sources.add(data)
}

export function updateSource(id: number, data: Partial<PosterSourceDB>) {
  return db.sources.update(id, {
    ...data,
    updatedAt: Date.now(),
  })
}

export function deleteSource(id: number) {
  return db.sources.delete(id)
}

export function getSources(options: { page: number, pageSize: number }) {
  const { page, pageSize } = options

  return db.sources
    .orderBy('id')
    .reverse()
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .toArray()
}
