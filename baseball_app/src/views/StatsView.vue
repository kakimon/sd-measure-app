<template>
  <div class="space-y-8">

    <!-- タイトル -->
    <div>
      <h1 class="text-2xl font-bold">種目別記録</h1>
      <p class="text-sm text-base-content/60 mt-1">
        表示中：
        <span class="font-medium">
          {{ selectedDate ? selectedDate : "最新記録" }}
        </span>
      </p>
    </div>

    <!-- 条件カード -->
    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-4">

        <!-- 種目 -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">種目</span>
          </label>

          <select
            v-model="selectedEvent"
            class="select select-bordered select-lg w-full rounded-xl"
          >
            <option
              v-for="e in events"
              :key="e.id"
              :value="e.id"
            >
              {{ e.name }}（{{ e.unit }}）
            </option>
          </select>
        </div>

        <!-- 日付 -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">
              測定日（未選択＝最新）
            </span>
          </label>

          <input
            type="date"
            v-model="selectedDate"
            class="input input-bordered input-lg w-full rounded-xl"
          />
        </div>

      </div>
    </div>

    <!-- 記録カード -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">

        <h2 class="card-title mb-4">記録一覧</h2>

        <!-- ローディング -->
        <div v-if="loading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- データあり -->
        <div
          v-else-if="sortedRecords.length"
          class="overflow-x-auto"
        >
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>順位</th>
                <th>選手</th>
                <th>記録</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, index) in sortedRecords"
                :key="r.name"
              >
                <td>
                  <span
                    class="badge"
                    :class="index === 0 ? 'badge-success' : 'badge-ghost'"
                  >
                    {{ index + 1 }}
                  </span>
                </td>

                <td>{{ r.name }}</td>

                <td class="font-semibold">
                  {{ r.value }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- データなし -->
        <div
          v-else
          class="text-center text-base-content/60 py-8"
        >
          この条件の記録はありません
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";

/*************************************************
 * GAS URL
 *************************************************/
const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec";

/*************************************************
 * state
 *************************************************/
const events = ref([]);
const selectedEvent = ref("");
const selectedDate = ref("");
const records = ref([]);
const loading = ref(false);

/*************************************************
 * 種目一覧取得
 *************************************************/
async function loadEvents() {
  const res = await fetch(`${GAS_BASE_URL}?type=events`);
  events.value = await res.json();

  if (events.value.length && !selectedEvent.value) {
    selectedEvent.value = events.value[0].id;
  }
}

/*************************************************
 * 記録取得
 *************************************************/
async function loadStats() {
  if (!selectedEvent.value) return;

  loading.value = true;

  try {
    const params = new URLSearchParams({
      type: "stats",
      event: selectedEvent.value,
    });

    if (selectedDate.value) {
      params.append("date", selectedDate.value);
    }

    const res = await fetch(`${GAS_BASE_URL}?${params}`);
    records.value = await res.json();
  } catch (e) {
    console.error(e);
    records.value = [];
  } finally {
    loading.value = false;
  }
}

/*************************************************
 * 並び順制御（asc / desc）
 *************************************************/
const sortedRecords = computed(() => {
  const event = events.value.find(
    e => e.id === selectedEvent.value
  );

  if (!event) return records.value;

  return [...records.value].sort((a, b) =>
    event.sort === "asc"
      ? a.value - b.value
      : b.value - a.value
  );
});

/*************************************************
 * lifecycle
 *************************************************/
onMounted(async () => {
  await loadEvents();
  await loadStats();
});

/*************************************************
 * watch
 *************************************************/
watch([selectedEvent, selectedDate], loadStats);
</script>
