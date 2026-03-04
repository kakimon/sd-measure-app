import { createRouter, createWebHashHistory } from "vue-router";

import StatsView from "../views/StatsView.vue";
import RegisterView from "../views/RegisterView.vue";
import AdminEventsView from "../views/AdminEventsView.vue";
import PlayerView from "../views/PlayerView.vue"
import MembersView from "../views/MembersView.vue"
import MemberRegisterView from "../views/MemberRegisterView.vue"
import AdminAbsence from "../views/AdminAbsence.vue"

const routes = [
  {
    path: "/",
    redirect: "/stats",
  },
  {
    path: "/stats",
    name: "stats",
    component: StatsView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/admin/events",
    name: "adminEvents",
    component: AdminEventsView,
    meta: { requiresAdmin: true },   // ← 追加
  },
  {
    path: "/player/:token",
    name: "player",
    component: PlayerView,
  },
  {
    path: "/members",
    component: MembersView
  },
  {
    path: "/member-register",
    component: MemberRegisterView,
  },
  {
    path: "/admin/absence",
    name: "adminAbsence",
    component: AdminAbsence, // ←追加
    meta: { requiresAdmin: true }, // ←追加
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 🔐 ここに追加する！！
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {

    const key = to.query.key   // ← これだけでOK！！

    if (key !== "123456") {
      return next("/stats")
    }
  }

  next()
})

export default router;
