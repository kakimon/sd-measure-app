<template>
  <div class="space-y-8">

    <div>
      <h1 class="text-2xl font-bold">種目管理</h1>
      <p class="text-sm text-base-content/60 mt-1">
        種目の追加・削除を行います
      </p>
    </div>

    <AdminEvents
      :events="events"
      @refresh="loadEvents"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import AdminEvents from "../components/AdminEvents.vue"

const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec"

const events = ref([])

async function loadEvents() {
  const res = await fetch(`${GAS_BASE_URL}?type=events`)
  events.value = await res.json()
}

onMounted(loadEvents)
</script>
