/**
 * Print Utilities for Browser Print PDF Generation
 * 
 * Provides helper functions to manage window.print() behavior,
 * page breaks, and print-specific layout handling.
 */

/**
 * Trigger browser print dialog with optimized print settings
 * 
 * @param {string} title - Document title for print
 * @param {Object} options - Additional options
 * @returns {void}
 */
export const triggerPrint = (title = 'Document', options = {}) => {
    const {
        delay = 500,
        before = null,
        after = null,
    } = options;

    // Execute before callback if provided
    if (typeof before === 'function') {
        before();
    }

    // Set document title
    const originalTitle = document.title;
    document.title = title;

    // Small delay to ensure styles are applied
    setTimeout(() => {
        // Trigger print dialog
        window.print();

        // Restore original title after print dialog closes
        setTimeout(() => {
            document.title = originalTitle;
            
            // Execute after callback if provided
            if (typeof after === 'function') {
                after();
            }
        }, 500);
    }, delay);
};

/**
 * Prepare element for printing by:
 * - Cloning the element
 * - Removing print-restricted elements
 * - Applying print-specific CSS
 * 
 * @param {HTMLElement} element - Element to prepare
 * @returns {HTMLElement} - Cloned and prepared element
 */
export const preparePrintElement = (element) => {
    if (!element) return null;

    const clone = element.cloneNode(true);

    // Remove all button, input, and UI-only elements
    const elementsToRemove = clone.querySelectorAll(
        'button, input:not([type="hidden"]), textarea, select, [role="button"], nav, .no-print'
    );
    
    elementsToRemove.forEach(el => {
        el.remove();
    });

    // Add print-ready class
    clone.classList.add('print-ready-document');

    return clone;
};

/**
 * Calculate if content will fit on current page
 * 
 * @param {number} contentHeight - Height of content in pixels
 * @param {number} pageHeight - Page height in pixels (A4 default: ~1122px)
 * @param {number} usedHeight - Already used height on current page
 * @returns {boolean} - True if content fits on current page
 */
export const willFitOnPage = (
    contentHeight,
    pageHeight = 1122, // A4 height in pixels
    usedHeight = 0
) => {
    return (usedHeight + contentHeight) <= pageHeight;
};

/**
 * Get estimated page count for content
 * 
 * @param {HTMLElement} element - Content element
 * @param {number} pageHeight - Page height in pixels
 * @returns {number} - Estimated number of pages
 */
export const estimatePageCount = (element, pageHeight = 1122) => {
    if (!element) return 0;
    const contentHeight = element.scrollHeight;
    return Math.ceil(contentHeight / pageHeight);
};

/**
 * Force page break in print layout
 * Adds a class that CSS will use to break pages
 * 
 * @param {HTMLElement} element - Element to break before
 * @returns {void}
 */
export const forcePageBreakBefore = (element) => {
    if (element) {
        element.classList.add('page-break-before');
    }
};

/**
 * Remove forced page break
 * 
 * @param {HTMLElement} element - Element to remove break from
 * @returns {void}
 */
export const removePageBreak = (element) => {
    if (element) {
        element.classList.remove('page-break-before', 'page-break-after');
    }
};

/**
 * Configure print media query for testing
 * Enables/disables @media print rules without actual printing
 * 
 * @param {boolean} enable - Enable or disable print media simulation
 * @returns {void}
 */
export const simulatePrintMedia = (enable = true) => {
    const body = document.body;
    
    if (enable) {
        body.classList.add('simulate-print-media');
        
        // Create temporary stylesheet to simulate print
        if (!document.getElementById('print-simulation-styles')) {
            const style = document.createElement('style');
            style.id = 'print-simulation-styles';
            style.textContent = `
                .simulate-print-media {
                    background-color: #e0e0e0;
                }
                
                .simulate-print-media * {
                    background-color: white;
                    color: #000;
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        body.classList.remove('simulate-print-media');
    }
};

/**
 * Get print stylesheet information
 * Useful for debugging print styles
 * 
 * @returns {Object} - Information about print stylesheets
 */
export const getPrintStylesheetInfo = () => {
    const stylesheets = Array.from(document.styleSheets);
    const printSheets = stylesheets.filter(sheet => {
        try {
            return sheet.media.mediaText.includes('print') || 
                   sheet.href?.includes('print');
        } catch (e) {
            return false;
        }
    });

    return {
        totalSheets: stylesheets.length,
        printSheets: printSheets.length,
        printStylesheetNames: printSheets.map(s => s.href || 'inline')
    };
};

/**
 * Validate page break configuration
 * Checks if print styles are properly loaded
 * 
 * @returns {Object} - Validation result
 */
export const validatePrintConfig = () => {
    const results = {
        printStylesLoaded: false,
        mediaQueriesSupported: false,
        pageBreakSupported: false,
        errors: []
    };

    // Check if print stylesheet is loaded
    const printStylesLoaded = Array.from(document.styleSheets).some(sheet => {
        try {
            return sheet.href?.includes('printStyles') || 
                   sheet.href?.includes('print');
        } catch (e) {
            return false;
        }
    });
    results.printStylesLoaded = printStylesLoaded;

    // Check media query support
    results.mediaQueriesSupported = window.matchMedia('print').media === 'print';

    // Check page break CSS support
    const div = document.createElement('div');
    div.style.pageBreakInside = 'avoid';
    results.pageBreakSupported = div.style.pageBreakInside !== '';

    if (!printStylesLoaded) {
        results.errors.push('Print stylesheet not loaded. Import printStyles.css');
    }

    if (!results.mediaQueriesSupported) {
        results.errors.push('Media queries not supported in this browser');
    }

    if (!results.pageBreakSupported) {
        results.errors.push('Page break CSS not supported in this browser');
    }

    return results;
};

/**
 * Log print configuration to console for debugging
 * 
 * @returns {void}
 */
export const debugPrintConfig = () => {
    // Debug function - logging removed for production
};

/**
 * Set print page size and margins
 * 
 * @param {string} size - 'A4', 'Letter', etc.
 * @param {Object} margins - Margins object { top, right, bottom, left }
 * @returns {HTMLStyleElement} - Injected style element
 */
export const setPrintPageConfig = (size = 'A4', margins = null) => {
    let pageRule = `@page { size: ${size};`;
    
    if (margins) {
        const { top = '0.75in', right = '0.75in', bottom = '0.75in', left = '0.75in' } = margins;
        pageRule += ` margin: ${top} ${right} ${bottom} ${left};`;
    } else {
        pageRule += ` margin: 0.75in;`;
    }
    
    pageRule += ' }';

    const style = document.createElement('style');
    style.id = 'print-page-config';
    style.textContent = pageRule;
    document.head.appendChild(style);

    return style;
};

/**
 * Remove print page configuration
 * 
 * @returns {void}
 */
export const removePrintPageConfig = () => {
    const config = document.getElementById('print-page-config');
    if (config) {
        config.remove();
    }
};

/**
 * Print specific element only (hide everything else)
 * 
 * @param {HTMLElement | string} element - Element or selector to print
 * @param {Object} options - Options { title, margins, size }
 * @returns {void}
 */
export const printElement = (element, options = {}) => {
    const { title = 'Document', margins = null, size = 'A4' } = options;

    // Get element
    const el = typeof element === 'string' 
        ? document.querySelector(element) 
        : element;

    if (!el) {
        return;
    }

    // Save original content
    const originalContent = document.body.innerHTML;

    // Replace with print element
    document.body.innerHTML = el.innerHTML;

    // Set page config
    setPrintPageConfig(size, margins);

    // Trigger print
    triggerPrint(title, {
        after: () => {
            // Restore original content
            document.body.innerHTML = originalContent;
            removePrintPageConfig();
        }
    });
};

/**
 * Add print-only content
 * Content will only appear when printing
 * 
 * @param {string} content - HTML content to add
 * @param {string} containerId - ID of container to append to
 * @returns {HTMLElement} - Created element
 */
export const addPrintOnlyContent = (content, containerId = 'print-only-content') => {
    let container = document.getElementById(containerId);
    
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'print-only';
        document.body.appendChild(container);
    }

    container.innerHTML += content;
    return container;
};

export default {
    triggerPrint,
    preparePrintElement,
    willFitOnPage,
    estimatePageCount,
    forcePageBreakBefore,
    removePageBreak,
    simulatePrintMedia,
    getPrintStylesheetInfo,
    validatePrintConfig,
    debugPrintConfig,
    setPrintPageConfig,
    removePrintPageConfig,
    printElement,
    addPrintOnlyContent
};
