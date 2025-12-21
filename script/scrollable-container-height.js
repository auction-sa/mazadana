/**
 * Dynamic Height Calculation for Scrollable Containers
 * 
 * This script dynamically sets the height of .scrollable-container elements
 * to fit the available viewport space:
 * - Desktop: Fits from container top to bottom of viewport
 * - Mobile: Fits from container top to top of bottom-nav element
 */

(function () {
    'use strict';

    // Mobile breakpoint (matches responsive.css)
    const MOBILE_BREAKPOINT = 1024;

    /**
     * Check if current viewport is mobile
     * @returns {boolean} True if mobile, false if desktop
     */
    function isMobile() {
        return window.innerWidth < MOBILE_BREAKPOINT;
    }

    /**
     * Get the bottom boundary for scrollable containers
     * @returns {number} Bottom boundary in pixels
     */
    function getBottomBoundary() {
        if (isMobile()) {
            // On mobile, use the top of bottom-nav as boundary
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                return bottomNav.getBoundingClientRect().top;
            }
        }
        // On desktop, use viewport height
        return window.innerHeight;
    }

    /**
     * Calculate and set height for a scrollable container
     * @param {HTMLElement} container - The scrollable container element
     */
    function setContainerHeight(container) {
        const rect = container.getBoundingClientRect();
        const top = rect.top;
        const bottomBoundary = getBottomBoundary();

        // Calculate available height (subtract 20px for extra scrolling space)
        const availableHeight = bottomBoundary - top;

        // Set the height (ensure minimum height of 100px)
        container.style.height = Math.max(100, availableHeight) + 'px';
    }

    /**
     * Update heights for all scrollable containers
     */
    function updateAllContainerHeights() {
        const containers = document.querySelectorAll('.scrollable-container');
        containers.forEach(container => {
            // Only update if container is visible
            if (container.offsetParent !== null) {
                setContainerHeight(container);
            }
        });
    }

    /**
     * Debounce function to limit how often a function is called
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Debounced version of update function for resize events
    const debouncedUpdate = debounce(updateAllContainerHeights, 100);

    /**
     * Initialize the dynamic height system
     */
    function init() {
        // Initial calculation
        updateAllContainerHeights();

        // Update on window resize
        window.addEventListener('resize', debouncedUpdate);

        // Update on orientation change (mobile devices)
        window.addEventListener('orientationchange', () => {
            // Wait for orientation change to complete
            setTimeout(updateAllContainerHeights, 200);
        });

        // Update when page becomes visible (user switches tabs and comes back)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Small delay to ensure layout is stable
                setTimeout(updateAllContainerHeights, 100);
            }
        });

        // Update when sections become active (for tab switching)
        // Use a longer delay to account for CSS transitions (0.35s-0.4s)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('tab-section') && target.classList.contains('active')) {
                        // Wait for transition to complete (400ms) plus a small buffer
                        setTimeout(updateAllContainerHeights, 450);
                    }
                }
            });
        });

        // Observe tab sections for class changes
        const tabSections = document.querySelectorAll('.tab-section');
        tabSections.forEach(section => {
            observer.observe(section, {
                attributes: true,
                attributeFilter: ['class']
            });
        });

        // Also observe when scrollable containers are added/removed
        const containerObserver = new MutationObserver(() => {
            updateAllContainerHeights();
        });

        // Observe the app-content for new scrollable containers
        const appContent = document.getElementById('app-content');
        if (appContent) {
            containerObserver.observe(appContent, {
                childList: true,
                subtree: true
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        init();
    }

    // Export function for manual updates if needed
    window.updateScrollableContainerHeights = updateAllContainerHeights;

})();
