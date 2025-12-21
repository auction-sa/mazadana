// Start New Auction Wizard Page Management
// This file contains all JavaScript code related to the Start New Auction wizard page
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let auctionWizardRendered = false;

    // Form data storage (auto-saved as user progresses)
    let formData = {
        step1: {
            sellerType: '',
            sellerName: '',
            contactEmail: '',
            contactPhone: '',
            propertyCity: '',
            propertyType: '',
            authorizationConfirmed: false
        },
        step2: {
            propertyTitle: '',
            propertyAddress: '',
            propertySize: '',
            propertySizeUnit: 'm²',
            propertyDescription: '',
            propertyImages: []
        },
        step3: {
            startPrice: '',
            reservePrice: '',
            bidIncrement: '',
            auctionStartDate: '',
            auctionStartTime: '',
            auctionEndDate: '',
            auctionEndTime: ''
        },
        step4: {
            proofOfOwnership: null,
            auctionApprovalNumber: '',
            auctionApprovalPDF: null,
            auctionTerms: '',
            sellerDeclaration: false
        },
        step5: {
            // Review step - no data, just displays summary
        }
    };

    // Current step (1-5)
    let currentStep = 1;

    /**
     * Auto-save form data to localStorage
     */
    function autoSaveData() {
        try {
            localStorage.setItem('auctionWizardData', JSON.stringify(formData));
            localStorage.setItem('auctionWizardCurrentStep', currentStep.toString());
        } catch (e) {
            console.warn('Failed to save wizard data:', e);
        }
    }

    /**
     * Load form data from localStorage
     */
    function loadSavedData() {
        try {
            const savedData = localStorage.getItem('auctionWizardData');
            const savedStep = localStorage.getItem('auctionWizardCurrentStep');
            if (savedData) {
                formData = JSON.parse(savedData);
            }
            if (savedStep) {
                currentStep = parseInt(savedStep, 10) || 1;
            }
        } catch (e) {
            console.warn('Failed to load wizard data:', e);
        }
    }

    /**
     * Build auction wizard view markup
     */
    function renderAuctionWizardView() {
        const auctionView = document.getElementById('add-new-auction-view');
        if (!auctionView) return;

        auctionWizardRendered = true;

        // Load saved data
        loadSavedData();

        auctionView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="start-auction-header">
                    <button class="back-btn" id="start-auction-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">بدأ مزاد جديد</h2>
                </div>

                <div class="auction-wizard-content-wrapper scrollable-container">
                    <!-- Progress Bar -->
                    <div class="progress-bar" id="wizard-progress-bar"></div>
                    <div class="wizard-progress">
                        <div class="progress-steps">
                            <div class="progress-step ${currentStep > 1 ? 'passed' : currentStep === 1 ? 'current' : 'future'}" data-step="1">
                                <span class="step-number">1</span>
                                <span class="step-label" data-step="1" data-mobile-label="بداية">البدء السريع</span>
                            </div>
                            <div class="progress-step ${currentStep > 2 ? 'passed' : currentStep === 2 ? 'current' : 'future'}" data-step="2">
                                <span class="step-number">2</span>
                                <span class="step-label" data-step="2" data-mobile-label="عقار">معلومات العقار</span>
                            </div>
                            <div class="progress-step ${currentStep > 3 ? 'passed' : currentStep === 3 ? 'current' : 'future'}" data-step="3">
                                <span class="step-number">3</span>
                                <span class="step-label" data-step="3" data-mobile-label="إعدادات">إعداد المزاد</span>
                            </div>
                            <div class="progress-step ${currentStep > 4 ? 'passed' : currentStep === 4 ? 'current' : 'future'}" data-step="4">
                                <span class="step-number">4</span>
                                <span class="step-label" data-step="4" data-mobile-label="مستندات">المستندات</span>
                            </div>
                            <div class="progress-step ${currentStep === 5 ? 'current' : 'future'}" data-step="5">
                                <span class="step-number">5</span>
                                <span class="step-label" data-step="5" data-mobile-label="مراجعة">المراجعة</span>
                            </div>
                        </div>
                    </div>

                    <!-- Step Content Container -->
                    <div class="wizard-steps-container">
                        ${renderStep1()}
                        ${renderStep2()}
                        ${renderStep3()}
                        ${renderStep4()}
                        ${renderStep5()}
                    </div>
                </div>
            </div>
        `;

        // Update progress bar
        updateProgressBar();

        // Show current step
        showStep(currentStep);

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;

        // Attach event listeners
        attachEventListeners();
    }

    /**
     * Render Step 1: Quick Start
     */
    function renderStep1() {
        const data = formData.step1;
        return `
            <div class="wizard-step" id="wizard-step-1">
                <h3 class="step-title">البدء السريع</h3>
                <p class="step-subtitle">ابدأ بإدخال معلوماتك الأساسية</p>

                <form class="wizard-form" id="step1-form">
                    <!-- Seller Type -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">نوع البائع</label>
                        <div class="add-new-auction-radio-group">
                            <label class="radio-label">
                                <input type="radio" name="sellerType" value="company" ${data.sellerType === 'company' ? 'checked' : ''}>
                                <span>شركة</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="sellerType" value="individual" ${data.sellerType === 'individual' ? 'checked' : ''}>
                                <span>فرد</span>
                            </label>
                        </div>
                    </div>

                    <!-- Seller Name -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label" id="seller-name-label">اسم البائع</label>
                        <input type="text" class="add-new-auction-form-input" id="seller-name" value="${data.sellerName}" 
                               placeholder="أدخل اسم الشركة أو البائع">
                        <small class="form-helper">اسم الشركة أو البائع كما سيظهر في المزاد</small>
                    </div>

                    <!-- Contact Email -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">البريد الإلكتروني</label>
                        <input type="email" class="add-new-auction-form-input" id="contact-email" value="${data.contactEmail}" 
                               placeholder="example@email.com" dir="ltr">
                        <small class="form-helper">سيتم استخدام هذا البريد للتواصل معك</small>
                    </div>

                    <!-- Contact Phone -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">رقم الهاتف</label>
                        <input type="tel" class="add-new-auction-form-input" id="contact-phone" value="${data.contactPhone}" 
                               placeholder="05xxxxxxxx" dir="ltr">
                        <small class="form-helper">رقم هاتف للتواصل السريع</small>
                    </div>

                    <!-- Property City -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">مدينة العقار</label>
                        <input type="text" class="add-new-auction-form-input" id="property-city" value="${data.propertyCity}" 
                               placeholder="مثل: الرياض، جدة، الدمام">
                        <small class="form-helper">المدينة التي يقع فيها العقار</small>
                    </div>

                    <!-- Property Type -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">نوع العقار</label>
                        <select class="add-new-auction-form-input" id="property-type">
                            <option value="">اختر نوع العقار</option>
                            <option value="residential" ${data.propertyType === 'residential' ? 'selected' : ''}>سكني</option>
                            <option value="commercial" ${data.propertyType === 'commercial' ? 'selected' : ''}>تجاري</option>
                            <option value="land" ${data.propertyType === 'land' ? 'selected' : ''}>أرض</option>
                            <option value="industrial" ${data.propertyType === 'industrial' ? 'selected' : ''}>صناعي</option>
                        </select>
                        <small class="form-helper">اختر نوع العقار المعروض</small>
                    </div>

                    <!-- Authorization Checkbox -->
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="authorization-checkbox" ${data.authorizationConfirmed ? 'checked' : ''}>
                            <span>أؤكد أن لدي الصلاحية لبيع هذه العقارات بالمزاد العلني.</span>
                        </label>
                    </div>

                    <!-- Step 1 Buttons -->
                    <div class="wizard-buttons">
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step1-save-btn">حفظ المعلومات</button>
                        <button type="button" class="wizard-btn wizard-btn-primary" id="step1-next-btn" ${!data.authorizationConfirmed ? 'disabled' : ''}>المرحلة التالية</button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render Step 2: Property Basics
     */
    function renderStep2() {
        const data = formData.step2;
        const imagePreviews = data.propertyImages.map((img, idx) => `
            <div class="image-preview-item" data-index="${idx}">
                <img src="${img.preview}" alt="Preview">
                <button type="button" class="remove-image-btn" data-index="${idx}">×</button>
            </div>
        `).join('');

        return `
            <div class="wizard-step" id="wizard-step-2" style="display: none;">
                <h3 class="step-title">معلومات العقار</h3>
                <p class="step-subtitle">أدخل تفاصيل العقار المعروض</p>

                <form class="wizard-form" id="step2-form">
                    <!-- Property Title -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">عنوان العقار</label>
                        <input type="text" class="add-new-auction-form-input" id="property-title" value="${data.propertyTitle}" 
                               placeholder="مثل: شقة فاخرة في حي العليا">
                        <small class="form-helper">عنوان واضح يصف العقار</small>
                    </div>

                    <!-- Property Address -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">العنوان الكامل</label>
                        <textarea class="add-new-auction-form-input form-textarea" id="property-address" rows="3" 
                                  placeholder="أدخل العنوان الكامل للعقار">${data.propertyAddress}</textarea>
                        <small class="form-helper">العنوان الكامل للعقار</small>
                    </div>

                    <!-- Property Size -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">مساحة العقار</label>
                        <div class="input-with-unit">
                            <input type="number" class="add-new-auction-form-input" id="property-size" value="${data.propertySize}" 
                            placeholder="0" min="0" step="0.01" dir="ltr">
                        </div>
                        <small class="form-helper">المساحة بالمتر المربع</small>
                    </div>

                    <!-- Property Description -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">وصف العقار</label>
                        <textarea class="add-new-auction-form-input form-textarea" id="property-description" rows="5" 
                                  placeholder="وصف تفصيلي للعقار...">${data.propertyDescription}</textarea>
                        <small class="form-helper">وصف شامل للعقار ومميزاته</small>
                    </div>

                    <!-- Property Images -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">صور العقار</label>
                        <div class="image-upload-area" id="image-upload-area">
                            <input type="file" id="property-images-input" multiple accept="image/*" style="display: none;">
                            <div class="upload-placeholder" id="upload-placeholder">
                                <i data-lucide="image" class="upload-icon"></i>
                                <p>اسحب الصور هنا أو اضغط للاختيار</p>
                                <small>يمكنك رفع عدة صور</small>
                            </div>
                            <div class="image-previews" id="image-previews">
                                ${imagePreviews}
                            </div>
                        </div>
                        <small class="form-helper">يمكنك تخطي رفع الصور الآن، لكن يُنصح برفعها لزيادة المصداقية</small>
                    </div>

                    <!-- Step 2 Buttons -->
                    <div class="wizard-buttons">
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step2-back-btn">خلف</button>
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step2-save-btn">حفظ المعلومات</button>
                        <button type="button" class="wizard-btn wizard-btn-primary" id="step2-next-btn">المرحلة التالية</button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render Step 3: Auction Setup
     */
    function renderStep3() {
        const data = formData.step3;
        return `
            <div class="wizard-step" id="wizard-step-3" style="display: none;">
                <h3 class="step-title">إعداد المزاد</h3>
                <p class="step-subtitle">حدد تفاصيل المزاد والوقت</p>

                <form class="wizard-form" id="step3-form">
                    <!-- Start Price -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">سعر البداية</label>
                        <div class="input-with-currency">
                            <input type="number" class="add-new-auction-form-input" id="start-price" value="${data.startPrice}" 
                                   placeholder="0" min="0" step="100" dir="ltr">
                            <span class="input-currency">⃁</span>
                        </div>
                        <small class="form-helper">السعر الذي يبدأ به المزاد</small>
                    </div>

                    <!-- Reserve Price -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">السعر الاحتياطي (اختياري)</label>
                        <div class="input-with-currency">
                            <input type="number" class="add-new-auction-form-input" id="reserve-price" value="${data.reservePrice}" 
                                   placeholder="0" min="0" step="100" dir="ltr">
                            <span class="input-currency">⃁</span>
                        </div>
                        <small class="form-helper">السعر الأدنى الذي تقبله (اختياري)</small>
                    </div>

                    <!-- Bid Increment -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">قيمة الزيادة</label>
                        <div class="input-with-currency">
                            <input type="number" class="add-new-auction-form-input" id="bid-increment" value="${data.bidIncrement}" 
                                   placeholder="0" min="0" step="100" dir="ltr">
                            <span class="input-currency">⃁</span>
                        </div>
                        <small class="form-helper">القيمة الدنيا للزيادة في كل مزايدة</small>
                    </div>

                    <!-- Auction Start Date & Time -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">تاريخ ووقت بدء المزاد</label>
                        <div class="datetime-group">
                            <input type="date" class="add-new-auction-form-input" id="auction-start-date" value="${data.auctionStartDate}">
                            <input type="time" class="add-new-auction-form-input" id="auction-start-time" value="${data.auctionStartTime}">
                        </div>
                        <small class="form-helper">متى يبدأ المزاد</small>
                    </div>

                    <!-- Auction End Date & Time -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">تاريخ ووقت إنتهاء المزاد</label>
                        <div class="datetime-group">
                            <input type="date" class="add-new-auction-form-input" id="auction-end-date" value="${data.auctionEndDate}">
                            <input type="time" class="add-new-auction-form-input" id="auction-end-time" value="${data.auctionEndTime}">
                        </div>
                        <small class="form-helper">متى ينتهي المزاد</small>
                    </div>

                    <!-- Timezone Display -->
                    <div class="timezone-display">
                        <small>المنطقة الزمنية: السعودية (مكة المكرمة)</small>
                    </div>

                    <!-- Step 3 Buttons -->
                    <div class="wizard-buttons">
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step3-back-btn">خلف</button>
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step3-save-btn">حفظ المعلومات</button>
                        <button type="button" class="wizard-btn wizard-btn-primary" id="step3-next-btn">المرحلة التالية</button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render Step 4: Legal & Documents
     */
    function renderStep4() {
        const data = formData.step4;
        const hasProofOfOwnership = data.proofOfOwnership !== null;
        const hasAuctionApprovalPDF = data.auctionApprovalPDF !== null;

        return `
            <div class="wizard-step" id="wizard-step-4" style="display: none;">
                <h3 class="step-title">المستندات القانونية</h3>
                <p class="step-subtitle">قم برفع المستندات المطلوبة</p>

                <form class="wizard-form" id="step4-form">
                    <!-- Proof of Ownership -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">إثبات الملكية <span class="required-indicator">*</span></label>
                        <div class="file-upload-area">
                            <input type="file" id="proof-ownership-input" accept=".pdf" style="display: none;">
                            <div class="file-upload-placeholder ${hasProofOfOwnership ? 'has-file' : ''}" id="proof-ownership-placeholder">
                                ${hasProofOfOwnership ? `
                                    <button type="button" class="delete-file-btn" data-file="proof-ownership" aria-label="حذف الملف">
                                        <i data-lucide="x" class="delete-icon"></i>
                                    </button>
                                    <i data-lucide="file-check" class="upload-icon"></i>
                                    <p>تم رفع الملف</p>
                                    <button type="button" class="change-file-btn" data-file="proof-ownership">تغيير الملف</button>
                                ` : `
                                    <i data-lucide="upload" class="upload-icon"></i>
                                    <p>اضغط لرفع ملف PDF</p>
                                    <small>إثبات ملكية العقار</small>
                                `}
                            </div>
                            <button type="button" class="skip-later-btn" data-file="proof-ownership">إكمال لاحقاً</button>
                        </div>
                    </div>

                    <!-- Auction Approval Number -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">رقم موافقة المزاد</label>
                        <input type="text" class="add-new-auction-form-input" id="auction-approval-number" value="${data.auctionApprovalNumber}" 
                               placeholder="أدخل رقم الموافقة">
                        <small class="form-helper">رقم موافقة المزاد من الجهة المختصة</small>
                    </div>

                    <!-- Auction Approval PDF -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">ملف موافقة المزاد</label>
                        <div class="file-upload-area">
                            <input type="file" id="auction-approval-pdf-input" accept=".pdf" style="display: none;">
                            <div class="file-upload-placeholder ${hasAuctionApprovalPDF ? 'has-file' : ''}" id="auction-approval-pdf-placeholder">
                                ${hasAuctionApprovalPDF ? `
                                    <button type="button" class="delete-file-btn" data-file="auction-approval-pdf" aria-label="حذف الملف">
                                        <i data-lucide="x" class="delete-icon"></i>
                                    </button>
                                    <i data-lucide="file-check" class="upload-icon"></i>
                                    <p>تم رفع الملف</p>
                                    <button type="button" class="change-file-btn" data-file="auction-approval-pdf">تغيير الملف</button>
                                ` : `
                                    <i data-lucide="upload" class="upload-icon"></i>
                                    <p>اضغط لرفع ملف PDF</p>
                                    <small>ملف موافقة المزاد</small>
                                `}
                            </div>
                            <button type="button" class="skip-later-btn" data-file="auction-approval-pdf">إكمال لاحقاً</button>
                        </div>
                    </div>

                    <!-- Auction Terms -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">شروط وأحكام المزاد</label>
                        <textarea class="add-new-auction-form-input form-textarea" id="auction-terms" rows="5" 
                                  placeholder="أدخل شروط وأحكام المزاد...">${data.auctionTerms}</textarea>
                        <small class="form-helper">يمكنك كتابة الشروط هنا أو رفع ملف PDF</small>
                    </div>

                    <!-- Seller Declaration -->
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="seller-declaration-checkbox" ${data.sellerDeclaration ? 'checked' : ''}>
                            <span>أؤكد صحة جميع المعلومات والمستندات المرفقة</span>
                        </label>
                    </div>

                    <!-- Documents Checklist -->
                    <div class="documents-checklist">
                        <h4>قائمة المستندات</h4>
                        <div class="checklist-item ${hasProofOfOwnership ? 'completed' : 'pending'}">
                            <i data-lucide="${hasProofOfOwnership ? 'check-circle' : 'circle'}" class="checklist-icon"></i>
                            <span>إثبات الملكية</span>
                        </div>
                        <div class="checklist-item ${hasAuctionApprovalPDF ? 'completed' : 'pending'}">
                            <i data-lucide="${hasAuctionApprovalPDF ? 'check-circle' : 'circle'}" class="checklist-icon"></i>
                            <span>ملف موافقة المزاد</span>
                        </div>
                    </div>

                    <!-- Step 4 Buttons -->
                    <div class="wizard-buttons">
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step4-back-btn">خلف</button>
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step4-save-btn">حفظ المعلومات</button>
                        <button type="button" class="wizard-btn wizard-btn-primary" id="step4-next-btn">المرحلة التالية</button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render Step 5: Review & Submit
     */
    function renderStep5() {
        const data = formData;
        const missingFields = getMissingFields();
        const isReadyToSubmit = missingFields.length === 0 && data.step1.authorizationConfirmed && data.step4.sellerDeclaration;

        return `
            <div class="wizard-step" id="wizard-step-5" style="display: none;">
                <h3 class="step-title">المراجعة والتأكيد</h3>
                <p class="step-subtitle">راجع معلوماتك قبل الإرسال</p>

                <div class="review-container">
                    <!-- Status Badge -->
                    <div class="status-badge ${isReadyToSubmit ? 'ready' : 'draft'}">
                        <i data-lucide="${isReadyToSubmit ? 'check-circle' : 'edit'}" class="status-icon"></i>
                        <span>${isReadyToSubmit ? 'جاهز للإرسال' : 'مسودة'}</span>
                    </div>

                    ${missingFields.length > 0 ? `
                        <div class="missing-fields-alert">
                            <h4>الحقول الناقصة:</h4>
                            <ul>
                                ${missingFields.map(field => `<li>${field}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <!-- Review Sections -->
                    <div class="review-section">
                        <h4 class="review-section-title">المرحلة 1: المعلومات الأساسية</h4>
                        <div class="review-item">
                            <span class="review-label">نوع البائع:</span>
                            <span class="review-value">${data.step1.sellerType === 'company' ? 'شركة' : data.step1.sellerType === 'individual' ? 'فرد' : 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">اسم البائع:</span>
                            <span class="review-value">${data.step1.sellerName || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">البريد الإلكتروني:</span>
                            <span class="review-value">${data.step1.contactEmail || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">رقم الهاتف:</span>
                            <span class="review-value">${data.step1.contactPhone || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">مدينة العقار:</span>
                            <span class="review-value">${data.step1.propertyCity || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">نوع العقار:</span>
                            <span class="review-value">${getPropertyTypeLabel(data.step1.propertyType)}</span>
                        </div>
                    </div>

                    <div class="review-section">
                        <h4 class="review-section-title">المرحلة 2: معلومات العقار</h4>
                        <div class="review-item">
                            <span class="review-label">عنوان العقار:</span>
                            <span class="review-value">${data.step2.propertyTitle || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">العنوان الكامل:</span>
                            <span class="review-value">${data.step2.propertyAddress || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">المساحة:</span>
                            <span class="review-value">${data.step2.propertySize ? data.step2.propertySize + ' ' + data.step2.propertySizeUnit : 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">الوصف:</span>
                            <span class="review-value">${data.step2.propertyDescription || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">عدد الصور:</span>
                            <span class="review-value">${data.step2.propertyImages.length} صورة</span>
                        </div>
                    </div>

                    <div class="review-section">
                        <h4 class="review-section-title">المرحلة 3: إعداد المزاد</h4>
                        <div class="review-item">
                            <span class="review-label">سعر البداية:</span>
                            <span class="review-value">${data.step3.startPrice ? formatCurrency(data.step3.startPrice) : 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">السعر الاحتياطي:</span>
                            <span class="review-value">${data.step3.reservePrice ? formatCurrency(data.step3.reservePrice) : 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">قيمة الزيادة:</span>
                            <span class="review-value">${data.step3.bidIncrement ? formatCurrency(data.step3.bidIncrement) : 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">تاريخ ووقت البداية:</span>
                            <span class="review-value">${formatDateTime(data.step3.auctionStartDate, data.step3.auctionStartTime)}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">تاريخ ووقت النهاية:</span>
                            <span class="review-value">${formatDateTime(data.step3.auctionEndDate, data.step3.auctionEndTime)}</span>
                        </div>
                    </div>

                    <div class="review-section">
                        <h4 class="review-section-title">المرحلة 4: المستندات</h4>
                        <div class="review-item">
                            <span class="review-label">إثبات الملكية:</span>
                            <span class="review-value">${data.step4.proofOfOwnership ? 'تم الرفع' : 'غير مرفق'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">رقم موافقة المزاد:</span>
                            <span class="review-value">${data.step4.auctionApprovalNumber || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">ملف موافقة المزاد:</span>
                            <span class="review-value">${data.step4.auctionApprovalPDF ? 'تم الرفع' : 'غير مرفق'}</span>
                        </div>
                    </div>

                    <!-- Step 5 Buttons -->
                    <div class="wizard-buttons">
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step5-back-btn">خلف</button>
                        <button type="button" class="wizard-btn wizard-btn-primary" id="step5-submit-btn" ${!isReadyToSubmit ? 'disabled' : ''}>تأكيد المعلومات للمراجعة</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Helper: Get property type label
     */
    function getPropertyTypeLabel(type) {
        const labels = {
            'residential': 'سكني',
            'commercial': 'تجاري',
            'land': 'أرض',
            'industrial': 'صناعي'
        };
        return labels[type] || 'غير محدد';
    }

    /**
     * Helper: Format currency
     */
    function formatCurrency(amount) {
        if (!amount) return 'غير محدد';
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
    }

    /**
     * Helper: Format date and time
     */
    function formatDateTime(date, time) {
        if (!date) return 'غير محدد';
        const dateStr = new Date(date).toLocaleDateString('ar-SA');
        return time ? `${dateStr} ${time}` : dateStr;
    }

    /**
     * Get missing required fields
     */
    function getMissingFields() {
        const missing = [];
        const data = formData;

        // Step 1
        if (!data.step1.sellerType) missing.push('نوع البائع');
        if (!data.step1.sellerName) missing.push('اسم البائع');
        if (!data.step1.contactEmail) missing.push('البريد الإلكتروني');
        if (!data.step1.contactPhone) missing.push('رقم الهاتف');
        if (!data.step1.propertyCity) missing.push('مدينة العقار');
        if (!data.step1.propertyType) missing.push('نوع العقار');

        // Step 2
        if (!data.step2.propertyTitle) missing.push('عنوان العقار');
        if (!data.step2.propertyAddress) missing.push('العنوان الكامل');
        if (!data.step2.propertySize) missing.push('مساحة العقار');

        // Step 3
        if (!data.step3.startPrice) missing.push('سعر البداية');
        if (!data.step3.auctionStartDate) missing.push('تاريخ بدء المزاد');
        if (!data.step3.auctionEndDate) missing.push('تاريخ انتهاء المزاد');

        return missing;
    }

    /**
     * Update progress bar
     */
    function updateProgressBar() {
        const progressBar = document.getElementById('wizard-progress-bar');
        if (progressBar) {
            const progress = ((currentStep - 1) / 4) * 100;
            progressBar.style.width = progress + '%';
            const percentage = Math.round(progress);

            // Hide percentage on step 1 (0%)
            if (currentStep === 1) {
                progressBar.setAttribute('data-percentage', '');
                progressBar.classList.add('hide-percentage');
            } else {
                progressBar.setAttribute('data-percentage', percentage + '%');
                progressBar.classList.remove('hide-percentage');
            }
        }
    }

    /**
     * Show specific step
     */
    function showStep(step) {
        /* Scroll to the top page */
        scrollToTop();


        // Hide all steps
        for (let i = 1; i <= 5; i++) {
            const stepElement = document.getElementById(`wizard-step-${i}`);
            if (stepElement) {
                stepElement.style.display = 'none';
            }
        }

        // Show current step
        const currentStepElement = document.getElementById(`wizard-step-${step}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }

        // Update progress indicators with proper classes (current, passed, future)
        document.querySelectorAll('.progress-step').forEach((el, idx) => {
            const stepNumber = idx + 1;
            // Remove all status classes
            el.classList.remove('current', 'passed', 'future');

            if (stepNumber < step) {
                // Passed steps - green
                el.classList.add('passed');
            } else if (stepNumber === step) {
                // Current step - primary color
                el.classList.add('current');
            } else {
                // Future steps - gray
                el.classList.add('future');
            }
        });

        updateProgressBar();

    }

    /**
     * Save step 1 data
     */
    function saveStep1() {
        const sellerType = document.querySelector('input[name="sellerType"]:checked')?.value || '';
        formData.step1 = {
            sellerType: sellerType,
            sellerName: document.getElementById('seller-name')?.value || '',
            contactEmail: document.getElementById('contact-email')?.value || '',
            contactPhone: document.getElementById('contact-phone')?.value || '',
            propertyCity: document.getElementById('property-city')?.value || '',
            propertyType: document.getElementById('property-type')?.value || '',
            authorizationConfirmed: document.getElementById('authorization-checkbox')?.checked || false
        };
        autoSaveData();
    }

    /**
     * Save step 2 data
     */
    function saveStep2() {
        formData.step2 = {
            propertyTitle: document.getElementById('property-title')?.value || '',
            propertyAddress: document.getElementById('property-address')?.value || '',
            propertySize: document.getElementById('property-size')?.value || '',
            propertySizeUnit: 'm²',
            propertyDescription: document.getElementById('property-description')?.value || '',
            propertyImages: formData.step2.propertyImages || []
        };
        autoSaveData();
    }

    /**
     * Save step 3 data
     */
    function saveStep3() {
        formData.step3 = {
            startPrice: document.getElementById('start-price')?.value || '',
            reservePrice: document.getElementById('reserve-price')?.value || '',
            bidIncrement: document.getElementById('bid-increment')?.value || '',
            auctionStartDate: document.getElementById('auction-start-date')?.value || '',
            auctionStartTime: document.getElementById('auction-start-time')?.value || '',
            auctionEndDate: document.getElementById('auction-end-date')?.value || '',
            auctionEndTime: document.getElementById('auction-end-time')?.value || ''
        };
        autoSaveData();
    }

    /**
     * Save step 4 data
     */
    function saveStep4() {
        formData.step4 = {
            proofOfOwnership: formData.step4.proofOfOwnership || null,
            auctionApprovalNumber: document.getElementById('auction-approval-number')?.value || '',
            auctionApprovalPDF: formData.step4.auctionApprovalPDF || null,
            auctionTerms: document.getElementById('auction-terms')?.value || '',
            sellerDeclaration: document.getElementById('seller-declaration-checkbox')?.checked || false
        };
        autoSaveData();
    }

    /**
     * Update step 2 image previews (without full re-render)
     */
    function updateStep2ImagePreviews() {
        const imagePreviews = document.getElementById('image-previews');
        const uploadPlaceholder = document.getElementById('upload-placeholder');
        if (!imagePreviews) return;

        const images = formData.step2.propertyImages;
        if (images.length === 0) {
            imagePreviews.innerHTML = '';
        } else {
            imagePreviews.innerHTML = images.map((img, idx) => `
                <div class="image-preview-item" data-index="${idx}">
                    <img src="${img.preview}" alt="Preview">
                    <button type="button" class="remove-image-btn" data-index="${idx}">×</button>
                </div>
            `).join('');

            // Re-attach remove listeners
            document.querySelectorAll('.remove-image-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = parseInt(this.getAttribute('data-index'));
                    formData.step2.propertyImages.splice(index, 1);
                    autoSaveData();
                    updateStep2ImagePreviews();
                });
            });
        }
    }

    /**
     * Update step 4 file previews (without full re-render)
     */
    function updateStep4FilePreviews() {
        const hasProof = formData.step4.proofOfOwnership !== null;
        const hasApproval = formData.step4.auctionApprovalPDF !== null;

        const proofPlaceholder = document.getElementById('proof-ownership-placeholder');
        if (proofPlaceholder) {
            if (hasProof) {
                proofPlaceholder.classList.add('has-file');
                proofPlaceholder.innerHTML = `
                    <button type="button" class="delete-file-btn" data-file="proof-ownership" aria-label="حذف الملف">
                        <i data-lucide="x" class="delete-icon"></i>
                    </button>
                    <i data-lucide="file-check" class="upload-icon"></i>
                    <p>تم رفع الملف</p>
                    <button type="button" class="change-file-btn" data-file="proof-ownership">تغيير الملف</button>
                `;
                lucide.createIcons();
                // Re-attach change file listener
                const changeBtn = proofPlaceholder.querySelector('.change-file-btn');
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => {
                        const input = document.getElementById('proof-ownership-input');
                        if (input) input.click();
                    });
                }
                // Re-attach delete file listener
                const deleteBtn = proofPlaceholder.querySelector('.delete-file-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        formData.step4.proofOfOwnership = null;
                        const input = document.getElementById('proof-ownership-input');
                        if (input) input.value = '';
                        autoSaveData();
                        updateStep4FilePreviews();
                    });
                }
            } else {
                proofPlaceholder.classList.remove('has-file');
                proofPlaceholder.innerHTML = `
                    <i data-lucide="upload" class="upload-icon"></i>
                    <p>اضغط لرفع ملف PDF</p>
                    <small>إثبات ملكية العقار</small>
                `;
                lucide.createIcons();
            }
        }

        const approvalPlaceholder = document.getElementById('auction-approval-pdf-placeholder');
        if (approvalPlaceholder) {
            if (hasApproval) {
                approvalPlaceholder.classList.add('has-file');
                approvalPlaceholder.innerHTML = `
                    <button type="button" class="delete-file-btn" data-file="auction-approval-pdf" aria-label="حذف الملف">
                        <i data-lucide="x" class="delete-icon"></i>
                    </button>
                    <i data-lucide="file-check" class="upload-icon"></i>
                    <p>تم رفع الملف</p>
                    <button type="button" class="change-file-btn" data-file="auction-approval-pdf">تغيير الملف</button>
                `;
                lucide.createIcons();
                // Re-attach change file listener
                const changeBtn = approvalPlaceholder.querySelector('.change-file-btn');
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => {
                        const input = document.getElementById('auction-approval-pdf-input');
                        if (input) input.click();
                    });
                }
                // Re-attach delete file listener
                const deleteBtn = approvalPlaceholder.querySelector('.delete-file-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        formData.step4.auctionApprovalPDF = null;
                        const input = document.getElementById('auction-approval-pdf-input');
                        if (input) input.value = '';
                        autoSaveData();
                        updateStep4FilePreviews();
                    });
                }
            } else {
                approvalPlaceholder.classList.remove('has-file');
                approvalPlaceholder.innerHTML = `
                    <i data-lucide="upload" class="upload-icon"></i>
                    <p>اضغط لرفع ملف PDF</p>
                    <small>ملف موافقة المزاد</small>
                `;
                lucide.createIcons();
            }
        }

        // Update checklist
        const checklistItems = document.querySelectorAll('.checklist-item');
        if (checklistItems.length >= 2) {
            const proofItem = checklistItems[0];
            const approvalItem = checklistItems[1];
            if (proofItem) {
                proofItem.className = `checklist-item ${hasProof ? 'completed' : 'pending'}`;
                const icon = proofItem.querySelector('.checklist-icon');
                if (icon) {
                    icon.setAttribute('data-lucide', hasProof ? 'check-circle' : 'circle');
                }
            }
            if (approvalItem) {
                approvalItem.className = `checklist-item ${hasApproval ? 'completed' : 'pending'}`;
                const icon = approvalItem.querySelector('.checklist-icon');
                if (icon) {
                    icon.setAttribute('data-lucide', hasApproval ? 'check-circle' : 'circle');
                }
            }
            lucide.createIcons();
        }
    }

    /**
     * Render step 5 content (update review without full re-render)
     */
    function renderStep5Content() {
        const step5Element = document.getElementById('wizard-step-5');
        if (!step5Element) return;

        const reviewContainer = step5Element.querySelector('.review-container');
        if (!reviewContainer) return;

        const data = formData;
        const missingFields = getMissingFields();
        const isReadyToSubmit = missingFields.length === 0 && data.step1.authorizationConfirmed && data.step4.sellerDeclaration;

        reviewContainer.innerHTML = `
            <!-- Status Badge -->
            <div class="status-badge ${isReadyToSubmit ? 'ready' : 'draft'}">
                <i data-lucide="${isReadyToSubmit ? 'check-circle' : 'edit'}" class="status-icon"></i>
                <span>${isReadyToSubmit ? 'جاهز للإرسال' : 'مسودة'}</span>
            </div>

            ${missingFields.length > 0 ? `
                <div class="missing-fields-alert">
                    <h4>الحقول الناقصة:</h4>
                    <ul>
                        ${missingFields.map(field => `<li>${field}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <!-- Review Sections -->
            <div class="review-section">
                <h4 class="review-section-title">المرحلة 1: المعلومات الأساسية</h4>
                <div class="review-item">
                    <span class="review-label">نوع البائع:</span>
                    <span class="review-value">${data.step1.sellerType === 'company' ? 'شركة' : data.step1.sellerType === 'individual' ? 'فرد' : 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">اسم البائع:</span>
                    <span class="review-value">${data.step1.sellerName || 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">البريد الإلكتروني:</span>
                    <span class="review-value">${data.step1.contactEmail || 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">رقم الهاتف:</span>
                    <span class="review-value">${data.step1.contactPhone || 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">مدينة العقار:</span>
                    <span class="review-value">${data.step1.propertyCity || 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">نوع العقار:</span>
                    <span class="review-value">${getPropertyTypeLabel(data.step1.propertyType)}</span>
                </div>
            </div>

            <div class="review-section">
                <h4 class="review-section-title">المرحلة 2: معلومات العقار</h4>
                <div class="review-item">
                    <span class="review-label">عنوان العقار:</span>
                    <span class="review-value">${data.step2.propertyTitle || 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">العنوان الكامل:</span>
                    <span class="review-value">${data.step2.propertyAddress || 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">المساحة:</span>
                    <span class="review-value">${data.step2.propertySize ? data.step2.propertySize + ' ' + data.step2.propertySizeUnit : 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">الوصف:</span>
                    <span class="review-value">${data.step2.propertyDescription || 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">عدد الصور:</span>
                    <span class="review-value">${data.step2.propertyImages.length} صورة</span>
                </div>
            </div>

            <div class="review-section">
                <h4 class="review-section-title">المرحلة 3: إعداد المزاد</h4>
                <div class="review-item">
                    <span class="review-label">سعر البداية:</span>
                    <span class="review-value">${data.step3.startPrice ? formatCurrency(data.step3.startPrice) : 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">السعر الاحتياطي:</span>
                    <span class="review-value">${data.step3.reservePrice ? formatCurrency(data.step3.reservePrice) : 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">قيمة الزيادة:</span>
                    <span class="review-value">${data.step3.bidIncrement ? formatCurrency(data.step3.bidIncrement) : 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">تاريخ ووقت البداية:</span>
                    <span class="review-value">${formatDateTime(data.step3.auctionStartDate, data.step3.auctionStartTime)}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">تاريخ ووقت النهاية:</span>
                    <span class="review-value">${formatDateTime(data.step3.auctionEndDate, data.step3.auctionEndTime)}</span>
                </div>
            </div>

            <div class="review-section">
                <h4 class="review-section-title">المرحلة 4: المستندات</h4>
                <div class="review-item">
                    <span class="review-label">إثبات الملكية:</span>
                    <span class="review-value">${data.step4.proofOfOwnership ? 'تم الرفع' : 'غير مرفق'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">رقم موافقة المزاد:</span>
                    <span class="review-value">${data.step4.auctionApprovalNumber || 'غير محدد'}</span>
                </div>
                <div class="review-item">
                    <span class="review-label">ملف موافقة المزاد:</span>
                    <span class="review-value">${data.step4.auctionApprovalPDF ? 'تم الرفع' : 'غير مرفق'}</span>
                </div>
            </div>

            <!-- Step 5 Buttons -->
            <div class="wizard-buttons">
                <button type="button" class="wizard-btn wizard-btn-secondary" id="step5-back-btn">خلف</button>
                <button type="button" class="wizard-btn wizard-btn-primary" id="step5-submit-btn" ${!isReadyToSubmit ? 'disabled' : ''}>تأكيد المعلومات للمراجعة</button>
            </div>
        `;

        // Re-attach step 5 listeners
        setupStep5Listeners();
        // Re-attach scroll to top to buttons
        attachScrollToTopToButtons();
        lucide.createIcons();
    }

    /**
     * Validate step 3 dates
     */
    function validateStep3Dates() {
        const startDate = document.getElementById('auction-start-date')?.value;
        const startTime = document.getElementById('auction-start-time')?.value;
        const endDate = document.getElementById('auction-end-date')?.value;
        const endTime = document.getElementById('auction-end-time')?.value;

        if (startDate && endDate) {
            const start = new Date(startDate + 'T' + (startTime || '00:00'));
            const end = new Date(endDate + 'T' + (endTime || '00:00'));

            if (end <= start) {
                alert('تاريخ ووقت الانتهاء يجب أن يكون بعد تاريخ ووقت البداية');
                return false;
            }
        }

        return true;
    }

    /**
     * Scroll to top smoothly
     */
    function scrollToTop() {
        const scrollableContainer = document.querySelector('#add-new-auction-view .scrollable-container');
        if (scrollableContainer) {
            scrollableContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Fallback to window scroll
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Attach scroll to top to all wizard buttons
     * Note: Scroll is handled in showStep() after step change
     */
    function attachScrollToTopToButtons() {
        // Scroll is now handled in showStep() function
        // This function is kept for potential future use but doesn't need to attach listeners
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        if (eventListenersAttached) return;

        // Back button
        const backBtn = document.getElementById('start-auction-back-btn');
        if (backBtn) {
            backBtn.onclick = function () {
                const auctionView = document.getElementById('add-new-auction-view');
                if (auctionView) {
                    auctionView.classList.remove('active');
                }
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                }
            };
        }

        // Attach scroll to top to all wizard buttons
        attachScrollToTopToButtons();

        // Step 1 listeners
        setupStep1Listeners();
        setupStep2Listeners();
        setupStep3Listeners();
        setupStep4Listeners();
        setupStep5Listeners();

        eventListenersAttached = true;
    }

    /**
     * Setup Step 1 listeners
     */
    function setupStep1Listeners() {
        // Seller type change - update label
        document.querySelectorAll('input[name="sellerType"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const label = document.getElementById('seller-name-label');
                if (label) {
                    label.textContent = this.value === 'company' ? 'اسم الشركة' : 'اسم البائع';
                }
                saveStep1();
            });
        });

        // Authorization checkbox - enable/disable next button
        const authCheckbox = document.getElementById('authorization-checkbox');
        if (authCheckbox) {
            authCheckbox.addEventListener('change', function () {
                const nextBtn = document.getElementById('step1-next-btn');
                if (nextBtn) {
                    nextBtn.disabled = !this.checked;
                }
                saveStep1();
            });
        }

        // Save step 1 inputs
        ['seller-name', 'contact-email', 'contact-phone', 'property-city', 'property-type'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('blur', saveStep1);
                el.addEventListener('change', saveStep1);
            }
        });

        // Step 1 buttons
        const saveBtn1 = document.getElementById('step1-save-btn');
        if (saveBtn1) {
            saveBtn1.addEventListener('click', () => {
                saveStep1();
                alert('تم حفظ المعلومات بنجاح');
            });
        }

        const nextBtn1 = document.getElementById('step1-next-btn');
        if (nextBtn1) {
            nextBtn1.addEventListener('click', () => {
                saveStep1();
                currentStep = 2;
                autoSaveData();
                showStep(2);
            });
        }
    }

    /**
     * Setup Step 2 listeners
     */
    function setupStep2Listeners() {
        // Image upload
        const imageInput = document.getElementById('property-images-input');
        const uploadPlaceholder = document.getElementById('upload-placeholder');

        if (uploadPlaceholder) {
            uploadPlaceholder.addEventListener('click', () => {
                if (imageInput) imageInput.click();
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', function (e) {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function (event) {
                            formData.step2.propertyImages.push({
                                file: file,
                                preview: event.target.result
                            });
                            autoSaveData();
                            updateStep2ImagePreviews();
                        };
                        reader.readAsDataURL(file);
                    }
                });
            });
        }

        // Remove image
        document.querySelectorAll('.remove-image-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                formData.step2.propertyImages.splice(index, 1);
                autoSaveData();
                updateStep2ImagePreviews();
            });
        });

        // Save step 2 inputs
        ['property-title', 'property-address', 'property-size', 'property-description'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('blur', saveStep2);
                el.addEventListener('change', saveStep2);
            }
        });

        // Step 2 buttons
        const backBtn2 = document.getElementById('step2-back-btn');
        if (backBtn2) {
            backBtn2.addEventListener('click', () => {
                saveStep2();
                currentStep = 1;
                autoSaveData();
                showStep(1);
            });
        }

        const saveBtn2 = document.getElementById('step2-save-btn');
        if (saveBtn2) {
            saveBtn2.addEventListener('click', () => {
                saveStep2();
                alert('تم حفظ المعلومات بنجاح');
            });
        }

        const nextBtn2 = document.getElementById('step2-next-btn');
        if (nextBtn2) {
            nextBtn2.addEventListener('click', () => {
                saveStep2();
                currentStep = 3;
                autoSaveData();
                showStep(3);
            });
        }
    }

    /**
     * Setup Step 3 listeners
     */
    function setupStep3Listeners() {
        // Auto-suggest bid increment based on start price
        const startPriceInput = document.getElementById('start-price');
        const bidIncrementInput = document.getElementById('bid-increment');

        if (startPriceInput && bidIncrementInput) {
            startPriceInput.addEventListener('blur', function () {
                const startPrice = parseFloat(this.value);
                if (startPrice && !bidIncrementInput.value) {
                    // Suggest 1% of start price, rounded to nearest 100
                    const suggested = Math.round(startPrice * 0.01 / 100) * 100;
                    if (suggested >= 100) {
                        bidIncrementInput.value = suggested;
                    }
                }
                saveStep3();
            });
        }

        // Save step 3 inputs
        ['start-price', 'reserve-price', 'bid-increment', 'auction-start-date', 'auction-start-time', 'auction-end-date', 'auction-end-time'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', saveStep3);
                el.addEventListener('blur', saveStep3);
            }
        });

        // Step 3 buttons
        const backBtn3 = document.getElementById('step3-back-btn');
        if (backBtn3) {
            backBtn3.addEventListener('click', () => {
                saveStep3();
                currentStep = 2;
                autoSaveData();
                showStep(2);
            });
        }

        const saveBtn3 = document.getElementById('step3-save-btn');
        if (saveBtn3) {
            saveBtn3.addEventListener('click', () => {
                saveStep3();
                alert('تم حفظ المعلومات بنجاح');
            });
        }

        const nextBtn3 = document.getElementById('step3-next-btn');
        if (nextBtn3) {
            nextBtn3.addEventListener('click', () => {
                if (!validateStep3Dates()) return;
                saveStep3();
                currentStep = 4;
                autoSaveData();
                showStep(4);
            });
        }
    }

    /**
     * Setup Step 4 listeners
     */
    function setupStep4Listeners() {
        // File uploads
        const proofOwnershipInput = document.getElementById('proof-ownership-input');
        const proofOwnershipPlaceholder = document.getElementById('proof-ownership-placeholder');
        const auctionApprovalInput = document.getElementById('auction-approval-pdf-input');
        const auctionApprovalPlaceholder = document.getElementById('auction-approval-pdf-placeholder');

        if (proofOwnershipPlaceholder && proofOwnershipInput) {
            proofOwnershipPlaceholder.addEventListener('click', function () {
                if (!this.classList.contains('has-file')) {
                    proofOwnershipInput.click();
                }
            });
        }

        if (proofOwnershipInput) {
            proofOwnershipInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    formData.step4.proofOfOwnership = file;
                    autoSaveData();
                    updateStep4FilePreviews();
                }
            });
        }

        if (auctionApprovalPlaceholder && auctionApprovalInput) {
            auctionApprovalPlaceholder.addEventListener('click', function () {
                if (!this.classList.contains('has-file')) {
                    auctionApprovalInput.click();
                }
            });
        }

        if (auctionApprovalInput) {
            auctionApprovalInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    formData.step4.auctionApprovalPDF = file;
                    autoSaveData();
                    updateStep4FilePreviews();
                }
            });
        }

        // Change file buttons
        document.querySelectorAll('.change-file-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const fileType = this.getAttribute('data-file');
                if (fileType === 'proof-ownership' && proofOwnershipInput) {
                    proofOwnershipInput.click();
                } else if (fileType === 'auction-approval-pdf' && auctionApprovalInput) {
                    auctionApprovalInput.click();
                }
            });
        });

        // Delete file buttons
        document.querySelectorAll('.delete-file-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const fileType = this.getAttribute('data-file');
                if (fileType === 'proof-ownership') {
                    formData.step4.proofOfOwnership = null;
                    const input = document.getElementById('proof-ownership-input');
                    if (input) input.value = '';
                    autoSaveData();
                    updateStep4FilePreviews();
                } else if (fileType === 'auction-approval-pdf') {
                    formData.step4.auctionApprovalPDF = null;
                    const input = document.getElementById('auction-approval-pdf-input');
                    if (input) input.value = '';
                    autoSaveData();
                    updateStep4FilePreviews();
                }
            });
        });

        // Skip later buttons (just mark as optional, don't clear data)
        document.querySelectorAll('.skip-later-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                // Just show a message, allow user to proceed
                alert('يمكنك إكمال هذا المستند لاحقاً');
            });
        });

        // Save step 4 inputs
        ['auction-approval-number', 'auction-terms'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('blur', saveStep4);
                el.addEventListener('change', saveStep4);
            }
        });

        const sellerDeclCheckbox = document.getElementById('seller-declaration-checkbox');
        if (sellerDeclCheckbox) {
            sellerDeclCheckbox.addEventListener('change', saveStep4);
        }

        // Step 4 buttons
        const backBtn4 = document.getElementById('step4-back-btn');
        if (backBtn4) {
            backBtn4.addEventListener('click', () => {
                saveStep4();
                currentStep = 3;
                autoSaveData();
                showStep(3);
            });
        }

        const saveBtn4 = document.getElementById('step4-save-btn');
        if (saveBtn4) {
            saveBtn4.addEventListener('click', () => {
                saveStep4();
                alert('تم حفظ المعلومات بنجاح');
            });
        }

        const nextBtn4 = document.getElementById('step4-next-btn');
        if (nextBtn4) {
            nextBtn4.addEventListener('click', () => {
                saveStep4();
                currentStep = 5;
                autoSaveData();
                // Re-render step 5 to update review with latest data
                renderStep5Content();
                showStep(5);
            });
        }
    }

    /**
     * Setup Step 5 listeners
     */
    function setupStep5Listeners() {
        const backBtn5 = document.getElementById('step5-back-btn');
        if (backBtn5) {
            backBtn5.addEventListener('click', () => {
                currentStep = 4;
                autoSaveData();
                showStep(4);
            });
        }

        const submitBtn = document.getElementById('step5-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                const missingFields = getMissingFields();
                if (missingFields.length > 0) {
                    alert('يرجى إكمال جميع الحقول المطلوبة قبل الإرسال');
                    return;
                }

                if (confirm('هل أنت متأكد من إرسال المعلومات للمراجعة؟')) {
                    // TODO: Submit to Supabase when backend is ready
                    console.log('Submitting auction data:', formData);
                    alert('تم إرسال المعلومات بنجاح! سيتم مراجعتها والتواصل معك قريباً.');

                    // Clear saved data
                    localStorage.removeItem('auctionWizardData');
                    localStorage.removeItem('auctionWizardCurrentStep');

                    // Navigate back to menu
                    const auctionView = document.getElementById('add-new-auction-view');
                    if (auctionView) {
                        auctionView.classList.remove('active');
                    }
                    if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                        window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                    }
                }
            });
        }
    }

    // Disable back button for a specified duration
    function disableBackButton(duration = 500) {
        const backBtn = document.getElementById('start-auction-back-btn');
        if (!backBtn) return;

        backBtn.disabled = true;
        backBtn.style.pointerEvents = 'none';
        backBtn.setAttribute('aria-disabled', 'true');

        setTimeout(() => {
            backBtn.disabled = false;
            backBtn.style.pointerEvents = 'auto';
            backBtn.removeAttribute('aria-disabled');
        }, duration);
    }

    // Initialize when view becomes active
    function initAuctionWizardView() {
        const auctionView = document.getElementById('add-new-auction-view');
        if (!auctionView) {
            return;
        }

        // Render default content if not already rendered
        if (!auctionWizardRendered) {
            renderAuctionWizardView();
        }

        // Use MutationObserver to detect when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = auctionView.classList.contains('active');
                    if (isActive) {
                        // Ensure view is rendered when it becomes active
                        if (!auctionWizardRendered || auctionView.innerHTML.trim() === '') {
                            renderAuctionWizardView();
                        }

                        disableBackButton(500);

                        // Re-initialize Lucide icons when view becomes active
                        if (typeof lucide !== 'undefined') {
                            setTimeout(() => {
                                lucide.createIcons();
                            }, 100);
                        }
                    }
                }
            });
        });

        observer.observe(auctionView, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Expose render function for navigation init
    function renderAuctionWizardViewPublic() {
        renderAuctionWizardView();
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuctionWizardView);
    } else {
        initAuctionWizardView();
    }

    // Export for external use
    window.StartNewAuctionPage = {
        init: initAuctionWizardView,
        renderView: renderAuctionWizardViewPublic
    };
})();

