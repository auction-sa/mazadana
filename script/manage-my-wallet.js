// Manage My Wallet Page Management
// This file contains all JavaScript code related to the "إدارة محفظتي" (Manage My Wallet) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let walletViewRendered = false;

    // Fetch current user total balance from user-data.json
    async function fetchUserBalance() {
        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            const walletMovements = userData.userWalletMovementsDataObject;

            if (!walletMovements || typeof walletMovements.currentUserTotalBalance === 'undefined') {
                console.warn('currentUserTotalBalance not found in user data');
                return 0;
            }

            return walletMovements.currentUserTotalBalance || 0;
        } catch (error) {
            console.error('Error fetching user balance:', error);
            return 0;
        }
    }

    // Fetch bank accounts data from user-data.json
    async function fetchBankAccounts() {
        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            return userData.userBankAccountsDataObject || [];
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            return [];
        }
    }

    // Build manage wallet view markup
    async function renderManageWalletView() {
        const walletView = document.getElementById('manage-my-wallet-view');
        if (!walletView || walletViewRendered) return;

        // Fetch user balance and bank accounts BEFORE rendering
        const [userBalance, bankAccounts] = await Promise.all([
            fetchUserBalance(),
            fetchBankAccounts()
        ]);

        const formattedBalance = userBalance.toLocaleString('en-US');

        // Determine if elements should be hidden (when bank accounts exist)
        const shouldHideElements = bankAccounts.length > 0;
        const hideClass = shouldHideElements ? 'hide-element' : '';
        // Use inline style for instant hiding (no CSS parsing delay)
        const hideStyle = shouldHideElements ? 'style="display: none;"' : '';

        walletView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="manage-wallet-header">
                    <button class="back-btn" id="manage-wallet-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">إدارة محفظتي</h2>
                </div>

                <div class="settings-content scrollable-container">
                    <div class="wallet-management-content">
                        <!-- المحافظ Section -->
                        <div class="wallet-section">
                            <h3 class="wallet-section-title">المحافظ</h3>
                            
                            <!-- Wallet Card -->
                            <div class="wallet-card">
                                <div class="wallet-card-content">
                                    <div class="wallet-card-icon">
                                        <i data-lucide="wallet" class="wallet-icon"></i>
                                    </div>
                                    <div class="wallet-card-info">
                                        <div class="wallet-card-label">نقدي</div>
                                    </div>
                                </div>
                                <div class="wallet-card-balance-container">
                                    <span class="wallet-card-balance-amount">${formattedBalance}</span>
                                    <i data-lucide="saudi-riyal" class="rial-icon"></i>
                                </div>
                                <div class="wallet-card-actions">
                                    <button class="wallet-add-money-btn" id="wallet-add-money-btn">
                                        <i data-lucide="plus" class="add-money-icon"></i>
                                        إضافة أموال
                                    </button>
                                    <button class="wallet-withdraw-btn" disabled>
                                        طلب سحب
                                    </button>
                                </div>
                            </div>

                            <!-- Warning Banner -->
                            <div class="wallet-warning-banner ${hideClass}" id="wallet-page-warning-text" ${hideStyle}>
                                <i data-lucide="alert-triangle" class="warning-icon"></i>
                                <span class="warning-text">الرجاء إضافة حساب بنكي أولاً قبل إيداع الأموال في المحفظة.</span>
                            </div>
                        </div>

                        <!-- الحساب البنكي Section -->
                        <div class="bank-account-section ${hideClass}" id="wallet-page-add-bank-account-button" ${hideStyle}>
                            <button class="wallet-add-bank-btn" id="wallet-add-bank-btn">
                                <i data-lucide="credit-card" class="add-bank-icon"></i>
                                إدارة حساباتي البنكية
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;
        walletViewRendered = true;

        // Back button handler
        const walletBackBtn = document.getElementById('manage-wallet-back-btn');
        if (walletBackBtn) {
            walletBackBtn.onclick = function () {
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

        // Add money button handler
        const addMoneyBtn = document.getElementById('wallet-add-money-btn');
        if (addMoneyBtn) {
            addMoneyBtn.addEventListener('click', showAddMoneyBottomSheet);
        }

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Show add money bottom sheet
    function showAddMoneyBottomSheet() {
        // Remove existing sheet if any
        const existingSheet = document.querySelector('.add-money-bottom-sheet');
        if (existingSheet) {
            existingSheet.remove();
        }

        // Lock background scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const bottomSheet = document.createElement('div');
        bottomSheet.className = 'add-money-bottom-sheet';
        bottomSheet.innerHTML = `
            <div class="add-money-overlay"></div>
            <div class="add-money-content">
                <div class="add-money-handle"></div>
                <h3 class="add-money-title">طريقة إيداع الأموال</h3>
                <p class="add-money-subtitle">اختر إحدى الطرق التالية للإيداع</p>
                <div class="add-money-options">
                    <div class="add-money-option" data-method="sadad">
                        <div class="add-money-option-text">سداد</div>
                        <i data-lucide="arrow-right" class="add-money-option-arrow"></i>
                    </div>
                    <div class="add-money-option" data-method="bank-transfer">
                        <div class="add-money-option-text">حوالات بنكية</div>
                        <i data-lucide="arrow-right" class="add-money-option-arrow"></i>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(bottomSheet);

        // Initialize Lucide icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            bottomSheet.classList.add('active');
        }, 10);

        // Close handlers
        const overlay = bottomSheet.querySelector('.add-money-overlay');
        const handle = bottomSheet.querySelector('.add-money-handle');
        const options = bottomSheet.querySelectorAll('.add-money-option');

        const closeSheet = () => {
            bottomSheet.classList.remove('active');
            document.body.style.overflow = originalOverflow;
            setTimeout(() => {
                if (bottomSheet.parentNode) {
                    bottomSheet.parentNode.removeChild(bottomSheet);
                }
            }, 300);
        };

        if (overlay) overlay.addEventListener('click', closeSheet);

        // Handle drag to close
        if (handle) {
            let startY = 0;
            let currentY = 0;
            let isDragging = false;

            handle.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                isDragging = true;
            });

            handle.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                if (deltaY > 0) {
                    const sheetContent = bottomSheet.querySelector('.add-money-content');
                    if (sheetContent) {
                        sheetContent.style.transform = `translateY(${deltaY}px)`;
                    }
                }
            });

            handle.addEventListener('touchend', () => {
                if (isDragging && currentY - startY > 50) {
                    closeSheet();
                } else {
                    const sheetContent = bottomSheet.querySelector('.add-money-content');
                    if (sheetContent) {
                        sheetContent.style.transform = '';
                    }
                }
                isDragging = false;
            });
        }

        // Handle option selection
        options.forEach(option => {
            option.addEventListener('click', function () {
                const method = this.getAttribute('data-method');
                // TODO: Handle method selection
                console.log('Selected method:', method);
                closeSheet();
            });
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && bottomSheet.classList.contains('active')) {
                closeSheet();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Initialize when DOM is ready
    function init() {
        const walletView = document.getElementById('manage-my-wallet-view');
        if (!walletView) {
            return;
        }

        // Build view markup once
        renderManageWalletView();

        // Use MutationObserver to re-initialize when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = walletView.classList.contains('active');
                    if (isActive) {
                        // Re-render when view becomes active
                        walletViewRendered = false; // Reset flag to allow re-rendering
                        setTimeout(async () => {
                            await renderManageWalletView();
                            // Initialize Lucide icons
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }
                        }, 100);
                    }
                }
            });
        });

        observer.observe(walletView, {
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
    window.ManageWalletPage = {
        init: init
    };
})();

