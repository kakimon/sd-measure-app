<template>
  <div class="space-y-8 max-w-xl mx-auto">

    <!-- タイトル -->
    <div>
      <h1 class="text-3xl font-bold">選手登録</h1>
      <p class="text-base-content/60 mt-2">
        新しい選手を登録します
      </p>
    </div>

    <!-- 入力カード -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body space-y-6">

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">選手名</span>
          </label>

          <input
            v-model="name"
            type="text"
            placeholder="例：山田 太郎"
            class="input input-bordered input-lg w-full focus:input-primary"
            @keyup.enter="registerMember"
          />
        </div>

        <button
          class="btn btn-primary btn-lg w-full transition-all"
          :class="{ loading: loading }"
          :disabled="loading"
          @click="registerMember"
        >
          登録する
        </button>

      </div>
    </div>

  </div>

  <!-- ✅ 完全fixedトースト -->
  <div
    v-if="toastMessage"
    class="fixed top-6 left-1/2 -translate-x-1/2 z-50
           transition-all duration-300 ease-out"
  >
    <div
      class="alert shadow-xl px-6 py-3"
      :class="toastType === 'success'
        ? 'alert-success'
        : 'alert-error'"
    >
      <span class="font-medium">
        {{ toastMessage }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec"

const name = ref("")
const loading = ref(false)

const toastMessage = ref("")
const toastType = ref("success")

async function registerMember() {

  if (!name.value.trim()) {
    showToast("名前を入力してください", "error")
    return
  }

  loading.value = true

  try {

    const res = await fetch(`${GAS_BASE_URL}?type=createMember`, {
      method: "POST",
      body: JSON.stringify({
        name: name.value.trim(),
      }),
    })

    const data = await res.json()

    if (data.status === "error" || data.error) {
      showToast(data.message || data.error, "error")
      return
    }

    if (data.status === "ok") {

      await navigator.clipboard.writeText(data.url)

      showToast("登録完了（URLをコピーしました）", "success")

      name.value = ""

      // 1.5秒後に一覧へ戻る
      setTimeout(() => {
        router.push("/members")
      }, 1500)
    }

  } catch (err) {
    showToast("登録に失敗しました", "error")
  } finally {
    loading.value = false
  }
}

function showToast(message, type) {
  toastMessage.value = message
  toastType.value = type

  setTimeout(() => {
    toastMessage.value = ""
  }, 2500)
}
</script>
