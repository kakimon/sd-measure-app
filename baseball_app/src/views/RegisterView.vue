<template>
  <div class="space-y-8">

    <div>
      <h1 class="text-2xl font-bold">測定登録</h1>
      <p class="text-sm text-base-content/60 mt-1">
        新しい記録を登録します
      </p>
    </div>

    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-6">

        <!-- 日付 -->
        <div class="form-control w-full">
        <label class="label">
            <span class="label-text font-semibold">日付</span>
        </label>
        <input
            v-model="selectedDate"
            type="date"
            class="input input-bordered w-full　h-14 text-base"
        />
        </div>

        <!-- 種目 -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">種目</span>
          </label>

          <select
            v-model="selectedEvent"
            class="select select-bordered w-full h-14 text-base"
          >
            <option
              v-for="e in events"
              :key="e.id"
              :value="e.id"
            >
              {{ e.name }}（{{ e.unit }}）
            </option>
          </select>
        </div>

        <!-- 選手 -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">選手</span>
          </label>

          <select
            v-model="selectedToken"
            class="select select-bordered w-full h-14 text-base"
          >
            <option disabled value="">選手を選択</option>
            <option
              v-for="m in members"
              :key="m.token"
              :value="m.token"
            >
              {{ m.name }}
            </option>
          </select>
        </div>

        <!-- 記録 -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">記録</span>
          </label>
          <input
            v-model="inputValue"
            type="number"
            class="input input-bordered w-full　h-14 text-base"
          />
        </div>

        <button
          class="btn btn-primary btn-lg w-full"
          :class="{ loading: loading }"
          :disabled="loading"
          @click="registerRecord"
        >
          登録する
        </button>

        <!-- 今日の記録 -->
        <div v-if="todayRecords.length" class="mt-8">

        <h2 class="text-lg font-bold mb-3">
            {{ selectedDate }} の記録
        </h2>

        <div class="bg-base-200 rounded-box p-4 space-y-2">

            <div
            v-for="r in todayRecords"
            :key="r.name + r.value"
            class="flex justify-between"
            >
            <span>{{ r.name }}</span>
            <span class="font-semibold">
                {{ r.value }}
            </span>
            </div>

        </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"

const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec"

const events = ref([])
const members = ref([])
const selectedDate = ref("")
const selectedEvent = ref("")
const selectedToken = ref("")
const inputValue = ref("")
const loading = ref(false)
const todayRecords = ref([])


/* 種目取得 */
async function loadEvents() {
  const res = await fetch(`${GAS_BASE_URL}?type=events`)
  events.value = await res.json()
  if (events.value.length) {
    selectedEvent.value = events.value[0].id
  }
}

/* 選手取得 */
async function loadMembers() {
  const res = await fetch(`${GAS_BASE_URL}?type=members`)
  members.value = await res.json()
}

/* 登録 */
async function registerRecord() {

  if (!selectedEvent.value || !selectedToken.value || !inputValue.value) {
    alert("全て入力してください")
    return
  }

  loading.value = true

  try {
    const today = new Date().toISOString().slice(0, 10)

    const res = await fetch(GAS_BASE_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "register",
        token: selectedToken.value,
        date: selectedDate.value,
        event: selectedEvent.value,
        value: inputValue.value,
      }),
    })

    const result = await res.json()

    if (result.status === "ok") {
      inputValue.value = ""
      alert("登録しました")
      await loadTodayRecords()
    } else {
      alert(result.message)
    }

  } catch (e) {
    alert("登録に失敗しました")
  } finally {
    loading.value = false
  }
}

/* 登録表示 */
async function loadTodayRecords() {

  if (!selectedEvent.value || !selectedDate.value) return

  const res = await fetch(
    `${GAS_BASE_URL}?type=stats&event=${selectedEvent.value}&date=${selectedDate.value}`
  )

  todayRecords.value = await res.json()
}

onMounted(async () => {
  const today = new Date().toISOString().slice(0, 10)
  selectedDate.value = today

  await loadEvents()
  await loadMembers()
  await loadTodayRecords()
})


watch([selectedEvent, selectedDate], loadTodayRecords)

</script>
