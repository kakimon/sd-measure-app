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
      <div class="navbar bg-base-100 shadow-md px-4 sm:px-6">
        <div class="flex items-center gap-2">

          <!-- ハンバーガー（モバイルのみ） -->
          <div class="lg:hidden">
            <label
              for="app-drawer"
              class="btn btn-square btn-ghost w-11 h-11 rounded-xl mt-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                class="w-7 h-7 fill-current"
              >
                <rect y="60" width="512" height="60" />
                <rect y="226" width="512" height="60" />
                <rect y="392" width="512" height="60" />
              </svg>
            </label>
          </div>

          <!-- タイトル -->
          <span class="text-lg font-semibold leading-none -mt-4">
            測定管理アプリ
          </span>

        </div>
      </div>

      <!-- ★ これが抜けていました -->
      <div class="flex-1 p-4 max-w-3xl mx-auto w-full">
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
            <RouterLink to="/stats" class="rounded-lg" @click="closeDrawer">
              種目別記録
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/members" class="rounded-lg" @click="closeDrawer">
              選手一覧
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/register" class="rounded-lg" @click="closeDrawer">
              測定登録
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/member-register" class="rounded-lg" @click="closeDrawer">
              選手登録
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/admin/events" class="rounded-lg" @click="closeDrawer">
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

function closeDrawer() {
  if (drawerToggle.value) {
    drawerToggle.value.checked = false
  }
}
</script>