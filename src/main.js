import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import { applyTheme } from './theme'
import './assets/cloud-notes.css'

Vue.config.productionTip = false

/* 挂载前先应用主题，避免首屏闪烁 */
applyTheme()

new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')