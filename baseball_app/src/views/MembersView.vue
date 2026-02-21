<template>
  <div class="space-y-6">

    <!-- タイトル -->
    <div>
      <h1 class="text-2xl font-bold">選手一覧</h1>
      <p class="text-sm text-base-content/60 mt-1">
        登録された選手の個人ページ管理
      </p>
    </div>

    <!-- カード -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">

        <!-- ローディング -->
        <div v-if="loading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- 一覧 -->
        <div v-else-if="members.length">

          <div
            v-for="m in members"
            :key="m.token"
            class="flex items-center justify-between border-b py-3"
          >

            <!-- 名前クリックで遷移 -->
            <div
              class="cursor-pointer font-semibold hover:text-primary"
              @click="goToPlayer(m.token)"
            >
              {{ m.name }}
            </div>

            <!-- ボタン群 -->
            <div class="flex gap-2">

              <button
                class="btn btn-sm btn-outline"
                @click="copyUrl(m.token)"
              >
                URLコピー
              </button>

              <button
                class="btn btn-sm btn-error btn-outline"
                @click="deleteMember(m)"
              >
                削除
              </button>

            </div>

          </div>

        </div>

        <!-- 空表示 -->
        <div v-else class="text-center text-base-content/60 py-8">
          登録選手がいません
        </div>

      </div>
    </div>

  </div>

  <!-- トースト -->
  <div
    v-if="toastMessage"
    class="fixed top-6 left-1/2 -translate-x-1/2 z-50"
  >
    <div
      class="alert shadow-lg px-6 py-3"
      :class="toastType === 'success'
        ? 'alert-success'
        : 'alert-error'"
    >
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

/*************************************************
 * GAS URL
 *************************************************/
const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec"

/*************************************************
 * state
 *************************************************/
const members = ref([])
const loading = ref(false)
const router = useRouter()

const toastMessage = ref("")
const toastType = ref("success")

/*************************************************
 * 選手一覧取得
 *************************************************/
async function loadMembers() {
  loading.value = true

  try {
    const res = await fetch(`${GAS_BASE_URL}?type=members`)
    members.value = await res.json()
  } catch (e) {
    members.value = []
  } finally {
    loading.value = false
  }
}

/*************************************************
 * 遷移
 *************************************************/
function goToPlayer(token) {
  router.push(`/player/${token}`)
}

/*************************************************
 * URLコピー
 *************************************************/
async function copyUrl(token) {
  const url = `${window.location.origin}/#/player/${token}`
  await navigator.clipboard.writeText(url)
  showToast("URLをコピーしました", "success")
}

/*************************************************
 * 削除（安定版）
 *************************************************/
async function deleteMember(member) {

  if (!confirm(`${member.name} を削除しますか？`)) return

  try {

    const res = await fetch(GAS_BASE_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "deleteMember",
        token: member.token
      }),
    })

    const data = await res.json()

    if (data.status === "ok") {
      showToast("削除しました", "success")
      await loadMembers()
    } else {
      showToast(data.message || "削除に失敗しました", "error")
    }

  } catch (err) {
    showToast("削除エラー", "error")
  }
}

/*************************************************
 * トースト
 *************************************************/
function showToast(message, type) {
  toastMessage.value = message
  toastType.value = type

  setTimeout(() => {
    toastMessage.value = ""
  }, 2500)
}

/*************************************************
 * 初期処理
 *************************************************/
onMounted(loadMembers)
</script>
