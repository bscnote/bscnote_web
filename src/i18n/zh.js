export default {
  app: {
    name: 'BscNote'
  },
  topbar: {
    collapse: '折叠侧栏',
    expand: '展开侧栏',
    connected: '已连接',
    connecting: '连接中…',
    disconnected: '已断开',
    newConnection: '新开连接',
    disconnect: '断开连接',
    trash: '回收站',
    changePassword: '修改密码',
    lock: '锁定'
  },
  connect: {
    title: '欢迎使用BscNote',
    desc: '请先连接钱包，解锁后可查看和管理你的加密笔记',
    button: '连接钱包',
    connecting: '连接中…'
  },
  wallet: {
    title: '选择钱包',
    desc: '请选择用于连接的钱包',
    notInstalled: '未安装',
    noWallet: '未检测到已安装的钱包',
    cancel: '取消'
  },
  sidebar: {
    newNotebook: '新建笔记本',
    browse: '浏览',
    myNotebooks: '我的笔记本',
    allNotes: '全部笔记',
    uncategorized: '未分类',
    rename: '重命名',
    delete: '删除',
  },
  noteList: {
    count: '{n} 条笔记',
    newNote: '新建笔记',
    edit: '编辑',
    delete: '删除',
    uncategorized: '未分类',
    empty: '这里还没有笔记',
    emptyAction: '新建第一条笔记'
  },
  notebookModal: {
    createTitle: '新建笔记本',
    renameTitle: '重命名笔记本',
    nameLabel: '笔记本名称',
    namePlaceholder: '请输入名称',
    cancel: '取消',
    save: '保存',
    create: '创建',
    saving: '保存中…'
  },
  noteModal: {
    createTitle: '新建笔记',
    editTitle: '编辑笔记',
    notebookLabel: '所属笔记本',
    uncategorized: '未分类',
    contentLabel: '正文',
    contentPlaceholder: '写点什么…',
    cancel: '取消',
    save: '保存',
    saving: '保存中…',
    moveTitle: '移动笔记',
    movePlaceholder: '请选择目标笔记本',
    moveConfirm: '移动',
    moving: '移动中…'
  },
  confirm: {
    cancel: '取消',
    delete: '删除',
    deleting: '删除中…',
    deleteNotebookTitle: '删除笔记本',
    deleteNotebookText: '删除笔记本「{name}」后，其中的 {n} 条笔记将移至「未分类」，此操作不可撤销。',
    deleteNoteTitle: '删除笔记',
    deleteNoteText: '确定删除这条笔记吗？「{name}」此操作不可撤销。'
  },
  trash: {
    title: '回收站',
    close: '关闭',
    deletedAt: '删除于',
    restore: '恢复',
    restoring: '恢复中…',
    empty: '回收站为空',
    emptySub: '已删除的笔记会显示在这里'
  },
  password: {
    title: '修改密码',
    createTitle: '创建密码',
    inputTitle: '输入访问密码',
    currentLabel: '当前密码',
    currentPlaceholder: '请输入当前密码',
    wrongCurrent: '密码错误',
    firstHint: '首次使用：请设置一个访问密码，用于加密你的笔记',
    newLabel: '新密码',
    newPlaceholder: '至少 8 位，含大小写字母、数字和特殊字符',
    confirmLabel: '确认新密码',
    confirmPlaceholder: '再次输入新密码',
    tooShort: '密码至少 8 位',
    weak: '密码需包含大写字母、小写字母、数字和特殊字符',
    mismatch: '两次输入的密码不一致',
    cancel: '取消',
    save: '保存',
    create: '创建密码',
    unlock: '解锁',
    inputPlaceholder: '请输入访问密码'
  },
  lock: {
    title: '应用已锁定',
    placeholder: '请输入密码',
    wrong: '密码错误',
    unlock: '解锁'
  },
  sort: {
    label: '排序',
    createdDesc: '创建时间：新 → 旧',
    createdAsc: '创建时间：旧 → 新'
  },
  search: {
    placeholder: '搜索笔记内容…',
    clear: '清除搜索',
    resultsTitle: '搜索结果',
    results: '{n} 条匹配',
    noResults: '没有匹配的笔记'
  },
  pagination: {
    total: '共 {n} 条',
    perPage: '{n} 条/页',
    prev: '上一页',
    next: '下一页'
  },
  lang: {
    label: '语言'
  },
  passwordToggle: {
    show: '显示密码',
    hide: '隐藏密码'
  },
  theme: {
    label: '主题',
    switchToDark: '切换深色模式',
    switchToLight: '切换浅色模式'
  },
  toast: {
    connected: '连接已建立',
    reconnected: '已重新连接',
    disconnected: '连接已断开',
    notebookRenamed: '笔记本已重命名',
    notebookCreated: '笔记本已创建',
    notebookDeleted: '笔记本已删除',
    noteCreated: '笔记已创建',
    noteDeleted: '笔记已删除',
    noteRestored: '笔记已恢复',
    noteMoved: '笔记已移动',
    passwordUpdated: '密码已更新',
    setPasswordFirst: '请先设置密码',
    walletMissing: '未检测到浏览器插件钱包',
    wrongNetwork: '插件钱包网络不正确，请选择 BSC 网络',
    unlockSuccess: '解锁成功',
    passwordCreated: '首次设置密码成功',
    passwordWrong: '密码错误'
  }
}
