/* ============================================================
   钱包检测（EVM 钱包注入探测）
   说明：各钱包浏览器插件会在 window 上注入不同 provider，
   此处统一探测并归一化为 { id, name, provider, installed, icon }
   ============================================================ */

/**
 * 获取当前浏览器已安装的 EVM 钱包列表
 * @returns {Promise<Array<{id: string, name: string, provider: any, icon?: string, rdns?: string}>>}
 */
async function getInstalledWallets() {
  const wallets = []

  // ========== 1. 优先使用 EIP-6963 获取 ==========
  const eip6963Wallets = await discoverEIP6963Wallets()
  wallets.push(...eip6963Wallets)

  // ========== 2. 传统方式补充（防止有些钱包没走 EIP-6963） ==========
  const legacyWallets = legacyDetectWallets()

  // 去重（以 id 为准，EIP-6963 优先）
  legacyWallets.forEach(legacy => {
    if (!wallets.some(w => w.id === legacy.id)) {
      wallets.push(legacy)
    }
  })
  return wallets
}

/**
 * EIP-6963 发现所有钱包
 */
async function discoverEIP6963Wallets() {
  return new Promise((resolve) => {
    const providers = []

    const onAnnounce = (event) => {
      providers.push(event.detail)
    }

    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce)

      const result = providers.map(({ info, provider }) => {
        const id = mapRdnsToId(info.rdns) || mapNameToId(info.name)
        return {
          id,                                    // 自定义统一 id
          name: info.name,                       // 钱包显示名称
          provider,                              // 真正的 provider
          icon: info.icon,                       // 图标（base64 或 url）
          rdns: info.rdns,
          installed: true
          // 可以按需加更多字段
        }
      }).filter(w => w.id) // 过滤掉无法识别的

      resolve(result)
    }, 300)
  })
}

/**
 * 传统方式检测（降级 + 补充）
 */
function legacyDetectWallets() {
  const w = window
  const eth = w.ethereum
  const list = []

  // MetaMask
  let metamaskProvider = null
  if (Array.isArray(eth?.providers)) {
    metamaskProvider = eth.providers.find(p => p.isMetaMask && !p.isBraveWallet)
  } else if (eth?.isMetaMask && !eth.isBraveWallet) {
    metamaskProvider = eth
  }
  if (metamaskProvider) {
    list.push({
      id: 'metamask',
      name: 'MetaMask',
      provider: metamaskProvider,
    })
  }

  // OKX
  if (w.okxwallet) {
    list.push({
      id: 'okx',
      name: 'OKX Wallet',
      provider: w.okxwallet,
    })
  } else if (eth?.isOkxWallet || eth?.isOKExWallet) {
    list.push({
      id: 'okx',
      name: 'OKX Wallet',
      provider: eth,
    })
  }

  // Binance
  let binanceProvider = null
  if (w.binancew3w) {
    binanceProvider = w.binancew3w.ethereum || w.binancew3w.provider || w.binancew3w
  } else if (w.BinanceChain) {
    binanceProvider = w.BinanceChain
  } else if (eth?.isBinance || eth?.isBinanceWallet) {
    binanceProvider = eth
  }
  if (binanceProvider) {
    list.push({
      id: 'binance',
      name: 'Binance Wallet',
      provider: binanceProvider,
    })
  }

  // Phantom
  if (w.phantom?.ethereum) {
    list.push({
      id: 'phantom',
      name: 'Phantom',
      provider: w.phantom.ethereum,
    })
  } else if (eth?.isPhantom) {
    list.push({
      id: 'phantom',
      name: 'Phantom',
      provider: eth,
    })
  }

  return list
}

/** 把 rdns 映射成统一 id */
function mapRdnsToId(rdns = '') {
  const r = rdns.toLowerCase()
  if (r.includes('io.metamask')) return 'metamask'
  if (r.includes('com.okx') || r.includes('okx')) return 'okx'
  if (r.includes('com.binance') || r.includes('binance')) return 'binance'
  if (r.includes('app.phantom') || r.includes('phantom')) return 'phantom'
  // 可继续扩展
  return null
}

/** 把 name 映射成统一 id（兜底） */
function mapNameToId(name = '') {
  const n = name.toLowerCase()
  if (n.includes('metamask')) return 'metamask'
  if (n.includes('okx')) return 'okx'
  if (n.includes('binance')) return 'binance'
  if (n.includes('phantom')) return 'phantom'
  return null
}

/* 返回钱包列表（含安装状态与 provider） */
export async function listWallets() {

  let wallets = await getInstalledWallets();
  return wallets;
}

