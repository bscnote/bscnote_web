<template>
	<!-- 钱包选择弹窗：列出已安装的 EVM 钱包（含 EIP-6963 发现） -->
	<div class="modal-mask" :class="{ open: visible }" @mousedown.self="$emit('close')">
		<div class="modal wallet-modal" role="dialog" aria-modal="true">
			<h3 class="modal-title">{{ $t('wallet.title') }}</h3>
			<p class="wallet-desc">{{ $t('wallet.desc') }}</p>
			<div v-if="loading" class="wallet-loading">
				<span class="spinner"></span>
			</div>
			<div v-else-if="wallets.length === 0" class="wallet-empty">
				{{ $t('wallet.noWallet') }}
			</div>
			<div v-else class="wallet-list">
				<button
					v-for="w in wallets"
					:key="w.id"
					class="wallet-item"
					@click="choose(w)"
				>
					<!-- 钱包图标：优先用 base64/url 的 icon，否则回退到首字母 -->
					<img v-if="w.icon" class="wallet-icon-img" :src="w.icon" :alt="w.name">
					<span v-else class="wallet-icon">{{ w.name.charAt(0) }}</span>
					<span class="wallet-name">{{ w.name }}</span>
					<svg class="wallet-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</button>
			</div>
			<div class="modal-actions">
				<button class="btn btn-ghost" @click="$emit('close')">{{ $t('wallet.cancel') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
import { listWallets } from '../wallets'

export default {
	name: 'WalletSelectModal',
	props: {
		visible: { type: Boolean, default: false }
	},
	data() {
		return {
			wallets: [],
			loading: false
		}
	},
	watch: {
		visible(val) {
			if (val) {
				this.refresh()
			}
		}
	},
	mounted() {
		this.refresh()
	},
	methods: {
		async refresh() {
			this.loading = true
			this.wallets = []
			try {
				const res = await listWallets()
				this.wallets = res || []
			} catch (e) {
				console.error(e)
				this.wallets = []
			} finally {
				this.loading = false
			}
		},
		choose(w) {
			this.$emit('select', w)
		}
	}
}
</script>
