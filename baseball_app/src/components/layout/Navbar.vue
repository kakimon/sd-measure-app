<template>
  <div class="navbar bg-base-100 shadow rounded-box mb-4">
    <div class="navbar-start">
      <!-- drawer toggle -->
      <label
        for="app-drawer"
        class="btn btn-ghost btn-circle"
        aria-label="menu"
      >
        ☰
      </label>

      <div class="ml-2 font-bold text-base-content">
        {{ title }}
      </div>
    </div>

    <div class="navbar-end">
      <label class="swap swap-rotate btn btn-ghost btn-circle">
        <input type="checkbox" @change="toggleTheme" />
        <span class="swap-off">🌙</span>
        <span class="swap-on">☀️</span>
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: "測定管理" },
})

function toggleTheme(e) {
  const isDark = e.target.checked
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light"
  )
}
</script>
