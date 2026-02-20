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

        <div v-if="loading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

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

            <!-- URLコピー -->
            <button
              class="btn btn-sm btn-outline"
              @click="copyUrl(m.token)"
            >
              URLコピー
            </button>

          </div>

        </div>

        <div v-else class="text-center text-base-content/60 py-8">
          登録選手がいません
        </div>

      </div>
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

/*************************************************
 * 選手一覧取得
 *************************************************/
async function loadMembers() {
  loading.value = true

  try {
    const res = await fetch(`${GAS_BASE_URL}?type=members`)
    members.value = await res.json()
  } catch (e) {
    console.error(e)
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
function copyUrl(token) {
  const url = `${window.location.origin}/#/player/${token}`

  navigator.clipboard.writeText(url)
  alert("URLをコピーしました")
}

/*************************************************
 * 初期処理
 *************************************************/
onMounted(loadMembers)
</script>
