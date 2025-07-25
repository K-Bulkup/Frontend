//auth
import SplashPage from "@/views/auth/SplashPage.vue";
import SignupPage from "@/views/auth/SignupPage.vue";
import LoginPage from "@/views/auth/LoginPage.vue";

//training
import TrainingListPage from "@/views/training/TrainingListPage.vue";
import TrainingDetailPage from "@/views/training/TrainingDetailPage.vue";

//trainee
import TraineeMyPage from "@/views/trainee/TraineeMyPage.vue";
import TraineePtChatPage from "@/views/trainee/TraineePtChatPage.vue";
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
import TrainerPtHistoryPage from "@/views/trainer/TrainerPtHistoryPage.vue";
import TrainerPtChatPage from "@/views/trainer/TrainerPtChatPage.vue";
import TraineePtHistoryPage from "@/views/trainee/TraineePtHistoryPage.vue";
import TrainingInputPage from "@/views/trainer/TrainerTrainingInputPage.vue";

import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    //auth
    { path: "/splash", component: SplashPage, meta: { hideNavbar: true } },
    { path: "/login", component: LoginPage, meta: { hideNavbar: true } },
    { path: "/signup", component: SignupPage, meta: { hideNavbar: true } },

    //training
    { path: "/training", component: TrainingListPage },
    { path: "/training/:trainingId", component: TrainingDetailPage },

    //trainee
    { path: "/trainee/mypage", component: TraineeMyPage },
    { path: "/trainee/mypage/review", component: TraineeReviewPage },
    { path: "/trainee/mypage/pt-history", component: TraineePtChatPage },
    { path: "/trainee/mypage/pt-chat", component: TraineePtHistoryPage },
    {
      path: "/trainee/mypage/training/:trainingId",
      component: TraineeTrainingDetailPage,
    },
    {
      path: "/trainee/mypage/training/:trainingId/routine/:routineId",
      component: TraineeRoutineDetailPage,
    },
    {
      path: "/trainee/trainer/:trainerId",
      component: TraineeTrainerDetailPage,
    },
    { path: "/trainee/asset", component: AssetMainPage },
    { path: "/trainee/asset/account", component: AccountConnectPage },
    { path: "/trainee/asset/ai-chat", component: AssetAiChatPage },

    //trainer
    { path: "/trainer/mypage", component: TrainerMyPage },
    { path: "/trainer/mypage/verify", component: TrainerVerifyPage },
    { path: "/trainer/mypage/training", component: TrainerTrainingPage },
    { path: "/trainer/mypage/pt-history", component: TrainerPtHistoryPage },
    { path: "/trainer/mypage/pt-chat", component: TrainerPtChatPage },
    { path: "/trainer/training/input", component: TrainingInputPage },
  ],
});

export default router;
