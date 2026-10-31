<template>
	<!-- 密码输入框（带明文可见性切换） -->
	<div class="pwd-field">
		<input
			:type="visible ? 'text' : 'password'"
			:value="value"
			:placeholder="placeholder"
			:autocomplete="autocomplete"
			:disabled="disabled"
			maxlength="64"
			@input="$emit('input', $event.target.value)"
			@keydown.enter="$emit('enter')"
		>
		<button
			type="button"
			class="pwd-toggle"
			:data-tip="visible ? $t('passwordToggle.hide') : $t('passwordToggle.show')"
			:aria-label="visible ? $t('passwordToggle.hide') : $t('passwordToggle.show')"
			@mousedown.prevent="toggle"
		>
			<!-- 眼睛（隐藏态：斜线划掉） -->
			<svg v-show="!visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
				<line x1="1" y1="1" x2="23" y2="23"></line>
			</svg>
			<!-- 眼睛（显示态） -->
			<svg v-show="visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
				<circle cx="12" cy="12" r="3"></circle>
			</svg>
		</button>
	</div>
</template>

<script>
export default {
	name: 'PasswordInput',
	props: {
		value: { type: String, default: '' },
		placeholder: { type: String, default: '' },
		autocomplete: { type: String, default: 'off' },
		disabled: { type: Boolean, default: false }
	},
	data() {
		return { visible: false }
	},
	watch: {
		/* 切换弹窗/输入框时重置可见态 */
		value() {
			// 不清空 visible，避免输入过程中闪烁；由父组件控制重置
		}
	},
	methods: {
		toggle() {
			this.visible = !this.visible
		},
		reset() {
			this.visible = false
		}
	}
}
</script>
