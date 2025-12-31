// Manage My Bank Accounts Page Management
// This file contains all JavaScript code related to the "إدارة حساباتي البنكية" (Manage My Bank Accounts) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let bankAccountsViewRendered = false;
    let currentEditIndex = null; // Track which account is being edited

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
        const bankAccountsView = document.getElementById('manage-my-bank-Accounts-view');
        if (!bankAccountsView || bankAccountsViewRendered) return;

        // Fetch bank accounts
        const bankAccounts = await fetchBankAccounts();

        bankAccountsView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="manage-bank-accounts-header">
                    <button class="back-btn" id="manage-bank-accounts-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">إدارة حساباتي البنكية</h2>
                </div>

                <div class="settings-content scrollable-container">
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

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Handle delete account
    async function handleDeleteAccount(index) {
        const bankAccounts = await fetchBankAccounts();
        if (index >= 0 && index < bankAccounts.length) {
            const account = bankAccounts[index];
            if (confirm(`هل أنت متأكد من حذف حساب ${account.bankName}؟`)) {
                // TODO: Implement actual deletion logic
                alert('تم حذف الحساب البنكي');
                // Re-render the view
                bankAccountsViewRendered = false;
                await renderBankAccountsView();
            }
        }
    }

    // Handle edit account
    async function handleEditAccount(index) {
        const bankAccounts = await fetchBankAccounts();
        if (index >= 0 && index < bankAccounts.length) {
            currentEditIndex = index;
            showAddBankAccountForm(bankAccounts[index]);
        }
    }

    // Show add/edit bank account form
    async function showAddBankAccountForm(accountData = null) {
        const bankAccountsView = document.getElementById('manage-my-bank-Accounts-view');
        if (!bankAccountsView) return;

        // Reset render flag so we can go back to list view
        bankAccountsViewRendered = false;
        const isEditMode = accountData !== null;

        bankAccountsView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="manage-bank-accounts-header">
                    <button class="back-btn" id="add-bank-account-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">${isEditMode ? 'تعديل حساب بنكي' : 'إضافة حساب بنكي'}</h2>
                </div>

                <div class="settings-content scrollable-container">
                    <h3 class="add-bank-account-form-title">${isEditMode ? 'تعديل حساب بنكي' : 'إضافة حساب بنكي'}</h3>
                    
                    <form class="add-bank-account-form" id="add-bank-account-form">
                        <!-- Bank Name Dropdown -->
                        <div class="form-group">
                            <label class="form-label required">اسم البنك</label>
                            <div class="select-wrapper">
                                <select class="form-select" id="bank-name-select" required>
                                    <option value="">اختر البنك</option>
                                    <option value="بنك الراجحي" ${accountData?.bankName === 'بنك الراجحي' ? 'selected' : ''}>بنك الراجحي</option>
                                    <option value="بنك الأهلي" ${accountData?.bankName === 'بنك الأهلي' ? 'selected' : ''}>بنك الأهلي</option>
                                    <option value="البنك السعودي الفرنسي" ${accountData?.bankName === 'البنك السعودي الفرنسي' ? 'selected' : ''}>البنك السعودي الفرنسي</option>
                                    <option value="بنك الرياض" ${accountData?.bankName === 'بنك الرياض' ? 'selected' : ''}>بنك الرياض</option>
                                    <option value="البنك السعودي للاستثمار" ${accountData?.bankName === 'البنك السعودي للاستثمار' ? 'selected' : ''}>البنك السعودي للاستثمار</option>
                                    <option value="بنك ساب" ${accountData?.bankName === 'بنك ساب' ? 'selected' : ''}>بنك ساب</option>
                                    <option value="البنك الأهلي التجاري" ${accountData?.bankName === 'البنك الأهلي التجاري' ? 'selected' : ''}>البنك الأهلي التجاري</option>
                                </select>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                        </div>

                        <!-- SWIFT Code -->
                        <div class="form-group">
                            <label class="form-label required">SWIFT Code</label>
                            <input type="text" class="form-input" id="swift-code-input" 
                                placeholder="أدخل رمز SWIFT" 
                                value="${accountData?.swiftCode || ''}" 
                                required>
                        </div>

                        <!-- Account Number -->
                        <div class="form-group">
                            <label class="form-label required">رقم الحساب</label>
                            <input type="text" class="form-input" id="account-number-input" 
                                placeholder="أدخل رقم الحساب" 
                                value="${accountData?.accountNo || ''}" 
                                required>
                        </div>

                        <!-- IBAN -->
                        <div class="form-group">
                            <label class="form-label required">IBAN</label>
                            <input type="text" class="form-input" id="iban-input" 
                                placeholder="أدخل رقم IBAN" 
                                value="${accountData?.ibanNumber || ''}" 
                                required>
                        </div>

                        <!-- Beneficiary Address -->
                        <div class="form-group">
                            <label class="form-label required">عنوان المستفيد</label>
                            <input type="text" class="form-input" id="beneficiary-address-input" 
                                placeholder="أدخل عنوان المستفيد" 
                                value="${accountData?.ownerAddress || ''}" 
                                required>
                        </div>

                        <!-- Account Holder Name -->
                        <div class="form-group">
                            <label class="form-label required">اسم صاحب الحساب</label>
                            <input type="text" class="form-input" id="account-holder-name-input" 
                                placeholder="مثال: بندر زهير" 
                                value="${accountData?.accountHolderName || ''}" 
                                required>
                        </div>

                        <!-- Currency Dropdown -->
                        <div class="form-group">
                            <label class="form-label required">العملة</label>
                            <div class="select-wrapper">
                                <select class="form-select" id="currency-select" required>
                                    <option value="الريال السعودي" ${(!accountData || accountData.accountCurrency === 'الريال السعودي' || accountData.accountCurrency === 'ريال سعودي') ? 'selected' : ''}>الريال السعودي</option>
                                    <option value="دولار أمريكي" ${accountData?.accountCurrency === 'دولار أمريكي' ? 'selected' : ''}>دولار أمريكي</option>
                                    <option value="يورو" ${accountData?.accountCurrency === 'يورو' ? 'selected' : ''}>يورو</option>
                                </select>
                                <i data-lucide="chevron-down" class="select-chevron"></i>
                            </div>
                        </div>

                        <!-- IBAN Image Upload -->
                        <div class="form-group">
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
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" class="form-checkbox" id="policy-checkbox" required>
                                <span class="checkbox-text">أوافق على الشروط والأحكام وسياسة الخصوصية</span>
                            </label>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" class="submit-bank-account-btn" id="submit-bank-account-btn">
                            طلب مراجعة حسابي البنكي
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Back button handler
        const backBtn = document.getElementById('add-bank-account-back-btn');
        if (backBtn) {
            backBtn.onclick = function () {
                // Go back to bank accounts list
                bankAccountsViewRendered = false;
                renderBankAccountsView();
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
        bankAccountsViewRendered = false;
        await renderBankAccountsView();
    }

    // Initialize when DOM is ready
    function init() {
        const bankAccountsView = document.getElementById('manage-my-bank-Accounts-view');
        if (!bankAccountsView) {
            return;
        }

        // Build view markup once
        renderBankAccountsView();

        // Use MutationObserver to re-initialize when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = bankAccountsView.classList.contains('active');
                    if (isActive) {
                        // Re-render when view becomes active
                        bankAccountsViewRendered = false; // Reset flag to allow re-rendering
                        setTimeout(async () => {
                            await renderBankAccountsView();
                            // Initialize Lucide icons
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }
                        }, 100);
                    }
                }
            });
        });

        observer.observe(bankAccountsView, {
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
    window.ManageBankAccountsPage = {
        init: init
    };
})();

