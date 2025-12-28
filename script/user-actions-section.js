// My Actions Section - Tab Switching Logic
; (function () {
    'use strict';

    let eventListenersAttached = false;
    let myActionsRendered = false;
    let walletData = [];
    let activeFilterStates = {
        'finished': null,
        'wallet-cash-flow': null
    };

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
            walletContent.innerHTML = '';

            // Create balance title
            balanceTitle = document.createElement('div');
            balanceTitle.className = 'wallet-balance-title';

            const balanceLabel = document.createElement('span');
            balanceLabel.className = 'wallet-balance-label';
            balanceLabel.textContent = 'الرصيد الحالي: ';

            const balanceAmountContainer = document.createElement('span');
            balanceAmountContainer.className = 'wallet-balance-amount-container';

            const balanceAmount = document.createElement('span');
            balanceAmount.className = 'wallet-balance-amount';
            balanceAmount.textContent = userBalance.toLocaleString('en-US');

            const balanceIcon = document.createElement('img');
            balanceIcon.src = 'rial-icon.webp';
            balanceIcon.alt = 'Rial';
            balanceIcon.className = 'wallet-balance-icon';

            balanceAmountContainer.appendChild(balanceAmount);
            balanceAmountContainer.appendChild(balanceIcon);

            balanceTitle.appendChild(balanceLabel);
            balanceTitle.appendChild(balanceAmountContainer);

            // Create container for rows
            rowsContainer = document.createElement('div');
            rowsContainer.className = 'wallet-rows-container';

            walletContent.appendChild(balanceTitle);
            walletContent.appendChild(rowsContainer);
        } else {
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
            // Create main row container
            const rowWrapper = document.createElement('div');
            rowWrapper.className = 'wallet-row-wrapper';

            const row = document.createElement('div');
            row.className = `wallet-row wallet-row-${item.type}`;
            row.style.cursor = 'pointer';

            // Store item data for access
            row.dataset.description = item.description || '';
            row.dataset.referenceNumber = item.referenceNumber || '';

            const amountContainer = document.createElement('div');
            amountContainer.className = 'wallet-row-amount';

            const icon = document.createElement('img');
            icon.src = 'rial-icon.webp';
            icon.alt = 'Rial';
            icon.className = 'wallet-rial-icon';

            const amount = document.createElement('span');
            amount.className = 'wallet-amount';
            amount.textContent = item.amount.toLocaleString('en-US');

            amountContainer.appendChild(amount);
            amountContainer.appendChild(icon);

            const date = document.createElement('div');
            date.className = 'wallet-row-date';
            date.textContent = formatDate(item.date);


            row.appendChild(amountContainer);
            row.appendChild(date);

            // Create expandable content
            const expandableContent = document.createElement('div');
            expandableContent.className = 'wallet-row-expandable';

            if (item.description) {
                const descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'wallet-row-description';
                const descriptionLabel = document.createElement('span');
                descriptionLabel.className = 'wallet-row-label';
                descriptionLabel.textContent = 'الوصف: ';
                const descriptionText = document.createElement('span');
                descriptionText.textContent = item.description;
                descriptionDiv.appendChild(descriptionLabel);
                descriptionDiv.appendChild(descriptionText);
                expandableContent.appendChild(descriptionDiv);
            }

            if (item.referenceNumber) {
                const referenceDiv = document.createElement('div');
                referenceDiv.className = 'wallet-row-reference';
                const referenceLabel = document.createElement('span');
                referenceLabel.className = 'wallet-row-label';
                referenceLabel.textContent = 'رقم المرجع: ';
                const referenceText = document.createElement('span');
                referenceText.textContent = item.referenceNumber;
                referenceDiv.appendChild(referenceLabel);
                referenceDiv.appendChild(referenceText);
                expandableContent.appendChild(referenceDiv);
            }

            rowWrapper.appendChild(row);
            rowWrapper.appendChild(expandableContent);

            // Only make row clickable if there's content to expand
            if (expandableContent.children.length > 0) {
                // Add click handler to toggle expansion
                row.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const wrapper = this.closest('.wallet-row-wrapper');

                    if (wrapper) {
                        wrapper.classList.toggle('expanded');
                    }
                });
            } else {
                // Remove cursor pointer if no expandable content
                row.style.cursor = 'default';
            }

            rowsContainer.appendChild(rowWrapper);
        });
    }

    // Create and append filter buttons to content
    function createFilterButtons(buttons, uniqueId) {
        const finishedContent = document.querySelector('.my-actions-tabs');
        if (!finishedContent) return;

        // Get or create the finished-filters container
        let filterContainer = document.querySelector('.finished-filters');
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
            filterContainer.className = 'finished-filters';
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
                    <h1 class="my-actions-title">احصائياتي</h1>
                </div>

                <div class="my-actions-tabs">
                    <div class="my-actions-tabs-main-buttons">
                        <button class="my-actions-tab active" data-tab="pending" id="pending-tab">
                            <span>المزادات قيد الانتظار</span>
                        </button>
                        <button class="my-actions-tab" data-tab="finished" id="finished-tab">
                            <span>المزادات المنتهية</span>
                        </button>
                        <button class="my-actions-tab" data-tab="wallet-cash-flow" id="wallet-cash-flow-tab">
                            <span>حركة المحفظة</span>
                        </button>
                    </div>
                </div>

                <div class="my-actions-content scrollable-container">
                    <div class="my-actions-tab-content active" id="pending-content">
                        <div class="my-actions-empty-state scrollable-container">
                            <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                        </div>
                    </div>

                    <div class="my-actions-tab-content" id="finished-content">
                        <div class="my-actions-empty-state scrollable-container">
                            <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                        </div>
                    </div>

                    <div class="my-actions-tab-content" id="wallet-cash-flow-content">
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

        const tabs = document.querySelectorAll('.my-actions-tab:not(.finished-filters .my-actions-tab)');
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
                    const finishedFilters = document.querySelector('.finished-filters');

                    if (targetTab === 'finished') {
                        setTimeout(() => {
                            const finishedButtons = [
                                { id: 'all-auctions', text: 'الكل' },
                                { id: 'won-auctions', text: 'الرابحة' },
                                { id: 'lost-auctions', text: 'الخاسرة' }
                            ];
                            createFilterButtons(finishedButtons, 'finished');
                            // Show finished-filters when finished tab is active
                            const filters = document.querySelector('.finished-filters');
                            if (filters) {
                                filters.style.display = 'flex';
                            }
                        }, 10);
                    } else if (targetTab === 'pending') {
                        // Hide filter container when pending tab is active
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
                            // Show finished-filters when wallet-cash-flow tab is active
                            const filters = document.querySelector('.finished-filters');
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

        // Ensure filter container is hidden initially (pending tab is active by default)
        setTimeout(() => {
            const finishedFilters = document.querySelector('.finished-filters');
            if (finishedFilters) {
                finishedFilters.style.display = 'none';
            }
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
