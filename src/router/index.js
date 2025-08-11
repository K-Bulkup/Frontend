//auth
import SplashPage from "@/views/auth/SplashPage.vue";
import SignupPage from "@/views/auth/SignupPage.vue";
import LoginPage from "@/views/auth/LoginPage.vue";
import adminLoginPage from "@/views/admin/adminLoginPage.vue";
import AdminTrainingApprovalPage from "@/views/admin/AdminTrainingApprovalPage.vue";
import AdminUserMainPage from "@/views/admin/AdminUserMainPage.vue";
import AdminUserCreatePage from "@/views/admin/AdminUserCreatePage.vue";
import AdminUserEditPage from "@/views/admin/AdminUserEditPage.vue";
import AdminUserStatisticsPage from "@/views/admin/AdminUserStatisticsPage.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue"; // New import
//training
import TrainingListPage from "@/views/training/TrainingListPage.vue";
import TrainingDetailPage from "@/views/training/TrainingDetailPage.vue";

//trainee
import TraineeMyPage from "@/views/trainee/TraineeMyPage.vue";
import TraineeReviewPage from "@/views/trainee/TraineeReviewPage.vue";
import TraineeRoutineDetailPage from "@/views/trainee/TraineeRoutineDetailPage.vue";
import TraineeTrainingDetailPage from "@/views/trainee/TraineeTrainingDetailPage.vue";
import TraineeQnAPage from "@/views/trainee/TraineeQnAPage.vue";
import TraineeTrainingQuestionInput from "@/views/trainee/TraineeTrainingQuestionInput.vue";
import TraineeTrainerDetailPage from "@/views/trainee/TraineeTrainerDetailPage.vue";
import AssetMainPage from "@/views/trainee/asset/AssetMainPage.vue";
import AccountConnectPage from "@/views/trainee/asset/AccountConnectPage.vue";
import AssetAiChatPage from "@/views/trainee/asset/AssetAiChatPage.vue";

//trainer
import TrainerMyPage from "@/views/trainer/TrainerMyPage.vue";
import TrainerVerifyPage from "@/views/trainer/TrainerVerifyPage.vue";
import TrainerTrainingPage from "@/views/trainer/TrainerTrainingPage.vue";
import TrainerTrainingDetailPage from "@/views/trainer/TrainerTrainingDetailPage.vue";
import TrainerTrainingQnAPage from "@/views/trainer/TrainerTrainingQnAPage.vue";
import TrainingInputPage from "@/views/trainer/TrainerTrainingInputPage.vue";

//chat
import PtChatPage from "@/views/chat/PtChatPage.vue";
import PtHistoryPage from "@/views/chat/PtHistoryPage.vue";

import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  //auth
  { path: "/splash", component: SplashPage, meta: { hideNavbar: true } },
  { path: "/login", component: LoginPage, meta: { hideNavbar: true } },
  { path: "/signup", component: SignupPage, meta: { hideNavbar: true } },
  {
    path: "/admin/login",
    component: adminLoginPage,
    meta: { hideNavbar: true },
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ["ADMIN"] },
    children: [
      {
        path: "training-approval",
        component: AdminTrainingApprovalPage,
      },
      {
        path: "user-management",
        component: AdminUserMainPage,
      },
      {
        path: "user-management/create",
        component: AdminUserCreatePage,
      },
      {
        path: "user-management/edit/:userId",
        component: AdminUserEditPage,
      },
      {
        path: "user-statistics",
        component: AdminUserStatisticsPage,
      },
      // Add a redirect for the base /admin path if needed
      {
        path: "",
        redirect: "user-management", // Redirect to user-management
      },
    ],
  },

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
    path: "/trainee/mypage/review/:trainingId",
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
    path: "/trainee/mypage/training/:trainingId/qna",
    component: TraineeQnAPage,
    meta: { requiresAuth: true, roles: ["TRAINEE"] },
  },
  {
    path: "/trainee/mypage/training/:trainingId/question",
    component: TraineeTrainingQuestionInput,
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
    meta: { hideNavbar: true, requiresAuth: true },
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
    path: "/trainer/mypage/training/:trainingId",
    component: TrainerTrainingDetailPage,
    meta: { requiresAuth: true, roles: ["TRAINER"] },
  },
  {
    path: "/trainer/mypage/qnas",
    component: TrainerTrainingQnAPage,
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
    meta: { requiresAuth: true },
  },
  {
    path: "/common/pt-chat/:roomId",
    component: PtChatPage,
    meta: {
      hideNavbar: true,
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.path === "/login") {
    authStore.logout();
  }

  const requiresAuth = to.meta.requiresAuth;
  const requiredRoles = to.meta.roles;
  const isAuthenticated = !!authStore.token;
  const userRole = authStore.role;

  if (requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  if (requiresAuth && isAuthenticated) {
    // 사용자 정보가 없으면 가져옵니다.
    if (!userRole && !authStore.userId) {
      await authStore.fetchUserInfo();
    }

    if (requiredRoles && requiredRoles.length > 0) {
      if (requiredRoles.includes(authStore.role)) {
        return next();
      } else {
        alert("접근 권한이 없습니다.");
        return next("/login");
      }
    }
    return next();
  }

  next();
});

export default router;
