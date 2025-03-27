import { createApp } from 'vue';
import App from './App.vue';
import router from "./router";
import { createHead } from '@vueuse/head'; // Import Vue Meta alternative
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEnvelope, faUser, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.css";
// Add FontAwesome icons
library.add(faEnvelope, faUser, faLock, faEye, faEyeSlash);

const app = createApp(App);

// Create and use Head Manager for meta tags
const head = createHead();
app.use(head);

// Register FontAwesome component globally
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);
app.mount('#app');
