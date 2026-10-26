<template>
	<!-- 通用确认弹窗（删除笔记本 / 删除笔记），删除按钮支持 loading 态；标题与正文由父组件通过 props 传入（已在父组件完成 i18n） -->
	<div class="modal-mask" :class="{ open: visible }" @mousedown.self="onMaskClose">
		<div class="modal" role="dialog" aria-modal="true">
			<h3 class="modal-title">{{ title }}</h3>
			<div class="modal-body">
				<p class="modal-text">{{ text }}</p>
			</div>
			<div class="modal-actions">
				<button class="btn btn-ghost" :disabled="loading" @click="$emit('close')">{{ $t('confirm.cancel') }}</button>
				<button class="btn btn-danger-solid" :disabled="loading" @click="$emit('confirm')">
					<span v-show="loading" class="spinner"></span>
					{{ loading ? $t('confirm.deleting') : $t('confirm.delete') }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ConfirmModal',
	props: {
		visible: { type: Boolean, default: false },
		title: { type: String, default: '' },
		text: { type: String, default: '' },
		loading: { type: Boolean, default: false }
	},
	methods: {
		onMaskClose() {
			if (!this.loading) this.$emit('close') // 删除中禁止点遮罩关闭
		}
	}
}
</script>
