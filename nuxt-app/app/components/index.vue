<template>
  <div class="container">
    <h1 class="title">Trainees</h1>

    <div class="table">
      <div class="controls">
        <div class="filters">
          <input v-model="filterName" placeholder="Filter name..." />
          <input v-model="filterCountry" placeholder="Filter country..." />
          <select v-model="sort">
            <option value="id_desc">Newest</option>
            <option value="id_asc">Oldest</option>
            <option value="name_asc">Name A → Z</option>
            <option value="name_desc">Name Z → A</option>
          </select>
          <button @click="applyFilters">Apply</button>
        </div>
      </div>
      <div class="table-header">
        <div class="col num">#</div>
        <div class="col name">Name</div>
        <div class="col exp">Experience</div>
        <div class="col major">Major</div>
        <div class="col age">Age</div>
        <div class="col school">School</div>
        <div class="col country">Country</div>
        <div class="col checks">CV / Interview / Video</div>
      </div>

  <div v-for="(trainee, idx) in rows" :key="trainee?.id ?? `placeholder-${idx}`" class="table-row" :class="{'placeholder': !trainee}">
  <div class="col num">{{ trainee ? trainee.id : '' }}</div>
        <div class="col name">
          <div class="col avatar" :style="trainee && trainee.avatar ? { backgroundImage: `url(${trainee.avatar})` } : {}"></div>
          <div class="name-text">
            <div class="main">{{ trainee ? trainee.name : '—' }}</div>
          </div>
        </div>
  <div class="col exp">{{ trainee ? trainee.experience : '' }}</div>
  <div class="col major">{{ trainee ? trainee.major : '' }}</div>
  <div class="col age">{{ trainee ? trainee.age : '' }}</div>
  <div class="col school">{{ trainee ? trainee.school : '' }}</div>
  <div class="col country">{{ trainee ? trainee.country : '' }}</div>
        <div class="col checks">
          <span class="check" :class="{'ok': trainee && trainee.cv}">CV</span>
          <span class="check" :class="{'ok': trainee && trainee.interview}">IV</span>
          <span class="check" :class="{'ok': trainee && trainee.video}">VD</span>
        </div>
      </div>
    </div>
    <div class="pagination">
      <div class="page-buttons">
        <button v-for="p in pages" :key="p" @click="goToPage(p)" :class="{active: p===meta.page}" :disabled="p===meta.page">{{ p }}</button>
      </div>
      <div class="pager-info">
        <button @click="prevPage" :disabled="meta.page <= 1" class="nav">← Prev</button>
        <span>Page {{ meta.page }} / {{ meta.totalPages }}</span>
        <button @click="nextPage" :disabled="meta.page >= meta.totalPages" class="nav">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Trainee {
  id: number
  name: string
  avatar?: string | null
  experience?: string | null
  major?: string | null
  age?: number | string | null
  school?: string | null
  country?: string | null
  cv?: boolean | null
  interview?: boolean | null
  video?: boolean | null
  createdAt?: string | Date | null
}

const trainees = ref<Trainee[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const page = ref<number>(1)
const perPage = ref<number>(10)
const meta = ref({ total: 0, page: 1, perPage: 10, totalPages: 1 })
const sort = ref<string>('id_desc')
const filterName = ref<string>('')
const filterCountry = ref<string>('')
const pages = computed(() => {
  const arr: number[] = []
  for (let i = 1; i <= meta.value.totalPages; i++) arr.push(i)
  return arr
})
import { computed } from 'vue'

const rows = computed<Array<Trainee | null>>(() => {
  const max = 10
  const list: Array<Trainee | null> = []
  for (let i = 0; i < max; i++) {
    list.push(trainees.value[i] ?? null)
  }
  return list
})

async function load() {
  loading.value = true
  error.value = null
  try {
  const params = new URLSearchParams({ page: String(page.value), perPage: String(perPage.value), sort: sort.value })
  if (filterName.value) params.set('filterName', filterName.value)
  if (filterCountry.value) params.set('filterCountry', filterCountry.value)
  const res = await fetch(`/api/trainees?${params.toString()}`)
    const payload = await res.json()
    const data = Array.isArray(payload) ? payload : payload.data
    const payloadMeta = payload && payload.meta ? payload.meta : null
    // If API returns wrapper with error/data
    if (payload && payload.error && Array.isArray(payload.data)) {
      trainees.value = payload.data as Trainee[]
      error.value = payload.message ?? 'Using fallback data'
    } else if (Array.isArray(data)) {
      trainees.value = data as Trainee[]
    } else {
      // unknown shape, fallback to empty
      trainees.value = []
      error.value = 'Unexpected data shape from API'
    }

    if (payloadMeta) {
      meta.value = {
        total: Number(payloadMeta.total ?? 0),
        page: Number(payloadMeta.page ?? page.value),
        perPage: Number(payloadMeta.perPage ?? perPage.value),
        totalPages: Number(payloadMeta.totalPages ?? 1)
      }
    } else {
      // derive meta locally
      meta.value = { total: trainees.value.length, page: page.value, perPage: perPage.value, totalPages: 1 }
    }
  } catch (e) {
    error.value = String(e instanceof Error ? e.message : e)
    trainees.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

function prevPage() {
  if (page.value > 1) {
    page.value--
    load()
  }
}

function nextPage() {
  if (page.value < meta.value.totalPages) {
    page.value++
    load()
  }
}

function goToPage(p: number) {
  if (p >= 1 && p <= meta.value.totalPages && p !== meta.value.page) {
    page.value = p
    load()
  }
}

function applyFilters() {
  page.value = 1
  load()
}
</script>

<style scoped>
.container{
  max-width: 1100px;
  margin: 32px auto;
  padding: 16px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}
.title{
  font-size: 22px;
  margin-bottom: 12px;
}
.table{
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  background: #fff;
}
.table-header, .table-row{
  display: grid;
  grid-template-columns: 48px 200px 100px 160px 60px 120px 110px 180px;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
}
.table-header{
  background: #f5f7f9;
  color: #666;
  font-weight: 600;
}
.table-row{
  border-top: 1px solid #f0f0f0;
}
.col{display:flex;align-items:center}
.col.name{gap:12px;align-items:flex-start}
.col.ava{gap:12px;align-items:flex-start}
.avatar{
  width:48px;height:48px;border-radius:50%;background-size:cover;background-position:center;flex:0 0 48px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-top:4px
}
.name-text{display:flex;flex-direction:column;justify-content:flex-start}
.name-text .main{font-weight:700}
.name-text .sub{font-size:12px;color:#999;margin-top:4px}
.col.checks{gap:8px}
.check{
  display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#e9f5ee;color:#2f8f4a;font-weight:700;margin-right:6px;opacity:0.18
}
.check.ok{opacity:1}
.check:not(.ok){background:#f9eaea;color:#c34a4a}

.controls{padding:12px 16px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between}
.filters{display:flex;gap:8px;align-items:center}
.filters input{padding:6px 8px;border:1px solid #e0e0e0;border-radius:6px}
.filters select{padding:6px 8px;border:1px solid #e0e0e0;border-radius:6px}
.filters button{padding:6px 10px;border-radius:6px;border:none;background:#2f8f4a;color:#fff}

.pagination{display:flex;justify-content:space-between;align-items:center;padding:12px 16px}
.page-buttons button{margin-right:6px;padding:6px 8px;border-radius:6px;border:1px solid #eee;background:#fff}
.page-buttons button.active{background:#2f8f4a;color:#fff;border-color:#2f8f4a}
.pager-info .nav{padding:6px 10px;border-radius:6px;border:none;background:#f5f7f9}
.pager-info button:disabled,.page-buttons button:disabled{opacity:0.5;cursor:not-allowed}

.spinner{width:20px;height:20px;border-radius:50%;border:3px solid rgba(0,0,0,0.08);border-top-color:#2f8f4a;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.table-row.placeholder{background: linear-gradient(90deg, rgba(250,250,250,1), rgba(255,255,255,1));color:#bdbdbd}
.table-row.placeholder .avatar{background:#f0f0f0}
.table-row.placeholder .name-text .main{color:#bdbdbd}

@media (max-width: 880px){
  .table-header, .table-row{grid-template-columns: 40px 1fr 80px 160px 48px 1fr 100px 160px}
}
</style>
