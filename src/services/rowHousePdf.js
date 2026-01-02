

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
      valuationPurpose: data.documentInformation.valuationPurpose || normalized.valuationPurpose,
      valuationPlace: data.documentInformation.valuationPlace || normalized.valuationPlace,
      valuationMadeDate: data.documentInformation.valuationMadeDate || data.documentInformation.dateOfValuation || normalized.valuationMadeDate
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
      fairMarketValueWords: data.valuationResults.fairMarketValueWords || normalized.fairMarketValueWords,
      realisableValue: data.valuationResults.realisableValue || data.valuationResults.realizableValue || normalized.realisableValue,
      realisableValueWords: data.valuationResults.realisableValueWords || data.valuationResults.realizableValueWords || normalized.realisableValueWords,
      distressValue: data.valuationResults.distressValue || normalized.distressValue,
      distressValueWords: data.valuationResults.distressValueWords || normalized.distressValueWords,
      agreementValue: data.valuationResults.agreementValue || normalized.agreementValue,
      agreementValueWords: data.valuationResults.agreementValueWords || normalized.agreementValueWords,
      valueCircleRate: data.valuationResults.valueCircleRate || data.valuationResults.circleRate || normalized.valueCircleRate,
      valueCircleRateWords: data.valuationResults.valueCircleRateWords || data.valuationResults.circleRateWords || normalized.valueCircleRateWords,
      saleDeedValue: data.valuationResults.saleDeedValue || normalized.saleDeedValue,
      insurableValue: data.valuationResults.insurableValue || normalized.insurableValue,
      insurableValueWords: data.valuationResults.insurableValueWords || normalized.insurableValueWords,
      rentReceivedPerMonth: data.valuationResults.rentReceivedPerMonth || normalized.rentReceivedPerMonth,
      marketability: data.valuationResults.marketability || normalized.marketability,
      valuationPlace: data.valuationResults.valuationPlace || normalized.valuationPlace,
      valuationMadeDate: data.valuationResults.valuationMadeDate || normalized.valuationMadeDate
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
  if (data.propertyImages || data.locationImages || data.documentPreviews || data.areaImages) {
    normalized = {
      ...normalized,
      propertyImages: data.propertyImages || normalized.propertyImages || [],
      locationImages: data.locationImages || normalized.locationImages || [],
      documentPreviews: data.documentPreviews || normalized.documentPreviews || [],
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
    documentPreviews: normalized.documentPreviews || data.documentPreviews || [],
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
      agreementForSale: data?.pdfDetails?.agreementForSale,
      classificationPosh: data?.pdfDetails?.classificationPosh,
      classificationUsage: data?.pdfDetails?.classificationUsage,
      ownerOccupancyStatus: data?.pdfDetails?.ownerOccupancyStatus
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
    const preservedDocumentPreviews = pdfData.documentPreviews || data.documentPreviews;
    const preservedAreaImages = pdfData.areaImages || data.areaImages;

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
    referenceNo: pdfData.referenceNo || pdfData.pdfDetails?.referenceNo,
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

    // Images
    propertyImages: pdfData.propertyImages || [],
    locationImages: pdfData.locationImages || [],

    // Custom Fields
    customFields: pdfData.customFields || []
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

  // DEBUG: Log final pdfData before rendering
  console.log('📋 Final pdfData before HTML rendering:', {
    unitMaintenance: pdfData.unitMaintenance,
    unitClassification: pdfData.unitClassification,
    classificationPosh: pdfData.classificationPosh,
    safeGetTest_unitMaintenance: safeGet(pdfData, 'unitMaintenance'),
    safeGetTest_unitClassification: safeGet(pdfData, 'unitClassification')
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
    @page {
      size: A4;
      margin: 0;
      border: 1px solid #000;
    }
    .continuous-wrapper {
      page-break-after: auto !important;
      page-break-inside: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100%;
      box-sizing: border-box;
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

    .form-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 0;
      font-size: 12pt;
      table-layout: fixed;
      page-break-inside: avoid;
      break-inside: avoid;
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
       width: 50%;
       min-width: 50%;
       max-width: 50%;
       font-weight: normal;
       background: #ffffffff;
       border: 1px solid #000 !important;
       word-wrap: break-word;
       overflow-wrap: break-word;
       vertical-align: top !important;
       padding: 8px 12px;
       white-space: normal;
       page-break-inside: avoid;
       break-inside: avoid;
       height: auto !important;
       word-break: break-word;
       overflow: visible;
       font-size: 12pt;
     }

      .form-table .value {
        width: 50%;
        min-width: 50%;
        max-width: 50%;
        text-align: left;
        background: white;
        border: 1px solid #000 !important;
        word-wrap: break-word;
        overflow-wrap: break-word;
        word-break: break-word;
        vertical-align: top !important;
        padding: 8px 12px;
        white-space: normal;
        page-break-inside: avoid;
        break-inside: avoid;
        height: auto !important;
        overflow: visible;
        font-weight: normal;
        font-size: 12pt;
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
      page-break-inside: avoid;
      break-inside: avoid;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: visible;
      height: auto !important;
    }

    .form-table.four-col .row-num {
      width: 10%;
      min-width: 10%;
      max-width: 10%;
      border: 1px solid #000 !important;
    }

    .form-table.four-col .label {
      width: 30%;
      min-width: 30%;
      max-width: 30%;
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
      width: 30%;
      min-width: 30%;
      max-width: 30%;
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
      width: 30%;
      min-width: 30%;
      max-width: 30%;
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
      width: 25%;
      min-width: 25%;
      max-width: 25%;
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
      width: 25%;
      min-width: 25%;
      max-width: 25%;
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
      width: 25%;
      min-width: 25%;
      max-width: 25%;
    }

   
  </style>
</head>
<body>

<!-- CONTINUOUS DATA TABLE -->
<div class="continuous-wrapper" >
  <div style="padding: 0 12mm; padding-top: 46mm;">
    <!-- Header with Ref No and Date -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
      <div style="font-size: 12pt;">
        <p style="margin: 0;">Ref. No.: ${safeGet(pdfData, 'referenceNo')}</p>
      </div>
      <div style="font-size: 12pt; text-align: right;">
        <p style="margin: 0;">Date: ${formatDate(safeGet(pdfData, 'inspectionDate'))}</p>
      </div>
    </div>
    
    <!-- Title -->
    <div style="text-align: center; margin-bottom: 20px;  ">
      <p style="font-size: 18pt; font-weight: bold; margin: 0;">VALUATION REPORT (IN RESPECT OF Flat)</p>
    </div>
  </div>

  <div style="padding: 0 12mm;">
   <table class="form-table" style="border-top: 1px solid #000;border-right: 1px solid #000;border-left: 1px solid #000;border-bottom: 1px solid #000;">
    <tr>
      <td class="row-num"></td>
      <td class="label" style="background: #ffffffff; font-weight: bold;">I. GENERAL</td>
      <td style="background: #ffffffff;"></td>
    </tr>
    <tr>
      <td class="row-num">1.</td>
      <td class="label ">Purpose of valuation</td>
      <td class="value">${safeGet(pdfData, 'valuationPurpose')}</td>
    </tr>
    <tr>
      <td class="row-num">2.</td>
      <td class="label">a) Date of inspection</td>
      <td class="value">${formatDate(safeGet(pdfData, 'inspectionDate'))}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">b) Date on which the valuation is made</td>
      <td class="value">${formatDate(safeGet(pdfData, 'valuationMadeDate'))}</td>
    </tr>
    
    <tr>
      <td class="row-num">3.</td>
      <td class="label">List of documents produced for perusal</td>
      <td class="value">${safeGet(pdfData, 'listOfDocumentsProduced')}</td>
    </tr>
  
    <tr>
      <td class="row-num">4.</td>
      <td class="label">Name of the owner(s) and his / their address (as) with Phone no. (details of share of each owner in case of joint ownership)</td>
      <td class="value">${safeGet(pdfData, 'ownerNameAddress')}</td>
    </tr>
    <tr>
      <td class="row-num">5.</td>
      <td class="label">Brief description of the property</td>
      <td class="value">${safeGet(pdfData, 'briefDescriptionProperty')}</td>
    </tr>
 
    <tr>
      <td class="row-num">6.</td>
      <td class="label" style="background: #ffffffff; ">Location of property</td>
      <td class="value"></td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">a) Plot No. / Survey No.</td>
      <td class="value">${safeGet(pdfData, 'plotNo')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">b) Door No.</td>
      <td class="value">${safeGet(pdfData, 'doorNo')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">c) T.S. No. / Village</td>
      <td class="value">${safeGet(pdfData, 'tsNoVillage')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">d) Ward / Taluka</td>
      <td class="value">${safeGet(pdfData, 'wardTaluka')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">e) Mandal / District</td>
      <td class="value">${safeGet(pdfData, 'mandalDistrict')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">f) Date of issue and validity of layout of approved map / plan</td>
      <td class="value">${safeGet(pdfData, 'layoutIssueDate')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">g) Approved map / plan issuing authority</td>
      <td class="value">${safeGet(pdfData, 'approvedMapAuthority')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">h) Whether genuineness or authenticity of approved map / plan is verified</td>
      <td class="value">${safeGet(pdfData, 'mapVerified')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">i) Any other comments by our empanelled valuers on authentic of authentic plan</td>
      <td class="value">${safeGet(pdfData, 'valuersComments')}</td>
    </tr>
    <tr>
      <td class="row-num">7.</td>
      <td class="label">Postal address of the property</td>
      <td class="value">${safeGet(pdfData, 'postalAddress')}</td>
    </tr>
    <tr>
      <td class="row-num">8.</td>
      <td class="label">City/ Town</td>
      <td class="value">${safeGet(pdfData, 'cityTown')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Residential Area</td>
      <td class="value">${safeGet(pdfData, 'residentialArea')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">Commercial Area</td>
      <td class="value">${safeGet(pdfData, 'commercialArea')}</td>
    </tr>
    <tr>
      <td class="row-num">9.</td>
      <td class="label">Classification of the area</td>
      <td class="value"></td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">i) High / Middle / Poor</td>
      <td class="value">${safeGet(pdfData, 'areaClassification')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">ii) Urban / Semi Urban / Rural</td>
      <td class="value">${safeGet(pdfData, 'urbanType')}</td>
    </tr>
    <tr>
      <td class="row-num">10</td>
      <td class="label">Coming under Corporation limit / Village Panchayat / Municipality</td>
      <td class="value">${safeGet(pdfData, 'jurisdictionType')}</td>
    </tr>
    <tr>
      <td class="row-num">11</td>
      <td class="label">Whether covered under any State / Central Govt. enactments (e.g. Urban Land Ceiling Act) or notified under agency area / scheduled area / cantonment area</td>
      <td class="value">${safeGet(pdfData, 'enactmentCovered')}</td>
    </tr>
    <tr>
      <td class="row-num">12a</td>
      <td class="label" style="background: #ffffffff; ">Boundaries of the property - Plot</td>
      <td>A) As per Deed</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">North</td>
      <td>${safeGet(pdfData, 'boundariesPlotNorthDeed')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">South</td>
      <td>${safeGet(pdfData, 'boundariesPlotSouthDeed')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">East</td>
      <td>${safeGet(pdfData, 'boundariesPlotEastDeed')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">West</td>
      <td>${safeGet(pdfData, 'boundariesPlotWestDeed')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label"></td>
      <td>B) Actual</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">North</td>
      <td>${safeGet(pdfData, 'boundariesPlotNorthActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">South</td>
      <td>${safeGet(pdfData, 'boundariesPlotSouthActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">East</td>
      <td>${safeGet(pdfData, 'boundariesPlotEastActual')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">West</td>
      <td>${safeGet(pdfData, 'boundariesPlotWestActual')}</td>
    </tr>
    </tr>
    <tr>
      <td class="row-num">12b</td>
      <td class="label">Boundaries of the property (Flat)</td>
      <td>A) As per Agreement</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">North</td>
      <td >${safeGet(pdfData, 'boundariesShopNorthDeed') || 'NA'}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">South</td>
      <td>${safeGet(pdfData, 'boundariesShopSouthDeed') || 'NA'}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">East</td>
      <td>${safeGet(pdfData, 'boundariesShopEastDeed') || 'NA'}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">West</td>
      <td>${safeGet(pdfData, 'boundariesShopWestDeed') || 'NA'}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label"></td>
      <td>B) Actual</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">North</td>
      <td>${safeGet(pdfData, 'boundariesShopNorthActual') || 'NA'}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">South</td>
      <td>${safeGet(pdfData, 'boundariesShopSouthActual') || 'NA'}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">East</td>
      <td>${safeGet(pdfData, 'boundariesShopEastActual') || 'NA'}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label">West</td>
      <td>${safeGet(pdfData, 'boundariesShopWestActual') || 'NA'}</td>
    </tr>
    <tr>
      <td class="row-num">13</td>
      <td class="label" style="background: #ffffffff; ">Dimensions of the property</td>
      <td>A) As per Documents</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label"></td>
      <td>${safeGet(pdfData, 'dimensionsDeed')}</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label"></td>
      <td>B) As per Actuals</td>
    </tr>
    <tr>
      <td class="row-num"></td>
      <td class="label"></td>
      <td>${safeGet(pdfData, 'dimensionsActual')}</td>
    </tr>
    <tr>
      <td class="row-num">14</td>
      <td class="label">Extent of the Site</td>
      <td>${safeGet(pdfData, 'extentUnit')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">15</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Extent of the Site considered for valuation</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'extentSiteValuation')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">16</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Latitude, longitude & Co-ordinates of Flat</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'latitudeLongitude')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">17</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Whether occupied by the owner/tenant? If occupied by tenant, since how long? Rent received per month</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'rentReceivedPerMonth')}</td>
    </tr>
    <tr>
  <td colspan="3" style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #ffffffff;">
    II. APARTMENT / BUILDING
  </td>
</tr>

<tr>
  <td style="border: 1px solid #000; padding: 8px; text-align: center;">1</td>
  <td style="border: 1px solid #000; padding: 8px;">Nature of the apartment</td>
  <td style="border: 1px solid #000; padding: 8px;">
    ${safeGet(pdfData, 'apartmentNature')}
  </td>
</tr>

<tr>
  <td style="border: 1px solid #000; padding: 8px; text-align: center;">2</td>
  <td style="border: 1px solid #000; padding: 8px; width: 35%;">Location</td>
  <td style="border: 1px solid #000; padding: 8px; width: 52%;"></td>
</tr>

<tr>
  <td style="border: 1px solid #000; padding: 8px;"></td>
  <td style="border: 1px solid #000; padding: 8px;">C.T.S. No.</td>
  <td style="border: 1px solid #000; padding: 8px;">
    ${safeGet(pdfData, 'apartmentCTSNo')}
  </td>
</tr>

<tr>
  <td style="border: 1px solid #000; padding: 8px;"></td>
  <td style="border: 1px solid #000; padding: 8px;">Block No.</td>
  <td style="border: 1px solid #000; padding: 8px;">
    ${safeGet(pdfData, 'apartmentBlockNo')}
  </td>
</tr>

<tr>
  <td style="border: 1px solid #000; padding: 8px;"></td>
  <td style="border: 1px solid #000; padding: 8px;">Ward No.</td>
  <td style="border: 1px solid #000; padding: 8px;">
    ${safeGet(pdfData, 'apartmentWardNo')}
  </td>
</tr>

<tr>
  <td style="border: 1px solid #000; padding: 8px;"></td>
  <td style="border: 1px solid #000; padding: 8px;">
    Village/ Municipality/ Corporation
  </td>
  <td style="border: 1px solid #000; padding: 8px;">
    ${safeGet(pdfData, 'apartmentMunicipality')}
  </td>
</tr>

<tr>
  <td style="border: 1px solid #000; padding: 8px;"></td>
  <td style="border: 1px solid #000; padding: 8px;">
    Door No. / Street or Road
  </td>
  <td style="border: 1px solid #000; padding: 8px;">
    ${safeGet(pdfData, 'apartmentDoorNoStreetRoad')}
  </td>
</tr>

<tr>
  <td style="border: 1px solid #000; padding: 8px;"></td>
  <td style="border: 1px solid #000; padding: 8px;">Pin Code</td>
  <td style="border: 1px solid #000; padding: 8px;">
    ${safeGet(pdfData, 'apartmentPinCode')}
  </td>
</tr>

    
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">3</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Description of the Locality (Residential / Commercial / Mixed)</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'localityDescription')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">4</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Year of Construction</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;">${safeGet(pdfData, 'yearConstruction')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">5</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Number of floors</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'numberOfFloors')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">6</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Type of structure</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'structureType')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">7</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Number of dwelling unit in the building</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'numberOfDwellingUnits')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">8</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Quality of construction</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'qualityConstruction')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">9</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Appearance of the Building</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'buildingAppearance')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">10</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Maintenance of the Building</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'buildingMaintenance')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;">11</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">Facilities available</td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">- Lift</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'facilityLift')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%;">- Protected water supply</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'facilityWater')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">- Underground Sewerage</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'facilitySump')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">- Car parking (Open /Covered)</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'facilityParking')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">- Around compound wall</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'facilityCompoundWall')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">- Pavement around the building</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'facilityPavement')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 42%; ">- Any others facility</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"> ${safeGet(pdfData, 'facilityOthers')}</td>
    </tr>
   
    <tr>
      <td colspan="3" style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #ffffffff;">III. FLAT</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">1</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">The floor in which the Unit is situated</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;"> ${safeGet(pdfData, 'floorUnit')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">2</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Door Number of the Flat</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;"> ${safeGet(pdfData, 'doorNoUnit')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">3</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Specifications of the Flat</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;"> ${safeGet(pdfData, 'unitSpecification')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Roof</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'roofUnit')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Flooring</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'flooringUnit')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Doors & Windows</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'doorsUnit')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Bath / WC</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'unitBathAndWC')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Electrical wiring</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'unitElectricalWiring')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Fittings</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'fittingsUnit')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Finishing</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'finishingUnit')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">4</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">
        <span style="display: block;">Flat Tax</span>
        <span style="display: block; margin-top: 4px;">Assessment No.</span>
        <span style="display: block; margin-top: 4px;">Tax Amount</span>
        <span style="display: block; margin-top: 4px;">In the Name of</span>
      </td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">
        <span style="display: block;"></span>
        <span style="display: block; margin-top: 4px;">${safeGet(pdfData, 'assessmentNo')}</span>
        <span style="display: block; margin-top: 4px;">${safeGet(pdfData, 'taxAmount')}</span>
        <span style="display: block; margin-top: 4px;">${safeGet(pdfData, 'taxPaidName')}</span>
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">5</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Electricity service connection number Meter card is in the name of</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'electricityServiceNo')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">6</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">How is the maintenance of the Flat ?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'unitMaintenance')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">7</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Agreement for Sale executed in the name of</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'ownerNameAddress')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">8</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">What is the undivided area of the land as per sale deed ?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'undividedLandArea')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">9</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">What is the Plinth Area of the Flat?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'plinthArea')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">10</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">What is the floor space index?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'floorSpaceIndex')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">11</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">What is the Carpet area of the Flat?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'carpetArea')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">12</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Is it Posh/ I Class / Medium/ Ordinary?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'unitClassification')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">13</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Is it being used for residential or commercial?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'residentialOrCommercial')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">14</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">It is owner occupied or tenanted</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'ownerOccupiedOrLetOut')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">15</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">If tenanted, what is the monthly rent</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'monthlyRent')}</td>
    </tr>
    
    <tr style="page-break-inside: avoid; border-top: 1px solid #000;">
      <td colspan="3" style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #ffffffff; border-top: 1px solid #000;">IV. MARKETABILITY</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">1.</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">How is the marketability?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'marketability')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">2.</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">What are the factors favoring for an extra potential value?</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'favoringFactors')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">3.</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Any negative factors observed which affect</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'negativeFactors')}</td>
    </tr>
 
    <tr style="page-break-inside: avoid; border-top: 1px solid #000;">
      <td style="border: 1px solid #000; padding: 8px; width: 8%; border-top: 1px solid #000;"></td>
      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #ffffffff; width: 42%; border-top: 1px solid #000;">V. RATE</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%; border-top: 1px solid #000;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">1</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">After analyzing the comparable sale instances, what is the composite rate for a similar Flat with same specifications in the adjoining locality? (Along with details/reference of at least two latest deals/transactions with respect to adjacent properties in the area)</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'marketabilityDescription')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">2</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Assuming it is a new construction What is the adopted basic composite Rate of the Building under valuation after Comparing with the specifications and other factors with the Building under Comparison (Give details)</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'smallFlatDescription')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">3</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">
        <span style="display: block;">Break up for the above Rate</span>
        <span style="display: block; margin-top: 4px;">Building + Services</span>
        <span style="display: block; margin-top: 4px;"></span>
        <span style="display: block; margin-top: 4px;">Land + Other</span>
      </td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">
        <span style="display: block;"></span>
        <span style="display: block; margin-top: 4px;">${safeGet(pdfData, 'buildingServicesRate')}</span>
        <span style="display: block; margin-top: 4px;"></span>
        <span style="display: block; margin-top: 4px;">${safeGet(pdfData, 'landOthersRate')}</span>
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; width: 8%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all;">4</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Guideline rate obtained from the Registrar's office (an evidence thereof to be enclosed)</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'rateAdjustments')}</td>
    </tr>
    <tr style="page-break-inside: avoid; border-top: 1px solid #000;">
      <td style="border: 1px solid #000; padding: 8px; width: 8%; border-top: 1px solid #000;"></td>
      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #ffffffff; width: 42%; border-top: 1px solid #000;">VI. Composite rate adopted after depreciation</td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%; border-top: 1px solid #000;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;">a)</td>
      <td style="border: 1px solid #000; padding: 8px;  width: 42%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Depreciated Building Rate</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'depreciatedBuildingRate')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Replacement cost of Flat with services (V(3)(i))</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'replacementCostServices')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Age of the Building</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'buildingAge')} Years</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Future Life of the building estimated</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'buildingLife')} years</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Depreciation percentage assuming the salvage value as 10%</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'depreciationPercentage')} %</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Depreciated Rate of the building</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'depreciationStorage')} %</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;">b)</td>
      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; width: 42%;"></td>
      <td style="border: 1px solid #000; padding: 8px; width: 50%;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Total composite rate arrived for valuation</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Depreciated Building rate VI (a)</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'depreciatedBuildingRate')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Rate for land & others [V (3) (ii)]</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'landOthersRate')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 8%;"></td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 42%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; ">Total Composite rate</td>
      <td style="border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safeGet(pdfData, 'totalCompositeRate')}</td>
    </tr>
  </table>
</div>

 <!-- PAGE 7: VALUATION DETAILS -->
<div class="page c-valuation-section" style="page-break-before: always; margin-top: 20px;">
  <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12pt; border: 1px solid #000;">
    <tr>
      <td colspan="5" style="border: 1px solid #000; padding: 6px; font-weight: bold; background: #ffffff; font-size: 12pt;">C. VALUATION DETAILS</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; font-size: 12pt;">Sr. No</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: bold; font-size: 12pt;">Description</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; font-size: 12pt;">Qty. Sq. ft.</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; font-size: 12pt;">Rate per Unit Sq. ft.</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; font-size: 12pt;">Estimated / Present Value (₹)</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">1.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Present value of Flat (Built up area)</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'presentValueQty')}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'presentValueRate')}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'presentValue')}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">2.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Wardrobes</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'wardrobesQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'wardrobesRate') || 'Nil'}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'wardrobes') || 'Nil'}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">3.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Show cases / Almirah</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'showcasesQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'showcasesRate') || 'Nil'}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'showcases') || 'Nil'}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">4.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Kitchen arrangements</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'kitchenArrangementsQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'kitchenArrangementsRate') || 'Nil'}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'kitchenArrangements') || 'Nil'}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">5.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Superfine Finish</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'superfineFinishQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'superfineFinishRate') || 'Nil'}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'superfineFinish') || 'Nil'}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">6.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Interiors Decorations</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'interiorDecorationsQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'interiorDecorationsRate') || 'Nil'}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'interiorDecorations') || 'Nil'}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">7.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Electricity Deposits / Electrical fitting etc.</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'electricityDepositsQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'electricityDepositsRate') || 'Nil'}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'electricityDeposits') || 'Nil'}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">8.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Extra Collapsible gates / grills works etc.</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'collapsibleGatesQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'collapsibleGatesRate') || 'Nil'}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'collapsibleGates') || 'Nil'}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">9.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Potential Value, if any</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'potentialValueQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">₹ ${safeGet(pdfData, 'potentialValueRate') || 'Nil'}/-</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'potentialValue') || 'Nil'}/-</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">10.</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight: normal;">Others</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'otherItemsQty') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeGet(pdfData, 'otherItemsRate') || 'Nil'}</td>
      <td style="border: 1px solid #000; padding: 6px; text-align: right;">₹ ${safeGet(pdfData, 'otherItems') || 'Nil'}/-</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td colspan="3" style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;"> </td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">TOTAL AMOUNT</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">₹ ${safeGet(pdfData, 'totalValuationItems')}/-</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td colspan="3" style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;"></td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Say</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">₹ ${safeGet(pdfData, 'fairMarketValue')}/-</td>
    </tr>
  </table>
</div>

<!-- PAGE 7A: VALUE OF FLAT -->
<div class="page value-of-flat-section" style="page-break-before: always; margin-top: 30px;">
  <p style="font-weight: bold; margin-bottom: 10px; font-size: 12pt;">VALUE OF FLAT</p>
  <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12pt; border: 1px solid #000;">
    <tr>
      <td style="border: 1px solid #000; padding: 8px; width: 40%; font-weight: bold; font-size: 12pt;">Fair Market Value</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 12pt;">
        ${safeGet(pdfData, 'fairMarketValue') !== 'NA' ?
      `Rs. ${safeGet(pdfData, 'fairMarketValue')} /- 
          ${safeGet(pdfData, 'fairMarketValueWords') && safeGet(pdfData, 'fairMarketValueWords') !== 'NA' ?
        `(${safeGet(pdfData, 'fairMarketValueWords')})` : ''}`
      : 'NA'}
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; font-size: 12pt;">Realizable Value</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 12pt;">
        ${safeGet(pdfData, 'realisableValue') !== 'NA' ?
      `Rs. ${safeGet(pdfData, 'realisableValue')} /- 
          ${safeGet(pdfData, 'realisableValueWords') && safeGet(pdfData, 'realisableValueWords') !== 'NA' ?
        `(${safeGet(pdfData, 'realisableValueWords')})` : ''}`
      : 'NA'}
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; font-size: 12pt;">Distress Value</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 12pt;">
        ${safeGet(pdfData, 'distressValue') !== 'NA' ?
      `Rs. ${safeGet(pdfData, 'distressValue')} /- 
          ${safeGet(pdfData, 'distressValueWords') && safeGet(pdfData, 'distressValueWords') !== 'NA' ?
        `(${safeGet(pdfData, 'distressValueWords')})` : ''}`
      : 'NA'}
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; font-size: 12pt;">Agreement Value / Circle Rate</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 12pt;">
        ${(safeGet(pdfData, 'agreementValue') !== 'NA' || safeGet(pdfData, 'valueCircleRate') !== 'NA') ?
      `Rs. ${safeGet(pdfData, 'agreementValue') !== 'NA' ?
        safeGet(pdfData, 'agreementValue') :
        safeGet(pdfData, 'valueCircleRate')} /- 
          ${(safeGet(pdfData, 'agreementValueWords') && safeGet(pdfData, 'agreementValueWords') !== 'NA') ||
        (safeGet(pdfData, 'valueCircleRateWords') && safeGet(pdfData, 'valueCircleRateWords') !== 'NA') ?
        `(${safeGet(pdfData, 'agreementValueWords') && safeGet(pdfData, 'agreementValueWords') !== 'NA' ?
          safeGet(pdfData, 'agreementValueWords') :
          safeGet(pdfData, 'valueCircleRateWords')})` : ''}`
      : 'NA'}
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; font-size: 12pt;">Insurance Value</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 12pt;">
        ${safeGet(pdfData, 'insurableValue') !== 'NA' ?
      `Rs. ${safeGet(pdfData, 'insurableValue')} /- 
          ${safeGet(pdfData, 'insurableValueWords') && safeGet(pdfData, 'insurableValueWords') !== 'NA' ?
        `(${safeGet(pdfData, 'insurableValueWords')})` : ''}`
      : 'NA'}
      </td>
    </tr>
  </table>
   <!-- PAGE 7B: CUSTOM FIELDS SECTION -->
  ${Array.isArray(pdfData.customFields) && pdfData.customFields.length > 0 ? `
  <div style="margin-top: 30px;  ">
    <p style="font-weight: bold; margin-bottom: 12px; margin-top: 0; font-size: 12pt;">CUSTOM FIELDS</p>
    <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12pt; border: 1px solid #000;">
      <tr>
        <td style="border: 1px solid #000; padding: 8px ; font-weight: bold;  font-size: 12pt;">Field Name</td>
        <td style="border: 1px solid #000; padding: 8px ; font-weight: bold;  font-size: 12pt;">Field Value</td>
      </tr>
      ${pdfData.customFields.map((field, idx) => `
      <tr>
        <td style="border: 1px solid #000; padding: 8px ;  white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; font-size: 12pt;">${safeGet({ name: field.name }, 'name')}</td>
        <td style="border: 1px solid #000; padding: 8px ;  white-space: normal; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; font-size: 12pt;">${safeGet({ value: field.value }, 'value')}</td>
      </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}
  </div>
   </div>

  <!-- PAGE 7C: VALUATION SUMMARY -->
  <div class="page valuation-summary-section" style="margin-top: 20px; padding: 40px;">
  <div style="text-align: justify; line-height: 1.8; font-size: 12pt;">
    <p style="margin-bottom: 15px;">
      As a result of my appraisal and analysis, it is my considered opinion that the present fair market value of the above property in the prevailing condition with aforesaid specifications is <strong>₹ 47,47,000.00 /- (Rupees Forty Seven Lac Forty Seven Thousand Only)</strong> of the above property.
    </p>

    <p style="margin-bottom: 15px;">
      The <strong>realizable value is ₹ 42,72,300.00/- (Rupees Forty Two Lac Seventy Two Thousand Three Hundred Only)</strong> and the <strong>distress value is ₹ 40,34,950.00/- (Rupees Forty Lac Thirty Four Thousand Nine Hundred Fifty Only)</strong>.
    </p>

    <p style="margin-bottom: 30px;">
      <strong>Place:</strong> Navi Mumbai<br/>
      <strong>Date:</strong> 28/11/2025
    </p>
  </div>

  <div style="margin-top: 80px; text-align: right; font-size: 11pt;">
    <p style="margin: 0; font-weight: bold;">Shashikant R. Dhumal</p>
    <p style="margin: 5px 0 0 0; font-weight: bold;">Signature of Approved Valuer</p>
    <p style="margin: 5px 0 0 0;">Engineer & Govt. Approved Valuer</p>
    <p style="margin: 5px 0 0 0;">CAT/1/143-2007</p></br>
  </div>
  </div>

  <!-- PAGE 9: ANNEXURE-II DECLARATION -->
  <div class="page">
  <div style="padding: 2px; text-align: justify; line-height: 1.8; font-size: 12pt;">
  <div style="text-align: center; margin-bottom: 30px;">
    <p style="font-weight: bold; font-size: 12pt; margin: 0;">ANNEXURE-II</p>
    <p style="font-weight: bold; font-size: 12pt; margin: 10px 0;">FORMAT-A</p>
    <p style="font-weight: bold; font-size: 12pt; margin: 10px 0;">
      DECLARATION FROM VALUERS
    </p>
  </div>

  <div style="font-size: 12pt; line-height: 1.8; padding: 20px; text-align: justify; page-break-inside: avoid; break-inside: avoid;">
    <p style="margin-bottom: 15px;"><strong>I hereby declare that-</strong></p>
    
    <p style="margin-bottom: 15px;">
      The information furnished in my valuation report dated ${formatDate(safeGet(pdfData, 'valuationMadeDate'))} is true and correct to the best of my knowledge and belief and I have made an impartial and true valuation of the property.
    </p>
    
    <p style="margin-bottom: 15px;">
      I have no direct or indirect interest in the property valued.
    </p>
    
    <p style="margin-bottom: 15px;">
      I have personally inspected the property on ${formatDate(safeGet(pdfData, 'inspectionDate'))}. The work is not sub-contracted to any other valuer and carried out by myself.
    </p>
    
    <p style="margin-bottom: 15px;">
      I have not been convicted of any offence and sentenced to a term of Imprisonment;
    </p>
    
    <p style="margin-bottom: 15px;">
      I have not been found guilty of misconduct in my professional capacity.
    </p>
    
    <p style="margin-bottom: 15px;">
      I have read the Handbook on Policy, Standards and procedure for Real Estate Valuation, 2011 of the IBA and this report is in conformity to the "Standards" enshrined for valuation in the Part-B of the above handbook to the best of my ability.
    </p>
    
    <p style="margin-bottom: 15px;">
      I have read the International Valuation Standards (IVS) and the report submitted to the Bank for the respective asset class is in conformity to the "Standards" as enshrined for valuation in the IVS in "General Standards" and "Asset Standards" as applicable.
    </p>
    
    <p style="margin-bottom: 15px;">
      I abide by the Model Code of Conduct for empanelment of valuer in the Bank. (Annexure III - A signed copy of same to be taken and kept along with this declaration)
    </p>
    
    <p style="margin-bottom: 15px;">
      I am registered under Section 34 AB of the Wealth Tax Act, 1957.
    </p>
    
    <p style="margin-bottom: 30px;">
      I am the proprietor / partner / authorized official of the firm / company, who is competent to sign this valuation report.
    </p>

    
  </div>
</div>
</div>
<!-- PAGE 10: VALUATION INFORMATION DECLARATION -->
<div class="page" style="padding: 25px 15px;">
  <p style="font-weight: bold; margin-bottom: 20px; font-size: 12pt;">Further, I hereby provide the following information.</p>
  
  <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin: 0; font-size: 12pt; border: 1px solid #000; table-layout: fixed;">
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; width: 8%; font-weight: bold; font-size: 12pt; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">S. No.</td>
      <td style="border: 1px solid #000; padding: 8px 6px; width: 42%; font-weight: bold; font-size: 12pt; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Particulars</td>
      <td style="border: 1px solid #000; padding: 8px 6px; width: 50%; font-weight: bold; font-size: 12pt; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Valuer Comment</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">1</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Background information of the asset being valued;</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Property in question to be purchased by ${safeGet(pdfData, 'ownerNameAddress')}. This is based on information given by Owner and documents available for our perusal.</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">2</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Purpose of valuation and appointing authority</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">As per request of Branch Manager, Bank of Maharashtra, S.P. Road Branch, Mumbai.</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">3</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Identity of the valuer and any other experts involved in the valuation;</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Mr. Shashilant R. Dhumal</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">4</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Disclosure of valuer interest or conflict, if any;</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">No</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">5</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Date of appointment, valuation date and date of report;</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Date of Appointment: ${formatDate(safeGet(pdfData, 'inspectionDate'))}<br/>Date of Inspection: ${formatDate(safeGet(pdfData, 'inspectionDate'))}<br/>Date of Valuation Report: ${formatDate(safeGet(pdfData, 'valuationMadeDate'))}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">6</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Inspections and/or investigations undertaken;</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Site inspection was carried out on along with Mrs. ${safeGet(pdfData, 'ownerNameAddress')}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">7</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Nature and sources of the information used or relied upon</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Local inquiry in the surrounding vicinity.</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">8</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Procedures adopted in carrying out the valuation and valuation standards followed;</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Actual site visit conducted along with Mrs. ${safeGet(pdfData, 'ownerNameAddress')}. Valuation report was prepared by adopting composite rate method of valuation</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">9</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Restrictions on use of the report, if any;</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">The report is only valid for the purpose mentioned in the report</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">10</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Major factors that were taken into account during the valuation;</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Marketability supply and demand, locality, construction quality.</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px 6px; text-align: center; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">11</td>
      <td style="border: 1px solid #000; padding: 8px 6px; font-weight: bold; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">Caveats, limitations and disclaimers to the extent they explain or elucidate the limitations faced by valuer, which shall not be for the purpose of limiting his responsibility for the valuation report</td>
      <td style="border: 1px solid #000; padding: 8px 6px; height: auto; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word;">No such circumstances were noticed.</td>
    </tr>
  </table>

  <div style="margin-top: 30px; font-size: 12pt;">
    <p style="margin-bottom: 5px;"><strong>Date: ${formatDate(safeGet(pdfData, 'valuationMadeDate'))}</strong></p>
    <p style="margin-bottom: 30px;"><strong>Place: ${safeGet(pdfData, 'valuationPlace')}</strong></p>

     <div style="text-align: right; margin-right: 60px;">
      <p style="margin: 80px 0 10px 0;  width: 200px;"></p>
      <p style="font-weight: bold; margin-top: 10px;">Shashilant R. Dhumal</p>
      <p style="margin: 5px 0;">Signature of Approved Valuer</p>
      <p style="margin: 5px 0;">Engineer & Govt. Approved Valuer</p>
      <p style="font-size: 12pt; margin-top: 10px;margin-bottom: 60px;">CAT/I/143-2007</p></br>
    </div>
      </div>
      </div>
</div>

<!-- PAGE 11: MODEL CODE OF CONDUCT FOR VALUERS -->
<div class="page" style="padding: 30px 20px;">
  <div style="font-size: 11pt; line-height: 1.4; padding: 15px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold; font-size: 14pt;">ANNEXURE - IV</p>
      <p style="margin: 5px 0; font-weight: bold; font-size: 14pt;">MODEL CODE OF CONDUCT FOR VALUERS</p>
    </div>

    <p style="margin-bottom: 10px; text-align: justify;">All valuers empanelled with bank shall strictly adhere to the following code of conduct:</p>

    <p style="margin: 10px 0 5px 0; font-weight: bold;">Integrity and Fairness:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">A valuer shall in the conduct of his/its business, follow high standards of integrity and fairness in all his/its dealings with his/its clients and other valuers.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall maintain integrity by being honest, straightforward, and forthright in all professional relationships.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall endeavor to ensure that he/it provides true and adequate information and shall not misrepresent any facts or situations.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not involve himself/it in any action that would bring disrepute to the profession.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall keep public interest foremost while delivering his/its services.</li>
    </ol>

    <p style="margin: 10px 0 5px 0; font-weight: bold;">Professional Competence and Due Care:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">A valuer shall render at all times high standards of service, exercise due diligence, ensure proper care and exercise independent professional judgment.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall carry out professional services in accordance with the relevant technical and professional standards that may be specified from time to time.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall continuously maintain professional knowledge and skill to provide competent professional service based on up-to-date developments in practice, prevailing regulations/guidelines and techniques.</li>
      <li style="margin: 3px 0; text-align: justify;">In the preparation of a valuation report, the valuer shall not disclaim liability for his/its expertise or deny his/its duty of care, except to the extent that the assumptions are based on statements of fact provided by the company or its auditors or consultants or information unavailable in public domain and not generated by the valuer.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not carry out any instruction of the client insofar as they are incompatible with the requirements of integrity, objectivity and independence.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall clearly state to his client the services that he would be competent to provide and the services for which he would be relying on other valuers or professionals or for which client can seek independent expert opinion or a separate arrangement with other valuers.</li>
    </ol>

    <p style="margin: 10px 0 5px 0; font-weight: bold;">Independence and Disclosure of Interest:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">A valuer shall act with objectivity in his/its professional dealings by ensuring that his/its decisions are not biased by or subject to any pressure, coercion, or undue influence of any party, whether directly connected to the valuation assignment or not.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not take up an assignment if he/it or any of his/its relatives or associates is not independent in terms of association to the company.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall maintain complete independence in his/its professional relationships and shall conduct the valuation independent of external influences.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall wherever necessary disclose to the clients, possible sources of conflicts of duties and interests, while providing unbiased services.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not deal in securities of any subject company after any time when he/it first becomes aware of the possibility of such association with the valuation, and in accordance with the Securities and Exchange Board of India (Prohibition of Insider Trading) Regulations, 2015 or till the time the valuation report becomes public, whichever is earlier.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not indulge in "mandate snatching" or offering "convenience valuations" in order to cater to a company or client's needs.</li>
      <li style="margin: 3px 0; text-align: justify;">As an independent valuer, the valuer shall not charge success fee (Success fees may be defined as a compensation to the valuer paid to any third party for successful closure of transaction, In this case, approval of credit proposals).</li>
      <li style="margin: 3px 0; text-align: justify;">In any fairness opinion or independent expert opinion submitted by a valuer, if there has been a prior engagement in an unconnected transaction, the valuer shall declare the association with the company during the last five years.</li>
    </ol>
    </div>
    </div>

    <!-- PAGE 12: CONTINUED CODE OF CONDUCT -->
    <div class="page" style="padding: 30px 20px;">
    <div style="font-size: 11pt; line-height: 1.4; padding: 15px;">
    <p style="margin: 10px 0 5px 0; font-weight: bold;">Confidentiality:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not use or divulge to other clients or any other party any confidential information about the subject company, which has come to his/its knowledge without prior and specific authority or unless there is a legal or professional right or duty to disclose.</li>
    </ol>

    <p style="margin: 10px 0 5px 0; font-weight: bold;">Record Management:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">A valuer shall ensure that he/ it maintains written contemporaneous records for any decision taken, the rationale for taking the decision, and the information and evidence in support of such decision. This shall be maintained so as to sufficiently enable a reasonable person to take a view on the appropriateness of his/its decisions and actions.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall operate and be available for inspections and investigations carried out by the authority, any person authorized by the authority, the registered valuers organization with which he/it is registered or any other statutory regulatory body.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall provide all information and records as may be required by the authority, the Tribunal, Appellate Tribunal, the registered valuers organization with which he/it is registered, or any other statutory regulatory body.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer while inspecting the confidentiality of information acquired during the course of performing professional services, shall maintain proper working papers for a period of three years or such longer period as required in its contract for a specific valuation, for production before a regulator or for a peer review. In the event of a pending case before the Tribunal or Appellate Tribunal, the record shall be maintained till the disposal of the case.</li>
    </ol>

    <p style="margin: 10px 0 5px 0; font-weight: bold;">Gifts and hospitality:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">A valuer or his/its relative shall not accept gifts or hospitality which undermines or affects his independence as a valuer.</li>
    </ol>

    <p style="margin: 10px 0 5px 0; font-weight: bold;">Exploitation:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">For the purposes of this code the term 'relative' shall have the same meaning as defined in clause (77) of Section 2 of the Companies Act, 2013 (18 of 2013).</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not offer gifts or hospitality or an inducement to any other person with a view to obtain or retain work for himself/ itself, or to obtain or retain an advantage in the conduct of profession for himself/ itself.</li>
    </ol>

    <p style="margin: 10px 0 5px 0; font-weight: bold;">Remuneration and Costs:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">A valuer shall provide services for remuneration which is charged in a transparent manner, is a reasonable reflection of the work necessarily and properly undertaken, and is not inconsistent with the applicable rules.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not accept any fees or charges other than those which are disclosed in a written contract with the person to whom he would be rendering service.</li>
    </ol>

    <p style="margin: 10px 0 5px 0; font-weight: bold;">Occupation, employability and restrictions:</p>
    <ol style="margin: 5px 0 10px 20px; padding: 0;">
      <li style="margin: 3px 0; text-align: justify;">A valuer shall refrain from accepting too many assignments, if he/it is unlikely to be able to devote adequate time to each of his/ its assignments.</li>
      <li style="margin: 3px 0; text-align: justify;">A valuer shall not conduct business which in the opinion of the authority or the registered valuer organization discredits the profession.</li>
    </ol>

    <div style="margin-top: 30px; font-size: 12pt;">
    <p style="margin-bottom: 5px;"><strong>Date: ${formatDate(safeGet(pdfData, 'valuationMadeDate'))}</strong></p>
    <p style="margin-bottom: 30px;"><strong>Place: ${safeGet(pdfData, 'valuationPlace')}</strong></p>

    <div style="margin-top: 50px; text-align: right; margin-right: 40px;">
      <p style="margin: 60px 0 10px 0; width: 200px;"></p>
      <p style="font-weight: bold; margin-top: 10px;">${safeGet(pdfData, 'valuationValuerName', 'Shashikant R. Dhumal')}</p>
      <p style="margin: 5px 0;">Signature of Approved Valuer</p>
      <p style="margin: 5px 0;">Engineer & Govt. Approved Valuer</p>
      <p style="font-size: 11pt; margin-top: 5px;">CAT/I/143-2007</p>
    </div>
  </div>
</div>
</div>
<!-- PAGE 11: IMAGES SECTION -->
  <div>
  <!--  IMAGES -->
  ${Array.isArray(pdfData.propertyImages) && pdfData.propertyImages.length > 0 ? `
    <div class="page images-section property-images-page" style="page-break-before: always; break-before: page;">
        <div style="padding: 20px; font-size: 12pt;">
            <h2 style="text-align: center; margin-bottom: 20px; font-weight: bold;">PROPERTY IMAGES</h2>
            <div class="image-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                ${pdfData.propertyImages.map((img, idx) => {
        const imgSrc = typeof img === 'string' ? img : img?.url;
        return imgSrc ? `
                    <div style="page-break-inside: avoid; border: 1px solid #ccc; padding: 10px;">
                        <img class="pdf-image" src="${imgSrc}" alt="Property Image ${idx + 1}" style="width: 100%; height: auto; max-height: 300px; object-fit: contain;">
                        <p style="margin-top: 8px; font-size: 10pt; text-align: center;">Property Image ${idx + 1}</p>
                    </div>
                    ` : '';
      }).join('')}
            </div>
        </div>
    </div>
    ` : ''}

    ${Array.isArray(pdfData.locationImages) && pdfData.locationImages.length > 0 ? `
    <div class="page images-section location-images-page" style="page-break-before: always; break-before: page;">
        <div style="padding: 20px; font-size: 12pt;">
            <h2 style="text-align: center; margin-bottom: 20px; font-weight: bold;">LOCATION IMAGES</h2>
            ${pdfData.locationImages.map((img, idx) => {
        const imgSrc = typeof img === 'string' ? img : img?.url;
        return imgSrc ? `
                <div class="image-container" style="page-break-inside: avoid; text-align: center; margin-bottom: 30px;">
                    <img class="pdf-image" src="${imgSrc}" alt="Location Image ${idx + 1}" style="width: 90%; height: auto; max-height: 400px; object-fit: contain;">
                    <p style="margin-top: 10px; font-size: 11pt; font-weight: bold;">Location Image ${idx + 1}</p>
                </div>
                ` : '';
      }).join('')}
         </div>
     </div>
     ` : ''}

    ${pdfData.areaImages && typeof pdfData.areaImages === 'object' && Object.keys(pdfData.areaImages).length > 0 ? `
    <div class="page images-section area-images-page" style="page-break-before: always; break-before: page;">
        <div style="padding: 20px; font-size: 12pt;">
            <h2 style="text-align: center; margin-bottom: 20px; font-weight: bold;">PROPERTY AREA IMAGES</h2>
            ${Object.entries(pdfData.areaImages).map(([areaName, areaImageList]) => {
            return Array.isArray(areaImageList) && areaImageList.length > 0 ? `
                <div style="margin-bottom: 25px; page-break-inside: avoid; break-inside: avoid;">
                    <h3 style="font-size: 13pt; font-weight: bold; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 5px; page-break-after: avoid;">${areaName}</h3>
                    <div class="area-image-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; page-break-inside: avoid; break-inside: avoid;">
                        ${areaImageList.map((img, idx) => {
                        const imgSrc = typeof img === 'string' ? img : (img?.url || img?.preview || img?.data || img?.src || '');
                        return imgSrc ? `
                        <div style="page-break-inside: avoid; break-inside: avoid; border: 1px solid #ccc; padding: 6px; text-align: center;">
                            <img class="pdf-image" src="${imgSrc}" alt="${areaName} Image ${idx + 1}" style="width: 100%; height: auto; max-height: 240px; object-fit: contain;">
                            <p style="margin-top: 4px; font-size: 8pt; color: #666;">${areaName} - Image ${idx + 1}</p>
                         </div>
                            ` : '';
                        }).join('')}
                    </div>
                </div>
                ` : '';
            }).join('')}
         </div>
     </div>
     ` : ''}

    ${Array.isArray(pdfData.documentPreviews) && pdfData.documentPreviews.length > 0 ? `
    <div class="page images-section supporting-docs-page" style="page-break-before: always; break-before: page;">
        <div style="padding: 20px; font-size: 12pt;">
            <h2 style="text-align: center; margin-bottom: 20px; font-weight: bold;">SUPPORTING DOCUMENTS</h2>
            ${pdfData.documentPreviews.map((img, idx) => {
        const imgSrc = typeof img === 'string' ? img : img?.url;
        return imgSrc ? `
                <div class="image-container" style="page-break-inside: avoid; text-align: center; margin-bottom: 30px;">
                    <img class="pdf-image" src="${imgSrc}" alt="Supporting Document ${idx + 1}" style="width: 90%; height: auto; max-height: 400px; object-fit: contain;">
                    <p style="margin-top: 10px; font-size: 11pt; font-weight: bold;">Supporting Document ${idx + 1}</p>
                </div>
                ` : '';
      }).join('')}
        </div>
    </div>
    ` : ''}
    </div>
             </body>
             </html>
             `;
}

export async function generateRecordPDF(record) {
  try {
    console.log('📄 Generating PDF for record:', record?.uniqueId || record?.clientName || 'new');
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

    // Remove only failed/invalid image containers
    console.log(`🗑️ Removing ${imagesToRemove.size} failed/invalid image containers`);
    imagesToRemove.forEach(el => {
      const alt = el.querySelector('img')?.getAttribute('alt') || 'unknown';
      console.log(`✂️ Removed container: ${alt}`);
      el.remove();
    });

    console.log('✅ Image validation complete - now extracting images BEFORE rendering...');

    // CRITICAL: Render continuous-wrapper and .page elements separately for proper page breaks
    const continuousWrapper = container.querySelector('.continuous-wrapper');
    const pageElements = Array.from(container.querySelectorAll(':scope > .page'));
    console.log(`📄 Total .page elements found: ${pageElements.length}`);

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
      console.log(`📄 Rendering .page element ${i + 1}/${pageElements.length}`);

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
            label.includes('Supporting') ? 'supporting' : 'property'
        });
        console.log(`📸 Extracted image: ${label}`);
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

          // If >60% of row is dark, it's a border line
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

    // Detect Y position of c-valuation-section for forced page break
    const cValuationElement = continuousWrapper?.querySelector('.c-valuation-section');
    let cValuationYPixels = null;
    if (cValuationElement) {
      const rect = cValuationElement.getBoundingClientRect();
      const wrapperRect = continuousWrapper.getBoundingClientRect();
      const relativeY = rect.top - wrapperRect.top;
      cValuationYPixels = relativeY * 1.5; // Apply same scale as canvas
      console.log(`🔍 C. VALUATION DETAILS section found at Y: ${cValuationYPixels}px (canvas coordinates)`);
    }

    const pdf = new jsPDF('p', 'mm', 'A4');
    let pageNumber = 1;
    let heightLeft = imgHeight;
    let yPosition = 0;
    let sourceY = 0;  // Track position in the source canvas
    let cValuationPageBreakHandled = false;  // Track if we've handled the page break
    let pageAdded = false;  // Track if first page is added to prevent empty page
    let currentPageYPosition = headerHeight;  // Track current Y position on page to avoid empty pages

    while (heightLeft > 5) {  // Only continue if there's meaningful content left (>5mm to avoid blank pages)
      // Check if we need to force a page break for C. VALUATION DETAILS section
      if (!cValuationPageBreakHandled && cValuationYPixels !== null) {
        const sourceYPixels = (sourceY / imgHeight) * mainCanvas.height;
        const nextSourceYPixels = sourceYPixels + (Math.min(usableHeight, heightLeft) / imgHeight) * mainCanvas.height;

        // If C. VALUATION section will be on this page, force it to next page instead
        if (sourceYPixels < cValuationYPixels && nextSourceYPixels > cValuationYPixels && pageNumber > 1) {
          console.log(`⚠️ C. VALUATION DETAILS would split, forcing to new page`);
          pdf.addPage();
          pageNumber++;
          cValuationPageBreakHandled = true;
          // Skip remaining content and restart from C. VALUATION section
          sourceY = (cValuationYPixels / mainCanvas.height) * imgHeight;
          heightLeft = imgHeight - sourceY;
          continue;
        } else if (sourceYPixels >= cValuationYPixels && sourceYPixels < cValuationYPixels + 100) {
          // We're at the C. VALUATION section, mark it handled
          cValuationPageBreakHandled = true;
          console.log(`✅ C. VALUATION DETAILS is on new page as expected`);
        }
      }

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
                  // Preserve original color, just increase opacity/saturation
                  data[idx] = Math.min(255, data[idx] * 0.5);      // R - darken
                  data[idx + 1] = Math.min(255, data[idx + 1] * 0.5);  // G - darken
                  data[idx + 2] = Math.min(255, data[idx + 2] * 0.5);  // B - darken
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
                  // Preserve original color, just increase opacity/saturation
                  data[idx] = Math.min(255, data[idx] * 0.5);      // R - darken
                  data[idx + 1] = Math.min(255, data[idx + 1] * 0.5);  // G - darken
                  data[idx + 2] = Math.min(255, data[idx + 2] * 0.5);  // B - darken
                  data[idx + 3] = 255; // A
                }
              }
            }
            break;
          }
        }
      }

      ctx.putImageData(imageData, 0, Math.floor(sourceYPixels));

      // Find safe break point to avoid splitting rows
      const safeHeightPixels = findSafeBreakPoint(canvasHeight, sourceYPixels, maxHeightPixels, isFirstPage, isLastPage);
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

      // Only add content if it has meaningful height (avoid blank pages)
      if (imageHeightForThisPage > 2) {  // Only add if >2mm height
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

        // Update Y position tracking
        currentPageYPosition = headerHeight + imageHeightForThisPage;

        pageNumber++;
      }

      // Update counters
      heightLeft -= imageHeightForThisPage;
      sourceY += imageHeightForThisPage;
    }

    // Reset currentPageYPosition since we're starting new section for separate .page elements
    currentPageYPosition = headerHeight;

    // Add page canvases as separate pages in PDF
    console.log(`📄 Adding ${pageCanvases.length} separate .page canvases to PDF...`);
    for (let i = 0; i < pageCanvases.length; i++) {
      const pageCanvas = pageCanvases[i];
      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);
      const pageImgHeight = (pageCanvas.height * imgWidth) / pageCanvas.width;

      // Only add new page if there's substantial content on current page (more than just header space)
      // currentPageYPosition > headerHeight + 20 means there's at least 20mm of content
      if (currentPageYPosition > headerHeight + 20) {
        pdf.addPage();
        pageNumber++;
        currentPageYPosition = headerHeight;
        console.log(`📄 Added new page for .page element ${i + 1}`);
      } else {
        console.log(`📄 Skipping new page for .page element ${i + 1} - minimal content on current page`);
        // If on current page with minimal content, just continue on same page
        // currentPageYPosition already at headerHeight, ready for new content
      }

      // Add image with proper margins (12mm = ~45px at 96dpi)
      const leftMargin = 12;
      const topMargin = 12;
      const availableWidth = imgWidth - (leftMargin * 2);
      const adjustedImgHeight = (pageCanvas.height * availableWidth) / pageCanvas.width;

      pdf.addImage(pageImgData, 'JPEG', leftMargin, topMargin, availableWidth, adjustedImgHeight);
      pdf.setFontSize(9);
      pdf.text(`Page ${pageNumber}`, 105, pageHeight - 5, { align: 'center' });
      
      // Update Y position tracking
      currentPageYPosition = topMargin + adjustedImgHeight;

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

      // ===== ADD LOCATION IMAGES: 1 per page =====
      if (locationImgs.length > 0) {
        for (let i = 0; i < locationImgs.length; i++) {
          const img = locationImgs[i];

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

            console.log(`✅ Added location image: ${img.label}`);
          } catch (err) {
            console.warn(`Failed to add location image ${img.label}:`, err?.message);
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

            console.log(`✅ Added supporting document: ${img.label}`);
          } catch (err) {
            console.warn(`Failed to add supporting document ${img.label}:`, err?.message);
          }
        }
      }
    } else {
      console.log('⏭️ No valid images to add to PDF');
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

// Alias for generateRecordPDF to match import name
export const generateBomFlatPDF = generateRecordPDF;

const pdfExportService = {
  generateValuationReportHTML,
  generateRecordPDF,
  generateBomFlatPDF,
  previewValuationPDF,
  generateRecordPDFOffline,
  normalizeDataForPDF
};

export default pdfExportService;  