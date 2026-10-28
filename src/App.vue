<template>
	<div class="app-shell" :class="{
		'app-online': isAppOnline,
		'sidebar-collapsed': sidebarCollapsed && !isMobile,
		'drawer-open': drawerOpen && isMobile
	}">
		<!-- 全局 SVG 渐变定义（Logo / 空状态 / 连接页图标引用） -->
		<svg width="0" height="0" style="position:absolute" aria-hidden="true">
			<defs>
				<linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#FCD535"></stop>
					<stop offset="100%" stop-color="#F59E0B"></stop>
				</linearGradient>
			</defs>
		</svg>

		<!-- ======================== 顶栏 ======================== -->
		<TopBar :connection="connection" :online="isAppOnline" :trash-count="trashCount" :collapsed="sidebarCollapsed"
			:account="account"
			@toggle-sidebar="toggleSidebar" @disconnect="handleDisconnect"
			@open-trash="openTrashModal" @open-password="openModifyPassModal" />

		<!-- ======================== 连接钱包页（未连接首屏） ======================== -->
		<ConnectPage :connecting="connection === 'connecting'" @connect="openWalletSelect" />

		<!-- ======================== 双栏主体 ======================== -->
		<div class="app-body">
			<SideBar :notebooks="notebooksWithCount" :total-count="totalCount" :uncat-count="uncatCount" :view="view"
				@select="onSelectView"
				@new-notebook="openNotebookModal('create')"
				@rename-notebook="openNotebookModal('rename', $event)" @delete-notebook="openDeleteNotebookModal" />
			<NoteList :title="viewTitle" :notes="displayedNotes" :total-count="noteTotal" :state="state"
				:sort="noteSort" :searching="searching" :keyword="searchKeyword"
				@search="onSearch" @sort-change="onSortChange" @new-note="openNoteModal('create')"
				@edit-note="openNoteModal('edit', $event)" @delete-note="openDeleteNoteModal"
				@move-note="openMoveNoteModal">
				<!-- 右下角分页（搜索态不分页） -->
				<Pagination v-if="!searching" :total="noteTotal" :page="notePage" :page-size="notePageSize"
					@page-change="onPageChange" @size-change="onSizeChange" />
			</NoteList>
		</div>

		<!-- 移动端抽屉遮罩 -->
		<div class="drawer-overlay" @click="closeDrawer"></div>

		<!-- ======================== 弹窗 ======================== -->
		<WalletSelectModal :visible="modals.wallet" @select="onWalletSelect" @close="closeModal('wallet')" />
		<NotebookModal :visible="modals.notebook" :mode="nbModalMode" :initial-name="nbModalInitialName"
			:loading="actionLoading" @save="onSaveNotebook" @close="closeModal('notebook')" />
		<ConfirmModal :visible="modals.deleteNotebook" :title="$t('confirm.deleteNotebookTitle')" :text="deleteNbText"
			:loading="actionLoading" @confirm="confirmDeleteNotebook" @close="closeModal('deleteNotebook')" />
		<NoteModal :visible="modals.note" :mode="noteModalMode" :notebooks="state.notebooks" :note="noteModalNote"
			:default-notebook-id="noteDefaultNotebookId" :loading="actionLoading" @save="onSaveNote"
			@close="closeModal('note')" />
		<ConfirmModal :visible="modals.deleteNote" :title="$t('confirm.deleteNoteTitle')" :text="deleteNoteText"
			:loading="actionLoading" @confirm="confirmDeleteNote" @close="closeModal('deleteNote')" />
		<PasswordModal :visible="modals.password" :mode="passwordModalMode" :loading="passwordLoading"
			@save="onPasswordConfirm" @close="onPasswordModalClose" />
		<MoveNoteModal :visible="modals.moveNote" :notebooks="state.notebooks" :current-folder-id="moveNoteFolderId"
			:loading="actionLoading" @save="confirmMoveNote" @close="closeModal('moveNote')" />
		<TrashModal :visible="modals.trash" :items="trashItems" :total="trashTotalOnChain" :state="state"
			:page="trashPage" :page-size="trashPageSize" :sort="trashSort" :loading-id="trashLoadingId"
			@restore="restoreNote" @close="closeModal('trash')"
			@page-change="onTrashPageChange" @size-change="onTrashSizeChange" @sort-change="onTrashSortChange" />

		<!-- ======================== Toast ======================== -->
		<AppToast :message="toastMessage" :visible="toastVisible" />
	</div>
</template>

<script>
import {
	initialState,
	notebookById,
	noteById,
	matchKeyword,
	excerpt,
	FOLDER_DEFAULT
} from './store'
import { BscNote, FOLDER_ALL } from './blockchain'
import TopBar from './components/TopBar.vue'
import ConnectPage from './components/ConnectPage.vue'
import SideBar from './components/SideBar.vue'
import NoteList from './components/NoteList.vue'
import NotebookModal from './components/NotebookModal.vue'
import NoteModal from './components/NoteModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import TrashModal from './components/TrashModal.vue'
import PasswordModal from './components/PasswordModal.vue'
import MoveNoteModal from './components/MoveNoteModal.vue'
import WalletSelectModal from './components/WalletSelectModal.vue'
import AppToast from './components/AppToast.vue'
import Pagination from './components/Pagination.vue'

export default {
	name: 'App',
	components: {
		TopBar,
		ConnectPage,
		SideBar,
		NoteList,
		NotebookModal,
		NoteModal,
		ConfirmModal,
		TrashModal,
		PasswordModal,
		MoveNoteModal,
		WalletSelectModal,
		AppToast,
		Pagination
	},
	data() {
		return {
			state: initialState(), // { notebooks, notes } 纯内存

			/* 连接状态：disconnected | connecting | connected */
			connection: 'disconnected',

			/* 当前连接的钱包地址 */
			account: '',

			/* 是否已解锁；未解锁不得进入主应用 */
			unlocked: false,

			/* 链上服务实例（非响应式） */
			chain: new BscNote(),

			view: {
				type: 'all'
			}, // all | notebook(id) | uncat

			/* 排序 / 搜索 / 分页 */
			noteSort: 'created-desc', // created-desc | created-asc
			searchKeyword: '',
			notePage: 1,
			notePageSize: 30,

			/* 链上数据总量（getUserNoteIds 返回的 total） */
			noteTotalOnChain: 0, // 当前视图的笔记总数
			allNotesTotal: 0, // 全部笔记总数（侧栏显示）
			uncatNotesTotal: 0, // 未分类笔记总数（侧栏显示）

			/* 回收站 */
			trashTotalOnChain: 0, // 回收站总数（顶栏徽标）
			trashNotes: [], // 回收站当前页笔记（链上加载）
			trashPage: 1,
			trashPageSize: 30,
			trashSort: 'created-desc', // created-desc | created-asc

			/* CRUD 提交中的 loading */
			actionLoading: false,
			trashLoadingId: null,

			/* 密码弹窗 */
			passwordModalMode: 'modify', // create | input | modify
			passwordLoading: false,

			/* 响应式 */
			isMobile: window.innerWidth < 768,
			sidebarCollapsed: false,
			drawerOpen: false,

			/* 弹窗可见性 */
			modals: {
				wallet: false,
				notebook: false,
				deleteNotebook: false,
				note: false,
				deleteNote: false,
				password: false,
				moveNote: false,
				trash: false
			},
			modalStack: [],

			/* 笔记本弹窗 */
			nbModalMode: 'create',
			nbModalTargetId: null,
			nbModalInitialName: '',

			/* 删除笔记本确认 */
			deleteNbTargetId: null,
			deleteNbText: '',

			/* 笔记弹窗 */
			noteModalMode: 'create',
			noteModalTargetId: null,
			noteModalNote: null,
			noteDefaultNotebookId: null,

			/* 移动笔记 */
			moveNoteTargetId: null,
			moveNoteFolderId: null,

			/* 删除笔记确认 */
			deleteNoteTargetId: null,
			deleteNoteText: '',

			/* Toast */
			toastMessage: '',
			toastVisible: false,

			/* 定时器句柄 */
			toastTimer: null
		}
	},
	computed: {
		/* 已解锁（连接钱包 + 输入/创建密码成功）才显示主应用 */
		isAppOnline() {
			return this.connection === 'connected' && this.unlocked
		},
		trashCount() {
			return this.trashTotalOnChain
		},
		totalCount() {
			return this.allNotesTotal
		},
		uncatCount() {
			return this.uncatNotesTotal
		},
		notebooksWithCount() {
			/* 只传 id/name，不传 count（笔记本后不显示数量） */
			return this.state.notebooks.map(function (nb) {
				return {
					id: nb.id,
					name: nb.name,
					count: 0
				}
			})
		},
		trimmedKeyword() {
			return this.searchKeyword.trim()
		},
		searching() {
			return this.trimmedKeyword !== ''
		},
		viewTitle() {
			if (this.searching) return this.$t('search.resultsTitle')
			if (this.view.type === 'all') return this.$t('sidebar.allNotes')
			if (this.view.type === 'uncat') return this.$t('sidebar.uncategorized')
			const nb = notebookById(this.state, this.view.id)
			return nb ? nb.name : this.$t('sidebar.allNotes')
		},
		/* 展示给 NoteList 的计数：
		   搜索态 = 当前页内匹配数；非搜索态 = 链上总数 */
		noteTotal() {
			if (this.searching) return this.displayedNotes.length
			return this.noteTotalOnChain
		},
		/* 展示的笔记：
		   搜索态 = 在当前已加载的 state.notes 内前端过滤匹配；
		   非搜索态 = state.notes（链上已按分页+排序+文件夹过滤返回） */
		displayedNotes() {
			if (this.searching) {
				const kw = this.trimmedKeyword
				return this.state.notes.filter(function (n) {
					return matchKeyword(n, kw)
				})
			}
			return this.state.notes
		},
		trashItems() {
			return this.trashNotes
		}
	},
	watch: {
		/* 切换视图 → 回到第一页并重新查询链上 */
		view() {
			this.notePage = 1
			this.loadNotes()
		},
		/* 切换排序 → 回到第一页并重新查询链上 */
		noteSort() {
			this.notePage = 1
			this.loadNotes()
		}
	},
	mounted() {
		window.addEventListener('resize', this.onResize)
		document.addEventListener('keydown', this.onKeydown)
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.onResize)
		document.removeEventListener('keydown', this.onKeydown)
		clearTimeout(this.toastTimer)
		if (this.chain) this.chain.disconnect()
	},
	methods: {
		/* ==================== 钱包连接 ==================== */
		/* 打开钱包选择弹窗 */
		openWalletSelect() {
			if (this.connection === 'connecting') return
			this.openModal('wallet')
		},
		/* 用户从弹窗选中某个钱包 */
		async onWalletSelect(wallet) {
			this.closeModal('wallet')
			await this.handleConnect(wallet.provider)
		},
		async handleConnect(provider) {
			if (this.connection === 'connecting') return
			this.connection = 'connecting'
			this.unlocked = false
			try {
				await this.chain.connect(provider)
				this.connection = 'connected'
				this.account = this.chain.account || ''
				await this.unlock()
			} catch (e) {
				this.connection = 'disconnected'
				this.account = ''
				this.unlocked = false
				await this.chain.disconnect()
				if (e.message === 'NO_WALLET') this.showToast(this.$t('toast.walletMissing'))
				else if (e.message === 'WRONG_NETWORK') this.showToast(this.$t('toast.wrongNetwork'))
				else console.error(e)
			}
		},

		async handleDisconnect() {
			await this.chain.disconnect()
			this.connection = 'disconnected'
			this.account = ''
			this.unlocked = false
			this.state = initialState()
			this.view = { type: 'all' }
			this.closeAllModals()
			this.closeDrawer()
		},

		/* ==================== 解锁流程 ==================== */
		/* 读链上信封，判断首次创建密码还是输入密码 */
		async unlock() {
			try {
				const mode = await this.chain.unlock()
				if (mode === 'create') {
					this.passwordModalMode = 'create'
				} else {
					this.passwordModalMode = 'input'
				}
				this.openModal('password')
			} catch (e) {
				console.error(e)
				// 读取信封失败：masterKey 为空，无法进入应用，直接断开回到连接页
				await this.handleDisconnect()
			}
		},

		/* 密码弹窗关闭（取消 / 点遮罩 / 关闭按钮）
		   create / input 阶段取消 = 未解锁，masterKey 为空，不能停留在应用内 → 断开连接回连接页 */
		async onPasswordModalClose() {
			if (this.passwordLoading) return
			const needUnlock = this.passwordModalMode === 'create' || this.passwordModalMode === 'input'
			this.closeModal('password')
			if (needUnlock) await this.handleDisconnect()
		},

		/* 密码弹窗确认（create / input / modify 三态） */
		async onPasswordConfirm(payload) {
			this.passwordLoading = true
			try {
				if (this.passwordModalMode === 'create') {
					await this.chain.createPassword(payload.newPassword)
					this.unlocked = true
					this.showToast(this.$t('toast.passwordCreated'))
				} else if (this.passwordModalMode === 'input') {
					await this.chain.inputPassword(payload.password)
					this.unlocked = true
					this.showToast(this.$t('toast.unlockSuccess'))
				} else {
					// modify
					await this.chain.modifyPassword(payload.oldPassword, payload.newPassword)
					this.showToast(this.$t('toast.passwordUpdated'))
				}
				this.closeModal('password')
				// 解锁/建密码成功后加载数据
				await this.loadFolders()
				await this.loadNotes()
				await this.loadCounts()
			} catch (e) {
				console.error(e)
				// 密码错误：保持在弹窗内提示
				if (this.passwordModalMode !== 'create') {
					this.$refs.passwordModal && this.$refs.passwordModal.setError()
				}
				this.showToast(this.$t('toast.passwordWrong'))
			} finally {
				this.passwordLoading = false
			}
		},

		/* ==================== 数据加载 ==================== */
		async loadFolders() {
			try {
				const folders = await this.chain.loadFolders()
				this.state.notebooks = folders
			} catch (e) {
				console.error(e)
			}
		},

		/* 加载当前视图的笔记（链上分页 + 排序 + 文件夹过滤） */
		async loadNotes() {
			try {
				// folderId：notebook 视图→该笔记本；uncat→默认文件夹；all→全部
				let folderId
				if (this.view.type === 'notebook') folderId = this.view.id
				else if (this.view.type === 'uncat') folderId = FOLDER_DEFAULT()
				else folderId = FOLDER_ALL
				// asc：created-asc→0(升序)，否则 1(降序)
				const asc = this.noteSort === 'created-asc' ? 0 : 1
				// offset：分页偏移
				const offset = (this.notePage - 1) * this.notePageSize
				const { notes, total } = await this.chain.loadNotes(offset, this.notePageSize, asc, folderId, 0)
				this.state.notes = notes
				this.noteTotalOnChain = total
			} catch (e) {
				console.error(e)
			}
		},

		/* 加载侧栏计数（全部笔记总数、未分类总数、回收站总数） */
		async loadCounts() {
			try {
				// 全部笔记总数
				const all = await this.chain.loadNotes(0, 1, 1, FOLDER_ALL, 0)
				this.allNotesTotal = all.total
				// 回收站总数
				const trash = await this.chain.loadNotes(0, 1, 1, FOLDER_ALL, 1)
				this.trashTotalOnChain = trash.total
			} catch (e) {
				console.error(e)
			}
		},

		/* ==================== 弹窗管理 ==================== */
		openModal(name) {
			if (this.modals[name]) return
			this.modals[name] = true
			this.modalStack.push(name)
		},
		closeModal(name) {
			name = name || this.modalStack[this.modalStack.length - 1]
			if (!name) return
			this.modals[name] = false
			this.modalStack = this.modalStack.filter(function (m) {
				return m !== name
			})
		},
		closeAllModals() {
			const keys = Object.keys(this.modals)
			for (let i = 0; i < keys.length; i++) this.modals[keys[i]] = false
			this.modalStack = []
		},

		/* ==================== 笔记本 ==================== */
		openNotebookModal(mode, id) {
			if (!this.isAppOnline) return
			this.nbModalMode = mode
			this.nbModalTargetId = id || null
			if (mode === 'rename') {
				const nb = notebookById(this.state, id)
				this.nbModalInitialName = nb ? nb.name : ''
			} else {
				this.nbModalInitialName = ''
			}
			this.openModal('notebook')
		},
		async onSaveNotebook(name) {
			if (this.actionLoading) return
			this.actionLoading = true
			try {
				if (this.nbModalMode === 'rename') {
					await this.chain.updateFolder(this.nbModalTargetId, name)
					this.showToast(this.$t('toast.notebookRenamed'))
				} else {
					await this.chain.createFolder(name)
					this.showToast(this.$t('toast.notebookCreated'))
				}
				this.closeModal('notebook')
				await this.loadFolders()
			} catch (e) {
				console.error(e)
			} finally {
				this.actionLoading = false
			}
		},
		async openDeleteNotebookModal(id) {
			if (!this.isAppOnline) return
			const nb = notebookById(this.state, id)
			if (!nb) return
			this.deleteNbTargetId = id
			// 查该笔记本的笔记总数（用于确认文案）
			let count = 0
			try {
				const res = await this.chain.loadNotes(0, 1, 1, id, 0)
				count = res.total
			} catch (e) { /* ignore */ }
			this.deleteNbText = this.$t('confirm.deleteNotebookText', { name: nb.name, n: count })
			this.openModal('deleteNotebook')
		},
		async confirmDeleteNotebook() {
			if (this.actionLoading) return
			this.actionLoading = true
			try {
				await this.chain.deleteFolder(this.deleteNbTargetId)
				if (this.view.type === 'notebook' && this.view.id === this.deleteNbTargetId) this.view = { type: 'all' }
				this.closeModal('deleteNotebook')
				this.showToast(this.$t('toast.notebookDeleted'))
				await this.loadFolders()
				await this.loadNotes()
			} catch (e) {
				console.error(e)
			} finally {
				this.actionLoading = false
			}
		},

		/* ==================== 笔记 ==================== */
		openNoteModal(mode, id) {
			if (!this.isAppOnline) return
			this.noteModalMode = mode
			this.noteModalTargetId = id || null
			if (mode === 'edit') {
				const note = noteById(this.state, id)
				if (!note || note.isDeleted) return
				this.noteModalNote = note
			} else {
				this.noteModalNote = null
				this.noteDefaultNotebookId = this.view.type === 'notebook' ? this.view.id : FOLDER_DEFAULT()
			}
			this.openModal('note')
		},
		async onSaveNote(payload) {
			if (this.actionLoading) return
			this.actionLoading = true
			try {
				// 归属 folderId：未选择时为默认文件夹
				const folderId = payload.notebookId || FOLDER_DEFAULT()
				if (this.noteModalMode === 'edit') {
					await this.chain.updateNote(this.noteModalTargetId, payload.content)
				} else {
					await this.chain.createNote(payload.content, folderId)
					this.showToast(this.$t('toast.noteCreated'))
				}
				this.closeModal('note')
				await this.loadNotes()
				await this.loadCounts()
			} catch (e) {
				console.error(e)
			} finally {
				this.actionLoading = false
			}
		},
		openDeleteNoteModal(id) {
			if (!this.isAppOnline) return
			const note = noteById(this.state, id)
			if (!note || note.isDeleted) return
			this.deleteNoteTargetId = id
			this.deleteNoteText = this.$t('confirm.deleteNoteText', { name: excerpt(note.content, 20) })
			this.openModal('deleteNote')
		},
		/* 点击列表项「所属笔记本」→ 移动笔记 */
		openMoveNoteModal(id) {
			if (!this.isAppOnline) return
			const note = noteById(this.state, id)
			if (!note || note.isDeleted) return
			this.moveNoteTargetId = id
			this.moveNoteFolderId = note.folderId
			this.openModal('moveNote')
		},
		async confirmMoveNote(folderId) {
			if (this.actionLoading) return
			this.actionLoading = true
			try {
				await this.chain.moveNoteToFolder(this.moveNoteTargetId, folderId)
				this.closeModal('moveNote')
				this.showToast(this.$t('toast.noteMoved'))
				await this.loadNotes()
			} catch (e) {
				console.error(e)
			} finally {
				this.actionLoading = false
			}
		},
		async confirmDeleteNote() {
			if (this.actionLoading) return
			this.actionLoading = true
			try {
				await this.chain.deleteNote(this.deleteNoteTargetId)
				this.closeModal('deleteNote')
				this.showToast(this.$t('toast.noteDeleted'))
				await this.loadNotes()
				await this.loadCounts()
			} catch (e) {
				console.error(e)
			} finally {
				this.actionLoading = false
			}
		},

		/* ==================== 回收站 ==================== */
		/* 加载回收站当前页（链上分页 + 排序） */
		async loadTrashPage() {
			try {
				const asc = this.trashSort === 'created-asc' ? 0 : 1
				const offset = (this.trashPage - 1) * this.trashPageSize
				const { notes, total } = await this.chain.loadNotes(offset, this.trashPageSize, asc, FOLDER_ALL, 1)
				this.trashNotes = notes
				this.trashTotalOnChain = total
			} catch (e) {
				console.error(e)
			}
		},
		async openTrashModal() {
			if (!this.isAppOnline) return
			this.trashPage = 1
			await this.loadTrashPage()
			this.openModal('trash')
		},
		/* 回收站翻页 / 改页大小 / 改排序（由 TrashModal 触发） */
		onTrashPageChange(page) {
			this.trashPage = page
			this.loadTrashPage()
		},
		onTrashSizeChange(size) {
			this.trashPageSize = size
			this.trashPage = 1
			this.loadTrashPage()
		},
		onTrashSortChange(sort) {
			this.trashSort = sort
			this.trashPage = 1
			this.loadTrashPage()
		},
		async restoreNote(id) {
			if (this.actionLoading) return
			this.trashLoadingId = id
			this.actionLoading = true
			try {
				await this.chain.restoreNote(id)
				this.closeModal('trash')
				this.showToast(this.$t('toast.noteRestored'))
				await this.loadNotes()
				await this.loadCounts()
			} catch (e) {
				console.error(e)
			} finally {
				this.actionLoading = false
				this.trashLoadingId = null
			}
		},

		/* ==================== 密码 / 锁屏 ==================== */
		openModifyPassModal() {
			if (!this.isAppOnline) return
			this.passwordModalMode = 'modify'
			this.openModal('password')
		},

		/* ==================== 视图 / 搜索 / 排序 / 响应式 ==================== */
		onSelectView(view) {
			this.view = view
			if (this.isMobile) this.closeDrawer()
		},
		onSearch(kw) {
			this.searchKeyword = kw
		},
		onSortChange(sort) {
			this.noteSort = sort
		},
		toggleSidebar() {
			if (!this.isAppOnline) return
			if (this.isMobile) {
				this.drawerOpen = !this.drawerOpen
			} else {
				this.sidebarCollapsed = !this.sidebarCollapsed
			}
		},
		closeDrawer() {
			this.drawerOpen = false
		},
		onResize() {
			this.isMobile = window.innerWidth < 768
			if (!this.isMobile) {
				this.closeDrawer()
			} else {
				this.sidebarCollapsed = false
			}
		},

		/* ==================== 全局按键 ==================== */
		onKeydown(e) {
			if (e.key !== 'Escape') return
			if (this.modalStack.length > 0) this.closeModal()
			else if (this.isMobile && this.drawerOpen) this.closeDrawer()
		},

		/* ==================== 分页 ==================== */
		/* 翻页：更新页码并重新查询链上 */
		onPageChange(page) {
			this.notePage = page
			this.loadNotes()
		},
		onSizeChange(size) {
			this.notePageSize = size
			this.notePage = 1
			this.loadNotes()
		},

		/* ==================== Toast ==================== */
		showToast(msg) {
			this.toastMessage = msg
			this.toastVisible = true
			clearTimeout(this.toastTimer)
			this.toastTimer = setTimeout(() => {
				this.toastVisible = false
			}, 2000)
		}
	}
}
</script>
