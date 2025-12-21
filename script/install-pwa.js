/**
 * PWA Installation Module
 * 
 * This file handles:
 * - Progressive Web App installation functionality
 * - Installation prompt management
 * - Installation status checking
 * - Menu item action handler for "تنزيل البرنامج" (Download App)
 */

(function () {
    'use strict';

    /**
     * Show iOS installation guide overlay
     * Creates a visual guide pointing to Safari's share button
     */
    function showIOSInstallGuide() {
        // Remove existing guide if any
        const existingGuide = document.querySelector('.ios-install-guide');
        if (existingGuide) {
            existingGuide.remove();
        }

        // Create overlay
        const guideOverlay = document.createElement('div');
        guideOverlay.className = 'ios-install-guide';
        guideOverlay.innerHTML = `
            <div class="ios-install-guide-content">
                <div class="ios-install-guide-header">
                    <h3>تثبيت التطبيق على iOS</h3>
                    <button class="ios-install-guide-close" aria-label="إغلاق">
                        <i data-lucide="x" style="width: 20px; height: 20px;"></i>
                    </button>
                </div>
                <div class="ios-install-guide-steps">
                    <div class="ios-install-step">
                        <span class="step-number">1</span>
                        <p>اضغط على زر المشاركة <span class="share-icon">⎋</span> في أسفل المتصفح</p>
                    </div>
                    <div class="ios-install-step">
                        <span class="step-number">2</span>
                        <p>اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</p>
                    </div>
                    <div class="ios-install-step">
                        <span class="step-number">3</span>
                        <p>اضغط "إضافة" (Add)</p>
                    </div>
                </div>
                <div class="ios-install-guide-arrow">
                    <svg width="40" height="60" viewBox="0 0 40 60" fill="none">
                        <path d="M20 0 L20 50 M10 40 L20 50 L30 40" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        `;

        document.body.appendChild(guideOverlay);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 50);
        }

        // Show with animation
        setTimeout(() => {
            guideOverlay.classList.add('show');
        }, 10);

        // Close handlers
        const closeGuide = () => {
            guideOverlay.classList.remove('show');
            setTimeout(() => {
                guideOverlay.remove();
            }, 300);
        };

        guideOverlay.querySelector('.ios-install-guide-close').addEventListener('click', closeGuide);
        guideOverlay.addEventListener('click', (e) => {
            if (e.target === guideOverlay) {
                closeGuide();
            }
        });
    }

    /**
     * Show floating message/toast notification
     * @param {string} message - The message to display
     * @param {number} duration - Duration in milliseconds (default: 5000)
     */
    function showFloatingMessage(message, duration = 5000) {
        // Remove existing floating message if any
        const existingMessage = document.querySelector('.floating-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create floating message element
        const floatingMessage = document.createElement('div');
        floatingMessage.className = 'floating-message';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'floating-message-content';

        const textDiv = document.createElement('div');
        textDiv.className = 'floating-message-text';
        textDiv.textContent = message; // Use textContent for security (preserves newlines)

        const closeBtn = document.createElement('button');
        closeBtn.className = 'floating-message-close';
        closeBtn.setAttribute('aria-label', 'إغلاق');
        closeBtn.innerHTML = '<i data-lucide="x" style="width: 18px; height: 18px;"></i>';

        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(closeBtn);
        floatingMessage.appendChild(contentDiv);

        // Append to body
        document.body.appendChild(floatingMessage);

        // Initialize Lucide icons if available
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 50);
        }

        // Show message with animation
        setTimeout(() => {
            floatingMessage.classList.add('show');
        }, 10);

        // Close button handler
        const closeMessage = () => {
            floatingMessage.classList.remove('show');
            setTimeout(() => {
                floatingMessage.remove();
            }, 300);
        };

        closeBtn.addEventListener('click', closeMessage);

        // Auto-dismiss after duration
        let timeoutId;
        if (duration > 0) {
            timeoutId = setTimeout(closeMessage, duration);
        }

        // Pause auto-dismiss on hover
        floatingMessage.addEventListener('mouseenter', () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        });

        floatingMessage.addEventListener('mouseleave', () => {
            if (duration > 0) {
                timeoutId = setTimeout(closeMessage, duration);
            }
        });
    }

    // Track service worker registration status (set by script.js)
    let serviceWorkerRegistered = false;

    /**
     * PWA Installer Module
     * Handles Progressive Web App installation
     */
    window.PWAInstaller = (function () {
        let deferredPrompt = null;
        let isInstalled = false;
        let installAttempted = false;
        const INSTALL_FLAG_KEY = 'pwa-installed-flag';

        // Check if app is already installed
        function checkIfInstalled() {
            // First check: running in standalone mode (installed PWA)
            if (window.matchMedia('(display-mode: standalone)').matches) {
                isInstalled = true;
                // Update localStorage flag
                try {
                    localStorage.setItem(INSTALL_FLAG_KEY, 'true');
                } catch (e) {
                    console.warn('Could not save install flag to localStorage:', e);
                }
                return true;
            }

            // Second check: running from home screen on iOS
            if (window.navigator.standalone === true) {
                isInstalled = true;
                try {
                    localStorage.setItem(INSTALL_FLAG_KEY, 'true');
                } catch (e) {
                    console.warn('Could not save install flag to localStorage:', e);
                }
                return true;
            }

            // Third check: localStorage flag (for when app is installed but opened in browser)
            try {
                const installFlag = localStorage.getItem(INSTALL_FLAG_KEY);
                if (installFlag === 'true') {
                    isInstalled = true;
                    return true;
                }
            } catch (e) {
                console.warn('Could not read install flag from localStorage:', e);
            }

            return false;
        }

        // Initialize installer
        function init() {
            // Check if already installed
            if (checkIfInstalled()) {
                return;
            }

            // Capture the beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                // Dispatch custom event to notify that install is available
                window.dispatchEvent(new CustomEvent('pwa-install-available'));
            });

            // Listen for app installed event
            window.addEventListener('appinstalled', () => {
                isInstalled = true;
                deferredPrompt = null;
                // Save installation flag to localStorage
                try {
                    localStorage.setItem(INSTALL_FLAG_KEY, 'true');
                } catch (e) {
                    console.warn('Could not save install flag to localStorage:', e);
                }
                window.dispatchEvent(new CustomEvent('pwa-installed'));
            });

            // Check installation status on initialization
            isInstalled = checkIfInstalled();


            // Check PWA installability criteria
            function checkInstallability() {
                const checks = {
                    secure: window.location.protocol === 'https:' ||
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1',
                    manifest: document.querySelector('link[rel="manifest"]') !== null,
                    serviceWorker: 'serviceWorker' in navigator
                };

                return checks;
            }

            // Run checks after a short delay
            setTimeout(() => {
                checkInstallability();
            }, 1000);
        }

        // Install the PWA
        async function install() {
            // Check if already installed
            if (isInstalled || checkIfInstalled()) {
                showFloatingMessage('التطبيق مثبت بالفعل على هذا الجهاز');
                return false;
            }

            // For iOS devices, show visual guide pointing to Safari's native share button
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
                // Show visual guide instead of using navigator.share()
                // navigator.share() doesn't reliably show "Add to Home Screen" on iOS
                showIOSInstallGuide();
                return false;
            }

            // If prompt not available, wait a moment and check again
            // (sometimes the event fires after user interaction)
            if (!deferredPrompt) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Check if install prompt is available
            if (!deferredPrompt) {

                // Check if we're on a secure context (HTTPS or localhost)
                const isSecure = window.location.protocol === 'https:' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

                if (!isSecure) {
                    showFloatingMessage('التثبيت يتطلب اتصال آمن (HTTPS).\nيرجى فتح الموقع عبر رابط آمن.');
                    return false;
                }

                // Check if service worker is registered
                let swRegistered = serviceWorkerRegistered;
                if (!swRegistered && 'serviceWorker' in navigator) {
                    try {
                        const registration = await navigator.serviceWorker.getRegistration();
                        swRegistered = !!registration;
                    } catch (error) {
                        console.error('Service worker check failed:', error);
                    }
                }

                // Detect browser type for better instructions
                const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
                const isEdge = /Edg/.test(navigator.userAgent);
                const isFirefox = /Firefox/.test(navigator.userAgent);
                const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

                let message = 'خيار التثبيت التلقائي غير متاح حالياً.\n\n';
                message += 'يمكنك تثبيت التطبيق يدوياً:\n\n';

                if (isChrome || isEdge) {
                    message += 'في Chrome/Edge:\n';
                    message += '1. ابحث عن أيقونة 📥 أو ⊕ في شريط العنوان (على اليمين)\n';
                    message += '2. أو اضغط على قائمة المتصفح (⋮) → "تثبيت التطبيق"\n';
                    message += '3. أو انتظر قليلاً - قد يظهر خيار التثبيت بعد تفاعل أكثر مع الموقع';
                } else if (isFirefox) {
                    message += 'في Firefox:\n';
                    message += '1. اضغط على قائمة المتصفح (☰)\n';
                    message += '2. ابحث عن "تثبيت" أو "Install"\n';
                    message += '3. أو ابحث عن أيقونة التثبيت في شريط العنوان';
                } else if (isSafari) {
                    message += 'في Safari:\n';
                    message += '1. اضغط على زر المشاركة (Share)\n';
                    message += '2. اختر "إضافة إلى الشاشة الرئيسية"';
                } else {
                    message += 'استخدم قائمة المتصفح للبحث عن خيار "تثبيت التطبيق" أو "Install App"';
                }

                if (!swRegistered) {
                    message += '\n\nملاحظة: جاري إعداد التطبيق للتثبيت... قد تحتاج للمحاولة مرة أخرى بعد بضع ثوانٍ.';
                }

                showFloatingMessage(message, 10000);
                return false;
            }

            try {
                installAttempted = true;

                // Show the install prompt
                deferredPrompt.prompt();

                // Wait for user's response
                const { outcome } = await deferredPrompt.userChoice;


                // Clear the deferred prompt
                deferredPrompt = null;
                installAttempted = false;

                if (outcome === 'accepted') {
                    // Set installation flag immediately
                    isInstalled = true;
                    try {
                        localStorage.setItem(INSTALL_FLAG_KEY, 'true');
                    } catch (e) {
                        console.warn('Could not save install flag to localStorage:', e);
                    }
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                console.error('Error during PWA installation:', error);
                installAttempted = false;

                // If prompt() fails, the prompt might have been used already
                if (error.message && error.message.includes('prompt')) {
                    showFloatingMessage('تم استخدام خيار التثبيت مسبقاً.\nيرجى استخدام قائمة المتصفح لتثبيت التطبيق.');
                } else {
                    showFloatingMessage('حدث خطأ أثناء التثبيت.\nيرجى المحاولة مرة أخرى أو استخدام قائمة المتصفح.');
                }
                return false;
            }
        }

        // Check if installation is available
        function isInstallable() {
            // Re-check installation status to ensure it's up to date
            const currentlyInstalled = checkIfInstalled();
            return deferredPrompt !== null && !currentlyInstalled;
        }

        // Public method to check if installed (always fresh check)
        function isInstalledCheck() {
            // Always do a fresh check, don't rely on cached value
            return checkIfInstalled();
        }

        // Initialize on load
        init();

        // Return public API
        return {
            install: install,
            isInstallable: isInstallable,
            isInstalled: isInstalledCheck, // Always do fresh check
            hasPrompt: () => deferredPrompt !== null
        };
    })();

    /**
     * Handle the "install-app" menu action
     * This function is called when the user clicks "تنزيل البرنامج" menu item
     */
    window.handleInstallAppAction = async function () {
        // Check for iOS first (iOS doesn't support beforeinstallprompt event)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            // Check if already installed
            if (window.PWAInstaller && window.PWAInstaller.isInstalled && window.PWAInstaller.isInstalled()) {
                showFloatingMessage('التطبيق مثبت بالفعل على هذا الجهاز');
                return;
            }

            // Show visual guide pointing to Safari's native share button
            // Note: navigator.share() doesn't reliably show "Add to Home Screen" on iOS
            // So we show a visual guide instead that points to Safari's native share button
            showIOSInstallGuide();
            return;
        }

        // Check if PWA installer is available
        if (window.PWAInstaller && typeof window.PWAInstaller.install === 'function') {
            // Always do a fresh check if already installed (don't rely on cached value)
            if (window.PWAInstaller.isInstalled && window.PWAInstaller.isInstalled()) {
                showFloatingMessage('التطبيق مثبت بالفعل على هذا الجهاز');
                return;
            }

            // Check if prompt is available, if not wait a bit
            if (!window.PWAInstaller.hasPrompt()) {
                // Wait a moment and check again (sometimes the event fires late)
                setTimeout(() => {
                    // Check again if installed (in case it was installed during the wait)
                    if (window.PWAInstaller.isInstalled && window.PWAInstaller.isInstalled()) {
                        showFloatingMessage('التطبيق مثبت بالفعل على هذا الجهاز');
                        return;
                    }

                    if (window.PWAInstaller.hasPrompt()) {
                        window.PWAInstaller.install().catch(error => {
                            console.error('PWA installation error:', error);
                        });
                    } else {
                        // Still not available, show helpful message
                        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
                        const isEdge = /Edg/.test(navigator.userAgent);
                        const isFirefox = /Firefox/.test(navigator.userAgent);

                        let message = 'لتثبيت التطبيق:\n\n';

                        if (isIOS) {
                            // For iOS, show visual guide instead of using navigator.share()
                            showIOSInstallGuide();
                            return; // Don't show the fallback message
                        } else if (isChrome || isEdge) {
                            message += '1. ابحث عن أيقونة التثبيت في شريط العنوان (على اليمين)\n';
                            message += '2. أو اضغط على قائمة المتصفح (⋮) واختر "تثبيت التطبيق"\n';
                            message += '3. أو انتظر قليلاً ثم حاول مرة أخرى';
                        } else if (isFirefox) {
                            message += '1. اضغط على قائمة المتصفح (☰)\n';
                            message += '2. اختر "تثبيت" أو "Install"\n';
                            message += '3. أو ابحث عن أيقونة التثبيت في شريط العنوان';
                        } else {
                            message += 'استخدم قائمة المتصفح للبحث عن خيار "تثبيت التطبيق" أو "Install App"';
                        }

                        showFloatingMessage(message, 8000);
                    }
                }, 500);
            } else {
                // Prompt is available, but check if installed first
                if (window.PWAInstaller.isInstalled && window.PWAInstaller.isInstalled()) {
                    showFloatingMessage('التطبيق مثبت بالفعل على هذا الجهاز');
                    return;
                }
                // Install immediately
                window.PWAInstaller.install().catch(error => {
                    console.error('PWA installation error:', error);
                });
            }
        } else {
            // Fallback for browsers that don't support PWA installation
            // (iOS is already handled above, so this is for other unsupported browsers)
            showFloatingMessage('لتثبيت التطبيق:\n\nاستخدم قائمة المتصفح للبحث عن خيار "تثبيت التطبيق" أو "Install App"', 7000);
        }
    };

    /**
     * Set service worker registration status
     * Called by script.js after service worker registration
     */
    window.setServiceWorkerRegistered = function (status) {
        serviceWorkerRegistered = status;
    };

})();
