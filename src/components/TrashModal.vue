<template>
	<!-- 弹窗：回收站（只读，仅恢复）；分页/排序走链上（父组件驱动），搜索在当前 items 内前端过滤 -->
	<div class="modal-mask" :class="{ open: visible }" @mousedown.self="$emit('close')">
		<div class="modal modal-xl" role="dialog" aria-modal="true">
			<div class="modal-head">
				<h3 class="modal-title">{{ $t('trash.title') }}</h3>
				<button class="icon-btn" :aria-label="$t('trash.close')" @click="$emit('close')">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<!-- 工具栏：搜索 + 排序 -->
			<div class="trash-toolbar">
				<div class="side-search trash-search">
					<svg class="side-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
					<input v-model="keyword" type="text" :placeholder="$t('search.placeholder')" autocomplete="off"
						maxlength="50">
					<button v-show="keyword" class="side-search-clear" :aria-label="$t('search.clear')"
						@click="keyword = ''">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
				<select :value="sort" class="sort-select" :aria-label="$t('sort.label')"
					@change="$emit('sort-change', $event.target.value)">
					<option value="created-desc">{{ $t('sort.createdDesc') }}</option>
					<option value="created-asc">{{ $t('sort.createdAsc') }}</option>
				</select>
			</div>

			<div v-show="displayItems.length > 0" class="trash-list">
				<div v-for="n in displayItems" :key="n.id" class="trash-item">
					<div class="trash-item-main">
						<div class="trash-item-title" :title="n.content">
							<template v-for="(seg, si) in segments(n.content)"><span v-if="seg.hit" :key="si"
									class="hl">{{ seg.text }}</span><template v-else>{{ seg.text }}</template></template>
						</div>
						<div class="trash-item-meta">
							{{ formatNo(n.id) }} · {{ notebookName(n.folderId) }} · {{ formatTime(n.createdAt) }} ·
							{{ $t('trash.deletedAt') }} {{ formatTime(n.updatedAt) }}
						</div>
					</div>
					<button class="btn btn-ghost btn-restore" :disabled="loadingId !== null"
						@click="$emit('restore', n.id)">
						<span v-show="loadingId === n.id" class="spinner"></span>
						<svg v-show="loadingId !== n.id" viewBox="0 0 24 24" fill="none" stroke="currentColor"
							stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="1 4 1 10 7 10" />
							<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
						</svg>
						{{ loadingId === n.id ? $t('trash.restoring') : $t('trash.restore') }}
					</button>
				</div>
			</div>
			<div class="trash-empty" :class="{ show: displayItems.length === 0 }">
				<svg class="trash-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
					stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M3 6h18" />
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
					<line x1="10" y1="11" x2="10" y2="17" />
					<line x1="14" y1="11" x2="14" y2="17" />
				</svg>
				<div class="trash-empty-title">{{ searching ? $t('search.noResults') : $t('trash.empty') }}</div>
				<div v-if="!searching" class="trash-empty-sub">{{ $t('trash.emptySub') }}</div>
			</div>

			<div class="modal-actions trash-actions">
				<!-- 搜索态不分页；普通态与笔记列表同款分页（总数用链上 total） -->
				<span v-if="searching" class="trash-search-count">{{ $t('search.results', { n: displayItems.length })
					}}</span>
				<Pagination v-else :total="total" :page="page" :page-size="pageSize"
					@page-change="$emit('page-change', $event)" @size-change="$emit('size-change', $event)" />
				<button class="btn btn-ghost" @click="$emit('close')">{{ $t('trash.close') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
import { formatTime, formatNo, notebookById, matchKeyword, highlightSegments } from '../store'
import Pagination from './Pagination.vue'

export default {
	name: 'TrashModal',
	components: { Pagination },
	props: {
		visible: { type: Boolean, default: false },
		items: { type: Array, default: function () { return [] } }, // 回收站当前页笔记（链上已分页排序）
		total: { type: Number, default: 0 }, // 回收站总数（链上返回）
		state: { type: Object, required: true },
		page: { type: Number, default: 1 },
		pageSize: { type: Number, default: 10 },
		sort: { type: String, default: 'created-desc' },
		loadingId: { type: Number, default: null } // 正在恢复中的笔记 id
	},
	data() {
		return {
			keyword: ''
		}
	},
	computed: {
		searching() {
			return this.keyword.trim() !== ''
		},
		/* 搜索：只在当前 items（已分页的笔记）内前端过滤匹配 */
		displayItems() {
			const kw = this.keyword.trim()
			if (!kw) return this.items
			return this.items.filter(function (n) { return matchKeyword(n, kw) })
		}
	},
	watch: {
		visible(val) {
			if (val) {
				this.keyword = ''
			}
		}
	},
	methods: {
		formatTime: formatTime,
		formatNo: formatNo,
		notebookName(id) {
			const nb = id ? notebookById(this.state, id) : null
			return nb ? nb.name : this.$t('noteList.uncategorized')
		},
		segments(content) {
			return highlightSegments(content, this.searching ? this.keyword : '')
		}
	}
}
</script>
