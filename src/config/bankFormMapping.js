/**
 * Bank to Form Route Mapping Configuration
 * This configuration dynamically maps bank names to their corresponding form routes
 * Making it easy to add new banks without modifying component logic
 */

export const BANK_FORM_MAP = {
    "unionbank": "/valuationeditformunion",
    "union bank": "/valuationeditformunion",
    "ub": "/valuationeditformunion",
    "bomaharastra": "/valuationeditformbomaharastra",
    "bomaharastra bank": "/valuationeditformbomaharastra",
    "bom": "/valuationeditformbomaharastra",
    "bomahara": "/valuationeditformbomaharastra"
};

// Default fallback route for unmapped banks
export const DEFAULT_FORM_ROUTE = "/valuationeditform";

/**
 * Get the form route for a given bank name
 * @param {string} bankName - The bank name to look up
 * @returns {string} The form route to navigate to
 */
export const getFormRouteForBank = (bankName) => {
    if (!bankName || typeof bankName !== 'string') {
        return DEFAULT_FORM_ROUTE;
    }
    
    const normalizedBankName = bankName.toLowerCase().trim();
    return BANK_FORM_MAP[normalizedBankName] || DEFAULT_FORM_ROUTE;
};

/**
 * Check if a bank is BOF Maharashtra
 * @param {string} bankName - The bank name to check
 * @returns {boolean} True if bank is BOF Maharashtra, false otherwise
 */
export const isBofMaharashtraBank = (bankName) => {
    if (!bankName || typeof bankName !== 'string') return false;
    const normalizedBankName = bankName.toLowerCase().trim();
    return normalizedBankName.includes("bomaharastra") || normalizedBankName.includes("bof maharashtra") || normalizedBankName === "bom" || normalizedBankName === "bomahara";
};

/**
 * Check if a bank has a custom form
 * @param {string} bankName - The bank name to check
 * @returns {boolean} True if bank has custom form, false otherwise
 */
export const hasCustomForm = (bankName) => {
    if (!bankName || typeof bankName !== 'string') return false;
    const normalizedBankName = bankName.toLowerCase().trim();
    return normalizedBankName in BANK_FORM_MAP && BANK_FORM_MAP[normalizedBankName] !== DEFAULT_FORM_ROUTE;
};

/**
 * Get all available banks with custom forms
 * @returns {Array<{bankName: string, route: string}>}
 */
export const getAvailableBanks = () => {
    const banks = new Map();
    Object.entries(BANK_FORM_MAP).forEach(([bankName, route]) => {
        if (route !== DEFAULT_FORM_ROUTE && bankName && typeof bankName === 'string') {
            // Store only the first variation of each bank
            const bankKey = bankName.split(" ")[0].toLowerCase();
            if (!banks.has(bankKey)) {
                const displayName = bankName.length > 0 ? bankName.charAt(0).toUpperCase() + bankName.slice(1) : '';
                banks.set(bankKey, {
                    displayName: displayName,
                    route: route
                });
            }
        }
    });
    return Array.from(banks.values());
};
