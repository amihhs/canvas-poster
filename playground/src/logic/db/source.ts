import { db } from './init'
import type { PosterSourceDB } from '@/interface'

export async function sourceUrl(url: string) {
  const source = await getSource(url)
  if (!source || !source.blob)
    throw new Error('source not found')

  return blobToUrl(source.blob)
}

export function getSource(url: string) {
  return db.sources.get(url)
}

export function addSource(data: PosterSourceDB) {
  return db.sources.put(data)
}

export function updateSource(url: string, data: Partial<PosterSourceDB>) {
  return db.sources.update(url, data)
}

export function deleteSource(url: string) {
  return db.sources.delete(url)
}

export function getSources(options: { page: number, pageSize: number }) {
  const { page, pageSize } = options

  return db.sources
    .orderBy('url')
    .reverse()
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .toArray()
}
