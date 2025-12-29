// Favorites Page Management
// This file contains all JavaScript code related to the "المفضلة" (Favorites) page and functionality
// Also handles heart icon functionality for property cards
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let favoritesRendered = false;

    // Track if event delegation is already set up
    let heartIconDelegationSetup = false;

    /**
     * Set up event delegation for heart icons
     * This ensures heart icons work even if Lucide replaces the DOM
     */
    function setupHeartIconDelegation() {
        if (heartIconDelegationSetup) {
            return; // Already set up
        }

        // Use event delegation on document body
        document.body.addEventListener('click', function (e) {
            // Check if the clicked element or its parent is a heart icon
            const heartIcon = e.target.closest('.property-card-heart-icon');
            if (!heartIcon) {
                return;
            }

            e.stopPropagation(); // Prevent card click event
            e.preventDefault(); // Prevent any default behavior

            const isCurrentlyFavorited = heartIcon.classList.contains('favorited') || heartIcon.getAttribute('data-favorited') === 'true';

            if (isCurrentlyFavorited) {
                // Remove favorited state (turn back to white)
                heartIcon.classList.remove('favorited');
                heartIcon.removeAttribute('data-favorited');
            } else {
                // Add favorited state (turn red) and trigger animation
                heartIcon.classList.add('favorited');
                heartIcon.setAttribute('data-favorited', 'true');
            }

            // Ensure SVG elements get the favorited styling
            const svgElement = heartIcon.querySelector('svg');
            if (svgElement) {
                if (heartIcon.classList.contains('favorited')) {
                    svgElement.style.fill = '#dc3545';
                    svgElement.style.stroke = '#dc3545';
                } else {
                    svgElement.style.fill = 'none';
                    svgElement.style.stroke = '#000000';
                }
            }
        });

        heartIconDelegationSetup = true;
    }

    /**
     * Initialize heart icon click handlers
     * Makes heart icons clickable and toggles favorited state with animation
     * Also sets up event delegation for dynamic content
     * @param {HTMLElement} gridElement - The grid/container element (optional, if not provided, searches entire document)
     */
    function initializeHeartIcons(gridElement) {
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initializeHeartIcons(gridElement);
            });
            return;
        }

        // Set up event delegation (only once)
        setupHeartIconDelegation();

        // If no gridElement provided, search entire document
        const searchScope = gridElement || document;

        // Find all heart icons and restore their favorited state
        const heartIcons = searchScope.querySelectorAll('.property-card-heart-icon');

        heartIcons.forEach(heartIcon => {
            // Store favorited state in data attribute to persist across Lucide re-renders
            const isFavorited = heartIcon.classList.contains('favorited');
            if (isFavorited) {
                heartIcon.setAttribute('data-favorited', 'true');
            }

            // Restore visual state if needed
            if (heartIcon.getAttribute('data-favorited') === 'true') {
                heartIcon.classList.add('favorited');
                const svgElement = heartIcon.querySelector('svg');
                if (svgElement) {
                    svgElement.style.fill = '#dc3545';
                    svgElement.style.stroke = '#dc3545';
                }
            }
        });
    }

    /**
     * Re-apply favorited state after Lucide icons are re-initialized
     * This ensures the favorited class persists when Lucide replaces the DOM
     */
    function restoreFavoritedStates(container) {
        const searchScope = container || document;
        const heartIcons = searchScope.querySelectorAll('.property-card-heart-icon');

        heartIcons.forEach(heartIcon => {
            if (heartIcon.getAttribute('data-favorited') === 'true') {
                heartIcon.classList.add('favorited');
                // Also apply styling directly to SVG if it exists
                const svgElement = heartIcon.querySelector('svg');
                if (svgElement) {
                    svgElement.style.fill = '#dc3545';
                    svgElement.style.stroke = '#dc3545';
                }
            }
        });
    }

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

                <div class="scrollable-container" id="favorites-content">
                    <i data-lucide="heart" class="favorites-icon"></i>
                    <p class="favorites-empty-text">لم يتم العثور على مزادات</p>
                </div>
            </div>
        `;

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;
        favoritesRendered = true;
    }

    // Parse Arabic date/time string to JavaScript Date object
    function parseArabicDate(dateString) {
        if (!dateString) return null;

        try {
            let normalized = dateString
                .replace(/صباحً|ص/g, 'AM')
                .replace(/مساءً|م/g, 'PM')
                .replace(/[—–−]/g, '-')
                .trim();

            const parts = normalized.split(/\s+/);
            if (parts.length < 2) return null;

            const datePart = parts[0];
            const timePart = parts.slice(1).join(' ');

            const [year, month, day] = datePart.split(/[-\/]/).map(Number);
            if (!year || !month || !day) return null;

            const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!timeMatch) return null;

            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const ampm = timeMatch[3].toUpperCase();

            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;

            return new Date(year, month - 1, day, hours, minutes);
        } catch (error) {
            console.warn('Error parsing date:', dateString, error);
            return null;
        }
    }

    // Get auction badge status
    function getAuctionBadgeStatus(auction_bidStartDate, auction_bidEndDate) {
        const now = new Date();
        const auction_startDate = parseArabicDate(auction_bidStartDate);
        const auction_endDate = parseArabicDate(auction_bidEndDate);

        if (!auction_startDate || !auction_endDate) {
            return {
                text: 'جاري الآن',
                className: 'live-badge-home-page'
            };
        }

        if (now < auction_startDate) {
            return {
                text: 'قادم',
                className: 'upcoming-badge-home-page'
            };
        }

        if (now > auction_endDate) {
            return {
                text: 'إنتهى',
                className: 'ended-badge-home-page'
            };
        }

        return {
            text: 'جاري الآن',
            className: 'live-badge-home-page'
        };
    }

    // Get image URL from auction
    function getAuctionImageUrl(auction) {
        if (auction.auction_image) return auction.auction_image;
        if (auction.assets && auction.assets.length > 0 && auction.assets[0].auctionAsset_image) {
            return auction.assets[0].auctionAsset_image;
        }
        return null;
    }

    // Fetch user favorited data
    async function fetchUserFavoritedData() {
        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            const favoritedData = userData.userFavoritedDataObject;

            if (!favoritedData || !Array.isArray(favoritedData)) {
                return [];
            }

            return favoritedData;
        } catch (error) {
            console.error('Error fetching user favorited data:', error);
            return [];
        }
    }

    // Fetch all auction data
    async function fetchAllAuctions() {
        try {
            const response = await fetch('json-data/auction-property.json');
            if (!response.ok) {
                throw new Error('Failed to fetch auction data');
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching auction data:', error);
            return [];
        }
    }

    // Render auction card HTML
    function renderAuctionCardHTML(auction, sellerCompanyDataObject) {
        if (!auction) return '';

        const sellerCompanyName = sellerCompanyDataObject?.sellerCompanyname || 'شركة لمزاد العقارات';
        const sellerCompanyLogo = sellerCompanyDataObject?.sellerCompanyLogo || null;

        const imageUrl = getAuctionImageUrl(auction);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';
        const companyLogo = sellerCompanyLogo ? `<img src="${sellerCompanyLogo}" alt="${sellerCompanyName}" class="company-logo">` : '';
        const specialWordBadge = auction.auction_specialWord ?
            `<div class="home-page-special-word-badge">${auction.auction_specialWord}</div>` : '';

        const timeRemaining = auction.auction_bidStartDate || 'غير محدد';
        const badgeStatus = getAuctionBadgeStatus(auction.auction_bidStartDate, auction.auction_bidEndDate);

        return `
            <div class="property-card-home-page auction-card-home-page seller-company-auction-card">
                <div class="card-header">
                    <div class="company-details">
                        ${companyLogo}
                        <span class="company-name">${sellerCompanyName}</span>
                    </div>
                    ${specialWordBadge}
                </div>
                <div class="property-image-home-page" ${imageStyle}>
                    <div class="auction-badge-home-page">
                        <span class="auction-status-badge-home-page ${badgeStatus.className}">
                            <i data-lucide="circle" class="badge-dot-home-page"></i>
                            ${badgeStatus.text}
                        </span>
                        <span class="auction-status-badge-home-page electronic-badge-home-page">
                            <i data-lucide="globe" class="badge-icon-home-page"></i>
                            إلكتروني
                        </span>
                    </div>
                </div>
                <div class="property-content-home-page">
                    <h3 class="property-title-home-page">${auction.auction_title || sellerCompanyName || 'عقار في المزاد'}</h3>
                    <div class="auction-meta-home-page">
                        <div class="auction-timer-home-page">
                            <i data-lucide="clock" class="meta-icon"></i>
                            <span class="bid-start-date-text">بدأ المزاد: <strong>${timeRemaining}</strong></span>
                        </div>
                    </div>
                    <div class="auction-bid-section">
                        <div class="bid-section-top">
                            <div class="location-wrapper">
                                <i data-lucide="map-pin" class="property-card-location-icon"></i>
                                <span>${auction.auction_location || 'غير محدد'}</span>
                            </div>
                            <i data-lucide="heart" class="property-card-heart-icon favorited" data-favorited="true"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render favorite auction cards
    async function renderFavoriteCards() {
        const favoritesContent = document.getElementById('favorites-content');
        if (!favoritesContent) return;

        // Fetch favorited data
        const favoritedData = await fetchUserFavoritedData();

        // Fetch all auctions
        const allAuctions = await fetchAllAuctions();

        // Get seller company data
        let sellerCompanyDataObject = null;
        try {
            const userResponse = await fetch('json-data/user-data.json');
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.sellerCompanyDataObject && userData.sellerCompanyDataObject.length > 0) {
                    sellerCompanyDataObject = userData.sellerCompanyDataObject[0];
                }
            }
        } catch (error) {
            console.warn('Failed to fetch seller company data:', error);
        }

        // Filter auctions by auctionId from favorited data
        const auctionIds = favoritedData.map(f => f.auctionId);
        const favoriteAuctions = allAuctions.filter(auction => auctionIds.includes(auction.id));

        // Handle empty state
        if (favoriteAuctions.length === 0) {
            favoritesContent.innerHTML = `
                <i data-lucide="heart" class="favorites-icon"></i>
                <p class="favorites-empty-text">لم يتم العثور على مزادات</p>
            `;
            return;
        }

        // Create seller-company-auctions-list container
        let container = favoritesContent.querySelector('.seller-company-auctions-list');
        if (!container) {
            // Remove empty state elements
            const emptyIcon = favoritesContent.querySelector('.favorites-icon');
            const emptyText = favoritesContent.querySelector('.favorites-empty-text');
            if (emptyIcon) emptyIcon.remove();
            if (emptyText) emptyText.remove();

            container = document.createElement('div');
            container.className = 'seller-company-auctions-list';
            favoritesContent.appendChild(container);
        } else {
            container.innerHTML = '';
        }

        // Render cards
        favoriteAuctions.forEach(auction => {
            const cardHTML = renderAuctionCardHTML(auction, sellerCompanyDataObject);
            const temp = document.createElement('div');
            temp.innerHTML = cardHTML.trim();
            const cardElement = temp.firstChild;

            if (cardElement) {
                container.appendChild(cardElement);

                // Add click handler
                cardElement.addEventListener('click', function (e) {
                    if (e.target.closest('button') ||
                        e.target.closest('.property-cta-btn-home-page') ||
                        e.target.closest('.property-card-heart-icon') ||
                        e.target.classList.contains('property-card-heart-icon')) {
                        return;
                    }

                    const auctionId = auction.id;
                    const badgeStatus = getAuctionBadgeStatus(auction.auction_bidStartDate, auction.auction_bidEndDate);

                    if (auctionId && typeof window.openPropertyDetail === 'function') {
                        window.openPropertyDetail(auctionId, badgeStatus);
                        if (typeof window.scrollOnSectionOpen === 'function') {
                            window.scrollOnSectionOpen('auction-property-detail-section');
                        }
                    }
                });
            }
        });

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                // Restore favorited states after Lucide re-initializes
                if (typeof window.restoreFavoritedStates === 'function') {
                    window.restoreFavoritedStates(container);
                }
                // Initialize heart icon click handlers after icons are created
                if (typeof window.initializeHeartIcons === 'function') {
                    window.initializeHeartIcons(container);
                }
            }, 100);
        } else {
            // If Lucide is not available, still initialize heart icons after DOM is ready
            requestAnimationFrame(() => {
                if (typeof window.initializeHeartIcons === 'function') {
                    window.initializeHeartIcons(container);
                }
            });
        }

        // Initialize countdown timers for these cards
        setTimeout(() => {
            if (typeof window.initializeAuctionCountdowns === 'function') {
                window.initializeAuctionCountdowns();
            } else {
                console.warn('initializeAuctionCountdowns function not available');
            }
        }, 200);
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
        // Update header position
        updateFavoritesHeaderPosition();

        // Back button handler (only attach once)
        if (!eventListenersAttached) {
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

            eventListenersAttached = true;
        }

        // Always render favorite cards when view is active
        renderFavoriteCards();
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
                        // This will also call renderFavoriteCards()
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

    /**
     * Initialize heart icons on page load
     * This ensures heart icons that exist in the initial DOM are functional
     */
    function initHeartIconsOnLoad() {
        // Wait for Lucide to be available and initialized
        if (typeof lucide !== 'undefined') {
            // Wait a bit for Lucide to initialize all icons
            setTimeout(() => {
                // Restore favorited states first
                if (typeof window.restoreFavoritedStates === 'function') {
                    window.restoreFavoritedStates();
                }
                // Then initialize click handlers
                if (typeof window.initializeHeartIcons === 'function') {
                    window.initializeHeartIcons();
                }
            }, 300);
        } else {
            // If Lucide is not available yet, try again after a delay
            setTimeout(() => {
                initHeartIconsOnLoad();
            }, 500);
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            // Initialize heart icons after DOM is ready
            initHeartIconsOnLoad();
        });
    } else {
        init();
        // Initialize heart icons if DOM is already ready
        initHeartIconsOnLoad();
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

    /**
     * Export heart icon functionality for use in other modules
     */
    window.initializeHeartIcons = initializeHeartIcons;
    window.restoreFavoritedStates = restoreFavoritedStates;
})();

