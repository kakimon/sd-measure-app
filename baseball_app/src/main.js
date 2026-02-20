import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";   // ← これ追加

createApp(App)
  .use(router)
  .mount("#app");
