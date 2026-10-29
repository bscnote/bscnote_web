export default {
  app: {
    name: 'BscNote'
  },
  topbar: {
    collapse: 'Collapse sidebar',
    expand: 'Expand sidebar',
    connected: 'Connected',
    connecting: 'Connecting…',
    disconnected: 'Disconnected',
    newConnection: 'New Connection',
    disconnect: 'Disconnect',
    trash: 'Trash',
    changePassword: 'Change Password'
  },
  connect: {
    title: 'Welcome to BscNote',
    desc: 'Connect your wallet first. Once unlocked, you can view and manage your encrypted notes.',
    button: 'Connect Wallet',
    connecting: 'Connecting…'
  },
  wallet: {
    title: 'Select Wallet',
    desc: 'Choose the wallet you want to connect',
    notInstalled: 'Not installed',
    noWallet: 'No wallet detected',
    cancel: 'Cancel'
  },
  sidebar: {
    newNotebook: 'New Notebook',
    browse: 'Browse',
    myNotebooks: 'My Notebooks',
    allNotes: 'All Notes',
    uncategorized: 'Uncategorized',
    rename: 'Rename',
    delete: 'Delete',
  },
  noteList: {
    count: '{n} notes',
    newNote: 'New Note',
    edit: 'Edit',
    delete: 'Delete',
    uncategorized: 'Uncategorized',
    empty: 'No notes here yet',
    emptyAction: 'Create your first note',
    createdAt: 'Created at',
    updatedAt: 'Last updated at'
  },
  notebookModal: {
    createTitle: 'New Notebook',
    renameTitle: 'Rename Notebook',
    nameLabel: 'Notebook Name',
    namePlaceholder: 'Enter a name',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
    saving: 'Saving…'
  },
  noteModal: {
    createTitle: 'New Note',
    editTitle: 'Edit Note',
    notebookLabel: 'Notebook',
    uncategorized: 'Uncategorized',
    contentLabel: 'Content',
    contentPlaceholder: 'Write something…',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving…',
    moveTitle: 'Move Note',
    movePlaceholder: 'Select target notebook',
    moveConfirm: 'Move',
    moving: 'Moving…'
  },
  confirm: {
    cancel: 'Cancel',
    delete: 'Delete',
    deleting: 'Deleting…',
    deleteNotebookTitle: 'Delete Notebook',
    deleteNotebookText: 'After deleting notebook "{name}", its {n} note(s) will be moved to "Uncategorized". This action cannot be undone.',
    deleteNoteTitle: 'Delete Note',
    deleteNoteText: 'Are you sure you want to delete this note? "{name}" This action cannot be undone.'
  },
  trash: {
    title: 'Trash',
    close: 'Close',
    deletedAt: 'Deleted at',
    restore: 'Restore',
    restoring: 'Restoring…',
    empty: 'Trash is empty',
    emptySub: 'Deleted notes will appear here'
  },
  password: {
    title: 'Change Password',
    createTitle: 'Create Password',
    inputTitle: 'Enter Access Password',
    currentLabel: 'Current Password',
    currentPlaceholder: 'Enter current password',
    wrongCurrent: 'Incorrect password',
    firstHint: 'First time: set an access password to encrypt your notes',
    newLabel: 'New Password',
    newPlaceholder: 'At least 9 chars, with upper/lowercase, digit & symbol',
    confirmLabel: 'Confirm New Password',
    confirmPlaceholder: 'Re-enter new password',
    tooShort: 'Password must be at least 9 characters',
    weak: 'Password must contain uppercase, lowercase, digit and special character',
    tooSimple: 'Password is too common, please use a stronger one and do not use consecutive letters or digits on the keyboard',
    mismatch: 'The two passwords do not match',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create Password',
    unlock: 'Unlock',
    inputPlaceholder: 'Enter access password'
  },
  sort: {
    label: 'Sort',
    createdDesc: 'Updated: newest first',
    createdAsc: 'Updated: oldest first'
  },
  search: {
    placeholder: 'Search note content…',
    clear: 'Clear search',
    resultsTitle: 'Search Results',
    results: '{n} matched',
    noResults: 'No matching notes'
  },
  pagination: {
    total: 'Total {n}',
    perPage: '{n} / page',
    prev: 'Previous',
    next: 'Next'
  },
  lang: {
    label: 'Language'
  },
  readEnvelopeLoading: {
    title: 'Reading data',
    countdown: 'Auto-cancel in {n}s'
  },
  passwordToggle: {
    show: 'Show password',
    hide: 'Hide password'
  },
  theme: {
    label: 'Theme',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode'
  },
  toast: {
    connected: 'Connection established',
    reconnected: 'Reconnected',
    disconnected: 'Disconnected',
    notebookRenamed: 'Notebook renamed',
    notebookCreated: 'Notebook created',
    notebookDeleted: 'Notebook deleted',
    noteCreated: 'Note created',
    noteDeleted: 'Note deleted',
    noteRestored: 'Note restored',
    noteMoved: 'Note moved',
    passwordUpdated: 'Password updated',
    setPasswordFirst: 'Please set a password first',
    walletMissing: 'No browser wallet detected',
    wrongNetwork: 'Wrong network. Please select BSC network',
    unlockSuccess: 'Unlocked successfully',
    passwordCreated: 'Password set successfully',
    passwordWrong: 'Incorrect password',
    readEnvelopeTimeout: 'Reading data timed out, please reconnect your wallet'
  }
}
