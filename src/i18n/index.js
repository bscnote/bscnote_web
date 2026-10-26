import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zh from './zh'
import en from './en'

Vue.use(VueI18n)

export const LOCALE_KEY = 'bsc_note_locale'

const saved = (function () {
  try { return localStorage.getItem(LOCALE_KEY) } catch (e) { return null }
})()

const i18n = new VueI18n({
  locale: saved === 'en' ? 'en' : 'zh', // 默认中文，持久化用户选择
  fallbackLocale: 'zh',
  messages: { zh, en }
})

document.title = i18n.t('app.name')

export default i18n
