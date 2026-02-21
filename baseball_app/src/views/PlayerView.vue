<template>
  <div class="p-6　print-area">

    <!-- タイトル -->
    <h1 class="text-3xl font-bold mb-2">
      {{ playerName }} の記録
    </h1>
    <p class="text-gray-500 mb-6">
      個人種目別記録
    </p>
    
    <div class="mb-4 print-only">
    <p><strong>種目：</strong>{{ selectedEventName }}</p>
    <p><strong>対象年：</strong>
        {{ selectedYear ? selectedYear + '年' : '全期間' }}
    </p>
    </div>

    <!-- ===== 表示条件カード ===== -->
    <div class="card bg-base-100 shadow-md p-6 mb-6 print-hide">

      <!-- 上段：タイトル + PDF -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">表示条件</h2>

        <button
          class="btn btn-neutral btn-sm"
          @click="exportPDF"
        >
          📄 PDF出力
        </button>
      </div>

      <!-- 種目選択 -->
      <div class="mb-4">
        <label class="label">
          <span class="label-text font-bold text-base">
            種目選択
          </span>
        </label>

        <select
          v-model="selectedEvent"
          class="select select-bordered w-full h-14 text-base font-semibold"
        >
          <option
            v-for="event in events"
            :key="event.id"
            :value="event.id"
          >
            {{ event.name }}（{{ event.unit }}）
          </option>
        </select>
      </div>

      <!-- 年選択 -->
      <div>
        <label class="label">
          <span class="label-text font-bold text-base">
            年選択
          </span>
        </label>

        <select
          v-model="selectedYear"
          class="select select-bordered w-full h-14 text-base font-semibold"
        >
          <option value="">全て</option>
          <option
            v-for="year in years"
            :key="year"
            :value="year"
          >
            {{ year }}年
          </option>
        </select>
      </div>

    </div>

    <!-- ===== グラフ ===== -->
    <div class="card bg-base-100 shadow-md p-6 mb-6">
      <h2 class="text-lg font-bold mb-4">
        推移グラフ
      </h2>
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- ===== テーブル ===== -->
    <div class="card bg-base-100 shadow-md p-6">
      <h2 class="text-lg font-bold mb-4">
        記録一覧
      </h2>

      <table class="table w-full">
        <thead>
          <tr>
            <th>日付</th>
            <th>記録</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredRecords.length === 0">
            <td colspan="2" class="text-center text-gray-400">
              記録がありません
            </td>
          </tr>

          <tr
            v-for="record in filteredRecords"
            :key="record.date"
          >
            <td>{{ record.date }}</td>
            <td class="font-semibold">
              {{ record.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue"
import { useRoute } from "vue-router"
import Chart from "chart.js/auto"

/* ===============================
   ルート・トークン取得
================================ */
const route = useRoute()
const token = route.params.token   // ← ここ重要（queryではなくparams）

/* ===============================
   GAS URL
================================ */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec"

/* ===============================
   状態管理
================================ */
const playerName = ref("")
const events = ref([])
const records = ref([])

const selectedEvent = ref("")
const selectedYear = ref("")

const chartCanvas = ref(null)
let chartInstance = null

/* ===============================
   選択中種目名（印刷用）
================================ */
const selectedEventName = computed(() => {
  const event = events.value.find(e => e.id === selectedEvent.value)
  if (!event) return ""
  return `${event.name}（${event.unit}）`
})

/* ===============================
   年一覧（自動生成）
================================ */
const years = computed(() => {
  const set = new Set()
  records.value.forEach(r => {
    if (r.date) {
      set.add(r.date.slice(0, 4))
    }
  })
  return [...set].sort((a, b) => b - a)
})

/* ===============================
   年フィルタ
================================ */
const filteredRecords = computed(() => {
  if (!selectedYear.value) return records.value

  return records.value.filter(r =>
    r.date.startsWith(selectedYear.value)
  )
})

/* ===============================
   種目取得
================================ */
async function loadEvents() {
  const res = await fetch(`${GAS_URL}?type=events`)
  events.value = await res.json()

  if (events.value.length > 0) {
    selectedEvent.value = events.value[0].id
  }
}

/* ===============================
   個人データ取得
================================ */
async function loadPlayerData() {
  if (!selectedEvent.value) return

  const res = await fetch(
    `${GAS_URL}?type=playerStats&token=${token}&event=${selectedEvent.value}`
  )

  const data = await res.json()

  records.value = data.sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  if (records.value.length > 0) {
    playerName.value = records.value[0].name
  }

  await nextTick()
  drawChart()
}

/* ===============================
   グラフ描画
================================ */
function drawChart() {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: "line",
    data: {
      labels: filteredRecords.value.map(r => r.date),
      datasets: [
        {
          label: "記録",
          data: filteredRecords.value.map(r => r.value),
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  })
}

/* ===============================
   PDF出力
================================ */
function exportPDF() {
  window.print()
}

/* ===============================
   監視
================================ */
watch(selectedEvent, loadPlayerData)

watch(selectedYear, async () => {
  await nextTick()
  drawChart()
})

/* ===============================
   初期処理
================================ */
onMounted(async () => {
  await loadEvents()
  await loadPlayerData()
})
</script>

<style>

/* 通常時は非表示 */
.print-only {
  display: none;
}

@media print {

  body {
    background: white !important;
  }

  /* 上部ナビ消す */
  .navbar,
  .tabs {
    display: none !important;
  }

  /* 表示条件カード消す */
  .print-hide {
    display: none !important;
  }

  /* ボタン・select消す */
  button,
  select {
    display: none !important;
  }

  /* 印刷時のみ表示 */
  .print-only {
    display: block !important;
  }

  .card {
    box-shadow: none !important;
    border: none !important;
  }

  canvas {
    max-height: 280px !important;
  }

  table {
    page-break-inside: avoid;
  }

}
</style>
