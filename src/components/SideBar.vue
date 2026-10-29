<template>
	<aside class="sidebar">
		<div class="sidebar-inner">
			<button class="btn-new-notebook" @click="$emit('new-notebook')">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
					stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
				{{ $t('sidebar.newNotebook') }}
			</button>

			<div class="side-group-label">{{ $t('sidebar.browse') }}</div>
			<nav class="side-nav">
				<button class="side-item" :class="{ active: view.type === 'all' }" @click="select({ type: 'all' })">
					<svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
						<polyline points="2 17 12 22 22 17"></polyline>
						<polyline points="2 12 12 17 22 12"></polyline>
					</svg>
					<span class="item-name">{{ $t('sidebar.allNotes') }}</span>
					<span class="side-count count-pill-total">{{ totalCount }}</span>
				</button>
			</nav>

			<div class="side-group-label">{{ $t('sidebar.myNotebooks') }}</div>
			<nav class="side-nav scrollable">
				<button v-for="nb in notebooks" :key="nb.id" class="side-item nb-item"
					:class="{ active: view.type === 'notebook' && view.id === nb.id }"
					@click="select({ type: 'notebook', id: nb.id })">
					<svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
					</svg>
					<span class="item-name">{{ nb.name }}</span>
					<span v-if="nb.count > 0" class="side-count">{{ nb.count }}</span>
					<span class="nb-ops">
						<span class="icon-btn" :data-tip="$t('sidebar.rename')" role="button"
							@click.stop="$emit('rename-notebook', nb.id)">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 20h9" />
								<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
							</svg>
						</span>
						<span class="icon-btn danger" :data-tip="$t('sidebar.delete')" role="button"
							@click.stop="$emit('delete-notebook', nb.id)">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 6h18" />
								<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
								<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
								<line x1="10" y1="11" x2="10" y2="17" />
								<line x1="14" y1="11" x2="14" y2="17" />
							</svg>
						</span>
					</span>
				</button>
				<button class="side-item" :class="{ active: view.type === 'uncat' }" @click="select({ type: 'uncat' })">
					<svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
						<path
							d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
					</svg>
					<span class="item-name">{{ $t('sidebar.uncategorized') }}</span>
					<span v-if="uncatCount > 0" class="side-count">{{ uncatCount }}</span>
				</button>
			</nav>
		</div>
	</aside>
</template>

<script>
export default {
	name: 'SideBar',
	props: {
		notebooks: { type: Array, default: function () { return [] } }, // [{id,name,count}]
		totalCount: { type: Number, default: 0 },
		uncatCount: { type: Number, default: 0 },
		view: { type: Object, required: true }
	},
	methods: {
		select(view) {
			this.$emit('select', view)
		}
	}
}
</script>
