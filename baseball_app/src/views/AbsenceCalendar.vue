<template>
    <div class="p-4">
  
      <h2 class="text-2xl font-bold mb-4">
        休暇カレンダー
      </h2>
  
      <!-- カレンダー -->
      <FullCalendar :options="calendarOptions" />
  
      <!-- モーダル -->
      <div v-if="modalOpen" class="modal modal-open">
        <div class="modal-box">
  
          <h3 class="font-bold text-lg mb-4">
            {{ selectedDate }} 出席状況
          </h3>
  
          <pre class="whitespace-pre-line text-sm">
  {{ modalText }}
          </pre>
  
          <div class="modal-action">
            <button class="btn" @click="modalOpen=false">
              閉じる
            </button>
          </div>
  
        </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue"
  import FullCalendar from "@fullcalendar/vue3"
  import dayGridPlugin from "@fullcalendar/daygrid"
  import interactionPlugin from "@fullcalendar/interaction"
  
  const absenceMap = ref({})
  
  const modalOpen = ref(false)
  const modalText = ref("")
  const selectedDate = ref("")
  
  const calendarOptions = ref({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    locale: "ja",
    height: "auto",
    events: [],
  
    dateClick: (info) => {
  
      const date = info.dateStr
      const data = absenceMap.value[date]
  
      selectedDate.value = date
  
      if (!data) {
        modalText.value = "登録なし"
        modalOpen.value = true
        return
      }
  
      let message = ""
  
      if (data.absent.length > 0) {
        message += "欠席\n"
        message += data.absent.join("\n")
        message += "\n\n"
      }
  
      if (data.continue.length > 0) {
        message += "10時参加\n"
        message += data.continue.join("\n")
      }
  
      modalText.value = message
      modalOpen.value = true
  
    }
  
  })
  
  const loadAbsences = async () => {
  
    try {
  
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbxqKwmN0lePHkLrQzU4SImrrANWpq4bXA3ZNJhGeufV1XsRNao8LO3RzfhLOYtTis8U/exec?type=getAllAbsences&key=123456"
      )
  
      const data = await res.json()
  
      const map = {}
  
      data.forEach(r => {
  
        if (!map[r.date]) {
          map[r.date] = {
            absent: [],
            continue: []
          }
        }
  
        if (r.type === "absent") {
          map[r.date].absent.push(r.playerName)
        }
  
        if (r.type === "continue") {
          map[r.date].continue.push(r.playerName)
        }
  
      })
  
      absenceMap.value = map
  
      const eventList = []
  
      Object.keys(map).forEach(date => {
  
        const item = map[date]
  
        if (item.absent.length > 0) {
          eventList.push({
            title: `欠席 ${item.absent.length}`,
            start: date,
            backgroundColor: "#ef4444"
          })
        }
  
        if (item.continue.length > 0) {
          eventList.push({
            title: `10時 ${item.continue.length}`,
            start: date,
            backgroundColor: "#f59e0b"
          })
        }
  
      })
  
      calendarOptions.value.events = eventList
  
    } catch (e) {
      console.error(e)
    }
  
  }
  
  onMounted(() => {
    loadAbsences()
  })
  
  </script>