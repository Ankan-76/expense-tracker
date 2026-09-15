# 💎 SpendPulse — Luxury FinTech Expense Tracker

SpendPulse is a zero-dependency, dual-themed personal finance and expense analytics web application built with semantic HTML5, modern Tailwind CSS, Chart.js, and vanilla ES6+ JavaScript.

---

## ⚡ Highlights

- **Zero-Build Architecture**: Runs natively in any modern browser without Node.js or build steps.
- **Dynamic Theming**: True Light Mode and Dark Mode environments that are fully reactive and instantly swappable.
- **Visual Analytics**: Interactive Category Distribution Doughnut chart and 6-Month Income vs. Expense Trend bar chart powered by Chart.js.
- **Settings & Localization**: Real-time currency switching (USD / INR) seamlessly applied to active rendering and charting.
- **Data Portability**: Full CSV exports for spreadsheet tools (Excel, Numbers, Google Sheets) and JSON backup/restore.
- **Safe State & Soft Delete**: Full-featured "Trash" retention mechanism that holds onto deleted transactions for 3 days before permanent clearance, guarding against accidental data loss.
- **Client-Side Storage**: Instant `localStorage` persistence that retains all your settings, transactions, and trash data securely within your browser sandbox.
- **SEO & Accessibility**: Semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`), Open Graph tags, and keyboard focus control safely integrated.

---

## 🚀 Local Development

To test the project locally, serve the directory with any standard HTTP server:

```bash
# Using Python 3
python -m http.server 8080

# Or using Node's npx serve
npx serve .
```
