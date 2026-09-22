<div align="center">

  <img src="./assets/favicon.svg" alt="SpendPulse Logo" width="80" height="80" />

  # SpendPulse

  <p><strong>Minimalist Financial Intelligence &middot; Personal Expense Tracker &middot; Progressive Web App</strong></p>

  <p>A client-side, offline-first luxury FinTech dashboard engineered for clarity, speed, and privacy.</p>

  <p>
    <a href="https://ankan-76.github.io/expense-tracker/"><strong>Explore Live Demo &raquo;</strong></a>
  </p>

  <p>
    <a href="https://ankan-76.github.io/expense-tracker/"><img src="https://img.shields.io/badge/Live%20Demo-Available-10B981?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" /></a>
    <a href="https://github.com/Ankan-76/expense-tracker"><img src="https://img.shields.io/badge/GitHub-Repository-111827?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" /></a>
    <img src="https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-8B5CF6?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
    <img src="https://img.shields.io/badge/Architecture-Zero%20Build-06B6D4?style=for-the-badge" alt="Zero Build" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
  </p>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Progressive Web App (PWA) Capabilities](#-progressive-web-app-pwa-capabilities)
- [Mobile-First & Responsive Experience](#-mobile-first--responsive-experience)
- [Technology Stack](#-technology-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Privacy & Security](#-privacy--security)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 🌟 Overview

**SpendPulse** is an ultra-fast, zero-build personal finance dashboard built natively with semantic HTML5, modern Tailwind CSS, Chart.js, and modular ES6+ JavaScript. Designed with high-end glassmorphism aesthetics and an intuitive dark mode, SpendPulse helps you track income, log expenses, monitor savings velocity, and gain visual financial clarity—with zero telemetry and 100% local data ownership.

---

## ⚡ Key Features

### 💼 Financial Intelligence & Analytics
- **Live KPI Summary**: Real-time computation of Net Balance, Total Income, Total Expenses, and dynamic Savings Rate with month-over-month trend indicators.
- **Interactive Visualizations**:
  - **Category Breakdown**: High-contrast doughnut chart displaying relative expense distribution.
  - **6-Month Comparative Trend**: Dual-axis bar chart tracking historical cashflow dynamics.
- **Categorization Engine**: Curated preset categories across Income and Expense with support for dynamic custom categories.

### 🔍 Advanced Ledger Management
- **Instant Search**: Fuzzy search across titles, merchants, categories, and personal notes.
- **Multi-Dimensional Filters**: Filter by period (*This Month*, *Last Month*, *All Time*), transaction type (*Income* / *Expense*), and specific category.
- **Configurable Sorting**: Sort by date (descending/ascending) or amount (highest/lowest).
- **In-Place Editing**: Seamlessly edit existing entries with live validation.

### 🛡️ Data Portability & Safety
- **Soft Delete Retention (Trash)**: Accidentally deleted records are stored in the Trash recycle bin for 3 days before permanent automated purge, with instant 1-click restore.
- **Encrypted-Style Backups**: Export your entire financial state to JSON and restore it at any time.
- **Spreadsheet Ready (CSV Export)**: Generate standard CSV files ready for import into Microsoft Excel, Google Sheets, or Apple Numbers.
- **Multi-Currency Support**: Switch between Dollar (`$`) and Rupee (`₹`) instantly across the entire UI and analytics charts.

---

## 📱 Progressive Web App (PWA) Capabilities

SpendPulse is engineered as an **Installable, Offline-First Progressive Web App**:

- **📲 Installable Everywhere**: Install directly to Windows, macOS, ChromeOS, Android, and iOS home screens as a standalone desktop/mobile app without an app store.
- **📶 100% Offline Functional**: Powered by a custom [sw.js](file:///d:/Web%20%20Development/expense-tracker/sw.js) Service Worker that precaches core app shell assets and applies a *Stale-While-Revalidate* caching strategy for external CDNs (Tailwind CSS, Lucide icons, Chart.js, Canvas Confetti, Google Fonts).
- **🚀 App Shortcuts**: Launch directly into targeted actions from your device's home screen or dock icon:
  - *Add Transaction* (`?action=add`)
  - *Visual Analytics* (`?action=analytics`)
  - *Settings & Backup* (`?action=settings`)
- **💡 In-App Installation Prompts**: Intercepts `beforeinstallprompt` to present seamless "Install App" triggers in the header and Settings sidebar.
- **🍏 Native iOS Guide**: Features a dedicated 3-step modal guide walking iOS Safari users through adding SpendPulse to their Home Screen.
- **🔄 Auto-Update Notification**: Non-intrusive notification banner alerts users when an updated application version is ready to activate.

---

## 🎨 Mobile-First & Responsive Experience

- **Two-Row Responsive Mobile Header**:
  - **Row 1**: Brand identity paired with compact utility controls (Offline status badge, Install trigger, Data Portability, and Settings).
  - **Row 2**: Full-width live search input positioned directly adjacent to the high-priority **"Record Entry"** button for optimal thumb reachability.
- **Safe-Area Inset Support**: Uses `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for edge-to-edge display on notched iPhones and Android gesture-bar devices.
- **Luxury Glassmorphism**: Custom frosted panels, subtle neon glow highlights, smooth keyframe animations, and custom scrollbars for both Light and Dark themes.

---

## 🛠 Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Core Structure** | Semantic HTML5 | Accessible dialogs, landmark elements, Open Graph & SEO meta tags |
| **Styling & Design** | Tailwind CSS & Vanilla CSS | Tailwind CDN with dark mode extended theme, custom FinTech glassmorphism |
| **Logic & State** | Modular ES6+ JavaScript | Zero-framework object-oriented architecture (`StorageManager`, `UIManager`, `ChartEngine`, `PWAManager`) |
| **Visual Charts** | [Chart.js](https://www.chartjs.org/) | Responsive canvas charts with custom tooltips, gradients, and legend renderers |
| **Iconography** | [Lucide Icons](https://lucide.dev/) | Clean, minimalist SVG icons loaded on demand |
| **Micro-Interactions** | [Canvas Confetti](https://www.kirilv.com/canvas-confetti/) | Rewarding celebratory feedback on goal milestones and app installs |
| **Typography** | Plus Jakarta Sans | Modern geometric typography from Google Fonts |
| **PWA Infrastructure** | Service Worker & Manifest | Pre-caching, CDN runtime caching, adaptive maskable icons |

---

## 📁 Directory Structure

```text
expense-tracker/
├── assets/
│   ├── favicon.svg             # Scalable brand vector icon
│   └── icons/
│       ├── icon-192.png        # Standard 192x192 PWA icon
│       ├── icon-512.png        # Standard 512x512 PWA icon
│       ├── icon-maskable-192.png # Adaptive maskable 192x192 icon
│       ├── icon-maskable-512.png # Adaptive maskable 512x512 icon
│       ├── apple-touch-icon.png  # 180x180 iOS home screen icon
│       └── icon.svg            # Scalable vector master
├── css/
│   └── custom.css              # Glassmorphic panels, scrollbars, safe areas, animations
├── js/
│   ├── app.js                  # Main controller, state flow, filter logic, keyboard routing
│   ├── charts.js               # Chart.js initialization and dynamic updates
│   ├── pwa.js                  # Service worker lifecycle, install prompts, offline monitor
│   ├── storage.js              # LocalStorage repository, trash auto-clean, export/import
│   └── ui.js                   # DOM rendering, modals, formatters, toasts, animations
├── index.html                  # Single-page dashboard shell
├── manifest.webmanifest        # W3C Web App Manifest specification
├── manifest.json               # Manifest fallback alias
├── sw.js                       # Offline-first caching Service Worker
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started & Local Setup

SpendPulse requires **no build step, no npm install, and no compilers**. Simply clone and serve:

### 1. Clone Repository
```bash
git clone https://github.com/Ankan-76/expense-tracker.git
cd expense-tracker
```

### 2. Run Local Server
Serve the project over HTTP so the Service Worker and manifest can register:

**Using Python 3:**
```bash
python -m http.server 8080
```

**Using Node.js:**
```bash
npx serve .
```

**Using VS Code:**
- Install the **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.

### 3. Open in Browser
Open `http://localhost:8080` in Chrome, Edge, Safari, or Brave.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| <kbd>/</kbd> | Focus global live search bar | Global (when not typing in an input) |
| <kbd>Esc</kbd> | Close active dialog (Add Transaction, Settings, Portability, Trash) | Global |

---

## 🔒 Privacy & Security

- **100% Client-Side**: All transactions, categories, and settings are stored strictly in your browser's `localStorage`.
- **Zero Telemetry**: SpendPulse contains no analytics tracking, third-party cookies, or cloud database storage.
- **Offline Sovereignty**: Once opened, SpendPulse can run indefinitely without network access.

---

## 👤 Author & Acknowledgments

Engineered and designed by **[Ankan Biswas](https://ankan-76.github.io/portfolio/)**.

- **Portfolio**: [ankan-76.github.io/portfolio](https://ankan-76.github.io/portfolio/)
- **GitHub**: [@Ankan-76](https://github.com/Ankan-76)

---

<div align="center">
  <sub>Released under the MIT License &middot; Built with modern web standards</sub>
</div>
