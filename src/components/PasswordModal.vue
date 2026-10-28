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

/* 常见弱密码（均已满足大小写+数字+特殊字符规则，但过于常见，需拦截） */
const COMMON_WEAK_PASSWORDS = [
	'abc@12345', 'abc@123456', 'abc@1234', 'abc123456!', 'abc12345!', 'abc123456@',
	'password1!', 'password@123', 'password1@', 'password123!', 'p@ssw0rd', 'p@ssw0rd1',
	'qwerty1!', 'qwerty@123', 'qwerty123!', 'qwerty123@',
	'aa123456!', 'aa@123456', 'aa123456@', 'aaa@12345', 'aaa12345!',
	'abcd@1234', 'abcd1234!', 'abcdef@123', 'abcdefg@1',
	'admin@123', 'admin123!', 'admin123@', 'test@1234', 'test1234!',
	'welcome1!', 'welcome@123', 'letmein1!', 'iloveyou1!', 'iloveyou@1',
	'a1b2c3d4!', 'a1b2c3d4@', '123456ab!', '12345678ab!', '123456789ab!',
	'qaz@12345', 'qaz12345!', 'za@123456', '1qaz@wsx', '1qaz2wsx!'
]

/* 检测 4+ 连续递增字母或数字（不分大小写），如 abcd / 1234 / 12345 */
function hasSequence(s) {
	const lower = s.toLowerCase()
	for (let i = 0; i <= lower.length - 4; i++) {
		const a = lower.charCodeAt(i)
		const b = lower.charCodeAt(i + 1)
		const c = lower.charCodeAt(i + 2)
		const d = lower.charCodeAt(i + 3)
		const isLetter = a >= 97 && a <= 122 && b >= 97 && b <= 122 && c >= 97 && c <= 122 && d >= 97 && d <= 122
		const isDigit = a >= 48 && a <= 57 && b >= 48 && b <= 57 && c >= 48 && c <= 57 && d >= 48 && d <= 57
		if ((isLetter || isDigit) && b === a + 1 && c === b + 1 && d === c + 1) return true
	}
	return false
}

/* 检测键盘横排 4+ 连续（qwerty / asdfgh / zxcvbn 片段），如 qwer / asdf / zxcv */
function hasKeyboardRun(s) {
	const lower = s.toLowerCase()
	const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
	for (let r = 0; r < rows.length; r++) {
		const row = rows[r]
		for (let i = 0; i <= row.length - 4; i++) {
			if (lower.indexOf(row.slice(i, i + 4)) !== -1) return true
		}
	}
	return false
}

export default {
	name: 'PasswordModal',
	components: { PasswordInput },
	props: {
		visible: { type: Boolean, default: false },
		mode: { type: String, default: 'modify' }, // create | input | modify
		loading: { type: Boolean, default: false }
	},
	data() {
		return { 
			oldPwd: '', 
			newPwd: '', 
			newPwd2: '', 
			pwd: '', 
			err: false ,

			MIN_PASS_LEN: 9

		}
	},
	computed: {
		title() {
			if (this.mode === 'create') return this.$t('password.createTitle')
			if (this.mode === 'input') return this.$t('password.inputTitle')
			return this.$t('password.title')
		},
		newErr() {
			if (this.newPwd.length > 0 && this.newPwd.length < this.MIN_PASS_LEN) return this.$t('password.tooShort')
			if (this.newPwd.length >= this.MIN_PASS_LEN && !this.isStrong(this.newPwd)) return this.$t('password.weak')
			if (this.newPwd.length >= this.MIN_PASS_LEN && this.isCommonWeak(this.newPwd)) return this.$t('password.tooSimple')
			if (this.newPwd.length >= this.MIN_PASS_LEN && this.newPwd2.length > 0 && this.newPwd !== this.newPwd2) return this.$t('password.mismatch')
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
				return this.oldPwd.trim().length === 0 || !!this.newErr || this.newPwd.length < this.MIN_PASS_LEN || this.newPwd !== this.newPwd2
			}
			// create
			return !!this.newErr || this.newPwd.length < this.MIN_PASS_LEN || this.newPwd !== this.newPwd2
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
			return pwd.length >= this.MIN_PASS_LEN &&
				/[A-Z]/.test(pwd) &&
				/[a-z]/.test(pwd) &&
				/[0-9]/.test(pwd) &&
				/[^A-Za-z0-9]/.test(pwd)
		},
		/* 常见弱密码：虽满足「大小写+数字+特殊」规则，但过于常见或规律性过强 */
		isCommonWeak(pwd) {
			const s = String(pwd || '')
			const lower = s.toLowerCase()
			// 1. 常见弱密码黑名单（统一小写比较，覆盖 Abc@12345 这类）
			if (COMMON_WEAK_PASSWORDS.indexOf(lower) !== -1) return true
			// 2. 规律检测：4+ 连续递增字母/数字（如 abcd、1234、12345），或键盘横排 4+ 连续（qwer、asdf、zxcv）
			if (hasSequence(s) || hasKeyboardRun(s)) return true
			return false
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
