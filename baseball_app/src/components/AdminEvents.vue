<template>
  <section class="admin-events">
    <h2>種目管理</h2>

    <!-- =========================
         種目追加フォーム
    ========================== -->
    <div class="card">
      <h3>種目追加</h3>

      <div class="field">
        <label>ID（英数字）</label>
        <input v-model="newId" placeholder="例: sprint100" />
      </div>

      <div class="field">
        <label>表示名</label>
        <input v-model="newName" placeholder="例: 100m走" />
      </div>

      <div class="field">
        <label>単位</label>
        <input v-model="newUnit" placeholder="秒 / 回 / m など" />
      </div>

      <div class="field">
        <label>並び順</label>
        <select v-model="newSort">
          <option value="asc">昇順（小さい順）</option>
          <option value="desc">降順（大きい順）</option>
        </select>
      </div>

      <button @click="addEvent">追加</button>
    </div>

    <!-- =========================
         登録済み種目一覧
    ========================== -->
    <div class="card">
      <h3>登録済み種目</h3>

      <table v-if="props.events && props.events.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>表示名</th>
            <th>単位</th>
            <th>並び</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in props.events" :key="e.id">
            <td>{{ e.id }}</td>
            <td>{{ e.name }}</td>
            <td>{{ e.unit }}</td>
            <td>{{ e.sort === 'asc' ? '昇順' : '降順' }}</td>
            <td>
              <button class="danger" @click="deleteEvent(e.id)">
                削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty">
        まだ種目は登録されていません
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from "vue"

const props = defineProps({
  events: Array
})

const emit = defineEmits(["refresh"])

/*************************************************
 * GAS URL
 *************************************************/
const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec"

/*************************************************
 * state
 *************************************************/
const newId = ref("")
const newName = ref("")
const newUnit = ref("")
const newSort = ref("asc")

/*************************************************
 * 種目追加
 *************************************************/
async function addEvent() {
  if (!newId.value || !newName.value) {
    alert("IDと表示名は必須です")
    return
  }

  const res = await fetch(`${GAS_BASE_URL}?type=addEvent`, {
    method: "POST",
    body: JSON.stringify({
      id: newId.value,
      name: newName.value,
      unit: newUnit.value,
      sort: newSort.value
    })
  })

  const result = await res.json()

  if (result.status === "ok") {
    alert("追加しました")

    emit("refresh")   // 親へ通知（OK）

    // フォーム初期化
    newId.value = ""
    newName.value = ""
    newUnit.value = ""
    newSort.value = "asc"

    await loadEvents()  // 再取得
  } else {
    alert(result.message)
  }
}

/*************************************************
 * 種目削除
 *************************************************/
async function deleteEvent(id) {
  if (!confirm("本当に削除しますか？")) return

  const res = await fetch(`${GAS_BASE_URL}?type=deleteEvent`, {
    method: "POST",
    body: JSON.stringify({ id })
  })

  const result = await res.json()

  if (result.status === "ok") {
    emit("refresh")   // ★ これ追加
  } else {
    alert(result.message)
  }
}
</script>

<style scoped>
.admin-events {
  margin-top: 40px;
}

.card {
  background: #f7f7f7;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

input,
select {
  padding: 6px;
}

button {
  padding: 6px 12px;
  cursor: pointer;
}

button.danger {
  background: #d9534f;
  color: white;
  border: none;
}

.empty {
  color: #777;
}
</style>
