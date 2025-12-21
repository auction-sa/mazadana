/**
 * Main Application Entry Point
 * 
 * This file serves as the main loader for all JavaScript modules.
 * It dynamically loads all other scripts in the correct order.
 * 
 * All other JavaScript files are located in the 'script' folder.
 */

(function () {
    'use strict';





    /**
     * Load a JavaScript file dynamically
     * @param {string} src - The path to the JavaScript file
     * @returns {Promise} Promise that resolves when script is loaded
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            // Scripts are loaded sequentially, so defer is not needed

            script.onload = () => {
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Load all application modules in the correct order
     * Scripts are loaded sequentially to ensure dependencies are met
     */
    async function loadAllModules() {
        // Define all scripts in the correct loading order
        const scripts = [
            'script/navigation-history.js',      // Browser history management
            'script/section-navigation.js',      // Section switching
            'script/scrollable-container-height.js', // Dynamic scrollable container heights
            'script/property-data.js',         // Property detail page
            'script/banner-slider.js',           // Banner slider
            'script/install-pwa.js',             // PWA installation
            'script/auction-detail.js',          // Auction property detail page
            'script/profile-navigation.js',     // Profile navigation
            'script/user-acc-data.js',           // Account info tabs
            'script/user-actions-section.js',      // My actions section
            'script/user-fav.js',
            'script/website-scroll-control.js',
            'script/policy-terms.js',             // Policy terms page (includes terms and privacy content)
            'script/help-center.js',               // Help center page
            'script/user-settings.js'            // User settings
        ];

        // Load scripts sequentially (one after another)
        for (const script of scripts) {
            try {
                await loadScript(script);
            } catch (error) {
                console.error(`Error loading ${script}:`, error);
            }
        }
    }















    // Start loading modules when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllModules);
    } else {
        // DOM is already ready, load modules immediately
        loadAllModules();
    }





    // Register service worker
    let serviceWorkerRegistered = false;
    if ('serviceWorker' in navigator) {
        // Get the current path to determine the scope
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        const swPath = basePath + 'sw.js';
        const swScope = basePath;

        navigator.serviceWorker.register(swPath, { scope: swScope })
            .then((registration) => {
                serviceWorkerRegistered = true;
                // Notify installer that service worker is ready
                if (window.setServiceWorkerRegistered) {
                    window.setServiceWorkerRegistered(true);
                }
                if (window.PWAInstaller) {
                    window.dispatchEvent(new CustomEvent('sw-registered'));
                }
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
                // Fallback: try registering without explicit scope
                navigator.serviceWorker.register('sw.js')
                    .then((registration) => {
                        serviceWorkerRegistered = true;
                        if (window.setServiceWorkerRegistered) {
                            window.setServiceWorkerRegistered(true);
                        }
                        if (window.PWAInstaller) {
                            window.dispatchEvent(new CustomEvent('sw-registered'));
                        }
                    })
                    .catch((fallbackError) => {
                        console.error('Service Worker fallback registration also failed:', fallbackError);
                    });
            });
    }

})();


/* Create flip clock digit HTML structure */
function createFlipDigit(digit, unit) {
    return `
        <div class="flip-digit-box" data-unit="${unit}">
            <div class="flip-digit-inner">
                <span class="flip-digit-text">${digit}</span>
            </div>
        </div>
    `;
}