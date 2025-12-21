/**
 * Auction Property Detail Page
 * 
 * This file handles:
 * - Opening property detail page when auction card is clicked
 * - Rendering auction property details from JSON data
 * - Displaying assets with countdown timers
 * - Navigation back to previous section
 */

(function () {
    'use strict';

    let currentAuctionData = null;

    /**
     * Format date string for display
     */
    function formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        // Handle different date formats
        return dateString.replace('—', '-').trim();
    }

    /**
     * Parse Arabic date/time string to JavaScript Date object
     * Handles formats like "2025-12-28 12:00 صباحً" or "2025-12-28 12:00 مساءً"
     * @param {string} dateString - Date string in Arabic format
     * @returns {Date|null} Parsed date or null if invalid
     */
    function parseArabicDate(dateString) {
        if (!dateString) return null;

        try {
            // Replace Arabic time indicators and em dashes
            let normalized = dateString
                .replace(/صباحً|ص/g, 'AM')
                .replace(/مساءً|م/g, 'PM')
                .replace(/[—–−]/g, '-') // Replace various dash types with regular dash
                .trim();

            // Extract date and time parts
            const parts = normalized.split(/\s+/);
            if (parts.length < 2) return null;

            const datePart = parts[0]; // "2025-12-28" or "2025/12/11"
            const timePart = parts.slice(1).join(' '); // "12:00 AM" or "08:00 PM"

            // Parse the date
            const [year, month, day] = datePart.split(/[-\/]/).map(Number);
            if (!year || !month || !day) return null;

            // Parse time
            const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!timeMatch) return null;

            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const ampm = timeMatch[3].toUpperCase();

            // Convert to 24-hour format
            if (ampm === 'PM' && hours !== 12) {
                hours += 12;
            } else if (ampm === 'AM' && hours === 12) {
                hours = 0;
            }

            return new Date(year, month - 1, day, hours, minutes, 0);
        } catch (error) {
            console.warn('Failed to parse date:', dateString, error);
            return null;
        }
    }

    /**
     * Calculate time remaining until target date
     * @param {Date} targetDate - The target date to count down to
     * @returns {Object} Object with days, hours, minutes, seconds
     */
    function calculateTimeRemaining(targetDate) {
        if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds, expired: false };
    }

    /**
     * Get remaining time label and target date for countdown
     * @param {string} bidStartDate - The bid start date string
     * @param {string} bidEndDate - The bid end date string
     * @returns {Object} Object with label text and target date string for countdown
     */
    function getRemainingTimeInfo(bidStartDate, bidEndDate) {
        const now = new Date();
        const startDate = parseArabicDate(bidStartDate);
        const endDate = parseArabicDate(bidEndDate);

        // If dates can't be parsed, default to showing end date
        if (!startDate || !endDate) {
            return {
                label: 'ينتهي المزاد بعد:',
                targetDate: bidEndDate || bidStartDate
            };
        }

        // If current date is before start date -> show countdown to start date
        if (now < startDate) {
            return {
                label: 'يبدأ في',
                targetDate: bidStartDate
            };
        }

        // If current date is after end date -> auction has ended
        if (now > endDate) {
            return {
                label: 'انتهى المزاد',
                targetDate: null // No countdown needed
            };
        }

        // If current date is between start and end date -> show countdown to end date
        return {
            label: 'ينتهي في',
            targetDate: bidEndDate
        };
    }

    /**
     * Format a number as two digits (e.g., 5 becomes "05")
     * @param {number} num - Number to format
     * @returns {string} Two-digit string
     */
    function padNumber(num) {
        return num.toString().padStart(2, '0');
    }

    /**
     * Create flip clock digit HTML structure
     * @param {string} digit - The digit to display
     * @param {string} unit - The unit type (days, hours, minutes, seconds)
     * @returns {string} HTML for a single digit box
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

    /**
     * Create flip clock structure for countdown
     * @param {Object} timeObj - Object with days, hours, minutes, seconds
     * @returns {string} HTML for the flip clock
     */
    function createFlipClockHTML(timeObj) {
        if (timeObj.expired) {
            return `
                <div class="auction-property-main-page-detail-flip-clock-container">
                    <div class="flip-time-group">
                        <div class="flip-digits-pair">
                            ${createFlipDigit('0', 'seconds')}${createFlipDigit('0', 'seconds')}
                        </div>
                        <div class="flip-label">ثانية</div>
                    </div>
                    <div class="flip-time-group">
                        <div class="flip-digits-pair">
                            ${createFlipDigit('0', 'minutes')}${createFlipDigit('0', 'minutes')}
                        </div>
                        <div class="flip-label">دقيقة</div>
                    </div>
                    <div class="flip-time-group">
                        <div class="flip-digits-pair">
                            ${createFlipDigit('0', 'hours')}${createFlipDigit('0', 'hours')}
                        </div>
                        <div class="flip-label">ساعة</div>
                    </div>
                    <div class="flip-time-group">
                        <div class="flip-digits-pair">
                            ${createFlipDigit('0', 'days')}${createFlipDigit('0', 'days')}
                        </div>
                        <div class="flip-label">يوم</div>
                    </div>
                </div>
            `;
        }

        const daysStr = padNumber(timeObj.days);
        const hoursStr = padNumber(timeObj.hours);
        const minutesStr = padNumber(timeObj.minutes);
        const secondsStr = padNumber(timeObj.seconds);

        return `
            <div class="auction-property-main-page-detail-flip-clock-container">
                <div class="flip-time-group">
                    <div class="flip-digits-pair">
                        ${createFlipDigit(secondsStr[1], 'seconds')}${createFlipDigit(secondsStr[0], 'seconds')}
                    </div>
                    <div class="flip-label">ثانية</div>
                </div>
                <div class="flip-time-group">
                    <div class="flip-digits-pair">
                        ${createFlipDigit(minutesStr[1], 'minutes')}${createFlipDigit(minutesStr[0], 'minutes')}
                    </div>
                    <div class="flip-label">دقيقة</div>
                </div>
                <div class="flip-time-group">
                    <div class="flip-digits-pair">
                        ${createFlipDigit(hoursStr[1], 'hours')}${createFlipDigit(hoursStr[0], 'hours')}
                    </div>
                    <div class="flip-label">ساعة</div>
                </div>
                <div class="flip-time-group">
                    <div class="flip-digits-pair">
                        ${createFlipDigit(daysStr[1], 'days')}${createFlipDigit(daysStr[0], 'days')}
                    </div>
                    <div class="flip-label">يوم</div>
                </div>
            </div>
        `;
    }

    /**
     * Update a single digit with flip animation
     * @param {HTMLElement} digitBox - The digit box element
     * @param {string} newDigit - The new digit value
     */
    function updateFlipDigit(digitBox, newDigit) {
        const digitText = digitBox.querySelector('.flip-digit-text');
        if (!digitText) return;

        const currentDigit = digitText.textContent;

        if (currentDigit === newDigit) return; // No change needed

        // Add flip animation class (old number will fade out)
        digitBox.classList.add('flip-animate');

        // Update the digit value at the midpoint (when old number is fully faded out)
        setTimeout(() => {
            digitText.textContent = newDigit;
        }, 150); // Half of animation duration (50% - when fade-out completes)

        // Remove animation class after animation completes
        setTimeout(() => {
            digitBox.classList.remove('flip-animate');
        }, 300); // Match CSS animation duration
    }




    /**
     * Update countdown timer for a single element with flip clock
     * Also updates the label dynamically based on auction status
     * @param {HTMLElement} element - The container element
     * @param {string} bidStartDate - The bid start date string
     * @param {string} bidEndDate - The bid end date string
     */
    function updateCountdownTimer(element, bidStartDate, bidEndDate) {
        // Get remaining time info to determine which date to use and what label to show
        const remainingTimeInfo = getRemainingTimeInfo(bidStartDate, bidEndDate);

        // Update the label (it's a sibling element within the same parent)
        const parentSection = element.parentElement;
        if (parentSection) {
            const labelElement = parentSection.querySelector('.countdown-label');
            if (labelElement) {
                labelElement.textContent = `${remainingTimeInfo.label}:`;
            }
        }

        // If auction has ended, show ended message instead of countdown
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

        // Check if flip clock structure exists
        let container = element.querySelector('.auction-property-main-page-detail-flip-clock-container');

        if (!container) {
            // First time - create the structure
            element.innerHTML = createFlipClockHTML(timeRemaining);
            container = element.querySelector('.auction-property-main-page-detail-flip-clock-container');
            return;
        }

        // Update existing digits with animation
        const daysStr = padNumber(timeRemaining.days);
        const hoursStr = padNumber(timeRemaining.hours);
        const minutesStr = padNumber(timeRemaining.minutes);
        const secondsStr = padNumber(timeRemaining.seconds);

        // Get all time groups
        const timeGroups = container.querySelectorAll('.flip-time-group');
        // Reversed order to match HTML: seconds, minutes, hours, days
        const digitValues = [secondsStr, minutesStr, hoursStr, daysStr];

        timeGroups.forEach((group, groupIndex) => {
            const digitBoxes = group.querySelectorAll('.flip-digit-box');
            const value = digitValues[groupIndex];

            if (digitBoxes.length >= 2) {
                // Swap the digits: first box shows ones digit, second box shows tens digit
                updateFlipDigit(digitBoxes[0], value[1]);
                updateFlipDigit(digitBoxes[1], value[0]);
            }
        });
    }

    /**
     * Get asset status based on dates
     * @param {string} bidStartDate - The bid start date string
     * @param {string} bidEndDate - The bid end date string
     * @returns {Object} Object with text and className for the status badge
     */
    function getAssetStatus(bidStartDate, bidEndDate) {
        const now = new Date();
        const startDate = parseArabicDate(bidStartDate);
        const endDate = parseArabicDate(bidEndDate);

        // If dates can't be parsed, default to "جاري الآن"
        if (!startDate || !endDate) {
            return {
                text: 'جاري الآن',
                className: 'property-detail-status-live'
            };
        }

        // If current date is after end date -> "إنتهى" (Ended)
        if (now > endDate) {
            return {
                text: 'إنتهى',
                className: 'property-detail-status-ended'
            };
        }

        // If current date is between start and end date -> "جاري الآن" (Currently running)
        if (now >= startDate && now <= endDate) {
            return {
                text: 'جاري الآن',
                className: 'property-detail-status-live'
            };
        }

        // If current date is before start date -> "قادم قريباً" (Upcoming)
        if (now < startDate) {
            return {
                text: 'قادم قريباً',
                className: 'property-detail-status-upcoming'
            };
        }

        // Default fallback
        return {
            text: 'جاري الآن',
            className: 'property-detail-status-live'
        };
    }

    /**
     * Render asset card HTML
     */
    function renderAssetCard(asset, index) {
        // Get dates - handle both naming conventions
        const bidStartDate = asset.auctionAsset_bidStartDate || asset.bidStartDate;
        const bidEndDate = asset.auctionAsset_bidEndDate || asset.bidEndDate;
        const containerId = `asset-countdown-${asset.id || index}`;

        // Determine tags based on asset data
        const tags = [];
        if (asset.auctionAsset_location) tags.push({ text: 'محلي', class: 'tag-green' });
        if (bidStartDate) {
            const startDate = parseArabicDate(bidStartDate);
            const now = new Date();
            if (startDate && startDate > now) {
                tags.push({ text: 'قادم', class: 'tag-green' });
            }
        }
        tags.push({ text: 'الكتروني - انفاذ', class: 'tag-blue' });

        // Get remaining time info for label
        const remainingTimeInfo = getRemainingTimeInfo(bidStartDate, bidEndDate);

        // Get asset status for category tab
        const assetStatus = getAssetStatus(bidStartDate, bidEndDate);

        return `
            <div class="auction-property-main-page-detail-asset-card">
                <div class="auction-property-main-page-detail-asset-card-header">
                    <div class="asset-thumbnail">
                        <img src="${asset.auctionAsset_image || asset.auctionAsset_propertyImages?.[0] || ''}" alt="${asset.auctionAsset_title || 'عقار'}" onerror="this.style.display='none'">
                    </div>
                    <div class="asset-title-wrapper">
                        <h3 class="asset-title">${asset.auctionAsset_title || 'عقار'}<br><span class="asset-deed-number" style="color: var(--text-secondary);">بصك ${asset.auctionAsset_deedNumber || ''}</span></h3>
                    </div>
                    <i data-lucide="more-vertical" class="asset-menu-icon"></i>
                </div>
                

                <button class="auction-property-main-page-detail-category-tab">عقارات</button>
                <button class="auction-property-main-page-detail-category-tab" style="background: #eaf3ff; color: #2c5aa0;">إلكتروني - انفاذ</button>
                <button class="auction-property-main-page-detail-category-tab ${assetStatus.className}">${assetStatus.text}</button>
                

                <div class="asset-metadata">
                    <div class="metadata-item">
                        <i data-lucide="map-pin" class="metadata-icon"></i>
                        <span>${asset.auctionAsset_location || 'غير محدد'}</span>
                    </div>
                    <span class="metadata-divider">•</span>
                    <div class="metadata-item">
                        <span>10,041.25 م²</span>
                    </div>
                    <span class="metadata-divider">•</span>
                    <div class="metadata-item">
                        <span>زراعي / أرض</span>
                    </div>
                </div>
                
                <div class="auction-property-main-page-detail-asset-pricing-box">
                    <div class="auction-property-main-page-detail-pricing-row">
                        <span class="auction-property-main-page-detail-pricing-label">قيمة التزايد</span>
                        <span class="pricing-value">
                            ${asset.auctionAsset_bidAmount || '0'}
                            <span class="currency-symbol">⃁</span>
                        </span>

                    </div>
                    <div class="auction-property-main-page-detail-pricing-row">
                        <span class="auction-property-main-page-detail-pricing-label">السعر الافتتاحي</span>
                        <span class="pricing-value">
                            ${asset.auctionAsset_startingPrice || '0'}
                            <span class="currency-symbol">⃁</span>
                        </span>
                    </div>
                </div>
                
                <div class="asset-countdown">
                    <div class="countdown-label">${remainingTimeInfo.label}</div>
                    <div id="${containerId}"></div>
                </div>
                
                <div class="property-cta-container-home-page">
                    <div class="property-view-count-home-page">
                        <i data-lucide="eye" class="property-view-icon-home-page"></i>
                        <span class="property-view-number-home-page">${asset.auctionAsset_viewCount}</span>
                    </div>
                    <div class="auction-property-count-home-page">
                        <span class="property-view-number-home-page">عدد المزايدين</span>
                        <span class="property-view-number-home-page">${asset.auctionAsset_numberOfBidders}</span>
                    </div>
                    <button class="property-cta-btn-home-page">
                        المشاركة في المزاد
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render the property detail page
     */
    function renderPropertyDetail(auction, badgeStatus) {
        if (!auction) {
            console.error('No auction data provided');
            return;
        }

        currentAuctionData = auction;

        const container = document.querySelector('.auction-property-main-page-detail-container');
        if (!container) {
            console.error('Property detail container not found');
            return;
        }

        // Parse bid start date
        const startDate = formatDate(auction.auction_bidStartDate);
        const assets = auction.assets || [];
        const assetCount = assets.length;

        // Determine status label and class for category tab based on badge status
        let categoryStatusLabel = 'قادم قريباً';
        let categoryStatusClass = 'status-upcoming';
        const statusClassName = badgeStatus && badgeStatus.className ? badgeStatus.className : '';

        if (statusClassName.includes('live')) {
            categoryStatusLabel = 'جاري الآن';
            categoryStatusClass = 'property-detail-status-live';
        } else if (statusClassName.includes('upcoming')) {
            categoryStatusLabel = 'قادم قريباً';
            categoryStatusClass = 'property-detail-status-upcoming';
        }

        // Get company logo for category icon
        const categoryIcon = auction.auction_compLogo ? `<img src="${auction.auction_compLogo}" alt="${auction.auction_compName || 'شركة'}" class="category-icon-image">` : '';

        const html = `
            <!-- Category Section -->
            <div class="auction-property-main-page-detail-category-header">
                <div class="auction-property-main-page-detail-category-header-right">
                    <div class="category-icon-placeholder">${categoryIcon}</div>
                    <h3 class="category-title">${auction.auction_compName}</h3>
                </div>
                <i data-lucide="chevron-left" class="info-icon" style="cursor: pointer;" onclick="window.switchToSection('company-details-section')"></i>
            </div>


            <button class="auction-property-main-page-detail-category-tab">عقارات</button>
            <button class="auction-property-main-page-detail-category-tab" style="background: #eaf3ff; color: #2c5aa0;">إلكتروني - انفاذ</button>
            <button class="auction-property-main-page-detail-category-tab ${categoryStatusClass}">${categoryStatusLabel}</button>


            <!-- Auction Main Card -->
            <div class="auction-property-main-page-detail-top-image">
            <img src="${auction.auction_image}" alt="${auction.auction_title || 'مزادنا للعقارات السعودية'}">
            </div>

            <div>
                <h3 class="property-detail-auction-title">${auction.auction_title}</h3>
            </div>

            <!-- Info Section -->
            <div class="property-detail-info-card">
                <div class="info-item">
                    <i data-lucide="calendar" class="info-icon"></i>
                    <span class="info-label">تاريخ البدء: ${startDate}</span>
                </div>
                <div class="info-item">
                    <i data-lucide="package" class="info-icon"></i>
                    <span class="info-label">عدد المنتجات: ${assetCount}</span>
                </div>
                <div class="info-item">
                    <i data-lucide="map-pin" class="info-icon"></i>
                    <span class="info-label">المدينة: ${auction.auction_location || 'غير محدد'}</span>
                </div>
            </div>
            

            <!-- Buttons -->
            <div class="auction-property-main-page-detail-buttons">
                <button class="auction-property-main-page-detail-btn-primary">بروشور المزاد</button>
                <button class="auction-property-main-page-detail-btn-secondary">الشروط والأحكام</button>
            </div>

            <!-- Assets Section -->
            ${assets.map((asset, index) => renderAssetCard(asset, index)).join('')}
        `;

        // Batch DOM write operation
        container.innerHTML = html;

        // Defer heavy operations until after initial render for better performance
        // Use requestIdleCallback if available, otherwise use setTimeout
        const deferHeavyOperations = (callback) => {
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(callback, { timeout: 500 });
            } else {
                setTimeout(callback, 0);
            }
        };

        // Initialize countdown timers (deferred for better initial animation performance)
        deferHeavyOperations(() => {
            assets.forEach((asset, index) => {
                const containerId = `asset-countdown-${asset.id || index}`;
                const countdownElement = document.getElementById(containerId);
                if (!countdownElement) return;

                // Get dates - handle both naming conventions
                const bidStartDate = asset.auctionAsset_bidStartDate || asset.bidStartDate;
                const bidEndDate = asset.auctionAsset_bidEndDate || asset.bidEndDate;

                // Update immediately
                updateCountdownTimer(countdownElement, bidStartDate, bidEndDate);

                // Update countdown every second
                const intervalId = setInterval(() => {
                    updateCountdownTimer(countdownElement, bidStartDate, bidEndDate);
                }, 1000);

                // Store interval ID for cleanup
                asset._countdownInterval = intervalId;
            });
        });

        // Initialize Lucide icons (deferred for better initial animation performance)
        if (typeof lucide !== 'undefined') {
            deferHeavyOperations(() => {
                lucide.createIcons();
            });
        }
    }

    /**
     * Clean up countdown intervals
     */
    function cleanupCountdowns() {
        if (currentAuctionData && currentAuctionData.assets) {
            currentAuctionData.assets.forEach(asset => {
                if (asset._countdownInterval) {
                    clearInterval(asset._countdownInterval);
                    delete asset._countdownInterval;
                }
            });
        }
    }

    /**
     * Open property detail page
     */
    window.openPropertyDetail = async function (auctionId, badgeStatus) {
        try {
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

            // Render the detail page (optimized: render before navigation for smoother transition)
            renderPropertyDetail(auction, badgeStatus);

            // Show header
            const header = document.getElementById('auction-property-main-page-detail-header');
            if (header) {
                header.style.display = 'flex';
            }

            // Navigate to property detail section
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('property-detail-section');
            } else {
                console.error('switchToSection function not available');
            }

            // Scrolling is enabled in section-navigation.js when property-detail-section opens

        } catch (error) {
            console.error('Error opening property detail:', error);
            alert('حدث خطأ أثناء تحميل تفاصيل المزاد');
        }
    };

    /**
     * Initialize back button
     */
    function initBackButton() {
        const backBtn = document.getElementById('property-detail-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                // Clean up countdown intervals
                cleanupCountdowns();

                // Hide header
                const header = document.getElementById('auction-property-main-page-detail-header');
                if (header) {
                    header.style.display = 'none';
                }


                // Navigate back to previous section (use stored previous section, or home-section by default)
                if (typeof window.switchToSection === 'function') {
                    // Get the section we came from (could be auction-section, home-section, etc.)
                    const previousSection = (typeof window.getPreviousSectionBeforePropertyDetail === 'function')
                        ? window.getPreviousSectionBeforePropertyDetail()
                        : 'home-section';
                    window.switchToSection(previousSection);
                    // Scroll scrollable containers within home-section to top
                    if (typeof window.scrollScrollableContainersToTop === 'function') {
                        setTimeout(() => {
                            window.scrollScrollableContainersToTop('home-section');
                        }, 50); // Wait for section switch to complete
                    }
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
