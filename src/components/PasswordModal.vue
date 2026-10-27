<template>
	<!-- 密码弹窗，支持三种模式：create(首次创建) / input(输入解锁) / modify(修改) -->
	<div class="modal-mask" :class="{ open: visible }">
		<div class="modal" role="dialog" aria-modal="true">
			<h3 class="modal-title">{{ title }}</h3>
			<div class="modal-body">
				<!-- 输入解锁：单字段 -->
				<template v-if="mode === 'input'">
					<label class="field">
						<span class="field-label">{{ $t('password.inputTitle') }}</span>
						<PasswordInput ref="firstField" v-model="pwd" :placeholder="$t('password.inputPlaceholder')"
							@input="onInput" @enter="confirm" />
					</label>
					<div class="field-error" :class="{ show: err }">{{ $t('password.wrongCurrent') }}</div>
				</template>
				<!-- 修改密码：旧 + 新 + 确认 -->
				<template v-else-if="mode === 'modify'">
					<label class="field">
						<span class="field-label">{{ $t('password.currentLabel') }}</span>
						<PasswordInput ref="firstField" v-model="oldPwd" :placeholder="$t('password.currentPlaceholder')"
							@input="onInput" @enter="confirm" />
					</label>
					<div class="field-error" :class="{ show: err }">{{ $t('password.wrongCurrent') }}</div>
					<label class="field">
						<span class="field-label">{{ $t('password.newLabel') }}</span>
						<PasswordInput ref="newField" v-model="newPwd" :placeholder="$t('password.newPlaceholder')"
							autocomplete="new-password" @input="onInput" @enter="confirm" />
					</label>
					<label class="field">
						<span class="field-label">{{ $t('password.confirmLabel') }}</span>
						<PasswordInput v-model="newPwd2" :placeholder="$t('password.confirmPlaceholder')"
							autocomplete="new-password" @input="onInput" @enter="confirm" />
					</label>
					<div class="field-error" :class="{ show: !!newErr }">{{ newErr }}</div>
				</template>
				<!-- 创建密码：新 + 确认 -->
				<template v-else>
					<div class="field-hint">{{ $t('password.firstHint') }}</div>
					<label class="field">
						<span class="field-label">{{ $t('password.newLabel') }}</span>
						<PasswordInput ref="firstField" v-model="newPwd" :placeholder="$t('password.newPlaceholder')"
							autocomplete="new-password" @input="onInput" @enter="confirm" />
					</label>
					<label class="field">
						<span class="field-label">{{ $t('password.confirmLabel') }}</span>
						<PasswordInput v-model="newPwd2" :placeholder="$t('password.confirmPlaceholder')"
							autocomplete="new-password" @input="onInput" @enter="confirm" />
					</label>
					<div class="field-error" :class="{ show: !!newErr }">{{ newErr }}</div>
				</template>
			</div>
			<div class="modal-actions">
				<button class="btn btn-ghost" :disabled="loading" @click="$emit('close')">{{ $t('password.cancel')
					}}</button>
				<button class="btn btn-primary" :disabled="loading || confirmDisabled" @click="confirm">
					<span v-show="loading" class="spinner"></span>
					{{ loading ? loadingText : confirmText }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import PasswordInput from './PasswordInput.vue'

export default {
	name: 'PasswordModal',
	components: { PasswordInput },
	props: {
		visible: { type: Boolean, default: false },
		mode: { type: String, default: 'modify' }, // create | input | modify
		loading: { type: Boolean, default: false }
	},
	data() {
		return { oldPwd: '', newPwd: '', newPwd2: '', pwd: '', err: false }
	},
	computed: {
		title() {
			if (this.mode === 'create') return this.$t('password.createTitle')
			if (this.mode === 'input') return this.$t('password.inputTitle')
			return this.$t('password.title')
		},
		newErr() {
			if (this.newPwd.length > 0 && this.newPwd.length < 8) return this.$t('password.tooShort')
			if (this.newPwd.length >= 8 && !this.isStrong(this.newPwd)) return this.$t('password.weak')
			if (this.newPwd.length >= 8 && this.newPwd2.length > 0 && this.newPwd !== this.newPwd2) return this.$t('password.mismatch')
			return ''
		},
		confirmText() {
			if (this.mode === 'create') return this.$t('password.create')
			if (this.mode === 'input') return this.$t('password.unlock')
			return this.$t('password.save')
		},
		loadingText() {
			if (this.mode === 'create') return this.$t('password.create') + '…'
			if (this.mode === 'input') return this.$t('password.unlock') + '…'
			return this.$t('password.save') + '…'
		},
		confirmDisabled() {
			if (this.mode === 'input') return this.pwd.trim().length === 0
			if (this.mode === 'modify') {
				return this.oldPwd.trim().length === 0 || !!this.newErr || this.newPwd.length < 8 || this.newPwd !== this.newPwd2
			}
			// create
			return !!this.newErr || this.newPwd.length < 8 || this.newPwd !== this.newPwd2
		}
	},
	watch: {
		visible(val) {
			if (val) {
				this.oldPwd = ''
				this.newPwd = ''
				this.newPwd2 = ''
				this.pwd = ''
				this.err = false
				this.$nextTick(function () {
					// 聚焦第一个密码框
					const f = this.$refs.firstField
					if (f) {
						const input = f.$el.querySelector('input')
						if (input) input.focus()
					}
				}.bind(this))
			}
		}
	},
	methods: {
		onInput() { this.err = false },
		setError() { this.err = true },
		isStrong(pwd) {
			return pwd.length >= 8 &&
				/[A-Z]/.test(pwd) &&
				/[a-z]/.test(pwd) &&
				/[0-9]/.test(pwd) &&
				/[^A-Za-z0-9]/.test(pwd)
		},
		confirm() {
			if (this.loading || this.confirmDisabled) return
			if (this.mode === 'input') {
				this.$emit('save', { password: this.pwd })
			} else if (this.mode === 'modify') {
				this.$emit('save', { oldPassword: this.oldPwd, newPassword: this.newPwd })
			} else {
				this.$emit('save', { newPassword: this.newPwd })
			}
		}
	}
}
</script>
