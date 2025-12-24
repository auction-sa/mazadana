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
        // Check localStorage first for saved company data
        const savedCompanyData = localStorage.getItem('sellerCompanyDetails');

        if (userData && !savedCompanyData) {
            return userData; // Return cached data if no localStorage changes
        }

        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            userData = await response.json();

            // Merge localStorage data if available
            if (savedCompanyData) {
                try {
                    const savedData = JSON.parse(savedCompanyData);
                    if (userData.sellerCompanyDetails && userData.sellerCompanyDetails.length > 0) {
                        userData.sellerCompanyDetails[0] = { ...userData.sellerCompanyDetails[0], ...savedData };
                    } else {
                        userData.sellerCompanyDetails = [savedData];
                    }
                } catch (e) {
                    console.warn('Error parsing saved company data:', e);
                }
            }

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
        const userName = data?.userName || 'غير محدد';
        const userNationalId = data?.userNationalId || 'غير محدد';
        const userBirthDate = data?.userBirthDate || 'غير محدد';
        const userSex = data?.useSexType || 'غير محدد';
        const userNationality = data?.userNationalityCountry || 'غير محدد';
        const userAvatar = data?.userPersonalProfileImage || '';
        const userEmail = data?.userEmailAddress || 'غير محدد';
        const userPhone = data?.userPhoneNumber || 'غير محدد';

        // Get company details from sellerCompanyDetails array
        const companyDetails = data?.sellerCompanyDetails && data.sellerCompanyDetails.length > 0
            ? data.sellerCompanyDetails[0]
            : {};
        const companyLogo = companyDetails?.sellerCompanyLogo || '';
        const companyBanner = companyDetails?.sellerCompanyBanner || '';
        const companyDescription = companyDetails?.sellerCompanyDescription || '';
        const companyAddress = companyDetails?.sellerCompanyAddress || '';
        const companyAddressUrl = companyDetails?.sellerCompanyAddressUrl || '';
        const companyPhone = companyDetails?.sellerCompanyPhone || '';
        const companyEmail = companyDetails?.sellerCompanyEmail || '';
        const companyInstagram = companyDetails?.sellerCompanyInstagram || '';
        const companyTikTok = companyDetails?.sellerCompanyTikTok || '';
        const companyTwitter = companyDetails?.sellerCompanyTwitter || '';
        const companyFacebook = companyDetails?.sellerCompanyFacebook || '';
        const companyYouTube = companyDetails?.sellerCompanyYouTube || '';

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
                        <button class="account-tab" data-tab="seller-company-data">
                            <i data-lucide="handshake" class="account-tab-icon"></i>
                            <span class="tab-text">بيانات البائع</span>
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

                        <div id="seller-company-data-view" class="tab-view">
                            <div class="account-card">
                                <div class="card-body scrollable-container">
                                    <form id="seller-company-form">
                                        <div class="info-row profile-image-row">
                                            <div class="info-label">
                                                <i data-lucide="image" class="info-icon"></i>
                                                <span>لوجو البائع</span>
                                            </div>
                                            <div class="info-value">
                                                <div class="company-image-upload-wrapper">
                                                    <input type="file" id="company-logo-input" accept="image/*" style="display: none;">
                                                    <div class="company-image-preview" id="company-logo-preview" style="cursor: pointer;">
                                                        ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo">` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="info-row profile-image-row">
                                            <div class="info-label">
                                                <i data-lucide="image" class="info-icon"></i>
                                                <span>بانر البائع</span>
                                            </div>
                                            <div class="info-value">
                                                <div class="company-image-upload-wrapper">
                                                    <input type="file" id="company-banner-input" accept="image/*" style="display: none;">
                                                    <div class="company-image-preview" id="company-banner-preview" style="cursor: pointer;">
                                                        ${companyBanner ? `<img src="${companyBanner}" alt="Company Banner">` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="file-text" class="info-icon"></i>
                                                <span>وصف البائع</span>
                                            </div>
                                            <div class="info-value">
                                                <textarea class="form-textarea" id="company-description-input" 
                                                          placeholder="أدخل وصف البائع..." 
                                                          rows="4">${companyDescription}</textarea>
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="map-pin" class="info-icon"></i>
                                                <span>عنوان البائع</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="text" class="form-input" id="company-address-input" 
                                                       placeholder="مثال: الرياض - النرجس" 
                                                       value="${companyAddress}">
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="link" class="info-icon"></i>
                                                <span>رابط العنوان (خرائط جوجل)</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="url" class="form-input" id="company-address-url-input" 
                                                       placeholder="https://maps.app.goo.gl/..." 
                                                       value="${companyAddressUrl}">
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="phone" class="info-icon"></i>
                                                <span>رقم الهاتف</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="tel" class="form-input" id="company-phone-input" 
                                                       placeholder="0557894321" 
                                                       value="${companyPhone}">
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="mail" class="info-icon"></i>
                                                <span>البريد الإلكتروني</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="email" class="form-input" id="company-email-input" 
                                                       placeholder="info@example.com" 
                                                       value="${companyEmail}">
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="instagram" class="info-icon"></i>
                                                <span>رابط الإنستقرام</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="url" class="form-input" id="company-instagram-input" 
                                                       placeholder="https://www.instagram.com/username/" 
                                                       value="${companyInstagram}">
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="music" class="info-icon"></i>
                                                <span>رابط التيك توك</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="url" class="form-input" id="company-tiktok-input" 
                                                       placeholder="https://www.tiktok.com/@username" 
                                                       value="${companyTikTok}">
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="twitter" class="info-icon"></i>
                                                <span>رابط التويتر</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="url" class="form-input" id="company-twitter-input" 
                                                       placeholder="https://x.com/username" 
                                                       value="${companyTwitter}">
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="facebook" class="info-icon"></i>
                                                <span>رابط الفيس بوك</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="url" class="form-input" id="company-facebook-input" 
                                                       placeholder="https://www.facebook.com/username" 
                                                       value="${companyFacebook}">
                                            </div>
                                        </div>
                                        <div class="info-row seller-company-info-row">
                                            <div class="info-label">
                                                <i data-lucide="youtube" class="info-icon"></i>
                                                <span>رابط اليوتيوب</span>
                                            </div>
                                            <div class="info-value">
                                                <input type="url" class="form-input" id="company-youtube-input" 
                                                       placeholder="https://www.youtube.com/@username" 
                                                       value="${companyYouTube}">
                                            </div>
                                        </div>
                                        <button type="button" class="edit-btn" id="save-company-data-btn">
                                            <i data-lucide="save" class="edit-icon"></i>
                                            <span>حفظ التغييرات</span>
                                        </button>
                                    </form>
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

        const sellerCompanyHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('بيانات البائع', 'seller-company-data')
            : `<div class="account-tabs-header" id="card-header-addresses" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">بيانات البائع</h2>
            </div>`;

        headersContainer.innerHTML = profilePageTitle + accountTabsHeader + basicDataHeader + contactInfoHeader + addressesHeader + sellerCompanyHeader;

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

    /**
     * Auto-resize textarea and input elements based on content
     */
    function initAutoResize() {
        const autoResizeElements = document.querySelectorAll('.seller-company-info-row .form-input, .seller-company-info-row .form-textarea');

        autoResizeElements.forEach(element => {
            // Set data attribute for styling
            element.setAttribute('data-auto-resize', 'true');

            // Function to resize
            const resize = () => {
                element.style.height = 'auto';
                const scrollHeight = element.scrollHeight;
                element.style.height = scrollHeight + 'px';
            };

            // Resize on input
            element.addEventListener('input', resize);

            // Initial resize
            resize();
        });
    }



    /**
     * Initialize image upload handlers
     */
    function initImageUploads() {
        // Logo upload
        const logoInput = document.getElementById('company-logo-input');
        const logoPreview = document.getElementById('company-logo-preview');

        if (logoInput && logoPreview) {
            // Check if already initialized
            if (logoPreview.hasAttribute('data-listener-attached')) {
                return;
            }

            // Make preview clickable to trigger file input
            logoPreview.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                logoInput.click();
            });

            // Handle file selection
            logoInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Company Logo';
                        logoPreview.innerHTML = '';
                        logoPreview.classList.remove('empty');
                        logoPreview.appendChild(img);

                        // Store the data URL for saving
                        logoInput.dataset.dataUrl = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Mark as initialized
            logoPreview.setAttribute('data-listener-attached', 'true');
            logoInput.setAttribute('data-listener-attached', 'true');
        }

        // Banner upload
        const bannerInput = document.getElementById('company-banner-input');
        const bannerPreview = document.getElementById('company-banner-preview');

        if (bannerInput && bannerPreview) {
            // Check if already initialized
            if (bannerPreview.hasAttribute('data-listener-attached')) {
                return;
            }

            // Make preview clickable to trigger file input
            bannerPreview.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                bannerInput.click();
            });

            // Handle file selection
            bannerInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Company Banner';
                        bannerPreview.innerHTML = '';
                        bannerPreview.classList.remove('empty');
                        bannerPreview.appendChild(img);

                        // Store the data URL for saving
                        bannerInput.dataset.dataUrl = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Mark as initialized
            bannerPreview.setAttribute('data-listener-attached', 'true');
            bannerInput.setAttribute('data-listener-attached', 'true');
        }
    }


    /**
     * Initialize save functionality for company data
     */
    function initCompanyDataSave() {
        const saveBtn = document.getElementById('save-company-data-btn');
        if (!saveBtn) return;

        // Remove existing listener if any by cloning
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Disable button during save
            newSaveBtn.disabled = true;
            const originalText = newSaveBtn.querySelector('span')?.textContent || 'حفظ التغييرات';
            const span = newSaveBtn.querySelector('span');
            if (span) span.textContent = 'جاري الحفظ...';

            try {
                // Collect form values
                const logoInput = document.getElementById('company-logo-input');
                const bannerInput = document.getElementById('company-banner-input');

                const companyData = {
                    sellerCompanyLogo: logoInput?.dataset.dataUrl || logoInput?.value || document.getElementById('company-logo-preview')?.querySelector('img')?.src || '',
                    sellerCompanyBanner: bannerInput?.dataset.dataUrl || bannerInput?.value || document.getElementById('company-banner-preview')?.querySelector('img')?.src || '',
                    sellerCompanyDescription: document.getElementById('company-description-input')?.value.trim() || '',
                    sellerCompanyAddress: document.getElementById('company-address-input')?.value.trim() || '',
                    sellerCompanyAddressUrl: document.getElementById('company-address-url-input')?.value.trim() || '',
                    sellerCompanyPhone: document.getElementById('company-phone-input')?.value.trim() || '',
                    sellerCompanyEmail: document.getElementById('company-email-input')?.value.trim() || '',
                    sellerCompanyInstagram: document.getElementById('company-instagram-input')?.value.trim() || '',
                    sellerCompanyTikTok: document.getElementById('company-tiktok-input')?.value.trim() || '',
                    sellerCompanyTwitter: document.getElementById('company-twitter-input')?.value.trim() || '',
                    sellerCompanyFacebook: document.getElementById('company-facebook-input')?.value.trim() || '',
                    sellerCompanyYouTube: document.getElementById('company-youtube-input')?.value.trim() || ''
                };

                // Save to localStorage
                localStorage.setItem('sellerCompanyDetails', JSON.stringify(companyData));

                // Update in-memory cache
                const currentData = await fetchUserData();
                if (currentData) {
                    if (!currentData.sellerCompanyDetails || currentData.sellerCompanyDetails.length === 0) {
                        currentData.sellerCompanyDetails = [companyData];
                    } else {
                        currentData.sellerCompanyDetails[0] = { ...currentData.sellerCompanyDetails[0], ...companyData };
                    }
                    userData = currentData;
                }

                // Show success message
                if (typeof window.showToastMessage === 'function') {
                    window.showToastMessage('تم حفظ البيانات بنجاح', 2000);
                } else {
                    alert('تم حفظ البيانات بنجاح');
                }
                console.log('Company data saved:', companyData);
            } catch (error) {
                console.error('Error saving company data:', error);
                if (typeof window.showToastMessage === 'function') {
                    window.showToastMessage('حدث خطأ أثناء حفظ البيانات', 2000);
                } else {
                    alert('حدث خطأ أثناء حفظ البيانات');
                }
            } finally {
                // Re-enable button
                newSaveBtn.disabled = false;
                if (span) span.textContent = originalText;
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

        // Initialize auto-resize and image uploads
        setTimeout(() => {
            initAutoResize();
            initImageUploads();
            initCompanyDataSave();

            // Reinitialize Lucide icons after image upload buttons are added
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);

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
                            initAutoResize();
                            initImageUploads();
                            initCompanyDataSave();

                            // Reinitialize Lucide icons
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }
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
                initAutoResize();
                initImageUploads();
                initCompanyDataSave();

                // Reinitialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
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