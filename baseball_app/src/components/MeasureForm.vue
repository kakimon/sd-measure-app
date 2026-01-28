<template>
  <main class="page">
    <!-- 測定種目 -->
    <div class="field">
      <label>測定種目</label>
      <select v-model="localEvent">
        <option value="m50">50m走</option>
        <option value="jump">立ち幅跳び</option>
        <option value="shuttle">シャトルラン</option>
        <option value="throw">投球速度</option>
      </select>
    </div>

    <!-- 選手 -->
    <div class="field">
      <label>選手</label>
      <select v-model="selectedMember">
        <option value="">選手を選択</option>
        <option
          v-for="m in members"
          :key="m.token"
          :value="m.token"
        >
          {{ m.name }}
        </option>
      </select>
    </div>

    <!-- 測定日 -->
    <div class="field">
      <label>測定日</label>
      <input type="date" v-model="localDate" />
    </div>

    <!-- 記録 -->
    <div class="field">
      <label>{{ valueLabel }}</label>
      <input
        type="number"
        v-model="localValue"
        step="0.01"
        placeholder="記録を入力"
      />
    </div>

    <button class="primary" @click="onSubmit">
      登録
    </button>
  </main>
</template>

<script setup>
import { ref, computed, watch } from "vue";

/* ===== props（親から受け取る） ===== */
const props = defineProps({
  event: String,
  date: String,
  members: {
    type: Array,
    default: () => []
  },
  clearKey: {
    type: Number,
    default: 0
  }
});

/* ===== emit（親へ通知） ===== */
const emit = defineEmits([
  "update:event",
  "update:date",
  "submit"
]);

/* ===== ローカル状態 ===== */
const localEvent = ref(props.event);
const localDate = ref(props.date);
const localValue = ref("");
const selectedMember = ref("");

/* ===== 親と同期 ===== */
watch(localEvent, v => emit("update:event", v));
watch(localDate, v => emit("update:date", v));

/* ===== クリア指示を監視（ここが今回の肝） ===== */
watch(
  () => props.clearKey,
  () => {
    localValue.value = "";
  }
);

/* ===== 表示ラベル ===== */
const valueLabel = computed(() => {
  return {
    m50: "記録（秒）",
    jump: "記録（cm）",
    shuttle: "回数",
    throw: "速度（km/h）"
  }[localEvent.value];
});

/* ===== 登録 ===== */
function onSubmit() {
  emit("submit", {
    event: localEvent.value,
    date: localDate.value,
    value: localValue.value,
    token: selectedMember.value
  });
  // ❌ ここではクリアしない（親の判断に任せる）
}
</script>