<template>
  <div class="drawer lg:drawer-open">

    <!-- toggle -->
    <input
      id="app-drawer"
      type="checkbox"
      class="drawer-toggle"
      ref="drawerToggle"
    />

    <!-- =========================
         メインコンテンツ
    ========================== -->
    <div class="drawer-content flex flex-col min-h-screen bg-base-200">

      <!-- Navbar -->
      <div class="navbar bg-base-100 shadow">

        <!-- ハンバーガー（モバイルのみ表示） -->
        <div class="flex-none lg:hidden">
          <label for="app-drawer" class="btn btn-square btn-ghost">
            ☰
          </label>
        </div>

        <!-- タイトル -->
        <div class="flex-1">
          <span class="text-lg font-bold">測定管理アプリ</span>
        </div>

      </div>

      <!-- 画面本体 -->
      <div class="flex-1 p-4 max-w-4xl mx-auto w-full">
        <RouterView />
      </div>

    </div>

    <!-- =========================
         サイドメニュー
    ========================== -->
    <div class="drawer-side z-50">
      <label for="app-drawer" class="drawer-overlay"></label>

      <div class="w-64 min-h-screen bg-base-100 p-4 shadow-xl">

        <ul class="menu text-base-content gap-1">

          <li>
            <RouterLink
              to="/stats"
              class="rounded-lg"
              active-class="active"
              @click="closeDrawer"
            >
              種目別記録
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/members"
              class="rounded-lg"
              active-class="active"
              @click="closeDrawer"
            >
              選手一覧
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/register"
              class="rounded-lg"
              active-class="active"
              @click="closeDrawer"
            >
              測定登録
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/member-register"
              class="rounded-lg"
              active-class="active"
              @click="closeDrawer"
            >
              選手登録
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/admin/events"
              class="rounded-lg"
              active-class="active"
              @click="closeDrawer"
            >
              種目管理
            </RouterLink>
          </li>

        </ul>

      </div>
    </div>

  </div>
</template>

<script setup>
import { RouterView, RouterLink } from "vue-router"
import { ref } from "vue"

const drawerToggle = ref(null)

/* モバイル時メニュー自動クローズ */
function closeDrawer() {
  if (drawerToggle.value) {
    drawerToggle.value.checked = false
  }
}
</script>
