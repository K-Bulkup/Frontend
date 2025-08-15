import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
s;
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";

import "@/assets/styles/tailwind.css";
import "@/plugins/fontawesome";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// 환경별 axios 기본 URL 설정
if (import.meta.env.PROD) {
  axios.defaults.baseURL = "http://43.201.172.152:8080";
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// 앱 시작 시 localStorage에서 토큰을 확인하고 사용자 정보를 가져옵니다.
app.use(router);

app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
