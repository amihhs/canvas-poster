import { v4 as uuidv4 } from 'uuid'
import { ColorType, PosterType, isCustomColor } from '@amihhs/canvas-poster'
import type { Color, PosterJson } from '@amihhs/canvas-poster'
import type { DrawJson } from '@/interface'

export function syncChangeColor<KEY extends typeof BASE_CONFIG_KEY[number]>(
  color: Color,
  item: DrawJson,
  key: KEY,
  data: number,
): Color | undefined {
  if (item.type === PosterType.line)
    return

  const d = Number(data)
  if (
    !color
    || Number.isNaN(d)
    || !isCustomColor(color)
    || [ColorType.pure, ColorType.pattern].includes(color.type)
  )
    return color

  switch (color.type) {
    case ColorType.lineGradient:{
      if (key === 'x') {
        const offset = d - item.x
        color.positions[0] = color.positions[0] + offset
        color.positions[2] = color.positions[2] + offset
      }
      else if (key === 'y') {
        const offset = d - item.y
        color.positions[1] = color.positions[1] + offset
        color.positions[3] = color.positions[3] + offset
      }
      else if (key === 'width') {
        color.positions[2] = color.positions[0] + d
      }
      else if (key === 'height') {
        color.positions[3] = color.positions[1] + d
      }

      return color
    }
    case ColorType.conicGradient:{
      if (key === 'x') {
        const offset = d - item.x
        color.positions[1] = color.positions[1] + offset
      }
      else if (key === 'y') {
        const offset = d - item.y
        color.positions[2] = color.positions[2] + offset
      }
      else if (key === 'width' || key === 'height') {
        const index = key === 'width' ? 1 : 2
        const offset = d - (item[key] as number)
        color.positions[index] = color.positions[index] + offset / 2
      }

      return color
    }
    case ColorType.radialGradient: {
      if (key === 'x') {
        const offset = d - item.x
        color.positions[0] = color.positions[0] + offset
        color.positions[3] = color.positions[3] + offset
      }
      else if (key === 'y') {
        const offset = d - item.y
        color.positions[1] = color.positions[1] + offset
        color.positions[4] = color.positions[4] + offset
      }
      else if (key === 'width' || key === 'height') {
        const index = key === 'width' ? [0, 3] : [2, 4]
        const offset = d - (item[key] as number)
        index.forEach((i) => {
          color.positions[i] = color.positions[i] + offset / 2
        })
      }
      return color
    }
    default:
      return color
  }
}

export function useControlJson(posterJson: Ref<DrawJson[]> = ref([])) {
  function deleteJson(index: number, _confirm = false) {
    // if (_confirm && !window.confirm('确定删除吗？')) // eslint-disable-line no-alert
    //   return
    posterJson.value.splice(index, 1)
  }

  function changeJson(index: number, key: string, data: any): DrawJson {
    // when change x or y ..., sync to change color
    const d = Number(data)
    if (isBaseConfigKey(key) && !Number.isNaN(d)) {
      const item = posterJson.value[index]
      if (item.type === PosterType.text) {
        item.color = syncChangeColor(item.color as Color, item, key, data)
        item.strokeColor = syncChangeColor(item.strokeColor as Color, item, key, data)
      }
      else if (item.type === PosterType.rect) {
        item.bgColor = syncChangeColor(item.bgColor as Color, item, key, data)
      }
      else if (item.type === PosterType.line) {
        item.color = syncChangeColor(item.color as Color, item, key, data)
      }
    }

    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    posterJson.value[index][key] = data

    return posterJson.value[index]
  }

  function updateJson(index: number, data: DrawJson): DrawJson {
    posterJson.value.splice(index, 1, data)
    return data
  }

  function addJson(data: PosterJson, index?: number): DrawJson {
    const id = uuidv4()
    const item = { ...data, id }
    if (index === undefined || posterJson.value.length === 0)
      posterJson.value.push(item)
    else
      posterJson.value.splice(index ?? posterJson.value.length, 0, item)

    return item
  }

  return {
    addJson,
    changeJson,
    updateJson,
    deleteJson,
  }
}
