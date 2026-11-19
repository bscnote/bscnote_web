<template>
	<!-- 更新日志弹窗：展示版本号 + 更新内容 + 更新时间，支持搜索 -->
	<div class="modal-mask" :class="{ open: visible }" @mousedown.self="$emit('close')">
		<div class="modal modal-xl changelog-modal" role="dialog" aria-modal="true">
			<div class="modal-head">
				<h3 class="modal-title">{{ $t('changelog.title') }}</h3>
				<button class="icon-btn" :aria-label="$t('changelog.close')" @click="$emit('close')">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<!-- 搜索 -->
			<div class="changelog-toolbar">
				<div class="side-search changelog-search">
					<svg class="side-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
					<input v-model="keyword" type="text" :placeholder="$t('changelog.searchPlaceholder')"
						autocomplete="off" maxlength="50">
					<button v-show="keyword" class="side-search-clear" :aria-label="$t('search.clear')"
						@click="keyword = ''">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
			</div>

			<!-- 日志列表 -->
			<div v-if="filtered.length > 0" class="changelog-list">
				<div v-for="entry in filtered" :key="entry.version" class="changelog-entry">
					<div class="changelog-entry-head">
						<span class="changelog-version">v{{ entry.version }}</span>
						<span class="changelog-date">{{ entry.date }}</span>
					</div>
					<ul class="changelog-changes">
						<li v-for="(c, ci) in entry.changes" :key="ci">
							<template v-for="(seg, si) in segments(c)"><span v-if="seg.hit" :key="si" class="hl">{{
								seg.text }}</span><template v-else>{{ seg.text }}</template></template>
						</li>
					</ul>
				</div>
			</div>
			<div v-else class="changelog-empty">{{ $t('changelog.noResult') }}</div>
		</div>
	</div>
</template>

<script>
import changelog from '../changelog'
import { highlightSegments } from '../store'

export default {
	name: 'ChangelogModal',
	props: {
		visible: { type: Boolean, default: false }
	},
	data() {
		return {
			keyword: ''
		}
	},
	computed: {
		/* 把 change 的 i18n key 翻译成当前语言文本 */
		localizedEntries() {
			return changelog.map((entry) => {
				return {
					version: entry.version,
					date: entry.date,
					changes: entry.changes.map((key) => this.$t(key))
				}
			})
		},
		filtered() {
			const kw = this.keyword.trim().toLowerCase()
			if (!kw) return this.localizedEntries
			return this.localizedEntries
				.map(function (entry) {
					const matched = entry.changes.filter(function (c) {
						return String(c).toLowerCase().indexOf(kw) !== -1 ||
							entry.version.toLowerCase().indexOf(kw) !== -1 ||
							entry.date.indexOf(kw) !== -1
					})
					return matched.length > 0 ? { version: entry.version, date: entry.date, changes: matched } : null
				})
				.filter(Boolean)
		}
	},
	watch: {
		visible(val) {
			if (val) this.keyword = ''
		}
	},
	methods: {
		segments(text) {
			return highlightSegments(text, this.keyword)
		}
	}
}
</script>
