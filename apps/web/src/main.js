import Vue from 'vue';
import App from './App.vue';
import router from './router';
import pinia, { PiniaVuePlugin } from './store';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;
Vue.use(PiniaVuePlugin);

new Vue({
  router,
  pinia,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
