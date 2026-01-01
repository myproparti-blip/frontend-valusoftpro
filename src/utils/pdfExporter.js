/**
 * PDF Export Utilities for Rajesh Ganatra Valuation Report
 * Handles both the reconstructed PDF component and legacy export
 */

export const exportPDFFromComponent = (elementRef, filename = 'Rajesh_Ganatra_Valuation.pdf') => {
  if (!elementRef) return;

  const element = elementRef.current || elementRef;
  
  // Dynamic import to avoid SSR issues
  import('html2pdf.js').then((module) => {
    const html2pdf = module.default;
    
    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'px',
        format: [794, 1123],
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: 'avoid' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .catch(err => {});
    }).catch(err => {});
};

/**
 * Export to PDF using Puppeteer (server-side)
 * Requires backend endpoint
 */
export const exportPDFServerSide = async (data, filename = 'Rajesh_Ganatra_Valuation.pdf') => {
  try {
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data,
        filename,
        template: 'rajesh_ganatra'
      })
    });

    if (!response.ok) {
      throw new Error(`PDF Export failed: ${response.statusText}`);
    }

    // Trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return filename;
  } catch (error) {
    throw error;
  }
};

/**
 * Print the PDF directly
 */
export const printPDF = (elementRef) => {
  if (!elementRef) return;

  const element = elementRef.current || elementRef;
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Rajesh Ganatra Valuation Report</title>
        <style>
          * { margin: 0; padding: 0; }
          body { background: white; }
          @page { margin: 0; size: A4; }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

/**
 * Download as image (PNG/JPEG)
 */
export const downloadAsImage = async (elementRef, format = 'png', filename = 'Rajesh_Ganatra_Valuation') => {
  try {
    const { default: html2canvas } = await import('html2canvas');
    
    const element = elementRef.current || elementRef;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL(`image/${format}`);
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    return `${filename}.${format}`;
  } catch (error) {
    throw error;
  }
};

export default {
  exportPDFFromComponent,
  exportPDFServerSide,
  printPDF,
  downloadAsImage
};
