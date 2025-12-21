/**
 * Banner Slider Functionality
 * Handles the banner/carousel at the top of the page
 * Automatically slides through images and supports touch/swipe
 */

(function () {
    'use strict';

    // Track which slide is currently showing
    let currentSlide = 0;
    const totalSlides = 3;
    let slideInterval = null;

    /**
     * Initialize the banner slider
     * Sets up all the functionality for the banner carousel
     */
    function initBannerSlider() {
        // Get all slides and indicator dots
        const slides = document.querySelectorAll('.banner-slide');
        const indicators = document.querySelectorAll('.indicator');

        // If no slides found, exit early
        if (slides.length === 0 || indicators.length === 0) {
            return;
        }

        /**
         * Show a specific slide by index
         * @param {number} index - The slide number to show (0, 1, or 2)
         */
        function showSlide(index) {
            // Remove active class from all slides
            slides.forEach(slide => slide.classList.remove('active'));
            // Remove active class from all indicators
            indicators.forEach(indicator => indicator.classList.remove('active'));

            // Add active class to the selected slide
            if (slides[index]) {
                slides[index].classList.add('active');
            }
            // Add active class to the corresponding indicator
            if (indicators[index]) {
                indicators[index].classList.add('active');
            }

            // Update current slide tracker
            currentSlide = index;
        }

        /**
         * Go to the next slide
         * Wraps around to slide 0 after the last slide
         */
        function nextSlide() {
            const next = (currentSlide + 1) % totalSlides;
            showSlide(next);
        }

        /**
         * Go to the previous slide
         * Wraps around to the last slide if on slide 0
         */
        function prevSlide() {
            const prev = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(prev);
        }

        /**
         * Add click handlers to indicator dots
         * When user clicks a dot, show that slide
         */
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide(); // Reset timer when user manually changes slide
            });
        });

        /**
         * Start automatic sliding
         * Changes slide every 5 seconds
         */
        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        /**
         * Reset the auto-slide timer
         * Used when user manually changes slide
         */
        function resetAutoSlide() {
            if (slideInterval) {
                clearInterval(slideInterval);
            }
            startAutoSlide();
        }

        /**
         * Handle touch/swipe gestures for mobile
         * Allows users to swipe left/right to change slides
         */
        let touchStartX = 0;
        let touchEndX = 0;

        const slider = document.querySelector('.banner-slider');
        if (slider) {
            // When user starts touching
            slider.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            // When user finishes touching
            slider.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });

            /**
             * Determine swipe direction and change slide
             */
            function handleSwipe() {
                const swipeThreshold = 50; // Minimum distance for a swipe
                const diff = touchStartX - touchEndX;


                // If swipe distance is large enough
                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        prevSlide(); // Reversed from nextSlide() to prevSlide()
                    } else {
                        nextSlide(); // Reversed from prevSlide() to nextSlide()
                    }
                    resetAutoSlide();
                }
            }
        }

        // Start automatic sliding when page loads
        startAutoSlide();

        /**
         * Pause auto-slide when user hovers over banner
         * Resume when user moves mouse away
         */
        if (slider) {
            slider.addEventListener('mouseenter', () => {
                if (slideInterval) {
                    clearInterval(slideInterval);
                }
            });

            slider.addEventListener('mouseleave', () => {
                startAutoSlide();
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBannerSlider);
    } else {
        initBannerSlider();
    }
})();

