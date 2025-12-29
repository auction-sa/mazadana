/**
 * Auction Place Bid Page - Deposit Payment Modal
 * 
 * This file handles:
 * - Deposit payment modal display
 * - Modal initialization and event handlers
 */

(function () {
    'use strict';

    /**
     * Format number with commas
     */
    function formatNumber(num) {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Initialize deposit payment modal
     */
    function initDepositPaymentModal() {
        const actionBtn = document.getElementById('auction-asset-bottom-action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                // Get current asset data from window if available
                const assetData = window.currentAssetData || null;
                showDepositPaymentModal(assetData);
            });
        }
    }

    /**
     * Show deposit payment modal
     * @param {Object} assetData - Current asset data object
     */
    function showDepositPaymentModal(assetData = null) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.deposit-payment-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Get deposit amount from asset data
        const depositAmount = assetData ?
            formatNumber(assetData.auctionAsset_depositAmount || '1000000') : '1,000,000';

        const modal = document.createElement('div');
        modal.className = 'deposit-payment-modal';
        modal.innerHTML = `
            <div class="deposit-payment-overlay"></div>
            <div class="deposit-payment-content">
                <button class="deposit-payment-close-btn" aria-label="إغلاق">
                    <i data-lucide="x"></i>
                </button>
                <h2 class="deposit-payment-title">دفع قيمة التأمين</h2>

                <p class="deposit-payment-description">عند دفع مبلغ التأمين من رصيدك، سيتم حجز المبلغ حتى إنتهاء المزاد، وبذلك تصبح مؤهلاً للمشاركة والمزايدة على هذا المزاد.</p>
                
                <div class="deposit-payment-section">
                    <h3 class="deposit-payment-section-title">الجهة</h3>
                    <div class="deposit-payment-radio-group">
                        <label class="deposit-payment-radio-label">
                            <input type="radio" name="deposit-party" value="original" checked>
                            <span class="deposit-payment-radio-custom"></span>
                            <span class="deposit-payment-radio-text">أصيل</span>
                        </label>
                        <label class="deposit-payment-radio-label">
                            <input type="radio" name="deposit-party" value="agent">
                            <span class="deposit-payment-radio-custom"></span>
                            <span class="deposit-payment-radio-text">وكيل</span>
                        </label>
                    </div>
                </div>

                <div class="deposit-payment-section">
                    <h3 class="deposit-payment-section-title">طريقة دفع التأمين</h3>
                    <div class="deposit-payment-radio-group">
                        <label class="deposit-payment-radio-label">
                            <input type="radio" name="deposit-payment-method" value="cash" checked>
                            <span class="deposit-payment-radio-custom"></span>
                            <span class="deposit-payment-radio-text">نقدي</span>
                        </label>
                    </div>
                </div>

                <div class="deposit-payment-form-rows">
                    <div class="deposit-payment-form-row">
                        <span class="deposit-payment-form-label">قيمة التأمين</span>
                        <div class="deposit-payment-form-value">
                            <i data-lucide="saudi-riyal" class="rial-icon"></i>
                            <span>${depositAmount}</span>
                        </div>
                    </div>
                    <div class="deposit-payment-form-row">
                        <span class="deposit-payment-form-label">رصيدك (نقدي)</span>
                        <div class="deposit-payment-form-value">
                            <i data-lucide="saudi-riyal" class="rial-icon"></i>
                            <span>0</span>
                        </div>
                    </div>
                </div>

                <p class="deposit-payment-warning">عذراً، رصيجك غير كافٍ لإتمام هذه العملية، يرجى شحن رصيدك للمتابعة.</p>

                <button class="deposit-payment-primary-btn">
                    <i data-lucide="plus"></i>
                    <span>إضافة أموال</span>
                </button>
                <button class="deposit-payment-secondary-btn" disabled>
                    حجز قيمة التأمين من رصيدك
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize Lucide icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            modal.classList.add('active');
        }, 10);

        // Close handlers
        const closeBtn = modal.querySelector('.deposit-payment-close-btn');
        const overlay = modal.querySelector('.deposit-payment-overlay');

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Expose showDepositPaymentModal function globally for use in other scripts
     */
    window.showDepositPaymentModal = showDepositPaymentModal;

    /**
     * Initialize when DOM is ready
     */
    function init() {
        // Wait a bit for the button to be rendered
        setTimeout(() => {
            initDepositPaymentModal();
        }, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready, but wait a bit for dynamic content
        setTimeout(init, 100);
    }

    // Also re-initialize when content is dynamically loaded
    // This is useful when the asset detail page is rendered
    const originalInit = init;
    window.reinitDepositPaymentModal = function () {
        setTimeout(originalInit, 100);
    };

})();

