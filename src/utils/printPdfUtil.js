/**
 * Print PDF Utility
 * Handles print-to-PDF workflow for bank-style tables
 */

/**
 * Trigger browser print dialog
 * The print-only CSS will handle hiding UI and showing table
 */
export const triggerPrintDialog = () => {
  window.print();
};

/**
 * Trigger print with a slight delay (allows DOM to render)
 * Useful if table component just mounted
 */
export const triggerPrintWithDelay = (delayMs = 500) => {
  setTimeout(() => {
    window.print();
  }, delayMs);
};

/**
 * Advanced: Generate PDF via Puppeteer backend
 * Requires server endpoint at POST /api/generate-pdf
 * 
 * @param {Object} formData - The complete form data object
 * @param {string} filename - Optional filename for PDF (default: "valuation.pdf")
 * @returns {Promise<blob>} PDF blob
 */
export const generatePdfViaPuppeteer = async (formData, filename = "valuation.pdf") => {
  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData,
        filename,
        htmlTable: true, // Flag to use print-only table
      }),
    });

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Auto-download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if print-only table is visible
 * Useful for debugging
 */
export const isTableVisibleForPrint = () => {
  const table = document.querySelector('.print-only-pdf-table-wrapper');
  return table !== null;
};

/**
 * Show preview mode (for testing)
 * Display print table on screen instead of hiding it
 */
export const togglePrintPreview = () => {
  const table = document.querySelector('.print-only-pdf-table-wrapper');
  if (table) {
    table.classList.toggle('preview-mode');
  }
};
