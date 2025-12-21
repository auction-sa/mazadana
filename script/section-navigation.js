/**
 * Section Navigation with Horizontal Sliding Animation
 * 
 * This file handles:
 * - Switching between different sections (Home, Sell, Rent, Auctions, My Actions, Profile)
 * - Smooth slide animations when switching sections
 * - Managing which section is currently visible
 * - Handling clicks on navigation buttons
 */

(function () {
    'use strict';

    /**
     * Section order for direction detection (RTL - Right to Left)
     * This order determines which direction sections slide when switching
     */
    const sectionOrder = [
        'home-section',
        'buy-section',
        'rent-section',
        'auction-section',
        'my-actions-section',
        'profile-section'
    ];

    // Get all sections and navigation items from the page
    const sections = document.querySelectorAll('.tab-section');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const topNavItems = document.querySelectorAll('.top-nav .top-nav-item');
    const quickAccessBoxes = document.querySelectorAll('.access-box');

    // Track which section is currently active
    let currentSection = 'home-section';

    // Navigation lock to prevent multiple simultaneous navigations
    let isNavigating = false;
    let pendingTimeouts = [];
    let pendingAnimationFrames = [];

    /**
     * Get the position of a section in the order array
     * @param {string} sectionId - The ID of the section
     * @returns {number} The index position
     */
    function getSectionIndex(sectionId) {
        return sectionOrder.indexOf(sectionId);
    }

    /**
     * Determine which direction the slide animation should go
     * @param {number} fromIndex - Current section index
     * @param {number} toIndex - Target section index
     * @returns {string} 'right' or 'left'
     */
    function getSlideDirection(fromIndex, toIndex) {
        // For RTL: moving to higher index means sliding from right (translateX 100%)
        // Moving to lower index means sliding from left (translateX -100%)
        return toIndex > fromIndex ? 'right' : 'left';
    }

    /**
     * Clear all property cards from view
     * Used when switching to profile section to clean up
     */
    function clearPropertyCards() {
        const propertyGrids = [
            'home-properties-grid',
            'buy-properties-grid',
            'rent-properties-grid',
            'auction-properties-grid'
        ];

        propertyGrids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (grid) {
                // Clear all property cards but keep the grid element
                const cards = grid.querySelectorAll('.property-card-home-page');
                cards.forEach(card => {
                    card.style.display = 'none';
                    card.remove();
                });
            }
        });
    }

    /**
     * Hide all property sections and show only profile section
     * This is called when switching to the profile section
     */
    function ensureProfileOnlyVisible() {
        // Hide all property sections
        const propertySections = ['home-section', 'buy-section', 'rent-section', 'auction-section', 'my-actions-section'];

        propertySections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('active');
                section.style.display = 'none';
                section.style.opacity = '0';
                section.style.visibility = 'hidden';
                section.style.pointerEvents = 'none';
                section.style.transform = 'translateX(100%)';
            }
        });

        // Clear any visible property cards
        clearPropertyCards();
    }

    /**
     * Cancel all pending timeouts and animation frames
     * This prevents overlapping animations when navigating quickly
     */
    function cancelPendingOperations() {
        // Clear all pending timeouts
        pendingTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        pendingTimeouts = [];

        // Cancel all pending animation frames
        pendingAnimationFrames.forEach(rafId => {
            cancelAnimationFrame(rafId);
        });
        pendingAnimationFrames = [];
    }

    /**
     * Wrapper for setTimeout that tracks the timeout ID
     * @param {Function} callback - Function to call
     * @param {number} delay - Delay in milliseconds
     * @returns {number} Timeout ID
     */
    function trackedSetTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            // Remove from array when executed
            const index = pendingTimeouts.indexOf(timeoutId);
            if (index > -1) {
                pendingTimeouts.splice(index, 1);
            }
            callback();
        }, delay);
        pendingTimeouts.push(timeoutId);
        return timeoutId;
    }

    /**
     * Wrapper for requestAnimationFrame that tracks the frame ID
     * @param {Function} callback - Function to call
     * @returns {number} Animation frame ID
     */
    function trackedRequestAnimationFrame(callback) {
        const rafId = requestAnimationFrame(() => {
            // Remove from array when executed
            const index = pendingAnimationFrames.indexOf(rafId);
            if (index > -1) {
                pendingAnimationFrames.splice(index, 1);
            }
            callback();
        });
        pendingAnimationFrames.push(rafId);
        return rafId;
    }

    /**
     * Ensure section content is visible (safety function for fast navigation)
     * @param {HTMLElement} sectionElement - The section element
     */
    function ensureSectionContentVisible(sectionElement) {
        if (!sectionElement) return;

        // Ensure section itself is visible
        sectionElement.style.display = 'block';
        sectionElement.style.visibility = 'visible';
        sectionElement.style.opacity = '1';
        sectionElement.style.pointerEvents = 'auto';
        sectionElement.style.transform = 'translateX(0)';
        sectionElement.classList.add('active');

        // Ensure section content is visible
        const sectionContent = sectionElement.querySelector('.section-content');
        if (sectionContent) {
            sectionContent.style.opacity = '1';
            sectionContent.style.transform = 'translateX(0)';
            sectionContent.style.visibility = 'visible';
            sectionContent.style.transition = '';
        }
    }

    /**
     * Main function to switch between sections
     * This is the most important function - it handles all section switching
     * @param {string} sectionId - The ID of the section to switch to
     */
    function switchToSection(sectionId) {
        // If already navigating, cancel previous operations and proceed with new navigation
        if (isNavigating) {
            cancelPendingOperations();
        }

        // Set navigation lock
        isNavigating = true;



        // Handle case: switching from subsection (buy-section, rent-section, auction-section) to home-section
        const isSubsection = currentSection === 'buy-section' || currentSection === 'rent-section' || currentSection === 'auction-section';
        if (isSubsection && sectionId === 'home-section') {
            // When coming from a subsection to home-section, use fade-in animation (like profile-to-home)
            const homeSection = document.getElementById('home-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (homeSection && currentActiveSection) {
                // Hide profile if it's active
                const profileSection = document.getElementById('profile-section');
                if (profileSection && profileSection.classList.contains('active')) {
                    profileSection.classList.remove('active');
                    profileSection.style.display = 'none';
                    profileSection.style.opacity = '0';
                    profileSection.style.visibility = 'hidden';
                    profileSection.style.pointerEvents = 'none';
                }

                // Ensure home-section is visible
                homeSection.style.display = 'block';
                homeSection.style.visibility = 'visible';
                homeSection.style.opacity = '1';
                homeSection.style.pointerEvents = 'auto';
                homeSection.style.transform = 'translateX(0)';
                homeSection.classList.add('active');

                // Hide content initially for fade-in animation
                const sectionContent = homeSection.querySelector('.section-content');
                if (sectionContent) {
                    sectionContent.style.opacity = '0';
                    sectionContent.style.transform = 'translateX(20px)';
                    sectionContent.style.visibility = 'hidden';
                    sectionContent.style.transition = 'none';
                }

                // Fade in content after brief delay (like profile-to-home)
                trackedSetTimeout(() => {
                    if (sectionContent) {
                        sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                        trackedRequestAnimationFrame(() => {
                            trackedRequestAnimationFrame(() => {
                                sectionContent.style.opacity = '1';
                                sectionContent.style.transform = 'translateX(0)';
                                sectionContent.style.visibility = 'visible';
                                // Release navigation lock after content is visible
                                trackedSetTimeout(() => {
                                    isNavigating = false;
                                }, 100);
                            });
                        });
                    } else {
                        isNavigating = false;
                    }
                }, 100);

                // Show all subsections with animation
                toggleHomeSubsections('home-section');

                // Update current section
                currentSection = sectionId;

                // Update active states on all navigation items
                updateActiveNavItems(sectionId);

                // Push navigation state to history
                trackedSetTimeout(() => {
                    if (typeof window.pushNavigationState === 'function') {
                        window.pushNavigationState(false);
                    }
                }, 100);

                return;
            }
        }

        // Prevent switching to the same section
        if (sectionId === currentSection) {
            // If clicking the same section, still update visibility of subsections
            if (sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section') {
                toggleHomeSubsections(sectionId);
            }
            // Release navigation lock since we're not actually navigating
            isNavigating = false;
            return;
        }

        // Special handling for transitions between home-section and my-actions-section
        // Also handles transitions between subsections (auction-section, buy-section, rent-section) and my-actions-section
        // Also handles transitions between profile-section and my-actions-section
        // This creates a smooth transition similar to profile-section
        const isFromHomeToMyActions = currentSection === 'home-section' && sectionId === 'my-actions-section';
        const isFromMyActionsToHome = currentSection === 'my-actions-section' && sectionId === 'home-section';
        const isFromSubsectionToMyActions = (currentSection === 'auction-section' || currentSection === 'buy-section' || currentSection === 'rent-section') && sectionId === 'my-actions-section';
        const isFromMyActionsToSubsection = currentSection === 'my-actions-section' && (sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section');
        const isFromProfileToMyActions = currentSection === 'profile-section' && sectionId === 'my-actions-section';
        const isFromMyActionsToProfile = currentSection === 'my-actions-section' && sectionId === 'profile-section';

        if (isFromHomeToMyActions || isFromMyActionsToHome || isFromSubsectionToMyActions || isFromMyActionsToSubsection || isFromProfileToMyActions || isFromMyActionsToProfile) {
            const homeSection = document.getElementById('home-section');
            const myActionsSection = document.getElementById('my-actions-section');
            const profileSection = document.getElementById('profile-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (!homeSection || !myActionsSection || !currentActiveSection) {
                isNavigating = false;
                return;
            }

            // Hide profile if it's active (unless we're transitioning to/from profile)
            if (!isFromProfileToMyActions && !isFromMyActionsToProfile) {
                if (profileSection && profileSection.classList.contains('active')) {
                    profileSection.classList.remove('active');
                    profileSection.style.display = 'none';
                    profileSection.style.opacity = '0';
                    profileSection.style.visibility = 'hidden';
                    profileSection.style.pointerEvents = 'none';
                }
            }

            // Determine target section
            // For subsections, we're actually showing home-section, but will toggle the specific subsection
            const isTargetingSubsection = sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section';
            let targetSection;
            if (isFromMyActionsToProfile) {
                targetSection = profileSection;
            } else if (isTargetingSubsection) {
                targetSection = homeSection;
            } else if (sectionId === 'home-section') {
                targetSection = homeSection;
            } else {
                targetSection = myActionsSection;
            }

            // Determine if we're coming from a subsection (current section is a subsection)
            const isComingFromSubsection = currentSection === 'auction-section' || currentSection === 'buy-section' || currentSection === 'rent-section';

            // Prepare target section - position it off-screen
            targetSection.style.display = 'block';

            // Determine slide direction based on transition type
            if (isFromHomeToMyActions || isFromSubsectionToMyActions) {
                // Coming from home/subsection, my-actions slides in from LEFT
                targetSection.style.transform = 'translateX(-100%)';
            } else if (isFromProfileToMyActions) {
                // Coming from profile, my-actions slides in from RIGHT
                targetSection.style.transform = 'translateX(100%)';
            } else if (isFromMyActionsToHome || isFromMyActionsToSubsection) {
                // Coming from my-actions to home/subsection, home slides in from right
                targetSection.style.transform = 'translateX(100%)';
            } else if (isFromMyActionsToProfile) {
                // Coming from my-actions to profile, profile slides in from left
                targetSection.style.transform = 'translateX(-100%)';
            }

            targetSection.style.opacity = '0';
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
            targetSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            targetSection.classList.remove('active');

            // Clean up current section with fade-out animation (synchronized)
            currentActiveSection.classList.remove('active');
            currentActiveSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';

            if (isFromHomeToMyActions || isFromSubsectionToMyActions) {
                // Home/subsection slides out to the right (my-actions comes from left)
                currentActiveSection.style.transform = 'translateX(100%)';
            } else if (isFromProfileToMyActions) {
                // Profile slides out to the left (my-actions comes from right)
                currentActiveSection.style.transform = 'translateX(-100%)';
            } else if (isFromMyActionsToHome || isFromMyActionsToSubsection) {
                // My-actions slides out to the left (home comes from right)
                currentActiveSection.style.transform = 'translateX(-100%)';
            } else if (isFromMyActionsToProfile) {
                // My-actions slides out to the right (profile comes from left)
                currentActiveSection.style.transform = 'translateX(100%)';
            }

            currentActiveSection.style.opacity = '0';

            // Force reflow to ensure styles are applied
            targetSection.offsetHeight;
            currentActiveSection.offsetHeight;

            // Animate both sections simultaneously for smooth synchronized transition
            trackedRequestAnimationFrame(() => {
                trackedRequestAnimationFrame(() => {
                    // Animate target section in
                    targetSection.style.transform = 'translateX(0)';
                    targetSection.style.opacity = '1';
                    targetSection.style.pointerEvents = 'auto';
                    targetSection.classList.add('active');

                    // Hide current section after fade-out completes
                    trackedSetTimeout(() => {
                        currentActiveSection.style.display = 'none';
                        currentActiveSection.style.visibility = 'hidden';
                        currentActiveSection.style.pointerEvents = 'none';
                    }, 400);

                    // If switching to home-section or a subsection, show appropriate subsections
                    if (sectionId === 'home-section' || isTargetingSubsection) {
                        toggleHomeSubsections(sectionId);
                    }


                    // Apply fade-in animation to content
                    const sectionContent = targetSection.querySelector('.section-content');
                    if (sectionContent) {
                        sectionContent.style.opacity = '0';
                        sectionContent.style.transform = 'translateX(20px)';
                        sectionContent.style.visibility = 'hidden';
                        sectionContent.style.transition = 'none';

                        trackedSetTimeout(() => {
                            sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                            trackedRequestAnimationFrame(() => {
                                trackedRequestAnimationFrame(() => {
                                    sectionContent.style.opacity = '1';
                                    sectionContent.style.transform = 'translateX(0)';
                                    sectionContent.style.visibility = 'visible';
                                    // Release navigation lock after content is visible
                                    trackedSetTimeout(() => {
                                        isNavigating = false;
                                        // Safety check: ensure content is visible
                                        ensureSectionContentVisible(targetSection);
                                    }, 100);
                                });
                            });
                        }, 100);
                    } else {
                        // No section content, release lock immediately
                        trackedSetTimeout(() => {
                            isNavigating = false;
                            ensureSectionContentVisible(targetSection);
                        }, 100);
                    }
                });
            });

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Push navigation state to history
            trackedSetTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 100);

            return;
        }

        // Special handling for transitions between home-section and profile-section
        // This creates a smooth slide transition similar to home-section and my-actions-section
        const isFromHomeToProfile = currentSection === 'home-section' && sectionId === 'profile-section';
        const isFromProfileToHome = currentSection === 'profile-section' && sectionId === 'home-section';
        const isFromSubsectionToProfile = (currentSection === 'auction-section' || currentSection === 'buy-section' || currentSection === 'rent-section') && sectionId === 'profile-section';
        const isFromProfileToSubsection = currentSection === 'profile-section' && (sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section');

        if (isFromHomeToProfile || isFromProfileToHome || isFromSubsectionToProfile || isFromProfileToSubsection) {
            const homeSection = document.getElementById('home-section');
            const profileSection = document.getElementById('profile-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (!homeSection || !profileSection || !currentActiveSection) {
                isNavigating = false;
                return;
            }

            // Hide my-actions if it's active
            const myActionsSection = document.getElementById('my-actions-section');
            if (myActionsSection && myActionsSection.classList.contains('active')) {
                myActionsSection.classList.remove('active');
                myActionsSection.style.display = 'none';
                myActionsSection.style.opacity = '0';
                myActionsSection.style.visibility = 'hidden';
                myActionsSection.style.pointerEvents = 'none';
            }

            // Determine target section
            // For subsections, we're actually showing home-section, but will toggle the specific subsection
            const isTargetingSubsection = sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section';
            let targetSection;
            if (isTargetingSubsection) {
                targetSection = homeSection;
            } else if (sectionId === 'home-section') {
                targetSection = homeSection;
            } else {
                targetSection = profileSection;
            }

            // Prepare target section - position it off-screen
            targetSection.style.display = 'block';

            // Determine slide direction based on transition type
            if (isFromHomeToProfile || isFromSubsectionToProfile) {
                // Coming from home/subsection, profile slides in from RIGHT (higher index in RTL)
                targetSection.style.transform = 'translateX(-100%)';
            } else if (isFromProfileToHome || isFromProfileToSubsection) {
                // Coming from profile to home/subsection, home slides in from LEFT (lower index in RTL)
                targetSection.style.transform = 'translateX(100%)';
            }

            targetSection.style.opacity = '0';
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
            targetSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            targetSection.classList.remove('active');

            // Clean up current section with fade-out animation (synchronized)
            currentActiveSection.classList.remove('active');
            currentActiveSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';

            if (isFromHomeToProfile || isFromSubsectionToProfile) {
                // Home/subsection slides out to the left (profile comes from right)
                currentActiveSection.style.transform = 'translateX(100%)';
            } else if (isFromProfileToHome || isFromProfileToSubsection) {
                // Profile slides out to the right (home comes from left)
                currentActiveSection.style.transform = 'translateX(-100%)';
            }

            currentActiveSection.style.opacity = '0';

            // Force reflow to ensure styles are applied
            targetSection.offsetHeight;
            currentActiveSection.offsetHeight;

            // Animate both sections simultaneously for smooth synchronized transition
            trackedRequestAnimationFrame(() => {
                trackedRequestAnimationFrame(() => {
                    // Animate target section in
                    targetSection.style.transform = 'translateX(0)';
                    targetSection.style.opacity = '1';
                    targetSection.style.pointerEvents = 'auto';
                    targetSection.classList.add('active');

                    // Hide current section after fade-out completes
                    trackedSetTimeout(() => {
                        currentActiveSection.style.display = 'none';
                        currentActiveSection.style.visibility = 'hidden';
                        currentActiveSection.style.pointerEvents = 'none';
                    }, 400);

                    // If switching to home-section or a subsection, show appropriate subsections
                    if (sectionId === 'home-section' || isTargetingSubsection) {
                        toggleHomeSubsections(sectionId);
                    }

                    // Apply fade-in animation to content
                    const sectionContent = targetSection.querySelector('.section-content');
                    if (sectionContent) {
                        sectionContent.style.opacity = '0';
                        sectionContent.style.transform = 'translateX(20px)';
                        sectionContent.style.visibility = 'hidden';
                        sectionContent.style.transition = 'none';

                        trackedSetTimeout(() => {
                            sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                            trackedRequestAnimationFrame(() => {
                                trackedRequestAnimationFrame(() => {
                                    sectionContent.style.opacity = '1';
                                    sectionContent.style.transform = 'translateX(0)';
                                    sectionContent.style.visibility = 'visible';
                                    // Release navigation lock after content is visible
                                    trackedSetTimeout(() => {
                                        isNavigating = false;
                                        // Safety check: ensure content is visible
                                        ensureSectionContentVisible(targetSection);
                                    }, 100);
                                });
                            });
                        }, 100);
                    } else {
                        // No section content, release lock immediately
                        trackedSetTimeout(() => {
                            isNavigating = false;
                            ensureSectionContentVisible(targetSection);
                        }, 100);
                    }
                });
            });

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Push navigation state to history
            trackedSetTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 100);

            return;
        }

        // Handle special cases: auction-section, buy-section, rent-section
        // These are now subsections within home-section
        if (sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section') {
            // Switch to home-section and show/hide appropriate subsections
            const homeSection = document.getElementById('home-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (!homeSection) {
                isNavigating = false;
                return;
            }

            // Hide profile if it's active
            const profileSection = document.getElementById('profile-section');
            if (profileSection && profileSection.classList.contains('active')) {
                profileSection.classList.remove('active');
                profileSection.style.display = 'none';
                profileSection.style.opacity = '0';
                profileSection.style.visibility = 'hidden';
                profileSection.style.pointerEvents = 'none';
            }

            // Check if we need to switch sections (coming from a different section)
            const needsSectionSwitch = currentActiveSection && currentActiveSection.id !== 'home-section';
            const isComingFromProfile = currentActiveSection && currentActiveSection.id === 'profile-section';
            const isComingFromPropertyDetail = currentActiveSection && currentActiveSection.id === 'property-detail-section';

            // Handle property-detail-section slide down and fade out animation
            if (isComingFromPropertyDetail && currentActiveSection) {
                const propertyDetailSection = currentActiveSection;
                propertyDetailSection.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
                propertyDetailSection.style.transform = 'translateY(20px)';
                propertyDetailSection.style.opacity = '0';

                setTimeout(() => {
                    propertyDetailSection.classList.remove('active');
                    propertyDetailSection.style.display = 'none';
                    propertyDetailSection.style.visibility = 'hidden';
                    propertyDetailSection.style.pointerEvents = 'none';
                    // Remove overlay positioning if it was set
                    propertyDetailSection.style.removeProperty('position');
                    propertyDetailSection.style.removeProperty('top');
                    propertyDetailSection.style.removeProperty('right');
                    propertyDetailSection.style.removeProperty('left');
                    propertyDetailSection.style.removeProperty('width');
                    propertyDetailSection.style.removeProperty('z-index');
                }, 300);
            } else if (needsSectionSwitch) {
                currentActiveSection.classList.remove('active');
                currentActiveSection.style.display = 'none';
                currentActiveSection.style.opacity = '0';
                currentActiveSection.style.visibility = 'hidden';
                currentActiveSection.style.pointerEvents = 'none';
            }

            // Show home-section without slide animation when coming from property-detail-section
            // Only property-detail-section should animate, not home-section or its children
            if (isComingFromPropertyDetail) {
                // Show home-section with just fade in (no slide to avoid affecting banner-section and other elements)
                homeSection.style.display = 'block';
                homeSection.style.visibility = 'visible';
                homeSection.style.opacity = '0';
                homeSection.style.transform = 'translateX(0)'; // No translateY to avoid affecting children
                homeSection.style.pointerEvents = 'none';
                homeSection.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'; // Only opacity transition
                homeSection.classList.add('active');

                // Force reflow
                homeSection.offsetHeight;

                // Animate fade in only (no slide)
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        homeSection.style.opacity = '1';
                        homeSection.style.pointerEvents = 'auto';
                    });
                });
            } else {
                // Show home-section normally for other transitions
                homeSection.style.display = 'block';
                homeSection.style.visibility = 'visible';
                homeSection.style.opacity = '1';
                homeSection.style.pointerEvents = 'auto';
                homeSection.style.transform = 'translateX(0)';
                homeSection.classList.add('active');
            }

            // Hide content initially for fade-in animation (same as home-section)
            const sectionContent = homeSection.querySelector('.section-content');
            if (sectionContent) {
                sectionContent.style.opacity = '0';
                sectionContent.style.transform = 'translateX(20px)';
                sectionContent.style.visibility = 'hidden';
                sectionContent.style.transition = 'none';
            }

            // Fade in content after brief delay (same timing as home-section)
            const fadeInDelay = isComingFromProfile ? 100 : (isComingFromPropertyDetail ? 200 : 150);
            trackedSetTimeout(() => {
                if (sectionContent) {
                    sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                    trackedRequestAnimationFrame(() => {
                        trackedRequestAnimationFrame(() => {
                            sectionContent.style.opacity = '1';
                            sectionContent.style.transform = 'translateX(0)';
                            sectionContent.style.visibility = 'visible';
                            // Release navigation lock after content is visible
                            trackedSetTimeout(() => {
                                isNavigating = false;
                                // Safety check: ensure content is visible
                                ensureSectionContentVisible(homeSection);
                            }, 100);
                        });
                    });
                } else {
                    trackedSetTimeout(() => {
                        isNavigating = false;
                        ensureSectionContentVisible(homeSection);
                    }, 100);
                }
            }, fadeInDelay);

            // Toggle visibility of subsections
            toggleHomeSubsections(sectionId);

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Load data if needed
            if (typeof window.reloadSectionData === 'function') {
                trackedSetTimeout(() => {
                    window.reloadSectionData('home-section').then(() => {
                    });
                }, 100);
            }

            // Push navigation state to history
            trackedSetTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 200);

            return;
        }

        const targetSection = document.getElementById(sectionId);
        const currentActiveSection = document.querySelector('.tab-section.active');

        if (!targetSection || !currentActiveSection) {
            isNavigating = false;
            return;
        }

        // Special handling for property-detail-section with optimized slide animation
        if (sectionId === 'property-detail-section') {
            const isFromHomeSection = currentActiveSection.id === 'home-section';

            // Batch DOM reads first (before any writes)
            const targetSectionComputed = window.getComputedStyle(targetSection);

            // If coming from home-section, keep it visible; otherwise hide current section
            if (!isFromHomeSection) {
                // Hide current section immediately (no animation needed)
                currentActiveSection.classList.remove('active');
                currentActiveSection.style.display = 'none';
                currentActiveSection.style.opacity = '0';
                currentActiveSection.style.visibility = 'hidden';
                currentActiveSection.style.pointerEvents = 'none';
            } else {
                // Disable pointer events immediately to prevent interaction
                currentActiveSection.style.pointerEvents = 'none';

                // Optimized fade-out: use compositor-only properties
                currentActiveSection.style.willChange = 'opacity';
                currentActiveSection.style.transition = 'opacity 0.25s ease-out';

                // Use single RAF for better performance
                requestAnimationFrame(() => {
                    currentActiveSection.style.opacity = '0';

                    // Clean up after animation
                    setTimeout(() => {
                        currentActiveSection.style.display = 'none';
                        currentActiveSection.classList.remove('active');
                        currentActiveSection.style.willChange = 'auto';
                        currentActiveSection.style.removeProperty('transition');
                    }, 250);
                });
            }

            // Prepare property-detail-section with GPU-accelerated properties
            // Use transform3d for better GPU acceleration on low-end devices
            targetSection.style.display = 'block';
            targetSection.style.transform = 'translate3d(0, 20px, 0)'; // GPU acceleration
            targetSection.style.opacity = '0';
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
            targetSection.style.willChange = 'transform, opacity'; // Hint for browser optimization
            targetSection.style.transition = 'transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)';
            targetSection.classList.remove('active');

            // If coming from home-section, position property-detail-section as overlay
            if (isFromHomeSection) {
                targetSection.style.position = 'absolute';
                targetSection.style.top = '0';
                targetSection.style.right = '0';
                targetSection.style.left = '0';
                targetSection.style.width = '100%';
                targetSection.style.zIndex = '10';
            }

            // Single reflow before animation
            targetSection.offsetHeight;

            // Optimized animation: use single RAF with transform3d
            requestAnimationFrame(() => {
                // Use transform3d for GPU acceleration
                targetSection.style.transform = 'translate3d(0, 0, 0)';
                targetSection.style.opacity = '1';
                targetSection.style.pointerEvents = 'auto';
                targetSection.classList.add('active');

                // Clean up will-change after animation completes (performance optimization)
                setTimeout(() => {
                    targetSection.style.willChange = 'auto';
                }, 350);
            });

            // Update current section
            currentSection = sectionId;

            // Push navigation state to history
            setTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 100);

            return;
        }

        // Special handling for transitions from property-detail-section to profile-section with right slide
        const isFromPropertyDetailToProfile = currentSection === 'property-detail-section' && sectionId === 'profile-section';

        if (isFromPropertyDetailToProfile) {
            const propertyDetailSection = document.getElementById('property-detail-section');
            const profileSection = document.getElementById('profile-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (!propertyDetailSection || !profileSection || !currentActiveSection) {
                isNavigating = false;
                return;
            }

            // Hide my-actions if it's active
            const myActionsSection = document.getElementById('my-actions-section');
            if (myActionsSection && myActionsSection.classList.contains('active')) {
                myActionsSection.classList.remove('active');
                myActionsSection.style.display = 'none';
                myActionsSection.style.opacity = '0';
                myActionsSection.style.visibility = 'hidden';
                myActionsSection.style.pointerEvents = 'none';
            }

            ensureProfileOnlyVisible();

            // Prepare profile section - position it off-screen from the right (for RTL, this is translateX(-100%))
            profileSection.style.display = 'block';
            profileSection.style.transform = 'translateX(-100%)';
            profileSection.style.opacity = '0';
            profileSection.style.visibility = 'visible';
            profileSection.style.pointerEvents = 'none';
            profileSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            profileSection.classList.remove('active');

            // Clean up property-detail-section with slide-out animation to the left
            currentActiveSection.classList.remove('active');
            currentActiveSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            // Property-detail slides out to the left (profile comes from right)
            currentActiveSection.style.transform = 'translateX(100%)';
            currentActiveSection.style.opacity = '0';

            // Force reflow to ensure styles are applied
            profileSection.offsetHeight;
            currentActiveSection.offsetHeight;

            // Animate both sections simultaneously for smooth synchronized transition
            trackedRequestAnimationFrame(() => {
                trackedRequestAnimationFrame(() => {
                    // Animate profile section in from the right
                    profileSection.style.transform = 'translateX(0)';
                    profileSection.style.opacity = '1';
                    profileSection.style.pointerEvents = 'auto';
                    profileSection.classList.add('active');

                    // Hide property-detail-section after slide-out completes
                    trackedSetTimeout(() => {
                        currentActiveSection.style.display = 'none';
                        currentActiveSection.style.visibility = 'hidden';
                        currentActiveSection.style.pointerEvents = 'none';
                    }, 400);

                    // Scroll section-content to top
                    trackedSetTimeout(() => {
                        // Release navigation lock
                        isNavigating = false;
                        // Safety check: ensure content is visible
                        ensureSectionContentVisible(profileSection);
                    }, 100);
                });
            });

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Push navigation state to history
            trackedSetTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 100);

            return;
        }

        // Special handling for transitions between property-detail-section and my-actions-section with right slide
        const isFromPropertyDetailToMyActions = currentSection === 'property-detail-section' && sectionId === 'my-actions-section';
        const isFromMyActionsToPropertyDetail = currentSection === 'my-actions-section' && sectionId === 'property-detail-section';

        if (isFromPropertyDetailToMyActions || isFromMyActionsToPropertyDetail) {
            const propertyDetailSection = document.getElementById('property-detail-section');
            const myActionsSection = document.getElementById('my-actions-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (!propertyDetailSection || !myActionsSection || !currentActiveSection) {
                isNavigating = false;
                return;
            }

            // Hide profile if it's active
            const profileSection = document.getElementById('profile-section');
            if (profileSection && profileSection.classList.contains('active')) {
                profileSection.classList.remove('active');
                profileSection.style.display = 'none';
                profileSection.style.opacity = '0';
                profileSection.style.visibility = 'hidden';
                profileSection.style.pointerEvents = 'none';
            }

            // Determine target section
            let targetSection;
            if (isFromPropertyDetailToMyActions) {
                targetSection = myActionsSection;
            } else {
                targetSection = propertyDetailSection;
            }

            // Prepare target section - position it off-screen from the right (for RTL, this is translateX(-100%))
            targetSection.style.display = 'block';
            targetSection.style.transform = 'translateX(-100%)';
            targetSection.style.opacity = '0';
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
            targetSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            targetSection.classList.remove('active');

            // Clean up current section with slide-out animation to the left
            currentActiveSection.classList.remove('active');
            currentActiveSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            // Current section slides out to the left (target comes from right)
            currentActiveSection.style.transform = 'translateX(100%)';
            currentActiveSection.style.opacity = '0';

            // Force reflow to ensure styles are applied
            targetSection.offsetHeight;
            currentActiveSection.offsetHeight;

            // Animate both sections simultaneously for smooth synchronized transition
            trackedRequestAnimationFrame(() => {
                trackedRequestAnimationFrame(() => {
                    // Animate target section in from the right
                    targetSection.style.transform = 'translateX(0)';
                    targetSection.style.opacity = '1';
                    targetSection.style.pointerEvents = 'auto';
                    targetSection.classList.add('active');

                    // Hide current section after slide-out completes
                    trackedSetTimeout(() => {
                        currentActiveSection.style.display = 'none';
                        currentActiveSection.style.visibility = 'hidden';
                        currentActiveSection.style.pointerEvents = 'none';
                    }, 400);



                    // Apply fade-in animation to content
                    const sectionContent = targetSection.querySelector('.section-content');
                    if (sectionContent) {
                        sectionContent.style.opacity = '0';
                        sectionContent.style.transform = 'translateX(20px)';
                        sectionContent.style.visibility = 'hidden';
                        sectionContent.style.transition = 'none';

                        trackedSetTimeout(() => {
                            sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                            trackedRequestAnimationFrame(() => {
                                trackedRequestAnimationFrame(() => {
                                    sectionContent.style.opacity = '1';
                                    sectionContent.style.transform = 'translateX(0)';
                                    sectionContent.style.visibility = 'visible';
                                    // Release navigation lock after content is visible
                                    trackedSetTimeout(() => {
                                        isNavigating = false;
                                        // Safety check: ensure content is visible
                                        ensureSectionContentVisible(targetSection);
                                    }, 100);
                                });
                            });
                        }, 100);
                    } else {
                        // No section content, release lock immediately
                        trackedSetTimeout(() => {
                            isNavigating = false;
                            ensureSectionContentVisible(targetSection);
                        }, 100);
                    }
                });
            });

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Push navigation state to history
            trackedSetTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 100);

            return;
        }

        // Special handling for profile section
        if (sectionId === 'profile-section') {
            ensureProfileOnlyVisible();

            // Prepare profile section - position it off-screen from the left
            targetSection.style.display = 'block';
            targetSection.style.transform = 'translateX(-100%)';
            targetSection.style.opacity = '0';
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
            targetSection.classList.remove('active');

            // Force reflow to ensure styles are applied
            targetSection.offsetHeight;

            // Clean up current section first
            currentActiveSection.classList.remove('active');
            currentActiveSection.style.display = 'none';
            currentActiveSection.style.opacity = '0';
            currentActiveSection.style.visibility = 'hidden';
            currentActiveSection.style.pointerEvents = 'none';

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Push navigation state to history
            trackedSetTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 100);

            return;
        }

        // Check if we're coming from property-detail-section - handle zoom out (faster)
        const isComingFromPropertyDetail = currentSection === 'property-detail-section';
        if (isComingFromPropertyDetail) {
            const propertyDetailSection = document.getElementById('property-detail-section');
            const homeSection = document.getElementById('home-section');

            if (propertyDetailSection && propertyDetailSection.classList.contains('active')) {
                // Slide down and fade out animation
                propertyDetailSection.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
                propertyDetailSection.style.transform = 'translateY(20px)';
                propertyDetailSection.style.opacity = '0';

                setTimeout(() => {
                    propertyDetailSection.classList.remove('active');
                    propertyDetailSection.style.display = 'none';
                    propertyDetailSection.style.visibility = 'hidden';
                    propertyDetailSection.style.pointerEvents = 'none';
                    // Remove overlay positioning if it was set
                    propertyDetailSection.style.removeProperty('position');
                    propertyDetailSection.style.removeProperty('top');
                    propertyDetailSection.style.removeProperty('right');
                    propertyDetailSection.style.removeProperty('left');
                    propertyDetailSection.style.removeProperty('width');
                    propertyDetailSection.style.removeProperty('z-index');
                }, 300);
            }

            // If switching back to home-section, restore its pointer events
            if (sectionId === 'home-section' && homeSection) {
                homeSection.style.pointerEvents = 'auto';
            }
        }

        // Check if we're coming from profile section or a subsection
        const isComingFromProfile = currentSection === 'profile-section';
        const isComingFromSubsection = currentSection === 'buy-section' || currentSection === 'rent-section' || currentSection === 'auction-section';

        // For non-profile sections, ensure profile is hidden
        const profileSection = document.getElementById('profile-section');
        if (profileSection && profileSection.classList.contains('active')) {
            profileSection.classList.remove('active');
            profileSection.style.display = 'none';
            profileSection.style.opacity = '0';
            profileSection.style.visibility = 'hidden';
            profileSection.style.pointerEvents = 'none';
        }

        // If switching back to home-section from profile or property-detail, ensure it's fully restored
        if (sectionId === 'home-section') {
            const homeSection = document.getElementById('home-section');
            if (homeSection) {
                // Remove any styles that might block interaction
                homeSection.style.removeProperty('pointer-events');
                homeSection.style.pointerEvents = 'auto';
                // Ensure home-section is visible and active
                if (!homeSection.classList.contains('active')) {
                    homeSection.classList.add('active');
                    homeSection.style.display = 'block';
                    homeSection.style.opacity = '1';
                    homeSection.style.visibility = 'visible';
                }
            }
        }

        // Get direction for animation
        const fromIndex = getSectionIndex(currentSection);
        const toIndex = getSectionIndex(sectionId);
        const direction = getSlideDirection(fromIndex, toIndex);

        // Remove active class from current section (will trigger exit animation)
        currentActiveSection.classList.remove('active');

        // Ensure target section is visible before animation
        targetSection.style.display = 'block';
        // If switching to home-section, ensure pointer-events are enabled
        if (sectionId === 'home-section') {
            targetSection.style.pointerEvents = 'auto';
        }

        // For my-actions-section, ensure proper initial state for animation
        if (sectionId === 'my-actions-section') {
            // Remove any conflicting inline styles to let CSS transitions work
            targetSection.style.removeProperty('opacity');
            targetSection.style.removeProperty('transform');
            targetSection.style.removeProperty('visibility');
            // Set initial state for animation
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
        }

        // For home-section, hide content initially so it can fade in smoothly
        if (sectionId === 'home-section') {
            const sectionContent = targetSection.querySelector('.section-content');
            if (sectionContent) {
                sectionContent.style.opacity = '0';
                sectionContent.style.transform = 'translateX(20px)';
                sectionContent.style.visibility = 'hidden';
                sectionContent.style.transition = 'none'; // Disable transition initially
            }
        }


        // For my-actions-section, ensure it's visible and ready for animation
        if (sectionId === 'my-actions-section') {
            // Clear any conflicting inline styles to let CSS handle animation
            targetSection.style.removeProperty('opacity');
            targetSection.style.removeProperty('transform');
            targetSection.style.visibility = 'visible';
        }

        // Force reflow to ensure classes are applied
        targetSection.offsetHeight;


        // Save previous section before updating
        const previousSection = currentSection;

        // Update current section
        currentSection = sectionId;

        // If switching to home-section, show all subsections
        if (sectionId === 'home-section') {
            toggleHomeSubsections('home-section');
            // Ensure scrolling is enabled after switching to home section
            // Use multiple timeouts to ensure it works after all animations
            trackedSetTimeout(() => {
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
                    // Force browser to recalculate scroll
                    const scrollLeft = container.scrollLeft;
                    container.scrollLeft = scrollLeft;
                });

                // Also ensure subsections have pointer-events enabled
                const subsections = document.querySelectorAll('.home-subsection');
                subsections.forEach(subsection => {
                    subsection.style.pointerEvents = 'auto';
                });
            }, 400); // Wait for animations to complete

            // Additional check after a longer delay to ensure everything is working
            trackedSetTimeout(() => {
                const scrollContainers = document.querySelectorAll('.horizontal-scroll-container');
                scrollContainers.forEach(container => {
                    container.style.overflowX = 'auto';
                    container.style.overflowY = 'hidden';
                    container.style.pointerEvents = 'auto';
                });
            }, 600);
        }

        // Update active states on all navigation items
        updateActiveNavItems(sectionId);

        // Load section data if it's a property section and hasn't been loaded
        if (sectionId !== 'profile-section' && typeof window.reloadSectionData === 'function') {
            // Wait for section to become visible (after animation completes)
            trackedSetTimeout(() => {
                // Verify section is actually visible
                const sectionElement = document.getElementById(sectionId);
                if (sectionElement) {
                    const sectionStyle = window.getComputedStyle(sectionElement);
                    const isVisible = sectionElement.classList.contains('active') &&
                        sectionStyle.visibility !== 'hidden' &&
                        sectionStyle.opacity !== '0' &&
                        sectionStyle.display !== 'none';

                    if (!isVisible) {
                        console.warn(`Section ${sectionId} is not visible yet, waiting...`);
                        // Force visibility - ensure content is always visible
                        ensureSectionContentVisible(sectionElement);
                    }
                }

                // Find the grid element by ID based on section
                let gridId = '';
                if (sectionId === 'home-section') gridId = 'home-properties-grid';
                else if (sectionId === 'buy-section') gridId = 'buy-properties-grid';
                else if (sectionId === 'rent-section') gridId = 'rent-properties-grid';
                else if (sectionId === 'auction-section') gridId = 'auction-properties-grid';

                const targetGrid = document.getElementById(gridId);
                if (targetGrid) {
                    // Always reload when switching to a different section
                    // This ensures cards are properly rendered and visible
                    const wasPreviousActive = (previousSection === sectionId);

                    if (!wasPreviousActive) {
                        // Switching to a new section - always reload
                        const config = window.dataConfig ? window.dataConfig[sectionId] : null;
                        const jsonFile = config ? config.url : 'unknown';
                        window.reloadSectionData(sectionId).then(() => {
                            // Re-initialize Lucide icons after cards are rendered
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }

                            // Double-check section visibility after rendering
                            if (sectionElement) {
                                sectionElement.style.display = 'block';
                                sectionElement.style.visibility = 'visible';
                                sectionElement.style.opacity = '1';
                                sectionElement.style.pointerEvents = 'auto';
                                if (!sectionElement.classList.contains('active')) {
                                    sectionElement.classList.add('active');
                                }
                            }
                        }).catch(err => {
                            console.error(`Error loading data for ${sectionId}:`, err);
                        });
                    } else {
                        // Same section (shouldn't happen due to early return, but check anyway)
                        const hasCards = targetGrid.querySelector('.property-card-home-page');
                        const isEmpty = targetGrid.children.length === 0;

                        if (!hasCards || isEmpty) {
                            window.reloadSectionData(sectionId).then(() => {
                                if (typeof lucide !== 'undefined') {
                                    lucide.createIcons();
                                }
                            }).catch(err => {
                                console.error(`Error loading data for ${sectionId}:`, err);
                            });
                        }
                    }
                } else {
                    // Grid not found - check if section exists in DOM
                    const sectionElement = document.getElementById(sectionId);
                    if (!sectionElement) {
                        // Section doesn't exist in DOM, skip silently
                        return;
                    }
                    // Grid not found but section exists, try to load anyway
                    window.reloadSectionData(sectionId).then(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }).catch(err => {
                        // Only log error if section exists
                        const sectionElement = document.getElementById(sectionId);
                        if (sectionElement) {
                            console.error(`Error loading data for ${sectionId}:`, err);
                        }
                    });
                }
            }, 450); // Wait for animation to complete (slightly longer to ensure visibility)
        }

        // Push navigation state to history after section switch completes
        trackedSetTimeout(() => {
            if (typeof window.pushNavigationState === 'function') {
                window.pushNavigationState(false);
            }
            // Final safety check: ensure content is visible and release lock if not already released
            const finalSection = document.getElementById(sectionId);
            if (finalSection) {
                ensureSectionContentVisible(finalSection);
            }
            // Release navigation lock as final fallback (in case it wasn't released earlier)
            trackedSetTimeout(() => {
                isNavigating = false;
            }, 100);
        }, 500);
    }

    /**
     * Update which navigation button is highlighted (active)
     * @param {string} sectionId - The ID of the active section
     */
    function updateActiveNavItems(sectionId) {
        // Update bottom nav
        bottomNavItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update top nav
        topNavItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Handle when user clicks a navigation button
     * @param {Event} e - The click event
     */
    function handleNavClick(e) {
        e.preventDefault();

        const sectionId = this.getAttribute('data-section');
        if (sectionId) {
            switchToSection(sectionId);

            // Scroll scrollable containers to top based on section
            if (typeof window.scrollScrollableContainersToTop === 'function') {
                if (sectionId === 'home-section' || sectionId === 'buy-section' || sectionId === 'rent-section' || sectionId === 'auction-section') {
                    window.scrollScrollableContainersToTop('home-section');
                } else if (sectionId === 'my-actions-section') {
                    window.scrollScrollableContainersToTop('my-actions-section');
                }
            }
        }
    }

    /**
     * Animate section content with a fade-in effect
     * Makes content appear smoothly when a section becomes visible
     * @param {HTMLElement} sectionElement - The section element to animate
     */
    function animateSectionContentFadeIn(sectionElement) {
        if (!sectionElement) return;

        // Find the section-content element within the section
        const sectionContent = sectionElement.querySelector('.section-content');
        if (!sectionContent) {
            return; // Skip if no section-content found (profile section has different structure)
        }

        // Start with fade-out state
        sectionContent.style.opacity = '0';
        sectionContent.style.transform = 'translateX(20px)';
        sectionContent.style.visibility = 'hidden';
        sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';

        // After a brief delay, fade in (stagger for smoother effect)
        setTimeout(() => {
            requestAnimationFrame(() => {
                sectionContent.style.opacity = '1';
                sectionContent.style.transform = 'translateX(0)';
                sectionContent.style.visibility = 'visible';
            });
        }, 50);
    }


    /**
     * Show or hide subsections within the home section
     * Home section has 3 subsections: auctions, buy, and rent
     * @param {string} activeSubsection - Which subsection to show ('auction-section', 'buy-section', 'rent-section', or 'home-section' for all)
     */
    function toggleHomeSubsections(activeSubsection) {
        const auctionsSubsection = document.getElementById('auctions-section');
        const sellSubsection = document.getElementById('buy-section');
        const rentSubsection = document.getElementById('rent-section');

        const allSubsections = [auctionsSubsection, sellSubsection, rentSubsection].filter(Boolean);

        // First, fade out all subsections
        allSubsections.forEach(subsection => {
            if (subsection) {
                subsection.style.opacity = '0';
                subsection.style.transform = 'translateX(20px)';
                subsection.style.visibility = 'hidden';
            }
        });

        // After fade out completes, update display and fade in selected ones
        setTimeout(() => {
            // Hide all subsections
            allSubsections.forEach(subsection => {
                if (subsection) {
                    subsection.style.display = 'none';
                }
            });

            // Show the selected subsection(s) and fade in
            if (activeSubsection === 'auction-section' && auctionsSubsection) {
                auctionsSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    auctionsSubsection.style.opacity = '1';
                    auctionsSubsection.style.transform = 'translateX(0)';
                    auctionsSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'buy-section' && sellSubsection) {
                sellSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    sellSubsection.style.opacity = '1';
                    sellSubsection.style.transform = 'translateX(0)';
                    sellSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'rent-section' && rentSubsection) {
                rentSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    rentSubsection.style.opacity = '1';
                    rentSubsection.style.transform = 'translateX(0)';
                    rentSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'home-section') {
                // Show all subsections for home-section
                allSubsections.forEach((subsection, index) => {
                    if (subsection) {
                        subsection.style.display = 'block';
                        subsection.style.pointerEvents = 'auto';
                        // Stagger the animations slightly for a nicer effect
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                subsection.style.opacity = '1';
                                subsection.style.transform = 'translateX(0)';
                                subsection.style.visibility = 'visible';
                                subsection.style.pointerEvents = 'auto';
                            });
                        }, index * 50);
                    }
                });
            }
        }, 200); // Wait for fade out to complete
    }

    /**
     * Handle when user clicks a quick access box
     * @param {Event} e - The click event
     */
    function handleQuickAccessClick(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        if (sectionId) {
            switchToSection(sectionId);
        }
    }

    /**
     * Initialize all event listeners
     * Sets up click handlers for all navigation buttons
     */
    function init() {
        // Bottom navigation items
        bottomNavItems.forEach(item => {
            item.addEventListener('click', handleNavClick);
        });

        // Top navigation items
        topNavItems.forEach(item => {
            item.addEventListener('click', handleNavClick);
        });

        // Quick access boxes
        quickAccessBoxes.forEach(box => {
            box.addEventListener('click', function (e) {
                handleQuickAccessClick.call(this, e);
                // Scroll scrollable containers to top for home-section subsections
                const sectionId = this.getAttribute('data-section');
                if (sectionId && typeof window.scrollScrollableContainersToTop === 'function') {
                    if (sectionId === 'home-section' || sectionId === 'buy-section' || sectionId === 'rent-section' || sectionId === 'auction-section') {
                        window.scrollScrollableContainersToTop('home-section');
                    }
                }
            });
        });

        // Header profile button
        const headerProfileBtn = document.querySelector('.header-profile-btn');
        if (headerProfileBtn) {
            headerProfileBtn.addEventListener('click', function (e) {
                e.preventDefault();

                window.scrollTo({ top: 0, behavior: 'smooth' });
                const sectionId = this.getAttribute('data-section');
                if (sectionId) {
                    switchToSection(sectionId);
                    // Scroll all scrollable containers within profile-section to top
                    if (typeof window.scrollScrollableContainersToTop === 'function') {
                        window.scrollScrollableContainersToTop('profile-section');
                    }

                    // Always ensure profile-menu-view has the active class when opening profile section
                    // Use a small delay to ensure section switch completes first
                    setTimeout(() => {
                        const profileMenuView = document.getElementById('profile-menu-view');
                        if (profileMenuView) {
                            profileMenuView.classList.add('active');
                            // Also navigate to menu route to ensure proper state
                            if (typeof window.ProfileNavigation !== 'undefined' &&
                                typeof window.ProfileNavigation.navigateTo === 'function') {
                                window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                            }
                        }
                        window.scrollScrollableContainersToTop('profile-section');
                    }, 100);
                }
            });
        }

        // Add property buttons
        const addPropertyBtns = document.querySelectorAll('.add-property-btn');
        addPropertyBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
            });
        });

        // Prevent default anchor behavior on all navigation links
        document.querySelectorAll('a[href="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                // Only prevent if it's a nav item or access box
                if (this.classList.contains('nav-item') ||
                    this.classList.contains('top-nav-item') ||
                    this.classList.contains('access-box')) {
                    e.preventDefault();
                }
            });
        });

        // Initialize Lucide icons
        if (typeof window.initLucideIcons === 'function') {
            setTimeout(() => {
                window.initLucideIcons();
            }, 100);
        } else if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    /**
     * Make sure the correct section is visible when page first loads
     * Hides all sections except the active one
     */
    function ensureInitialState() {
        const activeSection = document.querySelector('.tab-section.active');

        // Hide all sections first
        sections.forEach(section => {
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            section.style.pointerEvents = 'none';
            section.style.transform = 'translateX(100%)';
        });

        // Show only the active section
        if (activeSection) {
            activeSection.style.display = 'block';
            activeSection.style.transform = 'translateX(0)';
            activeSection.style.opacity = '1';
            activeSection.style.visibility = 'visible';
            activeSection.style.pointerEvents = 'auto';

            // If home-section is active, show all subsections
            if (activeSection.id === 'home-section') {
                toggleHomeSubsections('home-section');
            }
        } else {
            // If no section is active, activate home-section
            const homeSection = document.getElementById('home-section');
            if (homeSection) {
                homeSection.classList.add('active');
                homeSection.style.display = 'block';
                homeSection.style.transform = 'translateX(0)';
                homeSection.style.opacity = '1';
                homeSection.style.visibility = 'visible';
                homeSection.style.pointerEvents = 'auto';
                toggleHomeSubsections('home-section');
            }
        }

        // If profile section is active initially, ensure property sections are hidden and cleared
        if (activeSection && activeSection.id === 'profile-section') {
            ensureProfileOnlyVisible();
            // Re-show profile section after clearing
            activeSection.style.display = 'block';
            activeSection.style.opacity = '1';
            activeSection.style.visibility = 'visible';
            activeSection.style.pointerEvents = 'auto';
            activeSection.style.transform = 'translateX(0)';
        }

        // Ensure my-actions-section is properly initialized
        const myActionsSection = document.getElementById('my-actions-section');
        if (myActionsSection && !myActionsSection.classList.contains('active')) {
            // Ensure it starts in the correct hidden state
            myActionsSection.style.display = 'none';
            myActionsSection.style.opacity = '0';
            myActionsSection.style.visibility = 'hidden';
            myActionsSection.style.pointerEvents = 'none';
            myActionsSection.style.transform = 'translateX(100%)';
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            ensureInitialState();
            init();
        });
    } else {
        ensureInitialState();
        init();
    }

    /**
     * Export switchToSection function so other files can use it
     * This allows the history manager to switch sections when user presses back button
     */
    window.switchToSection = switchToSection;
})();
