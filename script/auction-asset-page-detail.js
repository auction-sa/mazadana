/**
 * Auction Asset Property Detail Page
 * 
 * This file handles:
 * - Opening asset detail page when asset card is clicked
 * - Rendering asset details from JSON data
 * - Image gallery with swipe, pinch/zoom, and fullscreen
 * - Bottom sheet for attachments
 * - Sticky bottom action bar
 */

(function () {
    'use strict';

    let currentAssetData = null;
    let currentAuctionData = null;
    let previousSectionBeforeAssetDetail = null;

    /**
     * Initialize the HTML structure for auction asset detail section
     */
    function initAuctionAssetDetailStructure() {
        const section = document.getElementById('auction-asset-property-detail-section');
        if (!section) {
            console.error('Auction asset property detail section not found');
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
                <div id="auction-asset-property-detail-header" class="account-tabs-header" style="display: none;">
                    <button class="back-to-profile-btn" id="asset-detail-back-btn" aria-label="العودة">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">تفاصيل العقار</h2>
                    <button class="share-btn" id="asset-detail-share-btn" aria-label="مشاركة">
                        <i data-lucide="share-2" class="share-icon"></i>
                    </button>
                </div>

                <!-- Content Container -->
                <div class="auction-asset-property-detail-container scrollable-container">
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
     * Format number with commas
     */
    function formatNumber(num) {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Render the asset detail page
     */
    function renderAssetDetail(auction, asset, sellerCompanyName, sellerCompanyLogo) {
        if (!auction || !asset) {
            console.error('Auction or asset data not provided');
            return;
        }

        currentAssetData = asset;
        currentAuctionData = auction;

        const container = document.querySelector('.auction-asset-property-detail-container');
        if (!container) {
            console.error('Asset detail container not found');
            return;
        }

        // Get asset images
        const images = asset.auctionAsset_propertyImages || [asset.auctionAsset_image || ''].filter(Boolean);
        const companyLogo = sellerCompanyLogo || auction.auction_compLogo || '';
        const companyName = sellerCompanyName || auction.auction_compName || 'شركة المزاد';

        // Calculate total value (starting price + deposit)
        const startingPrice = parseFloat((asset.auctionAsset_startingPrice || '0').replace(/,/g, '')) || 0;
        const depositAmount = parseFloat((asset.auctionAsset_depositAmount || '0').replace(/,/g, '')) || 0;
        const totalValue = startingPrice + depositAmount;

        const html = `
            <!-- Company Info Section -->
            <div class="auction-property-main-page-detail-category-header">
                <div class="auction-property-main-page-detail-category-header-right">
                    <div class="category-icon-placeholder">
                        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="category-icon-image">` : ''}
                    </div>
                    <h3 class="category-title">${companyName}</h3>
                </div>
            </div>

            <!-- Image Gallery Section -->
            <div class="asset-detail-image-gallery">
                <div class="image-gallery-container" id="asset-image-gallery">
                    ${images.map((img, index) => `
                        <div class="gallery-image-wrapper ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${img}" alt="صورة ${index + 1}" class="gallery-image" data-index="${index}">
                        </div>
                    `).join('')}
                </div>
                ${images.length > 1 ? `
                    <div class="gallery-indicators">
                        ${images.map((_, index) => `<span class="gallery-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('')}
                    </div>
                    <div class="gallery-counter">
                        <span class="current-image-index">1</span> / <span class="total-images">${images.length}</span>
                    </div>
                ` : ''}
            </div>

            <!-- Asset Title -->
            <div class="asset-detail-title">
                ${asset.auctionAsset_title || 'عقار'} بصك ${asset.auctionAsset_deedNumber || asset.deedNumber || ''}
            </div>

            <!-- Highest Bid Section -->
            <div class="asset-detail-section">
                <h3 class="asset-detail-section-title">اعلى مزايدة</h3>
                <div class="empty-state">
                    <p class="empty-text">لا تتوفر اي مزادات حالياً</p>
                </div>
            </div>

            <!-- Pricing Information Card -->
            <div class="asset-detail-pricing-card">
                <div class="pricing-row">
                    <span class="pricing-label">قيمة التأمين</span>
                    <span class="pricing-value">
                        ${formatNumber(asset.auctionAsset_depositAmount || '0')}
                        <img src="rial-icon.webp" alt="ريال" class="rial-icon-small">
                    </span>
                </div>
                <div class="pricing-row">
                    <span class="pricing-label">قيمة التزايد</span>
                    <span class="pricing-value">
                        ${formatNumber(asset.auctionAsset_bidAmount || '0')}
                        <img src="rial-icon.webp" alt="ريال" class="rial-icon-small">
                    </span>
                </div>
                <div class="pricing-row">
                    <span class="pricing-label">السعر الافتتاحي</span>
                    <span class="pricing-value">
                        ${formatNumber(asset.auctionAsset_startingPrice || '0')}
                        <img src="rial-icon.webp" alt="ريال" class="rial-icon-small">
                    </span>
                </div>
                <div class="pricing-row pricing-row-total">
                    <span class="pricing-label">القيمة الإجمالية</span>
                    <span class="pricing-value pricing-value-total">
                        ${formatNumber(totalValue.toString())}
                        <img src="rial-icon.webp" alt="ريال" class="rial-icon-small">
                    </span>
                </div>
                <!-- Date Counter Container -->
                <div class="asset-date-counter-bottom-action-bar-container" id="asset-date-counter-container"></div>
                
                <!-- Pricing Buttons Row -->
                <div class="pricing-buttons-row">
                    <button class="bottom-action-btn">المشاركة في المزاد</button>
                    <button class="outlined-btn">تفاصيل الرسوم</button>
                </div>
                <div class="vat-notice">
                    تطبق ضريبة القيمة المضافة %15 على السعر لجميع المنتجات في هذا المزاد
                </div>
            </div>

            <!-- Property Details Section -->
            <div class="asset-detail-section">
                <h3 class="asset-detail-section-title">بيانات العقار</h3>
                <div class="product-details-list">
                    <div class="product-detail-row">
                        <i data-lucide="map-pin" class="detail-icon"></i>
                        <span class="detail-label">الموقع</span>
                        <span class="detail-value">${asset.auctionAsset_location || 'غير محدد'}</span>
                    </div>
                    <div class="product-detail-row">
                        <i data-lucide="copy" class="detail-icon"></i>
                        <span class="detail-label">رقم الصك</span>
                        <span class="detail-value">${asset.auctionAsset_deedNumber || asset.deedNumber || 'غير محدد'}</span>
                    </div>
                    <div class="product-detail-row">
                        <i data-lucide="calendar" class="detail-icon"></i>
                        <span class="detail-label">تاريخ البدء</span>
                        <span class="detail-value">${asset.auctionAsset_bidStartDate || 'غير محدد'}</span>
                    </div>
                    <div class="product-detail-row">
                        <i data-lucide="clock" class="detail-icon"></i>
                        <span class="detail-label">تاريخ الانتهاء</span>
                        <span class="detail-value">${asset.auctionAsset_bidEndDate || 'غير محدد'}</span>
                    </div>
                </div>
                <button class="product-attachments-btn outlined-btn" id="open-attachments-btn">مرفقات العقار</button>
            </div>

            <!-- Property Address Details Section -->
            <div class="asset-detail-section">
                <h3 class="asset-detail-section-title">عنوان العقار</h3>
                <div class="product-details-list">
                    <div class="product-detail-row">
                        <i data-lucide="map-pin" class="detail-icon"></i>
                        <span class="detail-label">الموقع</span>
                        <span class="detail-value">${asset.auctionAsset_location || 'غير محدد'}</span>
                    </div>
                    <div class="product-detail-row">
                        <i data-lucide="copy" class="detail-icon"></i>
                        <span class="detail-label">رقم الصك</span>
                        <span class="detail-value">${asset.auctionAsset_deedNumber || asset.deedNumber || 'غير محدد'}</span>
                    </div>
                    <div class="product-detail-row">
                        <i data-lucide="calendar" class="detail-icon"></i>
                        <span class="detail-label">تاريخ البدء</span>
                        <span class="detail-value">${asset.auctionAsset_bidStartDate || asset.bidStartDate || 'غير محدد'}</span>
                    </div>
                    <div class="product-detail-row">
                        <i data-lucide="clock" class="detail-icon"></i>
                        <span class="detail-label">تاريخ الانتهاء</span>
                        <span class="detail-value">${asset.auctionAsset_bidEndDate || asset.bidEndDate || 'غير محدد'}</span>
                    </div>
                </div>
            </div>

            <!-- Property Address Details Section -->
            <div class="asset-detail-section">
                <h3 class="asset-detail-section-title">موقع العقار والمعالم الجاورة</h3>
                <div id="auction-asset-property-location-google-map-container" class="google-map-container">
                    <!-- Google Map will be embedded here -->
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Populate countdown container if provided
        const countdownContainer = document.getElementById('asset-date-counter-container');
        if (countdownContainer && asset._countdownContainerId) {
            const sourceCountdownContainer = document.getElementById(asset._countdownContainerId);
            if (sourceCountdownContainer) {
                // Find the flip clock container within the countdown element
                // The structure is: div#asset-countdown-X contains .auction-property-main-page-detail-flip-clock-container
                const flipClockContainer = sourceCountdownContainer.querySelector('.auction-property-main-page-detail-flip-clock-container');

                // Get the countdown label from the parent .asset-countdown element
                const assetCountdownSection = sourceCountdownContainer.closest('.asset-countdown');
                const countdownLabel = assetCountdownSection?.querySelector('.countdown-label');

                if (flipClockContainer) {
                    // Clone the flip clock container (deep clone to get all nested elements)
                    const clonedFlipClock = flipClockContainer.cloneNode(true);

                    // Build the countdown HTML structure matching the original
                    // Structure: .asset-countdown > .countdown-label + div#asset-countdown-X > .auction-property-main-page-detail-flip-clock-container
                    if (countdownLabel) {
                        countdownContainer.innerHTML = `
                            <div class="countdown-label">${countdownLabel.textContent}</div>
                            <div id="asset-detail-bottom-countdown">
                                ${clonedFlipClock.outerHTML}
                            </div>
                        `;
                    } else {
                        countdownContainer.innerHTML = `
                            <div id="asset-detail-bottom-countdown">
                                ${clonedFlipClock.outerHTML}
                            </div>
                        `;
                    }

                    // Initialize countdown timer
                    setTimeout(() => {
                        const newCountdownElement = document.getElementById('asset-detail-bottom-countdown');
                        if (newCountdownElement) {
                            // Get dates from asset
                            const bidStartDate = asset.auctionAsset_bidStartDate || asset.bidStartDate;
                            const bidEndDate = asset.auctionAsset_bidEndDate || asset.bidEndDate;

                            // Use the exported countdown update function
                            if (typeof window.updateAssetCountdownTimer === 'function') {
                                // Update immediately
                                window.updateAssetCountdownTimer(newCountdownElement, bidStartDate, bidEndDate);

                                // Update countdown every second
                                const intervalId = setInterval(() => {
                                    window.updateAssetCountdownTimer(newCountdownElement, bidStartDate, bidEndDate);
                                }, 1000);

                                // Store interval ID for cleanup
                                asset._detailCountdownInterval = intervalId;
                            } else {
                                console.warn('updateAssetCountdownTimer not available, countdown may not update');
                            }
                        }
                        // Re-initialize Lucide icons for any icons in the countdown
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }, 100);
                } else {
                    // Fallback: if flip clock container doesn't exist yet, clone the entire countdown section
                    const assetCard = sourceCountdownContainer.closest('.auction-property-main-page-detail-asset-card');
                    if (assetCard) {
                        const countdownSection = assetCard.querySelector('.asset-countdown');
                        if (countdownSection) {
                            const clonedCountdown = countdownSection.cloneNode(true);
                            // Update IDs to avoid conflicts
                            const clonedContainer = clonedCountdown.querySelector('[id^="asset-countdown-"]');
                            if (clonedContainer) {
                                clonedContainer.id = 'asset-detail-bottom-countdown';
                            }
                            countdownContainer.innerHTML = clonedCountdown.outerHTML;

                            // Initialize countdown timer for fallback
                            setTimeout(() => {
                                const newCountdownElement = document.getElementById('asset-detail-bottom-countdown');
                                if (newCountdownElement) {
                                    const bidStartDate = asset.auctionAsset_bidStartDate || asset.bidStartDate;
                                    const bidEndDate = asset.auctionAsset_bidEndDate || asset.bidEndDate;

                                    if (typeof window.updateAssetCountdownTimer === 'function') {
                                        window.updateAssetCountdownTimer(newCountdownElement, bidStartDate, bidEndDate);

                                        const intervalId = setInterval(() => {
                                            window.updateAssetCountdownTimer(newCountdownElement, bidStartDate, bidEndDate);
                                        }, 1000);

                                        asset._detailCountdownInterval = intervalId;
                                    }
                                }
                                if (typeof lucide !== 'undefined') {
                                    lucide.createIcons();
                                }
                            }, 100);
                        }
                    }
                }
            }
        }

        // Initialize image gallery
        initImageGallery(images);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }

        // Initialize attachments bottom sheet
        initAttachmentsBottomSheet();

        // Initialize Google Map
        initPropertyLocationMap(asset);
    }

    /**
     * Initialize image gallery with swipe, pinch/zoom, and fullscreen
     */
    function initImageGallery(images) {
        if (images.length === 0) return;

        const galleryContainer = document.getElementById('asset-image-gallery');
        if (!galleryContainer) return;

        const imageWrappers = galleryContainer.querySelectorAll('.gallery-image-wrapper');
        // Get indicators within this gallery only
        const gallerySection = galleryContainer.closest('.asset-detail-image-gallery');
        const indicators = gallerySection ? gallerySection.querySelectorAll('.gallery-indicator') : [];
        const currentIndexSpan = gallerySection ? gallerySection.querySelector('.current-image-index') : null;
        let currentIndex = 0;
        let isZoomed = false;
        let currentScale = 1;
        let currentTranslateX = 0;
        let currentTranslateY = 0;
        // Touch variables for swipe (matching banner-slider.js)
        let touchStartX = 0;
        let touchEndX = 0;

        // Show image by index
        function showImage(index) {
            if (index < 0 || index >= imageWrappers.length) return;

            imageWrappers.forEach((wrapper, i) => {
                wrapper.classList.toggle('active', i === index);
            });

            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });

            if (currentIndexSpan) {
                currentIndexSpan.textContent = index + 1;
            }

            currentIndex = index;
            resetZoom();
        }

        // Reset zoom
        function resetZoom() {
            isZoomed = false;
            currentScale = 1;
            currentTranslateX = 0;
            currentTranslateY = 0;
            const activeImage = imageWrappers[currentIndex].querySelector('.gallery-image');
            if (activeImage) {
                activeImage.style.transform = 'scale(1) translate(0, 0)';
            }
        }

        // Handle touch events for swipe (matching banner-slider.js functionality)
        galleryContainer.addEventListener('touchstart', (e) => {
            if (isZoomed) return;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        galleryContainer.addEventListener('touchend', (e) => {
            if (isZoomed) return;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50; // Minimum distance for a swipe
            const diff = touchStartX - touchEndX;

            // If swipe distance is large enough
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - previous image (matching banner behavior)
                    showImage((currentIndex - 1 + imageWrappers.length) % imageWrappers.length);
                } else {
                    // Swipe right - next image (matching banner behavior)
                    showImage((currentIndex + 1) % imageWrappers.length);
                }
            }
        }

        // Add click handlers to gallery indicators (matching banner functionality)
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showImage(index);
            });
        });

        // Handle pinch/zoom and double tap
        imageWrappers.forEach((wrapper, index) => {
            const img = wrapper.querySelector('.gallery-image');
            if (!img) return;

            let initialDistance = 0;
            let initialScale = 1;
            let lastTap = 0;

            // Double tap to zoom
            img.addEventListener('touchend', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 300 && tapLength > 0) {
                    e.preventDefault();
                    if (isZoomed) {
                        resetZoom();
                    } else {
                        isZoomed = true;
                        currentScale = 2;
                        img.style.transition = 'transform 0.3s ease';
                        img.style.transform = 'scale(2) translate(0, 0)';
                    }
                }
                lastTap = currentTime;
            });

            // Pinch to zoom
            img.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    initialDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    initialScale = currentScale;
                }
            }, { passive: false });

            img.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const currentDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    const scale = initialScale * (currentDistance / initialDistance);
                    currentScale = Math.max(1, Math.min(3, scale));
                    isZoomed = currentScale > 1.1;
                    img.style.transition = 'none';
                    img.style.transform = `scale(${currentScale})`;
                }
            }, { passive: false });

            // Click to open fullscreen
            img.addEventListener('click', () => {
                openFullscreen(img.src);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!galleryContainer.closest('.tab-section.active')) return;

            if (e.key === 'ArrowRight') {
                showImage((currentIndex - 1 + imageWrappers.length) % imageWrappers.length);
            } else if (e.key === 'ArrowLeft') {
                showImage((currentIndex + 1) % imageWrappers.length);
            } else if (e.key === 'Escape') {
                closeFullscreen();
            }
        });
    }

    /**
     * Open image in fullscreen
     */
    function openFullscreen(imageSrc) {
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.className = 'fullscreen-image-container';
        fullscreenContainer.innerHTML = `
            <div class="fullscreen-image-overlay"></div>
            <img src="${imageSrc}" class="fullscreen-image" alt="Fullscreen image">
            <button class="fullscreen-close-btn" aria-label="إغلاق">
                <i data-lucide="x"></i>
            </button>
        `;

        document.body.appendChild(fullscreenContainer);
        document.body.style.overflow = 'hidden';

        // Initialize close button
        setTimeout(() => {
            const closeBtn = fullscreenContainer.querySelector('.fullscreen-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeFullscreen);
            }
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            fullscreenContainer.classList.add('active');
        }, 10);

        // Close on overlay click
        const overlay = fullscreenContainer.querySelector('.fullscreen-image-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeFullscreen);
        }
    }

    /**
     * Close fullscreen
     */
    function closeFullscreen() {
        const fullscreenContainer = document.querySelector('.fullscreen-image-container');
        if (fullscreenContainer) {
            fullscreenContainer.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(fullscreenContainer);
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Initialize property location map using Leaflet (OpenStreetMap)
     */
    function initPropertyLocationMap(asset) {
        const mapContainer = document.getElementById('auction-asset-property-location-google-map-container');
        if (!mapContainer) return;

        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded');
            mapContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">مكتبة الخريطة غير محملة</p>';
            return;
        }

        // For testing: Use a hardcoded location in Riyadh, Saudi Arabia
        // Riyadh coordinates: 24.7136° N, 46.6753° E
        const testLocation = {
            lat: 24.7136,
            lon: 46.6753,
            name: 'الرياض، المملكة العربية السعودية'
        };

        // Clear container
        mapContainer.innerHTML = '';

        // Create map div
        const mapDiv = document.createElement('div');
        mapDiv.id = 'property-location-map';
        mapDiv.style.width = '100%';
        mapDiv.style.height = '400px';
        mapDiv.style.borderRadius = 'var(--radius-sm)';
        mapContainer.appendChild(mapDiv);

        // Wait a bit to ensure the div is rendered
        setTimeout(() => {
            try {
                // Initialize Leaflet map with test coordinates
                const map = L.map('property-location-map', {
                    zoomControl: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    boxZoom: true,
                    keyboard: true,
                    dragging: true,
                    touchZoom: true
                }).setView([testLocation.lat, testLocation.lon], 15);

                // Add OpenStreetMap tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(map);

                // Add marker for property location
                const marker = L.marker([testLocation.lat, testLocation.lon]).addTo(map);
                marker.bindPopup(`<b>${testLocation.name}</b><br>موقع تجريبي للعقار`).openPopup();

                // Add a circle to show area of interest
                L.circle([testLocation.lat, testLocation.lon], {
                    color: '#2c5aa0',
                    fillColor: '#2c5aa0',
                    fillOpacity: 0.1,
                    radius: 500 // 500 meters
                }).addTo(map);
            } catch (error) {
                console.error('Error initializing map:', error);
                mapContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">حدث خطأ أثناء تحميل الخريطة: ' + error.message + '</p>';
            }
        }, 100);
    }

    /**
     * Initialize attachments bottom sheet
     */
    function initAttachmentsBottomSheet() {
        const openBtn = document.getElementById('open-attachments-btn');
        if (!openBtn) return;

        openBtn.addEventListener('click', () => {
            showAttachmentsBottomSheet();
        });
    }

    /**
     * Show attachments bottom sheet
     */
    function showAttachmentsBottomSheet() {
        // Remove existing sheet if any
        const existingSheet = document.querySelector('.attachments-bottom-sheet');
        if (existingSheet) {
            existingSheet.remove();
        }

        const bottomSheet = document.createElement('div');
        bottomSheet.className = 'attachments-bottom-sheet';
        bottomSheet.innerHTML = `
            <div class="bottom-sheet-overlay"></div>
            <div class="bottom-sheet-content">
                <div class="bottom-sheet-handle"></div>
                <h3 class="bottom-sheet-title">مرفقات العقار</h3>
                <div class="attachments-list">
                    <div class="attachment-item">
                        <i data-lucide="file-text" class="attachment-icon"></i>
                        <div class="attachment-info">
                            <span class="attachment-name">وثيقة العقار.pdf</span>
                            <span class="attachment-size">2.5 MB</span>
                        </div>
                        <button class="attachment-download-btn" aria-label="تحميل">
                            <i data-lucide="download"></i>
                        </button>
                    </div>
                    <div class="attachment-item">
                        <i data-lucide="file-text" class="attachment-icon"></i>
                        <div class="attachment-info">
                            <span class="attachment-name">مواصفات العقار.pdf</span>
                            <span class="attachment-size">1.8 MB</span>
                        </div>
                        <button class="attachment-download-btn" aria-label="تحميل">
                            <i data-lucide="download"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(bottomSheet);

        // Initialize Lucide icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
                // Ensure download icons are white
                setTimeout(() => {
                    const downloadIcons = bottomSheet.querySelectorAll('.attachment-download-btn [data-lucide="download"]');
                    downloadIcons.forEach(icon => {
                        const svg = icon.querySelector('svg');
                        if (svg) {
                            svg.style.stroke = 'white';
                            svg.style.color = 'white';
                            const paths = svg.querySelectorAll('path');
                            paths.forEach(path => {
                                path.style.stroke = 'white';
                            });
                        }
                    });
                }, 50);
            }
            bottomSheet.classList.add('active');
        }, 10);

        // Close handlers
        const overlay = bottomSheet.querySelector('.bottom-sheet-overlay');
        const handle = bottomSheet.querySelector('.bottom-sheet-handle');

        const closeSheet = () => {
            bottomSheet.classList.remove('active');
            setTimeout(() => {
                if (bottomSheet.parentNode) {
                    bottomSheet.parentNode.removeChild(bottomSheet);
                }
            }, 300);
        };

        if (overlay) overlay.addEventListener('click', closeSheet);
        if (handle) {
            let startY = 0;
            let currentY = 0;

            handle.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            }, { passive: true });

            handle.addEventListener('touchmove', (e) => {
                currentY = e.touches[0].clientY;
                const diff = currentY - startY;
                if (diff > 0) {
                    const sheetContent = bottomSheet.querySelector('.bottom-sheet-content');
                    if (sheetContent) {
                        sheetContent.style.transform = `translateY(${diff}px)`;
                    }
                }
            }, { passive: true });

            handle.addEventListener('touchend', () => {
                const sheetContent = bottomSheet.querySelector('.bottom-sheet-content');
                if (currentY - startY > 100) {
                    closeSheet();
                } else if (sheetContent) {
                    sheetContent.style.transform = '';
                }
                startY = 0;
                currentY = 0;
            }, { passive: true });
        }
    }

    /**
     * Get the current active section before opening asset detail
     */
    function getCurrentSectionBeforeAssetDetail() {
        if (typeof window.getCurrentSection === 'function') {
            return window.getCurrentSection();
        }

        const activeSection = document.querySelector('.tab-section.active');
        if (activeSection) {
            return activeSection.id;
        }

        return 'auction-property-detail-section';
    }

    /**
     * Initialize back button
     */
    function initBackButton() {
        const backBtn = document.getElementById('asset-detail-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                // Hide header
                const header = document.getElementById('auction-asset-property-detail-header');
                if (header) {
                    header.style.display = 'none';
                }

                // Navigate back to previous section
                if (typeof window.switchToSection === 'function') {
                    const previousSection = previousSectionBeforeAssetDetail || 'auction-property-detail-section';
                    window.switchToSection(previousSection);

                    // Scroll scrollable containers to top
                    if (typeof window.scrollScrollableContainersToTop === 'function') {
                        setTimeout(() => {
                            window.scrollScrollableContainersToTop(previousSection);
                        }, 50);
                    }
                }
            });
        }
    }

    /**
     * Initialize share button
     */
    function initShareButton() {
        const shareBtn = document.getElementById('asset-detail-share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                if (navigator.share && currentAssetData) {
                    navigator.share({
                        title: currentAssetData.auctionAsset_title || 'تفاصيل العقار',
                        text: currentAssetData.auctionAsset_title || 'تفاصيل العقار',
                        url: window.location.href
                    }).catch((err) => {
                        console.log('Error sharing:', err);
                    });
                } else {
                    // Fallback: copy to clipboard
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        if (window.showToastMessage) {
                            window.showToastMessage('تم نسخ الرابط بنجاح', 2000);
                        }
                    }
                }
            });
        }
    }

    /**
     * Open asset detail page
     */
    window.openAssetDetail = async function (auctionId, assetId, countdownContainerId = null) {
        try {
            // Store the current section before navigating
            previousSectionBeforeAssetDetail = getCurrentSectionBeforeAssetDetail();

            // Fetch auction data from JSON
            const response = await fetch('json-data/auction-property.json');
            if (!response.ok) {
                throw new Error('Failed to fetch auction data');
            }

            const auctions = await response.json();
            const auction = auctions.find(a => a.id === parseInt(auctionId));

            if (!auction) {
                console.error('Auction not found:', auctionId);
                alert('المزاد غير متوفر حالياً');
                return;
            }

            const asset = (auction.assets || []).find(a => a.id === parseInt(assetId));

            if (!asset) {
                console.error('Asset not found:', assetId);
                alert('المنتج غير متوفر حالياً');
                return;
            }

            // Store countdown container ID for later use
            if (countdownContainerId) {
                asset._countdownContainerId = countdownContainerId;
            }

            // Fetch user data to get seller company details
            let sellerCompanyName = null;
            let sellerCompanyLogo = null;
            try {
                const userResponse = await fetch('json-data/user-data.json');
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (userData.sellerCompanyDetails && userData.sellerCompanyDetails.length > 0) {
                        sellerCompanyName = userData.sellerCompanyDetails[0].sellerCompanyname || null;
                        sellerCompanyLogo = userData.sellerCompanyDetails[0].sellerCompanyLogo || null;
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch user data for seller company details:', error);
            }

            // Use auction company details as fallback
            if (!sellerCompanyName && auction.auction_compName) {
                sellerCompanyName = auction.auction_compName;
            }
            if (!sellerCompanyLogo && auction.auction_compLogo) {
                sellerCompanyLogo = auction.auction_compLogo;
            }

            // Render the detail page (countdown container ID is stored on asset object)
            renderAssetDetail(auction, asset, sellerCompanyName, sellerCompanyLogo);

            // Show header
            const header = document.getElementById('auction-asset-property-detail-header');
            if (header) {
                header.style.display = 'flex';
            }

            // Navigate to asset detail section
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('auction-asset-property-detail-section');

                // Scroll scrollable containers within auction-asset-property-detail-section to top once section opens
                if (typeof window.scrollOnSectionOpen === 'function') {
                    window.scrollOnSectionOpen('auction-asset-property-detail-section');
                }
            } else {
                console.error('switchToSection function not available');
            }

        } catch (error) {
            console.error('Error opening asset detail:', error);
            alert('حدث خطأ أثناء تحميل تفاصيل العقار');
        }
    };

    /**
     * Initialize all components
     */
    function init() {
        initAuctionAssetDetailStructure();
        initBackButton();
        initShareButton();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

