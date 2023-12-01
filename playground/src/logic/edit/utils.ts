/* eslint-disable ts/ban-ts-comment */
import type { PosterLine } from '@amihhs/canvas-poster'
import { PosterType } from '@amihhs/canvas-poster'
import type { CanvasControlLocationJson, DrawJson } from '@/interface'
import { toBase64 } from '@/shared'

function isPointInLine(paths: PosterLine['paths'], x: number, y: number) {
  const { length } = paths
  let isPointInLine = false
  for (let i = 0; i < length - 1; i++) {
    const [x1, y1] = paths[i]
    const [x2, y2] = paths[i + 1]
    const slope = (y2 - y1) / (x2 - x1)
    const diffY = slope * x + y1 - slope * x1
    const offset = 5
    if (diffY + offset > y && diffY - offset < y) {
      isPointInLine = true
      break
    }
  }
  return isPointInLine
}

export const BASE_CONFIG_KEY = ['x', 'y', 'width', 'height'] as const
export function isBaseConfigKey(key: string): key is typeof BASE_CONFIG_KEY[number] {
  return BASE_CONFIG_KEY.includes(key as any)
}

export function isCanvasBgRect(data: CanvasControlLocationJson, canvas: HTMLCanvasElement) {
  return data.type === PosterType.rect
    && data.x === 0
    && data.y === 0
    && data.width === canvas?.clientWidth
    && data.height === canvas?.clientHeight
}

export function findCurrentHoveItemKey(
  DRAW_CONTEXT_MAP: Map<string, CanvasControlLocationJson>,
  x: number,
  y: number,
) {
  const items = []
  for (const [_, data] of unref(DRAW_CONTEXT_MAP)) {
    if (EXCLUDE_SELECT_ID.includes(data.id))
      continue

    if (
      data.type !== PosterType.line
      && x > data.x
      && x < data.x + data.width
      && y > data.y
      && y < data.y + data.height
    )
      items.push({ key: _, index: data.sort })

    else if (data.type === PosterType.line && isPointInLine(data.paths, x, y))
      items.push({ key: _, index: data.sort })
  }
  if (!items.length)
    return null
  return items.sort((a, b) => b.index - a.index)[0]
}

export function diff(oldJsonMap: Map<string, DrawJson>, newJson: DrawJson[]) {
  const diffJson: CanvasControlLocationJson[] = []
  const newJsonMap = new Map<string, CanvasControlLocationJson>()
  newJson.forEach((item, index) => {
    const data = { ...item, sort: index }
    newJsonMap.set(`${toBase64(JSON.stringify(data))}`, data)
  })

  for (const [key] of newJsonMap) {
    if (oldJsonMap.has(key))
      continue
    diffJson.push(newJsonMap.get(key)!)
  }

  return {
    diffJson,
    newJsonMap,
    removeJsonKeys: Array.from(oldJsonMap.keys()).filter(key => !newJsonMap.has(key)),
  }
}

// - $1 -> JSON[0] -> $1 + 2
// - p1 -> prev[current - 1]
// - n1 -> next[current + 1]
// - link code return value
// - config.key
export function parseInput(data: string | number) {
  if (typeof data === 'number')
    return data
  return Number(data.replace('px', ''))
}

const OPERATOR_REG = /(\+|\-|\*|\/|%|\*\*)/
const PRESET_REG_1 = /(\$|p|n)(\d+)\.(.*)/
const PRESET_REG_2 = /config\.(.*)/
const PRESET_REG = [PRESET_REG_1, PRESET_REG_2]

export function parsePresetValue(opts: {
  key: typeof BASE_CONFIG_KEY[number]
  value: string
  json: DrawJson[]
}) {
  const { key, value, json } = opts
  if (!value || typeof value !== 'string')
    return value

  const valueList = value.split(' ')
  // console.log('valueList', key, value, valueList)

  const newValues: any[] = []
  for (const idx in valueList) {
    const item = valueList[idx].trim()
    let isMatch = false

    for (const index in PRESET_REG) {
      const match = item.match(PRESET_REG[index])
      if (!match)
        continue

      isMatch = true
      if (index === '0') {
        const [_, preset, number, key] = match
        const jsonIndex = Number(number)
        if (Number.isNaN(jsonIndex))
          throw new Error(`parsePresetValue: ${number} is not a number`)

        switch (preset) {
          case '$': {
            const data = json[index]
            // @ts-expect-error
            if (!data || !data[key])
              throw new Error(`parsePresetValue: ${key} is not exist`)

            // @ts-expect-error
            newValues.push(data[key])
            break
          }
          case 'p': {
            const data = json[jsonIndex - 1]
            // @ts-expect-error
            if (!data || !data[key])
              throw new Error(`parsePresetValue: ${key} is not exist`)
            // @ts-expect-error
            newValues.push(data[key])
            break
          }
          case 'n': {
            const data = json[jsonIndex + 1]
            // @ts-expect-error
            if (!data || !data[key])
              throw new Error(`parsePresetValue: ${key} is not exist`)
            // @ts-expect-error
            newValues.push(data[key])
            break
          }
          default:
            throw new Error(`parsePresetValue: ${preset} is not exist`)
        }
      }
    }

    if (!isMatch)
      newValues.push(item)
  }

  const numberKeys = ['x', 'y', 'width', 'height']
  function needOperator(key: string, newValues: any[]) {
    const isIntervalOperator = newValues
      .filter((_, idx) => idx % 2 === 1)
      .findIndex(item => !OPERATOR_REG.test(item)) === -1

    return numberKeys.includes(key) && isIntervalOperator
  }

  if (!numberKeys.includes(key) || !needOperator(key, newValues))
    return newValues.join('')

  let newValue = 0
  for (let i = 0; i < newValues.length; i += 2) {
    if (i === 0)
      newValue = parseInput(newValues[i])
    else
      newValue = getNumberByOperator(newValues[i - 1], newValue, parseInput(newValues[i]))
  }

  // console.log('newValue', newValues, newValue)
  return newValue
}

export function getNumberByOperator(operator: string, number1: number, number2: number) {
  switch (operator) {
    case '+':
      return number1 + number2
    case '-':
      return number1 - number2
    case '*':
      return number1 * number2
    case '/':
      return number1 / number2
    case '%':
      return number1 % number2
    case '**':
      return number1 ** number2
    default:
      return number1
  }
}
