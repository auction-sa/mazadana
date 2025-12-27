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

    /**
     * Local helpers (mirrors logic in property-data.js) to avoid missing globals
     */
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
            const [year, month, day] = parts[0].split(/[-\/]/).map(Number);
            const timeMatch = parts.slice(1).join(' ').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!year || !month || !day || !timeMatch) return null;
            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const ampm = timeMatch[3].toUpperCase();
            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            return new Date(year, month - 1, day, hours, minutes, 0);
        } catch {
            return null;
        }
    }

    function calculateTimeRemaining(targetDate) {
        if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds, expired: false };
    }

    function getRemainingTimeInfo(bidStartDate, bidEndDate) {
        const now = new Date();
        const startDate = parseArabicDate(bidStartDate);
        const endDate = parseArabicDate(bidEndDate);
        if (!startDate || !endDate) return { label: 'ينتهي المزاد بعد:', targetDate: bidEndDate || bidStartDate };
        if (now < startDate) return { label: 'يبدأ المزاد بعد:', targetDate: bidStartDate };
        if (now > endDate) return { label: 'انتهى المزاد', targetDate: null };
        return { label: 'ينتهي المزاد بعد:', targetDate: bidEndDate };
    }

    function padNumber(num) {
        return num.toString().padStart(2, '0');
    }

    function updateCountdownTimer(element, bidStartDate, bidEndDate) {
        const remainingTimeInfo = getRemainingTimeInfo(bidStartDate, bidEndDate);
        if (!remainingTimeInfo.targetDate) {
            element.textContent = 'انتهى المزاد';
            return;
        }
        const targetDate = parseArabicDate(remainingTimeInfo.targetDate);
        const timeRemaining = calculateTimeRemaining(targetDate);
        const daysStr = padNumber(timeRemaining.days);
        const hoursStr = padNumber(timeRemaining.hours);
        const minutesStr = padNumber(timeRemaining.minutes);
        const secondsStr = padNumber(timeRemaining.seconds);
        element.innerHTML = `
            <div class="flip-time-group">
                <div class="flip-digits-pair"><span>${secondsStr[1]}</span><span>${secondsStr[0]}</span></div>
            </div>
            <div class="flip-time-group">
                <div class="flip-digits-pair"><span>${minutesStr[1]}</span><span>${minutesStr[0]}</span></div>
            </div>
            <div class="flip-time-group">
                <div class="flip-digits-pair"><span>${hoursStr[1]}</span><span>${hoursStr[0]}</span></div>
            </div>
            <div class="flip-time-group">
                <div class="flip-digits-pair"><span>${daysStr[1]}</span><span>${daysStr[0]}</span></div>
            </div>
        `;
    }
    let currentCompanyData = null;
    let currentUserPlatformIdNumber = null;

    /**
     * Render the seller company info page
     */
    function renderSellerCompanyInfo(companyData, userPlatformIdNumber) {
        if (!companyData) {
            console.error('No company data provided');
            return;
        }

        currentCompanyData = companyData;
        currentUserPlatformIdNumber = userPlatformIdNumber;

        const container = document.querySelector('.seller-company-info-container');
        if (!container) {
            console.error('Seller company info container not found');
            return;
        }

        // Use sellerCompanyname from user-data.json if available, otherwise fallback
        const companyName = companyData.sellerCompanyname || companyData.sellerCompanyName || 'شركة غير معروفة';
        const companyLogo = companyData.sellerCompanyLogo || '';
        // sellerCompanyBanner should come from sellerCompanyDataObject object
        const companyImage = companyData.sellerCompanyBanner || 'default-company-banner.png';
        const companyDescription = companyData.sellerCompanyDescription || '';

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
                ${companyData.sellerCompanyAddress ? `
                <div class="seller-company-detail-item ${companyData.sellerCompanyAddressUrl ? 'clickable' : ''}" ${companyData.sellerCompanyAddressUrl ? `data-url="${companyData.sellerCompanyAddressUrl}"` : ''}>
                    <i data-lucide="map-pin" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">${companyData.sellerCompanyAddress}</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.sellerCompanyPhone ? `
                <div class="seller-company-detail-item">
                    <i data-lucide="phone" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">${companyData.sellerCompanyPhone}</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.sellerCompanyEmail ? `
                <div class="seller-company-detail-item">
                    <i data-lucide="mail" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">${companyData.sellerCompanyEmail}</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.sellerCompanyInstagram ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.sellerCompanyInstagram}">
                    <i data-lucide="instagram" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">إنستغرام</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.sellerCompanyTikTok ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.sellerCompanyTikTok}">
                    <i data-lucide="music" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">تيك توك</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.sellerCompanyTwitter ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.sellerCompanyTwitter}">
                    <i data-lucide="twitter" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">تويتر</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.sellerCompanyFacebook ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.sellerCompanyFacebook}">
                    <i data-lucide="facebook" class="seller-company-detail-icon"></i>
                    <span class="seller-company-detail-text">فيسبوك</span>
                    <i data-lucide="chevron-left" class="seller-company-detail-arrow"></i>
                </div>
                ` : ''}
                ${companyData.sellerCompanyYouTube ? `
                <div class="seller-company-detail-item clickable" data-url="${companyData.sellerCompanyYouTube}">
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

        // Load company auctions by userPlatformIdNumber (multiple auctions can have the same userPlatformIdNumber)
        loadCompanyAuctions(currentUserPlatformIdNumber);
    }

    /**
     * Get remaining time label similar to home auctions
     */
    /**
     * Flip clock helpers (matching auction cards)
     */
    function createFlipDigit(digit, unit) {
        return `
            <div class="flip-digit-box" data-unit="${unit}">
                <div class="flip-digit-inner">
                    <span class="flip-digit-text">${digit}</span>
                </div>
            </div>
        `;
    }

    function createFlipClockHTML(timeObj) {
        const daysStr = padNumber(timeObj.days);
        const hoursStr = padNumber(timeObj.hours);
        const minutesStr = padNumber(timeObj.minutes);
        const secondsStr = padNumber(timeObj.seconds);

        return `
            <div class="flip-clock-container">
                <div class="flip-time-group">
                    <div class="flip-digits-pair">
                        ${createFlipDigit(daysStr[0], 'days')}${createFlipDigit(daysStr[1], 'days')}
                    </div>
                    <div class="flip-label">يوم</div>
                </div>
                <div class="flip-time-group">
                    <div class="flip-digits-pair">
                        ${createFlipDigit(hoursStr[0], 'hours')}${createFlipDigit(hoursStr[1], 'hours')}
                    </div>
                    <div class="flip-label">ساعة</div>
                </div>
                <div class="flip-time-group">
                    <div class="flip-digits-pair">
                        ${createFlipDigit(minutesStr[0], 'minutes')}${createFlipDigit(minutesStr[1], 'minutes')}
                    </div>
                    <div class="flip-label">دقيقة</div>
                </div>
                <div class="flip-time-group">
                    <div class="flip-digits-pair">
                        ${createFlipDigit(secondsStr[0], 'seconds')}${createFlipDigit(secondsStr[1], 'seconds')}
                    </div>
                    <div class="flip-label">ثانية</div>
                </div>
            </div>
        `;
    }

    function updateFlipDigit(digitBox, newDigit) {
        const digitText = digitBox.querySelector('.flip-digit-text');
        if (!digitText) return;
        const currentDigit = digitText.textContent;
        if (currentDigit === newDigit) return;
        digitBox.classList.add('flip-animate');
        setTimeout(() => {
            digitText.textContent = newDigit;
        }, 150);
        setTimeout(() => {
            digitBox.classList.remove('flip-animate');
        }, 300);
    }

    function getRemainingTimeInfo(bidStartDate, bidEndDate) {
        const now = new Date();
        const start = parseArabicDate(bidStartDate);
        const end = parseArabicDate(bidEndDate);
        if (!start || !end) {
            return { label: 'ينتهي المزاد بعد:', targetDate: bidEndDate || bidStartDate };
        }
        if (now < start) {
            return { label: 'يبدأ المزاد بعد:', targetDate: bidStartDate };
        }
        if (now > end) {
            return { label: 'انتهى المزاد', targetDate: null };
        }
        return { label: 'ينتهي المزاد بعد:', targetDate: bidEndDate };
    }

    function updateCountdownTimer(element, bidStartDate, bidEndDate) {
        const remainingTimeInfo = getRemainingTimeInfo(bidStartDate, bidEndDate);

        // Update label sibling
        const parentSection = element.parentElement;
        if (parentSection) {
            const labelElement = parentSection.querySelector('.remaining-time-label');
            if (labelElement) {
                labelElement.textContent = remainingTimeInfo.label;
            }
        }

        // Ended
        if (!remainingTimeInfo.targetDate) {
            element.innerHTML = '<div style="color: #1e3d6f; font-weight: 600; text-align: center; padding: 0.5rem;">انتهى المزاد</div>';
            return;
        }

        const targetDate = parseArabicDate(remainingTimeInfo.targetDate);
        if (!targetDate) {
            element.innerHTML = '<div style="color: red;">Invalid date</div>';
            return;
        }

        const timeRemaining = calculateTimeRemaining(targetDate);

        // Ensure structure
        let container = element.querySelector('.flip-clock-container');
        if (!container) {
            element.innerHTML = createFlipClockHTML(timeRemaining);
            container = element.querySelector('.flip-clock-container');
            return;
        }

        // Update digits
        const daysStr = padNumber(timeRemaining.days);
        const hoursStr = padNumber(timeRemaining.hours);
        const minutesStr = padNumber(timeRemaining.minutes);
        const secondsStr = padNumber(timeRemaining.seconds);

        const timeGroups = container.querySelectorAll('.flip-time-group');
        const digitValues = [daysStr, hoursStr, minutesStr, secondsStr];

        timeGroups.forEach((group, groupIndex) => {
            const digitBoxes = group.querySelectorAll('.flip-digit-box');
            const value = digitValues[groupIndex];
            if (digitBoxes.length >= 2) {
                updateFlipDigit(digitBoxes[0], value[0]);
                updateFlipDigit(digitBoxes[1], value[1]);
            }
        });
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
     * Load company auctions by userPlatformIdNumber
     * Multiple auctions can have the same userPlatformIdNumber to indicate they're from the same company
     */
    async function loadCompanyAuctions(userPlatformIdNumber) {
        try {
            const response = await fetch('json-data/auction-property.json');
            if (!response.ok) {
                throw new Error('Failed to fetch auction data');
            }

            const auctions = await response.json();
            // Filter auctions by matching userPlatformIdNumber (same userPlatformIdNumber = same company)
            const companyAuctions = auctions.filter(auction => auction.userPlatformIdNumber === parseInt(userPlatformIdNumber));

            await renderCompanyAuctions(companyAuctions);
        } catch (error) {
            console.error('Error loading company auctions:', error);
        }
    }

    /**
     * Render company auctions
     */
    async function renderCompanyAuctions(auctions) {
        const auctionsList = document.getElementById('seller-auctions-list');
        const countElement = document.getElementById('seller-auctions-count');

        if (!auctionsList) return;

        if (countElement) {
            countElement.textContent = auctions.length;
        }

        // Fetch user data to get sellerCompanyname and sellerCompanyLogo
        let sellerCompanyName = null;
        let sellerCompanyLogo = null;
        try {
            const userResponse = await fetch('json-data/user-data.json');
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.sellerCompanyDataObject && userData.sellerCompanyDataObject.length > 0) {
                    sellerCompanyName = userData.sellerCompanyDataObject[0].sellerCompanyname || null;
                    sellerCompanyLogo = userData.sellerCompanyDataObject[0].sellerCompanyLogo || null;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch user data for seller company details:', error);
        }

        auctionsList.innerHTML = auctions.map(auction => {
            const imageUrl = auction.auction_image || '';
            const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';
            const companyLogo = sellerCompanyLogo ? `<img src="${sellerCompanyLogo}" alt="${sellerCompanyName || 'شركة'}" class="company-logo">` : '';
            const specialWordBadge = auction.auction_specialWord ?
                `<div class="home-page-special-word-badge">${auction.auction_specialWord}</div>` : '';

            const timeRemaining = auction.auction_bidStartDate || 'غير محدد';
            const auctionLocation = auction.auction_location || 'غير محدد';
            const assetCount = auction.auction_numberOfAssets || (auction.assets ? auction.assets.length : 0);
            const viewCount = auction.auction_viewCount || 0;
            const auctionTitle = auction.auction_title || 'عقار في المزاد';
            const remainingInfo = getRemainingTimeInfo(auction.auction_bidStartDate, auction.auction_bidEndDate);

            // Use sellerCompanyname from user-data.json if available, otherwise use a default company name
            const companyNameText = sellerCompanyName || 'شركة لمزاد العقارات';

            // Determine status badge (reuse existing statusClass/text)
            let statusBadgeText = '';
            let statusClass = '';
            if (auction.auction_bidStartDate && auction.auction_bidEndDate) {
                const startDate = new Date(auction.auction_bidStartDate.replace(/[—–−]/g, '-'));
                const endDate = new Date(auction.auction_bidEndDate.replace(/[—–−]/g, '-'));
                const now = new Date();

                if (now < startDate) {
                    statusBadgeText = 'قادم قريباً';
                    statusClass = 'upcoming-badge-home-page';
                } else if (now > endDate) {
                    statusBadgeText = 'إنتهى';
                    statusClass = 'ended-badge-home-page';
                } else {
                    statusBadgeText = 'جاري الآن';
                    statusClass = 'live-badge-home-page';
                }
            }

            return `
                <div class="property-card-home-page auction-card-home-page seller-company-auction-card" data-auction-id="${auction.id}">
                    <div class="card-header">
                        <div class="company-details">
                            ${companyLogo}
                            <span class="company-name">${companyNameText}</span>
                        </div>
                        ${specialWordBadge}
                    </div>
                    <div class="property-image-home-page" ${imageStyle}>
                        <div class="auction-badge-home-page">
                            ${statusBadgeText ? `
                            <span class="auction-status-badge-home-page ${statusClass}">
                                <i data-lucide="circle" class="badge-dot-home-page"></i>
                                ${statusBadgeText}
                            </span>` : ''}
                            <span class="auction-status-badge-home-page electronic-badge-home-page">
                                <i data-lucide="globe" class="badge-icon-home-page"></i>
                                إلكتروني
                            </span>
                        </div>
                    </div>
                    <div class="property-content-home-page">
                        <h3 class="property-title-home-page">${auctionTitle}</h3>
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
                                    <span>${auctionLocation}</span>
                                </div>
                                <i data-lucide="heart" class="property-card-heart-icon"></i>
                            </div>
                            <div class="bid-section-bottom">
                                <div class="remaining-time-label">${remainingInfo.label}</div>
                                <div class="remaining-time-counter"
                                    ${auction.auction_bidStartDate ? `data-bid-start-date="${auction.auction_bidStartDate}"` : ''}
                                    ${auction.auction_bidEndDate ? `data-bid-end-date="${auction.auction_bidEndDate}"` : ''}></div>
                            </div>
                        </div>
                        <div class="property-cta-container-home-page">
                            <div class="property-view-count-home-page">
                                <i data-lucide="eye" class="property-view-icon-home-page"></i>
                                <span class="property-view-number-home-page">${viewCount}</span>
                            </div>
                            <div class="auction-property-count-home-page">
                                <span class="property-view-number-home-page">عدد الأصول</span>
                                <span class="property-view-number-home-page">${assetCount}</span>
                            </div>
                            <button class="property-cta-btn-home-page">
                                شارك الآن
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Initialize Lucide icons for new content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Initialize countdown timers for these cards (local)
        const countdownElements = auctionsList.querySelectorAll('.remaining-time-counter[data-bid-start-date], .remaining-time-counter[data-bid-end-date]');
        countdownElements.forEach(el => {
            const start = el.getAttribute('data-bid-start-date');
            const end = el.getAttribute('data-bid-end-date');
            updateCountdownTimer(el, start, end);
            const interval = setInterval(() => updateCountdownTimer(el, start, end), 1000);
            // store on element for potential cleanup if needed later
            el._sellerCountdownInterval = interval;
        });

        // Add click handlers to auction cards
        const auctionCards = auctionsList.querySelectorAll('.seller-company-auction-card');
        auctionCards.forEach(card => {
            card.addEventListener('click', function () {
                // Scroll scrollable containers within auction-property-detail-section to top once section opens
                if (typeof window.scrollOnSectionOpen === 'function') {
                    window.scrollOnSectionOpen('auction-property-detail-section');
                }
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
    window.openSellerCompanyInfo = async function (userPlatformIdNumber) {
        try {
            // Store the current section before navigating
            if (typeof window.getCurrentSection === 'function') {
                // Store current section for back navigation
                window._previousSectionBeforeSellerInfo = window.getCurrentSection();
            }

            // Fetch user data from JSON (contains sellerCompanyDataObject)
            const userResponse = await fetch('json-data/user-data.json');
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await userResponse.json();

            // Check localStorage for saved company data and merge it
            const savedCompanyData = localStorage.getItem('sellerCompanyDataObject');
            if (savedCompanyData) {
                try {
                    const savedData = JSON.parse(savedCompanyData);
                    if (userData.sellerCompanyDataObject && userData.sellerCompanyDataObject.length > 0) {
                        userData.sellerCompanyDataObject[0] = { ...userData.sellerCompanyDataObject[0], ...savedData };
                    } else {
                        userData.sellerCompanyDataObject = [savedData];
                    }
                } catch (e) {
                    console.warn('Error parsing saved company data:', e);
                }
            }

            // Check if userPlatformIdNumber matches
            if (userData.userPlatformIdNumber !== parseInt(userPlatformIdNumber)) {
                console.error('User platform ID mismatch:', userPlatformIdNumber);
                alert('معلومات البائع غير متوفرة حالياً');
                return;
            }

            // Get company data from sellerCompanyDataObject
            const companyDetails = userData.sellerCompanyDataObject && userData.sellerCompanyDataObject.length > 0
                ? userData.sellerCompanyDataObject[0]
                : null;

            if (!companyDetails) {
                console.error('Company details not found');
                alert('معلومات الشركة غير متوفرة حالياً');
                return;
            }

            // Build company data object
            // Use sellerCompanyname from sellerCompanyDataObject if available
            const companyData = {
                ...companyDetails,
                sellerCompanyName: companyDetails.sellerCompanyname || userData.userName || companyDetails.sellerCompanyName || 'شركة غير معروفة',
                sellerCompanyname: companyDetails.sellerCompanyname || companyDetails.sellerCompanyName || userData.userName || 'شركة غير معروفة'
            };

            // Render the company info page
            renderSellerCompanyInfo(companyData, userPlatformIdNumber);

            // Show header
            const header = document.getElementById('seller-company-info-page-header');
            if (header) {
                header.style.display = 'flex';
                // Update title
                const titleElement = document.getElementById('seller-company-info-title');
                if (titleElement) {
                    titleElement.textContent = companyData.sellerCompanyName || companyData.auction_compName || 'معلومات البائع';
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
                window.switchToSection('seller-company-info-section');

                // Push navigation state to history after section is opened
                setTimeout(() => {
                    if (typeof window.pushNavigationState === 'function') {
                        window.pushNavigationState(false);
                    }
                }, 400); // Wait for animation to complete
            } else {
                console.error('switchToSection function not available');
            }

        } catch (error) {
            console.error('Error opening seller company info:', error);
            alert('حدث خطأ أثناء تحميل معلومات البائع');
        }
    };

    /**
     * Initialize the HTML structure for seller company info section
     */
    function initSellerCompanyInfoStructure() {
        const section = document.getElementById('seller-company-info-section');
        if (!section) {
            console.error('Seller company info section not found');
            return;
        }

        // Check if structure already exists
        if (section.querySelector('.settings-container')) {
            return;
        }

        // Create the HTML structure
        const html = `
            <div class="settings-container">
                <!-- Header -->
                <div id="seller-company-info-page-header" class="account-tabs-header" style="display: none;">
                    <button class="back-to-profile-btn" id="seller-company-info-back-btn" aria-label="العودة">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title" id="seller-company-info-title">اسم الشركة</h2>
                    <button class="share-btn" id="seller-company-info-share-btn" aria-label="مشاركة">
                        <i data-lucide="share-2" class="share-icon"></i>
                    </button>
                </div>

                <!-- Content Container -->
                <div class="seller-company-info-container scrollable-container">
                    <!-- Content will be rendered here by JavaScript -->
                </div>
            </div>
        `;

        section.innerHTML = html;

        // Initialize Lucide icons if available
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

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
                    const companyName = currentCompanyData.sellerCompanyName || currentCompanyData.auction_compName || 'شركة';
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

    /**
     * Initialize all components
     */
    function init() {
        initSellerCompanyInfoStructure();
        initBackButton();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

