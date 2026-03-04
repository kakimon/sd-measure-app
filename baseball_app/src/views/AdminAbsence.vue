<template>
  <div class="p-4 max-w-4xl mx-auto">

    <h1 class="text-2xl font-bold mb-6">
      休暇管理一覧
    </h1>

    <div v-if="loading" class="text-center py-10">
      読み込み中...
    </div>

    <div v-else>

      <div
        v-for="(items, date) in grouped"
        :key="date"
        class="mb-8"
      >
        <h2 class="text-lg font-bold mb-3 border-b pb-1">
          {{ date }}
        </h2>

        <div class="space-y-2">
          <div
            v-for="item in items"
            :key="item.token + item.date"
            class="flex justify-between items-center p-3 rounded-lg bg-base-200"
          >
            <span class="font-medium">
              {{ item.playerName }}
            </span>

            <span
              class="badge"
              :class="badgeColor(item.type)"
            >
              {{ convertType(item.type) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="Object.keys(grouped).length === 0"
           class="text-center py-10 text-gray-400">
        データがありません
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"

const API_URL = "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec"
const ADMIN_KEY = "123456"

const absences = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    console.log("API_URL:", API_URL)

    const res = await fetch(
      `${API_URL}?type=getAllAbsences&key=${ADMIN_KEY}&_=${Date.now()}`
    )

    console.log("response status:", res.status)

    const json = await res.json()
    console.log("response data:", json)

    absences.value = json

  } catch (err) {
    console.error("fetch error:", err)
  } finally {
    loading.value = false
  }
})

const grouped = computed(() => {
  const map = {}

  absences.value
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(a => {
      if (!map[a.date]) map[a.date] = []
      map[a.date].push(a)
    })

  return map
})

const badgeColor = (type) => {
  if (type === "absent") return "badge-error"
  if (type === "continue") return "badge-warning"
  return "badge-success"
}

const convertType = (type) => {
  if (type === "absent") return "欠席"
  if (type === "continue") return "10時参加"
  return type
}
</script>