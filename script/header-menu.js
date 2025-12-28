// Header Menu Dropdown Management
// This file handles the header menu button and dropdown functionality
(function () {
    'use strict';

    // Initialize header menu functionality
    function initHeaderMenu() {
        const menuBtn = document.getElementById('header-menu-btn');
        const menuDropdown = document.getElementById('header-menu-dropdown');

        if (!menuBtn || !menuDropdown) {
            return;
        }

        // Toggle dropdown when menu button is clicked
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            menuDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
                menuDropdown.classList.remove('active');
            }
        });

        // Handle menu item clicks
        const menuItems = menuDropdown.querySelectorAll('.header-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function (e) {
                // Close dropdown when item is clicked
                menuDropdown.classList.remove('active');

                // Handle search item click
                if (this.getAttribute('aria-label') === 'بحث') {
                    const section = this.getAttribute('data-section');
                    if (section && typeof window.switchToSection === 'function') {
                        window.switchToSection(section);
                    }
                }

                // Handle notification item click
                if (this.getAttribute('aria-label') === 'الإشعارات') {
                    // TODO: Add notification page navigation
                    console.log('Notifications clicked');
                }
            });
        });

        // Re-initialize Lucide icons after menu items are created
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderMenu);
    } else {
        initHeaderMenu();
    }

    // Re-initialize when Lucide icons are available
    if (typeof lucide !== 'undefined') {
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
})();

