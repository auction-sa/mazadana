// Help Center Page Management
// This file contains all JavaScript code related to the Help Center page
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let helpCenterRendered = false;

    /**
     * Build help center view markup
     */
    function renderHelpCenterView() {
        const helpCenterView = document.getElementById('help-center-view');
        if (!helpCenterView) return;

        // Always re-render to ensure correct content is shown
        helpCenterRendered = true;

        helpCenterView.innerHTML = `
            <div class="help-center-container">
                <div class="account-tabs-header" id="help-center-header">
                    <button class="back-btn" id="help-center-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">المساعدة</h2>
                </div>

                <div class="help-center-content-wrapper scrollable-container">
                    <div class="help-center-greeting">
                        <h2 class="greeting-title">أهلاً بك</h2>
                        <p class="greeting-subtitle">كيف يمكننا مساعدتك 👋</p>
                    </div>

                    <div class="help-center-actions">
                        <div class="help-action-card" id="help-email-card">
                            <div class="help-action-content">
                                <div class="help-action-text-wrapper">
                                    <i data-lucide="mail" class="help-action-icon-left"></i>
                                    <span class="help-action-text">تواصل معنا</span>
                                </div>
                                <i data-lucide="chevron-left" class="help-action-arrow"></i>
                            </div>
                        </div>

                        <div class="help-action-card" id="help-phone-card">
                            <div class="help-action-content">
                                <div class="help-action-text-wrapper">
                                    <i data-lucide="phone" class="help-action-icon-left"></i>
                                    <span class="help-action-text">اتصل بنا</span>
                                </div>
                                <i data-lucide="chevron-left" class="help-action-arrow"></i>
                            </div>
                        </div>

                        <div class="help-action-card" id="help-whatsapp-card">
                            <div class="help-action-content">
                                <div class="help-action-text-wrapper">
                                    <i data-lucide="message-circle" class="help-action-icon-left"></i>
                                    <span class="help-action-text">تواصل معنا واتساب</span>
                                </div>
                                <i data-lucide="chevron-left" class="help-action-arrow"></i>
                            </div>
                        </div>
                    </div>

                    <div class="help-center-footer">
                        <button class="delete-account-btn" id="delete-account-btn">حذف الحساب</button>
                    </div>
                </div>
            </div>
        `;

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;
        helpCenterRendered = true;

        // Attach event listeners
        attachEventListeners();
    }

    // Disable back button for a specified duration
    function disableBackButton(duration = 500) {
        const helpCenterBackBtn = document.getElementById('help-center-back-btn');
        if (!helpCenterBackBtn) return;

        // Disable the button
        helpCenterBackBtn.disabled = true;
        helpCenterBackBtn.style.pointerEvents = 'none';
        helpCenterBackBtn.setAttribute('aria-disabled', 'true');

        // Re-enable after duration
        setTimeout(() => {
            helpCenterBackBtn.disabled = false;
            helpCenterBackBtn.style.pointerEvents = 'auto';
            helpCenterBackBtn.removeAttribute('aria-disabled');
        }, duration);
    }

    // Attach event listeners
    function attachEventListeners() {
        if (eventListenersAttached) return;

        const helpCenterBackBtn = document.getElementById('help-center-back-btn');
        if (helpCenterBackBtn) {
            helpCenterBackBtn.onclick = function () {
                // Check if button is disabled
                if (this.disabled || this.getAttribute('aria-disabled') === 'true') {
                    return;
                }

                // Remove active class from help-center-view
                const helpCenterView = document.getElementById('help-center-view');
                if (helpCenterView) {
                    helpCenterView.classList.remove('active');
                }

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

        // Email card click handler
        const emailCard = document.getElementById('help-email-card');
        if (emailCard) {
            emailCard.addEventListener('click', function () {
                // Open email client with pre-filled recipient
                window.location.href = 'mailto:info@madazana.sa';
            });
        }

        // Phone card click handler
        const phoneCard = document.getElementById('help-phone-card');
        if (phoneCard) {
            phoneCard.addEventListener('click', function () {
                // Open phone dialer with the phone number
                window.location.href = 'tel:+6282210081028';
            });
        }

        // WhatsApp card click handler
        const whatsappCard = document.getElementById('help-whatsapp-card');
        if (whatsappCard) {
            whatsappCard.addEventListener('click', function () {
                // Open WhatsApp with the phone number and pre-filled message
                const whatsappNumber = '6282210081028'; // +62 822-1008-1028 formatted for WhatsApp
                const presetMessage = 'السلام عليكم، أحتاج إلى مساعدة بخصوص:';
                const encodedMessage = encodeURIComponent(presetMessage);
                window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
            });
        }

        // Delete account button click handler
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', function () {
                // TODO: Implement delete account functionality
                if (confirm('هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.')) {
                }
            });
        }

        eventListenersAttached = true;
    }

    // Initialize when view becomes active
    function initHelpCenterView() {
        const helpCenterView = document.getElementById('help-center-view');
        if (!helpCenterView) {
            return;
        }

        // Render default content if not already rendered
        if (!helpCenterRendered) {
            renderHelpCenterView();
        }

        // Use MutationObserver to detect when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = helpCenterView.classList.contains('active');
                    if (isActive) {
                        // Disable back button for 0.5 seconds when view becomes active
                        disableBackButton(500);

                        // Re-initialize Lucide icons when view becomes active
                        if (typeof lucide !== 'undefined') {
                            setTimeout(() => {
                                lucide.createIcons();
                            }, 100);
                        }
                    }
                }
            });
        });

        observer.observe(helpCenterView, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Expose render function for navigation init
    function renderHelpCenterViewPublic() {
        renderHelpCenterView();
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHelpCenterView);
    } else {
        initHelpCenterView();
    }

    // Export for external use
    window.HelpCenterPage = {
        init: initHelpCenterView,
        renderHelpCenterView: renderHelpCenterViewPublic
    };
})();

