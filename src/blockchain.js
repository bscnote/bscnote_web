/* ============================================================
   链上数据服务层（BscNote 加密笔记）
   说明：所有用户数据（笔记/笔记本内容）经 AES-GCM 加密后上链，
   本地不存储任何用户数据；密码仅用于派生包装密钥，也不落盘。
   ============================================================ */
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x9D57B2E53c381d54ffeff82150b598015B5e2E64'
const CONTRACT_ABI = [
  // 笔记
  'function createNote(bytes ciphertext,bytes32 folderId) returns (bytes32)',
  'function deleteNote(bytes32 noteId)',
  'function restoreNote(bytes32 noteId)',
  'function updateNote(bytes32 noteId,bytes ciphertext)',
  'function getUserNoteIds(address user, uint256 offset, uint256 limit,uint8 asc,bytes32 folderId,uint8 viewType) view returns (bytes32[],uint256)',
  'function getNotes(bytes32[] noteIds) view returns (tuple(bytes32 id, address user, bytes ciphertext, uint64 createdAt, uint64 updatedAt, uint32 version, bool isDeleted,bytes32 folderId)[])',
  // 笔记本
  'function createFolder(bytes name) returns (bytes32)',
  'function deleteFolder(bytes32 folderId)',
  'function updateFolder(bytes32 folderId,bytes newName)',
  'function getUserFolders(address user) view returns (tuple(bytes32 id, address user, bytes name, uint64 createdAt, uint64 updatedAt)[])',
  'function moveNoteToFolder(bytes32 noteId, bytes32 folderId)',
  // 信封（存储加密后的 masterKey）
  'function setUserEnvelope(bytes envelope)',
  'function getUserEnvelope(address user) view returns (bytes[])',
]

/* 特殊 folderId 常量（与参考实现一致） */
export const FOLDER_ALL = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
export const FOLDER_DEFAULT = '0x0000000000000000000000000000000000000000000000000000000000000000'

export class BscNote {
  constructor() {
    this.account = null
    this.provider = null
    this.ethProvider = null
    this.signer = null
    this.contract = null
    this.masterKey = null // CryptoKey（仅内存）
  }

  /* ---------- 钱包连接 ---------- */
  /* 可选传入指定钱包的 provider（由钱包选择弹窗传入）；不传则回退到 window.ethereum */
  async connect(provider) {
    if (typeof window === 'undefined') {
      throw new Error('NO_WALLET')
    }
    const ethProvider = provider || window.ethereum
    if (!ethProvider) {
      throw new Error('NO_WALLET')
    }

    //step 1
    const accounts = await ethProvider.request({ method: 'eth_requestAccounts' })
    this.account = accounts[0]

    //step 2
    try {
      await ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      })
    } catch (switchError) {
      if (switchError.code === 4902) {
        await ethProvider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: [
              'https://bsc-dataseed.binance.org/',
              'https://bsc-dataseed1.defibit.io/'
            ],
            blockExplorerUrls: ['https://bscscan.com'],
          }],
        })
      } else {
        // 用户拒绝或其他错误
        throw new Error('WRONG_NETWORK')
      }
    }

    this.provider = new ethers.BrowserProvider(ethProvider)
    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)
    if (chainId !== 56) {
      // 网络不对，撤销授权并报错
      try {
        await ethProvider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        })
      } catch (e) { /* ignore */ }
      throw new Error('WRONG_NETWORK')
    }

    //step 3
    this.signer = await this.provider.getSigner()

    //step 4
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer)

    // 监听账户/链变化
    if (ethProvider.removeAllListeners) {
      ethProvider.removeAllListeners('accountsChanged')
      ethProvider.removeAllListeners('chainChanged')
    }
    ethProvider.on('accountsChanged', (accs) => {
      if (!accs || accs.length === 0) this.disconnect()
    })
    ethProvider.on('chainChanged', () => {
      window.location.reload()
    })

    this.ethProvider = ethProvider;
    return this.account
  }

  async disconnect() {
    try {
      await this.ethProvider.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }]
      })
    } catch (e) { /* ignore */ }
    this.account = null
    this.provider = null
    this.signer = null
    this.contract = null
    this.masterKey = null
  }

  /* ---------- 密码派生 / masterKey 包装 ---------- */
  async _deriveWrapperKey(password) {
    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)

    const domain = {
      name: 'BscNote',
      version: '3',
      chainId: chainId,
    }
    const types = {
      Authorization: [
        { name: 'purpose', type: 'string' },
        { name: 'user', type: 'address' },
      ]
    }
    const message = {
      purpose: 'BscNote Derive Wrapper Key',
      user: this.account,
    }
    const signature = await this.signer.signTypedData(domain, types, message)

    const enc = new TextEncoder()
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(JSON.stringify({ sig: signature, pwd: password })),
      'PBKDF2',
      false,
      ['deriveKey']
    )
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(this.account),
        iterations: 600000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  async _wrapMasterKey(masterKey, password) {
    const wrapperKey = await this._deriveWrapperKey(password)
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const rawKey = await window.crypto.subtle.exportKey('raw', masterKey)
    const wrapped = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      wrapperKey,
      rawKey
    )
    const result = new Uint8Array(iv.length + wrapped.byteLength)
    result.set(iv)
    result.set(new Uint8Array(wrapped), iv.length)
    return result
  }

  async _unwrapMasterKey(envelopeBytes, password) {
    const wrapperKey = await this._deriveWrapperKey(password)
    const iv = envelopeBytes.slice(0, 12)
    const data = envelopeBytes.slice(12)
    const rawKey = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      wrapperKey,
      data
    )
    return window.crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  }

  /* ---------- AES 加解密（用户数据） ---------- */
  async _encryptText(text) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(text)
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      encoded
    )
    const result = new Uint8Array(iv.length + ciphertext.byteLength)
    result.set(iv)
    result.set(new Uint8Array(ciphertext), iv.length)
    return result
  }

  async _decryptText(bytes) {
    const iv = bytes.slice(0, 12)
    const data = bytes.slice(12)
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      data
    )
    return new TextDecoder().decode(decrypted)
  }

  /* ---------- 解锁流程 ---------- */
  /* 读取链上信封，判断是否已设置密码；返回 'create' | 'input' */
  async unlock() {
    const result = await this.contract.getUserEnvelope(this.account)
    const envs = Array.from(result || [])
    return envs.length === 0 ? 'create' : 'input'
  }

  /* 首次创建密码：生成 masterKey、包装、上链 */
  async createPassword(password) {
    this.masterKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
    const envelope = await this._wrapMasterKey(this.masterKey, password)
    const tx = await this.contract.setUserEnvelope(envelope)
    await tx.wait()
  }

  async checkEnvelope(password) {
    const result = await this.contract.getUserEnvelope(this.account)
    const envs = Array.from(result || [])
    let cmk = null;
    // 从最后一个开始解码
    for (let i = envs.length - 1; i >= 0; i--) {
      try {
        cmk = await this._unwrapMasterKey(ethers.getBytes(envs[i]), password)
        break
      } catch (e) {
        //解码失败，继续
      }
    }
    return cmk;
  }

  /* 输入密码解锁：从信封解出 masterKey；失败抛错 */
  async inputPassword(password) {
    let cmk = await this.checkEnvelope(password)
    if (!cmk) {
      throw new Error("WRONG_PASSWORD")
    }
    this.masterKey = cmk;
  }

  /* 修改密码：用旧密码解出，新密码重包装后上链 */
  async modifyPassword(oldPassword, newPassword) {
    const cmk = await this.checkEnvelope(oldPassword);
    if (!cmk) {
      throw new Error("WRONG_PASSWORD")
    }
    const newEnvelope = await this._wrapMasterKey(cmk, newPassword)
    const tx = await this.contract.setUserEnvelope(newEnvelope)
    await tx.wait()
    this.masterKey = cmk;
  }

  /* ---------- 笔记业务 ---------- */
  async createNote(content, folderId) {
    const encrypted = await this._encryptText(content)
    const tx = await this.contract.createNote(encrypted, folderId)
    await tx.wait()
  }

  async updateNote(noteId, content) {
    const encrypted = await this._encryptText(content)
    const tx = await this.contract.updateNote(noteId, encrypted)
    await tx.wait()
  }

  async deleteNote(noteId) {
    const tx = await this.contract.deleteNote(noteId)
    await tx.wait()
  }

  async restoreNote(noteId) {
    const tx = await this.contract.restoreNote(noteId)
    await tx.wait()
  }

  async moveNoteToFolder(noteId, folderId) {
    const tx = await this.contract.moveNoteToFolder(noteId, folderId)
    await tx.wait()
  }

  /* 加载笔记列表（分页 + 排序 + 文件夹 + 视图类型） */
  async getNoteIds(offset, pageSize, asc, folderId, viewType) {
    return this.contract.getUserNoteIds(this.account, offset, pageSize, asc, folderId, viewType)
  }

  async getNotes(ids) {
    return this.contract.getNotes(ids)
  }

  /* 加载笔记并解密为统一结构 */
  async loadNotes(offset, pageSize, asc, folderId, viewType) {
    if (!this.contract) return {notes: [] ,total: 0 }
    
    const result = await this.getNoteIds(offset, pageSize, asc, folderId, viewType)
    // ethers v6 返回的 Result 及其嵌套数组是只读（frozen）的，
    const ids = Array.from(result[0] || [])
    const total = result[1]
    if (!ids || !ids.length) return { notes: [], total: Number(total) }
    const raw = await this.getNotes(ids)
    const notes = []
    for (const n of raw) {
      try {
        const content = await this._decryptText(ethers.getBytes(n.ciphertext))
        notes.push({
          id: n.id,
          content,
          folderId: n.folderId,
          createdAt: Number(n.createdAt) * 1000, // 链上为秒，转毫秒统一
          updatedAt: Number(n.updatedAt) * 1000,
          isDeleted: n.isDeleted,
        })
      } catch (e) {
        // 笔记解密失败：静默跳过（正常情况下不应发生）
      }
    }
    return { notes, total: Number(total) }
  }

  /* ---------- 笔记本业务 ---------- */
  async createFolder(name) {
    const encrypted = await this._encryptText(name)
    const tx = await this.contract.createFolder(encrypted)
    await tx.wait()
  }

  async updateFolder(folderId, newName) {
    const encrypted = await this._encryptText(newName)
    const tx = await this.contract.updateFolder(folderId, encrypted)
    await tx.wait()
  }

  async deleteFolder(folderId) {
    const tx = await this.contract.deleteFolder(folderId)
    await tx.wait()
  }

  async loadFolders() {
    const raw = await this.contract.getUserFolders(this.account)
    const folders = []
    for (const f of raw) {
      try {
        const name = await this._decryptText(ethers.getBytes(f.name))
        folders.push({
          id: f.id,
          name,
          createdAt: Number(f.createdAt) * 1000,
          updatedAt: Number(f.updatedAt) * 1000,
        })
      } catch (e) {
        //console.warn('笔记本解密失败', e)
      }
    }
    return folders
  }
}
