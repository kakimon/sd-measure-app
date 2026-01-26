<template>
  <div id="app">
    <!-- ヘッダー -->
    <AppHeader
      :title="title"
      @menu="menuOpen = true"
    />

    <!-- オーバーレイ -->
    <div
      class="overlay"
      v-if="menuOpen"
      @click="menuOpen = false"
    ></div>

    <!-- サイドメニュー -->
    <aside class="menu" :class="{ open: menuOpen }">
      <div class="menu-item" @click="go('measure')">
        測定入力
      </div>
      <div class="menu-item" @click="go('register')">
        新規選手登録
      </div>
    </aside>

    <!-- 測定入力 -->
    <MeasureForm
      v-if="page === 'measure'"
      v-model:event="event"
      v-model:date="date"
      :members="members"
      @submit="submit"
    />

    <!-- 新規選手登録（仮） -->
    <main v-if="page === 'register'" class="page">
      <div class="field">
        <label>選手名</label>
        <input
          v-model="newName"
          placeholder="例：山田 太郎"
        />
      </div>

      <button class="primary" @click="register">
        登録してURL発行（仮）
      </button>
    </main>

    <!-- トースト -->
    <div class="toast" v-if="toast">
      {{ toast }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import MeasureForm from "./components/MeasureForm.vue";

/* ===== GAS URL ===== */
const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec";

const GAS_MEMBERS_URL = `${GAS_BASE_URL}?type=members`;
const GAS_POST_URL = GAS_BASE_URL;
// GAS③：新規登録・token/URL発行（★今回ここに反映）
const GAS_REGISTER_API =
"https://script.google.com/macros/s/AKfycbz3BPVC-eaWIfe3UGDXsWS5eVB03Ybn-o773Ty6NJmoFPso7aUmGJ00fkqiESiHklu6/exec";

/* ===== 画面制御 ===== */
const page = ref("measure");
const title = ref("測定入力");
const menuOpen = ref(false);

/* ===== 測定フォーム状態 ===== */
const event = ref("m50");
const date = ref(new Date().toISOString().slice(0, 10));

/* ===== 選手一覧 ===== */
const members = ref([]);

/* ===== 新規登録 ===== */
const newName = ref("");

/* ===== トースト ===== */
const toast = ref("");

/* ===== 画面切替 ===== */
function go(p) {
  page.value = p;
  title.value = p === "register" ? "新規選手登録" : "測定入力";
  menuOpen.value = false;
}

/* ===== トースト表示 ===== */
function showToast(msg) {
  toast.value = msg;
  setTimeout(() => {
    toast.value = "";
  }, 2000);
}

/* ===== members 読み込み ===== */
async function loadMembers() {
  try {
    const res = await fetch(GAS_MEMBERS_URL);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (Array.isArray(data)) {
      members.value = data;
      console.log("members loaded:", members.value);
    } else {
      console.error("Invalid response format:", data);
      showToast("選手一覧の形式が正しくありません");
    }
  } catch (e) {
    console.error("loadMembers error:", e);
    showToast("選手一覧の取得に失敗しました");
  }
}

/* ===== 測定登録 ===== */
function submit(value) {
  if (!value || !value.token || !value.value) {
    showToast("未入力の項目があります");
    return;
  }

  fetch(GAS_POST_URL, {
    method: "POST",
    mode: "no-cors", // ★ CORS回避の要
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  })
    .then(() => {
      showToast("登録しました");
    })
    .catch(err => {
      console.error("POST error:", err);
      showToast("通信エラーが発生しました");
    });
}

/* ===== 新規登録（仮） ===== */
function register() {
  if (!newName.value) {
    showToast("選手名を入力してください");
    return;
  }

  fetch(`${GAS_REGISTER_API}?type=register`, {
    method: "POST",
    mode: "no-cors", // GAS③は JSON を返すが、まずは成功前提でOK
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName.value,
    }),
  })
    .then(() => {
      showToast("登録してURLを発行しました");
      newName.value = "";
      loadMembers();   // GAS①から再取得
      go("measure");   // 測定入力画面へ戻る
    })
    .catch(err => {
      console.error(err);
      showToast("登録に失敗しました");
    });
}

/* ===== 初期処理 ===== */
onMounted(() => {
  loadMembers();
});
</script>