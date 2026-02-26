<template>
  <div class="p-6 print-area">

    <!-- タイトル -->
    <h1 class="text-3xl font-bold mb-2">
      {{ playerName }} の記録
    </h1>
    <p class="text-gray-500">
      個人種目別記録
    </p>

    <!-- ===============================
         ★ 兄弟タブ（タブのみ）
    ================================= -->
    <div role="tablist" class="tabs tabs-lift mt-4 mb-6 print-hide">
      <div
        v-for="p in players"
        :key="p.token"
        role="tab"
        class="tab flex items-center gap-2"
        :class="{ 'tab-active': currentToken === p.token }"
      >
        <span
          class="cursor-pointer"
          @click="switchPlayer(p.token)"
        >
          {{ p.label }}
        </span>

        <button
          v-if="p.token !== baseToken"
          class="text-xs text-error hover:scale-110 transition"
          @click.stop="removeSibling(p.token)"
        >
          ✕
        </button>
      </div>

      <!-- 追加タブ -->
      <a role="tab" class="tab" @click="openAddModal">
        ＋
      </a>
    </div>

    <!-- ===============================
         🗓 休暇セクション（tabsの外）
    ================================= -->
    <div class="card bg-base-100 shadow-md p-6 mb-6">
      <h2 class="text-lg font-bold mb-4">🗓 休暇連絡</h2>

      <input
        type="date"
        v-model="absenceDate"
        class="input input-bordered w-full mb-3"
      />

      <div class="flex gap-2 mb-4">
        <button
          class="btn btn-error btn-sm flex-1"
          @click="registerAbsence('absent')"
        >
          欠席
        </button>

        <button
          class="btn btn-warning btn-sm flex-1"
          @click="registerAbsence('continue')"
        >
          10時以降参加
        </button>
      </div>

      <div class="divider">履歴</div>

      <div v-if="absences.length === 0" class="text-gray-400 text-sm">
        登録なし
      </div>

      <div
        v-for="a in absences"
        :key="a.date"
        class="flex justify-between items-center border-b py-2"
      >
        <div>
          {{ a.date }}
          <span
            class="badge ml-2"
            :class="a.type==='absent' ? 'badge-error' : 'badge-warning'"
          >
            {{ a.type==='absent' ? '欠席' : '10時以降参加' }}
          </span>
        </div>

        <button
          class="btn btn-ghost btn-xs text-error"
          @click="deleteAbsence(a.date)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- ===============================
         印刷時サマリー
    ================================= -->
    <div class="mb-4 print-only">
      <p><strong>種目：</strong>{{ selectedEventName }}</p>
      <p><strong>対象年：</strong>
        {{ selectedYear ? selectedYear + '年' : '全期間' }}
      </p>
    </div>

    <!-- ===============================
         表示条件カード
    ================================= -->
    <div class="card bg-base-100 shadow-md p-6 mb-6 print-hide">

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">表示条件</h2>

        <button class="btn btn-neutral btn-sm" @click="exportPDF">
          📄 PDF出力
        </button>
      </div>

      <!-- 種目選択 -->
      <div class="mb-4">
        <label class="label">
          <span class="label-text font-bold text-base">種目選択</span>
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
          <span class="label-text font-bold text-base">年選択</span>
        </label>

        <select
          v-model="selectedYear"
          class="select select-bordered w-full h-14 text-base font-semibold"
        >
          <option value="">全て</option>
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}年
          </option>
        </select>
      </div>

    </div>

    <!-- ===============================
         グラフ
    ================================= -->
    <div class="card bg-base-100 shadow-md p-6 mb-6">
      <h2 class="text-lg font-bold mb-4">推移グラフ</h2>
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- ===============================
         テーブル
    ================================= -->
    <div class="card bg-base-100 shadow-md p-6">
      <h2 class="text-lg font-bold mb-4">記録一覧</h2>

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

          <tr v-for="record in filteredRecords" :key="record.date + record.value">
            <td>{{ record.date }}</td>
            <td class="font-semibold">{{ record.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===============================
         追加モーダル
    ================================= -->
    <dialog class="modal" :class="{ 'modal-open': addModalOpen }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">兄弟を追加</h3>
        <p class="text-sm text-base-content/60 mt-1">
          兄弟の「トークンURL」または「トークン」を入力してください
        </p>

        <input
          v-model="addInput"
          class="input input-bordered w-full mt-4"
          placeholder="例：https://kakimon.github.io/.../#/player/ABC123"
        />

        <div class="modal-action">
          <button class="btn btn-primary" @click="addSibling">
            追加
          </button>
          <button class="btn btn-ghost" @click="closeAddModal">
            閉じる
          </button>
        </div>
      </div>

      <label class="modal-backdrop" @click="closeAddModal"></label>
    </dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import Chart from "chart.js/auto"

/* ===============================
   ルート
================================ */
const route = useRoute()
const router = useRouter()

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
/* ===============================
   ★ 休暇機能
================================ */
const absenceTab = ref(false)        // タブ切替用
const absenceDate = ref("")
const absences = ref([])

const selectedEvent = ref("")
const selectedYear = ref("")

const chartCanvas = ref(null)
let chartInstance = null

/* ===============================
   ★ 兄弟タブ用
================================ */
const baseToken = computed(() => String(route.params.token || ""))
const currentToken = ref("") // いま表示している token
const players = ref([]) // [{token, label}]
const addModalOpen = ref(false)
const addInput = ref("")

const storageKey = computed(() => `siblings:${baseToken.value}`)

/* ===============================
   選択中種目名（印刷用）
================================ */
const selectedEventName = computed(() => {
  const event = events.value.find(e => String(e.id) === String(selectedEvent.value))
  if (!event) return ""
  return `${event.name}（${event.unit}）`
})

/* ===============================
   年一覧（自動生成）
================================ */
const years = computed(() => {
  const set = new Set()
  records.value.forEach(r => {
    if (r.date) set.add(r.date.slice(0, 4))
  })
  return [...set].sort((a, b) => b - a)
})

/* ===============================
   年フィルタ
================================ */
const filteredRecords = computed(() => {
  if (!selectedYear.value) return records.value
  return records.value.filter(r => r.date.startsWith(selectedYear.value))
})

/* ===============================
   種目取得
================================ */
async function loadEvents() {
  const res = await fetch(`${GAS_URL}?type=events`)
  events.value = await res.json()
  if (events.value.length > 0 && !selectedEvent.value) {
    selectedEvent.value = events.value[0].id
  }
}

/* ===============================
   個人データ取得（currentTokenで取得）
================================ */
async function loadPlayerData() {
  if (!selectedEvent.value || !currentToken.value) return

  const res = await fetch(
    `${GAS_URL}?type=playerStats&token=${currentToken.value}&event=${selectedEvent.value}`
  )

  const data = await res.json()

  records.value = data.sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  if (records.value.length > 0) {
    const name = records.value[0].name
    playerName.value = name

    const target = players.value.find(
      p => String(p.token) === String(currentToken.value)
    )

    if (target) {
      target.label = name
      saveSiblings()
    }
  } else {
    const name = await fetchMemberNameByToken(currentToken.value);

    playerName.value = name ? name : `(${currentToken.value})`;

    const target = players.value.find(
      p => String(p.token) === String(currentToken.value)
    );
    if (target && name) {
      target.label = name;
      saveSiblings();
    }
  }

  await nextTick()
  drawChart()
}

/* ===============================
   グラフ描画
================================ */
function drawChart() {
  if (!chartCanvas.value) return

  if (chartInstance) chartInstance.destroy()

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
      plugins: { legend: { display: false } }
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
   兄弟：localStorage 読み書き
================================ */
function loadSiblings() {
  // 最低でも自分（baseToken）は入れる
  const self = { token: baseToken.value, label: "本人" }

  try {
    const saved = localStorage.getItem(storageKey.value)
    const extra = saved ? JSON.parse(saved) : []
    const merged = [self, ...extra].filter(p => p?.token)

    // token重複を除去
    const map = new Map()
    for (const p of merged) {
      map.set(String(p.token), { token: String(p.token), label: p.label || p.token })
    }
    players.value = [...map.values()]
  } catch {
    players.value = [self]
  }
}

function saveSiblings() {
  // 本人以外だけ保存
  const extra = players.value
    .filter(p => String(p.token) !== String(baseToken.value))
    .map(p => ({ token: String(p.token), label: p.label || p.token }))

  localStorage.setItem(storageKey.value, JSON.stringify(extra))
}

/* ===============================
   兄弟：切り替え
================================ */
async function switchPlayer(token) {
  currentToken.value = String(token || "")
  selectedYear.value = "" // 兄弟切替時は年フィルタ解除（好みで削除OK）
  await loadPlayerData()
  await loadAbsences()
}

/* ===============================
   兄弟：追加
================================ */
function openAddModal() {
  addInput.value = ""
  addModalOpen.value = true
}
function closeAddModal() {
  addModalOpen.value = false
}

function extractTokenFromInput(text) {
  const t = String(text || "").trim()
  if (!t) return ""

  // 1) そのまま token が入力された場合（6文字想定だが制限は付けない）
  if (!t.includes("/")) return t

  // 2) Hash router URL から抽出（#/player/XXXX）
  const m1 = t.match(/#\/player\/([^/?#]+)/)
  if (m1?.[1]) return m1[1]

  // 3) 念のため /player/XXXX 形式
  const m2 = t.match(/\/player\/([^/?#]+)/)
  if (m2?.[1]) return m2[1]

  return ""
}

async function fetchMemberNameByToken(tk) {
  try {
    const res = await fetch(`${GAS_URL}?type=memberByToken&token=${tk}`);
    const data = await res.json();
    return data?.name ? String(data.name) : "";
  } catch {
    return "";
  }
}

async function addSibling() {
  const token = extractTokenFromInput(addInput.value)
  if (!token) {
    alert("トークン（またはトークンURL）が不正です")
    return
  }

  // すでに存在？
  if (players.value.some(p => String(p.token) === String(token))) {
    alert("すでに追加済みです")
    return
  }

  // ★ 先に名前を取ってラベルにする（記録0件でもOK）
  const name = await fetchMemberNameByToken(token);
  players.value.push({ token: String(token), label: name || token });
  saveSiblings();

  // 追加した子に切り替え
  addModalOpen.value = false
  await switchPlayer(token)
}

function removeSibling(token) {

if (!confirm("この兄弟を削除しますか？")) return

players.value = players.value.filter(
  p => String(p.token) !== String(token)
)

saveSiblings()

// 今表示中なら本人に戻す
if (String(currentToken.value) === String(token)) {
  switchPlayer(baseToken.value)
}
}
/* ===============================
   休暇履歴取得
================================ */
async function loadAbsences() {
  if (!currentToken.value) return

  const res = await fetch(
    `${GAS_URL}?type=getAbsenceHistory&token=${currentToken.value}`
  )
  const json = await res.json()

  if (json.status === "ok") {
    absences.value = json.data
  } else {
    absences.value = []
  }
}
/* ===============================
   休暇登録
================================ */
async function registerAbsence(type) {
  if (!absenceDate.value) {
    alert("日付を選択してください")
    return
  }

  await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      type: "registerAbsence",
      token: currentToken.value,
      date: absenceDate.value,
      absenceType: type
    })
  })

  absenceDate.value = ""
  await loadAbsences()
}
/* ===============================
   休暇削除
================================ */
async function deleteAbsence(date) {
  if (!confirm("削除しますか？")) return

  await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      type: "deleteAbsence",
      token: currentToken.value,
      date
    })
  })

  await loadAbsences()
}
/* ===============================
   監視
================================ */
watch(selectedEvent, loadPlayerData)

watch(selectedYear, async () => {
  await nextTick()
  drawChart()
})

// URL直打ちで別tokenに来たとき
watch(
  () => route.params.token,
  async () => {
    loadSiblings()
    currentToken.value = baseToken.value
    await loadPlayerData()
  }
)

/* ===============================
   初期処理
================================ */
onMounted(async () => {
  currentToken.value = baseToken.value
  loadSiblings()
  await loadEvents()
  await loadPlayerData()
  await loadAbsences() 
})
</script>

<style>
/* 通常時は非表示 */
.print-only { display: none; }

@media print {
  body { background: white !important; }

  /* 上部ナビ消す */
  .navbar, .tabs { display: none !important; }

  /* 表示条件カード消す */
  .print-hide { display: none !important; }

  /* ボタン・select消す */
  button, select { display: none !important; }

  /* 印刷時のみ表示 */
  .print-only { display: block !important; }

  .card { box-shadow: none !important; border: none !important; }

  canvas { max-height: 280px !important; }

  table { page-break-inside: avoid; }
}
</style>