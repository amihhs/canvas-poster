<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const canvasRef = inject<Ref<HTMLCanvasElement | null>>(CANVAS_EL_KEY, ref(null))
const selectedRef = ref<HTMLDivElement | null>(null)
const elements = ref<HTMLDivElement[] | null>(null)

function updateRectStyle() {
  if (
    !elements.value
    || !elements.value.length
    || !CURRENT_CHANGE_JSON.value
    || !canvasRef.value
    || CURRENT_CHANGE_JSON.value.type === PosterType.line
  )
    return

  const offset = CURRENT_CHANGE_JSON.value.type === PosterType.text ? 4 : 0

  const { offsetLeft, offsetTop } = canvasRef.value
  const style = {
    left: `${CURRENT_CHANGE_JSON.value.x + offsetLeft - offset}px`,
    top: `${CURRENT_CHANGE_JSON.value.y + offsetTop - offset}px`,
    width: `${CURRENT_CHANGE_JSON.value.width + offset * 2}px`,
    height: `${CURRENT_CHANGE_JSON.value.height + offset * 2}px`,
  }
  elements.value[0].setAttribute(
    'style',
    Object.entries(style).map(([key, value]) => `${key}: ${value}`).join(';'),
  )
}

function rectSelected() {
  if (!CURRENT_CHANGE_JSON.value || !canvasRef.value || CURRENT_CHANGE_JSON.value.type === PosterType.line)
    return
  const divEl = document.createElement('div')
  divEl.className = 'absolute bg-teal-6 bg-opacity-40 select-none pointer-events-none border-1 border-teal-6'

  const span = ['-left-1', '-top-1', '-right-1', '-bottom-1']
  for (const index in span) {
    const spanEl = document.createElement('span')
    const idx = Number(index)
    const next = Number(index) === span.length - 1 ? 0 : Number(index) + 1
    const classList = ['dit', span[idx], span[next]]
    spanEl.classList.add(...classList)
    divEl.appendChild(spanEl)
  }
  elements.value = [divEl]
  updateRectStyle()
  selectedRef.value?.appendChild(divEl)
}

function lineSelected() {
  if (!CURRENT_CHANGE_JSON.value || !canvasRef.value || CURRENT_CHANGE_JSON.value.type !== PosterType.line)
    return

  const els: HTMLDivElement[] = []
  const paths = CURRENT_CHANGE_JSON.value.paths ?? []
  const { offsetLeft, offsetTop } = canvasRef.value
  for (let i = 1; i < paths.length; i++) {
    const [x1, y1] = paths[i - 1]
    const [x2, y2, isMove2] = paths[i]
    const divEl = document.createElement('div')
    divEl.className = 'absolute bg-teal-6 bg-opacity-80 select-none pointer-events-none transform-origin-lc'
    const width = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const { lineWidth = 20 } = CURRENT_CHANGE_JSON.value
    const height = lineWidth > 3 ? lineWidth : Math.min(3, lineWidth * 2)
    const left = x1 + offsetLeft
    const top = y1 + offsetTop
    const rotate = Math.atan2(y2 - y1, x2 - x1)
    const style = {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height * 2}px`,
      transform: ` ${rotate ? 'translateY(-50%)' : ''}rotate(${rotate}rad)`,
    }
    divEl.setAttribute(
      'style',
      Object.entries(style).map(([key, value]) => `${key}: ${value}`).join(';'),
    )

    const spanEl = document.createElement('span')
    spanEl.className = 'dit left-0 top-1/2 -translate-y-1/2'
    divEl.appendChild(spanEl)

    if (i === paths.length - 1 || isMove2) {
      const spanEl = document.createElement('span')
      spanEl.className = 'dit -right-1 top-1/2 -translate-y-1/2'
      divEl.appendChild(spanEl)
    }

    els.push(divEl)
    selectedRef.value?.appendChild(divEl)
    elements.value = els
  }
}

function destroy() {
  elements.value?.forEach(v => v.remove())
  elements.value = null
}

function handler() {
  destroy()
  if (!CURRENT_CHANGE_JSON.value || !canvasRef.value || !selectedRef)
    return

  if (CURRENT_CHANGE_JSON.value.type !== PosterType.line)
    rectSelected()
  else if (CURRENT_CHANGE_JSON.value.type === PosterType.line)
    lineSelected()
}
// fix: The append element is invalid after hot update
watch(selectedRef, handler)
watch(CURRENT_CHANGE_JSON, handler, { immediate: true, deep: true })
</script>

<template>
  <div id="selected" ref="selectedRef" />
</template>
