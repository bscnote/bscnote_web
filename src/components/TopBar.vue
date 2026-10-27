<template>
	<header class="topbar">
		<div class="topbar-left">
			<button class="icon-btn" :data-tip="collapsed ? $t('topbar.expand') : $t('topbar.collapse')"
				:aria-label="$t('topbar.collapse')" :disabled="!online" @click="$emit('toggle-sidebar')">
				<!-- panel-left（展开态） -->
				<svg v-show="!collapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="4" width="18" height="16" rx="2"></rect>
					<line x1="9" y1="4" x2="9" y2="20"></line>
				</svg>
				<!-- 右箭头（折叠态） -->
				<svg v-show="collapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 6 15 12 9 18"></polyline>
				</svg>
			</button>
			<img class="app-logo" src="@/assets/logo/logo512.png" />
			<span class="app-name">{{ $t('app.name') }}</span>
			<span class="version-tag">v{{ version }}</span>
		</div>

		<div class="topbar-right">
			<div v-if="online" class="conn-group" aria-live="polite">
				<span class="conn-dot" :class="connection"></span>
				<span class="conn-text">{{ connText }}</span>
				<span v-if="account && connection === 'connected'" class="conn-address">{{ shortAddress }}</span>
			</div>
			<button v-if="online" class="btn-text" :data-tip="$t('topbar.disconnect')"
				:disabled="connection !== 'connected'" @click="$emit('disconnect')">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
					stroke-linejoin="round">
					<path d="M13.5 10.5 15.9 8.1a3.9 3.9 0 0 1 5.5 5.5l-2.4 2.4"></path>
					<path d="M10.5 13.5 8.1 15.9a3.9 3.9 0 0 1-5.5-5.5L5 8"></path>
					<line x1="14" y1="4" x2="16" y2="4"></line>
					<line x1="18" y1="8" x2="20" y2="8"></line>
					<line x1="4" y1="16" x2="6" y2="16"></line>
					<line x1="8" y1="20" x2="10" y2="20"></line>
				</svg>
				<span class="btn-label">{{ $t('topbar.disconnect') }}</span>
			</button>
			<span v-if="online" class="topbar-divider"></span>
			<button v-if="online" class="icon-btn" :data-tip="$t('topbar.trash')" :aria-label="$t('topbar.trash')"
				@click="$emit('open-trash')">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
					stroke-linejoin="round">
					<path d="M3 6h18" />
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
					<line x1="10" y1="11" x2="10" y2="17" />
					<line x1="14" y1="11" x2="14" y2="17" />
				</svg>
				<span class="trash-badge" :class="{ show: trashCount > 0 }">{{ trashCount > 99 ? '99+' : trashCount
					}}</span>
			</button>
			<!-- 语言选择（回收站入口旁；全程可切换，不受连接状态限制） -->
			<LangSwitcher />
			<!-- 主题切换（深色/浅色） -->
			<ThemeSwitcher />
			<button v-if="online" class="icon-btn" :data-tip="$t('topbar.changePassword')"
				:aria-label="$t('topbar.changePassword')" @click="$emit('open-password')">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
					stroke-linejoin="round">
					<path
						d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3">
					</path>
				</svg>
			</button>
		</div>
	</header>
</template>

<script>
import LangSwitcher from './LangSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import appVersion from '@/version'

export default {
	name: 'TopBar',
	components: { LangSwitcher, ThemeSwitcher },
	props: {
		connection: { type: String, default: 'disconnected' }, // disconnected | connecting | connected
		online: { type: Boolean, default: false },
		trashCount: { type: Number, default: 0 },
		collapsed: { type: Boolean, default: false },
		account: { type: String, default: '' }
	},
	data() {
		return {
			version: appVersion.version
		}
	},
	computed: {
		connText() {
			if (this.connection === 'connected') return this.$t('topbar.connected')
			if (this.connection === 'connecting') return this.$t('topbar.connecting')
			return this.$t('topbar.disconnected')
		},
		shortAddress() {
			if (!this.account || this.account.length < 10) return this.account
			return this.account.slice(0, 8) + '…' + this.account.slice(-6)
		}
	}
}
</script>
