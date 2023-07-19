import type { UnwrapNestedRefs } from 'vue'
import { CURRENT_CHANGE_JSON_KEY, CURRENT_CHANGE_VISIBLE_KEY } from './const'
import type { DrawJson } from '@/interface'

export function useControlJson() {
  const json = inject<UnwrapNestedRefs<DrawJson[]>>(CONTENT_JSON_KEY, [])

  function deleteJson(index: number, confirm = false) {
    if (confirm && !window.confirm('确定删除吗？'))
      return
    json.splice(index, 1)
  }

  function changeJson<KEY extends keyof DrawJson>(index: number, key: KEY, data: DrawJson[KEY]) {
    json[index][key] = data
  }

  function updateJson(index: number, data: DrawJson) {
    json.splice(index, 1, data)
  }

  function addJson(data: DrawJson, index?: number) {
    json.splice(index ?? json.length, 0, data)
  }

  return {
    addJson,
    changeJson,
    updateJson,
    deleteJson,
  }
}

export function useCurrentChangeJson() {
  const json = inject<UnwrapNestedRefs<DrawJson[]>>(CONTENT_JSON_KEY, [])

  const currentChangeJson = ref<DrawJson | null>(null)
  const jsonChangeDrawerVisible = ref<boolean>(false)
  provide(CURRENT_CHANGE_JSON_KEY, currentChangeJson)
  provide(CURRENT_CHANGE_VISIBLE_KEY, jsonChangeDrawerVisible)
  function setCurrentChangeJson(data: DrawJson | null) {
    currentChangeJson.value = data
  }
  function setJsonChangeDrawerVisible(visible: boolean) {
    jsonChangeDrawerVisible.value = visible
  }
  function showChangeJson(index: number, visible = true) {
    const data = json[index]

    setCurrentChangeJson(data)
    setJsonChangeDrawerVisible(visible)
  }

  return {
    currentChangeJson,
    jsonChangeDrawerVisible,
    setCurrentChangeJson,
    setJsonChangeDrawerVisible,
    showChangeJson,
  }
}
