/**
 * Profile Components and Navigation
 * 
 * This file handles:
 * - Profile menu rendering and navigation
 * - Switching between profile views (Menu, Account Info, Settings, Favorites)
 * - Creating profile menu items and sections
 * - Handling profile-related user interactions
 * 
 * HOW IT WORKS:
 * 1. When you click a menu item, it triggers either a route or an action
 * 2. Routes directly navigate to a view (like account-info)
 * 3. Actions are handled by handleMenuAction() which then navigates
 * 4. The navigateToProfileRoute() function shows/hides the correct views
 */

(function () {
    'use strict';

    // ============================================================================
    // STEP 1: DEFINE THE ROUTES (like pages in the profile section)
    // ============================================================================
    /**
     * These are the different "pages" you can navigate to within the profile section
     * Think of them like different screens in a mobile app
     */
    const ProfileRoutes = {
        MENU: 'menu',              // The main menu with all options
        ACCOUNT_INFO: 'account-info',  // Account information tabs
        SETTINGS: 'settings',       // Settings page
        FAVORITES: 'favorites',    // Favorites page
        POLICY_TERMS: 'policy-terms',  // Policy Terms / Privacy Policy page
        HELP_CENTER: 'help-center'  // Help Center page
    };

    // ============================================================================
    // STEP 2: TRACK THE CURRENT STATE
    // ============================================================================
    // Remember which page we're currently on
    let currentProfileRoute = ProfileRoutes.MENU;

    // Prevent navigation loops (if we're already navigating, don't navigate again)
    let isNavigatingProfileRoute = false;

    // ============================================================================
    // STEP 3: REUSABLE PAGE CONFIGS (for single-view pages)
    // ============================================================================
    /**
     * These configs describe simple single-view pages inside the profile section.
     * Each entry defines:
     *  - headerId: the header element to show
     *  - viewId: the view container to activate
     *  - hash: the URL hash to set
     *  - init: optional initializer for that page
     */
    const profileSinglePages = {
        [ProfileRoutes.FAVORITES]: {
            headerId: 'favorites-header',
            viewId: 'profile-favorites-view',
            hash: '#/profile/favorites',
            historyDelay: 400,
            init: () => {
                if (typeof window.FavoritesPage !== 'undefined' && typeof window.FavoritesPage.init === 'function') {
                    setTimeout(() => {
                        window.FavoritesPage.init();
                        if (typeof window.FavoritesPage.updateHeaderPosition === 'function') {
                            window.FavoritesPage.updateHeaderPosition();
                        }
                    }, 100);
                }
            }
        },
        [ProfileRoutes.SETTINGS]: {
            headerId: 'settings-header',
            viewId: 'profile-settings-view',
            hash: '#/profile/settings',
            historyDelay: 400,
            init: () => {
                if (typeof window.SettingsPage !== 'undefined' && typeof window.SettingsPage.init === 'function') {
                    setTimeout(() => {
                        window.SettingsPage.init();
                    }, 100);
                }
            }
        },
        [ProfileRoutes.POLICY_TERMS]: {
            headerId: 'policy-terms-header',
            viewId: 'policy-terms-view',
            hash: '#/profile/policy-terms',
            historyDelay: 400,
            init: () => {
                if (typeof window.PolicyTermsPage !== 'undefined') {
                    // Check if we need to render content based on last action
                    const lastAction = window.PolicyTermsPage.getLastContentType ? window.PolicyTermsPage.getLastContentType() : 'terms';
                    if (typeof window.PolicyTermsPage.renderPolicyTermsView === 'function') {
                        window.PolicyTermsPage.renderPolicyTermsView(lastAction);
                    }
                    if (typeof window.PolicyTermsPage.init === 'function') {
                        setTimeout(() => {
                            window.PolicyTermsPage.init();
                        }, 100);
                    }
                }
            }
        },
        [ProfileRoutes.HELP_CENTER]: {
            headerId: 'help-center-header',
            viewId: 'help-center-view',
            hash: '#/profile/help-center',
            historyDelay: 400,
            init: () => {
                if (typeof window.HelpCenterPage !== 'undefined') {
                    if (typeof window.HelpCenterPage.renderHelpCenterView === 'function') {
                        window.HelpCenterPage.renderHelpCenterView();
                    }
                    if (typeof window.HelpCenterPage.init === 'function') {
                        setTimeout(() => {
                            window.HelpCenterPage.init();
                        }, 100);
                    }
                }
            }
        }
        // Future pages (start-auction, add-property, manage-properties) can be added here
    };

    // ============================================================================
    // STEP 4: SMALL HELPERS TO REDUCE DUPLICATION
    // ============================================================================
    function setProfileSectionVisible(profileSection) {
        if (!profileSection) return;
        profileSection.classList.add('active');
        profileSection.style.display = 'block';
        profileSection.style.visibility = 'visible';
        profileSection.style.opacity = '1';
        profileSection.style.pointerEvents = 'auto';
        profileSection.style.transform = 'translateX(0)';
    }

    function hideAllHeaders(keepIds = []) {
        const keepSet = new Set(keepIds);
        const accountTabsHeader = document.getElementById('account-tabs-header');
        if (accountTabsHeader && !keepSet.has(accountTabsHeader.id)) {
            accountTabsHeader.style.display = 'none';
        }

        // Hide all card headers
        document.querySelectorAll('.account-tabs-header').forEach(header => {
            if (header.id && header.id.startsWith('card-header-') && !keepSet.has(header.id)) {
                header.style.display = 'none';
            }
        });

        // Hide settings, favorites, and policy-terms headers if not kept
        const settingsHeader = document.getElementById('settings-header');
        if (settingsHeader && !keepSet.has(settingsHeader.id)) {
            settingsHeader.style.display = 'none';
        }
        const favoritesHeader = document.getElementById('favorites-header');
        if (favoritesHeader && !keepSet.has(favoritesHeader.id)) {
            favoritesHeader.style.display = 'none';
        }
        const policyTermsHeader = document.getElementById('policy-terms-header');
        if (policyTermsHeader && !keepSet.has(policyTermsHeader.id)) {
            policyTermsHeader.style.display = 'none';
        }
        const helpCenterHeader = document.getElementById('help-center-header');
        if (helpCenterHeader && !keepSet.has(helpCenterHeader.id)) {
            helpCenterHeader.style.display = 'none';
        }
    }

    function hideSecondaryViews(exceptViewId) {
        const settingsView = document.getElementById('profile-settings-view');
        const favoritesView = document.getElementById('profile-favorites-view');
        const policyTermsView = document.getElementById('policy-terms-view');

        if (settingsView && settingsView.id !== exceptViewId) {
            settingsView.classList.remove('active');
        }
        if (favoritesView && favoritesView.id !== exceptViewId) {
            favoritesView.classList.remove('active');
        }
        if (policyTermsView && policyTermsView.id !== exceptViewId) {
            policyTermsView.classList.remove('active');
        }
        const helpCenterView = document.getElementById('help-center-view');
        if (helpCenterView && helpCenterView.id !== exceptViewId) {
            helpCenterView.classList.remove('active');
        }
    }

    function showSingleProfilePage(route, config, { menuView, accountInfoView, profileSection }) {
        // Ensure the profile section is visible
        setProfileSectionVisible(profileSection);

        // Hide the main profile title
        const profilePageTitle = document.querySelector('.profile-page-title');
        if (profilePageTitle) {
            profilePageTitle.style.display = 'none';
        }

        // Hide other headers and show only the target header
        hideAllHeaders([config.headerId]);
        const header = document.getElementById(config.headerId);
        if (header) {
            header.style.display = 'flex';
        }

        // Hide other views
        if (menuView) menuView.classList.remove('active');
        if (accountInfoView) accountInfoView.classList.remove('active');
        hideSecondaryViews(config.viewId);

        // Also hide help-center-view if not the target
        const helpCenterView = document.getElementById('help-center-view');
        if (helpCenterView && helpCenterView.id !== config.viewId) {
            helpCenterView.classList.remove('active');
        }

        // Show the target view
        const targetView = document.getElementById(config.viewId);
        if (targetView) {
            targetView.classList.add('active');
            currentProfileRoute = route;
            window.location.hash = config.hash;

            // Scroll scrollable containers to top immediately (synchronously, before any rendering)
            // This ensures the scroll happens before the browser paints, making it invisible
            if (typeof window.scrollScrollableContainersToTop === 'function') {
                // Scroll immediately (synchronously) - this happens before browser paint
                window.scrollScrollableContainersToTop(config.viewId);

                // Also scroll in the next frame to catch any containers that become visible
                // This is still invisible because it happens before paint
                requestAnimationFrame(() => {
                    window.scrollScrollableContainersToTop(config.viewId);
                });
            }

            // Run page initializer if provided
            if (typeof config.init === 'function') {
                config.init();
            }

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            }
        } else {
            console.error('[Navigation] View not found for route:', route);
        }

        // Push navigation state to history
        setTimeout(() => {
            if (typeof window.pushNavigationState === 'function') {
                window.pushNavigationState(false);
            }
            isNavigatingProfileRoute = false;
        }, config.historyDelay || 400);
    }

    // ============================================================================
    // STEP 5: FUNCTIONS TO CREATE HTML ELEMENTS
    // ============================================================================

    /**
     * Creates the profile header (shows user name and profile picture)
     * @param {Object} userData - User information from JSON file
     * @returns {string} HTML code for the header
     */
    function createProfileHeader(userData) {
        // Get the user's name, or use default if not found
        const name = userData?.fullName || userData?.name || 'المستخدم';

        // Get the profile image URL, or null if not found
        const imageUrl = userData?.imageUrl || userData?.image || userData?.avatar || null;

        // Build the HTML string
        const headerHTML = `
            <div class="profile-header-card">
                <h2 class="profile-name">${name}</h2>
                <div class="profile-image-wrapper">
                    <div class="profile-image" id="profile-menu-image">
                        ${imageUrl
                ? `<img src="${imageUrl}" alt="صورة الملف الشخصي" onerror="this.onerror=null; this.style.display='none'; const placeholder = this.nextElementSibling; if(placeholder) placeholder.style.display='block';">`
                : ''}
                        <i class="fas fa-user profile-image-placeholder" ${imageUrl ? 'style="display:none;"' : ''}></i>
                    </div>
                </div>
            </div>
        `;

        return headerHTML;
    }

    /**
     * Creates the "حسابي" title that appears at the top of the profile menu
     * @returns {string} HTML code for the title
     */
    function createProfilePageTitle() {
        return `<h1 class="profile-page-title">حسابي</h1>`;
    }

    /**
     * Creates the header for the account info page
     * This header has a back button and "معلومات الحساب" title
     * @returns {string} HTML code for the header
     */
    function createAccountTabsHeader() {
        return `
            <div class="account-tabs-header" id="account-tabs-header" style="display: none;">
                <button class="back-to-profile-btn" id="back-to-profile-btn"
                    aria-label="العودة إلى القائمة">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">معلومات الحساب</h2>
            </div>
        `;
    }

    /**
     * Creates a header for a specific tab (like "البيانات الأساسية")
     * @param {string} title - The title to show (e.g., "البيانات الأساسية")
     * @param {string} tabId - Unique ID for this tab (e.g., "basic-data")
     * @returns {string} HTML code for the header
     */
    function createCardHeader(title, tabId) {
        return `
            <div class="account-tabs-header" id="card-header-${tabId}" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">${title}</h2>
            </div>
        `;
    }

    /**
     * Creates a single menu item (like "معلومات الحساب" or "الإعدادات")
     * @param {Object} item - Menu item data with icon, text, route, and action
     * @returns {string} HTML code for one menu item
     */
    function createMenuItem(item) {
        // Extract the properties from the item object
        const { icon, text, route, action } = item;

        // Check if this item does something when clicked
        const hasAction = route || action;

        // Build the HTML for this menu item
        const itemHTML = `
            <div class="menu-item" ${hasAction ? `data-route="${route || ''}" data-action="${action || ''}"` : ''}>
                <div class="menu-item-content">
                    <i data-lucide="${icon}" class="menu-item-icon"></i>
                    <span class="menu-item-text">${text}</span>
                </div>
                ${hasAction ? '<i data-lucide="chevron-left" class="menu-item-arrow"></i>' : ''}
            </div>
        `;

        return itemHTML;
    }

    /**
     * Creates a menu section (groups related menu items together)
     * For example, all "النظام" items are in one section
     * @param {Object} section - Section data with title and items array
     * @returns {string} HTML code for a menu section
     */
    function createMenuSection(section) {
        const { title, items } = section;

        // Create HTML for all items in this section
        const itemsHTML = items.map(item => createMenuItem(item)).join('');

        // Build the complete section HTML
        const sectionHTML = `
            <div class="menu-section">
                <h3 class="menu-section-title">${title}</h3>
                <div class="menu-items">
                    ${itemsHTML}
                </div>
            </div>
        `;

        return sectionHTML;
    }

    // ============================================================================
    // STEP 4: MENU CONFIGURATION (What menu items to show)
    // ============================================================================
    /**
     * This is the menu structure - all the items that appear in the profile menu
     * Each section has a title and a list of items
     * Each item has: icon (Lucide icon name), text (Arabic text), route (if it navigates), action (if it does something)
     */
    const menuConfig = [
        {
            title: 'النظام',
            items: [
                { icon: 'user', text: 'معلومات الحساب', route: ProfileRoutes.ACCOUNT_INFO },
                { icon: 'heart', text: 'المفضلة', route: null, action: 'favorites' },
                { icon: 'settings', text: 'الإعدادات', route: null, action: 'settings' }
            ]
        },
        {
            title: 'الأصول',
            items: [
                { icon: 'plus', text: 'بدأ مزاد جديد', route: null, action: 'start-auction' },
                { icon: 'plus', text: 'إضافة عقار جديد', route: null, action: 'add-property' },
                { icon: 'key', text: 'إدارة ممتلكاتي', route: null, action: 'mannage-properties' }
            ]
        },
        {
            title: 'المحفظة',
            items: [
                { icon: 'wallet', text: 'المحافظ وحساب البنك', route: null, action: 'wallet' },
                { icon: 'activity', text: 'العمليات', route: null, action: 'transactions' }
            ]
        },
        {
            title: 'التقارير',
            items: [
                { icon: 'file-text', text: 'تقارير موجز', route: null, action: 'reports' },
                { icon: 'file-check', text: 'إقراراتي', route: null, action: 'statements' }
            ]
        },
        {
            title: 'المزيد',
            items: [
                { icon: 'download', text: 'تنزيل البرنامج', route: null, action: 'install-app' },
                { icon: 'file-text', text: 'الشروط والأحكام', route: null, action: 'terms' },
                { icon: 'shield', text: 'سياسة الخصوصية', route: null, action: 'privacy' },
                { icon: 'help-circle', text: 'المساعدة', route: null, action: 'help' },
                { icon: 'log-out', text: 'تسجيل الخروج', route: null, action: 'logout' }
            ]
        }
    ];

    // ============================================================================
    // STEP 5: FUNCTIONS TO UPDATE THE PROFILE IMAGE
    // ============================================================================

    /**
     * Updates the profile image in the account info page
     * This makes sure the image shown in "البيانات الأساسية" matches the menu image
     * @param {Object} userData - User data object with image URL
     */
    function updateBasicDataProfileImage(userData) {
        // Find the image container in the account info page
        const basicDataImage = document.getElementById('basic-data-profile-image');
        if (!basicDataImage) return; // Exit if element doesn't exist

        // Get the image URL from user data
        const imageUrl = userData?.imageUrl || userData?.image || userData?.avatar || null;
        const placeholder = basicDataImage.querySelector('.profile-image-placeholder');

        // If we have an image URL, show the image
        if (imageUrl) {
            // Check if an image element already exists
            let img = basicDataImage.querySelector('img');
            if (!img) {
                // Create a new image element if it doesn't exist
                img = document.createElement('img');
                img.alt = 'صورة الملف الشخصي';
                basicDataImage.appendChild(img);
            }
            // Set the image source
            img.src = imageUrl;

            // If image fails to load, hide it and show placeholder
            img.onerror = function () {
                if (img.parentNode) {
                    img.parentNode.removeChild(img);
                }
                if (placeholder) {
                    placeholder.style.display = 'block';
                }
            };

            // Hide the placeholder when image loads successfully
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        } else {
            // No image URL, so remove any image and show placeholder
            const img = basicDataImage.querySelector('img');
            if (img) {
                img.remove();
            }
            if (placeholder) {
                placeholder.style.display = 'block';
            }
        }
    }

    // ============================================================================
    // STEP 6: FUNCTION TO RENDER THE PROFILE MENU
    // ============================================================================

    /**
     * This is the main function that displays the profile menu
     * It loads user data and creates all the menu items
     */
    async function renderProfileMenu() {
        // Find the containers where we'll put the header and menu items
        const headerContainer = document.getElementById('profile-header-container');
        const sectionsContainer = document.getElementById('profile-menu-sections');

        // Make sure the containers exist before trying to use them
        if (!headerContainer || !sectionsContainer) {
            console.error('Profile menu containers not found');
            return; // Exit early if containers don't exist
        }

        // Try to load user data from the JSON file
        let userData = null;
        try {
            const response = await fetch('json-data/user-data.json');
            if (response.ok) {
                userData = await response.json();
            }
        } catch (error) {
            // If loading fails, that's okay - we'll just use default values
            console.warn('Could not load user data:', error);
        }

        // Step 1: Put the profile header (name and image) into the header container
        headerContainer.innerHTML = createProfileHeader(userData);

        // Step 2: Create HTML for all menu sections and put them in the sections container
        const sectionsHTML = menuConfig.map(section => createMenuSection(section)).join('');
        sectionsContainer.innerHTML = sectionsHTML;

        // Step 3: Initialize Lucide icons (this makes the icons appear)
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Step 4: Update the profile image in the account info page
        updateBasicDataProfileImage(userData);

        // Step 5: Make menu items clickable by attaching event listeners
        attachMenuListeners();
    }

    // ============================================================================
    // STEP 7: FUNCTION TO MAKE MENU ITEMS CLICKABLE
    // ============================================================================

    /**
     * Attaches click event listeners to all menu items
     * When you click a menu item, it will either navigate to a route or trigger an action
     */
    function attachMenuListeners() {
        // Find all menu items that have a route or action
        const menuItems = document.querySelectorAll('.menu-item[data-route], .menu-item[data-action]');

        // Add a click listener to each menu item
        menuItems.forEach(item => {
            item.addEventListener('click', function () {
                // Get the route and action from the clicked item
                const route = this.getAttribute('data-route');
                const action = this.getAttribute('data-action');

                // If the item has a route, navigate directly to that route
                if (route) {
                    navigateToProfileRoute(route);
                }
                // If the item has an action, handle the action first
                else if (action) {
                    handleMenuAction(action);
                }
            });
        });
    }

    // ============================================================================
    // STEP 8: FUNCTION TO HANDLE MENU ACTIONS
    // ============================================================================

    /**
     * Handles what happens when you click a menu item that has an "action"
     * Some items navigate directly (they have a route), others need special handling (they have an action)
     * @param {string} action - The name of the action (like 'favorites', 'settings', 'logout')
     */
    function handleMenuAction(action) {
        // Use a switch statement to handle different actions
        switch (action) {
            case 'install-app':
                // Use the PWA installation handler from install-pwa.js
                if (typeof window.handleInstallAppAction === 'function') {
                    window.handleInstallAppAction();
                } else {
                    // Fallback if install-pwa.js hasn't loaded yet
                    console.warn('PWA installer not available yet');
                    alert('جاري تحميل نظام التثبيت... يرجى المحاولة مرة أخرى بعد لحظة.');
                }
                break;

            case 'favorites':
                navigateActionToRoute(ProfileRoutes.FAVORITES);
                // Scroll is handled in showSingleProfilePage for immediate, invisible scroll
                break;

            case 'settings':
                navigateActionToRoute(ProfileRoutes.SETTINGS);
                // Scroll is handled in showSingleProfilePage for immediate, invisible scroll
                break;

            // These actions are not implemented yet (TODO)
            case 'wallet':
                // TODO: Navigate to wallet page
                break;
            case 'transactions':
                // TODO: Navigate to transactions page
                break;
            case 'reports':
                // TODO: Navigate to reports page
                break;
            case 'statements':
                // TODO: Navigate to statements page
                break;
            case 'terms':
                // Show terms and conditions
                if (typeof window.PolicyTermsPage !== 'undefined' && typeof window.PolicyTermsPage.showTermsAndConditions === 'function') {
                    window.PolicyTermsPage.showTermsAndConditions();
                }
                navigateActionToRoute(ProfileRoutes.POLICY_TERMS);
                // Scroll is handled in showSingleProfilePage for immediate, invisible scroll
                break;
            case 'privacy':
                // Show privacy policy
                if (typeof window.PolicyTermsPage !== 'undefined' && typeof window.PolicyTermsPage.showPrivacyPolicy === 'function') {
                    window.PolicyTermsPage.showPrivacyPolicy();
                }
                navigateActionToRoute(ProfileRoutes.POLICY_TERMS);
                // Scroll is handled in showSingleProfilePage for immediate, invisible scroll
                break;
            case 'help':
                navigateActionToRoute(ProfileRoutes.HELP_CENTER);
                // Scroll is handled in showSingleProfilePage for immediate, invisible scroll
                break;

            case 'logout':
                // User clicked "تسجيل الخروج"
                // Ask for confirmation before logging out
                if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                    // TODO: Implement logout logic here
                }
                break;

            default:
                // If we get an unknown action, log a warning
                console.warn('Unknown action:', action);
        }
    }

    /**
     * Shared helper to navigate to a profile route triggered from a menu action.
     * Ensures the profile section is active before navigating.
     */
    function navigateActionToRoute(targetRoute) {
        const profileSection = document.getElementById('profile-section');

        // If profile section is not active, switch to it first, then navigate
        if (profileSection && !profileSection.classList.contains('active')) {
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('profile-section');
                setTimeout(() => {
                    navigateToProfileRoute(targetRoute);
                }, 300);
            } else {
                navigateToProfileRoute(targetRoute);
            }
        } else {
            navigateToProfileRoute(targetRoute);
        }
    }


    // ============================================================================
    // STEP 9: MAIN NAVIGATION FUNCTION
    // ============================================================================

    /**
     * This is the most important function - it switches between different profile views
     * Think of it like changing channels on a TV - it shows one view and hides the others
     * @param {string} route - Which view to show (menu, account-info, settings, or favorites)
     */
    function navigateToProfileRoute(route) {
        // Safety check: Don't navigate if we're already navigating (prevents loops)
        if (isNavigatingProfileRoute) {
            return;
        }

        // Safety check: Don't navigate if we're already on that route
        if (currentProfileRoute === route) {
            return;
        }

        // Set flag to prevent other navigation calls
        isNavigatingProfileRoute = true;

        // Tell other parts of the app that we're navigating within profile
        if (typeof window.setNavigatingWithinProfile === 'function') {
            window.setNavigatingWithinProfile(true);
        }

        // Get references to the main view containers
        const menuView = document.getElementById('profile-menu-view');
        const accountInfoView = document.getElementById('profile-account-info-view');

        // Make sure the views exist
        if (!menuView || !accountInfoView) {
            console.error('Profile views not found');
            isNavigatingProfileRoute = false;
            return;
        }


        // Get the profile section element (we'll use it in multiple places)
        const profileSection = document.getElementById('profile-section');

        // ========================================================================
        // Now handle each route type:
        // ========================================================================

        // ROUTE 1: Navigate to Account Info page
        if (route === ProfileRoutes.ACCOUNT_INFO) {
            // Show the account tabs header
            const accountTabsHeader = document.getElementById('account-tabs-header');
            if (accountTabsHeader) {
                accountTabsHeader.style.display = 'flex';
            }

            // Hide the profile page title
            const profilePageTitle = document.querySelector('.profile-page-title');
            if (profilePageTitle) {
                profilePageTitle.style.display = 'none';
            }

            // Hide all card headers (individual tab headers)
            document.querySelectorAll('.account-tabs-header').forEach(header => {
                if (header.id && header.id.startsWith('card-header-')) {
                    header.style.display = 'none';
                }
            });

            // Show the account info view and hide the menu view
            menuView.classList.remove('active');
            accountInfoView.classList.add('active');
            currentProfileRoute = route;

            // Update the URL in the browser
            window.location.hash = '#/profile/account-info';

            // Reset the account tabs (show tabs, hide individual tab views)
            const accountTabs = document.querySelector('.account-tabs');
            const tabViews = document.querySelectorAll('.tab-view');

            // Hide all tab views
            tabViews.forEach(view => {
                view.classList.remove('active');
            });

            // Show the account tabs container
            if (accountTabs) {
                accountTabs.classList.remove('hidden');
                // Remove active state from all tabs
                const tabs = accountTabs.querySelectorAll('.account-tab');
                tabs.forEach(tab => tab.classList.remove('active'));
            }

            // Update sticky header positions (for proper scrolling)
            if (typeof window.AccountInfoTabs !== 'undefined' && typeof window.AccountInfoTabs.updateStickyPositions === 'function') {
                window.AccountInfoTabs.updateStickyPositions();
            }

            // Initialize account tabs functionality
            if (typeof window.AccountInfoTabs !== 'undefined' && typeof window.AccountInfoTabs.initAccountTabs === 'function') {
                setTimeout(() => {
                    window.AccountInfoTabs.initAccountTabs();
                }, 100);
            }

            // Update browser history after navigation completes
            setTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
                isNavigatingProfileRoute = false;
            }, 300);
        }

        // ROUTE 2: Navigate to Favorites page (single-page helper)
        else if (route === ProfileRoutes.FAVORITES && profileSinglePages[ProfileRoutes.FAVORITES]) {
            showSingleProfilePage(ProfileRoutes.FAVORITES, profileSinglePages[ProfileRoutes.FAVORITES], {
                menuView,
                accountInfoView,
                profileSection
            });
        }

        // ROUTE 3: Navigate to Settings page (single-page helper)
        else if (route === ProfileRoutes.SETTINGS && profileSinglePages[ProfileRoutes.SETTINGS]) {
            showSingleProfilePage(ProfileRoutes.SETTINGS, profileSinglePages[ProfileRoutes.SETTINGS], {
                menuView,
                accountInfoView,
                profileSection
            });
        }

        // ROUTE 4: Navigate to Policy Terms page (single-page helper)
        else if (route === ProfileRoutes.POLICY_TERMS && profileSinglePages[ProfileRoutes.POLICY_TERMS]) {
            showSingleProfilePage(ProfileRoutes.POLICY_TERMS, profileSinglePages[ProfileRoutes.POLICY_TERMS], {
                menuView,
                accountInfoView,
                profileSection
            });
        }

        // ROUTE 5: Navigate to Help Center page (single-page helper)
        else if (route === ProfileRoutes.HELP_CENTER && profileSinglePages[ProfileRoutes.HELP_CENTER]) {
            showSingleProfilePage(ProfileRoutes.HELP_CENTER, profileSinglePages[ProfileRoutes.HELP_CENTER], {
                menuView,
                accountInfoView,
                profileSection
            });
        }

        // ROUTE 4: Navigate back to Menu
        else if (route === ProfileRoutes.MENU) {
            // Show the profile page title
            const profilePageTitle = document.querySelector('.profile-page-title');
            if (profilePageTitle) {
                profilePageTitle.style.display = 'block';
            }

            // Hide all headers (none should be visible on the menu)
            hideAllHeaders();



            // Hide all other views
            const settingsView = document.getElementById('profile-settings-view');
            if (settingsView) {
                settingsView.classList.remove('active');
            }
            const favoritesView = document.getElementById('profile-favorites-view');
            if (favoritesView) {
                favoritesView.classList.remove('active');
            }
            const termsAndConditionsView = document.getElementById('policy-terms-view');
            if (termsAndConditionsView) {
                termsAndConditionsView.classList.remove('active');
            }
            const helpCenterView = document.getElementById('help-center-view');
            if (helpCenterView) {
                helpCenterView.classList.remove('active');
            }




            accountInfoView.classList.remove('active');

            // Show the menu view
            menuView.classList.add('active');
            currentProfileRoute = route;

            // Make sure profile section is active
            if (profileSection) {
                profileSection.classList.add('active');
                profileSection.style.display = 'block';
                profileSection.style.visibility = 'visible';
                profileSection.style.opacity = '1';
                profileSection.style.pointerEvents = 'auto';
                profileSection.style.transform = 'translateX(0)';
            }

            // Update sticky header positions
            if (typeof window.AccountInfoTabs !== 'undefined' && typeof window.AccountInfoTabs.updateStickyPositions === 'function') {
                window.AccountInfoTabs.updateStickyPositions();
            }

            // Reset account info tabs to initial state
            const accountTabs = document.querySelector('.account-tabs');
            const tabViews = document.querySelectorAll('.tab-view');

            if (accountTabs) {
                accountTabs.classList.remove('hidden');
            }

            tabViews.forEach(view => {
                view.classList.remove('active');
            });

            // Update the URL
            window.location.hash = '#/profile';

            // Update browser history
            setTimeout(() => {
                // Double-check profile section is active
                const profileSectionCheck = document.getElementById('profile-section');
                if (profileSectionCheck && !profileSectionCheck.classList.contains('active')) {
                    profileSectionCheck.classList.add('active');
                }

                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
                isNavigatingProfileRoute = false;

                // Clear the navigation flag after a delay
                setTimeout(() => {
                    if (typeof window.setNavigatingWithinProfile === 'function') {
                        window.setNavigatingWithinProfile(false);
                    }
                }, 100);
            }, 300);
        } else {
            // Unknown route - reset the navigation flag
            isNavigatingProfileRoute = false;
            if (typeof window.setNavigatingWithinProfile === 'function') {
                window.setNavigatingWithinProfile(false);
            }
        }
    }

    // ============================================================================
    // STEP 10: INITIALIZE CLOSE BUTTON
    // ============================================================================

    /**
     * Sets up the close button (if it exists) to go back to the menu
     */
    function initCloseButton() {
        const closeBtn = document.getElementById('profile-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                navigateToProfileRoute(ProfileRoutes.MENU);
            });
        }
    }

    // ============================================================================
    // STEP 11: HANDLE BROWSER NAVIGATION (Back button, URL changes)
    // ============================================================================

    /**
     * Sets up listeners for browser back button and URL hash changes
     * This makes the browser's back button work correctly with our navigation
     */
    function initBrowserNavigation() {
        // Listen for URL hash changes (when user clicks back/forward or URL changes)
        window.addEventListener('hashchange', function () {
            // Don't handle if we're already navigating (prevents loops)
            if (isNavigatingProfileRoute) {
                return;
            }

            // Get the current hash from the URL
            const hash = window.location.hash;

            // Navigate to the correct route based on the hash
            if (hash === '#/profile' || hash === '#/profile/' || !hash.includes('/profile')) {
                navigateToProfileRoute(ProfileRoutes.MENU);
            } else if (hash === '#/profile/account-info') {
                navigateToProfileRoute(ProfileRoutes.ACCOUNT_INFO);
            } else if (hash === '#/profile/settings') {
                navigateToProfileRoute(ProfileRoutes.SETTINGS);
            } else if (hash === '#/profile/favorites') {
                navigateToProfileRoute(ProfileRoutes.FAVORITES);
            } else if (hash === '#/profile/policy-terms') {
                navigateToProfileRoute(ProfileRoutes.POLICY_TERMS);
            } else if (hash === '#/profile/help-center') {
                navigateToProfileRoute(ProfileRoutes.HELP_CENTER);
            }
        });

        // Handle initial hash when page first loads
        const hash = window.location.hash;
        if (hash === '#/profile/account-info') {
            // If page loads with account-info hash, show account info
            setTimeout(() => {
                navigateToProfileRoute(ProfileRoutes.ACCOUNT_INFO);
            }, 100);
        }

        // Listen for browser back/forward button (popstate event)
        window.addEventListener('popstate', function (event) {
            const hash = window.location.hash;
            // Navigate based on the hash
            if (hash === '#/profile' || hash === '#/profile/' || !hash.includes('/profile')) {
                navigateToProfileRoute(ProfileRoutes.MENU);
            } else if (hash === '#/profile/account-info') {
                navigateToProfileRoute(ProfileRoutes.ACCOUNT_INFO);
            } else if (hash === '#/profile/settings') {
                navigateToProfileRoute(ProfileRoutes.SETTINGS);
            } else if (hash === '#/profile/favorites') {
                navigateToProfileRoute(ProfileRoutes.FAVORITES);
            } else if (hash === '#/profile/policy-terms') {
                navigateToProfileRoute(ProfileRoutes.POLICY_TERMS);
            } else if (hash === '#/profile/help-center') {
                navigateToProfileRoute(ProfileRoutes.HELP_CENTER);
            }
        });

        // Handle Android back button (for mobile apps)
        if (typeof document.addEventListener !== 'undefined') {
            document.addEventListener('backbutton', function (event) {
                // If we're on account-info, settings, favorites, or policy-terms, go back to menu
                if (currentProfileRoute === ProfileRoutes.ACCOUNT_INFO ||
                    currentProfileRoute === ProfileRoutes.SETTINGS ||
                    currentProfileRoute === ProfileRoutes.FAVORITES ||
                    currentProfileRoute === ProfileRoutes.POLICY_TERMS ||
                    currentProfileRoute === ProfileRoutes.HELP_CENTER) {
                    // Go back to menu
                    navigateToProfileRoute(ProfileRoutes.MENU);
                    if (event && event.preventDefault) {
                        event.preventDefault();
                    }
                }
            }, false);
        }
    }

    // ============================================================================
    // STEP 12: INITIALIZE THE ENTIRE PROFILE SYSTEM
    // ============================================================================

    /**
     * This is the main initialization function
     * It sets up everything when the page loads
     */
    function initProfileSystem() {
        // Check if profile section exists
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) {
            return; // Exit if profile section doesn't exist
        }

        // Step 1: Render the profile menu
        renderProfileMenu();

        // Step 2: Set up the close button
        initCloseButton();

        // Step 3: Set up browser navigation handlers
        initBrowserNavigation();

        // Step 4: Watch for when profile section becomes active
        // This re-renders the menu when you navigate to the profile section
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                // Check if the 'class' attribute changed
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = profileSection.classList.contains('active');
                    if (isActive) {
                        // If profile section is now active, check if we need to re-render menu
                        const menuView = document.getElementById('profile-menu-view');
                        if (menuView && menuView.classList.contains('active') && currentProfileRoute === ProfileRoutes.MENU) {
                            // Re-render menu to make sure icons are initialized
                            setTimeout(() => {
                                renderProfileMenu();
                            }, 100);
                        }
                    }
                }
            });
        });

        // Start watching the profile section for changes
        observer.observe(profileSection, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // ============================================================================
    // STEP 13: START EVERYTHING WHEN PAGE LOADS
    // ============================================================================

    // Wait for the page to finish loading, then initialize
    if (document.readyState === 'loading') {
        // Page is still loading, wait for it to finish
        document.addEventListener('DOMContentLoaded', () => {
            initProfileSystem();
        });
    } else {
        // Page is already loaded, initialize immediately
        initProfileSystem();
    }

    // ============================================================================
    // STEP 14: EXPORT FUNCTIONS FOR OTHER FILES TO USE
    // ============================================================================

    /**
     * Export ProfileNavigation object
     * Other files can use this to navigate between profile routes
     * Example: window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.SETTINGS)
     */
    window.ProfileNavigation = {
        navigateTo: navigateToProfileRoute,
        routes: ProfileRoutes
    };

    /**
     * Export header creation functions
     * Other files can use these to create headers dynamically
     */
    window.createProfilePageTitle = createProfilePageTitle;
    window.createAccountTabsHeader = createAccountTabsHeader;
    window.createCardHeader = createCardHeader;
})();
