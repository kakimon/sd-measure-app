import { createRouter, createWebHashHistory } from "vue-router";

import StatsView from "../views/StatsView.vue";
import RegisterView from "../views/RegisterView.vue";
import AdminEventsView from "../views/AdminEventsView.vue";
import PlayerView from "../views/PlayerView.vue"
import MembersView from "../views/MembersView.vue"
import MemberRegisterView from "../views/MemberRegisterView.vue"

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
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
