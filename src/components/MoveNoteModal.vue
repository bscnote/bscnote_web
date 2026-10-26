<template>
	<!-- 移动笔记到笔记本 -->
	<div class="modal-mask" :class="{ open: visible }" @mousedown.self="onMaskClose">
		<div class="modal" role="dialog" aria-modal="true">
			<h3 class="modal-title">{{ $t('noteModal.moveTitle') }}</h3>
			<div class="modal-body">
				<label class="field">
					<span class="field-label">{{ $t('noteModal.notebookLabel') }}</span>
					<select ref="folderSelect" v-model="targetId">
						<option value="">{{ $t('noteModal.uncategorized') }}</option>
						<option v-for="nb in notebooks" :key="nb.id" :value="nb.id">{{ nb.name }}</option>
					</select>
				</label>
			</div>
			<div class="modal-actions">
				<button class="btn btn-ghost" :disabled="loading" @click="$emit('close')">{{ $t('noteModal.cancel')
					}}</button>
				<button class="btn btn-primary" :disabled="loading" @click="confirm">
					<span v-show="loading" class="spinner"></span>
					{{ loading ? $t('noteModal.moving') : $t('noteModal.moveConfirm') }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { FOLDER_DEFAULT } from '../store'

export default {
	name: 'MoveNoteModal',
	props: {
		visible: { type: Boolean, default: false },
		notebooks: { type: Array, default: function () { return [] } },
		currentFolderId: { type: String, default: null },
		loading: { type: Boolean, default: false }
	},
	data() {
		return { targetId: '' }
	},
	watch: {
		visible(val) {
			if (val) {
				// 默认选中当前所属笔记本
				this.targetId = this.currentFolderId === FOLDER_DEFAULT() ? '' : (this.currentFolderId || '')
				this.$nextTick(function () {
					if (this.$refs.folderSelect) this.$refs.folderSelect.focus()
				}.bind(this))
			}
		}
	},
	methods: {
		onMaskClose() {
			if (!this.loading) this.$emit('close')
		},
		confirm() {
			if (this.loading) return
			// '' 表示移动到默认文件夹（未分类）
			this.$emit('save', this.targetId === '' ? FOLDER_DEFAULT() : this.targetId)
		}
	}
}
</script>
