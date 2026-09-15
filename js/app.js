/**
 * SpendPulse App Controller - State management, filtering, and event routing.
 */
document.addEventListener('DOMContentLoaded', () => {
  const ui = new UIManager();
  const charts = new ChartEngine();

  // Run Startup Checks
  if (typeof StorageManager !== 'undefined') {
    StorageManager.autoCleanTrash();
  }

  // Active Filter State
  let currentPeriod = 'all_time'; // 'this_month' | 'last_month' | 'all_time'
  let currentType = 'ALL';        // 'ALL' | 'income' | 'expense'
  let currentCategory = 'ALL';
  let currentSort = 'date_desc';
  let currentSearch = '';

  // Elements
  const searchInput = document.getElementById('searchInput');
  const periodFilter = document.getElementById('periodFilter');
  const typeFilter = document.getElementById('typeFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const transactionForm = document.getElementById('transactionForm');
  const typeExpenseBtn = document.getElementById('typeExpenseBtn');
  const typeIncomeBtn = document.getElementById('typeIncomeBtn');
  const transCategorySelect = document.getElementById('transCategorySelect');
  const transCategoryCustom = document.getElementById('transCategoryCustom');

  // Backup Elements
  const openBackupModalBtn = document.getElementById('openBackupModalBtn');
  const closeBackupModalBtn = document.getElementById('closeBackupModalBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importJsonInput = document.getElementById('importJsonInput');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  // Settings & Theme
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsSidebar = document.getElementById('settingsSidebar');
  const settingsBackdrop = document.getElementById('settingsBackdrop');

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  const currencySelect = document.getElementById('currencySelect');
  const viewTrashBtn = document.getElementById('viewTrashBtn');
  const clearDataSidebarBtn = document.getElementById('clearDataSidebarBtn');

  const trashModal = document.getElementById('trashModal');
  const closeTrashModalBtn = document.getElementById('closeTrashModalBtn');
  const emptyTrashBtn = document.getElementById('emptyTrashBtn');
  const trashListContainer = document.getElementById('trashListContainer');

  const clearConfirmModal = document.getElementById('clearConfirmModal');
  const cancelClearBtn = document.getElementById('cancelClearBtn');
  const confirmClearBtn = document.getElementById('confirmClearBtn');

  /**
   * Main Workspace Render Engine
   */
  function refreshWorkspace() {
    let allTransactions = StorageManager.getTransactions();

    // 1. Period Filtering
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let filtered = allTransactions.filter(t => {
      if (!t.date) return true;
      const d = new Date(t.date + 'T00:00:00');
      if (currentPeriod === 'this_month') {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }
      if (currentPeriod === 'last_month') {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        return d.getFullYear() === lastMonthDate.getFullYear() && d.getMonth() === lastMonthDate.getMonth();
      }
      return true; // all_time
    });

    // 2. Type Filter
    if (currentType !== 'ALL') {
      filtered = filtered.filter(t => t.type === currentType);
    }

    // 3. Category Filter
    if (currentCategory !== 'ALL') {
      filtered = filtered.filter(t => (t.category || '').toLowerCase() === currentCategory.toLowerCase());
    }

    // 4. Search Filter
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    // 5. Sorting
    filtered.sort((a, b) => {
      if (currentSort === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (currentSort === 'amount_desc') return Number(b.amount) - Number(a.amount);
      if (currentSort === 'amount_asc') return Number(a.amount) - Number(b.amount);
      return new Date(b.date) - new Date(a.date); // Default: date_desc
    });

    // Render Table
    ui.renderTransactions(filtered);

    // Update KPI metrics
    updateKPIDashboard();

    // Update Visual Analytics Charts
    charts.updateCategoryChart(filtered);
    charts.updateTrendChart(allTransactions);

    // Update Dynamic Category Dropdown
    const uniqueCategories = [...new Set(allTransactions.map(t => t.category).filter(Boolean))];
    ui.updateCategoryDropdown(uniqueCategories);
  }

  /**
   * Update KPI Cards & Progress Meters
   */
  function updateKPIDashboard() {
    const metrics = StorageManager.getMetrics();

    document.getElementById('kpiNetBalance').textContent = ui.formatCurrency(metrics.netBalance);
    document.getElementById('kpiMonthlyIncome').textContent = ui.formatCurrency(metrics.monthlyIncome);
    document.getElementById('kpiMonthlyExpense').textContent = ui.formatCurrency(metrics.monthlyExpense);
    document.getElementById('kpiSavingsRate').textContent = `${metrics.savingsRate}%`;
    document.getElementById('savingsProgressBar').style.width = `${Math.min(100, metrics.savingsRate)}%`;

    document.getElementById('incomeCountText').textContent = `${metrics.monthlyIncomeCount} deposits logged`;
    document.getElementById('expenseCountText').textContent = `${metrics.monthlyExpenseCount} expenses logged`;
  }

  // ================= Event Handlers =================

  // Type Toggle Buttons inside Modal
  typeExpenseBtn.addEventListener('click', () => ui.setTransactionType('expense'));
  typeIncomeBtn.addEventListener('click', () => ui.setTransactionType('income'));

  // Custom Category Toggle
  transCategorySelect.addEventListener('change', () => {
    if (transCategorySelect.value === 'Custom') {
      transCategoryCustom.focus();
    }
  });

  // Modal Open/Close
  openAddModalBtn.addEventListener('click', () => ui.openTransactionModal());
  closeModalBtn.addEventListener('click', () => ui.closeTransactionModal());
  cancelModalBtn.addEventListener('click', () => ui.closeTransactionModal());

  // Form Submit (Create / Edit)
  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('transId').value;
    const type = document.getElementById('transType').value;
    const title = document.getElementById('transTitle').value;
    const amount = parseFloat(document.getElementById('transAmount').value);
    const date = document.getElementById('transDate').value;
    const notes = document.getElementById('transNotes').value;

    let category = transCategorySelect.value;
    if (category === 'Custom' && transCategoryCustom.value.trim()) {
      category = transCategoryCustom.value.trim();
    }

    if (id) {
      StorageManager.updateTransaction(id, { type, title, amount, date, category, notes });
      ui.showToast('Transaction updated successfully.', 'success');
    } else {
      StorageManager.addTransaction({ type, title, amount, date, category, notes });
      ui.showToast('New transaction recorded.', 'success');
      if (type === 'income') {
        ui.triggerConfetti();
      }
    }

    ui.closeTransactionModal();
    refreshWorkspace();
  });

  // Table Delegated Actions (Edit & Delete)
  document.getElementById('transactionTableBody').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-tx-btn');
    if (editBtn) {
      const id = editBtn.dataset.id;
      const tx = StorageManager.getTransactions().find(t => t.id === id);
      if (tx) ui.openTransactionModal(tx);
      return;
    }

    const deleteBtn = e.target.closest('.delete-tx-btn');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const deletedItem = StorageManager.deleteTransaction(id);
      refreshWorkspace();
      ui.showToast('Transaction removed.', 'warning', () => {
        if (deletedItem) {
          const txs = StorageManager.getTransactions();
          txs.unshift(deletedItem);
          StorageManager.saveTransactions(txs);
          refreshWorkspace();
        }
      });
      return;
    }
  });

  // Filters & Search
  periodFilter.addEventListener('change', (e) => {
    currentPeriod = e.target.value;
    refreshWorkspace();
  });

  typeFilter.addEventListener('change', (e) => {
    currentType = e.target.value;
    refreshWorkspace();
  });

  categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    refreshWorkspace();
  });

  sortFilter.addEventListener('change', (e) => {
    currentSort = e.target.value;
    refreshWorkspace();
  });

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = e.target.value;
      refreshWorkspace();
    }, 150);
  });

  // Data Export & Import Handlers
  exportCsvBtn.addEventListener('click', () => {
    StorageManager.exportCSV();
    ui.showToast('Ledger exported as CSV.', 'success');
  });

  openBackupModalBtn.addEventListener('click', () => ui.backupModal.showModal());
  closeBackupModalBtn.addEventListener('click', () => ui.backupModal.close());

  exportJsonBtn.addEventListener('click', () => {
    StorageManager.exportJSON();
    ui.backupModal.close();
    ui.showToast('Backup JSON archive downloaded.', 'success');
  });

  importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const success = StorageManager.importJSON(evt.target.result);
      ui.backupModal.close();
      if (success) {
        ui.showToast('Financial ledger restored successfully!', 'success');
        refreshWorkspace();
      } else {
        ui.showToast('Invalid JSON file schema.', 'warning');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Settings & Sidebar Actions
  function openSettings() {
    settingsBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    settingsSidebar.classList.remove('translate-x-full');
  }

  function closeSettings() {
    settingsBackdrop.classList.add('opacity-0', 'pointer-events-none');
    settingsSidebar.classList.add('translate-x-full');
  }

  openSettingsBtn.addEventListener('click', openSettings);
  closeSettingsBtn.addEventListener('click', closeSettings);
  settingsBackdrop.addEventListener('click', closeSettings);

  // Apply visual settings from storage
  function applySettings(refresh = false) {
    const s = StorageManager.getSettings();
    if (s.theme === 'light') {
      document.documentElement.classList.remove('dark');
      themeIcon.setAttribute('data-lucide', 'sun');
      themeLabel.textContent = 'Light Mode';
    } else {
      document.documentElement.classList.add('dark');
      themeIcon.setAttribute('data-lucide', 'moon');
      themeLabel.textContent = 'Dark Mode';
    }

    currencySelect.value = s.currency;
    if (window.lucide) window.lucide.createIcons();
    if (refresh) refreshWorkspace();
  }

  themeToggleBtn.addEventListener('click', () => {
    const s = StorageManager.getSettings();
    s.theme = s.theme === 'dark' ? 'light' : 'dark';
    StorageManager.saveSettings(s);
    applySettings(false);
  });

  currencySelect.addEventListener('change', (e) => {
    const s = StorageManager.getSettings();
    s.currency = e.target.value;
    StorageManager.saveSettings(s);
    refreshWorkspace();
  });

  // Trash & Clear Data Flow
  clearDataSidebarBtn.addEventListener('click', () => {
    closeSettings();
    clearConfirmModal.showModal();
  });

  cancelClearBtn.addEventListener('click', () => {
    clearConfirmModal.close();
  });

  confirmClearBtn.addEventListener('click', () => {
    const count = StorageManager.clearAllDataToTrash();
    clearConfirmModal.close();
    ui.showToast(`Cleared ${count} entries. Moved to trash.`, 'warning');
    refreshWorkspace();
  });

  function renderTrashList() {
    const trash = StorageManager.getTrash();
    trashListContainer.innerHTML = '';

    if (trash.length === 0) {
      trashListContainer.innerHTML = '<p class="text-center text-xs text-slate-500 py-4">Trash is empty.</p>';
      emptyTrashBtn.style.display = 'none';
      return;
    }

    emptyTrashBtn.style.display = 'block';

    trash.forEach(t => {
      const el = document.createElement('div');
      el.className = 'glass-panel p-3 rounded-xl flex items-center justify-between gap-3 text-sm border border-slate-200 dark:border-white/10 relative overflow-hidden bg-white dark:bg-transparent';

      const expireDate = new Date(new Date(t.deletedAt).getTime() + 3 * 24 * 60 * 60 * 1000);
      const isIncome = t.type === 'income';
      const color = isIncome ? 'text-emerald-500' : 'text-rose-500';

      el.innerHTML = `
        <div class="flex-1 overflow-hidden">
           <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">${ui.escapeHTML(t.title)}</div>
           <div class="text-[10px] text-slate-500">Deleted: ${new Date(t.deletedAt).toLocaleDateString()} &centerdot; Expires: ${expireDate.toLocaleDateString()}</div>
        </div>
        <div class="flex items-center gap-2">
           <span class="font-bold hidden sm:inline-block ${color}">${isIncome ? '+' : '-'}${ui.formatCurrency(t.amount)}</span>
           <button class="restore-btn p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition" data-id="${t.id}" title="Restore">
             <i data-lucide="refresh-ccw" class="w-4 h-4"></i>
           </button>
           <button class="perm-delete-btn p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition" data-id="${t.id}" title="Delete Permanently">
             <i data-lucide="x" class="w-4 h-4"></i>
           </button>
        </div>
      `;
      trashListContainer.appendChild(el);
    });
    if (window.lucide) window.lucide.createIcons();
  }

  viewTrashBtn.addEventListener('click', () => {
    closeSettings();
    renderTrashList();
    trashModal.showModal();
  });

  closeTrashModalBtn.addEventListener('click', () => {
    trashModal.close();
  });

  emptyTrashBtn.addEventListener('click', () => {
    StorageManager.emptyTrash();
    renderTrashList();
    ui.showToast('Trash emptied permanently.', 'info');
  });

  trashListContainer.addEventListener('click', (e) => {
    const restoreBtn = e.target.closest('.restore-btn');
    if (restoreBtn) {
      StorageManager.restoreFromTrash(restoreBtn.dataset.id);
      renderTrashList();
      refreshWorkspace();
      ui.showToast('Item restored to active records.', 'success');
      return;
    }

    const delBtn = e.target.closest('.perm-delete-btn');
    if (delBtn) {
      StorageManager.deletePermanent(delBtn.dataset.id);
      renderTrashList();
      ui.showToast('Item deleted permanently.', 'info');
      return;
    }
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      if (ui.modal.open) ui.closeTransactionModal();
      if (ui.backupModal.open) ui.backupModal.close();
      if (trashModal.open) trashModal.close();
      if (clearConfirmModal.open) clearConfirmModal.close();
      closeSettings();
    }
  });

  // Initial Load
  applySettings(true);
});
