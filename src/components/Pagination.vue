<template>
	<!-- 分页：总数 + 每页条数选择 + 页码（页数 >7 时折叠为省略号窗口） -->
	<div v-show="total > 0" class="pagination">
		<span class="pagination-total">{{ $t('pagination.total', { n: total }) }}</span>
		<select :value="pageSize" :aria-label="$t('pagination.perPage', { n: pageSize })"
			@change="$emit('size-change', Number($event.target.value))">
			<option v-for="s in pageSizeOptions" :key="s" :value="s">{{ $t('pagination.perPage', { n: s }) }}</option>
		</select>
		<button class="page-btn" :disabled="page <= 1" :aria-label="$t('pagination.prev')" @click="go(page - 1)">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
				stroke-linejoin="round">
				<polyline points="15 18 9 12 15 6"></polyline>
			</svg>
		</button>
		<template v-for="(item, idx) in pageItems">
			<span v-if="item === '…'" :key="'e' + idx" class="page-ellipsis">…</span>
			<button v-else :key="item" class="page-btn" :class="{ active: item === page }" @click="go(item)">{{ item
				}}</button>
		</template>
		<button class="page-btn" :disabled="page >= pageCount" :aria-label="$t('pagination.next')" @click="go(page + 1)">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
				stroke-linejoin="round">
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
		</button>
	</div>
</template>

<script>
export default {
	name: 'NotePagination',
	props: {
		total: { type: Number, default: 0 },
		page: { type: Number, default: 1 },
		pageSize: { type: Number, default: 10 },
		pageSizeOptions: {
			type: Array,
			default: function () { return [5, 10, 20, 50] }
		}
	},
	computed: {
		pageCount() {
			return Math.max(1, Math.ceil(this.total / this.pageSize))
		},
		/* 页码项：<=7 页全显；否则 1 … current±1 … last */
		pageItems() {
			const count = this.pageCount
			const current = this.page
			const items = []
			if (count <= 7) {
				for (let i = 1; i <= count; i++) items.push(i)
				return items
			}
			items.push(1)
			const start = Math.max(2, current - 1)
			const end = Math.min(count - 1, current + 1)
			if (start > 2) items.push('…')
			for (let i = start; i <= end; i++) items.push(i)
			if (end < count - 1) items.push('…')
			items.push(count)
			return items
		}
	},
	methods: {
		go(n) {
			if (n < 1 || n > this.pageCount || n === this.page) return
			this.$emit('page-change', n)
		}
	}
}
</script>
