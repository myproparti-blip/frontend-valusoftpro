import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import exifr from 'exifr';
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaUpload,
    FaPrint,
    FaDownload,
    FaUser,
    FaFileAlt,
    FaDollarSign,
    FaCog,
    FaCompass,
    FaBuilding,
    FaImage,
    FaLocationArrow,
    FaCheckCircle,
    FaTimesCircle,
    FaSave,
    FaThumbsUp,
    FaThumbsDown,
    FaRedo
} from "react-icons/fa";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea, Label, Badge, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, RadioGroup, RadioGroupItem, ChipSelect } from "../components/ui";
import { getRajeshHouseById, updateRajeshHouse, managerSubmitRajeshHouse } from "../services/rajeshHouseService";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { useNotification } from "../context/NotificationContext";
import { uploadPropertyImages, uploadLocationImages, uploadDocuments } from "../services/imageService";
import { invalidateCache } from "../services/axios";
import { getCustomOptions } from "../services/customOptionsService";
import ClientInfoPanel from "../components/ClientInfoPanel";
import DocumentsPanel from "../components/DocumentsPanel";
import { generateBomFlatPDF } from "../services/bomFlatPdf";

const RajeshHouseEditForm = ({ user, onLogin }) => {
     const { id } = useParams();
     const navigate = useNavigate();
     const dispatch = useDispatch();
     const { isLoading: loading } = useSelector((state) => state.loader);
     const [valuation, setValuation] = useState(null);
    const isLoggedIn = !!user;
    const [bankName, setBankName] = useState("");
    const [city, setCity] = useState("");
    const [dsa, setDsa] = useState("");
    const [engineerName, setEngineerName] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [modalFeedback, setModalFeedback] = useState("");
    const [activeTab, setActiveTab] = useState("client");
    const [activeValuationSubTab, setActiveValuationSubTab] = useState("general");
    const [customFields, setCustomFields] = useState([]);
    const [customFieldName, setCustomFieldName] = useState("");
    const [customFieldValue, setCustomFieldValue] = useState("");
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const { showSuccess, showError } = useNotification();
    const [formData, setFormData] = useState({
        // BASIC INFO
        uniqueId: '',
        username: '',
        dateTime: '',
        day: '',

        // BANK & CITY
        bankName: '',
        city: '',

        // CLIENT DETAILS
        clientName: '',
        mobileNumber: '',
        address: '',

        // PAYMENT
        payment: '',
        collectedBy: '',

        // DSA
        dsa: '',
        customDsa: '',

        // ENGINEER
        engineerName: '',
        customEngineerName: '',

        // NOTES
        notes: '',

        // PROPERTY BASIC DETAILS
        elevation: '',
        // DIRECTIONS
        directions: {
            north1: '',
            east1: '',
            south1: '',
            west1: '',
            north2: '',
            east2: '',
            south2: '',
            west2: ''
        },

        // COORDINATES
        coordinates: {
            latitude: '',
            longitude: ''
        },

        // IMAGES
        propertyImages: [],
        locationImages: [],
        documentPreviews: [],
        areaImages: {},
        photos: {
            elevationImages: [],
            siteImages: []
        },

        // STATUS
        status: 'pending',
        managerFeedback: '',
        submittedByManager: false,
        lastUpdatedBy: '',
        lastUpdatedByRole: '',

        // PDF DETAILS (AUTO-EXTRACTED)
        pdfDetails: {
            // CHECKLIST OF DOCUMENTS
            checklist_Letterofintention: '',
            checklist_SiteDeedsConverance: '',
            checklist_ADU_LST: '',
            checklist_AgreementtosaleBuildingPermission: '',
            checklist_AppropriatedUsedPropertyTaxDetails: '',
            checklist_MortgageDocumentations: '',
            checklist_MarketAnalysisLandandVillageName: '',
            checklist_PlotNumberGrievanceSheet: '',
            checklist_AreasurveynumberAsignedtotheSite: '',
            checklist_BullingpermissionPhotoIdentiifcationSizeofPropertyDemarcation: '',
            checklist_FencingPropertyProprietaryProprietDemarcation: '',
            checklist_GatewayPhotographPhotoIdentifcationAreaPropertyDemarcation: '',
            checklist_MainhobbillSummeriesPropertyProprietaryPropriertor: '',
            checklist_PropertyProprietaryProprietDemarcation: '',
            checklist_LandRegisterPropertyPropertyDescription: '',
            checklist_PropertyexperienceOtherProprietary: '',
            checklist_SeparatelyenclosedPropertySeparatelyUsedAsPrivateProperty: '',
            checklist_PropertyexperiencedOrieralturedpropiedltureOrieralted: '',

            // CHARACTERISTICS OF LOCALITY
            characteristicOfLocality: '',
            classificationOfLocality: '',
            developmentSurroundingarea: '',
            developmentPossibilityFutureCommercialMarketLike: '',
            developmentFootholdMarketScopeBuilding: '',
            developmentFossilusMarcetcombinedMarketConditions: '',
            developmentLeveloflandBuilding: '',
            developmentShapeoflandi: '',
            developmentTypeofBuildingComplex: '',
            developmentUseLandConstructionlocalised: '',
            developmentLandapprovalavailableLandApprovalavailable: '',
            developmentYes: '',
            developmentBoundariesroadAvailable: '',
            developmentC2Notavailable: '',

            // PART A - MARKET VALUE DETAILS
            part_A_landarea_SqYd: '',
            part_A_rateSqYd: '',
            part_A_totalConstructionCost: '',
            part_A_detailsAlongChangingAccordingtoProperty: '',
            part_A_detailsofLandandValueofLand: '',

            // PART B - CONSTRUCTION ANALYSIS
            part_B_areaDetails_SqM: '',
            part_B_areaDetails_SqYd: '',
            part_B_measurementBasisArea_SqYd: '',
            part_B_measurementBasisHeight_SqYd: '',
            part_B_pipeNumber: '',
            part_B_surveyNumberofLand: '',
            part_B_existenceOfRoadAvailable: '',
            part_B_treeCountPropertyDetails: '',
            part_B_yearConstructionBuilding: '',
            part_B_plotShapeAndCondition: '',
            part_B_conditionOfPlot: '',
            part_B_conditionOfBuildingStructure: '',
            part_B_generalConditionInteriorExterior: '',
            part_B_existencePowerAvailable: '',
            part_B_existenceWaterAvailable: '',
            part_B_interiorExteriorPoorCondition: '',

            // LOCALITY - DETAILED
            locality_cityTownOrVillage: '',
            locality_residentialArea: '',
            locality_commercialArea: '',
            locality_classificationArea: '',
            locality_highMiddleRuralType: '',
            locality_unionSectorCommunityLocationDetails: '',
            locality_municipalCorporationCommercialLocationDetails: '',
            locality_governmentSector: '',
            locality_areaLocality_ImpactOnProperty: '',
            locality_agricultureLandAllowedPropertyCommercialUse: '',
            locality_restrictionsOnPropertyFuture: '',
            locality_interestOfPropertyScopeForBuilding: '',
            locality_scopePropertyForBuilding: '',

            // LEVEL OF BUILDING
            building_estimatedValueOfLand: '',
            building_typeOfBuildingDetails: '',
            building_typeOfConstructionDetails: '',
            building_yearOfConstructionBuilding: '',
            building_numberOfFloorAreaDetails: '',
            building_dimensionsOfBuiltArea: '',
            building_binAreaSize: '',
            building_conditionOfTheBuildingDetails: '',
            building_conditionExcellent: '',
            building_conditionGood: '',
            building_conditionNormal: '',
            building_conditionPoor: '',

            // PROPERTY SHAPE & UTILITIES
            property_wherePropertyLocated: '',
            property_propertyOccupiedBy: '',
            property_buildingFootprintDetails: '',
            property_buildingElevationDetails: '',
            property_buildingSurroundingAreaDetails: '',
            property_buildingTypeOfConstructionDetails: '',
            property_buildingNoOfFloorsDetails: '',
            property_buildingNoOfBedroomsDetails: '',
            property_distressedSalesPropertyCondition: '',
            property_shelterCondition: '',
            property_sqft: '',
            property_ratePerSqft: '',
            property_costAnalysisPerSqft: '',
            property_detailsOfValueOfProperty: '',

            // BOUNDARY & ACCESS
            boundary_boundaryConditionDetails: '',
            boundary_roadAvailableDetails: '',
            boundary_roadWidthDetails: '',
            boundary_approachableTypeOfRoad: '',
            boundary_typeOfRoadAccessible: '',
            boundary_roadAccessibilityDetails: '',

            // ENCROACHMENTS & ISSUES
            encroachment_underGroundSewerageSystemArea: '',
            encroachment_restrictionsWaterPointing: '',

            // VALUATION DETAILS
            valuation_appreciationProperty: '',
            valuation_depreciation: '',
            valuation_distressSale: '',
            valuation_interimValueProperty: '',

            // CERTIFICATE OF VALUATION
            certificate_certificateNumber: '',
            certificate_dateOfValuation: '',
            certificate_appraiserName: '',
            certificate_appraiserLicense: '',

            // PROPERTY AT A GLANCE
            propertyGlance_applicant: '',
            propertyGlance_valuationDrawValue: '',
            propertyGlance_purposeOfValuation: '',
            propertyGlance_nameOfOwner: '',
            propertyGlance_propertyAddress: '',
            propertyGlance_briefDescriptionProperty: '',

            // MARKET VALUE DETAILS
            market_totalPlotArea_SqYd: '',
            market_totalPlotArea_SqM: '',
            market_ratePerSqYd: '',
            market_ratePerSqM: '',
            market_ratePerSqft: '',
            market_rateSqm: '',
            market_totalMarketValue: '',
            market_totalMarketValueInWords: '',
            market_marketValue: '',
            market_pricePerSqft: '',
            market_marketDemand: '',
            market_investmentPotential: '',
            market_marketValuePerSqft: '',
            market_distressValuePerSqft: '',
            market_loanValuePerSqft: '',

            // LOAN DETAILS
            loan_loanAmount: '',
            loan_loanToValueRatio: '',
            loan_loanValueTotal: '',

            // SITE DESCRIPTION
            site_siteDescription: '',
            site_locationProximity: '',
            site_accessibilityDetails: '',

            // STRUCTURE & CONDITION
            structure_structureType: '',
            structure_conditionOfBuilding: '',
            structure_maintenanceStatus: '',

            // AREA MEASUREMENT
            area_carpetArea: '',
            area_builtUpArea: '',
            area_plotArea: '',
            area_totalBuiltUpArea: '',
            area_balconyArea: '',

            // AMENITIES & FACILITIES
            amenities_electricity: '',
            amenities_waterSupply: '',
            amenities_sewerage: '',
            amenities_carParking: '',

            // CONSTRUCTION DETAILS
            construction_foundationType: '',
            construction_roofType: '',
            construction_floorsInBuilding: '',
            construction_totalConstructionCost: '',
            construction_groundFloor: '',
            construction_firstFloor: '',
            construction_secondFloor: '',
            construction_thirdFloor: '',
            construction_otherFloors: '',

            // OBSERVED ISSUES & REMARKS
            issues_majorIssuesObserved: '',
            issues_minorRepairsNeeded: '',
            issues_specialRemarks: '',
            issues_specialRemarksAboutValuation: '',

            // APPRAISER OBSERVATIONS
            appraiser_observationsByAppraiser: '',
            appraiser_futureGrowthPotential: '',
            appraiser_riskFactors: '',

            // DOCUMENT UPLOAD EVIDENCE
            documents_certificateOfValuationFile: '',
            documents_propertyPhotographsFile: '',
            documents_propertyDocumentsFile: '',
            documents_otherDocumentsFile: '',

            // SPECIFICATION DETAILS
            specification_specifications: '',
            specification_additionalInformation: '',
            specification_notesAndComments: '',

            // STATUS & DATES
            status_valuationStatus: '',
            status_valuationApprovedDate: '',
            status_valuationRejectedDate: '',
            status_valuationRevisedDate: '',
            status_dateOfValuationReport: '',
            status_placeOfValuation: '',

            // CONSTRUCTION COST ANALYSIS
            costAnalysis_areaSecurityQuantum: '',
            costAnalysis_lossPlotArea: '',
            costAnalysis_lossStoreRoom: '',
            costAnalysis_lossDoubleQuantum: '',
            costAnalysis_lossgranary: '',
            costAnalysis_lossquartersquare: '',
            costAnalysis_lossGTRoomArea: '',
            costAnalysis_lossWall: '',
            costAnalysis_lossOffice1: '',
            costAnalysis_lossWallRoom: '',
            costAnalysis_lossOffice2: '',
            costAnalysis_lossShelteredArea: '',
            costAnalysis_lossShed3UKold: '',
            costAnalysis_lossShed3UKold2: '',
            costAnalysis_lossShed3UKold3: '',
            costAnalysis_totalarea_sqft: '',
            costAnalysis_totalamountin_Rs: '',
            costAnalysis_sqYdrate: '',
            costAnalysis_ratedetailsChange_sqft: '',

            // CONSTRUCTION COST VALUES
            constructionValues_rateValue_SQM: '',
            constructionValues_estimatedValues_sqft: '',
            constructionValues_areaSqft: '',
            constructionValues_areaSqM: '',
            constructionValues_estimatedValueSqYd: '',

            // FINAL VALUATION SUMMARY
            finalValuation_estimatedValueOfBuild: '',
            finalValuation_estimatedValueOfBuilding: '',
            finalValuation_totalValueOfProperty: '',
            finalValuation_totalValueInWords: '',
            finalValuation_distressValue: '',
            finalValuation_loanValue: '',

            // APPRAISER & CERTIFICATION
            appraisal_appraiserSignature: '',
            appraisal_appraiserStampDate: '',
            appraisal_dateOfValuationReport: '',
            appraisal_placeOfValuation: '',

            // PROPERTY ANALYSIS & VALUES
            analysisProperty_propertyUseDetails: '',
            analysisProperty_approvedUseByIndustrialArea: '',
            analysisProperty_approvedUseByMunicipalCorporation: '',
            analysisProperty_approvedUseByMunicipalBody: '',
            analysisProperty_approvedUseByRailway: '',
            analysisProperty_approvedUseByAirport: '',

            // LOCATION & IDENTIFICATION
            location_laneNumber: '',
            location_latitude: '',
            location_longitude: '',
            location_areaName: '',
            location_landmarkOrProximity: '',
            location_plotOrBlockNumber: '',
            location_surveyNumber: '',
            location_villageOrTown: '',
            location_district: '',
            location_state: '',
            location_postalCode: '',

            // VALUATION CHECKLIST (Yes/No Matrix)
            checklist_propertyConstructedOnAgricultureLand: '',
            checklist_wouldAccessProperLy: '',
            checklist_surroundingAreaSurvivalingBuilding: '',
            checklist_noWithinTwoHundredMters: '',
            checklist_availablewithinSiteLimitMark: '',
            checklist_levelledProperty: '',
            checklist_irregularShapeProperty: '',
            checklist_useLandConstructionlocalized: '',
            checklist_landApprovalAvailableFromConcernedAuthority: '',
            checklist_approvalAvailable: '',
            checklist_anyBoundariesRoadAvailable: '',
            checklist_c2NotAvailableOnSite: '',
            checklist_yesUndergroundSewerageSystem: '',
            checklist_restrictionsWaterConnectPublicSewerageSystem: '',
            checklist_lockGateInPropertyOrAnyRestriction: '',
            checklist_waterProvenSewerage: '',
            checklist_undergroundSewageSystem: '',

            // PART C - VALUATION
            partC_valuationOfBuilding: '',
            partC_federalDetailsOfBuildingConstruction: '',
            partC_typeOfBuildingConstruction: '',
            partC_constructionLocalBuilding: '',
            partC_yearOfConstructionBuilding: '',
            partC_numberOfFloorsAreaProperty: '',
            partC_briefAreaUsageOfEachFloor: '',
            partC_planAreaOfEachFloor: '',
            partC_conditionOfTheBuildingValueCondition: '',
            partC_existenceOfElectricalPower: '',
            partC_existenceOfWaterSupply: '',
            partC_existenceOfSewerageSystem: '',
            partC_interiorExteriorPoorCondition: '',

            // DEPRECIATION & VALUATION FACTORS
            depreciation_physicalDepreciation: '',
            depreciation_functionalDepreciation: '',
            depreciation_externalDepreciation: '',
            depreciation_totalDepreciation: '',
            depreciation_percentageDepreciation: '',

            // DISTRESS & LOAN VALUES
            value_marketValue: '',
            value_distressValue: '',
            value_loanValue: '',
            value_marketValueInWords: '',
            value_distressValueInWords: '',
            value_loanValueInWords: '',

            // REMARKS & OBSERVATIONS
            remarks_generalRemarks: '',
            remarks_aboutProperty: '',
            remarks_approvedUseOfProperty: '',
            remarks_datingFutureEnhancement: '',
            remarks_futureGrowthPotential: '',
            remarks_riskFactors: '',
            remarks_specialNotesAndObservations: '',

            // DOCUMENT VALIDATION & CERTIFICATION
            validation_dateOfInspection: '',
            validation_dateOfDocumentedValidation: '',
            validation_certificateOfValuationFile: '',
            validation_validationApprovedDate: '',
            validation_validationRejectedDate: '',

            // BANK & INSURANCE MANDATE
            mandate_bankName: '',
            mandate_bankGuidelinesForValuation: '',
            mandate_insuranceValuationMandates: '',
            mandate_valuationPurpose: '',

            // QR CODE & DIGITAL SIGNATURE
            digital_qrCodeGenerated: '',
            digital_qrCodeLink: '',
            digital_appraiserDigitalSignature: '',
            digital_reportVersion: '',

            // VALUATION REPORT HEADER
            report_comfinancePrice: '',
            report_dateOfInspection: '',
            report_dateOfDocumentProducedSal: '',
            report_seedNo: '',
            report_seedNo_2: '',

            // FINANCIAL ASSISTANCE
            financial_confirmFinancePrice: '',
            financial_totalCost: '',

            // AREA ANALYSIS
            area_analysis_squareArea: '',
            area_analysis_ratePerSqft: '',
            area_analysis_totalRate: '',

            // RATE AND DEPRECIATION
            rate_oldPrice: '',
            rate_depreciation: '',
            rate_ageOfBuilding: '',

            // METHOD APPLIED
            method_pricingModel: '',
            method_comparisonMethod: '',
            method_costMethod: '',

            // LANDMARK & UTILITIES
            landmark_landmarkOrProximity: '',
            landmark_approachableRoad: '',
            landmark_roadsideAvailability: '',

            // CONSTRUCTION DETAILS PART B
            constructionPartB_glassDetails: '',
            constructionPartB_northSouth: '',
            constructionPartB_eastWest: '',
            constructionPartB_totalLengthAndBreadth: '',
            constructionPartB_estimatedAreaOfPlot: '',

            // GUARDIANS VALUATION SECTION
            guardians_toBank: '',
            guardians_stateBank: '',
            guardians_AmunicipialCorporation: '',
            guardians_dateIncertioninValuation: '',
            guardians_coverageDocumentation: '',

            // VALUATION REPORT DETAILS
            valuationReport_confirmFinancePrice: '',
            valuationReport_dateOfInspection: '',
            valuationReport_dateOfDocumentProducedSal: '',
            valuationReport_seedNo: '',
            valuationReport_seedNo_2: '',

            // CONSTRUCTION COST EXTENDED
            constructionCost_ratePerSqft: '',
            constructionCost_areaInSqft: '',
            constructionCost_totalConstructionCost: '',

            // PLOT DETAILS
            plot_sqftArea: '',
            plot_roadAccess: '',
            plot_boundaries: '',
            plot_utilities: '',

            // VALUATION ANALYSIS
            valuationAnalysis_methodApplied: '',
            valuationAnalysis_costApproach: '',
            valuationAnalysis_comparisonApproach: '',
            valuationAnalysis_incomeApproach: '',

            // DEPRECIATION DETAILS
            depreciationDetails_physicalDeteriorationPercentage: '',
            depreciationDetails_functionalObsolescence: '',
            depreciationDetails_externalFactors: '',
            depreciationDetails_totalDepreciationPercentage: '',

            // FINAL VALUES
            finalValue_marketValue: '',
            finalValue_distressValue: '',
            finalValue_loanValue: '',
            finalValue_marketValueInWords: '',
            finalValue_distressValueInWords: '',
            finalValue_loanValueInWords: '',

            // CERTIFICATION & VALIDATION
            certification_appraiserName: '',
            certification_appraiserLicense: '',
            certification_dateOfValuation: '',
            certification_placeOfValuation: '',
            certification_appraiserSignature: '',
            certification_stampDate: '',

            // ADDITIONAL IDENTIFICATION
            identification_plotNumber: '',
            identification_surveyNumber: '',
            identification_villageOrTown: '',
            identification_district: '',
            identification_state: '',
            identification_postalCode: '',

            // BUILDING CHARACTERISTICS
            buildingChar_typeOfBuilding: '',
            buildingChar_yearOfConstruction: '',
            buildingChar_numberOfFloors: '',
            buildingChar_numberOfRooms: '',
            buildingChar_conditionOfBuilding: '',
        },

        // CUSTOM FIELDS FOR DROPDOWN HANDLING
        customBankName: '',
        customCity: '',
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [locationImagePreviews, setLocationImagePreviews] = useState([]);

    const defaultBanks = ["SBI", "HDFC", "ICICI", "Axis", "PNB", "BOB"];
    const defaultCities = ["Surat", "vadodara", "Ahmedabad", "Kheda"];
    const defaultDsaNames = ["Bhayva Shah", "Shailesh Shah", "Vijay Shah"];
    const defaultEngineers = ["Bhavesh", "Bhanu", "Ronak", "Mukesh"];

    const [banks, setBanks] = useState(defaultBanks);
    const [cities, setCities] = useState(defaultCities);
    const [dsaNames, setDsaNames] = useState(defaultDsaNames);
    const [engineerNames, setEngineerNames] = useState(defaultEngineers);
    const [customOptions, setCustomOptions] = useState({
        dsa: [],
        engineerName: [],
        bankName: [],
        city: []
    });

    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);
    const fileInputRef3 = useRef(null);
    const fileInputRef4 = useRef(null);
    const locationFileInputRef = useRef(null);
    const documentFileInputRef = useRef(null);
    const dropdownFetchedRef = useRef(false);

    const username = user?.username || "";
    const role = user?.role || "";
    const clientId = user?.clientId || "";

    const handleDownloadPDF = async () => {
        try {
            dispatch(showLoader());
            // ALWAYS fetch fresh data from DB - do not use local state which may be stale
            let dataToDownload;

            try {
                dataToDownload = await getRajeshHouseById(id, username, role, clientId);
                ('✅ Fresh Rajesh House data fetched for PDF:', {
                    bankName: dataToDownload?.bankName,
                    city: dataToDownload?.city
                });
            } catch (fetchError) {
                console.error('❌ Failed to fetch fresh Rajesh House data:', fetchError);
                // Use in-memory valuation data if available
                dataToDownload = valuation;
                if (!dataToDownload || !dataToDownload.uniqueId) {
                    console.warn('Rajesh House form not found in DB and no local data available');
                    showError('Form data not found. Please save the form first before downloading.');
                    dispatch(hideLoader());
                    return;
                } else {
                    ('⚠️ Using unsaved form data from memory for PDF generation');
                }
            }

            await generateBomFlatPDF(dataToDownload);
            showSuccess('PDF downloaded successfully');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showError('Failed to download PDF');
        } finally {
            dispatch(hideLoader());
        }
    };

    useEffect(() => {
        if (id) loadValuation();
    }, [id]);

    // Helper function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Fetch dropdown data from API (non-blocking with defaults already set)
    useLayoutEffect(() => {
        if (dropdownFetchedRef.current) return;
        dropdownFetchedRef.current = true;

        const fetchDropdownData = async () => {
            try {
                const [banksData, citiesData, dsaData, engineerData] = await Promise.all([
                    getCustomOptions('banks'),
                    getCustomOptions('cities'),
                    getCustomOptions('dsas'),
                    getCustomOptions('engineers')
                ]);

                // Only update if API returns non-empty data
                if (Array.isArray(banksData) && banksData.length > 0) {
                    setBanks(banksData);
                }
                if (Array.isArray(citiesData) && citiesData.length > 0) {
                    setCities(citiesData);
                }
                if (Array.isArray(dsaData) && dsaData.length > 0) {
                    setDsaNames(dsaData);
                }
                if (Array.isArray(engineerData) && engineerData.length > 0) {
                    setEngineerNames(engineerData);
                }
            } catch (error) {
                console.warn('Could not fetch dropdown options from API, using defaults:', error.message);
                // Defaults are already set, no action needed
            }
        };

        // Try to fetch API data, but don't block the UI
        fetchDropdownData();
    }, []);

    // Sync bankName, city, dsa, engineerName values back to formData whenever they change
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            bankName: bankName,
            city: city,
            dsa: dsa,
            engineerName: engineerName
        }));
    }, [bankName, city, dsa, engineerName]);

    const loadValuation = async () => {
        const savedData = localStorage.getItem(`valuation_draft_${username}`);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.uniqueId === id) {
                setValuation(parsedData);
                mapDataToForm(parsedData);
                return;
            }
        }

        try {
            // Pass user info for authentication
            const dbData = await getRajeshHouseById(id, username, role, clientId);
            setValuation(dbData);
            mapDataToForm(dbData);

            // Restore property image previews from database
            if (dbData.propertyImages && Array.isArray(dbData.propertyImages)) {
                const propertyPreviews = dbData.propertyImages
                    .filter(img => img && typeof img === 'object')
                    .map((img, idx) => {
                        let previewUrl = '';
                        if (img.url) {
                            previewUrl = img.url;
                        } else if (img.path) {
                            const fileName = img.path.split('\\').pop() || img.path.split('/').pop();
                            previewUrl = `/api/uploads/${fileName}`;
                        } else if (img.fileName) {
                            previewUrl = `/api/uploads/${img.fileName}`;
                        }
                        return { url: previewUrl, name: img.name || `Property Image ${idx + 1}`, path: img.path || img.fileName || '' };
                    });
                setImagePreviews(propertyPreviews);
            }

            // Restore location image previews from database
            if (dbData.locationImages && Array.isArray(dbData.locationImages)) {
                const locationPreviews = dbData.locationImages
                    .filter(img => img && typeof img === 'object')
                    .map((img, idx) => {
                        let previewUrl = '';
                        if (img.url) {
                            previewUrl = img.url;
                        } else if (img.path) {
                            const fileName = img.path.split('\\').pop() || img.path.split('/').pop();
                            previewUrl = `/api/uploads/${fileName}`;
                        } else if (img.fileName) {
                            previewUrl = `/api/uploads/${img.fileName}`;
                        }
                        return { url: previewUrl, name: img.name || `Location Image ${idx + 1}`, path: img.path || img.fileName || '' };
                    });
                setLocationImagePreviews(locationPreviews);
            }

            // Restore document previews from database
            if (dbData.documentPreviews && Array.isArray(dbData.documentPreviews)) {
                setFormData(prev => ({
                    ...prev,
                    documentPreviews: dbData.documentPreviews
                }));
            }

            // Restore area images from database
            if (dbData.areaImages && typeof dbData.areaImages === 'object' && Object.keys(dbData.areaImages).length > 0) {
                setFormData(prev => ({
                    ...prev,
                    areaImages: dbData.areaImages
                }));
            }

            setBankName(dbData.bankName || "");
            setCity(dbData.city || "");
            setDsa(dbData.dsa || "");
            setEngineerName(dbData.engineerName || "");
        } catch (error) {
            console.error("Error loading valuation:", error);
            // If form not found, show message but allow user to create new form
            if (error.message && error.message.includes("not found")) {
                showError("Rajesh House form not found. Creating new form...");
                // Initialize with empty form
                const newFormData = {
                    ...formData,
                    uniqueId: id,
                    username: username,
                    clientId: clientId
                };
                setValuation(newFormData);
                mapDataToForm(newFormData);
            }
        }
    };

    const mapDataToForm = (data) => {
        // Always store the actual values in state first, regardless of whether they're in the dropdown lists
        setBankName(data.bankName || "");
        setCity(data.city || "");
        setDsa(data.dsa || "");
        setEngineerName(data.engineerName || "");

        // Load custom fields from data
        if (data.customFields && Array.isArray(data.customFields)) {
            setCustomFields(data.customFields);
        }

        setFormData(prev => ({
            ...prev,
            ...data,
            pdfDetails: data.pdfDetails ? { ...prev.pdfDetails, ...data.pdfDetails } : prev.pdfDetails
        }));
    };

    const canEdit = isLoggedIn && (
        (role === "admin") ||
        (role === "manager" && (valuation?.status === "pending" || valuation?.status === "rejected" || valuation?.status === "on-progress" || valuation?.status === "rework")) ||
        ((role === "user") && (valuation?.status === "rejected" || valuation?.status === "pending" || valuation?.status === "rework"))
    );

    const canEditField = (fieldName) => {
        // Allow editing if status allows it
        return canEdit;
    };

    const canApprove = isLoggedIn && (role === "manager" || role === "admin") &&
        (valuation?.status === "pending" || valuation?.status === "on-progress" || valuation?.status === "rejected" || valuation?.status === "rework");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleIntegerInputChange = (e, callback) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (callback) callback(value);
    };

    const handleLettersOnlyInputChange = (e, callback) => {
        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        if (callback) callback(value);
    };

    // Handle Add Custom Field
    const handleAddCustomField = () => {
        const name = customFieldName.trim();
        const value = customFieldValue.trim();

        // Validation: Check if both fields are filled
        if (!name || !value) {
            showError("Field Name and Field Value cannot be empty");
            return;
        }

        // Validation: Check for duplicate field names (case-insensitive)
        const duplicateExists = customFields.some(
            field => field.name.toLowerCase() === name.toLowerCase()
        );

        if (duplicateExists) {
            showError(`Field name "${name}" already exists. Please use a different name.`);
            return;
        }

        // Add the field
        setCustomFields([...customFields, { name, value }]);
        setCustomFieldName("");
        setCustomFieldValue("");
        showSuccess("Field added successfully");
    };

    // Handle Remove Custom Field
    const handleRemoveCustomField = (index) => {
        const fieldName = customFields[index]?.name;
        const updatedFields = customFields.filter((_, i) => i !== index);
        setCustomFields(updatedFields);
        showSuccess(`Field "${fieldName}" removed successfully`);
    };

    const handleSave = async () => {
        try {
            dispatch(showLoader());
            await updateRajeshHouse(id, formData, user.username, user.role, user.clientId);
            invalidateCache();
            dispatch(hideLoader());
            showSuccess('Rajesh House form saved successfully');
        } catch (error) {
            console.error("Error saving Rajesh House form:", error);
            dispatch(hideLoader());
            showError('Failed to save Rajesh House form');
        }
    };

    const handleValuationChange = (field, value) => {
        setFormData(prev => {
            const newPdfDetails = {
                ...prev.pdfDetails,
                [field]: value
            };

            // Auto-calculate Estimated Value = Qty × Rate for all 10 items
            const items = [
                { qtyField: 'presentValueQty', rateField: 'presentValueRate', valueField: 'presentValue' },
                { qtyField: 'wardrobesQty', rateField: 'wardrobesRate', valueField: 'wardrobes' },
                { qtyField: 'showcasesQty', rateField: 'showcasesRate', valueField: 'showcases' },
                { qtyField: 'kitchenArrangementsQty', rateField: 'kitchenArrangementsRate', valueField: 'kitchenArrangements' },
                { qtyField: 'superfineFinishQty', rateField: 'superfineFinishRate', valueField: 'superfineFinish' },
                { qtyField: 'interiorDecorationsQty', rateField: 'interiorDecorationsRate', valueField: 'interiorDecorations' },
                { qtyField: 'electricityDepositsQty', rateField: 'electricityDepositsRate', valueField: 'electricityDeposits' },
                { qtyField: 'collapsibleGatesQty', rateField: 'collapsibleGatesRate', valueField: 'collapsibleGates' },
                { qtyField: 'potentialValueQty', rateField: 'potentialValueRate', valueField: 'potentialValue' },
                { qtyField: 'otherItemsQty', rateField: 'otherItemsRate', valueField: 'otherItems' }
            ];

            // Check if the changed field is a qty or rate field and auto-calculate
            items.forEach(item => {
                if (field === item.qtyField || field === item.rateField) {
                    const qty = parseFloat(newPdfDetails[item.qtyField]) || 0;
                    const rate = parseFloat(newPdfDetails[item.rateField]) || 0;
                    const estimatedValue = qty * rate;
                    newPdfDetails[item.valueField] = estimatedValue > 0 ? estimatedValue.toString() : '';
                }
            });

            // Auto-populate Value of Flat section based on ROUND FIGURE value
            const isQtyOrRateField = items.some(item => field === item.qtyField || field === item.rateField);
            if (isQtyOrRateField) {
                const totalValuation = items.reduce((sum, item) => {
                    const value = parseFloat(newPdfDetails[item.valueField]) || 0;
                    return sum + value;
                }, 0);

                // Round to nearest 1000
                const roundFigureTotal = Math.round(totalValuation / 1000) * 1000;

                // Auto-populate the 4 calculated fields based on ROUND FIGURE
                newPdfDetails.fairMarketValue = roundFigureTotal > 0 ? roundFigureTotal.toString() : '';
                newPdfDetails.realizableValue = roundFigureTotal > 0 ? (roundFigureTotal * 0.9).toString() : '';
                newPdfDetails.distressValue = roundFigureTotal > 0 ? (roundFigureTotal * 0.8).toString() : '';
                newPdfDetails.insurableValue = roundFigureTotal > 0 ? (roundFigureTotal * 0.35).toString() : '';
            }

            return {
                ...prev,
                pdfDetails: newPdfDetails
            };
        });
    };

    const handleLocationImageUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;

        for (let file of files) {
            try {
                const base64 = await fileToBase64(file);
                setLocationImagePreviews(prev => [
                    ...prev,
                    { preview: base64, name: file.name, file: file }
                ]);
            } catch (error) {
                console.error('Error converting file to base64:', error);
                showError('Failed to upload image');
            }
        }
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;

        for (let file of files) {
            try {
                const base64 = await fileToBase64(file);
                setImagePreviews(prev => [
                    ...prev,
                    { preview: base64, name: file.name, file: file }
                ]);
            } catch (error) {
                console.error('Error converting file to base64:', error);
                showError('Failed to upload image');
            }
        }
    };

    const removeLocationImage = (index) => {
        setLocationImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDocumentUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;

        // Add local previews immediately
        const filesToAdd = Array.from(files).map((file) => {
            const preview = URL.createObjectURL(file);
            return { file, preview, fileName: file.name, size: file.size, isImage: true };
        });

        // Display local previews
        const localPreviews = filesToAdd.map(f => ({
            preview: f.preview,
            file: f.file,
            fileName: f.fileName,
            size: f.size
        }));

        setFormData(prev => ({
            ...prev,
            documentPreviews: [
                ...(prev.documentPreviews || []),
                ...localPreviews
            ]
        }));

        try {
            // Upload images using same service as Property Images with compression
            const uploadPromises = filesToAdd.map(f => ({ file: f.file, inputNumber: 1 }));
            const uploadedImages = await uploadPropertyImages(uploadPromises, valuation.uniqueId);

            // Update with actual uploaded URLs (replace local previews)
            setFormData(prev => {
                const newPreviews = [...(prev.documentPreviews || [])];
                let uploadIndex = 0;

                // Update the last N items (where N = uploadedImages.length) with actual URLs
                for (let i = newPreviews.length - uploadPromises.length; i < newPreviews.length && uploadIndex < uploadedImages.length; i++) {
                    if (uploadedImages[uploadIndex]) {
                        newPreviews[i] = {
                            fileName: newPreviews[i].fileName,
                            size: newPreviews[i].size,
                            url: uploadedImages[uploadIndex].url
                        };
                        uploadIndex++;
                    }
                }

                return {
                    ...prev,
                    documentPreviews: newPreviews
                };
            });
        } catch (error) {
            console.error('Error uploading supporting images:', error);
            showError('Failed to upload images: ' + error.message);

            // Remove the local previews on error
            setFormData(prev => ({
                ...prev,
                documentPreviews: (prev.documentPreviews || []).slice(0, -filesToAdd.length)
            }));
        }

        // Reset input
        if (documentFileInputRef.current) {
            documentFileInputRef.current.value = '';
        }
    };

    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documentPreviews: (prev.documentPreviews || []).filter((_, i) => i !== index)
        }));
    };

    const handleCoordinateChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            coordinates: {
                ...prev.coordinates,
                [field]: value
            }
        }));
    };

    const handleDirectionChange = (direction, value) => {
        setFormData(prev => ({
            ...prev,
            directions: {
                ...prev.directions,
                [direction]: value
            }
        }));
    };

    const validateForm = () => {
        const errors = [];

        // === CLIENT INFORMATION ===
        if (!formData.clientName || !formData.clientName.trim()) {
            errors.push("Client Name is required");
        }

        if (!formData.mobileNumber || !formData.mobileNumber.trim()) {
            errors.push("Mobile Number is required");
        } else {
            // Mobile number validation - exactly 10 digits
            const mobileDigits = formData.mobileNumber.replace(/\D/g, '');
            if (mobileDigits.length !== 10) {
                errors.push("Mobile Number must be 10 digits");
            }
        }

        if (!formData.address || !formData.address.trim()) {
            errors.push("Address is required");
        }

        // === BANK & CITY ===
        const finalBankName = bankName === "other" ? formData.customBankName : bankName;
        if (!finalBankName || !finalBankName.trim()) {
            errors.push("Bank Name is required");
        }

        const finalCity = city === "other" ? formData.customCity : city;
        if (!finalCity || !finalCity.trim()) {
            errors.push("City is required");
        }

        // === MARKET APPLICATIONS / DSA (Sales Agent) ===
        const finalDsa = formData.dsa === "other" ? formData.customDsa : formData.dsa;
        if (!finalDsa || !finalDsa.trim()) {
            errors.push("Market Applications / DSA (Sales Agent) is required");
        }

        // === ENGINEER NAME ===
        const finalEngineerName = formData.engineerName === "other" ? formData.customEngineerName : formData.engineerName;
        if (!finalEngineerName || !finalEngineerName.trim()) {
            errors.push("Engineer Name is required");
        }

        // === PAYMENT INFORMATION ===
        if (formData.payment === "yes" && (!formData.collectedBy || !formData.collectedBy.trim())) {
            errors.push("Collected By name is required when payment is collected");
        }

        // === GPS COORDINATES VALIDATION ===
        if (formData.coordinates.latitude || formData.coordinates.longitude) {
            if (formData.coordinates.latitude) {
                const lat = parseFloat(formData.coordinates.latitude);
                if (isNaN(lat) || lat < -90 || lat > 90) {
                    errors.push("Latitude must be a valid number between -90 and 90");
                }
            }

            if (formData.coordinates.longitude) {
                const lng = parseFloat(formData.coordinates.longitude);
                if (isNaN(lng) || lng < -180 || lng > 180) {
                    errors.push("Longitude must be a valid number between -180 and 180");
                }
            }
        }



        return errors;
    };

    const validatePdfDetails = () => {
        const errors = [];
        return errors;
    };

    const handleManagerAction = (action) => {
        setModalAction(action);
        setModalFeedback("");
        setModalOpen(true);
    };

    const handleModalOk = async () => {
        let statusValue, actionLabel;

        if (modalAction === "approve") {
            statusValue = "approved";
            actionLabel = "Approve";
        } else if (modalAction === "reject") {
            statusValue = "rejected";
            actionLabel = "Reject";
        } else if (modalAction === "rework") {
            statusValue = "rework";
            actionLabel = "Request Rework";
        }

        try {
            dispatch(showLoader(`${actionLabel}ing form...`));

            const responseData = await managerSubmitRajeshHouse(id, statusValue, modalFeedback, user.username, user.role);

            invalidateCache("/rajesh-house");

            // Update the form state with response data from backend
            setValuation(responseData);

            showSuccess(`Rajesh House form ${statusValue} successfully!`);
            dispatch(hideLoader());
            setModalOpen(false);

            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 300);
        } catch (err) {
            showError(err.message || `Failed to ${actionLabel.toLowerCase()} form`);
            dispatch(hideLoader());
        }
    };

    const onFinish = async (e) => {
        e.preventDefault();

        const isUserUpdate = role === "user" && (valuation.status === "pending" || valuation.status === "rejected" || valuation.status === "rework");
        const isManagerUpdate = role === "manager" && (valuation.status === "pending" || valuation.status === "rejected" || valuation.status === "on-progress" || valuation.status === "rework");
        const isAdminUpdate = role === "admin";

        if (!isUserUpdate && !isManagerUpdate && !isAdminUpdate) {
            showError("You don't have permission to update this form");
            return;
        }

        // Validate form
        const validationErrors = validateForm();
        const pdfDetailsErrors = validatePdfDetails();
        const allErrors = [...validationErrors, ...pdfDetailsErrors];
        if (allErrors.length > 0) {
            // Show single consolidated error instead of multiple notifications
            showError(` ${allErrors.join(", ")}`);
            return;
        }

        try {
            dispatch(showLoader("Saving..."));

            const payload = {
                clientId: clientId,
                uniqueId: formData.uniqueId || id,
                username: formData.username || username,
                dateTime: formData.dateTime,
                day: formData.day,
                bankName: bankName || "",
                city: city || "",
                clientName: formData.clientName,
                mobileNumber: formData.mobileNumber,
                address: formData.address,
                payment: formData.payment,
                collectedBy: formData.collectedBy,
                dsa: dsa || "",
                engineerName: formData.engineerName || "",
                notes: formData.notes,
                elevation: formData.elevation,
                directions: formData.directions,
                coordinates: formData.coordinates,
                propertyImages: formData.propertyImages || [],
                locationImages: formData.locationImages || [],
                documentPreviews: (formData.documentPreviews || []).map(doc => ({
                    fileName: doc.fileName,
                    size: doc.size,
                    ...(doc.url && { url: doc.url })
                })),
                photos: formData.photos || { elevationImages: [], siteImages: [] },
                status: "on-progress",
                pdfDetails: formData.pdfDetails,
                customFields: customFields,
                managerFeedback: formData.managerFeedback || "",
                submittedByManager: formData.submittedByManager || false,
                lastUpdatedBy: username,
                lastUpdatedByRole: role
            };

            // Handle image uploads - parallel (including supporting images)
            const [uploadedPropertyImages, uploadedLocationImages, uploadedSupportingImages] = await Promise.all([
                (async () => {
                    const newPropertyImages = imagePreviews.filter(p => p && p.file);
                    if (newPropertyImages.length > 0) {
                        return await uploadPropertyImages(newPropertyImages, valuation.uniqueId);
                    }
                    return [];
                })(),
                (async () => {
                    const newLocationImages = locationImagePreviews.filter(p => p && p.file);
                    if (newLocationImages.length > 0) {
                        return await uploadLocationImages(newLocationImages, valuation.uniqueId);
                    }
                    return [];
                })(),
                (async () => {
                    // Handle supporting images (documents) - upload any with file objects
                    const newSupportingImages = (formData.documentPreviews || []).filter(d => d && d.file);
                    if (newSupportingImages.length > 0) {
                        return await uploadPropertyImages(newSupportingImages, valuation.uniqueId);
                    }
                    return [];
                })()
            ]);

            // Combine previously saved images with newly uploaded URLs
            const previousPropertyImages = imagePreviews
                .filter(p => p && !p.file && p.preview)
                .map((preview, idx) => ({
                    url: preview.preview,
                    index: idx
                }));

            // For location images: if new image uploaded, use only the new one; otherwise use previous
            const previousLocationImages = (uploadedLocationImages.length === 0)
                ? locationImagePreviews
                    .filter(p => p && !p.file && p.preview)
                    .map((preview, idx) => ({
                        url: preview.preview,
                        index: idx
                    }))
                : [];

            // Combine supporting images with previously saved ones
            const previousSupportingImages = (formData.documentPreviews || [])
                .filter(d => d && !d.file && d.url)
                .map(d => ({
                    fileName: d.fileName,
                    size: d.size,
                    url: d.url
                }));

            payload.propertyImages = [...previousPropertyImages, ...uploadedPropertyImages];
            payload.locationImages = uploadedLocationImages.length > 0 ? uploadedLocationImages : previousLocationImages;
            payload.documentPreviews = [...previousSupportingImages, ...uploadedSupportingImages.map(img => ({
                fileName: img.originalFileName || img.publicId || 'Image',
                size: img.bytes || img.size || 0,
                url: img.url
            }))];

            // Clear draft before API call
            localStorage.removeItem(`valuation_draft_${username}`);

            // Call API to update Rajesh House form
            ("[rajeshHouse.jsx] Payload being sent to API:", {
                clientId: payload.clientId,
                uniqueId: payload.uniqueId,
                bankName: payload.bankName,
                city: payload.city,
                pdfDetailsKeys: Object.keys(payload.pdfDetails || {}).length,
                pdfDetailsSample: payload.pdfDetails ? {
                    purposeOfValuation: payload.pdfDetails.purposeOfValuation,
                    plotSurveyNo: payload.pdfDetails.plotSurveyNo,
                    fairMarketValue: payload.pdfDetails.fairMarketValue
                } : null
            });
            const apiResponse = await updateRajeshHouse(id, payload, username, role, clientId);
            invalidateCache("/rajesh-house");

            // Get the actual status from API response (server updates to on-progress on save)
            const newStatus = apiResponse?.status || "on-progress";

            // Update local state with API response
            const updatedValuation = {
                ...valuation,
                ...(apiResponse || {}),
                ...payload,
                status: newStatus, // Use server-confirmed status
                lastUpdatedBy: apiResponse?.lastUpdatedBy || username,
                lastUpdatedByRole: apiResponse?.lastUpdatedByRole || role,
                lastUpdatedAt: apiResponse?.lastUpdatedAt || new Date().toISOString()
            };

            setValuation(updatedValuation);
            // Set bank and city states based on whether they're in default lists
            const bankState = banks.includes(payload.bankName) ? payload.bankName : "other";
            const cityState = cities.includes(payload.city) ? payload.city : "other";
            setBankName(bankState);
            setCity(cityState);
            // Update formData with trimmed custom values
            setFormData(prev => ({
                ...prev,
                ...payload,
                customBankName: bankState === "other" ? payload.bankName : "",
                customCity: cityState === "other" ? payload.city : "",
                customDsa: formData.dsa === "other" ? (payload.dsa || "").trim() : "",
                customEngineerName: formData.engineerName === "other" ? (payload.engineerName || "").trim() : ""
            }));

            showSuccess("Form saved successfully!");
            dispatch(hideLoader());
            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 300);
        } catch (err) {
            const errorMessage = err.message || "Failed to update form";
            showError(errorMessage);
            dispatch(hideLoader());
            }
    };

    const renderGeneralTab = () => (
        <div className="space-y-6">
            <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Purpose of Valuation</h4>
                <div className="space-y-3">
                    <div className="max-w-6xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Purpose of Valuation</Label>
                                <Input
                                    placeholder="e.g., Mortgage/Loan Purpose"
                                    value={formData.pdfDetails?.propertyGlance_purposeOfValuation || ""}
                                    onChange={(e) => handleValuationChange('propertyGlance_purposeOfValuation', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Date of Inspection</Label>
                                <Input
                                    type="date"
                                    value={formData.pdfDetails?.validation_dateOfInspection || ""}
                                    onChange={(e) => handleValuationChange('validation_dateOfInspection', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OWNER & BRIEF DESCRIPTION */}
            <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="font-bold text-gray-900 mb-4">Owner Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Name of the owner</Label>
                        <Input
                            placeholder="Enter owner name"
                            value={formData.pdfDetails?.propertyGlance_nameOfOwner || ""}
                            onChange={(e) => handleValuationChange('propertyGlance_nameOfOwner', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Brief Description of the Property</Label>
                        <Input
                            placeholder="Enter brief description"
                            value={formData.pdfDetails?.propertyGlance_briefDescriptionProperty || ""}
                            onChange={(e) => handleValuationChange('propertyGlance_briefDescriptionProperty', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Property Address</Label>
                        <Input
                            placeholder="Enter full address"
                            value={formData.pdfDetails?.propertyGlance_propertyAddress || ""}
                            onChange={(e) => handleValuationChange('propertyGlance_propertyAddress', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* LOCATION DETAILS */}
            <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                <h4 className="font-bold text-gray-900 mb-4">Location Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Survey Number</Label>
                        <Input
                            placeholder="e.g., S. No. 26"
                            value={formData.pdfDetails?.location_surveyNumber || ""}
                            onChange={(e) => handleValuationChange('location_surveyNumber', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Village / Town</Label>
                        <Input
                            placeholder="e.g., Yasai"
                            value={formData.pdfDetails?.location_villageOrTown || ""}
                            onChange={(e) => handleValuationChange('location_villageOrTown', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">District</Label>
                        <Input
                            placeholder="e.g., District"
                            value={formData.pdfDetails?.location_district || ""}
                            onChange={(e) => handleValuationChange('location_district', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">State</Label>
                        <Input
                            placeholder="e.g., State"
                            value={formData.pdfDetails?.location_state || ""}
                            onChange={(e) => handleValuationChange('location_state', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Postal Code</Label>
                        <Input
                            placeholder="e.g., 400703"
                            value={formData.pdfDetails?.location_postalCode || ""}
                            onChange={(e) => handleValuationChange('location_postalCode', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Latitude</Label>
                        <Input
                            placeholder="e.g., 19.0760"
                            value={formData.pdfDetails?.location_latitude || ""}
                            onChange={(e) => handleValuationChange('location_latitude', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Longitude</Label>
                        <Input
                            placeholder="e.g., 73.0037"
                            value={formData.pdfDetails?.location_longitude || ""}
                            onChange={(e) => handleValuationChange('location_longitude', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">City / Town / Village Type</Label>
                        <select
                            value={formData.pdfDetails?.locality_cityTownOrVillage || ""}
                            onChange={(e) => handleValuationChange('locality_cityTownOrVillage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Type</option>
                            <option value="City">City</option>
                            <option value="Town">Town</option>
                            <option value="Village">Village</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* AREA CLASSIFICATION */}
            <div className="mb-6 p-6 bg-violet-50 rounded-2xl border border-violet-100">
                <h4 className="font-bold text-gray-900 mb-4">Area Classification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Residential Area</Label>
                        <Input
                            type="text"
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.locality_residentialArea || ""}
                            onChange={(e) => handleValuationChange('locality_residentialArea', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Commercial Area</Label>
                        <Input
                            type="text"
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.locality_commercialArea || ""}
                            onChange={(e) => handleValuationChange('locality_commercialArea', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderValuationTab = () => {
        return (
            <div className="space-y-6">
                {/* CHECKLIST OF DOCUMENTS */}
                <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Checklist of Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'checklist_Letterofintention', label: 'Letter of Intention' },
                            { key: 'checklist_SiteDeedsConverance', label: 'Site Deeds Conveyance' },
                            { key: 'checklist_ADU_LST', label: 'ADU/LST' },
                            { key: 'checklist_AgreementtosaleBuildingPermission', label: 'Agreement to Sale/Building Permission' },
                            { key: 'checklist_AppropriatedUsedPropertyTaxDetails', label: 'Appropriated Used Property Tax Details' },
                            { key: 'checklist_MortgageDocumentations', label: 'Mortgage Documentations' },
                            { key: 'checklist_MarketAnalysisLandandVillageName', label: 'Market Analysis Land and Village Name' },
                            { key: 'checklist_PlotNumberGrievanceSheet', label: 'Plot Number Grievance Sheet' },
                            { key: 'checklist_AreasurveynumberAsignedtotheSite', label: 'Area Survey Number Assigned to the Site' },
                            { key: 'checklist_BullingpermissionPhotoIdentiifcationSizeofPropertyDemarcation', label: 'Building Permission Photo Identification' },
                            { key: 'checklist_FencingPropertyProprietaryProprietDemarcation', label: 'Fencing Property Proprietary Demarcation' },
                            { key: 'checklist_GatewayPhotographPhotoIdentifcationAreaPropertyDemarcation', label: 'Gateway Photograph Photo Identification' },
                            { key: 'checklist_MainhobbillSummeriesPropertyProprietaryPropriertor', label: 'Main Hobbill Summaries Property' },
                            { key: 'checklist_PropertyProprietaryProprietDemarcation', label: 'Property Proprietary Demarcation' },
                            { key: 'checklist_LandRegisterPropertyPropertyDescription', label: 'Land Register Property Description' },
                            { key: 'checklist_PropertyexperienceOtherProprietary', label: 'Property Experience Other Proprietary' },
                            { key: 'checklist_SeparatelyenclosedPropertySeparatelyUsedAsPrivateProperty', label: 'Separately Enclosed Property' },
                            { key: 'checklist_PropertyexperiencedOrieralturedpropiedltureOrieralted', label: 'Property Experienced Oriented' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHARACTERISTICS OF LOCALITY */}
                <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Characteristics of Locality</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'characteristicOfLocality', label: 'Characteristic of Locality' },
                            { key: 'classificationOfLocality', label: 'Classification of Locality' },
                            { key: 'developmentSurroundingarea', label: 'Development Surrounding Area' },
                            { key: 'developmentPossibilityFutureCommercialMarketLike', label: 'Development Possibility Future Commercial Market' },
                            { key: 'developmentFootholdMarketScopeBuilding', label: 'Development Foothold Market Scope Building' },
                            { key: 'developmentFossilusMarcetcombinedMarketConditions', label: 'Development Market Combined Conditions' },
                            { key: 'developmentLeveloflandBuilding', label: 'Development Level of Land Building' },
                            { key: 'developmentShapeoflandi', label: 'Development Shape of Land' },
                            { key: 'developmentTypeofBuildingComplex', label: 'Development Type of Building Complex' },
                            { key: 'developmentUseLandConstructionlocalised', label: 'Development Use Land Construction' },
                            { key: 'developmentLandapprovalavailableLandApprovalavailable', label: 'Development Land Approval Available' },
                            { key: 'developmentYes', label: 'Development Yes' },
                            { key: 'developmentBoundariesroadAvailable', label: 'Development Boundaries Road Available' },
                            { key: 'developmentC2Notavailable', label: 'Development C2 Not Available' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PART A - MARKET VALUE DETAILS */}
                <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Part A - Market Value Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'part_A_landarea_SqYd', label: 'Land Area (Sq Yd)' },
                            { key: 'part_A_rateSqYd', label: 'Rate (Sq Yd)' },
                            { key: 'part_A_totalConstructionCost', label: 'Total Construction Cost' },
                            { key: 'part_A_detailsAlongChangingAccordingtoProperty', label: 'Details Along Changing According to Property' },
                            { key: 'part_A_detailsofLandandValueofLand', label: 'Details of Land and Value of Land' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PART B - CONSTRUCTION ANALYSIS */}
                <div className="mb-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Part B - Construction Analysis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'part_B_areaDetails_SqM', label: 'Area Details (Sq M)' },
                            { key: 'part_B_areaDetails_SqYd', label: 'Area Details (Sq Yd)' },
                            { key: 'part_B_measurementBasisArea_SqYd', label: 'Measurement Basis Area (Sq Yd)' },
                            { key: 'part_B_measurementBasisHeight_SqYd', label: 'Measurement Basis Height (Sq Yd)' },
                            { key: 'part_B_pipeNumber', label: 'Pipe Number' },
                            { key: 'part_B_surveyNumberofLand', label: 'Survey Number of Land' },
                            { key: 'part_B_existenceOfRoadAvailable', label: 'Existence of Road Available' },
                            { key: 'part_B_treeCountPropertyDetails', label: 'Tree Count Property Details' },
                            { key: 'part_B_yearConstructionBuilding', label: 'Year Construction Building' },
                            { key: 'part_B_plotShapeAndCondition', label: 'Plot Shape and Condition' },
                            { key: 'part_B_conditionOfPlot', label: 'Condition of Plot' },
                            { key: 'part_B_conditionOfBuildingStructure', label: 'Condition of Building Structure' },
                            { key: 'part_B_generalConditionInteriorExterior', label: 'General Condition Interior Exterior' },
                            { key: 'part_B_existencePowerAvailable', label: 'Existence Power Available' },
                            { key: 'part_B_existenceWaterAvailable', label: 'Existence Water Available' },
                            { key: 'part_B_interiorExteriorPoorCondition', label: 'Interior Exterior Poor Condition' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* LOCALITY - DETAILED */}
                <div className="mb-6 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Locality - Detailed</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'locality_cityTownOrVillage', label: 'City Town Or Village' },
                            { key: 'locality_residentialArea', label: 'Residential Area' },
                            { key: 'locality_commercialArea', label: 'Commercial Area' },
                            { key: 'locality_classificationArea', label: 'Classification Area' },
                            { key: 'locality_highMiddleRuralType', label: 'High Middle Rural Type' },
                            { key: 'locality_unionSectorCommunityLocationDetails', label: 'Union Sector Community Location Details' },
                            { key: 'locality_municipalCorporationCommercialLocationDetails', label: 'Municipal Corporation Commercial Location Details' },
                            { key: 'locality_governmentSector', label: 'Government Sector' },
                            { key: 'locality_areaLocality_ImpactOnProperty', label: 'Area Locality Impact On Property' },
                            { key: 'locality_agricultureLandAllowedPropertyCommercialUse', label: 'Agriculture Land Allowed Property Commercial Use' },
                            { key: 'locality_restrictionsOnPropertyFuture', label: 'Restrictions On Property Future' },
                            { key: 'locality_interestOfPropertyScopeForBuilding', label: 'Interest Of Property Scope For Building' },
                            { key: 'locality_scopePropertyForBuilding', label: 'Scope Property For Building' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* VALUATION DETAILS */}
                <div className="mb-6 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Valuation Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'valuation_appreciationProperty', label: 'Appreciation Property' },
                            { key: 'valuation_depreciation', label: 'Depreciation' },
                            { key: 'valuation_distressSale', label: 'Distress Sale' },
                            { key: 'valuation_interimValueProperty', label: 'Interim Value Property' },
                            { key: 'value_marketValue', label: 'Market Value' },
                            { key: 'value_distressValue', label: 'Distress Value' },
                            { key: 'value_loanValue', label: 'Loan Value' },
                            { key: 'value_marketValueInWords', label: 'Market Value In Words' },
                            { key: 'value_distressValueInWords', label: 'Distress Value In Words' },
                            { key: 'value_loanValueInWords', label: 'Loan Value In Words' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CERTIFICATE OF VALUATION */}
                <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Certificate of Valuation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'certificate_certificateNumber', label: 'Certificate Number' },
                            { key: 'certificate_dateOfValuation', label: 'Date of Valuation' },
                            { key: 'certificate_appraiserName', label: 'Appraiser Name' },
                            { key: 'certificate_appraiserLicense', label: 'Appraiser License' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PROPERTY AT A GLANCE */}
                <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Property at a Glance</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'propertyGlance_applicant', label: 'Applicant' },
                            { key: 'propertyGlance_valuationDrawValue', label: 'Valuation Draw Value' },
                            { key: 'propertyGlance_purposeOfValuation', label: 'Purpose of Valuation' },
                            { key: 'propertyGlance_nameOfOwner', label: 'Name of Owner' },
                            { key: 'propertyGlance_propertyAddress', label: 'Property Address' },
                            { key: 'propertyGlance_briefDescriptionProperty', label: 'Brief Description Property' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* MARKET VALUE ANALYSIS */}
                <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Market Value Analysis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'market_totalPlotArea_SqYd', label: 'Total Plot Area (Sq Yd)' },
                            { key: 'market_totalPlotArea_SqM', label: 'Total Plot Area (Sq M)' },
                            { key: 'market_ratePerSqYd', label: 'Rate Per Sq Yd' },
                            { key: 'market_ratePerSqM', label: 'Rate Per Sq M' },
                            { key: 'market_ratePerSqft', label: 'Rate Per Sq Ft' },
                            { key: 'market_rateSqm', label: 'Rate Sq M' },
                            { key: 'market_totalMarketValue', label: 'Total Market Value' },
                            { key: 'market_totalMarketValueInWords', label: 'Total Market Value In Words' },
                            { key: 'market_marketValue', label: 'Market Value' },
                            { key: 'market_pricePerSqft', label: 'Price Per Sq Ft' },
                            { key: 'market_marketDemand', label: 'Market Demand' },
                            { key: 'market_investmentPotential', label: 'Investment Potential' },
                            { key: 'market_marketValuePerSqft', label: 'Market Value Per Sq Ft' },
                            { key: 'market_distressValuePerSqft', label: 'Distress Value Per Sq Ft' },
                            { key: 'market_loanValuePerSqft', label: 'Loan Value Per Sq Ft' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* LOAN DETAILS */}
                <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Loan Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'loan_loanAmount', label: 'Loan Amount' },
                            { key: 'loan_loanToValueRatio', label: 'Loan to Value Ratio' },
                            { key: 'loan_loanValueTotal', label: 'Loan Value Total' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* SITE & STRUCTURE */}
                <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Site & Structure Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'site_siteDescription', label: 'Site Description' },
                            { key: 'site_locationProximity', label: 'Location Proximity' },
                            { key: 'site_accessibilityDetails', label: 'Accessibility Details' },
                            { key: 'structure_structureType', label: 'Structure Type' },
                            { key: 'structure_conditionOfBuilding', label: 'Condition of Building' },
                            { key: 'structure_maintenanceStatus', label: 'Maintenance Status' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* AREA DETAILS */}
                <div className="mb-6 p-6 bg-red-50 rounded-2xl border border-red-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Area Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'area_carpetArea', label: 'Carpet Area' },
                            { key: 'area_builtUpArea', label: 'Built Up Area' },
                            { key: 'area_plotArea', label: 'Plot Area' },
                            { key: 'area_totalBuiltUpArea', label: 'Total Built Up Area' },
                            { key: 'area_balconyArea', label: 'Balcony Area' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* AMENITIES */}
                <div className="mb-6 p-6 bg-violet-50 rounded-2xl border border-violet-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Amenities & Facilities</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'amenities_electricity', label: 'Electricity' },
                            { key: 'amenities_waterSupply', label: 'Water Supply' },
                            { key: 'amenities_sewerage', label: 'Sewerage' },
                            { key: 'amenities_carParking', label: 'Car Parking' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONSTRUCTION DETAILS */}
                <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Construction Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'construction_foundationType', label: 'Foundation Type' },
                            { key: 'construction_roofType', label: 'Roof Type' },
                            { key: 'construction_floorsInBuilding', label: 'Floors in Building' },
                            { key: 'construction_totalConstructionCost', label: 'Total Construction Cost' },
                            { key: 'construction_groundFloor', label: 'Ground Floor' },
                            { key: 'construction_firstFloor', label: 'First Floor' },
                            { key: 'construction_secondFloor', label: 'Second Floor' },
                            { key: 'construction_thirdFloor', label: 'Third Floor' },
                            { key: 'construction_otherFloors', label: 'Other Floors' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ISSUES & OBSERVATIONS */}
                <div className="mb-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Issues & Observations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'issues_majorIssuesObserved', label: 'Major Issues Observed' },
                            { key: 'issues_minorRepairsNeeded', label: 'Minor Repairs Needed' },
                            { key: 'issues_specialRemarks', label: 'Special Remarks' },
                            { key: 'issues_specialRemarksAboutValuation', label: 'Special Remarks About Valuation' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* APPRAISER DETAILS */}
                <div className="mb-6 p-6 bg-fuchsia-50 rounded-2xl border border-fuchsia-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Appraiser Observations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'appraiser_observationsByAppraiser', label: 'Observations by Appraiser' },
                            { key: 'appraiser_futureGrowthPotential', label: 'Future Growth Potential' },
                            { key: 'appraiser_riskFactors', label: 'Risk Factors' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* DOCUMENT UPLOADS */}
                <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Document Evidence</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'documents_certificateOfValuationFile', label: 'Certificate of Valuation File' },
                            { key: 'documents_propertyPhotographsFile', label: 'Property Photographs File' },
                            { key: 'documents_propertyDocumentsFile', label: 'Property Documents File' },
                            { key: 'documents_otherDocumentsFile', label: 'Other Documents File' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderValuationAnalysisTab = () => {
        return (
            <div className="space-y-6">
                {/* SPECIFICATION & STATUS */}
                <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Specification & Status</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'specification_specifications', label: 'Specifications' },
                            { key: 'specification_additionalInformation', label: 'Additional Information' },
                            { key: 'specification_notesAndComments', label: 'Notes and Comments' },
                            { key: 'status_valuationStatus', label: 'Valuation Status' },
                            { key: 'status_valuationApprovedDate', label: 'Valuation Approved Date' },
                            { key: 'status_valuationRejectedDate', label: 'Valuation Rejected Date' },
                            { key: 'status_valuationRevisedDate', label: 'Valuation Revised Date' },
                            { key: 'status_dateOfValuationReport', label: 'Date of Valuation Report' },
                            { key: 'status_placeOfValuation', label: 'Place of Valuation' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* COST ANALYSIS */}
                <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Cost Analysis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'costAnalysis_areaSecurityQuantum', label: 'Area Security Quantum' },
                            { key: 'costAnalysis_lossPlotArea', label: 'Loss Plot Area' },
                            { key: 'costAnalysis_lossStoreRoom', label: 'Loss Store Room' },
                            { key: 'costAnalysis_lossDoubleQuantum', label: 'Loss Double Quantum' },
                            { key: 'costAnalysis_lossgranary', label: 'Loss Granary' },
                            { key: 'costAnalysis_lossquartersquare', label: 'Loss Quarter Square' },
                            { key: 'costAnalysis_lossGTRoomArea', label: 'Loss GT Room Area' },
                            { key: 'costAnalysis_lossWall', label: 'Loss Wall' },
                            { key: 'costAnalysis_lossOffice1', label: 'Loss Office 1' },
                            { key: 'costAnalysis_lossWallRoom', label: 'Loss Wall Room' },
                            { key: 'costAnalysis_lossOffice2', label: 'Loss Office 2' },
                            { key: 'costAnalysis_lossShelteredArea', label: 'Loss Sheltered Area' },
                            { key: 'costAnalysis_lossShed3UKold', label: 'Loss Shed 3 UK Old' },
                            { key: 'costAnalysis_lossShed3UKold2', label: 'Loss Shed 3 UK Old 2' },
                            { key: 'costAnalysis_lossShed3UKold3', label: 'Loss Shed 3 UK Old 3' },
                            { key: 'costAnalysis_totalarea_sqft', label: 'Total Area Sq Ft' },
                            { key: 'costAnalysis_totalamountin_Rs', label: 'Total Amount in Rs' },
                            { key: 'costAnalysis_sqYdrate', label: 'Sq Yd Rate' },
                            { key: 'costAnalysis_ratedetailsChange_sqft', label: 'Rate Details Change Sq Ft' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONSTRUCTION VALUES & FINAL VALUATION */}
                <div className="mb-6 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Construction Values & Final Valuation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'constructionValues_rateValue_SQM', label: 'Rate Value SQ M' },
                            { key: 'constructionValues_estimatedValues_sqft', label: 'Estimated Values Sq Ft' },
                            { key: 'constructionValues_areaSqft', label: 'Area Sq Ft' },
                            { key: 'constructionValues_areaSqM', label: 'Area Sq M' },
                            { key: 'constructionValues_estimatedValueSqYd', label: 'Estimated Value Sq Yd' },
                            { key: 'finalValuation_estimatedValueOfBuild', label: 'Estimated Value of Build' },
                            { key: 'finalValuation_estimatedValueOfBuilding', label: 'Estimated Value of Building' },
                            { key: 'finalValuation_totalValueOfProperty', label: 'Total Value of Property' },
                            { key: 'finalValuation_totalValueInWords', label: 'Total Value in Words' },
                            { key: 'finalValuation_distressValue', label: 'Distress Value' },
                            { key: 'finalValuation_loanValue', label: 'Loan Value' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* APPRAISAL & CERTIF */}
                <div className="mb-6 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Appraisal & Certification</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'appraisal_appraiserSignature', label: 'Appraiser Signature' },
                            { key: 'appraisal_appraiserStampDate', label: 'Appraiser Stamp Date' },
                            { key: 'appraisal_dateOfValuationReport', label: 'Date of Valuation Report' },
                            { key: 'appraisal_placeOfValuation', label: 'Place of Valuation' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PROPERTY ANALYSIS */}
                <div className="mb-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Property Analysis & Usage</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'analysisProperty_propertyUseDetails', label: 'Property Use Details' },
                            { key: 'analysisProperty_approvedUseByIndustrialArea', label: 'Approved Use By Industrial Area' },
                            { key: 'analysisProperty_approvedUseByMunicipalCorporation', label: 'Approved Use By Municipal Corporation' },
                            { key: 'analysisProperty_approvedUseByMunicipalBody', label: 'Approved Use By Municipal Body' },
                            { key: 'analysisProperty_approvedUseByRailway', label: 'Approved Use By Railway' },
                            { key: 'analysisProperty_approvedUseByAirport', label: 'Approved Use By Airport' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* LOCATION IDENTIFICATION */}
                <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Location & Identification</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'location_laneNumber', label: 'Lane Number' },
                            { key: 'location_latitude', label: 'Latitude' },
                            { key: 'location_longitude', label: 'Longitude' },
                            { key: 'location_areaName', label: 'Area Name' },
                            { key: 'location_landmarkOrProximity', label: 'Landmark or Proximity' },
                            { key: 'location_plotOrBlockNumber', label: 'Plot or Block Number' },
                            { key: 'location_surveyNumber', label: 'Survey Number' },
                            { key: 'location_villageOrTown', label: 'Village or Town' },
                            { key: 'location_district', label: 'District' },
                            { key: 'location_state', label: 'State' },
                            { key: 'location_postalCode', label: 'Postal Code' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHECKLIST & VALIDATION */}
                <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Valuation Checklist & Validation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'checklist_propertyConstructedOnAgricultureLand', label: 'Property Constructed on Agriculture Land' },
                            { key: 'checklist_wouldAccessProperLy', label: 'Would Access Properly' },
                            { key: 'checklist_surroundingAreaSurvivalingBuilding', label: 'Surrounding Area Surviving Building' },
                            { key: 'checklist_noWithinTwoHundredMters', label: 'No Within Two Hundred Meters' },
                            { key: 'checklist_availablewithinSiteLimitMark', label: 'Available within Site Limit Mark' },
                            { key: 'checklist_levelledProperty', label: 'Levelled Property' },
                            { key: 'checklist_irregularShapeProperty', label: 'Irregular Shape Property' },
                            { key: 'checklist_useLandConstructionlocalized', label: 'Use Land Construction Localized' },
                            { key: 'checklist_landApprovalAvailableFromConcernedAuthority', label: 'Land Approval Available From Concerned Authority' },
                            { key: 'checklist_approvalAvailable', label: 'Approval Available' },
                            { key: 'checklist_anyBoundariesRoadAvailable', label: 'Any Boundaries Road Available' },
                            { key: 'checklist_c2NotAvailableOnSite', label: 'C2 Not Available On Site' },
                            { key: 'checklist_yesUndergroundSewerageSystem', label: 'Yes Underground Sewerage System' },
                            { key: 'checklist_restrictionsWaterConnectPublicSewerageSystem', label: 'Restrictions Water Connect Public Sewerage System' },
                            { key: 'checklist_lockGateInPropertyOrAnyRestriction', label: 'Lock Gate in Property or Any Restriction' },
                            { key: 'checklist_waterProvenSewerage', label: 'Water Proven Sewerage' },
                            { key: 'checklist_undergroundSewageSystem', label: 'Underground Sewage System' },
                            { key: 'validation_dateOfInspection', label: 'Date of Inspection' },
                            { key: 'validation_dateOfDocumentedValidation', label: 'Date of Documented Validation' },
                            { key: 'validation_certificateOfValuationFile', label: 'Certificate of Valuation File' },
                            { key: 'validation_validationApprovedDate', label: 'Validation Approved Date' },
                            { key: 'validation_validationRejectedDate', label: 'Validation Rejected Date' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PART C - VALUATION */}
                <div className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Part C - Valuation Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'partC_valuationOfBuilding', label: 'Valuation of Building' },
                            { key: 'partC_federalDetailsOfBuildingConstruction', label: 'Federal Details of Building Construction' },
                            { key: 'partC_typeOfBuildingConstruction', label: 'Type of Building Construction' },
                            { key: 'partC_constructionLocalBuilding', label: 'Construction Local Building' },
                            { key: 'partC_yearOfConstructionBuilding', label: 'Year of Construction Building' },
                            { key: 'partC_numberOfFloorsAreaProperty', label: 'Number of Floors Area Property' },
                            { key: 'partC_briefAreaUsageOfEachFloor', label: 'Brief Area Usage of Each Floor' },
                            { key: 'partC_planAreaOfEachFloor', label: 'Plan Area of Each Floor' },
                            { key: 'partC_conditionOfTheBuildingValueCondition', label: 'Condition of the Building Value Condition' },
                            { key: 'partC_existenceOfElectricalPower', label: 'Existence of Electrical Power' },
                            { key: 'partC_existenceOfWaterSupply', label: 'Existence of Water Supply' },
                            { key: 'partC_existenceOfSewerageSystem', label: 'Existence of Sewerage System' },
                            { key: 'partC_interiorExteriorPoorCondition', label: 'Interior Exterior Poor Condition' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* DEPRECIATION DETAILS */}
                <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Depreciation Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'depreciation_physicalDepreciation', label: 'Physical Depreciation' },
                            { key: 'depreciation_functionalDepreciation', label: 'Functional Depreciation' },
                            { key: 'depreciation_externalDepreciation', label: 'External Depreciation' },
                            { key: 'depreciation_totalDepreciation', label: 'Total Depreciation' },
                            { key: 'depreciation_percentageDepreciation', label: 'Percentage Depreciation' },
                            { key: 'depreciationDetails_physicalDeteriorationPercentage', label: 'Physical Deterioration Percentage' },
                            { key: 'depreciationDetails_functionalObsolescence', label: 'Functional Obsolescence' },
                            { key: 'depreciationDetails_externalFactors', label: 'External Factors' },
                            { key: 'depreciationDetails_totalDepreciationPercentage', label: 'Total Depreciation Percentage' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* REMARKS */}
                <div className="mb-6 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Remarks & Final Values</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'remarks_generalRemarks', label: 'General Remarks' },
                            { key: 'remarks_aboutProperty', label: 'About Property' },
                            { key: 'remarks_approvedUseOfProperty', label: 'Approved Use of Property' },
                            { key: 'remarks_datingFutureEnhancement', label: 'Dating Future Enhancement' },
                            { key: 'remarks_futureGrowthPotential', label: 'Future Growth Potential' },
                            { key: 'remarks_riskFactors', label: 'Risk Factors' },
                            { key: 'remarks_specialNotesAndObservations', label: 'Special Notes and Observations' },
                            { key: 'finalValue_marketValue', label: 'Market Value' },
                            { key: 'finalValue_distressValue', label: 'Distress Value' },
                            { key: 'finalValue_loanValue', label: 'Loan Value' },
                            { key: 'finalValue_marketValueInWords', label: 'Market Value In Words' },
                            { key: 'finalValue_distressValueInWords', label: 'Distress Value In Words' },
                            { key: 'finalValue_loanValueInWords', label: 'Loan Value In Words' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* BANK & INSURANCE MANDATE */}
                <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Bank & Insurance Mandate</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'mandate_bankName', label: 'Bank Name' },
                            { key: 'mandate_bankGuidelinesForValuation', label: 'Bank Guidelines for Valuation' },
                            { key: 'mandate_insuranceValuationMandates', label: 'Insurance Valuation Mandates' },
                            { key: 'mandate_valuationPurpose', label: 'Valuation Purpose' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR CODE & DIGITAL */}
                <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">QR Code & Digital Signature</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'digital_qrCodeGenerated', label: 'QR Code Generated' },
                            { key: 'digital_qrCodeLink', label: 'QR Code Link' },
                            { key: 'digital_appraiserDigitalSignature', label: 'Appraiser Digital Signature' },
                            { key: 'digital_reportVersion', label: 'Report Version' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* VALUATION REPORT */}
                <div className="mb-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Valuation Report</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'report_comfinancePrice', label: 'Comfinance Price' },
                            { key: 'report_dateOfInspection', label: 'Date of Inspection' },
                            { key: 'report_dateOfDocumentProducedSal', label: 'Date of Document Produced' },
                            { key: 'report_seedNo', label: 'Seed No' },
                            { key: 'report_seedNo_2', label: 'Seed No 2' },
                            { key: 'valuationReport_confirmFinancePrice', label: 'Confirm Finance Price' },
                            { key: 'valuationReport_dateOfInspection', label: 'Date of Inspection (Report)' },
                            { key: 'valuationReport_dateOfDocumentProducedSal', label: 'Date of Document Produced (Report)' },
                            { key: 'valuationReport_seedNo', label: 'Seed No (Report)' },
                            { key: 'valuationReport_seedNo_2', label: 'Seed No 2 (Report)' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* FINANCIAL & ADDITIONAL */}
                <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Financial & Additional Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'financial_confirmFinancePrice', label: 'Confirm Finance Price' },
                            { key: 'financial_totalCost', label: 'Total Cost' },
                            { key: 'area_analysis_squareArea', label: 'Square Area' },
                            { key: 'area_analysis_ratePerSqft', label: 'Rate Per Sq Ft' },
                            { key: 'area_analysis_totalRate', label: 'Total Rate' },
                            { key: 'rate_oldPrice', label: 'Old Price' },
                            { key: 'rate_depreciation', label: 'Depreciation' },
                            { key: 'rate_ageOfBuilding', label: 'Age of Building' },
                            { key: 'property_sqft', label: 'Property Sq Ft' },
                            { key: 'property_ratePerSqft', label: 'Property Rate Per Sq Ft' },
                            { key: 'property_costAnalysisPerSqft', label: 'Property Cost Analysis Per Sq Ft' },
                            { key: 'property_detailsOfValueOfProperty', label: 'Property Details of Value' },
                            { key: 'method_pricingModel', label: 'Pricing Model' },
                            { key: 'method_comparisonMethod', label: 'Comparison Method' },
                            { key: 'method_costMethod', label: 'Cost Method' },
                            { key: 'landmark_landmarkOrProximity', label: 'Landmark or Proximity' },
                            { key: 'landmark_approachableRoad', label: 'Approachable Road' },
                            { key: 'landmark_roadsideAvailability', label: 'Roadside Availability' },
                            { key: 'constructionPartB_glassDetails', label: 'Glass Details' },
                            { key: 'constructionPartB_northSouth', label: 'North South' },
                            { key: 'constructionPartB_eastWest', label: 'East West' },
                            { key: 'constructionPartB_totalLengthAndBreadth', label: 'Total Length and Breadth' },
                            { key: 'constructionPartB_estimatedAreaOfPlot', label: 'Estimated Area of Plot' },
                            { key: 'guardians_toBank', label: 'To Bank' },
                            { key: 'guardians_stateBank', label: 'State Bank' },
                            { key: 'guardians_AmunicipialCorporation', label: 'A Municipal Corporation' },
                            { key: 'guardians_dateIncertioninValuation', label: 'Date Inception in Valuation' },
                            { key: 'guardians_coverageDocumentation', label: 'Coverage Documentation' },
                            { key: 'constructionCost_ratePerSqft', label: 'Construction Cost Rate Per Sq Ft' },
                            { key: 'constructionCost_areaInSqft', label: 'Construction Cost Area in Sq Ft' },
                            { key: 'constructionCost_totalConstructionCost', label: 'Construction Cost Total' },
                            { key: 'plot_sqftArea', label: 'Plot Sq Ft Area' },
                            { key: 'plot_roadAccess', label: 'Plot Road Access' },
                            { key: 'plot_boundaries', label: 'Plot Boundaries' },
                            { key: 'plot_utilities', label: 'Plot Utilities' },
                            { key: 'valuationAnalysis_methodApplied', label: 'Valuation Method Applied' },
                            { key: 'valuationAnalysis_costApproach', label: 'Cost Approach' },
                            { key: 'valuationAnalysis_comparisonApproach', label: 'Comparison Approach' },
                            { key: 'valuationAnalysis_incomeApproach', label: 'Income Approach' },
                            { key: 'certification_appraiserName', label: 'Appraiser Name (Certification)' },
                            { key: 'certification_appraiserLicense', label: 'Appraiser License (Certification)' },
                            { key: 'certification_dateOfValuation', label: 'Date of Valuation (Certification)' },
                            { key: 'certification_placeOfValuation', label: 'Place of Valuation (Certification)' },
                            { key: 'certification_appraiserSignature', label: 'Appraiser Signature (Certification)' },
                            { key: 'certification_stampDate', label: 'Stamp Date (Certification)' },
                            { key: 'identification_plotNumber', label: 'Identification Plot Number' },
                            { key: 'identification_surveyNumber', label: 'Identification Survey Number' },
                            { key: 'identification_villageOrTown', label: 'Identification Village or Town' },
                            { key: 'identification_district', label: 'Identification District' },
                            { key: 'identification_state', label: 'Identification State' },
                            { key: 'identification_postalCode', label: 'Identification Postal Code' },
                            { key: 'buildingChar_typeOfBuilding', label: 'Type of Building' },
                            { key: 'buildingChar_yearOfConstruction', label: 'Year of Construction' },
                            { key: 'buildingChar_numberOfFloors', label: 'Number of Floors' },
                            { key: 'buildingChar_numberOfRooms', label: 'Number of Rooms' },
                            { key: 'buildingChar_conditionOfBuilding', label: 'Condition of Building' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderMarketAnalysisTab = () => (
        <div className="space-y-6">
            {/* IV MARKETABILITY SECTION */}
            <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Marketability</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-900 block">Marketability</Label>
                        <Input
                            placeholder="e.g., Property is good..."
                            value={formData.pdfDetails?.marketability || ""}
                            onChange={(e) => handleValuationChange('marketability', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-900 block">Favoring Factors</Label>
                        <Input
                            placeholder="e.g., Amenities nearby..."
                            value={formData.pdfDetails?.favoringFactors || ""}
                            onChange={(e) => handleValuationChange('favoringFactors', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-xs font-bold text-gray-900 block">Negative Factors</Label>
                        <Input
                            placeholder="e.g., No negative factors"
                            value={formData.pdfDetails?.negativeFactors || ""}
                            onChange={(e) => handleValuationChange('negativeFactors', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* RATE SECTION */}
            <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Rate Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-900 block">Applicable Rate</Label>
                        <Input
                            placeholder="e.g., Rate per sq.ft..."
                            value={formData.pdfDetails?.marketabilityDescription || ""}
                            onChange={(e) => handleValuationChange('marketabilityDescription', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-900 block">Land Rate (New Const.)</Label>
                        <Input
                            placeholder="e.g., Land rate..."
                            value={formData.pdfDetails?.smallFlatDescription || ""}
                            onChange={(e) => handleValuationChange('smallFlatDescription', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-xs font-bold text-gray-900 block">Rate Adjustments</Label>
                        <Input
                            placeholder="e.g., Adjustments..."
                            value={formData.pdfDetails?.rateAdjustments || ""}
                            onChange={(e) => handleValuationChange('rateAdjustments', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* BREAK-UP FOR THE RATE */}
            <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <h4 className="font-bold text-gray-900 mb-4"> Break-up for the above Rate</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Building + Services </Label>
                        <Input
                            placeholder="e.g., ₹ 3,000/- per Sq. ft."
                            value={formData.pdfDetails?.buildingServicesRate || ""}
                            onChange={(e) => handleValuationChange('buildingServicesRate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Land + Other </Label>
                        <Input
                            placeholder="e.g., ₹ 15,000/- per Sq. ft."
                            value={formData.pdfDetails?.landOthersRate || ""}
                            onChange={(e) => handleValuationChange('landOthersRate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* COMPOSITE RATE AFTER DEPRECIATION */}
            <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-gray-900 mb-4">Composite Rate after depreciation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Depreciation Building Date</Label>
                        <Input
                            type="date"
                            value={formData.pdfDetails?.depreciationBuildingDate || ""}
                            onChange={(e) => handleValuationChange('depreciationBuildingDate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Replacement Cost Services</Label>
                        <Input
                            placeholder="e.g., ₹ Value"
                            value={formData.pdfDetails?.replacementCostServices || ""}
                            onChange={(e) => handleValuationChange('replacementCostServices', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Age of the Building/Assumed</Label>
                        <Input
                            placeholder="e.g., 42 years"
                            value={formData.pdfDetails?.buildingAge || ""}
                            onChange={(e) => handleValuationChange('buildingAge', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Future Life of Building estimated</Label>
                        <Input
                            placeholder="e.g., 18 years"
                            value={formData.pdfDetails?.buildingLife || ""}
                            onChange={(e) => handleValuationChange('buildingLife', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Depreciation percentage</Label>
                        <Input
                            placeholder="e.g., 58 %"
                            value={formData.pdfDetails?.depreciationPercentage || ""}
                            onChange={(e) => handleValuationChange('depreciationPercentage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Depreciation Rate of the building </Label>
                        <Input
                            placeholder="e.g., Value"
                            value={formData.pdfDetails?.depreciationStorage || ""}
                            onChange={(e) => handleValuationChange('depreciationStorage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* TOTAL COMPOSITE RATE */}
            <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                <h4 className="font-bold text-gray-900 mb-4">Total Composite Rate</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Total Composite Rate</Label>
                        <Input
                            placeholder="e.g., ₹ Value"
                            value={formData.pdfDetails?.totalCompositeRate || ""}
                            onChange={(e) => handleValuationChange('totalCompositeRate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Depreciated Building Rate</Label>
                        <Input
                            placeholder="e.g., ₹ Value per Sq. ft."
                            value={formData.pdfDetails?.depreciatedBuildingRate || ""}
                            onChange={(e) => handleValuationChange('depreciatedBuildingRate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Rate for Land & Other</Label>
                        <Input
                            placeholder="e.g., ₹ Value"
                            value={formData.pdfDetails?.rateForLandOther || ""}
                            onChange={(e) => handleValuationChange('rateForLandOther', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* FLAT/UNIT SPECIFICATIONS */}
            <div className="mb-6 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                <h4 className="font-bold text-gray-900 mb-4">Unit Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">The floor in which the Unit is situated</Label>
                        <select
                            value={formData.pdfDetails?.unitFloor || ""}
                            onChange={(e) => handleValuationChange('unitFloor', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Floor</option>
                            <option value="Ground">Ground</option>
                            <option value="1st">1st</option>
                            <option value="2nd">2nd</option>
                            <option value="3rd">3rd</option>
                            <option value="Higher">Higher</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Door Number of the Flat</Label>
                        <Input
                            placeholder="e.g., Flat No. B-402"
                            value={formData.pdfDetails?.unitDoorNo || ""}
                            onChange={(e) => handleValuationChange('unitDoorNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Specifications - Roof</Label>
                        <Input
                            placeholder="e.g., RCC"
                            value={formData.pdfDetails?.unitRoof || ""}
                            onChange={(e) => handleValuationChange('unitRoof', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Specifications - Flooring</Label>
                        <Input
                            placeholder="e.g., Marble/Tiles"
                            value={formData.pdfDetails?.unitFlooring || ""}
                            onChange={(e) => handleValuationChange('unitFlooring', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Specifications - Doors & Windows</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitDoors || ""}
                            onChange={(e) => handleValuationChange('unitDoors', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Bath & WC</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitBathAndWC || ""}
                            onChange={(e) => handleValuationChange('unitBathAndWC', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Electrical Wiring</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitElectricalWiring || ""}
                            onChange={(e) => handleValuationChange('unitElectricalWiring', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specification of the Flat</Label>
                        <Input
                            placeholder="e.g., 1RK, 2BHK, 3BHK"
                            value={formData.pdfDetails?.unitSpecification || ""}
                            onChange={(e) => handleValuationChange('unitSpecification', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Fittings</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitFittings || ""}
                            onChange={(e) => handleValuationChange('unitFittings', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Finishing</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitFinishing || ""}
                            onChange={(e) => handleValuationChange('unitFinishing', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>

            {/* UNIT TAX & ASSESSMENT (merged with Electricity Service) */}
            <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                <h4 className="font-bold text-gray-900 mb-4">Tax & Assessment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Assessment No.</Label>
                        <Input
                            placeholder="e.g., Assessment No."
                            value={formData.pdfDetails?.assessmentNo || ""}
                            onChange={(e) => handleValuationChange('assessmentNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Tax Paid Name</Label>
                        <Input
                            placeholder="e.g., Name"
                            value={formData.pdfDetails?.taxPaidName || ""}
                            onChange={(e) => handleValuationChange('taxPaidName', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Tax Amount</Label>
                        <Input
                            placeholder="e.g., Amount"
                            value={formData.pdfDetails?.taxAmount || ""}
                            onChange={(e) => handleValuationChange('taxAmount', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Electricity Service Number</Label>
                        <Input
                            placeholder="e.g., Service Number"
                            value={formData.pdfDetails?.electricityServiceNo || ""}
                            onChange={(e) => handleValuationChange('electricityServiceNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* UNIT AREA DETAILS (merged with Agreement for Sale) */}
            <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-gray-900 mb-4">Area Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">What is the undivided area of the land as per
                            sale deed ? </Label>
                        <Input
                            placeholder="e.g., Area in Sq. ft."
                            value={formData.pdfDetails?.undividedAreaLand || ""}
                            onChange={(e) => handleValuationChange('undividedAreaLand', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Plinth Area of Flat </Label>
                        <Input
                            placeholder="e.g., 278.57 Sq ft"
                            value={formData.pdfDetails?.plinthArea || ""}
                            onChange={(e) => handleValuationChange('plinthArea', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Carpet Area of Flat</Label>
                        <Input
                            placeholder="e.g., Area in Sq. ft."
                            value={formData.pdfDetails?.carpetArea || ""}
                            onChange={(e) => handleValuationChange('carpetArea', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">What is the floor space index?</Label>
                        <Input
                            placeholder="e.g., FSI value"
                            value={formData.pdfDetails?.floorSpaceIndex || ""}
                            onChange={(e) => handleValuationChange('floorSpaceIndex', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Agreement for Sale executed Name</Label>
                        <Input
                            placeholder="e.g., Agreement Name/Details"
                            value={formData.pdfDetails?.agreementSaleExecutedName || ""}
                            onChange={(e) => handleValuationChange('agreementSaleExecutedName', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* UNIT CLASSIFICATION (merged with Unit Maintenance) */}
            <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <h4 className="font-bold text-gray-900 mb-4">Unit Classification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Is it Posh/ I Class / Medium/ Ordinary? </Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.classificationPosh || ""}
                            onChange={(e) => handleValuationChange('classificationPosh', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Is it being used for residential or
                            commercial?</Label>
                        <Input
                            placeholder="e.g., Residential/Commercial"
                            value={formData.pdfDetails?.classificationUsage || ""}
                            onChange={(e) => handleValuationChange('classificationUsage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Is it owner occupied or tenanted?</Label>
                        <select
                            value={formData.pdfDetails?.ownerOccupancyStatus || ""}
                            onChange={(e) => handleValuationChange('ownerOccupancyStatus', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
                        >
                            <option value="">Select</option>
                            <option value="Owner Occupied">Owner Occupied</option>
                            <option value="Tenanted">Tenanted</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">If tenanted, what is the monthly rent?</Label>
                        <Input
                            placeholder="e.g., Amount"
                            value={formData.pdfDetails?.monthlyRent || ""}
                            onChange={(e) => handleValuationChange('monthlyRent', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">How is the maintenance of the Flat ?</Label>
                        <select
                            value={formData.pdfDetails?.unitMaintenance || ""}
                            onChange={(e) => handleValuationChange('unitMaintenance', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
                        >
                            <option value="">Select</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBuildingTab = () => (
        <div className="space-y-6">
            {/* APARTMENT NATURE & LOCATION */}
            <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                <h4 className="font-bold text-gray-900 mb-4">Apartment Nature & Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Nature of the Apartment</Label>
                        <select
                            value={formData.pdfDetails?.apartmentNature || ""}
                            onChange={(e) => handleValuationChange('apartmentNature', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Location</Label>
                        <Input
                            placeholder="e.g., CIDCO"
                            value={formData.pdfDetails?.apartmentLocation || ""}
                            onChange={(e) => handleValuationChange('apartmentLocation', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">C.T.S. No.</Label>
                        <Input
                            placeholder="e.g., Plot number"
                            value={formData.pdfDetails?.apartmentCTSNo || ""}
                            onChange={(e) => handleValuationChange('apartmentCTSNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Sector No.</Label>
                        <Input
                            placeholder="e.g., 26"
                            value={formData.pdfDetails?.apartmentSectorNo || ""}
                            onChange={(e) => handleValuationChange('apartmentSectorNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Block No.</Label>
                        <Input
                            placeholder="e.g., A"
                            value={formData.pdfDetails?.apartmentBlockNo || ""}
                            onChange={(e) => handleValuationChange('apartmentBlockNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Ward No.</Label>
                        <Input
                            placeholder="e.g., --"
                            value={formData.pdfDetails?.apartmentWardNo || ""}
                            onChange={(e) => handleValuationChange('apartmentWardNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Village / Municipality / Corporation</Label>
                        <Input
                            placeholder="e.g., CIDCO"
                            value={formData.pdfDetails?.apartmentVillageMunicipalityCounty || ""}
                            onChange={(e) => handleValuationChange('apartmentVillageMunicipalityCounty', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Door No. / Street or Road</Label>
                        <Input
                            placeholder="e.g., Flat No. B-45/0:2"
                            value={formData.pdfDetails?.apartmentDoorNoStreetRoad || ""}
                            onChange={(e) => handleValuationChange('apartmentDoorNoStreetRoad', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Pin Code</Label>
                        <Input
                            placeholder="e.g., 400703"
                            value={formData.pdfDetails?.apartmentPinCode || ""}
                            onChange={(e) => handleValuationChange('apartmentPinCode', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>

            {/* BUILDING & CONSTRUCTION DETAILS */}
            <div className="mb-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="font-bold text-gray-900 mb-4">Building & Construction Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Description of the locality (Residential / Commercial / Mixed)</Label>
                        <select
                            value={formData.pdfDetails?.descriptionOfLocalityResidentialCommercialMixed || ""}
                            onChange={(e) => handleValuationChange('descriptionOfLocalityResidentialCommercialMixed', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Type</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Year of Construction</Label>
                        <Input
                            placeholder="e.g., 1993"
                            value={formData.pdfDetails?.yearOfConstruction || ""}
                            onChange={(e) => handleValuationChange('yearOfConstruction', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Number of Floors</Label>
                        <Input
                            placeholder="e.g., 5"
                            value={formData.pdfDetails?.numberOfFloors || ""}
                            onChange={(e) => handleValuationChange('numberOfFloors', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Type of structure</Label>
                        <select
                            value={formData.pdfDetails?.typeOfStructure || ""}
                            onChange={(e) => handleValuationChange('typeOfStructure', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Structure</option>
                            <option value="RCC Frame with Masonry">RCC Frame with Masonry</option>
                            <option value="Load bearing Masonry">Load bearing Masonry</option>
                            <option value="Steel Frame">Steel Frame</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Number of dwelling units in the building</Label>
                        <Input
                            placeholder="e.g., 10"
                            value={formData.pdfDetails?.numberOfDwellingUnitsInBuilding || ""}
                            onChange={(e) => handleValuationChange('numberOfDwellingUnitsInBuilding', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Quality of Construction</Label>
                        <select
                            value={formData.pdfDetails?.qualityOfConstruction || ""}
                            onChange={(e) => handleValuationChange('qualityOfConstruction', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Quality</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Appearance of the Building</Label>
                        <select
                            value={formData.pdfDetails?.appearanceOfBuilding || ""}
                            onChange={(e) => handleValuationChange('appearanceOfBuilding', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Appearance</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Maintenance of the Building</Label>
                        <select
                            value={formData.pdfDetails?.maintenanceOfBuilding || ""}
                            onChange={(e) => handleValuationChange('maintenanceOfBuilding', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Maintenance</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* FACILITIES AVAILABLE */}
            <div className="mb-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                <h4 className="font-bold text-gray-900 mb-4">Facilities Available</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Lift</Label>
                        <select value={formData.pdfDetails?.liftAvailable || ""} onChange={(e) => handleValuationChange('liftAvailable', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Protected water supply</Label>
                        <select value={formData.pdfDetails?.protectedWaterSupply || ""} onChange={(e) => handleValuationChange('protectedWaterSupply', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Underground Sewerage</Label>
                        <select value={formData.pdfDetails?.undergroundSewerage || ""} onChange={(e) => handleValuationChange('undergroundSewerage', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Car parking (Open/Covered)</Label>
                        <select value={formData.pdfDetails?.carParkingOpenCovered || ""} onChange={(e) => handleValuationChange('carParkingOpenCovered', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Open">Open</option>
                            <option value="Covered">Covered</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Compound Wall</Label>
                        <select value={formData.pdfDetails?.isCompoundWallExisting || ""} onChange={(e) => handleValuationChange('isCompoundWallExisting', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Pavement around the building</Label>
                        <select value={formData.pdfDetails?.isPavementLaidAroundBuilding || ""} onChange={(e) => handleValuationChange('isPavementLaidAroundBuilding', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Any others facility</Label>
                        <select value={formData.pdfDetails?.othersFacility || ""} onChange={(e) => handleValuationChange('othersFacility', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPropertyTab = () => (
        <div className="space-y-6">
            {/* PROPERTY LOCATION & DESCRIPTION */}
            <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                <h4 className="font-bold text-gray-900 mb-4">Location of the property</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">a) Plot No./ Survey No.</Label>
                        <Input
                            placeholder="e.g., S. No. 26"
                            value={formData.pdfDetails?.plotSurveyNo || ""}
                            onChange={(e) => handleValuationChange('plotSurveyNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">b) Door No.</Label>
                        <Input
                            placeholder="e.g., Hali No. B-4502"
                            value={formData.pdfDetails?.doorNo || ""}
                            onChange={(e) => handleValuationChange('doorNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">c) T.S. No./Village</Label>
                        <Input
                            placeholder="e.g., Yasai"
                            value={formData.pdfDetails?.tpVillage || ""}
                            onChange={(e) => handleValuationChange('tpVillage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">d) Ward/Taluka</Label>
                        <Input
                            placeholder="e.g., Taluka"
                            value={formData.pdfDetails?.wardTaluka || ""}
                            onChange={(e) => handleValuationChange('wardTaluka', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">e) District</Label>
                        <Input
                            placeholder="e.g., District"
                            value={formData.pdfDetails?.mandalDistrict || ""}
                            onChange={(e) => handleValuationChange('mandalDistrict', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">f) Date of issue and validity of layout plan</Label>
                        <Input
                            type="date"
                            value={formData.pdfDetails?.layoutPlanIssueDate || ""}
                            onChange={(e) => handleValuationChange('layoutPlanIssueDate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">g) Approved map/plan issuing authority </Label>
                        <Input
                            placeholder="e.g., CIDCO"
                            value={formData.pdfDetails?.approvedMapAuthority || ""}
                            onChange={(e) => handleValuationChange('approvedMapAuthority', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">h) Whether authenticity of approved map/plan is verified</Label>
                        <select
                            value={formData.pdfDetails?.authenticityVerified || ""}
                            onChange={(e) => handleValuationChange('authenticityVerified', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Status</option>
                            <option value="Verified">Yes</option>
                            <option value="Not Verified">Not</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">i) Any other comments by our empanelled valuer on authentic of approved map</Label>
                        <textarea
                            placeholder="Comments on authenticity of approved map..."
                            value={formData.pdfDetails?.valuerCommentOnAuthenticity || ""}
                            onChange={(e) => handleValuationChange('valuerCommentOnAuthenticity', e.target.value)}
                            disabled={!canEdit}
                            rows="3"
                            className="text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 w-full"
                        />
                    </div>


                </div>
            </div>

            {/* POSTAL ADDRESS & CLASSIFICATION */}
            <div className="mb-6 p-6 bg-violet-50 rounded-2xl border border-violet-100">
                <h4 className="font-bold text-gray-900 mb-4">Property Classification & Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Postal Address of the property</Label>
                        <Textarea
                            placeholder="Enter full address"
                            value={formData.pdfDetails?.postalAddress || ""}
                            onChange={(e) => handleValuationChange('postalAddress', e.target.value)}
                            disabled={!canEdit}
                            className="text-sm rounded-lg border border-neutral-300"
                            rows="3"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">City/Town</Label>
                        <Input
                            placeholder="e.g., Mumbai"
                            value={formData.pdfDetails?.cityTown || ""}
                            onChange={(e) => handleValuationChange('cityTown', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Label className="text-sm font-bold text-gray-900">Area Type</Label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.pdfDetails?.residentialArea || false}
                                onChange={(e) => handleValuationChange('residentialArea', e.target.checked)}
                                disabled={!canEdit}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">Residential Area</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.pdfDetails?.commercialArea || false}
                                onChange={(e) => handleValuationChange('commercialArea', e.target.checked)}
                                disabled={!canEdit}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">Commercial Area</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.pdfDetails?.industrialArea || false}
                                onChange={(e) => handleValuationChange('industrialArea', e.target.checked)}
                                disabled={!canEdit}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">Industrial Area</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* BOUNDARIES OF PROPERTY */}
            <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4">Boundaries of Property</h4>
                <div className="space-y-6">
                    {/* Plot Boundaries Table */}
                    <div>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-indigo-100">
                                    <th className="border border-gray-300 p-3 text-left font-bold text-gray-900 w-1/4">a</th>
                                    <th className="border border-gray-300 p-3 text-left font-bold text-gray-900 w-1/4">Boundaries of the property - Plot</th>
                                    <th className="border border-gray-300 p-3 text-left font-bold text-gray-900 w-1/4">As per Deed</th>
                                    <th className="border border-gray-300 p-3 text-left font-bold text-gray-900 w-1/4">As per Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan="1" className="border border-gray-300 p-3"></td>
                                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">North</td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotNorthDeed || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotNorthDeed', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotNorthActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotNorthActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="1" className="border border-gray-300 p-3"></td>
                                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">South</td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotSouthDeed || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotSouthDeed', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotSouthActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotSouthActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="1" className="border border-gray-300 p-3"></td>
                                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">East</td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotEastDeed || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotEastDeed', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotEastActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotEastActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="1" className="border border-gray-300 p-3"></td>
                                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">West</td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotWestDeed || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotWestDeed', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotWestActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotWestActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Flat/Shop Boundaries Table */}
                    <div>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-indigo-100">
                                    <th className="border border-gray-300 p-3 text-left font-bold text-gray-900 w-1/4">b</th>
                                    <th className="border border-gray-300 p-3 text-left font-bold text-gray-900 w-1/4">Boundaries of the property - Flat</th>
                                    <th className="border border-gray-300 p-3 text-left font-bold text-gray-900 w-1/4">As per Deed</th>
                                    <th className="border border-gray-300 p-3 text-left font-bold text-gray-900 w-1/4">As per Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan="1" className="border border-gray-300 p-3"></td>
                                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">North</td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopNorthDeed || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopNorthDeed', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopNorthActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopNorthActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="1" className="border border-gray-300 p-3"></td>
                                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">South</td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopSouthDeed || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopSouthDeed', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopSouthActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopSouthActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="1" className="border border-gray-300 p-3"></td>
                                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">East</td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopEastDeed || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopEastDeed', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopEastActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopEastActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="1" className="border border-gray-300 p-3"></td>
                                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">West</td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopWestDeed || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopWestDeed', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopWestActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopWestActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-9 text-sm rounded-lg border border-neutral-300"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* DIMENSIONS OF THE PROPERTY */}
            <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Dimensions of the Unit</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Dimensions (as per Document)</Label>
                        <Input
                            placeholder="e.g., 28.88 Sq. ft. / 2.88 Sq. ft."
                            value={formData.pdfDetails?.dimensionsDeed || ""}
                            onChange={(e) => handleValuationChange('dimensionsDeed', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Dimensions (as per Actuals)</Label>
                        <Input
                            placeholder="e.g., 28.88 Sq. ft. / 2.88 Sq. ft."
                            value={formData.pdfDetails?.dimensionsActual || ""}
                            onChange={(e) => handleValuationChange('dimensionsActual', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>

            {/* EXTENT OF THE UNIT */}
            <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                <h4 className="font-bold text-gray-900 mb-4">Extent of the site</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Extent of Site</Label>
                        <Input
                            placeholder="e.g., ₹ 40,34,950 per Sq. ft."
                            value={formData.pdfDetails?.extentOfUnit || ""}
                            onChange={(e) => handleValuationChange('extentOfUnit', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Latitude/Longitude</Label>
                        <Input
                            placeholder="e.g., 19°07'53.2 N & 73°00"
                            value={formData.pdfDetails?.latitudeLongitude || ""}
                            onChange={(e) => handleValuationChange('latitudeLongitude', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>

                </div>
            </div>

            {/* EXTENT OF SITE & RENT */}
            <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                <h4 className="font-bold text-gray-900 mb-4">Extent & Occupancy Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Extent of Site Considered for Valuation</Label>
                        <Input
                            placeholder="e.g., Area in Sq. ft."
                            value={formData.pdfDetails?.extentOfSiteValuation || ""}
                            onChange={(e) => handleValuationChange('extentOfSiteValuation', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Whether occupied by the owner/tenant? If occupied by tenant, since how long? Rent
                            received per month </Label>
                        <Input
                            placeholder="Owner/ Tenant & Rent Amount"
                            value={formData.pdfDetails?.rentReceivedPerMonth || ""}
                            onChange={(e) => handleValuationChange('rentReceivedPerMonth', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>

            {/* AREA CLASSIFICATION */}
            <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                <h4 className="font-bold text-gray-900 mb-4">Area Classification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">High/Middle/Poor</Label>
                        <select
                            value={formData.pdfDetails?.areaClassification || ""}
                            onChange={(e) => handleValuationChange('areaClassification', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select</option>
                            <option value="High">High</option>
                            <option value="Middle">Middle</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Metro / Urban / Semi-Urban / Rural</Label>
                        <select
                            value={formData.pdfDetails?.urbanClassification || ""}
                            onChange={(e) => handleValuationChange('urbanClassification', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select</option>
                            <option value="Metro">Metro</option>
                            <option value="Urban">Urban</option>
                            <option value="Semi-Urban">Semi-Urban</option>
                            <option value="Rural">Rural</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Government Type / Comming Under</Label>
                        <select
                            value={formData.pdfDetails?.governmentType || ""}
                            onChange={(e) => handleValuationChange('governmentType', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Type</option>
                            <option value="Municipal">Municipality</option>
                            <option value="Corporation">Corporation</option>
                            <option value="Government">Government</option>
                            <option value="Village Panchayat">Village Panchayat</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Whether covered under any Govt. Enactments</Label>
                        <select
                            value={formData.pdfDetails?.govtEnactmentsCovered || ""}
                            onChange={(e) => handleValuationChange('govtEnactmentsCovered', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFlatTab = () => {
        return (
            <div className="space-y-6">
                {/* FLAT/UNIT SPECIFICATIONS */}
                <div className="mb-6 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                    <h4 className="font-bold text-gray-900 mb-4">Unit Specifications</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">The floor in which the Unit is situated</Label>
                            <select
                                value={formData.pdfDetails?.unitFloor || ""}
                                onChange={(e) => handleValuationChange('unitFloor', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                            >
                                <option value="">Select Floor</option>
                                <option value="Ground">Ground</option>
                                <option value="1st">1st</option>
                                <option value="2nd">2nd</option>
                                <option value="3rd">3rd</option>
                                <option value="Higher">Higher</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Door Number of the Flat</Label>
                            <Input
                                placeholder="e.g., Flat No. B-402"
                                value={formData.pdfDetails?.unitDoorNo || ""}
                                onChange={(e) => handleValuationChange('unitDoorNo', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Specifications - Roof</Label>
                            <Input
                                placeholder="e.g., RCC"
                                value={formData.pdfDetails?.unitRoof || ""}
                                onChange={(e) => handleValuationChange('unitRoof', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Specifications - Flooring</Label>
                            <Input
                                placeholder="e.g., Marble/Tiles"
                                value={formData.pdfDetails?.unitFlooring || ""}
                                onChange={(e) => handleValuationChange('unitFlooring', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Specifications - Doors & Windows</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitDoors || ""}
                                onChange={(e) => handleValuationChange('unitDoors', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Bath & WC</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitBathAndWC || ""}
                                onChange={(e) => handleValuationChange('unitBathAndWC', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Electrical Wiring</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitElectricalWiring || ""}
                                onChange={(e) => handleValuationChange('unitElectricalWiring', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specification of the Flat</Label>
                            <Input
                                placeholder="e.g., 1RK, 2BHK, 3BHK"
                                value={formData.pdfDetails?.unitSpecification || ""}
                                onChange={(e) => handleValuationChange('unitSpecification', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Fittings</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitFittings || ""}
                                onChange={(e) => handleValuationChange('unitFittings', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Finishing</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitFinishing || ""}
                                onChange={(e) => handleValuationChange('unitFinishing', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                    </div>
                </div>

                {/* ELECTRICITY SERVICE */}
                <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <h4 className="font-bold text-gray-900 mb-4">Electricity Service Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Electricity service connection number Meter
                                card is in the name of </Label>
                            <Input
                                placeholder="e.g., Service Number"
                                value={formData.pdfDetails?.electricityServiceNo || ""}
                                onChange={(e) => handleValuationChange('electricityServiceNo', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                    </div>
                </div>

                {/* UNIT TAX/ASSESSMENT */}
                <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                    <h4 className="font-bold text-gray-900 mb-4">Unit Tax & Assessment</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Assessment No.</Label>
                            <Input
                                placeholder="e.g., Assessment No."
                                value={formData.pdfDetails?.assessmentNo || ""}
                                onChange={(e) => handleValuationChange('assessmentNo', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Tax Paid Name</Label>
                            <Input
                                placeholder="e.g., Name"
                                value={formData.pdfDetails?.taxPaidName || ""}
                                onChange={(e) => handleValuationChange('taxPaidName', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Tax Amount</Label>
                            <Input
                                placeholder="e.g., Amount"
                                value={formData.pdfDetails?.taxAmount || ""}
                                onChange={(e) => handleValuationChange('taxAmount', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    </div>
                </div>

                {/* AGREEMENT FOR SALE */}
                <div className="mb-6 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                    <h4 className="font-bold text-gray-900 mb-4">Agreement for Sale</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Agreement for Sale executed Name</Label>
                            <Input
                                placeholder="e.g., Agreement Name/Details"
                                value={formData.pdfDetails?.agreementSaleExecutedName || ""}
                                onChange={(e) => handleValuationChange('agreementSaleExecutedName', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!valuation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-80">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-muted-foreground">Loading valuation...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-4">
            {!isLoggedIn && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-8 max-w-sm border border-neutral-200 shadow-lg">
                        <p className="text-center font-semibold text-base text-neutral-900">Please login to edit this valuation</p>
                        <p className="text-center text-sm text-neutral-600 mt-3">You are currently viewing in read-only mode</p>
                    </div>
                </div>
            )}

            <div className="max-w-full mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/dashboard")}
                        className="h-9 w-9 border border-neutral-300 hover:bg-neutral-100 hover:border-blue-400 rounded-lg p-0 transition-colors"
                    >
                        <FaArrowLeft className="h-4 w-4 text-neutral-700" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Rajesh House Valuation Form</h1>
                        <p className="text-xs text-neutral-500 mt-1">{!isLoggedIn && "Read-Only Mode"}</p>
                    </div>
                </div>

                {/* Main Content - 2-Column Layout */}
                <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
                    {/* Left Column - Form Info */}
                    <div className="col-span-12 sm:col-span-3 lg:col-span-2">
                        <Card className="border border-neutral-200 bg-white rounded-xl overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="bg-neutral-50 text-neutral-900 p-4 border-b border-neutral-200">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-neutral-900">
                                    <FaFileAlt className="h-4 w-4 text-blue-500" />
                                    Form Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 overflow-y-auto flex-1">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">By</p>
                                    <p className="text-sm font-medium text-neutral-900">{username}</p>
                                </div>
                                <div className="border-t border-neutral-200"></div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Status</p>
                                    <p className="text-sm font-medium text-neutral-900">{valuation?.status?.charAt(0).toUpperCase() + valuation?.status?.slice(1)}</p>
                                </div>
                                <div className="border-t border-neutral-200"></div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Last Updated</p>
                                    <p className="text-sm font-medium text-neutral-900 break-words">{new Date().toLocaleString()}</p>
                                </div>
                                <div className="border-t border-neutral-200"></div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">ID</p>
                                    <code className="bg-neutral-100 px-2 py-1.5 rounded-lg text-xs font-mono break-all text-neutral-700 border border-neutral-300 block">{id.slice(0, 12)}...</code>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Main Form */}
                    <div className="col-span-12 sm:col-span-9 lg:col-span-10">
                        <Card className="border border-neutral-200 bg-white rounded-xl overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="bg-neutral-50 text-neutral-900 p-4 border-b border-neutral-200 flex-shrink-0">
                                <CardTitle className="text-sm font-bold text-neutral-900">Rajesh House Details</CardTitle>
                                <p className="text-neutral-600 text-xs mt-1.5 font-medium">* Required fields</p>
                            </CardHeader>
                            <CardContent className="p-4 overflow-y-auto flex-1">
                                <form className="space-y-3" onSubmit={onFinish}>

                                    {/* Main Tab Navigation - Client/Documents/Valuation */}
                                    <div className="flex gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-200 mb-6 overflow-x-auto">
                                        {[
                                            { id: 'client', label: 'CLIENT', icon: FaUser },
                                            { id: 'documents', label: 'DOCS', icon: FaFileAlt },
                                            { id: 'valuation', label: 'VALUATION', icon: FaDollarSign },
                                            { id: 'addfields', label: 'ADD FIELDS', icon: FaCog }
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`px-3 py-2 rounded-lg font-semibold text-xs whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${activeTab === tab.id
                                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                    : "bg-white border border-gray-300 text-gray-900 hover:border-blue-500"
                                                    }`}
                                            >
                                                <tab.icon size={12} />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Client Info Tab */}
                                    {activeTab === 'client' && (
                                        <div>
                                            <ClientInfoPanel
                                                formData={formData}
                                                bankName={bankName}
                                                city={city}
                                                canEdit={canEdit}
                                                canEditField={canEditField}
                                                handleInputChange={handleInputChange}
                                                handleIntegerInputChange={handleIntegerInputChange}
                                                handleLettersOnlyInputChange={handleLettersOnlyInputChange}
                                                setBankName={setBankName}
                                                setCity={setCity}
                                                setFormData={setFormData}
                                                banks={banks}
                                                cities={cities}
                                                dsaNames={dsaNames}
                                                dsa={dsa}
                                                setDsa={setDsa}
                                                engineerName={engineerName}
                                                setEngineerName={setEngineerName}
                                                engineerNames={engineerNames}
                                            />
                                        </div>
                                    )}

                                    {/* Documents Tab */}
                                    {activeTab === 'documents' && (
                                        <div>
                                            <DocumentsPanel
                                                formData={formData}
                                                canEdit={canEdit}
                                                locationImagePreviews={locationImagePreviews}
                                                imagePreviews={imagePreviews}
                                                documentPreviews={formData.documentPreviews || []}
                                                handleLocationImageUpload={handleLocationImageUpload}
                                                handleImageUpload={handleImageUpload}
                                                handleDocumentUpload={handleDocumentUpload}
                                                removeLocationImage={removeLocationImage}
                                                removeImage={removeImage}
                                                removeDocument={removeDocument}
                                                handleInputChange={handleInputChange}
                                                handleCoordinateChange={handleCoordinateChange}
                                                setFormData={setFormData}
                                                locationFileInputRef={locationFileInputRef}
                                                fileInputRef1={fileInputRef1}
                                                fileInputRef2={fileInputRef2}
                                                fileInputRef3={fileInputRef3}
                                                fileInputRef4={fileInputRef4}
                                                documentFileInputRef={documentFileInputRef}
                                                formType="rajeshhouse"
                                            />
                                        </div>
                                    )}

                                    {/* Valuation Details Tab */}
                                    {activeTab === 'valuation' && (
                                        <div>
                                            {/* Sub-tab Navigation */}
                                            <div className="flex gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-200 mb-6 overflow-x-auto">
                                                {[
                                                    { id: 'general', label: 'GENERAL' },
                                                    { id: 'valuation', label: 'VALUATION' },
                                                    { id: 'analysis', label: 'ANALYSIS' }
                                                ].map(tab => (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setActiveValuationSubTab(tab.id)}
                                                        className={`px-3 py-2 rounded-lg font-semibold text-xs whitespace-nowrap flex-shrink-0 transition-all ${activeValuationSubTab === tab.id
                                                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                            : "bg-white border border-gray-300 text-gray-900 hover:border-blue-500"
                                                            }`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Sub-tab Content */}
                                            <div className="space-y-6">
                                                {activeValuationSubTab === 'general' && renderGeneralTab()}
                                                {activeValuationSubTab === 'valuation' && renderValuationTab()}
                                                {activeValuationSubTab === 'analysis' && renderValuationAnalysisTab()}
                                            </div>
                                        </div>
                                    )}

                                    {/* ADD FIELDS Section */}
                                    {activeTab === "addfields" && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Custom Fields</h3>

                                            <div className="p-6 bg-white rounded-2xl border border-gray-200 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-bold text-gray-900">
                                                            Field Name
                                                            <span className="text-red-500 ml-1">*</span>
                                                        </Label>
                                                        <Input
                                                            placeholder="Enter field name (e.g., Property Type)"
                                                            value={customFieldName}
                                                            onChange={(e) => setCustomFieldName(e.target.value.substring(0, 100))}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && customFieldName.trim() && customFieldValue.trim() && canEdit) {
                                                                    handleAddCustomField();
                                                                }
                                                            }}
                                                            disabled={!canEdit}
                                                            maxLength={100}
                                                            className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                        />
                                                        <span className="text-xs text-gray-500">{customFieldName.length}/100 characters</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-bold text-gray-900">
                                                            Field Value
                                                            <span className="text-red-500 ml-1">*</span>
                                                        </Label>
                                                        <Input
                                                            placeholder="Enter field value"
                                                            value={customFieldValue}
                                                            onChange={(e) => setCustomFieldValue(e.target.value.substring(0, 500))}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && customFieldName.trim() && customFieldValue.trim() && canEdit) {
                                                                    handleAddCustomField();
                                                                }
                                                            }}
                                                            disabled={!canEdit}
                                                            maxLength={500}
                                                            className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                        />
                                                        <span className="text-xs text-gray-500">{customFieldValue.length}/500 characters</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        onClick={handleAddCustomField}
                                                        disabled={!canEdit || !customFieldName.trim() || !customFieldValue.trim()}
                                                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                                                    >
                                                        {customFields.length === 0 ? "Add First Field" : "Add Field"}
                                                    </Button>
                                                    {(customFieldName.trim() || customFieldValue.trim()) && (
                                                        <Button
                                                            onClick={() => {
                                                                setCustomFieldName("");
                                                                setCustomFieldValue("");
                                                            }}
                                                            disabled={!canEdit}
                                                            className="bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                                                        >
                                                            Clear
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Display Custom Fields */}
                                            {customFields.length > 0 && (
                                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="font-bold text-gray-900">
                                                            Custom Fields
                                                            <span className="bg-blue-500 text-white text-xs font-semibold ml-2 px-3 py-1 rounded-full">
                                                                {customFields.length}
                                                            </span>
                                                        </h4>
                                                        {canEdit && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setClearConfirmOpen(true)}
                                                                className="text-sm text-red-600 hover:text-red-800 font-semibold transition-colors"
                                                            >
                                                                Clear All
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {customFields.map((field, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex justify-between items-start p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="font-semibold text-gray-900 break-words">{field.name}</span>
                                                                        <span className="text-gray-400">:</span>
                                                                    </div>
                                                                    <span className="text-gray-700 block mt-1 break-words">{field.value}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCustomField(index)}
                                                                    disabled={!canEdit}
                                                                    title={canEdit ? "Click to remove this field" : "Cannot edit"}
                                                                    className="flex-shrink-0 ml-4 text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold px-3 py-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {customFields.length === 0 && !customFieldName && !customFieldValue && (
                                                <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 text-center">
                                                    <p className="text-gray-600 font-medium">No custom fields added yet</p>
                                                    <p className="text-sm text-gray-500 mt-2">Add a field name and value above to get started</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </form>

                                {/* Submit Buttons - OUTSIDE FORM, ALWAYS VISIBLE */}
                                <div className="flex-shrink-0 flex flex-wrap gap-2 pt-4 px-0 border-t border-neutral-200 mt-auto bg-white">
                                    {/* Download PDF Button - Always visible */}
                                    <Button
                                        type="button"
                                        onClick={handleDownloadPDF}
                                        disabled={loading}
                                        className="min-w-fit px-4 h-10 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                    >
                                        <FaDownload size={14} />
                                        Download PDF
                                    </Button>

                                    {/* Save/Edit Buttons - Shown when user can edit */}
                                    {canEdit && (
                                        <>
                                            <Button
                                                type="button"
                                                onClick={onFinish}
                                                disabled={loading}
                                                className="min-w-fit px-6 h-10 text-xs font-bold rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                            >
                                                <FaSave size={14} />
                                                {loading ? "Saving..." : "Save Changes"}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => navigate("/dashboard")}
                                                disabled={loading}
                                                className="min-w-fit px-4 h-10 text-xs font-bold rounded-lg border border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-neutral-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                            >
                                                <FaArrowLeft size={14} />
                                                Back
                                            </Button>
                                        </>
                                    )}

                                    {/* Manager Action Buttons - Approve/Reject/Review and Fix */}
                                    {canApprove && (
                                        <>
                                            <Button
                                                type="button"
                                                onClick={() => handleManagerAction("approve")}
                                                disabled={loading}
                                                className="min-w-fit px-6 h-10 text-xs font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                            >
                                                <FaCheckCircle size={14} />
                                                {loading ? "Processing..." : "Approve"}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => handleManagerAction("reject")}
                                                disabled={loading}
                                                className="min-w-fit px-6 h-10 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                            >
                                                <FaTimesCircle size={14} />
                                                {loading ? "Processing..." : "Reject"}
                                            </Button>
                                        </>
                                    )}

                                    {/* Back Button for non-editable users */}
                                    {!canEdit && !canApprove && (
                                        <Button
                                            type="button"
                                            onClick={() => navigate("/dashboard")}
                                            disabled={loading}
                                            className="min-w-fit px-4 h-10 text-xs font-bold rounded-lg border border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-neutral-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                        >
                                            <FaArrowLeft size={14} />
                                            Back
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Approval/Rejection/Rework Dialog */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {modalAction === "approve" ? "Approve Form" : modalAction === "reject" ? "Reject Form" : "Request Rework"}
                        </DialogTitle>
                        <DialogDescription>
                            {modalAction === "approve" ? "Enter approval notes (optional)" : modalAction === "reject" ? "Please provide feedback for rejection" : "Provide instructions for the rework"}
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        placeholder={modalAction === "approve" ? "Enter approval notes (optional)" : modalAction === "reject" ? "Please provide feedback for rejection" : "Enter rework instructions"}
                        value={modalFeedback}
                        onChange={(e) => setModalFeedback(e.target.value)}
                        rows={4}
                        autoFocus
                    />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={modalAction === "approve" ? "default" : modalAction === "rework" ? "default" : "destructive"}
                            onClick={handleModalOk}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : (modalAction === "approve" ? "Approve" : modalAction === "reject" ? "Reject" : "Request Rework")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear Custom Fields Confirmation Dialog */}
            <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Clear All Custom Fields</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove all custom fields? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setClearConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setCustomFields([]);
                                setClearConfirmOpen(false);
                            }}
                        >
                            Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RajeshHouseEditForm;