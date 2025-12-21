// Favorites Page Management
// This file contains all JavaScript code related to the "المفضلة" (Favorites) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let favoritesRendered = false;

    // Build favorites view markup
    function renderFavoritesView() {
        const favoritesView = document.getElementById('profile-favorites-view');
        if (!favoritesView || favoritesRendered) return;

        favoritesView.innerHTML = `
            <div class="favorites-container">
                <div class="account-tabs-header" id="favorites-header">
                    <button class="back-btn" id="favorites-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">المفضلة</h2>
                </div>

                <div class="favorites-content scrollable-container">
                    <i data-lucide="heart" class="favorites-icon"></i>
                    <p class="favorites-empty-text">لم يتم العثور على مزادات</p>
                </div>
            </div>
        `;

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;
        favoritesRendered = true;
    }


    // Update sticky header position based on top-header height
    function updateFavoritesHeaderPosition() {
        const favoritesHeader = document.getElementById('favorites-header');

        if (favoritesHeader) {
            // Pin header to the very top (match settings header behavior)
            favoritesHeader.style.top = '0px';
            // Ensure it's visible and properly positioned
            favoritesHeader.style.position = 'fixed';
            favoritesHeader.style.zIndex = '1000';
        }
    }

    // Initialize favorites page
    function initFavorites() {
        // Prevent duplicate event listeners
        if (eventListenersAttached) {
            return;
        }

        // Update header position
        updateFavoritesHeaderPosition();

        // Back button handler
        const favoritesBackBtn = document.getElementById('favorites-back-btn');
        if (favoritesBackBtn && !favoritesBackBtn.hasAttribute('data-listener-attached')) {
            favoritesBackBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();


                // Navigate back to profile menu
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                } else {
                    // Fallback: navigate to profile section
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                    }
                }
            });
            favoritesBackBtn.setAttribute('data-listener-attached', 'true');
        }

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        eventListenersAttached = true;
    }

    // Initialize when DOM is ready
    function init() {
        const favoritesView = document.getElementById('profile-favorites-view');
        if (!favoritesView) {
            return;
        }

        // Build view markup once
        renderFavoritesView();

        // Initialize favorites
        initFavorites();

        // Use MutationObserver to re-initialize when favorites view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = favoritesView.classList.contains('active');
                    if (isActive) {
                        // Re-initialize when favorites view becomes active
                        setTimeout(() => {
                            initFavorites();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(favoritesView, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also initialize if already active
        if (favoritesView.classList.contains('active')) {
            initFavorites();
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Update header position on window resize
    window.addEventListener('resize', () => {
        updateFavoritesHeaderPosition();
    });

    // Export for external use
    window.FavoritesPage = {
        init: initFavorites,
        updateHeaderPosition: updateFavoritesHeaderPosition
    };
})();

