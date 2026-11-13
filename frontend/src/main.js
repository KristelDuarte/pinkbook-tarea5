import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "./assets/css/app.css";

const app = createApp(App);

// URL del backend. Se define en el archivo .env (VITE_API_URL) al compilar.
// Si queda vacío se usa el mismo origen donde se sirve el frontend.
app.config.globalProperties.url = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

app.use(router).mount("#app");
