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
			<!-- 帮助中心 / GitHub / X（外链，未连接也可见） -->
			<a class="link-btn" :href="links.help" target="_blank" rel="noopener noreferrer"
				:aria-label="$t('topbar.help')">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
					stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
					<line x1="12" y1="17" x2="12.01" y2="17"></line>
				</svg>
				<span class="link-label">{{ $t('topbar.help') }}</span>
			</a>
			<a class="link-btn icon-only" :href="links.github" target="_blank" rel="noopener noreferrer"
				:data-tip="$t('topbar.github')" :aria-label="$t('topbar.github')">
				<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
					<path
						d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12">
					</path>
				</svg>
			</a>
			<a class="link-btn icon-only" :href="links.x" target="_blank" rel="noopener noreferrer"
				:data-tip="$t('topbar.x')" :aria-label="$t('topbar.x')">
				<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
					<path
						d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z">
					</path>
				</svg>
			</a>
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
			version: appVersion.version,
			links: {
				help: 'https://www.bscnote.com/help',
				github: 'https://github.com/bscnote/bscnote_web/tree/master',
				x: 'https://x.com/bscnote'
			}
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
