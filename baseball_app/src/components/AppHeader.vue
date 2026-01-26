<template>
  <header class="header">
    <!-- 左：ハンバーガーメニュー -->
    <button class="icon" @click="$emit('menu')">☰</button>

    <!-- 中央：タイトル -->
    <span class="title">{{ title }}</span>

    <!-- 右：ダミー（中央寄せ用） -->
    <div class="icon"></div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>
