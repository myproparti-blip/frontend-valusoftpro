

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

    let normalized = { ...data };

    // If data comes from MongoDB with nested objects, flatten them
    if (data.documentInformation) {
        normalized = {
            ...normalized,
            branch: data.documentInformation.branch || normalized.branch,
            dateOfInspection: data.documentInformation.dateOfInspection || normalized.dateOfInspection,
            dateOfValuation: data.documentInformation.dateOfValuation || normalized.dateOfValuation,
            valuationPurpose: data.documentInformation.valuationPurpose || normalized.valuationPurpose
        };
    }

    if (data.ownerDetails) {
        normalized = {
            ...normalized,
            ownerNameAddress: data.ownerDetails.ownerNameAddress || normalized.ownerNameAddress,
            briefDescriptionProperty: data.ownerDetails.propertyDescription || normalized.briefDescriptionProperty
        };
    }

    if (data.locationOfProperty) {
        normalized = {
            ...normalized,
            plotSurveyNo: data.locationOfProperty.plotSurveyNo || normalized.plotSurveyNo,
            doorNo: data.locationOfProperty.doorNo || normalized.doorNo,
            tpVillage: data.locationOfProperty.tsVillage || normalized.tpVillage,
            wardTaluka: data.locationOfProperty.wardTaluka || normalized.wardTaluka,
            mandalDistrict: data.locationOfProperty.mandalDistrict || normalized.mandalDistrict,
            layoutPlanIssueDate: data.locationOfProperty.dateLayoutIssueValidity || normalized.layoutPlanIssueDate,
            approvedMapAuthority: data.locationOfProperty.approvedMapIssuingAuthority || normalized.approvedMapAuthority
        };
    }

    if (data.cityAreaType) {
        normalized = {
            ...normalized,
            cityTown: data.cityAreaType.cityTown || normalized.cityTown
        };
    }

    if (data.areaClassification) {
        normalized = {
            ...normalized,
            areaClassification: data.areaClassification.areaClassification || normalized.areaClassification,
            urbanClassification: data.areaClassification.areaType || normalized.urbanClassification,
            governmentType: data.areaClassification.govGovernance || normalized.governmentType,
            govtEnactmentsCovered: data.areaClassification.stateGovernmentEnactments || normalized.govtEnactmentsCovered
        };
    }

    // Map postal address and area fields from locationOfProperty or pdfDetails
    if (data.locationOfProperty) {
        normalized = {
            ...normalized,
            postalAddress: extractAddressValue(data.locationOfProperty.postalAddress) || normalized.postalAddress,
            residentialArea: data.locationOfProperty.residentialArea || normalized.residentialArea,
            commercialArea: data.locationOfProperty.commercialArea || normalized.commercialArea,
            industrialArea: data.locationOfProperty.industrialArea || normalized.industrialArea,
            areaClassification: data.locationOfProperty.areaClassification || normalized.areaClassification
        };
    }

    // Map authentication and verification fields from pdfDetails (highest priority)
    if (data.pdfDetails) {
        normalized = {
            ...normalized,
            authenticityVerified: data.pdfDetails.authenticityVerified || normalized.authenticityVerified,
            valuerCommentOnAuthenticity: data.pdfDetails.valuerCommentOnAuthenticity || normalized.valuerCommentOnAuthenticity,
            postalAddress: extractAddressValue(data.pdfDetails.postalAddress) || normalized.postalAddress,
            residentialArea: data.pdfDetails.residentialArea !== undefined ? data.pdfDetails.residentialArea : normalized.residentialArea,
            commercialArea: data.pdfDetails.commercialArea !== undefined ? data.pdfDetails.commercialArea : normalized.commercialArea,
            industrialArea: data.pdfDetails.industrialArea !== undefined ? data.pdfDetails.industrialArea : normalized.industrialArea,
            areaClassification: data.pdfDetails.areaClassification || normalized.areaClassification
        };
    }

    if (data.propertyBoundaries?.plotBoundaries) {
        normalized = {
            ...normalized,
            boundariesPlotNorth: data.propertyBoundaries.plotBoundaries.north || normalized.boundariesPlotNorth,
            boundariesPlotSouth: data.propertyBoundaries.plotBoundaries.south || normalized.boundariesPlotSouth,
            boundariesPlotEast: data.propertyBoundaries.plotBoundaries.east || normalized.boundariesPlotEast,
            boundariesPlotWest: data.propertyBoundaries.plotBoundaries.west || normalized.boundariesPlotWest
        };
    }

    if (data.propertyDimensions) {
        normalized = {
            ...normalized,
            dimensionsDeed: data.propertyDimensions.dimensionsAsPerDeed || normalized.dimensionsDeed,
            dimensionsActual: data.propertyDimensions.actualDimensions || normalized.dimensionsActual,
            extentOfUnit: data.propertyDimensions.extent || normalized.extentOfUnit,
            latitudeLongitude: data.propertyDimensions.latitudeLongitudeCoordinates || normalized.latitudeLongitude,
            extentOfSiteValuation: data.propertyDimensions.extentSiteConsideredValuation || normalized.extentOfSiteValuation
        };
    }

    if (data.rateInfo) {
        normalized = {
            ...normalized,
            comparableRate: data.rateInfo.comparableRateSimilarUnit || normalized.comparableRate,
            adoptedBasicCompositeRate: data.rateInfo.adoptedBasicCompositeRate || normalized.adoptedBasicCompositeRate,
            buildingServicesRate: data.rateInfo.buildingServicesRate || normalized.buildingServicesRate,
            landOthersRate: data.rateInfo.landOthersRate || normalized.landOthersRate
        };
    }

    if (data.rateValuation) {
        normalized = {
            ...normalized,
            comparableRate: data.rateValuation.comparableRateSimilarUnitPerSqft || normalized.comparableRate,
            adoptedBasicCompositeRate: data.rateValuation.adoptedBasicCompositeRatePerSqft || normalized.adoptedBasicCompositeRate,
            buildingServicesRate: data.rateValuation.buildingServicesRatePerSqft || normalized.buildingServicesRate,
            landOthersRate: data.rateValuation.landOthersRatePerSqft || normalized.landOthersRate
        };
    }

    if (data.compositeRateDepreciation) {
        normalized = {
            ...normalized,
            depreciatedBuildingRate: data.compositeRateDepreciation.depreciatedBuildingRatePerSqft || normalized.depreciatedBuildingRate,
            replacementCostServices: data.compositeRateDepreciation.replacementCostUnitServicesPerSqft || normalized.replacementCostServices,
            buildingAge: data.compositeRateDepreciation.ageOfBuildingYears || normalized.buildingAge,
            buildingLife: data.compositeRateDepreciation.lifeOfBuildingEstimatedYears || normalized.buildingLife,
            depreciationPercentage: data.compositeRateDepreciation.depreciationPercentageSalvage || normalized.depreciationPercentage,
            deprecatedRatio: data.compositeRateDepreciation.depreciatedRatioBuilding || normalized.deprecatedRatio,
            totalCompositeRate: data.compositeRateDepreciation.totalCompositeRatePerSqft || normalized.totalCompositeRate,
            rateForLandOther: data.compositeRateDepreciation.rateLandOtherV3IIPerSqft || normalized.rateForLandOther,
            guidelineRate: data.compositeRateDepreciation.guidelineRatePerSqm || normalized.guidelineRate
        };
    }

    if (data.compositeRate) {
        normalized = {
            ...normalized,
            depreciatedBuildingRate: data.compositeRate.depreciatedBuildingRate || normalized.depreciatedBuildingRate,
            replacementCostServices: data.compositeRate.replacementCostUnitServices || normalized.replacementCostServices,
            buildingAge: data.compositeRate.ageOfBuilding || normalized.buildingAge,
            buildingLife: data.compositeRate.lifeOfBuildingEstimated || normalized.buildingLife,
            depreciationPercentage: data.compositeRate.depreciationPercentageSalvage || normalized.depreciationPercentage,
            deprecatedRatio: data.compositeRate.depreciatedRatioBuilding || normalized.deprecatedRatio,
            totalCompositeRate: data.compositeRate.totalCompositeRate || normalized.totalCompositeRate,
            rateForLandOther: data.compositeRate.rateLandOtherV3II || normalized.rateForLandOther,
            guidelineRate: data.compositeRate.guidelineRateRegistrar || normalized.guidelineRate
        };
    }

    if (data.valuationResults) {
        normalized = {
            ...normalized,
            fairMarketValue: data.valuationResults.fairMarketValue || normalized.fairMarketValue,
            realizableValue: data.valuationResults.realizableValue || normalized.realizableValue,
            distressValue: data.valuationResults.distressValue || normalized.distressValue,
            saleDeedValue: data.valuationResults.saleDeedValue || normalized.saleDeedValue,
            insurableValue: data.valuationResults.insurableValue || normalized.insurableValue,
            rentReceivedPerMonth: data.valuationResults.rentReceivedPerMonth || normalized.rentReceivedPerMonth,
            marketability: data.valuationResults.marketability || normalized.marketability
        };
    }

    if (data.buildingConstruction) {
        normalized = {
            ...normalized,
            yearOfConstruction: data.buildingConstruction.yearOfConstruction || normalized.yearOfConstruction,
            numberOfFloors: data.buildingConstruction.numberOfFloors || normalized.numberOfFloors,
            numberOfDwellingUnits: data.buildingConstruction.numberOfDwellingUnits || normalized.numberOfDwellingUnits,
            typeOfStructure: data.buildingConstruction.typeOfStructure || normalized.typeOfStructure,
            qualityOfConstruction: data.buildingConstruction.qualityOfConstruction || normalized.qualityOfConstruction,
            appearanceOfBuilding: data.buildingConstruction.appearanceOfBuilding || normalized.appearanceOfBuilding,
            maintenanceOfBuilding: data.buildingConstruction.maintenanceOfBuilding || normalized.maintenanceOfBuilding
        };
    }

    // Map electricityService data
    if (data.electricityService) {
        normalized = {
            ...normalized,
            electricityServiceConnectionNo: data.electricityService.electricityServiceConnectionNo || normalized.electricityServiceConnectionNo,
            meterCardName: data.electricityService.meterCardName || normalized.meterCardName
        };
    }

    // Map unitTax data
    if (data.unitTax) {
        normalized = {
            ...normalized,
            assessmentNo: data.unitTax.assessmentNo || normalized.assessmentNo,
            taxPaidName: data.unitTax.taxPaidName || normalized.taxPaidName,
            taxAmount: data.unitTax.taxAmount || normalized.taxAmount
        };
    }

    // Map unitMaintenance data (from nested object OR from pdfDetails form data)
    if (data.unitMaintenance) {
        normalized = {
            ...normalized,
            unitMaintenance: data.unitMaintenance.unitMaintenanceStatus || normalized.unitMaintenance
        };
    }
    // Also check pdfDetails for direct unitMaintenance value (form data)
    if (data.pdfDetails?.unitMaintenance && !normalized.unitMaintenance) {
        normalized.unitMaintenance = data.pdfDetails.unitMaintenance;
    }

    // Map unitSpecifications data
    if (data.unitSpecifications) {
        normalized = {
            ...normalized,
            floorUnit: data.unitSpecifications.floorLocation || normalized.floorUnit,
            doorNoUnit: data.unitSpecifications.doorNoUnit || normalized.doorNoUnit,
            roofUnit: data.unitSpecifications.roof || normalized.roofUnit,
            flooringUnit: data.unitSpecifications.flooring || normalized.flooringUnit,
            doorsUnit: data.unitSpecifications.doors || normalized.doorsUnit,
            windowsUnit: data.unitSpecifications.windows || normalized.windowsUnit,
            fittingsUnit: data.unitSpecifications.fittings || normalized.fittingsUnit,
            finishingUnit: data.unitSpecifications.finishing || normalized.finishingUnit
        };
    }

    // Map unitAreaDetails data
    if (data.unitAreaDetails) {
        normalized = {
            ...normalized,
            undividedLandArea: data.unitAreaDetails.undividedLandAreaSaleDeed || normalized.undividedLandArea,
            plinthArea: data.unitAreaDetails.plinthAreaUnit || normalized.plinthArea,
            carpetArea: data.unitAreaDetails.carpetAreaUnit || normalized.carpetArea
        };
    }

    // Map unitClassification data (from nested object OR from pdfDetails form data)
    if (data.unitClassification) {
        normalized = {
            ...normalized,
            floorSpaceIndex: data.unitClassification.floorSpaceIndex || normalized.floorSpaceIndex,
            unitClassification: data.unitClassification.unitClassification || normalized.unitClassification,
            residentialOrCommercial: data.unitClassification.residentialOrCommercial || normalized.residentialOrCommercial,
            ownerOccupiedOrLetOut: data.unitClassification.ownerOccupiedOrLetOut || normalized.ownerOccupiedOrLetOut,
            numberOfDwellingUnits: data.unitClassification.numberOfDwellingUnits || normalized.numberOfDwellingUnits
        };
    }
    // Also check pdfDetails for direct classificationPosh value (form data)
    if (data.pdfDetails?.classificationPosh && !normalized.unitClassification) {
        normalized.unitClassification = data.pdfDetails.classificationPosh;
    }

    // Map apartmentLocation data
    if (data.apartmentLocation) {
        normalized = {
            ...normalized,
            apartmentNature: data.apartmentLocation.apartmentNature || normalized.apartmentNature,
            apartmentLocation: data.apartmentLocation.apartmentLocation || normalized.apartmentLocation,
            apartmentTSNo: data.apartmentLocation.tsNo || normalized.apartmentTSNo,
            apartmentBlockNo: data.apartmentLocation.blockNo || normalized.apartmentBlockNo,
            apartmentWardNo: data.apartmentLocation.wardNo || normalized.apartmentWardNo,
            apartmentVillageMunicipalityCounty: data.apartmentLocation.villageOrMunicipality || normalized.apartmentVillageMunicipalityCounty,
            apartmentDoorNoStreetRoadPinCode: data.apartmentLocation.doorNoStreetRoadPinCode || normalized.apartmentDoorNoStreetRoadPinCode
        };
    }

    // Map monthlyRent data
    if (data.monthlyRent) {
        normalized = {
            ...normalized,
            monthlyRent: data.monthlyRent.ifRentedMonthlyRent || normalized.monthlyRent
        };
    }

    // Map marketability data
    if (data.marketability) {
        normalized = {
            ...normalized,
            marketability: data.marketability.howIsMarketability || normalized.marketability,
            favoringFactors: data.marketability.factorsFavouringExtraPotential || normalized.favoringFactors,
            negativeFactors: data.marketability.negativeFactorsAffectingValue || normalized.negativeFactors
        };
    }

    // Map signatureReport data
    if (data.signatureReport) {
        normalized = {
            ...normalized,
            valuationPlace: data.signatureReport.place || normalized.valuationPlace,
            valuationDate: data.signatureReport.signatureDate || normalized.valuationDate,
            valuersName: data.signatureReport.signerName || normalized.valuersName,
            reportDate: data.signatureReport.reportDate || normalized.reportDate
        };
    }

    // Map additionalFlatDetails data
    if (data.additionalFlatDetails) {
        normalized = {
            ...normalized,
            areaUsage: data.additionalFlatDetails.areaUsage || normalized.areaUsage,
            carpetArea: data.additionalFlatDetails.carpetAreaFlat || normalized.carpetArea
        };
    }

    // Map guidelineRate data
    if (data.guidelineRate) {
        normalized = {
            ...normalized,
            guidelineRate: data.guidelineRate.guidelineRatePerSqm || normalized.guidelineRate
        };
    }

    // Preserve image arrays - CRITICAL for PDF image display
    // Filter out empty/null images IMMEDIATELY to prevent duplicates/empty containers
    if (Array.isArray(data.propertyImages)) {
        normalized.propertyImages = data.propertyImages.filter(img => {
            if (!img) return false;
            let url = '';
            if (typeof img === 'string') {
                url = img.trim();
            } else if (typeof img === 'object') {
                url = (img.url || img.preview || img.data || img.src || img.secure_url || '').toString().trim();
            }
            return url && url.length > 0 && typeof url === 'string';
        });
    }
    if (Array.isArray(data.locationImages)) {
        normalized.locationImages = data.locationImages.filter(img => {
            if (!img) return false;
            let url = '';
            if (typeof img === 'string') {
                url = img.trim();
            } else if (typeof img === 'object') {
                url = (img.url || img.preview || img.data || img.src || img.secure_url || '').toString().trim();
            }
            return url && url.length > 0 && typeof url === 'string';
        });
    }
    if (data.areaImages && typeof data.areaImages === 'object') {
        normalized.areaImages = {};
        Object.entries(data.areaImages).forEach(([areaName, imageList]) => {
            if (Array.isArray(imageList)) {
                normalized.areaImages[areaName] = imageList.filter(img => {
                    if (!img) return false;
                    let url = '';
                    if (typeof img === 'string') {
                        url = img.trim();
                    } else if (typeof img === 'object') {
                        url = (img.url || img.preview || img.data || img.src || img.secure_url || '').toString().trim();
                    }
                    return url && url.length > 0 && typeof url === 'string';
                });
            }
        });
    }

    // Map document fields from documentsProduced (MongoDB structure - primary source)
    if (data.documentsProduced) {
        normalized.agreementForSale = data.documentsProduced.photocopyCopyAgreement || normalized.agreementForSale;
        normalized.commencementCertificate = data.documentsProduced.commencementCertificate || normalized.commencementCertificate;
        normalized.occupancyCertificate = data.documentsProduced.occupancyCertificate || normalized.occupancyCertificate;
    }

    // Map document fields from pdfDetails if available (fallback)
    if (data.pdfDetails) {
        normalized.agreementForSale = normalized.agreementForSale || data.pdfDetails.agreementForSale || data.pdfDetails.agreementSaleExecutedName;
        normalized.commencementCertificate = normalized.commencementCertificate || data.pdfDetails.commencementCertificate;
        normalized.occupancyCertificate = normalized.occupancyCertificate || data.pdfDetails.occupancyCertificate;
    }

    // Map document fields from agreementForSale nested object
    if (data.agreementForSale?.agreementForSaleExecutedName) {
        normalized.agreementForSale = normalized.agreementForSale || data.agreementForSale.agreementForSaleExecutedName;
    }

    // Also check root level fields (direct properties from response)
    normalized.agreementForSale = normalized.agreementForSale || data.agreementForSale;
    normalized.commencementCertificate = normalized.commencementCertificate || data.commencementCertificate;
    normalized.occupancyCertificate = normalized.occupancyCertificate || data.occupancyCertificate;

    // Map missing valuation detail fields from pdfDetails
    if (data.pdfDetails) {
        normalized.ratePerSqft = data.pdfDetails.presentValueRate || normalized.ratePerSqft;
        normalized.valuationItem1 = data.pdfDetails.presentValue || normalized.valuationItem1;
        normalized.totalEstimatedValue = data.pdfDetails.totalValuationItems || normalized.totalEstimatedValue;
        normalized.totalValueSay = data.pdfDetails.totalValueSay || data.pdfDetails.totalValuationItems || normalized.totalValueSay;

        // Valuation details items mapping - from valuationDetailsTable array
        if (data.pdfDetails.valuationDetailsTable?.details && Array.isArray(data.pdfDetails.valuationDetailsTable.details)) {
            normalized.valuationDetailsTable = data.pdfDetails.valuationDetailsTable;
        }

        // Fallback individual field mapping for backward compatibility
        normalized.carpetArea = data.pdfDetails.carpetArea || normalized.carpetArea;
        normalized.wardrobes = data.pdfDetails.wardrobes || normalized.wardrobes;
        normalized.showcases = data.pdfDetails.showcases || normalized.showcases;
        normalized.kitchenArrangements = data.pdfDetails.kitchenArrangements || normalized.kitchenArrangements;
        normalized.superfineFinish = data.pdfDetails.superfineFinish || normalized.superfineFinish;
        normalized.interiorDecorations = data.pdfDetails.interiorDecorations || normalized.interiorDecorations;
        normalized.electricityDeposits = data.pdfDetails.electricityDeposits || normalized.electricityDeposits;
        normalized.collapsibleGates = data.pdfDetails.collapsibleGates || normalized.collapsibleGates;
        normalized.potentialValue = data.pdfDetails.potentialValue || normalized.potentialValue;
        normalized.otherItems = data.pdfDetails.otherItems || normalized.otherItems;

        // Valuation results mapping
        normalized.marketValue = data.pdfDetails.fairMarketValue || normalized.marketValue;
        normalized.marketValueWords = data.pdfDetails.fairMarketValueWords || normalized.marketValueWords;
        normalized.finalMarketValue = data.pdfDetails.fairMarketValue || normalized.finalMarketValue;
        normalized.finalMarketValueWords = data.pdfDetails.fairMarketValueWords || normalized.finalMarketValueWords;
        normalized.realisableValue = data.pdfDetails.realizableValue || normalized.realisableValue;
        normalized.realisableValueWords = data.pdfDetails.realizableValue || normalized.realisableValueWords;
        normalized.finalDistressValue = data.pdfDetails.distressValue || normalized.finalDistressValue;
        normalized.finalDistressValueWords = data.pdfDetails.distressValue || normalized.finalDistressValueWords;
        normalized.readyReckonerValue = data.pdfDetails.totalJantriValue || normalized.readyReckonerValue;
        normalized.readyReckonerValueWords = data.pdfDetails.totalJantriValue || normalized.readyReckonerValueWords;
        normalized.insurableValueWords = data.pdfDetails.insurableValue || normalized.insurableValueWords;
    }

    return normalized;
};

export function generateValuationReportHTML(data = {}) {
    // Normalize data structure first - flatten nested MongoDB objects
    const normalizedData = normalizeDataForPDF(data);

    // Debug logging to verify data is being received
    console.log('🔍 PDF Data Received:', {
        hasData: !!data,
        hasRootFields: {
            uniqueId: !!data?.uniqueId,
            bankName: !!data?.bankName,
            clientName: !!data?.clientName,
            city: !!data?.city
        },
        hasPdfDetails: !!data?.pdfDetails,
        pdfDetailsKeys: Object.keys(data?.pdfDetails || {}).length,
        pdfDetailsSample: {
            postalAddress: data?.pdfDetails?.postalAddress,
            residentialArea: data?.pdfDetails?.residentialArea,
            areaClassification: data?.pdfDetails?.areaClassification,
            inspectionDate: data?.pdfDetails?.inspectionDate,
            agreementForSale: data?.pdfDetails?.agreementForSale
        },
        hasPropertyImages: data?.propertyImages?.length || 0,
        hasLocationImages: data?.locationImages?.length || 0,
        normalizedKeys: Object.keys(normalizedData).length
    });

    // Start with normalized data, then merge with root level data and pdfDetails
    let pdfData = normalizedData;

    // Merge root level data first
    pdfData = {
        ...pdfData,
        ...data
    };

    // Flatten pdfDetails into root level for easier access (pdfDetails has HIGHEST priority as it contains form data)
    // This ensures ALL form fields from pdfDetails are available for the PDF template and overrides other sources
    // BUT preserve propertyImages, locationImages, documentPreviews, and areaImages arrays
    if (data?.pdfDetails && typeof data.pdfDetails === 'object') {
        const preservedPropertyImages = pdfData.propertyImages;
        const preservedLocationImages = pdfData.locationImages;
        const preservedDocumentPreviews = pdfData.documentPreviews;
        const preservedAreaImages = pdfData.areaImages;

        pdfData = {
            ...pdfData,
            ...data.pdfDetails
        };

        // Restore image arrays if they exist
        if (preservedPropertyImages) {
            pdfData.propertyImages = preservedPropertyImages;
        }
        if (preservedLocationImages) {
            pdfData.locationImages = preservedLocationImages;
        }
        if (preservedDocumentPreviews) {
            pdfData.documentPreviews = preservedDocumentPreviews;
        }
        if (preservedAreaImages) {
            pdfData.areaImages = preservedAreaImages;
        }

        // Map pdfDetails field names to template field names
        // classificationPosh -> unitClassification (for PDF template)
        if (data.pdfDetails.classificationPosh) {
            pdfData.unitClassification = data.pdfDetails.classificationPosh;
        } else if (typeof pdfData.unitClassification === 'object' && pdfData.unitClassification?.unitClassification) {
            // Extract from nested object if it exists
            pdfData.unitClassification = pdfData.unitClassification.unitClassification;
        }

        // Ensure unitMaintenance is in pdfData (should already be there from spread)
        if (data.pdfDetails.unitMaintenance) {
            pdfData.unitMaintenance = data.pdfDetails.unitMaintenance;
        } else if (typeof pdfData.unitMaintenance === 'object' && pdfData.unitMaintenance?.unitMaintenanceStatus) {
            // Extract from nested object if it exists
            pdfData.unitMaintenance = pdfData.unitMaintenance.unitMaintenanceStatus;
        }

        // DEBUG: Log field mapping
        console.log('🔧 Field Mapping Debug:', {
            allPdfDetailsKeys: Object.keys(data.pdfDetails),
            classificationPosh: data.pdfDetails.classificationPosh,
            unitMaintenance: data.pdfDetails.unitMaintenance,
            pdfDataUnitClassification: pdfData.unitClassification,
            pdfDataUnitMaintenance: pdfData.unitMaintenance,
            pdfDetailsUnitMaintenance: data.pdfDetails.unitMaintenance,
            pdfDetailsClassificationPosh: data.pdfDetails.classificationPosh
        });
    }

    // Flatten facilities object if it exists
    if (data?.facilities && typeof data.facilities === 'object') {
        pdfData = {
            ...pdfData,
            ...data.facilities
        };
    }

    // Comprehensive field name mapping for backward compatibility
    pdfData = {
        ...pdfData,
        // Basic info
        branch: pdfData.branch || pdfData.pdfDetails?.branch,
        valuationPurpose: pdfData.valuationPurpose || pdfData.pdfDetails?.valuationPurpose || pdfData.pdfDetails?.purposeOfValuation,
        inspectionDate: pdfData.inspectionDate || pdfData.dateOfInspection || pdfData.pdfDetails?.inspectionDate || pdfData.pdfDetails?.dateOfInspection,
        valuationMadeDate: pdfData.valuationMadeDate || pdfData.dateOfValuation || pdfData.pdfDetails?.valuationMadeDate || pdfData.pdfDetails?.dateOfValuationMade,
        agreementForSale: pdfData.agreementForSale || pdfData.pdfDetails?.agreementForSale,
        commencementCertificate: pdfData.commencementCertificate || pdfData.pdfDetails?.commencementCertificate,
        occupancyCertificate: pdfData.occupancyCertificate || pdfData.pdfDetails?.occupancyCertificate,
        ownerNameAddress: pdfData.ownerNameAddress || pdfData.pdfDetails?.ownerNameAddress,
        briefDescriptionProperty: pdfData.briefDescriptionProperty || pdfData.pdfDetails?.briefDescriptionProperty,

        // Location of property
        plotNo: pdfData.plotNo || pdfData.plotSurveyNo || pdfData.pdfDetails?.plotSurveyNo,
        doorNo: pdfData.doorNo || pdfData.pdfDetails?.doorNo,
        tsNoVillage: pdfData.tsNoVillage || pdfData.tpVillage || pdfData.pdfDetails?.tpVillage,
        wardTaluka: pdfData.wardTaluka || pdfData.pdfDetails?.wardTaluka,
        mandalDistrict: pdfData.mandalDistrict || pdfData.pdfDetails?.mandalDistrict,
        layoutIssueDate: pdfData.layoutIssueDate || pdfData.layoutPlanIssueDate || pdfData.pdfDetails?.layoutPlanIssueDate,
        approvedMapAuthority: pdfData.approvedMapAuthority || pdfData.pdfDetails?.approvedMapAuthority,
        mapVerified: pdfData.mapVerified || pdfData.authenticityVerified,
        valuersComments: pdfData.valuersComments || pdfData.valuerCommentOnAuthenticity,
        postalAddress: extractAddressValue(pdfData.postalAddress) || extractAddressValue(pdfData.pdfDetails?.postalAddress),
        cityTown: pdfData.cityTown || pdfData.pdfDetails?.cityTown,
        residentialArea: pdfData.residentialArea,
        commercialArea: pdfData.commercialArea,
        industrialArea: pdfData.industrialArea,
        areaClassification: pdfData.areaClassification || pdfData.pdfDetails?.areaClassification,
        urbanType: pdfData.urbanType || pdfData.urbanClassification || pdfData.pdfDetails?.urbanClassification,
        jurisdictionType: pdfData.jurisdictionType || pdfData.governmentType || pdfData.pdfDetails?.governmentType,
        enactmentCovered: pdfData.enactmentCovered || pdfData.govtEnactmentsCovered || pdfData.pdfDetails?.govtEnactmentsCovered,

        // Boundaries
        boundariesPlotNorthDeed: pdfData.boundariesPlotNorthDeed || pdfData.pdfDetails?.boundariesPlotNorthDeed,
        boundariesPlotNorthActual: pdfData.boundariesPlotNorthActual || pdfData.pdfDetails?.boundariesPlotNorthActual,
        boundariesPlotSouthDeed: pdfData.boundariesPlotSouthDeed || pdfData.pdfDetails?.boundariesPlotSouthDeed,
        boundariesPlotSouthActual: pdfData.boundariesPlotSouthActual || pdfData.pdfDetails?.boundariesPlotSouthActual,
        boundariesPlotEastDeed: pdfData.boundariesPlotEastDeed || pdfData.pdfDetails?.boundariesPlotEastDeed,
        boundariesPlotEastActual: pdfData.boundariesPlotEastActual || pdfData.pdfDetails?.boundariesPlotEastActual,
        boundariesPlotWestDeed: pdfData.boundariesPlotWestDeed || pdfData.pdfDetails?.boundariesPlotWestDeed,
        boundariesPlotWestActual: pdfData.boundariesPlotWestActual || pdfData.pdfDetails?.boundariesPlotWestActual,
        boundariesShopNorthDeed: pdfData.boundariesShopNorthDeed || pdfData.pdfDetails?.boundariesShopNorthDeed,
        boundariesShopNorthActual: pdfData.boundariesShopNorthActual || pdfData.pdfDetails?.boundariesShopNorthActual,
        boundariesShopSouthDeed: pdfData.boundariesShopSouthDeed || pdfData.pdfDetails?.boundariesShopSouthDeed,
        boundariesShopSouthActual: pdfData.boundariesShopSouthActual || pdfData.pdfDetails?.boundariesShopSouthActual,
        boundariesShopEastDeed: pdfData.boundariesShopEastDeed || pdfData.pdfDetails?.boundariesShopEastDeed,
        boundariesShopEastActual: pdfData.boundariesShopEastActual || pdfData.pdfDetails?.boundariesShopEastActual,
        boundariesShopWestDeed: pdfData.boundariesShopWestDeed || pdfData.pdfDetails?.boundariesShopWestDeed,
        boundariesShopWestActual: pdfData.boundariesShopWestActual || pdfData.pdfDetails?.boundariesShopWestActual,
        // Legacy fields for backward compatibility
        boundariesPlotNorth: pdfData.boundariesPlotNorth,
        boundariesPlotSouth: pdfData.boundariesPlotSouth,
        boundariesPlotEast: pdfData.boundariesPlotEast,
        boundariesPlotWest: pdfData.boundariesPlotWest,
        boundariesShopNorth: pdfData.boundariesShopNorth,
        boundariesShopSouth: pdfData.boundariesShopSouth,
        boundariesShopEast: pdfData.boundariesShopEast,
        boundariesShopWest: pdfData.boundariesShopWest,

        // Dimensions
        dimensionsDeed: pdfData.dimensionsDeed,
        dimensionsActual: pdfData.dimensionsActual,
        extentUnit: pdfData.extentUnit || pdfData.extent || pdfData.extentOfUnit,
        coordinates: pdfData.coordinates,
        latitudeLongitude: pdfData.latitudeLongitude,
        extentSiteValuation: pdfData.extentSiteValuation || pdfData.extentOfSiteValuation,

        // Apartment Building
        apartmentNature: pdfData.apartmentNature,
        apartmentLocation: pdfData.apartmentLocation,
        apartmentTSNo: pdfData.apartmentTSNo || pdfData.tsNo || pdfData.apartmentLocation?.tsNo,
        apartmentBlockNo: pdfData.apartmentBlockNo || pdfData.blockNo,
        apartmentWardNo: pdfData.apartmentWardNo || pdfData.wardNo,
        apartmentMunicipality: pdfData.apartmentMunicipality || pdfData.apartmentVillageMunicipalityCounty || pdfData.villageOrMunicipality,
        apartmentDoorNoPin: pdfData.apartmentDoorNoPin || pdfData.apartmentDoorNoStreetRoadPinCode || pdfData.doorNoStreetRoadPinCode,
        localityDescription: pdfData.localityDescription || pdfData.descriptionOfLocalityResidentialCommercialMixed,
        yearConstruction: pdfData.yearConstruction || pdfData.yearOfConstruction,
        numberOfFloors: pdfData.numberOfFloors,
        structureType: pdfData.structureType || pdfData.typeOfStructure,
        numberOfDwellingUnits: pdfData.numberOfDwellingUnits || pdfData.dwellingUnits || pdfData.numberOfDwellingUnitsInBuilding,
        qualityConstruction: pdfData.qualityConstruction || pdfData.qualityOfConstruction,
        buildingAppearance: pdfData.buildingAppearance || pdfData.appearanceOfBuilding,
        buildingMaintenance: pdfData.buildingMaintenance || pdfData.maintenanceOfBuilding,
        unitMaintenance: pdfData.unitMaintenance || pdfData.unitMaintenanceStatus || pdfData.pdfDetails?.unitMaintenance || data?.unitMaintenance?.unitMaintenanceStatus,
        unitClassification: pdfData.unitClassification || pdfData.pdfDetails?.classificationPosh || data?.unitClassification?.unitClassification,
        facilityLift: pdfData.facilityLift || pdfData.liftAvailable,
        facilityWater: pdfData.facilityWater || pdfData.protectedWaterSupply,
        facilitySump: pdfData.facilitySump || pdfData.undergroundSewerage,
        facilityParking: pdfData.facilityParking || pdfData.carParkingType || pdfData.carParkingOpenCovered,
        compoundWall: pdfData.compoundWall || pdfData.compoundWallExisting || pdfData.isCompoundWallExisting,
        pavement: pdfData.pavement || pdfData.pavementAroundBuilding || pdfData.isPavementLaidAroundBuilding,

        // Unit (with multiple name variants)
        floorUnit: pdfData.floorUnit || pdfData.floorLocation || pdfData.unitFloor || pdfData.pdfDetails?.unitFloor,
        doorNoUnit: pdfData.doorNoUnit || pdfData.unitDoorNo || pdfData.pdfDetails?.unitDoorNo,
        roofUnit: pdfData.roofUnit || pdfData.roof || pdfData.unitRoof || pdfData.pdfDetails?.unitRoof,
        flooringUnit: pdfData.flooringUnit || pdfData.flooring || pdfData.unitFlooring || pdfData.pdfDetails?.unitFlooring,
        doorsUnit: pdfData.doorsUnit || pdfData.doors || pdfData.unitDoors || pdfData.pdfDetails?.unitDoors,
        windowsUnit: pdfData.windowsUnit || pdfData.windows || pdfData.unitWindows || pdfData.pdfDetails?.unitWindows,
        fittingsUnit: pdfData.fittingsUnit || pdfData.fittings || pdfData.unitFittings || pdfData.pdfDetails?.unitFittings,
        finishingUnit: pdfData.finishingUnit || pdfData.finishing || pdfData.unitFinishing || pdfData.pdfDetails?.unitFinishing,
        electricityConnectionNo: pdfData.electricityConnectionNo || pdfData.electricityServiceNo || pdfData.electricityServiceConnectionNo || pdfData.pdfDetails?.electricityServiceNo,
        agreementForSale: pdfData.agreementForSale || pdfData.agreementSaleExecutedName || pdfData.pdfDetails?.agreementSaleExecutedName,
        undividedLandArea: pdfData.undividedLandArea || pdfData.undividedAreaLand || pdfData.undividedArea || pdfData.pdfDetails?.undividedAreaLand,
        assessmentNo: pdfData.assessmentNo || pdfData.pdfDetails?.assessmentNo || data?.unitTax?.assessmentNo,
        taxPaidName: pdfData.taxPaidName || pdfData.pdfDetails?.taxPaidName || data?.unitTax?.taxPaidName,
        taxAmount: pdfData.taxAmount || pdfData.pdfDetails?.taxAmount || data?.unitTax?.taxAmount,
        meterCardName: pdfData.meterCardName || pdfData.pdfDetails?.meterCardName,

        // Occupancy fields
        occupancyType: pdfData.occupancyType || pdfData.pdfDetails?.occupancyType,
        tenantSince: pdfData.tenantSince || pdfData.pdfDetails?.tenantSince,
        constructionStatus: pdfData.constructionStatus || pdfData.pdfDetails?.constructionStatus,
        builderRemarks: pdfData.builderRemarks || pdfData.pdfDetails?.builderRemarks,

        // Valuation values
        carpetArea: pdfData.carpetArea || pdfData.carpetAreaFlat || pdfData.pdfDetails?.carpetAreaFlat,
        plinthArea: pdfData.plinthArea || pdfData.pdfDetails?.plinthArea,
        undividedLandArea: pdfData.undividedLandArea || pdfData.undividedLandAreaSaleDeed || pdfData.undividedAreaLand || pdfData.pdfDetails?.undividedAreaLand,
        ratePerSqft: pdfData.ratePerSqft || pdfData.presentValueRate || pdfData.adoptedBasicCompositeRate || pdfData.pdfDetails?.presentValueRate || pdfData.pdfDetails?.adoptedBasicCompositeRate,
        marketValue: pdfData.marketValue || pdfData.fairMarketValue || pdfData.pdfDetails?.fairMarketValue,
        marketValueWords: pdfData.marketValueWords || pdfData.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValue,
        distressValue: pdfData.distressValue || pdfData.pdfDetails?.distressValue,
        distressValueWords: pdfData.distressValueWords || pdfData.pdfDetails?.distressValueWords || pdfData.pdfDetails?.distressValue,
        saleDeedValue: pdfData.saleDeedValue || pdfData.pdfDetails?.saleDeedValue,
        finalMarketValue: pdfData.finalMarketValue || pdfData.fairMarketValue || pdfData.pdfDetails?.fairMarketValue,
        finalMarketValueWords: pdfData.finalMarketValueWords || pdfData.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValue,
        realisableValue: pdfData.realisableValue || pdfData.realizableValue || pdfData.pdfDetails?.realizableValue,
        realisableValueWords: pdfData.realisableValueWords || pdfData.pdfDetails?.realisableValueWords || pdfData.pdfDetails?.realizableValue,
        finalDistressValue: pdfData.finalDistressValue || pdfData.distressValue || pdfData.pdfDetails?.distressValue,
        finalDistressValueWords: pdfData.finalDistressValueWords || pdfData.distressValueWords || pdfData.pdfDetails?.distressValueWords || pdfData.pdfDetails?.distressValue,
        readyReckonerValue: pdfData.readyReckonerValue || pdfData.totalJantriValue || pdfData.pdfDetails?.readyReckonerValue || pdfData.pdfDetails?.totalJantriValue,
        readyReckonerValueWords: pdfData.readyReckonerValueWords || pdfData.totalJantriValue || pdfData.pdfDetails?.readyReckonerValueWords || pdfData.pdfDetails?.readyReckonerValue || pdfData.pdfDetails?.totalJantriValue,
        readyReckonerYear: pdfData.readyReckonerYear || pdfData.pdfDetails?.readyReckonerYear || new Date().getFullYear(),
        insurableValue: pdfData.insurableValue || pdfData.pdfDetails?.insurableValue,
        insurableValueWords: pdfData.insurableValueWords || pdfData.pdfDetails?.insurableValueWords || pdfData.pdfDetails?.insurableValue,
        monthlyRent: pdfData.monthlyRent || pdfData.pdfDetails?.monthlyRent,
        rentReceivedPerMonth: pdfData.rentReceivedPerMonth || pdfData.pdfDetails?.rentReceivedPerMonth || pdfData.pdfDetails?.monthlyRent,
        marketability: pdfData.marketability || pdfData.pdfDetails?.marketability,
        marketabilityRating: pdfData.marketability || pdfData.pdfDetails?.marketability,
        favoringFactors: pdfData.favoringFactors || pdfData.pdfDetails?.favoringFactors,
        negativeFactors: pdfData.negativeFactors || pdfData.pdfDetails?.negativeFactors,
        compositeRateAnalysis: pdfData.comparableRate,
        newConstructionRate: pdfData.adoptedBasicCompositeRate,

        // Signature & Report
        valuationPlace: pdfData.valuationPlace || pdfData.place,
        valuationDate: pdfData.valuationDate || pdfData.signatureDate,
        valuersName: pdfData.valuersName || pdfData.signerName,
        valuersCompany: pdfData.valuersCompany,
        valuersLicense: pdfData.valuersLicense,
        reportDate: pdfData.reportDate,

        // Rate information
        comparableRate: pdfData.comparableRate || pdfData.pdfDetails?.comparableRate,
        adoptedBasicCompositeRate: pdfData.adoptedBasicCompositeRate || pdfData.pdfDetails?.adoptedBasicCompositeRate,
        buildingServicesRate: pdfData.buildingServicesRate || pdfData.pdfDetails?.buildingServicesRate,
        landOthersRate: pdfData.landOthersRate || pdfData.pdfDetails?.landOthersRate,
        guidelineRate: pdfData.guidelineRate || pdfData.pdfDetails?.guidelineRate,

        // Depreciation & Rate
        depreciatedBuildingRateFinal: pdfData.depreciatedBuildingRateFinal || pdfData.depreciatedBuildingRate || pdfData.pdfDetails?.depreciatedBuildingRate,
        replacementCostServices: pdfData.replacementCostServices || pdfData.pdfDetails?.replacementCostServices,
        buildingAgeDepreciation: pdfData.buildingAgeDepreciation || pdfData.buildingAge || pdfData.pdfDetails?.buildingAge,
        buildingLifeEstimated: pdfData.buildingLifeEstimated || pdfData.buildingLife || pdfData.pdfDetails?.buildingLife,
        depreciationPercentageFinal: pdfData.depreciationPercentageFinal || pdfData.depreciationPercentage || pdfData.pdfDetails?.depreciationPercentage,
        depreciatedRatio: pdfData.depreciatedRatio || pdfData.deprecatedRatio || pdfData.pdfDetails?.deprecatedRatio,
        totalCompositeRate: pdfData.totalCompositeRate || pdfData.pdfDetails?.totalCompositeRate,
        rateLandOther: pdfData.rateLandOther || pdfData.rateForLandOther || pdfData.pdfDetails?.rateForLandOther,
        totalEstimatedValue: pdfData.totalEstimatedValue || pdfData.totalValuationItems || pdfData.pdfDetails?.totalValuationItems,
        totalValueSay: pdfData.totalValueSay || pdfData.pdfDetails?.totalValueSay,

        // Valuation items - Qty/Rate/Value variants
        valuationItem1: pdfData.valuationItem1 || pdfData.presentValue || pdfData.pdfDetails?.presentValue,
        presentValueQty: pdfData.presentValueQty || pdfData.pdfDetails?.presentValueQty,
        presentValueRate: pdfData.presentValueRate || pdfData.pdfDetails?.presentValueRate,
        wardrobesQty: pdfData.wardrobesQty || pdfData.pdfDetails?.wardrobesQty,
        wardrobesRate: pdfData.wardrobesRate || pdfData.pdfDetails?.wardrobesRate,
        wardrobes: pdfData.wardrobes || pdfData.pdfDetails?.wardrobes,
        showcasesQty: pdfData.showcasesQty || pdfData.pdfDetails?.showcasesQty,
        showcasesRate: pdfData.showcasesRate || pdfData.pdfDetails?.showcasesRate,
        showcases: pdfData.showcases || pdfData.pdfDetails?.showcases,
        kitchenArrangementsQty: pdfData.kitchenArrangementsQty || pdfData.pdfDetails?.kitchenArrangementsQty,
        kitchenArrangementsRate: pdfData.kitchenArrangementsRate || pdfData.pdfDetails?.kitchenArrangementsRate,
        kitchenArrangements: pdfData.kitchenArrangements || pdfData.pdfDetails?.kitchenArrangements,
        superfineFinishQty: pdfData.superfineFinishQty || pdfData.pdfDetails?.superfineFinishQty,
        superfineFinishRate: pdfData.superfineFinishRate || pdfData.pdfDetails?.superfineFinishRate,
        superfineFinish: pdfData.superfineFinish || pdfData.pdfDetails?.superfineFinish,
        interiorDecorationsQty: pdfData.interiorDecorationsQty || pdfData.pdfDetails?.interiorDecorationsQty,
        interiorDecorationsRate: pdfData.interiorDecorationsRate || pdfData.pdfDetails?.interiorDecorationsRate,
        interiorDecorations: pdfData.interiorDecorations || pdfData.pdfDetails?.interiorDecorations,
        electricityDepositsQty: pdfData.electricityDepositsQty || pdfData.pdfDetails?.electricityDepositsQty,
        electricityDepositsRate: pdfData.electricityDepositsRate || pdfData.pdfDetails?.electricityDepositsRate,
        electricityDeposits: pdfData.electricityDeposits || pdfData.pdfDetails?.electricityDeposits,
        collapsibleGatesQty: pdfData.collapsibleGatesQty || pdfData.pdfDetails?.collapsibleGatesQty,
        collapsibleGatesRate: pdfData.collapsibleGatesRate || pdfData.pdfDetails?.collapsibleGatesRate,
        collapsibleGates: pdfData.collapsibleGates || pdfData.pdfDetails?.collapsibleGates,
        potentialValueQty: pdfData.potentialValueQty || pdfData.pdfDetails?.potentialValueQty,
        potentialValueRate: pdfData.potentialValueRate || pdfData.pdfDetails?.potentialValueRate,
        potentialValue: pdfData.potentialValue || pdfData.pdfDetails?.potentialValue,
        otherItemsQty: pdfData.otherItemsQty || pdfData.pdfDetails?.otherItemsQty,
        otherItemsRate: pdfData.otherItemsRate || pdfData.pdfDetails?.otherItemsRate,
        otherItems: pdfData.otherItems || pdfData.pdfDetails?.otherItems,
        totalValuationItems: pdfData.totalValuationItems || pdfData.pdfDetails?.totalValuationItems,

        // Valuation Details Table
        valuationDetailsTable: pdfData.valuationDetailsTable || pdfData.pdfDetails?.valuationDetailsTable,
        classificationPosh: pdfData.pdfDetails?.classificationPosh || pdfData.unitClassification || pdfData.classificationPosh,
        classificationUsage: pdfData.residentialOrCommercial || pdfData.classificationUsage || pdfData.pdfDetails?.classificationUsage,
        residentialOrCommercial: pdfData.residentialOrCommercial || pdfData.classificationUsage || pdfData.pdfDetails?.classificationUsage,
        classificationOwnership: pdfData.ownerOccupiedOrLetOut || pdfData.classificationOwnership || pdfData.pdfDetails?.classificationOwnership,
        ownerOccupiedOrLetOut: pdfData.ownerOccupiedOrLetOut || pdfData.classificationOwnership || pdfData.pdfDetails?.classificationOwnership,
        floorSpaceIndex: pdfData.floorSpaceIndex || pdfData.pdfDetails?.floorSpaceIndex,

        // Banker & Declarations
        bankerSignatureDate: pdfData.bankerSignatureDate,
        declarationB: pdfData.declarationB,
        declarationD: pdfData.declarationD,
        declarationE: pdfData.declarationE,
        declarationI: pdfData.declarationI,
        declarationJ: pdfData.declarationJ,
        memberSinceDate: pdfData.memberSinceDate,

        // Additional info
        assetBackgroundInfo: pdfData.assetBackgroundInfo,
        valuationPurposeAuthority: pdfData.valuationPurposeAuthority,
        valuersIdentity: pdfData.valuersIdentity,
        valuersConflictDisclosure: pdfData.valuersConflictDisclosure,
        dateOfAppointment: pdfData.dateOfAppointment,
        inspectionsUndertaken: pdfData.inspectionsUndertaken,
        informationSources: pdfData.informationSources,
        valuationProcedures: pdfData.valuationProcedures,
        reportRestrictions: pdfData.reportRestrictions,
        majorFactors: pdfData.majorFactors,
        additionalFactors: pdfData.additionalFactors,
        caveatsLimitations: pdfData.caveatsLimitations,

        // Additional flat details
        areaUsage: pdfData.areaUsage,

        // CRITICAL: Ensure images are preserved in final pdfData (with strict empty filtering)
        propertyImages: (pdfData.propertyImages && pdfData.propertyImages.length > 0) ? pdfData.propertyImages : (data?.propertyImages && data.propertyImages.length > 0) ? data.propertyImages : [],
        locationImages: (pdfData.locationImages && pdfData.locationImages.length > 0) ? pdfData.locationImages : (data?.locationImages && data.locationImages.length > 0) ? data.locationImages : []
    };

    // Debug: Log critical fields for troubleshooting
    console.log('🔍 PDF Field Extraction Debug:', {
        areaClassification: pdfData.areaClassification,
        postalAddress: pdfData.postalAddress,
        postalAddressRaw: data?.postalAddress,
        pdfDetailsPostalAddress: data?.pdfDetails?.postalAddress,
        cityTown: pdfData.cityTown,
        urbanType: pdfData.urbanType
    });

    // NOTE: Images are now rendered in the PAGE 14+ section using allImages array
    // The old propertyImagesHTML and locationImagesHTML variables have been removed to prevent duplication

    // DEBUG: Log final pdfData before rendering
    console.log('📋 Final pdfData before HTML rendering:', {
        unitMaintenance: pdfData.unitMaintenance,
        unitClassification: pdfData.unitClassification,
        classificationPosh: pdfData.classificationPosh,
        safeGetTest_unitMaintenance: safeGet(pdfData, 'unitMaintenance'),
        safeGetTest_unitClassification: safeGet(pdfData, 'unitClassification'),
        hasPropertyImages: !!pdfData.propertyImages,
        propertyImagesCount: pdfData.propertyImages?.length || 0,
        hasLocationImages: !!pdfData.locationImages,
        locationImagesCount: pdfData.locationImages?.length || 0,
        hasDocumentPreviews: !!pdfData.documentPreviews,
        documentPreviewsCount: pdfData.documentPreviews?.length || 0
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valuation Report - ${safeGet(data, 'clientName')} - ${safeGet(data, 'bankName')}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      font-size: 12pt;
      line-height: 1.3;
      color: #000;
      background: white;
    }

    .page { 
      page-break-after: auto !important;
      page-break-before: always !important;
      break-after: page !important;
      break-before: page !important;
      padding: 12mm;
      background: white; 
      width: 100%;
      max-width: 210mm;
      box-sizing: border-box;
      overflow: visible !important;
      display: block !important;
      clear: both !important;
      margin: 0 !important;
      page-break-inside: avoid !important;
    }

    .page-cover {
      padding: 10mm 8mm 12mm 8mm;
      display: block;
      width: 210mm;
    }

    .cover-header {
      margin-top: 40mm;
      margin-bottom: 0;
      text-align: left;
      padding: 0 8mm;
    }

    .cover-header p {
      margin: 3px 0;
      font-size: 12pt;
      color: #000;
    }

    .cover-title {
      text-align: center;
      margin: 0;
      border-bottom: 1px  #000;
      padding: 6px 8mm;
    }

    .cover-title h2 {
      font-size: 14pt;
      font-weight: bold;
      color: #000;
      margin-bottom: 3px;
    }

    .cover-title p {
      font-size: 12pt;
      color: #000;
      font-style: italic;
    }

    .form-table {
      width: 100%;
      border-collapse: separate; 
      border-spacing: 0;
      margin: 0;
      font-size: 12pt;
      flex: 1;
      table-layout: fixed;
      box-sizing: border-box;
    }

    .form-table.fixed-cols {
      table-layout: fixed;
    }

    .form-table tbody {
      display: table-row-group;
    }

    .form-table tr {
      height: auto;
      display: table-row;
    }

    .form-table tr:first-child {
      height: auto;
    }

    .form-table.compact tr {
      height: auto;
      min-height: 18px;
    }

    .form-table.compact td {
      padding: 3px 4px;
      min-height: 18px;
    }

 .form-table td {
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      padding: 8px 12px;
      vertical-align: top !important;
      color: #000;
      background: white;
      page-break-inside: avoid;
      break-inside: avoid;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: visible;
      height: auto !important;
      font-weight: normal;
      font-size: 12pt;
    }

    /* Header row - bold borders all around */
    .form-table tr:first-child td {
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      min-height: 32px;
      height: 32px;
      padding: 5px 8px;
      vertical-align: middle;
    }

    .form-table tr:first-child td:first-child {
      border-left: 1px solid #000 !important;
    }

    .form-table tr:first-child td:last-child {
      border-right: 1px solid #000 !important;
    }

    /* Left and right edges - bold borders */
    .form-table td:first-child {
      border-left: 1px solid #000 !important;
    }

    .form-table td:last-child {
      border-right: 1px solid #000 !important;
    }

    /* Bottom row - bold borders */
    .form-table tr:last-child td {
      border-bottom: 1px solid #000 !important;
    }

    .form-table .row-num {
      width: 8%;
      min-width: 8%;
      max-width: 8%;
      text-align: center;
      font-weight: normal;
      background: #ffffffff;
      padding: 6px 4px;
      vertical-align: top !important;
      border: 1px solid #000 !important;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: visible;
      height: auto !important;
      font-size: 12pt;
    }

    .form-table .label {
      width: 42%;
      min-width: 42%;
      max-width: 42%;
      font-weight: normal;
      background: #ffffffff;
      border-right: 1px solid #000 !important;
      word-wrap: break-word;
      overflow-wrap: break-word;
      vertical-align: top;
      padding: 8px 12px;
      min-height: 40px;
      white-space: normal;
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
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
      min-height: 40px;
      white-space: normal;
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
    }

    .form-table .row-num:empty::before {
      content: '\\00a0';
      display: inline-block;
    }

    .header {
      text-align: center;
      margin-bottom: 10px;
      border-bottom: 1px  #000;
      padding-bottom: 6px;
    }

    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      color: #000;
      margin-bottom: 3px;
    }

    .header p {
      font-size: 12pt;
      color: #000;
      margin: 1px 0;
    }

    .section {
      margin-bottom: 4px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 13pt;
      font-weight: bold;
      color: #000;
      background: white;
      padding: 4px 8px;
      margin-bottom: 6px;
      border-left: 1px solid #000;
      border-bottom: 1px #000;
    }

    .section-content {
      padding: 6px 8px;
      background: white;
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 4px;
    }

    .field-row.full {
      grid-template-columns: 1fr;
    }

    .field {
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
    }

    .field-label {
      font-weight: normal;
      color: #000;
      font-size: 12pt;
      margin-bottom: 2px;
    }

    .field-value {
      color: #000;
      font-size: 12pt;
      padding: 3px;
      background: white;
      border: 1px solid #000;
      min-height: 16px;
      word-break: break-word;
    }

    .image-gallery {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .image-item {
      flex: 0 1 calc(33.333% - 6px);
      text-align: center;
      page-break-inside: avoid;
    }

    .image-item img {
      max-width: 100%;
      max-height: 100px;
      border: 1px solid #000;
      padding: 2px;
    }

    .image-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .image-container img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
      background: #fff;
    }

    .image-label {
      font-size: 12pt;
      color: #000;
      margin-top: 2px;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 12pt;
      margin-top: 6px;
      margin-bottom: 6px;
      table-layout: fixed;
    }
    
    table tbody {
      page-break-inside: auto;
      break-inside: auto;
    }

    th {
      background: #ffffffff;
      color: #000;
      padding: 4px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #000;
    }

    td {
      padding: 3px;
      border: 1px solid #000;
      color: #000;
      background: white;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      white-space: normal;
      max-width: 100%;
    }

    tr {
      page-break-inside: auto;
      break-inside: auto;
    }

    tr:nth-child(even) {
      background: white;
    }

    .footer {
      text-align: center;
      margin-top: 5px;
      padding-top: 4px;
      border-top: 1px solid #000;
      font-size: 12pt;
      color: #000;
    }

    .cover-footer {
      margin-top: auto;
      font-size: 12pt;
      border-top: 1px  #000;
      padding-top: 10px;
      color: #000;
      margin-bottom: 10px;
    }

    .continuous-wrapper {
      width: 210mm;
      margin: 0 auto;
      padding: 0;
      background: white;
    }

    .page-header {
      width: 100%;
      padding: 5mm 8mm;
      border-bottom: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12pt;
      font-weight: bold;
      page-break-after: avoid;
      margin-bottom: 5mm;
    }

    .page-footer {
      width: 100%;
      padding: 5mm 8mm;
      border-top: 1px solid #ccc;
      text-align: right;
      font-size: 12pt;
      page-break-before: avoid;
      margin-top: 5mm;
      page-break-inside: avoid;
    }

    @media print {
      body { 
        background: white;
      }
      .page { margin: 0; box-shadow: none; }
      .continuous-wrapper { margin: 0; padding: 0; }
    }
  </style>
</head>
<body>

<!-- ========== CONTINUOUS DATA TABLE ========== -->
<div class="continuous-wrapper">
  <div style="margin-top: 5mm;"></div>

  <div style="padding: 0 8mm;">
    <div class="cover-header">
    <p style="margin: 5px 0; font-size: 12pt;">Ref. No.: ${safeGet(pdfData, 'referenceNo', 'NA')}</p>
    <p style="text-align: right; margin: 5px 0; font-size: 12pt;"><strong>Date: ${formatDate(safeGet(pdfData, 'valuationMadeDate'))}</strong></p>
    <p style="margin: 5px 0; font-size: 12pt;">TO,</p>
    <p style="margin: 5px 0; font-size: 12pt;">${safeGet(data, 'bankName')}</p>
    <p style="margin: 5px 0; font-size: 12pt;">BRANCH: ${safeGet(pdfData, 'branch')}</p>
  </div>

  <div class="cover-title">
    <h2>VALUATION REPORT (IN RESPECT OF COMMERCIAL UNIT)</h2>
    <p>(To be filled in by the Approved Valuer)</p>
  </div>

  <table class="form-table" style = "border: 1px solid #000; border-left: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; border-right: 1px solid #000;">
    <tr>
      <td class="row-num"></td>
      <td class="label" style="background: #ffffffff; font-weight: bold;">I. GENERAL</td>
      <td style="background: #ffffffff;" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num">1.</td>
      <td class="label">Purpose for which the valuation is made</td>
      <td class="value" colspan="2">${safeGet(data, 'bankName')} ${safeGet(pdfData, 'branch') ? 'Br. ' + safeGet(pdfData, 'branch') : ''}</td>
      </tr>
      <tr>
         <td class="row-num">2.</td>
         <td class="label" style="padding: 4px;">a) Date of inspection</td>
         <td class="value" style="padding: 4px;" colspan="2">${formatDate(safeGet(pdfData, 'inspectionDate'))}</td>
       </tr>
       <tr>
         <td class="row-num"></td>
         <td class="label" style="padding: 4px;">b) Date on which the valuation is made</td>
         <td class="value" style="padding: 4px;" colspan="2">${formatDate(safeGet(pdfData, 'valuationMadeDate'))}</td>
       </tr>
        <tr>
         <td class="row-num">3.</td>
         <td class="label" style="padding: 4px;">List of documents produced for perusal </td>
         <td class="value" style="padding: 4px;" colspan="2"></td>
       </tr>
      <tr>
         <td class="row-num"></td>
         <td class="label" style="padding: 4px;">i) Photocopy of Agreement for sale</td>
         <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'agreementForSale')}</td>
       </tr>
       <tr>
         <td class="row-num"></td>
         <td class="label" style="padding: 4px;">ii) Commencement Certificate</td>
         <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'commencementCertificate')}</td>
       </tr>
       <tr>
         <td class="row-num"></td>
         <td class="label" style="padding: 4px;">iii) Occupancy Certificate</td>
         <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'occupancyCertificate')}</td>
       </tr>
       <tr>
         <td class="row-num">4.</td>
        <td class="label" style="padding: 4px;">Name of the owner(s) and his / their address (as) with Phone no. (details of share of each owner in case of joint ownership)</td>
        <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'ownerNameAddress')}</td>
        </tr>
        <tr>
        <td class="row-num">5.</td>
         <td class="label" style="padding: 4px;">Brief description of the property</td>
         <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'briefDescriptionProperty')}</td>
         </tr>
         <tr>
         <td class="row-num">6.</td>
         <td class="label" style="padding: 4px;">Location of property.</td>
         <td class="value" style="padding: 4px;" colspan="2"></td>
         </tr>
    <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">a) Plot No. / Survey No.</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'plotNo')}</td>
     </tr>
     <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">b) Door No.</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'doorNo')}</td>
     </tr>
     <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">c) T.S. No. / Village</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'tsNoVillage')}</td>
     </tr>
     <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">d) Ward / Taluka</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'wardTaluka')}</td>
     </tr>
     <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">e) Mandal / District</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'mandalDistrict')}</td>
     </tr>
     <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">f) Date of issue and validity of layout of approved map / plan</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'layoutIssueDate')}</td>
     </tr>
     <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">g) Approved map / plan issuing authority</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'approvedMapAuthority')}</td>
     </tr>
     <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">h) Whether genuineness or authenticity of approved map / plan is verified</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'mapVerified')}</td>
     </tr>
     <tr>
       <td class="row-num"></td>
       <td class="label" style="padding: 4px;">i) Any other comments by our empanelled valuers on authentic of authentic plan</td>
       <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'valuersComments')}</td>
     </tr>
    <tr>
      <td class="row-num">7.</td>
      <td class="label" style="padding: 4px;">Postal address of the property</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'postalAddress')}</td>
    </tr>
    <tr>
      <td class="row-num">8.</td>
      <td class="label" style="padding: 4px;">City/ Town</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'cityTown')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="border: 1px solid #000; padding: 4px; ">Residential Area</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'residentialArea')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="border: 1px solid #000; padding: 4px; ">Commercial Area</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'commercialArea')}</td>
    </tr>
    <tr>
      <td class="row-num">9.</td>
      <td class="label" style="padding: 4px;">Classification of the area</td>
      <td class="value" style="padding: 4px;" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="border: 1px solid #000; padding: 4px;  ">i) High / Middle / Poor</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'areaClassification')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="border: 1px solid #000; padding: 4px; ">ii) Urban / Semi Urban / Rural</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'urbanType')}</td>
    </tr>
    <tr>
      <td class="row-num">10</td>
      <td class="label" style="padding: 4px;">Coming under Corporation limit / Village Panchayat / Municipality</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'jurisdictionType')}</td>
    </tr>
    <tr>
      <td class="row-num">11</td>
      <td class="label" style="padding: 4px;">Whether covered under any State / Central Govt. enactments (e.g. Urban Land Ceiling Act) or notified under agency area / scheduled area / cantonment area</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'enactmentCovered')}</td>
    </tr>
    <tr>
     <td class="row-num">12a</td>
     <td class="label" style="padding: 4px;">Boundaries of the property - Plot</td>
     <td style="width: 25%; border: 1px solid #000; padding: 4px; text-align: center;">As per Deed</td>
     <td style="width: 25%; border: 1px solid #000; padding: 4px; text-align: center;">As per Actual</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="padding: 4px;">North</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesPlotNorthDeed')}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesPlotNorthActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="padding: 4px;">South</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesPlotSouthDeed')}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesPlotSouthActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="padding: 4px;">East</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesPlotEastDeed')}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesPlotEastActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="padding: 4px;">West</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesPlotWestDeed')}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesPlotWestActual')}</td>
    </tr>
    <tr>
      <td class="row-num">12b</td>
      <td class="label">Boundaries of the property - Shop</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px; text-align: center;">As per Deed</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px; text-align: center;">As per Actual</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">North</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesShopNorthDeed')}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesShopNorthActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">South</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesShopSouthDeed')}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesShopSouthActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">East</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesShopEastDeed')}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesShopEastActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">West</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesShopWestDeed')}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">${safeGet(pdfData, 'boundariesShopWestActual')}</td>
    </tr>
    <tr>
      <td class="row-num">13</td>
      <td class="label" colspan="1">Dimensions of the Unit</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: center;">A<br/>As per the Deed</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: center;">B<br/>Actual</td>
    </tr>
    <tr>
       <td class="row-num"></td>
       <td style="border: 1px solid #000; padding: 4px; text-align: left;">North<br/>South<br/>East<br/>West</td>
       <td style="border: 1px solid #000; padding: 4px; text-align: center; vertical-align: middle;">${safeGet(pdfData, 'dimensionsDeed')}</td>
       <td style="border: 1px solid #000; padding: 4px; text-align: center; vertical-align: middle;">${safeGet(pdfData, 'dimensionsActual')}</td>
      </tr>
     <tr>
       <td class="row-num">14</td>
       <td class="label" style="width: 42%; border: 1px solid #000; padding: 4px;">Extent of the Unit</td>
       <td style="width: 50%; border: 1px solid #000; padding: 4px;" colspan="2">${safeGet(pdfData, 'extentUnit') || safeGet(pdfData, 'coordinates')}</td>
     </tr>
    <tr>
      <td class="row-num">14.1</td>
      <td class="label" style="width: 42%; border: 1px solid #000; padding: 4px;">Latitude, Longitude & Co-ordinates of Unit</td>
      <td style="width: 50%; border: 1px solid #000; padding: 4px;" colspan="2">${safeGet(pdfData, 'latitudeLongitude')}</td>
    </tr>
    <tr>
      <td class="row-num">15</td>
      <td class="label" style="width: 42%; border: 1px solid #000; padding: 4px;">Extent of the site considered for valuation (least of 13 A & 13 B)</td>
      <td style="width: 50%; border: 1px solid #000; padding: 4px;" colspan="2">${safeGet(pdfData, 'extentSiteValuation')}</td>
    </tr>
    <tr>
      <td class="row-num">16</td>
      <td class="label" style="width: 42%; border: 1px solid #000; padding: 4px;">Whether occupied by the owner / tenant?  If occupied by tenant, since how long? Rent received per month.</td>
      <td style="width: 50%; border: 1px solid #000; padding: 4px;" colspan="2">
        ${(() => {
            const occupancy = safeGet(pdfData, 'occupancyType');
            if (occupancy === 'Rented') {
                const since = safeGet(pdfData, 'tenantSince');
                const rent = safeGet(pdfData, 'rentReceivedPerMonth');
                return `Tenant - Since: ${since}, Rent: ${rent}`;
            } else if (occupancy === 'UnderConstruction') {
                return `Under Construction - ${safeGet(pdfData, 'constructionStatus')}`;
            } else if (occupancy === 'Builder') {
                return `Builder Possession - ${safeGet(pdfData, 'builderRemarks')}`;
            } else if (occupancy === 'Vacant') {
                return 'Vacant';
            } else if (occupancy === 'Owner') {
                return 'Owner Occupied';
            }
            return safeGet(pdfData, 'monthlyRent') || safeGet(pdfData, 'rentReceivedPerMonth');
        })()
        }
      </td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="background: #ffffffff; font-weight: bold;">II. APARTMENT BUILDING</td>
      <td style="background: #ffffffff;" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num">1.</td>
      <td class="label">Nature of the Apartment</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'apartmentNature')}</td>
    </tr>
    <tr>
      <td class="row-num">2.</td>
      <td class="label">Location</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'apartmentLocation')}</td>
    </tr>
    <tr>
      <td class="row-num">3.</td>
      <td class="label">T. S. No.</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'apartmentTSNo')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Block No.</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'apartmentBlockNo')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Ward No.</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'apartmentWardNo')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Village/ Municipality / Corporation</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'apartmentMunicipality')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Door No., Street or Road (Pin Code)</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'apartmentDoorNoPin')}</td>
    </tr>
    <tr>
      <td class="row-num">3.</td>
      <td class="label">Description of the locality Residential / Commercial / Mixed</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'localityDescription')}</td>
    </tr>
    <tr>
      <td class="row-num">4.</td>
      <td class="label">Year of Construction</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'yearConstruction')}</td>
    </tr>
    <tr>
      <td class="row-num">5.</td>
      <td class="label">Number of Floors</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'numberOfFloors')}</td>
    </tr>
    <tr>
      <td class="row-num">6.</td>
      <td class="label">Type of Structure</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'structureType')}</td>
    </tr>
    <tr>
      <td class="row-num">7.</td>
      <td class="label">Number of Dwelling units in the building</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'numberOfDwellingUnits')}</td>
    </tr>
    <tr>
      <td class="row-num">8.</td>
      <td class="label">Quality of Construction</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'qualityConstruction')}</td>
    </tr>
    <tr style="border-top: 1px solid #000;">
      <td class="row-num">9.</td>
      <td class="label">Appearance of the Building</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'buildingAppearance')}</td>
    </tr>
    <tr>
      <td class="row-num">10.</td>
      <td class="label">Maintenance of the Building</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'buildingMaintenance')}</td>
    </tr>
    <tr>
      <td class="row-num">11.</td>
      <td class="label">Facilities Available</td>
      <td class="value" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Lift</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'facilityLift')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Protected Water Supply</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'facilityWater')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Underground / Sump</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'facilitySump')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Car Parking - Open/ Covered</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'facilityParking')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Is Compound wall existing?</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'compoundWall')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Is pavement laid around the building</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'pavement')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="background: #ffffffff; font-weight: bold;">III. UNIT</td>
      <td style="background: #ffffffff;" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num">1</td>
      <td class="label">The floor on which the Unit is situated</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'floorUnit') || safeGet(pdfData, 'unitFloor')}</td>
    </tr>
    <tr>
      <td class="row-num">2</td>
      <td class="label">Door No. of the Unit</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'doorNoUnit') || safeGet(pdfData, 'unitDoorNo')}</td>
    </tr>
    <tr>
      <td class="row-num">3</td>
      <td class="label">Specifications of the Unit</td>
      <td class="value" style="padding: 4px;" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Roof</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'roofUnit') || safeGet(pdfData, 'unitRoof')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Flooring</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'flooringUnit') || safeGet(pdfData, 'unitFlooring')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Doors</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'doorsUnit') || safeGet(pdfData, 'unitDoors')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Windows</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'windowsUnit') || safeGet(pdfData, 'unitWindows')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Fittings</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'fittingsUnit') || safeGet(pdfData, 'unitFittings')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Finishing</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'finishingUnit') || safeGet(pdfData, 'unitFinishing')}</td>
    </tr>
    <tr>
      <td class="row-num">4</td>
      <td class="label">Unit Tax</td>
      <td class="value" style="padding: 4px;" colspan="2"></td>
    </tr>
      <tr>
      <td class="row-num"></td>
      <td class="label">Assessment No.</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'assessmentNo')}</td>
      </tr>
      <tr>
      <td class="row-num"></td>
      <td class="label">Tax paid in the name of</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'taxPaidName')}</td>
      </tr>
      <tr>
      <td class="row-num"></td>
      <td class="label">Tax amount</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'taxAmount')}</td>
      </tr>
    <tr style="border-top: 1px solid #000;">
    <td class="row-num">5</td>
    <td class="label">Electricity Service Connection no.</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'electricityServiceConnectionNo')}</td>
    </tr>
    <tr>
    <td class="row-num"></td>
    <td class="label">Meter Card is in the name of</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'meterCardName')}</td>
    </tr>
    <tr>
    <td class="row-num">6</td>
    <td class="label">How is the maintenance of the Unit?</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'unitMaintenance')}</td>
    </tr>
    <tr>
    <td class="row-num">7</td>
    <td class="label">Agreement for Sale executed in the name of</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'agreementForSale') || safeGet(pdfData, 'agreementSaleExecutedName')}</td>
    </tr>
    <tr>
    <td class="row-num">8</td>
    <td class="label">What is the undivided area of land as per Sale Deed?</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'undividedLandArea') || safeGet(pdfData, 'undividedAreaLand')}</td>
    </tr>
    <tr>
    <td class="row-num">9</td>
    <td class="label">What is the plinth area of the Unit?</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'plinthArea')}</td>
    </tr>
    <tr>
    <td class="row-num">10</td>
    <td class="label">What is the floor space index (app.)</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'floorSpaceIndex')}</td>
    </tr>
    <tr>
    <td class="row-num">11</td>
    <td class="label">What is the Carpet Area of the Unit?</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'carpetArea')}</td>
    </tr>
    <tr>
    <td class="row-num">12</td>
    <td class="label">Is it Posh/ I class / Medium / Ordinary?</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'unitClassification')}</td>
    </tr>
    <tr>
    <td class="row-num">13</td>
    <td class="label">Is it being used for Residential or Commercial purpose?</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'residentialOrCommercial')}</td>
    </tr>
    <tr>
    <td class="row-num">14</td>
    <td class="label">Is it Owner-occupied or let-out?</td>
    <td class="value" colspan="2">${safeGet(pdfData, 'occupancyType')}</td>
    <!-- <td class="value" colspan="2">${safeGet(pdfData, 'ownerOccupiedOrLetOut')}</td> -->

    </tr>
    <tr>
      <td class="row-num">15.</td>
      <td class="label"> If rented, what is the monthly rent?</td>
      <td class="value" colspan="2">${safeGet(pdfData, 'rentReceivedPerMonth')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="background: #ffffffff; font-weight: bold;">IV. MARKETABILITY</td>
      <td style="background: #ffffffff;" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num">1</td>
      <td class="label">How is the marketability</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'marketabilityRating')}</td>
    </tr>
    <tr>
      <td class="row-num">2</td>
      <td class="label">What are the factors favouring for an extra Potential Value?</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'favoringFactors')}</td>
    </tr>
    <tr>
      <td class="row-num">3</td>
      <td class="label">Any negative factors are observed which affect the market value in general?</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'negativeFactors')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="background: #ffffffff; font-weight: bold;">V. RATE</td>
      <td style="background: #ffffffff;" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num">1</td>
      <td class="label">After analysing the comparable sale instances, what is the composite rate for a similar unit with same specifications in the adjoining locality? (Along with details /reference of at least two latest deals/transactions with respect in adjacent properties in the same locality</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'compositeRateAnalysis')}</td>
    </tr>
    <tr>
      <td class="row-num">2</td>
      <td class="label">Assuming it is a new construction, what is the adopted basic composite rate of the unit under valuation after comparing with the specifications and other factors with the flat under comparison (give details).</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'newConstructionRate')}</td>
    </tr>
    <tr>
      <td class="row-num">3</td>
      <td class="label">Break - up for the rate</td>
      <td class="value" style="padding: 4px;" colspan="2"></td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">i) Building + Services</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'buildingServicesRate')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">ii) Land + Others</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'landOthersRate')}</td>
    </tr>
    <tr>
      <td class="row-num">4</td>
      <td class="label">Guideline rate obtained from the Registrar's office (an evidence thereof to be enclosed)</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'guidelineRate')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label" style="background: #ffffffff;  font-weight: bold;">VI. COMPOSITE RATE ADOPTED AFTER DEPRECIATION</td>
      <td class="value"style="padding: 4px;" colspan="2" ></td>
      </tr>

    <tr>
      <td class="row-num">a.</td>
      <td class="label">Depreciated building rate</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'depreciatedBuildingRateFinal')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Replacement cost of unit with Services (v (3)i)</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'replacementCostServices')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Age of the building</td>
      <td class="value" style="padding: 4px;" colspan="2">${safeGet(pdfData, 'buildingAgeDepreciation')}</td>
    </tr>
    <tr>
    <td class="row-num"></td>
    <td class="label">Life of the building estimated</td>
    <td class="value" style="padding: 4px;" colspan="2">
     ${safeGet(pdfData, 'buildingLifeEstimated')}
    </td>
    </tr>
    
    <tr>
    <td class="row-num"></td>
    <td class="label">Depreciation percentage assuming the salvage value as 10%</td>
    <td class="value" style="padding: 4px;" colspan="2">
     ${safeGet(pdfData, 'depreciationPercentageFinal')}
    </td>
    </tr>
    
    <tr>
    <td class="row-num"></td>
    <td class="label">Depreciated Ratio of the building</td>
    <td class="value" style="padding: 4px;" colspan="2">
     ${safeGet(pdfData, 'depreciatedRatio')}
    </td>
    </tr>
    
    <tr>
    <td class="row-num">b.</td>
    <td class="label">Total composite rate arrived for valuation</td>
    <td class="value" style="padding: 4px;" colspan="2"></td>
    </tr>
    
    <tr>
    <td class="row-num"></td>
    <td class="label">Depreciated building rate VI (a) V1 (a)</td>
    <td class="value" style="padding: 4px;" colspan="2">
     ${safeGet(pdfData, 'depreciatedBuildingRate')}
    </td>
    </tr>

<tr>
   <td class="row-num"></td>
   <td class="label">Rate for Land & other V (3)i)</td>
   <td class="value" style="padding: 4px;" colspan="2">
     ${safeGet(pdfData, 'rateLandOther')}
   </td>
 </tr>
 
 <tr>
   <td class="row-num"></td>
   <td class="label">Total Composite Rate</td>
   <td class="value" style="padding: 4px;" colspan="2">
     ${safeGet(pdfData, 'totalCompositeRate')}
   </td>
 </tr>
    </table>


  <div class="details-of-valuation-section" style="margin:0 auto 20px auto; padding:0 20px; width:calc(100% - 40px); max-width:100%; box-sizing:border-box;">

  <div style="font-weight:bold; font-size:11pt; margin-bottom:12px; padding-left:4px;">
    Details of Valuation:
  </div>

  <table
    class="form-table"
    style="
      width:100%;
      max-width:100%;
      border:1px solid #000;
      border-collapse:collapse;
      table-layout:fixed;
      font-size:10pt;
      box-sizing:border-box;
      page-break-inside:auto;
      margin:0 auto;
    "
  >
    <tr style="background-color:#f0f0f0;">
      <td style="width:5%; border:1px solid #000; padding:10px 6px; font-weight:bold; text-align:center; font-size:9pt;">
        Sr.
      </td>
      <td style="width:40%; border:1px solid #000; padding:10px 8px; font-weight:bold; font-size:9pt; padding-left:12px;">
        Description
      </td>
      <td style="width:12%; border:1px solid #000; padding:10px 6px; font-weight:bold; text-align:center; font-size:9pt;">
        Qty.
      </td>
      <td style="width:21%; border:1px solid #000; padding:10px 6px; font-weight:bold; text-align:right; font-size:9pt; padding-right:16px;">
        Rate per unit Rs.
      </td>
      <td style="width:22%; border:1px solid #000; padding:10px 6px; font-weight:bold; text-align:right; font-size:9pt; padding-right:16px;">
        Estimated Value Rs.
      </td>
    </tr>

    ${pdfData.valuationDetailsTable?.details && pdfData.valuationDetailsTable.details.length > 0
            ? pdfData.valuationDetailsTable.details.map((item, idx) => `
        <tr style="page-break-inside:avoid; height:32px;">
          <td style="border:1px solid #000; padding:8px 6px; text-align:center; font-size:9pt; vertical-align:middle;">
            ${item.srNo || idx + 1}
          </td>
          <td style="border:1px solid #000; padding:8px 8px; font-size:9pt; word-wrap:break-word; overflow-wrap:break-word; padding-left:12px; vertical-align:middle;">
            ${item.description || ''}
          </td>
          <td style="border:1px solid #000; padding:8px 6px; text-align:center; font-size:9pt; vertical-align:middle;">
            ${item.qty ? parseFloat(item.qty).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : ''}
          </td>
          <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-size:9pt; padding-right:12px; vertical-align:middle;">
            ${item.ratePerUnit ? parseInt(item.ratePerUnit).toLocaleString('en-IN') : ''}
          </td>
          <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-size:9pt; padding-right:12px; vertical-align:middle;">
            ${item.estimatedValue ? parseInt(item.estimatedValue).toLocaleString('en-IN') : ''}
          </td>
        </tr>
      `).join('')
            : `
        <tr style="page-break-inside:avoid; height:32px;">
          <td style="border:1px solid #000; padding:8px 6px; text-align:center; font-size:9pt; vertical-align:middle;">1</td>
          <td style="border:1px solid #000; padding:8px 8px; font-size:9pt; word-wrap:break-word; overflow-wrap:break-word; padding-left:12px; vertical-align:middle;">Present value of the Unit (Carpet Area)</td>
          <td style="border:1px solid #000; padding:8px 6px; text-align:center; font-size:9pt; vertical-align:middle;">
            ${(() => {
                const qty = safeGet(pdfData, 'carpetAreaQty') || safeGet(pdfData, 'carpetArea');
                return qty && qty !== 'NA' ? parseFloat(qty).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '';
            })()}
          </td>
          <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-size:9pt; padding-right:12px; vertical-align:middle;">
            ${(() => {
                const rate = safeGet(pdfData, 'ratePerSqft');
                return rate && rate !== 'NA' ? parseInt(rate).toLocaleString('en-IN') : '';
            })()}
          </td>
          <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-size:9pt; padding-right:12px; vertical-align:middle;">
            ${(() => {
                const value = safeGet(pdfData, 'valuationItem1');
                return value && value !== 'NA' ? parseInt(value).toLocaleString('en-IN') : '';
            })()}
          </td>
        </tr>

        ${[
                ['2', 'Wardrobes', 'wardrobes'],
                ['3', 'Showcases', 'showcases'],
                ['4', 'Kitchen Arrangements', 'kitchenArrangements'],
                ['5', 'Superfine Finish', 'superfineFinish'],
                ['6', 'Interior Decorations', 'interiorDecorations'],
                ['7', 'Electricity deposits / electrical fittings, etc.', 'electricityDeposits'],
                ['8', 'Extra collapsible gates / grill works etc.', 'collapsibleGates'],
                ['9', 'Potential value, if any', 'potentialValue'],
                ['10', 'Others', 'otherItems']
            ].map(row => {
                const fieldName = row[2];
                const fieldData = safeGet(pdfData, fieldName);

                // Handle both object format {qty, ratePerUnit, estimatedValue} and simple value format
                let qty = '';
                let rate = '';
                let value = '';

                if (fieldData && fieldData !== 'NA') {
                    if (typeof fieldData === 'object') {
                        // Object format with qty, ratePerUnit, estimatedValue
                        qty = fieldData.qty ? parseFloat(fieldData.qty).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '';
                        rate = fieldData.ratePerUnit ? parseInt(fieldData.ratePerUnit).toLocaleString('en-IN') : '';
                        value = fieldData.estimatedValue ? parseInt(fieldData.estimatedValue).toLocaleString('en-IN') : '';
                    } else {
                        // Simple value format (backward compatibility)
                        value = parseInt(fieldData).toLocaleString('en-IN');
                    }
                }

                return `
          <tr style="page-break-inside:avoid; height:32px;">
            <td style="border:1px solid #000; padding:8px 6px; text-align:center; font-size:9pt; vertical-align:middle;">${row[0]}</td>
            <td style="border:1px solid #000; padding:8px 8px; font-size:9pt; word-wrap:break-word; overflow-wrap:break-word; padding-left:12px; vertical-align:middle;">${row[1]}</td>
            <td style="border:1px solid #000; padding:8px 6px; text-align:center; font-size:9pt; vertical-align:middle;">${qty}</td>
            <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-size:9pt; padding-right:12px; vertical-align:middle;">${rate}</td>
            <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-size:9pt; padding-right:12px; vertical-align:middle;">${value}</td>
          </tr>
        `;
            }).join('')}
      `
        }

    <tr style="page-break-inside:avoid; font-weight:bold; height:32px; background-color:#f0f0f0;">
      <td colspan="4" style="border:1px solid #000; padding:8px 12px; text-align:right; font-size:9pt; vertical-align:middle;">
        Total
      </td>
      <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-size:9pt; padding-right:12px; vertical-align:middle;">
        ${(() => {
            const total = pdfData.valuationDetailsTable?.valuationTotal || safeGet(pdfData, 'totalEstimatedValue');
            return total && total !== 'NA' ? parseInt(total).toLocaleString('en-IN') : '';
        })()}
      </td>
    </tr>

    <tr style="page-break-inside:avoid; font-weight:bold; height:32px; background-color:#f0f0f0;">
      <td colspan="4" style="border:1px solid #000; padding:8px 12px; text-align:right; font-size:9pt; vertical-align:middle;">
        Say
      </td>
      <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-size:9pt; padding-right:12px; vertical-align:middle;">
        ${(() => {
            const total = pdfData.valuationDetailsTable?.valuationTotal || safeGet(pdfData, 'totalEstimatedValue') || safeGet(pdfData, 'totalValueSay');
            const rounded = roundToNearest1000(total);
            return rounded && rounded !== 'NA' ? parseInt(rounded).toLocaleString('en-IN') : '';
        })()}
      </td>
    </tr>

  </table>
</div>
  <div style="font-size: 12pt; line-height: 1.6; margin: 12px auto 20px auto; padding: 0 20px; width: calc(100% - 40px); max-width: 100%; page-break-after: auto; box-sizing: border-box;">
  <p style="margin: 0 0 16px 0; orphans: 3; widows: 3; text-align: justify; padding-right: 4px;"><strong>(Valuation: Here, the approved valuer should discuss in details his approach to valuation of property and indicate how the value has been arrived as suggested by necessary calculation. Also, such aspects as impending threat of acquisition by government for road widening / public service purposes, sub merging & applicability of CRZ provisions (Distance from sea-coast / tidal level must be incorporated) and their effect on i) saleability ii) likely rental value in future and iii) any likely income it may generate may be discussed).</strong></p>
  
  <p style="margin: 0 0 16px 0; orphans: 3; widows: 3; padding-right: 4px;">Photograph of owner/representative with property in background to be enclosed.</p>
  
  <p style="margin: 0 0 20px 0; orphans: 3; widows: 3; text-align: justify; padding-right: 4px;">Screen shot of longitude/latitude and co-ordinates of property using GPS/various Apps/Internet sites enclosed. As a matter of own appraisal and analysis, it is my considered opinion that the present fair market value of the above property in the prevailing condition with afforded</p>
</div>

<div style="font-size: 12pt; line-height: 1.6; padding: 0 20px; margin: 20px auto 0 auto; width: calc(100% - 40px); max-width: 100%; box-sizing: border-box;">
  ${(() => {
            const totalValue = pdfData.valuationDetailsTable?.valuationTotal || safeGet(pdfData, 'totalValueSay') || pdfData.finalMarketValue || 0;
            const extentValue = safeGet(pdfData, 'extentOfUnit') || safeGet(pdfData, 'dimensionsDeed') || 1;
            const guidelineRate = safeGet(pdfData, 'guidelineRate') || 0;

            const marketValue = totalValue;
            const realisableValue = calculatePercentage(totalValue, 90);
            const distressValue = calculatePercentage(totalValue, 80);
            const insurableValue = calculatePercentage(totalValue, 35);
            const reckonerValue = Math.round(parseFloat(extentValue) * parseFloat(guidelineRate));

            return `
      <p style="margin: 0 0 14px 0; padding-right: 4px;"><strong>specifications is ${formatCurrencyWithWords(totalValue, 100)}</strong></p>
      
      <p style="margin: 0 0 14px 0; padding-right: 4px;">The distress value is <strong>${formatCurrencyWithWords(distressValue, 100)}</strong>.</p>
      </br>
      </br>
      </br>
      <p style="margin: 0 0 12px 0; text-align: justify; padding-right: 4px;">As a result of my appraisal and analysis, it is my considered opinion that the present fair market value of the above property in the prevailing condition with aforesaid specifications is</p>
      </br>
      <p style="margin: 0 0 14px 0; padding-right: 4px;">THE MARKET VALUE OF ABOVE PROPERTY IS <strong>${formatCurrencyWithWords(totalValue, 100)}</strong></p>
      
      <p style="margin: 0 0 14px 0; padding-right: 4px;">THE REALISABLE VALUE OF ABOVE PROPERTY IS <strong>${formatCurrencyWithWords(realisableValue, 100)}</strong></p>
      
      <p style="margin: 0 0 14px 0; padding-right: 4px;">THE DISTRESS VALUE OF ABOVE PROPERTY IS <strong>${formatCurrencyWithWords(distressValue, 100)}</strong></p>
      
      <p style="margin: 0 0 14px 0; padding-right: 4px;">THE READY RECKONER VALUE (GOVT. VALUE OF FLAT) IS <strong>${formatCurrencyWithWords(reckonerValue, 100)}</strong> As Ready reckoner for the year ${safeGet(pdfData, 'readyReckonerYear')}</p>
      
      <p style="margin: 0 0 20px 0; padding-right: 4px;">THE INSURABLE VALUE IS <strong>${formatCurrencyWithWords(insurableValue, 100)}</strong></p>
    `;
        })()}
  
  <div style="text-align: right; margin-top: 30px; padding-right: 4px;">
    <p style="margin: 6px 0;"><strong>"Shashikant R. Dhumal"</strong></p>
    <p style="margin: 6px 0;">Signature of Approved Valuer</p>
    <p style="margin: 6px 0;">"Engineer & Govt. Approved Valuer</p>
    <p style="margin: 6px 0 0 0;">CAT/1/143-2007</p>
  </div>
</div>
      
  <div style="margin: 25px auto 0 auto; padding: 15px 20px 0 20px; font-size: 12pt; line-height: 1.5; width: calc(100% - 40px); max-width: 100%; box-sizing: border-box;">
  <p style="margin: 0 0 14px 0; padding-right: 4px; text-align: justify;">The undersigned has inspected the property detailed in the Valuation Report dated _____________ on _____________. We are satisfied that the fair and reasonable market value of the property is ___________(RS._________________________________________________only ).</p>
  
  <p style="margin: 25px 0 0 0; padding-right: 4px;"><strong>Date:</strong></p>
</div>

<div style="margin: 20px auto 0 auto; text-align: right; padding: 0 20px; width: calc(100% - 40px); max-width: 100%; box-sizing: border-box;">
  <p style="margin: 8px 0 4px 0; font-weight: bold; padding-right: 4px;">Signature</p>
  <p style="margin: 4px 0 0 0; font-size: 12pt; padding-right: 4px;">(Name of the Branch Manager with office Seal)</p>
</div>

<div style="margin: 30px auto 20px auto; font-size: 12pt; line-height: 1.6; padding: 15px 20px; width: calc(100% - 40px); max-width: 100%; box-sizing: border-box; page-break-after: avoid;">
  <p style="margin: 10px 0; padding-right: 4px;"><strong>Encl:</strong> Declaration from the Valuer in Format E (Annexure II of the Policy on Valuation of Properties and Empanelment of Valuers)</p>
</div>

 
    <!-- Annexure-II Section -->
    <div class="annexure-ii-section" style="margin-top: 21px; margin-bottom: 0; padding: 10px 15px; display: block; page-break-before: always; min-height: 400px;">
    <div style="text-align: center; margin-bottom: 15px;">
      <p style="margin: 0; font-weight: bold; font-size: 14pt;">Annexure-II</p>
      <p style="margin: 0; font-weight: bold; font-size: 14pt;">Format - E</p>
      <p style="margin: 0; font-weight: bold; font-size: 14pt;">DECLARATION FROM VALUERS</p>
    </div>

    <div style="font-size: 12pt; line-height: 1.6; margin-left: 15px; margin-right: 15px;">
      <p style="margin-bottom: 12px;">I hereby declare that-</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>a.</strong>&nbsp;&nbsp;The information furnished in my valuation report dated ${safeGet(pdfData, 'reportDate')} is true and correct to the best of my knowledge and belief and I have made an impartial and true valuation of the property.</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>b.</strong>&nbsp;&nbsp;${safeGet(pdfData, 'declarationB', 'I have no direct or indirect interest in the property valued;')}</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>c.</strong>&nbsp;&nbsp;I have personally inspected the property on ${safeGet(pdfData, 'inspectionDate')} The work is not sub-contracted to any other valuer and carried out by myself;</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>d.</strong>&nbsp;&nbsp;${safeGet(pdfData, 'declarationD', 'I have not been convicted of any offence and sentenced to a term of Imprisonment;')}</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>e.</strong>&nbsp;&nbsp;${safeGet(pdfData, 'declarationE', 'I have not been found guilty of misconduct in my professional capacity.')}</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>f.</strong>&nbsp;&nbsp;I am a member of ${safeGet(pdfData, 'valuersCompany', 'ICICI Securities Limited')} since ${safeGet(pdfData, 'memberSinceDate', '01.01.2011')} of the IBA and this report is in conformity to the "Standards" enshrined for valuation, in the Part-B of the above handbook to the best of my knowledge.</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>g.</strong>&nbsp;&nbsp;I have read the International Valuation Standards (IVS) and the report submitted to the Bank for the respective asset class is in conformity to the "Standards" as enshrined for valuation in the IVS in "Indian Standard" and "Asset Standards" as applicable.</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>h.</strong>&nbsp;&nbsp;I abide by the Model Code of Conduct for empanelment of valuer in the Bank. (Annexure III- A signed copy of the resolution by the Board of the Bank is enclosed with this declaration)</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>i.</strong>&nbsp;&nbsp;${safeGet(pdfData, 'declarationI', 'I am registered under Section 34 AB of the Wealth Tax Act, 1957.')}</p>

      <p style="margin-bottom: 10px; margin-left: 20px;"><strong>j.</strong>&nbsp;&nbsp;${safeGet(pdfData, 'declarationJ', 'I am the proprietor / partner / authorized official of the firm / company, who is competent to sign this valuation report.')}</p>

      <p style="margin-bottom: 12px; margin-left: 20px;"><strong>k.</strong>&nbsp;&nbsp;Further, I hereby provide the following information.</p>

      <div style="page-break-before: always;"></div>

      <table style="width: 100%; border-collapse: separate; border-spacing: 0;  margin-top: 15px; margin-bottom: 20px; margin-left: 0; margin-right: 0; font-size: 10pt; table-layout: fixed; border: 1px solid #000; page-break-inside: avoid;">
        <colgroup>
          <col style="width: 8%;">
          <col style="width: 40%;">
          <col style="width: 52%;">
        </colgroup>
        <tr>
          <td style="border: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; text-align: center; background-color: #f5f5f5; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 28px; vertical-align: middle;">Sr. No.</td>
          <td style="border: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; background-color: #f5f5f5; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 28px; vertical-align: middle;">Particulars</td>
          <td style="border: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; background-color: #f5f5f5; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 28px; vertical-align: middle;">Valuer comment</td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">1</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">background information of the asset being valued;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">Property is owned by ${safeGet(pdfData, 'ownerNameAddress')}. This is Based On Information Given By Owner and Document available for our Perusals</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">2</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">purpose of valuation and appointing authority</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">As per request of branch Manager ${safeGet(data, 'bankName')} ${safeGet(pdfData, 'branch') ? 'Br. ' + safeGet(pdfData, 'branch') : ''}</td>
         </tr>
       

         </table>
           <table style="width: 100%; border-collapse: separate; border-spacing: 0;  margin-top: 12px; margin-bottom: 20px; margin-left: 0; margin-right: 0; font-size: 10pt; table-layout: fixed; border: 1px solid #000; page-break-inside: avoid;">
        <colgroup>
          <col style="width: 8%;">
          <col style="width: 40%;">
          <col style="width: 52%;">
        </colgroup>
        </br>
        </br>
          <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">3</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">identity of the valuer and any other experts involved in the valuation;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">"Shashikant R. Dhumal"</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">4</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">disclosure of valuer interest or conflict, if any;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">No</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">5</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">date of appointment, valuation date and date of report;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">Date of appointment: ${formatDate(safeGet(pdfData, 'inspectionDate'))} Valuation date: ${formatDate(safeGet(pdfData, 'valuationDate'))} Date of Report: ${formatDate(safeGet(pdfData, 'reportDate'))}</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">6</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">inspections and/or investigations undertaken;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">Site inspection was carried out on along with Mrs. Priyanka Mob No. 8104451067</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">7</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">nature and sources of the information used or relied upon;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">Local inquiry in the surrounding vicinity.</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">8</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">procedures adopted in carrying out the valuation and valuation standards followed;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">Actual site visit conducted along with Mrs. Priyanka & Valuation report was prepared by adopting composite rate method of valuation</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">9</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">restrictions on use of the report, if any;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">The report is only valid for the purpose mentioned in the report.</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">10</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">major factors that were taken into account during the valuation;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">Marketability supply and demand, locality, construction quality.</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">11</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">major factors that were taken into account during the valuation;</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">-----------"------</td>
         </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">12</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">Caveats, limitations and disclaimers to the extent they explain or elucidate the limitations faced by valuer, which shall not be for the purpose of limiting his responsibility for the valuation report.</td>
           <td style="border: 1px solid #000; padding: 6px 8px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; min-height: 40px; height: auto;">No such circumstances were noticed.</td>
         </tr>
          </table>
<tr style="border: none;">
  <td colspan="4" style="padding:15px; border: 1px solid #000;">
    <div style="display:flex;justify-content:space-between;">
      <div>
        <p style="margin:0;font-weight:bold;">
          Date: ${formatDate(
            safeGet(pdfData, 'valuationPlace')
                ? safeGet(pdfData, 'valuationDate')
                : safeGet(pdfData, 'reportDate')
        )}
        </p>
        <p style="margin:0;font-weight:bold;">
          Place: ${safeGet(pdfData, 'valuationPlace', 'NA')}
        </p>
      </div>
       
      <div style="margin-top:30px;text-align:right;">
        <p style="margin:0;font-weight:bold;">
          "Shashikant R. Dhumal"
        </p>
        <p style="margin:0;">Signature of Approved Valuer</p>
        <p style="margin:0;">Engineer & Govt. Approved Valuer</p>
        <p style="margin:0;">CAT/1/143-2007</p>
      </div>
    </div>
  </td>
</tr>


    
      </div>
      </div>
     <div style="page-break-before: always;"></div>
<div
  class="annexure-iii-section"
  style="
    margin: 12mm 10mm;
    padding: 0 4mm;
    font-size: 12pt;
    line-height: 1.5;
    text-align: justify;
    box-sizing: border-box;
  "
>
  <div style="text-align:center; font-weight:bold; page-break-after:avoid;">
    <p style="margin:6px 0; font-size:14pt;">ANNEXURE - III</p>
    <p style="margin:6px 0; font-size:14pt;">MODEL CODE OF CONDUCT FOR VALUERS</p>
  </div>
  <p style="margin:0 0 14px 0; page-break-inside:avoid; break-inside:avoid;">
    All valuers empanelled with bank shall strictly adhere to the following code of conduct:
  </p>
  <p style="font-weight:bold; page-break-inside:avoid; break-inside:avoid;">Integrity and Fairness</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>1.</strong> A valuer shall, in the conduct of his/its business, follow high standards of integrity and fairness in all his/its dealings with third parties and other valuers.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>2.</strong> A valuer shall maintain integrity by being honest, straightforward, and forthright in all professional relationships.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>3.</strong> A valuer shall endeavour to ensure that he/it provides true and adequate information and shall not misrepresent any facts or situations.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>4.</strong> A valuer shall refrain from being involved in any action that would bring disrepute to the profession.</p>
  <p style="margin:0 0 14px 0; page-break-inside:avoid; break-inside:avoid;"><strong>5.</strong> A valuer shall keep public interest foremost while delivering his services.</p>
  <p style="font-weight:bold; page-break-inside:avoid; break-inside:avoid;">Professional Competence and Due Care</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>6.</strong> A valuer shall render at all times high standards of service, exercise due diligence, ensure proper care and exercise independent professional judgment.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>7.</strong> A valuer shall carry out professional services in accordance with the relevant technical and professional standards that may be specified from time to time.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>8.</strong> A valuer shall continuously maintain professional knowledge and skill to provide competent professional service based on up-to-date developments in practice, prevailing regulations/guidelines and institutions.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>9.</strong> In the preparation of a valuation report, the valuer shall not disclaim liability for his/its statement of fact provided by the company or its auditors or consultants as information available in public domain and generated by third parties.</p>
  <p style="margin:0 0 14px 0;"><strong>10.</strong> A valuer shall not carry out any instruction of the client insofar as they are incompatible with the requirements of integrity, objectivity and independence.</p>
  <p style="margin:0 0 14px 0;"><strong>11.</strong> A valuer shall clearly state to the client the services that he would be competent to provide and the services for which he would be relying on other valuers or professionals or for which the client can have a separate arrangement with other valuers.</p>
  <p style="font-weight:bold;">Independence and Disclosure of Interest</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>12.</strong> A valuer shall act with objectivity in his/it professional dealings by ensuring that his/its decisions are made without the presence of any bias, conflict of interest, coercion, or undue influence of any party, whether directly connected to the valuation assignment or not.</p>
</br>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>13.</strong> . A valuer shall not take up an assignment if he/it or any of his/its relatives or associates is not
independent in terms of association to the company. </p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>14.</strong> A valuer shall maintain complete independence in his/its professional relationships and shall conduct the valuation independent of external influences.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>15.</strong> A valuer shall wherever necessary disclose to the clients, possible sources of conflicts of duties and interests, while providing imbiased services.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>16.</strong> A valuer shall not deal in securities of any subject company after any time when he/it first becomes aware of the possibility of his association with the valuation and in accordance with the Securities and Exchange Board of India (Prohibition of Insider Trading) Regulations, 2015 or till the time the valuation report becomes public, whichever is earlier.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>17.</strong> A valuer shall not indulge in "mandate snatching" or offering "convenience valuations" in order to cater to a company or client's needs.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>18.</strong> As an independent valuer, the valuer shall not charge success fee (Success fees may be defined as a compensation / incentive paid to any third party for successful closure of transaction. In this case, approval of credit proposals).</p>
  <p style="margin:0 0 14px 0;"><strong>19.</strong> In any fairness opinion or independent expert opinion submitted by a valuer, if there has been a prior engagement in an unconnected transaction, the valuer shall declare the association with the company during the last five years.</p>
  <p style="font-weight:bold;">Confidentiality</p>
  <p style="margin:0 0 14px 0;"><strong>20.</strong> A valuer shall not use or divulge to other clients or any other party any confidential information about the subject company, which has come to his/its knowledge without proper and specific authority or unless there is a legal or professional right or duty to disclose.</p>
  <p style="font-weight:bold;">Information Management</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>21.</strong>  A valuer shall ensure that he/ it maintains written contemporaneous records for any decision
taken, the reasons for taking the decision, and the information and evidence in support of such
decision. This shall be maintained so as to sufficiently enable a reasonable person to take a view
on the appropriateness of his/its decisions and actions.  </p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>22.</strong>  A valuer shall appear, co-operate and be available for inspections and investigations carried
out by the authority, any person authorized by the authority, the registered valuers organization
with which he/it is registered or any other statutory regulatory body.  </p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>23.</strong>  A valuer shall provide all information and records as may be required by the authority, the
Tribunal, Appellate Tribunal, the registered valuers organization with which he/it is registered, or
any other statutory regulatory body.</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>24.</strong>. A valuer while respecting the confidentiality of information acquired during the course of
performing professional services, shall maintain proper working papers for a period of three years
or such longer period as required in its contract for a specific valuation, for production before a
regulatory authority or for a peer review. In the event of a pending case before the Tribunal or
Appellate Tribunal, the record shall be maintained till the disposal of the case.  </p></br></br>
 <p style="font-weight:bold;">Gifts and hospitality: </p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>25.</strong>  A valuer or his/its relative shall not accept gifts or hospitality which undermines or affects his
independence as a valuer.
</p>
<p style="page-break-inside:avoid; break-inside:avoid;">Explanation. ─ For the purposes of this code the term ‘relative’ shall have the same meaning as
defined in clause (77) of Section 2 of the Companies Act, 2013 (18 of 2013). </p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>26.</strong> A valuer shall not offer gifts or hospitality or a financial or any other advantage to a public
servant or any other person with a view to obtain or retain work for himself/ itself, or to obtain or
retain an advantage in the conduct of profession for himself/ itself. </p>
  <p style="font-weight:bold;">Remuneration and Costs</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>27.</strong>  A valuer shall provide services for remuneration which is charged in a transparent manner, is
a reasonable reflection of the work necessarily and properly undertaken, and is not inconsistent
with the applicable rules. </p>
  <p style="margin:0 0 14px 0;"><strong>28.</strong>  A valuer shall not accept any fees or charges other than those which are disclosed in a written
contract with the person to whom he would be rendering service.  </p>
  <p style="font-weight:bold;">Occupation, employability and restrictions</p>
  <p style="page-break-inside:avoid; break-inside:avoid;"><strong>29.</strong> A valuer shall refrain from accepting too many assignments, if he/it is unlikely to be able to
devote adequate time to each of his/ its assignments.  </p>
  <p style="margin:0 0 20px 0;"><strong>30.</strong>A valuer shall not conduct business which in the opinion of the authority or the registered
valuer organization discredits the profession.  </p>
  <div style="margin-top:20px;">
    <p style="margin:0; font-weight:bold;">Date: ${formatDate(safeGet(pdfData, 'valuationMadeDate'))}</p>
    <p style="margin:0; font-weight:bold;">Place: ${safeGet(pdfData, 'valuationPlace')}</p>
  </div>
  <div style="margin-top:30px; text-align:right;">
    <p style="margin:0; font-weight:bold;">Shashikant R. Dhumal</p>
    <p style="margin:0;">Signature of Approved Valuer</p>
    <p style="margin:0;">Engineer & Govt. Approved Valuer</p>
    <p style="margin:0;">CAT/1/143-2007</p>
  </div>
</div>


    <!-- IMAGES SECTION -->
    
    ${pdfData.areaImages && typeof pdfData.areaImages === 'object' && Object.keys(pdfData.areaImages).length > 0 ? `
    ${(() => {
                let allImages = [];
                let globalIdx = 0;
                Object.entries(pdfData.areaImages).forEach(([areaName, areaImageList]) => {
                    if (Array.isArray(areaImageList)) {
                        areaImageList.forEach((img, idx) => {
                            const imgSrc = typeof img === 'string' ? img : (img?.url || img?.preview || img?.data || img?.src || '');
                            if (imgSrc) {
                                allImages.push({
                                    src: imgSrc,
                                    label: areaName + ' - Image ' + (idx + 1),
                                    globalIdx: globalIdx++
                                });
                            }
                        });
                    }
                });

                let pages = [];
                for (let i = 0; i < allImages.length; i += 6) {
                    pages.push(allImages.slice(i, i + 6));
                }

                return pages.map((pageImages, pageIdx) => `
        <div class="page images-section area-images-page" style="page-break-before: always; page-break-after: always; break-before: page; break-after: page; page-break-inside: avoid;">
             <div style="padding: 10px; font-size: 12pt;">
                 ${pageIdx === 0 ? '<h2 style="text-align: center; margin: 0 0 8px 0; font-weight: bold;">PROPERTY AREA IMAGES</h2>' : ''}
                 <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px; page-break-inside: avoid; break-inside: avoid; margin: 0; padding: 0;">
                     ${pageImages.map(item => `
                     <div style="page-break-inside: avoid; break-inside: avoid; border: 1px solid #ddd; padding: 1px; text-align: center; background: #fff; margin: 0;">
                         <img class="pdf-image" src="${item.src}" alt="${item.label}" style="width: 100%; height: auto; max-height: 275px; object-fit: contain; display: block; margin: 0; padding: 0;">
                         <p style="margin: 2px 0 0 0; font-size: 6.5pt; color: #333; font-weight: bold; padding: 0;">${item.label}</p>
                      </div>`).join('')}
                 </div>
             </div>
        </div>`).join('');
            })()}
     ` : ''}

    ${Array.isArray(pdfData.locationImages) && pdfData.locationImages.length > 0 ? `
    <div class="page images-section location-images-page" style="page-break-before: always; break-before: page; padding: 0; margin: 0;">
        <div style="padding: 20px; font-size: 12pt; display: flex; flex-direction: column; gap: 20px;">
            <h2 style="text-align: center; margin: 0 0 20px 0; font-weight: bold;">LOCATION IMAGES</h2>
            ${pdfData.locationImages.map((img, idx) => {
                const imgSrc = typeof img === 'string' ? img : img?.url;
                return imgSrc ? `
                <div class="image-container" style="page-break-inside: avoid; break-inside: avoid; border: 1px solid #ddd; padding: 10px; background: #fafafa; flex-shrink: 0;">
                    <img class="pdf-image" src="${imgSrc}" alt="Location Image ${idx + 1}" style="width: 100%; height: auto; max-height: 500px; object-fit: contain;">
                </div>
                ` : '';
            }).join('')}
         </div>
     </div>
     ` : ''}

   

    ${Array.isArray(pdfData.documentPreviews) && pdfData.documentPreviews.length > 0 ? `
    <div class="supporting-docs-section">
    ${pdfData.documentPreviews.map((img, idx) => {
                const imgSrc = typeof img === 'string' ? img : img?.url;
                return imgSrc ? `
        <div class="page images-section supporting-docs-page" style="page-break-before: always; break-before: page; width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;">
            ${idx === 0 ? '<h2 style="text-align: center; margin-bottom: 30px; font-weight: bold; width: 100%; font-size: 18pt;">SUPPORTING DOCUMENTS</h2>' : ''}
            <div class="image-container" style="border: 1px solid #ddd; padding: 10px; background: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 90%; max-width: 800px; height: auto;">
                <img class="pdf-image" src="${imgSrc}" alt="Supporting Document ${idx + 1}" style="width: 100%; height: auto; max-height: 550px; object-fit: contain; margin: 0 auto;">
                <p style="margin: 10px 0 0 0; font-size: 10pt; color: #666; text-align: center;">Document ${idx + 1}</p>
            </div>
        </div>
        ` : '';
            }).join('')}
    </div>
     ` : ''}

    </body>
    </html>
`;
}

export async function generateRecordPDF(record) {
    try {
        console.log('📄 Generating PDF for record:', record?.uniqueId || record?.clientName || 'new');
        console.log('🔍 FULL RECORD DATA:', {
            recordKeys: Object.keys(record || {}),
            recordSize: JSON.stringify(record || {}).length,
            pdfDetailsExists: !!record?.pdfDetails,
            pdfDetailsSize: JSON.stringify(record?.pdfDetails || {}).length,
            pdfDetailsKeys: Object.keys(record?.pdfDetails || {}).slice(0, 20)
        });
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
        console.log('👁️ Generating PDF preview for:', record?.uniqueId || record?.clientName || 'new');

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
        document.body.appendChild(container);

        // CRITICAL: Wait for images to load, then remove failed ones
        const images = container.querySelectorAll('img.pdf-image');
        const imagesToRemove = new Set();

        // First pass: check for images with invalid src attribute
        images.forEach(img => {
            const src = img.src || img.getAttribute('data-src');
            const alt = img.getAttribute('alt') || 'unknown';

            // If image has no src or invalid src, mark container for removal
            if (!src || !src.trim() || src === 'undefined' || src === 'null') {
                console.log(`⏭️ Invalid image src: ${alt}`);
                let parentContainer = img.closest('.image-container');
                if (parentContainer) {
                    imagesToRemove.add(parentContainer);
                    console.log(`⏭️ Marking for removal (invalid src): ${alt}`);
                }
            }
        });

        // Second pass: add error listeners to detect failed load attempts
        await Promise.all(Array.from(images).map(img => {
            return new Promise((resolve) => {
                const alt = img.getAttribute('alt') || 'unknown';
                const timeoutId = setTimeout(() => {
                    // If image hasn't loaded after 5 seconds, mark for removal
                    if (!img.complete || img.naturalHeight === 0) {
                        console.log(`⏭️ Image timeout/failed to load: ${alt}`);
                        let parentContainer = img.closest('.image-container');
                        if (parentContainer) {
                            imagesToRemove.add(parentContainer);
                            console.log(`⏭️ Marking for removal (timeout): ${alt}`);
                        }
                    }
                    resolve();
                }, 5000);

                img.onload = () => {
                    clearTimeout(timeoutId);
                    console.log(`✅ Image loaded successfully: ${alt}`);
                    resolve();
                };

                img.onerror = () => {
                    clearTimeout(timeoutId);
                    console.log(`❌ Image failed to load: ${alt}`);
                    let parentContainer = img.closest('.image-container');
                    if (parentContainer) {
                        imagesToRemove.add(parentContainer);
                        console.log(`⏭️ Marking for removal (onerror): ${alt}`);
                    }
                    resolve();
                };

                // If already loaded, resolve immediately
                if (img.complete) {
                    clearTimeout(timeoutId);
                    if (img.naturalHeight === 0) {
                        console.log(`⏭️ Image failed (no height): ${alt}`);
                        let parentContainer = img.closest('.image-container');
                        if (parentContainer) {
                            imagesToRemove.add(parentContainer);
                            console.log(`⏭️ Marking for removal (no height): ${alt}`);
                        }
                    } else {
                        console.log(`✅ Image already loaded: ${alt}`);
                    }
                    resolve();
                }
            });
        }));

        // Remove all marked containers
        console.log(`🗑️ Removing ${imagesToRemove.size} failed/invalid image containers`);
        imagesToRemove.forEach(el => {
            const alt = el.querySelector('img')?.getAttribute('alt') || 'unknown';
            console.log(`✂️ Removed container: ${alt}`);
            el.remove();
        });

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

        // Create PDF from canvas with proper page positioning and canvas cropping (like bomflatpdf.js)
        const imgWidth = 210;
        const pageHeight = 297;
        const headerHeight = 20;  // 10mm header space
        const footerHeight = 20;  // 10mm footer space
        const usableHeight = pageHeight - headerHeight - footerHeight;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'A4');
        let pageNumber = 1;
        let heightLeft = imgHeight;
        let sourceY = 0;  // Track position in source canvas (in mm)
        let pageAdded = false;  // Track if first page is added to prevent empty page

        // Add pages to PDF - only continue if there's meaningful content left (>5mm to avoid blank pages)
        while (heightLeft > 5) {
            // Calculate how much of the image fits on this page
            let imageHeightForThisPage = Math.min(usableHeight, heightLeft);

            // Calculate the crop region from the canvas
            const canvasHeight = canvas.height;
            const canvasWidth = canvas.width;
            const sourceYPixels = (sourceY / imgHeight) * canvasHeight;
            const maxHeightPixels = (imageHeightForThisPage / imgHeight) * canvasHeight;

            // Guard against getImageData with 0 height
            if (maxHeightPixels <= 0) {
                console.warn('⚠️ Height is 0 or negative, skipping page');
                heightLeft -= imageHeightForThisPage;
                sourceY += imageHeightForThisPage;
                continue;
            }

            // Create a cropped canvas for this page
            const croppedPageCanvas = document.createElement('canvas');
            croppedPageCanvas.width = canvasWidth;
            croppedPageCanvas.height = Math.floor(maxHeightPixels);
            const pageCtx = croppedPageCanvas.getContext('2d');
            pageCtx.drawImage(
                canvas,
                0, Math.floor(sourceYPixels),
                canvasWidth, Math.floor(maxHeightPixels),
                0, 0,
                canvasWidth, Math.floor(maxHeightPixels)
            );

            const pageImgData = croppedPageCanvas.toDataURL('image/png');

            // Only add content if it has meaningful height (avoid blank pages)
            if (imageHeightForThisPage > 2) {  // Only add if >2mm height
                // Only add new page if not first page - first page already exists from jsPDF init
                if (pageAdded) {
                    pdf.addPage();
                } else {
                    pageAdded = true;
                }

                // Add cropped image with fixed header margin (no currentPageYPosition tracking needed)
                pdf.addImage(pageImgData, 'PNG', 0, headerHeight, imgWidth, imageHeightForThisPage);

                pageNumber++;

                // Update counters only after content is added
                heightLeft -= imageHeightForThisPage;
                sourceY += imageHeightForThisPage;
            } else {
                // Skip very small content, but still update counters to move past it
                heightLeft -= imageHeightForThisPage;
                sourceY += imageHeightForThisPage;
            }
        }

        // Remove the first blank page if no content was added (jsPDF creates with 1 blank page by default)
        if (!pageAdded) {
            console.log('⚠️ No content added, removing blank first page');
            // Get total pages and remove first one if it's blank
            const totalPages = pdf.getNumberOfPages();
            if (totalPages > 1) {
                pdf.deletePage(1);
            }
        }

        // Create blob URL and open in new tab
        const blob = pdf.output('blob');
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');

        console.log('✅ PDF preview opened');
        return url;
    } catch (error) {
        console.error('❌ PDF preview error:', error);
        throw error;
    }
}

/**
 * Convert image URL to base64 data URI
 */
const urlToBase64 = async (url) => {
    if (!url || typeof url !== 'string') return '';

    url = url.trim();
    if (!url) return '';

    // If already base64 or data URI, return as-is
    if (url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
    }

    try {
        // For external domains like Cloudinary, don't use credentials to avoid CORS issues
        // Only use credentials for same-origin requests
        const isExternal = !url.includes(window.location.hostname);

        const fetchOptions = {
            headers: {
                'Accept': 'image/*'
            }
        };

        // Only include credentials for same-origin requests
        if (!isExternal) {
            fetchOptions.credentials = 'include';
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            console.warn('Failed to fetch image:', url, 'Status:', response.status);
            return '';
        }

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => {
                console.warn('Failed to read image as data URL:', url);
                reject(new Error('FileReader error'));
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('Failed to convert image to base64:', url, error?.message);
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
        console.log('📸 Processing property images:', recordCopy.propertyImages.length);
        const converted = await Promise.all(
            recordCopy.propertyImages.map(async (img, idx) => {
                try {
                    // CRITICAL: Reject null/undefined/empty immediately
                    if (!img) {
                        console.log(`  Property image ${idx}: null/undefined/empty, skipping`);
                        return null;
                    }

                    // Extract URL from different possible formats
                    let url = '';
                    if (typeof img === 'string') {
                        url = img.trim();
                    } else if (typeof img === 'object') {
                        url = (img?.url || img?.preview || img?.data || img?.src || img?.secure_url || '').toString().trim();
                    }

                    // CRITICAL: Reject if URL is empty string or only whitespace
                    if (!url || url.length === 0 || typeof url !== 'string') {
                        console.log(`  Property image ${idx}: empty/invalid URL extracted "${url}" - FILTERING OUT`);
                        return null;
                    }

                    url = extractImageUrl(url);
                    if (!url) {
                        console.log(`  Property image ${idx}: no valid URL format - FILTERING OUT`);
                        return null; // ← CRITICAL: Return null to filter out in next step
                    }

                    console.log(`  Property image ${idx}: attempting conversion from ${url.substring(0, 60)}`);
                    const base64 = await urlToBase64(url);

                    if (base64 && base64.trim()) {
                        if (typeof img === 'string') {
                            return base64;
                        }
                        return { ...img, url: base64 };
                    } else {
                        // Conversion failed - return null instead of empty URL
                        console.log(`  Property image ${idx}: conversion failed - FILTERING OUT`);
                        return null; // ← CRITICAL: Return null instead of empty URL
                    }
                } catch (err) {
                    console.warn(`Failed to convert property image ${idx}:`, err?.message);
                    return null; // ← CRITICAL: Return null on error instead of original img
                }
            })
        );
        // ← CRITICAL: Filter out null entries
        recordCopy.propertyImages = converted.filter(img => img !== null);
        console.log(`📸 Property images after filtering: ${recordCopy.propertyImages.length} valid out of ${recordCopy.propertyImages.length + converted.filter(x => x === null).length} total`);
    }

    // Convert location images
    if (Array.isArray(recordCopy.locationImages)) {
        console.log('📸 Processing location images:', recordCopy.locationImages.length);
        const converted = await Promise.all(
            recordCopy.locationImages.map(async (img, idx) => {
                try {
                    // CRITICAL: Reject null/undefined/empty immediately
                    if (!img) {
                        console.log(`  Location image ${idx}: null/undefined/empty, skipping`);
                        return null;
                    }

                    // Extract URL from different possible formats
                    let url = '';
                    if (typeof img === 'string') {
                        url = img.trim();
                    } else if (typeof img === 'object') {
                        url = (img?.url || img?.preview || img?.data || img?.src || img?.secure_url || '').toString().trim();
                    }

                    // CRITICAL: Reject if URL is empty string or only whitespace
                    if (!url || url.length === 0 || typeof url !== 'string') {
                        console.log(`  Location image ${idx}: empty/invalid URL extracted "${url}" - FILTERING OUT`);
                        return null;
                    }

                    url = extractImageUrl(url);
                    if (!url) {
                        console.log(`  Location image ${idx}: no valid URL format - FILTERING OUT`);
                        return null; // ← CRITICAL: Return null to filter out in next step
                    }

                    console.log(`  Location image ${idx}: attempting conversion from ${url.substring(0, 60)}`);
                    const base64 = await urlToBase64(url);

                    if (base64 && base64.trim()) {
                        if (typeof img === 'string') {
                            return base64;
                        }
                        return { ...img, url: base64 };
                    } else {
                        // Conversion failed - return null instead of empty URL
                        console.log(`  Location image ${idx}: conversion failed - FILTERING OUT`);
                        return null; // ← CRITICAL: Return null instead of empty URL
                    }
                } catch (err) {
                    console.warn(`Failed to convert location image ${idx}:`, err?.message);
                    return null; // ← CRITICAL: Return null on error instead of original img
                }
            })
        );
        // ← CRITICAL: Filter out null entries
        recordCopy.locationImages = converted.filter(img => img !== null);
        console.log(`📸 Location images after filtering: ${recordCopy.locationImages.length} valid out of ${recordCopy.locationImages.length + converted.filter(x => x === null).length} total`);
    }

    // Convert document previews (supporting documents)
    if (Array.isArray(recordCopy.documentPreviews)) {
        console.log('📸 Processing document previews:', recordCopy.documentPreviews.length);
        const converted = await Promise.all(
            recordCopy.documentPreviews.map(async (img, idx) => {
                try {
                    // CRITICAL: Reject null/undefined/empty immediately
                    if (!img) {
                        console.log(`  Document preview ${idx}: null/undefined/empty, skipping`);
                        return null;
                    }

                    // Extract URL from different possible formats
                    let url = '';
                    if (typeof img === 'string') {
                        url = img.trim();
                    } else if (typeof img === 'object') {
                        url = (img?.url || img?.preview || img?.data || img?.src || img?.secure_url || '').toString().trim();
                    }

                    // CRITICAL: Reject if URL is empty string or only whitespace
                    if (!url || url.length === 0 || typeof url !== 'string') {
                        console.log(`  Document preview ${idx}: empty/invalid URL extracted "${url}" - FILTERING OUT`);
                        return null;
                    }

                    url = extractImageUrl(url);
                    if (!url) {
                        console.log(`  Document preview ${idx}: no valid URL format - FILTERING OUT`);
                        return null; // ← CRITICAL: Return null to filter out in next step
                    }

                    console.log(`  Document preview ${idx}: attempting conversion from ${url.substring(0, 60)}`);
                    const base64 = await urlToBase64(url);

                    if (base64 && base64.trim()) {
                        if (typeof img === 'string') {
                            return base64;
                        }
                        return { ...img, url: base64 };
                    } else {
                        // Conversion failed - return null instead of empty URL
                        console.log(`  Document preview ${idx}: conversion failed - FILTERING OUT`);
                        return null; // ← CRITICAL: Return null instead of empty URL
                    }
                } catch (err) {
                    console.warn(`Failed to convert document preview ${idx}:`, err?.message);
                    return null; // ← CRITICAL: Return null on error instead of original img
                }
            })
        );
        // ← CRITICAL: Filter out null entries
        recordCopy.documentPreviews = converted.filter(img => img !== null);
        console.log(`📸 Document previews after filtering: ${recordCopy.documentPreviews.length} valid out of ${recordCopy.documentPreviews.length + converted.filter(x => x === null).length} total`);
    }

    console.log('✅ Image conversion complete:', {
        propertyImages: recordCopy.propertyImages?.length || 0,
        locationImages: recordCopy.locationImages?.length || 0,
        documentPreviews: recordCopy.documentPreviews?.length || 0
    });

    return recordCopy;
};

/**
 * Convert HTML string to plain text (removes tags and preserves content)
 */
const htmlToText = (html) => {
    if (!html) return '';
    // Remove script and style elements
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, '');
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
};

/**
 * Parse HTML to extract sections for Word document
 */
const parseHTMLForDocx = (htmlContent) => {
    const parser = typeof DOMParser !== 'undefined'
        ? new DOMParser()
        : null;

    if (!parser) {
        // Fallback for Node.js environment (shouldn't happen in browser)
        return [{
            type: 'paragraph',
            text: htmlToText(htmlContent)
        }];
    }

    try {
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const paragraphs = [];

        const processElement = (elem) => {
            if (!elem) return;

            for (let child of elem.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent.trim();
                    if (text) {
                        paragraphs.push({
                            text: text
                        });
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const tagName = child.tagName.toLowerCase();
                    const text = htmlToText(child.outerHTML);

                    if (text) {
                        if (['h1', 'h2', 'h3'].includes(tagName)) {
                            paragraphs.push({
                                text: text,
                                heading: tagName === 'h1' ? 'Heading1' : tagName === 'h2' ? 'Heading2' : 'Heading3'
                            });
                        } else if (tagName === 'table') {
                            // For tables, add table rows as separate paragraphs
                            const rows = child.querySelectorAll('tr');
                            rows.forEach(row => {
                                const cells = row.querySelectorAll('td, th');
                                const rowText = Array.from(cells)
                                    .map(cell => cell.textContent.trim())
                                    .join(' | ');
                                if (rowText) {
                                    paragraphs.push({
                                        text: rowText
                                    });
                                }
                            });
                        } else {
                            paragraphs.push({
                                text: text
                            });
                        }
                    }

                    // Recursively process nested elements
                    processElement(child);
                }
            }
        };

        processElement(doc.body);
        return paragraphs;
    } catch (error) {
        console.error('Error parsing HTML for DOCX:', error);
        return [{
            text: htmlToText(htmlContent)
        }];
    }
};

/**
 * Client-side Word document generation using docx library
 * Generates .docx with identical data as PDF
 */
export async function generateRecordDOCX(record) {
    try {
        console.log('📝 Generating Word document...');

        // Use EXACT same data normalization as PDF
        const normalizedData = normalizeDataForPDF(record);

        // Use EXACT same HTML generation as PDF
        const htmlContent = generateValuationReportHTML(normalizedData);

        // Convert HTML to structured content for Word
        const paragraphs = parseHTMLForDocx(htmlContent);

        // Dynamically import docx library
        const { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, BorderStyle, PageBreak, AlignmentType, VerticalAlign, UnderlineType } = await import('docx');

        // Create document sections
        const sections = [];
        let currentPageParagraphs = [];
        let pageCount = 0;

        for (const para of paragraphs) {
            let paragraphElement;

            // Create paragraph with proper formatting based on heading level
            if (para.heading === 'Heading1') {
                paragraphElement = new Paragraph({
                    text: para.text || '',
                    bold: true,
                    size: 28, // 14pt
                    spacing: { line: 360, lineRule: 'auto', after: 200 },
                    border: {
                        bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 }
                    }
                });
            } else if (para.heading === 'Heading2') {
                paragraphElement = new Paragraph({
                    text: para.text || '',
                    bold: true,
                    size: 24, // 12pt
                    spacing: { line: 320, lineRule: 'auto', after: 150 }
                });
            } else if (para.heading === 'Heading3') {
                paragraphElement = new Paragraph({
                    text: para.text || '',
                    bold: true,
                    size: 22, // 11pt
                    spacing: { line: 300, lineRule: 'auto', after: 100 }
                });
            } else {
                // Regular paragraph
                paragraphElement = new Paragraph({
                    text: para.text || '',
                    size: 20, // 10pt
                    spacing: { line: 240, lineRule: 'auto', after: 80 }
                });
            }

            currentPageParagraphs.push(paragraphElement);

            // Add page break every ~50 paragraphs (approximate page size)
            if (currentPageParagraphs.length >= 50) {
                sections.push(...currentPageParagraphs);
                sections.push(new PageBreak());
                currentPageParagraphs = [];
                pageCount++;
            }
        }

        // Add remaining paragraphs
        if (currentPageParagraphs.length > 0) {
            sections.push(...currentPageParagraphs);
        }

        console.log(`📄 Word document structure: ${pageCount} full pages + final section with ${currentPageParagraphs.length} paragraphs`);

        // Create document with identical content structure as PDF
        const doc = new Document({
            sections: [{
                children: sections,
                properties: {
                    page: {
                        margins: {
                            top: 720,    // 0.5 inch
                            right: 720,
                            bottom: 720,
                            left: 720
                        }
                    }
                }
            }]
        });

        // Generate and save the document
        console.log('📦 Packing document into .docx format...');
        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `valuation_${record?.clientName || record?.uniqueId || Date.now()}.docx`;

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);

        console.log(`⬇️ Downloading: ${filename}`);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ Word document generated and downloaded:', filename);
        return filename;
    } catch (error) {
        console.error('❌ Word document generation error:', error);
        throw error;
    }
}

export async function generateRecordPDFOffline(record) {
    try {
        console.log('📠 Generating PDF (client-side mode)');
        console.log('📊 Input Record Structure:', {
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
        console.log('🖼️ Converting images to base64...');
        const recordWithBase64Images = await convertImagesToBase64(record);

        // Dynamically import jsPDF and html2canvas to avoid SSR issues
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Generate HTML from the record data with base64 images
        const htmlContent = generateValuationReportHTML(recordWithBase64Images);

        // Split HTML content by page break sections
        const detailsIndex = htmlContent.indexOf('details-of-valuation-section');
        const annexure2Index = htmlContent.indexOf('annexure-ii-section');
        const annexure3Index = htmlContent.indexOf('annexure-iii-section');
        const propertyImagesIndex = htmlContent.indexOf('property-images-page');
        const areaImagesIndex = htmlContent.indexOf('area-images-page');
        const locationImagesIndex = htmlContent.indexOf('location-images-page');
        const supportingDocsIndex = htmlContent.indexOf('supporting-docs-page');

        let mainHtmlContent = htmlContent;
        let detailsHtmlContent = '';
        let annexure2HtmlContent = '';
        let annexure3HtmlContent = '';
        let propertyImagesHtmlContent = '';
        let areaImagesHtmlContent = '';
        let locationImagesHtmlContent = '';
        let supportingDocsHtmlContent = '';

        // Find all sections and sort them by position
        const sections = [
            { name: 'details', index: detailsIndex },
            { name: 'annexure2', index: annexure2Index },
            { name: 'annexure3', index: annexure3Index },
            { name: 'propertyImages', index: propertyImagesIndex },
            { name: 'areaImages', index: areaImagesIndex },
            { name: 'locationImages', index: locationImagesIndex },
            { name: 'supportingDocs', index: supportingDocsIndex }
        ].filter(s => s.index !== -1).sort((a, b) => a.index - b.index);

        if (sections.length > 0) {
            let currentPos = 0;

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const sectionStart = htmlContent.lastIndexOf('<div', section.index);

                if (i === 0) {
                    // First section - everything before it is main content
                    mainHtmlContent = htmlContent.substring(0, sectionStart);
                }

                // Extract section content
                const sectionEnd = i < sections.length - 1
                    ? htmlContent.lastIndexOf('<div', sections[i + 1].index)
                    : htmlContent.length;
                const sectionContent = htmlContent.substring(sectionStart, sectionEnd);

                if (section.name === 'details') {
                    detailsHtmlContent = sectionContent;
                } else if (section.name === 'annexure2') {
                    annexure2HtmlContent = sectionContent;
                } else if (section.name === 'annexure3') {
                    annexure3HtmlContent = sectionContent;
                } else if (section.name === 'propertyImages') {
                    propertyImagesHtmlContent = sectionContent;
                } else if (section.name === 'areaImages') {
                    areaImagesHtmlContent = sectionContent;
                } else if (section.name === 'locationImages') {
                    locationImagesHtmlContent = sectionContent;
                } else if (section.name === 'supportingDocs') {
                    supportingDocsHtmlContent = sectionContent;
                }
            }
            console.log('✂️ Split HTML: Sections separated - Details, Annexure-II, Annexure-III, Property Images, Area Images, Location Images, Supporting Docs');
        }

        // Remove all image sections from mainHtmlContent to prevent them from being rendered in main PDF
        let cleanMainContent = mainHtmlContent;

        // Remove property-images-page section
        cleanMainContent = cleanMainContent.replace(/<div[^>]*property-images-page[^>]*>[\s\S]*?<\/div>/g, '');

        // Remove area-images-page sections
        cleanMainContent = cleanMainContent.replace(/<div[^>]*area-images-page[^>]*>[\s\S]*?<\/div>/g, '');

        // Remove location-images-page sections
        cleanMainContent = cleanMainContent.replace(/<div[^>]*location-images-page[^>]*>[\s\S]*?<\/div>/g, '');

        // Remove supporting-docs-page sections
        cleanMainContent = cleanMainContent.replace(/<div[^>]*supporting-docs-page[^>]*>[\s\S]*?<\/div>/g, '');

        mainHtmlContent = cleanMainContent;
        console.log('🗑️ Removed image sections from main content');

        // Create a temporary container for main content
        const container = document.createElement('div');
        container.innerHTML = mainHtmlContent;
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
                console.log(`⏭️ Invalid image src: ${alt}`);
                let parentContainer = img.closest('.image-container');
                if (parentContainer) {
                    imagesToRemove.add(parentContainer);
                    console.log(`⏭️ Marking for removal (invalid src): ${alt}`);
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
                        console.log(`⏭️ Image timeout/failed to load: ${alt}`);
                        let parentContainer = img.closest('.image-container');
                        if (parentContainer) {
                            imagesToRemove.add(parentContainer);
                            console.log(`⏭️ Marking for removal (timeout): ${alt}`);
                        }
                    }
                    resolve();
                }, 5000);

                img.onload = () => {
                    clearTimeout(timeoutId);
                    console.log(`✅ Image loaded successfully: ${alt}`);
                    resolve();
                };

                img.onerror = () => {
                    clearTimeout(timeoutId);
                    console.log(`❌ Image failed to load: ${alt}`);
                    let parentContainer = img.closest('.image-container');
                    if (parentContainer) {
                        imagesToRemove.add(parentContainer);
                        console.log(`⏭️ Marking for removal (onerror): ${alt}`);
                    }
                    resolve();
                };

                // If already loaded, resolve immediately
                if (img.complete) {
                    clearTimeout(timeoutId);
                    if (img.naturalHeight === 0) {
                        console.log(`⏭️ Image failed (no height): ${alt}`);
                        let parentContainer = img.closest('.image-container');
                        if (parentContainer) {
                            imagesToRemove.add(parentContainer);
                            console.log(`⏭️ Marking for removal (no height): ${alt}`);
                        }
                    } else {
                        console.log(`✅ Image already loaded: ${alt}`);
                    }
                    resolve();
                }
            });
        }));

        // Remove all marked containers
        console.log(`🗑️ Removing ${imagesToRemove.size} failed/invalid image containers`);
        imagesToRemove.forEach(el => {
            const alt = el.querySelector('img')?.getAttribute('alt') || 'unknown';
            console.log(`✂️ Removed container: ${alt}`);
            el.remove();
        });

        // Extract images and REMOVE ALL image containers from HTML
        // This prevents empty/blank image containers from appearing in the PDF
        console.log('⏳ Extracting images and removing containers from HTML...');
        const images = Array.from(container.querySelectorAll('img.pdf-image'));
        console.log(`📸 Found ${images.length} img.pdf-image elements in HTML`);
        const imageData = [];

        // Extract valid images and REMOVE ALL their containers
        for (const img of images) {
            const src = img.src || img.getAttribute('data-src');
            const label = img.getAttribute('alt') || 'Image';
            console.log(`📸 Processing image: ${label}, src length: ${src?.length || 0}, starts with data: ${src?.startsWith('data:')}, blob: ${src?.startsWith('blob:')}, http: ${src?.startsWith('http')}`);

            // Only extract images with valid src
            if (src && (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http'))) {
                imageData.push({
                    src,
                    label,
                    type: label.includes('Location') ? 'location' :
                        label.includes('Supporting Image') ? 'supporting' : 'property'
                });
                console.log(`✅ Extracted image: ${label} (type: ${label.includes('Location') ? 'location' : label.includes('Supporting Image') ? 'supporting' : 'property'})`);
            } else {
                console.log(`⏭️ Invalid image src, will not add to PDF: ${label} - src: ${src?.substring(0, 100)}`);
            }

            // CRITICAL FIX: REMOVE the ENTIRE image container from HTML
            // (not just hiding the image) to prevent empty boxes from rendering in PDF
            const parentContainer = img.closest('.image-container');
            if (parentContainer) {
                console.log(`🗑️ Removing image container from HTML: ${label}`);
                parentContainer.remove();
            }
        }

        console.log('✅ Extracted', imageData.length, 'images; removed', images.length, 'containers from HTML');

        // Convert HTML to canvas
        const canvas = await html2canvas(container, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            imageTimeout: 10000, // Increased timeout for base64 images
            windowHeight: container.scrollHeight,
            windowWidth: 793,
            onclone: (clonedDocument) => {
                // Ensure all images have proper attributes for rendering
                const clonedImages = clonedDocument.querySelectorAll('img');
                clonedImages.forEach(img => {
                    img.crossOrigin = 'anonymous';
                    img.loading = 'eager';
                    // Ensure img elements are visible
                    img.style.display = 'block';
                    img.style.visibility = 'visible';
                });
            }
        });

        // Remove temporary container
        document.body.removeChild(container);

        console.log('✅ Container removed, creating PDF...');

        // Create PDF from canvas with header/footer margins
        // Use JPEG for better compression instead of PNG
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const imgWidth = 210;
        const pageHeight = 297;
        const headerHeight = 20;  // 10mm header space
        const footerHeight = 20;  // 10mm footer space
        const usableHeight = pageHeight - headerHeight - footerHeight;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

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
                const ctx = canvas.getContext('2d');
                const width = Math.floor(canvas.width);
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

                    // If >75% of row is dark, it's a border line
                    // Higher threshold prevents splitting mid-table where there are gaps in borders
                    if (blackCount > width * 0.75) {
                        lastBlackRowIndex = row;
                    }
                }

                // Return the last safe break point (after the border)
                if (lastBlackRowIndex > 0 && lastBlackRowIndex < rowCount - 4) {
                    return lastBlackRowIndex;
                }
            } catch (err) {
                console.warn('Error finding safe break point:', err?.message);
            }

            // Fallback to original height if detection fails
            return maxHeightPixels;
        };

        // Helper function to detect if content is short (3-4 lines)
        const isShortContent = (heightPixels, avgLineHeight = 20) => {
            const estimatedLines = Math.ceil(heightPixels / avgLineHeight);
            return estimatedLines >= 2 && estimatedLines <= 4;
        };

        const pdf = new jsPDF('p', 'mm', 'A4');
        let pageNumber = 1;
        let heightLeft = imgHeight;
        let yPosition = 0;
        let sourceY = 0;  // Track position in the source canvas
        let currentPageYPosition = headerHeight;  // Track current Y position on page
        let pageAdded = false;  // Track if first page is added to prevent empty page

        while (heightLeft > 5) {  // Only continue if there's meaningful content left (>5mm to avoid blank pages)
            // Calculate how much of the image fits on this page
            let imageHeightForThisPage = Math.min(usableHeight, heightLeft);

            // Calculate the crop region from the canvas
            const canvasHeight = canvas.height;
            const canvasWidth = canvas.width;
            const sourceYPixels = (sourceY / imgHeight) * canvasHeight;
            const maxHeightPixels = (imageHeightForThisPage / imgHeight) * canvasHeight;

            // Find safe break point to avoid splitting rows
            const safeHeightPixels = findSafeBreakPoint(canvasHeight, sourceYPixels, maxHeightPixels);
            const sourceHeightPixels = Math.min(safeHeightPixels, maxHeightPixels);

            // Recalculate the actual height used
            imageHeightForThisPage = (sourceHeightPixels / canvasHeight) * imgHeight;

            // Guard against zero or negative height
            if (sourceHeightPixels <= 0) {
                console.warn('⚠️ Height is 0 or negative, skipping remaining content');
                heightLeft = 0;
                continue;
            }

            // Smart pagination: if remaining content is 3-4 lines, put on new page
            const remainingHeight = heightLeft - imageHeightForThisPage;
            if (remainingHeight > 0 && isShortContent(remainingHeight * (canvasHeight / imgHeight))) {
                // If remaining content is short, move it to new page
                const canStartNewPage = pageNumber > 1; // Can only start new page if not first page
                if (canStartNewPage && imageHeightForThisPage <= usableHeight * 0.7) {
                    // Only move if current content doesn't fill most of the page
                    // Keep currentPage content and push remaining to next page
                    console.log(`📄 Smart pagination: Moving short content (${remainingHeight.toFixed(1)}mm) to new page`);
                }
            }

            // Create a cropped canvas for this page
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvasWidth;
            pageCanvas.height = sourceHeightPixels;
            const pageCtx = pageCanvas.getContext('2d');
            pageCtx.drawImage(
                canvas,
                0, sourceYPixels,
                canvasWidth, sourceHeightPixels,
                0, 0,
                canvasWidth, sourceHeightPixels
            );

            // Preserve all borders consistently - detect and maintain borders regardless of data
            const borderThickness = 2; // pixels for bold border
            const borderColor = '#000000';

            // Helper to detect border and get its actual horizontal range
            const getBorderRange = (ctx, row, width) => {
                try {
                    const imageData = ctx.getImageData(0, row, width, 1);
                    const data = imageData.data;
                    let borderStart = -1;
                    let borderEnd = -1;

                    // Find where border starts (left edge)
                    for (let col = 0; col < width; col++) {
                        const idx = col * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        if (r < 150 && g < 150 && b < 150) {
                            borderStart = col;
                            break;
                        }
                    }

                    // Find where border ends (right edge)
                    for (let col = width - 1; col >= 0; col--) {
                        const idx = col * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        if (r < 150 && g < 150 && b < 150) {
                            borderEnd = col + 1;
                            break;
                        }
                    }

                    // Check if >30% of the row is dark (more lenient for detecting borders with less data)
                    let darkPixels = 0;
                    for (let col = borderStart; col < borderEnd; col++) {
                        const idx = col * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        if (r < 150 && g < 150 && b < 150) {
                            darkPixels++;
                        }
                    }

                    const borderWidth = borderEnd - borderStart;
                    if (borderWidth > 0 && darkPixels > borderWidth * 0.3) {
                        return { hasBorder: true, start: borderStart, end: borderEnd };
                    }
                    return { hasBorder: false, start: 0, end: 0 };
                } catch (e) {
                    return { hasBorder: false, start: 0, end: 0 };
                }
            };

            // Always check for and preserve TOP border (critical - don't skip)
            let topBorderRange = { hasBorder: false };
            for (let row = 0; row <= Math.min(4, sourceHeightPixels - 1); row++) {
                topBorderRange = getBorderRange(pageCtx, row, canvasWidth);
                if (topBorderRange.hasBorder) {
                    pageCtx.fillStyle = borderColor;
                    pageCtx.fillRect(topBorderRange.start, row, topBorderRange.end - topBorderRange.start, borderThickness);
                    break;
                }
            }

            // Always check for and preserve BOTTOM border (critical - don't skip)
            let bottomBorderRange = { hasBorder: false };
            // Expanded search range to catch bottom borders even with short content
            for (let row = Math.max(0, sourceHeightPixels - 1); row >= Math.max(0, sourceHeightPixels - 40); row--) {
                bottomBorderRange = getBorderRange(pageCtx, row, canvasWidth);
                if (bottomBorderRange.hasBorder) {
                    // Draw the border at the position where it was found
                    pageCtx.fillStyle = borderColor;
                    pageCtx.fillRect(bottomBorderRange.start, row, bottomBorderRange.end - bottomBorderRange.start, borderThickness);
                    break;
                }
            }

            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);

            // Only add new page if not first page - first page already exists from jsPDF init
            if (pageAdded) {
                pdf.addPage();
            } else {
                pageAdded = true;
            }

            // Add image with top margin (header space)
            pdf.addImage(pageImgData, 'JPEG', 0, headerHeight, imgWidth, imageHeightForThisPage);

            // Add page number in footer
            pdf.setFontSize(9);
            pdf.text(`Page ${pageNumber}`, 105, pageHeight - 5, { align: 'center' });

            // Update counters
            heightLeft -= imageHeightForThisPage;
            sourceY += imageHeightForThisPage;
            currentPageYPosition = headerHeight + imageHeightForThisPage;  // Update Y position
            pageNumber++;
        }

        // Reset currentPageYPosition since we're starting a new page for annexures
        // (any remaining content < 5mm was not rendered)
        currentPageYPosition = headerHeight;

        // Helper function to process annexure sections
        const processAnnexureSection = async (annexureHtmlContent, annexureName, needsNewPage = true) => {
            if (!annexureHtmlContent) return;

            console.log(`📄 Processing ${annexureName} section...`);

            // Create container for annexure
            const annexureContainer = document.createElement('div');
            annexureContainer.innerHTML = annexureHtmlContent;
            annexureContainer.style.position = 'absolute';
            annexureContainer.style.left = '-9999px';
            annexureContainer.style.top = '-9999px';
            annexureContainer.style.width = '210mm';
            annexureContainer.style.height = 'auto';
            annexureContainer.style.backgroundColor = '#ffffff';
            annexureContainer.style.fontSize = '12pt';
            annexureContainer.style.fontFamily = "'Arial', sans-serif";
            document.body.appendChild(annexureContainer);

            // Convert annexure to canvas
            const annexureCanvas = await html2canvas(annexureContainer, {
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                imageTimeout: 10000,
                windowHeight: annexureContainer.scrollHeight,
                windowWidth: 793
            });

            // Add new page for annexure only if needed AND there's content on current page
            // This prevents creating a blank page if we're already at the top of a new page
            if (needsNewPage) {
                // Only add page if there's substantial content on current page (more than just header space)
                // currentPageYPosition > headerHeight + 20 means there's at least 20mm of content
                if (currentPageYPosition > headerHeight + 20) {
                    pdf.addPage();
                    pageNumber++;
                    currentPageYPosition = headerHeight;
                    console.log(`📄 Added new page for ${annexureName}`);
                } else {
                    console.log(`📄 Skipping new page for ${annexureName} - minimal content on current page`);
                    // If on current page with minimal content, just continue on same page
                    // currentPageYPosition already at headerHeight, ready for new content
                }
            }

            // Calculate dimensions for annexure
            const annexureImgHeight = (annexureCanvas.height * imgWidth) / annexureCanvas.width;
            let annexureHeightLeft = annexureImgHeight;
            let annexureSourceY = 0;
            let annexurePageStarted = !needsNewPage; // Mark as started if we didn't add new page

            // Paginate annexure content
            while (annexureHeightLeft > 0) {
                // Check if content fits on current page
                let remainingHeightOnPage = pageHeight - footerHeight - currentPageYPosition;

                if (annexureHeightLeft > remainingHeightOnPage) {
                    // Content doesn't fit, need new page
                    pdf.addPage();
                    pageNumber++;
                    currentPageYPosition = headerHeight;
                    remainingHeightOnPage = pageHeight - footerHeight - currentPageYPosition;
                }

                let imageHeightForAnnexurePage = Math.min(remainingHeightOnPage, annexureHeightLeft);
                const annexureCanvasHeight = annexureCanvas.height;
                const annexureCanvasWidth = annexureCanvas.width;
                const annexureSourceYPixels = (annexureSourceY / annexureImgHeight) * annexureCanvasHeight;
                const annexureMaxHeightPixels = (imageHeightForAnnexurePage / annexureImgHeight) * annexureCanvasHeight;

                const annexureSafeHeightPixels = findSafeBreakPoint(annexureCanvasHeight, annexureSourceYPixels, annexureMaxHeightPixels);
                const annexureSourceHeightPixels = Math.min(annexureSafeHeightPixels, annexureMaxHeightPixels);

                imageHeightForAnnexurePage = (annexureSourceHeightPixels / annexureCanvasHeight) * annexureImgHeight;

                // Create cropped canvas for annexure page
                const annexurePageCanvas = document.createElement('canvas');
                annexurePageCanvas.width = annexureCanvasWidth;
                annexurePageCanvas.height = annexureSourceHeightPixels;
                const annexurePageCtx = annexurePageCanvas.getContext('2d');
                annexurePageCtx.drawImage(
                    annexureCanvas,
                    0, annexureSourceYPixels,
                    annexureCanvasWidth, annexureSourceHeightPixels,
                    0, 0,
                    annexureCanvasWidth, annexureSourceHeightPixels
                );

                // No border thickening for annexure sections - keep original appearance
                const annexurePageImgData = annexurePageCanvas.toDataURL('image/jpeg', 0.85);
                pdf.addImage(annexurePageImgData, 'JPEG', 0, currentPageYPosition, imgWidth, imageHeightForAnnexurePage);

                // Add page number
                pdf.setFontSize(9);
                pdf.text(`Page ${pageNumber}`, 105, pageHeight - 5, { align: 'center' });

                annexureHeightLeft -= imageHeightForAnnexurePage;
                annexureSourceY += imageHeightForAnnexurePage;
                currentPageYPosition += imageHeightForAnnexurePage;  // Update Y position
            }

            // Clean up container
            document.body.removeChild(annexureContainer);
            console.log(`✅ ${annexureName} section added to PDF`);
        };

        // Process Details of Valuation, Annexure-II, and Annexure-III without blank pages
        // All continue on same pages with natural pagination
        if (detailsHtmlContent) {
            await processAnnexureSection(detailsHtmlContent, 'Details of Valuation', false);
        }

        if (annexure2HtmlContent) {
            await processAnnexureSection(annexure2HtmlContent, 'Annexure-II', false);
        }

        if (annexure3HtmlContent) {
            await processAnnexureSection(annexure3HtmlContent, 'Annexure-III', false);
        }

        // Process Property Images section with new page (only if it exists)
        if (propertyImagesHtmlContent) {
            await processAnnexureSection(propertyImagesHtmlContent, 'Property Images', true);
        }

        // Process Area Images on new page
        if (areaImagesHtmlContent) {
            currentPageYPosition = headerHeight;
            await processAnnexureSection(areaImagesHtmlContent, 'Area Images', true);
        }

        // Process Location Images on new page
        if (locationImagesHtmlContent) {
            await processAnnexureSection(locationImagesHtmlContent, 'Location Images', true);
        }

        // Process Supporting Documents - each on its own page
        if (supportingDocsHtmlContent) {
            // Extract individual supporting document pages
            const docPageRegex = /<div[^>]*supporting-docs-page[^>]*>[\s\S]*?<\/div>/g;
            const docPages = supportingDocsHtmlContent.match(docPageRegex) || [];

            console.log(`📄 Found ${docPages.length} supporting document pages`);

            // Process each document on a new page
            for (let i = 0; i < docPages.length; i++) {
                const docHtml = `<div style="width: 100%; height: auto;">${docPages[i]}</div>`;

                // Create new page for each document
                if (i === 0 && currentPageYPosition > headerHeight) {
                    pdf.addPage();
                    pageNumber++;
                } else if (i > 0) {
                    pdf.addPage();
                    pageNumber++;
                }

                currentPageYPosition = headerHeight;

                // Process single document
                await processAnnexureSection(docHtml, `Supporting Document ${i + 1}`, false);
            }
        }

        console.log('📸 All image sections processed and added to PDF');

        // Remove the first blank page if no content was added (jsPDF creates with 1 blank page by default)
        if (!pageAdded) {
            console.log('⚠️ No content added, removing blank first page');
            const totalPages = pdf.getNumberOfPages();
            if (totalPages > 1) {
                pdf.deletePage(1);
            }
        }

        // Download PDF
        const filename = `valuation_${record?.clientName || record?.uniqueId || Date.now()}.pdf`;
        pdf.save(filename);

        console.log('✅ PDF generated and downloaded:', filename);
        return filename;
    } catch (error) {
        console.error('❌ Client-side PDF generation error:', error);
        throw error;
    }
}

const pdfExportService = {
    generateValuationReportHTML,
    generateRecordPDF,
    previewValuationPDF,
    generateRecordPDFOffline,
    generateRecordDOCX,
    normalizeDataForPDF
};

export default pdfExportService;