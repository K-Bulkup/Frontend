import TestPage from "@/views/TestPage.vue";
import SignupPage from "@/views/SignupPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/test", component: TestPage },
    { path: "/signup", component: SignupPage },
  ],
});

export default router;
