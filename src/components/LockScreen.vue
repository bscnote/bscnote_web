<template>
	<!-- 锁屏（全屏遮罩，屏蔽底层一切操作）；解锁需重新输入密码从链上信封解出 masterKey -->
	<div class="lock-screen" :class="{ open: visible }">
		<div class="lock-card" :class="{ shake: shaking }">
			<svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="#FCD535" stroke-width="1.8"
				stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<rect x="3" y="11" width="18" height="11" rx="2"></rect>
				<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
				<circle cx="12" cy="16.4" r="1.4" fill="#FCD535" stroke="none"></circle>
			</svg>
			<div class="lock-title">{{ $t('lock.title') }}</div>
			<PasswordInput style="width:100%;" ref="pwdField" v-model="pwd" :placeholder="$t('lock.placeholder')" :disabled="loading"
				@enter="unlock" />
			<div class="lock-error" :class="{ show: error }">{{ $t('lock.wrong') }}</div>
			<button class="btn btn-primary" :disabled="loading || pwd.length === 0" @click="unlock">
				<span v-show="loading" class="spinner"></span>
				{{ loading ? $t('lock.unlock') + '…' : $t('lock.unlock') }}
			</button>
		</div>
	</div>
</template>

<script>
import PasswordInput from './PasswordInput.vue'

export default {
	name: 'LockScreen',
	components: { PasswordInput },
	props: {
		visible: { type: Boolean, default: false },
		loading: { type: Boolean, default: false }
	},
	data() {
		return { pwd: '', error: false, shaking: false }
	},
	watch: {
		visible(val) {
			if (val) {
				this.pwd = ''
				this.error = false
				this.$nextTick(function () {
					if (this.$refs.pwdField) {
						const input = this.$refs.pwdField.$el.querySelector('input')
						if (input) input.focus()
					}
				}.bind(this))
			}
		}
	},
	methods: {
		unlock() {
			if (this.loading || this.pwd.length === 0) return
			this.$emit('unlock', this.pwd)
		},
		fail() {
			this.error = true
			this.shaking = false
			this.$nextTick(function () {
				this.shaking = true
				this.pwd = ''
				if (this.$refs.pwdField) {
					const input = this.$refs.pwdField.$el.querySelector('input')
					if (input) input.focus()
				}
			}.bind(this))
		}
	}
}
</script>
