/**
 * Seller Company Info Page
 * 
 * This file handles:
 * - Opening seller company info page when company icon is clicked
 * - Rendering company details from auction data
 * - Displaying company auctions and information
 * - Tab switching between auctions and seller info
 */

(function () {
    'use strict';

    let currentCompanyData = null;
    let currentAuctionId = null;

    /**
     * Render the seller company info page
     */
    function renderSellerCompanyInfo(companyData, auctionId) {
        if (!companyData) {
            console.error('No company data provided');
            return;
        }

        currentCompanyData = companyData;
        currentAuctionId = auctionId;

        const container = document.querySelector('.seller-company-info-container');
        if (!container) {
            console.error('Seller company info container not found');
            return;
        }

        const companyName = companyData.userCompanyName || companyData.auction_compName || 'شركة غير معروفة';
        const companyLogo = companyData.userCompanyLogo || companyData.auction_compLogo || '';
        // userCompanyBanner should come from userCompanyDetails object
        const companyImage = companyData.userCompanyBanner || 'default-company-banner.png';
        const companyDescription = companyData.userCompanyDescription || '';

        const html = `
            <!-- Banner Section with Badge -->
            <div class="seller-company-banner-wrapper">
                <div class="seller-company-banner">
                    <img src="${companyImage}" alt="${companyName}" class="seller-company-banner-image">
                </div>
                <div class="seller-company-badge">
                    <img src="${companyLogo}" alt="${companyName}" class="seller-company-badge-image" onerror="this.style.display='none'">
                </div>
            </div>

            <!-- Company Name -->
            <h1 class="seller-company-name">${companyName}</h1>

            <!-- Tabs -->
            <div class="seller-company-tabs">
                <button class="seller-company-tab active" data-tab="auctions">
                    <span>المزادات</span>
                </button>
                <button class="seller-company-tab" data-tab="info">
                    <span>معلومات البائع</span>
                </button>
            </div>

            <!-- Auctions Tab Content -->
            <div class="seller-company-tab-content active" id="seller-auctions-tab">
                <!-- Search Input -->
                <div class="seller-company-search-container">
                    <div class="seller-company-search-wrapper">
                        <i data-lucide="search" class="seller-company-search-icon"></i>
                        <input type="text" class="seller-company-search-input" placeholder="البحث" id="seller-auctions-search">
                    </div>
                </div>

                <!-- Results Count -->
                <div class="seller-company-results-count"> النتائج: 
                    <span id="seller-auctions-count">0</span> مزاد
                </div>

                <!-- Auctions List -->
                <div class="seller-company-auctions-list" id="seller-auctions-list">
                    <!-- Auction cards will be rendered here -->
                </div>
            </div>

            <!-- Seller Info Tab Content -->
            <div class="seller-company-tab-content" id="seller-info-tab">
                <!-- About Seller Section -->
                <div class="seller-company-about-section">
                    <div class="seller-company-breadcrumb">
                        <span class="breadcrumb-item">عن البائع</span>
                    </div>
                    <div class="seller-company-info-card">
                        <p class="seller-company-description">${companyDescription}</p>
                    </div>
                </div>

                <div class="seller-company-breadcrumb">
                    <span class="breadcrumb-item">معلومات التواصل</span>
                </div>
                    
                <!-- Company Details -->
                ${companyData.userCompanyAddress ? `
                <div class="seller-company-detail-item ${companyData.userCompanyAddressUrl ? 'clickable' : ''}" ${companyData.userCompanyAddressUrl ? `data-url="${companyData.userCompanyAddressUrl}"` : ''}>
                    <i data-lucide="map-pin" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">${companyData.userCompanyAddress}</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.userCompanyPhone ? `
                <div class="seller-company-detail-item">
                    <i data-lucide="phone" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">${companyData.userCompanyPhone}</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.userCompanyEmail ? `
                <div class="seller-company-detail-item">
                    <i data-lucide="mail" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">${companyData.userCompanyEmail}</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.userCompanyInstagram ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.userCompanyInstagram}">
                    <i data-lucide="instagram" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">إنستغرام</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.userCompanyTikTok ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.userCompanyTikTok}">
                    <i data-lucide="music" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">تيك توك</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.userCompanyTwitter ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.userCompanyTwitter}">
                    <i data-lucide="twitter" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">تويتر</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.userCompanyFacebook ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.userCompanyFacebook}">
                    <i data-lucide="facebook" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">فيسبوك</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.userCompanyYouTube ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.userCompanyYouTube}">
                    <i data-lucide="youtube" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">يوتيوب</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Initialize tabs
        initTabs();

        // Initialize search
        initSearch();

        // Initialize clickable detail items (address and social media)
        initClickableDetailItems();

        // Load company auctions by ID (multiple auctions can have the same ID)
        loadCompanyAuctions(currentAuctionId);
    }

    /**
     * Initialize tab switching
     */
    function initTabs() {
        const tabs = document.querySelectorAll('.seller-company-tab');
        const tabContents = document.querySelectorAll('.seller-company-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const targetTab = this.getAttribute('data-tab');

                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                const targetContent = document.getElementById(`seller-${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    /**
     * Initialize search functionality
     */
    function initSearch() {
        const searchInput = document.getElementById('seller-auctions-search');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                filterAuctions(this.value);
            });
        }
    }

    /**
     * Initialize clickable detail items (address and social media links)
     */
    function initClickableDetailItems() {
        const clickableItems = document.querySelectorAll('.seller-company-detail-item.clickable');
        clickableItems.forEach(item => {
            item.addEventListener('click', function () {
                const url = this.getAttribute('data-url');
                if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            });
        });
    }

    /**
     * Filter auctions based on search query
     */
    function filterAuctions(query) {
        const auctionsList = document.getElementById('seller-auctions-list');
        if (!auctionsList) return;

        const auctionCards = auctionsList.querySelectorAll('.seller-company-auction-card');
        let visibleCount = 0;

        auctionCards.forEach(card => {
            const title = card.querySelector('.seller-company-auction-title')?.textContent || '';
            const location = card.querySelector('.seller-company-auction-location')?.textContent || '';
            const searchText = (title + ' ' + location).toLowerCase();
            const queryLower = query.toLowerCase();

            if (searchText.includes(queryLower)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update results count
        const countElement = document.getElementById('seller-auctions-count');
        if (countElement) {
            countElement.textContent = visibleCount;
        }
    }

    /**
     * Load company auctions by ID
     * Multiple auctions can have the same ID to indicate they're from the same company
     */
    async function loadCompanyAuctions(auctionId) {
        try {
            const response = await fetch('json-data/auction-property.json');
            if (!response.ok) {
                throw new Error('Failed to fetch auction data');
            }

            const auctions = await response.json();
            // Filter auctions by matching ID (same ID = same company)
            const companyAuctions = auctions.filter(auction => auction.id === parseInt(auctionId));

            renderCompanyAuctions(companyAuctions);
        } catch (error) {
            console.error('Error loading company auctions:', error);
        }
    }

    /**
     * Render company auctions
     */
    function renderCompanyAuctions(auctions) {
        const auctionsList = document.getElementById('seller-auctions-list');
        const countElement = document.getElementById('seller-auctions-count');

        if (!auctionsList) return;

        if (countElement) {
            countElement.textContent = auctions.length;
        }

        auctionsList.innerHTML = auctions.map(auction => {
            // Use auction_image for auction cards, not userCompanyBanner
            const auctionImage = auction.auction_image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee';
            const auctionTitle = auction.auction_title || 'عقار في المزاد';
            const auctionLocation = auction.auction_location || 'غير محدد';
            const assetCount = auction.auction_numberOfAssets || (auction.assets ? auction.assets.length : 0);
            const viewCount = auction.auction_viewCount || 0;

            // Determine status
            let statusBadge = '';
            let statusClass = '';
            if (auction.auction_bidStartDate && auction.auction_bidEndDate) {
                const startDate = new Date(auction.auction_bidStartDate.replace(/[—–−]/g, '-'));
                const endDate = new Date(auction.auction_bidEndDate.replace(/[—–−]/g, '-'));
                const now = new Date();

                if (now < startDate) {
                    statusBadge = 'قادم قريباً';
                    statusClass = 'status-upcoming';
                } else if (now > endDate) {
                    statusBadge = 'إنتهى';
                    statusClass = 'status-ended';
                } else {
                    statusBadge = 'جاري الآن';
                    statusClass = 'status-live';
                }
            }

            return `
                <div class="seller-company-auction-card" data-auction-id="${auction.id}">
                    <div class="seller-company-auction-image-wrapper">
                        <img src="${auctionImage}" alt="${auctionTitle}" class="seller-company-auction-image">
                        ${statusBadge ? `<span class="seller-company-auction-badge ${statusClass}">${statusBadge}</span>` : ''}
                    </div>
                    <div class="seller-company-auction-content">
                        <h3 class="seller-company-auction-title">${auctionTitle}</h3>
                        <div class="seller-company-auction-meta">
                            <div class="seller-company-auction-meta-item">
                                <i data-lucide="map-pin" class="seller-company-auction-meta-icon"></i>
                                <span class="seller-company-auction-location">${auctionLocation}</span>
                            </div>
                            <div class="seller-company-auction-meta-item">
                                <i data-lucide="package" class="seller-company-auction-meta-icon"></i>
                                <span>${assetCount} منتج</span>
                            </div>
                            <div class="seller-company-auction-meta-item">
                                <i data-lucide="eye" class="seller-company-auction-meta-icon"></i>
                                <span>${viewCount} مشاهدة</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Initialize Lucide icons for new content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Add click handlers to auction cards
        const auctionCards = auctionsList.querySelectorAll('.seller-company-auction-card');
        auctionCards.forEach(card => {
            card.addEventListener('click', function () {
                const auctionId = this.getAttribute('data-auction-id');
                if (auctionId && typeof window.openPropertyDetail === 'function') {
                    // Get badge status
                    const badge = this.querySelector('.seller-company-auction-badge');
                    const badgeStatus = badge ? {
                        className: badge.classList.contains('status-live') ? 'status-live' :
                            badge.classList.contains('status-upcoming') ? 'status-upcoming' : 'status-ended'
                    } : null;
                    window.openPropertyDetail(auctionId, badgeStatus);
                }
            });
        });
    }

    /**
     * Open seller company info page
     */
    window.openSellerCompanyInfo = async function (auctionId) {
        try {
            // Store the current section before navigating
            if (typeof window.getCurrentSection === 'function') {
                // Store current section for back navigation
                window._previousSectionBeforeSellerInfo = window.getCurrentSection();
            }

            // Fetch auction data from JSON
            const response = await fetch('json-data/auction-property.json');
            if (!response.ok) {
                throw new Error('Failed to fetch auction data');
            }

            const auctions = await response.json();
            const auction = auctions.find(a => a.id === parseInt(auctionId));

            if (!auction) {
                console.error('Auction not found:', auctionId);
                alert('المزاد غير متوفرة حالياً');
                return;
            }

            // Get company data
            // userCompanyName exists outside userCompanyDetails at the auction level
            // userCompanyBanner should come from userCompanyDetails[0]
            const companyData = auction.userCompanyDetails && auction.userCompanyDetails.length > 0
                ? {
                    ...auction.userCompanyDetails[0],
                    userCompanyName: auction.userCompanyName || auction.userCompanyDetails[0].userCompanyName || auction.auction_compName,
                    auction_compName: auction.auction_compName,
                    auction_compLogo: auction.auction_compLogo,
                    // userCompanyBanner should be from userCompanyDetails, not auction level
                    userCompanyBanner: auction.userCompanyDetails[0].userCompanyBanner
                }
                : {
                    userCompanyName: auction.userCompanyName || auction.auction_compName,
                    auction_compName: auction.auction_compName,
                    auction_compLogo: auction.auction_compLogo
                };

            // Render the company info page
            renderSellerCompanyInfo(companyData, auctionId);

            // Show header
            const header = document.getElementById('seller-company-info-page-header');
            if (header) {
                header.style.display = 'flex';
                // Update title
                const titleElement = document.getElementById('seller-company-info-title');
                if (titleElement) {
                    titleElement.textContent = companyData.userCompanyName || companyData.auction_compName || 'معلومات البائع';
                }
            }

            // Navigate to seller company info section
            if (typeof window.switchToSection === 'function') {
                // Hide the auction-property-detail-section header first
                const propertyDetailHeader = document.getElementById('auction-property-main-page-detail-header');
                if (propertyDetailHeader) {
                    propertyDetailHeader.style.display = 'none';
                }

                // Switch to seller company info section
                window.switchToSection('seller-company-info-page-section');
            } else {
                console.error('switchToSection function not available');
            }

        } catch (error) {
            console.error('Error opening seller company info:', error);
            alert('حدث خطأ أثناء تحميل معلومات البائع');
        }
    };

    /**
     * Initialize back button
     */
    function initBackButton() {
        const backBtn = document.getElementById('seller-company-info-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                // Hide header
                const header = document.getElementById('seller-company-info-page-header');
                if (header) {
                    header.style.display = 'none';
                }

                // Navigate back to previous section
                if (typeof window.switchToSection === 'function') {
                    const previousSection = window._previousSectionBeforeSellerInfo || 'auction-property-detail-section';
                    window.switchToSection(previousSection);
                }
            });
        }

        // Initialize share button
        const shareBtn = document.getElementById('seller-company-info-share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                if (navigator.share && currentCompanyData) {
                    const companyName = currentCompanyData.userCompanyName || currentCompanyData.auction_compName || 'شركة';
                    navigator.share({
                        title: companyName,
                        text: `تعرف على ${companyName}`,
                        url: window.location.href
                    }).catch(err => console.log('Error sharing:', err));
                } else {
                    // Fallback: copy to clipboard
                    const url = window.location.href;
                    navigator.clipboard.writeText(url).then(() => {
                        if (window.showToastMessage) {
                            window.showToastMessage('تم نسخ الرابط بنجاح', 2000);
                        }
                    }).catch(err => console.log('Error copying:', err));
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBackButton);
    } else {
        initBackButton();
    }

})();

