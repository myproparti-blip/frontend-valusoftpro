

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
            areaClassification: data.pdfDetails.areaClassification || normalized.areaClassification,
            apartmentCTSNo: data.pdfDetails.apartmentCTSNo || normalized.apartmentCTSNo,
            apartmentTSNo: data.pdfDetails.apartmentTSNo || normalized.apartmentTSNo,
            apartmentBlockNo: data.pdfDetails.apartmentBlockNo || normalized.apartmentBlockNo,
            apartmentWardNo: data.pdfDetails.apartmentWardNo || normalized.apartmentWardNo,
            apartmentVillageMunicipalityCounty: data.pdfDetails.apartmentVillageMunicipalityCounty || normalized.apartmentVillageMunicipalityCounty,
            apartmentDoorNoStreetRoad: data.pdfDetails.apartmentDoorNoStreetRoad || normalized.apartmentDoorNoStreetRoad,
            apartmentPinCode: data.pdfDetails.apartmentPinCode || normalized.apartmentPinCode,
            classificationPosh: data.pdfDetails.classificationPosh || normalized.classificationPosh,
            classificationUsage: data.pdfDetails.classificationUsage || normalized.classificationUsage,
            classificationOwnership: data.pdfDetails.classificationOwnership || normalized.classificationOwnership,
            ownerOccupancyStatus: data.pdfDetails.ownerOccupancyStatus || normalized.ownerOccupancyStatus
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

    // Map boundaries from direct fields if propertyBoundaries structure not present
    if (data.boundariesPlotNorthActual !== undefined || data.boundariesPlotNorthDeed !== undefined) {
        normalized = {
            ...normalized,
            boundariesPlotNorth: data.boundariesPlotNorthActual || data.boundariesPlotNorth || normalized.boundariesPlotNorth,
            boundariesPlotSouth: data.boundariesPlotSouthActual || data.boundariesPlotSouth || normalized.boundariesPlotSouth,
            boundariesPlotEast: data.boundariesPlotEastActual || data.boundariesPlotEast || normalized.boundariesPlotEast,
            boundariesPlotWest: data.boundariesPlotWestActual || data.boundariesPlotWest || normalized.boundariesPlotWest,
            boundariesPlotNorthActual: data.boundariesPlotNorthActual || normalized.boundariesPlotNorthActual,
            boundariesPlotSouthActual: data.boundariesPlotSouthActual || normalized.boundariesPlotSouthActual,
            boundariesPlotEastActual: data.boundariesPlotEastActual || normalized.boundariesPlotEastActual,
            boundariesPlotWestActual: data.boundariesPlotWestActual || normalized.boundariesPlotWestActual,
            boundariesPlotNorthDeed: data.boundariesPlotNorthDeed || normalized.boundariesPlotNorthDeed,
            boundariesPlotSouthDeed: data.boundariesPlotSouthDeed || normalized.boundariesPlotSouthDeed,
            boundariesPlotEastDeed: data.boundariesPlotEastDeed || normalized.boundariesPlotEastDeed,
            boundariesPlotWestDeed: data.boundariesPlotWestDeed || normalized.boundariesPlotWestDeed
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

    // Map unitMaintenance data
    if (data.unitMaintenance) {
        normalized = {
            ...normalized,
            unitMaintenance: data.unitMaintenance.unitMaintenanceStatus || normalized.unitMaintenance
        };
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
            finishingUnit: data.unitSpecifications.finishing || normalized.finishingUnit,
            unitBathAndWC: data.unitSpecifications.bathAndWC || normalized.unitBathAndWC,
            unitElectricalWiring: data.unitSpecifications.electricalWiring || normalized.unitElectricalWiring,
            unitWindows: data.unitSpecifications.windows || normalized.unitWindows,
            unitSpecification: data.unitSpecifications.specification || normalized.unitSpecification
        };
    }

    // Map unitAreaDetails data
    if (data.unitAreaDetails) {
        normalized = {
            ...normalized,
            undividedLandArea: data.unitAreaDetails.undividedLandAreaSaleDeed || data.unitAreaDetails.undividedLandArea || normalized.undividedLandArea,
            plinthArea: data.unitAreaDetails.plinthAreaUnit || data.unitAreaDetails.plinthArea || normalized.plinthArea,
            carpetArea: data.unitAreaDetails.carpetAreaUnit || data.unitAreaDetails.carpetArea || normalized.carpetArea
        };
    }

    // Map unitClassification data
    if (data.unitClassification) {
        normalized = {
            ...normalized,
            floorSpaceIndex: data.unitClassification.floorSpaceIndex || normalized.floorSpaceIndex,
            unitClassification: data.unitClassification.unitClassification || data.unitClassification.classification || normalized.unitClassification,
            residentialOrCommercial: data.unitClassification.residentialOrCommercial || data.unitClassification.usageType || normalized.residentialOrCommercial,
            ownerOccupiedOrLetOut: data.unitClassification.ownerOccupiedOrLetOut || data.unitClassification.occupancyType || normalized.ownerOccupiedOrLetOut,
            numberOfDwellingUnits: data.unitClassification.numberOfDwellingUnits || normalized.numberOfDwellingUnits
        };
    }

    // Map apartmentLocation data
    if (data.apartmentLocation) {
        normalized = {
            ...normalized,
            apartmentNature: data.apartmentLocation.apartmentNature || normalized.apartmentNature,
            apartmentLocation: data.apartmentLocation.apartmentLocation || data.apartmentLocation.location || normalized.apartmentLocation,
            apartmentCTSNo: data.apartmentLocation.apartmentCTSNo || data.apartmentLocation.ctsNo || data.apartmentLocation.cTSNo || normalized.apartmentCTSNo,
            apartmentTSNo: data.apartmentLocation.tsNo || data.apartmentLocation.ctsNo || data.apartmentLocation.tSNo || data.apartmentLocation.plotSurveyNo || data.apartmentLocation.apartmentCTSNo || normalized.apartmentTSNo,
            apartmentBlockNo: data.apartmentLocation.blockNo || data.apartmentLocation.block || data.apartmentLocation.blockNumber || data.apartmentLocation.apartmentBlockNo || normalized.apartmentBlockNo,
            apartmentWardNo: data.apartmentLocation.wardNo || data.apartmentLocation.ward || data.apartmentLocation.wardNumber || data.apartmentLocation.apartmentWardNo || normalized.apartmentWardNo,
            apartmentVillageMunicipalityCounty: data.apartmentLocation.villageOrMunicipality || data.apartmentLocation.village || data.apartmentLocation.municipality || data.apartmentLocation.tsVillage || data.apartmentLocation.apartmentVillageMunicipalityCounty || normalized.apartmentVillageMunicipalityCounty,
            apartmentDoorNoStreetRoad: data.apartmentLocation.doorNoStreetRoadPinCode || data.apartmentLocation.doorNo || data.apartmentLocation.streetRoad || data.apartmentLocation.street || data.apartmentLocation.doorNumber || data.apartmentLocation.roadName || data.apartmentLocation.apartmentDoorNoStreetRoad || normalized.apartmentDoorNoStreetRoad,
            apartmentPinCode: data.apartmentLocation.pinCode || data.apartmentLocation.apartmentPinCode || normalized.apartmentPinCode
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

    // Map images data
    if (data.propertyImages || data.locationImages || data.documentPreviews || data.supportingDocuments || data.areaImages) {
        normalized = {
            ...normalized,
            propertyImages: data.propertyImages || normalized.propertyImages || [],
            locationImages: data.locationImages || normalized.locationImages || [],
            documentPreviews: data.documentPreviews || data.supportingDocuments || normalized.documentPreviews || [],
            areaImages: data.areaImages || normalized.areaImages || {}
        };
    }

    // Map root level fields as final fallback
    normalized = {
        ...normalized,
        carpetArea: normalized.carpetArea || data.carpetArea,
        plinthArea: normalized.plinthArea || data.plinthArea,
        floorSpaceIndex: normalized.floorSpaceIndex || data.floorSpaceIndex,
        unitClassification: normalized.unitClassification || data.unitClassification,
        residentialOrCommercial: normalized.residentialOrCommercial || data.residentialOrCommercial,
        ownerOccupiedOrLetOut: normalized.ownerOccupiedOrLetOut || data.ownerOccupiedOrLetOut,
        apartmentLocation: normalized.apartmentLocation || data.apartmentLocation || data.location,
        apartmentCTSNo: normalized.apartmentCTSNo || data.apartmentCTSNo || data.ctsNo || data.cTSNo,
        apartmentTSNo: normalized.apartmentTSNo || data.apartmentTSNo || data.ctsNo || data.tSNo || data.tsNo || data.plotSurveyNo || data.apartmentCTSNo,
        apartmentBlockNo: normalized.apartmentBlockNo || data.apartmentBlockNo || data.blockNo || data.block || data.blockNumber,
        apartmentWardNo: normalized.apartmentWardNo || data.apartmentWardNo || data.wardNo || data.ward || data.wardNumber,
        apartmentVillageMunicipalityCounty: normalized.apartmentVillageMunicipalityCounty || data.apartmentVillageMunicipalityCounty || data.village || data.municipality || data.villageOrMunicipality || data.tsVillage,
        apartmentDoorNoStreetRoad: normalized.apartmentDoorNoStreetRoad || data.apartmentDoorNoStreetRoad || data.doorNo || data.streetRoad || data.street || data.doorNumber || data.roadName,
        apartmentPinCode: normalized.apartmentPinCode || data.apartmentPinCode || data.pinCode,
        classificationPosh: normalized.classificationPosh || data.classificationPosh,
        classificationUsage: normalized.classificationUsage || data.classificationUsage,
        classificationOwnership: normalized.classificationOwnership || data.classificationOwnership,
        ownerOccupancyStatus: normalized.ownerOccupancyStatus || data.ownerOccupancyStatus,
        propertyImages: normalized.propertyImages || data.propertyImages || [],
        locationImages: normalized.locationImages || data.locationImages || [],
        documentPreviews: normalized.documentPreviews || data.documentPreviews || data.supportingDocuments || [],
        areaImages: normalized.areaImages || data.areaImages || {}
    };

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

    return normalized;
};

export function generateUbiApfValuationReportHTML(data = {}) {
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
            agreementForSale: data?.pdfDetails?.agreementForSale,
            classificationPosh: data?.pdfDetails?.classificationPosh,
            classificationUsage: data?.pdfDetails?.classificationUsage,
            ownerOccupancyStatus: data?.pdfDetails?.ownerOccupancyStatus
        },
        hasPropertyImages: data?.propertyImages?.length || 0,
        hasLocationImages: data?.locationImages?.length || 0,
        hasDocumentPreviews: data?.documentPreviews?.length || 0,
        hasSupportingDocuments: data?.supportingDocuments?.length || 0,
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
        const preservedAreaImages = pdfData.areaImages;
        // Get supportImg from localStorage if documentPreviews is empty
        let preservedDocumentPreviews = pdfData.documentPreviews || data.documentPreviews || data.supportingDocuments;
        console.log('🔍 Before localStorage check:', {
            hasDocumentPreviews: !!pdfData.documentPreviews,
            documentPreviewsCount: pdfData.documentPreviews ? pdfData.documentPreviews.length : 0,
            hasDataDocumentPreviews: !!data.documentPreviews,
            hasDataSupportingDocuments: !!data.supportingDocuments
        });
        if (!preservedDocumentPreviews || preservedDocumentPreviews.length === 0) {
            try {
                const supportImgFromStorage = localStorage.getItem('supportImg');
                console.log('🔍 localStorage supportImg:', {
                    exists: !!supportImgFromStorage,
                    length: supportImgFromStorage ? supportImgFromStorage.length : 0
                });
                if (supportImgFromStorage) {
                    const parsed = JSON.parse(supportImgFromStorage);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        preservedDocumentPreviews = parsed;
                        console.log('📦 Loaded supportImg from localStorage:', parsed.length, 'images', parsed.map(p => ({ url: p.url ? 'YES' : 'NO', fileName: p.fileName })));
                    }
                }
            } catch (e) {
                console.warn('⚠️ Failed to load supportImg from localStorage:', e?.message);
            }
        }

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

        // Debug: Log what we have after merge
        console.log('📄 Document Previews after pdfDetails merge:', {
            preserved: preservedDocumentPreviews ? preservedDocumentPreviews.length : 0,
            pdfData: pdfData.documentPreviews ? pdfData.documentPreviews.length : 0,
            sample: pdfData.documentPreviews && pdfData.documentPreviews[0] ? { url: pdfData.documentPreviews[0].url ? 'YES' : 'NO', hasPreview: !!pdfData.documentPreviews[0].preview } : null
        });

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
        }

        // Ensure total fields are explicitly mapped
        if (data.pdfDetails.totalBuiltUpSqm) {
            pdfData.totalBuiltUpSqm = data.pdfDetails.totalBuiltUpSqm;
            console.log('[PDF Generation] Mapped totalBuiltUpSqm:', pdfData.totalBuiltUpSqm);
        }
        if (data.pdfDetails.totalBuiltUpSqft) {
            pdfData.totalBuiltUpSqft = data.pdfDetails.totalBuiltUpSqft;
            console.log('[PDF Generation] Mapped totalBuiltUpSqft:', pdfData.totalBuiltUpSqft);
        }
        if (data.pdfDetails.totalFloorAreaBalconySqm) {
            pdfData.totalFloorAreaBalconySqm = data.pdfDetails.totalFloorAreaBalconySqm;
            console.log('[PDF Generation] Mapped totalFloorAreaBalconySqm:', pdfData.totalFloorAreaBalconySqm);
        }
        if (data.pdfDetails.totalFloorAreaBalconySqft) {
            pdfData.totalFloorAreaBalconySqft = data.pdfDetails.totalFloorAreaBalconySqft;
            console.log('[PDF Generation] Mapped totalFloorAreaBalconySqft:', pdfData.totalFloorAreaBalconySqft);
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
        floorSpaceIndex: pdfData.floorSpaceIndex,

        // Apartment Building
        apartmentNature: pdfData.apartmentNature,
        apartmentLocation: pdfData.apartmentLocation,
        newRowData: pdfData.newRowData || pdfData.newFieldName,
        apartmentCTSNo: pdfData.apartmentCTSNo || pdfData.ctsNo || pdfData.cTSNo,
        apartmentTSNo: pdfData.apartmentTSNo || pdfData.tsNo || pdfData.apartmentLocation?.tsNo || pdfData.apartmentCTSNo,
        apartmentBlockNo: pdfData.apartmentBlockNo || pdfData.blockNo,
        apartmentWardNo: pdfData.apartmentWardNo || pdfData.wardNo,
        apartmentMunicipality: pdfData.apartmentMunicipality || pdfData.apartmentVillageMunicipalityCounty || pdfData.villageOrMunicipality,
        apartmentDoorNoStreetRoad: pdfData.apartmentDoorNoStreetRoad || pdfData.apartmentDoorNoPin || pdfData.apartmentDoorNoStreetRoadPinCode || pdfData.doorNoStreetRoadPinCode || pdfData.doorNo || pdfData.streetRoad,
        apartmentPinCode: pdfData.apartmentPinCode || pdfData.pinCode,
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
        residentialOrCommercial: pdfData.residentialOrCommercial || pdfData.classificationUsage || pdfData.pdfDetails?.classificationUsage,
        ownerOccupiedOrLetOut: (() => {
            // Comprehensive check for owner occupancy status field
            const result = pdfData.ownerOccupiedOrLetOut ||
                pdfData.ownerOccupancyStatus ||
                data?.ownerOccupancyStatus ||
                pdfData.classificationOwnership ||
                pdfData.pdfDetails?.ownerOccupiedOrLetOut ||
                pdfData.pdfDetails?.ownerOccupancyStatus ||
                pdfData.pdfDetails?.classificationOwnership ||
                data?.pdfDetails?.ownerOccupancyStatus ||
                data?.unitClassification?.ownerOccupiedOrLetOut;
            console.log('⚠️ ownerOccupiedOrLetOut mapping:', {
                'pdfData.ownerOccupiedOrLetOut': pdfData.ownerOccupiedOrLetOut,
                'pdfData.ownerOccupancyStatus': pdfData.ownerOccupancyStatus,
                'data.ownerOccupancyStatus': data?.ownerOccupancyStatus,
                'pdfData.pdfDetails?.ownerOccupancyStatus': pdfData.pdfDetails?.ownerOccupancyStatus,
                'data.pdfDetails?.ownerOccupancyStatus': data?.pdfDetails?.ownerOccupancyStatus,
                finalResult: result
            });
            return result;
        })(),
        facilityLift: pdfData.facilityLift || pdfData.liftAvailable || pdfData.pdfDetails?.liftAvailable,
        facilityWater: pdfData.facilityWater || pdfData.protectedWaterSupply || pdfData.pdfDetails?.protectedWaterSupply,
        facilitySump: pdfData.facilitySump || pdfData.undergroundSewerage || pdfData.pdfDetails?.undergroundSewerage,
        facilityParking: pdfData.facilityParking || pdfData.carParkingType || pdfData.carParkingOpenCovered || pdfData.pdfDetails?.carParkingOpenCovered,
        facilityCompoundWall: pdfData.facilityCompoundWall || pdfData.compoundWall || pdfData.compoundWallExisting || pdfData.isCompoundWallExisting || pdfData.pdfDetails?.isCompoundWallExisting,
        facilityPavement: pdfData.facilityPavement || pdfData.pavement || pdfData.pavementAroundBuilding || pdfData.isPavementLaidAroundBuilding || pdfData.pdfDetails?.isPavementLaidAroundBuilding,
        facilityOthers: pdfData.facilityOthers || pdfData.othersFacility || pdfData.pdfDetails?.othersFacility,
        compoundWall: pdfData.compoundWall || pdfData.compoundWallExisting || pdfData.isCompoundWallExisting,
        pavement: pdfData.pavement || pdfData.pavementAroundBuilding || pdfData.isPavementLaidAroundBuilding,

        // Unit (with multiple name variants)
        floorUnit: pdfData.floorUnit || pdfData.floorLocation || pdfData.unitFloor || pdfData.pdfDetails?.unitFloor,
        doorNoUnit: pdfData.doorNoUnit || pdfData.unitDoorNo || pdfData.pdfDetails?.unitDoorNo,
        roofUnit: pdfData.roofUnit || pdfData.roof || pdfData.unitRoof || pdfData.pdfDetails?.unitRoof,
        flooringUnit: pdfData.flooringUnit || pdfData.flooring || pdfData.unitFlooring || pdfData.pdfDetails?.unitFlooring,
        doorsUnit: pdfData.doorsUnit || pdfData.doors || pdfData.unitDoors || pdfData.pdfDetails?.unitDoors,
        windowsUnit: pdfData.windowsUnit || pdfData.windows || pdfData.unitWindows || pdfData.pdfDetails?.unitWindows,
        unitBathAndWC: pdfData.unitBathAndWC || pdfData.bathAndWC || pdfData.pdfDetails?.unitBathAndWC,
        unitElectricalWiring: pdfData.unitElectricalWiring || pdfData.electricalWiring || pdfData.pdfDetails?.unitElectricalWiring,
        unitSpecification: pdfData.unitSpecification || pdfData.specification || pdfData.pdfDetails?.unitSpecification,
        fittingsUnit: pdfData.fittingsUnit || pdfData.fittings || pdfData.unitFittings || pdfData.pdfDetails?.unitFittings,
        finishingUnit: pdfData.finishingUnit || pdfData.finishing || pdfData.unitFinishing || pdfData.pdfDetails?.unitFinishing,
        electricityConnectionNo: pdfData.electricityConnectionNo || pdfData.electricityServiceNo || pdfData.electricityServiceConnectionNo || pdfData.pdfDetails?.electricityServiceNo || pdfData.pdfDetails?.electricityServiceConnectionNo,
        agreementForSale: pdfData.agreementForSale || pdfData.agreementSaleExecutedName || pdfData.pdfDetails?.agreementSaleExecutedName,
        undividedLandArea: pdfData.undividedLandArea || pdfData.undividedAreaLand || pdfData.undividedArea || pdfData.pdfDetails?.undividedAreaLand,
        assessmentNo: pdfData.assessmentNo || pdfData.pdfDetails?.assessmentNo || data?.unitTax?.assessmentNo,
        taxPaidName: pdfData.taxPaidName || pdfData.pdfDetails?.taxPaidName || data?.unitTax?.taxPaidName,
        taxAmount: pdfData.taxAmount || pdfData.pdfDetails?.taxAmount || data?.unitTax?.taxAmount,
        meterCardName: pdfData.meterCardName || pdfData.pdfDetails?.meterCardName || pdfData.electricityServiceConnectionNo,

        // Valuation values
        carpetArea: pdfData.carpetArea || pdfData.carpetAreaFlat || pdfData.areaUsage || pdfData.pdfDetails?.carpetAreaFlat || pdfData.pdfDetails?.areaUsage,
        areaUsage: pdfData.areaUsage || pdfData.pdfDetails?.areaUsage,
        plinthArea: pdfData.plinthArea || pdfData.pdfDetails?.plinthArea,
        undividedLandArea: pdfData.undividedLandArea || pdfData.undividedLandAreaSaleDeed || pdfData.undividedAreaLand || pdfData.pdfDetails?.undividedAreaLand,
        ratePerSqft: pdfData.ratePerSqft || pdfData.presentValueRate || pdfData.adoptedBasicCompositeRate || pdfData.pdfDetails?.presentValueRate || pdfData.pdfDetails?.adoptedBasicCompositeRate,
        marketValue: pdfData.marketValue || pdfData.fairMarketValue || pdfData.pdfDetails?.fairMarketValue,
        marketValueWords: pdfData.marketValueWords || pdfData.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValue,
        fairMarketValueWords: pdfData.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValueWords || pdfData.marketValueWords,
        distressValue: pdfData.distressValue || pdfData.pdfDetails?.distressValue,
        distressValueWords: pdfData.distressValueWords || pdfData.pdfDetails?.distressValueWords,
        saleDeedValue: pdfData.saleDeedValue || pdfData.pdfDetails?.saleDeedValue,
        finalMarketValue: pdfData.finalMarketValue || pdfData.fairMarketValue || pdfData.pdfDetails?.fairMarketValue,
        finalMarketValueWords: pdfData.finalMarketValueWords || pdfData.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValueWords || pdfData.pdfDetails?.fairMarketValue,
        realisableValue: pdfData.realisableValue || pdfData.realizableValue || pdfData.pdfDetails?.realizableValue,
        realisableValueWords: pdfData.realisableValueWords || pdfData.pdfDetails?.realisableValueWords,
        finalDistressValue: pdfData.finalDistressValue || pdfData.distressValue || pdfData.pdfDetails?.distressValue,
        finalDistressValueWords: pdfData.finalDistressValueWords || pdfData.distressValueWords || pdfData.pdfDetails?.distressValueWords || pdfData.pdfDetails?.distressValue,
        readyReckonerValue: pdfData.readyReckonerValue || pdfData.totalJantriValue || pdfData.pdfDetails?.readyReckonerValue || pdfData.pdfDetails?.totalJantriValue,
        readyReckonerValueWords: pdfData.readyReckonerValueWords || pdfData.totalJantriValue || pdfData.pdfDetails?.readyReckonerValueWords || pdfData.pdfDetails?.readyReckonerValue || pdfData.pdfDetails?.totalJantriValue,
        readyReckonerYear: pdfData.readyReckonerYear || pdfData.pdfDetails?.readyReckonerYear || new Date().getFullYear(),
        insurableValue: pdfData.insurableValue || pdfData.pdfDetails?.insurableValue,
        insurableValueWords: pdfData.insurableValueWords || pdfData.pdfDetails?.insurableValueWords,
        monthlyRent: pdfData.monthlyRent || pdfData.pdfDetails?.monthlyRent,
        ownerOccupancyStatus: pdfData.ownerOccupancyStatus || pdfData.pdfDetails?.ownerOccupancyStatus,
        rentReceivedPerMonth: pdfData.rentReceivedPerMonth || pdfData.pdfDetails?.rentReceivedPerMonth || pdfData.pdfDetails?.monthlyRent,
        marketability: pdfData.marketability || pdfData.pdfDetails?.marketability,
        marketabilityRating: pdfData.marketability || pdfData.pdfDetails?.marketability,
        favoringFactors: pdfData.favoringFactors || pdfData.pdfDetails?.favoringFactors,
        negativeFactors: pdfData.negativeFactors || pdfData.pdfDetails?.negativeFactors,
        compositeRateAnalysis: pdfData.comparableRate,
        newConstructionRate: pdfData.adoptedBasicCompositeRate,

        // Signature & Report
        valuationPlace: pdfData.valuationPlace || pdfData.place || pdfData.pdfDetails?.valuationPlace,
        valuationDate: pdfData.valuationDate || pdfData.signatureDate || pdfData.pdfDetails?.valuationMadeDate,
        valuationMadeDate: pdfData.valuationMadeDate || pdfData.pdfDetails?.valuationMadeDate || pdfData.dateOfValuationMade,
        valuersName: pdfData.valuersName || pdfData.signerName || pdfData.pdfDetails?.valuersName,
        valuersCompany: pdfData.valuersCompany || pdfData.pdfDetails?.valuersCompany,
        valuersLicense: pdfData.valuersLicense || pdfData.pdfDetails?.valuersLicense,
        reportDate: pdfData.reportDate || pdfData.pdfDetails?.reportDate,

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
        totalCompositeRate: pdfData.totalCompositeRate || pdfData.pdfDetails?.totalCompositeRate || pdfData.adoptedBasicCompositeRate,
        guidelineRate: pdfData.guidelineRate || pdfData.pdfDetails?.guidelineRate || pdfData.pdfDetails?.guidelineRatePerSqm,
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
        classificationPosh: pdfData.unitClassification || pdfData.classificationPosh || pdfData.pdfDetails?.classificationPosh,
        classificationUsage: pdfData.classificationUsage || pdfData.pdfDetails?.classificationUsage,
        classificationOwnership: pdfData.classificationOwnership || pdfData.pdfDetails?.classificationOwnership,

        // Client & Document info
        clientName: pdfData.clientName,
        mobileNumber: pdfData.mobileNumber,
        address: pdfData.address,
        bankName: pdfData.bankName,
        city: pdfData.city,
        dsa: pdfData.dsa,
        engineerName: pdfData.engineerName,
        notes: pdfData.notes,

        // Images and Documents - with debug logging
        propertyImages: (() => {
            const result = pdfData.propertyImages || data?.propertyImages || [];
            console.log('🖼️ propertyImages final:', { has: result.length > 0, count: result.length });
            return result;
        })(),
        locationImages: (() => {
            const result = pdfData.locationImages || data?.locationImages || [];
            console.log('📍 locationImages final:', { has: result.length > 0, count: result.length, sample: result.slice(0, 1) });
            return result;
        })(),
        documentPreviews: (() => {
            const result = pdfData.documentPreviews || data?.documentPreviews || data?.supportingDocuments || [];
            console.log('📄 documentPreviews final:', { has: result.length > 0, count: result.length, sample: result.slice(0, 1) });
            return result;
        })(),

        // Custom Fields
        customFields: Array.isArray(pdfData.customFields) ? pdfData.customFields : [],
        customExtentOfSiteFields: Array.isArray(pdfData.customExtentOfSiteFields) ? pdfData.customExtentOfSiteFields : Array.isArray(data?.customExtentOfSiteFields) ? data.customExtentOfSiteFields : [],
        customFloorAreaBalconyFields: Array.isArray(pdfData.customFloorAreaBalconyFields) ? pdfData.customFloorAreaBalconyFields : Array.isArray(data?.customFloorAreaBalconyFields) ? data.customFloorAreaBalconyFields : [],
        customCarpetAreaFields: Array.isArray(pdfData.customCarpetAreaFields) ? pdfData.customCarpetAreaFields : Array.isArray(data?.customCarpetAreaFields) ? data.customCarpetAreaFields : Array.isArray(pdfData.pdfDetails?.customCarpetAreaFields) ? pdfData.pdfDetails.customCarpetAreaFields : [],
        customBuiltUpAreaFields: Array.isArray(pdfData.customBuiltUpAreaFields) ? pdfData.customBuiltUpAreaFields : Array.isArray(data?.customBuiltUpAreaFields) ? data.customBuiltUpAreaFields : Array.isArray(pdfData.pdfDetails?.customBuiltUpAreaFields) ? pdfData.pdfDetails.customBuiltUpAreaFields : []
    };

    // Debug: Log critical fields for troubleshooting
    console.log('🔍 PDF Field Extraction Debug:', {
        areaClassification: pdfData.areaClassification,
        postalAddress: pdfData.postalAddress,
        postalAddressRaw: data?.postalAddress,
        pdfDetailsPostalAddress: data?.pdfDetails?.postalAddress,
        cityTown: pdfData.cityTown,
        urbanType: pdfData.urbanType,
        customFieldsCount: Array.isArray(pdfData.customFields) ? pdfData.customFields.length : 0,
        customFieldsSample: Array.isArray(pdfData.customFields) && pdfData.customFields.length > 0 ? pdfData.customFields.slice(0, 2) : [],
        customExtentOfSiteFieldsCount: Array.isArray(pdfData.customExtentOfSiteFields) ? pdfData.customExtentOfSiteFields.length : 0,
        customExtentOfSiteFieldsSample: Array.isArray(pdfData.customExtentOfSiteFields) && pdfData.customExtentOfSiteFields.length > 0 ? pdfData.customExtentOfSiteFields.slice(0, 2) : [],
        customFloorAreaBalconyFieldsCount: Array.isArray(pdfData.customFloorAreaBalconyFields) ? pdfData.customFloorAreaBalconyFields.length : 0,
        customFloorAreaBalconyFieldsSample: Array.isArray(pdfData.customFloorAreaBalconyFields) && pdfData.customFloorAreaBalconyFields.length > 0 ? pdfData.customFloorAreaBalconyFields.slice(0, 2) : [],
        customCarpetAreaFieldsCount: Array.isArray(pdfData.customCarpetAreaFields) ? pdfData.customCarpetAreaFields.length : 0,
        customCarpetAreaFieldsSample: Array.isArray(pdfData.customCarpetAreaFields) && pdfData.customCarpetAreaFields.length > 0 ? pdfData.customCarpetAreaFields.slice(0, 2) : [],
        customBuiltUpAreaFieldsCount: Array.isArray(pdfData.customBuiltUpAreaFields) ? pdfData.customBuiltUpAreaFields.length : 0,
        customBuiltUpAreaFieldsSample: Array.isArray(pdfData.customBuiltUpAreaFields) && pdfData.customBuiltUpAreaFields.length > 0 ? pdfData.customBuiltUpAreaFields.slice(0, 2) : []
    });

    // DEBUG: Log final pdfData before rendering
    console.log('📋 Final pdfData before HTML rendering:', {
        unitMaintenance: pdfData.unitMaintenance,
        unitClassification: pdfData.unitClassification,
        classificationPosh: pdfData.classificationPosh,
        safeGetTest_unitMaintenance: safeGet(pdfData, 'unitMaintenance'),
        safeGetTest_unitClassification: safeGet(pdfData, 'unitClassification'),
        // Debug document previews
        documentPreviews_length: Array.isArray(pdfData.documentPreviews) ? pdfData.documentPreviews.length : 0,
        documentPreviews_sample: Array.isArray(pdfData.documentPreviews) && pdfData.documentPreviews.length > 0 ? pdfData.documentPreviews[0] : null,
        // Debug floor area data
        basementFloorBalconySqm: pdfData.basementFloorBalconySqm,
        groundFloorBalconySqm: pdfData.groundFloorBalconySqm,
        firstFloorBalconySqm: pdfData.firstFloorBalconySqm,
        customFloorAreaBalconyFieldsCount: Array.isArray(pdfData.customFloorAreaBalconyFields) ? pdfData.customFloorAreaBalconyFields.length : 0,
        // Debug total fields
        totalBuiltUpSqm: pdfData.totalBuiltUpSqm,
        totalBuiltUpSqft: pdfData.totalBuiltUpSqft,
        totalFloorAreaBalconySqm: pdfData.totalFloorAreaBalconySqm,
        totalFloorAreaBalconySqft: pdfData.totalFloorAreaBalconySqft,
        // Balcony floor values
        basementFloorBalconySqm: pdfData.basementFloorBalconySqm,
        groundFloorBalconySqm: pdfData.groundFloorBalconySqm,
        firstFloorBalconySqm: pdfData.firstFloorBalconySqm,
        basementFloorBalconySqft: pdfData.basementFloorBalconySqft,
        groundFloorBalconySqft: pdfData.groundFloorBalconySqft,
        firstFloorBalconySqft: pdfData.firstFloorBalconySqft
    });

    // Auto-calculate total built up area if not provided
    console.log('[PDF CALC] totalBuiltUpSqm status:', {
        current: pdfData.totalBuiltUpSqm,
        isEmpty: !pdfData.totalBuiltUpSqm || pdfData.totalBuiltUpSqm === 'NA' || pdfData.totalBuiltUpSqm === ''
    });

    if (!pdfData.totalBuiltUpSqm || pdfData.totalBuiltUpSqm === 'NA' || pdfData.totalBuiltUpSqm === '') {
        const basementSqm = parseFloat(pdfData.basementFloorAreaSqm || pdfData.basementFloorSqm) || 0;
        const groundSqm = parseFloat(pdfData.groundFloorSqm) || 0;
        const firstSqm = parseFloat(pdfData.firstFloorSqm) || 0;
        const customSqm = Array.isArray(pdfData.customExtentOfSiteFields)
            ? pdfData.customExtentOfSiteFields.reduce((sum, field) => sum + (parseFloat(field.sqm) || 0), 0)
            : 0;

        const totalSqm = basementSqm + groundSqm + firstSqm + customSqm;
        console.log('[PDF CALC] totalBuiltUpSqm breakdown:', {
            basementSqm, groundSqm, firstSqm, customCount: pdfData.customExtentOfSiteFields?.length || 0, customSqm, totalSqm
        });
        if (totalSqm > 0) {
            pdfData.totalBuiltUpSqm = totalSqm.toFixed(2);
        }
    }

    if (!pdfData.totalBuiltUpSqft || pdfData.totalBuiltUpSqft === 'NA' || pdfData.totalBuiltUpSqft === '') {
        const basementSqft = parseFloat(pdfData.basementFloorAreaSqft || pdfData.basementFloorSqft) || 0;
        const groundSqft = parseFloat(pdfData.groundFloorSqft) || 0;
        const firstSqft = parseFloat(pdfData.firstFloorSqft) || 0;
        const customSqft = Array.isArray(pdfData.customExtentOfSiteFields)
            ? pdfData.customExtentOfSiteFields.reduce((sum, field) => sum + (parseFloat(field.sqft) || 0), 0)
            : 0;

        const totalSqft = basementSqft + groundSqft + firstSqft + customSqft;
        if (totalSqft > 0) {
            pdfData.totalBuiltUpSqft = totalSqft.toFixed(2);
            console.log('[PDF] Auto-calculated totalBuiltUpSqft:', pdfData.totalBuiltUpSqft);
        }
    }

    // Auto-calculate total floor area including balcony if not provided
    console.log('[PDF CALC] totalFloorAreaBalconySqm status:', {
        current: pdfData.totalFloorAreaBalconySqm,
        isEmpty: !pdfData.totalFloorAreaBalconySqm || pdfData.totalFloorAreaBalconySqm === 'NA' || pdfData.totalFloorAreaBalconySqm === ''
    });

    if (!pdfData.totalFloorAreaBalconySqm || pdfData.totalFloorAreaBalconySqm === 'NA' || pdfData.totalFloorAreaBalconySqm === '') {
        const basementSqm = parseFloat(pdfData.basementFloorBalconySqm) || 0;
        const groundSqm = parseFloat(pdfData.groundFloorBalconySqm) || 0;
        const firstSqm = parseFloat(pdfData.firstFloorBalconySqm) || 0;
        const customSqm = Array.isArray(pdfData.customFloorAreaBalconyFields)
            ? pdfData.customFloorAreaBalconyFields.reduce((sum, field) => sum + (parseFloat(field.sqm) || 0), 0)
            : 0;

        const totalSqm = basementSqm + groundSqm + firstSqm + customSqm;
        console.log('[PDF CALC] totalFloorAreaBalconySqm breakdown:', {
            basementSqm, groundSqm, firstSqm, customCount: pdfData.customFloorAreaBalconyFields?.length || 0, customSqm, totalSqm
        });
        if (totalSqm > 0) {
            pdfData.totalFloorAreaBalconySqm = totalSqm.toFixed(2);
        }
    }

    if (!pdfData.totalFloorAreaBalconySqft || pdfData.totalFloorAreaBalconySqft === 'NA' || pdfData.totalFloorAreaBalconySqft === '') {
        const basementSqft = parseFloat(pdfData.basementFloorBalconySqft) || 0;
        const groundSqft = parseFloat(pdfData.groundFloorBalconySqft) || 0;
        const firstSqft = parseFloat(pdfData.firstFloorBalconySqft) || 0;
        const customSqft = Array.isArray(pdfData.customFloorAreaBalconyFields)
            ? pdfData.customFloorAreaBalconyFields.reduce((sum, field) => sum + (parseFloat(field.sqft) || 0), 0)
            : 0;

        const totalSqft = basementSqft + groundSqft + firstSqft + customSqft;
        if (totalSqft > 0) {
            pdfData.totalFloorAreaBalconySqft = totalSqft.toFixed(2);
            console.log('[PDF] Auto-calculated totalFloorAreaBalconySqft:', {
                basementSqft,
                groundSqft,
                firstSqft,
                customSqft,
                total: pdfData.totalFloorAreaBalconySqft
            });
        }
    }

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
    * { margin: 0; padding: 0; box-sizing: border-box; font-size: 12pt; }
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
    @page {
      size: A4;
      margin: 0;
    }
    .continuous-wrapper {
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white;
    }

    .page { 
      padding: 0;
      background: white; 
      width: 100%;
      box-sizing: border-box;
      overflow: visible !important;
      display: block !important;
      clear: both !important;
      margin: 0 !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }

    .form-table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      margin: 0;
      margin-bottom: 0;
      font-size: 12pt;
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
      border-top: 2px solid #000 !important;
      border-bottom: 1px solid #000 !important;
      border-left: 1px solid #000 !important;
      border-right: 1px solid #000 !important;
      min-height: 32px;
      height: 32px;
      padding: 5px 8px;
      vertical-align: middle;
    }

    .form-table tr:first-child td:first-child {
      border-left: 2px solid #000 !important;
    }

    .form-table tr:first-child td:last-child {
      border-right: 2px solid #000 !important;
    }

    /* Left and right edges - bold borders */
    .form-table td:first-child {
      border-left: 2px solid #000 !important;
    }

    .form-table td:last-child {
      border-right: 2px solid #000 !important;
    }

    /* Bottom row - single border only */
    .form-table tr:last-child td {
      border-bottom: 1px solid #000 !important;
      padding-bottom: 8px;
    }

    .form-table .row-num {
      width: 45px;
      min-width: 45px;
      max-width: 45px;
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
       width: 300px;
       min-width: 300px;
       max-width: 300px;
       font-weight: normal;
       background: #ffffffff;
       border: 1px solid #000 !important;
       word-wrap: break-word;
       overflow-wrap: break-word;
       vertical-align: top !important;
       padding: 8px 12px;
       white-space: normal;
       height: auto !important;
       word-break: break-word;
       overflow: visible;
       font-size: 12pt;
     }

      .form-table .value {
        width: 300px;
        min-width: 300px;
        max-width: 300px;
        text-align: left;
        background: white;
        border: 1px solid #000 !important;
        word-wrap: break-word;
        overflow-wrap: break-word;
        word-break: break-word;
        vertical-align: top !important;
        padding: 8px 12px;
        white-space: normal;
        height: auto !important;
        overflow: visible;
        font-weight: normal;
        font-size: 12pt;
      }

    .header-section {
      text-align: center;
      margin-bottom: 20px;
      padding: 10px 0;
    }

    .header-title {
      font-weight: bold;
      font-size: 14pt;
      text-align: center;
      margin-bottom: 5px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 15px; 
      font-weight: bold;
      font-size: 12pt;
    }

    /* 4-column table support for boundaries */
    .form-table.four-col td {
      border: 1px solid #000 !important;
      padding: 8px 12px;
      vertical-align: top;
      color: #000;
      background: white;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: visible;
      height: auto !important;
    }

    .form-table.four-col .row-num {
      width: 45px;
      min-width: 45px;
      max-width: 45px;
      border: 1px solid #000 !important;
    }

    .form-table.four-col .label {
      width: 200px;
      min-width: 200px;
      max-width: 200px;
      border: 1px solid #000 !important;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto !important;
      overflow: visible;
      vertical-align: top !important;
    }

    .form-table.four-col .deed {
      width: 130px;
      min-width: 130px;
      max-width: 130px;
      text-align: center;
      font-weight: normal;
      font-size: 12pt;
      border: 1px solid #000 !important;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto !important;
      overflow: visible;
      vertical-align: top !important;
      padding: 8px 12px;
    }

    .form-table.four-col .actual {
      width: 130px;
      min-width: 130px;
      max-width: 130px;
      text-align: center;
      font-weight: normal;
      font-size: 12pt;
      border: 1px solid #000 !important;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto !important;
      overflow: visible;
      vertical-align: top !important;
      padding: 8px 12px;
    }

    /* Standalone deed and actual for non-four-col tables */
    .form-table .deed {
      width: 130px;
      min-width: 130px;
      max-width: 130px;
      text-align: center;
      font-weight: normal;
      font-size: 12pt;
      border: 1px solid #000 !important;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      height: auto !important;
      overflow: visible;
      vertical-align: top !important;
      padding: 8px 12px;
    }

    .form-table .actual {
       width: 130px;
       min-width: 130px;
       max-width: 130px;
       text-align: center;
       font-weight: normal;
       font-size: 12pt;
       border: 1px solid #000 !important;
       white-space: normal;
       word-wrap: break-word;
       overflow-wrap: break-word;
       word-break: break-word;
       hyphens: auto;
       height: auto !important;
       overflow: visible;
       vertical-align: top !important;
       padding: 8px 12px;
     }

     /* For rows with deed/actual columns, label should be narrower */
     tr:has(td.deed) .label,
     tr:has(td.actual) .label {
       width: 150px;
       min-width: 150px;
       max-width: 150px;
     }

     /* Print/PDF specific styles - remove all extra borders */
     @media print {
       * {
         border-top: none !important;
         border-bottom: none !important;
         box-shadow: none !important;
       }

       html, body {
         margin: 0 !important;
         padding: 0 !important;
         border: none !important;
         background: white !important;
       }

       .continuous-wrapper {
         border: none !important;
         outline: none !important;
         box-shadow: none !important;
         margin: 0 !important;
         padding: 0 !important;
       }

       .page {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          margin: 0 !important;
        }

        .form-table {
          border: none !important;
          border-collapse: collapse !important;
          margin: 0 !important;
        }

       .form-table td {
         border-top: 1px solid #000 !important;
         border-bottom: 1px solid #000 !important;
         border-left: 1px solid #000 !important;
         border-right: 1px solid #000 !important;
       }

       .header-section, .header {
         border: none !important;
       }

       div:not(.form-table):not(.page):not(.continuous-wrapper) {
         border: none !important;
         box-shadow: none !important;
       }

       hr {
         display: none !important;
       }
       }

       /* Page break styles for tables */
       table {
       page-break-inside: auto;
       border-collapse: collapse;
       }

       tbody {
       page-break-inside: auto;
       }

       tr {
       page-break-inside: avoid;
       page-break-after: auto;
       }

       /* Prevent wrapper divs from creating extra borders at page breaks */
       div[style*="padding: 8px"] {
       page-break-inside: auto;
       border: none !important;
       }

       /* Remove any background or border styling that might appear at page boundaries */
       .continuous-wrapper,
       .page {
       border: none !important;
       background: white;
       box-shadow: none !important;
       outline: none !important;
       }

       /* Page break for forcing new page */
       .page-break {
       page-break-before: always;
       page-break-after: avoid;
       display: block;
       clear: both;
       }

       </style>
</head>
       <body>
    <div class="continuous-wrapper" style="border: none; outline: none; box-shadow: none; margin: 0; padding: 0; background: white;">
       <!-- PAGE 2: VALUATION REPORT -->
<div class="page" style="padding: 12mm; font-size: 12pt; box-sizing: border-box; border: none; outline: none; box-shadow: none; margin: 0; background: white;">

  <!-- REF NO & DATE (LEFT–RIGHT) -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
    <div>
      Ref. No.: ${safeGet(pdfData, 'refNo', 'NA')}
    </div>
    <div>
      Date: ${safeGet(pdfData, 'dateOnWhichValuationIsMade', 'NA') !== 'NA' ? formatDate(pdfData.dateOnWhichValuationIsMade) : 'NA'}
    </div>
  </div>
 <!-- TO SECTION -->
  <div style="margin-bottom: 15px; font-weight: bold; line-height: 1.6;">
    TO,<br>
    ${safeGet(data, 'bankName', 'NA')}<br>
    BRANCH: ${safeGet(pdfData, 'branch', 'NA')}
  </div>
  <!-- MAIN HEADING -->
  <div style="text-align: center; margin-bottom: 20px;">
    <div style="font-weight: bold; font-size: 13pt;">
      VALUATION REPORT (IN RESPECT OF LAND/SITE AND BUILDING)
    </div>
    <div style="font-size: 11pt; margin-top: 5px;">
      (To be filled in by the Approved Valuer)
    </div>
  </div>

 

  <!-- TABLE START -->
  <table class="form-table"  style="margin-top: 12mm; margin-bottom: 12mm; font-size: 12pt; width: 100%; box-sizing: border-box;">
    <colgroup>
      <col style="width: 8%;">
      <col style="width: 42%;">
      <col style="width: 50%;">
    </colgroup>

                <!-- SECTION I: GENERAL -->
        
                 <tr>
                     <td class="row-num">I.</td>
                     <td class="label">I. GENERAL</td>
                     <td class="value"></td>
                 </tr>
                
                 <tr>
                      <td class="row-num">2.</td>
                      <td class="label">Purpose for which the valuation is made</td>
                      <td class="value"> ${safeGet(data, 'bankName', 'NA')} Br.${safeGet(pdfData, 'branch', 'NA')}</td>
                  </tr>
                <tr>
                     <td class="row-num">3.</td>
                     <td class="label">a) Date of inspection<br>b) Date on which the valuation is made</td>
                     <td class="value">
                         a) ${safeGet(pdfData, 'dateOfInspection', 'NA') !== 'NA' ? formatDate(pdfData.dateOfInspection) : 'NA'}<br>
                         b) ${safeGet(pdfData, 'dateOnWhichValuationIsMade', 'NA') !== 'NA' ? formatDate(pdfData.dateOnWhichValuationIsMade) : 'NA'}
                     </td>
                 </tr>
                <tr>
                    <td class="row-num">4.</td>
                    <td colspan="2" class="label">List of documents produced for perusal</td>
                </tr>
                <tr>
                     <td class="row-num"></td>
                     <td class="label">i) Photocopy of Documents</td>
                     <td class="value"> ${safeGet(pdfData, 'documentsPhotocopy', 'NA')}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">ii) Sanctioned Plan (Commencement Certificate)</td>
                     <td class="value">:${safeGet(pdfData, 'sanctionedPlanStatus', 'NA')}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">iii) Building Completion Certificate</td>
                     <td class="value"> ${safeGet(pdfData, 'buildingCompletionCertificate', 'NA')}</td>
                 </tr>
                 <tr>
                     <td class="row-num">4.</td>
                     <td class="label">Name of the owner(s) and his / their address(es) with Phone no. (details of share of each owner in case of joint ownership)</td>
                     <td class="value">${safeGet(pdfData, 'ownerAddressJointOwners', 'NA')} </td>
                 </tr>
                 <tr>
                     <td class="row-num">5.</td>
                     <td class="label">Brief description of the property</td>
                     <td class="value">${safeGet(pdfData, 'briefDescriptionOfProperty', 'NA')}</td>
                 </tr>
                
                <!-- LOCATION OF PROPERTY -->
                <tr>
                    <td class="row-num">6.</td>
                    <td class="label" style="background: #ffffffff; font-weight: bold;">Location of property</td>
                    <td class="value"></td>
                </tr>
                <tr>
                     <td class="row-num"></td>
                     <td class="label">a) Plot No. / Survey No.</td>
                     <td class="value">${pdfData.plotNo || 'NA'}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">b) Door No.</td>
                     <td class="value">${pdfData.doorNo || 'NA'}</td>
                 </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">c) T. S. No. / Village</td>
                    <td class="value">${safeGet(pdfData, 'tpVillage', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">d) Ward / Taluka</td>
                    <td class="value">${safeGet(pdfData, 'wardTaluka', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">e) Mandal / District</td>
                    <td class="value">${safeGet(pdfData, 'district', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">f) Date of issue and validity of layout of approved map / plan</td>
                    <td class="value">${safeGet(pdfData, 'layoutPlanIssueDate', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">g) Approved map / plan issuing authority</td>
                    <td class="value">${safeGet(pdfData, 'approvedMapAuthority', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">h) Whether genuineness or authenticity of approved map / plan is verified</td>
                    <td class="value">${safeGet(pdfData, 'authenticityVerified', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">i) Any other comments by our empaneled valuers on authentic of approved plan</td>
                    <td class="value">${safeGet(pdfData, 'valuerCommentOnAuthenticity', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num">8.</td>
                    <td class="label">Postal address of the property</td>
                    <td class="value">${safeGet(pdfData, 'postalAddress', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num">9.</td>
                    <td class="label">City / Town</td>
                    <td class="value">${safeGet(pdfData, 'cityTown', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">Residential Area</td>
                    <td class="value">${safeGet(pdfData, 'residentialArea', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">Commercial Area</td>
                    <td class="value">${safeGet(pdfData, 'commercialArea', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">Industrial Area</td>
                    <td class="value">${safeGet(pdfData, 'industrialArea', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num">9.</td>
                    <td class="label">Classification of the area</td>
                    <td class="value"></td>
                </tr>
                <tr>
                     <td class="row-num"></td>
                     <td class="label">i) High / Middle / Poor</td>
                     <td class="value">${pdfData.areaClassification || 'NA'}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">ii) Urban / Semi Urban / Rural</td>
                     <td class="value">${pdfData.urbanType || 'NA'}</td>
                 </tr>
                 <tr>
                     <td class="row-num">10</td>
                     <td class="label">Coming under Corporation limit / Village Panchayat / Municipality</td>
                     <td class="value">${safeGet(pdfData, 'jurisdictionType', 'NA')}</td>
                 </tr>
                 
                 <tr>
                     <td class="row-num">11</td>
                     <td class="label">Whether covered under any State / Central Govt. enactments (e.g. Urban Land Ceiling Act) or notified under agency area / scheduled area / cantonment area</td>
                     <td class="value">${safeGet(pdfData, 'govtEnactmentsCovered', 'NA')}</td>
                </tr>
                <!-- BOUNDARIES SECTION -->
                <tr>
                    <td class="row-num">12a</td>
                    <td class="label" style="background: #ffffffff; font-weight: bold;">Boundaries of the property - Plot</td>
                    <td class="value">As per Actual</td>
                </tr>
                <tr>
                     <td class="row-num"></td>
                     <td class="label">North</td>
                     <td class="value">${safeGet(pdfData, 'boundariesPlotNorthActual', safeGet(pdfData, 'boundariesPlotNorth', 'NA'))}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">South</td>
                     <td class="value">${safeGet(pdfData, 'boundariesPlotSouthActual', safeGet(pdfData, 'boundariesPlotSouth', 'NA'))}</td>
                 </tr>
                <tr>
                     <td class="row-num"></td>
                     <td class="label">East</td>
                     <td class="value">${safeGet(pdfData, 'boundariesPlotEastActual', safeGet(pdfData, 'boundariesPlotEast', 'NA'))}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">West</td>
                     <td class="value">${safeGet(pdfData, 'boundariesPlotWestActual', safeGet(pdfData, 'boundariesPlotWest', 'NA'))}</td>
                 </tr>
                 
                 <tr>
                     <td class="row-num">12b</td>
                     <td class="label" style="background: #ffffffff; font-weight: bold;">Boundaries of the property – Plot</td>
                     <td class="value">As per Deed</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">North</td>
                     <td class="value">${safeGet(pdfData, 'boundariesPlotNorthDeed', safeGet(pdfData, 'boundariesPlotNorth', 'NA'))}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">South</td>
                     <td class="value">${safeGet(pdfData, 'boundariesPlotSouthDeed', safeGet(pdfData, 'boundariesPlotSouth', 'NA'))}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">East</td>
                     <td class="value">${safeGet(pdfData, 'boundariesPlotEastDeed', safeGet(pdfData, 'boundariesPlotEast', 'NA'))}</td>
                 </tr>
                 <tr>
                    <td class="row-num"></td>
                    <td class="label">West</td>
                    <td class="value">${safeGet(pdfData, 'boundariesPlotWestDeed', safeGet(pdfData, 'boundariesPlotWest', 'NA'))}</td>
                 </tr>
                
               <tr>
                   <td class="row-num">13</td>
                   <td class="label" style="background: #ffffffff; font-weight: bold;">Dimensions of the Site</td>
                    <td class="value">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="border: none; padding: 2px; width: 50%;">As per the Deed</td>
                                <td style="border: none; padding: 2px; width: 50%;">Actual</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 2px;">${safeGet(pdfData, 'dimensionsDeed', 'NA')}</td>
                                <td style="border: none; padding: 2px;">${safeGet(pdfData, 'dimensionsActual', 'NA')}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                <!-- EXTENT OF SITE SECTION -->
                <tr>
                    <td class="row-num">14 A</td>
                    <td colspan="2" class="label" style="padding: 0; border: none; background: transparent;">
                        <div style="padding: 8px;">
                            <div style="margin-bottom: 8px; font-weight: bold;">Extent of the Site</div>
                            
                            
                            <table style="width: 100%; border-collapse: collapse; border-spacing: 0; font-size: 12pt; page-break-inside: auto;">
                             <tr style="background: #ffffffff; font-weight: bold;">
                                    <td style="border: 1px solid #000; padding: 4px;font-weight: bold; ">Plot Area</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;font-weight: bold;">${safeGet(pdfData, 'plotAreaSqm', 'NA')}</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;font-weight: bold;">${safeGet(pdfData, 'plotAreaSqft', 'NA')}</td>
                                </tr>
                                <tr style="background: #ffffffff; font-weight: bold;">
                                    <td style="border: 1px solid #000; padding: 4px;font-weight: bold;">Floor</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;font-weight: bold;">Area in Sqm.</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;font-weight: bold;">Area in Sqft.</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000; padding: 3px;">Ground Floor</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'groundFloorSqm', 'NA')}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'groundFloorSqft', 'NA')}</td>
                                </tr>
                               
                                <tr>
                                    <td style="border: 1px solid #000; padding: 3px;">First Floor</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'firstFloorSqm', 'NA')}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'firstFloorSqft', 'NA')}</td>
                                </tr>
                                <tr>
                                     <td style="border: 1px solid #000; padding: 3px;">Basement Floor</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'basementFloorAreaSqm', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'basementFloorAreaSqft', 'NA')}</td>
                                 </tr>
                                 
                                 ${Array.isArray(pdfData.customExtentOfSiteFields) && pdfData.customExtentOfSiteFields.length > 0 ? pdfData.customExtentOfSiteFields.map(field => `
                                 <tr>
                                     <td style="border: 1px solid #000; padding: 3px;">${field.name || field.floorName || 'NA'}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${field.sqm || field.floorAreaSqm || 'NA'}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${field.sqft || field.floorAreaSqft || 'NA'}</td>
                                 </tr>
                                 `).join('') : ''}
                                
                                 <tr style="background: #ffffffff; font-weight: bold;">
                                     <td style="border: 1px solid #000; padding: 3px;">TOTAL built up area</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'totalBuiltUpSqm', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'totalBuiltUpSqft', 'NA')}</td>
                                 </tr>
                               
                                </table>
                        </div>
                    </td>
                </tr>
                
                <!-- EXTENT OF SITE SECTION - 14B -->
                <tr>
                    <td class="row-num">14 B</td>
                    <td colspan="2" class="label" style="padding: 0; border: none; background: transparent;">
                        <div style="padding: 8px;">
                            <div style="margin-bottom: 8px; font-weight: bold;">Total Floor area including Balcony & Terrace</div>
                            <div style="margin-bottom: 12px; font-weight: bold; font-size: 12pt;">as per actual measurement</div>
                            
                            <table style="width: 100%; border-collapse: collapse; border-spacing: 0; font-size: 12pt; page-break-inside: auto;">
                                <tr style="background: #ffffffff; font-weight: bold;">
                                    <td style="border: 1px solid #000; padding: 4px;font-weight: bold;">Floor</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;font-weight: bold;">Sqm.</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;font-weight: bold;">Sqft.</td>
                                </tr>
 
                                <tr>
                                    <td style="border: 1px solid #000; padding: 3px;">Basement Floor</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'basementFloorBalconySqm', 'NA') !== 'NA' ? safeGet(pdfData, 'basementFloorBalconySqm', 'NA') : safeGet(pdfData, 'basementFloorSqm', 'NA')}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'basementFloorBalconySqft', 'NA') !== 'NA' ? safeGet(pdfData, 'basementFloorBalconySqft', 'NA') : safeGet(pdfData, 'basementFloorSqft', 'NA')}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000; padding: 3px;">Ground Floor</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'groundFloorBalconySqm', 'NA') !== 'NA' ? safeGet(pdfData, 'groundFloorBalconySqm', 'NA') : safeGet(pdfData, 'groundFloorSqm', 'NA')}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'groundFloorBalconySqft', 'NA') !== 'NA' ? safeGet(pdfData, 'groundFloorBalconySqft', 'NA') : safeGet(pdfData, 'groundFloorSqft', 'NA')}</td>
                                </tr>
                               
                                <tr>
                                    <td style="border: 1px solid #000; padding: 3px;">First Floor</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'firstFloorBalconySqm', 'NA') !== 'NA' ? safeGet(pdfData, 'firstFloorBalconySqm', 'NA') : safeGet(pdfData, 'firstFloorSqm', 'NA')}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'firstFloorBalconySqft', 'NA') !== 'NA' ? safeGet(pdfData, 'firstFloorBalconySqft', 'NA') : safeGet(pdfData, 'firstFloorSqft', 'NA')}</td>
                                </tr>
                                
                                ${Array.isArray(pdfData.customFloorAreaBalconyFields) && pdfData.customFloorAreaBalconyFields.length > 0 ? pdfData.customFloorAreaBalconyFields.map(field => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 3px;">${field.name || field.floorName || 'NA'}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${field.sqm || field.floorAreaSqm || 'NA'}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${field.sqft || field.floorAreaSqft || 'NA'}</td>
                                </tr>
                                `).join('') : ''}
                                
                                <tr style="background: #ffffffff; font-weight: bold;">
                                    <td style="border: 1px solid #000; padding: 3px;">TOTAL AREA</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'totalFloorAreaBalconySqm', 'NA')}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'totalFloorAreaBalconySqft', 'NA')}</td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
                
                <tr>
                     <td class="row-num">14.1</td>
                     <td class="label">Latitude, Longitude & Co-ordinates of Bungalow</td>
                     <td class="value">${pdfData.latitude || safeGet(pdfData, 'latitudeLongitude', 'NA')}</td>
                 </tr>
                 
                 <tr>
                     <td class="row-num">15</td>
                     <td class="label">Extent of the site considered for valuation (least of 14 A & 14 B)</td>
                     <td class="value">
                        ${safeGet(pdfData, 'extentOfSiteValuation', 'NA')}
                     </td>
                 </tr>
                 
                 <tr>
                     <td class="row-num">16</td>
                     <td class="label">Whether occupied by the owner / tenant? If occupied by tenant, since how long? Rent received per month.</td>
                     <td class="value">${pdfData.occupancyStatus || pdfData.ownerOccupancyStatus || 'NA'}</td>
                 </tr>
                
                <!-- SECTION II: APARTMENT BUILDING -->
                
                <tr>
                    <td class="row-num" style="background: #ffffffff; font-weight: bold;">II</td>
                    <td class="label" style="background: #ffffffff; font-weight: bold;"> II. APARTMENT BUILDING</td>
                    <td class="value"></td>
                </tr>
                <tr>
                     <td class="row-num">1.</td>
                     <td class="label">Classification of locality</td>
                     <td class="value">${pdfData.localityClassification || safeGet(pdfData, 'descriptionOfLocalityResidentialCommercialMixed', 'NA')}</td>
                 </tr>
                 <tr>
                     <td class="row-num">2</td>
                     <td class="label">Development of surrounding areas</td>
                     <td class="value">${pdfData.surroundingDevelopment || safeGet(pdfData, 'developmentOfSurroundingAreas', 'NA')}</td>
                 </tr>
                 <tr>
                     <td class="row-num">3</td>
                     <td class="label">Possibility of frequent flooding / sub-merging</td>
                     <td class="value">${pdfData.floodRisk || safeGet(pdfData, 'possibilityOfFrequentFlooding', 'NA')}</td>
                 </tr>
                 <tr>
                     <td class="row-num">4.</td>
                     <td class="label">Feasibility to the Civic amenities: like school, hospital, bus stop, market etc.</td>
                     <td class="value">${pdfData.civicAmenities || safeGet(pdfData, 'feasibilityToCivicAmenities', 'NA')}</td>
                 </tr>
                <tr>
                    <td class="row-num">5.</td>
                    <td class="label">Level of land with topographical conditions</td>
                    <td class="value">${pdfData.levelOfLandWithTopographicalConditions || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">6.</td>
                    <td class="label">Shape of land</td>
                    <td class="value">${pdfData.shapeOfLand || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">7.</td>
                    <td class="label">Type of use to which it can be put</td>
                    <td class="value">${pdfData.typeOfUseToWhichItCanBePut || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">8.</td>
                    <td class="label">Any usage restriction</td>
                    <td class="value">${pdfData.anyUsageRestriction || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">9.</td>
                    <td class="label">Is plot in town planning approved layout?</td>
                    <td class="value">${pdfData.isPlotInTownPlanningApprovedLayout || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">10.</td>
                    <td class="label">Corner plot or intermittent plot?</td>
                    <td class="value">${pdfData.cornerPlotOrIntermittentPlot || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">11.</td>
                    <td class="label">Road facilities</td>
                    <td class="value">${pdfData.roadFacilities || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">12.</td>
                    <td class="label">Type of road available at present</td>
                    <td class="value">${pdfData.typeOfRoadAvailableAtPresent || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">13.</td>
                    <td class="label">Width of road – is it below 20 ft. or more than 20 ft.</td>
                    <td class="value">${pdfData.widthOfRoad || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">14.</td>
                    <td class="label">Is it a land – locked land?</td>
                    <td class="value">${pdfData.isItALandLockedLand || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">15.</td>
                    <td class="label">Water potentiality</td>
                    <td class="value">${pdfData.waterPotentiality || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">16.</td>
                    <td class="label">Underground sewerage system</td>
                    <td class="value">${pdfData.undergroundSewerageSystem || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">17.</td>
                    <td class="label">Is power supply available at the site?</td>
                    <td class="value">${pdfData.isPowerSupplyAvailableAtSite || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">18.</td>
                    <td class="label">Advantage of the site</td>
                    <td class="value">${pdfData.advantageOfSite || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">19.</td>
                    <td class="label">Special remarks, if any, like threat of acquisition of land for public service purposes, road widening or applicability of CRZ provisions etc.</td>
                    <td class="value">${pdfData.specialRemarksIfAnyThreatOfAcquisition || 'NA'}</td>
                </tr>
           
               
                 <tr>
                    <td class="row-num"></td>
                    <td class="label" style="background: #ffffffff; font-weight: bold;"> PART – A (VALUATION OF LAND)</td>
                    <td class="value"></td>
                </tr>
                <tr>
                    <td class="row-num">1</td>
                    <td class="label">Size of land North & South East & West</td>
                    <td class="value">Plot area =${pdfData.plotAreaSqm || 'NA'}=${pdfData.plotAreaSqft || 'NA'} as per 7/12 Extract</td>
                </tr>
                <tr>
                    <td class="row-num">2</td>
                    <td class="label">Total extent of the land</td>
                    <td class="value">Plot area = ${pdfData.plotAreaSqm || 'NA'}=${pdfData.plotAreaSqft || 'NA'} as per 7/12 Extract</td>
                </tr>
                <tr>
                    <td class="row-num">3</td>
                    <td class="label">Prevailing market rate (per acre) (Along with details /reference of at least two latest deals/transactions with respect to adjacent properties in the areas)</td>
                    <td class="value">Prevailing rate ${pdfData.prevailingMarketRatePerAcre || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">4</td>
                    <td class="label">Guideline rate obtained from the Registrar's Office / Mandal Revenue office (an evidence thereof to be enclosed)</td>
                    <td class="value">
                        ${pdfData.guidelineRate || 'NA'}<br>
                        
                    </td>
                </tr>
                <tr>
                    <td class="row-num">5.</td>
                    <td class="label">Assessed / adopted rate for valuation</td>
                    <td class="value">${pdfData.assessedAdoptedRate || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">6.</td>
                    <td class="label">Estimated value of land</td>
                    <td class="value">
                         ${safeGet(pdfData, 'estimatedValueOfLand', 'NA')} <br>
                    </td>
                    </tr>
                
                <!-- PART B: VALUATION OF BUILDING -->
                
                 <tr>
                    <td class="row-num"></td>
                    <td class="label" style="background: #ffffffff; font-weight: bold;"> PART – B (VALUATION OF BUILDING)</td>
                    <td class="value"></td>
                </tr>
                <tr>
                    <td class="row-num">1</td>
                    <td class="label" style="background: #ffffffff; ">Technical details of the building</td>
                    <td class="value"></td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">a) Type of Building (Residential/ Commercial/Industrial)</td>
                    <td class="value">${pdfData.buildingType || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">b) Type of construction (Load bearing/RCC /Steel Framed)</td>
                    <td class="value">${pdfData.typeOfConstruction || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">c) Year of Construction</td>
                    <td class="value">${pdfData.yearOfConstruction || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">d) Age of Property</td>
                    <td class="value">${safeGet(pdfData, 'ageOfProperty', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">e) Residual Life of the building Estimated</td>
                    <td class="value">${safeGet(pdfData, 'residualLifeBuilding', 'NA')}</td>
                </tr>
                <tr>
                    <td class="row-num"></td>
                    <td class="label">f) Number of floors</td>
                    <td class="value">${safeGet(pdfData, 'numberOfFloors', 'NA')}</td>
                </tr>
                
                <!-- CARPET AREA TABLE -->
                <tr>
                    <td class="row-num">9</td>
                    <td colspan="2" class="label" style="padding: 0; border: none; background: transparent;">
                        <div style="padding: 8px;">
                            <div style="margin-bottom: 8px; font-weight: bold;">Carpet area (As per Measurement) Carpet area floor-wise</div>
                            
                            <table style="width: 100%; border-collapse: collapse; font-size: 12pt; page-break-inside: auto;">
                                <tr style="background: #ffffffff; font-weight: bold;">
                                    <td style="border: 1px solid #000; padding: 4px;font-weight: bold;">Carpet Area</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;font-weight: bold;">Sqm.</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;font-weight: bold;">Sqft.</td>
                                </tr>
                                <tr>
                                     <td style="border: 1px solid #000; padding: 3px;">Basement Floor</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'basementFloorSqm', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'basementFloorSqft', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td style="border: 1px solid #000; padding: 3px;">Ground Floor</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'groundFloorSqm', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'groundFloorSqft', 'NA')}</td>
                                 </tr>
                                 
                                 <tr>
                                     <td style="border: 1px solid #000; padding: 3px;">First Floor</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'firstFloorSqm', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'firstFloorSqft', 'NA')}</td>
                                 </tr>
                                 
                                 ${Array.isArray(pdfData.customCarpetAreaFields) && pdfData.customCarpetAreaFields.length > 0 ? pdfData.customCarpetAreaFields.map(field => `
                                 <tr>
                                     <td style="border: 1px solid #000; padding: 3px;">${field.name || field.floorName || 'NA'}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${field.sqm || field.carpetAreaSqm || 'NA'}</td>
                                     <td style="border: 1px solid #000; padding: 3px; text-align: center;">${field.sqft || field.carpetAreaSqft || 'NA'}</td>
                                 </tr>
                                 `).join('') : ''}
                                 
                                 <tr style="background: #ffffffff; font-weight: bold;">
                                    <td style="border: 1px solid #000; padding: 3px;">TOTAL AREA</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'totalAreaSqm', 'NA')}</td>
                                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${safeGet(pdfData, 'totalAreaSqft', 'NA')}</td>
                                 </tr>
                                 </table>
                        </div>
                    </td>
                </tr>
                
                <tr>
                    <td class="row-num"></td>
                    <td class="label">Condition of the building</td>
                    <td class="value"></td>
                </tr>
                <tr>
                     <td class="row-num"></td>
                     <td class="label">i) Exterior Excellent, Good, Normal, Poor</td>
                     <td class="value">${pdfData.exteriorCondition || pdfData.appearanceOfBuilding || 'NA'}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">ii) Interior-Excellent, Good, Normal, Poor</td>
                     <td class="value">${pdfData.interiorCondition || pdfData.maintenanceOfBuilding || 'NA'}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">h) Date of issue and validity of layout of approved map /plan</td>
                     <td class="value">${pdfData.layoutApprovalDate || pdfData.layoutIssueDate || 'NA'}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">i) Approved map /plan issuing Authority</td>
                     <td class="value">${pdfData.mapIssuingAuthority || pdfData.approvedMapAuthority || 'NA'}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">j) Whether genuineness or authenticity of approved map /plan is verified</td>
                     <td class="value">${pdfData.mapVerified || pdfData.authenticityVerified || 'NA'}</td>
                 </tr>
                 <tr>
                     <td class="row-num"></td>
                     <td class="label">k) Any other comments by our empaneled valuers on authentic of approved plan</td>
                     <td class="value">${pdfData.otherComments || pdfData.valuersComments || 'NA'}</td>
                 </tr>
                
                <tr>
                                    <td class="row-num"></td>
                                    <td colspan="2" class="label">Specifications of construction (floor-wise) in respect of </td>
                                </tr>
                                <tr style="background: #ffffffff;">
                                    <td class="row-num" style="font-weight: bold;">Sr. No.</td>
                                    <td class="label" style="font-weight: bold;">Description</td>
                                    <td class="value" style="font-weight: bold;"></td>
                                </tr>
                                <tr>
                                     <td class="row-num">1.</td>
                                     <td class="label">Foundation</td>
                                     <td class="value">${safeGet(pdfData, 'constructionFoundation', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num">2.</td>
                                     <td class="label">Basement</td>
                                     <td class="value">${safeGet(pdfData, 'constructionBasement', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num">3.</td>
                                     <td class="label">Superstructure</td>
                                     <td class="value">${safeGet(pdfData, 'constructionSuperstructure', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num">4.</td>
                                     <td class="label">Entrance Door</td>
                                     <td class="value">${safeGet(pdfData, 'constructionEntranceDoor', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num"></td>
                                     <td class="label">Other Door</td>
                                     <td class="value">${safeGet(pdfData, 'constructionOtherDoor', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num">5.</td>
                                     <td class="label">Windows</td>
                                     <td class="value">${safeGet(pdfData, 'constructionWindows', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num">6.</td>
                                     <td class="label">Flooring, Skirting, dadoing</td>
                                     <td class="value">${safeGet(pdfData, 'constructionFlooring', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num">7.</td>
                                     <td class="label">Special finish as marble, granite, wooden paneling, grills, etc</td>
                                     <td class="value">${safeGet(pdfData, 'constructionSpecialFinish', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num">8.</td>
                                     <td class="label">Roofing including weather proof course</td>
                                     <td class="value">${safeGet(pdfData, 'constructionRoofing', 'NA')}</td>
                                 </tr>
                                 <tr>
                                     <td class="row-num">9.</td>
                                     <td class="label">Drainage</td>
                                     <td class="value">${safeGet(pdfData, 'constructionDrainage', 'NA')}</td>
                                 </tr>
                          
                            <tr style="background: #ffffffff;">
                                <td class="row-num" style="font-weight: bold;">Sr. No.</td>
                                <td class="label" style="font-weight: bold;">Description</td>
                                <td class="value" style="font-weight: bold;"></td>
                            </tr>
                            <tr>
                                 <td class="row-num">2.</td>
                                 <td class="label">Compound wall</td>
                                 <td class="value"></td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Height</td>
                                 <td class="value">${safeGet(pdfData, 'height', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Length</td>
                                 <td class="value">${safeGet(pdfData, 'length', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Type of construction</td>
                                 <td class="value">${safeGet(pdfData, 'typeOfConstruction', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num">3.</td>
                                 <td class="label">Electrical installation</td>
                                 <td class="value"></td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Type of wiring</td>
                                 <td class="value">${safeGet(pdfData, 'typeOfWiring', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Class of fittings (superior / ordinary / poor)</td>
                                 <td class="value">${safeGet(pdfData, 'classOfFittings', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Number of light points</td>
                                 <td class="value">${safeGet(pdfData, 'numberOfLightPoints', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Fan points</td>
                                 <td class="value">${safeGet(pdfData, 'farPlugs', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Spare plug points</td>
                                 <td class="value">${safeGet(pdfData, 'sparePlug', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">Any other item</td>
                                 <td class="value">${safeGet(pdfData, 'anyOtherElectricalItem', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num">4.</td>
                                 <td class="label">Plumbing installation</td>
                                 <td class="value"></td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">No. of water closets and their type</td>
                                 <td class="value">${safeGet(pdfData, 'numberOfWaterClassAndTaps', 'NA')}</td>
                             </tr>
                             <tr>
                                 <td class="row-num"></td>
                                 <td class="label">No. of wash basins</td>
                                 <td class="value">${safeGet(pdfData, 'noWashBasins', 'NA')}</td>
                             </tr>
                            <tr>
                                <td class="row-num"></td>
                                <td class="label">No. of urinals</td>
                                <td class="value">${safeGet(pdfData, 'noUrinals', 'NA')}</td>
                            </tr>
                            <tr>
                                <td class="row-num"></td>
                                <td class="label">No. of bathtubs</td>
                                <td class="value">${safeGet(pdfData, 'noOfBathtubs', 'NA')}</td>
                            </tr>
                            <tr>
                                <td class="row-num"></td>
                                <td class="label">Water meter, taps, etc</td>
                                <td class="value">${safeGet(pdfData, 'waterMeterTapsEtc', 'NA')}</td>
                            </tr>
                            <tr>
                                <td class="row-num"></td>
                                <td class="label">Any other fixtures</td>
                                <td class="value">${safeGet(pdfData, 'anyOtherPlumbingFixture', 'NA')}</td>
                            </tr>
                        
                
                <!-- VALUATION OF BUILDING DETAILS -->
                <tr>
                    <td colspan="3" style=" font-weight: bold; padding: 10px;">
                        DETAILS OF VALUATION OF BUILDING
                    </td>
                </tr>
                <tr>
                    <td class="row-num">a</td>
                    <td class="label">Estimated Replacement cost of construction</td>
                    <td class="value">
                        ₹ ${safeGet(pdfData, 'replacementCostGround', 'NA')}
                    </td>
                </tr>
                 <tr>
                    <td class="row-num">b</td>
                    <td class="label">Age of building</td>
                    <td class="value">${pdfData.buildingAge || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">c</td>
                    <td class="label">Life of the building estimated</td>
                    <td class="value">${pdfData.buildingLife || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">d</td>
                    <td class="label">Depreciation percentage assuming the salvage value as 10%</td>
                    <td class="value">${pdfData.depreciationPercentage || 'NA'}</td>
                </tr>
                <tr>
                    <td class="row-num">e</td>
                    <td class="label">Depreciated building rate</td>
                    <td class="value">${pdfData.depreciatedBuildingRate || 'NA'}</td>
                </tr>
                
                <!-- Built up area table - wrapped in Details of Valuation Building -->
                <tr>
                    <td class="row-num">f</td>
                    <td colspan="2" style="padding: 0; border: none; background: transparent;">
                        <div style="border: none; padding: 4px; margin: 2px 0;">
                            
                            <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
                                <tr style="background: #ffffffff;">
                                    <th style="border: 1px solid #000; padding: 2px;">Built up area</th>
                                    <th style="border: 1px solid #000; padding: 2px;">Sqft.</th>
                                    <th style="border: 1px solid #000; padding: 2px;">Rate of Construction</th>
                                    <th style="border: 1px solid #000; padding: 2px;">Value of Constr.</th>
                                </tr>
                                <tr>
                                     <td style="border: 1px solid #000; padding: 2px;">Ground Floor</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">${safeGet(pdfData, 'groundFloorBuiltUpSqft', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">${safeGet(pdfData, 'groundFloorRateConstruction', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹ ${(() => { const sqft = parseFloat(String(safeGet(pdfData, 'groundFloorBuiltUpSqft', '0')).replace(/[^0-9.-]/g, '')); const rate = parseFloat(String(safeGet(pdfData, 'groundFloorRateConstruction', '0')).replace(/[^0-9.-]/g, '')); const value = Math.round(sqft * rate); return isNaN(value) ? 'NA' : value.toLocaleString('en-IN'); })()}</td>
                                 </tr>
                               
                                <tr>
                                     <td style="border: 1px solid #000; padding: 2px;">First Floor</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">${safeGet(pdfData, 'firstFloorBuiltUpSqft', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">${safeGet(pdfData, 'firstFloorRateConstruction', 'NA')}</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹ ${(() => { const sqft = parseFloat(String(safeGet(pdfData, 'firstFloorBuiltUpSqft', '0')).replace(/[^0-9.-]/g, '')); const rate = parseFloat(String(safeGet(pdfData, 'firstFloorRateConstruction', '0')).replace(/[^0-9.-]/g, '')); const value = Math.round(sqft * rate); return isNaN(value) ? 'NA' : value.toLocaleString('en-IN'); })()}</td>
                                 </tr>
                                 
                                 ${Array.isArray(pdfData.customBuiltUpAreaFields) && pdfData.customBuiltUpAreaFields.length > 0 ? pdfData.customBuiltUpAreaFields.map(field => `
                                 <tr>
                                     <td style="border: 1px solid #000; padding: 2px;">${field.floorName || field.name || 'NA'}</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">${field.sqft || 'NA'}</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">${field.rateConstruction || field.rate || 'NA'}</td>
                                     <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹ ${(() => { const sqft = parseFloat(String(field.sqft || '0').replace(/[^0-9.-]/g, '')); const rate = parseFloat(String(field.rateConstruction || field.rate || '0').replace(/[^0-9.-]/g, '')); const value = Math.round(sqft * rate); return isNaN(value) ? 'NA' : value.toLocaleString('en-IN'); })()}</td>
                                 </tr>
                                 `).join('') : ''}
                                 
                                 <tr style="font-weight: bold; background: #ffffffff;">
                                    <td colspan="3" style="border: 1px solid #000; padding: 2px; text-align: left;">TOTAL VALUE OF CONSTRUCTION</td>
                                    <td style="border: 1px solid #000; padding: 2px; text-align: right;">
                                        ₹ ${(() => {
            let total = 0;
            // Calculate Ground Floor
            const gfSqft = parseFloat(String(safeGet(pdfData, 'groundFloorBuiltUpSqft', '0')).replace(/[^0-9.-]/g, ''));
            const gfRate = parseFloat(String(safeGet(pdfData, 'groundFloorRateConstruction', '0')).replace(/[^0-9.-]/g, ''));
            const gfValue = !isNaN(gfSqft) && !isNaN(gfRate) ? gfSqft * gfRate : 0;
            total += gfValue;

            // Calculate First Floor
            const ffSqft = parseFloat(String(safeGet(pdfData, 'firstFloorBuiltUpSqft', '0')).replace(/[^0-9.-]/g, ''));
            const ffRate = parseFloat(String(safeGet(pdfData, 'firstFloorRateConstruction', '0')).replace(/[^0-9.-]/g, ''));
            const ffValue = !isNaN(ffSqft) && !isNaN(ffRate) ? ffSqft * ffRate : 0;
            total += ffValue;

            // Calculate custom fields
            if (Array.isArray(pdfData.customBuiltUpAreaFields) && pdfData.customBuiltUpAreaFields.length > 0) {
                pdfData.customBuiltUpAreaFields.forEach(field => {
                    const sqft = parseFloat(String(field.sqft || '0').replace(/[^0-9.-]/g, ''));
                    const rate = parseFloat(String(field.rateConstruction || field.rate || '0').replace(/[^0-9.-]/g, ''));
                    const value = !isNaN(sqft) && !isNaN(rate) ? sqft * rate : 0;
                    total += value;
                });
            }

            return Math.round(total) === 0 ? 'NA' : Math.round(total).toLocaleString('en-IN');
        })()}
                                    </td>
                                 </tr>
                                 
                                 </table>
                        </div>
                    </td>
                </tr>
                
                </table>
                    </td>
                </tr>
                </table>
            
            <!-- EXTRA ITEMS, AMENITIES, MISCELLANEOUS TABLES -->
            <div style="margin-top: 15px; font-size: 12pt;">
                
                <!-- Part C: EXTRA ITEMS -->
                 <div style="margin-top: 15px; margin-bottom: 15px;">
                      <div style="font-weight: bold; margin-bottom: 5px;">Part C – EXTRA ITEMS</div>
                      <table class="form-table"  style="width: 100%; font-size: 12pt;">
                         <colgroup>
                             <col style="width: 8%;">
                             <col style="width: 42%;">
                             <col style="width: 50%;">
                         </colgroup>
                         <tr style="background: #ffffffff;"><td class="row-num" style="font-weight: bold;">Sr.</td><td class="label" style="font-weight: bold;">Description</td><td class="value" style="font-weight: bold;">Amount</td></tr>
                          <tr><td class="row-num">1.</td><td class="label">Portico</td><td class="value">${safeGet(pdfData, 'partCExtraItem1Amount', 'NA')}</td></tr>
                          <tr><td class="row-num">2.</td><td class="label">Ornamental Front door</td><td class="value">${safeGet(pdfData, 'partCExtraItem2Amount', 'NA')}</td></tr>
                          <tr><td class="row-num">3.</td><td class="label">Sit out/Verandah with Steel grills</td><td class="value">${safeGet(pdfData, 'partCExtraItem3Amount', 'NA')}</td></tr>
                          <tr><td class="row-num">4.</td><td class="label">Overhead Water Tank</td><td class="value">${safeGet(pdfData, 'partCExtraItem4Amount', 'NA')}</td></tr>
                          <tr><td class="row-num">5.</td><td class="label">Extra Steel/collapsible gates</td><td class="value">${safeGet(pdfData, 'partCExtraItem5Amount', 'NA')}</td></tr>
                          <tr style="font-weight: bold; background: #ffffffff;"><td colspan="2" class="label">Total</td><td class="value">${safeGet(pdfData, 'partCExtraTotal', 'NA')}</td></tr>
                       </table>
                 </div>
                
                <!-- Part D: AMENITIES -->
                 <div style="margin-top: 15px; margin-bottom: 15px;">
                     <div style="font-weight: bold; margin-bottom: 5px;">Part D – AMENITIES</div>
                     <table class="form-table"  style="width: 100%; font-size: 12pt;">
                     <colgroup>
                             <col style="width: 8%;">
                             <col style="width: 42%;">
                             <col style="width: 50%;">
                         </colgroup>
                         <tr style="background: #ffffffff;"><td class="row-num" style="font-weight: bold;">Sr.</td><td class="label" style="font-weight: bold;">Description</td><td class="value" style="font-weight: bold;">Amount</td></tr>
                         <tr><td class="row-num">1.</td><td class="label">Wardrobes</td><td class="value">${safeGet(pdfData, 'part2Item1Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">2.</td><td class="label">Glazed tiles</td><td class="value">${safeGet(pdfData, 'part2Item2Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">3.</td><td class="label">Extra Sink and bath tub</td><td class="value">${safeGet(pdfData, 'part2Item3Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">4.</td><td class="label">Marble / Ceramic tiles</td><td class="value">${safeGet(pdfData, 'part2Item4Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">5.</td><td class="label">Interior Decorations</td><td class="value">${safeGet(pdfData, 'part2Item5Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">6.</td><td class="label">Arch. elevation works</td><td class="value">${safeGet(pdfData, 'part2Item6Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">7.</td><td class="label">Panelling work</td><td class="value">${safeGet(pdfData, 'part2Item7Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">8.</td><td class="label">Aluminium hand rails</td><td class="value">${safeGet(pdfData, 'part2Item8Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">9.</td><td class="label">False Ceiling</td><td class="value">${safeGet(pdfData, 'part2Item9Amount', 'NA')}</td></tr>
                         <tr style="font-weight: bold; background: #ffffffff;"><td colspan="2" class="label">Total</td><td class="value">${safeGet(pdfData, 'part2Total', 'NA')}</td></tr>
                     </table>
                 </div>
                
                <!-- Part E: MISCELLANEOUS -->
                 <div style="margin-top: 15px; margin-bottom: 15px;">
                     <div style="font-weight: bold; margin-bottom: 5px;">Part E – MISCELLANEOUS</div>
                     <table class="form-table" style="width: 100%;">
                     <colgroup>
                             <col style="width: 8%;">
                             <col style="width: 42%;">
                             <col style="width: 50%;">
                         </colgroup>
                         <tr style="background: #ffffffff;"><td class="row-num" style="font-weight: bold;">Sr.</td><td class="label" style="font-weight: bold;">Description</td><td class="value" style="font-weight: bold;">Amount</td></tr>
                         <tr><td class="row-num">1.</td><td class="label">Separate Toilet room</td><td class="value">${safeGet(pdfData, 'part3Item1Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">2.</td><td class="label">Separate Lumber room</td><td class="value">${safeGet(pdfData, 'part3Item2Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">3.</td><td class="label">Separate water Tank / sump</td><td class="value">${safeGet(pdfData, 'part3Item3Amount', 'NA')}</td></tr>
                         <tr><td class="row-num">4.</td><td class="label">Trees Gardening</td><td class="value">${safeGet(pdfData, 'part3Item4Amount', 'NA')}</td></tr>
                         <tr style="font-weight: bold; background: #ffffffff;"><td colspan="2" class="label">Total</td><td class="value">${safeGet(pdfData, 'part3Total', 'NA')}</td></tr>
                     </table>
                     </div>
                     
                     <!-- Part F: SERVICES -->
                     <div style="margin-top: 15px; margin-bottom: 10px;">
                     <div style="font-weight: bold; margin-bottom: 5px;">Part F – SERVICES</div>
                     <table class="form-table" style="width: 100%;">
            <colgroup>
                <col style="width: 8%;">
                <col style="width: 42%;">
                <col style="width: 50%;">
            </colgroup>
            <tr style="background: #ffffffff;"><td class="row-num" style="font-weight: bold;">Sr. No.</td><td class="label" style="font-weight: bold;">Description</td><td class="value" style="font-weight: bold;">Amount in Rupees</td></tr>
            <tr><td class="row-num">1a</td><td class="label">Water supply RCC Tank 2L</td><td class="value">${safeGet(pdfData, 'partFItem1Amount', 'NA')}</td></tr>
            <tr><td class="row-num">1b</td><td class="label">Overhead RCC Tank 20K</td><td class="value">${safeGet(pdfData, 'partFItem2Amount', 'NA')}</td></tr>
            <tr><td class="row-num">2</td><td class="label">Drainage arrangements</td><td class="value">${safeGet(pdfData, 'partFItem3Amount', 'NA')}</td></tr>
            <tr><td class="row-num">3</td><td class="label">Compound wall</td><td class="value">${safeGet(pdfData, 'partFItem4Amount', 'NA')}</td></tr>
            <tr><td class="row-num">4</td><td class="label">Site Development</td><td class="value">${safeGet(pdfData, 'partFItem5Amount', 'NA')}</td></tr>
            <tr><td class="row-num">5</td><td class="label">Swimming pool</td><td class="value">${safeGet(pdfData, 'partFItem6Amount', 'NA')}</td></tr>
            <tr style="font-weight: bold; background: #ffffffff;"><td colspan="2" class="label">Total</td><td class="value">${safeGet(pdfData, 'partFTotal', 'NA')}</td></tr>
                      </table>
                  </div>
                  
                  <!-- TOTAL ABSTRACT OF THE ENTIRE PROPERTY -->
                  <div style="margin-top: 15px; margin-bottom: 10px;">
                      <div style="font-weight: bold; margin-bottom: 5px;">TOTAL ABSTRACT OF THE ENTIRE PROPERTY</div>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; box-sizing: border-box;">
                  <colgroup>
                  <col style="width: 15%;">
                  <col style="width: 40%;">
                  <col style="width: 45%;">
                  </colgroup>
                  <tr style="background: #ffffff; border-bottom: 1px solid #000;">
                  <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Part</td>
                  <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Description</td>
                  <td style="border: 1px solid #000; padding: 6px; font-weight: bold; text-align: right;">Amount in Rupees</td>
                  </tr>
                  <tr>
                  <td style="border: 1px solid #000; padding: 4px;">Part-A</td>
                  <td style="border: 1px solid #000; padding: 4px;">Land</td>
                  <td style="border: 1px solid #000; padding: 4px; text-align: right; ">${safeGet(pdfData, 'abstractLand', 'NA')}</td>
                  </tr>
                  <tr>
                  <td style="border: 1px solid #000; padding: 4px;">Part-B</td>
                  <td style="border: 1px solid #000; padding: 4px;">Building</td>
                  <td style="border: 1px solid #000; padding: 4px; text-align: right; ">${safeGet(pdfData, 'abstractBuilding', 'NA')}</td>
                  </tr>
                  <tr>
                  <td style="border: 1px solid #000; padding: 4px;">Part-C</td>
                  <td style="border: 1px solid #000; padding: 4px;">Extra Items</td>
                  <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'abstractExtraItems', 'NA')}</td>
                  </tr>
                  <tr>
                  <td style="border: 1px solid #000; padding: 4px;">Part-D</td>
                  <td style="border: 1px solid #000; padding: 4px;">Amenities</td>
                  <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'abstractAmenities', 'NA')}</td>
                  </tr>
                  <tr>
                  <td style="border: 1px solid #000; padding: 4px;">Part - E</td>
                  <td style="border: 1px solid #000; padding: 4px;">Miscellaneous</td>
                  <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'abstractMiscellaneous', 'NA')}</td>
                  </tr>
                  <tr>
                  <td style="border: 1px solid #000; padding: 4px;">Part – F</td>
                  <td style="border: 1px solid #000; padding: 4px;">Services</td>
                  <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'abstractServices', 'NA')}</td>
                  </tr>
                  <tr style="font-weight: bold; background-color: #ffffffff; border-top: 1px solid #000;">
                  <td colspan="2" style="border: 1px solid #000; padding: 6px;">Total Value</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${safeGet(pdfData, 'abstractTotalValue', 'NA')}</td>
                  </tr>
                  <tr>
                  <td colspan="2" style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">Say</td>
                  <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">${safeGet(pdfData, 'abstractRoundedValue', 'NA')}</td>
                  </tr>
                      </table>
                  </div>
                  
         
                  
                  </div>
                  
<!-- VALUATION CONCLUSION SECTION -->
<div style="margin-top: 10px;" class="no-break">
    <div style="font-size: 12pt; line-height: 1.6;">

        <p style="margin-bottom: 10px; text-align: justify;">
            As a result of my appraisal and analysis, it is my considered opinion that the present fair market value of the above property in the prevailing condition with aforesaid specifications is
            <strong>${safeGet(pdfData, 'abstractRoundedValue', 'NA')} (Rupees ${pdfData.abstractRoundedValue ? numberToWords(Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')))) : 'NA'} Only)</strong>
            and the distress value is
            <strong>${pdfData.abstractRoundedValue ? Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')) * 0.80).toLocaleString('en-IN') : 'NA'} (Rupees ${pdfData.abstractRoundedValue ? numberToWords(Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')) * 0.80)) : 'NA'} Only)</strong>.
        </p>

        <p style="margin-bottom: 10px; ">
            THE MARKET VALUE OF ABOVE PROPERTY IS <strong>${safeGet(pdfData, 'abstractRoundedValue', 'NA')} (Rupees ${pdfData.abstractRoundedValue ? numberToWords(Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')))) : 'NA'} Only)</strong>
        </p>

        <p style="margin-bottom: 10px; ">
            THE REALIZABLE VALUE OF ABOVE PROPERTY IS <strong>${pdfData.abstractRoundedValue ? Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')) * 0.90).toLocaleString('en-IN') : 'NA'} (Rupees ${pdfData.abstractRoundedValue ? numberToWords(Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')) * 0.90)) : 'NA'} Only)</strong>.
        </p>

        <p style="margin-bottom: 10px; ">
            THE DISTRESS VALUE OF ABOVE PROPERTY IS <strong>${pdfData.abstractRoundedValue ? Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')) * 0.80).toLocaleString('en-IN') : 'NA'} (Rupees ${pdfData.abstractRoundedValue ? numberToWords(Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')) * 0.80)) : 'NA'} Only)</strong>
        </p>

        <p style="margin-bottom: 30px; ">
            THE INSURABLE VALUE OF ABOVE PROPERTY IS <strong>${pdfData.abstractRoundedValue ? Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')) * 0.35).toLocaleString('en-IN') : 'NA'} (Rupees ${pdfData.abstractRoundedValue ? numberToWords(Math.round(parseFloat(String(pdfData.abstractRoundedValue).replace(/,/g, '')) * 0.35)) : 'NA'} Only)</strong>
        </p>

        <!-- PLACE / SIGNATURE -->
         <div style="display: flex; justify-content: space-between; margin-top: 30px;" class="no-break">

             <div style="width: 50%;">
                 <p style="font-weight: bold;">Place: ${safeGet(data, 'city', 'NA')}</p>
                 <p style="font-weight: bold;">Date: ${formatDate(pdfData.dateOnWhichValuationIsMade || pdfData.dateOnWhichValuationIsMade)}</p>
             </div>
        <div style="width: 50%; text-align: right; margin-top: 60px;">
        <p >Shashikant R. Dhumal</p>
        <p>Signature of Approved Valuer</p>
        <p>Engineer & Govt. Approved Valuer</p>
        <p> CAT/1/143-2007 
</p>
        </div>


        </div>

        <!-- BANK CONFIRMATION (NEW PAGE SAFE) -->
        <div class="page-break"></div>

        <p style="margin-top: 30px; text-align: justify;">
            The undersigned has inspected the property detailed in the Valuation Report dated __________ on __________.
            We are satisfied that the fair and reasonable market value of the property is
            ₹ ____________ /- (Rupees _________________________ only).
        </p>

        <div style="margin-top: 40px;" class="no-break">
            <p style="font-weight: bold;">Date: ____________________</p>

            <div style="text-align: right; margin-top: 40px;">
                <p style="font-weight: bold;">Signature</p>
                <p>(Name of the Branch Manager with office Seal)</p>
            </div>
        </div>

        <!-- ENCLOSURES -->
        <div style="margin-top: 30px;" class="no-break">
            <p style="font-weight: bold;">Encl:</p>
            <p>1. Declaration from the valuer in Format E (Annexure II of The Policy on Valuation of Properties and Empanelment of Valuers).</p>
            <p>2. Model code of conduct for valuer (Annexure III of The Policy on Valuation of Properties and Empanelment of Valuers)..</p>
        </div>

    </div>
    </div>
    
        <!-- Page Break Before COST OF CONSTRUCTION -->
                     <div>
                     <div style="text-align: center; margin-bottom: 15px; margin-top: 0px; font-weight: bold; font-size: 11pt; letter-spacing: 0.5px;">
                        COST OF CONSTRUCTION OF AS PER ACTUAL MEASUREMENT
                     </div>
                 
                 <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-bottom: 15px; margin-left: auto; margin-right: auto;">
                    <colgroup>
                        <col style="width: 30%;">
                        <col style="width: 20%;">
                        <col style="width: 20%;">
                        <col style="width: 30%;">
                    </colgroup>
                    <tr style="background: #ffffffff;">
                        <th style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: left;">SLAB AREA</th>
                        <th style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: center;">Sqft.</th>
                        <th style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: center;">RATE PER SQFT</th>
                        <th style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: right;">VALUE OF CONSTR.</th>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 4px;">Basement Floor</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'basementFloorCostSqft', 'NA')}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'basementFloorCostRate', 'NA')}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'basementFloorCostValue', 'NA')}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 4px;">Ground Floor</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'groundFloorCostSqft', 'NA')}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'groundFloorCostRate', 'NA')}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'groundFloorCostValue', 'NA')}</td>
                    </tr>
                    
                    <tr>
                        <td style="border: 1px solid #000; padding: 4px;">First Floor</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'firstFloorCostSqft', 'NA')}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'firstFloorCostRate', 'NA')}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${safeGet(pdfData, 'firstFloorCostValue', 'NA')}</td>
                    </tr>
                    
                    ${pdfData.pdfDetails?.customCostOfConstructionFields && pdfData.pdfDetails.customCostOfConstructionFields.length > 0
            ? pdfData.pdfDetails.customCostOfConstructionFields
                .map(floor => `
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 4px;">${safeGet({ slabArea: floor.slabArea }, 'slabArea', 'NA')}</td>
                                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${floor.sqft || 'NA'}</td>
                                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${floor.rate || 'NA'}</td>
                                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">${floor.value || 'NA'}</td>
                                    </tr>
                                `)
                .join('')
            : ''
        }
                    
                    <tr style="background: #ffffffff; font-weight: bold;">
                        <td style="border: 1px solid #000; padding: 4px;">TOTAL AREA</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">
                            ${(() => {
            const basementSqft = parseFloat(pdfData.basementFloorCostSqft) || 0;
            const groundSqft = parseFloat(pdfData.groundFloorCostSqft) || 0;
            const firstSqft = parseFloat(pdfData.firstFloorCostSqft) || 0;
            const customSqft = (pdfData.pdfDetails?.customCostOfConstructionFields || []).reduce((sum, floor) => sum + (parseFloat(floor.sqft) || 0), 0);
            const total = basementSqft + groundSqft + firstSqft + customSqft;
            return total > 0 ? total.toFixed(2) : 'NA';
        })()
        }
                        </td>
                        <td style="border: 1px solid #000; padding: 4px;">TOTAL VALUE</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">
                            ${(() => {
            const basementValue = parseFloat(pdfData.basementFloorCostValue) || 0;
            const groundValue = parseFloat(pdfData.groundFloorCostValue) || 0;
            const firstValue = parseFloat(pdfData.firstFloorCostValue) || 0;
            const customValue = (pdfData.pdfDetails?.customCostOfConstructionFields || []).reduce((sum, floor) => sum + (parseFloat(floor.value) || 0), 0);
            const total = basementValue + groundValue + firstValue + customValue;
            return total > 0 ? total.toFixed(2) : 'NA';
        })()
        }
                        </td>
                    </tr>
                 </table>

                 <div style="text-align: center; margin-top: 5px; margin-bottom: 5px; font-weight: bold; font-size: 11pt; letter-spacing: 0.5px;">
                    TOTAL ABSTRACT OF THE ENTIRE PROPERTY (AS PER REQUIREMENT OF OWNER)
                 </div>
                 
                 <table style="width: 100%; border-collapse: collapse; font-size: 11pt; margin-left: auto; margin-right: auto;">
                    <colgroup>
                        <col style="width: 15%;">
                        <col style="width: 40%;">
                        <col style="width: 45%;">
                    </colgroup>
                    <tr style="background: #ffffffff;">
                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Part</td>
                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Description</td>
                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; text-align: right;">Amount in Rupees</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px;">Part-A</td>
                        <td style="border: 1px solid #000; padding: 6px;">Land</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${safeGet(pdfData, 'ownerAbstractLand', 'NA')}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px;">Part-B</td>
                        <td style="border: 1px solid #000; padding: 6px;">Building</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${safeGet(pdfData, 'ownerAbstractBuilding', 'NA')}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px;">Part-C</td>
                        <td style="border: 1px solid #000; padding: 6px;">Extra Items</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${safeGet(pdfData, 'ownerAbstractExtraItems', 'NA')}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px;">Part-D</td>
                        <td style="border: 1px solid #000; padding: 6px;">Amenities</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${safeGet(pdfData, 'ownerAbstractAmenities', 'NA')}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px;">Part - E</td>
                        <td style="border: 1px solid #000; padding: 6px;">Miscellaneous</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${safeGet(pdfData, 'ownerAbstractMiscellaneous', 'NA')}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px;">Part - F</td>
                        <td style="border: 1px solid #000; padding: 6px;">Services</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${safeGet(pdfData, 'ownerAbstractServices', 'NA')}</td>
                    </tr>
                    <tr style="background: #ffffffff; font-weight: bold;">
                        <td colspan="2" style="border: 1px solid #000; padding: 6px;">Total Value</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${safeGet(pdfData, 'ownerAbstractTotalValue', 'NA')}</td>
                    </tr>
                    <tr style="background: #ffffffff; font-weight: bold;">
                        <td colspan="2" style="border: 1px solid #000; padding: 6px;">Say</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${safeGet(pdfData, 'ownerAbstractRoundedValue', 'NA')}</td>
                    </tr>
                    </table>

                    <p style="margin-bottom: 10px; margin-top: 10px; font-weight: bold;">
                        THE MARKET VALUE OF ABOVE PROPERTY IS <strong>${safeGet(pdfData, 'ownerAbstractRoundedValue', 'NA')} (Rupees ${pdfData.ownerAbstractRoundedValue ? numberToWords(Math.round(parseFloat(String(pdfData.ownerAbstractRoundedValue).replace(/,/g, '')))) : 'NA'} Only)</strong>
                    </p>

                    <p style="margin-bottom: 10px; font-weight: bold;">
                        THE REALIZABLE VALUE OF ABOVE PROPERTY IS <strong>${pdfData.ownerAbstractRoundedValue ? Math.round(parseFloat(String(pdfData.ownerAbstractRoundedValue).replace(/,/g, '')) * 0.90).toLocaleString('en-IN') : 'NA'} (Rupees ${pdfData.ownerAbstractRoundedValue ? numberToWords(Math.round(parseFloat(String(pdfData.ownerAbstractRoundedValue).replace(/,/g, '')) * 0.90)) : 'NA'} Only)</strong>.
                    </p>

                             <!-- CUSTOM FIELDS SECTION -->
                  ${Array.isArray(pdfData.customFields) && pdfData.customFields.length > 0 ? `
                  <div style="margin-top: 20px; ">
                      <div style="font-weight: bold; margin-bottom: 5px;">CUSTOM FIELDS</div>
                      <table style="width: 100%; border-collapse: collapse; box-sizing: border-box;">
                          <colgroup>
                              <col style="width: 40%;">
                              <col style="width: 60%;">
                          </colgroup>
                          <tr style="background: #ffffff; border-bottom: 2px solid #000;">
                              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Field Name</td>
                              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Value</td>
                          </tr>
                          ${pdfData.customFields.map((field, idx) => `
                          <tr>
                              <td style="border: 1px solid #000; padding: 6px;">${safeGet(field, 'name', 'NA')}</td>
                              <td style="border: 1px solid #000; padding: 6px;">${safeGet(field, 'value', 'NA')}</td>
                          </tr>
                          `).join('')}
                      </table>
                  </div>
                  ` : ''}
                    </div>
                    </div> <!-- END: cost-of-construction-section -->
                    
                  <!-- PAGE 8: ANNEXURE-II DECLARATION FROM VALUERS -->
<div class="annexure-ii-section" style="margin-left: 12mm; margin-right: 12mm; margin-top: 0; margin-bottom: 12mm; border: none; outline: none; box-shadow: none; background: white; page-break-before: avoid;">
    <div style="text-align: center; margin-bottom: 5px; font-weight: bold; font-size: 11pt;">
        Annexure-II
    </div>
    <div style="text-align: center; margin-bottom: 15px; font-weight: bold; font-size: 11pt;">
        DECLARATION FROM VALUERS
    </div>
    
    <div style="font-size: 12pt; line-height: 1.6; margin-bottom: 20px;">
        <p style="margin-bottom: 8px;"><strong>I hereby declare that-</strong></p>
        
        <p style="margin-bottom: 8px;"><strong>a.</strong>&nbsp;&nbsp;&nbsp;&nbsp;The information furnished in my valuation report dated ${formatDate(safeGet(pdfData, 'dateOnWhichValuationIsMade', safeGet(pdfData, 'dateOfValuation', '')))} is true and correct to the best of my knowledge and belief and I have made an impartial and true valuation of the property.</p>
         
        <p style="margin-bottom: 8px;"><strong>b.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I have no direct or indirect interest in the property valued;</p>
         
        <p style="margin-bottom: 8px;"><strong>c.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I have personally inspected the property on ${formatDate(safeGet(pdfData, 'dateOfInspection', safeGet(pdfData, 'dateOfInspection', '')))}. The work is not sub-contracted to any other valuer and carried out by myself;</p>
        
        <p style="margin-bottom: 8px;"><strong>d.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I have not been convicted of any offence and sentenced to a term of imprisonment;</p>
        
        <p style="margin-bottom: 8px;"><strong>e.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I have not been found guilty of misconduct in my professional capacity.</p>
        
        <p style="margin-bottom: 8px;"><strong>f.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I have read the Handbook on Policy, Standards and Procedure for Real Estate Valuation, 2011 of the Indian Banks' Association (IBA) and this report is in conformity to the "Standards" enshrined for valuation in the Part-B of the above handbook to the best of my ability.</p>
        
        <p style="margin-bottom: 8px;"><strong>g.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I have read the International Valuation Standards (IVS) and the report submitted to ${safeGet(data, 'bankName', 'NA')} for the respective asset class is in conformity to the "Standards" as enshrined for valuation in the IVS in "General Standards" and "Asset Standards" as applicable.</p>
        
        <p style="margin-bottom: 8px;"><strong>h.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I abide by the Model Code of Conduct for empanelment of valuers in ${safeGet(data, 'bankName', 'NA')}. (Annexure III - A signed copy of same to be taken and kept along with this declaration)</p>
        
        <p style="margin-bottom: 8px;"><strong>i.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I am registered under Section 34 AB of the Wealth Tax Act, 1957. Registration No: ${safeGet(data, 'registrationNumber', 'NA')}</p>
        
        <p style="margin-bottom: 8px;"><strong>j.</strong>&nbsp;&nbsp;&nbsp;&nbsp;I am the proprietor / partner / authorized official of the firm / company, who is competent to sign this valuation report.</p>
        
        <p style="margin-bottom: 20px;"><strong>k.</strong>&nbsp;&nbsp;&nbsp;&nbsp;Further, I hereby provide the following information:</p>
    </div>
<table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 15px; page-break-inside: auto;">
    <thead>
        <tr style="background: #ffffffff;">
            <td style="border: 1px solid #000; padding: 5px; font-weight: bold; width: 5%; text-align: center;">Sr. No.</td>
            <td style="border: 1px solid #000; padding: 5px; font-weight: bold; width: 45%;">Particulars</td>
            <td style="border: 1px solid #000; padding: 5px; font-weight: bold; width: 50%;">Valuer comment</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid #000; padding: 5px; text-align: center;">1</td>
            <td style="border: 1px solid #000; padding: 5px;">Background information of the asset being valued;</td>
            <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
                Property in question to be purchased by Mr. 
${safeGet(pdfData, 'clientName', 'Client')}. This is based on 
information given by Owner and documents 
available for our perusals.
            </td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 5px; text-align: center;">2</td>
            <td style="border: 1px solid #000; padding: 5px;">Purpose of valuation and appointing authority</td>
            <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
                As per Request of Brancha Manager ${safeGet(data, 'bankName', 'NA')} Br.${safeGet(pdfData, 'branch', 'NA')}
            </td>
        </tr>
         <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center;">3</td>
           <td style="border: 1px solid #000; padding: 5px;">Identity of the valuer and any other experts involved in the valuation;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
              Mr.Shashikant R. Dhumal
           </td>
        </tr>

        </tbody>
        </table>

        <!-- PAGE BREAK WITHIN ANNEXURE-II TABLE CONTINUATION -->
        <div class="page-break"></div>

        <!-- CONTINUATION OF ANNEXURE-II TABLE -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 15px;margin-top: 50px; page-break-inside: auto;">
       
        <tbody>
       
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">4</td>
           <td style="border: 1px solid #000; padding: 5px;">Disclosure of valuer interest or conflict, if any;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               NO
           </td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">5</td>
           <td style="border: 1px solid #000; padding: 5px;">Date of appointment, valuation date and date of report;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               ${(() => {
            const appointmentDate = formatDate(pdfData.dateOfAppointment || pdfData.dateOfAppointment || pdfData.date);
            const valuationDate = formatDate(pdfData.dateOnWhichValuationIsMade);
            return `Date of appointment: ${appointmentDate}<br>Valuation date: ${valuationDate}`;
        })()}
           </td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">6</td>
           <td style="border: 1px solid #000; padding: 5px;">Inspections and/or investigations undertaken;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               ${pdfData.inspectionDetails ||
        `Site inspection was carried out on along with ${safeGet(pdfData, 'clientName', 'Client')}. Detailed physical inspection, measurement verification, and photographic documentation were completed.`}
           </td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">7</td>
           <td style="border: 1px solid #000; padding: 5px;">Nature and sources of the information used or relied upon;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               ${pdfData.informationSources ||
        pdfData.sourcesOfInformation ||
        'Local inquiry in the surrounding vicinity, market analysis, documents provided by client including property documents, site measurements, and government records.'}
           </td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">8</td>
           <td style="border: 1px solid #000; padding: 5px;">Procedures adopted in carrying out the valuation and valuation standards followed;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               ${pdfData.valuationProcedures ||
        pdfData.proceduresAdopted ||
        `Actual site visit conducted along with ${safeGet(pdfData, 'clientName', 'Client')}. Valuation report was prepared by adopting Land & Building method of valuation in accordance with International Valuation Standards (IVS) and IBA guidelines.`}
           </td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">9</td>
           <td style="border: 1px solid #000; padding: 5px;">Restrictions on use of the report, if any;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               ${pdfData.reportRestrictions ||
        pdfData.restrictionsOnReport ||
        'The report is valid for the purpose mentioned in the report and cannot be used for any other purpose without prior written consent.'}
           </td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">10</td>
           <td style="border: 1px solid #000; padding: 5px;">Major factors that were taken into account during the valuation;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               ${pdfData.majorValuationFactors ||
        pdfData.majorFactorsValuation ||
        'Market analysis, local conditions, construction quality, age of property, location advantages, infrastructure development, comparable property rates, and economic factors.'}
           </td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">11</td>
           <td style="border: 1px solid #000; padding: 5px;">Major risks that were taken into account during the valuation;</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               ${pdfData.majorValuationRisks ||
        pdfData.majorRisksValuation ||
        'Market volatility, economic conditions, legal and regulatory changes, environmental factors, and property-specific risks.'}
           </td>
        </tr>
        <tr>
           <td style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%">12</td>
           <td style="border: 1px solid #000; padding: 5px;">Caveats, limitations and disclaimers to the extent they explain or elucidate the limitations faced by valuer, which shall not be for the purpose of limiting his responsibility for the valuation report.</td>
           <td style="border: 1px solid #000; padding: 5px; font-size: 9.5pt;">
               ${pdfData.caveatsLimitations ||
        pdfData.valuationCaveats ||
        'Valuation is based on information available at the time of inspection and market conditions prevailing on the valuation date. No hidden defects or legal issues affecting the property value were detected during inspection.'}
           </td>
        </tr>
        </tbody>
        </table>
        
        <div style="margin-top: 8px; font-size: 11pt;">
        <p style="font-weight: bold;">Date: ${formatDate(safeGet(pdfData, 'dateOnWhichValuationIsMade', safeGet(pdfData, 'dateOnWhichValuationIsMade', '')))}</p>
        <p style="font-weight: bold;">Place: ${safeGet(data, 'city', 'NA')}</p>
        </div>

<div style="margin-top: 12px; text-align: right; font-size: 11pt;">
    <p style="font-weight: bold;">Shashikant R. Dhumal</p>
    <p style="font-weight: bold;">Signature of Approved Valuer</p>
    <p style="font-weight: normal;">Engineer & Government Approved Valuer</p>
    <p style="font-weight: normal;">CAT/I/143-2007</p>
</div>
</div>

                  <!-- PAGE BREAK BEFORE ANNEXURE III -->
<div class="page-break"></div>

<!-- PAGE 9: ANNEXURE-III MODEL CODE OF CONDUCT FOR VALUERS -->
<div class="annexure-iii-section"
     style="margin-left: 12mm; margin-right: 12mm; margin-top: 12mm; margin-bottom: 12mm;
            font-size: 12pt; line-height: 1.5; text-align: justify;">

    <div class="no-break" style="text-align:center; font-weight:bold;">
        <div>ANNEXURE - III</div>
        <div style="margin-bottom:20px;">MODEL CODE OF CONDUCT FOR VALUERS</div>
    </div>

    <p>All valuers empanelled with bank shall strictly adhere to the following code of conduct:</p>

    <p style="font-weight:bold;">Integrity and Fairness</p>

    <p><strong>1.</strong> A valuer shall, in the conduct of his/its business, follow high standards of integrity and fairness 
in all his/its dealings with his/its clients and other valuers.  </p>

    <p><strong>2.</strong> A valuer shall maintain integrity by being honest, straightforward, and forthright in all professional relationships.</p>

    <p><strong>3.</strong> A valuer shall endeavour to ensure that he/it provides true and adequate information and shall not misrepresent any facts or situations.</p>

    <p><strong>4.</strong> A valuer shall refrain from being involved in any action that would bring disrepute to the profession.</p>

    <p><strong>5.</strong> A valuer shall keep public interest foremost while delivering his services.</p>

    <p style="font-weight:bold;">Professional Competence and Due Care</p>

    <p><strong>6.</strong> A valuer shall render at all times high standards of service, exercise due diligence, ensure proper care and exercise independent professional judgement.</p>

    <p><strong>7.</strong> A valuer shall carry out professional services in accordance with the relevant technical and professional standards that may be specified from time to time.</p>

    <p><strong>8.</strong> A valuer shall continuously maintain professional knowledge and skill to provide competent professional service based on up-to-date developments in practice, prevailing regulations/guidelines and techniques.</p>

    <p><strong>9.</strong> In the preparation of a valuation report, the valuer shall not disclaim liability for his/its expertise or deny his/its duty of care, except to the extent that the assumptions are based on statements of fact provided by the company or its auditors or consultants or information available in public domain and not generated by the valuer.</p>

    <p><strong>10.</strong> A valuer shall not carry out any instruction of the client insofar as they are incompatible with the requirements of integrity, objectivity and independence.</p>

    <p><strong>11.</strong> A valuer shall clearly state to his client the services that he would be competent to provide and the services for which he would be relying on other valuers or professionals or for which the client can have a separate arrangement with other valuers.</p>

    <p style="font-weight:bold;">Independence and Disclosure of Interest</p>

    <p><strong>12.</strong> A valuer shall act with objectivity in his/its professional dealings by ensuring that his/its decisions are made without the presence of any bias, conflict of interest, coercion, or undue influence of any party, whether directly connected to the valuation assignment or not.</p>

    <p><strong>13.</strong> A valuer shall not take up an assignment if he/it or any of his/its relatives or associates is not independent in term of association to the company.</p>

    <p><strong>14.</strong> A valuer shall maintain complete independence in his/its professional relationships and shall conduct his valuation independent of external influences.</p>

    <p><strong>15.</strong> A valuer shall wherever necessary disclose to the clients, possible sources of conflicts of duties and interests, while providing unbiased services.</p>

    <p><strong>16.</strong> A valuer shall not deal in securities of any subject company after any time when he/it first becomes aware of the possibility of his/its association with the valuation, and in accordance with the Securities and Exchange Board of India (Prohibition of Insider Trading) Regulations, 2015 or till the time the valuation report becomes public, whichever is earliest.</p>

    <p><strong>17.</strong> A valuer shall not indulge in "mandate snatching" or offering "convenience valuations" in order to cater to a company or client's needs.</p>

    <p><strong>18.</strong> An independent valuer, the valuer shall not charge success fee (Success fees may be defined as a compensation / incentive paid to any third party for successful closure of transaction. In this case, approval of credit proposals).</p>

    <p><strong>19.</strong> In any fairness opinion or independent expert opinion submitted by a valuer, if there has been a prior engagement in an unconnected transaction, the valuer shall declare the association with the company during the last five years.</p>

    <p style="font-weight:bold;">Confidentiality</p>

    <p><strong>20.</strong> A valuer shall not use or divulge to other clients or any other party any confidential information about the subject company, which has come to his/its knowledge without proper and specific authority or unless there is a legal or professional right or duty to disclose.</p>

    <p style="font-weight:bold;">Information Management</p>

    <p><strong>21.</strong> A valuer shall ensure that he/ it maintains written contemporaneous records for any decision 
taken, the reasons for taking the decision, and the information and evidence in support of such 
decision. This shall be maintained so as to sufficiently enable a reasonable person to take a view 
on the appropriateness of his/its decisions and actions.  </p>

    <p><strong>22.</strong>  A valuer shall appear, co-operate and be available for inspections and investigations carried 
out by the authority, any person authorized by the authority, the registered valuers organization 
with which he/it is registered or any other statutory regulatory body.  </p>

    <p><strong>23.</strong> A valuer shall provide all information and records as may be required by the authority, the 
Tribunal, Appellate Tribunal, the registered valuers organization with which he/it is registered, or 
any other statutory regulatory body. </p>

    <p><strong>24.</strong> A valuer while respecting the confidentiality of information acquired during the course of 
performing professional services, shall maintain proper working papers for a period of three years 
or such longer period as required in its contract for a specific valuation, for production before a 
regulatory authority or for a peer review. In the event of a pending case before the Tribunal or 
Appellate Tribunal, the record shall be maintained till the disposal of the case. </p>

    <p style="font-weight:bold;">Gifts and hospitality</p>

    <p><strong>25.</strong> A valuer or his/its relative shall not accept gifts or hospitality which undermines or affects his 
independence as a valuer.  Explanation.─ For the purposes of this code the term ‘relative’ shall have the same meaning as 
defined in clause (77) of Section 2 of the Companies Act, 2013 (18 of 2013).  </p>

    <p><strong>26.</strong>  A valuer shall not offer gifts or hospitality or a financial or any other advantage to a public 
servant or any other person with a view to obtain or retain work for himself/ itself, or to obtain or 
retain an advantage in the conduct of profession for himself/ itself.</p>

    <p style="font-weight:bold;">Remuneration and Costs</p>

    <p><strong>27.</strong>  A valuer shall provide services for remuneration which is charged in a transparent manner, is 
a reasonable reflection of the work necessarily and properly undertaken, and is not inconsistent 
with the applicable rules.</p>

    <p><strong>28.</strong>  A valuer shall not accept any fees or charges other than those which are disclosed in a written 
contract with the person to whom he would be rendering service.  </p>

    <p style="font-weight:bold;">Occupation, employability and restrictions</p>

    <p><strong>29.</strong>  A valuer shall refrain from accepting too many assignments, if he/it is unlikely to be able to 
devote adequate time to each of his/ its assignments. </p>

    <p><strong>30.</strong>  A valuer shall not conduct business which in the opinion of the authority or the registered 
valuer organization discredits the profession.  </p>

    <!-- DATE & SIGNATURE -->
    <div class="no-break" style="margin-top:30px;">
        <p style="font-weight:bold;">Date: ${safeGet(data, 'dateOnWhichValuationIsMade', 'NA')}</p>
        <p style="font-weight:bold;">Place: ${safeGet(data, 'city', 'NA')}</p>

        <div style="margin-top:40px; text-align:right;">
            <p style="font-weight:bold;">Shashikant R. Dhumal 
</p>
            <p style="font-weight:bold;">Signature of Approved Valuer</p>
            <p>Engineer & Govt. Approved Valuer</p>
            <p>CAT/1/143-2007 
</p>
        </div>
    </div>
    </div>
    <!-- END: ANNEXURE-III -->
    
    <!-- PAGE 11: IMAGES SECTION -->

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

   <!-- LOCATION IMAGES: Each image gets its own page -->
   ${Array.isArray(pdfData.locationImages) && pdfData.locationImages.length > 0 ? `
     ${pdfData.locationImages.map((img, idx) => {
                const imgSrc = typeof img === 'string' ? img : img?.url;
                return imgSrc ? `
         <div class="page" location-images-page style="width: 100%; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;">
           <h2 style="text-align: center; margin-bottom: 30px; font-weight: bold; font-size: 18pt;">LOCATION IMAGE ${idx + 1}</h2>
           <img class="pdf-image" src="${imgSrc}" alt="Location Image ${idx + 1}" style="width: 90%; height: auto; max-height: 600px; object-fit: contain; margin: 0 auto;">
         </div>
       ` : '';
            }).join('')}
   ` : ''}

   <!-- SUPPORTING DOCUMENTS: Each document gets its own page -->
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

export async function generateUbiApfRecordPDF(record) {
    try {
        console.log('📄 Generating PDF for record:', record?.uniqueId || record?.clientName || 'new');
        return await generateUbiApfRecordPDFOffline(record);
    } catch (error) {
        console.error('❌ PDF generation error:', error);
        throw error;
    }
}

/**
 * Preview PDF in a new tab
 * Uses client-side generation with blob URL preview
 */
export async function previewUbiApfValuationPDF(record) {
    try {
        console.log('👁️ Generating PDF preview for:', record?.uniqueId || record?.clientName || 'new');

        // Dynamically import jsPDF and html2canvas
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Generate HTML from the record data
        const htmlContent = generateUbiApfValuationReportHTML(record);

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
        style.textContent = `.page { height: 297mm!important; overflow: hidden!important; display: flex!important; flex - direction: column!important; } table { flex: 1!important; } tbody { height: 100 % !important; } `;
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

        console.log('✅ PDF preview opened');
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
        // Check if URL is already a data URI
        if (url.startsWith('data:')) {
            console.log('✅ URL is already a data URI, skipping conversion');
            return url;
        }

        const response = await fetch(url);
        const blob = await response.blob();

        // Compress image to reduce size
        const compressed = await compressImage(blob);
        console.log('✅ Converted image URL to base64:', url.substring(0, 80) + '...');
        return compressed;
    } catch (error) {
        console.warn('⚠️ Failed to convert image URL to base64, using original URL:', url.substring(0, 80), error.message);
        // Return original URL if conversion fails (fallback)
        return url;
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

    // Convert supporting documents (from documentPreviews or supportingDocuments)
    const docsArray = recordCopy.documentPreviews || recordCopy.supportingDocuments;
    console.log('📄 Document conversion check:', {
        hasDocumentPreviews: Array.isArray(recordCopy.documentPreviews),
        documentPreviewsCount: Array.isArray(recordCopy.documentPreviews) ? recordCopy.documentPreviews.length : 0,
        hasSupportingDocuments: Array.isArray(recordCopy.supportingDocuments),
        supportingDocumentsCount: Array.isArray(recordCopy.supportingDocuments) ? recordCopy.supportingDocuments.length : 0,
        docsArrayUsed: docsArray ? (recordCopy.documentPreviews ? 'documentPreviews' : 'supportingDocuments') : 'none',
        docsArrayCount: Array.isArray(docsArray) ? docsArray.length : 0
    });
    if (Array.isArray(docsArray)) {
        const convertedDocs = await Promise.all(
            docsArray.map(async (doc, idx) => {
                if (!doc) return doc;
                const url = typeof doc === 'string' ? doc : doc?.url;
                if (!url) {
                    console.log(`⚠️ Document #${idx + 1} has no URL`, doc);
                    return doc;
                }

                const base64 = await urlToBase64(url);
                if (typeof doc === 'string') {
                    return base64 || doc;
                }
                return { ...doc, url: base64 || url };
            })
        );
        // Store in both possible field names for compatibility
        recordCopy.documentPreviews = convertedDocs;
        recordCopy.supportingDocuments = convertedDocs;
        console.log('✅ Converted', convertedDocs.length, 'supporting documents to base64');
    }

    return recordCopy;
};

/**
 * Client-side PDF generation using jsPDF + html2canvas
 * Works on Vercel without server-side dependencies
 */
export async function generateUbiApfRecordPDFOffline(record) {
    try {
        console.log('📠 Generating PDF (client-side mode)');
        console.log('📄 INITIAL RECORD CHECK - Supporting Documents:', {
            hasDocumentPreviews: record?.documentPreviews?.length || 0,
            hasSupportingDocuments: record?.supportingDocuments?.length || 0,
            documentPreviews: record?.documentPreviews?.slice(0, 1),
            supportingDocuments: record?.supportingDocuments?.slice(0, 1)
        });
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
            supportingDocuments_count: Array.isArray(record?.supportingDocuments) ? record.supportingDocuments.length : 0,
            propertyImages_sample: record?.propertyImages?.slice(0, 1),
            locationImages_sample: record?.locationImages?.slice(0, 1),
            documentPreviews_sample: record?.documentPreviews?.slice(0, 1),
            supportingDocuments_sample: record?.supportingDocuments?.slice(0, 1)
        });

        // Convert images to base64 for PDF embedding
        console.log('🖼️ Converting images to base64...');
        const recordWithBase64Images = await convertImagesToBase64(record);

        // Debug: Check what we have after conversion
        console.log('✅ After conversion:', {
            hasDocumentPreviews: recordWithBase64Images?.documentPreviews?.length || 0,
            hasSupportingDocuments: recordWithBase64Images?.supportingDocuments?.length || 0,
            documentPreviewsSample: recordWithBase64Images?.documentPreviews?.[0],
            supportingDocumentsSample: recordWithBase64Images?.supportingDocuments?.[0]
        });

        // Dynamically import jsPDF and html2canvas to avoid SSR issues
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Generate HTML from the record data with base64 images
        const htmlContent = generateUbiApfValuationReportHTML(recordWithBase64Images);

        // Split HTML content by page break sections
        const costOfConstructionIndex = htmlContent.indexOf('cost-of-construction-section');
        const annexure2Index = htmlContent.indexOf('annexure-ii-section');
        const annexure3Index = htmlContent.indexOf('annexure-iii-section');
        const propertyImagesIndex = htmlContent.indexOf('property-images-page');
        const areaImagesIndex = htmlContent.indexOf('area-images-page');
        const locationImagesIndex = htmlContent.indexOf('location-images-page');
        const supportingDocsIndex = htmlContent.indexOf('supporting-docs-page');

        console.log(`🔍 Detected cost - of - construction - section at index: ${costOfConstructionIndex} `);
        console.log(`🔍 Detected annexure - ii - section at index: ${annexure2Index} `);
        console.log(`🔍 Detected annexure - iii - section at index: ${annexure3Index} `);
        console.log(`🔍 Detected property - images - page at index: ${propertyImagesIndex} `);
        console.log(`🔍 Detected area - images - page at index: ${areaImagesIndex} `);
        console.log(`🔍 Detected location - images - page at index: ${locationImagesIndex} `);
        console.log(`🔍 Detected supporting - docs - page at index: ${supportingDocsIndex} `);

        let mainHtmlContent = htmlContent;
        let costOfConstructionHtmlContent = '';
        let annexure2HtmlContent = '';
        let annexure3HtmlContent = '';
        let propertyImagesHtmlContent = '';
        let areaImagesHtmlContent = '';
        let locationImagesHtmlContent = '';
        let supportingDocsHtmlContent = '';

        // Find all sections and extract them
        const sections = [
            { name: 'annexure2', index: annexure2Index },
            { name: 'annexure3', index: annexure3Index },
            { name: 'propertyImages', index: propertyImagesIndex },
            { name: 'areaImages', index: areaImagesIndex },
            { name: 'locationImages', index: locationImagesIndex },
            { name: 'supportingDocs', index: supportingDocsIndex }
        ].filter(s => s.index !== -1).sort((a, b) => a.index - b.index);

        if (sections.length > 0) {
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const sectionStart = htmlContent.lastIndexOf('<div', section.index);

                if (i === 0) {
                    // Everything before first section is main content (including cost-of-construction-section)
                    mainHtmlContent = htmlContent.substring(0, sectionStart);
                }

                // Extract section content
                const sectionEnd = i < sections.length - 1
                    ? htmlContent.lastIndexOf('<div', sections[i + 1].index)
                    : htmlContent.length;
                const sectionContent = htmlContent.substring(sectionStart, sectionEnd);

                 if (section.name === 'annexure2') {
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
            console.log('✂️ Split HTML: Sections separated - Main Content (with Cost of Construction), Annexure-II, Annexure-III, Property Images, Area Images, Location Images, Supporting Docs');
        } else {
            // No other sections found, everything is main content
            mainHtmlContent = htmlContent;
        }

        // Remove separated sections from main content to prevent duplication
        let cleanMainContent = mainHtmlContent;

        // Remove annexure-ii-section
        cleanMainContent = cleanMainContent.replace(/<div[^>]*annexure-ii-section[^>]*>[\s\S]*?<\/div>\s*<!-- END: annexure-ii-section -->/g, '');

        // Remove annexure-iii-section
        cleanMainContent = cleanMainContent.replace(/<div[^>]*annexure-iii-section[^>]*>[\s\S]*?<\/div>\s*<!-- END: annexure-iii-section -->/g, '');

        // Remove property-images-page sections
        cleanMainContent = cleanMainContent.replace(/<div[^>]*property-images-page[^>]*>[\s\S]*?<\/div>/g, '');

        // Remove area-images-page sections
        cleanMainContent = cleanMainContent.replace(/<div[^>]*area-images-page[^>]*>[\s\S]*?<\/div>/g, '');

        // Remove location-images-page sections
        // cleanMainContent = cleanMainContent.replace(/<div[^>]*location-images-page[^>]*>[\s\S]*?<\/div>/g, '');

        // Remove supporting-docs-page sections
        cleanMainContent = cleanMainContent.replace(/<div[^>]*supporting-docs-page[^>]*>[\s\S]*?<\/div>/g, '');

        mainHtmlContent = cleanMainContent;
        console.log('🗑️ Removed separated sections from main content to prevent duplication');

        // Create a temporary container with cleaned main content only
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
                console.log(`⏭️ Invalid image src: ${alt} `);
                let parentContainer = img.closest('.image-container');
                if (parentContainer) {
                    imagesToRemove.add(parentContainer);
                    console.log(`⏭️ Marking for removal(invalid src): ${alt} `);
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
                        console.log(`⏭️ Image timeout / failed to load: ${alt} `);
                        let parentContainer = img.closest('.image-container');
                        if (parentContainer) {
                            imagesToRemove.add(parentContainer);
                            console.log(`⏭️ Marking for removal(timeout): ${alt} `);
                        }
                    }
                    resolve();
                }, 5000);

                img.onload = () => {
                    clearTimeout(timeoutId);
                    console.log(`✅ Image loaded successfully: ${alt} `);
                    resolve();
                };

                img.onerror = () => {
                    clearTimeout(timeoutId);
                    console.log(`❌ Image failed to load: ${alt} `);
                    let parentContainer = img.closest('.image-container');
                    if (parentContainer) {
                        imagesToRemove.add(parentContainer);
                        console.log(`⏭️ Marking for removal(onerror): ${alt} `);
                    }
                    resolve();
                };

                // If already loaded, resolve immediately
                if (img.complete) {
                    clearTimeout(timeoutId);
                    if (img.naturalHeight === 0) {
                        console.log(`⏭️ Image failed(no height): ${alt} `);
                        let parentContainer = img.closest('.image-container');
                        if (parentContainer) {
                            imagesToRemove.add(parentContainer);
                            console.log(`⏭️ Marking for removal(no height): ${alt} `);
                        }
                    } else {
                        console.log(`✅ Image already loaded: ${alt} `);
                    }
                    resolve();
                }
            });
        }));

        // Remove only failed/invalid image containers
        console.log(`🗑️ Removing ${imagesToRemove.size} failed / invalid image containers`);
        imagesToRemove.forEach(el => {
            const alt = el.querySelector('img')?.getAttribute('alt') || 'unknown';
            console.log(`✂️ Removed container: ${alt} `);
            el.remove();
        });

        console.log('✅ Image validation complete - now extracting images BEFORE rendering...');

        // CRITICAL: Render continuous-wrapper and .page elements separately for proper page breaks
        const continuousWrapper = container.querySelector('.continuous-wrapper');
        const pageElements = Array.from(container.querySelectorAll(':scope > .page'));
        console.log(`📄 Total.page elements found: ${pageElements.length} `);

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
            console.log('✅ Continuous wrapper canvas conversion complete');
        }

        // Render each .page separately for proper page breaks
        const pageCanvases = [];
        for (let i = 0; i < pageElements.length; i++) {
            const pageEl = pageElements[i];
            console.log(`📄 Rendering.page element ${i + 1}/${pageElements.length}`);

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
            console.log(`✅ .page ${i + 1} canvas conversion complete`);
        }

        console.log(`✅ Page rendering complete - ${pageCanvases.length} .page elements rendered separately`);

        // Extract images BEFORE removing container
        // This prevents empty/blank image containers from appearing in the PDF
        console.log('⏳ Extracting images and removing containers from HTML...');
        const images = Array.from(container.querySelectorAll('img.pdf-image'));
        const imageData = [];

        console.log('🔍 Found total images with class="pdf-image":', images.length);

        // Extract valid images and REMOVE ALL their containers
        for (const img of images) {
            const src = img.src || img.getAttribute('data-src');
            const label = img.getAttribute('alt') || 'Image';

            console.log(`🖼️ Image found - label: "${label}", hasSrc: ${!!src}, srcType: ${src ? (src.startsWith('data:') ? 'data-uri' : src.startsWith('blob:') ? 'blob' : src.startsWith('http') ? 'http' : 'other') : 'none'}`);

            // Only extract images with valid src
            if (src && (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http'))) {
                imageData.push({
                    src,
                    label,
                    type: label.includes('Location') ? 'location' :
                        label.includes('Supporting') ? 'supporting' : 'property'
                });
                console.log(`✅ Extracted image: ${label} (type: ${label.includes('Location') ? 'location' : label.includes('Supporting') ? 'supporting' : 'property'})`);
            } else {
                console.log(`⏭️ Invalid image src, will not add to PDF: ${label}`);
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

        // Remove temporary container now that we've extracted images
        document.body.removeChild(container);
        console.log('✅ Container removed from DOM');

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
        const findSafeBreakPoint = (canvasHeight, startPixel, maxHeightPixels, isFirstPage = false, isLastPage = false) => {
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
                let borderThickness = 0;

                const pixelsPerRow = width * 4; // RGBA = 4 bytes per pixel
                const rowCount = height;
                let inBorder = false;
                const borderRows = [];

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

                    // If >80% of row is dark, it's a border line (increased threshold to be less aggressive)
                    if (blackCount > width * 0.6) {
                        if (!inBorder) {
                            inBorder = true;
                            borderThickness = 1;
                            borderRows.push(row);
                        } else {
                            borderThickness++;
                        }
                        lastBlackRowIndex = row;
                    } else {
                        inBorder = false;
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
        let currentPageYPosition = headerHeight;  // Track current Y position on page

        while (heightLeft > 0) {

            // Calculate how much of the image fits on this page
            let imageHeightForThisPage = Math.min(usableHeight, heightLeft);

            // Calculate the crop region from the canvas
            const canvasHeight = mainCanvas.height;
            const canvasWidth = mainCanvas.width;
            const sourceYPixels = (sourceY / imgHeight) * canvasHeight;
            const maxHeightPixels = (imageHeightForThisPage / imgHeight) * canvasHeight;

            // Check if this is first or last page
            const isFirstPage = pageNumber === 1;
            const isLastPage = heightLeft - imageHeightForThisPage <= 0;

            // Apply bold borders BEFORE finding safe break point
            const ctx = mainCanvas.getContext('2d');
            const width = Math.floor(mainCanvas.width);
            const height = Math.floor(maxHeightPixels);

            // Guard against getImageData with 0 height
            if (height <= 0) {
                console.warn('⚠️ Height is 0 or negative, skipping image data operations');
                heightLeft -= imageHeightForThisPage;
                sourceY += imageHeightForThisPage;
                pageNumber++;
                if (heightLeft > 0) {
                    pdf.addPage();
                }
                continue;
            }

            const imageData = ctx.getImageData(0, Math.floor(sourceYPixels), width, height);
            const data = imageData.data;
            const pixelsPerRow = width * 4;

            // Calculate table boundaries (table is approximately in center, ~645px wide at 1.5x scale = ~430px at normal view)
            // But we need to find it dynamically from the actual border pixels
            let tableLeftBound = 0;
            let tableRightBound = width;

            // Find table left boundary by looking for first vertical line of dark pixels
            for (let col = 0; col < Math.min(200, width); col++) {
                let darkCount = 0;
                for (let row = 10; row < Math.min(50, height); row++) {
                    const idx = (row * pixelsPerRow) + (col * 4);
                    if (data[idx] < 150 && data[idx + 1] < 150 && data[idx + 2] < 150) {
                        darkCount++;
                    }
                }
                if (darkCount > 10) {
                    tableLeftBound = col;
                    break;
                }
            }

            // Find table right boundary by looking for last vertical line of dark pixels
            for (let col = width - 1; col > tableLeftBound + 100; col--) {
                let darkCount = 0;
                for (let row = 10; row < Math.min(50, height); row++) {
                    const idx = (row * pixelsPerRow) + (col * 4);
                    if (data[idx] < 150 && data[idx + 1] < 150 && data[idx + 2] < 150) {
                        darkCount++;
                    }
                }
                if (darkCount > 10) {
                    tableRightBound = col;
                    break;
                }
            }

            // Find top border (first border row in this section)
            if (!isFirstPage) {
                for (let row = 0; row < Math.min(50, height); row++) {
                    let blackCount = 0;
                    const rowStart = row * pixelsPerRow;
                    // Only count dark pixels within table bounds
                    for (let col = tableLeftBound; col < tableRightBound; col++) {
                        const idx = rowStart + col * 4;
                        if (data[idx] < 150 && data[idx + 1] < 150 && data[idx + 2] < 150) {
                            blackCount++;
                        }
                    }
                    const tableWidth = tableRightBound - tableLeftBound;
                    if (blackCount > tableWidth * 0.6) {
                        // Make top border bold - only within table bounds
                        for (let offset = -2; offset <= 2; offset++) {
                            const boldRow = row + offset;
                            if (boldRow >= 0 && boldRow < height) {
                                const boldRowStart = boldRow * pixelsPerRow;
                                // Only darken pixels within table bounds
                                for (let col = tableLeftBound; col < tableRightBound; col++) {
                                    const idx = boldRowStart + col * 4;
                                    data[idx] = 0;      // R
                                    data[idx + 1] = 0;  // G
                                    data[idx + 2] = 0;  // B
                                    data[idx + 3] = 255; // A
                                }
                            }
                        }
                        break;
                    }
                }
            }

            // Find bottom border (last border row in this section)
            if (!isLastPage) {
                for (let row = height - 1; row >= Math.max(0, height - 50); row--) {
                    let blackCount = 0;
                    const rowStart = row * pixelsPerRow;
                    // Only count dark pixels within table bounds
                    for (let col = tableLeftBound; col < tableRightBound; col++) {
                        const idx = rowStart + col * 4;
                        if (data[idx] < 150 && data[idx + 1] < 150 && data[idx + 2] < 150) {
                            blackCount++;
                        }
                    }
                    const tableWidth = tableRightBound - tableLeftBound;
                    if (blackCount > tableWidth * 0.6) {
                        // Make bottom border bold - only within table bounds
                        for (let offset = -2; offset <= 2; offset++) {
                            const boldRow = row + offset;
                            if (boldRow >= 0 && boldRow < height) {
                                const boldRowStart = boldRow * pixelsPerRow;
                                // Only darken pixels within table bounds
                                for (let col = tableLeftBound; col < tableRightBound; col++) {
                                    const idx = boldRowStart + col * 4;
                                    data[idx] = 0;      // R
                                    data[idx + 1] = 0;  // G
                                    data[idx + 2] = 0;  // B
                                    data[idx + 3] = 255; // A
                                }
                            }
                        }
                        break;
                    }
                }
            }

            ctx.putImageData(imageData, 0, Math.floor(sourceYPixels));

            // Find safe break point to keep table rows intact
            let sourceHeightPixels = maxHeightPixels;

            // Only check for incomplete rows if not on last page
            if (!isLastPage && heightLeft > imageHeightForThisPage) {
                try {
                    // Scan bottom 200px to detect if we're cutting a table row
                    const bottomScanHeight = Math.min(200, height);
                    let lastCompleteRowBottom = 0;
                    let foundIncompleteRow = false;

                    // Look for the last complete horizontal border line in the bottom section
                    for (let row = height - 1; row >= Math.max(0, height - bottomScanHeight); row--) {
                        let darkPixelCount = 0;
                        const rowStart = row * pixelsPerRow;

                        // Count dark pixels across table width
                        for (let col = tableLeftBound; col < tableRightBound; col++) {
                            const idx = rowStart + col * 4;
                            if (data[idx] < 150 && data[idx + 1] < 150 && data[idx + 2] < 150) {
                                darkPixelCount++;
                            }
                        }

                        const tableWidth = tableRightBound - tableLeftBound;
                        const isTableBorder = darkPixelCount > tableWidth * 0.7;

                        // If we find a complete border line, this is a good break point
                        if (isTableBorder && lastCompleteRowBottom === 0) {
                            lastCompleteRowBottom = row;
                            foundIncompleteRow = true;
                        }
                    }

                    // If we found an incomplete row at bottom, cut before it
                    if (foundIncompleteRow && lastCompleteRowBottom > 50) {
                        sourceHeightPixels = Math.floor(lastCompleteRowBottom);
                        console.log(`✅ Detected incomplete row - cutting at ${sourceHeightPixels}px to push row to next page`);
                    }
                } catch (err) {
                    console.warn('⚠️ Error detecting incomplete rows:', err?.message);
                }
            }

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
            currentPageYPosition += imageHeightForThisPage;
            pageNumber++;

            if (heightLeft > 0) {
                pdf.addPage();
                currentPageYPosition = headerHeight;
            }
        }

        // Reset position if main content ends - prevents empty page before next section
        if (heightLeft <= 0) {
            currentPageYPosition = headerHeight;
        }

        // Helper function to process annexure sections
        const processAnnexureSection = async (annexureHtmlContent, annexureName, needsNewPage = true) => {
            if (!annexureHtmlContent) {
                console.warn(`⚠️ ${annexureName} section is empty or undefined`);
                return;
            }

            console.log(`📄 Processing ${annexureName} section... Content length: ${annexureHtmlContent.length}`);

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

            // Calculate dimensions for annexure
            const annexureImgHeight = (annexureCanvas.height * imgWidth) / annexureCanvas.width;

            // Add new page for annexure only if needed AND there's not enough space remaining
            const remainingHeightOnPage = pageHeight - footerHeight - currentPageYPosition;

            if (needsNewPage && annexureImgHeight > remainingHeightOnPage && currentPageYPosition > headerHeight + 50) {
                // Only add new page if section won't fit AND there's substantial content already on page
                pdf.addPage();
                pageNumber++;
                currentPageYPosition = headerHeight;
                console.log(`📄 Added new page for ${annexureName} (insufficient space)`);
            } else if (needsNewPage && currentPageYPosition <= headerHeight + 50) {
                console.log(`📄 Skipping new page for ${annexureName} - minimal content on current page, continuing`);
            }
            let annexureHeightLeft = annexureImgHeight;
            let annexureSourceY = 0;
            let annexurePageStarted = !needsNewPage;

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

                const annexurePageImgData = annexurePageCanvas.toDataURL('image/jpeg', 0.85);
                pdf.addImage(annexurePageImgData, 'JPEG', 0, currentPageYPosition, imgWidth, imageHeightForAnnexurePage);

                // Add page number
                pdf.setFontSize(9);
                pdf.text(`Page ${pageNumber}`, 105, pageHeight - 5, { align: 'center' });

                annexureHeightLeft -= imageHeightForAnnexurePage;
                annexureSourceY += imageHeightForAnnexurePage;
                currentPageYPosition += imageHeightForAnnexurePage;
            }

            // Clean up container
            document.body.removeChild(annexureContainer);
            console.log(`✅ ${annexureName} section added to PDF`);
        };

        

        // Process Annexure-II section (no new page if already on new page)
        if (annexure2HtmlContent) {
            await processAnnexureSection(annexure2HtmlContent, 'Annexure-II', false);
        }

        // Process Annexure-III section (no new page - continue from previous)
        if (annexure3HtmlContent) {
            await processAnnexureSection(annexure3HtmlContent, 'Annexure-III', false);
        }

        // Process Property Images section (always starts on new page)
        if (propertyImagesHtmlContent) {
            currentPageYPosition = headerHeight;
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

        // Add page canvases as separate pages in PDF
        console.log(`📄 Adding ${pageCanvases.length} separate .page canvases to PDF...`);
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
            console.log(`✅ Added .page canvas ${i + 1} as page ${pageNumber - 1}`);
        }

        // Add images as separate pages
        console.log('📸 Adding', imageData.length, 'images to PDF...');

        // Filter out images with invalid src before adding to PDF
        const validImages = imageData.filter(img => {
            if (!img.src || typeof img.src !== 'string' || !img.src.trim()) {
                console.log(`⏭️ Skipping image with invalid src: ${img.label}`);
                return false;
            }
            return true;
        });

        if (validImages.length > 0) {
            // Separate images by type
            const propertyImgs = validImages.filter(img => img.type === 'property');
            const locationImgs = validImages.filter(img => img.type === 'location');
            const supportingImgs = validImages.filter(img => img.type === 'supporting');

            // ===== ADD PROPERTY IMAGES: 6 per page (2 columns x 3 rows) =====
            if (propertyImgs.length > 0) {
                pdf.addPage();
                let imgIndex = 0;

                while (imgIndex < propertyImgs.length) {
                    const startIdx = imgIndex;
                    let row = 0;

                    // Add up to 6 images (2 columns x 3 rows) per page
                    for (row = 0; row < 3 && imgIndex < propertyImgs.length; row++) {
                        const yPos = 15 + row * 92; // 3 rows with spacing

                        // Left column
                        if (imgIndex < propertyImgs.length) {
                            const img = propertyImgs[imgIndex];
                            try {
                                if (img.src.startsWith('data:') || img.src.startsWith('blob:') || img.src.startsWith('http://') || img.src.startsWith('https://')) {
                                    pdf.setFontSize(8);
                                    pdf.setFont(undefined, 'bold');
                                    pdf.text(img.label, 12, yPos);
                                    pdf.addImage(img.src, 'JPEG', 12, yPos + 4, 92, 82);
                                    console.log(`✅ Added property image (L): ${img.label}`);
                                }
                            } catch (err) {
                                console.warn(`Failed to add property image ${img.label}:`, err?.message);
                            }
                            imgIndex++;
                        }

                        // Right column
                        if (imgIndex < propertyImgs.length) {
                            const img = propertyImgs[imgIndex];
                            try {
                                if (img.src.startsWith('data:') || img.src.startsWith('blob:') || img.src.startsWith('http://') || img.src.startsWith('https://')) {
                                    pdf.setFontSize(8);
                                    pdf.setFont(undefined, 'bold');
                                    pdf.text(img.label, 108, yPos);
                                    pdf.addImage(img.src, 'JPEG', 108, yPos + 4, 92, 82);
                                    console.log(`✅ Added property image (R): ${img.label}`);
                                }
                            } catch (err) {
                                console.warn(`Failed to add property image ${img.label}:`, err?.message);
                            }
                            imgIndex++;
                        }
                    }

                    // Add new page if more images remain
                    if (imgIndex < propertyImgs.length) {
                        pdf.addPage();
                    }
                }
            }

            // Location images are now rendered in HTML with page-break styling
            // They appear in the PDF automatically via html2canvas rendering
            if (locationImgs.length > 0) {
                console.log(`✅ Location images (${locationImgs.length}) rendered via HTML`);
            }

            // Supporting documents are now rendered in HTML with page-break styling
            // They appear in the PDF automatically via html2canvas rendering
            if (supportingImgs.length > 0) {
                console.log(`✅ Supporting documents (${supportingImgs.length}) rendered via HTML`);
            }
        } else {
            console.log('⏭️ No valid images to add to PDF');
        }

        // Add PDF metadata including generation time
        const now = new Date();
        const generationTime = now.toLocaleString();
        pdf.setProperties({
            title: `Valuation Report - ${record?.clientName || record?.uniqueId || 'Report'}`,
            subject: 'Property Valuation Report',
            author: 'UBI APF Valuation System',
            keywords: 'Valuation, Property, UBI APF',
            creator: 'UBI APF PDF Generator'
        });

        // Download PDF
        const filename = `valuation_${record?.clientName || record?.uniqueId || Date.now()}.pdf`;
        pdf.save(filename);

        console.log(`✅ PDF generated at: ${generationTime}`);

        console.log('✅ PDF generated and downloaded:', filename);
        return filename;
    } catch (error) {
        console.error('❌ Client-side PDF generation error:', error);
        throw error;
    }
}

// Alias for generateRecordPDF to match UBI APF naming
export const generateUbiApfPDF = generateUbiApfRecordPDF;

const ubiApfPdfService = {
    generateUbiApfValuationReportHTML,
    generateUbiApfRecordPDF,
    generateUbiApfPDF,
    previewUbiApfValuationPDF,
    generateUbiApfRecordPDFOffline,
    normalizeDataForPDF
};

export default ubiApfPdfService;