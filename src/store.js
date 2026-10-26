/* ============================================================
   数据查询辅助（纯内存，无持久化）
   说明：用户数据（笔记/笔记本）来自链上，仅存于内存变量；
   语言/主题等配置另由 i18n/theme 模块单独持久化。
   ============================================================ */

/* 初始空状态（不再有种子数据，也不再写 localStorage） */
export function initialState() {
  return {
    notebooks: [], // 链上笔记本
    notes: [], // 链上笔记（含回收站，靠 isDeleted 区分）
  }
}

/* —— 数据查询辅助 —— */
export function notebookById(state, id) {
  for (let i = 0; i < state.notebooks.length; i++) if (state.notebooks[i].id === id) return state.notebooks[i]
  return null
}
export function noteById(state, id) {
  for (let i = 0; i < state.notes.length; i++) if (state.notes[i].id === id) return state.notes[i]
  return null
}

/* 链上「默认文件夹」常量 */
export function FOLDER_DEFAULT() { return '0x0000000000000000000000000000000000000000000000000000000000000000' }

/* —— 搜索 / 高亮 —— */
export function matchKeyword(note, keyword) {
  const kw = String(keyword || '').trim().toLowerCase()
  if (!kw) return true
  return String(note.content || '').toLowerCase().indexOf(kw) !== -1
}
export function highlightSegments(text, keyword) {
  const src = String(text == null ? '' : text)
  const kw = String(keyword == null ? '' : keyword).trim()
  if (!kw) return [{ text: src, hit: false }]
  const lower = src.toLowerCase()
  const k = kw.toLowerCase()
  const segs = []
  let i = 0
  while (i < src.length) {
    const idx = lower.indexOf(k, i)
    if (idx === -1) { segs.push({ text: src.slice(i), hit: false }); break }
    if (idx > i) segs.push({ text: src.slice(i, idx), hit: false })
    segs.push({ text: src.slice(idx, idx + k.length), hit: true })
    i = idx + k.length
  }
  return segs.filter(function (s) { return s.text !== '' })
}
export function excerpt(text, len) {
  const src = String(text || '')
  len = len || 20
  return src.length > len ? src.slice(0, len) + '…' : src
}

/* —— 工具函数 —— */
export function pad2(x) { return x < 10 ? '0' + x : '' + x }
export function formatTime(ts) {
  const d = new Date(ts)
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes())
}
/* 链上 noteId 为 bytes32（0x...64 位 hex），取后 4 位做短编号 */
export function formatNo(id) {
  const s = String(id || '')
  return '#' + s.slice(-4)
}
