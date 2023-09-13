import { v4 as uuidv4 } from 'uuid'
import type {
  PosterJson,
} from '@amihhs/canvas-poster'
import type { DrawJson } from '@/interface'

export function useControlJson() {
  function deleteJson(index: number, _confirm = false) {
    // if (_confirm && !window.confirm('确定删除吗？')) // eslint-disable-line no-alert
    //   return
    POSTER_JSON.value.splice(index, 1)
  }

  function changeJson<KEY extends keyof DrawJson>(index: number, key: KEY, data: DrawJson[KEY]): DrawJson {
    POSTER_JSON.value[index][key] = data

    return POSTER_JSON.value[index]
  }

  function updateJson(index: number, data: DrawJson): DrawJson {
    POSTER_JSON.value.splice(index, 1, data)
    return data
  }

  function addJson(data: PosterJson, index?: number): DrawJson {
    const id = uuidv4()
    const item = { ...data, id }
    if (index === undefined || POSTER_JSON.value.length === 0)
      POSTER_JSON.value.push(item)
    else
      POSTER_JSON.value.splice(index ?? POSTER_JSON.value.length, 0, item)

    return item
  }

  return {
    addJson,
    changeJson,
    updateJson,
    deleteJson,
  }
}
