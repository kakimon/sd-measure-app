<template>
  <div class="min-h-screen bg-base-200">

    <!-- 上部ナビ（印刷時非表示） -->
    <div class="navbar bg-base-100 shadow no-print">
      <div class="flex-1">
        <span class="text-lg font-bold">測定管理アプリ</span>
      </div>
    </div>

    <!-- タブナビ（印刷時非表示） -->
    <div class="tabs tabs-boxed justify-center mt-4 no-print">
      <RouterLink
        to="/stats"
        class="tab"
        :class="{ 'tab-active': route.path.startsWith('/stats') }"
      >
        種目別記録
      </RouterLink>

      <RouterLink
        to="/members"
        class="tab"
        :class="{ 'tab-active': route.path.startsWith('/members') }"
      >
        選手一覧
      </RouterLink>

      <RouterLink
        to="/register"
        class="tab"
        :class="{ 'tab-active': route.path.startsWith('/register') }"
      >
        測定登録
      </RouterLink>
      
      <RouterLink to="/member-register" class="tab">
        選手登録
      </RouterLink>

      <RouterLink
        to="/admin/events"
        class="tab"
        :class="{ 'tab-active': route.path.startsWith('/admin/events') }"
      >
        種目管理
      </RouterLink>
    </div>

    <!-- 画面表示 -->
    <div class="p-4 max-w-3xl mx-auto">
      <RouterView />
    </div>

  </div>
</template>

<script setup>
import { useRoute, RouterView, RouterLink } from "vue-router"
const route = useRoute()
</script>

<style>
/* --- iOS 安定化 --- */
input,
select {
  font-size: 16px !important;
}

/* モバイル高さ安定 */
@media (max-width: 640px) {
  .select,
  .input {
    height: 3.5rem;
  }
}

/* 印刷設定 */
@media print {
  /* ナビゲーション全削除 */
  .navbar,
  .tabs,
  .no-print {
    display: none !important;
  }

  /* 表示条件カードを非表示（各View側で使う想定） */
  .print-hide {
    display: none !important;
  }

  /* 余白調整 */
  body {
    background: white !important;
  }

  .card {
    box-shadow: none !important;
  }
}
</style>
