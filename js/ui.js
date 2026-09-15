/**
 * UIManager - DOM orchestration, table rendering, native modals, and toast messages.
 */
class UIManager {
  constructor() {
    this.tableBody = document.getElementById('transactionTableBody');
    this.tableEmptyState = document.getElementById('tableEmptyState');
    this.modal = document.getElementById('transactionModal');
    this.backupModal = document.getElementById('backupModal');
    this.toastContainer = document.getElementById('toastContainer');
    this.categoryFilter = document.getElementById('categoryFilter');

    // Modal Form Elements
    this.transId = document.getElementById('transId');
    this.transType = document.getElementById('transType');
    this.transTitle = document.getElementById('transTitle');
    this.transAmount = document.getElementById('transAmount');
    this.transDate = document.getElementById('transDate');
    this.transCategorySelect = document.getElementById('transCategorySelect');
    this.transCategoryCustom = document.getElementById('transCategoryCustom');
    this.transNotes = document.getElementById('transNotes');
    this.typeExpenseBtn = document.getElementById('typeExpenseBtn');
    this.typeExpenseBtn = document.getElementById('typeExpenseBtn');
    this.typeIncomeBtn = document.getElementById('typeIncomeBtn');
  }

  formatCurrency(amount) {
    const settings = typeof StorageManager !== 'undefined' ? StorageManager.getSettings() : { currency: 'USD' };
    const currStr = settings.currency === 'INR' ? '₹' : '$';
    return `${currStr}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }

  /**
   * Render transaction rows into the table
   */
  renderTransactions(transactions) {
    this.tableBody.innerHTML = '';

    if (transactions.length === 0) {
      this.tableEmptyState.classList.remove('hidden');
      this.tableEmptyState.classList.add('flex');
      return;
    }

    this.tableEmptyState.classList.add('hidden');
    this.tableEmptyState.classList.remove('flex');

    transactions.forEach((t) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/[0.02] transition-colors group';

      const isIncome = t.type === 'income';
      const formattedAmount = `${isIncome ? '+' : '-'}${this.formatCurrency(t.amount)}`;
      const amountColor = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

      const formattedDate = t.date
        ? new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

      tr.innerHTML = `
        <td class="py-3.5 px-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl ${isIncome ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'} flex items-center justify-center shrink-0 transition-colors">
              <i data-lucide="${isIncome ? 'arrow-down-left' : 'arrow-up-right'}" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="font-semibold text-slate-800 dark:text-slate-100 transition-colors">${this.escapeHTML(t.title)}</div>
              ${t.notes ? `<div class="text-[11px] text-slate-500 transition-colors line-clamp-1">${this.escapeHTML(t.notes)}</div>` : ''}
            </div>
          </div>
        </td>
        <td class="py-3.5 px-3">
          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/5 transition-colors">
            ${this.escapeHTML(t.category)}
          </span>
        </td>
        <td class="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-xs transition-colors">${formattedDate}</td>
        <td class="py-3.5 px-3 text-right font-bold ${amountColor} transition-colors">${formattedAmount}</td>
        <td class="py-3.5 px-3 text-right">
          <div class="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button class="edit-tx-btn p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors" title="Edit" data-id="${t.id}">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button class="delete-tx-btn p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors" title="Delete" data-id="${t.id}">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      `;

      this.tableBody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Update category dropdown selector options
   */
  updateCategoryDropdown(categories) {
    const currentVal = this.categoryFilter.value;
    this.categoryFilter.innerHTML = '<option value="ALL">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      this.categoryFilter.appendChild(opt);
    });
    this.categoryFilter.value = currentVal;
  }

  /**
   * Modal management
   */
  openTransactionModal(tx = null) {
    const modalTitle = document.getElementById('modalTitle');
    if (tx) {
      modalTitle.textContent = 'Edit Transaction';
      this.transId.value = tx.id;
      this.setTransactionType(tx.type);
      this.transTitle.value = tx.title;
      this.transAmount.value = tx.amount;
      this.transDate.value = tx.date;
      this.transNotes.value = tx.notes || '';

      const expensePresets = [
        'Food & Dining', 'Housing & Rent', 'Tech & Tools',
        'Transportation', 'Entertainment', 'Health & Medical',
        'Groceries & Needs', 'Travel & Vacation', 'Self Care & Shopping'
      ];
      const incomePresets = [
        'Salary & Retainer', 'Investments', 'Freelance & Projects',
        'Bonus & Allowances', 'Rental Income', 'Gifts & Donations',
        'Refunds & Returns', 'Side Hustles & Gigs', 'Awards & Prizes'
      ];
      const presets = tx.type === 'income' ? incomePresets : expensePresets;

      if (presets.includes(tx.category)) {
        this.transCategorySelect.value = tx.category;
        this.transCategoryCustom.value = '';
      } else {
        this.transCategorySelect.value = 'Custom';
        this.transCategoryCustom.value = tx.category;
      }
    } else {
      modalTitle.textContent = 'Record Transaction';
      this.transId.value = '';
      this.setTransactionType('expense');
      this.transTitle.value = '';
      this.transAmount.value = '';
      this.transDate.value = new Date().toISOString().split('T')[0];
      this.transNotes.value = '';
      this.transCategorySelect.value = 'Food & Dining';
      this.transCategoryCustom.value = '';
    }

    this.modal.showModal();
    this.transTitle.focus();
    if (window.lucide) window.lucide.createIcons();
  }

  closeTransactionModal() {
    this.modal.close();
  }

  setTransactionType(type) {
    this.transType.value = type;
    if (type === 'expense') {
      this.typeExpenseBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-rose-500 text-white shadow-lg shadow-rose-500/20';
      this.typeIncomeBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';

      this.transCategorySelect.innerHTML = `
        <option value="Food & Dining">🍔 Food & Dining</option>
        <option value="Housing & Rent">🏠 Housing & Rent</option>
        <option value="Tech & Tools">💻 Tech & Tools</option>
        <option value="Transportation">🚗 Transportation</option>
        <option value="Entertainment">🎬 Entertainment</option>
        <option value="Health & Medical">🏥 Health & Medical</option>
        <option value="Groceries & Needs">🛒 Groceries & Needs</option>
        <option value="Travel & Vacation">✈️ Travel & Vacation</option>
        <option value="Self Care & Shopping">🛍️ Self Care & Shopping</option>
        <option value="Custom">✨ Custom Name...</option>
      `;
    } else {
      this.typeIncomeBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';
      this.typeExpenseBtn.className = 'py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';

      this.transCategorySelect.innerHTML = `
        <option value="Salary & Retainer">💼 Salary & Retainer</option>
        <option value="Investments">📈 Investments</option>
        <option value="Freelance & Projects">🎨 Freelance & Projects</option>
        <option value="Bonus & Allowances">💰 Bonus & Allowances</option>
        <option value="Rental Income">🏡 Rental Income</option>
        <option value="Gifts & Donations">🎁 Gifts & Donations</option>
        <option value="Refunds & Returns">💸 Refunds & Returns</option>
        <option value="Side Hustles & Gigs">🚀 Side Hustles & Gigs</option>
        <option value="Awards & Prizes">🏆 Awards & Prizes</option>
        <option value="Custom">✨ Custom Name...</option>
      `;
    }
  }

  /**
   * Actionable Toast Notifications
   */
  showToast(message, type = 'info', undoCallback = null) {
    const toast = document.createElement('div');
    toast.className = 'glass-panel border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between gap-4 text-xs font-medium text-slate-100 pointer-events-auto animate-scale-in max-w-sm';

    const icons = {
      success: '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>',
      info: '<i data-lucide="info" class="w-4 h-4 text-cyan-400"></i>',
      warning: '<i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400"></i>'
    };

    toast.innerHTML = `
      <div class="flex items-center gap-2.5">
        ${icons[type] || icons.info}
        <span>${this.escapeHTML(message)}</span>
      </div>
    `;

    if (undoCallback) {
      const undoBtn = document.createElement('button');
      undoBtn.type = 'button';
      undoBtn.className = 'px-2 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] transition';
      undoBtn.textContent = 'Undo';
      undoBtn.onclick = () => {
        undoCallback();
        toast.remove();
      };
      toast.appendChild(undoBtn);
    }

    this.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#06B6D4', '#8B5CF6']
      });
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}
