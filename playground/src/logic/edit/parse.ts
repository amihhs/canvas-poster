/* eslint-disable ts/ban-ts-comment */
import type { OmitJson, PosterType } from '@amihhs/canvas-poster'
import type { DrawJson } from '@/interface'

type SplitValue = string
type SplitItem = string | SplitItem[]

const SPLIT_REG = /(\(.*\)|\+|\-|\*|\/|%|\*\*)/
const GROUP_REG = /\((.*)\)/
const OPERATOR_REG = /(\+|\-|\*|\/|%|\*\*)/
const PRESET_REG_1 = /(\$|p|n)(\d+)\.(.*)/
const PRESET_REG_2 = /config\.(.*)/
const PRESET_REG = [PRESET_REG_1, PRESET_REG_2]

// - $1 -> JSON[0] -> $1 + 2
// - p1 -> prev[current - 1]
// - n1 -> next[current + 1]
// - link code return value
// - config.key
function parsePresetValue(opts: {
  value: string
  json: DrawJson[]
}) {
  const { value, json } = opts
  if (typeof value !== 'string')
    return value

  const valueList = splitValue(value)

  const parsedValue = parseValue({ preset: valueList, json })
  return parsedValue
}

function parseValue(data: {
  preset: SplitItem[]
  json: DrawJson[]
}) {
  const { preset, json } = data
  const values: SplitValue[] = []

  for (const idx in preset) {
    const item = preset[idx]
    if (typeof item === 'string') {
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

          if (['$', 'p', 'n'].includes(preset)) {
            const index = preset === '$'
              ? jsonIndex
              : preset === 'p'
                ? jsonIndex - 1
                : jsonIndex + 1

            const data = json[index]
            // @ts-expect-error
            if (!data || !data[key])
              throw new Error(`parsePresetValue: ${key} is not exist`)

            // @ts-expect-error
            const value = parsePresetValue({ value: data[key], json })
            values.push(value)
          }
          else {
            throw new Error(`parsePresetValue: ${preset} is not exist`)
          }
        }
      }

      if (!isMatch)
        values.push(item)

      continue
    }

    const value = parseValue({ preset: item, json })
    values.push(value)
  }

  if (!values.length || values.length === 1)
    return values[0] || ''

  // eslint-disable-next-line no-new-func
  const fn = new Function(`return ${values.join(' ')}`)
  const result = fn() as string

  return `${result}`
}

function splitValue(value: string): SplitItem[] {
  // console.log('splitValue', value)
  const valueList = value.split(SPLIT_REG).map(v => v.trim()).filter(v => v)
  const newValues: SplitItem[] = []
  for (const idx in valueList) {
    const item = valueList[idx].trim()

    // same as (1+2)
    if (item.match(GROUP_REG)) {
      const [_, group] = item.match(GROUP_REG) as RegExpMatchArray
      const value = splitValue(group)
      newValues.push(value)
      continue
    }
    // operator | number | preset
    newValues.push(item)
  }

  return newValues
}

/**
 * parsePresetBaseValue:  width, height, x, y
 * @description Parse content containing variables into pure numbers, such as: $1.width + 2 => 100 + 2 => 102
 * @param item OmitJson<DrawJson, PosterType.line>
 * @param json DrawJson[]
 * @returns [width, height, x, y]
 */
export function parsePresetBaseValue(item: OmitJson<DrawJson, PosterType.line>, json: DrawJson[]) {
  const keys = ['width', 'height', 'x', 'y'] as const
  const values: number[] = []
  for (const key of keys) {
    const value = parsePresetValue({
      value: item[key] as unknown as string,
      json,
    })
    if (Number.isNaN(Number(value)))
      throw new Error(`parsePresetBaseValue: ${value} is not a number`)

    values.push(Number(value))
  }
  return values
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

export const OPERATOR = ['+', '-', '*', '/', '%', '**'] as const
export function calculatePresetValue(value: string | number, number: number, operator: typeof OPERATOR[number]) {
  if (typeof value === 'number') {
    switch (operator) {
      case '+':
        return value + number
      case '-':
        return value - number
      case '*':
        return value * number
      case '/':
        return Math.floor(value / number)
      case '%':
        return value % number
      case '**':
        return value ** number
      default:
        return value
    }
  }
  if (['*', '/', '%', '**'].includes(operator)) {
    if (!value)
      throw new Error(`calculatePresetValue: ${operator} is invalid, value is empty`)

    return `(${value}) ${operator} ${number}`
  }

  if (!value)
    return operator === '-' ? -number : number

  const reg = /(\(.*\)|\+|\-|\*|\/|%|\*\*)/ // '(1+2)+1'.split(/(\(.*\)|\+|\-|\*|\/|%|\*\*)/) => ['', '(1+2)', '', '+', '1']
  const list = value.split(reg).map(item => item.trim()).filter(item => item)

  let lastPureNumber: string | null = null
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i]
    if (Number.isNaN(Number(item)))
      continue

    lastPureNumber = item
    break
  }

  if (!lastPureNumber)
    return list.join(' ') + operator + number

  const pureNumber = Number(lastPureNumber)
  const index = list.findIndex(item => item === lastPureNumber)

  const preOperator = list[index - 1]
  switch (preOperator) {
    case '+':
      list.splice(index, 1, `${operator === '-' ? pureNumber - number : pureNumber + number}`)
      break
    case '-':
      list.splice(index, 1, `${operator === '-' ? pureNumber + number : pureNumber - number}`)
      break
    default:
      list.push(operator, `${number}`)
      break
  }

  const oldList = list.join(' ').split(reg).map(item => item.trim()).filter(item => item)
  const newList = []

  let pre = ''
  for (let i = oldList.length - 1; i >= 0; i--) {
    const item = oldList[i]
    if (OPERATOR_REG.test(item)) {
      // 2 + - 3 => 2 - 3
      if (pre && pre === '-' && item === '+')
        continue
      // 2 - + 3 => 2 - 3
      if (pre && pre === '+' && item === '-')
        continue

      // 2 - - 3 => 2 + 3 | 2 + + 3 => 2 + 3
      if (pre && pre === item && (item === '-' || item === '+')) {
        newList[0] = '+'
        continue
      }

      pre = item
    }
    else {
      pre = ''
    }
    newList.unshift(item)
  }

  return newList.join(' ')
}

export {
  parsePresetValue,
  parseValue,
  splitValue,
}
