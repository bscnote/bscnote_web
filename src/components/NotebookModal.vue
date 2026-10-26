<template>
	<!-- 弹窗：新建/重命名笔记本 -->
	<div class="modal-mask" :class="{ open: visible }" @mousedown.self="onMaskClose">
		<div class="modal" role="dialog" aria-modal="true">
			<h3 class="modal-title">{{ mode === 'rename' ? $t('notebookModal.renameTitle') : $t('notebookModal.createTitle')
				}}</h3>
			<div class="modal-body">
				<label class="field">
					<span class="field-label">{{ $t('notebookModal.nameLabel') }}</span>
					<input ref="nameInput" v-model="name" type="text" :placeholder="$t('notebookModal.namePlaceholder')"
						maxlength="50" autocomplete="off" @keydown.enter.prevent="confirm">
				</label>
			</div>
			<div class="modal-actions">
				<button class="btn btn-ghost" :disabled="loading" @click="$emit('close')">{{ $t('notebookModal.cancel')
					}}</button>
				<button class="btn btn-primary" :disabled="loading || name.trim().length === 0" @click="confirm">
					<span v-show="loading" class="spinner"></span>
					{{ loading ? $t('notebookModal.saving') : (mode === 'rename' ? $t('notebookModal.save') :
						$t('notebookModal.create')) }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'NotebookModal',
	props: {
		visible: { type: Boolean, default: false },
		mode: { type: String, default: 'create' }, // create | rename
		initialName: { type: String, default: '' },
		loading: { type: Boolean, default: false }
	},
	data() {
		return { name: '' }
	},
	watch: {
		visible(val) {
			if (val) {
				this.name = this.initialName
				this.$nextTick(function () {
					const input = this.$refs.nameInput
					if (input) {
						input.focus()
						if (this.mode === 'rename') input.select() // 重命名预填并全选
					}
				}.bind(this))
			}
		}
	},
	methods: {
		onMaskClose() {
			if (!this.loading) this.$emit('close') // 提交中禁止点遮罩关闭
		},
		confirm() {
			if (this.loading) return
			const name = this.name.trim()
			if (!name) return
			this.$emit('save', name)
		}
	}
}
</script>
