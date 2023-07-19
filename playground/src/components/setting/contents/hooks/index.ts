import type { UnwrapNestedRefs } from 'vue'
import type { DrawJson } from '@/interface'

export function useContentDrag() {
  const dropContainerEl = ref<HTMLElement | null>(null)
  const currentDragEl = ref<HTMLElement | null>(null)
  const json = inject<UnwrapNestedRefs<DrawJson[]>>(CONTENT_JSON_KEY, [])

  function changeJsonSort() {
    if (!dropContainerEl.value)
      return
    const childrenNodes = Array.from(dropContainerEl.value.children)
    const newIndex = childrenNodes.map((el) => {
      return Number(el.getAttribute('value') as unknown as string)
    })
    const newJson = newIndex.map(index => json[index])
    json.splice(0, json.length, ...newJson)
  }

  function getDragElement(el: HTMLElement): HTMLElement {
    if (el.parentElement === dropContainerEl.value)
      return el
    return getDragElement(el.parentElement as HTMLElement)
  }
  function dragStartHandler(event: DragEvent) {
    if (event.dataTransfer?.dropEffect)
      event.dataTransfer.dropEffect = 'move'

    currentDragEl.value = event.target as HTMLElement
    setTimeout(() => {
      currentDragEl.value?.classList.add('moving')
    }, 0)
  }
  function dragEnterHandler(e: DragEvent) {
    e.preventDefault()

    let el = e.target as HTMLElement
    if (el.parentElement !== dropContainerEl.value && el !== dropContainerEl.value)
      el = getDragElement(el)

    if (!currentDragEl.value || !dropContainerEl.value || el === currentDragEl.value || el === dropContainerEl.value)
      return

    const childrenNodes = Array.from(dropContainerEl.value.children)
    const currentIndex = childrenNodes.indexOf(currentDragEl.value) // 获取到拖动元素的下标
    const targetIndex = childrenNodes.indexOf(el) // 获取到目标元素的下标

    if (targetIndex === -1)
      return

    if (currentIndex < targetIndex)
      dropContainerEl.value.insertBefore(currentDragEl.value, el.nextElementSibling)
    else
      dropContainerEl.value.insertBefore(currentDragEl.value, el)
  }
  function dragEndHandler() {
    currentDragEl.value?.classList.remove('moving')
    currentDragEl.value = null
    changeJsonSort()
  }

  return {
    dropContainerEl,
    json,

    dragStartHandler,
    dragEnterHandler,
    dragEndHandler,
  }
}
