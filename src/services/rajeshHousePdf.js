import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to safely get nested values with NA fallback
const safeGet = (obj, path, defaultValue = 'NA') => {
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj);

    // Handle different value types
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    // Convert boolean to Yes/No for area checkboxes
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    // If value is an object, try to extract string representation
    if (typeof value === 'object') {
        // Try common field names for document fields
        if (path === 'agreementForSale' && value.agreementForSaleExecutedName) {
            return value.agreementForSaleExecutedName;
        }
        // For other objects, convert to JSON string or return NA
        return defaultValue;
    }

    return value;
};

// Helper function to format date as d/m/yyyy
const formatDate = (dateString) => {
    if (!dateString) return 'NA';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

// Helper function to extract address value from nested object or return as-is
const extractAddressValue = (address) => {
    if (!address) return '';
    // If it's an object with fullAddress property, extract it
    if (typeof address === 'object' && address.fullAddress) {
        return address.fullAddress;
    }
    // If it's already a string, return it
    if (typeof address === 'string') {
        return address;
    }
    return '';
};

// Helper function to round value to nearest 1000
const roundToNearest1000 = (value) => {
    if (!value) return 'NA';
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return value;
    return Math.round(num / 1000) * 1000;
};

// Helper function to convert number to Indian words
const numberToWords = (num) => {
    if (!num || isNaN(num)) return '';
    num = Math.round(parseFloat(num));
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lac', 'Crore'];

    const convertHundreds = (n) => {
        let result = '';
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;

        if (hundred > 0) result += ones[hundred] + ' Hundred ';
        if (remainder >= 20) {
            result += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10] + ' ';
        } else if (remainder >= 10) {
            result += teens[remainder - 10] + ' ';
        } else if (remainder > 0) {
            result += ones[remainder] + ' ';
        }
        return result;
    };

    let words = '';
    let scale = 0;

    while (num > 0 && scale < scales.length) {
        let group = num % 1000;
        if (scale === 1) group = num % 100;

        if (group > 0) {
            if (scale === 1) {
                words = convertHundreds(group).replace('Hundred', '').trim() + ' ' + scales[scale] + ' ' + words;
            } else {
                words = convertHundreds(group) + scales[scale] + ' ' + words;
            }
        }

        num = Math.floor(num / (scale === 0 ? 1000 : scale === 1 ? 100 : 1000));
        scale++;
    }

    return words.trim().toUpperCase();
};

// Helper function to calculate percentage of value
const calculatePercentage = (baseValue, percentage) => {
    if (!baseValue) return 0;
    const num = parseFloat(String(baseValue).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return 0;
    return Math.round((num * percentage) / 100);
};

// Helper function to format currency with words
const formatCurrencyWithWords = (value, percentage = 100) => {
    if (!value) return 'NA';
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return value;

    const finalValue = Math.round((num * percentage) / 100);
    const words = numberToWords(finalValue);
    const formatted = finalValue.toLocaleString('en-IN');

    return `₹ ${formatted}/- (${words})`;
};

// Helper function to get image dimensions and optimize for PDF
const getImageDimensions = (imageUrl) => {
    // Default dimensions
    let width = 500;
    let height = 400;

    // Ensure imageUrl is a string
    if (!imageUrl || typeof imageUrl !== 'string') {
        return { width, height };
    }

    // If image is base64 or data URI, return defaults
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
        return { width, height };
    }

    // For location images, use larger dimensions
    if (imageUrl.includes('location')) {
        return { width: 500, height: 450 };
    }

    return { width, height };
};

// Helper function to extract image URL safely
const extractImageUrl = (img) => {
    if (!img) return '';

    let url = '';

    if (typeof img === 'string') {
        url = img.trim();
    } else if (typeof img === 'object') {
        // Try multiple properties that might contain the URL
        url = (img.url || img.preview || img.data || img.src || img.secure_url || '').toString().trim();
    }

    // Validate URL format
    if (!url) return '';

    // Accept data URIs, blob URLs, and HTTP(S) URLs
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    return '';
};

// Helper function to validate and format image for PDF
const getImageSource = (imageUrl) => {
    // Ensure imageUrl is a string
    if (!imageUrl || typeof imageUrl !== 'string') {
        return '';
    }

    // Trim whitespace
    imageUrl = imageUrl.trim();

    // Return empty if still invalid after trim
    if (!imageUrl) {
        return '';
    }

    // If already base64 or data URI, use directly
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
        return imageUrl;
    }

    // For regular URLs, ensure it's valid
    try {
        // Try to construct a URL - this validates the URL format
        new URL(imageUrl);
        return imageUrl;
    } catch (e) {
        console.warn('Invalid image URL:', imageUrl.substring(0, 100), e?.message);
        return '';
    }
};

// Helper function to normalize data structure - flatten nested objects from database
const normalizeDataForPDF = (data = {}) => {
    if (!data) return {};

    // Start with data as-is
    let normalized = { ...data };

    // 1. Extract from documentInformation (lowest priority)
    if (data.documentInformation) {
        normalized.branch = safeGet(normalized, 'branch', null) || data.documentInformation.branch;
        normalized.dateOfInspection = safeGet(normalized, 'dateOfInspection', null) || data.documentInformation.dateOfInspection;
        normalized.dateOfValuation = safeGet(normalized, 'dateOfValuation', null) || data.documentInformation.dateOfValuation;
        normalized.valuationPurpose = safeGet(normalized, 'valuationPurpose', null) || data.documentInformation.valuationPurpose;
    }

    // 2. Extract from ownerDetails
    if (data.ownerDetails) {
        normalized.ownerNameAddress = safeGet(normalized, 'ownerNameAddress', null) || data.ownerDetails.ownerNameAddress;
        normalized.briefDescriptionProperty = safeGet(normalized, 'briefDescriptionProperty', null) || data.ownerDetails.propertyDescription;
    }

    // 3. Extract from locationOfProperty
    if (data.locationOfProperty) {
        normalized.plotSurveyNo = safeGet(normalized, 'plotSurveyNo', null) || data.locationOfProperty.plotSurveyNo;
        normalized.doorNo = safeGet(normalized, 'doorNo', null) || data.locationOfProperty.doorNo;
        normalized.tpVillage = safeGet(normalized, 'tpVillage', null) || data.locationOfProperty.tsVillage;
        normalized.wardTaluka = safeGet(normalized, 'wardTaluka', null) || data.locationOfProperty.wardTaluka;
        normalized.mandalDistrict = safeGet(normalized, 'mandalDistrict', null) || data.locationOfProperty.mandalDistrict;
        normalized.layoutPlanIssueDate = safeGet(normalized, 'layoutPlanIssueDate', null) || data.locationOfProperty.dateLayoutIssueValidity;
        normalized.approvedMapAuthority = safeGet(normalized, 'approvedMapAuthority', null) || data.locationOfProperty.approvedMapIssuingAuthority;
        // Area fields from locationOfProperty (only if not set)
        normalized.postalAddress = extractAddressValue(safeGet(normalized, 'postalAddress', null) || data.locationOfProperty.postalAddress);
        normalized.residentialArea = data.locationOfProperty.residentialArea !== undefined ? data.locationOfProperty.residentialArea : normalized.residentialArea;
        normalized.commercialArea = data.locationOfProperty.commercialArea !== undefined ? data.locationOfProperty.commercialArea : normalized.commercialArea;
        normalized.industrialArea = data.locationOfProperty.industrialArea !== undefined ? data.locationOfProperty.industrialArea : normalized.industrialArea;
    }

    // 4. Extract from cityAreaType
    if (data.cityAreaType) {
        normalized.cityTown = safeGet(normalized, 'cityTown', null) || data.cityAreaType.cityTown;
    }

    // 5. Extract from areaClassification
    if (data.areaClassification) {
        normalized.areaClassification = safeGet(normalized, 'areaClassification', null) || data.areaClassification.areaClassification;
        normalized.urbanClassification = safeGet(normalized, 'urbanClassification', null) || data.areaClassification.areaType;
        normalized.governmentType = safeGet(normalized, 'governmentType', null) || data.areaClassification.govGovernance;
        normalized.govtEnactmentsCovered = safeGet(normalized, 'govtEnactmentsCovered', null) || data.areaClassification.stateGovernmentEnactments;
    }

    // 6. Extract from propertyBoundaries (only if not set)
    if (data.propertyBoundaries?.plotBoundaries) {
        normalized.boundariesPlotNorth = safeGet(normalized, 'boundariesPlotNorth', null) || data.propertyBoundaries.plotBoundaries.north;
        normalized.boundariesPlotSouth = safeGet(normalized, 'boundariesPlotSouth', null) || data.propertyBoundaries.plotBoundaries.south;
        normalized.boundariesPlotEast = safeGet(normalized, 'boundariesPlotEast', null) || data.propertyBoundaries.plotBoundaries.east;
        normalized.boundariesPlotWest = safeGet(normalized, 'boundariesPlotWest', null) || data.propertyBoundaries.plotBoundaries.west;
    }

    // 7. Extract from propertyDimensions
    if (data.propertyDimensions) {
        normalized.dimensionsDeed = safeGet(normalized, 'dimensionsDeed', null) || data.propertyDimensions.dimensionsAsPerDeed;
        normalized.dimensionsActual = safeGet(normalized, 'dimensionsActual', null) || data.propertyDimensions.actualDimensions;
        normalized.extentOfUnit = safeGet(normalized, 'extentOfUnit', null) || data.propertyDimensions.extent;
        normalized.latitudeLongitude = safeGet(normalized, 'latitudeLongitude', null) || data.propertyDimensions.latitudeLongitudeCoordinates;
        normalized.extentOfSiteValuation = safeGet(normalized, 'extentOfSiteValuation', null) || data.propertyDimensions.extentSiteConsideredValuation;
    }

    // 8. Extract from rateInfo (priority 1)
    if (data.rateInfo && !normalized.comparableRate) {
        normalized.comparableRate = data.rateInfo.comparableRateSimilarUnit;
        normalized.adoptedBasicCompositeRate = data.rateInfo.adoptedBasicCompositeRate;
        normalized.buildingServicesRate = data.rateInfo.buildingServicesRate;
        normalized.landOthersRate = data.rateInfo.landOthersRate;
    }

    // 9. Extract from rateValuation (priority 2 - overwrites rateInfo if present)
    if (data.rateValuation) {
        normalized.comparableRate = data.rateValuation.comparableRateSimilarUnitPerSqft || normalized.comparableRate;
        normalized.adoptedBasicCompositeRate = data.rateValuation.adoptedBasicCompositeRatePerSqft || normalized.adoptedBasicCompositeRate;
        normalized.buildingServicesRate = data.rateValuation.buildingServicesRatePerSqft || normalized.buildingServicesRate;
        normalized.landOthersRate = data.rateValuation.landOthersRatePerSqft || normalized.landOthersRate;
    }

    // 10. Extract from compositeRateDepreciation (priority 1)
    if (data.compositeRateDepreciation && !normalized.depreciatedBuildingRate) {
        normalized.depreciatedBuildingRate = data.compositeRateDepreciation.depreciatedBuildingRatePerSqft;
        normalized.replacementCostServices = data.compositeRateDepreciation.replacementCostUnitServicesPerSqft;
        normalized.buildingAge = data.compositeRateDepreciation.ageOfBuildingYears;
        normalized.buildingLife = data.compositeRateDepreciation.lifeOfBuildingEstimatedYears;
        normalized.depreciationPercentage = data.compositeRateDepreciation.depreciationPercentageSalvage;
        normalized.deprecatedRatio = data.compositeRateDepreciation.depreciatedRatioBuilding;
        normalized.totalCompositeRate = data.compositeRateDepreciation.totalCompositeRatePerSqft;
        normalized.rateForLandOther = data.compositeRateDepreciation.rateLandOtherV3IIPerSqft;
        normalized.guidelineRate = data.compositeRateDepreciation.guidelineRatePerSqm;
    }

    // 11. Extract from compositeRate (priority 2 - overwrites if present)
    if (data.compositeRate) {
        normalized.depreciatedBuildingRate = data.compositeRate.depreciatedBuildingRate || normalized.depreciatedBuildingRate;
        normalized.replacementCostServices = data.compositeRate.replacementCostUnitServices || normalized.replacementCostServices;
        normalized.buildingAge = data.compositeRate.ageOfBuilding || normalized.buildingAge;
        normalized.buildingLife = data.compositeRate.lifeOfBuildingEstimated || normalized.buildingLife;
        normalized.depreciationPercentage = data.compositeRate.depreciationPercentageSalvage || normalized.depreciationPercentage;
        normalized.deprecatedRatio = data.compositeRate.depreciatedRatioBuilding || normalized.deprecatedRatio;
        normalized.totalCompositeRate = data.compositeRate.totalCompositeRate || normalized.totalCompositeRate;
        normalized.rateForLandOther = data.compositeRate.rateLandOtherV3II || normalized.rateForLandOther;
        normalized.guidelineRate = data.compositeRate.guidelineRateRegistrar || normalized.guidelineRate;
    }

    // 12. Extract from valuationResults
    if (data.valuationResults) {
        normalized.fairMarketValue = safeGet(normalized, 'fairMarketValue', null) || data.valuationResults.fairMarketValue;
        normalized.realizableValue = safeGet(normalized, 'realizableValue', null) || data.valuationResults.realizableValue;
        normalized.distressValue = safeGet(normalized, 'distressValue', null) || data.valuationResults.distressValue;
        normalized.saleDeedValue = safeGet(normalized, 'saleDeedValue', null) || data.valuationResults.saleDeedValue;
        normalized.insurableValue = safeGet(normalized, 'insurableValue', null) || data.valuationResults.insurableValue;
        normalized.rentReceivedPerMonth = safeGet(normalized, 'rentReceivedPerMonth', null) || data.valuationResults.rentReceivedPerMonth;
        normalized.marketability = safeGet(normalized, 'marketability', null) || data.valuationResults.marketability;
    }

    // 13. Extract from buildingConstruction
    if (data.buildingConstruction) {
        normalized.yearOfConstruction = safeGet(normalized, 'yearOfConstruction', null) || data.buildingConstruction.yearOfConstruction;
        normalized.numberOfFloors = safeGet(normalized, 'numberOfFloors', null) || data.buildingConstruction.numberOfFloors;
        normalized.numberOfDwellingUnits = safeGet(normalized, 'numberOfDwellingUnits', null) || data.buildingConstruction.numberOfDwellingUnits;
        normalized.typeOfStructure = safeGet(normalized, 'typeOfStructure', null) || data.buildingConstruction.typeOfStructure;
        normalized.qualityOfConstruction = safeGet(normalized, 'qualityOfConstruction', null) || data.buildingConstruction.qualityOfConstruction;
        normalized.appearanceOfBuilding = safeGet(normalized, 'appearanceOfBuilding', null) || data.buildingConstruction.appearanceOfBuilding;
        normalized.maintenanceOfBuilding = safeGet(normalized, 'maintenanceOfBuilding', null) || data.buildingConstruction.maintenanceOfBuilding;
    }

    // 14. Extract from electricityService
    if (data.electricityService) {
        normalized.electricityServiceConnectionNo = safeGet(normalized, 'electricityServiceConnectionNo', null) || data.electricityService.electricityServiceConnectionNo;
        normalized.meterCardName = safeGet(normalized, 'meterCardName', null) || data.electricityService.meterCardName;
    }

    // 15. Extract from unitTax
    if (data.unitTax) {
        normalized.assessmentNo = safeGet(normalized, 'assessmentNo', null) || data.unitTax.assessmentNo;
        normalized.taxPaidName = safeGet(normalized, 'taxPaidName', null) || data.unitTax.taxPaidName;
        normalized.taxAmount = safeGet(normalized, 'taxAmount', null) || data.unitTax.taxAmount;
    }

    // 16. Extract from unitMaintenance
    if (data.unitMaintenance) {
        normalized.unitMaintenance = safeGet(normalized, 'unitMaintenance', null) || data.unitMaintenance.unitMaintenanceStatus;
    }

    // 17. Extract from unitSpecifications
    if (data.unitSpecifications) {
        normalized.floorUnit = safeGet(normalized, 'floorUnit', null) || data.unitSpecifications.floorLocation;
        normalized.doorNoUnit = safeGet(normalized, 'doorNoUnit', null) || data.unitSpecifications.doorNoUnit;
        normalized.roofUnit = safeGet(normalized, 'roofUnit', null) || data.unitSpecifications.roof;
        normalized.flooringUnit = safeGet(normalized, 'flooringUnit', null) || data.unitSpecifications.flooring;
        normalized.doorsUnit = safeGet(normalized, 'doorsUnit', null) || data.unitSpecifications.doors;
        normalized.windowsUnit = safeGet(normalized, 'windowsUnit', null) || data.unitSpecifications.windows;
        normalized.fittingsUnit = safeGet(normalized, 'fittingsUnit', null) || data.unitSpecifications.fittings;
        normalized.finishingUnit = safeGet(normalized, 'finishingUnit', null) || data.unitSpecifications.finishing;
        normalized.unitBathAndWC = safeGet(normalized, 'unitBathAndWC', null) || data.unitSpecifications.bathAndWC;
        normalized.unitElectricalWiring = safeGet(normalized, 'unitElectricalWiring', null) || data.unitSpecifications.electricalWiring;
        normalized.unitWindows = safeGet(normalized, 'unitWindows', null) || data.unitSpecifications.windows;
        normalized.unitSpecification = safeGet(normalized, 'unitSpecification', null) || data.unitSpecifications.specification;
    }

    // 18. Extract from unitAreaDetails
    if (data.unitAreaDetails) {
        normalized.undividedLandArea = normalized.undividedLandArea || data.unitAreaDetails.undividedLandAreaSaleDeed || data.unitAreaDetails.undividedLandArea;
        normalized.plinthArea = normalized.plinthArea || data.unitAreaDetails.plinthAreaUnit || data.unitAreaDetails.plinthArea;
        normalized.carpetArea = normalized.carpetArea || data.unitAreaDetails.carpetAreaUnit || data.unitAreaDetails.carpetArea;
    }

    // 19. Extract from unitClassification
    if (data.unitClassification) {
        normalized.floorSpaceIndex = safeGet(normalized, 'floorSpaceIndex', null) || data.unitClassification.floorSpaceIndex;
        normalized.unitClassification = normalized.unitClassification || data.unitClassification.unitClassification || data.unitClassification.classification;
        normalized.residentialOrCommercial = normalized.residentialOrCommercial || data.unitClassification.residentialOrCommercial || data.unitClassification.usageType;
        normalized.ownerOccupiedOrLetOut = normalized.ownerOccupiedOrLetOut || data.unitClassification.ownerOccupiedOrLetOut || data.unitClassification.occupancyType;
        normalized.numberOfDwellingUnits = normalized.numberOfDwellingUnits || data.unitClassification.numberOfDwellingUnits;
    }

    // 20. Extract from apartmentLocation
    if (data.apartmentLocation) {
        normalized.apartmentNature = safeGet(normalized, 'apartmentNature', null) || data.apartmentLocation.apartmentNature;
        normalized.apartmentLocation = normalized.apartmentLocation || data.apartmentLocation.apartmentLocation || data.apartmentLocation.location;
        normalized.apartmentCTSNo = normalized.apartmentCTSNo || data.apartmentLocation.apartmentCTSNo || data.apartmentLocation.ctsNo || data.apartmentLocation.cTSNo;
        normalized.apartmentTSNo = normalized.apartmentTSNo || data.apartmentLocation.tsNo || data.apartmentLocation.ctsNo || data.apartmentLocation.tSNo || data.apartmentLocation.plotSurveyNo;
        normalized.apartmentBlockNo = normalized.apartmentBlockNo || data.apartmentLocation.blockNo || data.apartmentLocation.block || data.apartmentLocation.blockNumber;
        normalized.apartmentWardNo = normalized.apartmentWardNo || data.apartmentLocation.wardNo || data.apartmentLocation.ward || data.apartmentLocation.wardNumber;
        normalized.apartmentVillageMunicipalityCounty = normalized.apartmentVillageMunicipalityCounty || data.apartmentLocation.villageOrMunicipality || data.apartmentLocation.village || data.apartmentLocation.municipality || data.apartmentLocation.tsVillage;
        normalized.apartmentDoorNoStreetRoad = normalized.apartmentDoorNoStreetRoad || data.apartmentLocation.doorNoStreetRoadPinCode || data.apartmentLocation.doorNo || data.apartmentLocation.streetRoad || data.apartmentLocation.street || data.apartmentLocation.doorNumber || data.apartmentLocation.roadName;
        normalized.apartmentPinCode = normalized.apartmentPinCode || data.apartmentLocation.pinCode;
    }

    // 21. Extract from monthlyRent
    if (data.monthlyRent) {
        normalized.monthlyRent = safeGet(normalized, 'monthlyRent', null) || data.monthlyRent.ifRentedMonthlyRent;
    }

    // 22. Extract from marketability
    if (data.marketability) {
        normalized.marketability = safeGet(normalized, 'marketability', null) || data.marketability.howIsMarketability;
        normalized.favoringFactors = safeGet(normalized, 'favoringFactors', null) || data.marketability.factorsFavouringExtraPotential;
        normalized.negativeFactors = safeGet(normalized, 'negativeFactors', null) || data.marketability.negativeFactorsAffectingValue;
    }

    // 23. Extract from signatureReport
    if (data.signatureReport) {
        normalized.valuationPlace = safeGet(normalized, 'valuationPlace', null) || data.signatureReport.place;
        normalized.valuationDate = safeGet(normalized, 'valuationDate', null) || data.signatureReport.signatureDate;
        normalized.valuersName = safeGet(normalized, 'valuersName', null) || data.signatureReport.signerName;
        normalized.reportDate = safeGet(normalized, 'reportDate', null) || data.signatureReport.reportDate;
    }

    // 24. Extract from additionalFlatDetails
    if (data.additionalFlatDetails) {
        normalized.areaUsage = safeGet(normalized, 'areaUsage', null) || data.additionalFlatDetails.areaUsage;
        normalized.carpetArea = normalized.carpetArea || data.additionalFlatDetails.carpetAreaFlat;
    }

    // 25. Extract from guidelineRate
    if (data.guidelineRate) {
        normalized.guidelineRate = safeGet(normalized, 'guidelineRate', null) || data.guidelineRate.guidelineRatePerSqm;
    }

    // 26. Extract images (preserve as arrays)
    normalized.propertyImages = normalized.propertyImages || data.propertyImages || [];
    normalized.locationImages = normalized.locationImages || data.locationImages || [];
    normalized.documentPreviews = normalized.documentPreviews || data.documentPreviews || [];

    // 27. Extract document fields with correct priority
    if (data.documentsProduced) {
        normalized.agreementForSale = normalized.agreementForSale || data.documentsProduced.photocopyCopyAgreement;
        normalized.commencementCertificate = normalized.commencementCertificate || data.documentsProduced.commencementCertificate;
        normalized.occupancyCertificate = normalized.occupancyCertificate || data.documentsProduced.occupancyCertificate;
    }

    // 28. Extract from pdfDetails for documents (only if not set)
    if (data.pdfDetails) {
        normalized.agreementForSale = normalized.agreementForSale || data.pdfDetails.agreementForSale || data.pdfDetails.agreementSaleExecutedName;
        normalized.commencementCertificate = normalized.commencementCertificate || data.pdfDetails.commencementCertificate;
        normalized.occupancyCertificate = normalized.occupancyCertificate || data.pdfDetails.occupancyCertificate;
    }

    // 29. Extract from agreementForSale nested object
    if (data.agreementForSale?.agreementForSaleExecutedName) {
        normalized.agreementForSale = normalized.agreementForSale || data.agreementForSale.agreementForSaleExecutedName;
    }

    // 30. Root level document fields (last resort)
    normalized.agreementForSale = normalized.agreementForSale || data.agreementForSale;
    normalized.commencementCertificate = normalized.commencementCertificate || data.commencementCertificate;
    normalized.occupancyCertificate = normalized.occupancyCertificate || data.occupancyCertificate;

    return normalized;
};

export function generateValuationReportHTML(data = {}) {
    // Normalize data structure first - flatten nested MongoDB objects
    const normalizedData = normalizeDataForPDF(data);

    // Debug logging to verify data is being received
    ('🔍 PDF Data Received:', {
        hasData: !!data,
        uniqueId: data?.uniqueId,
        clientName: data?.clientName,
        normalizedKeys: Object.keys(normalizedData).length
    });

    // Start with ONLY normalized data (eliminate redundant root merge)
    let pdfData = normalizedData;

    // Flatten pdfDetails into root level ONLY for fields not already set
    if (data?.pdfDetails && typeof data.pdfDetails === 'object') {
        const preservedPropertyImages = pdfData.propertyImages;
        const preservedLocationImages = pdfData.locationImages;
        const preservedDocumentPreviews = pdfData.documentPreviews;

        // Only merge fields from pdfDetails that aren't already in normalized data
        Object.keys(data.pdfDetails).forEach(key => {
            if (pdfData[key] === undefined || pdfData[key] === null || pdfData[key] === 'NA') {
                pdfData[key] = data.pdfDetails[key];
            }
        });

        // Restore image arrays (they should NOT be overwritten)
        if (preservedPropertyImages) pdfData.propertyImages = preservedPropertyImages;
        if (preservedLocationImages) pdfData.locationImages = preservedLocationImages;
        if (preservedDocumentPreviews) pdfData.documentPreviews = preservedDocumentPreviews;
    }

    // Flatten facilities object if it exists
    if (data?.facilities && typeof data.facilities === 'object') {
        Object.keys(data.facilities).forEach(key => {
            if (pdfData[key] === undefined || pdfData[key] === null) {
                pdfData[key] = data.facilities[key];
            }
        });
    }

    // Minimal field aliasing for template compatibility (no duplicate mappings)
    // The normalized function already handles all data extraction properly
    const aliasFields = {
        plotNo: ['plotSurveyNo'],
        tsNoVillage: ['tpVillage'],
        layoutIssueDate: ['layoutPlanIssueDate'],
        mapVerified: ['authenticityVerified'],
        valuersComments: ['valuerCommentOnAuthenticity'],
        urbanType: ['urbanClassification'],
        jurisdictionType: ['governmentType'],
        enactmentCovered: ['govtEnactmentsCovered'],
        extentUnit: ['extent', 'extentOfUnit'],
        apartmentMunicipality: ['apartmentVillageMunicipalityCounty'],
        localityDescription: ['descriptionOfLocalityResidentialCommercialMixed'],
        yearConstruction: ['yearOfConstruction'],
        structureType: ['typeOfStructure'],
        qualityConstruction: ['qualityOfConstruction'],
        buildingAppearance: ['appearanceOfBuilding'],
        buildingMaintenance: ['maintenanceOfBuilding'],
        classificationPosh: ['unitClassification'],
        compositeRateAnalysis: ['comparableRate'],
        newConstructionRate: ['adoptedBasicCompositeRate'],
    };

    // Apply aliases (only if primary field is not set)
    Object.entries(aliasFields).forEach(([primary, aliases]) => {
        if (!pdfData[primary]) {
            for (const alias of aliases) {
                if (pdfData[alias]) {
                    pdfData[primary] = pdfData[alias];
                    break;
                }
            }
        }
    });

    // Extract address value if needed
    if (pdfData.postalAddress && typeof pdfData.postalAddress === 'object') {
        pdfData.postalAddress = extractAddressValue(pdfData.postalAddress);
    }

    // Boolean conversions for checkboxes (using safeGet for proper Yes/No)
    const booleanFields = [
        'residentialArea', 'commercialArea', 'industrialArea',
        'facilityLift', 'facilityWater', 'facilitySump', 'facilityParking',
        'facilityCompoundWall', 'facilityPavement', 'facilityOthers',
        'compoundWall', 'pavement'
    ];

    booleanFields.forEach(field => {
        if (pdfData[field] !== undefined && pdfData[field] !== null) {
            pdfData[field] = safeGet(pdfData, field);
        }
    });

    // Debug: Log critical fields
    ('📋 PDF Ready:', {
        uniqueId: pdfData.uniqueId,
        clientName: pdfData.clientName,
        city: pdfData.city,
        carpetArea: pdfData.carpetArea,
        fairMarketValue: pdfData.fairMarketValue
    });

    // Calculate total valuation items if not provided
    if (!pdfData.totalValuationItems || pdfData.totalValuationItems === 'NA') {
        let total = 0;
        const valuationFields = [
            'presentValue', 'wardrobes', 'showcases', 'kitchenArrangements',
            'superfineFinish', 'interiorDecorations', 'electricityDeposits',
            'collapsibleGates', 'potentialValue', 'otherItems'
        ];

        valuationFields.forEach(field => {
            const value = pdfData[field];
            if (value && value !== 'NA' && value !== 'Nil') {
                const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
                if (!isNaN(num)) total += num;
            }
        });

        if (total > 0) {
            pdfData.totalValuationItems = Math.round(total).toLocaleString('en-IN');
            pdfData.totalValuationItemsWords = numberToWords(Math.round(total)) + ' ONLY';
        }
    } else {
        // Generate words for existing total if not already provided
        if (!pdfData.totalValuationItemsWords || pdfData.totalValuationItemsWords === 'NA') {
            const num = parseFloat(String(pdfData.totalValuationItems).replace(/[^0-9.-]/g, ''));
            if (!isNaN(num)) {
                pdfData.totalValuationItemsWords = numberToWords(Math.round(num)) + ' ONLY';
            }
        }
    }

    // Generate word representations for all valuation values
    const valueFields = {
        fairMarketValue: 'fairMarketValueWords',
        realisableValue: 'realisableValueWords',
        distressValue: 'distressValueWords',
        agreementValue: 'agreementValueWords',
        valueCircleRate: 'valueCircleRateWords',
        insurableValue: 'insurableValueWords'
    };

    Object.entries(valueFields).forEach(([valueField, wordField]) => {
        const value = pdfData[valueField];
        if (value && value !== 'NA' && value !== 'Nil' && (!pdfData[wordField] || pdfData[wordField] === 'NA')) {
            const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
            if (!isNaN(num) && num > 0) {
                pdfData[wordField] = 'Rupees ' + numberToWords(Math.round(num)) + ' Only';
            }
        }
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Valuation Report</title>
  <style>
    /* ====== PAGE SETTINGS ====== */
    @page {
      size: A4;
      margin: 12mm;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { height: 100%; }
    body { 
      font-family: 'Arial', sans-serif; 
      font-size: 12pt; 
      line-height: 1.2; 
      color: #000;
      margin: 0;
      padding: 0;
      background: white;
    }

    /* ====== SINGLE OUTER BORDER ====== */
    .pdf-page {
      border: 1.5px solid #000;
      padding: 8mm;
      min-height: 270mm;
      box-sizing: border-box;
      page-break-after: always;
    }

    /* ====== TABLE FIX (NO DOUBLE BORDER) ====== */
    table {
      width: 100%;
      border-collapse: collapse;
      border: none !important;
    }

    /* ONLY CELL BORDERS */
    td, th {
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
      padding: 6px;
      vertical-align: top;
      font-size: 10pt;
      background-color: #ffffff !important;
    }

    /* REMOVE EXTRA TABLE BORDER */
    table table {
      border: none !important;
    }

    /* FIX TABLES WITH BORDER NONE ATTRIBUTES */
    table[style*="border:none"],
    table[style*="border: none"],
    table[style*="border:0"],
    table[style*="border: 0"] {
      border: 1px solid #000 !important;
    }

    /* PAGE BREAK SAFETY */
    tr, td {
      page-break-inside: avoid;
    }

    /* HEADINGS */
    .section-title {
      font-weight: bold;
      font-size: 13pt;
      margin: 10px 0 6px;
    }
    .continuous-wrapper {
      page-break-after: auto !important;
      page-break-inside: auto !important;
    }

    .page { 
      page-break-after: auto !important;
      page-break-before: always !important;
      break-after: page !important;
      break-before: page !important;
      padding: 12mm;
      background: white; 
      width: 210mm;
      overflow: visible !important;
      display: block !important;
      clear: both !important;
      margin: 0 !important;
      page-break-inside: avoid !important;
    }

   .form-table {
   width: 100%;
   border-collapse: separate;
   border-spacing: 0;
   table-layout: fixed;
   }

    .form-table.fixed-cols {
      table-layout: fixed;
    }

    .form-table tbody {
      display: table-row-group;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .form-table tr {
      height: auto;
      page-break-inside: avoid;
      break-inside: avoid;
      display: table-row;
    }

    .form-table tr:first-child {
      height: auto;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .form-table.compact tr {
      height: auto;
      min-height: 18px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .form-table.compact td {
      padding: 3px 4px;
      min-height: 18px;
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }

    .form-table td {
      border: 1px solid #000;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
      padding: 6px;
      vertical-align: top;
      color: #000;
      background: white;
      page-break-inside: avoid;
      break-inside: avoid;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: visible;
      height: auto;
      font-weight: normal;
      font-size: 12pt;
    }

    .form-table tr:first-child td {
      border: 1px solid #000;
      min-height: 32px;
      height: 32px;
      padding: 5px 8px;
      vertical-align: middle;
    }

    .form-table .row-num {
      width: 6%;
      min-width: 8%;
      max-width: 8%;
      text-align: center;
      font-weight: normal;
      background: #ffffff;
      padding: 6px 4px;
      vertical-align: top;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: visible;
      height: auto;
      font-size: 12pt;
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }

    .form-table .label {
      width: 44%;
      min-width: 42%;
      max-width: 42%;
      font-weight: normal;
      background: #ffffff;
      word-wrap: break-word;
      overflow-wrap: break-word;
      vertical-align: top;
      padding: 8px 12px;
      white-space: normal;
      page-break-inside: avoid;
      break-inside: avoid;
      height: auto;
      word-break: break-word;
      overflow: visible;
      font-size: 12pt;
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }

    .form-table .value {
      width: 50%;
      min-width: 50%;
      max-width: 50%;
      text-align: left;
      background: white;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      vertical-align: top;
      padding: 8px 12px;
      white-space: normal;
      page-break-inside: avoid;
      break-inside: avoid;
      height: auto;
      overflow: visible;
      font-weight: normal;
      font-size: 12pt;
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }

    .header { 
      text-align: center; 
      margin-bottom: 15px; 
      font-weight: bold;
      font-size: 12pt;
    }

    /* 4-column table support for boundaries */
    .form-table.four-col td {
      padding: 8px 12px;
      vertical-align: top;
      color: #000;
      background: white;
      page-break-inside: avoid;
      break-inside: avoid;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: visible;
      height: auto;
      border: 1px solid #000;
    }

    .form-table.four-col .row-num {
      width: 10%;
      min-width: 10%;
      max-width: 10%;
      border: 1px solid #000;
    }

    .form-table.four-col .label {
      width: 40%;
      min-width: 40%;
      max-width: 40%;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto;
      overflow: visible;
      vertical-align: top;
      border: 1px solid #000;
    }

    .form-table.four-col .deed {
      width: 25%;
      min-width: 25%;
      max-width: 25%;
      text-align: center;
      font-weight: normal;
      font-size: 12pt;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto;
      overflow: visible;
      vertical-align: top;
      padding: 8px 12px;
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }

    .form-table.four-col .actual {
      width: 25%;
      min-width: 25%;
      max-width: 25%;
      text-align: center;
      font-weight: normal;
      font-size: 12pt;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto;
      overflow: visible;
      vertical-align: top;
      padding: 8px 12px;
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }

    /* Standalone deed and actual for non-four-col tables */
    .form-table .deed {
      width: 25%;
      min-width: 25%;
      max-width: 25%;
      text-align: center;
      font-weight: normal;
      font-size: 12pt;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto;
      overflow: visible;
      vertical-align: top;
      padding: 8px 12px;
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }

    .form-table .actual {
      width: 25%;
      min-width: 25%;
      max-width: 25%;
      text-align: center;
      font-weight: normal;
      font-size: 12pt;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto;
      overflow: visible;
      vertical-align: top;
      padding: 8px 12px;
      border: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }

    /* For rows with deed/actual columns, label should be narrower */
    tr:has(td.deed) .label,
    tr:has(td.actual) .label {
      width: 34%;
      min-width: 34%;
      max-width: 34%;
    }
  </style>
</head>
<body>

<div class="continuous-wrapper">
  <!-- PAGE 1: HEADER -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
      <p style="font-size: 16pt; font-weight: bold; margin: 0;">VAILUATION REPORT</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 12pt;">
      <tr>
        <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #ffffff;">A/C Name/ Borrower Name</td>
        <td style="border: 1px solid #000; padding: 8px; background-color: #ffffff;">${pdfData.accountName || pdfData.clientName || pdfData.ownerNameAddress || 'NA'}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #ffffff;">Name of Owner</td>
        <td style="border: 1px solid #000; padding: 8px; background-color: #ffffff;">${pdfData.ownerNameAddress || pdfData.accountName || 'NA'}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #ffffff;">Property Details</td>
        <td style="border: 1px solid #000; padding: 8px; background-color: #ffffff;">${pdfData.briefDescriptionProperty || 'NA'}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #ffffff;">Property Address / Location</td>
        <td style="border: 1px solid #000; padding: 8px; background-color: #ffffff;">${pdfData.postalAddress || 'NA'}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #ffffff;">Client</td>
        <td style="border: 1px solid #000; padding: 8px; background-color: #ffffff;">${pdfData.client || pdfData.branch || 'NA'}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #ffffff;">Purpose of Valuation</td>
        <td style="border: 1px solid #000; padding: 8px; background-color: #ffffff;">${pdfData.valuationPurpose || 'NA'}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #ffffff;">Date of Valuation</td>
        <td style="border: 1px solid #000; padding: 8px; background-color: #ffffff;">${formatDate(pdfData.dateOfValuation) || pdfData.valuationDate || 'NA'}</td>
      </tr>
    </table>
    
    <!-- Bank Image below table -->
    <div class="image-container" style="text-align: center; margin: 25px 0; margin-bottom: 20px;">
      <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGBgXFhcYGBgaGBcYGBYXGBcYHiggGBolHRgXITEiJSkrLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGy0lHyYtKy0tLS0tLS0tLS8vLS0tLS0tLS0tLS0tLS8rLS0vLS4tLS0uLS0tLS0tKy8tLy0tNf/AABEIAMABBgMBIgACEQED..." alt="Bank Building Image" style="max-width: 90%; height: auto; max-width: 500px; display: block; margin: 0 auto; border: none; background: #f5f5f5; padding: 10px;" class="pdf-image" crossorigin="anonymous" loading="eager" />
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yamuna chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 1 of 24</p>
    </div>
  </div>

  <!-- PAGE 2: VALUED PROPERTY AT A GLANCE -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="text-align: center; margin: 15px 0;">
      <p style="font-size: 14pt; font-weight: bold; margin: 0;">VALUED PROPERTY AT A GLANCE WITH VALUATION CERTIFICATE</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Applicant</td>
        <td style="border: 1px solid #000; padding: 6px;">State Bank of India, SME Law Garden Branch, Ahmedabad</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Valuation done by Govt. Approved Valuer</td>
        <td style="border: 1px solid #000; padding: 6px;">IBBI Regd. Govt. Approved Valuer & Bank's Panel Valuer</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Purpose of Valuation</td>
        <td style="border: 1px solid #000; padding: 6px;">To ascertain fair market value for Continue Financial Assistance Purposes. (My opinion for the probable value of the property only)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Name of Owner/Owners</td>
        <td style="border: 1px solid #000; padding: 6px;">M/s. Actymo Pvt. Ltd.</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Address of property under valuation</td>
        <td style="border: 1px solid #000; padding: 6px;">Plot No. DP-39/2 + DP-40, Opp. Associated Dystuff, B/s. R K Synthesis, Saykha- GIDC, Ta. Vagra, Dist. Bharuch – 392140.</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Brief description of the Property</td>
        <td style="border: 1px solid #000; padding: 6px;">The property is an Industrial Land with RCC Building Constructed in GIDC – Saykha, Abutting to Internal Road of GIDC. Which is Higher Middle Class Area, many Large scaled Industrial Chemical Plants are developed. Potential area for Chemical Plants. Heavy duty Industrial RCC building under finishing stage, for</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Revenue details as per Sale deed / Authenticate Documents</td>
        <td style="border: 1px solid #000; padding: 6px;">Survey No: 155/Paiki, Khata No. 447, Old Account No. 350 & 349, Mouje: Lodariyal, Taluka: Sanand, District: Ahmedabad.</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Area of Land</td>
        <td style="border: 1px solid #000; padding: 6px;">As per Sale Deed: Total Plot Area = 13873 sq.mt i.e. 16,592.10 sq. yd</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Value of Land</td>
        <td style="border: 1px solid #000; padding: 6px;">= 16592.10 sq. yd x 0,000.00 = ₹ 00,00,00,000.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Area of Construction</td>
        <td style="border: 1px solid #000; padding: 6px;">For Construction Area Please Refer Anexure-1</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Value of Construction</td>
        <td style="border: 1px solid #000; padding: 6px;">For Construction Area Please Refer Anexure-1 ₹ 0,00,00,000.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">TOTAL MARKET VALUE OF THE PROPERTY</td>
        <td style="border: 1px solid #000; padding: 6px;">₹ 00,00,000/- ( In words)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">REALISABLE VALUE (85% of MV)</td>
        <td style="border: 1px solid #000; padding: 6px;">₹ 00,00,000/- ( In words)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">DISTRESS SALE VALUE (70% of MV)</td>
        <td style="border: 1px solid #000; padding: 6px;">₹ 00,00,000/- ( In words)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">JANTRI VALUE OF PROPERTY</td>
        <td style="border: 1px solid #000; padding: 6px;">₹ 00,00,000/- ( In words)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">INSURABLE VALUE OF THE PROPERTY</td>
        <td style="border: 1px solid #000; padding: 6px;">₹ 00,00,000/- ( In words)</td>
      </tr>
    </table>
    
    <div style="margin-top: 20px;">
      <p style="margin: 0;">Date: 21/09/2024</p>
      <p style="margin: 0;">Place: Ahmedabad</p>
      <p style="margin: 10px 0 0 0;">Rajesh Ganatra</p>
      <p style="margin: 0;">Govt. Registered Valuer</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779.</p>
      <p style="margin: 2px 0;"><strong>Email:</strong> rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021raikot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 2 of 24</p>
    </div>
  </div>

  <!-- PAGE 3: VALUATION REPORT (PART 1) -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="margin-bottom: 15px;">
      <p style="margin: 0;"><strong>To,</strong></p>
      <p style="margin: 0;">State Bank of India,</p>
      <p style="margin: 0;">SME Law Garden Branch,</p>
      <p style="margin: 0;">Ahmedabad.</p>
    </div>
    
    <div style="text-align: center; margin: 10px 0;">
      <p style="font-size: 14pt; font-weight: bold; margin: 0;">VALUATION REPORT</p>
    </div>
    
    <table class="form-table" style="width: 100%; border-collapse: collapse; font-size: 11pt;">
      <tr>
        <td class="row-num">I.</td>
        <td class="label"><strong>GENERAL</strong></td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num">1.</td>
        <td class="label">Purpose for which the valuation is made</td>
        <td class="value">Continue Financial Assistance Purpose</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">a) Date of inspection</td>
        <td class="value">21/09/2024</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">b) Date on which the valuation is made</td>
        <td class="value">21/09/2024</td>
      </tr>
      <tr>
        <td class="row-num">2.</td>
        <td class="label"><strong>List of documents produced for perusal</strong></td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">i) Conveyance Deed</td>
        <td class="value">Deed no.: BAVLA – 4654 – 2018, Date: 28/11/2018</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">ii) Sale Certificate</td>
        <td class="value">Deed No. 16534, SND, Dated: 06/10/2021.</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">iii) NA Latter</td>
        <td class="value">MASAI/JAMAN/2/(V)/1108, Year-1986.</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">iv) Industrial Health & Safety Plan</td>
        <td class="value">No. 393, Dated: 25/06/2013, Approved by Industrial Safety & Health Ahmedabad Regional.</td>
      </tr>
      <tr>
        <td class="row-num">4.</td>
        <td class="label">Name of the owner(s) and his / their address (es) with Phone no. (details of share of each owner in case of joint ownership)</td>
        <td class="value">M/s. Mangalam Global Enterprise Ltd. New Survey No: 155/paiki, "Mangalam Global Enterprise Limited", Bavla sanand Road,Nr. Madhuram Industry, Lodariyal, Bavla, Ahmedabad-382220.</td>
      </tr>
      <tr>
        <td class="row-num">5.</td>
        <td class="label">Brief description of the property (including leasehold / freehold etc.)</td>
        <td class="value">The property is an Industrial Building Constructed in Lodariyal Village, Abutting to Bavla Sanand Road and Located Near Madhuram Industry. Which is Middle Class Area, many Agriculture Land is Available in Surrounding Area. Also, Industrial Units, Factories are developed, Road is known as Bavla-Sanand Road, one of the Middle developed Industrial Area, potential area, all common public amenities are developed.</td>
      </tr>
      <tr>
        <td class="row-num">6.</td>
        <td class="label"><strong>Location of property</strong></td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">a) Plot No. / Survey No.</td>
        <td class="value">Survey No: 155/Paiki, Khata No. 447, Old Account No. 350 & 349, Mouje: Lodariyal, Taluka: Sanand, District: Ahmedabad.</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">b) Door No.</td>
        <td class="value">Survey No. 155/Paiki</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">c) T. S. No. / Village</td>
        <td class="value">Lodariyal</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">d) Ward / Taluka</td>
        <td class="value">Sanand</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">e) Mandal / District</td>
        <td class="value">Ahmedabad</td>
      </tr>
      <tr>
        <td class="row-num">7.</td>
        <td class="label">Postal address of the property</td>
        <td class="value">New Survey No: 155/paiki, "Mangalam Global Enterprise Limited", Bavla sanand Road,Nr. Madhuram Industry, Lodariyal, Bavla, Ahmedabad-382220.</td>
      </tr>
    </table>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yamuna chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 3 of 24</p>
    </div>
  </div>

  <!-- PAGE 4: VALUATION REPORT (PART 2) -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <table class="form-table" style="width: 100%; border-collapse: collapse; font-size: 11pt;">
      <tr>
        <td class="row-num">8.</td>
        <td class="label">City / Town</td>
        <td class="value">Lodariyal Village Area</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">Residential Area</td>
        <td class="value">No</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">Commercial Area</td>
        <td class="value">No</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">Industrial Area</td>
        <td class="value">Yes</td>
      </tr>
      <tr>
        <td class="row-num">9.</td>
        <td class="label">Classification of the area</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">i) High / Middle / Poor</td>
        <td class="value">Middle class</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">ii) Urban / Semi Urban / Rural</td>
        <td class="value">Rural Area</td>
      </tr>
      <tr>
        <td class="row-num">10</td>
        <td class="label">Coming under Corporation limit / Village Panchayat / Municipality</td>
        <td class="value">Gram Panchayat</td>
      </tr>
      <tr>
        <td class="row-num">11</td>
        <td class="label">Whether covered under any State / Central Govt. enactments (e.g., Urban Land Ceiling Act) or notified under agency area / scheduled area / cantonment area</td>
        <td class="value">Please refer Title Report.</td>
      </tr>
      <tr>
        <td class="row-num">12a</td>
        <td class="label">Boundaries of the property:</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">As per Conveyance Deed : As per Visit</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">East</td>
        <td class="value">Survey no. 155 Paiki Open Land</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">West</td>
        <td class="value">Road for Ganesh Industries Margin then Road</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">North</td>
        <td class="value">By Canal Margin, Canal, Madhuram Industries</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">South</td>
        <td class="value">Land of Bhavubhai Margin then Other Industries</td>
      </tr>
      <tr>
        <td class="row-num">13</td>
        <td class="label"><strong>Dimensions of the site</strong></td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">A</td>
        <td class="value">As per the Deed</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">North :</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">South :</td>
        <td class="value">As per approved plan</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">East :</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">West :</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num">14.2</td>
        <td class="label">Latitude, Longitude and Coordinates of the site</td>
        <td class="value">Latitude: 22.857556, Longitude: 72.366556</td>
      </tr>
      <tr>
        <td class="row-num">15</td>
        <td class="label">Extent of the site</td>
        <td class="value">As per Sale Deed: Total Plot Area = 13,873 sq.mt For Construction Area Please Refer Anexure -1</td>
      </tr>
      <tr>
        <td class="row-num">16</td>
        <td class="label">Extent of the site considered for valuation (least of 14 A & 14 B)</td>
        <td class="value">As per Sale Deed: Total Plot Area = 13,873 sq.mt</td>
      </tr>
    </table>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 4 of 24</p>
    </div>
  </div>

  <!-- PAGE 5: VALUATION REPORT (PART 3) -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <table class="form-table" style="width: 100%; border-collapse: collapse; font-size: 11pt;">
      <tr>
        <td class="row-num">17</td>
        <td class="label">Whether occupied by the owner / tenant? If occupied by tenant, since how long? Rent Received per month.</td>
        <td class="value">Property is Owner Occupied.</td>
      </tr>
      <tr>
        <td class="row-num">II</td>
        <td class="label"><strong>CHARACTERISTICS OF THE SITE</strong></td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num">1.</td>
        <td class="label">Classification of locality</td>
        <td class="value">Middle class</td>
      </tr>
      <tr>
        <td class="row-num">2.</td>
        <td class="label">Development of surrounding areas</td>
        <td class="value">Surrounding area is an Agriculture land</td>
      </tr>
      <tr>
        <td class="row-num">3.</td>
        <td class="label">Possibility of frequent flooding / sub-merging</td>
        <td class="value">No.</td>
      </tr>
      <tr>
        <td class="row-num">4.</td>
        <td class="label">Feasibility to the Civic amenities like school, hospital, bus stop, market etc.</td>
        <td class="value">available within 10-15 km</td>
      </tr>
      <tr>
        <td class="row-num">5.</td>
        <td class="label">Level of land with topographical conditions</td>
        <td class="value">levelled</td>
      </tr>
      <tr>
        <td class="row-num">6.</td>
        <td class="label">Shape of land</td>
        <td class="value">Irregular Shape</td>
      </tr>
      <tr>
        <td class="row-num">7.</td>
        <td class="label">Type of use to which it can be put</td>
        <td class="value">Use for Industrial Purpose Only</td>
      </tr>
      <tr>
        <td class="row-num">8.</td>
        <td class="label">Any usage restriction</td>
        <td class="value">Land is use For Industrial Purpose only.</td>
      </tr>
      <tr>
        <td class="row-num">9.</td>
        <td class="label">Is plot in town planning approved layout?</td>
        <td class="value">Approved Layout Plan from Concerned authority is not available</td>
      </tr>
      <tr>
        <td class="row-num">10</td>
        <td class="label">Corner plot or intermittent plot?</td>
        <td class="value">Intermittent Unit</td>
      </tr>
      <tr>
        <td class="row-num">11</td>
        <td class="label">Road facilities</td>
        <td class="value">Yes</td>
      </tr>
      <tr>
        <td class="row-num">12</td>
        <td class="label">Type of road available at present</td>
        <td class="value">Bitumen Road</td>
      </tr>
      <tr>
        <td class="row-num">13</td>
        <td class="label">Width of road – is it below 20 ft. or more than 20 ft.</td>
        <td class="value"><20ft wide</td>
      </tr>
      <tr>
        <td class="row-num">14</td>
        <td class="label">Is it a land – locked land?</td>
        <td class="value">No.</td>
      </tr>
      <tr>
        <td class="row-num">15</td>
        <td class="label">Water potentiality</td>
        <td class="value">Yes</td>
      </tr>
      <tr>
        <td class="row-num">16</td>
        <td class="label">Underground sewerage system</td>
        <td class="value">Yes, Underground Sewerage systems are developed, and connects to public sewerage system</td>
      </tr>
      <tr>
        <td class="row-num">17</td>
        <td class="label">Is power supply available at the site?</td>
        <td class="value">Yes</td>
      </tr>
      <tr>
        <td class="row-num">18</td>
        <td class="label">Advantage of the site</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">1.</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">2.</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">Special remarks:</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">1.</td>
        <td class="value">No.</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">2.</td>
        <td class="value">No.</td>
      </tr>
    </table>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 5 of 24</p>
    </div>
  </div>

  <!-- PAGE 6: VALUATION OF LAND -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="margin-bottom: 10px; font-weight: bold;">
      <p>Part – A (Valuation of land)</p>
    </div>
    
    <table class="form-table" style="width: 100%; border-collapse: collapse; font-size: 11pt;">
      <tr>
        <td class="row-num">1.</td>
        <td class="label">Size of plot</td>
        <td class="value">As per Sale Deed: Total Plot Area = 13,873 sq.mt</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">North & South</td>
        <td class="value">As per Approved Plan</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">East & West</td>
        <td class="value">As per Approved Plan</td>
      </tr>
      <tr>
        <td class="row-num">2.</td>
        <td class="label">Total extent of the plot</td>
        <td class="value">As per Sale Deed: Total Plot Area = 13,873 sq.mt</td>
      </tr>
      <tr>
        <td class="row-num">3.</td>
        <td class="label">Prevailing market rate (Along with details /reference of at least two latest deals/transactions with respect to adjacent properties in the areas)</td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num">4.</td>
        <td class="label">Guideline rate obtained from the Registrar's Office (an evidence thereof to be enclosed)</td>
        <td class="value"></td>
      </tr>
    </table>
    
    <div style="margin-top: 10px; font-size: 9pt; line-height: 1.3;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021raikot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yamuna chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 6 of 24</p>
    </div>
  </div>

  <!-- PAGE 7: GUIDELINE RATE ANALYSIS -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India"</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
      <p style="margin: 2px 0;">Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>b.</strong> Being this the situation, it has been observed that sale deeds are executed at lower price of Jantri rates to save registration charges / stamp duty. So these instances does not reflect actual transaction amount / market rate. Moreover now days, in actual market, transactions are done on super built-p area, whereas guideline value (Jantri rate) is based on carpet area. Both the areas have difference of about 40-50% This also makes difference between two values.</p>
      <p><strong>c.</strong> In present system certain value zones are established at macro levels, but within the same value zone the land prices of all the plots cannot be same. There are certain negative / positive factors, which are attached to any parcel of land, like width of the road on which a plot abuts, frontage to depth ratio, adjoining slum or hutments, title of the property, certain religious & sentimental factors, proximity to high tension electricity supply lines, crematorium, socio-economic pattern, stage of infrastructure, development etc. whereas guideline rate are prescribes as uniform rates for particular FP/Zone.</p>
      <p><strong>d.</strong> Property/land/flat on the main road in any area is priced higher and should be valued higher than that in interiors, whereas guideline rate considered them all with equal perspective.</p>
      <p><strong>e.</strong> In real estate market, it has been observed that many type of values present in market like forced sale value, sentimental value, monopoly value etc. so it cannot be generalized, while guideline value (Jantri rate) considered them all with one value per zone.</p>
      <p><strong>f.</strong> Moreover two projects of two different builder having different reputation & quality work in same zone may fetch different values. Again guideline value (Jantri rate) considers them all as one.</p>
      <p><strong>g.</strong> Government policies also change the trends/values in real estate market, for example demonstration, GST etc. the real estate market reacts immediately for these policies for uptrend or downtrend. So this also affects the market rate heavily. While guideline rates remain same.</p>
      <p><strong>h.</strong> It may not be possible to have a method to fix guideline (Jantri rate) values without anomalies as each site has different characteristics. But it is always desired to revise guideline value (Jantri rate) at regular intervals</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001 (M) 9824 832 394, 8000 209 331 Email: rgvs2021raikot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yamuna chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 7 of 24</p>
    </div>
  </div>

  <!-- PAGE 8: VALUATION OF BUILDING -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>i.</strong> Recently in year 2023, Govt. has released Revised GR for Guideline rate calculation, Tharav No. 122023/20/H/1, Dt. 13/04/2023, as per that, various revision are mentioned in Land Rate for Residential land, Composite Rate for Office use and Shop Use, and Apartment use, Agriculture Land Use, etc. The GR is attached herewith</p>
    </div>
    
    <div style="margin-top: 10px; margin-bottom: 10px;">
      <p><strong>Details of last two transactions in the locality/area to be provided, if available.</strong></p>
      <p>Not available, please refer & considered above facts.</p>
    </div>
    
    <div style="margin-bottom: 10px; font-weight: bold;">
      <p>Part – B (Valuation of Building)</p>
    </div>
    
    <table class="form-table" style="width: 100%; border-collapse: collapse; font-size: 11pt;">
      <tr>
        <td class="row-num"></td>
        <td class="label"><strong>Technical details of the building</strong></td>
        <td class="value"></td>
      </tr>
      <tr>
        <td class="row-num">a)</td>
        <td class="label">Type of Building (Residential / Commercial / Industrial)</td>
        <td class="value">Industrial Shed</td>
      </tr>
      <tr>
        <td class="row-num">b)</td>
        <td class="label">Type of construction (Load bearing / RCC / Steel Framed)</td>
        <td class="value">RCC Structure, AC sheet roof, M.S.Door</td>
      </tr>
      <tr>
        <td class="row-num">c)</td>
        <td class="label">Year of construction</td>
        <td class="value">2013 (Approx.)</td>
      </tr>
      <tr>
        <td class="row-num">d)</td>
        <td class="label">Number of floors and height of each floor including basement, if any</td>
        <td class="value">GF+1 and Approx. 9mtr Building Height.</td>
      </tr>
      <tr>
        <td class="row-num">e)</td>
        <td class="label">Plinth area floor-wise</td>
        <td class="value">Please Refer Anexure-1</td>
      </tr>
      <tr>
        <td class="row-num">f)</td>
        <td class="label">Condition of the building</td>
        <td class="value">Old</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">i) Exterior – Excellent, Good, Normal, Poor</td>
        <td class="value">Normal</td>
      </tr>
      <tr>
        <td class="row-num"></td>
        <td class="label">ii) Inferior - Excellent, Good, Normal, Poor</td>
        <td class="value">Normal</td>
      </tr>
      <tr>
        <td class="row-num">g)</td>
        <td class="label">Date of issue and validity of layout of approved map / plan</td>
        <td class="value">No. 393, Dated: 25/06/2013, Approved by Industrial Safety & Health Ahmedabad Regional.</td>
      </tr>
      <tr>
        <td class="row-num">h)</td>
        <td class="label">Approved map / plan issuing authority</td>
        <td class="value">No. 393, Dated: 25/06/2013, Approved by Industrial Safety & Health Ahmedabad Regional.</td>
      </tr>
      <tr>
        <td class="row-num">i)</td>
        <td class="label">Whether genuineness or authenticity of approved map / plan is verified</td>
        <td class="value">Yes.</td>
      </tr>
      <tr>
        <td class="row-num">j)</td>
        <td class="label">Any other comments by our empaneled valuers on authentic of approved plan</td>
        <td class="value">No.</td>
      </tr>
    </table>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 8 of 24</p>
    </div>
  </div>

  <!-- PAGE 9: DETAILS OF VALUATION -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
      <p>+ Details of valuation</p>
    </div>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Part A: Market Value Analysis of Land</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-bottom: 15px;">
      <tr>
        <th style="border: 1px solid #000; padding: 4px;">No.</th>
        <th style="border: 1px solid #000; padding: 4px;">Plot</th>
        <th style="border: 1px solid #000; padding: 4px;">Area sq.yd</th>
        <th style="border: 1px solid #000; padding: 4px;">Rate</th>
        <th style="border: 1px solid #000; padding: 4px;">Total</th>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">1</td>
        <td style="border: 1px solid #000; padding: 4px;">Land Area</td>
        <td style="border: 1px solid #000; padding: 4px;">0,000.00</td>
        <td style="border: 1px solid #000; padding: 4px;">0,000/-</td>
        <td style="border: 1px solid #000; padding: 4px;">₹ 00,00,00,000.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;"></td>
        <td style="border: 1px solid #000; padding: 4px;"></td>
        <td style="border: 1px solid #000; padding: 4px;"></td>
        <td style="border: 1px solid #000; padding: 4px;">Say. R/O</td>
        <td style="border: 1px solid #000; padding: 4px;">₹ 00,00,00,000.00</td>
      </tr>
    </table>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Part B: Construction Cost Analysis – as per Actual Measurement --- Details always change according to property</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 15px;">
      <tr>
        <th style="border: 1px solid #000; padding: 3px;">Area Details</th>
        <th style="border: 1px solid #000; padding: 3px;">Area - SMT</th>
        <th style="border: 1px solid #000; padding: 3px;">Area - SYD</th>
        <th style="border: 1px solid #000; padding: 3px;">Rate per SYD</th>
        <th style="border: 1px solid #000; padding: 3px;">Value</th>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Security Room</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">24.84</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">29.70</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 7,650.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 2,27,205.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Labours Quarter</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">49.16</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">58.79</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,500.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 2,64,555.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Store Room</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">67.67</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">80.93</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 3,600.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 2,91,348.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Labours Quarter</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">77.48</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">92.66</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,500.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,16,970.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Gallery room</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">51.44</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">61.52</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 2,250.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 1,38,420.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">FF Labours Quarter</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">58.38</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">69.82</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,500.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 3,14,190.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">GF Room</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">19.85</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">23.74</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 1,17,513.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">GF Wash Room</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">20.26</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">24.23</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 2,250.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 54,517.50</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Office-1</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">93.36</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">111.65</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 10,800.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 12,05,820.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Wash Room</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">8.02</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">9.59</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 2,700.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 25,893.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Shed</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">47.33</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">56.60</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 1,350.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 76,410.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Office-2</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">75.66</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">90.49</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 10,800.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 9,77,292.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Shed-1</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">2,823.90</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">3,377.38</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 1,67,18,031.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Shed-2/Unit-1</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">227.16</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">271.68</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 13,44,816.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Shed-2/Unit-2</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">352.92</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">422.09</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 20,89,345.50</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;"></td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">226.05</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">270.36</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 13,38,282.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Open shed</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">107.53</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">128.60</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 1,350.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 1,73,610.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Godown</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">177.86</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">212.72</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 10,52,964.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Shed-3/Unit-1</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">501.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">599.19</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 29,65,990.50</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Shed-3/Unit-2</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">247.46</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">295.96</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 14,65,002.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;">Shed-3/Unit-3</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">107.79</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">128.92</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 4,950.00</td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;">₹ 6,38,154.00</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 3px;"><strong>TOTAL</strong></td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;"><strong>5,365.13</strong></td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;"><strong>6,416.62</strong></td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;"><strong>TOTAL</strong></td>
        <td style="border: 1px solid #000; padding: 3px; text-align: right;"><strong>₹ 3,18,96,328.50</strong></td>
      </tr>
    </table>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 9 of 24</p>
    </div>
  </div>

  <!-- PAGE 10: AMENITIES, MISCELLANEOUS, SERVICES -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Part - C (Extra Items) (Amount in Rs.)</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-bottom: 15px;">
      <tr>
        <td style="border: 1px solid #000; padding: 4px; width: 70%;">Portico</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Ornamental front door</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Sit out / Veranda with steel grills</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Overhead water tank</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Extra steel / collapsible gates</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;"><strong>Total</strong></td>
        <td style="border: 1px solid #000; padding: 4px;">: Considered in Construction Cost</td>
      </tr>
    </table>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Part - D (Amenities) (Amount in Rs.)</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-bottom: 15px;">
      <tr>
        <td style="border: 1px solid #000; padding: 4px; width: 70%;">Wardrobes</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Glazed tiles</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Extra sinks and bath tub</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Marble / ceramic tiles flooring</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Interior decorations</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Architectural elevation works</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Panelling works</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Aluminium works</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Aluminium hand rails</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">False ceiling</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;"><strong>Total</strong></td>
        <td style="border: 1px solid #000; padding: 4px;">Considered in Construction Cost.</td>
      </tr>
    </table>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Part - E (Miscellaneous) (Amount in Rs.)</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-bottom: 15px;">
      <tr>
        <td style="border: 1px solid #000; padding: 4px; width: 70%;">Separate toilet room</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Separate lumber room</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Separate water tank / sump</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Trees, gardening</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;"><strong>Total</strong></td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;"></td>
        <td style="border: 1px solid #000; padding: 4px;">Considered in Construction Cost.</td>
      </tr>
    </table>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Part - F (Services) (Amount in Rs.)</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
      <tr>
        <td style="border: 1px solid #000; padding: 4px; width: 70%;">Water supply arrangements</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Drainage arrangements</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Compound wall</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">C. B. deposits, fittings etc.</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Pavement</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;"><strong>Total</strong></td>
        <td style="border: 1px solid #000; padding: 4px;">Considered in Construction Cost.</td>
      </tr>
    </table>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 10 of 24</p>
    </div>
  </div>

  <!-- PAGE 11: TOTAL ABSTRACT AND APPROACHES -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Total abstract of the entire property</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-bottom: 15px;">
      <tr>
        <td style="border: 1px solid #000; padding: 4px; width: 70%;">Part -A Land</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Part -B Building</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Part -C Fixed Furniture</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Part -D Amenities</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Part -E Miscellaneous</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Part -F Services</td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;"><strong>Total</strong></td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;"><strong>Say</strong></td>
        <td style="border: 1px solid #000; padding: 4px;">:</td>
      </tr>
    </table>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Market Approach: (For Land Valuation):</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p>Sales Comparison Approach in our valuation report. The Sales Comparison Approach compares recently-sold local similar properties to the subject property. It is a process used to determine the current market value of a property based on recent sales of comparable properties in the area. We have attached the sale instance available online for the similar property herewith.</p>
    </div>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Cost Approach (For building valuation):</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p>The cost approach is a real estate valuation method that surmises that the price a buyer should pay for a piece of property should equal the cost to build an equivalent build or replacement cost of the building. In cost approach appraisal, the market price for the property is equal to the cost of land plus cost of construction, less depreciation. Hear we considered depreciated cost of building.</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 10px;">
      <p>As a result of my appraisal and analysis it is my considered opinion that the Present Market Value Of The Above Property in the prevailing condition with aforesaid specifications is ₹ 00,00,000/- ( In words)</p>
      <p>Realizable Value (85%) is ₹ 00,00,000/- ( In words)</p>
      <p>Distress Value (70%) is ₹ 00,00,000/- ( In words)</p>
      <p>Jantri Value is ₹ 00,00,000/- ( In words)</p>
    </div>
    
    <div style="margin-top: 20px;">
      <p>Date: - 21/09/2024</p>
      <p>Place: - Ahmedabad</p>
      <p>(Government Report)</p>
      <p>(Governmental Organization)</p>
    </div>
    
    <div style="margin-top: 15px; border-top: 1px solid #000; padding-top: 10px;">
      <p>The undersigned has inspected the property detailed in Valuation Report dated on 21/09/2024</p>
      <p>We are satisfied that the fair and reasonable market value of the property is ₹ 00,00,000/- ( In words)</p>
      <p style="margin-top: 10px;">Date: - 21/09/2024</p>
      <p>Place: - Ahmedabad</p>
      <p>(Branch Manager)</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001 (M) 9824 832 394, 8000 209 331 Email: rgvs2021raikot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 11 of 24</p>
    </div>
  </div>

  <!-- PAGE 12: CHECKLIST OF DOCUMENT -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
      <p>CHECKLIST OF DOCUMENT</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
      <tr>
        <th style="border: 1px solid #000; padding: 4px; text-align: left;">Document</th>
        <th style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</th>
        <th style="border: 1px solid #000; padding: 4px; text-align: center;">No</th>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Engagement Letter / Confirmation for Assignment</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Ownership Documents: Sale Deed / Conveyance Deed</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Adv. TCR / LSR</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Agreement For Sale / Bana khat</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Property Card</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Mortgage Deed</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Lease Deed</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Index – 2</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">VF: 7/12 in case of Land</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">NA order – mentioned in Sale deed, Title report</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Approved Layout Plan</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Commencement Letter</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">BU Permission</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Ele. Meter Photo</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Light Bill</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Muni. Tax Bill</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Numbering – Flat / bungalow / Plot No. / Identification on Site</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Boundaries of Property – Proper Demarcation</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Merged Property?</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Premise can be Separated, and Entrance / Door is available for the mortgaged property?</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">NA</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Land is Locked?</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Property is rented to Other Party</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">If Rented – Rent Agreement is Provided?</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Site Visit Photos</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Selfie with Owner / Identifier</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Mobile No.</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Data Sheet</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Tentative Rate</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Sale Instance / Local Inquiry / Verbal Survey</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Broker Recording</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">No</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">Past Valuation Rate</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: center;">—</td>
      </tr>
    </table>
    
    <div style="font-weight: bold; margin-top: 15px; margin-bottom: 10px;">
      <p>STANDARD OPERATING PROCEDURE (SOP)</p>
      <p>1 BANK GUIDELINES FOR VALUER</p>
      <p>2 www.donfimworld.io</p>
      <p>3 Taskval App for Assignment Management</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021raikot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 12 of 24</p>
    </div>
  </div>

  <!-- PAGE 13: SOP PREAMBLE -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
      <p>◆ PREAMBLE</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p>Bank valuers in India rely on Standard Operating Procedures (SOPs) for several good reasons. SOPs help ensure consistency in property valuations by providing a standardised approach. This results in uniformity in the valuation process across different regions and properties, reducing discrepancies and ensuring fair and objective valuations. Moreover, SOPs establish guidelines and best practices that bank valuers must follow to maintain high-quality and accurate valuations. This guarantees that the bank receives reliable valuations, reducing the risk of financial loss due to overvaluation or undervaluation.</p>
      <p>SOPs also assist valuers in complying with regulatory frameworks and guidelines set by regulatory authorities, such as the Reserve Bank of India (RBI) and the Securities and Exchange Board of India (SEBI). Valuers who adhere to SOPs lessen the risk of non-compliance and associated penalties. Furthermore, by following standardised procedures, valuers can identify and assess potential risks associated with property valuations, such as legal issues, property conditions, market trends, and encumbrances. This enables banks to make informed lending decisions, reducing the risk of default and protecting the interests of the institution and its customers.</p>
      <p>SOPs establish ethical guidelines and professional standards for bank valuers, promoting integrity, objectivity, and transparency in the valuation process. By adhering to SOPs, valuers demonstrate their commitment to upholding ethical practices, enhancing the credibility of the valuation profession and maintaining public trust. SOPs also serve as a valuable tool for training new bank valuers and providing ongoing professional development opportunities. They act as a reference guide, helping valuers accurately understand the step-by-step process of conducting valuations. SOPs also facilitate knowledge sharing and consistency among valuers, ensuring that the expertise and experience of senior professionals are passed down to newer members of the profession.</p>
      <p>In summary, SOPs are crucial for bank valuers in India as they promote consistency, maintain quality, ensure regulatory compliance, mitigate risks, uphold professionalism, and support training and development. By following these procedures, bank valuers can provide accurate and reliable property valuations, contributing to a robust banking system.</p>
    </div>
    
    <div style="text-align: center; font-weight: bold; margin: 15px 0 10px 0;">
      <p>◆ Standard Operating Procedure (SOP)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p>1. Receive a valuation request from the bank.</p>
      <p>2. Review the request thoroughly to understand the scope, purpose, and specific requirements of the valuation.</p>
      <p>3. Conduct a preliminary assessment of the property or asset to determine its feasibility for valuation.</p>
      <p>4. Gather all relevant data and information about the property or asset, including legal documents, title deeds, surveys, plans, and other necessary documents provided by the bank.</p>
      <p>5. Conduct an on-site inspection of the property or asset, taking photographs, measurements and noting essential details.</p>
      <p>6. Collect market data and research comparable properties or assets in the vicinity to establish a benchmark for valuation.</p>
      <p>7. Analyze the collected data and use appropriate valuation methods, such as the sales comparison approach, income approach, or cost approach, depending on the property or asset's nature.</p>
      <p>8. Prepare a comprehensive and detailed valuation report that includes all relevant information, assumptions made, methodologies used, and supporting evidence.</p>
      <p>9. Review the report meticulously for accuracy, completeness, and compliance with applicable valuation standards and guidelines.</p>
      <p>10. Submit the valuation report to the bank within the agreed-upon timeframe.</p>
      <p>11. Attend a meeting or provide additional clarification to the bank regarding the valuation report, if needed.</p>
      <p>12. Address any queries or requests for revision from the bank and make necessary amendments to the</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001 (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 13 of 24</p>
    </div>
  </div>

  <!-- PAGE 14: SOP CONTINUED AND OBSERVATIONS -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p>valuation report as per their feedback.</p>
      <p>13. Obtain final approval or acceptance of the valuation report from the bank.</p>
      <p>14. Maintain records of all valuation reports, documents, and communication-related to the valuation process for future reference and compliance purposes.</p>
      <p>15. Follow up with the bank regarding any outstanding payments or administrative formalities.</p>
      <p>While the process may differ based on the bank's specific requirements and the property or asset being evaluated, this flowchart is a solid foundation for all Banking Valuers in India to confidently and efficiently conduct valuations.</p>
    </div>
    
    <div style="text-align: center; font-weight: bold; margin: 15px 0 10px 0;">
      <p>Observations, Assumptions and Limiting Conditions</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.4;">
      <p><strong>-</strong> The Indian Real Estate market is currently facing a transparency issue. It is highly fragmented and lacks authentic and reliable data on market transactions. The actual transaction value often differs from the value documented in official transactions. To accurately represent market trends, we conducted a market survey among sellers, brokers, developers, and other market participants. This survey is crucial to determine fair valuation in this subject area. Based on our verbal survey, we have gained insights into the real estate market in the subject area.</p>
      <p><strong>-</strong> To conduct a proper valuation, we have made the assumption that the property in question possesses a title that is clear and marketable and that it is free from any legal or physical encumbrances, disputes, claims, or other statutory liabilities. Additionally, we have assumed that the property has received the necessary planning approvals and clearances from the local authorities and that it adheres to the local development control regulations.</p>
      <p><strong>-</strong> Please note that this valuation exercise does not cover legal title and ownership matters. Additionally, we have not obtained any legal advice on the subject property's title and ownership during this valuation. Therefore, we advise the client/bank to seek an appropriate legal opinion before making any decisions based on this report.</p>
      <p><strong>-</strong> We want to ensure that our valuation is fair and accurate. However, it's important to note that any legal, title, or ownership issues could have a significant impact on the value. If we become aware of any such issues at a later date, we may need to adjust our conclusions accordingly.</p>
      <p><strong>-</strong> Throughout this exercise, we have utilized information from various sources, including hardcopy, softcopy, email, documents, and verbal communication provided by the client. We have proceeded under the assumption that the information provided is entirely reliable, accurate, and complete. However, if it is discovered that the data we were given is not dependable, precise, or comprehensive, we reserve the right to revise our conclusions at a later time.</p>
      <p><strong>-</strong> Please note that the estimated market value of this property does not include transaction costs such as stamp duty, registration charges, and brokerage fees related to its sale or purchase.</p>
      <p><strong>-</strong> When conducting a subject valuation exercise, it is important to consider the market dynamics at the time of the evaluation. However, it is essential to note that any unforeseeable developments in the future may impact the valuation. Therefore, it is crucial to remain vigilant and adaptable in the face of changing circumstances.</p>
      <p><strong>-</strong> Kindly take note that the physical measurements and areas given are only approximations. The exact age of the property can only be determined based on the information obtained during inspection. Furthermore, the remaining economic lifespan is an estimate determined by our professional judgment.</p>
      <p><strong>-</strong> Please note that the valuation stated in this report is only applicable for the specific purposes mentioned therein. It is not intended for any other use and cannot be considered valid for any other purpose. The report should not be shared with any third party without our written permission. We cannot assume any responsibility for any third party who may receive or have access to this report, even if consent has been given.</p>
      <p><strong>-</strong> Having this report or any copy of it does not grant the privilege of publishing it. None of the contents in this</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779, Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001 (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 14 of 24</p>
    </div>
  </div>

  <!-- PAGE 15: OBSERVATIONS CONTINUED -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India"</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
      <p style="margin: 2px 0;">Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.4;">
      <p>report should be shared with third parties through advertising, public relations, news or any other communication medium without the written acceptance and authorization of VALUES.</p>
      <p><strong>-</strong> To assess the condition and estimate the remaining economic lifespan of the item, we rely on visual observations and a thorough review of maintenance, performance, and service records. It's important to note that we have not conducted any structural design or stability studies, nor have we performed any physical tests to determine the item's structural integrity and strength.</p>
      <p><strong>-</strong> The report was not accompanied by any soil analysis, geological or technical studies, and there were no investigations conducted on subsurface mineral rights, water, oil, gas, or other usage conditions.</p>
      <p><strong>-</strong> The asset was inspected, evaluated, and assessed by individuals who have expertise in valuing such assets. However, it's important to note that we do not make any assertions or assume responsibility for its compliance with health, safety, environmental, or other regulatory requirements that may not have been immediately apparent during our team's inspection.</p>
      <p><strong>-</strong> During the inspection, if the units were not named, we relied on identification by the owner or their representative and documents like the sale deed, light bill, plan, tax bill, the title for ownership, and boundaries of units. Without any accountability for the title of the units.</p>
      <p><strong>-</strong> Kindly be informed that the valuation report may require modifications in case unanticipated circumstances arise, which were not considered in the presumptions and restrictions specified in the report.</p>
      <p><strong>-</strong> Additional observations, assumptions, and any relevant limiting conditions are also disclosed in the corresponding sections of this report and its annexes.</p>
    </div>
    
    <div style="text-align: center; font-weight: bold; margin: 15px 0 10px 0;">
      <p>Our standard terms and conditions of professional engagement govern this report. They are outlined below:</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.4;">
      <p><strong>1.</strong> Valuers will be liable for any issues or concerns related to the Valuation and/or other Services provided. This includes situations where the cause of action is in contract, tort (including negligence), statute, or any other form. However, the total amount of liability will not exceed the professional fees paid to VALUES for this service.</p>
      <p><strong>2.</strong> VALUES and its partners, officers, and executives cannot be held liable for any damages, including consequential, incidental, indirect, punitive, exemplary, or special damages. This includes damages resulting from bad debts, non-performing assets, financial loss, malfunctions, delays, loss of data, interruptions of service, or loss of business or anticipated profits.</p>
      <p><strong>3.</strong> The Valuation Services, along with the Deliverables submitted by VALUES, are intended solely for the benefit of the parties involved. VALUES assumes no liability or responsibility towards any third party who utilizes or gains access to the Valuation or benefits from the Services.</p>
      <p><strong>4.</strong> VALUES and / or its Partners, Officers and Executives accept no responsibility for detecting fraud or misrepresentation, whether by management or employees of the Client or third parties. Accordingly, VALUES will not be liable in any way for, or in connection with, fraud or misrepresentations, whether on the part of the Client, its contractors or agents, or any other third party.</p>
      <p><strong>5.</strong> If you wish to bring a legal proceeding related to the Services or Agreement, it must be initiated within six (6) months from the date you became aware of or should have known about the facts leading to the alleged liability. Additionally, legal proceedings must be initiated no later than one (1) year from the date of the Deliverable that caused the alleged liability.</p>
      <p><strong>6.</strong> If you, as the client, have any concerns or complaints about the services provided, please do not hesitate to discuss them with the officials of VALUES. Any service-related issues concerning this Agreement (or any variations or additions to it) must be brought to the attention of VALUES in writing within one month from the date when you became aware of or should have reasonably been aware of the relevant facts. Such issues must be raised no later than six months from the completion date of the services.</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001. (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 15 of 24</p>
    </div>
  </div>

  <!-- PAGE 16: STANDARD TERMS CONTINUED AND DECLARATION -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India"</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
      <p style="margin: 2px 0;">Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.4;">
      <p><strong>7.</strong> If there is any disagreement regarding the Valuation or other Services that are provided, both parties must first try to resolve the issue through conciliation with their senior representatives. If a resolution cannot be reached within forty-five (45) days, the dispute will be settled through Arbitration in India, following the guidelines of the Arbitration and Conciliation Act 1996. The venue of the arbitration will be located in Ahmedabad, Gujarat, India. The arbitrator(s)' authority will be subject to the terms of the standard terms of service, which includes the limitation of liability provision. All information regarding the arbitration, including the arbitral award, will be kept confidential.</p>
      <p><strong>8.</strong> By utilizing this report, the user is presumed to have thoroughly read, comprehended, and accepted VALUES' standard business terms and conditions, as well as the assumptions and limitations outlined in this document.</p>
      <p><strong>9.</strong> We have valued the right property as per the details submitted to me.</p>
      <p><strong>10.</strong> Please note that payment for the valuation report is expected to be made within the bank's given time limit from the date of the report. Simply possessing the report will not fulfill its intended purpose.</p>
    </div>
    
    <div style="margin-top: 30px;">
      <p style="font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="margin: 2px 0;">Reg. Valuer – IBBI,</p>
      <p style="margin: 2px 0;">Chartered Engineer (India), B.E. Civil, PMP (PMI USA)</p>
      <p style="margin: 2px 0;">Fellow Institute of Valuer (Delhi), M.I.E.,</p>
      <p style="margin: 2px 0;">Approved Valuer by Chief Commissioner OF Income-tax (II)</p>
      <p style="margin: 2px 0;">Approved Valuer by IOV (Delhi)</p>
      <p style="margin: 10px 0;">3, Chandra Sen Bungalows, Lane Opp. Attihi Restaurant,</p>
      <p style="margin: 2px 0;">Judges Bungalow Rd., Bodakdev, Ahmedabad - 38054, Gujarat</p>
      <p style="margin: 2px 0;">Tel: 079 4002863* Mobile: 08825798600</p>
      <p style="margin: 2px 0;">E-Mail: rajeshganatra2003@gmail.com</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001 (M) 9824 832 394, 8000 209 331 Email: rgvs2021raikot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha, Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 16 of 24</p>
    </div>
  </div>

  <!-- PAGE 17: DECLARATION CUM UNDERTAKING -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India"</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
      <p style="margin: 2px 0;">Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
    </div>
    
    <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
      <p>DECLARATION- CUM- UNDERTAKING</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p>I, Rajesh Ganatra, son of Kishorbhai Ganatra, do hereby solemnly affirm and state that:</p>
      <p><strong>a.</strong> I am a citizen of India</p>
      <p><strong>b.</strong> I will not undertake valuation of any assets in which I have a direct or indirect interest or become so interested at any time during a period of three years prior to my appointment as valuer or three years after the valuation of assets was conducted by me</p>
      <p><strong>c.</strong> The information furnished in my valuation report dated 21/09/2024 is true and correct to the best of my knowledge and belief and I have made an impartial and true valuation of the property.</p>
      <p><strong>d.</strong> We have personally inspected the property on 21/09/2024 The work is not sub-contracted to any other valuer and carried out by myself.</p>
      <p><strong>e.</strong> Valuation report is submitted in the format as prescribed by the Bank.</p>
      <p><strong>f.</strong> I have not been depanelled/delisted by any other bank and in case any such depanelment by other banks during my empanelment with you, I will inform you within 3 days of such depanelment.</p>
      <p><strong>g.</strong> I have not been removed/dismissed from service/employment earlier</p>
      <p><strong>h.</strong> I have not been convicted of any offence and sentenced to a term of imprisonment</p>
      <p><strong>i.</strong> I have not been found guilty of misconduct in professional capacity</p>
      <p><strong>j.</strong> I have not been declared to be unsound mind</p>
      <p><strong>k.</strong> I am not an undischarged bankrupt, or has not applied to be adjudicated as a bankrupt;</p>
      <p><strong>l.</strong> I am not an undischarged insolvent</p>
      <p><strong>l.</strong> I have not been levied a penalty under section 2711 of Income-tax Act, 1961 (43 of 1961) and time limit for filing appeal before Commissioner of Income-tax (Appeals) or Income-tax Appellate Tribunal, as the case may be has expired, or such penalty has been confirmed by Income-tax Appellate Tribunal, and five years have not elapsed after levy of such penalty.</p>
      <p><strong>m.</strong> I have not been convicted of an offence connected with any proceeding under the Income Tax Act 1961, Wealth Tax Act 1957 or Gift Tax Act 1958 and</p>
      <p><strong>n.</strong> My PAN Card number/Service Tax number as applicable is AELPG1208B</p>
      <p><strong>o.</strong> I undertake to keep you informed of any events or happenings which would make me ineligible for empanelment as a valuer</p>
      <p><strong>p.</strong> I have not concealed or suppressed any material information, facts and records and I have made a complete and full disclosure</p>
      <p><strong>q.</strong> I have read the Handbook on Policy, Standards and procedure for Real Estate Valuation, 2011 of the IBA and this report is in conformity to the "Standards" enshrined for valuation in the Part-B of the</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001 (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 17 of 24</p>
    </div>
  </div>

  <!-- PAGE 18: DECLARATION CONTINUED AND INFORMATION TABLE -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p>above handbook to the best of my ability</p>
      <p><strong>r.</strong> I am registered under Section 34 AB of the Wealth Tax Act, 1957. (Strike off, if not applicable)</p>
      <p><strong>s.</strong> I am valuer registered with Insolvency & Bankruptcy Board of India (IBBI)(Strike off, if not applicable)</p>
      <p><strong>t.</strong> My CIBIL Score and credit worthiness is as per Bank's guidelines.</p>
      <p><strong>u.</strong> I am the proprietor / partner / authorized official of the firm / company, who is competent to sign this valuation report.</p>
      <p><strong>v.</strong> I will undertake the valuation work on receipt of Letter of Engagement generated from the system (i.e. LLMS/LOS) only.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 10px 0;">
      <p>w. Further, I hereby provide the following information.</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
      <tr>
        <th style="border: 1px solid #000; padding: 4px;">Sr. No.</th>
        <th style="border: 1px solid #000; padding: 4px;">Particulars</th>
        <th style="border: 1px solid #000; padding: 4px;">Valuer comment</th>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">1</td>
        <td style="border: 1px solid #000; padding: 4px;">background information of the asset being valued;</td>
        <td style="border: 1px solid #000; padding: 4px;">Referred provided documents</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">2</td>
        <td style="border: 1px solid #000; padding: 4px;">purpose of valuation and appointing authority</td>
        <td style="border: 1px solid #000; padding: 4px;">Continue Financial Assistance</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">3</td>
        <td style="border: 1px solid #000; padding: 4px;">identity of the valuer and any other experts involved in the valuation;</td>
        <td style="border: 1px solid #000; padding: 4px;">Self-assessment</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">4</td>
        <td style="border: 1px solid #000; padding: 4px;">disclosure of valuer interest or conflict, if any;</td>
        <td style="border: 1px solid #000; padding: 4px;">N.A.</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">5</td>
        <td style="border: 1px solid #000; padding: 4px;">date of appointment, valuation date and date of report;</td>
        <td style="border: 1px solid #000; padding: 4px;">Date of Report: 21/09/2024</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">6</td>
        <td style="border: 1px solid #000; padding: 4px;">inspections and/or investigations undertaken;</td>
        <td style="border: 1px solid #000; padding: 4px;">Date of Visit: 21/09/2024</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">7</td>
        <td style="border: 1px solid #000; padding: 4px;">nature and sources of the information used or relied upon;</td>
        <td style="border: 1px solid #000; padding: 4px;">Local inquiries, brokers, known websites, i.e. magic bricks, 99acre, propertywalk, prop tiger, housing, etc., if available</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">8</td>
        <td style="border: 1px solid #000; padding: 4px;">procedures adopted in carrying out the valuation and valuation standards followed;</td>
        <td style="border: 1px solid #000; padding: 4px;">Land & Building Method, with Market Approach for Land and Cost Approach for Building.</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">9</td>
        <td style="border: 1px solid #000; padding: 4px;">restrictions on use of the report, if any;</td>
        <td style="border: 1px solid #000; padding: 4px;">Asper purpose mentioned in report.</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">10</td>
        <td style="border: 1px solid #000; padding: 4px;">major factors that were taken into account during the valuation;</td>
        <td style="border: 1px solid #000; padding: 4px;">Location of the property, with developing of surroundings, for going-purpose valuation</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">11</td>
        <td style="border: 1px solid #000; padding: 4px;">major factors that were not taken into account during the valuation;</td>
        <td style="border: 1px solid #000; padding: 4px;">Future market events and Government Policies.</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 4px;">12</td>
        <td style="border: 1px solid #000; padding: 4px;">Caveats, limitations and disclaimers to the extent they explain or elucidate the limitations faced by valuer, which shall not be for the purpose of limiting his responsibility for the valuation report.</td>
        <td style="border: 1px solid #000; padding: 4px;">We are not responsible for Title of the subjected property and valuations affected by the same</td>
      </tr>
    </table>
    
    <div style="margin-top: 20px;">
      <p>Place: Ahmedabad</p>
      <p>Date: 21/09/2024</p>
      <p style="margin-top: 15px;">Rajesh Ganatra</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha, Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 18 of 24</p>
    </div>
  </div>

  <!-- PAGE 19: MODEL CODE OF CONDUCT (PART 1) -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India"</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
      <p style="margin: 2px 0;">Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
    </div>
    
    <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
      <p>(Annexure-V)</p>
      <p>MODEL CODE OF CONDUCT FOR VALUERS</p>
    </div>
    
    <div style="font-weight: bold; margin-bottom: 5px;">
      <p>Integrity and Fairness</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>1.</strong> A valuer shall, in the conduct of his/its business, follow high standards of integrity and fairness in all his/its dealings with his/its clients and other valuers.</p>
      <p><strong>2.</strong> A valuer shall maintain integrity by being honest, straightforward, and forthright in all professional relationships.</p>
      <p><strong>3.</strong> A valuer shall endeavor to ensure that he/it provides true and adequate information and shall not misrepresent any facts or situations.</p>
      <p><strong>4.</strong> A valuer shall refrain from being involved in any action that would bring disrepute to the profession.</p>
      <p><strong>5.</strong> A valuer shall keep public interest foremost while delivering his services.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 5px 0;">
      <p>Professional Competence and Due Care</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>6.</strong> A valuer shall render at all times high standards of service, exercise due diligence, ensure proper care and exercise independent professional judgment.</p>
      <p><strong>7.</strong> A valuer shall carry out professional services in accordance with the relevant technical and professional standards that may be specified from time to time</p>
      <p><strong>8.</strong> A valuer shall continuously maintain professional knowledge and skill to provide competent professional service based on up-to-date developments in practice, prevailing regulations/guidelines and techniques.</p>
      <p><strong>9.</strong> In the preparation of a valuation report, the valuer shall not disclaim liability for his/its expertise or deny his/its duty of care, except to the extent that the assumptions are based on statements of fact provided by the company or its auditors or consultants or information available in public domain and not generated by the valuer.</p>
      <p><strong>10.</strong> A valuer shall not carry out any instruction of the client insofar as they are incompatible with the requirements of integrity, objectivity and independence.</p>
      <p><strong>11.</strong> A valuer shall clearly state to his client the services that he would be competent to provide and the services for which he would be relying on other valuers or professionals or for which the client can have a separate arrangement with other valuers.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 5px 0;">
      <p>Independence and Disclosure of Interest</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>12.</strong> A valuer shall act with objectivity in his/its professional dealings by ensuring that his/its decisions are made without the presence of any bias, conflict of interest, coercion, or undue influence of any party, whether directly connected to the valuation assignment or not.</p>
      <p><strong>13.</strong> A valuer shall not take up an assignment if he/it or any of his/its relatives or associates is not independent in terms of association to the company.</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001 (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 19 of 24</p>
    </div>
  </div>

  <!-- PAGE 20: MODEL CODE OF CONDUCT (PART 2) -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>14.</strong> A valuer shall maintain complete independence in his/its professional relationships and shall conduct the valuation independent of external influences.</p>
      <p><strong>15.</strong> A valuer shall wherever necessary disclose to the clients, possible sources of conflicts of duties and interests, while providing unbiased services.</p>
      <p><strong>16.</strong> A valuer shall not deal in securities of any subject company after any time when he/it first becomes aware of the possibility of his/its association with the valuation, and in accordance with the Securities and Exchange Board of India (Prohibition of Insider Trading) Regulations, 2015 or till the time the valuation report becomes public, whichever is earlier.</p>
      <p><strong>17.</strong> A valuer shall not indulge in "mandate snatching" or offering "convenience valuations" in order to cater to a company or client's needs.</p>
      <p><strong>18.</strong> As an independent valuer, the valuer shall not charge success fee.</p>
      <p><strong>19.</strong> In any fairness opinion or independent expert opinion submitted by a valuer, if there has been a prior engagement in an unconnected transaction, the valuer shall declare the association with the company during the last five years.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 5px 0;">
      <p>Confidentiality</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>20.</strong> A valuer shall not use or divulge to other clients or any other party any confidential information about the subject company, which has come to his/its knowledge without proper and specific authority or unless there is a legal or professional right or duty to disclose.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 5px 0;">
      <p>Information Management</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>21.</strong> A valuer shall ensure that he/it maintains written contemporaneous records for any decision taken, the reasons for taking the decision, and the information and evidence in support of such decision. This shall be maintained so as to sufficiently enable a reasonable person to take a view on the appropriateness of his/its decisions and actions.</p>
      <p><strong>22.</strong> A valuer shall appear, co-operate and be available for inspections and investigations carried out by the authority, any person authorized by the authority, the registered valuers organization with which he/it is registered or any other statutory regulatory body.</p>
      <p><strong>23.</strong> A valuer shall provide all information and records as may be required by the authority, the Tribunal, Appellate Tribunal, the registered valuers organization with which he/it is registered, or any other statutory regulatory body.</p>
      <p><strong>24.</strong> A valuer while respecting the confidentiality of information acquired during the course of performing professional services, shall maintain proper working papers for a period of three years or such longer period as required in its contract for a specific valuation, for production before a regulatory authority or for a peer review. In the event of a pending case before the Tribunal or Appellate Tribunal, the record shall be maintained till the disposal of the case.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 5px 0;">
      <p>Gifts And hospitality.</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779 Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 20 of 24</p>
    </div>
  </div>

  <!-- PAGE 21: MODEL CODE OF CONDUCT (PART 3) -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>25.</strong> A valuer or his/its relative shall not accept gifts or hospitality which undermines or affects his independence as a valuer.</p>
      <p style="margin-left: 20px;"><em>Explanation: For the purposes of this code the term 'relative' shall have the same meaning as defined in clause (77) of Section 2 of the Companies Act, 2013 (18 of 2013).</em></p>
      <p><strong>26.</strong> A valuer shall not offer gifts or hospitality or a financial or any other advantage to a public servant or any other person with a view to obtain or retain work for himself/ itself, or to obtain or retain an advantage in the conduct of profession for himself/ itself.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 5px 0;">
      <p>Remuneration and Costs.</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>27.</strong> A valuer shall provide services for remuneration which is charged in a transparent manner, is a reasonable reflection of the work necessarily and properly undertaken, and is not inconsistent with the applicable rules.</p>
      <p><strong>28.</strong> A valuer shall not accept any fees or charges other than those which are disclosed in a written contract with the person to whom he would be rendering service. Occupation, employability and restrictions.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 5px 0;">
      <p>Occupation, employability and restrictions.</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>29.</strong> A valuer shall refrain from accepting too many assignments, if he/it is unlikely to be able to devote adequate time to each of his/ its assignments.</p>
      <p><strong>30.</strong> A valuer shall not conduct business which in the opinion of the authority or the registered valuer organisation discredits the profession.</p>
    </div>
    
    <div style="font-weight: bold; margin: 15px 0 5px 0;">
      <p>Miscellaneous</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4;">
      <p><strong>31.</strong> A valuer shall refrain from undertaking to review the work of another valuer of the same client except under written orders from the bank or housing finance institutions and with knowledge of the concerned valuer.</p>
      <p><strong>32.</strong> A valuer shall follow this code as amended or revised from time to time.</p>
    </div>
    
    <div style="margin-top: 30px;">
      <p><strong>Signature of the valuer:</strong></p>
      <p><strong>Name of the Valuer :</strong> Rajesh Ganatra</p>
      <p><strong>Address of the valuer:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza,</p>
      <p style="margin-left: 20px;">Opp. Sanmukh Complex, Off. C G Road,</p>
      <p style="margin-left: 20px;">Navrangpura, Ahmedabad – 380009</p>
      <p><strong>Date:</strong> 21/09/2024</p>
      <p><strong>Place:</strong> Ahmedabad</p>
    </div>
    
    <div style="font-weight: bold; margin-top: 15px;">
      <p>Jantri Rate Details</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 20px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yamuna chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 21 of 24</p>
    </div>
  </div>

  <!-- PAGE 22-24: IMAGES PLACEHOLDER PAGES -->
  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="text-align: center; margin-top: 50px;">
      <p style="font-size: 14pt; font-weight: bold;">Google Location:</p>
      <p style="margin-top: 30px; font-style: italic;">[Google Maps location image would appear here]</p>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 100px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 22 of 24</p>
    </div>
  </div>

  <div style="page-break-after: always; break-after: page; padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="text-align: center; margin-top: 50px;">
      <p style="font-size: 14pt; font-weight: bold;">Property Photographs:</p>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; margin-top: 30px; gap: 20px;">
        <div style="width: 45%; text-align: center;">
          <p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Property Image 1]</p>
        </div>
        <div style="width: 45%; text-align: center;">
          <p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Property Image 2]</p>
        </div>
        <div style="width: 45%; text-align: center; margin-top: 20px;">
          <p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Property Image 3]</p>
        </div>
        <div style="width: 45%; text-align: center; margin-top: 20px;">
          <p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Property Image 4]</p>
        </div>
      </div>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 80px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 23 of 24</p>
    </div>
  </div>

  <div style="padding: 12mm;">
    <div style="text-align: center; margin-bottom: 5px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">Rajesh Ganatra</p>
      <p style="font-size: 14pt; margin: 0;">(Rajesh Ganatra Valuation Services)</p>
    </div>
    
    <div style="font-size: 10pt; line-height: 1.4; margin-bottom: 15px;">
      <p style="margin: 2px 0;">Reg. Valuer – IBBI "Insolvency And Bankruptcy Board of India" Master of Valuation(Plant & Machinery)</p>
      <p style="margin: 2px 0;">Master of Valuation(Real Estate), B.E. Civil, Chartered Engineer Govt. Approved Registration No.: CAT-VII/167/2025-26</p>
      <p style="margin: 2px 0;">Govt. Approved Registration No.: CAT-I/553/ABD/CC-II/2009-2010</p>
      <p style="margin: 2px 0;">Life Membership of Institution of Valuers (IOV) "Approved Valuer"</p>
      <p style="margin: 2px 0;">Govt. Registered Arbitrator (Govt. Of India)</p>
    </div>
    
    <div style="text-align: center; margin-top: 50px;">
      <p style="font-size: 14pt; font-weight: bold;">More Property Photographs:</p>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; margin-top: 30px; gap: 20px;">
        ${pdfData.propertyImages && pdfData.propertyImages.length > 4 ?
            pdfData.propertyImages.slice(4, 8).map((img, idx) => {
                const src = typeof img === 'string' ? img : img?.url || img?.preview || img?.data || '';
                return src ? `<div style="width: 45%; text-align: center; ${idx > 0 ? 'margin-top: 20px;' : ''}">
              <img src="${src}" alt="Property Image ${idx + 5}" style="max-width: 100%; height: auto; border: 1px solid #ccc; padding: 5px;" class="pdf-image" />
            </div>` : '';
            }).join('')
            : ``}
        ${pdfData.propertyImages && pdfData.propertyImages.length <= 4 ? `
        <div style="width: 45%; text-align: center;">
          <p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Property Image 5]</p>
        </div>
        <div style="width: 45%; text-align: center;">
          <p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Property Image 6]</p>
        </div>
        ` : ``}
        ${pdfData.documentPreviews && pdfData.documentPreviews.length > 0 ?
            pdfData.documentPreviews.slice(0, 2).map((img, idx) => {
                const src = typeof img === 'string' ? img : img?.url || img?.preview || img?.data || '';
                return src ? `<div style="width: 45%; text-align: center; margin-top: 20px;">
              <img src="${src}" alt="Document Image ${idx + 1}" style="max-width: 100%; height: auto; border: 1px solid #ccc; padding: 5px;" class="pdf-image" />
            </div>` : `<div style="width: 45%; text-align: center; margin-top: 20px;"><p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Document Image ${idx + 1}]</p></div>`;
            }).join('')
            : `
        <div style="width: 45%; text-align: center; margin-top: 20px;">
          <p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Document Image 1]</p>
        </div>
        <div style="width: 45%; text-align: center; margin-top: 20px;">
          <p style="font-style: italic; border: 1px dashed #999; padding: 40px;">[Document Image 2]</p>
        </div>
        `}
      </div>
    </div>
    
    <div style="font-size: 9pt; line-height: 1.3; margin-top: 80px;">
      <p style="margin: 2px 0;"><strong>H. Office:</strong> 5th floor, Shalvik Complex, behind Ganesh Plaza, Opp. Sanmukh Complex, Off. C G Road, Navrangpura, Ahmedabad – 380009. Mobile: 98257 98600, email: rajeshganatra2003@gmail.com, rgvs2003@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> F-46, Silver Cube, Opp. Bansri Township, B/s. S Cube, Radhanpur Road, Mehsana – 384002. (M) 7201 977 779. Email: rgvs.mehsana2019@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> 608, 6th floor, Shree Guru Krupa Tower, Nr. Moti Tanki Chowk, Subhash Road, At. Rajkot-360001  (M) 9824 832 394, 8000 209 331 Email: rgvs2021rajkot@gmail.com</p>
      <p style="margin: 2px 0;"><strong>Br. Office:</strong> D-68, Sumeru city mall, near yanuma chowk, mota yarachha., Surat-394101.</p>
      <p style="margin: 2px 0;"><strong>Other Branches:</strong> Palanpur, Mumbai, Nasik, Surat, Amreli, Bhavnagar, Jannagar, Junagadh, Morbi, Veraval – Somnath,</p>
    </div>
    
    <div style="text-align: right; margin-top: 10px; font-size: 10pt;">
      <p>Page 24 of 24</p>
    </div>
  </div>
</div>
</body>
</html>
`;
}

export async function generateRecordPDF(record) {
    try {
        ('📄 Generating PDF for record:', record?.uniqueId || record?.clientName || 'new');
        return await generateRecordPDFOffline(record);
    } catch (error) {
        console.error('❌ PDF generation error:', error);
        throw error;
    }
}

/**
 * Preview PDF in a new tab
 * Uses client-side generation with blob URL preview
 */
export async function previewValuationPDF(record) {
    try {
        ('👁️ Generating PDF preview for:', record?.uniqueId || record?.clientName || 'new');

        // Dynamically import jsPDF and html2canvas
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Generate HTML from the record data
        const htmlContent = generateValuationReportHTML(record);

        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '210mm';
        container.style.backgroundColor = '#ffffff';
        container.style.fontSize = '12pt';
        container.style.fontFamily = "'Arial', sans-serif";
        // Add fixed page height style for preview with expandable rows
        const style = document.createElement('style');
        style.textContent = `.page { height: 297mm !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; } table { flex: 1 !important; } tbody { height: 100% !important; }`;
        document.head.appendChild(style);
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

        // Create blob URL and open in new tab
        const blob = pdf.output('blob');
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');

        ('✅ PDF preview opened');
        return url;
    } catch (error) {
        console.error('❌ PDF preview error:', error);
        throw error;
    }
}

/**
 * Compress image and convert to base64
 */
const compressImage = async (blob) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const img = new Image();

        img.onload = () => {
            // Scale down image: max 1200px width
            const maxWidth = 1200;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to JPEG with 70% quality for compression
            canvas.toBlob(
                (compressedBlob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(compressedBlob);
                },
                'image/jpeg',
                0.7
            );
        };

        img.onerror = () => resolve('');

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(blob);
    });
};

/**
 * Convert image URL to base64 data URI with compression
 */
const urlToBase64 = async (url) => {
    if (!url) return '';

    try {
        const response = await fetch(url);
        const blob = await response.blob();

        // Compress image to reduce size
        const compressed = await compressImage(blob);
        return compressed;
    } catch (error) {
        console.warn('Failed to convert image to base64:', url, error);
        return '';
    }
};

/**
 * Convert all image URLs in record to base64
 */
const convertImagesToBase64 = async (record) => {
    if (!record) return record;

    const recordCopy = { ...record };

    // Convert property images
    if (Array.isArray(recordCopy.propertyImages)) {
        recordCopy.propertyImages = await Promise.all(
            recordCopy.propertyImages.map(async (img) => {
                if (!img) return img;
                const url = typeof img === 'string' ? img : img?.url;
                if (!url) return img;

                const base64 = await urlToBase64(url);
                if (typeof img === 'string') {
                    return base64 || img;
                }
                return { ...img, url: base64 || url };
            })
        );
    }

    // Convert location images
    if (Array.isArray(recordCopy.locationImages)) {
        recordCopy.locationImages = await Promise.all(
            recordCopy.locationImages.map(async (img) => {
                if (!img) return img;
                const url = typeof img === 'string' ? img : img?.url;
                if (!url) return img;

                const base64 = await urlToBase64(url);
                if (typeof img === 'string') {
                    return base64 || img;
                }
                return { ...img, url: base64 || url };
            })
        );
    }

    return recordCopy;
};

/**
 * Client-side PDF generation using jsPDF + html2canvas
 * Works on Vercel without server-side dependencies
 */
export async function generateRecordPDFOffline(record) {
    try {
        ('📠 Generating PDF (client-side mode)');
        ('📊 Input Record Structure:', {
            recordKeys: Object.keys(record || {}),
            rootFields: {
                uniqueId: record?.uniqueId,
                bankName: record?.bankName,
                clientName: record?.clientName,
                city: record?.city,
                engineerName: record?.engineerName
            },
            pdfDetailsKeys: Object.keys(record?.pdfDetails || {}).slice(0, 20),
            totalPdfDetailsFields: Object.keys(record?.pdfDetails || {}).length,
            criticalFields: {
                postalAddress: record?.pdfDetails?.postalAddress,
                areaClassification: record?.pdfDetails?.areaClassification,
                residentialArea: record?.pdfDetails?.residentialArea,
                commercialArea: record?.pdfDetails?.commercialArea,
                inspectionDate: record?.pdfDetails?.inspectionDate,
                agreementForSale: record?.pdfDetails?.agreementForSale
            },
            documentsProduced: record?.documentsProduced,
            agreementForSale_root: record?.agreementForSale,
            agreementForSale_pdfDetails: record?.pdfDetails?.agreementForSale,
            // CRITICAL: Log images at start
            propertyImages_count: Array.isArray(record?.propertyImages) ? record.propertyImages.length : 0,
            locationImages_count: Array.isArray(record?.locationImages) ? record.locationImages.length : 0,
            documentPreviews_count: Array.isArray(record?.documentPreviews) ? record.documentPreviews.length : 0,
            propertyImages_sample: record?.propertyImages?.slice(0, 1),
            locationImages_sample: record?.locationImages?.slice(0, 1),
            documentPreviews_sample: record?.documentPreviews?.slice(0, 1)
        });

        // Convert images to base64 for PDF embedding
        ('🖼️ Converting images to base64...');
        const recordWithBase64Images = await convertImagesToBase64(record);

        // Dynamically import jsPDF and html2canvas to avoid SSR issues
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Generate HTML from the record data with base64 images
        const htmlContent = generateValuationReportHTML(recordWithBase64Images);

        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '210mm';
        container.style.height = 'auto';
        container.style.backgroundColor = '#ffffff';
        container.style.fontSize = '12pt';
        container.style.fontFamily = "'Arial', sans-serif";
        document.body.appendChild(container);

        // CRITICAL: Wait for images to load, then remove failed ones
        const allImages = container.querySelectorAll('img.pdf-image');
        const imagesToRemove = new Set();

        // First pass: check for images with invalid src attribute
        allImages.forEach(img => {
            const src = img.src || img.getAttribute('data-src');
            const alt = img.getAttribute('alt') || 'unknown';

            // If image has no src or invalid src, mark container for removal
            if (!src || !src.trim() || src === 'undefined' || src === 'null') {
                (`⏭️ Invalid image src: ${alt}`);
                let parentContainer = img.closest('.image-container');
                if (parentContainer) {
                    imagesToRemove.add(parentContainer);
                    (`⏭️ Marking for removal (invalid src): ${alt}`);
                }
            }
        });

        // Second pass: add error listeners to detect failed load attempts
        await Promise.all(Array.from(allImages).map(img => {
            return new Promise((resolve) => {
                const alt = img.getAttribute('alt') || 'unknown';
                const timeoutId = setTimeout(() => {
                    // If image hasn't loaded after 5 seconds, mark for removal
                    if (!img.complete || img.naturalHeight === 0) {
                        (`⏭️ Image timeout/failed to load: ${alt}`);
                        let parentContainer = img.closest('.image-container');
                        if (parentContainer) {
                            imagesToRemove.add(parentContainer);
                            (`⏭️ Marking for removal (timeout): ${alt}`);
                        }
                    }
                    resolve();
                }, 5000);

                img.onload = () => {
                    clearTimeout(timeoutId);
                    (`✅ Image loaded successfully: ${alt}`);
                    resolve();
                };

                img.onerror = () => {
                    clearTimeout(timeoutId);
                    (`❌ Image failed to load: ${alt}`);
                    let parentContainer = img.closest('.image-container');
                    if (parentContainer) {
                        imagesToRemove.add(parentContainer);
                        (`⏭️ Marking for removal (onerror): ${alt}`);
                    }
                    resolve();
                };

                // If already loaded, resolve immediately
                if (img.complete) {
                    clearTimeout(timeoutId);
                    if (img.naturalHeight === 0) {
                        (`⏭️ Image failed (no height): ${alt}`);
                        let parentContainer = img.closest('.image-container');
                        if (parentContainer) {
                            imagesToRemove.add(parentContainer);
                            (`⏭️ Marking for removal (no height): ${alt}`);
                        }
                    } else {
                        (`✅ Image already loaded: ${alt}`);
                    }
                    resolve();
                }
            });
        }));

        // Remove only failed/invalid image containers
        (`🗑️ Removing ${imagesToRemove.size} failed/invalid image containers`);
        imagesToRemove.forEach(el => {
            const alt = el.querySelector('img')?.getAttribute('alt') || 'unknown';
            (`✂️ Removed container: ${alt}`);
            el.remove();
        });

        ('✅ Image validation complete - now extracting images BEFORE rendering...');

        // CRITICAL: Render continuous-wrapper and .page elements separately for proper page breaks
        const continuousWrapper = container.querySelector('.continuous-wrapper');
        const pageElements = Array.from(container.querySelectorAll(':scope > .page'));
        (`📄 Total .page elements found: ${pageElements.length}`);

        // Render continuous wrapper first
        let mainCanvas = null;
        if (continuousWrapper) {
            mainCanvas = await html2canvas(continuousWrapper, {
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                imageTimeout: 10000,
                windowHeight: continuousWrapper.scrollHeight,
                windowWidth: 793,
                onclone: (clonedDocument) => {
                    const clonedImages = clonedDocument.querySelectorAll('img');
                    clonedImages.forEach(img => {
                        img.crossOrigin = 'anonymous';
                        img.loading = 'eager';
                        img.style.display = 'block';
                        img.style.visibility = 'visible';
                    });
                }
            });
            ('✅ Continuous wrapper canvas conversion complete');
        }

        // Render each .page separately for proper page breaks
        const pageCanvases = [];
        for (let i = 0; i < pageElements.length; i++) {
            const pageEl = pageElements[i];
            (`📄 Rendering .page element ${i + 1}/${pageElements.length}`);

            // Temporarily remove padding to render from top
            const originalPadding = pageEl.style.padding;
            pageEl.style.padding = '0';
            pageEl.style.margin = '0';

            const pageCanvas = await html2canvas(pageEl, {
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                imageTimeout: 10000,
                windowHeight: pageEl.scrollHeight,
                windowWidth: 793,
                x: 0,
                y: 0,
                onclone: (clonedDocument) => {
                    const clonedPageEl = clonedDocument.querySelector('.page') || clonedDocument;
                    clonedPageEl.style.padding = '0';
                    clonedPageEl.style.margin = '0';

                    const clonedImages = clonedDocument.querySelectorAll('img');
                    clonedImages.forEach(img => {
                        img.crossOrigin = 'anonymous';
                        img.loading = 'eager';
                        img.style.display = 'block';
                        img.style.visibility = 'visible';
                    });
                }
            });

            // Restore original padding
            pageEl.style.padding = originalPadding;

            pageCanvases.push(pageCanvas);
            (`✅ .page ${i + 1} canvas conversion complete`);
        }

        (`✅ Page rendering complete - ${pageCanvases.length} .page elements rendered separately`);

        // Extract images BEFORE removing container
        // This prevents empty/blank image containers from appearing in the PDF
        ('⏳ Extracting images and removing containers from HTML...');
        const images = Array.from(container.querySelectorAll('img.pdf-image'));
        const imageData = [];

        // Extract valid images and REMOVE ALL their containers
        for (const img of images) {
            const src = img.src || img.getAttribute('data-src');
            const label = img.getAttribute('alt') || 'Image';

            // Only extract images with valid src
            if (src && (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http'))) {
                imageData.push({
                    src,
                    label,
                    type: label.includes('Location') ? 'location' :
                        label.includes('Bank') ? 'bank' :
                        label.includes('Supporting') ? 'supporting' : 'property'
                });
                (`📸 Extracted image: ${label}`);
            } else {
                (`⏭️ Invalid image src, will not add to PDF: ${label}`);
            }

            // CRITICAL FIX: REMOVE the ENTIRE image container from HTML
            // (not just hiding the image) to prevent empty boxes from rendering in PDF
            // BUT: Keep bank images in the page so they render with page content
            const parentContainer = img.closest('.image-container');
            if (parentContainer && !label.includes('Bank')) {
                (`🗑️ Removing image container from HTML: ${label}`);
                parentContainer.remove();
            } else if (parentContainer && label.includes('Bank')) {
                (`✅ Keeping bank image in page for rendering: ${label}`);
            }
        }

        ('✅ Extracted', imageData.length, 'images; removed', images.length, 'containers from HTML');

        // Remove temporary container now that we've extracted images
        document.body.removeChild(container);
        ('✅ Container removed from DOM');

        // Create PDF from main canvas with header/footer margins
        // Use JPEG for better compression instead of PNG
        const imgData = mainCanvas.toDataURL('image/jpeg', 0.85);
        const imgWidth = 210;
        const pageHeight = 297;
        const headerHeight = 20;  // 10mm header space
        const footerHeight = 20;  // 10mm footer space
        const usableHeight = pageHeight - headerHeight - footerHeight;
        const imgHeight = (mainCanvas.height * imgWidth) / mainCanvas.width;

        // Function to find safe break point (avoid splitting rows)
        const findSafeBreakPoint = (canvasHeight, startPixel, maxHeightPixels) => {
            try {
                // Ensure we're within bounds
                const safeStartPixel = Math.max(0, Math.floor(startPixel));
                const safeHeight = Math.min(maxHeightPixels, canvasHeight - safeStartPixel);

                if (safeHeight <= 0) {
                    return maxHeightPixels;
                }

                // Get image data to detect row boundaries
                const ctx = mainCanvas.getContext('2d');
                const width = Math.floor(mainCanvas.width);
                const height = Math.floor(safeHeight);

                const imageData = ctx.getImageData(0, safeStartPixel, width, height);
                const data = imageData.data;

                // Look for horizontal lines (table borders) by scanning for rows of dark pixels
                let lastBlackRowIndex = 0;
                const pixelsPerRow = width * 4; // RGBA = 4 bytes per pixel
                const rowCount = height;

                for (let row = 0; row < rowCount; row++) {
                    let blackCount = 0;
                    const rowStart = row * pixelsPerRow;

                    // Count dark pixels in this row
                    for (let col = 0; col < width; col++) {
                        const idx = rowStart + col * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];

                        // Check if pixel is dark (table border)
                        if (r < 150 && g < 150 && b < 150) {
                            blackCount++;
                        }
                    }

                    // If >60% of row is dark, it's a border line
                    if (blackCount > width * 0.6) {
                        lastBlackRowIndex = row;
                    }
                }

                // Return the last safe break point (after the border)
                if (lastBlackRowIndex > 0 && lastBlackRowIndex < rowCount - 5) {
                    return lastBlackRowIndex;
                }
            } catch (err) {
                console.warn('Error finding safe break point:', err?.message);
            }

            // Fallback to original height if detection fails
            return maxHeightPixels;
        };

        const pdf = new jsPDF('p', 'mm', 'A4');
        let pageNumber = 1;
        let heightLeft = imgHeight;
        let yPosition = 0;
        let sourceY = 0;  // Track position in the source canvas

        while (heightLeft > 0) {
            // Calculate how much of the image fits on this page
            let imageHeightForThisPage = Math.min(usableHeight, heightLeft);

            // Calculate the crop region from the canvas
            const canvasHeight = mainCanvas.height;
            const canvasWidth = mainCanvas.width;
            const sourceYPixels = (sourceY / imgHeight) * canvasHeight;
            const maxHeightPixels = (imageHeightForThisPage / imgHeight) * canvasHeight;

            // Find safe break point to avoid splitting rows
            const safeHeightPixels = findSafeBreakPoint(canvasHeight, sourceYPixels, maxHeightPixels);
            const sourceHeightPixels = Math.min(safeHeightPixels, maxHeightPixels);

            // Recalculate the actual height used
            imageHeightForThisPage = (sourceHeightPixels / canvasHeight) * imgHeight;

            // Create a cropped canvas for this page
            const croppedPageCanvas = document.createElement('canvas');
            croppedPageCanvas.width = canvasWidth;
            croppedPageCanvas.height = sourceHeightPixels;
            const pageCtx = croppedPageCanvas.getContext('2d');
            pageCtx.drawImage(
                mainCanvas,
                0, sourceYPixels,
                canvasWidth, sourceHeightPixels,
                0, 0,
                canvasWidth, sourceHeightPixels
            );

            const pageImgData = croppedPageCanvas.toDataURL('image/jpeg', 0.85);

            // Add image with top margin (header space)
            pdf.addImage(pageImgData, 'JPEG', 0, headerHeight, imgWidth, imageHeightForThisPage);

            // Add page number in footer
            pdf.setFontSize(9);
            pdf.text(`Page ${pageNumber}`, 105, pageHeight - 5, { align: 'center' });

            // Update counters
            heightLeft -= imageHeightForThisPage;
            sourceY += imageHeightForThisPage;
            pageNumber++;

            if (heightLeft > 0) {
                pdf.addPage();
            }
        }

        // Add page canvases as separate pages in PDF
        (`📄 Adding ${pageCanvases.length} separate .page canvases to PDF...`);
        for (let i = 0; i < pageCanvases.length; i++) {
            const pageCanvas = pageCanvases[i];
            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);
            const pageImgHeight = (pageCanvas.height * imgWidth) / pageCanvas.width;

            pdf.addPage();
            // Add image with proper margins (12mm = ~45px at 96dpi)
            const leftMargin = 12;
            const topMargin = 12;
            const availableWidth = imgWidth - (leftMargin * 2);
            const adjustedImgHeight = (pageCanvas.height * availableWidth) / pageCanvas.width;

            pdf.addImage(pageImgData, 'JPEG', leftMargin, topMargin, availableWidth, adjustedImgHeight);
            pdf.setFontSize(9);
            pdf.text(`Page ${pageNumber}`, 105, pageHeight - 5, { align: 'center' });
            pageNumber++;
            (`✅ Added .page canvas ${i + 1} as page ${pageNumber - 1}`);
        }

        // Add images as separate pages
        ('📸 Adding', imageData.length, 'images to PDF...');

        // Filter out images with invalid src before adding to PDF
        const validImages = imageData.filter(img => {
            if (!img.src || typeof img.src !== 'string' || !img.src.trim()) {
                (`⏭️ Skipping image with invalid src: ${img.label}`);
                return false;
            }
            return true;
        });

        if (validImages.length > 0) {
            // Separate images by type
            const propertyImgs = validImages.filter(img => img.type === 'property');
            const locationImgs = validImages.filter(img => img.type === 'location');
            const supportingImgs = validImages.filter(img => img.type === 'supporting');

            // ===== ADD PROPERTY IMAGES: 9 per page (3 columns x 3 rows) =====
            if (propertyImgs.length > 0) {
                // Add title page for property photographs
                pdf.addPage();
                pdf.setFontSize(14);
                pdf.setFont(undefined, 'bold');
                pdf.text('Photographs of Property:', 15, 20);

                let imgIndex = 0;
                let firstPage = true;

                while (imgIndex < propertyImgs.length) {
                    if (!firstPage) {
                        pdf.addPage();
                    }
                    firstPage = false;

                    // Add up to 9 images (3 columns x 3 rows) per page
                    for (let row = 0; row < 3 && imgIndex < propertyImgs.length; row++) {
                        const yPos = 30 + row * 82; // 3 rows with spacing

                        // 3 columns
                        for (let col = 0; col < 3 && imgIndex < propertyImgs.length; col++) {
                            const img = propertyImgs[imgIndex];
                            const xPos = 12 + col * 65; // 3 columns with spacing

                            try {
                                if (img.src && (img.src.startsWith('data:') || img.src.startsWith('blob:') || img.src.startsWith('http://') || img.src.startsWith('https://'))) {
                                    // Add image without label (to match screenshot style)
                                    pdf.addImage(img.src, 'JPEG', xPos, yPos, 60, 75);
                                    (`✅ Added property image [${row},${col}]: ${img.label}`);
                                }
                            } catch (err) {
                                console.warn(`Failed to add property image ${img.label}:`, err?.message);
                            }
                            imgIndex++;
                        }
                    }

                    // Add new page if more images remain
                    if (imgIndex < propertyImgs.length) {
                        // Continue to next page
                    }
                }
            }

            // ===== ADD LOCATION IMAGES: 1 per page (full-page Google Map style) =====
            if (locationImgs.length > 0) {
                for (let i = 0; i < locationImgs.length; i++) {
                    const img = locationImgs[i];

                    try {
                        if (!img.src || (!img.src.startsWith('data:') && !img.src.startsWith('blob:') && !img.src.startsWith('http://') && !img.src.startsWith('https://'))) {
                            continue;
                        }

                        pdf.addPage();

                        // Add image title with underline
                        pdf.setFontSize(13);
                        pdf.setFont(undefined, 'bold');
                        pdf.text('Google Location Map :-', 15, 15);

                        // Draw underline
                        pdf.setDrawColor(0);
                        pdf.line(15, 18, 100, 18);

                        // Add image - full page size with margins
                        // Use larger dimensions to match the screenshot layout
                        const imgWidth = 180;
                        const imgHeight = 245;
                        pdf.addImage(img.src, 'JPEG', 15, 22, imgWidth, imgHeight);

                        (`✅ Added location map image: ${img.label}`);
                    } catch (err) {
                        console.warn(`Failed to add location map image ${img.label}:`, err?.message);
                    }
                }
            }

            // ===== ADD SUPPORTING DOCUMENTS: 1 per page =====
            if (supportingImgs.length > 0) {
                for (let i = 0; i < supportingImgs.length; i++) {
                    const img = supportingImgs[i];

                    try {
                        if (!img.src.startsWith('data:') && !img.src.startsWith('blob:') && !img.src.startsWith('http://') && !img.src.startsWith('https://')) {
                            continue;
                        }

                        pdf.addPage();

                        // Add image title
                        pdf.setFontSize(11);
                        pdf.setFont(undefined, 'bold');
                        pdf.text(img.label, 15, 15);

                        // Add image - 1 per page, larger size
                        const imgWidth = 180;
                        const imgHeight = 220;
                        pdf.addImage(img.src, 'JPEG', 15, 25, imgWidth, imgHeight);

                        (`✅ Added supporting document: ${img.label}`);
                    } catch (err) {
                        console.warn(`Failed to add supporting document ${img.label}:`, err?.message);
                    }
                }
            }
        } else {
            ('⏭️ No valid images to add to PDF');
        }

        // Download PDF
        const filename = `valuation_${record?.clientName || record?.uniqueId || Date.now()}.pdf`;
        pdf.save(filename);

        ('✅ PDF generated and downloaded:', filename);
        return filename;
    } catch (error) {
        console.error('❌ Client-side PDF generation error:', error);
        throw error;
    }
}

/**
 * Generate PDF using html2pdf.js with page break handling
 */
export const generateBomFlatPDFHtml2Pdf = async () => {
    try {
        // Dynamically import html2pdf to avoid SSR issues
        const html2pdf = (await import('html2pdf.js')).default;

        const element = document.getElementById("pdf-root");

        const options = {
            margin: [10, 10, 10, 10], // top, left, bottom, right (mm)
            filename: "Valuation_Report.pdf",
            image: { type: "jpeg", quality: 0.98 },

            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0,
            },

            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait",
            },

            // 🔥 MAIN GUARANTEE PART - Single page with continuous scrolling
            pagebreak: {
                mode: "avoid",
            },
        };

        html2pdf()
            .set(options)
            .from(element)
            .save();

        ('✅ PDF generated successfully with html2pdf');
    } catch (error) {
        console.error('❌ Error generating PDF with html2pdf:', error);
        throw error;
    }
};

// Alias for generateRecordPDF to match import name
export const generateBomFlatPDF = generateRecordPDF;

const pdfExportService = {
    generateValuationReportHTML,
    generateRecordPDF,
    generateBomFlatPDF,
    generateBomFlatPDFHtml2Pdf,
    previewValuationPDF,
    generateRecordPDFOffline,
    normalizeDataForPDF
};

export default pdfExportService;