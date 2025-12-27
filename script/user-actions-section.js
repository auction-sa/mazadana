// My Actions Section - Tab Switching Logic
; (function () {
    'use strict';

    let eventListenersAttached = false;
    let myActionsRendered = false;

    // Create and append filter buttons to content
    function createFilterButtons(buttons, uniqueId) {
        const finishedContent = document.querySelector('.my-actions-tabs');
        if (!finishedContent) return;

        // Get or create the finished-filters container
        let filterContainer = document.querySelector('.finished-filters');

        if (!filterContainer) {
            filterContainer = document.createElement('div');
            filterContainer.className = 'finished-filters';
            if (finishedContent.lastChild) {
                finishedContent.insertBefore(filterContainer, finishedContent.lastChild);
            } else {
                finishedContent.appendChild(filterContainer);
            }
        } else {
            // Clear existing buttons
            filterContainer.innerHTML = '';
        }

        filterContainer.setAttribute('data-filter-for', uniqueId);

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'my-actions-tab';
            button.id = btn.id;
            button.textContent = btn.text;
            button.style.margin = '0';
            button.style.padding = '8px 16px';
            filterContainer.appendChild(button);
        });

        const filterButtons = filterContainer.querySelectorAll('.my-actions-tab');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const isActive = this.classList.contains('active');
                filterButtons.forEach(b => b.classList.remove('active'));
                if (!isActive) {
                    this.classList.add('active');
                }
                // You can add custom functionality here based on button id
                // Example: if (this.id === 'wallet-entry') { /* handle entry */ }
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
