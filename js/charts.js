/**
 * ChartEngine - Handles Chart.js initialization and updates with high-contrast dark theme styling.
 */
class ChartEngine {
  constructor() {
    this.categoryChart = null;
    this.trendChart = null;
    this.palette = [
      '#8B5CF6', // Violet
      '#06B6D4', // Cyan
      '#10B981', // Emerald
      '#F43F5E', // Rose
      '#F59E0B', // Amber
      '#EC4899', // Pink
      '#3B82F6', // Blue
      '#6366F1'  // Indigo
    ];
  }

  /**
   * Render Category Distribution Doughnut Chart
   */
  updateCategoryChart(transactions) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const legendEl = document.getElementById('categoryChartLegend');

    // Filter expenses only
    const expenses = transactions.filter(t => t.type === 'expense');

    const catMap = {};
    expenses.forEach(t => {
      const cat = t.category || 'Uncategorized';
      catMap[cat] = (catMap[cat] || 0) + Number(t.amount);
    });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    if (labels.length === 0) {
      legendEl.innerHTML = '<span class="text-slate-500 italic text-xs">No expense data recorded.</span>';
      return;
    }

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.palette.slice(0, labels.length),
          borderColor: '#111827',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleColor: '#F8FAFC',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => ` $${ctx.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            }
          }
        },
        cutout: '72%'
      }
    });

    // Custom Legend
    legendEl.innerHTML = labels.map((label, idx) => `
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 border border-white/5">
        <span class="w-2 h-2 rounded-full" style="background-color: ${this.palette[idx % this.palette.length]}"></span>
        <span>${label}</span>
      </span>
    `).join('');
  }

  /**
   * Render Monthly Income vs. Expense Trend Chart
   */
  updateTrendChart(transactions) {
    const ctx = document.getElementById('trendChart').getContext('2d');

    // Aggregate by Month-Year (last 6 months chronological)
    const monthMap = {};
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      monthMap[key] = { label, income: 0, expense: 0 };
      months.push(key);
    }

    transactions.forEach(t => {
      if (!t.date) return;
      const key = t.date.substring(0, 7);
      if (monthMap[key]) {
        if (t.type === 'income') {
          monthMap[key].income += Number(t.amount);
        } else {
          monthMap[key].expense += Number(t.amount);
        }
      }
    });

    const labels = months.map(m => monthMap[m].label);
    const incomeData = months.map(m => monthMap[m].income);
    const expenseData = months.map(m => monthMap[m].expense);

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    this.trendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderRadius: 6,
            maxBarThickness: 28
          },
          {
            label: 'Expense',
            data: expenseData,
            backgroundColor: 'rgba(244, 63, 94, 0.85)',
            borderRadius: 6,
            maxBarThickness: 28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleColor: '#F8FAFC',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94A3B8', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94A3B8',
              font: { size: 10 },
              callback: (val) => '$' + val
            }
          }
        }
      }
    });
  }
}
