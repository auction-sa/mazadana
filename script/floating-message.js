/**
 * Floating Message Module
 * 
 * This module provides a unified floating message/toast notification system
 * that can be used across all code files with different message texts.
 * 
 * Usage:
 *   window.showFloatingMessage('Your message here');
 *   window.showFloatingMessage('Your message here', 5000); // with custom duration
 */

(function () {
    'use strict';

    /**
     * Show floating message/toast notification
     * @param {string} message - The message to display
     * @param {number} duration - Duration in milliseconds (default: 4000). Set to 0 for no auto-dismiss
     * @param {Object} options - Optional configuration object
     * @param {string} options.type - Message type: 'info', 'success', 'error', 'warning' (default: 'info')
     * @param {boolean} options.persistent - If true, message won't auto-dismiss (default: false)
     */
    function showFloatingMessage(message, duration = 4000, options = {}) {
        if (!message) {
            console.warn('showFloatingMessage: No message provided');
            return;
        }

        // Remove existing floating message if any
        const existingMessage = document.querySelector('.floating-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Merge options with defaults
        const config = {
            type: options.type || 'info',
            persistent: options.persistent || false,
            ...options
        };

        // If persistent is true, set duration to 0
        if (config.persistent) {
            duration = 0;
        }

        // Create floating message element
        const floatingMessage = document.createElement('div');
        floatingMessage.className = 'floating-message';

        // Add type class if specified
        if (config.type && config.type !== 'info') {
            floatingMessage.classList.add(`floating-message-${config.type}`);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'floating-message-content';

        const textDiv = document.createElement('div');
        textDiv.className = 'floating-message-text';
        textDiv.textContent = message; // Use textContent for security (preserves newlines)

        const closeBtn = document.createElement('button');
        closeBtn.className = 'floating-message-close';
        closeBtn.setAttribute('aria-label', 'إغلاق');
        closeBtn.innerHTML = '<i data-lucide="x" style="width: 18px; height: 18px;"></i>';

        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(closeBtn);
        floatingMessage.appendChild(contentDiv);

        // Append to body
        document.body.appendChild(floatingMessage);

        // Initialize Lucide icons if available
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 50);
        }

        // Show message with smooth slide-in animation
        // Use requestAnimationFrame to ensure browser has painted initial state before animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                floatingMessage.classList.add('show');
            });
        });

        // Close button handler
        const closeMessage = () => {
            floatingMessage.classList.remove('show');
            setTimeout(() => {
                floatingMessage.remove();
            }, 300);
        };

        closeBtn.addEventListener('click', closeMessage);

        // Auto-dismiss after duration
        let timeoutId;
        if (duration > 0) {
            timeoutId = setTimeout(closeMessage, duration);
        }

        // Pause auto-dismiss on hover
        floatingMessage.addEventListener('mouseenter', () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        });

        floatingMessage.addEventListener('mouseleave', () => {
            if (duration > 0) {
                timeoutId = setTimeout(closeMessage, duration);
            }
        });
    }

    // Expose to global scope for easy access across all files
    window.showFloatingMessage = showFloatingMessage;

    // Also expose as showToastMessage for backward compatibility
    window.showToastMessage = showFloatingMessage;

})();

