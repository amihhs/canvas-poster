import { type PosterJson, formatItem } from '@amihhs/canvas-poster'
import { useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import type { Observable } from 'rxjs'
import type { DrawJson, PosterJsonDB } from '@/interface'

export function useOutputHandler() {
  const posterJson = inject<Ref<DrawJson[]>>(CONTENT_JSON_KEY, ref([]))
  const route = useRoute()
  const posterId = computed(() => Number(route.query.id as string))
  const outputCode = ref('')

  const currentPoster = useObservable(liveQuery(() => getPosterJson(posterId.value)) as unknown as Observable<PosterJsonDB>)

  watch(posterJson, () => {
    const config = currentPoster.value?.base || baseSettingDefault
    const json: PosterJson[] = posterJson.value.map((v) => {
      const item: PosterJson = formatItem(Object.assign({}, v))
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      delete item.id
      return item
    })

    const str = `
      import type { PosterInstance } from '@amihhs/canvas-poster'
      import { createPoster } from '@amihhs/canvas-poster'

      function createPoster(){
        const config = ${JSON.stringify(config)}
        const json = ${JSON.stringify(json)}
        const posterInstance = createPoster(config)

        function renderHandler(){
          const { context, render } = posterInstance
          render(context, json)
        }

        return {
          renderHandler
        }
      }
    `
    outputCode.value = str.trim()
  }, { immediate: true })

  return {
    outputCode,
  }
}
