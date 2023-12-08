// @unocss-includes
import { PosterType } from '@amihhs/canvas-poster'
import type { DrawJson } from '@/interface'

function setStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  el.setAttribute(
    'style',
    Object.entries(style).map(([key, value]) => `${key}: ${value}`).join(';'),
  )
}
function createLinePoint(type: 'start' | 'end' = 'start', style: Partial<CSSStyleDeclaration> = {}) {
  const classObj = {
    start: 'dit left-0 top-1/2 -translate-1/2',
    end: ' dit right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
  }
  const spanEl = document.createElement('span')
  spanEl.className = classObj[type]
  setStyle(spanEl, style)

  return spanEl
}

function lineSelected(offsetLeft: number, offsetTop: number) {
  if (!CURRENT_CHANGE_JSON.value || CURRENT_CHANGE_JSON.value.type !== PosterType.line)
    return

  const els: HTMLDivElement[] = []
  const paths = CURRENT_CHANGE_JSON.value.paths ?? []

  for (let i = 1; i < paths.length; i++) {
    const [x1, y1] = paths[i - 1]
    const [x2, y2, isMove2] = paths[i]

    const divEl = document.createElement('div')
    divEl.className = 'absolute bg-teal-6 bg-opacity-80 text-0 select-none pointer-events-none transform-origin-lc'

    const width = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const { lineWidth = 3 } = CURRENT_CHANGE_JSON.value
    const height = lineWidth > 3 ? lineWidth : 3
    const left = x1 + offsetLeft
    const top = y1 + offsetTop
    const rotate = Math.atan2(y2 - y1, x2 - x1)

    const spanStyle = {
      width: `${Math.max(height, 6) * 1.3}px`,
      height: `${Math.max(height, 6) * 1.3}px`,
    }

    // left point
    divEl.appendChild(createLinePoint('start', spanStyle))

    // right point
    if (i === paths.length - 1 || isMove2)
      divEl.appendChild(createLinePoint('end', spanStyle))

    const style = {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: ` ${rotate ? 'translateY(-50%)' : `translateY(calc(-50% + 2.25px))`} rotate(${rotate}rad)`,
    }
    setStyle(divEl, style)
    els.push(divEl)
  }

  return els
}

function rectSelected() {
  if (!CURRENT_CHANGE_JSON.value || CURRENT_CHANGE_JSON.value.type === PosterType.line)
    return
  const divEl = document.createElement('div')
  divEl.className = 'absolute select-none pointer-events-none border-1 border-teal-6'

  const span = ['-left-1', '-top-1', '-right-1', '-bottom-1']
  for (const index in span) {
    const spanEl = document.createElement('span')
    const idx = Number(index)
    const next = Number(index) === span.length - 1 ? 0 : Number(index) + 1
    const classList = ['dit', span[idx], span[next]]
    spanEl.classList.add(...classList)
    divEl.appendChild(spanEl)
  }
  return divEl
}

function updateRectStyle(data: {
  offsetLeft: number
  offsetTop: number
  json: DrawJson[]
}) {
  if (
    !CURRENT_CHANGE_JSON.value
    || CURRENT_CHANGE_JSON.value.type === PosterType.line
  )
    return
  const { offsetLeft, offsetTop } = data
  const offset = CURRENT_CHANGE_JSON.value.type === PosterType.text ? 4 : 0

  const { width, height, x, y } = CURRENT_CHANGE_JSON.value

  const style = {
    left: `${Number(x) + offsetLeft - offset}px`,
    top: `${Number(y) + offsetTop - offset}px`,
    width: `${Number(width) + offset * 2}px`,
    height: `${Number(height) + offset * 2}px`,
  }

  return style
}

function canvasSelectedController() {
  const json = inject<Ref<DrawJson[]>>(CONTENT_JSON_KEY, ref([]))

  const canvasRef = inject<Ref<HTMLCanvasElement | null>>(CANVAS_EL_KEY, ref(null))
  const selectedRef = ref<HTMLDivElement | null>(null)
  const elements = ref<HTMLDivElement[] | null>(null)

  function destroy() {
    elements.value?.forEach(v => v.remove())
    elements.value = null
    if (selectedRef.value?.innerHTML)
      selectedRef.value.innerHTML = ''
  }

  function handler() {
    destroy()
    if (!CURRENT_CHANGE_JSON.value || !canvasRef.value || !selectedRef)
      return
    if (CURRENT_CHANGE_JSON.value.type !== PosterType.line) {
      const divEl = rectSelected()
      if (!divEl)
        return

      const style = updateRectStyle({
        offsetLeft: canvasRef.value.offsetLeft,
        offsetTop: canvasRef.value.offsetTop,
        json: unref(json),
      })
      style && setStyle(divEl, style)

      elements.value = [divEl]
      selectedRef.value?.appendChild(divEl)
    }
    else if (CURRENT_CHANGE_JSON.value.type === PosterType.line) {
      const els = lineSelected(canvasRef.value.offsetLeft, canvasRef.value.offsetTop)
      if (!els)
        return

      elements.value = els
      els.forEach(el => selectedRef.value?.appendChild(el))
    }
  }

  const stops = [
    // fix: The append element is invalid after hot update
    watch(selectedRef, handler),
    watch(CURRENT_CHANGE_JSON, handler, { immediate: true, deep: true }),
  ]
  onBeforeUnmount(() => stops.forEach(v => v()))
  return {
    canvasRef,
    selectedRef,
    elements,

    rectSelected,
    lineSelected,
  }
}

export { canvasSelectedController }
