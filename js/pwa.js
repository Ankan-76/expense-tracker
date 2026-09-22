/**
 * SpendPulse PWA Controller
 * Handles Service Worker lifecycle, installation prompts, offline/online monitoring, and shortcut deep-linking.
 */
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.swRegistration = null;
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkMonitoring();
    this.handleShortcuts();
    this.updateUIState();
  }

  /**
   * Register Service Worker with automatic update detection
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported in this browser.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      this.swRegistration = registration;
      console.log('[PWA] Service Worker registered with scope:', registration.scope);

      // Check for waiting worker (update ready)
      if (registration.waiting) {
        this.notifyUpdateReady(registration.waiting);
      }

      // Check for incoming updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdateReady(newWorker);
            }
          });
        }
      });

      // Reload page when new worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    } catch (err) {
      console.warn('[PWA] Service Worker registration failed:', err);
    }
  }

  /**
   * Display non-intrusive banner when a new version of the app is ready
   */
  notifyUpdateReady(worker) {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwaUpdateBanner';
    updateBanner.className = 'fixed bottom-4 left-4 z-50 glass-panel border border-violet-500/30 p-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up text-xs font-medium text-slate-800 dark:text-slate-100 max-w-sm';
    updateBanner.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
      </div>
      <div class="flex-1">
        <div class="font-bold">Update Available</div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400">A new version of SpendPulse is ready.</div>
      </div>
      <button id="pwaReloadBtn" class="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition shadow-md">
        Refresh
      </button>
    `;

    document.body.appendChild(updateBanner);

    const reloadBtn = document.getElementById('pwaReloadBtn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        worker.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  }

  /**
   * Listen for install prompt events & wire action buttons
   */
  setupInstallPrompt() {
    const installBtnHeader = document.getElementById('installAppBtn');
    const installBtnSidebar = document.getElementById('sidebarInstallBtn');
    const iosModal = document.getElementById('iosInstallModal');
    const closeIosModalBtn = document.getElementById('closeIosModalBtn');

    // Handle beforeinstallprompt event (Chromium, Edge, Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButtons();
    });

    // Handle iOS Safari specific trigger
    if (this.isIOS && !this.isStandalone) {
      this.showInstallButtons();
    }

    const triggerInstall = async () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`[PWA] User response to install prompt: ${outcome}`);
        if (outcome === 'accepted') {
          this.hideInstallButtons();
        }
        this.deferredPrompt = null;
      } else if (this.isIOS && !this.isStandalone) {
        if (iosModal) {
          iosModal.showModal();
        }
      } else {
        // Helpful fallback instruction
        alert('To install SpendPulse, open your browser options menu and tap "Add to Home Screen" or "Install SpendPulse".');
      }
    };

    if (installBtnHeader) {
      installBtnHeader.addEventListener('click', triggerInstall);
    }
    if (installBtnSidebar) {
      installBtnSidebar.addEventListener('click', triggerInstall);
    }

    if (closeIosModalBtn && iosModal) {
      closeIosModalBtn.addEventListener('click', () => iosModal.close());
    }

    // App installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] SpendPulse installed successfully');
      this.hideInstallButtons();
      if (window.confetti) {
        window.confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      }
      if (window.ui && typeof window.ui.showToast === 'function') {
        window.ui.showToast('SpendPulse installed successfully!', 'success');
      }
    });
  }

  showInstallButtons() {
    if (this.isStandalone) return;
    const installBtnHeader = document.getElementById('installAppBtn');
    const installBtnSidebar = document.getElementById('sidebarInstallBtn');
    if (installBtnHeader) installBtnHeader.classList.remove('hidden');
    if (installBtnSidebar) installBtnSidebar.classList.remove('hidden');
  }

  hideInstallButtons() {
    const installBtnHeader = document.getElementById('installAppBtn');
    const installBtnSidebar = document.getElementById('sidebarInstallBtn');
    if (installBtnHeader) installBtnHeader.classList.add('hidden');
    if (installBtnSidebar) {
      // In sidebar, show "Installed" status badge
      installBtnSidebar.classList.remove('hidden');
      installBtnSidebar.disabled = true;
      installBtnSidebar.innerHTML = `
        <div class="flex items-center gap-2.5 text-emerald-500">
          <i data-lucide="check-circle-2" class="w-4 h-4"></i>
          <span class="text-xs font-semibold">Installed on Device</span>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  updateUIState() {
    if (this.isStandalone) {
      this.hideInstallButtons();
    }
  }

  /**
   * Monitor online/offline state and update user
   */
  setupNetworkMonitoring() {
    const offlineIndicator = document.getElementById('offlineIndicator');

    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;

      if (offlineIndicator) {
        if (!isOnline) {
          offlineIndicator.classList.remove('hidden');
          offlineIndicator.classList.add('flex');
        } else {
          offlineIndicator.classList.add('hidden');
          offlineIndicator.classList.remove('flex');
        }
      }

      if (!isOnline) {
        if (window.ui && typeof window.ui.showToast === 'function') {
          window.ui.showToast('Working offline. All changes are saved locally.', 'warning');
        }
      } else {
        if (window.ui && typeof window.ui.showToast === 'function') {
          window.ui.showToast('Back online!', 'info');
        }
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check
    if (!navigator.onLine && offlineIndicator) {
      offlineIndicator.classList.remove('hidden');
      offlineIndicator.classList.add('flex');
    }
  }

  /**
   * Deep-linking and URL action shortcuts (?action=add, ?action=settings, ?action=analytics)
   */
  handleShortcuts() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (!action) return;

    // Clean URL query parameter so subsequent page refreshes do not re-trigger action
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    // Wait until DOM and other components are initialized
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (action === 'add') {
          const openAddBtn = document.getElementById('openAddModalBtn');
          if (openAddBtn) openAddBtn.click();
        } else if (action === 'settings') {
          const openSettingsBtn = document.getElementById('openSettingsBtn');
          if (openSettingsBtn) openSettingsBtn.click();
        } else if (action === 'analytics') {
          const analyticsCard = document.querySelector('canvas#categoryChart')?.closest('.glass-card');
          if (analyticsCard) {
            analyticsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            analyticsCard.classList.add('ring-2', 'ring-violet-500', 'transition-all');
            setTimeout(() => analyticsCard.classList.remove('ring-2', 'ring-violet-500'), 2500);
          }
        }
      }, 350);
    });
  }
}

// Global PWA Manager Instance
window.pwaManager = new PWAManager();
