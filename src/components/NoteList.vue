<template>
	<main class="content">
		<div class="content-head">
			<h1 class="content-title">{{ title }}</h1>
			<span class="content-count">
				{{ searching ? $t('search.results', { n: totalCount }) : $t('noteList.count', { n: totalCount }) }}
			</span>
			<span class="spacer"></span>
			<!-- 笔记内容搜索（带清除按钮），位于排序下拉左侧 -->
			<div class="side-search content-search">
				<svg class="side-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8"></circle>
					<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
				</svg>
				<input :value="keyword" type="text" :placeholder="$t('search.placeholder')" autocomplete="off"
					maxlength="50" @input="$emit('search', $event.target.value)">
				<button v-show="keyword" class="side-search-clear" :aria-label="$t('search.clear')"
					@click="$emit('search', '')">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<!-- 排序：按更新时间 升序/降序 -->
			<select class="sort-select" :value="sort" :aria-label="$t('sort.label')"
				@change="$emit('sort-change', $event.target.value)">
				<option value="created-desc">{{ $t('sort.createdDesc') }}</option>
				<option value="created-asc">{{ $t('sort.createdAsc') }}</option>
			</select>
			<button class="btn btn-primary" @click="$emit('new-note')">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
					stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
				{{ $t('noteList.newNote') }}
			</button>
		</div>

		<div v-show="notes.length > 0" class="note-list">
			<div v-for="(n, i) in notes" :key="n.id" class="note-card"
				:style="{ animationDelay: Math.min(i * 25, 200) + 'ms' }">
				<div class="note-item-main">
					<div :ref="'content-' + n.id" class="note-item-title" :class="{ 'is-overflow': !!overflowMap[n.id] }"
						:title="n.content" @click="onContentClick(n, $event)">
						<template v-for="(seg, si) in segments(n.content)"><span v-if="seg.hit" :key="si"
								class="hl">{{ seg.text }}</span><template v-else>{{ seg.text }}</template></template>
					</div>
					<div class="note-item-meta">
						{{ formatNo(n.id) }} ·
						<span class="note-meta-nb" :data-tip="$t('noteModal.moveTitle')"
							@click="$emit('move-note', n.id)">{{ notebookName(n.folderId) }}</span>
						· {{ $t('noteList.createdAt') }} {{ formatTime(n.createdAt) }}<template
							v-if="n.updatedAt !== n.createdAt"> ·
							{{ $t('noteList.updatedAt') }} {{ formatTime(n.updatedAt) }}</template>
					</div>
				</div>
				<div class="col-ops">
					<button class="btn btn-ghost btn-op" :aria-label="$t('noteList.edit')"
						@click="$emit('edit-note', n.id)">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 20h9" />
							<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
						</svg>
						{{ $t('noteList.edit') }}
					</button>
					<button class="btn btn-ghost btn-op danger" 
						:aria-label="$t('noteList.delete')" @click="$emit('delete-note', n.id)">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 6h18" />
							<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
							<line x1="10" y1="11" x2="10" y2="17" />
							<line x1="14" y1="11" x2="14" y2="17" />
						</svg>
						{{ $t('noteList.delete') }}
					</button>
				</div>
			</div>
		</div>

		<div class="empty-state" :class="{ show: notes.length === 0 }">
			<svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="url(#gradYellow)" stroke-width="1.6"
				stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M17.8 10.8h-1a6.4 6.4 0 1 0-8.9 6.5"></path>
				<path d="M17.8 10.8a4.5 4.5 0 0 1 0 9h-5.6"></path>
				<line x1="9.6" y1="14.6" x2="13.8" y2="14.6"></line>
				<line x1="9.6" y1="17.2" x2="12.4" y2="17.2"></line>
			</svg>
			<div class="empty-text">{{ searching ? $t('search.noResults') : $t('noteList.empty') }}</div>
			<button v-if="!searching" class="btn btn-primary" @click="$emit('new-note')">{{ $t('noteList.emptyAction')
				}}</button>
		</div>

		<!-- 分页区域（右下角；搜索态不分页，由父组件控制是否注入） -->
		<div class="note-footer">
			<slot></slot>
		</div>

		<!-- 全文浮层：标题行溢出时点击弹出，点击其他区域隐藏 -->
		<div v-if="popoverNote" ref="popover" class="note-popover" :style="popoverStyle">
			<div class="note-popover-meta">{{ formatNo(popoverNote.id) }} · {{ formatTime(popoverNote.createdAt) }}</div>
			<div class="note-popover-body">{{ popoverNote.content }}</div>
		</div>
	</main>
</template>

<script>
import { formatTime, formatNo, notebookById, highlightSegments } from '../store'

export default {
	name: 'NoteList',
	props: {
		title: { type: String, default: '' },
		notes: { type: Array, default: function () { return [] } }, // 当前应展示的笔记（已分页或搜索结果全量）
		totalCount: { type: Number, default: 0 }, // 计数文案用的总条数
		state: { type: Object, required: true },
		sort: { type: String, default: 'created-desc' },
		searching: { type: Boolean, default: false },
		keyword: { type: String, default: '' }
	},
	data() {
		return {
			overflowMap: {}, // { noteId: true } 标题行实际溢出的笔记
			popoverNote: null, // 正在展示的浮层笔记
			popoverStyle: {}
		}
	},
	watch: {
		notes() { this.scheduleOverflow() },
		keyword() { this.scheduleOverflow() },
		sort() { this.closePopover() }
	},
	mounted() {
		window.addEventListener('resize', this.onResize)
		document.addEventListener('mousedown', this.onDocMouseDown, true)
		this.scheduleOverflow()
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.onResize)
		document.removeEventListener('mousedown', this.onDocMouseDown, true)
		if (this._raf) cancelAnimationFrame(this._raf)
		if (this._ot) clearTimeout(this._ot)
	},
	methods: {
		formatTime: formatTime,
		formatNo: formatNo,
		notebookName(id) {
			const nb = notebookById(this.state, id)
			return nb ? nb.name : this.$t('noteList.uncategorized')
		},
		segments(content) {
			return highlightSegments(content, this.searching ? this.keyword : '')
		},
		/* 延迟到卡片入场动画结束后再测量，避免动画期间布局不稳定导致漏判/误判 */
		scheduleOverflow() {
			if (this._raf) cancelAnimationFrame(this._raf)
			if (this._ot) clearTimeout(this._ot)
			this._ot = setTimeout(function () {
				this.measureOverflow()
			}.bind(this), 400)
		},
		onResize() {
			this.scheduleOverflow()
		},
		/* 按 noteId 精确测量每个标题行是否溢出（scrollWidth > clientWidth） */
		measureOverflow() {
			const map = {}
			const notes = this.notes || []
			for (let i = 0; i < notes.length; i++) {
				const id = notes[i].id
				const el = this.$refs['content-' + id]
				const node = Array.isArray(el) ? el[0] : el
				if (node && node.scrollWidth > node.clientWidth + 1) {
					map[id] = true
				}
			}
			this.overflowMap = map
		},
		/* 仅当标题行溢出时才允许点击弹出全文浮层 */
		onContentClick(note, e) {
			const cell = e.currentTarget
			const isOverflow = cell && cell.scrollWidth > cell.clientWidth + 1
			if (!isOverflow && !this.overflowMap[note.id]) return
			if (this.popoverNote && this.popoverNote.id === note.id) {
				this.closePopover()
				return
			}
			const rect = e.currentTarget.getBoundingClientRect()
			const maxW = Math.min(520, window.innerWidth - 32)
			let left = rect.left
			if (left + maxW > window.innerWidth - 16) left = window.innerWidth - 16 - maxW
			if (left < 16) left = 16
			let top = rect.bottom + 8
			const estH = 240
			if (top + estH > window.innerHeight - 16) top = Math.max(16, rect.top - 8 - estH)
			this.popoverStyle = { left: left + 'px', top: top + 'px', maxWidth: maxW + 'px' }
			this.popoverNote = note
		},
		closePopover() {
			this.popoverNote = null
		},
		onDocMouseDown(e) {
			if (!this.popoverNote) return
			const pop = this.$refs.popover
			if (pop && pop.contains(e.target)) return // 点浮层内部不关闭
			if (e.target && e.target.closest && e.target.closest('.note-item-title')) return // 点标题行交给 @click 处理
			this.closePopover()
		}
	}
}
</script>
