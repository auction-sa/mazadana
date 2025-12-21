/**
 * Property Data Loading and Rendering
 * 
 * This file handles:
 * - Loading property data from JSON files
 * - Rendering property cards (for sale, rent, and auctions)
 * - Formatting prices and numbers
 * - Preloading images for better performance
 */

(function () {
    'use strict';

    /**
     * Configuration for each section
     * Tells the code which JSON file to load and which grid to render to
     */
    const dataConfig = {
        'home-section': {
            // Home section loads all data and organizes into 3 grids
            grids: {
                auctions: {
                    gridId: 'home-auctions-grid',
                    renderFunction: 'renderAuctionCard',
                    url: 'json-data/auction-property.json'
                },
                buy: {
                    gridId: 'home-buy-grid',
                    renderFunction: 'renderPropertyCard',
                    url: 'json-data/buy-property.json'
                },
                rent: {
                    gridId: 'home-rent-grid',
                    renderFunction: 'renderRentalCard',
                    url: 'json-data/rent-property.json'
                }
            }
        },
        'buy-section': {
            url: 'json-data/buy-property.json',
            gridId: 'buy-properties-grid',
            renderFunction: 'renderPropertyCard'
        },
        'rent-section': {
            url: 'json-data/rent-property.json',
            gridId: 'rent-properties-grid',
            renderFunction: 'renderRentalCard'
        },
        'auction-section': {
            url: 'json-data/auction-property.json',
            gridId: 'auction-properties-grid',
            renderFunction: 'renderAuctionCard'
        }
    };



    /**
     * Format rental price
     * Adds "ريال / شهرياً" (Riyal / Monthly) to the number
     */
    function formatRentalPrice(price) {
        return price + ' ريال / شهرياً';
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

    /* Format a number as two digits (e.g., 5 becomes "05") */
    function padNumber(num) {
        return num.toString().padStart(2, '0');
    }



    /* Create flip clock structure for countdown */
    function createFlipClockHTML(timeObj) {
        if (timeObj.expired) {
            return `
                <div class="flip-clock-container">
                    <div class="flip-time-group">
                        <div class="flip-digits-pair">
                            ${createFlipDigit('0', 'days')}${createFlipDigit('0', 'days')}
                        </div>
                        <div class="flip-label">يوم</div>
                    </div>
                    <div class="flip-time-group">
                        <div class="flip-digits-pair">
                            ${createFlipDigit('0', 'hours')}${createFlipDigit('0', 'hours')}
                        </div>
                        <div class="flip-label">ساعة</div>
                    </div>
                    <div class="flip-time-group">
                        <div class="flip-digits-pair">
                            ${createFlipDigit('0', 'minutes')}${createFlipDigit('0', 'minutes')}
                        </div>
                        <div class="flip-label">دقيقة</div>
                    </div>
                    <div class="flip-time-group">
                        <div class="flip-digits-pair">
                            ${createFlipDigit('0', 'seconds')}${createFlipDigit('0', 'seconds')}
                        </div>
                        <div class="flip-label">ثانية</div>
                    </div>
                </div>
            `;
        }

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
        // This ensures the old number stays visible during fade-out
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
     * @param {string} auction_bidStartDate - The bid start date string
     * @param {string} auction_bidEndDate - The bid end date string
     */
    function updateCountdownTimer(element, auction_bidStartDate, auction_bidEndDate) {
        // Get remaining time info to determine which date to use and what label to show
        const remainingTimeInfo = getRemainingTimeInfo(auction_bidStartDate, auction_bidEndDate);

        // Update the label (it's a sibling element within the same parent)
        const parentSection = element.parentElement;
        if (parentSection) {
            const labelElement = parentSection.querySelector('.remaining-time-label');
            if (labelElement) {
                labelElement.textContent = remainingTimeInfo.label;
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
        let container = element.querySelector('.flip-clock-container');

        if (!container) {
            // First time - create the structure
            element.innerHTML = createFlipClockHTML(timeRemaining);
            container = element.querySelector('.flip-clock-container');
            return;
        }

        // Update existing digits with animation
        const daysStr = padNumber(timeRemaining.days);
        const hoursStr = padNumber(timeRemaining.hours);
        const minutesStr = padNumber(timeRemaining.minutes);
        const secondsStr = padNumber(timeRemaining.seconds);

        // Get all time groups
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
     * Initialize countdown timers for all auction cards
     * Sets up interval to update timers every second
     */
    function initializeAuctionCountdowns() {
        // Find all auction cards with countdown timers
        const countdownElements = document.querySelectorAll('.remaining-time-counter[data-bid-start-date], .remaining-time-counter[data-bid-end-date]');

        // Clear any existing intervals
        if (window.auctionCountdownIntervals) {
            window.auctionCountdownIntervals.forEach(interval => clearInterval(interval));
        }
        window.auctionCountdownIntervals = [];

        // Set up interval for each countdown
        countdownElements.forEach(element => {
            const auction_bidStartDate = element.getAttribute('data-bid-start-date');
            const auction_bidEndDate = element.getAttribute('data-bid-end-date');

            // Need at least one date to proceed
            if (!auction_bidStartDate && !auction_bidEndDate) return;

            // Update immediately
            updateCountdownTimer(element, auction_bidStartDate, auction_bidEndDate);

            // Update every second
            const interval = setInterval(() => {
                updateCountdownTimer(element, auction_bidStartDate, auction_bidEndDate);
            }, 1000);

            window.auctionCountdownIntervals.push(interval);
        });
    }

    /**
     * Render property features (bedrooms, bathrooms, area)
     * Creates HTML for the features section of a property card
     */
    function renderFeatures(property) {
        const features = [];

        // Add totalBed if available (preferred over bedrooms if both exist)
        if (property.property_totalBed !== undefined) {
            features.push(`<i data-lucide="bed" class="property-feature-icon-home-page"></i> ${property.property_totalBed}`);
        }

        // Add totalBathroom if available (preferred over bathrooms if both exist)
        if (property.property_totalBathroom !== undefined) {
            features.push(`<i data-lucide="bath" class="property-feature-icon-home-page"></i> ${property.property_totalBathroom}`);
        }

        // Add area if available
        if (property.property_area) {
            // Handle area format - could be "450 م²" or just "450"
            const areaValue = property.property_area.toString().replace(/[^\d]/g, '');
            const areaText = areaValue ? `${areaValue} م²` : property.property_area;
            features.push(`<i data-lucide="maximize" class="property-feature-icon-home-page"></i> ${areaText}`);
        }

        // If no features, return empty string
        if (features.length === 0) return '';

        // Return HTML for features
        return `
            <div class="property-features-home-page">
                ${features.map(feature => `<span>${feature}</span>`).join('')}
            </div>
        `;
    }

    /**
     * Render property badge if exists
     * Badges are special labels like "New" or "Featured"
     */
    function renderBadge(badge) {
        if (!badge) return '';
        return `<div class="property-badge-home-page">${badge}</div>`;
    }

    /**
     * Get image URL with proper formatting
     * Handles different image URL formats and optimizes Unsplash URLs
     */
    function getImageUrl(property) {
        const imageUrl = property.auction_image || property.buyProperty_image || property.rentProperty_image || 'default-auction-main-image.jpg';
        if (!imageUrl) return null;

        // If it's an Unsplash URL without proper dimensions, add them
        if (imageUrl.includes('unsplash.com') && !imageUrl.includes('?w=') && !imageUrl.includes('?auto=')) {
            return `${imageUrl}?w=800&auto=format&fit=crop`;
        }

        return imageUrl;
    }

    /**
     * Preload a single image
     * Returns a Promise that resolves when the image is loaded
     */
    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                resolve(null);
                return;
            }

            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => {
                console.warn(`Failed to load image: ${url}`);
                resolve(url); // Resolve anyway to not block rendering
            };
            img.src = url;
        });
    }

    /**
     * Preload all images from properties
     * This makes images load faster when displayed
     */
    async function preloadAllImages(properties) {
        const imageUrls = properties
            .map(property => getImageUrl(property))
            .filter(url => url !== null);

        const preloadPromises = imageUrls.map(url => preloadImage(url));
        await Promise.all(preloadPromises);
    }

    /**
     * Render property card (for home and buy sections)
     * Creates the HTML for a property card that's for sale
     */
    function renderPropertyCard(property) {
        if (!property) return '';

        const imageUrl = getImageUrl(property);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';
        const companyLogo = property.buyProperty_compLogo ? `<img src="${property.buyProperty_compLogo}" alt="${property.buyProperty_compName || 'شركة'}" class="company-logo">` : '';
        const specialWordBadge = property.buyProperty_specialWord ?
            `<div class="home-page-special-word-badge">${property.buyProperty_specialWord}</div>` : '';

        return `
            <div class="property-card-home-page">
                <div class="card-header">
                    <div class="company-details">
                        ${companyLogo}
                        <span class="company-name">${property.buyProperty_compName || ''}</span>
                    </div>
                    ${specialWordBadge}
                </div>
                <div class="property-image-home-page" ${imageStyle}></div>
                ${renderBadge(property.badge)}
                <div class="property-content-home-page">
                    <h3 class="property-title-home-page" style="margin-bottom: 10px;">${property.buyProperty_title || 'عقار للبيع'}</h3>
                    <div class="bid-section-top">
                        <div class="location-wrapper">
                            <i data-lucide="map-pin" class="property-card-location-icon"></i>
                            <span>${property.buyProperty_location || 'غير محدد'}</span>
                        </div>
                        <i data-lucide="heart" class="property-card-heart-icon"></i>
                    </div>
                    ${renderFeatures(property)}
                    <p class="property-price-home-page">${property.buyProperty_price ? `${property.buyProperty_price} ريال` : 'غير محدد'}</p>
                    <div class="property-cta-container-home-page">
                        <div class="property-view-count-home-page">
                            <i data-lucide="eye" class="property-view-icon-home-page"></i>
                            <span class="property-view-number-home-page">${property.buyProperty_viewCount ? property.buyProperty_viewCount : '0'}</span>
                        </div>
                        <button class="property-cta-btn-home-page">
                            اشتري الآن
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render rental card (for rent section)
     * Creates the HTML for a rental property card
     */
    function renderRentalCard(property) {
        if (!property) return '';

        const imageUrl = getImageUrl(property);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';
        const companyLogo = property.rentProperty_compLogo ? `<img src="${property.rentProperty_compLogo}" alt="${property.rentProperty_compName || 'شركة'}" class="company-logo">` : '';
        const specialWordBadge = property.rentProperty_specialWord ?
            `<div class="home-page-special-word-badge">${property.rentProperty_specialWord}</div>` : '';

        // Handle price - check if it already includes "/ شهرياً" or "/ سنوياً"
        let priceText = property.rentProperty_price || '';
        if (priceText && !priceText.includes('/')) {
            priceText = formatRentalPrice(priceText);
        }

        return `
            <div class="property-card-home-page rental-card">
                <div class="card-header">
                    <div class="company-details">
                        ${companyLogo}
                        <span class="company-name">${property.rentProperty_compName || ''}</span>
                    </div>
                    ${specialWordBadge}
                </div>
                <div class="property-image-home-page" ${imageStyle}></div>
                ${renderBadge(property.badge)}
                <div class="property-content-home-page">
                    <h3 class="property-title-home-page" style="margin-bottom: 10px;">${property.rentProperty_title || 'عقار للإيجار'}</h3>
                    <div class="bid-section-top">
                        <div class="location-wrapper">
                            <i data-lucide="map-pin" class="property-card-location-icon"></i>
                            <span>${property.rentProperty_location || 'غير محدد'}</span>
                        </div>
                        <i data-lucide="heart" class="property-card-heart-icon"></i>
                    </div>
                    ${renderFeatures(property)}
                    <p class="property-price-home-page rental-price-home-page">${priceText || 'غير محدد'}</p>
                    <div class="property-cta-container-home-page">
                        <div class="property-view-count-home-page">
                            <i data-lucide="eye" class="property-view-icon-home-page"></i>
                            <span class="property-view-number-home-page">${property.rentProperty_viewCount ? property.rentProperty_viewCount : '0'}</span>
                        </div>
                        <button class="property-cta-btn-home-page">
                            استأجر الآن
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Determine auction badge status based on dates
     * @param {string} auction_bidStartDate - The bid start date string
     * @param {string} auction_bidEndDate - The bid end date string
     * @returns {Object} Object with text and className for the badge
     */
    function getAuctionBadgeStatus(auction_bidStartDate, auction_bidEndDate) {
        const now = new Date();
        const auction_startDate = parseArabicDate(auction_bidStartDate);
        const auction_endDate = parseArabicDate(auction_bidEndDate);

        // If dates can't be parsed, default to "جاري الآن"
        if (!auction_startDate || !auction_endDate) {
            return {
                text: 'جاري الآن',
                className: 'live-badge-home-page'
            };
        }

        // If current date is before start date -> "قادم" (Upcoming) with green bg
        if (now < auction_startDate) {
            return {
                text: 'قادم',
                className: 'upcoming-badge-home-page'
            };
        }

        // If current date is after end date -> "إنتهى" (Ended) with purple bg
        if (now > auction_endDate) {
            return {
                text: 'إنتهى',
                className: 'ended-badge-home-page'
            };
        }

        // If current date is between start and end date -> "جاري الآن" (Currently running)
        return {
            text: 'جاري الآن',
            className: 'live-badge-home-page'
        };
    }

    /**
     * Get remaining time label and target date for countdown
     * @param {string} auction_bidStartDate - The bid start date string
     * @param {string} auction_bidEndDate - The bid end date string
     * @returns {Object} Object with label text and target date string for countdown
     */
    function getRemainingTimeInfo(auction_bidStartDate, auction_bidEndDate) {
        const now = new Date();
        const auction_startDate = parseArabicDate(auction_bidStartDate);
        const auction_endDate = parseArabicDate(auction_bidEndDate);

        // If dates can't be parsed, default to showing end date
        if (!auction_startDate || !auction_endDate) {
            return {
                label: 'ينتهي المزاد بعد:',
                targetDate: auction_bidEndDate
            };
        }

        // If current date is before start date -> show countdown to start date
        if (now < auction_startDate) {
            return {
                label: 'يبدأ المزاد بعد:',
                targetDate: auction_bidStartDate
            };
        }

        // If current date is after end date -> auction has ended
        if (now > auction_endDate) {
            return {
                label: 'انتهى المزاد',
                targetDate: null // No countdown needed
            };
        }

        // If current date is between start and end date -> show countdown to end date
        return {
            label: 'ينتهي المزاد بعد:',
            targetDate: auction_bidEndDate
        };
    }

    /**
     * Render auction card (for auction section)
     * Creates the HTML for an auction property card
     */
    function renderAuctionCard(auction) {
        if (!auction) return '';

        const imageUrl = getImageUrl(auction);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';
        const companyLogo = auction.auction_compLogo ? `<img src="${auction.auction_compLogo}" alt="${auction.auction_compName || 'شركة'}" class="company-logo">` : '';
        const specialWordBadge = auction.auction_specialWord ?
            `<div class="home-page-special-word-badge">${auction.auction_specialWord}</div>` : '';

        // Handle timer - use 'timer' from JSON or fallback to 'timeRemaining'
        const timeRemaining = auction.auction_bidStartDate || 'غير محدد';


        // Get dynamic badge status
        const badgeStatus = getAuctionBadgeStatus(auction.auction_bidStartDate, auction.auction_bidEndDate);

        // Get remaining time info (label and target date)
        const remainingTimeInfo = getRemainingTimeInfo(auction.auction_bidStartDate, auction.auction_bidEndDate);

        return `
            <div class="property-card-home-page auction-card-home-page">
                <div class="card-header">
                    <div class="company-details">
                        ${companyLogo}
                        <span class="company-name">${auction.auction_compName || ''}</span>
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
                    <h3 class="property-title-home-page">${auction.auction_title || 'عقار في المزاد'}</h3>
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
                            <i data-lucide="heart" class="property-card-heart-icon"></i>
                        </div>
                        <div class="bid-section-bottom">
                            <div class="remaining-time-label">${remainingTimeInfo.label}</div>
                            <div class="remaining-time-counter" 
                                ${auction.auction_bidStartDate ? `data-bid-start-date="${auction.auction_bidStartDate}"` : ''}
                                ${auction.auction_bidEndDate ? `data-bid-end-date="${auction.auction_bidEndDate}"` : ''}></div>
                        </div>
                    </div>
                    <div class="property-cta-container-home-page">
                        <div class="property-view-count-home-page">
                            <i data-lucide="eye" class="property-view-icon-home-page"></i>
                            <span class="property-view-number-home-page">${auction.auction_viewCount ? auction.auction_viewCount : '0'}</span>
                        </div>
                        <div class="auction-property-count-home-page">
                            <span class="property-view-number-home-page">عدد الأصول</span>
                            <span class="property-view-number-home-page">${auction.auction_numberOfAssets ? auction.auction_numberOfAssets : '1'}</span>
                        </div>
                        <button class="property-cta-btn-home-page">
                            شارك الآن
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render properties to grid with image preloading
     * Takes an array of properties and renders them as cards in a grid
     */
    async function renderProperties(properties, gridElement, renderFunction) {
        if (!gridElement) {
            console.error('Grid element not found');
            return;
        }

        // Clear existing content
        gridElement.innerHTML = '';

        // Handle empty data
        if (!properties || !Array.isArray(properties) || properties.length === 0) {
            gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">لا توجد عقارات متاحة حالياً</p>';
            return;
        }

        // Preload all images before rendering
        try {
            await preloadAllImages(properties);
        } catch (error) {
            console.warn('Some images failed to preload, continuing with rendering:', error);
        }

        // Render each property
        properties.forEach(property => {
            let cardHTML = '';

            // Choose the right render function based on the type
            switch (renderFunction) {
                case 'renderPropertyCard':
                    cardHTML = renderPropertyCard(property);
                    break;
                case 'renderRentalCard':
                    cardHTML = renderRentalCard(property);
                    break;
                case 'renderAuctionCard':
                    cardHTML = renderAuctionCard(property);
                    break;
                default:
                    console.error('Unknown render function:', renderFunction);
                    return;
            }

            // Create temporary container to parse HTML
            const temp = document.createElement('div');
            temp.innerHTML = cardHTML.trim();
            const cardElement = temp.firstChild;

            if (cardElement) {
                gridElement.appendChild(cardElement);

                // Add click handler for auction cards
                if (renderFunction === 'renderAuctionCard' && cardElement.classList.contains('auction-card-home-page')) {
                    cardElement.addEventListener('click', function (e) {
                        // Don't trigger if clicking on buttons, heart icon, or interactive elements
                        if (e.target.closest('button') ||
                            e.target.closest('.property-cta-btn-home-page') ||
                            e.target.closest('.property-card-heart-icon') ||
                            e.target.classList.contains('property-card-heart-icon')) {
                            return;
                        }

                        // Check if a drag occurred in the parent horizontal-scroll-container
                        const horizontalContainer = cardElement.closest('.horizontal-scroll-container');
                        if (horizontalContainer && horizontalContainer.dataset.hasDragged === 'true') {
                            // A drag occurred, prevent click
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }

                        // Open property detail page
                        const auctionId = property.id;

                        // Determine status badge to pass to detail page for dynamic category tab
                        const badgeStatus = getAuctionBadgeStatus(property.auction_bidStartDate, property.auction_bidEndDate);

                        if (auctionId) {
                            if (typeof window.openPropertyDetail === 'function') {
                                window.openPropertyDetail(auctionId, badgeStatus);
                                // Scroll scrollable containers within property-detail-section to top
                                if (typeof window.scrollScrollableContainersToTop === 'function') {
                                    setTimeout(() => {
                                        window.scrollScrollableContainersToTop('property-detail-section');
                                    }, 15); // Wait for section to open
                                }
                            } else {
                                console.error('openPropertyDetail function not available');
                            }
                        } else {
                            console.error('Property ID not found:', property);
                        }
                    });

                    // Make card cursor pointer
                    cardElement.style.cursor = 'pointer';
                }
            }
        });

        // Reinitialize Lucide icons after rendering
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
                // Initialize heart icon click handlers after icons are created and DOM is ready
                requestAnimationFrame(() => {
                    initializeHeartIcons(gridElement);
                });
            }, 100);
        } else {
            // If Lucide is not available, still initialize heart icons after DOM is ready
            requestAnimationFrame(() => {
                initializeHeartIcons(gridElement);
            });
        }

        // Initialize countdown timers for auction cards
        if (renderFunction === 'renderAuctionCard') {
            setTimeout(() => {
                initializeAuctionCountdowns();
            }, 150);
        }

        // Initialize scroll indicators
        setTimeout(() => {
            initializeScrollIndicators(gridElement);
        }, 100);
    }

    /**
     * Fetch JSON data from a URL
     * Returns the parsed JSON data or null if there's an error
     */
    async function fetchPropertyData(url) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            return null;
        }
    }

    /**
     * Load and render data for a specific section
     * This is the main function that loads data and displays it
     */
    async function loadSectionData(sectionId) {
        const config = dataConfig[sectionId];

        if (!config) {
            console.warn(`No configuration found for section: ${sectionId}`);
            return;
        }

        // Check if section exists in DOM before proceeding
        const sectionElement = document.getElementById(sectionId);
        if (!sectionElement) {
            // Section doesn't exist in DOM, skip silently
            return;
        }

        // Ensure section is visible before loading
        if (sectionElement) {
            // Force section to be visible
            sectionElement.style.display = 'block';
            sectionElement.style.visibility = 'visible';
            sectionElement.style.opacity = '1';
            sectionElement.style.pointerEvents = 'auto';
            sectionElement.style.transform = 'translateX(0)';
            if (!sectionElement.classList.contains('active')) {
                sectionElement.classList.add('active');
            }
        }

        // Handle home-section differently (has multiple grids)
        if (sectionId === 'home-section' && config.grids) {
            // Load all three grids for home section
            const loadPromises = Object.entries(config.grids).map(async ([key, gridConfig]) => {
                const gridElement = document.getElementById(gridConfig.gridId);
                if (!gridElement) {
                    console.error(`Grid element not found: ${gridConfig.gridId}`);
                    return;
                }

                // Show loading state
                gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">جاري التحميل...</p>';

                try {
                    const data = await fetchPropertyData(gridConfig.url);
                    if (data === null) {
                        gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">حدث خطأ في تحميل البيانات.</p>';
                        return;
                    }

                    const properties = Array.isArray(data) ? data : (data.properties || data.items || []);
                    if (!properties || properties.length === 0) {
                        gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">لا توجد عقارات متاحة حالياً</p>';
                        return;
                    }

                    await renderProperties(properties, gridElement, gridConfig.renderFunction);
                } catch (error) {
                    console.error(`Error loading ${key} for home section:`, error);
                    gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">حدث خطأ في تحميل البيانات.</p>';
                }
            });

            await Promise.all(loadPromises);

            // Re-enable horizontal scrolling after all grids are loaded
            setTimeout(() => {
                const scrollContainers = document.querySelectorAll('.horizontal-scroll-container');
                scrollContainers.forEach(container => {
                    // Remove any inline styles that might block scrolling
                    container.style.removeProperty('overflow');
                    container.style.removeProperty('overflow-x');
                    container.style.removeProperty('overflow-y');
                    container.style.removeProperty('pointer-events');
                    // Explicitly set scroll properties
                    container.style.overflowX = 'auto';
                    container.style.overflowY = 'hidden';
                    container.style.pointerEvents = 'auto';
                    // Force browser to recalculate scroll properties
                    const scrollLeft = container.scrollLeft;
                    container.scrollLeft = scrollLeft;
                });

                // Ensure subsections have pointer-events enabled
                const subsections = document.querySelectorAll('.home-subsection');
                subsections.forEach(subsection => {
                    subsection.style.pointerEvents = 'auto';
                });
            }, 100);

            return;
        }

        // Handle other sections (single grid)
        const gridElement = document.getElementById(config.gridId);
        if (!gridElement) {
            // Grid element doesn't exist, skip silently (section may not be in DOM)
            return;
        }

        // Show loading state
        gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">جاري التحميل...</p>';

        try {
            // Fetch data
            const data = await fetchPropertyData(config.url);

            if (data === null) {
                console.error(`Failed to fetch data for ${sectionId}`);
                gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">حدث خطأ في تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
                return;
            }

            // Handle array data
            const properties = Array.isArray(data) ? data : (data.properties || data.items || []);

            if (!properties || properties.length === 0) {
                console.warn(`No properties found in data for ${sectionId}`);
                gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">لا توجد عقارات متاحة حالياً</p>';
                return;
            }

            // Render properties (with image preloading)
            await renderProperties(properties, gridElement, config.renderFunction);

            // Verify cards were rendered
            const renderedCards = gridElement.querySelectorAll('.property-card-home-page');

            if (renderedCards.length === 0) {
                console.error(`No cards were rendered for ${sectionId}! Check render function: ${config.renderFunction}`);
            } else {
                // Double-check section is still visible after rendering
                if (sectionElement) {
                    sectionElement.style.display = 'block';
                    sectionElement.style.visibility = 'visible';
                    sectionElement.style.opacity = '1';
                    sectionElement.style.pointerEvents = 'auto';
                    sectionElement.style.transform = 'translateX(0)';
                    if (!sectionElement.classList.contains('active')) {
                        sectionElement.classList.add('active');
                    }
                }
            }
        } catch (error) {
            console.error(`Error loading section data for ${sectionId}:`, error);
            gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">حدث خطأ في تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
        }
    }

    /**
     * Load all sections data
     * Loads data for all sections at once when page first loads
     */
    async function loadAllData() {
        const sectionIds = Object.keys(dataConfig);

        // Load data for all sections in parallel
        await Promise.all(sectionIds.map(sectionId => loadSectionData(sectionId)));
    }

    /**
     * Create scroll indicators for a horizontal scroll container
     * @param {HTMLElement} container - The horizontal-scroll-container element
     */
    function createScrollIndicators(container) {
        const cards = container.querySelectorAll('.property-card-home-page');
        if (cards.length === 0) {
            // Hide indicators if no cards
            const wrapper = container.parentElement;
            if (wrapper && wrapper.classList.contains('horizontal-scroll-wrapper')) {
                const indicatorsContainer = wrapper.querySelector('.scroll-indicators');
                if (indicatorsContainer) {
                    indicatorsContainer.style.display = 'none';
                }
            }
            return null;
        }

        // Find the corresponding indicators container
        const wrapper = container.parentElement;
        if (!wrapper || !wrapper.classList.contains('horizontal-scroll-wrapper')) return null;

        const indicatorsContainer = wrapper.querySelector('.scroll-indicators');
        if (!indicatorsContainer) return null;

        // Show indicators container
        indicatorsContainer.style.display = 'flex';

        // Clear existing indicators
        indicatorsContainer.innerHTML = '';

        // Create indicators for each card
        cards.forEach((card, index) => {
            const indicator = document.createElement('span');
            indicator.className = 'scroll-indicator';
            indicator.setAttribute('data-index', index);
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('aria-label', `Go to card ${index + 1}`);

            // Add click handler to scroll to corresponding card
            indicator.addEventListener('click', () => {
                scrollToCard(container, card, index);
            });

            indicatorsContainer.appendChild(indicator);
        });

        // Set first indicator as active
        if (indicatorsContainer.firstChild) {
            indicatorsContainer.firstChild.classList.add('active');
        }

        return indicatorsContainer;
    }

    /**
     * Scroll to a specific card
     * @param {HTMLElement} container - The horizontal-scroll-container
     * @param {HTMLElement} card - The card element to scroll to
     * @param {number} index - The index of the card
     */
    function scrollToCard(container, card, index) {
        const containerRect = container.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        // Calculate scroll position to center the card
        const scrollLeft = container.scrollLeft;
        const cardLeft = card.offsetLeft - container.offsetLeft;
        const cardWidth = card.offsetWidth;
        const containerWidth = container.offsetWidth;

        // Center the card in the container
        const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2) + scrollLeft;

        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }

    /**
     * Update active indicator based on which card is centered
     * @param {HTMLElement} container - The horizontal-scroll-container
     */
    function updateActiveIndicator(container) {
        const wrapper = container.parentElement;
        if (!wrapper || !wrapper.classList.contains('horizontal-scroll-wrapper')) return;

        const indicatorsContainer = wrapper.querySelector('.scroll-indicators');
        if (!indicatorsContainer) return;

        const cards = container.querySelectorAll('.property-card-home-page');
        if (cards.length === 0) return;

        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closestCard = null;
        let closestDistance = Infinity;
        let closestIndex = 0;

        // Find the card closest to the center
        cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(cardCenter - containerCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestCard = card;
                closestIndex = index;
            }
        });

        // Update active indicator
        const indicators = indicatorsContainer.querySelectorAll('.scroll-indicator');
        indicators.forEach((indicator, index) => {
            if (index === closestIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    /**
     * Initialize heart icon click handlers
     * Makes heart icons clickable and toggles favorited state with animation
     * @param {HTMLElement} gridElement - The grid/container element
     */
    function initializeHeartIcons(gridElement) {
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initializeHeartIcons(gridElement);
            });
            return;
        }

        if (!gridElement) return;

        const heartIcons = gridElement.querySelectorAll('.property-card-heart-icon');

        heartIcons.forEach(heartIcon => {
            // Skip if already has a click handler attached
            if (heartIcon.hasAttribute('data-heart-handler-attached')) {
                return;
            }

            heartIcon.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent card click event
                e.preventDefault(); // Prevent any default behavior

                const isFavorited = heartIcon.classList.contains('favorited');

                if (isFavorited) {
                    // Remove favorited state (turn back to white)
                    heartIcon.classList.remove('favorited');
                    console.log('removed favorited state');
                } else {
                    // Add favorited state (turn red) and trigger animation
                    heartIcon.classList.add('favorited');
                    console.log('removed favorited state');
                }
            });

            // Mark as having handler attached
            heartIcon.setAttribute('data-heart-handler-attached', 'true');
        });
    }

    /**
     * Initialize scroll indicators for a container
     * @param {HTMLElement} gridElement - The grid/container element
     */
    function initializeScrollIndicators(gridElement) {
        if (!gridElement || !gridElement.classList.contains('horizontal-scroll-container')) return;

        // Create indicators
        const indicatorsContainer = createScrollIndicators(gridElement);
        if (!indicatorsContainer) return;

        // Initial update
        updateActiveIndicator(gridElement);

        // Update on scroll with throttling for better performance
        let scrollTimeout;
        gridElement.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateActiveIndicator(gridElement);
            }, 50); // Throttle scroll events
        });

        // Update on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateActiveIndicator(gridElement);
            }, 250);
        });
    }

    /**
     * Initialize data loading when DOM is ready
     */
    function initDataLoading() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAllData);
        } else {
            loadAllData();
        }
    }

    // Start data loading
    initDataLoading();

    /**
     * Export function to reload specific section
     * This can be called from other files to reload data
     */
    window.reloadSectionData = loadSectionData;

    /**
     * Export dataConfig for debugging/access
     * Other files can access this to see the configuration
     */
    window.dataConfig = dataConfig;
})();

