/**
 * Browser History Management
 * Handles browser back button and URL history for navigation
 * This makes the back button work correctly when switching sections
 */

(function () {
    'use strict';

    // Track if we're currently handling a back navigation
    // This prevents infinite loops
    let isHandlingBackNavigation = false;

    // Track if we're navigating within profile section
    // This prevents unwanted section switches
    let isNavigatingWithinProfile = false;

    /**
     * Get the current navigation state
     * Returns which section and route the user is currently on
     */
    function getCurrentState() {
        // Find the currently active section
        let activeSection = document.querySelector('.tab-section.active');

        // Fallback: check for visible sections if no active class found
        // This handles cases where sections might be visible but not marked as active yet
        if (!activeSection) {
            const allSections = document.querySelectorAll('.tab-section');
            for (let section of allSections) {
                const style = window.getComputedStyle(section);
                if (style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    parseFloat(style.opacity) > 0 &&
                    section.id !== 'home-section') { // Exclude home-section as default
                    activeSection = section;
                    break;
                }
            }
        }

        const sectionId = activeSection ? activeSection.id : 'home-section';

        // Check if we're in the profile section and which view
        const accountInfoView = document.getElementById('profile-account-info-view');
        const menuView = document.getElementById('profile-menu-view');
        const settingsView = document.getElementById('profile-settings-view');
        let profileRoute = null;

        if (sectionId === 'profile-section') {
            if (settingsView && settingsView.classList.contains('active')) {
                profileRoute = 'settings';
            } else if (accountInfoView && accountInfoView.classList.contains('active')) {
                profileRoute = 'account-info';

                // Check if we're in a specific account tab
                const activeTabView = document.querySelector('.tab-view.active');
                if (activeTabView) {
                    const tabId = activeTabView.id.replace('-view', '');
                    return {
                        section: sectionId,
                        profileRoute: profileRoute,
                        accountTab: tabId
                    };
                }
            } else if (menuView && menuView.classList.contains('active')) {
                profileRoute = 'menu';
            }
        }

        // Check if we're in a subsection within home-section
        if (sectionId === 'home-section') {
            const auctionsSubsection = document.getElementById('auctions-section');
            const sellSubsection = document.getElementById('buy-section');
            const rentSubsection = document.getElementById('rent-section');

            // Check which subsection is visible
            if (auctionsSubsection) {
                const style = window.getComputedStyle(auctionsSubsection);
                if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) {
                    return { section: 'auction-section', subsection: true };
                }
            }
            if (sellSubsection) {
                const style = window.getComputedStyle(sellSubsection);
                if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) {
                    return { section: 'buy-section', subsection: true };
                }
            }
            if (rentSubsection) {
                const style = window.getComputedStyle(rentSubsection);
                if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) {
                    return { section: 'rent-section', subsection: true };
                }
            }
        }

        // Return the current state
        return {
            section: sectionId,
            profileRoute: profileRoute
        };
    }

    /**
     * Convert state to URL
     * Creates a URL hash based on the current navigation state
     */
    function getUrlFromState(state) {
        if (state.section === 'profile-section') {
            if (state.accountTab) {
                return `#/profile/account-info/${state.accountTab}`;
            } else if (state.profileRoute === 'account-info') {
                return '#/profile/account-info';
            } else {
                return '#/profile';
            }
        } else if (state.section === 'auction-property-detail-section') {
            return '#/auction-section/main-auction-page';
        } else if (state.section === 'auction-asset-property-detail-section') {
            return '#/auction-section/main-auction-page/auction-asset-page';
        } else if (state.section === 'auction-section' || state.section === 'buy-section' || state.section === 'rent-section') {
            return `#/${state.section}`;
        } else if (state.section === 'my-actions-section') {
            return '#/my-actions';
        } else if (state.section === 'profile-section' && state.profileRoute === 'settings') {
            return '#/profile/settings';
        }
        return '#/';
    }

    /**
     * Save current state to browser history
     * This allows the back button to work correctly
     */
    function pushHistoryState(skipPush = false) {
        // Don't push if we're handling back navigation or navigating within profile
        if (isHandlingBackNavigation || skipPush || isNavigatingWithinProfile) {
            return;
        }

        const currentState = getCurrentState();
        const stateString = JSON.stringify(currentState);
        const url = getUrlFromState(currentState);

        // Only push if state actually changed
        const previousState = history.state ? JSON.stringify(history.state) : null;
        if (previousState === stateString) {
            return;
        }

        history.pushState(currentState, '', url);
    }

    /**
     * Handle browser back button press
     * Navigates back based on current state
     */
    function handleBackNavigation() {
        if (isNavigatingWithinProfile) {
            return;
        }

        isHandlingBackNavigation = true;
        const currentState = getCurrentState();

        // If we're in an account tab detail view, go back to account info tabs
        if (currentState.accountTab) {
            if (typeof window.AccountInfoTabs !== 'undefined' && typeof window.AccountInfoTabs.goBack === 'function') {
                window.AccountInfoTabs.goBack();
                setTimeout(() => {
                    pushHistoryState(null, false);
                    isHandlingBackNavigation = false;
                }, 100);
                return;
            }
        }

        // If we're in profile settings view, go back to profile menu
        if (currentState.section === 'profile-section' && currentState.profileRoute === 'settings') {
            if (typeof window.ProfileNavigation !== 'undefined' && typeof window.ProfileNavigation.navigateTo !== 'undefined') {
                window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                setTimeout(() => {
                    pushHistoryState(null, false);
                    isHandlingBackNavigation = false;
                }, 100);
                return;
            }
        }

        // If we're in profile account info view, go back to profile menu
        if (currentState.section === 'profile-section' && currentState.profileRoute === 'account-info') {
            if (typeof window.ProfileNavigation !== 'undefined' && typeof window.ProfileNavigation.navigateTo !== 'undefined') {
                window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                setTimeout(() => {
                    pushHistoryState(null, false);
                    isHandlingBackNavigation = false;
                }, 100);
                return;
            }
        }

        // If we're in profile section, go back to home
        if (currentState.section === 'profile-section') {
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('home-section');
            } else {
                // Fallback: trigger navigation click
                const homeNavItem = document.querySelector('[data-section="home-section"]');
                if (homeNavItem) {
                    homeNavItem.click();
                }
            }
            setTimeout(() => {
                pushHistoryState(null, false);
                isHandlingBackNavigation = false;
            }, 100);
            return;
        }

        // Check if auction-asset-property-detail-section is visible (even if not in state)
        const assetDetailSection = document.getElementById('auction-asset-property-detail-section');
        const isAssetDetailVisible = assetDetailSection &&
            window.getComputedStyle(assetDetailSection).display !== 'none' &&
            window.getComputedStyle(assetDetailSection).visibility !== 'hidden' &&
            parseFloat(window.getComputedStyle(assetDetailSection).opacity) > 0;

        // If we're in auction-asset-property-detail-section, go back to auction-property-detail-section
        if (currentState.section === 'auction-asset-property-detail-section' || isAssetDetailVisible) {
            // Hide header if it exists
            const header = document.getElementById('auction-asset-property-detail-header');
            if (header) {
                header.style.display = 'none';
            }

            // Navigate back to auction-property-detail-section
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('auction-property-detail-section');

                // Update URL to match the property detail section
                setTimeout(() => {
                    const state = { section: 'auction-property-detail-section' };
                    const url = getUrlFromState(state);
                    history.replaceState(state, '', url);
                }, 100);

                // Scroll scrollable containers to top
                if (typeof window.scrollScrollableContainersToTop === 'function') {
                    setTimeout(() => {
                        window.scrollScrollableContainersToTop('auction-property-detail-section');
                    }, 50);
                }
            } else {
                // Fallback: trigger navigation click
                const propertyDetailNavItem = document.querySelector('[data-section="auction-property-detail-section"]');
                if (propertyDetailNavItem) {
                    propertyDetailNavItem.click();
                }
            }
            setTimeout(() => {
                isHandlingBackNavigation = false;
            }, 100);
            return;
        }

        // Check if seller-company-info-section is visible (even if not in state)
        const sellerInfoSection = document.getElementById('seller-company-info-section');
        const isSellerInfoVisible = sellerInfoSection &&
            window.getComputedStyle(sellerInfoSection).display !== 'none' &&
            window.getComputedStyle(sellerInfoSection).visibility !== 'hidden' &&
            parseFloat(window.getComputedStyle(sellerInfoSection).opacity) > 0;

        // If we're in seller-company-info-section, go back to auction-property-detail-section
        if (currentState.section === 'seller-company-info-section' || isSellerInfoVisible) {
            // Hide header if it exists (using correct ID)
            const header = document.getElementById('seller-company-info-page-header');
            if (header) {
                header.style.display = 'none';
            }

            // Navigate back to auction-property-detail-section
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('auction-property-detail-section');

                // Scroll scrollable containers to top
                if (typeof window.scrollScrollableContainersToTop === 'function') {
                    setTimeout(() => {
                        window.scrollScrollableContainersToTop('auction-property-detail-section');
                    }, 50);
                }
            } else {
                // Fallback: trigger navigation click
                const propertyDetailNavItem = document.querySelector('[data-section="auction-property-detail-section"]');
                if (propertyDetailNavItem) {
                    propertyDetailNavItem.click();
                }
            }
            setTimeout(() => {
                pushHistoryState(null, false);
                isHandlingBackNavigation = false;
            }, 100);
            return;
        }

        // If we're in auction-property-detail-section, go back to home-section (especially important for mobile)
        if (currentState.section === 'auction-property-detail-section') {
            // Hide header if it exists (cleanup is handled by the back button handler in auction-detail.js)
            const header = document.getElementById('auction-property-main-page-detail-header');
            if (header) {
                header.style.display = 'none';
            }

            // Get the previous section to determine the correct URL
            let targetSection = 'home-section';
            let targetUrl = '#';

            // Check if we came from auction-section
            if (typeof window.getPreviousSectionBeforePropertyDetail === 'function') {
                const previousSection = window.getPreviousSectionBeforePropertyDetail();
                if (previousSection === 'auction-section') {
                    targetSection = 'auction-section';
                    targetUrl = '#/auction-section';
                }
            }

            // Navigate back to the appropriate section
            if (typeof window.switchToSection === 'function') {
                window.switchToSection(targetSection);

                // Update URL to match the target section
                setTimeout(() => {
                    const state = { section: targetSection };
                    history.replaceState(state, '', targetUrl);
                }, 100);

                // Scroll scrollable containers within the target section to top
                if (typeof window.scrollScrollableContainersToTop === 'function') {
                    setTimeout(() => {
                        const scrollTarget = (targetSection === 'auction-section' ||
                            targetSection === 'buy-section' ||
                            targetSection === 'rent-section')
                            ? 'home-section'
                            : targetSection;
                        window.scrollScrollableContainersToTop(scrollTarget);
                    }, 50);
                }
            } else {
                // Fallback: trigger navigation click
                const homeNavItem = document.querySelector('[data-section="home-section"]');
                if (homeNavItem) {
                    homeNavItem.click();
                }
            }
            setTimeout(() => {
                isHandlingBackNavigation = false;
            }, 100);
            return;
        }

        // If we're in auction-section (or other subsections), go back to home
        if (currentState.section === 'auction-section' || currentState.section === 'buy-section' || currentState.section === 'rent-section') {
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('home-section');

                // Update URL to home
                setTimeout(() => {
                    const state = { section: 'home-section' };
                    history.replaceState(state, '', '#');
                }, 100);
            } else {
                // Fallback: trigger navigation click
                const homeNavItem = document.querySelector('[data-section="home-section"]');
                if (homeNavItem) {
                    homeNavItem.click();
                }
            }
            setTimeout(() => {
                isHandlingBackNavigation = false;
            }, 100);
            return;
        }

        // Default: go to home
        if (currentState.section !== 'home-section') {
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('home-section');
            }
        }

        isHandlingBackNavigation = false;
    }

    /**
     * Restore state from browser history
     * Called when user presses back button
     */
    function restoreState(state) {

        // Don't restore if we're currently navigating within profile
        if (isNavigatingWithinProfile) {
            return;
        }

        // Get current active section
        const currentActiveSection = document.querySelector('.tab-section.active');
        const currentSectionId = currentActiveSection ? currentActiveSection.id : null;

        // Restore section only if it's different from current section
        if (state.section && state.section !== currentSectionId && typeof window.switchToSection === 'function') {
            // Special case: if we're in profile-section and state is also profile-section, just restore the route
            if (state.section === 'profile-section' && currentSectionId === 'profile-section') {
            } else {
                window.switchToSection(state.section);
            }
        }

        // Restore profile route
        if (state.section === 'profile-section') {
            setTimeout(() => {
                if (state.accountTab && typeof window.AccountInfoTabs !== 'undefined' && typeof window.AccountInfoTabs.switchTab === 'function') {
                    window.AccountInfoTabs.switchTab(state.accountTab);
                } else if (state.profileRoute === 'account-info' && typeof window.ProfileNavigation !== 'undefined') {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.ACCOUNT_INFO);
                } else if (state.profileRoute === 'menu' && typeof window.ProfileNavigation !== 'undefined') {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                }
            }, 200);
        }
    }

    /**
     * Initialize history state on page load
     */
    function initHistory() {
        const initialState = getCurrentState();
        const url = getUrlFromState(initialState);
        history.replaceState(initialState, '', url);
    }

    /**
     * Handle browser back button (popstate event)
     */
    window.addEventListener('popstate', function (event) {
        if (isHandlingBackNavigation || isNavigatingWithinProfile) {
            return;
        }

        if (event.state) {
            // Restore state from history
            isHandlingBackNavigation = true;
            restoreState(event.state);
            setTimeout(() => {
                isHandlingBackNavigation = false;
            }, 100);
        } else {
            // No state, handle as back navigation
            handleBackNavigation();
        }
    });

    /**
     * Export function to push history state (to be called from other modules)
     */
    window.pushNavigationState = function (skipPush) {
        pushHistoryState(null, skipPush);
    };

    /**
     * Export flag for other modules to check
     */
    window.isNavigatingWithinProfile = function () {
        return isNavigatingWithinProfile;
    };

    window.setNavigatingWithinProfile = function (value) {
        isNavigatingWithinProfile = value;
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHistory);
    } else {
        initHistory();
    }
})();

