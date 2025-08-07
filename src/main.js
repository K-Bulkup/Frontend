import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";

import "@/assets/styles/tailwind.css";
import "@/plugins/fontawesome";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// 앱 시작 시 localStorage에서 토큰을 확인하고 사용자 정보를 가져옵니다.
app.use(router);

app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
