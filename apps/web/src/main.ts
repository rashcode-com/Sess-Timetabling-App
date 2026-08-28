import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./store";
import vuetify from "./plugins/vuetify";
import "./assets/css/font.css";
import "./assets/css/theme.css";

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);

app.mount("#app");
