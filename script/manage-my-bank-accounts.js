// Manage My Bank Accounts Page Management
// This file contains all JavaScript code related to the "إدارة حساباتي البنكية" (Manage My Bank Accounts) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let bankAccountsViewRendered = false;
    let currentEditIndex = null; // Track which account is being edited

    // Bank data mapping: bank name -> SWIFT code and logo path
    const bankData = {
        'بنك الراجحي': {
            swiftCode: 'RJHISARI',
            logo: 'icons/banks/alrajhi.png' // Update with actual logo path
        },
        'بنك الأهلي': {
            swiftCode: 'NCBKSARI',
            logo: 'icons/banks/alahli.png' // Update with actual logo path
        },
        'البنك السعودي الفرنسي': {
            swiftCode: 'BSFRSARI',
            logo: 'icons/banks/sf.png' // Update with actual logo path
        },
        'بنك الرياض': {
            swiftCode: 'RIBLSARI',
            logo: 'icons/banks/riyad.png' // Update with actual logo path
        },
        'البنك السعودي للاستثمار': {
            swiftCode: 'SIBCSAJE',
            logo: 'icons/banks/sabic.png' // Update with actual logo path
        },
        'بنك ساب': {
            swiftCode: 'SAUBSARI',
            logo: 'icons/banks/sabb.png' // Update with actual logo path
        },
        'البنك الأهلي التجاري': {
            swiftCode: 'NCBKSARI',
            logo: 'icons/banks/alahli-commercial.png' // Update with actual logo path
        }
    };

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

    // Build bank account card HTML
    function createBankAccountCard(account, index) {
        return `
            <div class="bank-account-card" data-index="${index}">
                <div class="bank-account-card-header">
                    <div class="bank-account-card-title">
                        <i data-lucide="building-2" class="bank-icon"></i>
                        <span class="bank-name">${account.bankName}</span>
                    </div>
                    <div class="bank-account-card-actions">
                        <button class="bank-account-edit-btn" data-index="${index}" aria-label="تعديل">
                            <i data-lucide="edit" class="edit-icon"></i>
                        </button>
                        <button class="bank-account-delete-btn" data-index="${index}" aria-label="حذف">
                            <i data-lucide="trash-2" class="delete-icon"></i>
                        </button>
                    </div>
                </div>
                <div class="bank-account-card-body">
                    <div class="bank-account-info-row">
                        <span class="bank-account-label">رقم الحساب:</span>
                        <span class="bank-account-value">${account.accountNo}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Build manage bank accounts view markup
    async function renderBankAccountsView() {
        const bankAccountsView = document.getElementById('manage-my-bank-accounts-view');
        if (!bankAccountsView) return;

        // If already rendered, just update the list content
        if (bankAccountsViewRendered) {
            await updateBankAccountsList();
            return;
        }

        // Fetch bank accounts
        const bankAccounts = await fetchBankAccounts();

        bankAccountsView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="manage-bank-accounts-header">
                    <button class="back-btn" id="manage-bank-accounts-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title" id="bank-accounts-header-title">إدارة حساباتي البنكية</h2>
                </div>

                <div class="settings-content scrollable-container">
                    <!-- Bank Accounts List View -->
                    <div class="bank-accounts-list-view active" id="bank-accounts-list-view">
                        <div class="bank-accounts-management-content">
                            <!-- Bank Accounts List -->
                            <div class="bank-accounts-list" id="bank-accounts-list">
                                ${bankAccounts.length > 0
                ? bankAccounts.map((account, index) => createBankAccountCard(account, index)).join('')
                : '<div class="bank-accounts-empty-state"><p class="bank-accounts-empty-text">لايوجد حساب بنكي لعرضه هنا</p></div>'
            }
                            </div>

                            <!-- Add New Bank Account Button -->
                            <button class="add-bank-account-btn" id="add-bank-account-btn">
                                <i data-lucide="plus" class="add-icon"></i>
                                إضافة حساب بنكي جديد
                            </button>
                        </div>
                    </div>

                    <!-- Bank Account Form View -->
                    <div class="bank-accounts-form-view" id="bank-accounts-form-view">
                        <div class="bank-accounts-form-content" id="bank-accounts-form-content">
                            <!-- Form will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;
        bankAccountsViewRendered = true;

        // Back button handler
        const backBtn = document.getElementById('manage-bank-accounts-back-btn');
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

        // Add bank account button handler
        const addBtn = document.getElementById('add-bank-account-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                currentEditIndex = null;
                showAddBankAccountForm();
            });
        }

        // Attach event listeners to bank account cards
        attachBankAccountListeners();

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Show confirmation dialog
    function showConfirmationDialog(message, onConfirm, onCancel = null) {
        // Remove existing dialog if any
        const existingDialog = document.querySelector('.bank-account-confirmation-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        // Lock background scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const dialog = document.createElement('div');
        dialog.className = 'bank-account-confirmation-dialog';
        dialog.innerHTML = `
            <div class="bank-account-confirmation-overlay"></div>
            <div class="bank-account-confirmation-content">
                <div class="bank-account-confirmation-message">${message}</div>
                <div class="bank-account-confirmation-buttons">
                    <button class="bank-account-confirmation-btn bank-account-confirmation-cancel" id="bank-account-confirm-cancel-btn">
                        إلغاء
                    </button>
                    <button class="bank-account-confirmation-btn bank-account-confirmation-confirm" id="bank-account-confirm-ok-btn">
                        تأكيد
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Show dialog with animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                dialog.classList.add('active');
            });
        });

        // Close handlers
        const closeDialog = (confirmed = false) => {
            dialog.classList.remove('active');
            document.body.style.overflow = originalOverflow;
            setTimeout(() => {
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
                if (confirmed && onConfirm) {
                    onConfirm();
                } else if (!confirmed && onCancel) {
                    onCancel();
                }
            }, 300);
        };

        const overlay = dialog.querySelector('.bank-account-confirmation-overlay');
        const cancelBtn = document.getElementById('bank-account-confirm-cancel-btn');
        const confirmBtn = document.getElementById('bank-account-confirm-ok-btn');

        if (overlay) overlay.addEventListener('click', () => closeDialog(false));
        if (cancelBtn) cancelBtn.addEventListener('click', () => closeDialog(false));
        if (confirmBtn) confirmBtn.addEventListener('click', () => closeDialog(true));

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && dialog.classList.contains('active')) {
                closeDialog(false);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Handle delete account
    async function handleDeleteAccount(index) {
        const bankAccounts = await fetchBankAccounts();
        if (index >= 0 && index < bankAccounts.length) {
            const account = bankAccounts[index];
            showConfirmationDialog(
                'تأكيد حذف هذا الحساب البنكي',
                async () => {
                    // TODO: Implement actual deletion logic
                    alert('تم حذف الحساب البنكي');
                    // Update the list
                    await updateBankAccountsList();
                }
            );
        }
    }

    // Handle edit account
    async function handleEditAccount(index) {
        const bankAccounts = await fetchBankAccounts();
        if (index >= 0 && index < bankAccounts.length) {
            showConfirmationDialog(
                'تأكيد تعديل معلومات الحساب البنكي',
                () => {
                    currentEditIndex = index;
                    showAddBankAccountForm(bankAccounts[index]);
                }
            );
        }
    }

    // Update bank accounts list content
    async function updateBankAccountsList() {
        const bankAccounts = await fetchBankAccounts();
        const listContainer = document.getElementById('bank-accounts-list');
        if (listContainer) {
            listContainer.innerHTML = bankAccounts.length > 0
                ? bankAccounts.map((account, index) => createBankAccountCard(account, index)).join('')
                : '<div class="bank-accounts-empty-state"><p class="bank-accounts-empty-text">لايوجد حساب بنكي لعرضه هنا</p></div>';

            // Re-attach event listeners
            attachBankAccountListeners();
        }
    }

    // Attach event listeners to bank account cards
    function attachBankAccountListeners() {
        // Delete button handlers
        const deleteBtns = document.querySelectorAll('.bank-account-delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                handleDeleteAccount(index);
            });
        });

        // Edit button handlers
        const editBtns = document.querySelectorAll('.bank-account-edit-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                handleEditAccount(index);
            });
        });
    }

    // Show add/edit bank account form
    async function showAddBankAccountForm(accountData = null) {
        const listView = document.getElementById('bank-accounts-list-view');
        const formView = document.getElementById('bank-accounts-form-view');
        const formContent = document.getElementById('bank-accounts-form-content');
        const headerTitle = document.getElementById('bank-accounts-header-title');

        if (!listView || !formView || !formContent) return;

        const isEditMode = accountData !== null;

        // Update header title
        if (headerTitle) {
            headerTitle.textContent = isEditMode ? 'تعديل حساب بنكي' : 'إضافة حساب بنكي';
        }

        // Build form HTML
        formContent.innerHTML = `
            <h3 class="add-bank-account-form-title">${isEditMode ? 'تعديل حساب بنكي' : 'إضافة حساب بنكي'}</h3>
                    
                    <form class="add-bank-account-form" id="add-bank-account-form">
                        <!-- Bank Name Dropdown -->
                        <div class="my-bank-accounts-form-group">
                            <label class="form-label required">اسم البنك</label>
                            <div class="select-wrapper" id="bank-select-wrapper">
                                <select class="my-bank-accounts-form-select" id="bank-name-select" required>
                                    <option value="">اختر البنك</option>
                                    ${Object.keys(bankData).map(bankName => {
            const bank = bankData[bankName];
            const isSelected = accountData?.bankName === bankName ? 'selected' : '';
            return `<option value="${bankName}" data-swift="${bank.swiftCode}" data-logo="${bank.logo}" ${isSelected}>
                                            ${bankName}
                                        </option>`;
        }).join('')}
                                </select>
                                <img class="bank-logo-preview" id="bank-logo-preview" src="" alt="" style="display: none;">
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                        </div>

                        <!-- SWIFT Code -->
                        <div class="my-bank-accounts-form-group">
                            <label class="form-label required">رمز السويفت</label>
                            <input type="text" class="my-bank-accounts-form-input" id="swift-code-input" 
                                placeholder="سيتم تعبئته تلقائياً" 
                                value="${accountData?.swiftCode || ''}" 
                                disabled
                                required>
                        </div>

                        <!-- Account Number -->
                        <div class="my-bank-accounts-form-group">
                            <label class="form-label required">رقم الحساب</label>
                            <input type="text" class="my-bank-accounts-form-input" id="account-number-input" 
                                placeholder="أدخل رقم الحساب" 
                                value="${accountData?.accountNo || ''}" 
                                required>
                        </div>

                        <!-- IBAN -->
                        <div class="my-bank-accounts-form-group">
                            <label class="form-label required">IBAN</label>
                            <input type="text" class="my-bank-accounts-form-input" id="iban-input" 
                                placeholder="أدخل رقم IBAN" 
                                value="${accountData?.ibanNumber || ''}" 
                                required>
                        </div>

                        <!-- Beneficiary Address -->
                        <div class="my-bank-accounts-form-group">
                            <label class="form-label required">عنوان المستفيد</label>
                            <input type="text" class="my-bank-accounts-form-input" id="beneficiary-address-input" 
                                placeholder="أدخل عنوان المستفيد" 
                                value="${accountData?.ownerAddress || ''}" 
                                required>
                        </div>

                        <!-- Account Holder Name -->
                        <div class="my-bank-accounts-form-group">
                            <label class="form-label required">اسم صاحب الحساب</label>
                            <input type="text" class="my-bank-accounts-form-input" id="account-holder-name-input" 
                                placeholder="مثال: بندر زهير" 
                                value="${accountData?.accountHolderName || ''}" 
                                required>
                        </div>

                        <!-- Currency Dropdown -->
                        <div class="my-bank-accounts-form-group">
                            <label class="form-label required">العملة</label>
                            <div class="select-wrapper">
                                <select class="my-bank-accounts-form-select" id="currency-select" disabled required>
                                    <option value="الريال السعودي" selected>الريال السعودي</option>
                                </select>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                        </div>

                        <!-- IBAN Image Upload -->
                        <div class="my-bank-accounts-form-group">
                            <label class="form-label required">صورة IBAN</label>
                            <div class="iban-image-upload-area" id="iban-image-upload-area">
                                <input type="file" class="iban-image-input" id="iban-image-input" accept="image/*" style="display: none;">
                                <div class="iban-image-upload-content">
                                    <i data-lucide="cloud-upload" class="upload-icon"></i>
                                    <span class="upload-caption">صورة IBAN</span>
                                </div>
                                <div class="iban-image-preview" id="iban-image-preview" style="display: none;">
                                    <img id="iban-preview-img" src="" alt="IBAN Preview">
                                    <button type="button" class="remove-image-btn" id="remove-iban-image-btn">
                                        <i data-lucide="x" class="remove-icon"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Policy Checkbox -->
                        <div class="my-bank-accounts-form-group">
                            <label class="my-bank-accounts-checkbox-label">
                                <input type="checkbox" class="form-checkbox" id="policy-checkbox" required>
                                <span class="checkbox-text">عند تسجيل الحساب البنكي فإن سياسة شركة مباشر تقتضي بتطابق اسم صاحب الحساب مع الاسم المسجل في المنصة، وفي حالة إضافة حساب بنكي لطرف آخر فلن تستطيع إتمام عملياتك المالية على المنصة.</span>
                            </label>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" class="submit-bank-account-btn" id="submit-bank-account-btn">
                            طلب مراجعة حسابي البنكي
                        </button>
                    </form>
        `;

        // Hide list view and show form view with transition
        if (listView && formView) {
            // Trigger transition
            listView.classList.remove('active');

            // Use requestAnimationFrame for smooth transition
            requestAnimationFrame(() => {
                formView.classList.add('active');
            });
        }

        // Update back button to go back to list
        const backBtn = document.getElementById('manage-bank-accounts-back-btn');
        if (backBtn) {
            backBtn.onclick = function () {
                showBankAccountsList();
            };
        }

        // IBAN image upload handler
        const uploadArea = document.getElementById('iban-image-upload-area');
        const imageInput = document.getElementById('iban-image-input');
        const imagePreview = document.getElementById('iban-image-preview');
        const previewImg = document.getElementById('iban-preview-img');
        const removeBtn = document.getElementById('remove-iban-image-btn');

        if (uploadArea && imageInput) {
            uploadArea.addEventListener('click', () => {
                imageInput.click();
            });

            imageInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        previewImg.src = event.target.result;
                        uploadArea.querySelector('.iban-image-upload-content').style.display = 'none';
                        imagePreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });

            if (removeBtn) {
                removeBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    imageInput.value = '';
                    previewImg.src = '';
                    imagePreview.style.display = 'none';
                    uploadArea.querySelector('.iban-image-upload-content').style.display = 'flex';
                });
            }
        }

        // Bank name change handler - auto-populate SWIFT code and show bank logo
        const bankNameSelect = document.getElementById('bank-name-select');
        const swiftCodeInput = document.getElementById('swift-code-input');
        const bankLogoPreview = document.getElementById('bank-logo-preview');
        const bankSelectWrapper = document.getElementById('bank-select-wrapper');

        function updateBankLogo() {
            const selectedOption = bankNameSelect.options[bankNameSelect.selectedIndex];
            if (selectedOption && selectedOption.value && bankData[selectedOption.value]) {
                const logoPath = bankData[selectedOption.value].logo;
                if (bankLogoPreview) {
                    bankLogoPreview.src = logoPath;
                    bankLogoPreview.style.display = 'block';
                    bankLogoPreview.onerror = function () {
                        // Hide logo if image fails to load
                        this.style.display = 'none';
                    };
                }
                if (bankSelectWrapper) {
                    bankSelectWrapper.classList.add('has-bank-logo');
                }
            } else {
                if (bankLogoPreview) {
                    bankLogoPreview.style.display = 'none';
                }
                if (bankSelectWrapper) {
                    bankSelectWrapper.classList.remove('has-bank-logo');
                }
            }
        }

        if (bankNameSelect && swiftCodeInput) {
            // Set initial SWIFT code and logo if bank is already selected
            if (accountData?.bankName && bankData[accountData.bankName]) {
                swiftCodeInput.value = bankData[accountData.bankName].swiftCode;
                updateBankLogo();
            }

            bankNameSelect.addEventListener('change', function () {
                const selectedBank = this.value;
                if (selectedBank && bankData[selectedBank]) {
                    swiftCodeInput.value = bankData[selectedBank].swiftCode;
                } else {
                    swiftCodeInput.value = '';
                }
                updateBankLogo();
            });
        }

        // Form submission handler
        const form = document.getElementById('add-bank-account-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                handleFormSubmit();
            });
        }

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Ensure list view is active and form view is not active
    function ensureListViewActive() {
        const listView = document.getElementById('bank-accounts-list-view');
        const formView = document.getElementById('bank-accounts-form-view');
        const headerTitle = document.getElementById('bank-accounts-header-title');

        if (!listView || !formView) return;

        // Update header title
        if (headerTitle) {
            headerTitle.textContent = 'إدارة حساباتي البنكية';
        }

        // Ensure form view is not active
        formView.classList.remove('active');

        // Ensure list view is active
        listView.classList.add('active');

        // Update back button to go back to profile menu
        const backBtn = document.getElementById('manage-bank-accounts-back-btn');
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

    // Show bank accounts list view
    function showBankAccountsList() {
        const listView = document.getElementById('bank-accounts-list-view');
        const formView = document.getElementById('bank-accounts-form-view');
        const headerTitle = document.getElementById('bank-accounts-header-title');

        if (!listView || !formView) return;

        // Update header title
        if (headerTitle) {
            headerTitle.textContent = 'إدارة حساباتي البنكية';
        }

        // Hide form view and show list view with transition
        formView.classList.remove('active');

        // Use requestAnimationFrame for smooth transition
        requestAnimationFrame(() => {
            listView.classList.add('active');
        });

        // Update back button to go back to profile menu
        const backBtn = document.getElementById('manage-bank-accounts-back-btn');
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

    // Handle form submission
    async function handleFormSubmit() {
        const formData = {
            bankName: document.getElementById('bank-name-select').value,
            swiftCode: document.getElementById('swift-code-input').value,
            accountNo: document.getElementById('account-number-input').value,
            ibanNumber: document.getElementById('iban-input').value,
            ownerAddress: document.getElementById('beneficiary-address-input').value,
            accountHolderName: document.getElementById('account-holder-name-input').value,
            accountCurrency: document.getElementById('currency-select').value
        };

        // TODO: Implement actual save logic
        if (currentEditIndex !== null) {
            alert('تم تحديث الحساب البنكي بنجاح');
        } else {
            alert('تم إضافة الحساب البنكي بنجاح');
        }

        // Go back to bank accounts list
        await updateBankAccountsList();
        showBankAccountsList();
    }

    // Initialize when DOM is ready
    function init() {
        const bankAccountsView = document.getElementById('manage-my-bank-accounts-view');
        if (!bankAccountsView) {
            return;
        }

        // Use MutationObserver to render when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = bankAccountsView.classList.contains('active');
                    if (isActive && !bankAccountsViewRendered) {
                        // Only render once when view becomes active
                        setTimeout(async () => {
                            await renderBankAccountsView();
                            // Initialize Lucide icons
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }
                        }, 100);
                    } else if (isActive && bankAccountsViewRendered) {
                        // View is already rendered, ensure list view is active immediately (synchronously)
                        // This happens before browser paint, making it instant and unnoticeable
                        ensureListViewActive();
                    }
                }
            });
        });

        observer.observe(bankAccountsView, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Check if view is already active on initial load
        if (bankAccountsView.classList.contains('active') && !bankAccountsViewRendered) {
            setTimeout(async () => {
                await renderBankAccountsView();
                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 100);
        } else if (bankAccountsView.classList.contains('active') && bankAccountsViewRendered) {
            // View is already rendered, ensure list view is active immediately (synchronously)
            // This happens before browser paint, making it instant and unnoticeable
            ensureListViewActive();
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.ManageBankAccountsPage = {
        init: init,
        ensureListViewActive: ensureListViewActive
    };
})();

