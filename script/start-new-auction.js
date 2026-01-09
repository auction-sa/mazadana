// Start New Auction Wizard Page Management
// This file contains all JavaScript code related to the Start New Auction wizard page
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let auctionWizardRendered = false;

    // Pikaday date picker instances
    let startDatePicker = null;

    // Form data storage (auto-saved as user progresses)
    let formData = {
        step1: {
            // Main auction details
            bidStartDate: '',
            bidStartTime: '',
            bidEndDate: '',
            bidEndTime: '',
            propertiesLocations: '',
            brochurePDF: null,
            auctionThumbnail: null,
            auctionApprovalNumber: '',
            // Company info (if approval number exists)
            companyName: '',
            companyEmail: '',
            companyPhone: '',
            // Number of properties
            numberOfProperties: 0,
            // Legacy fields (kept for backward compatibility)
            sellerType: '',
            sellerName: '',
            contactEmail: '',
            contactPhone: '',
            propertyCity: '',
            authorizationConfirmed: false
        },
        // Properties array - each property has its own data
        properties: [],
        // Current property being edited (for step 2)
        currentPropertyIndex: null,
        step2: {
            // This is now used for individual property editing
            propertyType: '',
            propertyTypeOther: '',
            propertyTitle: '',
            propertyAddressUrl: '',
            propertySize: '',
            propertySizeUnit: 'م²',
            propertyDescription: '',
            propertyBoundaries: {
                north: '',
                south: '',
                east: '',
                west: ''
            },
            propertyImages: []
        },
        step3: {
            startPrice: '',
            depositPrice: '',
            bidIncrement: '',
            minimumSalePrice: '',
            auctionStartDate: '',
            auctionStartTime: '',
            auctionDaysAmount: '',
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
                const parsed = JSON.parse(savedData);
                // Merge with default structure to ensure all properties exist
                formData = {
                    step1: {
                        bidStartDate: '',
                        bidStartTime: '',
                        bidEndDate: '',
                        bidEndTime: '',
                        propertiesLocations: '',
                        brochurePDF: null,
                        auctionThumbnail: null,
                        auctionApprovalNumber: '',
                        companyName: '',
                        companyEmail: '',
                        companyPhone: '',
                        numberOfProperties: 0,
                        sellerType: '',
                        sellerName: '',
                        contactEmail: '',
                        contactPhone: '',
                        propertyCity: '',
                        authorizationConfirmed: false,
                        ...parsed.step1
                    },
                    properties: parsed.properties || [],
                    currentPropertyIndex: parsed.currentPropertyIndex || null,
                    step2: {
                        propertyType: '',
                        propertyTypeOther: '',
                        propertyTitle: '',
                        propertyAddressUrl: '',
                        propertySize: '',
                        propertySizeUnit: 'م²',
                        propertyDescription: '',
                        propertyBoundaries: {
                            north: '',
                            south: '',
                            east: '',
                            west: ''
                        },
                        propertyImages: [],
                        ...parsed.step2
                    },
                    step3: parsed.step3 || formData.step3,
                    step4: parsed.step4 || formData.step4,
                    step5: parsed.step5 || formData.step5
                };
            }
            if (savedStep) {
                currentStep = parseInt(savedStep, 10) || 1;
            }
        } catch (e) {
            console.warn('Failed to load wizard data:', e);
        }
    }

    /**
     * Render property cards container
     */
    function renderPropertyCardsContainer() {
        const container = document.getElementById('number-of-auction-properties-container');
        if (!container) return;

        const numberOfProperties = formData.step1.numberOfProperties || 0;
        const properties = formData.properties || [];

        // Ensure properties array has correct length
        while (properties.length < numberOfProperties) {
            properties.push({
                id: Date.now() + Math.random(),
                propertyType: '',
                propertyTypeOther: '',
                propertyTitle: '',
                propertyAddressUrl: '',
                propertySize: '',
                propertySizeUnit: 'م²',
                propertyDescription: '',
                propertyBoundaries: {
                    north: '',
                    south: '',
                    east: '',
                    west: ''
                },
                propertyImages: []
            });
        }
        // Remove excess properties
        while (properties.length > numberOfProperties) {
            properties.pop();
        }

        formData.properties = properties;
        autoSaveData();

        if (numberOfProperties === 0) {
            container.innerHTML = '';
            return;
        }

        const currentIndex = formData.currentPropertyIndex !== null ? formData.currentPropertyIndex : -1;

        container.innerHTML = `
            <div class="properties-cards-container">
                ${properties.map((property, index) => `
                    <div class="property-card-item ${currentIndex === index ? 'selected' : ''}" data-property-index="${index}">
                        <h4 class="property-card-title">عقار ${index + 1}</h4>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers to property cards
        container.querySelectorAll('.property-card-item').forEach((card, index) => {
            card.addEventListener('click', () => {
                selectPropertyCard(index);
                // Navigate to step 2 to edit this property
                formData.currentPropertyIndex = index;
                autoSaveData();
                currentStep = 2;

                // Show step 2 first
                showStep(2);

                // Load property data into step 2 (this will re-render it)
                loadPropertyToStep2(index);

                // Ensure step 2 is displayed after re-rendering (renderStep2 sets display: none by default)
                setTimeout(() => {
                    const step2Element = document.getElementById('wizard-step-2');
                    if (step2Element) {
                        step2Element.style.display = 'block';
                    }
                }, 10);
            });
        });

        // If there's a selected property, load its data into step 2 inputs
        if (currentIndex >= 0 && formData.properties[currentIndex]) {
            loadPropertyToStep2(currentIndex);
        }
    }

    /**
     * Select a property card and update visual state
     */
    function selectPropertyCard(index) {
        // Remove selected class from all cards
        document.querySelectorAll('.property-card-item').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selected class to the specified card
        const card = document.querySelector(`.property-card-item[data-property-index="${index}"]`);
        if (card) {
            card.classList.add('selected');
        }

        // Update formData
        formData.currentPropertyIndex = index;
        autoSaveData();

        // Automatically update step 2 inputs with the selected property data
        if (formData.properties[index]) {
            loadPropertyToStep2(index);
        }
    }

    /**
     * Clear property card selection
     */
    function clearPropertyCardSelection() {
        // Remove selected class from all cards
        document.querySelectorAll('.property-card-item').forEach(card => {
            card.classList.remove('selected');
        });

        // Clear current property index
        formData.currentPropertyIndex = null;
        autoSaveData();
    }

    /**
     * Load property data into step 2 for editing
     */
    function loadPropertyToStep2(propertyIndex) {
        const property = formData.properties[propertyIndex];
        if (!property) return;

        // Copy property data to step2
        formData.step2 = JSON.parse(JSON.stringify(property));
        autoSaveData();

        // Re-render step 2 with the property data
        const step2Element = document.getElementById('wizard-step-2');
        if (step2Element) {
            step2Element.outerHTML = renderStep2();
            // Ensure step 2 is displayed after re-rendering (renderStep2 sets display: none by default)
            const newStep2Element = document.getElementById('wizard-step-2');
            if (newStep2Element) {
                newStep2Element.style.display = 'block';
            }
            setupStep2Listeners();
            lucide.createIcons();
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

        // Reset current step to 1 when opening the wizard
        currentStep = 1;
        autoSaveData();

        auctionView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="start-auction-header">
                    <button class="back-btn" id="start-auction-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">بدأ مزاد جديد</h2>
                </div>

                <div class="auction-wizard-content-wrapper scrollable-container">

                    <div id="number-of-auction-properties-container"></div>

                    <!-- Progress Bar Wrapper -->
                    <div class="progress-bar-wrapper">
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
                                <span class="step-label" data-step="3" data-mobile-label="إعداد">إعداد المزاد</span>
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
                    </div>

                    <!-- Step Content Container -->
                    <div class="wizard-steps-container">
                        ${renderStep1()}
                        ${renderStep2()}
                        ${renderStep3()}
                        ${renderStep4()}
                        ${renderStep5()}
                    </div>

                    <!-- Property Details Page (shown when clicking review-property-card) -->
                    <div id="start-new-auction-property-details-page" class="property-details-page" style="display: none;">
                        <!-- Content will be rendered dynamically -->
                    </div>
                </div>
            </div>
        `;

        // Update progress bar
        updateProgressBar();

        // Render property cards container
        renderPropertyCardsContainer();

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
        const data = formData.step1 || {};
        const hasBrochure = data.brochurePDF !== null && data.brochurePDF !== undefined;
        const hasThumbnail = data.auctionThumbnail !== null && data.auctionThumbnail !== undefined && data.auctionThumbnail.preview;

        return `
            <div class="wizard-step" id="wizard-step-1">
                <h3 class="step-title">البدء السريع</h3>
                <p class="step-subtitle">ابدأ بإدخال معلومات المزاد الأساسية</p>

                <form class="wizard-form" id="step1-form">
                    <!-- Company Info (shown if approval number exists) -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">اسم الشركة/البائع</label>
                        <input type="text" class="add-new-auction-form-input" id="company-name" value="${data.companyName || ''}" 
                                placeholder="أدخل اسم الشركة">
                    </div>
                    <div class="form-group">
                        <label class="add-new-auction-form-label">البريد الإلكتروني للشركة</label>
                        <input type="email" class="add-new-auction-form-input" id="company-email" value="${data.companyEmail || ''}" 
                                placeholder="example@company.com" dir="ltr">
                    </div>
                    <div class="form-group">
                        <label class="add-new-auction-form-label">رقم هاتف الشركة</label>
                        <input type="tel" class="add-new-auction-form-input" id="company-phone" value="${data.companyPhone || ''}" 
                                placeholder="05xxxxxxxx" dir="ltr">
                    </div>

                    <!-- Properties Locations -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">مواقع العقارات</label>
                        <input type="text" class="add-new-auction-form-input" id="properties-locations" value="${data.propertiesLocations || ''}" 
                               placeholder="مكة المكرمة، الرياض، المدينة">
                        <small class="form-helper">أدخل مواقع العقارات مفصولة بفواصل</small>
                    </div>

                    <!-- Brochure PDF -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">بروشور PDF (إختياري)</label>
                        <div class="file-upload-area">
                            <input type="file" id="brochure-pdf-input" accept=".pdf" style="display: none;">
                            <div class="file-upload-placeholder ${hasBrochure ? 'has-file' : ''}" id="brochure-pdf-placeholder">
                                ${hasBrochure ? `
                                    <button type="button" class="delete-file-btn" data-file="brochure-pdf" aria-label="حذف الملف">
                                        <i data-lucide="x" class="delete-icon"></i>
                                    </button>
                                    <i data-lucide="file-check" class="upload-icon"></i>
                                    <p>تم رفع الملف</p>
                                    <button type="button" class="change-file-btn" data-file="brochure-pdf">تغيير الملف</button>
                                ` : `
                                    <i data-lucide="upload" class="upload-icon"></i>
                                    <p>اضغط لرفع ملف PDF</p>
                                    <small>بروشور المزاد</small>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Auction Thumbnail -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">صورة بانر المزاد (إختياري)</label>
                        <div class="image-upload-area" id="thumbnail-upload-area">
                            <input type="file" id="auction-thumbnail-input" accept="image/*" style="display: none;">
                            <div class="upload-placeholder" id="thumbnail-upload-placeholder">
                                ${hasThumbnail && data.auctionThumbnail.preview ? `
                                    <div class="image-preview-item" style="margin: 0 auto;">
                                        <img src="${data.auctionThumbnail.preview}" alt="Thumbnail Preview">
                                        <button type="button" class="remove-image-btn" data-file="thumbnail">×</button>
                                    </div>
                                ` : `
                                    <i data-lucide="image" class="upload-icon"></i>
                                    <p>اسحب الصورة هنا أو اضغط للاختيار</p>
                                    <small>صورة رئيسية للمزاد</small>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Auction Approval Number -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">رقم موافقة المزاد (إختياري)</label>
                        <input type="text" class="add-new-auction-form-input" id="auction-approval-number-step1" value="${data.auctionApprovalNumber || ''}" 
                               placeholder="أدخل رقم الموافقة">
                        <small class="form-helper">رقم موافقة المزاد من الجهة المختصة</small>
                    </div>

                    <!-- Number of Properties -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">عدد العقارات</label>
                        <div class="number-input-wrapper">
                            <button type="button" class="number-input-btn number-input-increase" id="number-of-properties-increase" aria-label="زيادة العدد">
                                <i data-lucide="plus"></i>
                            </button>
                            <input type="number" class="add-new-auction-form-input number-input-center" id="number-of-properties" value="${data.numberOfProperties || 0}"
                                   placeholder="0" min="0" max="100" readonly dir="ltr">
                            <button type="button" class="number-input-btn number-input-decrease" id="number-of-properties-decrease" aria-label="تقليل العدد">
                                <i data-lucide="minus"></i>
                            </button>
                        </div>
                        <small class="form-helper">عدد العقارات في هذا المزاد</small>
                    </div>

                    <!-- Authorization Checkbox -->
                    <div class="form-group">
                        <label class="checkbox-label" style="padding-bottom: 0;">
                            <div class="checkbox-label-content">
                                <input type="checkbox" id="authorization-checkbox" ${data.authorizationConfirmed ? 'checked' : ''}>
                                <span>أؤكد أن لدي الصلاحية لبيع هذه العقارات بالمزاد العلني.</span>
                            </div>
                            <span class="authorization-error-message" id="authorization-error-message" style="opacity: 0;">يرجى الموافقة على البند أعلاه وتحديد عدد العقارت</span>
                        </label>
                    </div>

                    <!-- Step 1 Buttons -->
                    <div class="wizard-buttons">
                        <button type="button" class="wizard-btn wizard-btn-primary" id="step1-next-btn">المرحلة التالية</button>
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
                    <!-- Property Type -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">نوع العقار</label>
                        <select class="add-new-auction-form-input" id="property-type">
                            <option value="residential" ${data.propertyType === 'residential' ? 'selected' : ''}>سكني</option>
                            <option value="commercial" ${data.propertyType === 'commercial' ? 'selected' : ''}>تجاري</option>
                            <option value="land" ${data.propertyType === 'land' ? 'selected' : ''}>أرض</option>
                            <option value="industrial" ${data.propertyType === 'industrial' ? 'selected' : ''}>صناعي</option>
                            <option value="others" ${data.propertyType === 'others' ? 'selected' : ''}>اخرى</option>
                        </select>
                        <!-- Other Property Type Input (shown when "اخرى" is selected) -->
                        <div id="property-type-other-container" style="display: none; opacity: 0; transition: opacity 0.3s ease, max-height 0.3s ease; max-height: 0; overflow: hidden; margin-top: 0.5rem;">
                            <input type="text" class="add-new-auction-form-input" id="property-type-other" value="${data.propertyTypeOther || ''}" 
                                   placeholder="حدد نوع العقار">
                        </div>
                        <small class="form-helper">اختر نوع العقار المعروض</small>
                    </div>

                    <!-- Property Title -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">رابط عنوان العقار (من قوقل ماب)</label>
                        <input type="text" class="add-new-auction-form-input" id="auction-property-google-maps-url" value="${data.propertyTitle}" 
                               placeholder="الصق الرابط من قوقل ماب">
                        <small class="form-helper">ابحث عن موقع العقار في قوقل ماب واستخدمه هنا</small>
                    </div>

                    <!-- Property Size -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">مساحة العقار</label>
                        <div class="input-with-unit">
                            <input type="text" class="add-new-auction-form-input" id="property-size" value="${data.propertySize ? data.propertySize.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}" 
                            placeholder="0" dir="ltr">
                        </div>
                        <small class="form-helper">المساحة بالمتر المربع</small>
                    </div>

                    <!-- Property Description -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">وصف العقار</label>
                        <textarea class="add-new-auction-form-input form-textarea" id="auction-property-description" rows="5" 
                                  placeholder="وصف تفصيلي للعقار...">${data.propertyDescription}</textarea>
                        <small class="form-helper">وصف شامل للعقار ومميزاته</small>
                    </div>

                    <!-- Property Boundaries -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">حدود وأطوال العقار (إختياري)</label>
                        <div class="boundaries-group">
                            <div class="boundary-item">
                                <label class="boundary-label">شمال</label>
                                <textarea class="add-new-auction-form-input form-textarea" id="property-boundary-north" rows="3" 
                                          placeholder="وصف حدود العقار من الشمال...">${data.propertyBoundaries?.north || ''}</textarea>
                            </div>
                            <div class="boundary-item">
                                <label class="boundary-label">جنوب</label>
                                <textarea class="add-new-auction-form-input form-textarea" id="property-boundary-south" rows="3" 
                                          placeholder="وصف حدود العقار من الجنوب...">${data.propertyBoundaries?.south || ''}</textarea>
                            </div>
                            <div class="boundary-item">
                                <label class="boundary-label">شرق</label>
                                <textarea class="add-new-auction-form-input form-textarea" id="property-boundary-east" rows="3" 
                                          placeholder="وصف حدود العقار من الشرق...">${data.propertyBoundaries?.east || ''}</textarea>
                            </div>
                            <div class="boundary-item">
                                <label class="boundary-label">غرب</label>
                                <textarea class="add-new-auction-form-input form-textarea" id="property-boundary-west" rows="3" 
                                          placeholder="وصف حدود العقار من الغرب...">${data.propertyBoundaries?.west || ''}</textarea>
                            </div>
                        </div>
                        <small class="form-helper">وصف مختصر لحدود العقار من جميع الجهات</small>
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
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step2-back-btn">عودة</button>
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
                            <input type="text" class="add-new-auction-form-input" id="start-price" value="${data.startPrice ? data.startPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}" 
                                   placeholder="0" dir="ltr">
                            <span class="input-currency">
                                <i data-lucide="saudi-riyal" class="rial-icon"></i>
                            </span>
                        </div>
                        <small class="form-helper">السعر الذي يبدأ به المزاد</small>
                    </div>

                    <!-- Reserve Price -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">قيمة التأمين</label>
                        <div class="input-with-currency">
                            <input type="text" class="add-new-auction-form-input" id="deposit-amount" value="${data.depositPrice ? data.depositPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}" 
                                   placeholder="0" dir="ltr">
                            <span class="input-currency">
                                <i data-lucide="saudi-riyal" class="rial-icon"></i>
                            </span>
                        </div>
                        <small class="form-helper">سعر التأمين للمشاركة في المزاد</small>
                    </div>

                    <!-- Bid Increment -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">قيمة الزيادة</label>
                        <div class="input-with-currency">
                            <input type="text" class="add-new-auction-form-input" id="bid-increment" value="${data.bidIncrement ? data.bidIncrement.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}" 
                                   placeholder="0" dir="ltr">
                            <span class="input-currency">
                                <i data-lucide="saudi-riyal" class="rial-icon"></i>
                            </span>
                        </div>
                        <small class="form-helper">القيمة الدنيا للزيادة في كل مزايدة</small>
                    </div>

                    <!-- Minimum Sale Price -->
                    <div class="form-group">
                        <label class="add-new-auction-form-label">السعر الأدنى لبيع العقار (إختياري)</label>
                        <div class="input-with-currency">
                            <input type="text" class="add-new-auction-form-input" id="minimum-sale-price" value="${data.minimumSalePrice ? data.minimumSalePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}" 
                                   placeholder="0" dir="ltr">
                            <span class="input-currency">
                                <i data-lucide="saudi-riyal" class="rial-icon"></i>
                            </span>
                        </div>
                        <small class="form-helper">السعر الأدنى الذي تقبل به بيع العقار (حقل اختياري)</small>
                    </div>

                     <!-- Auction Start Date & Time -->
                     <div class="form-group">
                         <label class="add-new-auction-form-label">تاريخ ووقت بدء المزاد</label>
                         <div class="datetime-group">
                             <input type="text" class="add-new-auction-form-input" id="auction-start-date" value="${data.auctionStartDate ? formatDateForDisplay(data.auctionStartDate) : ''}" placeholder="اختر التاريخ" readonly>
                             <input type="time" class="add-new-auction-form-input" id="auction-start-time" value="12:00" style="display: none;">
                             <input type="text" class="add-new-auction-form-input" id="auction-start-time-display" value="12:00 مساءً" readonly style="pointer-events: none; cursor: default;">
                         </div>
                         <small class="form-helper">متى يبدأ المزاد</small>
                     </div>

                     <!-- Auction Start Date & Time -->
                     <div class="form-group">
                         <label class="add-new-auction-form-label">عدد أيام تشغيل المزاد</label>
                         <div class="datetime-group">
                            <input type="number" class="add-new-auction-form-input" id="auction-days-amount" value="${data.auctionDaysAmount}" 
                                  placeholder="مثلاً 14 يوم" min="3" max="30" step="1" dir="ltr">
                         </div>
                         <small class="form-helper">كم يوم لتشغيل المزاد (من 3 إلى 30 يوم)</small>
                     </div>

                     <!-- Auction End Date & Time -->
                     <div class="form-group">
                         <label class="add-new-auction-form-label">تاريخ ووقت إنتهاء المزاد</label>
                         <div class="datetime-group">
                             <input type="text" class="add-new-auction-form-input" id="auction-end-date" placeholder="تاريخ انتهاء المزاد" readonly>
                             <input type="text" class="add-new-auction-form-input" id="auction-end-time-display" value="12:00 مساءً" readonly style="pointer-events: none; cursor: default;">
                         </div>
                         <small class="form-helper">هذا هو تاريخ انتهاء المزاد</small>
                     </div>

                    <!-- Timezone Display -->
                    <div class="timezone-display">
                        <small>المنطقة الزمنية: السعودية (مكة المكرمة)</small>
                    </div>

                    <!-- Step 3 Buttons -->
                    <div class="wizard-buttons">
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step3-back-btn">عودة</button>
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
                        <label class="checkbox-label-content">
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
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step4-back-btn">عودة</button>
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
        const step1Data = data.step1;
        const properties = data.properties || [];
        const missingFields = getMissingFields();
        const isReadyToSubmit = missingFields.length === 0 && step1Data.authorizationConfirmed && data.step4.sellerDeclaration;

        // Render property cards
        const propertyCardsHTML = properties.map((property, index) => {
            const propertyTypeLabel = property.propertyType === 'others' && property.propertyTypeOther
                ? property.propertyTypeOther
                : getPropertyTypeLabel(property.propertyType);
            const propertySize = property.propertySize ? convertArabicToEnglish(property.propertySize) + ' ' + property.propertySizeUnit : 'غير محدد';

            return `
                <div class="review-property-card" data-property-index="${index}">
                    <div class="review-property-card-header">
                        <h4 class="review-property-card-title">عقار ${index + 1}</h4>
                        <div class="review-property-card-brief">
                            <span class="review-property-brief-item">${propertyTypeLabel || 'غير محدد'}</span>
                            <span class="review-property-brief-item">${propertySize}</span>
                        </div>
                    </div>
                    <div class="review-property-card-content">
                        <div class="review-item">
                            <span class="review-label">نوع العقار:</span>
                            <span class="review-value">${propertyTypeLabel}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">رابط عنوان العقار:</span>
                            <span class="review-value">${property.propertyTitle || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">المساحة:</span>
                            <span class="review-value">${propertySize}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">الوصف:</span>
                            <span class="review-value">${property.propertyDescription || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">حدود وأطوال العقار:</span>
                            <div class="review-boundaries">
                                <div class="review-boundary-item">
                                    <span class="review-boundary-label">شمال:</span>
                                    <span class="review-boundary-value">${property.propertyBoundaries?.north || 'غير محدد'}</span>
                                </div>
                                <div class="review-boundary-item">
                                    <span class="review-boundary-label">جنوب:</span>
                                    <span class="review-boundary-value">${property.propertyBoundaries?.south || 'غير محدد'}</span>
                                </div>
                                <div class="review-boundary-item">
                                    <span class="review-boundary-label">شرق:</span>
                                    <span class="review-boundary-value">${property.propertyBoundaries?.east || 'غير محدد'}</span>
                                </div>
                                <div class="review-boundary-item">
                                    <span class="review-boundary-label">غرب:</span>
                                    <span class="review-boundary-value">${property.propertyBoundaries?.west || 'غير محدد'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="review-item">
                            <span class="review-label">عدد الصور:</span>
                            <span class="review-value">${convertArabicToEnglish(property.propertyImages?.length || 0)} صورة</span>
                        </div>
                        <div class="review-property-card-actions">
                            <button type="button" class="review-property-btn review-property-collapse-btn" data-property-index="${index}">عودة</button>
                            <button type="button" class="review-property-btn review-property-edit-btn" data-property-index="${index}">تعديل</button>
                            <button type="button" class="review-property-btn review-property-delete-btn" data-property-index="${index}">حذف</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

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

                    <!-- Main Auction Details -->
                    <div class="review-section">
                        <h4 class="review-section-title">معلومات المزاد الرئيسية</h4>
                        <div class="review-item">
                            <span class="review-label">مواقع العقارات:</span>
                            <span class="review-value">${step1Data.propertiesLocations || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">بروشور PDF:</span>
                            <span class="review-value">${step1Data.brochurePDF ? 'تم الرفع' : 'غير مرفق'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">صورة بانر المزاد:</span>
                            <span class="review-value">${step1Data.auctionThumbnail ? 'تم الرفع' : 'غير مرفق'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">رقم موافقة المزاد:</span>
                            <span class="review-value">${convertArabicToEnglish(step1Data.auctionApprovalNumber) || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">اسم الشركة/البائع:</span>
                            <span class="review-value">${step1Data.companyName || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">البريد الإلكتروني للشركة:</span>
                            <span class="review-value">${step1Data.companyEmail || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">رقم هاتف الشركة:</span>
                            <span class="review-value">${convertArabicToEnglish(step1Data.companyPhone) || 'غير محدد'}</span>
                        </div>
                        <div class="review-item">
                            <span class="review-label">عدد العقارات:</span>
                            <span class="review-value">${convertArabicToEnglish(step1Data.numberOfProperties)}</span>
                        </div>
                    </div>

                    <!-- Properties Section -->
                    <div class="review-section">
                        <h4 class="review-section-title">العقارات (${convertArabicToEnglish(properties.length)})</h4>
                        ${properties.length > 0 ? `
                            <div class="review-properties-container">
                                ${propertyCardsHTML}
                            </div>
                        ` : `
                            <div class="review-item">
                                <span class="review-value">لا توجد عقارات مضافة</span>
                            </div>
                        `}
                    </div>

                    <!-- Step 5 Buttons -->
                    <div class="wizard-buttons">
                        <button type="button" class="wizard-btn wizard-btn-secondary" id="step5-back-btn">عودة</button>
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
            'industrial': 'صناعي',
            'others': 'اخرى'
        };
        return labels[type] || 'غير محدد';
    }

    /**
     * Render the property details page content for a specific property
     */
    function renderPropertyDetailsPageContent(propertyIndex) {
        const property = formData.properties?.[propertyIndex];
        if (!property) return '';

        const propertyTypeLabel = property.propertyType === 'others' && property.propertyTypeOther
            ? property.propertyTypeOther
            : getPropertyTypeLabel(property.propertyType);
        const propertySize = property.propertySize ? convertArabicToEnglish(property.propertySize) + ' ' + (property.propertySizeUnit || 'م²') : 'غير محدد';

        // Property images HTML
        const propertyImages = property.propertyImages || [];
        const imagesHTML = propertyImages.length > 0
            ? propertyImages.map(img => `
                <div class="property-detail-image-item">
                    <img src="${img.preview || img}" alt="صورة العقار" />
                </div>
            `).join('')
            : '<p class="property-detail-no-images">لا توجد صور</p>';

        return `
            <div class="property-details-page-header">
                <button type="button" class="property-details-back-btn" id="property-details-back-btn" aria-label="رجوع">
                    <i data-lucide="arrow-right" class="property-details-back-icon"></i>
                </button>
                <h3 class="property-details-page-title">تفاصيل عقار ${propertyIndex + 1}</h3>
            </div>
            <div class="property-details-page-content">
                <div class="property-details-section">
                    <h4 class="property-details-section-title">معلومات العقار الأساسية</h4>
                    <div class="property-detail-item">
                        <span class="property-detail-label">نوع العقار:</span>
                        <span class="property-detail-value">${propertyTypeLabel || 'غير محدد'}</span>
                    </div>
                    <div class="property-detail-item">
                        <span class="property-detail-label">رابط عنوان العقار (من قوقل ماب):</span>
                        <span class="property-detail-value">${property.propertyTitle ? `<a href="${property.propertyTitle}" target="_blank" rel="noopener noreferrer" class="property-detail-link">${property.propertyTitle}</a>` : 'غير محدد'}</span>
                    </div>
                    <div class="property-detail-item">
                        <span class="property-detail-label">المساحة:</span>
                        <span class="property-detail-value">${propertySize}</span>
                    </div>
                    <div class="property-detail-item">
                        <span class="property-detail-label">الوصف:</span>
                        <span class="property-detail-value property-detail-description">${property.propertyDescription || 'غير محدد'}</span>
                    </div>
                </div>

                <div class="property-details-section">
                    <h4 class="property-details-section-title">حدود وأطوال العقار</h4>
                    <div class="property-detail-boundaries">
                        <div class="property-detail-boundary-item">
                            <span class="property-detail-boundary-label">شمال:</span>
                            <span class="property-detail-boundary-value">${property.propertyBoundaries?.north || 'غير محدد'}</span>
                        </div>
                        <div class="property-detail-boundary-item">
                            <span class="property-detail-boundary-label">جنوب:</span>
                            <span class="property-detail-boundary-value">${property.propertyBoundaries?.south || 'غير محدد'}</span>
                        </div>
                        <div class="property-detail-boundary-item">
                            <span class="property-detail-boundary-label">شرق:</span>
                            <span class="property-detail-boundary-value">${property.propertyBoundaries?.east || 'غير محدد'}</span>
                        </div>
                        <div class="property-detail-boundary-item">
                            <span class="property-detail-boundary-label">غرب:</span>
                            <span class="property-detail-boundary-value">${property.propertyBoundaries?.west || 'غير محدد'}</span>
                        </div>
                    </div>
                </div>

                <div class="property-details-section">
                    <h4 class="property-details-section-title">صور العقار</h4>
                    <div class="property-detail-images-grid">
                        ${imagesHTML}
                    </div>
                </div>

                <div class="property-details-actions">
                    <button type="button" class="wizard-btn wizard-btn-secondary property-detail-bottom-btn" data-property-index="${propertyIndex}" data-action="back">عودة</button>
                    <button type="button" class="wizard-btn wizard-btn-secondary property-detail-bottom-btn" data-property-index="${propertyIndex}" data-action="edit">تعديل</button>
                    <button type="button" class="wizard-btn wizard-btn-secondary property-detail-bottom-btn" data-property-index="${propertyIndex}" data-action="delete">حذف</button>
                </div>
            </div>
        `;
    }

    /**
     * Open the property details page for a specific property
     */
    function openPropertyDetailsPage(propertyIndex) {
        const detailsPage = document.getElementById('start-new-auction-property-details-page');
        const wizardStep5 = document.getElementById('wizard-step-5');

        if (!detailsPage || !wizardStep5) return;

        // Render the property details content
        detailsPage.innerHTML = renderPropertyDetailsPageContent(propertyIndex);

        // Reset state: ensure we start from initial position (off-screen) for slide animation
        detailsPage.classList.remove('property-details-page-open', 'property-details-page-closing');

        // Ensure property details page is scrolled to top instantly (before it becomes visible)
        detailsPage.scrollTop = 0;

        // Show property details page immediately (initially off-screen with translateX(100%))
        detailsPage.style.display = 'block';

        // Hide wizard-step-5 with fade out (both animations happen simultaneously)
        wizardStep5.style.transition = 'opacity 0.25s ease';
        wizardStep5.style.opacity = '0';
        // Hide after opacity transition completes
        setTimeout(() => {
            wizardStep5.style.display = 'none';
        }, 250);

        // Trigger reflow to ensure initial state is applied before animation
        detailsPage.offsetHeight;

        // Add open class to trigger slide-to-left animation immediately
        // Small delay to ensure browser has painted the initial state
        requestAnimationFrame(() => {
            detailsPage.classList.add('property-details-page-open');
        });

        // Scroll to top instantly - use multiple methods to ensure it works
        detailsPage.scrollTop = 0;
        // Also scroll after animation starts to ensure it stays at top
        requestAnimationFrame(() => {
            detailsPage.scrollTop = 0;
        });
        // Scroll again after a short delay to catch any layout changes
        setTimeout(() => {
            detailsPage.scrollTop = 0;
        }, 100);

        // Initialize lucide icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            // Final scroll to top after everything is rendered
            detailsPage.scrollTop = 0;
        }, 50);

        // Attach header back button listener
        const headerBackBtn = document.getElementById('property-details-back-btn');
        if (headerBackBtn) {
            headerBackBtn.onclick = closePropertyDetailsPage;
        }

        // Attach button listeners using data-action attributes
        detailsPage.querySelectorAll('.property-detail-bottom-btn').forEach(btn => {
            const action = btn.getAttribute('data-action');
            const index = parseInt(btn.getAttribute('data-property-index'));
            
            if (action === 'back') {
                btn.onclick = () => {
                    closePropertyDetailsPage();
                };
            } else if (action === 'edit') {
                btn.onclick = () => {
                    // Close details page without showing step 5 (we're going to step 2)
                    const page = document.getElementById('start-new-auction-property-details-page');
                    if (page) {
                        page.classList.remove('property-details-page-open');
                        page.classList.add('property-details-page-closing');
                        setTimeout(() => {
                            page.style.display = 'none';
                            page.classList.remove('property-details-page-closing');
                            // Navigate to step 2 for editing
                            formData.currentPropertyIndex = index;
                            autoSaveData();
                            currentStep = 2;
                            showStep(2);
                            loadPropertyToStep2(index);
                        }, 300);
                    }
                };
            } else if (action === 'delete') {
                btn.onclick = () => {
                    // Show delete confirmation
                    // Note: The property details page is automatically closed in showDeletePropertyConfirmation before re-rendering
                    showDeletePropertyConfirmation(index);
                };
            }
        });
    }

    /**
     * Close the property details page and return to step 5
     */
    function closePropertyDetailsPage() {
        const detailsPage = document.getElementById('start-new-auction-property-details-page');
        const wizardStep5 = document.getElementById('wizard-step-5');

        if (!detailsPage || !wizardStep5) return;

        // Add closing class for fade out animation
        detailsPage.classList.remove('property-details-page-open');
        detailsPage.classList.add('property-details-page-closing');

        wizardStep5.style.display = 'block';
        wizardStep5.style.opacity = '1';

        // After fade out animation completes, hide details page and show step 5
        setTimeout(() => {
            detailsPage.style.display = 'none';
            detailsPage.classList.remove('property-details-page-closing');
        }, 300);
    }

    /**
     * Format date to Arabic display format: "Day Month Year" like "14 يناير 2026"
     */
    function formatDateForDisplay(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const day = date.getDate();
            const monthIndex = date.getMonth();
            const year = date.getFullYear();
            const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            const month = arabicMonths[monthIndex];
            return `${day} ${month} ${year}`;
        } catch (e) {
            return '';
        }
    }

    /**
     * Format date to YYYY-MM-DD for storage
     */
    function formatDateForStorage(date) {
        if (!date) return '';
        try {
            const d = date instanceof Date ? date : new Date(date);
            if (isNaN(d.getTime())) return '';
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            return '';
        }
    }

    /**
     * Convert 24-hour time to display format with Arabic AM/PM
     */
    function formatTimeForDisplay(time24) {
        if (!time24) return '';
        try {
            const [hours, minutes] = time24.split(':');
            const hoursNum = parseInt(hours, 10);
            const period = hoursNum >= 12 ? 'مساءً' : 'صباحاً';
            let hours12 = hoursNum % 12;
            if (hours12 === 0) hours12 = 12;
            return `${String(hours12).padStart(2, '0')}:${minutes || '00'} ${period}`;
        } catch (e) {
            return '';
        }
    }


    /**
     * Convert Arabic numbers to English numbers
     */
    function convertArabicToEnglish(text) {
        if (!text) return text;
        const arabicToEnglish = {
            '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
            '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
        };
        return String(text).replace(/[٠-٩]/g, (match) => arabicToEnglish[match] || match);
    }

    /**
     * Helper: Format date and time with dash separator
     */
    function formatDateTime(date, time) {
        if (!date) return 'غير محدد';
        const dateStr = formatDateForDisplay(date);
        if (!time) return convertArabicToEnglish(dateStr);
        const timeStr = formatTimeForDisplay(time);
        return convertArabicToEnglish(`${dateStr} - ${timeStr}`);
    }

    /**
     * Get missing required fields
     */
    function getMissingFields() {
        const missing = [];
        const data = formData;

        // Step 1 - Company Information
        if (!data.step1.companyName || data.step1.companyName.trim() === '') {
            missing.push('اسم الشركة/البائع');
        }
        if (!data.step1.companyEmail || data.step1.companyEmail.trim() === '') {
            missing.push('البريد الإلكتروني للشركة');
        }
        if (!data.step1.companyPhone || data.step1.companyPhone.trim() === '') {
            missing.push('رقم هاتف الشركة');
        }
        if (!data.step1.propertiesLocations || data.step1.propertiesLocations.trim() === '') {
            missing.push('مواقع العقارات');
        }

        // Step 1 - Other fields
        if (!data.step1.sellerType) missing.push('نوع البائع');
        if (!data.step1.sellerName) missing.push('اسم البائع');
        if (!data.step1.contactEmail) missing.push('البريد الإلكتروني');
        if (!data.step1.contactPhone) missing.push('رقم الهاتف');
        if (!data.step1.propertyCity) missing.push('مدينة العقار');

        // Step 2 - Note: propertyTitle and propertySize are validated per property below
        if (!data.step2.propertyType) missing.push('نوع العقار');
        if (data.step2.propertyType === 'others' && !data.step2.propertyTypeOther) missing.push('تحديد نوع العقار (اخرى)');

        // Step 3
        if (!data.step3.startPrice) missing.push('سعر البداية');
        if (!data.step3.auctionStartDate) missing.push('تاريخ بدء المزاد');
        if (!data.step3.auctionEndDate) missing.push('تاريخ انتهاء المزاد');

        // Check each property for missing fields
        const properties = data.properties || [];
        properties.forEach((property, index) => {
            const propertyNumber = index + 1;
            if (!property.propertyTitle || property.propertyTitle.trim() === '') {
                missing.push(`رابط عنوان العقار (من قوقل ماب) (عقار ${propertyNumber})`);
            }
            if (!property.propertyDescription || property.propertyDescription.trim() === '') {
                missing.push(`وصف العقار (عقار ${propertyNumber})`);
            }
        });

        return missing;
    }

    /**
     * Update progress bar
     */
    function updateProgressBar() {
        const progressBar = document.getElementById('wizard-progress-bar');
        if (progressBar) {
            const progress = ((currentStep - 1) / 4) * 100;
            const percentage = Math.round(progress);

            // For steps 2, 3, and 4, align progress bar with current step position
            let barWidth = progress;

            if (currentStep === 1) {
                barWidth = 12; // Visual width 10%
            } else if (currentStep >= 2 && currentStep <= 4) {
                // Get the current step element to calculate its position
                const currentStepElement = document.querySelector(`.progress-step[data-step="${currentStep}"]`);
                const wizardProgress = document.querySelector('.wizard-progress');

                if (currentStepElement && wizardProgress) {
                    const containerRect = wizardProgress.getBoundingClientRect();
                    const stepRect = currentStepElement.getBoundingClientRect();

                    // Calculate step's center position from the right edge (RTL)
                    // In RTL: right edge is 0%, left edge is 100%
                    const stepCenterX = stepRect.left + (stepRect.width / 2);
                    const distanceFromRight = containerRect.right - stepCenterX;
                    const containerWidth = containerRect.width;

                    // Calculate percentage from right edge
                    const stepCenterPercent = (distanceFromRight / containerWidth) * 100;

                    // Progress bar should extend to the step's center position
                    barWidth = stepCenterPercent;
                } else {
                    // Fallback: use calculated progress
                    barWidth = progress;
                }
            } else if (currentStep === 5) {
                barWidth = 100;
            }

            // Ensure progress bar width doesn't exceed 100%
            barWidth = Math.min(barWidth, 100);
            progressBar.style.width = barWidth + '%';

            // Always show percentage (0% for step 1, actual percentage for other steps)
            progressBar.setAttribute('data-percentage', percentage + '%');
            progressBar.classList.remove('hide-percentage');
        }
    }

    /**
     * Show specific step
     */
    function showStep(step) {
        /* Scroll to the top page */
        scrollToTop();

        // Ensure property details page state is managed when changing steps
        const propertyDetailsPage = document.getElementById('start-new-auction-property-details-page');
        if (propertyDetailsPage && propertyDetailsPage.style.display === 'block') {
            // Hide property details page when changing steps (user should see the step content, not property details)
            propertyDetailsPage.style.display = 'none';
            propertyDetailsPage.classList.remove('property-details-page-open', 'property-details-page-closing');
        }

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

        // Clear property card selection when going to step 1
        if (step === 1) {
            clearPropertyCardSelection();
            renderPropertyCardsContainer();
        }

        // Re-render step 5 with latest data when showing it
        if (step === 5) {
            const step5Element = document.getElementById('wizard-step-5');
            if (step5Element) {
                // Re-render step 5 with latest data
                step5Element.outerHTML = renderStep5();
                // Ensure step 5 is displayed
                const newStep5Element = document.getElementById('wizard-step-5');
                if (newStep5Element) {
                    newStep5Element.style.display = 'block';
                }
                // Re-attach listeners
                setupStep5Listeners();
                lucide.createIcons();
            }
        }

        // Re-initialize date and time pickers when showing step 3
        if (step === 3) {
            setTimeout(() => {
                initializeDatePickers();
                initializeTimePickers();
            }, 100);
        }
    }

    /**
     * Save step 1 data
     */
    function saveStep1() {
        const numberOfPropertiesInput = document.getElementById('number-of-properties');
        const approvalNumberInput = document.getElementById('auction-approval-number-step1');

        const numberOfProperties = parseInt(numberOfPropertiesInput?.value || '0', 10) || 0;
        const approvalNumber = approvalNumberInput?.value || '';

        // Update formData.step1 with new fields
        formData.step1 = {
            ...formData.step1,
            propertiesLocations: document.getElementById('properties-locations')?.value || '',
            auctionApprovalNumber: approvalNumber,
            companyName: document.getElementById('company-name')?.value || '',
            companyEmail: document.getElementById('company-email')?.value || '',
            companyPhone: document.getElementById('company-phone')?.value || '',
            numberOfProperties: numberOfProperties,
            authorizationConfirmed: document.getElementById('authorization-checkbox')?.checked || false
        };

        // Update properties array length if number changed
        if (formData.properties.length !== numberOfProperties) {
            renderPropertyCardsContainer();
        }

        autoSaveData();
    }

    /**
     * Save step 2 data
     */
    function saveStep2() {
        // Get property size and remove commas for storage
        const propertySizeValue = document.getElementById('property-size')?.value || '';
        const propertySizeClean = propertySizeValue.replace(/,/g, '');

        const propertyData = {
            propertyType: document.getElementById('property-type')?.value || '',
            propertyTypeOther: document.getElementById('property-type-other')?.value || '',
            propertyTitle: document.getElementById('auction-property-google-maps-url')?.value || '',
            propertyAddressUrl: '',
            propertySize: propertySizeClean,
            propertySizeUnit: 'م²',
            propertyDescription: document.getElementById('auction-property-description')?.value || '',
            propertyBoundaries: {
                north: document.getElementById('property-boundary-north')?.value || '',
                south: document.getElementById('property-boundary-south')?.value || '',
                east: document.getElementById('property-boundary-east')?.value || '',
                west: document.getElementById('property-boundary-west')?.value || ''
            },
            propertyImages: formData.step2.propertyImages || []
        };

        // Update step2 for backward compatibility
        formData.step2 = propertyData;

        // If editing an existing property, save to properties array
        if (formData.currentPropertyIndex !== null && formData.currentPropertyIndex >= 0) {
            const index = formData.currentPropertyIndex;
            if (formData.properties[index]) {
                // Preserve the id
                propertyData.id = formData.properties[index].id;
                formData.properties[index] = propertyData;
            }
        }

        autoSaveData();
    }

    /**
     * Calculate and set end date based on start date and days amount
     */
    function calculateEndDate() {
        const startDateInput = document.getElementById('auction-start-date');
        const endDateInput = document.getElementById('auction-end-date');
        const daysAmountInput = document.getElementById('auction-days-amount');

        if (!startDateInput || !endDateInput || !daysAmountInput) return;

        const startDateValue = startDateInput.getAttribute('data-date-value');
        const daysAmount = parseInt(daysAmountInput.value, 10);

        if (startDateValue && !isNaN(daysAmount) && daysAmount > 0) {
            try {
                const startDate = new Date(startDateValue);
                if (!isNaN(startDate.getTime())) {
                    // Add days to start date
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + daysAmount);

                    // Format and set end date
                    const endDateStorage = formatDateForStorage(endDate);
                    const endDateDisplay = formatDateForDisplay(endDateStorage);
                    endDateInput.setAttribute('data-date-value', endDateStorage);
                    endDateInput.value = endDateDisplay;
                }
            } catch (e) {
                console.warn('Error calculating end date:', e);
            }
        } else {
            // Clear end date if invalid
            endDateInput.value = '';
            endDateInput.removeAttribute('data-date-value');
        }

        // Time is fixed at 12:00 PM - no syncing needed
    }

    /**
     * Save step 3 data
     */
    function saveStep3() {
        const startDateInput = document.getElementById('auction-start-date');
        const startTimeInput = document.getElementById('auction-start-time');
        const endDateInput = document.getElementById('auction-end-date');

        // Get values and remove commas for storage
        const startPriceValue = document.getElementById('start-price')?.value || '';
        const depositPriceValue = document.getElementById('deposit-amount')?.value || '';
        const bidIncrementValue = document.getElementById('bid-increment')?.value || '';
        const minimumSalePriceValue = document.getElementById('minimum-sale-price')?.value || '';

        formData.step3 = {
            startPrice: startPriceValue.replace(/,/g, ''),
            depositPrice: depositPriceValue.replace(/,/g, ''),
            bidIncrement: bidIncrementValue.replace(/,/g, ''),
            minimumSalePrice: minimumSalePriceValue.replace(/,/g, ''),
            auctionStartDate: startDateInput?.getAttribute('data-date-value') || '',
            auctionStartTime: '12:00', // Fixed time: 12:00 PM
            auctionDaysAmount: document.getElementById('auction-days-amount')?.value || '',
            auctionEndDate: endDateInput?.getAttribute('data-date-value') || '',
            auctionEndTime: '12:00' // Fixed time: 12:00 PM
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
     * Scroll to top smoothly
     */
    function scrollToTop() {
        // Scroll the main scrollable container instantly
        const scrollableContainer = document.querySelector('#add-new-auction-view .scrollable-container');
        if (scrollableContainer) {
            scrollableContainer.scrollTop = 0;
        }

        // Also scroll the property details page if it's visible (instant, unnoticeable)
        const propertyDetailsPage = document.getElementById('start-new-auction-property-details-page');
        if (propertyDetailsPage && propertyDetailsPage.style.display === 'block') {
            propertyDetailsPage.scrollTop = 0;
        }

        // Fallback to window scroll (instant)
        if (window.scrollY > 0) {
            window.scrollTo(0, 0);
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
     * Scroll to element smoothly
     */
    function scrollToElement(element) {
        if (!element) return;
        const scrollableContainer = document.querySelector('#add-new-auction-view .scrollable-container');
        if (scrollableContainer) {
            const elementRect = element.getBoundingClientRect();
            const containerRect = scrollableContainer.getBoundingClientRect();
            const scrollTop = scrollableContainer.scrollTop;
            const elementTop = elementRect.top - containerRect.top + scrollTop;

            scrollableContainer.scrollTo({
                top: elementTop - 20, // Add some offset
                behavior: 'smooth'
            });
        } else {
            // Fallback to window scroll
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    /**
     * Setup progress steps navigation - make them clickable
     */
    function setupProgressStepsNavigation() {
        const progressSteps = document.querySelectorAll('.progress-step');

        progressSteps.forEach((stepElement) => {
            const targetStep = parseInt(stepElement.getAttribute('data-step'), 10);

            if (!targetStep || isNaN(targetStep)) return;

            // Add click event listener
            stepElement.addEventListener('click', function () {
                // Check if number-of-properties has a valid value (> 0)
                const numberOfPropertiesInput = document.getElementById('number-of-properties');
                const numValue = numberOfPropertiesInput ? (parseInt(numberOfPropertiesInput.value.trim() || '0', 10) || 0) : 0;

                // If number of properties is 0 or empty, scroll to input and highlight it
                if (numValue <= 0) {
                    if (numberOfPropertiesInput) {
                        // Scroll to the input smoothly
                        scrollToElement(numberOfPropertiesInput);

                        // Highlight the input to show it's required
                        numberOfPropertiesInput.style.borderColor = '#dc2626';
                        numberOfPropertiesInput.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';

                        // Remove highlight after a delay
                        setTimeout(() => {
                            numberOfPropertiesInput.style.borderColor = '';
                            numberOfPropertiesInput.style.boxShadow = '';
                        }, 2000);

                        // Focus the input
                        setTimeout(() => {
                            numberOfPropertiesInput.focus();
                        }, 300);
                    }

                    // Don't proceed with navigation - just scroll to input
                    return;
                }

                // If number of properties is valid, proceed with normal navigation
                // Check if any property card is selected, if not, select the first one
                // (but don't auto-select when navigating to step 5)
                if (targetStep !== 5) {
                    const selectedCard = document.querySelector('.property-card-item.selected');
                    const firstCard = document.querySelector('.property-card-item[data-property-index="0"]');

                    if (!selectedCard && firstCard && formData.step1.numberOfProperties > 0) {
                        selectPropertyCard(0);
                        formData.currentPropertyIndex = 0;
                        autoSaveData();
                    }
                }

                // Save current step data before switching
                if (currentStep === 1) {
                    saveStep1();
                } else if (currentStep === 2) {
                    saveStep2();
                } else if (currentStep === 3) {
                    saveStep3();
                } else if (currentStep === 4) {
                    saveStep4();
                }

                // Update current step
                currentStep = targetStep;
                autoSaveData();

                // If navigating to step 5, clear property card selections
                if (targetStep === 5) {
                    clearPropertyCardSelection();
                }

                // Show the target step with smooth transition
                showStep(targetStep);

                // If navigating to step 5, update review content
                if (targetStep === 5) {
                    renderStep5();
                }
            });

            // Add hover effect styling
            stepElement.style.cursor = 'pointer';
            stepElement.style.transition = 'all 0.3s ease';
        });
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

        // Make progress steps clickable
        setupProgressStepsNavigation();

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
     * Show/hide property type other input based on selection
     */
    function togglePropertyTypeOtherInput() {
        const propertyTypeSelect = document.getElementById('property-type');
        const otherInputContainer = document.getElementById('property-type-other-container');

        if (!propertyTypeSelect || !otherInputContainer) return;

        const selectedValue = propertyTypeSelect.value;

        if (selectedValue === 'others') {
            // Show the input smoothly
            otherInputContainer.style.display = 'block';
            // Force reflow to ensure display change is applied
            otherInputContainer.offsetHeight;
            otherInputContainer.style.maxHeight = '100px';
            // Use requestAnimationFrame for smooth opacity transition
            requestAnimationFrame(() => {
                otherInputContainer.style.opacity = '1';
            });
        } else {
            // Hide the input smoothly
            otherInputContainer.style.opacity = '0';
            otherInputContainer.style.maxHeight = '0';
            // Hide after transition completes
            setTimeout(() => {
                if (propertyTypeSelect.value !== 'others') {
                    otherInputContainer.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Setup Step 1 listeners
     */
    function setupStep1Listeners() {
        // Authorization checkbox validation
        const authCheckbox = document.getElementById('authorization-checkbox');
        const errorMessage = document.getElementById('authorization-error-message');
        const nextBtn1 = document.getElementById('step1-next-btn');

        // Number of properties input - update property cards when changed and validate button
        const numberOfPropertiesInput = document.getElementById('number-of-properties');

        // Function to update button state based on checkbox and number of properties
        function updateButtonState(isChecked) {
            const numValue = numberOfPropertiesInput ? (parseInt(numberOfPropertiesInput.value.trim() || '0', 10) || 0) : 0;
            const clampedValue = Math.max(0, Math.min(100, numValue));
            // Update input value if it was out of bounds
            if (numberOfPropertiesInput && numValue !== clampedValue) {
                numberOfPropertiesInput.value = clampedValue;
                saveStep1();
                renderPropertyCardsContainer();
            }
            const hasValidProperties = clampedValue > 0;
            const shouldBeEnabled = isChecked && hasValidProperties;

            if (nextBtn1) {
                if (shouldBeEnabled) {
                    nextBtn1.style.backgroundColor = 'var(--primary-color)';
                    nextBtn1.style.color = 'white';
                    nextBtn1.style.opacity = '1';
                    nextBtn1.style.cursor = 'pointer';
                } else {
                    nextBtn1.style.backgroundColor = 'rgb(229, 229, 229)';
                    nextBtn1.style.color = 'black';
                    nextBtn1.style.opacity = '0.6';
                    nextBtn1.style.cursor = 'not-allowed';
                }
            }
        }

        // Function to validate and update button state based on number of properties
        function validateNumberOfProperties() {
            // Use the updateButtonState function which checks both authorization and number of properties
            if (authCheckbox && nextBtn1) {
                updateButtonState(authCheckbox.checked);
            }
        }

        if (numberOfPropertiesInput) {
            // Make input readonly
            numberOfPropertiesInput.setAttribute('readonly', 'readonly');

            // Get increase/decrease buttons
            const increaseBtn = document.getElementById('number-of-properties-increase');
            const decreaseBtn = document.getElementById('number-of-properties-decrease');

            // Function to update number value
            function updateNumberValue(delta) {
                const currentValue = parseInt(numberOfPropertiesInput.value || '0', 10) || 0;
                let newValue = currentValue + delta;

                // Enforce min (0) and max (100)
                newValue = Math.max(0, Math.min(100, newValue));

                numberOfPropertiesInput.value = newValue;
                saveStep1();
                renderPropertyCardsContainer();
                validateNumberOfProperties();
                updateButtonStates();
            }

            // Function to update button disabled states
            function updateButtonStates() {
                const currentValue = parseInt(numberOfPropertiesInput.value || '0', 10) || 0;

                if (increaseBtn) {
                    increaseBtn.disabled = currentValue >= 100;
                }

                if (decreaseBtn) {
                    decreaseBtn.disabled = currentValue <= 0;
                }
            }

            // Increase button
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => {
                    updateNumberValue(1);
                });
            }

            // Decrease button
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => {
                    updateNumberValue(-1);
                });
            }

            // Initial button state update
            updateButtonStates();

            // Initialize icons for buttons
            if (increaseBtn || decreaseBtn) {
                setTimeout(() => {
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }, 100);
            }

            // Initial validation
            validateNumberOfProperties();
        }

        // Brochure PDF upload
        setupFileUpload('brochure-pdf-input', 'brochure-pdf-placeholder', 'brochurePDF', 'step1');

        // Thumbnail image upload
        setupThumbnailUpload();

        // Save step 1 inputs
        ['properties-locations', 'company-name', 'company-email', 'company-phone'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('blur', saveStep1);
                el.addEventListener('change', saveStep1);
            }
        });


        // Function to check if button is in disabled state (gray background)
        function isButtonDisabled() {
            if (!nextBtn1) return false;
            const bgColor = window.getComputedStyle(nextBtn1).backgroundColor;
            // Check if background color is rgb(229, 229, 229) or equivalent
            return bgColor === 'rgb(229, 229, 229)' || bgColor === '#e5e5e5';
        }

        // Initialize button state based on checkbox and number of properties
        if (authCheckbox && nextBtn1) {
            updateButtonState(authCheckbox.checked);

            // Handle checkbox change
            authCheckbox.addEventListener('change', function () {
                const isChecked = this.checked;
                updateButtonState(isChecked);
                saveStep1();

                // Hide error message smoothly when checked
                if (isChecked && errorMessage) {
                    errorMessage.style.transition = 'opacity 0.3s ease';
                    errorMessage.style.opacity = '0';
                }
            });
        }

        // Also validate button when number of properties changes (handled in the input listener above)

        // Handle next button click
        if (nextBtn1) {
            nextBtn1.addEventListener('click', () => {
                // Check if button is in disabled state (gray background)
                if (isButtonDisabled()) {
                    // Show error message smoothly
                    if (errorMessage) {
                        requestAnimationFrame(() => {
                            errorMessage.style.transition = 'opacity 0.3s ease';
                            errorMessage.style.opacity = '1';
                        });
                    }
                    return; // Don't proceed if button is in disabled state
                }

                // Hide error message if it was shown
                if (errorMessage) {
                    errorMessage.style.opacity = '0';
                }

                saveStep1();
                // Automatically select the first property card (index 0)
                if (formData.step1.numberOfProperties > 0) {
                    selectPropertyCard(0);
                    formData.currentPropertyIndex = 0;
                    autoSaveData();
                    // Load property data into step 2
                    loadPropertyToStep2(0);
                }
                currentStep = 2;
                autoSaveData();
                showStep(2);
            });
        }
    }


    /**
     * Setup file upload handler
     */
    function setupFileUpload(inputId, placeholderId, dataKey, stepKey) {
        const input = document.getElementById(inputId);
        const placeholder = document.getElementById(placeholderId);
        if (!input || !placeholder) return;

        placeholder.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-file-btn') && !e.target.closest('.change-file-btn')) {
                input.click();
            }
        });

        input.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.type === 'application/pdf') {
                    formData[stepKey][dataKey] = {
                        file: file,
                        name: file.name
                    };
                    placeholder.classList.add('has-file');
                    placeholder.innerHTML = `
                        <button type="button" class="delete-file-btn" data-file="${dataKey}" aria-label="حذف الملف">
                            <i data-lucide="x" class="delete-icon"></i>
                        </button>
                        <i data-lucide="file-check" class="upload-icon"></i>
                        <p>تم رفع الملف</p>
                        <button type="button" class="change-file-btn" data-file="${dataKey}">تغيير الملف</button>
                    `;
                    lucide.createIcons();
                    setupFileUpload(inputId, placeholderId, dataKey, stepKey);
                }
                autoSaveData();
            }
        });

        // Delete file button
        placeholder.querySelector('.delete-file-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            formData[stepKey][dataKey] = null;
            input.value = '';
            placeholder.classList.remove('has-file');
            placeholder.innerHTML = `
                <i data-lucide="upload" class="upload-icon"></i>
                <p>اضغط لرفع ملف PDF</p>
                <small>${dataKey === 'brochurePDF' ? 'بروشور المزاد' : 'ملف'}</small>
            `;
            lucide.createIcons();
            setupFileUpload(inputId, placeholderId, dataKey, stepKey);
            autoSaveData();
        });

        // Change file button
        placeholder.querySelector('.change-file-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            input.click();
        });
    }

    /**
     * Setup thumbnail image upload
     */
    function setupThumbnailUpload() {
        const input = document.getElementById('auction-thumbnail-input');
        const placeholder = document.getElementById('thumbnail-upload-placeholder');
        if (!input || !placeholder) return;

        placeholder.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-image-btn')) {
                input.click();
            }
        });

        input.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    formData.step1.auctionThumbnail = {
                        file: file,
                        preview: event.target.result
                    };
                    placeholder.innerHTML = `
                        <div class="image-preview-item" style="margin: 0 auto;">
                            <img src="${event.target.result}" alt="Thumbnail Preview">
                            <button type="button" class="remove-image-btn" data-file="thumbnail">×</button>
                        </div>
                    `;
                    setupThumbnailUpload();
                    autoSaveData();
                };
                reader.readAsDataURL(file);
            }
        });

        // Remove image button
        placeholder.querySelector('.remove-image-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            formData.step1.auctionThumbnail = null;
            input.value = '';
            placeholder.innerHTML = `
                <i data-lucide="image" class="upload-icon"></i>
                <p>اسحب الصورة هنا أو اضغط للاختيار</p>
                <small>صورة رئيسية للمزاد</small>
            `;
            lucide.createIcons();
            setupThumbnailUpload();
            autoSaveData();
        });
    }

    /**
     * Setup comma formatting for number inputs with cursor position preservation
     * This is a reusable function that can be used for any input field
     * @param {string|HTMLElement} inputIdOrElement - The input element ID or the element itself
     * @param {Function} [saveCallback] - Optional callback function to call on blur/change
     */
    function setupCommaFormattedInput(inputIdOrElement, saveCallback) {
        const input = typeof inputIdOrElement === 'string'
            ? document.getElementById(inputIdOrElement)
            : inputIdOrElement;

        if (!input) return;

        input.addEventListener('input', function (e) {
            // Save cursor position and original value
            const cursorPosition = this.selectionStart;
            const originalValue = this.value;

            // Count digits before cursor position (excluding commas)
            const textBeforeCursor = originalValue.substring(0, cursorPosition);
            const digitsBeforeCursor = (textBeforeCursor.replace(/,/g, '').match(/\d/g) || []).length;

            // Remove all non-digit characters except decimal point
            let value = this.value.replace(/[^\d.]/g, '');

            // Split by decimal point
            const parts = value.split('.');

            // Format the integer part with commas
            if (parts[0]) {
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }

            // Rejoin with decimal point (limit to 2 decimal places)
            let formattedValue = parts[0];
            if (parts.length > 1) {
                formattedValue += '.' + parts[1].substring(0, 2);
            }

            // Calculate new cursor position
            // Find the position in formatted string where we have the same number of digits before cursor
            let digitCount = 0;
            let newCursorPosition = formattedValue.length;

            for (let i = 0; i < formattedValue.length; i++) {
                if (/\d/.test(formattedValue[i])) {
                    digitCount++;
                }
                // If we've reached the same number of digits as before cursor, set position after this digit
                if (digitCount === digitsBeforeCursor) {
                    newCursorPosition = i + 1;
                    break;
                }
            }

            // Ensure cursor position is within bounds
            newCursorPosition = Math.min(newCursorPosition, formattedValue.length);

            // Update the input value
            this.value = formattedValue;

            // Restore cursor position after a short delay to ensure DOM is updated
            setTimeout(() => {
                this.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        });

        input.addEventListener('blur', function () {
            if (saveCallback) saveCallback();
        });

        input.addEventListener('change', function () {
            if (saveCallback) saveCallback();
        });
    }

    /**
     * Setup Step 2 listeners
     */
    function setupStep2Listeners() {
        // Property type change - show/hide other input
        const propertyTypeSelect = document.getElementById('property-type');
        if (propertyTypeSelect) {
            propertyTypeSelect.addEventListener('change', function () {
                togglePropertyTypeOtherInput();
                saveStep2();
            });

            // Initialize on load
            togglePropertyTypeOtherInput();
        }

        // Property type other input - save on change
        const propertyTypeOtherInput = document.getElementById('property-type-other');
        if (propertyTypeOtherInput) {
            propertyTypeOtherInput.addEventListener('blur', saveStep2);
            propertyTypeOtherInput.addEventListener('input', saveStep2);
        }

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

        // Property size input with comma formatting
        setupCommaFormattedInput('property-size', saveStep2);

        // Save step 2 inputs (excluding property-size as it has its own listener)
        ['auction-property-google-maps-url', 'auction-property-description', 'property-boundary-north', 'property-boundary-south', 'property-boundary-east', 'property-boundary-west'].forEach(id => {
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
                // Update property cards to show current selection
                renderPropertyCardsContainer();
                currentStep = 1;
                autoSaveData();
                showStep(1);
            });
        }

        const nextBtn2 = document.getElementById('step2-next-btn');
        if (nextBtn2) {
            nextBtn2.addEventListener('click', () => {
                saveStep2();
                // Always go to step 3 when clicking next from step 2
                // The property selection is preserved for the flow
                currentStep = 3;
                autoSaveData();
                showStep(3);
            });
        }
    }

    /**
     * Initialize time displays (fixed at 12:00 PM)
     */
    function initializeTimePickers() {
        const startTimeInput = document.getElementById('auction-start-time');
        const startTimeDisplay = document.getElementById('auction-start-time-display');
        const endTimeDisplay = document.getElementById('auction-end-time-display');

        // Set fixed time value (12:00 PM) - no picker needed
        if (startTimeInput) {
            startTimeInput.value = '12:00';
        }
        if (startTimeDisplay) {
            startTimeDisplay.value = '12:00 مساءً';
        }
        if (endTimeDisplay) {
            endTimeDisplay.value = '12:00 مساءً';
        }
    }

    /**
     * Initialize Pikaday date pickers
     */
    function initializeDatePickers() {
        const startDateInput = document.getElementById('auction-start-date');

        // Destroy existing pickers if they exist
        if (startDatePicker) {
            startDatePicker.destroy();
            startDatePicker = null;
        }

        // Calculate max date (90 days from today)
        const today = new Date();
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 90);

        // Initialize start date picker
        startDatePicker = new Pikaday({
            field: startDateInput,
            minDate: today, // Prevent selecting past dates
            maxDate: maxDate, // Prevent selecting dates more than 90 days from today
            i18n: {
                previousMonth: 'الشهر السابق',
                nextMonth: 'الشهر التالي',
                months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
                weekdays: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                weekdaysShort: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
            },
            onSelect: function (date) {
                if (date) {
                    const storageDate = formatDateForStorage(date);
                    const displayDate = formatDateForDisplay(storageDate);
                    startDateInput.setAttribute('data-date-value', storageDate); // Store YYYY-MM-DD
                    startDateInput.value = displayDate; // Display Arabic format

                    // Recalculate end date if days amount is set
                    calculateEndDate();
                    saveStep3();
                }
            }
        });

        // Set initial date if exists
        const startDateValue = formData.step3.auctionStartDate || startDateInput.getAttribute('data-date-value');
        if (startDateValue) {
            try {
                const date = new Date(startDateValue);
                if (!isNaN(date.getTime())) {
                    startDatePicker.setDate(date);
                    const displayDate = formatDateForDisplay(startDateValue);
                    startDateInput.value = displayDate;
                    startDateInput.setAttribute('data-date-value', startDateValue);
                }
            } catch (e) {
                console.warn('Invalid start date:', startDateValue);
            }
        }

        // Calculate initial end date if start date and days amount exist
        calculateEndDate();
    }

    /**
     * Setup Step 3 listeners
     */
    function setupStep3Listeners() {
        // Initialize date pickers
        initializeDatePickers();

        // Initialize time pickers
        initializeTimePickers();

        // Listen to days amount input to calculate end date
        const daysAmountInput = document.getElementById('auction-days-amount');
        if (daysAmountInput) {
            // Validate and clamp value on input
            daysAmountInput.addEventListener('input', function () {
                let value = parseInt(this.value, 10);

                // If value is empty or NaN, allow it (user might be typing)
                if (isNaN(value)) {
                    calculateEndDate();
                    return;
                }

                // Clamp value between 5 and 90
                if (value > 30) {
                    value = 30;
                    this.value = value;
                }

                calculateEndDate();
            });

            // Validate and clamp value on change (when user leaves the field)
            daysAmountInput.addEventListener('change', function () {
                let value = parseInt(this.value, 10);

                // If value is empty or NaN, set to minimum
                if (isNaN(value) || value === '') {
                    value = 5;
                    this.value = value;
                }

                // Clamp value between 5 and 90
                if (value < 3) {
                    value = 3;
                    this.value = value;
                } else if (value > 90) {
                    value = 90;
                    this.value = value;
                }

                calculateEndDate();
                saveStep3();
            });

            // Handle arrow/spinner clicks to ensure step of 1
            daysAmountInput.addEventListener('wheel', function (e) {
                e.preventDefault();
                const currentValue = parseInt(this.value, 10) || 3;
                const delta = e.deltaY > 0 ? -1 : 1;
                const newValue = Math.max(5, Math.min(90, currentValue + delta));
                this.value = newValue;
                calculateEndDate();
                saveStep3();
            });
        }

        // Time displays are fixed at 12:00 PM - no sync needed

        // Setup comma formatting for step 3 price inputs
        setupCommaFormattedInput('start-price', saveStep3);
        setupCommaFormattedInput('deposit-amount', saveStep3);
        setupCommaFormattedInput('bid-increment', saveStep3);
        setupCommaFormattedInput('minimum-sale-price', saveStep3);

        // Auto-suggest bid increment based on start price
        const startPriceInput = document.getElementById('start-price');
        const bidIncrementInput = document.getElementById('bid-increment');

        if (startPriceInput && bidIncrementInput) {
            startPriceInput.addEventListener('blur', function () {
                const startPriceValue = this.value.replace(/,/g, '');
                const startPrice = parseFloat(startPriceValue);
                if (startPrice && !bidIncrementInput.value) {
                    // Suggest 1% of start price, rounded to nearest 100
                    const suggested = Math.round(startPrice * 0.01 / 100) * 100;
                    if (suggested >= 100) {
                        // Format with commas
                        bidIncrementInput.value = suggested.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }
                }
                saveStep3();
            });
        }

        // Save step 3 inputs (excluding price inputs and date inputs as they're handled separately)
        ['auction-start-time'].forEach(id => {
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

        const nextBtn3 = document.getElementById('step3-next-btn');
        if (nextBtn3) {
            nextBtn3.addEventListener('click', () => {
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


        const nextBtn4 = document.getElementById('step4-next-btn');
        if (nextBtn4) {
            nextBtn4.addEventListener('click', () => {
                saveStep4();

                // Check current selected property index
                const currentIndex = formData.currentPropertyIndex !== null ? formData.currentPropertyIndex : -1;
                const totalProperties = formData.properties.length;

                // If current property is the last one, go to step 5
                if (currentIndex === totalProperties - 1 || currentIndex === -1 || totalProperties === 0) {
                    currentStep = 5;
                    autoSaveData();
                    // Re-render step 5 to update review with latest data
                    renderStep5();
                    showStep(5);
                } else {
                    // Select the next property card and go to step 2
                    const nextIndex = currentIndex + 1;
                    selectPropertyCard(nextIndex);
                    formData.currentPropertyIndex = nextIndex;
                    autoSaveData();
                    // Load property data into step 2
                    loadPropertyToStep2(nextIndex);
                    currentStep = 2;
                    autoSaveData();
                    showStep(2);
                }
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

        // Property card interactions
        setupPropertyCardListeners();
    }

    /**
     * Setup property card listeners for opening property details page, edit, delete
     */
    function setupPropertyCardListeners() {
        // Open property details page when clicking on the card (header or content area, but not action buttons)
        document.querySelectorAll('.review-property-card').forEach(card => {
            const header = card.querySelector('.review-property-card-header');
            const content = card.querySelector('.review-property-card-content');
            // Add click to both header and content areas
            [header, content].forEach(element => {
                if (element) {
                    element.addEventListener('click', (e) => {
                        // Don't open details page if clicking on action buttons
                        if (e.target.closest('.review-property-card-actions')) return;

                        const propertyIndex = parseInt(card.getAttribute('data-property-index'));
                        if (!isNaN(propertyIndex)) {
                            openPropertyDetailsPage(propertyIndex);
                        }
                    });
                }
            });
        });

        // Collapse button - collapse the card if expanded (card can still be expanded for quick view)
        document.querySelectorAll('.review-property-collapse-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-property-index'));
                const card = document.querySelector(`.review-property-card[data-property-index="${index}"]`);
                if (card) {
                    card.classList.remove('expanded');
                }
            });
        });

        // Edit button
        document.querySelectorAll('.review-property-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-property-index'));
                formData.currentPropertyIndex = index;
                autoSaveData();
                currentStep = 2;
                showStep(2);
                loadPropertyToStep2(index);
            });
        });

        // Delete button
        document.querySelectorAll('.review-property-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-property-index'));
                showDeletePropertyConfirmation(index);
            });
        });
    }

    /**
     * Show bottom sheet confirmation for property deletion
     * @param {number} propertyIndex - Index of the property to delete
     * @param {Function} onDeleteCallback - Optional callback to execute after deletion
     */
    function showDeletePropertyConfirmation(propertyIndex, onDeleteCallback) {
        // Remove existing bottom sheet if any
        const existingSheet = document.querySelector('.property-delete-bottom-sheet');
        if (existingSheet) {
            existingSheet.remove();
        }

        const bottomSheet = document.createElement('div');
        bottomSheet.className = 'property-delete-bottom-sheet';
        bottomSheet.innerHTML = `
            <div class="bottom-sheet-overlay"></div>
            <div class="bottom-sheet-content">
                <div class="bottom-sheet-handle"></div>
                <h3 class="bottom-sheet-title">تأكيد الحذف</h3>
                <p class="bottom-sheet-message">هل أنت متأكد من حذف عقار ${propertyIndex + 1}؟</p>
                <div class="bottom-sheet-buttons">
                    <button class="bottom-sheet-btn bottom-sheet-cancel-btn" id="property-delete-cancel">إلغاء</button>
                    <button class="bottom-sheet-btn bottom-sheet-confirm-btn" id="property-delete-confirm">تأكيد</button>
                </div>
            </div>
        `;

        document.body.appendChild(bottomSheet);

        // Show bottom sheet
        requestAnimationFrame(() => {
            bottomSheet.classList.add('active');
        });

        // Close handlers
        const closeSheet = () => {
            bottomSheet.classList.remove('active');
            setTimeout(() => {
                if (bottomSheet.parentNode) {
                    bottomSheet.parentNode.removeChild(bottomSheet);
                }
            }, 300);
        };

        // Cancel button
        const cancelBtn = bottomSheet.querySelector('#property-delete-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeSheet);
        }

        // Confirm button
        const confirmBtn = bottomSheet.querySelector('#property-delete-confirm');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                // Delete property
                formData.properties.splice(propertyIndex, 1);
                formData.step1.numberOfProperties = Math.max(0, formData.step1.numberOfProperties - 1);

                // Update number of properties input if it exists
                const numberOfPropertiesInput = document.getElementById('number-of-properties');
                if (numberOfPropertiesInput) {
                    numberOfPropertiesInput.value = formData.step1.numberOfProperties;
                    // Update button states
                    const increaseBtn = document.getElementById('number-of-properties-increase');
                    const decreaseBtn = document.getElementById('number-of-properties-decrease');
                    const currentValue = parseInt(numberOfPropertiesInput.value || '0', 10) || 0;
                    if (increaseBtn) increaseBtn.disabled = currentValue >= 100;
                    if (decreaseBtn) decreaseBtn.disabled = currentValue <= 0;
                }

                autoSaveData();

                // Close property details page before re-rendering (if it's open)
                const propertyDetailsPage = document.getElementById('start-new-auction-property-details-page');
                if (propertyDetailsPage && propertyDetailsPage.style.display === 'block') {
                    propertyDetailsPage.style.display = 'none';
                    propertyDetailsPage.classList.remove('property-details-page-open', 'property-details-page-closing');
                    // Show wizard-step-5 again
                    const wizardStep5 = document.getElementById('wizard-step-5');
                    if (wizardStep5) {
                        wizardStep5.style.display = 'block';
                        wizardStep5.style.opacity = '1';
                    }
                }

                closeSheet();

                // Check if this was the last property - if so, navigate to step 1
                const remainingProperties = formData.properties.length;
                if (remainingProperties === 0) {
                    // No properties left - navigate to step 1 to reset the process
                    currentStep = 1;
                    autoSaveData();
                    showStep(1);
                    // Clear property cards container
                    renderPropertyCardsContainer();
                    
                    // Ensure step1-next-btn is disabled (gray background) since number-of-properties is 0
                    setTimeout(() => {
                        const nextBtn1 = document.getElementById('step1-next-btn');
                        const authCheckbox = document.getElementById('authorization-checkbox');
                        const numberOfPropertiesInput = document.getElementById('number-of-properties');
                        
                        if (nextBtn1) {
                            // Check if number of properties is 0
                            const numValue = numberOfPropertiesInput ? (parseInt(numberOfPropertiesInput.value.trim() || '0', 10) || 0) : 0;
                            const hasValidProperties = numValue > 0;
                            const isChecked = authCheckbox ? authCheckbox.checked : false;
                            const shouldBeEnabled = isChecked && hasValidProperties;
                            
                            if (shouldBeEnabled) {
                                nextBtn1.style.backgroundColor = 'var(--primary-color)';
                                nextBtn1.style.color = 'white';
                                nextBtn1.style.opacity = '1';
                                nextBtn1.style.cursor = 'pointer';
                            } else {
                                nextBtn1.style.backgroundColor = 'rgb(229, 229, 229)';
                                nextBtn1.style.color = 'black';
                                nextBtn1.style.opacity = '0.6';
                                nextBtn1.style.cursor = 'not-allowed';
                            }
                        }
                    }, 50);
                } else {
                    // Re-render step 5 and property cards container
                    // Update wizard-step-5 DOM with new content
                    const wizardStep5Element = document.getElementById('wizard-step-5');
                    if (wizardStep5Element) {
                        const wasVisible = wizardStep5Element.style.display !== 'none';
                        wizardStep5Element.outerHTML = renderStep5();
                        // Re-attach event listeners for the new step 5 content
                        setupStep5Listeners();
                        // Restore visibility state
                        const newStep5Element = document.getElementById('wizard-step-5');
                        if (newStep5Element && wasVisible) {
                            newStep5Element.style.display = 'block';
                            newStep5Element.style.opacity = '1';
                        }
                    } else {
                        // If step 5 doesn't exist, just render it (shouldn't happen but safety check)
                        renderStep5();
                    }
                    renderPropertyCardsContainer();
                }

                // Execute callback if provided (after re-rendering)
                if (onDeleteCallback && typeof onDeleteCallback === 'function') {
                    onDeleteCallback();
                }
            });
        }

        // Overlay click
        const overlay = bottomSheet.querySelector('.bottom-sheet-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeSheet);
        }

        // Handle click
        const handle = bottomSheet.querySelector('.bottom-sheet-handle');
        if (handle) {
            let startY = 0;
            handle.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            });
            handle.addEventListener('touchend', (e) => {
                const endY = e.changedTouches[0].clientY;
                if (endY - startY > 50) {
                    closeSheet();
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
                        } else {
                            // Save current property index before clearing (if any)
                            const savedPropertyIndex = formData.currentPropertyIndex;

                            // Reset to step 1 when view becomes active
                            currentStep = 1;
                            autoSaveData();
                            showStep(1);
                            clearPropertyCardSelection();
                            renderPropertyCardsContainer();

                            // If there was a selected property, restore it and load its data into step 2 inputs
                            // This ensures inputs are always synced with the selected property
                            if (savedPropertyIndex !== null && savedPropertyIndex >= 0) {
                                if (formData.properties[savedPropertyIndex]) {
                                    // Restore the selection visually and load data
                                    // (selectPropertyCard already calls loadPropertyToStep2)
                                    formData.currentPropertyIndex = savedPropertyIndex;
                                    selectPropertyCard(savedPropertyIndex);
                                }
                            }
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

    // Export comma formatting function globally for use in other parts of the website
    window.setupCommaFormattedInput = setupCommaFormattedInput;
})();

