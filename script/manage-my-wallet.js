// Manage My Wallet Page Management
// This file contains all JavaScript code related to the "إدارة محفظتي" (Manage My Wallet) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let walletViewRendered = false;
    let isUpdatingFromHash = false; // Flag to prevent URL update loops

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
        if (!walletView) return;

        // If already rendered, just update the list content
        if (walletViewRendered) {
            return;
        }

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

        // Determine if withdraw button should be enabled (when balance is not 0)
        const isWithdrawEnabled = userBalance !== 0;
        const withdrawDisabledAttr = isWithdrawEnabled ? '' : 'disabled';

        walletView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="manage-wallet-header">
                    <button class="back-btn" id="manage-wallet-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">إدارة محفظتي</h2>
                </div>

                <div class="settings-content scrollable-container">


                    <div class="wallet-management-content active" id="wallet-management-content">
                        <!-- المحافظ Section -->
                        <div class="wallet-section" id="wallet-section">
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
                                    <button class="wallet-withdraw-btn" id="wallet-withdraw-btn" ${withdrawDisabledAttr}>
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

                    

                    <div class="transfer-money-content" id="transfer-money-content">
                        <div class="transfer-money-content-wrapper">
                            <h3 class="transfer-money-title">الحوالة البنكية</h3>
                            <p class="transfer-money-current-balance" id="transfer-money-current-balance">الرصيد الحالي: ${formattedBalance} ر.س</p>
                            <p class="transfer-money-subtitle">للمشاركة يجب إرفاق الحوالة البنكية.</p>
                            
                            <div class="transfer-money-alert">
                                <i data-lucide="info" class="alert-icon"></i>
                                <span class="alert-text">سيتم شحن محفظتك خلال 72 ساعة من استلام معلومات الحوالة.</span>
                            </div>
                            
                            <div class="transfer-money-card">
                                <div class="transfer-money-info-row">
                                    <span class="transfer-money-label">اسم المستفيد:</span>
                                    <span class="transfer-money-value">MUBASHER CO</span>
                                </div>
                                <div class="transfer-money-info-row">
                                    <span class="transfer-money-label">البلد:</span>
                                    <span class="transfer-money-value">السعودية</span>
                                </div>
                                <div class="transfer-money-info-row">
                                    <span class="transfer-money-label">المدينة:</span>
                                    <span class="transfer-money-value">الرياض</span>
                                </div>
                                <div class="transfer-money-info-row">
                                    <span class="transfer-money-label">البنك:</span>
                                    <span class="transfer-money-value">الراجحي</span>
                                </div>
                                <div class="transfer-money-info-row">
                                    <span class="transfer-money-label">IBAN:</span>
                                    <div class="transfer-money-iban-container">
                                        <span class="transfer-money-value" id="transfer-iban-value">SA1480000204608015120029</span>
                                        <button class="transfer-money-copy-btn" id="transfer-iban-copy-btn" aria-label="نسخ">
                                            <i data-lucide="copy" class="copy-icon"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="transfer-money-form-group">
                                <label class="transfer-money-form-label">الرقم المرجعي</label>
                                <input type="text" class="transfer-money-form-input" id="transfer-reference-input" placeholder="الرقم المرجعي للحوالة البنكية">
                            </div>
                            
                            <div class="transfer-money-form-group">
                                <label class="transfer-money-form-label">صورة الحوالة بنكية</label>
                                <div class="transfer-money-upload-area" id="transfer-receipt-upload-area">
                                    <input type="file" class="transfer-money-file-input" id="transfer-receipt-file-input" accept=".pdf,.png,.jpg,.jpeg" style="display: none;">
                                    <div class="transfer-money-upload-content">
                                        <i data-lucide="upload" class="upload-icon"></i>
                                        <span class="upload-caption">صورة الحوالة بنكية</span>
                                    </div>
                                    <div class="transfer-money-file-preview" id="transfer-receipt-preview" style="display: none;">
                                        <span class="file-name" id="transfer-receipt-file-name"></span>
                                        <button type="button" class="remove-file-btn" id="transfer-receipt-remove-btn" aria-label="إزالة">
                                            <i data-lucide="x" class="remove-icon"></i>
                                        </button>
                                    </div>
                                </div>
                                <p class="transfer-money-helper-text">الملفات المسموح بها: PDF, PNG, JPG</p>
                            </div>
                            
                            <button class="transfer-money-submit-btn" id="transfer-money-submit-btn" disabled>
                                إرسال معلومات الحوالة
                            </button>
                        </div>
                    </div>



                    <div class="withdraw-money-content" id="withdraw-money-content">
                        <div class="withdraw-money-content-wrapper" id="withdraw-money-content-wrapper">
                            <!-- Content will be rendered dynamically -->
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
                // Check if we're in transfer or withdraw view
                const transferMoneyContent = document.getElementById('transfer-money-content');
                const withdrawMoneyContent = document.getElementById('withdraw-money-content');

                if (transferMoneyContent && transferMoneyContent.classList.contains('active')) {
                    // Navigate back to wallet management using URL hash
                    window.location.hash = '#/profile/manage-wallet';
                    return;
                }

                if (withdrawMoneyContent && withdrawMoneyContent.classList.contains('active')) {
                    // Navigate back to wallet management using URL hash
                    window.location.hash = '#/profile/manage-wallet';
                    return;
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

        // Add money button handler
        const addMoneyBtn = document.getElementById('wallet-add-money-btn');
        if (addMoneyBtn) {
            addMoneyBtn.addEventListener('click', showAddMoneyBottomSheet);
        }

        // Add bank account button handler - navigate to manage bank accounts page
        const addBankBtn = document.getElementById('wallet-add-bank-btn');
        if (addBankBtn) {
            addBankBtn.addEventListener('click', function () {
                // Navigate to manage bank accounts page, same as clicking "حسابات بنكية" menu item
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MANAGE_BANK_ACCOUNTS);
                } else {
                    // Fallback: navigate to profile section first, then to bank accounts
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                        setTimeout(() => {
                            if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                                window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MANAGE_BANK_ACCOUNTS);
                            }
                        }, 300);
                    }
                }
            });
        }

        // Withdraw button handler - show withdraw money content when enabled
        const withdrawBtn = document.getElementById('wallet-withdraw-btn');
        if (withdrawBtn && !withdrawBtn.disabled) {
            withdrawBtn.addEventListener('click', function () {
                showWithdrawMoneyContent();
            });
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
                    <div class="add-money-option"  data-method="bank-transfer">
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
                if (method === 'bank-transfer') {
                    closeSheet();
                    showTransferMoneyContent();
                } else {
                    console.log('Selected method:', method);
                    closeSheet();
                }
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

    // Render withdraw money content
    async function renderWithdrawMoneyContent() {
        const withdrawContentWrapper = document.getElementById('withdraw-money-content-wrapper');
        if (!withdrawContentWrapper) return;

        // Fetch bank accounts and balance
        const [bankAccounts, userBalance] = await Promise.all([
            fetchBankAccounts(),
            fetchUserBalance()
        ]);

        const formattedBalance = userBalance.toLocaleString('en-US');

        // Build bank account cards HTML
        const bankAccountsHTML = bankAccounts.length > 0
            ? bankAccounts.map((account, index) => `
                <div class="withdraw-bank-account-card" data-index="${index}">
                    <div class="bank-account-card-header">
                        <div class="bank-account-card-title">
                            <i data-lucide="building-2" class="bank-icon"></i>
                            <span class="bank-name">${account.bankName}</span>
                        </div>
                    </div>
                    <div class="bank-account-card-body">
                        <div class="bank-account-info-row">
                            <span class="bank-account-label">رقم الحساب:</span>
                            <span class="bank-account-value">${account.accountNo}</span>
                        </div>
                    </div>
                </div>
            `).join('')
            : '<div class="withdraw-empty-state"><p class="withdraw-empty-text">لا يوجد حساب بنكي لعرضه هنا</p></div>';

        withdrawContentWrapper.innerHTML = `
            <h3 class="transfer-money-title">اختر البنك المستلم</h3>
            
            <div class="transfer-money-alert">
                <i data-lucide="info" class="alert-icon"></i>
                <span class="alert-text">سيتم سحب نقودك إلى البنك الخاص بك خلال 72 ساعة من استلام الطلب.</span>
            </div>
            
            <div class="withdraw-bank-accounts-list" id="withdraw-bank-accounts-list">
                ${bankAccountsHTML}
            </div>
            
            <h3 class="transfer-money-title">تحديد المبلغ المراد سحبه</h3>
            
            <div class="withdraw-percentage-boxes">
                <button class="withdraw-percentage-box" data-percentage="25" id="withdraw-percentage-25">
                    25%
                </button>
                <button class="withdraw-percentage-box" data-percentage="50" id="withdraw-percentage-50">
                    50%
                </button>
                <button class="withdraw-percentage-box" data-percentage="75" id="withdraw-percentage-75">
                    75%
                </button>
                <button class="withdraw-percentage-box" data-percentage="100" id="withdraw-percentage-100">
                    100%
                </button>
            </div>
            
            <div class="transfer-money-form-group">
                <label class="transfer-money-form-label">المبلغ المراد سحبه</label>
                <input type="number" class="transfer-money-form-input" id="withdraw-amount-input" 
                    placeholder="أدخل المبلغ المراد سحبه" min="0" step="0.01">
            </div>
            
            <button class="transfer-money-submit-btn" id="withdraw-money-submit-btn" disabled>
                تأكيد طلب سحب
            </button>
        `;

        // Initialize percentage boxes
        initWithdrawPercentageBoxes(userBalance);

        // Initialize bank account selection
        initWithdrawBankAccountSelection();

        // Initialize form validation
        initWithdrawFormValidation();

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Initialize withdraw percentage boxes
    function initWithdrawPercentageBoxes(totalBalance) {
        const percentageBoxes = document.querySelectorAll('.withdraw-percentage-box');
        const amountInput = document.getElementById('withdraw-amount-input');

        percentageBoxes.forEach(box => {
            box.addEventListener('click', function () {
                const percentage = parseFloat(this.getAttribute('data-percentage'));
                let amount = (totalBalance * percentage) / 100;

                // Round up to nearest tens
                amount = Math.ceil(amount / 10) * 10;

                // Ensure it doesn't exceed total balance
                if (amount > totalBalance) {
                    amount = totalBalance;
                }

                // Update input value
                if (amountInput) {
                    amountInput.value = amount.toFixed(2);
                    // Trigger input event to validate form
                    amountInput.dispatchEvent(new Event('input', { bubbles: true }));
                }

                // Update active state
                percentageBoxes.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Initialize withdraw bank account selection
    function initWithdrawBankAccountSelection() {
        const bankAccountCards = document.querySelectorAll('.withdraw-bank-account-card');

        bankAccountCards.forEach(card => {
            card.addEventListener('click', function () {
                // Remove active state from all cards
                bankAccountCards.forEach(c => c.classList.remove('active'));
                // Add active state to clicked card
                this.classList.add('active');
                // Validate form (async)
                validateWithdrawForm();
            });
        });
    }

    // Initialize withdraw form validation
    function initWithdrawFormValidation() {
        const amountInput = document.getElementById('withdraw-amount-input');
        const submitBtn = document.getElementById('withdraw-money-submit-btn');
        const percentageBoxes = document.querySelectorAll('.withdraw-percentage-box');

        if (amountInput) {
            amountInput.addEventListener('input', function () {
                // Clear active state from percentage boxes when user manually types
                percentageBoxes.forEach(box => box.classList.remove('active'));
                validateWithdrawForm();
            });
        }

        // Initial validation (async)
        validateWithdrawForm();
    }

    // Validate withdraw form
    async function validateWithdrawForm() {
        const amountInput = document.getElementById('withdraw-amount-input');
        const submitBtn = document.getElementById('withdraw-money-submit-btn');
        const selectedBankAccount = document.querySelector('.withdraw-bank-account-card.active');

        if (submitBtn && amountInput) {
            const amount = parseFloat(amountInput.value);
            const userBalance = await fetchUserBalance();
            const hasValidAmount = amount > 0 && !isNaN(amount) && amount <= userBalance;
            const hasSelectedBank = selectedBankAccount !== null;

            submitBtn.disabled = !(hasValidAmount && hasSelectedBank);
        }
    }

    // Show withdraw money content
    async function showWithdrawMoneyContent() {
        const walletManagementContent = document.getElementById('wallet-management-content');
        const withdrawMoneyContent = document.getElementById('withdraw-money-content');
        const headerTitle = document.querySelector('#manage-wallet-header h2');

        if (!walletManagementContent || !withdrawMoneyContent) return;

        // Hide wallet management content
        walletManagementContent.classList.remove('active');

        // Render and show withdraw money content
        await renderWithdrawMoneyContent();

        requestAnimationFrame(() => {
            withdrawMoneyContent.classList.add('active');

            // Update header title
            if (headerTitle) {
                headerTitle.textContent = 'طلب سحب الأموال';
            }

            // Update URL hash (only if not updating from hash)
            if (!isUpdatingFromHash &&
                (window.location.hash === '#/profile/manage-wallet' ||
                    window.location.hash === '#/profile/manage-wallet/')) {
                window.location.hash = '#/profile/manage-wallet/withdraw-money';
            }

            // Update back button
            updateBackButtonForWithdrawMoney();
        });
    }

    // Update back button handler for withdraw money view
    function updateBackButtonForWithdrawMoney() {
        const backBtn = document.getElementById('manage-wallet-back-btn');
        if (backBtn) {
            backBtn.onclick = function () {
                // Navigate back using URL hash to trigger hashchange event
                window.location.hash = '#/profile/manage-wallet';
            };
        }
    }

    // Show transfer money content
    async function showTransferMoneyContent() {
        const walletManagementContent = document.getElementById('wallet-management-content');
        const transferMoneyContent = document.getElementById('transfer-money-content');
        const headerTitle = document.querySelector('#manage-wallet-header h2');

        if (!walletManagementContent || !transferMoneyContent) return;

        // Hide wallet management content
        walletManagementContent.classList.remove('active');

        // Show transfer money content
        requestAnimationFrame(() => {
            transferMoneyContent.classList.add('active');

            // Update header title
            if (headerTitle) {
                headerTitle.textContent = 'الحوالة البنكية';
            }

            // Update URL hash (only if not updating from hash)
            if (!isUpdatingFromHash &&
                (window.location.hash === '#/profile/manage-wallet' ||
                    window.location.hash === '#/profile/manage-wallet/')) {
                window.location.hash = '#/profile/manage-wallet/transfer-money';
            }

            // Update back button
            updateBackButtonForTransferMoney();

            // Update current balance
            updateTransferMoneyCurrentBalance();

            // Initialize copy button
            initTransferMoneyCopyButton();

            // Initialize file upload
            initTransferMoneyFileUpload();

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            }
        });
    }

    // Show wallet management content
    function showWalletManagementContent() {
        const walletManagementContent = document.getElementById('wallet-management-content');
        const transferMoneyContent = document.getElementById('transfer-money-content');
        const withdrawMoneyContent = document.getElementById('withdraw-money-content');
        const headerTitle = document.querySelector('#manage-wallet-header h2');

        if (!walletManagementContent) return;

        // Hide other content views
        if (transferMoneyContent) transferMoneyContent.classList.remove('active');
        if (withdrawMoneyContent) withdrawMoneyContent.classList.remove('active');

        // Show wallet management content
        requestAnimationFrame(() => {
            walletManagementContent.classList.add('active');

            // Update header title
            if (headerTitle) {
                headerTitle.textContent = 'إدارة محفظتي';
            }

            // Update URL hash (only if not updating from hash)
            if (!isUpdatingFromHash &&
                (window.location.hash === '#/profile/manage-wallet/transfer-money' ||
                    window.location.hash === '#/profile/manage-wallet/withdraw-money')) {
                window.location.hash = '#/profile/manage-wallet';
            }

            // Update back button to go back to profile menu
            const backBtn = document.getElementById('manage-wallet-back-btn');
            if (backBtn) {
                backBtn.onclick = function () {
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
        });
    }

    // Initialize transfer money copy button
    function initTransferMoneyCopyButton() {
        const copyBtn = document.getElementById('transfer-iban-copy-btn');
        const ibanValue = document.getElementById('transfer-iban-value');

        if (copyBtn && ibanValue) {
            copyBtn.addEventListener('click', async function () {
                const iban = ibanValue.textContent.trim();
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(iban);
                    } else {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = iban;
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                    }
                    // Show feedback (you can add a toast notification here)
                    console.log('IBAN copied to clipboard');
                } catch (err) {
                    console.error('Failed to copy IBAN:', err);
                }
            });
        }
    }

    // Update transfer money current balance
    async function updateTransferMoneyCurrentBalance() {
        const balanceElement = document.getElementById('transfer-money-current-balance');
        if (balanceElement) {
            const userBalance = await fetchUserBalance();
            const formattedBalance = userBalance.toLocaleString('en-US');
            balanceElement.textContent = `الرصيد الحالي: ${formattedBalance} ر.س`;
        }
    }

    // Initialize transfer money file upload
    function initTransferMoneyFileUpload() {
        const uploadArea = document.getElementById('transfer-receipt-upload-area');
        const fileInput = document.getElementById('transfer-receipt-file-input');
        const filePreview = document.getElementById('transfer-receipt-preview');
        const fileName = document.getElementById('transfer-receipt-file-name');
        const removeBtn = document.getElementById('transfer-receipt-remove-btn');
        const submitBtn = document.getElementById('transfer-money-submit-btn');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    // Validate file type
                    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
                    if (!allowedTypes.includes(file.type)) {
                        alert('الملفات المسموح بها: PDF, PNG, JPG');
                        fileInput.value = '';
                        return;
                    }

                    // Show file name
                    if (fileName) {
                        fileName.textContent = file.name;
                    }
                    if (uploadArea.querySelector('.transfer-money-upload-content')) {
                        uploadArea.querySelector('.transfer-money-upload-content').style.display = 'none';
                    }
                    if (filePreview) {
                        filePreview.style.display = 'flex';
                    }

                    // Enable submit button if reference number is filled
                    checkTransferFormValidity();
                }
            });

            if (removeBtn) {
                removeBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    fileInput.value = '';
                    if (fileName) fileName.textContent = '';
                    if (filePreview) filePreview.style.display = 'none';
                    if (uploadArea.querySelector('.transfer-money-upload-content')) {
                        uploadArea.querySelector('.transfer-money-upload-content').style.display = 'flex';
                    }
                    // Disable submit button
                    if (submitBtn) submitBtn.disabled = true;
                });
            }
        }

        // Check form validity when reference number changes
        const referenceInput = document.getElementById('transfer-reference-input');
        if (referenceInput) {
            referenceInput.addEventListener('input', checkTransferFormValidity);
        }
    }

    // Check transfer form validity
    function checkTransferFormValidity() {
        const referenceInput = document.getElementById('transfer-reference-input');
        const fileInput = document.getElementById('transfer-receipt-file-input');
        const submitBtn = document.getElementById('transfer-money-submit-btn');

        if (submitBtn && referenceInput && fileInput) {
            const hasReference = referenceInput.value.trim().length > 0;
            const hasFile = fileInput.files.length > 0;

            submitBtn.disabled = !(hasReference && hasFile);
        }
    }

    // Handle URL hash changes to show correct view
    function handleHashChange() {
        const hash = window.location.hash;
        const walletManagementContent = document.getElementById('wallet-management-content');
        const transferMoneyContent = document.getElementById('transfer-money-content');
        const withdrawMoneyContent = document.getElementById('withdraw-money-content');
        const walletView = document.getElementById('manage-my-wallet-view');

        // Only handle if we're on the wallet page
        if (!walletView || !walletView.classList.contains('active')) {
            return;
        }

        // Set flag to prevent URL update loops
        isUpdatingFromHash = true;

        if (hash === '#/profile/manage-wallet/transfer-money') {
            // Show transfer money content
            if (transferMoneyContent && walletManagementContent) {
                walletManagementContent.classList.remove('active');
                if (withdrawMoneyContent) withdrawMoneyContent.classList.remove('active');
                requestAnimationFrame(() => {
                    transferMoneyContent.classList.add('active');
                    const headerTitle = document.querySelector('#manage-wallet-header h2');
                    if (headerTitle) {
                        headerTitle.textContent = 'الحوالة البنكية';
                    }
                    // Update current balance
                    updateTransferMoneyCurrentBalance();
                    // Initialize components
                    initTransferMoneyCopyButton();
                    initTransferMoneyFileUpload();
                    // Update back button
                    updateBackButtonForTransferMoney();
                });
            }
        } else if (hash === '#/profile/manage-wallet/withdraw-money') {
            // Show withdraw money content
            if (withdrawMoneyContent && walletManagementContent) {
                walletManagementContent.classList.remove('active');
                if (transferMoneyContent) transferMoneyContent.classList.remove('active');
                // Render and show withdraw money content
                renderWithdrawMoneyContent().then(() => {
                    requestAnimationFrame(() => {
                        withdrawMoneyContent.classList.add('active');
                        const headerTitle = document.querySelector('#manage-wallet-header h2');
                        if (headerTitle) {
                            headerTitle.textContent = 'طلب سحب الأموال';
                        }
                        // Update back button
                        updateBackButtonForWithdrawMoney();
                    });
                });
            }
        } else if (hash === '#/profile/manage-wallet' || hash === '#/profile/manage-wallet/') {
            // Show wallet management content
            showWalletManagementContent();
        }

        // Reset flag after a short delay
        setTimeout(() => {
            isUpdatingFromHash = false;
        }, 100);
    }

    // Initialize hash change listeners
    function initHashChangeListeners() {
        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Listen for popstate (browser back/forward)
        window.addEventListener('popstate', handleHashChange);

        // Handle initial hash on load
        setTimeout(() => {
            handleHashChange();
        }, 100);
    }

    // Update back button handler for transfer money view
    function updateBackButtonForTransferMoney() {
        const backBtn = document.getElementById('manage-wallet-back-btn');
        if (backBtn) {
            backBtn.onclick = function () {
                // Navigate back using URL hash to trigger hashchange event
                window.location.hash = '#/profile/manage-wallet';
            };
        }
    }

    // Ensure wallet management content is active
    function ensureWalletManagementContentActive() {
        const walletManagementContent = document.getElementById('wallet-management-content');
        const transferMoneyContent = document.getElementById('transfer-money-content');
        const withdrawMoneyContent = document.getElementById('withdraw-money-content');
        const headerTitle = document.querySelector('#manage-wallet-header h2');

        if (!walletManagementContent) return;

        // Update header title
        if (headerTitle) {
            headerTitle.textContent = 'إدارة محفظتي';
        }

        // Ensure other content views are not active
        if (transferMoneyContent) transferMoneyContent.classList.remove('active');
        if (withdrawMoneyContent) withdrawMoneyContent.classList.remove('active');

        // Ensure wallet management content is active immediately (synchronously)
        // This happens before browser paint, making it instant and unnoticeable
        walletManagementContent.classList.add('active');

        // Update back button to go back to profile menu
        const backBtn = document.getElementById('manage-wallet-back-btn');
        if (backBtn) {
            backBtn.onclick = function () {
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
        const walletView = document.getElementById('manage-my-wallet-view');
        if (!walletView) {
            return;
        }

        // Initialize hash change listeners
        initHashChangeListeners();

        // Use MutationObserver to render when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = walletView.classList.contains('active');
                    if (isActive && !walletViewRendered) {
                        // Only render once when view becomes active
                        setTimeout(async () => {
                            await renderManageWalletView();
                            // Initialize Lucide icons
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }
                            // Check hash to show correct view
                            handleHashChange();
                        }, 100);
                    } else if (isActive && walletViewRendered) {
                        // View is already rendered, check hash to determine which view to show
                        const hash = window.location.hash;
                        if (hash === '#/profile/manage-wallet/transfer-money') {
                            // Show transfer money content if hash indicates transfer
                            const transferMoneyContent = document.getElementById('transfer-money-content');
                            const walletManagementContent = document.getElementById('wallet-management-content');
                            if (transferMoneyContent && walletManagementContent) {
                                walletManagementContent.classList.remove('active');
                                requestAnimationFrame(() => {
                                    transferMoneyContent.classList.add('active');
                                    const headerTitle = document.querySelector('#manage-wallet-header h2');
                                    if (headerTitle) {
                                        headerTitle.textContent = 'الحوالة البنكية';
                                    }
                                    // Update current balance
                                    updateTransferMoneyCurrentBalance();
                                    // Initialize components
                                    initTransferMoneyCopyButton();
                                    initTransferMoneyFileUpload();
                                    // Update back button
                                    updateBackButtonForTransferMoney();
                                });
                            }
                        } else if (hash === '#/profile/manage-wallet/withdraw-money') {
                            // Show withdraw money content if hash indicates withdraw
                            const withdrawMoneyContent = document.getElementById('withdraw-money-content');
                            const walletManagementContent = document.getElementById('wallet-management-content');
                            if (withdrawMoneyContent && walletManagementContent) {
                                walletManagementContent.classList.remove('active');
                                // Render and show withdraw money content
                                renderWithdrawMoneyContent().then(() => {
                                    requestAnimationFrame(() => {
                                        withdrawMoneyContent.classList.add('active');
                                        const headerTitle = document.querySelector('#manage-wallet-header h2');
                                        if (headerTitle) {
                                            headerTitle.textContent = 'طلب سحب الأموال';
                                        }
                                        // Update back button
                                        updateBackButtonForWithdrawMoney();
                                    });
                                });
                            }
                        } else {
                            // Ensure wallet management content is active immediately (synchronously)
                            // This happens before browser paint, making it instant and unnoticeable
                            ensureWalletManagementContentActive();
                        }
                    }
                }
            });
        });

        observer.observe(walletView, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Check if view is already active on initial load
        if (walletView.classList.contains('active') && !walletViewRendered) {
            setTimeout(async () => {
                await renderManageWalletView();
                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                // Check hash to show correct view
                handleHashChange();
            }, 100);
        } else if (walletView.classList.contains('active') && walletViewRendered) {
            // View is already rendered, check hash to determine which view to show
            const hash = window.location.hash;
            if (hash === '#/profile/manage-wallet/transfer-money') {
                // Show transfer money content if hash indicates transfer
                const transferMoneyContent = document.getElementById('transfer-money-content');
                const walletManagementContent = document.getElementById('wallet-management-content');
                if (transferMoneyContent && walletManagementContent) {
                    walletManagementContent.classList.remove('active');
                    requestAnimationFrame(() => {
                        transferMoneyContent.classList.add('active');
                        const headerTitle = document.querySelector('#manage-wallet-header h2');
                        if (headerTitle) {
                            headerTitle.textContent = 'الحوالة البنكية';
                        }
                        // Update current balance
                        updateTransferMoneyCurrentBalance();
                        // Initialize components
                        initTransferMoneyCopyButton();
                        initTransferMoneyFileUpload();
                        // Update back button
                        updateBackButtonForTransferMoney();
                    });
                }
            } else if (hash === '#/profile/manage-wallet/withdraw-money') {
                // Show withdraw money content if hash indicates withdraw
                const withdrawMoneyContent = document.getElementById('withdraw-money-content');
                const walletManagementContent = document.getElementById('wallet-management-content');
                if (withdrawMoneyContent && walletManagementContent) {
                    walletManagementContent.classList.remove('active');
                    // Render and show withdraw money content
                    renderWithdrawMoneyContent().then(() => {
                        requestAnimationFrame(() => {
                            withdrawMoneyContent.classList.add('active');
                            const headerTitle = document.querySelector('#manage-wallet-header h2');
                            if (headerTitle) {
                                headerTitle.textContent = 'طلب سحب الأموال';
                            }
                            // Update back button
                            updateBackButtonForWithdrawMoney();
                        });
                    });
                }
            } else {
                // Ensure wallet management content is active immediately (synchronously)
                // This happens before browser paint, making it instant and unnoticeable
                ensureWalletManagementContentActive();
            }
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
        init: init,
        ensureWalletManagementContentActive: ensureWalletManagementContentActive
    };
})();

