<template>
  <!-- 语言切换（回收站入口旁）：下拉选择 中文 / English，选择持久化到 localStorage -->
  <div class="lang-switcher">
    <button
      class="lang-btn"
      :data-tip="open ? null : $t('lang.label')"
      :aria-label="$t('lang.label')"
      :disabled="disabled"
      @click.stop="open = !open"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span class="lang-label">{{ currentLabel }}</span>
    </button>
    <div v-show="open" class="lang-menu">
      <button
        v-for="item in locales"
        :key="item.value"
        class="lang-option"
        :class="{ active: item.value === current }"
        @click.stop="choose(item.value)"
      >{{ item.label }}</button>
    </div>
  </div>
</template>

<script>
import { LOCALE_KEY } from '../i18n'

export default {
  name: 'LangSwitcher',
  props: {
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      open: false,
      locales: [
        { value: 'zh', label: '简体中文' },
        { value: 'en', label: 'English' }
      ]
    }
  },
  computed: {
    current() {
      return this.$i18n.locale
    },
    currentLabel() {
      const item = this.locales.find(function (l) { return l.value === this.$i18n.locale }.bind(this))
      return item ? item.label : '简体中文'
    }
  },
  mounted() {
    document.addEventListener('click', this.onDocClick)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onDocClick)
  },
  methods: {
    choose(locale) {
      if (this.$i18n.locale !== locale) {
        this.$i18n.locale = locale
        try { localStorage.setItem(LOCALE_KEY, locale) } catch (e) { /* ignore */ }
        document.title = this.$t('app.name')
      }
      this.open = false
    },
    onDocClick(e) {
      if (this.open && this.$el && !this.$el.contains(e.target)) this.open = false
    }
  }
}
</script>
