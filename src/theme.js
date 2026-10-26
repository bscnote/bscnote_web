/* ============================================================
   主题管理（浅色 / 深色，默认跟随系统，手动可覆盖）
   说明：通过 <html data-theme="light|dark"> 驱动 CSS 变量切换
   ============================================================ */
const THEME_KEY = 'bsc_note_theme'

export function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY) } catch (e) { return null }
}

export function systemPrefersDark() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

/* 解析当前应生效的主题：手动设置优先，否则跟随系统 */
export function resolveTheme() {
  const stored = getStoredTheme()
  if (stored === 'light' || stored === 'dark') return stored
  return systemPrefersDark() ? 'dark' : 'light'
}

/* 应用主题到 <html>；不传参则按当前存储/系统解析 */
export function applyTheme(theme) {
  const t = theme || resolveTheme()
  const root = document.documentElement
  if (root) root.setAttribute('data-theme', t)
  return t
}

/* 切换主题：显式指定则写存储并应用；不指定则在 light/dark 间 toggle */
export function toggleTheme() {
  const next = resolveTheme() === 'dark' ? 'light' : 'dark'
  try { localStorage.setItem(THEME_KEY, next) } catch (e) { /* ignore */ }
  return applyTheme(next)
}
