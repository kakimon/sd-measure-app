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

        <!-- 種目 -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">種目</span>
          </label>

          <select
            v-model="selectedEvent"
            class="select select-bordered select-lg w-full"
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
            <span class="label-text font-semibold">選手名（token）</span>
          </label>
          <input
            v-model="inputName"
            placeholder="選手名またはtoken"
            class="input input-bordered input-lg w-full"
          />
        </div>

        <!-- 記録 -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">記録</span>
          </label>
          <input
            v-model="inputValue"
            type="number"
            class="input input-bordered input-lg w-full"
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

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec"

const events = ref([])
const selectedEvent = ref("")
const inputName = ref("")
const inputValue = ref("")
const loading = ref(false)

/* 種目取得 */
async function loadEvents() {
  const res = await fetch(`${GAS_BASE_URL}?type=events`)
  events.value = await res.json()
  if (events.value.length) {
    selectedEvent.value = events.value[0].id
  }
}

async function registerRecord() {
  if (!selectedEvent.value || !inputName.value || !inputValue.value) {
    alert("全て入力してください")
    return
  }

  loading.value = true

  try {
    const today = new Date().toISOString().slice(0, 10)

    const res = await fetch(`${GAS_BASE_URL}?type=register`, {
      method: "POST",
      body: JSON.stringify({
        token: inputName.value,
        date: today,
        event: selectedEvent.value,   // ★ここが重要
        value: inputValue.value,
      }),
    })

    const result = await res.json()

    if (result.status === "ok") {
      inputValue.value = ""
      alert("登録しました")
    } else {
      alert(result.message)
    }
  } catch (e) {
    alert("登録に失敗しました")
  } finally {
    loading.value = false
  }
}

onMounted(loadEvents)
</script>
