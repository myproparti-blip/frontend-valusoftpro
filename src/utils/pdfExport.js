import jsPDF from 'jspdf';

export const generatePDFFromForm = async (formData, fileName = 'valuation_report.pdf') => {
    try {
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;

        // Create comprehensive HTML for the report
        const htmlContent = generateComprehensiveHTML(formData);
        
        // Create temporary container
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '210mm';
        container.style.backgroundColor = '#ffffff';
        document.body.appendChild(container);

        // Convert HTML to canvas
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            allowTaint: true,
            windowHeight: container.scrollHeight,
            windowWidth: 793
        });

        // Remove temporary container
        document.body.removeChild(container);

        // Create PDF from canvas
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'A4');
        let heightLeft = imgHeight;
        let position = 0;

        // Add pages to PDF
        while (heightLeft >= 0) {
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            position -= pageHeight;
            if (heightLeft > 0) {
                pdf.addPage();
            }
        }

        // Save PDF
        pdf.save(fileName);
    } catch (error) {
        throw error;
    }
};

// Helper function to generate comprehensive HTML from form data
const generateComprehensiveHTML = (formData) => {
    const pdfData = formData?.pdfDetails || {};
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Valuation Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            color: #333;
            background: #fff;
        }
        
        .page {
            width: 210mm;
            height: auto;
            margin: 0;
            padding: 12mm;
            background: white;
            page-break-after: always;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 10px;
        }
        
        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 10pt;
            color: #333;
            margin: 2px 0;
        }
        
        .section {
            margin-bottom: 15px;
            border: 1px solid #0066cc;
        }
        
        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #ffffff;
            background: #0066cc;
            padding: 6px 10px;
            margin: 0;
            border-left: 4px solid #004499;
        }
        
        .section-content {
            padding: 8px 10px;
            background: #f0f5ff;
        }
        
        .field-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .field-group {
            display: flex;
            flex-direction: column;
        }
        
        .field-label {
            font-weight: bold;
            color: #0066cc;
            font-size: 9pt;
            margin-bottom: 2px;
        }
        
        .field-value {
            color: #333;
            font-size: 10pt;
            padding: 4px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 2px;
            min-height: 18px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 9pt;
        }
        
        th {
            background: #0066cc;
            color: white;
            padding: 6px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #0066cc;
        }
        
        td {
            padding: 6px;
            border: 1px solid #ccc;
            vertical-align: top;
        }
        
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .image-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
            justify-content: flex-start;
        }
        
        .image-item {
            flex: 0 1 calc(33.333% - 7px);
            text-align: center;
        }
        
        .image-item img {
            max-width: 100%;
            max-height: 120px;
            border: 2px solid #0066cc;
            padding: 2px;
        }
        
        .image-label {
            font-size: 8pt;
            color: #666;
            margin-top: 4px;
        }
        
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            font-size: 8pt;
            color: #666;
        }
        
        .full-width {
            grid-column: 1 / -1;
        }
        
        .two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .section-content p {
            margin: 5px 0;
            font-size: 9pt;
            line-height: 1.4;
        }
    </style>
</head>
<body>

<div class="page">
    <div class="header">
        <h1>VALUATION REPORT</h1>
        <p><strong>Bank:</strong> ${pdfData?.branch || formData?.bankName || 'Union Bank of India'}</p>
        <p><strong>Report No:</strong> ${pdfData?.formId || 'N/A'}</p>
        <p><strong>Valuation Date:</strong> ${pdfData?.valuationMadeDate || 'N/A'}</p>
    </div>

    <!-- PROPERTY DETAILS -->
    <div class="section">
        <div class="section-title">PROPERTY DETAILS</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">Owner Name:</span>
                    <span class="field-value">${pdfData?.ownerNameAddress || formData.clientName || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Plot Survey No:</span>
                    <span class="field-value">${pdfData?.plotSurveyNo || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Property Address:</span>
                    <span class="field-value">${pdfData?.postalAddress || formData.address || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Inspection Date:</span>
                    <span class="field-value">${pdfData?.dateOfInspection || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">City:</span>
                    <span class="field-value">${pdfData?.cityTown || formData.city || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- PROPERTY SPECIFICATIONS -->
    <div class="section">
        <div class="section-title">PROPERTY SPECIFICATIONS</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">Carpet Area:</span>
                    <span class="field-value">${pdfData?.carpetAreaFlat || 'N/A'} Sqft</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Structure Type:</span>
                    <span class="field-value">${pdfData?.typeOfStructure || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Built Up Area:</span>
                    <span class="field-value">${pdfData?.extentOfSiteValuation || 'N/A'} Sqft</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Construction Year:</span>
                    <span class="field-value">${pdfData?.yearOfConstruction || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- VALUATION RESULTS -->
    <div class="section">
        <div class="section-title">VALUATION RESULTS</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">Fair Market Value:</span>
                    <span class="field-value"><strong>${pdfData?.fairMarketValue || 'N/A'}</strong></span>
                </div>
                <div class="field-group">
                    <span class="field-label">Distress Value:</span>
                    <span class="field-value">${pdfData?.distressValue || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Realizable Value:</span>
                    <span class="field-value">${pdfData?.realizableValue || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Insurable Value:</span>
                    <span class="field-value">${pdfData?.insurableValue || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- RATE ANALYSIS -->
    <div class="section">
        <div class="section-title">RATE ANALYSIS</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">Adopted Rate:</span>
                    <span class="field-value">${pdfData?.adoptedBasicCompositeRate || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Building Services:</span>
                    <span class="field-value">${pdfData?.buildingServicesRate || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Guideline Rate:</span>
                    <span class="field-value">${pdfData?.guidelineRate || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Land & Others:</span>
                    <span class="field-value">${pdfData?.landOthersRate || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- MARKETABILITY & FACTORS -->
    <div class="section">
        <div class="section-title">MARKETABILITY & FACTORS</div>
        <div class="section-content">
            <div class="field-group" style="margin-bottom: 10px;">
                <span class="field-label">Marketability:</span>
                <span class="field-value">${pdfData?.marketability || 'N/A'}</span>
            </div>
            <div class="field-group" style="margin-bottom: 10px;">
                <span class="field-label">Positive Factors:</span>
                <span class="field-value">${pdfData?.favoringFactors || 'N/A'}</span>
            </div>
            <div class="field-group">
                <span class="field-label">Negative Factors:</span>
                <span class="field-value">${pdfData?.negativeFactors || 'N/A'}</span>
            </div>
        </div>
    </div>

    <!-- LOCATION & COORDINATES -->
    <div class="section">
        <div class="section-title">LOCATION & COORDINATES</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">Latitude:</span>
                    <span class="field-value">${formData.coordinates?.latitude || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Longitude:</span>
                    <span class="field-value">${formData.coordinates?.longitude || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Area Classification:</span>
                    <span class="field-value">${pdfData?.areaClassification || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- BUILDING INFORMATION -->
    <div class="section">
        <div class="section-title">BUILDING INFORMATION</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">No. of Floors:</span>
                    <span class="field-value">${pdfData?.numberOfFloors || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Quality of Construction:</span>
                    <span class="field-value">${pdfData?.qualityOfConstruction || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Building Appearance:</span>
                    <span class="field-value">${pdfData?.appearanceOfBuilding || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Maintenance of Building:</span>
                    <span class="field-value">${pdfData?.maintenanceOfBuilding || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- PROPERTY DIRECTIONS -->
    <div class="section">
        <div class="section-title">PROPERTY DIRECTIONS & BOUNDARIES</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">North:</span>
                    <span class="field-value">${formData.directions?.north1 || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">South:</span>
                    <span class="field-value">${formData.directions?.south1 || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">East:</span>
                    <span class="field-value">${formData.directions?.east1 || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">West:</span>
                    <span class="field-value">${formData.directions?.west1 || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- DOCUMENTS & CERTIFICATES -->
    <div class="section">
        <div class="section-title">DOCUMENTS & CERTIFICATES</div>
        <div class="section-content">
            <div class="field-group" style="margin-bottom: 10px;">
                <span class="field-label">Agreement for Sale:</span>
                <span class="field-value">${pdfData?.agreementForSale || 'N/A'}</span>
            </div>
            <div class="field-group" style="margin-bottom: 10px;">
                <span class="field-label">Commencement Certificate:</span>
                <span class="field-value">${pdfData?.commencementCertificate || 'N/A'}</span>
            </div>
            <div class="field-group" style="margin-bottom: 10px;">
                <span class="field-label">Occupancy Certificate:</span>
                <span class="field-value">${pdfData?.occupancyCertificate || 'N/A'}</span>
            </div>
            <div class="field-group">
                <span class="field-label">Mortgage Deed:</span>
                <span class="field-value">${pdfData?.mortgageDeed || 'N/A'}</span>
            </div>
        </div>
    </div>

    <!-- VALUATION DETAILS TABLE -->
    <div class="section">
        <div class="section-title">DETAILS OF VALUATION</div>
        <div class="section-content">
            <table>
                <thead>
                    <tr>
                        <th>Sr.</th>
                        <th>Description</th>
                        <th>Value (Rs.)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Present Value of Unit (Carpet Area)</td>
                        <td>${pdfData?.presentValue || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Wardrobes</td>
                        <td>${pdfData?.wardrobes || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Showcases</td>
                        <td>${pdfData?.showcases || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td>Kitchen Arrangements</td>
                        <td>${pdfData?.kitchenArrangements || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>5</td>
                        <td>Superfine Finish</td>
                        <td>${pdfData?.superfineFinish || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>6</td>
                        <td>Interior Decorations</td>
                        <td>${pdfData?.interiorDecorations || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>7</td>
                        <td>Electricity Deposits / Fittings</td>
                        <td>${pdfData?.electricityDeposits || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>8</td>
                        <td>Collapsible Gates / Grill Works</td>
                        <td>${pdfData?.collapsibleGates || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>9</td>
                        <td>Potential Value</td>
                        <td>${pdfData?.potentialValue || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>10</td>
                        <td>Others</td>
                        <td>${pdfData?.otherItems || 'N/A'}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #e6f2ff;">
                        <td colspan="2">TOTAL</td>
                        <td>${pdfData?.totalValuationItems || 'N/A'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- PROPERTY IMAGES -->
    ${(formData.propertyImages && formData.propertyImages.length > 0) ? `
    <div class="section">
        <div class="section-title">PROPERTY IMAGES</div>
        <div class="section-content">
            <div class="image-gallery">
                ${formData.propertyImages.map((img, idx) => {
                    let imgUrl = '';
                    if (typeof img === 'string') {
                        imgUrl = img;
                    } else if (img.url) {
                        imgUrl = img.url;
                    } else if (img.preview) {
                        imgUrl = img.preview;
                    }
                    return imgUrl ? `
                        <div class="image-item">
                            <img src="${imgUrl}" alt="Property Image ${idx + 1}" />
                            <div class="image-label">Property Image ${idx + 1}</div>
                        </div>
                    ` : '';
                }).join('')}
            </div>
        </div>
    </div>
    ` : ''}

    <!-- LOCATION IMAGES -->
    ${(formData.locationImages && formData.locationImages.length > 0) ? `
    <div class="section">
        <div class="section-title">LOCATION IMAGES</div>
        <div class="section-content">
            <div class="image-gallery">
                ${formData.locationImages.map((img, idx) => {
                    let imgUrl = '';
                    if (typeof img === 'string') {
                        imgUrl = img;
                    } else if (img.url) {
                        imgUrl = img.url;
                    } else if (img.preview) {
                        imgUrl = img.preview;
                    }
                    return imgUrl ? `
                        <div class="image-item">
                            <img src="${imgUrl}" alt="Location Image ${idx + 1}" />
                            <div class="image-label">Location Image ${idx + 1}</div>
                        </div>
                    ` : '';
                }).join('')}
            </div>
        </div>
    </div>
    ` : ''}

    <!-- DEPRECIATION & RATES -->
    <div class="section">
        <div class="section-title">DEPRECIATION & COMPOSITE RATES</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">Depreciated Building Rate:</span>
                    <span class="field-value">${pdfData?.depreciatedBuildingRate || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Building Age (Years):</span>
                    <span class="field-value">${pdfData?.buildingAge || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Building Life (Years):</span>
                    <span class="field-value">${pdfData?.buildingLife || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Depreciation %:</span>
                    <span class="field-value">${pdfData?.depreciationPercentage || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Total Composite Rate:</span>
                    <span class="field-value">${pdfData?.totalCompositeRate || 'N/A'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Rate for Land & Other:</span>
                    <span class="field-value">${pdfData?.rateForLandOther || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- REPORT DETAILS -->
    <div class="section">
        <div class="section-title">REPORT DETAILS & SIGNATURE</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field-group">
                    <span class="field-label">Valuer/Engineer:</span>
                    <span class="field-value">${pdfData?.signerName || formData.engineerName || 'Bhanu'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Place:</span>
                    <span class="field-value">${pdfData?.place || formData.city || 'Mumbai'}</span>
                </div>
                <div class="field-group">
                    <span class="field-label">Report Date:</span>
                    <span class="field-value">${pdfData?.reportDate || formData.dateTime || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>This is a computer generated report and does not require signature.</p>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    </div>
</div>

</body>
</html>
    `;
};
