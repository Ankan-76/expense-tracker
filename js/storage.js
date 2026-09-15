/**
 * StorageManager - LocalStorage persistence, financial calculations, and I/O.
 */
class StorageManager {
  static STORAGE_KEY = 'SPENDPULSE_DATA_V1';
  static SETTINGS_KEY = 'SPENDPULSE_SETTINGS_V1';
  static TRASH_KEY = 'SPENDPULSE_TRASH_V1';

  static getSettings() {
    const raw = localStorage.getItem(this.SETTINGS_KEY);
    if (!raw) return { theme: 'dark', currency: 'USD' };
    try {
      return JSON.parse(raw);
    } catch {
      return { theme: 'dark', currency: 'USD' };
    }
  }

  static saveSettings(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  static getTrash() {
    const raw = localStorage.getItem(this.TRASH_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveTrash(trash) {
    localStorage.setItem(this.TRASH_KEY, JSON.stringify(trash));
  }

  static autoCleanTrash() {
    const trash = this.getTrash();
    if (trash.length === 0) return;

    const now = Date.now();
    const retention = 3 * 24 * 60 * 60 * 1000; // 3 days

    const filtered = trash.filter(t => {
      if (!t.deletedAt) return false;
      return (now - new Date(t.deletedAt).getTime()) < retention;
    });

    if (filtered.length !== trash.length) {
      this.saveTrash(filtered);
    }
  }

  /**
   * Seed transactions to populate dashboard on first launch
   */
  static DEFAULT_SEED = [
    {
      id: 'tx-seed-1',
      title: 'Monthly Tech Retainer',
      amount: 4850.00,
      type: 'income',
      category: 'Salary & Retainer',
      date: new Date(Date.now() - 3600000 * 24 * 3).toISOString().split('T')[0],
      notes: 'Direct client deposit - Sprint deliverables'
    },
    {
      id: 'tx-seed-2',
      title: 'Downtown Loft Studio',
      amount: 1450.00,
      type: 'expense',
      category: 'Housing & Rent',
      date: new Date(Date.now() - 3600000 * 24 * 5).toISOString().split('T')[0],
      notes: 'Monthly rental lease wire'
    },
    {
      id: 'tx-seed-3',
      title: 'Cloud Compute Infrastructure',
      amount: 210.40,
      type: 'expense',
      category: 'Tech & Tools',
      date: new Date(Date.now() - 3600000 * 24 * 8).toISOString().split('T')[0],
      notes: 'Production clusters & database hosting'
    },
    {
      id: 'tx-seed-4',
      title: 'Whole Foods Market',
      amount: 145.80,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date(Date.now() - 3600000 * 24 * 10).toISOString().split('T')[0],
      notes: 'Weekly organic groceries'
    },
    {
      id: 'tx-seed-5',
      title: 'Dividend Payout',
      amount: 320.00,
      type: 'income',
      category: 'Investments',
      date: new Date(Date.now() - 3600000 * 24 * 15).toISOString().split('T')[0],
      notes: 'Quarterly index fund distribution'
    }
  ];

  /**
   * Fetch all records
   */
  static getTransactions() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      this.saveTransactions(this.DEFAULT_SEED);
      return [...this.DEFAULT_SEED];
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Data corruption detected; resetting seed:', e);
      this.saveTransactions(this.DEFAULT_SEED);
      return [...this.DEFAULT_SEED];
    }
  }

  static saveTransactions(txs) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(txs));
  }

  /**
   * Add new transaction
   */
  static addTransaction(data) {
    const txs = this.getTransactions();
    const newTx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: data.title.trim(),
      amount: parseFloat(data.amount),
      type: data.type, // 'income' | 'expense'
      category: data.category.trim() || 'General',
      date: data.date,
      notes: (data.notes || '').trim(),
      createdAt: new Date().toISOString()
    };
    txs.unshift(newTx);
    this.saveTransactions(txs);
    return newTx;
  }

  /**
   * Update transaction
   */
  static updateTransaction(id, updates) {
    const txs = this.getTransactions();
    const idx = txs.findIndex(t => t.id === id);
    if (idx === -1) return null;
    txs[idx] = {
      ...txs[idx],
      ...updates,
      amount: parseFloat(updates.amount),
      updatedAt: new Date().toISOString()
    };
    this.saveTransactions(txs);
    return txs[idx];
  }

  /**
   * Delete transaction (Moves to Trash)
   */
  static deleteTransaction(id) {
    const txs = this.getTransactions();
    const item = txs.find(t => t.id === id);
    if (!item) return null;

    const filtered = txs.filter(t => t.id !== id);
    this.saveTransactions(filtered);

    // Move to trash
    const trash = this.getTrash();
    item.deletedAt = new Date().toISOString();
    trash.unshift(item);
    this.saveTrash(trash);

    return item;
  }

  static clearAllDataToTrash() {
    const txs = this.getTransactions();
    if (txs.length === 0) return 0;

    const trash = this.getTrash();
    const now = new Date().toISOString();

    const toTrash = txs.map(t => ({ ...t, deletedAt: now }));
    trash.unshift(...toTrash);
    this.saveTrash(trash);

    this.saveTransactions([]); // Clear active
    return txs.length;
  }

  static restoreFromTrash(id) {
    const trash = this.getTrash();
    const idx = trash.findIndex(t => t.id === id);
    if (idx === -1) return false;

    const item = trash.splice(idx, 1)[0];
    delete item.deletedAt;
    delete item.updatedAt;

    const txs = this.getTransactions();
    txs.unshift(item);

    this.saveTrash(trash);
    this.saveTransactions(txs);
    return true;
  }

  static deletePermanent(id) {
    const trash = this.getTrash();
    const filtered = trash.filter(t => t.id !== id);
    this.saveTrash(filtered);
  }

  static emptyTrash() {
    this.saveTrash([]);
  }

  /**
   * Compute comprehensive financial metrics
   */
  static getMetrics() {
    const txs = this.getTransactions();
    let netBalance = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let monthlyIncomeCount = 0;
    let monthlyExpenseCount = 0;

    txs.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        netBalance += amt;
      } else {
        netBalance -= amt;
      }

      if (t.date) {
        const txDate = new Date(t.date + 'T00:00:00');
        if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
          if (t.type === 'income') {
            monthlyIncome += amt;
            monthlyIncomeCount++;
          } else {
            monthlyExpense += amt;
            monthlyExpenseCount++;
          }
        }
      }
    });

    let savingsRate = 0;
    if (monthlyIncome > 0) {
      const saved = monthlyIncome - monthlyExpense;
      savingsRate = Math.max(0, Math.round((saved / monthlyIncome) * 100));
    }

    return {
      netBalance,
      monthlyIncome,
      monthlyExpense,
      monthlyIncomeCount,
      monthlyExpenseCount,
      savingsRate
    };
  }

  /**
   * CSV Exporter
   */
  static exportCSV() {
    const txs = this.getTransactions();
    const headers = ['ID', 'Date', 'Type', 'Title', 'Category', 'Amount', 'Notes'];
    const rows = txs.map(t => [
      t.id,
      t.date,
      t.type.toUpperCase(),
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendpulse-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * JSON Exporter
   */
  static exportJSON() {
    const txs = this.getTransactions();
    const payload = {
      app: 'SpendPulse',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions: txs
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendpulse-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * JSON Importer
   */
  static importJSON(rawString) {
    try {
      const data = JSON.parse(rawString);
      if (Array.isArray(data.transactions)) {
        this.saveTransactions(data.transactions);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON file payload:', e);
      return false;
    }
  }
}
