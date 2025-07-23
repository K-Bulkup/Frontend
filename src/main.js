import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import App from "./App.vue";
import router from "./router";

import "@/assets/styles/tailwind.css";
import "@/plugins/fontawesome";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);

app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
