import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import Notifications from '@kyvg/vue3-notification';
import VueSocialSharing from 'vue-social-sharing';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

import App from './App.vue';
import router from './router';

import './assets/css/index.css';

const app = createApp(App);

app.config.globalProperties.$filters = {
  addressFormat(val, start = 6, end = 4) {
    if (!val) return '';
    return (
      val.toString().substr(0, start) +
      '...' +
      val.toString().substr(val.toString().length - end, val.toString().length - 1)
    );
  },
  decimalFormat(val, digit = 8) {
    if (val === 0) return '0';
    if (!val) return '';
    const reg = new RegExp('^\\d+(?:\\.\\d{0,' + digit + '})?');
    return Number(val.toString().match(reg));
  },
};

app.use(pinia);
app.use(router);
app.use(Notifications);
app.use(VueSocialSharing);
app.component('Datepicker', Datepicker);

app.mount('#app');
