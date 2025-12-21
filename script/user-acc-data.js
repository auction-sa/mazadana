// Account Info Tabs Management
// This file contains all JavaScript code related to the "معلومات الحساب" (Account Info) pages and functionality
(function () {
    'use strict';

    // Tab state
    let currentTab = 'basic-data';
    let isInDetailView = false;

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;

    // Track render state to rebuild markup once
    let accountInfoRendered = false;

    // User data cache
    let userData = null;

    /**
     * Fetch user data from JSON file
     * @returns {Promise<Object|null>} User data object or null if error
     */
    async function fetchUserData() {
        if (userData) {
            return userData; // Return cached data
        }

        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            userData = await response.json();
            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    // Build the account info view markup
    async function renderAccountInfoView() {
        const accountInfoView = document.getElementById('profile-account-info-view');
        if (!accountInfoView || accountInfoRendered) return;

        // Fetch user data
        const data = await fetchUserData();
        if (!data) {
            console.warn('User data not available, using default values');
        }

        // Use data from JSON or fallback to defaults
        const userName = data?.name || 'غير محدد';
        const userNationalId = data?.nationalId || 'غير محدد';
        const userBirthDate = data?.birthDate || 'غير محدد';
        const userSex = data?.sex || 'غير محدد';
        const userNationality = data?.nationality || 'غير محدد';
        const userAvatar = data?.avatar || '';
        const userEmail = data?.email || 'غير محدد';
        const userPhone = data?.phone || 'غير محدد';

        accountInfoView.innerHTML = `
            <div class="account-info-container">
                <div class="account-tabs-wrapper">
                    <div class="account-tabs">
                        <button class="account-tab active" data-tab="basic-data">
                            <i data-lucide="user" class="account-tab-icon"></i>
                            <span class="tab-text">البيانات الأساسية</span>
                            <i data-lucide="chevron-left" class="account-tab-arrow"></i>
                        </button>
                        <button class="account-tab" data-tab="contact-info">
                            <i data-lucide="phone" class="account-tab-icon"></i>
                            <span class="tab-text">معلومات التواصل</span>
                            <i data-lucide="chevron-left" class="account-tab-arrow"></i>
                        </button>
                        <button class="account-tab" data-tab="addresses">
                            <i data-lucide="map-pin" class="account-tab-icon"></i>
                            <span class="tab-text">عناويني</span>
                            <i data-lucide="chevron-left" class="account-tab-arrow"></i>
                        </button>
                    </div>

                    <div class="account-tab-content">
                        <div id="basic-data-view" class="tab-view">
                            <div class="account-card">
                                <div class="card-body scrollable-container">
                                    <div class="info-row profile-image-row">
                                        <div class="info-label">
                                            <i data-lucide="image" class="info-icon"></i>
                                            <span>صورة الملف الشخصي</span>
                                        </div>
                                        <div class="info-value profile-image-value">
                                            <div class="profile-image-edit">
                                                <div class="profile-image" id="basic-data-profile-image" ${userAvatar ? `style="background-image: url('${userAvatar}'); background-size: cover; background-position: center;"` : ''}>
                                                    ${!userAvatar ? '<i class="fas fa-user profile-image-placeholder"></i>' : ''}
                                                </div>
                                                <button class="edit-image-btn" type="button">
                                                    <i data-lucide="camera" class="edit-image-icon"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">
                                            <i data-lucide="user" class="info-icon"></i>
                                            <span>الاسم الكامل</span>
                                        </div>
                                        <div class="info-value">${userName}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">
                                            <i data-lucide="id-card" class="info-icon"></i>
                                            <span>الهوية الوطنية</span>
                                        </div>
                                        <div class="info-value">${userNationalId}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">
                                            <i data-lucide="calendar" class="info-icon"></i>
                                            <span>تاريخ الميلاد</span>
                                        </div>
                                        <div class="info-value">${userBirthDate}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">
                                            <i data-lucide="fingerprint-pattern" class="info-icon"></i>
                                            <span>الجنس</span>
                                        </div>
                                        <div class="info-value">${userSex}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">
                                            <i data-lucide="flag" class="info-icon"></i>
                                            <span>الجنسية</span>
                                        </div>
                                        <div class="info-value">${userNationality}</div>
                                    </div>
                                    <button class="edit-btn">
                                        <i data-lucide="edit" class="edit-icon"></i>
                                        <span>تعديل البيانات</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div id="contact-info-view" class="tab-view">
                            <div class="account-card">
                                <div class="card-body scrollable-container">
                                    <div class="info-row">
                                        <div class="info-label">
                                            <i data-lucide="mail" class="info-icon"></i>
                                            <span>البريد الإلكتروني</span>
                                        </div>
                                        <div class="info-value">${userEmail}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">
                                            <i data-lucide="phone" class="info-icon"></i>
                                            <span>رقم الجوال</span>
                                        </div>
                                        <div class="info-value">${userPhone}</div>
                                    </div>
                                    <button class="edit-btn">
                                        <i data-lucide="edit" class="edit-icon"></i>
                                        <span>تعديل البيانات</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div id="addresses-view" class="tab-view">
                            <div class="account-card">
                                <div class="card-body scrollable-container">
                                    <div class="empty-state">
                                        <i data-lucide="map-pin" class="empty-icon"></i>
                                        <p class="empty-text">لا توجد عناوين محفوظة</p>
                                        <button class="add-address-btn">
                                            <i data-lucide="plus" class="add-icon"></i>
                                            <span>إضافة عنوان جديد</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Allow event listeners to reattach on fresh markup
        eventListenersAttached = false;
        accountInfoRendered = true;
    }

    // Initialize tabs
    function initAccountTabs() {
        // Prevent duplicate event listeners
        if (eventListenersAttached) {
            return;
        }

        const tabs = document.querySelectorAll('.account-tab');

        // Tab click handlers
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Back to tabs button handlers
        const backToTabsButtons = document.querySelectorAll('.back-btn[data-back="tabs"]');
        backToTabsButtons.forEach(btn => {
            // Check if listener already attached
            if (!btn.hasAttribute('data-listener-attached')) {
                btn.addEventListener('click', function () {
                    goBackToTabs();
                });
                btn.setAttribute('data-listener-attached', 'true');
            }
        });

        // Back to profile button handler
        const backToProfileBtn = document.getElementById('back-to-profile-btn');
        if (backToProfileBtn && !backToProfileBtn.hasAttribute('data-listener-attached')) {
            backToProfileBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();


                // Navigate to profile menu (not home-section)
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                } else {
                    // Fallback: navigate to profile section
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                    }
                }
            });
            backToProfileBtn.setAttribute('data-listener-attached', 'true');
        }

        eventListenersAttached = true;
        // Don't auto-open any tab - let user choose
    }

    // Switch to a specific tab
    function switchTab(tabId) {

        // Hide account tabs header
        const accountTabsHeader = document.getElementById('account-tabs-header');
        if (accountTabsHeader) {
            accountTabsHeader.style.display = 'none';
        }

        // Show the appropriate card header for this tab
        const cardHeader = document.getElementById(`card-header-${tabId}`);
        if (cardHeader) {
            cardHeader.style.display = 'flex';
        }
        // Hide all other card headers
        document.querySelectorAll('.account-tabs-header').forEach(header => {
            if (header.id !== `card-header-${tabId}`) {
                header.style.display = 'none';
            }
        });

        const accountTabs = document.querySelector('.account-tabs');
        const tabViews = document.querySelectorAll('.tab-view');
        const wrapper = document.querySelector('.account-tabs-wrapper');

        // Hide account tabs with smooth transition (use only active class)
        if (accountTabs) {
            accountTabs.classList.add('hidden');
        }

        // Show the selected tab view (use only active class)
        tabViews.forEach(view => {
            if (view.id === `${tabId}-view`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Update wrapper height to match active tab view
        if (wrapper) {
            const activeView = document.getElementById(`${tabId}-view`);
            if (activeView) {
                // Wait for view to be visible, then adjust wrapper height
                setTimeout(() => {
                    const viewHeight = activeView.scrollHeight;
                    wrapper.style.minHeight = viewHeight + 'px';
                }, 50);
            }
        }

        // Update tab buttons (for visual feedback)
        const tabs = document.querySelectorAll('.account-tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        currentTab = tabId;
        isInDetailView = true;

        // Scroll scrollable containers within profile-account-info-view to top
        if (typeof window.scrollScrollableContainersToTop === 'function') {
            // Scroll immediately (synchronously) - this happens before browser paint
            window.scrollScrollableContainersToTop('profile-account-info-view');
            // Also scroll in the next frame to catch any containers that become visible
            requestAnimationFrame(() => {
                window.scrollScrollableContainersToTop('profile-account-info-view');
            });
        }

        // Push navigation state to history
        setTimeout(() => {
            if (typeof window.pushNavigationState === 'function') {
                window.pushNavigationState(false);
            }
        }, 100);

        // Update sticky header positions
        setTimeout(() => {
            updateStickyHeaderPositions();
        }, 50);

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Go back to tabs view (from detail view)
    function goBackToTabs() {

        // Show account tabs header
        const accountTabsHeader = document.getElementById('account-tabs-header');
        if (accountTabsHeader) {
            accountTabsHeader.style.display = 'flex';
        }
        // Hide only card headers (keep main account tabs header visible)
        document.querySelectorAll('.account-tabs-header').forEach(header => {
            if (header.id && header.id.startsWith('card-header-')) {
                header.style.display = 'none';
            }
        });

        const accountTabs = document.querySelector('.account-tabs');
        const tabViews = document.querySelectorAll('.tab-view');
        const wrapper = document.querySelector('.account-tabs-wrapper');

        // Hide all tab views (use only active class)
        tabViews.forEach(view => {
            view.classList.remove('active');
        });

        // Show account tabs (use only active class)
        if (accountTabs) {
            accountTabs.classList.remove('hidden');
        }

        // Reset wrapper height to default
        if (wrapper) {
            wrapper.style.minHeight = '';
        }

        isInDetailView = false;

        // Push navigation state to history
        setTimeout(() => {
            if (typeof window.pushNavigationState === 'function') {
                window.pushNavigationState(false);
            }
        }, 100);

        // Update sticky header positions
        updateStickyHeaderPositions();

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Initialize profile section headers
    function initProfileSectionHeaders() {
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return;

        const headersContainer = document.getElementById('profile-section-headers');
        if (!headersContainer) return;

        // Check if headers already exist
        if (headersContainer.children.length > 0) {
            // Headers already exist, just update positions
            updateStickyHeaderPositions();
            return;
        }

        // Create all headers - use window functions if available, otherwise create inline
        const profilePageTitle = typeof window.createProfilePageTitle === 'function'
            ? window.createProfilePageTitle()
            : `<h1 class="profile-page-title">حسابي</h1>`;

        const accountTabsHeader = typeof window.createAccountTabsHeader === 'function'
            ? window.createAccountTabsHeader()
            : `<div class="account-tabs-header" id="account-tabs-header" style="display: none;">
                <button class="back-to-profile-btn" id="back-to-profile-btn" aria-label="العودة إلى القائمة">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">معلومات الحساب</h2>
            </div>`;

        const basicDataHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('البيانات الأساسية', 'basic-data')
            : `<div class="account-tabs-header" id="card-header-basic-data" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">البيانات الأساسية</h2>
            </div>`;

        const contactInfoHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('معلومات التواصل', 'contact-info')
            : `<div class="account-tabs-header" id="card-header-contact-info" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">معلومات التواصل</h2>
            </div>`;

        const addressesHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('عناويني', 'addresses')
            : `<div class="account-tabs-header" id="card-header-addresses" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">عناويني</h2>
            </div>`;

        headersContainer.innerHTML = profilePageTitle + accountTabsHeader + basicDataHeader + contactInfoHeader + addressesHeader;

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Show profile page title by default (when on menu view)
        const profilePageTitleEl = document.querySelector('.profile-page-title');
        if (profilePageTitleEl) {
            profilePageTitleEl.style.display = 'block';
        }

        // Update sticky header positions
        updateStickyHeaderPositions();
    }

    // Update sticky header positions based on top-header height
    function updateStickyHeaderPositions() {
        const topHeader = document.querySelector('.top-header');
        if (!topHeader) return;

        const topHeaderHeight = topHeader.offsetHeight;
        const stickyHeaders = document.querySelectorAll('.profile-page-title, .account-tabs-header');

        stickyHeaders.forEach(header => {
            if (header) {
                // Set top position to match top-header height so it sticks right below it
                header.style.top = `${topHeaderHeight}px`;
                // Ensure it's visible and properly positioned
                header.style.position = 'sticky';
                header.style.zIndex = '99';
                header.style.padding = 'var(--spacing-xs) var(--spacing-lg)';
            }
        });
    }

    // Initialize when account info view becomes active
    async function initAccountInfoView() {
        const accountInfoView = document.getElementById('profile-account-info-view');
        if (!accountInfoView) {
            return;
        }

        // Build the view markup once (await since it's async)
        await renderAccountInfoView();

        // Update sticky header positions
        updateStickyHeaderPositions();

        // Use MutationObserver to detect when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = accountInfoView.classList.contains('active');
                    if (isActive) {
                        // Update sticky header positions and initialize tabs when view becomes active
                        setTimeout(() => {
                            updateStickyHeaderPositions();
                            initAccountTabs();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(accountInfoView, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also initialize if already active
        if (accountInfoView.classList.contains('active')) {
            setTimeout(() => {
                updateStickyHeaderPositions();
                initAccountTabs();
            }, 100);
        }
    }

    // Update sticky positions on window resize
    window.addEventListener('resize', () => {
        updateStickyHeaderPositions();
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initProfileSectionHeaders();
            updateStickyHeaderPositions();
            initAccountInfoView();
        });
    } else {
        initProfileSectionHeaders();
        updateStickyHeaderPositions();
        initAccountInfoView();
    }

    // Export for external use
    window.AccountInfoTabs = {
        switchTab: switchTab,
        goBack: goBackToTabs,
        updateStickyPositions: updateStickyHeaderPositions,
        initProfileSectionHeaders: initProfileSectionHeaders,
        initAccountTabs: initAccountTabs,
        initAccountInfoView: initAccountInfoView
    };
})();