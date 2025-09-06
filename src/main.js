import Vue from 'vue'
import App from './App.vue'

// Global register, plugin vs. eklemelerini burada yapacağız
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
