<template>
  <div class="drawer">
    <input id="app-drawer" type="checkbox" class="drawer-toggle" />

    <!-- main -->
    <div class="drawer-content">
      <slot />
    </div>

    <!-- side -->
    <div class="drawer-side">
      <label for="app-drawer" class="drawer-overlay"></label>

      <aside class="menu p-4 w-72 min-h-full bg-base-200 text-base-content">
        <div class="text-lg font-bold mb-3">メニュー</div>

        <ul class="menu gap-1">
          <li><RouterLink to="/" class="rounded-box">ダッシュボード</RouterLink></li>
          <li><RouterLink to="/register" class="rounded-box">測定登録</RouterLink></li>
          <li><RouterLink to="/stats" class="rounded-box">種目別記録</RouterLink></li>

          <div class="divider my-2"></div>

          <li><RouterLink to="/admin/events" class="rounded-box">種目管理</RouterLink></li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router"
</script>
