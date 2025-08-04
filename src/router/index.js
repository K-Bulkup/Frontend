//auth
import SplashPage from "@/views/auth/SplashPage.vue";
import SignupPage from "@/views/auth/SignupPage.vue";
import LoginPage from "@/views/auth/LoginPage.vue";
//training
import TrainingListPage from "@/views/training/TrainingListPage.vue";
import TrainingDetailPage from "@/views/training/TrainingDetailPage.vue";

//trainee
import TraineeMyPage from "@/views/trainee/TraineeMyPage.vue";
import TraineeReviewPage from "@/views/trainee/TraineeReviewPage.vue";
import TraineeRoutineDetailPage from "@/views/trainee/TraineeRoutineDetailPage.vue";
import TraineeTrainingDetailPage from "@/views/trainee/TraineeTrainingDetailPage.vue";
import TraineeTrainerDetailPage from "@/views/trainee/TraineeTrainerDetailPage.vue";
import AssetMainPage from "@/views/trainee/asset/AssetMainPage.vue";
import AccountConnectPage from "@/views/trainee/asset/AccountConnectPage.vue";
import AssetAiChatPage from "@/views/trainee/asset/AssetAiChatPage.vue";

//trainer
import TrainerMyPage from "@/views/trainer/TrainerMyPage.vue";
import TrainerVerifyPage from "@/views/trainer/TrainerVerifyPage.vue";
import TrainerTrainingPage from "@/views/trainer/TrainerTrainingPage.vue";
import TrainingInputPage from "@/views/trainer/TrainerTrainingInputPage.vue";

//chat
import PtChatPage from "@/views/chat/PtChatPage.vue";
import PtHistoryPage from "@/views/chat/PtHistoryPage.vue";

import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  //auth
  { path: "/splash", component: SplashPage, meta: { hideNavbar: true } },
  { path: "/login", component: LoginPage, meta: { hideNavbar: true } },
  { path: "/signup", component: SignupPage, meta: { hideNavbar: true } },

  //training
  { path: "/training", component: TrainingListPage },
  { path: "/training/:trainingId", component: TrainingDetailPage },

  //trainee
  {
    path: "/trainee/mypage",
    component: TraineeMyPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },
  {
    path: "/trainee/mypage/review",
    component: TraineeReviewPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },
  {
    path: "/trainee/mypage/training/:trainingId",
    component: TraineeTrainingDetailPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },
  {
    path: "/trainee/mypage/training/:trainingId/routine/:routineId",
    component: TraineeRoutineDetailPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },
  {
    path: "/trainee/trainer/:trainerId",
    component: TraineeTrainerDetailPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },
  {
    path: "/trainee/asset",
    component: AssetMainPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },
  {
    path: "/trainee/asset/account",
    component: AccountConnectPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },
  {
    path: "/trainee/asset/ai-chat",
    component: AssetAiChatPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },

  //trainer
  {
    path: "/trainer/mypage",
    component: TrainerMyPage,
    meta: { requiresAuth: true, roles: ["TRAINER"] },
  },
  {
    path: "/trainer/mypage/verify",
    component: TrainerVerifyPage,
    meta: { requiresAuth: true, roles: ["TRAINER"] },
  },
  {
    path: "/trainer/mypage/training",
    component: TrainerTrainingPage,
    meta: { requiresAuth: true, roles: ["TRAINER"] },
  },
  {
    path: "/trainer/training/input",
    component: TrainingInputPage,
    meta: { requiresAuth: true, roles: ["TRAINER"] },
  },

  //chat
  {
    path: "/common/pt-history",
    component: PtHistoryPage,
    meta: { requiresAuth: true, roles: ["TRAINER", "TRAINEE"] },
  },
  {
    path: "/common/pt-chat/:roomId",
    component: PtChatPage,
    meta: { hideNavbar: true, requiresAuth: true, roles: ["TRAINER", "TRAINEE"] },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  const requiresAuth = to.meta.requiresAuth;
  const requiredRoles = to.meta.roles;
  const isAuthenticated = !!authStore.token;
  const userRole = authStore.role;

  if (requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  if (requiresAuth && isAuthenticated) {
    if (requiredRoles && requiredRoles.length > 0) {
      if (requiredRoles.includes(userRole)) {
        return next();
      } else {
        alert("접근 권한이 없습니다.");
        return next("/");
      }
    }
    return next();
  }

  next();
});

export default router;
