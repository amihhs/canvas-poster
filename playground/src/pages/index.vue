<script setup lang='ts'>
import type { Observable } from 'rxjs'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import type { PosterDB } from '@/interface'
import { deletePoster, getPosters } from '@/logic/db'
import { dateFormatted } from '@/shared'

const { t } = useI18n()
function deleteHandler(id?: number) {
  // eslint-disable-next-line no-alert
  if (!id || !window.confirm('Are you sure you want to delete this poster?'))
    return

  deletePoster(id)
}
const list = useObservable(liveQuery(() => getPosters()) as unknown as Observable<(Omit<PosterDB, 'poster'> & { poster: string })[]>)
</script>

<template>
  <div class="max-w-220 m-auto">
    <div class="flex items-center justify-between mb-sm">
      <h1 class="text-3xl font-bold">
        {{ t('home.title') }}
      </h1>
      <Create />
    </div>
    <div v-if="list && list.length" class="grid grid-cols-3 gap-sm">
      <RouterLink
        v-for="v, i in list" :key="i"
        :to="`/edit?id=${v.id}`"
        class="group px-lg py-sm bg-white rounded cursor-pointer hover:(shadow-md) relative"
      >
        <div class="absolute top-3 right-3 hidden group-hover:flex items-start" @click.prevent>
          <Create :id="v.id">
            <i class="mr-1 text-blue-5 i-carbon-edit" />
          </Create>
          <i class="text-red-5 i-material-symbols:delete" @click="deleteHandler(v.id)" />
        </div>
        <div font-bold text-lg>
          {{ v.name }}
        </div>
        <img
          v-parse-url
          class="w-full aspect-4/3 border-(1 slate-1) my-2 object-contain"
          :src="v.poster || '/logo.svg'" alt=""
        >
        <div text-3 text-slate-3>
          Created By {{ dateFormatted(v.createdAt) }}
        </div>
        <div text-3 text-slate-3>
          Last Update {{ dateFormatted(v.updatedAt) }}
        </div>
      </RouterLink>
    </div>
    <div v-else class="bg-white text-teal-6 flex flex-col items-center rounded p-4xl">
      <i class="i-custom:undraw-noted?bg text-40" />
      <span mt-4xl font-bold text-xl>No Posters Yet</span>
    </div>
  </div>
</template>
