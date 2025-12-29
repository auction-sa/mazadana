// Header Menu Dropdown Management
// This file handles the header menu button and dropdown functionality
(function () {
    'use strict';

    let notificationData = null;
    let notificationDropdown = null;
    let notificationOverlay = null;
    let userData = null;

    /**
     * Load user data from user-data.json
     */
    async function loadUserData() {
        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            userData = await response.json();
            notificationData = userData.userNotificationMessagesHistoryDataObject || null;
            updateNotificationBadge();
            updateVerificationBadge();
        } catch (error) {
            console.error('Error loading user data:', error);
            userData = null;
            notificationData = null;
        }
    }

    /**
     * Load notification data from user-data.json (kept for backward compatibility)
     */
    async function loadNotificationData() {
        await loadUserData();
    }

    /**
     * Update notification badge with the number of new notifications
     */
    function updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;

        if (notificationData && notificationData.newNotificationNumber > 0) {
            badge.textContent = notificationData.newNotificationNumber;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Update verification badge on profile button
     */
    function updateVerificationBadge() {
        const profileBtn = document.querySelector('.header-profile-btn');
        if (!profileBtn) return;

        // Check if badge already exists
        let badge = profileBtn.querySelector('.verification-badge');

        // Get verification status from user data
        const isVerified = userData && userData.userVerificationStatus === true;

        if (isVerified) {
            // Create badge if it doesn't exist
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'verification-badge';
                badge.innerHTML = '<i data-lucide="check" class="verification-badge-icon"></i>';
                profileBtn.appendChild(badge);

                // Initialize Lucide icon
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }

            // Show badge with smooth transition
            requestAnimationFrame(() => {
                badge.classList.add('active');
            });
        } else {
            // Hide badge if user is not verified
            if (badge) {
                badge.classList.remove('active');
            }
        }
    }

    /**
     * Format date for display
     */
    function formatNotificationDate(dateString) {
        if (!dateString) return 'غير محدد';
        // Format: YYYY-MM-DD to DD/MM/YYYY
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    }

    /**
     * Create notification overlay
     */
    function createNotificationOverlay() {
        if (notificationOverlay) {
            return notificationOverlay;
        }

        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.id = 'notification-overlay';

        // Add click handler to close dropdown when clicking overlay
        overlay.addEventListener('click', function (e) {
            e.stopPropagation();
            hideNotificationDropdown();
        });

        // Add to body
        document.body.appendChild(overlay);

        notificationOverlay = overlay;
        return overlay;
    }

    /**
     * Create notification dropdown HTML structure
     */
    function createNotificationDropdown() {
        if (notificationDropdown) {
            return notificationDropdown;
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.id = 'notification-dropdown';

        const header = document.createElement('div');
        header.className = 'notification-dropdown-header';
        header.innerHTML = `
            <h3 class="notification-dropdown-title">الإشعارات</h3>
            <button class="notification-dropdown-close" aria-label="إغلاق" onclick="hideNotificationDropdown()">
                <i data-lucide="x" class="close-icon"></i>
            </button>
        `;

        const content = document.createElement('div');
        content.className = 'scrollable-container';
        content.id = 'notification-dropdown-content';

        dropdown.appendChild(header);
        dropdown.appendChild(content);

        // Add to header menu wrapper (same container as menu dropdown)
        const menuWrapper = document.querySelector('.header-menu-wrapper');
        if (menuWrapper) {
            menuWrapper.appendChild(dropdown);
        }

        notificationDropdown = dropdown;
        return dropdown;
    }

    /**
     * Render notifications in the dropdown
     */
    function renderNotifications() {
        const dropdown = createNotificationDropdown();
        const content = dropdown.querySelector('#notification-dropdown-content');
        if (!content) return;

        if (!notificationData || !notificationData.notificationMessagesHistory || notificationData.notificationMessagesHistory.length === 0) {
            content.innerHTML = '<div class="notification-empty">لا توجد إشعارات</div>';
            return;
        }

        const notifications = notificationData.notificationMessagesHistory;
        content.innerHTML = notifications.map((notification, index) => {
            const date = formatNotificationDate(notification.notificationDate);
            return `
                <div class="notification-item" data-notification-index="${index}">
                    <div class="notification-message">${notification.notificationMessage || ''}</div>
                    <div class="notification-date">${date}</div>
                </div>
            `;
        }).join('');

        // Add click handlers to notification items
        const notificationItems = content.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-notification-index'));
                handleNotificationClick(notifications[index]);
            });
        });

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Handle notification click - navigate to appropriate page
     */
    async function handleNotificationClick(notification) {
        if (!notification) return;

        // Close notification dropdown and overlay
        if (notificationDropdown) {
            notificationDropdown.classList.remove('active');
        }
        if (notificationOverlay) {
            notificationOverlay.classList.remove('active');
        }

        const showPageId = notification.showPageId;
        if (!showPageId) return;

        // If it's auction-property-detail-section, load auction data first
        if (showPageId === 'auction-property-detail-section' && notification.auctionId) {
            try {
                // Fetch auction data
                const response = await fetch('json-data/auction-property.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch auction data');
                }

                const auctions = await response.json();
                const auction = auctions.find(a => a.id === parseInt(notification.auctionId));

                if (!auction) {
                    console.error('Auction not found:', notification.auctionId);
                    if (window.showToastMessage) {
                        window.showToastMessage('المزاد غير متوفرة حالياً', 2000);
                    }
                    return;
                }

                // Open property detail using the existing function
                if (typeof window.openPropertyDetail === 'function') {
                    await window.openPropertyDetail(notification.auctionId, null);
                } else {
                    console.error('openPropertyDetail function not available');
                }
            } catch (error) {
                console.error('Error loading auction data:', error);
                if (window.showToastMessage) {
                    window.showToastMessage('حدث خطأ أثناء تحميل تفاصيل المزاد', 2000);
                }
            }
        } else {
            // Navigate to other sections
            if (typeof window.switchToSection === 'function') {
                window.switchToSection(showPageId);
            } else {
                console.error('switchToSection function not available');
            }
        }
    }

    /**
     * Show notification dropdown
     */
    function showNotificationDropdown() {
        const dropdown = createNotificationDropdown();
        const overlay = createNotificationOverlay();
        renderNotifications();

        // Ensure elements are in the DOM and force a reflow
        // This allows the browser to register the initial state
        void dropdown.offsetHeight;
        void overlay.offsetHeight;

        // Use double requestAnimationFrame to ensure the initial state is fully painted
        // before adding the active class, which enables smooth transitions on first show
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                dropdown.classList.add('active');
                overlay.classList.add('active');
            });
        });
    }


    // Initialize header menu functionality
    function initHeaderMenu() {
        const menuBtn = document.getElementById('header-menu-btn');
        const menuDropdown = document.getElementById('header-menu-dropdown');

        if (!menuBtn || !menuDropdown) {
            return;
        }

        // Load notification data
        loadNotificationData();

        // Toggle dropdown when menu button is clicked
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            menuDropdown.classList.toggle('active');
            // Close notification dropdown when opening menu
            hideNotificationDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
                menuDropdown.classList.remove('active');
            }

            // Close notification dropdown when clicking outside
            // Don't close if clicking on the overlay (overlay has its own handler)
            const overlay = document.getElementById('notification-overlay');
            if (overlay && overlay.contains(e.target)) {
                return; // Overlay click handler will handle this
            }

            if (notificationDropdown && !notificationDropdown.contains(e.target)) {
                const notificationMenuItem = document.getElementById('notifications-menu-item');
                if (notificationMenuItem && !notificationMenuItem.contains(e.target)) {
                    hideNotificationDropdown();
                }
            }
        });

        // Handle menu item clicks
        const menuItems = menuDropdown.querySelectorAll('.header-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function (e) {
                // Handle search item click
                if (this.getAttribute('aria-label') === 'بحث') {
                    menuDropdown.classList.remove('active');
                    const section = this.getAttribute('data-section');
                    if (section && typeof window.switchToSection === 'function') {
                        window.switchToSection(section);
                    }
                }

                // Handle notification item click
                if (this.getAttribute('aria-label') === 'الإشعارات') {
                    e.stopPropagation();
                    menuDropdown.classList.remove('active');
                    showNotificationDropdown();
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


/**
 * Hide notification dropdown
*/
function hideNotificationDropdown() {
    let notificationDropdown = document.getElementById('notification-dropdown');
    let notificationOverlay = document.getElementById('notification-overlay');
    if (notificationDropdown) {
        notificationDropdown.classList.remove('active');
    }
    if (notificationOverlay) {
        notificationOverlay.classList.remove('active');
    }
}
