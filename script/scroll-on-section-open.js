/**
 * Utility function to wait for a section to open and then scroll to top
 * Uses MutationObserver to detect when section gets 'active' class
 */

(function () {
    'use strict';

    /**
     * Wait for section to become active and then scroll to top
     * @param {string} sectionId - The ID of the section to wait for
     */
    window.scrollOnSectionOpen = function (sectionId) {
        if (!sectionId || typeof window.scrollScrollableContainersToTop !== 'function') {
            return;
        }

        const section = document.getElementById(sectionId);
        if (!section) {
            console.warn(`Section ${sectionId} not found`);
            return;
        }

        // Check if section is already active
        if (section.classList.contains('active')) {
            // Section is already active, scroll immediately
            window.scrollScrollableContainersToTop(sectionId);
            return;
        }

        // Watch for the 'active' class to be added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (section.classList.contains('active')) {
                        // Section is now active, scroll to top
                        window.scrollScrollableContainersToTop(sectionId);
                        
                        // Disconnect observer after first activation
                        observer.disconnect();
                    }
                }
            });
        });

        // Observe the section for class changes
        observer.observe(section, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Set a timeout to disconnect observer after 5 seconds (safety measure)
        setTimeout(() => {
            observer.disconnect();
        }, 5000);
    };

})();

