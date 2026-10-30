<template>
	<!-- 弹窗：新建/编辑笔记（无标题，正文必填） -->
	<div class="modal-mask" :class="{ open: visible }" @mousedown.self="onMaskClose">
		<div class="modal" role="dialog" aria-modal="true">
			<h3 class="modal-title">{{ mode === 'edit' ? $t('noteModal.editTitle') : $t('noteModal.createTitle') }}</h3>
			<div class="modal-body">
				<label class="field">
					<span class="field-label">{{ $t('noteModal.notebookLabel') }}</span>
					<!-- 编辑态：所属笔记本不可修改（需通过列表项点击移动） -->
					<select v-model="notebookId" :disabled="mode === 'edit'">
						<option value="0x0000000000000000000000000000000000000000000000000000000000000000">{{ $t('noteModal.uncategorized') }}</option>
						<option v-for="nb in notebooks" :key="nb.id" :value="nb.id">{{ nb.name }}</option>
					</select>
				</label>
				<label class="field">
					<span class="field-label">{{ $t('noteModal.contentLabel') }}</span>
					<textarea ref="contentInput" v-model="content" :placeholder="$t('noteModal.contentPlaceholder')"
						maxlength="300" @keydown.enter.ctrl.prevent="confirm"></textarea>
				</label>
			</div>
			<div class="modal-actions">
				<button class="btn btn-ghost" :disabled="loading" @click="$emit('close')">{{ $t('noteModal.cancel')
					}}</button>
				<button class="btn btn-primary" :disabled="loading || content.trim().length === 0" @click="confirm">
					<span v-show="loading" class="spinner"></span>
					{{ loading ? $t('noteModal.saving') : $t('noteModal.save') }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'NoteModal',
	props: {
		visible: { type: Boolean, default: false },
		mode: { type: String, default: 'create' }, // create | edit
		notebooks: { type: Array, default: function () { return [] } },
		note: { type: Object, default: null }, // 编辑时的笔记对象
		defaultNotebookId: { type: String, default: null }, // 新建时的默认归属
		loading: { type: Boolean, default: false }
	},
	data() {
		return { content: '', notebookId: '' }
	},
	watch: {
		visible(val) {
			if (val) {
				if (this.mode === 'edit' && this.note) {
					this.content = this.note.content || ''
					this.notebookId = this.note.folderId || ''
				} else {
					this.content = ''
					this.notebookId = this.defaultNotebookId || ''
				}
				this.$nextTick(function () {
					if (this.$refs.contentInput) this.$refs.contentInput.focus()
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
			const content = this.content.trim()
			if (!content) return
			this.$emit('save', {
				content: this.content,
				notebookId: this.notebookId === '' ? null : this.notebookId
			})
		}
	}
}
</script>
