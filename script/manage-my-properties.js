// Manage My Properties Page Management
// This file contains all JavaScript code related to the "إدارة ممتلكاتي" (Manage My Properties) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let propertiesRendered = false;

    // Build manage properties view markup
    function renderManagePropertiesView() {
        const propertiesView = document.getElementById('manage-my-own-property-view');
        if (!propertiesView || propertiesRendered) return;

        propertiesView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="manage-properties-header">
                    <button class="back-btn" id="manage-properties-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">إدارة ممتلكاتي</h2>
                </div>

                <div class="settings-content scrollable-container">
                    <div class="my-actions-empty-state scrollable-container">
                        <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                    </div>
                </div>
            </div>
        `;

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;
        propertiesRendered = true;

        // Back button handler
        const propertiesBackBtn = document.getElementById('manage-properties-back-btn');
        if (propertiesBackBtn) {
            propertiesBackBtn.onclick = function () {
                // Navigate back to profile menu
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                } else {
                    // Fallback: navigate to profile section
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                    }
                }
            };
        }
    }

    // Initialize when DOM is ready
    function init() {
        const propertiesView = document.getElementById('manage-my-own-property-view');
        if (!propertiesView) {
            return;
        }

        // Build view markup once
        renderManagePropertiesView();

        // Use MutationObserver to re-initialize when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = propertiesView.classList.contains('active');
                    if (isActive) {
                        // Re-render when view becomes active
                        setTimeout(() => {
                            renderManagePropertiesView();
                            // Initialize Lucide icons
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }
                        }, 100);
                    }
                }
            });
        });

        observer.observe(propertiesView, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.ManagePropertiesPage = {
        init: init
    };
})();

