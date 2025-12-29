// My Actions Section - Tab Switching Logic
; (function () {
    'use strict';

    let eventListenersAttached = false;
    let myActionsRendered = false;
    let walletData = [];
    let activeFilterStates = {
        'my-all-property-buying-history': null,
        'wallet-cash-flow': null,
        'my-own-property-posting': null
    };
    let auctionHistoryData = [];
    let allAuctionsData = [];

    // Fetch wallet data from user-data.json
    async function generateWalletTestData() {
        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            const walletMovements = userData.userWalletMovementsDataObject;

            if (!walletMovements) {
                console.warn('userWalletMovementsDataObject not found in user data');
                return [];
            }

            // Combine all movements with type indicators
            const allMovements = [];

            // Process entry movements
            if (walletMovements.entryMovements && Array.isArray(walletMovements.entryMovements)) {
                walletMovements.entryMovements.forEach(movement => {
                    allMovements.push({
                        type: 'entry',
                        amount: movement.amount || 0,
                        date: new Date(movement.date),
                        id: movement.id,
                        description: movement.description,
                        referenceNumber: movement.referenceNumber,
                        status: movement.status
                    });
                });
            }

            // Process exit movements
            if (walletMovements.exitMovements && Array.isArray(walletMovements.exitMovements)) {
                walletMovements.exitMovements.forEach(movement => {
                    allMovements.push({
                        type: 'exit',
                        amount: movement.amount || 0,
                        date: new Date(movement.date),
                        id: movement.id,
                        description: movement.description,
                        referenceNumber: movement.referenceNumber,
                        status: movement.status
                    });
                });
            }

            // Process processing movements
            if (walletMovements.processingMovements && Array.isArray(walletMovements.processingMovements)) {
                walletMovements.processingMovements.forEach(movement => {
                    allMovements.push({
                        type: 'processing',
                        amount: movement.amount || 0,
                        date: new Date(movement.date),
                        id: movement.id,
                        description: movement.description,
                        referenceNumber: movement.referenceNumber,
                        status: movement.status
                    });
                });
            }

            // Sort by date (newest first)
            allMovements.sort((a, b) => b.date.getTime() - a.date.getTime());

            return allMovements;
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            return [];
        }
    }

    // Fetch current user total balance from user-data.json
    async function fetchUserBalance() {
        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            const walletMovements = userData.userWalletMovementsDataObject;

            if (!walletMovements || typeof walletMovements.currentUserTotalBalance === 'undefined') {
                console.warn('currentUserTotalBalance not found in user data');
                return 0;
            }

            return walletMovements.currentUserTotalBalance || 0;
        } catch (error) {
            console.error('Error fetching user balance:', error);
            return 0;
        }
    }

    // Format date to Arabic format
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ar-SA', options);
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

    // Get remaining time info
    function getRemainingTimeInfo(auction_bidStartDate, auction_bidEndDate) {
        const now = new Date();
        const auction_startDate = parseArabicDate(auction_bidStartDate);
        const auction_endDate = parseArabicDate(auction_bidEndDate);

        if (!auction_startDate || !auction_endDate) {
            return {
                label: 'ينتهي المزاد بعد:',
                targetDate: auction_bidEndDate
            };
        }

        if (now < auction_startDate) {
            return {
                label: 'يبدأ المزاد بعد:',
                targetDate: auction_bidStartDate
            };
        }

        if (now > auction_endDate) {
            return {
                label: 'انتهى المزاد',
                targetDate: null
            };
        }

        return {
            label: 'ينتهي المزاد بعد:',
            targetDate: auction_bidEndDate
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

    // Fetch user auction history data
    async function fetchUserAuctionHistory() {
        try {
            const response = await fetch('json-data/user-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            const auctionHistory = userData.userAuctionHistoryDataObject;

            if (!auctionHistory || !Array.isArray(auctionHistory)) {
                return [];
            }

            return auctionHistory;
        } catch (error) {
            console.error('Error fetching user auction history:', error);
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
                            <i data-lucide="heart" class="property-card-heart-icon"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render auction history cards
    async function renderAuctionHistoryCards(filterType = 'all') {
        const content = document.getElementById('my-all-auctions-history-content');
        if (!content) return;

        // Fetch data if not already loaded
        if (auctionHistoryData.length === 0) {
            auctionHistoryData = await fetchUserAuctionHistory();
        }
        if (allAuctionsData.length === 0) {
            allAuctionsData = await fetchAllAuctions();
        }

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

        // Filter auctions by auctionId from history
        const auctionIds = auctionHistoryData.map(h => h.auctionId);
        let filteredAuctions = allAuctionsData.filter(auction => auctionIds.includes(auction.id));

        // Apply status filter
        if (filterType !== 'all') {
            const statusMap = {
                'running': 'running',
                'won': 'won',
                'lost': 'lost'
            };
            const targetStatus = statusMap[filterType];
            if (targetStatus) {
                filteredAuctions = filteredAuctions.filter(auction => {
                    const historyItem = auctionHistoryData.find(h => h.auctionId === auction.id);
                    return historyItem && historyItem.status === targetStatus;
                });
            }
        }

        // Create or get container
        let container = content.querySelector('.seller-company-auctions-list');
        if (!container) {
            // Remove empty state if exists
            const emptyState = content.querySelector('.my-actions-empty-state');
            if (emptyState) {
                emptyState.remove();
            }

            // Create seller-company-auctions-list container
            container = document.createElement('div');
            container.className = 'seller-company-auctions-list';
            content.appendChild(container);
        } else {
            container.innerHTML = '';
        }

        // Handle empty state
        if (filteredAuctions.length === 0) {
            container.innerHTML = `
                <div class="my-actions-empty-state scrollable-container">
                    <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                </div>
            `;
            // Update results count to 0
            const countElement = content.querySelector('#my-auctions-count');
            if (countElement) {
                countElement.textContent = '0';
            }
            return;
        }

        // Render cards
        filteredAuctions.forEach(auction => {
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

        // Update results count
        const countElement = content.querySelector('#my-auctions-count');
        if (countElement) {
            const visibleCards = container.querySelectorAll('.property-card-home-page.auction-card-home-page.seller-company-auction-card');
            countElement.textContent = visibleCards.length;
        }

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
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

        // Initialize countdown timers for these cards (same functionality as seller-auctions-list)
        // Use the global initializeAuctionCountdowns function which will find and initialize all countdowns
        setTimeout(() => {
            if (typeof window.initializeAuctionCountdowns === 'function') {
                window.initializeAuctionCountdowns();
            } else {
                console.warn('initializeAuctionCountdowns function not available');
            }
        }, 200);
    }

    // Render wallet cash flow rows
    async function renderWalletRows(filterType = 'all') {
        const walletContent = document.getElementById('wallet-cash-flow-content');
        if (!walletContent) return;

        // Fetch data if not already loaded
        if (walletData.length === 0) {
            walletData = await generateWalletTestData();
        }

        // Filter data based on type
        let filteredData = walletData;
        if (filterType === 'entry') {
            filteredData = walletData.filter(item => item.type === 'entry');
        } else if (filterType === 'exit') {
            filteredData = walletData.filter(item => item.type === 'exit');
        } else if (filterType === 'processing') {
            filteredData = walletData.filter(item => item.type === 'processing');
        }

        // Fetch user balance
        const userBalance = await fetchUserBalance();

        // Create or get balance title
        let balanceTitle = walletContent.querySelector('.wallet-balance-title');
        let rowsContainer = walletContent.querySelector('.wallet-rows-container');

        if (!balanceTitle || !rowsContainer) {
            walletContent.innerHTML = `
                <div class="wallet-balance-title">
                    <span class="wallet-balance-label">
                        رصيدك الحالي:
                    </span>

                    <span class="wallet-balance-amount-container">
                        <span class="wallet-balance-amount">
                            ${userBalance.toLocaleString('en-US')}
                        </span>

                        <i data-lucide="saudi-riyal" class="rial-icon"></i>
                    </span>
                </div>

                <div class="wallet-rows-container"></div>
            `;

            // Re-select elements after injection
            balanceTitle = walletContent.querySelector('.wallet-balance-title');
            rowsContainer = walletContent.querySelector('.wallet-rows-container');

            // Activate Lucide icons (required after innerHTML)
            lucide.createIcons();
        }
        else {
            // Update balance amount if title exists
            const balanceAmount = balanceTitle.querySelector('.wallet-balance-amount');
            if (balanceAmount) {
                balanceAmount.textContent = userBalance.toLocaleString('en-US');
            }
            rowsContainer.innerHTML = '';
        }

        if (filteredData.length === 0) {
            rowsContainer.innerHTML = `
                <div class="my-actions-empty-state scrollable-container">
                    <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                </div>
            `;
            return;
        }

        filteredData.forEach(item => {
            const hasExpandableContent = !!(item.description || item.referenceNumber);

            const rowWrapper = document.createElement('div');
            rowWrapper.className = 'wallet-row-wrapper';

            rowWrapper.innerHTML = `
                <div 
                    class="wallet-row wallet-row-${item.type}"
                    style="cursor: ${hasExpandableContent ? 'pointer' : 'default'}"
                    data-description="${item.description || ''}"
                    data-reference-number="${item.referenceNumber || ''}"
                >
                    <div class="wallet-row-amount">
                        <span class="wallet-amount">
                            ${item.amount.toLocaleString('en-US')}
                        </span>

                        <i data-lucide="saudi-riyal" class="rial-icon"></i>
                    </div>

                    <div class="wallet-row-date">
                        ${formatDate(item.date)}
                    </div>
                </div>

                <div class="wallet-row-expandable">
                    ${item.description ? `
                        <div class="wallet-row-description">
                            <span class="wallet-row-label">الوصف: </span>
                            <span>${item.description}</span>
                        </div>
                    ` : ''}

                    ${item.referenceNumber ? `
                        <div class="wallet-row-reference">
                            <span class="wallet-row-label">رقم المرجع: </span>
                            <span>${item.referenceNumber}</span>
                        </div>
                    ` : ''}
                </div>
            `;

            // Toggle expand only if expandable content exists
            if (hasExpandableContent) {
                const row = rowWrapper.querySelector('.wallet-row');

                row.addEventListener('click', e => {
                    e.stopPropagation();
                    rowWrapper.classList.toggle('expanded');
                });
            }

            rowsContainer.appendChild(rowWrapper);
        });

        // Activate Lucide icons ONCE after rendering all rows
        lucide.createIcons();
    }

    // Create and append filter buttons to content
    function createFilterButtons(buttons, uniqueId) {
        const finishedContent = document.querySelector('.my-actions-tabs');
        if (!finishedContent) return;

        // Get or create the all-user-auction-history-filters container
        let filterContainer = document.querySelector('.all-user-auction-history-filters');
        const currentFilterFor = filterContainer ? filterContainer.getAttribute('data-filter-for') : null;

        // Check if buttons already exist for this uniqueId
        if (filterContainer && currentFilterFor === uniqueId) {
            // Buttons already exist for this tab, just restore/update active state
            const filterButtons = filterContainer.querySelectorAll('.my-actions-tab');
            const filterFor = filterContainer.getAttribute('data-filter-for');

            // Restore active state if it exists
            if (activeFilterStates[filterFor]) {
                const savedActiveButton = filterContainer.querySelector(`#${activeFilterStates[filterFor]}`);
                if (savedActiveButton) {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    savedActiveButton.classList.add('active');
                }
            }
            return;
        }

        if (!filterContainer) {
            filterContainer = document.createElement('div');
            filterContainer.className = 'all-user-auction-history-filters';
            if (finishedContent.lastChild) {
                finishedContent.insertBefore(filterContainer, finishedContent.lastChild);
            } else {
                finishedContent.appendChild(filterContainer);
            }
        } else {
            // Clear existing buttons only if switching to a different tab
            filterContainer.innerHTML = '';
        }

        filterContainer.setAttribute('data-filter-for', uniqueId);

        buttons.forEach((btn, index) => {
            const button = document.createElement('button');
            button.className = 'my-actions-tab';
            button.id = btn.id;
            button.textContent = btn.text;
            filterContainer.appendChild(button);
        });

        const filterButtons = filterContainer.querySelectorAll('.my-actions-tab');
        const filterFor = filterContainer.getAttribute('data-filter-for');

        // Restore active state if it exists, otherwise set first button as active
        if (activeFilterStates[filterFor]) {
            const savedActiveButton = filterContainer.querySelector(`#${activeFilterStates[filterFor]}`);
            if (savedActiveButton) {
                filterButtons.forEach(b => b.classList.remove('active'));
                savedActiveButton.classList.add('active');
            } else {
                // Saved button doesn't exist, set first one as active
                if (filterButtons.length > 0) {
                    filterButtons[0].classList.add('active');
                    activeFilterStates[filterFor] = filterButtons[0].id;
                }
            }
        } else {
            // No saved state, set first button as active
            if (filterButtons.length > 0) {
                filterButtons[0].classList.add('active');
                activeFilterStates[filterFor] = filterButtons[0].id;
            }
        }

        filterButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                // If the clicked button is already active, exit early
                if (this.classList.contains('active')) {
                    return;
                }

                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Save the active button ID
                activeFilterStates[filterFor] = this.id;

                // Handle auction history filtering
                if (filterFor === 'my-all-auctions-history') {
                    let filterType = 'all';
                    if (this.id === 'running-auctions') {
                        filterType = 'running';
                    } else if (this.id === 'won-auctions') {
                        filterType = 'won';
                    } else if (this.id === 'lost-auctions') {
                        filterType = 'lost';
                    }
                    renderAuctionHistoryCards(filterType).catch(error => {
                        console.error('Error rendering auction history cards:', error);
                    });
                }

                // Handle wallet cash flow filtering
                if (filterFor === 'wallet-cash-flow') {
                    let filterType = 'all';
                    if (this.id === 'wallet-entry') {
                        filterType = 'entry';
                    } else if (this.id === 'wallet-exit') {
                        filterType = 'exit';
                    } else if (this.id === 'wallet-processing') {
                        filterType = 'processing';
                    }
                    renderWalletRows(filterType).catch(error => {
                        console.error('Error rendering wallet rows:', error);
                    });
                }

                // Handle property posting filtering
                if (filterFor === 'my-own-property-posting') {
                    let filterType = 'all';
                    if (this.id === 'running-postings') {
                        filterType = 'running';
                    } else if (this.id === 'previous-postings') {
                        filterType = 'previous';
                    }
                    // TODO: Add render function for posting cards
                    // renderPostingCards(filterType).catch(error => {
                    //     console.error('Error rendering posting cards:', error);
                    // });
                }
            });
        });
    }

    // Render my actions section markup
    function renderMyActionsSection() {
        const myActionsSection = document.getElementById('my-actions-section');
        if (!myActionsSection || myActionsRendered) return;

        myActionsSection.innerHTML = `
            <div class="section-content">
                <div class="my-actions-header">
                    <h1 class="my-actions-title">مشاركاتي</h1>
                </div>

                <div class="my-actions-tabs">
                    <div class="my-actions-tabs-main-buttons">
                        <button class="my-actions-tab active" data-tab="my-all-auctions-history" id="my-all-auctions-history-tab">
                            <span>سجل المزادات</span>
                        </button>
                        <button class="my-actions-tab" data-tab="my-all-property-buying-history" id="my-all-property-buying-history-tab">
                            <span>سجل الشراء</span>
                        </button>
                        <button class="my-actions-tab" data-tab="wallet-cash-flow" id="wallet-cash-flow-tab">
                            <span>سجل المحفظة</span>
                        </button>
                        <button class="my-actions-tab" data-tab="my-own-property-posting" id="my-own-property-posting-tab">
                            <span>سجل منشوراتي</span>
                        </button>
                    </div>
                </div>

                <div class="my-actions-content scrollable-container">
                    <div class="my-actions-tab-content active" id="my-all-auctions-history-content">
                        <div class="seller-company-results-count">النتائج: 
                            <span id="my-auctions-count">0</span> مزاد
                        </div>
                        <div class="seller-company-auctions-list"></div>
                    </div>

                    <div class="my-actions-tab-content" id="my-all-property-buying-history-content">
                        <div class="my-actions-empty-state scrollable-container">
                            <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                        </div>
                    </div>

                    <div class="my-actions-tab-content" id="wallet-cash-flow-content">
                        <div class="my-actions-empty-state scrollable-container">
                            <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                        </div>
                    </div>

                    <div class="my-actions-tab-content" id="my-own-property-posting-content">
                        <div class="my-actions-empty-state scrollable-container">
                            <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        eventListenersAttached = false;
        myActionsRendered = true;
    }

    // Initialize tab switching
    function initMyActionsTabs() {
        if (eventListenersAttached) return;

        const tabs = document.querySelectorAll('.my-actions-tab:not(.all-user-auction-history-filters .my-actions-tab)');
        const tabContents = document.querySelectorAll('.my-actions-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const targetTab = this.getAttribute('data-tab');
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));

                const targetContent = document.getElementById(`${targetTab}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');

                    // Show/hide filter div based on active tab
                    const finishedFilters = document.querySelector('.all-user-auction-history-filters');

                    if (targetTab === 'my-all-auctions-history') {
                        setTimeout(() => {
                            const finishedButtons = [
                                { id: 'all-auctions', text: 'الكل' },
                                { id: 'running-auctions', text: 'الجارية' },
                                { id: 'won-auctions', text: 'الرابحة' },
                                { id: 'lost-auctions', text: 'الخاسرة' }
                            ];
                            createFilterButtons(finishedButtons, 'my-all-auctions-history');
                            // Show all-user-auction-history-filters when my-all-auctions-history tab is active
                            const filters = document.querySelector('.all-user-auction-history-filters');
                            if (filters) {
                                filters.style.display = 'flex';
                            }
                            // Render auction cards with saved filter or default 'all'
                            const savedActiveId = activeFilterStates['my-all-auctions-history'];
                            let filterType = 'all';
                            if (savedActiveId === 'running-auctions') {
                                filterType = 'running';
                            } else if (savedActiveId === 'won-auctions') {
                                filterType = 'won';
                            } else if (savedActiveId === 'lost-auctions') {
                                filterType = 'lost';
                            }
                            renderAuctionHistoryCards(filterType).catch(error => {
                                console.error('Error rendering auction history cards:', error);
                            });
                        }, 10);


                    } else if (targetTab === 'my-all-property-buying-history') {
                        // Hide filter container when my-all-property-buying-history tab is active
                        if (finishedFilters) {
                            finishedFilters.style.display = 'none';
                        }


                    } else if (targetTab === 'wallet-cash-flow') {
                        setTimeout(() => {
                            const walletButtons = [
                                { id: 'all-wallet-movements', text: 'الكل' },
                                { id: 'wallet-entry', text: 'دخول' },
                                { id: 'wallet-exit', text: 'خروج' },
                                { id: 'wallet-processing', text: 'تحت المعالجة' }
                            ];
                            createFilterButtons(walletButtons, 'wallet-cash-flow');
                            // Show all-user-auction-history-filters when wallet-cash-flow tab is active
                            const filters = document.querySelector('.all-user-auction-history-filters');
                            if (filters) {
                                filters.style.display = 'flex';
                            }
                            // Use saved active state to determine filter type
                            const savedActiveId = activeFilterStates['wallet-cash-flow'];
                            let filterType = 'all';
                            if (savedActiveId === 'wallet-entry') {
                                filterType = 'entry';
                            } else if (savedActiveId === 'wallet-exit') {
                                filterType = 'exit';
                            } else if (savedActiveId === 'wallet-processing') {
                                filterType = 'processing';
                            }
                            renderWalletRows(filterType).catch(error => {
                                console.error('Error rendering wallet rows:', error);
                            });
                        }, 10);


                    } else if (targetTab === 'my-own-property-posting') {
                        setTimeout(() => {
                            const postingButtons = [
                                { id: 'all-postings', text: 'الكل' },
                                { id: 'running-postings', text: 'جاري العرض' },
                                { id: 'previous-postings', text: 'انتهى العرض' }
                            ];
                            createFilterButtons(postingButtons, 'my-own-property-posting');
                            // Show all-user-auction-history-filters when my-own-property-posting tab is active
                            const filters = document.querySelector('.all-user-auction-history-filters');
                            if (filters) {
                                filters.style.display = 'flex';
                            }
                            // Use saved active state to determine filter type
                            const savedActiveId = activeFilterStates['my-own-property-posting'];
                            let filterType = 'all';
                            if (savedActiveId === 'running-postings') {
                                filterType = 'running';
                            } else if (savedActiveId === 'previous-postings') {
                                filterType = 'previous';
                            }
                            // TODO: Add render function for posting cards
                            // renderPostingCards(filterType).catch(error => {
                            //     console.error('Error rendering posting cards:', error);
                            // });
                        }, 10);
                    }
                }
            });
        });

        eventListenersAttached = true;
    }

    // Initialize when DOM is ready
    function init() {
        const myActionsSection = document.getElementById('my-actions-section');
        if (!myActionsSection) {
            return;
        }

        renderMyActionsSection();
        initMyActionsTabs();

        // Create and show filters initially (my-all-auctions-history tab is active by default)
        setTimeout(() => {
            const finishedButtons = [
                { id: 'all-auctions', text: 'الكل' },
                { id: 'running-auctions', text: 'الجارية' },
                { id: 'won-auctions', text: 'الرابحة' },
                { id: 'lost-auctions', text: 'الخاسرة' }
            ];
            createFilterButtons(finishedButtons, 'my-all-auctions-history');
            // Show all-user-auction-history-filters
            const filters = document.querySelector('.all-user-auction-history-filters');
            if (filters) {
                filters.style.display = 'flex';
            }
            // Render auction history cards initially
            renderAuctionHistoryCards('all').catch(error => {
                console.error('Error rendering auction history cards:', error);
            });
        }, 50);

        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = myActionsSection.classList.contains('active');
                    if (isActive) {
                        setTimeout(() => {
                            initMyActionsTabs();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(myActionsSection, {
            attributes: true,
            attributeFilter: ['class']
        });

        if (myActionsSection.classList.contains('active')) {
            initMyActionsTabs();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.MyActionsTabs = {
        init: initMyActionsTabs
    };
})();
