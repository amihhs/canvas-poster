<script setup lang='ts'>
import type { Observable } from 'rxjs'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import type { Poster } from '@/logic/db'
import { deletePoster, getPosters } from '@/logic/db'
import { dateFormatted } from '@/shared'

function deleteHandler(id?: number) {
  // eslint-disable-next-line no-alert
  if (!id || !window.confirm('Are you sure you want to delete this poster?'))
    return

  deletePoster(id)
}
const list = useObservable(liveQuery(() => getPosters()) as unknown as Observable<Poster[]>)
</script>

<template>
  <div class="max-w-200 m-auto">
    <div class="flex items-center justify-between mb-sm">
      <h1 class="text-3xl font-bold">
        Historical Posters
      </h1>
      <Create />
    </div>
    <div class="grid grid-cols-3 gap-sm">
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
        <img class="w-full aspect-3/4" :src="v.poster || '/logo.svg'" alt="">
        <div text-3 text-slate-3>
          Created By {{ dateFormatted(v.createdAt) }}
        </div>
        <div text-3 text-slate-3>
          Last Update {{ dateFormatted(v.updatedAt) }}
        </div>
      </RouterLink>
    </div>
  </div>
</template>
