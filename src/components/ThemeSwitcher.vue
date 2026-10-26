<template>
	<!-- 主题切换按钮（月亮/太阳）；全程可用，不受连接状态限制 -->
	<button class="icon-btn" :data-tip="tip" :aria-label="tip" @click="toggle">
		<!-- 太阳（当前深色，点击切换浅色） -->
		<svg v-show="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
			stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="5"></circle>
			<line x1="12" y1="1" x2="12" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="23"></line>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
			<line x1="1" y1="12" x2="3" y2="12"></line>
			<line x1="21" y1="12" x2="23" y2="12"></line>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
		</svg>
		<!-- 月亮（当前浅色，点击切换深色） -->
		<svg v-show="!isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
			stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>
	</button>
</template>

<script>
import { toggleTheme, resolveTheme } from '../theme'

export default {
	name: 'ThemeSwitcher',
	data() {
		return {
			isDark: resolveTheme() === 'dark'
		}
	},
	computed: {
		tip() {
			return this.isDark ? this.$t('theme.switchToLight') : this.$t('theme.switchToDark')
		}
	},
	methods: {
		toggle() {
			const next = toggleTheme()
			this.isDark = next === 'dark'
		}
	}
}
</script>
