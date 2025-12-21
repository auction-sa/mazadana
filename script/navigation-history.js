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
        const activeSection = document.querySelector('.tab-section.active');
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

        // If we're in auction-section (or other subsections), go back to home
        if (currentState.section === 'auction-section' || currentState.section === 'buy-section' || currentState.section === 'rent-section') {
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

