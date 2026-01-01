import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
import { getBofMaharastraById, updateBofMaharashtra, managerSubmitBofMaharashtra, requestReworkBofMaharashtra } from "../services/bomFlatService";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { useNotification } from "../context/NotificationContext";
import { uploadPropertyImages, uploadLocationImages, uploadDocuments } from "../services/imageService";
import { invalidateCache } from "../services/axios";
import { getCustomOptions } from "../services/customOptionsService";
import ClientInfoPanel from "../components/ClientInfoPanel";
import DocumentsPanel from "../components/DocumentsPanel";
import { generateBomFlatPDF } from "../services/bomFlatPdf";

const BOfMaharastraEditForm = ({ user, onLogin }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
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
    const [isFirstSave, setIsFirstSave] = useState(true); // Track if this is the first save of a new form
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
            formId: '',
            branch: '',
            valuationPurpose: '',
            inspectionDate: '',
            valuationMadeDate: '',

            mortgageDeed: '',
            mortgageDeedBetween: '',
            previousValuationReport: '',
            previousValuationInFavorOf: '',
            approvedPlanNo: '',

            // GENERAL SECTION - DOCUMENTS
            purposeOfValuation: '',
            dateOfInspection: '',
            dateOfValuationMade: '',
            referenceNo: '',
            agreementForSale: '',
            commencementCertificate: '',
            occupancyCertificate: '',
            ownerNameAddress: '',
            briefDescriptionProperty: '',
            listOfDocumentsProduced: '',

            ownerName: '',

            // PROPERTY DESCRIPTION / LOCATION OF PROPERTY
            plotSurveyNo: '',
            doorNo: '',
            tpVillage: '',
            wardTaluka: '',
            mandalDistrict: '',
            layoutPlanIssueDate: '',
            approvedMapAuthority: '',
            authenticityVerified: '',
            valuerCommentOnAuthenticity: '',
            otherApprovedPlanDetails: '',
            valuesApprovedPlan: '',

            postalAddress: '',
            cityTown: '',
            residentialArea: false,
            commercialArea: false,
            industrialArea: false,
            locationOfProperty: '',

            // INDUSTRIAL AREA DETAILS - Section 9
            areaClassification: '',
            urbanClassification: '',
            governmentType: '',
            govtEnactmentsCovered: '',

            // BOUNDARIES OF PROPERTY - Section 12
            boundariesPlotNorthDeed: '',
            boundariesPlotNorthActual: '',
            boundariesPlotSouthDeed: '',
            boundariesPlotSouthActual: '',
            boundariesPlotEastDeed: '',
            boundariesPlotEastActual: '',
            boundariesPlotWestDeed: '',
            boundariesPlotWestActual: '',
            boundariesShopNorthDeed: '',
            boundariesShopNorthActual: '',
            boundariesShopSouthDeed: '',
            boundariesShopSouthActual: '',
            boundariesShopEastDeed: '',
            boundariesShopEastActual: '',
            boundariesShopWestDeed: '',
            boundariesShopWestActual: '',

            // DIMENSIONS OF THE UNIT - Section 13
            dimensionsDeed: '',
            dimensionsActual: '',

            // EXTENT OF THE UNIT - Section 14
            extentOfUnit: '',
            latitudeLongitude: '',
            floorSpaceIndex: '',

            // EXTENT OF SITE CONSIDERED FOR VALUATION - Section 15
            extentOfSiteValuation: '',

            // SECTION 16 - OCCUPANCY
            rentReceivedPerMonth: '',

            // APARTMENT BUILDING DETAILS - Section II
            apartmentNature: '',
            apartmentLocation: '',
            apartmentCTSNo: '',
            apartmentSectorNo: '',
            apartmentBlockNo: '',
            apartmentWardNo: '',
            apartmentVillageMunicipalityCounty: '',
            apartmentDoorNoStreetRoad: '',
            apartmentPinCode: '',

            // APARTMENT BUILDING SUBSECTIONS
            descriptionOfLocalityResidentialCommercialMixed: '',
            yearOfConstruction: '',
            numberOfFloors: '',
            typeOfStructure: '',
            numberOfDwellingUnitsInBuilding: '',
            qualityOfConstruction: '',
            appearanceOfBuilding: '',
            maintenanceOfBuilding: '',

            // VALUE OF FLAT - SECTION C
            fairMarketValue: '',
            realizableValue: '',
            distressValue: '',
            saleDeedValue: '',
            agreementCircleRate: '',
            agreementValue: '',
            valueCircleRate: '',
            insurableValue: '',
            totalJantriValue: '',

            // FLAT SPECIFICATIONS EXTENDED
            areaUsage: '',
            carpetAreaFlat: '',

            // MONTHLY RENT
            ownerOccupancyStatus: '',
            monthlyRent: '',

            // MARKETABILITY SECTION
            marketability: '',
            favoringFactors: '',
            negativeFactors: '',

            // RATE SECTION
            comparableRate: '',
            adoptedBasicCompositeRate: '',
            buildingServicesRate: '',
            landOthersRate: '',
            guidelineRate: '',

            // COMPOSITE RATE AFTER DEPRECIATION
            depreciatedBuildingRate: '',
            replacementCostServices: '',
            buildingAge: '',
            buildingLife: '',
            depreciationPercentage: '',
            deprecatedRatio: '',

            // MARKET RATE ANALYSIS
            marketabilityDescription: '',
            smallFlatDescription: '',
            newConstructionArea: '',
            rateAdjustments: '',

            // BREAK-UP FOR THE ABOVE RATE
            goodwillRate: '',

            // COMPOSITE RATE AFTER DEPRECIATION (LEGACY)
            depreciationBuildingDate: '',
            depreciationStorage: '',

            // TOTAL COMPOSITE RATE
            totalCompositeRate: '',
            rateForLandOther: '',

            // VALUATION DETAILS - Items (Qty, Rate, Value rows)
            presentValueQty: '',
            presentValueRate: '',
            presentValue: '',
            wardrobesQty: '',
            wardrobesRate: '',
            wardrobes: '',
            showcasesQty: '',
            showcasesRate: '',
            showcases: '',
            kitchenArrangementsQty: '',
            kitchenArrangementsRate: '',
            kitchenArrangements: '',
            superfineFinishQty: '',
            superfineFinishRate: '',
            superfineFinish: '',
            interiorDecorationsQty: '',
            interiorDecorationsRate: '',
            interiorDecorations: '',
            electricityDepositsQty: '',
            electricityDepositsRate: '',
            electricityDeposits: '',
            collapsibleGatesQty: '',
            collapsibleGatesRate: '',
            collapsibleGates: '',
            potentialValueQty: '',
            potentialValueRate: '',
            potentialValue: '',
            otherItemsQty: '',
            otherItemsRate: '',
            otherItems: '',
            totalValuationItems: '',

            // SECTION 3: FLAT/UNIT SPECIFICATIONS
            unitFloor: '',
            unitDoorNo: '',
            unitRoof: '',
            unitFlooring: '',
            unitDoors: '',
            unitBathAndWC: '',
            unitElectricalWiring: '',
            unitSpecification: '',
            unitFittings: '',
            unitFinishing: '',

            // SECTION 4: UNIT TAX/ASSESSMENT
            assessmentNo: '',
            taxPaidName: '',
            taxAmount: '',

            // SECTION 5: ELECTRICITY SERVICE
            electricityServiceNo: '',
            meterCardName: '',

            // SECTION 6: UNIT MAINTENANCE
            unitMaintenance: '',

            // SECTION 7: AGREEMENT FOR SALE
            agreementSaleExecutedName: '',

            // SECTION 8 & 9: UNIT AREA DETAILS
            undividedAreaLand: '',
            plinthArea: '',
            carpetArea: '',

            // SECTION 10-14: UNIT CLASSIFICATION
            classificationPosh: '',
            classificationUsage: '',
            classificationOwnership: '',

            // SIGNATURE & REPORT DETAILS
            place: '',
            signatureDate: '',
            signerName: '',
            reportDate: '',
            fairMarketValueWords: '',

            // FACILITIES AVAILABLE
            liftAvailable: '',
            protectedWaterSupply: '',
            undergroundSewerage: '',
            carParkingOpenCovered: '',
            isCompoundWallExisting: '',
            isPavementLaidAroundBuilding: '',
            othersFacility: '',

            // DECLARATIONS
            declarationB: '',
            declarationD: '',
            declarationE: '',
            declarationI: '',
            declarationJ: '',

            // VALUATION INFORMATION DETAILS
            assetBackgroundInfo: '',
            valuationPurposeAuthority: '',
            valuersIdentity: '',
            valuersConflictDisclosure: '',
            dateOfAppointment: '',
            inspectionsUndertaken: '',
            informationSources: '',
            valuationProcedures: '',
            reportRestrictions: '',
            majorFactors: '',
            additionalFactors: '',
            caveatsLimitations: '',

            // MISSING FIELD: WINDOW SPECIFICATIONS
            unitWindows: '',

            // MISSING FIELD: UNIT BATH & ELECTRICAL
            unitBathAndWC: '',
            unitElectricalWiring: '',
            unitSpecification: '',

            // MISSING FIELD: DWELLINGS
            ownerOccupiedOrLetOut: '',

            // MISSING FIELD: RENT
            rentReceivedPerMonth: '',

            // MISSING FIELD: ELECTRICITY CONNECTION
            electricityServiceConnectionNo: '',

            // MISSING FIELD: VALUATION PLACE & DATE
            valuationPlace: '',
            valuationMadeDate: '',
            valuersName: '',

            // MISSING FIELD: FAIR MARKET VALUE
            fairMarketValueWords: '',

            // MISSING FIELD: COMPOSITE RATE
            totalCompositeRate: '',

            // MISSING FIELD: AREA USAGE
            areaUsage: '',

            // MISSING FIELD: GUIDELINES
            guidelineRatePerSqm: '',

            // MISSING FIELD: RESIDENTIAL OR COMMERCIAL
            residentialOrCommercial: '',

            // MISSING FIELD: FACILITY OTHERS
            facilityOthers: '',

            // MISSING FIELD: WINDOWS UNIT (different from unit windows)
            doorsAndWindows: ''
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
                dataToDownload = await getBofMaharastraById(id, username, role, clientId);
                ('✅ Fresh BOF Maharashtra data fetched for PDF:', {
                    bankName: dataToDownload?.bankName,
                    city: dataToDownload?.city
                });
            } catch (fetchError) {
                console.error('❌ Failed to fetch fresh BOF Maharashtra data:', fetchError);
                // Only fallback to valuation/formData if fetch fails
                dataToDownload = valuation;
                if (!dataToDownload) {
                    console.warn('BOF Maharashtra form data is null, using formData');
                    dataToDownload = formData;
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

    // Save current bomflat form data to localStorage whenever formData updates
    // This ensures the data is available for prefilling the next bomflat form
    useEffect(() => {
        if (formData && formData.pdfDetails && id) {
            // Check if ANY prefillable field has data - INCLUDES ALL 132 FIELDS
            const prefillableFields = [
                // ========== GENERAL TAB - 48 FIELDS ==========
                // Purpose of Valuation & Owner Information (7)
                formData.pdfDetails.purposeOfValuation,
                formData.pdfDetails.place,
                formData.pdfDetails.listOfDocumentsProduced,
                formData.pdfDetails.dateOfInspection,
                formData.pdfDetails.dateOfValuationMade,
                formData.pdfDetails.ownerNameAddress,
                formData.pdfDetails.briefDescriptionProperty,

                // Property Location & Description (9)
                formData.pdfDetails.plotSurveyNo,
                formData.pdfDetails.doorNo,
                formData.pdfDetails.tpVillage,
                formData.pdfDetails.wardTaluka,
                formData.pdfDetails.mandalDistrict,
                formData.pdfDetails.layoutPlanIssueDate,
                formData.pdfDetails.approvedMapAuthority,
                formData.pdfDetails.authenticityVerified,
                formData.pdfDetails.valuerCommentOnAuthenticity,

                // Postal Address & Classification (5)
                formData.pdfDetails.postalAddress,
                formData.pdfDetails.cityTown,
                formData.pdfDetails.residentialArea,
                formData.pdfDetails.commercialArea,
                formData.pdfDetails.industrialArea,

                // Boundaries of Property - Plot (8)
                formData.pdfDetails.boundariesPlotNorthDeed,
                formData.pdfDetails.boundariesPlotNorthActual,
                formData.pdfDetails.boundariesPlotSouthDeed,
                formData.pdfDetails.boundariesPlotSouthActual,
                formData.pdfDetails.boundariesPlotEastDeed,
                formData.pdfDetails.boundariesPlotEastActual,
                formData.pdfDetails.boundariesPlotWestDeed,
                formData.pdfDetails.boundariesPlotWestActual,

                // Boundaries of Property - Shop (8)
                formData.pdfDetails.boundariesShopNorthDeed,
                formData.pdfDetails.boundariesShopNorthActual,
                formData.pdfDetails.boundariesShopSouthDeed,
                formData.pdfDetails.boundariesShopSouthActual,
                formData.pdfDetails.boundariesShopEastDeed,
                formData.pdfDetails.boundariesShopEastActual,
                formData.pdfDetails.boundariesShopWestDeed,
                formData.pdfDetails.boundariesShopWestActual,

                // Dimensions & Extent (6)
                formData.pdfDetails.dimensionsDeed,
                formData.pdfDetails.dimensionsActual,
                formData.pdfDetails.extentOfUnit,
                formData.pdfDetails.latitudeLongitude,
                formData.pdfDetails.floorSpaceIndex,
                formData.pdfDetails.extentOfSiteValuation,

                // ========== VALUATION TAB - 50 FIELDS ==========
                // Valuation Items Table - Qty, Rate, Value (30)
                // Item 1: Present Value
                formData.pdfDetails.presentValueQty,
                formData.pdfDetails.presentValueRate,
                formData.pdfDetails.presentValue,
                // Item 2: Wardrobes
                formData.pdfDetails.wardrobesQty,
                formData.pdfDetails.wardrobesRate,
                formData.pdfDetails.wardrobes,
                // Item 3: Show cases
                formData.pdfDetails.showcasesQty,
                formData.pdfDetails.showcasesRate,
                formData.pdfDetails.showcases,
                // Item 4: Kitchen Arrangements
                formData.pdfDetails.kitchenArrangementsQty,
                formData.pdfDetails.kitchenArrangementsRate,
                formData.pdfDetails.kitchenArrangements,
                // Item 5: Superfine Finish
                formData.pdfDetails.superfineFinishQty,
                formData.pdfDetails.superfineFinishRate,
                formData.pdfDetails.superfineFinish,
                // Item 6: Interior Decorations
                formData.pdfDetails.interiorDecorationsQty,
                formData.pdfDetails.interiorDecorationsRate,
                formData.pdfDetails.interiorDecorations,
                // Item 7: Electricity Deposits
                formData.pdfDetails.electricityDepositsQty,
                formData.pdfDetails.electricityDepositsRate,
                formData.pdfDetails.electricityDeposits,
                // Item 8: Collapsible Gates
                formData.pdfDetails.collapsibleGatesQty,
                formData.pdfDetails.collapsibleGatesRate,
                formData.pdfDetails.collapsibleGates,
                // Item 9: Potential Value
                formData.pdfDetails.potentialValueQty,
                formData.pdfDetails.potentialValueRate,
                formData.pdfDetails.potentialValue,
                // Item 10: Others
                formData.pdfDetails.otherItemsQty,
                formData.pdfDetails.otherItemsRate,
                formData.pdfDetails.otherItems,

                // Value of Flat - Auto-Calculated Results (9)
                formData.pdfDetails.fairMarketValue,
                formData.pdfDetails.realizableValue,
                formData.pdfDetails.distressValue,
                formData.pdfDetails.saleDeedValue,
                formData.pdfDetails.agreementCircleRate,
                formData.pdfDetails.agreementValue,
                formData.pdfDetails.valueCircleRate,
                formData.pdfDetails.insurableValue,
                formData.pdfDetails.totalJantriValue,

                // ========== MARKET TAB - 34 FIELDS ==========
                // Marketability & Rate Analysis (7)
                formData.pdfDetails.marketability,
                formData.pdfDetails.favoringFactors,
                formData.pdfDetails.negativeFactors,
                formData.pdfDetails.marketabilityDescription,
                formData.pdfDetails.smallFlatDescription,
                formData.pdfDetails.newConstructionArea,
                formData.pdfDetails.rateAdjustments,

                // Break-up & Total Composite Rate (11)
                formData.pdfDetails.buildingServicesRate,
                formData.pdfDetails.landOthersRate,
                formData.pdfDetails.depreciationBuildingDate,
                formData.pdfDetails.replacementCostServices,
                formData.pdfDetails.buildingAge,
                formData.pdfDetails.buildingLife,
                formData.pdfDetails.depreciationPercentage,
                formData.pdfDetails.deprecatedRatio,
                formData.pdfDetails.depreciatedBuildingRate,
                formData.pdfDetails.totalCompositeRate,
                formData.pdfDetails.rateForLandOther,

                // Comparable Rate & Guidelines (4)
                formData.pdfDetails.comparableRate,
                formData.pdfDetails.adoptedBasicCompositeRate,
                formData.pdfDetails.guidelineRate,
                formData.pdfDetails.goodwillRate,
            ];

            const hasMeaningfulData = prefillableFields.some(field => !!field);

            if (hasMeaningfulData) {
                try {
                    ('[DEBUG] Saving bomflat data to localStorage:', {
                        id: id,
                        ownerNameAddress: formData.pdfDetails.ownerNameAddress,
                        postalAddress: formData.pdfDetails.postalAddress,
                        marketability: formData.pdfDetails.marketability,
                        totalFieldsTracked: 132,
                        customFieldsCount: customFields.length,
                        hasMeaningfulData: true
                    });
                    localStorage.setItem('last_bomflat_form_data', JSON.stringify({
                        pdfDetails: formData.pdfDetails,
                        customFields: customFields
                    }));
                    ('[DEBUG] Bomflat data saved successfully to localStorage with ALL 132 fields + customFields:', customFields.length);
                } catch (error) {
                    console.error('Error saving current bomflat data:', error);
                }
            } else {
                ('[DEBUG] Form has no meaningful prefillable data - not saving');
            }
        }
    }, [formData, customFields, id]);

    // Helper function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            // Validate that file is a Blob
            if (!(file instanceof Blob)) {
                reject(new Error('Invalid file: expected Blob object'));
                return;
            }
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
        ('[DEBUG] loadValuation called with id:', id);
        const savedData = localStorage.getItem(`valuation_draft_${username}`);
         if (savedData) {
             const parsedData = JSON.parse(savedData);
             if (parsedData.uniqueId === id) {
                 ('[DEBUG] Using saved draft data');
                 setValuation(parsedData);
                 mapDataToForm(parsedData);
                 // Load tab-specific data from localStorage
                 loadTabDataFromLocalStorage();
                 // NOTE: Do NOT save this draft as last_bomflat_form_data here
                 // Only update last_bomflat_form_data when user explicitly saves via handleSave()
                 return;
             }
         }

        try {
            ('[DEBUG] Fetching from database');
            // Pass user info for authentication
            const dbData = await getBofMaharastraById(id, username, role, clientId);
            ('[DEBUG] Database data loaded:', {
                clientName: dbData?.clientName,
                address: dbData?.address,
                city: dbData?.city,
                pdfDetailsKeys: Object.keys(dbData?.pdfDetails || {}).length
            });
            setValuation(dbData);
            mapDataToForm(dbData);

            // Prefill and load tab data synchronously after mapping
            // We'll use a helper function that merges everything at once
            // Only prefill if this is a new form (no customFields from database)
            const isNewForm = !dbData.customFields || dbData.customFields.length === 0;
            prefillAndLoadTabData(dbData, isNewForm);
            
            // If this is an existing form (not new), mark it as not first save
            if (!isNewForm) {
                setIsFirstSave(false);
            }

            // Restore property image previews from database
            if (dbData.propertyImages && Array.isArray(dbData.propertyImages)) {
                const propertyPreviews = dbData.propertyImages
                    .filter(img => img && typeof img === 'object')
                    .map((img, idx) => {
                        // Use URL directly if available (from Cloudinary or DB storage)
                        const previewUrl = img.url || img.path || img.fileName || '';
                        return {
                            preview: previewUrl,
                            url: previewUrl,
                            file: null,
                            inputNumber: img.inputNumber || 1,
                            fileName: img.fileName || img.name || `Property Image ${idx + 1}`,
                            size: img.size || 0
                        };
                    })
                    .filter(preview => preview.preview);
                if (propertyPreviews.length > 0) {
                    setImagePreviews(propertyPreviews);
                }
            }

            // Restore location image previews from database
            if (dbData.locationImages && Array.isArray(dbData.locationImages)) {
                const locationPreviews = dbData.locationImages
                    .filter(img => img && typeof img === 'object')
                    .map((img, idx) => {
                        // Use URL directly if available (from Cloudinary or DB storage)
                        const previewUrl = img.url || img.path || img.fileName || '';
                        return {
                            preview: previewUrl,
                            url: previewUrl,
                            file: null,
                            fileName: img.fileName || img.name || `Location Image ${idx + 1}`,
                            size: img.size || 0
                        };
                    })
                    .filter(preview => preview.preview);
                if (locationPreviews.length > 0) {
                    setLocationImagePreviews(locationPreviews);
                }
            }

            // Restore area images from database
            if (dbData.areaImages && typeof dbData.areaImages === 'object' && Object.keys(dbData.areaImages).length > 0) {
                setFormData(prev => ({
                    ...prev,
                    areaImages: dbData.areaImages
                }));
            }

            // Restore document previews from database
            if (dbData.documentPreviews && Array.isArray(dbData.documentPreviews)) {
                setFormData(prev => ({
                    ...prev,
                    documentPreviews: dbData.documentPreviews
                }));
            }

            // Restore supporting documents from database
            if (dbData.supportingDocuments && Array.isArray(dbData.supportingDocuments)) {
                setFormData(prev => ({
                    ...prev,
                    documentPreviews: dbData.supportingDocuments
                }));
            }

            setBankName(dbData.bankName || "");
            setCity(dbData.city || "");
            setDsa(dbData.dsa || "");
            setEngineerName(dbData.engineerName || "");
        } catch (error) {
            console.error("Error loading valuation:", error);
            // Continue without data
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

    // Load tab-specific data from localStorage
    const loadTabDataFromLocalStorage = () => {
        try {
            const generalTabData = localStorage.getItem(`bomflat_general_${id}`);
            const valuationTabData = localStorage.getItem(`bomflat_valuation_${id}`);
            const marketTabData = localStorage.getItem(`bomflat_market_${id}`);

            if (generalTabData) {
                const parsedGeneralData = JSON.parse(generalTabData);
                setFormData(prev => ({
                    ...prev,
                    pdfDetails: { ...prev.pdfDetails, ...parsedGeneralData }
                }));
            }
            if (valuationTabData) {
                const parsedValuationData = JSON.parse(valuationTabData);
                setFormData(prev => ({
                    ...prev,
                    pdfDetails: { ...prev.pdfDetails, ...parsedValuationData }
                }));
            }
            if (marketTabData) {
                const parsedMarketData = JSON.parse(marketTabData);
                setFormData(prev => ({
                    ...prev,
                    pdfDetails: { ...prev.pdfDetails, ...parsedMarketData }
                }));
            }
        } catch (error) {
            console.error('Error loading tab data from localStorage:', error);
        }
    };

    // Helper function to prefill tabs and load tab data after DB data is loaded
    // INCLUDES ALL FIELDS FROM THE THREE TABS
    const prefillAndLoadTabData = (dbData, isNewForm = true) => {
        try {
            ('[DEBUG] prefillAndLoadTabData called with all fields, isNewForm:', isNewForm);

            // First, get last bomflat data and tab-specific data from localStorage
            const lastBomflatData = localStorage.getItem('last_bomflat_form_data');
            const generalTabData = localStorage.getItem(`bomflat_general_${id}`);
            const valuationTabData = localStorage.getItem(`bomflat_valuation_${id}`);
            const marketTabData = localStorage.getItem(`bomflat_market_${id}`);

            ('[DEBUG] LocalStorage check:', {
                lastBomflatData: !!lastBomflatData,
                generalTabData: !!generalTabData,
                valuationTabData: !!valuationTabData,
                marketTabData: !!marketTabData
            });

            // Build the merged pdfDetails
            let mergedPdfDetails = { ...dbData.pdfDetails };

            // 1. If we have last bomflat data, apply it as base (prefill)
            if (lastBomflatData) {
                ('[DEBUG] Applying lastBomflatData as prefill base, isNewForm:', isNewForm);
                const parsedLastData = JSON.parse(lastBomflatData);
                ('[DEBUG] parsedLastData customFields:', parsedLastData.customFields);
                if (parsedLastData.pdfDetails) {
                    // ========== GENERAL TAB - ALL FIELDS ==========
                    const generalFields = {
                        // Purpose of Valuation & Owner Information
                        purposeOfValuation: parsedLastData.pdfDetails.purposeOfValuation || '',
                        place: parsedLastData.pdfDetails.place || '',
                        listOfDocumentsProduced: parsedLastData.pdfDetails.listOfDocumentsProduced || '',
                        dateOfInspection: parsedLastData.pdfDetails.dateOfInspection || '',
                        dateOfValuationMade: parsedLastData.pdfDetails.dateOfValuationMade || '',
                        ownerNameAddress: parsedLastData.pdfDetails.ownerNameAddress || '',
                        briefDescriptionProperty: parsedLastData.pdfDetails.briefDescriptionProperty || '',

                        // Property Location & Description
                        plotSurveyNo: parsedLastData.pdfDetails.plotSurveyNo || '',
                        doorNo: parsedLastData.pdfDetails.doorNo || '',
                        tpVillage: parsedLastData.pdfDetails.tpVillage || '',
                        wardTaluka: parsedLastData.pdfDetails.wardTaluka || '',
                        mandalDistrict: parsedLastData.pdfDetails.mandalDistrict || '',
                        layoutPlanIssueDate: parsedLastData.pdfDetails.layoutPlanIssueDate || '',
                        approvedMapAuthority: parsedLastData.pdfDetails.approvedMapAuthority || '',
                        authenticityVerified: parsedLastData.pdfDetails.authenticityVerified || '',
                        valuerCommentOnAuthenticity: parsedLastData.pdfDetails.valuerCommentOnAuthenticity || '',

                        // Postal Address & Classification
                        postalAddress: parsedLastData.pdfDetails.postalAddress || '',
                        cityTown: parsedLastData.pdfDetails.cityTown || '',
                        residentialArea: parsedLastData.pdfDetails.residentialArea || false,
                        commercialArea: parsedLastData.pdfDetails.commercialArea || false,
                        industrialArea: parsedLastData.pdfDetails.industrialArea || false,

                        // Area Classification
                        areaClassification: parsedLastData.pdfDetails.areaClassification || '',
                        urbanClassification: parsedLastData.pdfDetails.urbanClassification || '',
                        governmentType: parsedLastData.pdfDetails.governmentType || '',
                        govtEnactmentsCovered: parsedLastData.pdfDetails.govtEnactmentsCovered || '',

                        // Boundaries of Property (Plot)
                        boundariesPlotNorthDeed: parsedLastData.pdfDetails.boundariesPlotNorthDeed || '',
                        boundariesPlotNorthActual: parsedLastData.pdfDetails.boundariesPlotNorthActual || '',
                        boundariesPlotSouthDeed: parsedLastData.pdfDetails.boundariesPlotSouthDeed || '',
                        boundariesPlotSouthActual: parsedLastData.pdfDetails.boundariesPlotSouthActual || '',
                        boundariesPlotEastDeed: parsedLastData.pdfDetails.boundariesPlotEastDeed || '',
                        boundariesPlotEastActual: parsedLastData.pdfDetails.boundariesPlotEastActual || '',
                        boundariesPlotWestDeed: parsedLastData.pdfDetails.boundariesPlotWestDeed || '',
                        boundariesPlotWestActual: parsedLastData.pdfDetails.boundariesPlotWestActual || '',

                        // Boundaries of Property (Shop)
                        boundariesShopNorthDeed: parsedLastData.pdfDetails.boundariesShopNorthDeed || '',
                        boundariesShopNorthActual: parsedLastData.pdfDetails.boundariesShopNorthActual || '',
                        boundariesShopSouthDeed: parsedLastData.pdfDetails.boundariesShopSouthDeed || '',
                        boundariesShopSouthActual: parsedLastData.pdfDetails.boundariesShopSouthActual || '',
                        boundariesShopEastDeed: parsedLastData.pdfDetails.boundariesShopEastDeed || '',
                        boundariesShopEastActual: parsedLastData.pdfDetails.boundariesShopEastActual || '',
                        boundariesShopWestDeed: parsedLastData.pdfDetails.boundariesShopWestDeed || '',
                        boundariesShopWestActual: parsedLastData.pdfDetails.boundariesShopWestActual || '',

                        // Dimensions & Extent
                        dimensionsDeed: parsedLastData.pdfDetails.dimensionsDeed || '',
                        dimensionsActual: parsedLastData.pdfDetails.dimensionsActual || '',
                        extentOfUnit: parsedLastData.pdfDetails.extentOfUnit || '',
                        latitudeLongitude: parsedLastData.pdfDetails.latitudeLongitude || '',
                        floorSpaceIndex: parsedLastData.pdfDetails.floorSpaceIndex || '',
                        extentOfSiteValuation: parsedLastData.pdfDetails.extentOfSiteValuation || '',
                        rentReceivedPerMonth: parsedLastData.pdfDetails.rentReceivedPerMonth || '',

                        // Apartment Building Details
                        apartmentNature: parsedLastData.pdfDetails.apartmentNature || '',
                        apartmentLocation: parsedLastData.pdfDetails.apartmentLocation || '',
                        apartmentCTSNo: parsedLastData.pdfDetails.apartmentCTSNo || '',
                        apartmentSectorNo: parsedLastData.pdfDetails.apartmentSectorNo || '',
                        apartmentBlockNo: parsedLastData.pdfDetails.apartmentBlockNo || '',
                        apartmentWardNo: parsedLastData.pdfDetails.apartmentWardNo || '',
                        apartmentVillageMunicipalityCounty: parsedLastData.pdfDetails.apartmentVillageMunicipalityCounty || '',
                        apartmentDoorNoStreetRoad: parsedLastData.pdfDetails.apartmentDoorNoStreetRoad || '',
                        apartmentPinCode: parsedLastData.pdfDetails.apartmentPinCode || '',

                        // Building & Construction Details
                        descriptionOfLocalityResidentialCommercialMixed: parsedLastData.pdfDetails.descriptionOfLocalityResidentialCommercialMixed || '',
                        yearOfConstruction: parsedLastData.pdfDetails.yearOfConstruction || '',
                        numberOfFloors: parsedLastData.pdfDetails.numberOfFloors || '',
                        typeOfStructure: parsedLastData.pdfDetails.typeOfStructure || '',
                        numberOfDwellingUnitsInBuilding: parsedLastData.pdfDetails.numberOfDwellingUnitsInBuilding || '',
                        qualityOfConstruction: parsedLastData.pdfDetails.qualityOfConstruction || '',
                        appearanceOfBuilding: parsedLastData.pdfDetails.appearanceOfBuilding || '',
                        maintenanceOfBuilding: parsedLastData.pdfDetails.maintenanceOfBuilding || '',

                        // Facilities Available
                        liftAvailable: parsedLastData.pdfDetails.liftAvailable || '',
                        protectedWaterSupply: parsedLastData.pdfDetails.protectedWaterSupply || '',
                        undergroundSewerage: parsedLastData.pdfDetails.undergroundSewerage || '',
                        carParkingOpenCovered: parsedLastData.pdfDetails.carParkingOpenCovered || '',
                        isCompoundWallExisting: parsedLastData.pdfDetails.isCompoundWallExisting || '',
                        isPavementLaidAroundBuilding: parsedLastData.pdfDetails.isPavementLaidAroundBuilding || '',
                        othersFacility: parsedLastData.pdfDetails.othersFacility || '',
                        facilityOthers: parsedLastData.pdfDetails.facilityOthers || '',
                    };

                    // ========== VALUATION TAB - ALL FIELDS ==========
                    const valuationFields = {
                        // Valuation Items Table - Qty, Rate, Values
                        presentValueQty: parsedLastData.pdfDetails.presentValueQty || '',
                        presentValueRate: parsedLastData.pdfDetails.presentValueRate || '',
                        presentValue: parsedLastData.pdfDetails.presentValue || '',
                        wardrobesQty: parsedLastData.pdfDetails.wardrobesQty || '',
                        wardrobesRate: parsedLastData.pdfDetails.wardrobesRate || '',
                        wardrobes: parsedLastData.pdfDetails.wardrobes || '',
                        showcasesQty: parsedLastData.pdfDetails.showcasesQty || '',
                        showcasesRate: parsedLastData.pdfDetails.showcasesRate || '',
                        showcases: parsedLastData.pdfDetails.showcases || '',
                        kitchenArrangementsQty: parsedLastData.pdfDetails.kitchenArrangementsQty || '',
                        kitchenArrangementsRate: parsedLastData.pdfDetails.kitchenArrangementsRate || '',
                        kitchenArrangements: parsedLastData.pdfDetails.kitchenArrangements || '',
                        superfineFinishQty: parsedLastData.pdfDetails.superfineFinishQty || '',
                        superfineFinishRate: parsedLastData.pdfDetails.superfineFinishRate || '',
                        superfineFinish: parsedLastData.pdfDetails.superfineFinish || '',
                        interiorDecorationsQty: parsedLastData.pdfDetails.interiorDecorationsQty || '',
                        interiorDecorationsRate: parsedLastData.pdfDetails.interiorDecorationsRate || '',
                        interiorDecorations: parsedLastData.pdfDetails.interiorDecorations || '',
                        electricityDepositsQty: parsedLastData.pdfDetails.electricityDepositsQty || '',
                        electricityDepositsRate: parsedLastData.pdfDetails.electricityDepositsRate || '',
                        electricityDeposits: parsedLastData.pdfDetails.electricityDeposits || '',
                        collapsibleGatesQty: parsedLastData.pdfDetails.collapsibleGatesQty || '',
                        collapsibleGatesRate: parsedLastData.pdfDetails.collapsibleGatesRate || '',
                        collapsibleGates: parsedLastData.pdfDetails.collapsibleGates || '',
                        potentialValueQty: parsedLastData.pdfDetails.potentialValueQty || '',
                        potentialValueRate: parsedLastData.pdfDetails.potentialValueRate || '',
                        potentialValue: parsedLastData.pdfDetails.potentialValue || '',
                        otherItemsQty: parsedLastData.pdfDetails.otherItemsQty || '',
                        otherItemsRate: parsedLastData.pdfDetails.otherItemsRate || '',
                        otherItems: parsedLastData.pdfDetails.otherItems || '',

                        // Value of Flat - Auto-Calculated Results
                        fairMarketValue: parsedLastData.pdfDetails.fairMarketValue || '',
                        realizableValue: parsedLastData.pdfDetails.realizableValue || '',
                        distressValue: parsedLastData.pdfDetails.distressValue || '',
                        saleDeedValue: parsedLastData.pdfDetails.saleDeedValue || '',
                        agreementCircleRate: parsedLastData.pdfDetails.agreementCircleRate || '',
                        agreementValue: parsedLastData.pdfDetails.agreementValue || '',
                        valueCircleRate: parsedLastData.pdfDetails.valueCircleRate || '',
                        insurableValue: parsedLastData.pdfDetails.insurableValue || '',
                        totalJantriValue: parsedLastData.pdfDetails.totalJantriValue || '',
                    };

                    // ========== MARKET TAB - ALL FIELDS ==========
                    const marketFields = {
                        // Marketability & Rate Analysis
                        marketability: parsedLastData.pdfDetails.marketability || '',
                        favoringFactors: parsedLastData.pdfDetails.favoringFactors || '',
                        negativeFactors: parsedLastData.pdfDetails.negativeFactors || '',
                        marketabilityDescription: parsedLastData.pdfDetails.marketabilityDescription || '',
                        smallFlatDescription: parsedLastData.pdfDetails.smallFlatDescription || '',
                        newConstructionArea: parsedLastData.pdfDetails.newConstructionArea || '',
                        rateAdjustments: parsedLastData.pdfDetails.rateAdjustments || '',

                        // Break-up & Total Composite Rate
                        buildingServicesRate: parsedLastData.pdfDetails.buildingServicesRate || '',
                        landOthersRate: parsedLastData.pdfDetails.landOthersRate || '',
                        depreciationBuildingDate: parsedLastData.pdfDetails.depreciationBuildingDate || '',
                        replacementCostServices: parsedLastData.pdfDetails.replacementCostServices || '',
                        buildingAge: parsedLastData.pdfDetails.buildingAge || '',
                        buildingLife: parsedLastData.pdfDetails.buildingLife || '',
                        depreciationPercentage: parsedLastData.pdfDetails.depreciationPercentage || '',
                        deprecatedRatio: parsedLastData.pdfDetails.deprecatedRatio || '',
                        depreciatedBuildingRate: parsedLastData.pdfDetails.depreciatedBuildingRate || '',
                        totalCompositeRate: parsedLastData.pdfDetails.totalCompositeRate || '',
                        rateForLandOther: parsedLastData.pdfDetails.rateForLandOther || '',

                        // Comparable Rate & Guidelines
                        comparableRate: parsedLastData.pdfDetails.comparableRate || '',
                        adoptedBasicCompositeRate: parsedLastData.pdfDetails.adoptedBasicCompositeRate || '',
                        guidelineRate: parsedLastData.pdfDetails.guidelineRate || '',
                        goodwillRate: parsedLastData.pdfDetails.goodwillRate || '',
                    };

                    // ========== UNIT SPECIFICATIONS & DETAILS ==========
                    const unitSpecificationsFields = {
                        // Unit Specifications
                        unitFloor: parsedLastData.pdfDetails.unitFloor || '',
                        unitDoorNo: parsedLastData.pdfDetails.unitDoorNo || '',
                        unitRoof: parsedLastData.pdfDetails.unitRoof || '',
                        unitFlooring: parsedLastData.pdfDetails.unitFlooring || '',
                        unitDoors: parsedLastData.pdfDetails.unitDoors || '',
                        unitBathAndWC: parsedLastData.pdfDetails.unitBathAndWC || '',
                        unitElectricalWiring: parsedLastData.pdfDetails.unitElectricalWiring || '',
                        unitSpecification: parsedLastData.pdfDetails.unitSpecification || '',
                        unitFittings: parsedLastData.pdfDetails.unitFittings || '',
                        unitFinishing: parsedLastData.pdfDetails.unitFinishing || '',
                        unitWindows: parsedLastData.pdfDetails.unitWindows || '',

                        // Unit Tax & Assessment
                        assessmentNo: parsedLastData.pdfDetails.assessmentNo || '',
                        taxPaidName: parsedLastData.pdfDetails.taxPaidName || '',
                        taxAmount: parsedLastData.pdfDetails.taxAmount || '',

                        // Electricity Service
                        electricityServiceNo: parsedLastData.pdfDetails.electricityServiceNo || '',
                        electricityServiceConnectionNo: parsedLastData.pdfDetails.electricityServiceConnectionNo || '',
                        meterCardName: parsedLastData.pdfDetails.meterCardName || '',

                        // Unit Maintenance
                        unitMaintenance: parsedLastData.pdfDetails.unitMaintenance || '',

                        // Agreement for Sale
                        agreementSaleExecutedName: parsedLastData.pdfDetails.agreementSaleExecutedName || '',

                        // Unit Area Details
                        undividedAreaLand: parsedLastData.pdfDetails.undividedAreaLand || '',
                        plinthArea: parsedLastData.pdfDetails.plinthArea || '',
                        carpetArea: parsedLastData.pdfDetails.carpetArea || '',

                        // Unit Classification
                        classificationPosh: parsedLastData.pdfDetails.classificationPosh || '',
                        classificationUsage: parsedLastData.pdfDetails.classificationUsage || '',
                        classificationOwnership: parsedLastData.pdfDetails.classificationOwnership || '',
                        ownerOccupancyStatus: parsedLastData.pdfDetails.ownerOccupancyStatus || '',

                        // Other Details
                        areaUsage: parsedLastData.pdfDetails.areaUsage || '',
                        monthlyRent: parsedLastData.pdfDetails.monthlyRent || '',
                        ownerOccupiedOrLetOut: parsedLastData.pdfDetails.ownerOccupiedOrLetOut || '',
                        valuationPlace: parsedLastData.pdfDetails.valuationPlace || '',
                        valuationMadeDate: parsedLastData.pdfDetails.valuationMadeDate || '',
                        valuersName: parsedLastData.pdfDetails.valuersName || '',
                        fairMarketValueWords: parsedLastData.pdfDetails.fairMarketValueWords || '',
                    };

                    // Merge ALL prefilled data
                    mergedPdfDetails = {
                        ...mergedPdfDetails,
                        ...generalFields,
                        ...valuationFields,
                        ...marketFields,
                        ...unitSpecificationsFields
                    };

                    ('[DEBUG] Prefilled ALL fields from lastBomflatData');
                }

                // Prefill custom fields from last bomflat data (only for new forms)
                if (isNewForm && parsedLastData.customFields && Array.isArray(parsedLastData.customFields)) {
                    ('[DEBUG] Prefilling custom fields from lastBomflatData:', parsedLastData.customFields.length);
                    setCustomFields(parsedLastData.customFields);
                }
            }

            // 2. Apply tab-specific data (overrides prefill)
            if (generalTabData) {
                ('[DEBUG] Applying generalTabData');
                mergedPdfDetails = { ...mergedPdfDetails, ...JSON.parse(generalTabData) };
            }
            if (valuationTabData) {
                ('[DEBUG] Applying valuationTabData');
                mergedPdfDetails = { ...mergedPdfDetails, ...JSON.parse(valuationTabData) };
            }
            if (marketTabData) {
                ('[DEBUG] Applying marketTabData');
                mergedPdfDetails = { ...mergedPdfDetails, ...JSON.parse(marketTabData) };
            }

            // Apply merged data to form state
            setFormData(prev => ({
                ...prev,
                pdfDetails: mergedPdfDetails
            }));

            ('[DEBUG] prefillAndLoadTabData completed - all fields merged');
        } catch (error) {
            console.error('[DEBUG] Error in prefillAndLoadTabData:', error);
        }
    };

    // Prefill the three tabs with data from last previous bomflat form
    const prefillTabsFromPreviousBomflatData = (currentFormData = null) => {
        try {
            // Get the last previous bomflat form data from localStorage
            const lastBomflatData = localStorage.getItem('last_bomflat_form_data');
            ('[DEBUG] Prefill - Retrieved lastBomflatData from localStorage:', lastBomflatData ? 'FOUND' : 'NOT FOUND');
            ('[DEBUG] Current formData passed:', currentFormData ? 'YES' : 'NO');

            if (lastBomflatData) {
                const parsedLastData = JSON.parse(lastBomflatData);
                ('[DEBUG] Prefill - Parsed data:', {
                    ownerNameAddress: parsedLastData.pdfDetails?.ownerNameAddress,
                    postalAddress: parsedLastData.pdfDetails?.postalAddress,
                    cityTown: parsedLastData.pdfDetails?.cityTown
                });

                // Extract pdfDetails from last bomflat form
                if (parsedLastData.pdfDetails) {
                    // GENERAL TAB fields from last bomflat
                     const generalTabData = {
                         ownerNameAddress: parsedLastData.pdfDetails.ownerNameAddress || '',
                         briefDescriptionProperty: parsedLastData.pdfDetails.briefDescriptionProperty || '',
                         place: parsedLastData.pdfDetails.place || '',
                         dateOfInspection: parsedLastData.pdfDetails.dateOfInspection || '',
                         purposeOfValuation: parsedLastData.pdfDetails.purposeOfValuation || '',
                         listOfDocumentsProduced: parsedLastData.pdfDetails.listOfDocumentsProduced || '',
                         dateOfValuationMade: parsedLastData.pdfDetails.dateOfValuationMade || '',
                         referenceNo: parsedLastData.pdfDetails.referenceNo || ''
                     };

                    // VALUATION TAB fields from last bomflat
                    const valuationTabData = {
                        postalAddress: parsedLastData.pdfDetails.postalAddress || '',
                        cityTown: parsedLastData.pdfDetails.cityTown || '',
                        plotSurveyNo: parsedLastData.pdfDetails.plotSurveyNo || '',
                        doorNo: parsedLastData.pdfDetails.doorNo || '',
                        tpVillage: parsedLastData.pdfDetails.tpVillage || '',
                        wardTaluka: parsedLastData.pdfDetails.wardTaluka || '',
                        mandalDistrict: parsedLastData.pdfDetails.mandalDistrict || ''
                    };

                    // MARKET TAB fields from last bomflat
                    const marketTabData = {
                        residentialArea: parsedLastData.pdfDetails.residentialArea || false,
                        commercialArea: parsedLastData.pdfDetails.commercialArea || false,
                        industrialArea: parsedLastData.pdfDetails.industrialArea || false,
                        marketability: parsedLastData.pdfDetails.marketability || '',
                        favoringFactors: parsedLastData.pdfDetails.favoringFactors || '',
                        negativeFactors: parsedLastData.pdfDetails.negativeFactors || ''
                    };

                    // Save to localStorage for current form persistence
                    saveTabDataToLocalStorage('general', generalTabData);
                    saveTabDataToLocalStorage('valuation', valuationTabData);
                    saveTabDataToLocalStorage('market', marketTabData);

                    // Apply to form state immediately
                    setFormData(prev => ({
                        ...prev,
                        pdfDetails: {
                            ...prev.pdfDetails,
                            ...generalTabData,
                            ...valuationTabData,
                            ...marketTabData
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Error prefilling tabs from previous bomflat data:', error);
        }
    };

    // Save current bomflat form data as last form for future prefilling
    const saveCurrentBomflatDataAsLast = () => {
        try {
            // Save the complete current form data including custom fields
            const dataToSave = {
                pdfDetails: formData.pdfDetails,
                customFields: customFields
            };
            ('[DEBUG] Saving to last_bomflat_form_data - customFields count:', customFields.length);
            localStorage.setItem('last_bomflat_form_data', JSON.stringify(dataToSave));
            ('[DEBUG] Successfully saved last_bomflat_form_data with custom fields');
        } catch (error) {
            console.error('Error saving current bomflat data as last form:', error);
        }
    };

    // Save tab-specific data to localStorage
    const saveTabDataToLocalStorage = (tabName, fields) => {
        try {
            const tabKey = `bomflat_${tabName}_${id}`;
            const existingData = localStorage.getItem(tabKey);
            const parsedExistingData = existingData ? JSON.parse(existingData) : {};

            // Merge new fields with existing data
            const mergedData = { ...parsedExistingData, ...fields };
            localStorage.setItem(tabKey, JSON.stringify(mergedData));
        } catch (error) {
            console.error(`Error saving ${tabName} tab data to localStorage:`, error);
        }
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
            if (!user) {
                showError('Authentication required. Please log in.');
                onLogin?.();
                return;
            }
            dispatch(showLoader());
            // Include custom fields in the data being saved
            const dataToSave = {
                ...formData,
                customFields: customFields
            };
            await updateBofMaharashtra(id, dataToSave, user.username, user.role, user.clientId);
            invalidateCache();
            dispatch(hideLoader());

            // Save current form data as last bomflat form for prefilling next form
            saveCurrentBomflatDataAsLast();

            // Clear tab-specific localStorage after successful save
            localStorage.removeItem(`bomflat_general_${id}`);
            localStorage.removeItem(`bomflat_valuation_${id}`);
            localStorage.removeItem(`bomflat_market_${id}`);

            showSuccess('BOF Maharashtra form saved successfully');
        } catch (error) {
            console.error("Error saving BOF Maharashtra form:", error);
            dispatch(hideLoader());
            showError('Failed to save BOF Maharashtra form');
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

            // Save to localStorage for current active tab
            saveTabDataToLocalStorage(activeValuationSubTab, { [field]: value });

            return {
                ...prev,
                pdfDetails: newPdfDetails
            };
        });
    };

    const handleLocationImageUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
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

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
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

    const handleManagerAction = async (action) => {
        // For Approve action, trigger Save first
        if (action === "approve") {
            try {
                // Create a promise to handle the async save
                const savePromise = new Promise((resolve, reject) => {
                    // Dispatch and execute handleSave
                    dispatch(showLoader("Saving form..."));
                    
                    // Temporarily override error handling to resolve instead of reject
                    const originalError = showError;
                    let saveSucceeded = false;
                    
                    // Call handleSave with error tracking
                    (async () => {
                        try {
                            if (!user) {
                                showError('Authentication required. Please log in.');
                                onLogin?.();
                                reject(new Error('Not authenticated'));
                                return;
                            }
                            
                            // Include custom fields in the data being saved
                            const dataToSave = {
                                ...formData,
                                customFields: customFields
                            };
                            await updateBofMaharashtra(id, dataToSave, user.username, user.role, user.clientId);
                            invalidateCache();
                            
                            // Save current form data as last bomflat form for prefilling next form
                            saveCurrentBomflatDataAsLast();
                            
                            // Clear tab-specific localStorage after successful save
                            localStorage.removeItem(`bomflat_general_${id}`);
                            localStorage.removeItem(`bomflat_valuation_${id}`);
                            localStorage.removeItem(`bomflat_market_${id}`);
                            
                            showSuccess('BOF Maharashtra form saved successfully');
                            saveSucceeded = true;
                            resolve();
                        } catch (error) {
                            console.error("Error saving BOF Maharashtra form:", error);
                            showError('Failed to save BOF Maharashtra form');
                            reject(error);
                        } finally {
                            dispatch(hideLoader());
                        }
                    })();
                });
                
                await savePromise;
                
                // If save succeeded, proceed with approval
                setModalAction(action);
                setModalFeedback("");
                setModalOpen(true);
            } catch (error) {
                console.error('Save failed before approval:', error);
                // Don't open modal if save failed
                return;
            }
        } else {
            // For Reject action, open modal directly
            setModalAction(action);
            setModalFeedback("");
            setModalOpen(true);
        } 
    };

    const handleModalOk = async () => {
        const statusValue = modalAction === "approve" ? "approved" : "rejected";
        const actionLabel = modalAction === "approve" ? "Approve" : "Reject";

        try {
            if (!user) {
                showError('Authentication required. Please log in.');
                onLogin?.();
                return;
            }
            setLoading(true);
            dispatch(showLoader(`${actionLabel}ing form...`));

            const responseData = await managerSubmitBofMaharashtra(id, statusValue, modalFeedback, user.username, user.role);

             invalidateCache("/bof-maharashtra");

             // Update the form state with response data from backend
             setValuation(responseData);

             // Save current form data as last bomflat form for prefilling next form
             saveCurrentBomflatDataAsLast();

             showSuccess(`BOF Maharashtra form ${statusValue} successfully!`);
             dispatch(hideLoader());
             setModalOpen(false);

            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 300);
        } catch (err) {
            showError(err.message || `Failed to ${actionLabel.toLowerCase()} form`);
            dispatch(hideLoader());
            setLoading(false);
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
            setLoading(true);
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
            const [uploadedPropertyImages, uploadedLocationImages, uploadedSupportingImages, uploadedAreaImages] = await Promise.all([
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
                })(),
                (async () => {
                    // Handle area images - upload any with file objects
                    const areaImagesObj = {};
                    const areaImagesToUpload = {};

                    if (formData.areaImages && typeof formData.areaImages === 'object') {
                        for (const [area, images] of Object.entries(formData.areaImages)) {
                            if (Array.isArray(images)) {
                                const filesToUpload = images.filter(img => img && img.file);
                                const previousImages = images.filter(img => img && !img.file);

                                areaImagesObj[area] = previousImages;

                                if (filesToUpload.length > 0) {
                                    areaImagesToUpload[area] = filesToUpload;
                                }
                            }
                        }
                    }

                    // Upload any new files
                    const uploadPromises = [];
                    for (const [area, files] of Object.entries(areaImagesToUpload)) {
                        if (files.length > 0) {
                            uploadPromises.push(
                                uploadPropertyImages(files, valuation.uniqueId).then(uploaded => ({
                                    area,
                                    uploaded
                                }))
                            );
                        }
                    }

                    if (uploadPromises.length > 0) {
                        const results = await Promise.all(uploadPromises);
                        for (const result of results) {
                            const uploadedImages = result.uploaded.map(img => ({
                                fileName: img.originalFileName || img.publicId || 'Image',
                                size: img.bytes || img.size || 0,
                                url: img.url
                            }));
                            areaImagesObj[result.area] = [
                                ...(areaImagesObj[result.area] || []),
                                ...uploadedImages
                            ];
                        }
                    }

                    return areaImagesObj;
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
            payload.areaImages = uploadedAreaImages || {};

            // Clear draft before API call
            localStorage.removeItem(`valuation_draft_${username}`);

            // Call API to update BOF Maharashtra form
            ("[bomflat.jsx] Payload being sent to API:", {
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
            const apiResponse = await updateBofMaharashtra(id, payload, username, role, clientId);
            invalidateCache("/bof-maharashtra");

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
            setLoading(false);
        }
    };

    const renderGeneralTab = () => (
        <div className="space-y-6">
            {/* Purpose of Valuation & Owner Information */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4">Purpose of Valuation & Owner Information</h4>
                <div className="space-y-3">
                    {/* Purpose of Valuation Fields */}
                    <div className="max-w-6xl">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Purpose of Valuation</Label>
                                <Input
                                    placeholder="e.g., Mortgage/Loan Purpose"
                                    value={formData.pdfDetails?.purposeOfValuation || ""}
                                    onChange={(e) => handleValuationChange('purposeOfValuation', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Place</Label>
                                <Input
                                    type="text"
                                    placeholder="e.g., City/Location"
                                    value={formData.pdfDetails?.place || ""}
                                    onChange={(e) => handleValuationChange('place', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">List of Documents Produced</Label>
                                <Input
                                    placeholder="Enter list of documents"
                                    value={formData.pdfDetails?.listOfDocumentsProduced || ""}
                                    onChange={(e) => handleValuationChange('listOfDocumentsProduced', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="max-w-4xl">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                             <div className="space-y-1">
                                 <Label className="text-xs font-bold text-gray-900">Date of Inspection</Label>
                                 <Input
                                     type="date"
                                     value={formData.pdfDetails?.dateOfInspection || ""}
                                     onChange={(e) => handleValuationChange('dateOfInspection', e.target.value)}
                                     disabled={!canEdit}
                                     className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                 />
                             </div>
                             <div className="space-y-1">
                                 <Label className="text-xs font-bold text-gray-900">Date of Valuation Made</Label>
                                 <Input
                                     type="date"
                                     value={formData.pdfDetails?.dateOfValuationMade || ""}
                                     onChange={(e) => handleValuationChange('dateOfValuationMade', e.target.value)}
                                     disabled={!canEdit}
                                     className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                 />
                             </div>
                             <div className="space-y-1">
                                 <Label className="text-xs font-bold text-gray-900">Reference No.</Label>
                                 <Input
                                     type="text"
                                     placeholder="Enter reference number"
                                     value={formData.pdfDetails?.referenceNo || ""}
                                     onChange={(e) => handleValuationChange('referenceNo', e.target.value)}
                                     disabled={!canEdit}
                                     className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                 />
                             </div>
                         </div>
                     </div>

                    {/* Owner Information Fields */}
                    <div className="pt-3 border-t border-blue-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Owner Name & Address with Phone</Label>
                                <Input
                                    placeholder="Enter owner name and address"
                                    value={formData.pdfDetails?.ownerNameAddress || ""}
                                    onChange={(e) => handleValuationChange('ownerNameAddress', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Brief Description of Property</Label>
                                <Input
                                    placeholder="Enter brief description"
                                    value={formData.pdfDetails?.briefDescriptionProperty || ""}
                                    onChange={(e) => handleValuationChange('briefDescriptionProperty', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                        <Label className="text-xs font-bold text-gray-900"> Any other comments by our empanelled valuer on authentic of approved map</Label>
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
                        <Input
                            placeholder="Enter full address"
                            value={formData.pdfDetails?.postalAddress || ""}
                            onChange={(e) => handleValuationChange('postalAddress', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotNorthActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotNorthActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
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
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotSouthActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotSouthActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
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
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotEastActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotEastActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
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
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesPlotWestActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesPlotWestActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
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
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopNorthActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopNorthActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
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
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopSouthActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopSouthActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
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
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopEastActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopEastActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
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
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <Input
                                            placeholder="NA"
                                            value={formData.pdfDetails?.boundariesShopWestActual || ""}
                                            onChange={(e) => handleValuationChange('boundariesShopWestActual', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* EXTENT OF THE UNIT & OCCUPANCY DETAILS + AREA CLASSIFICATION */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Section - Extent of the Site & Occupancy Details */}
                <div className="lg:col-span-1 p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-4">Extent of the Site & Occupancy Details</h4>
                    <div className="grid grid-cols-1 gap-3">
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
                            <Label className="text-xs font-bold text-gray-900">Whether occupied by the owner/tenant? If occupied by tenant, since how long? Rent received per month</Label>
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

                {/* Right Section - Area Classification */}
                <div className="lg:col-span-2 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                    <h4 className="font-bold text-gray-900 mb-4">Area Classification</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    {/* Dimensions of the Unit inside Area Classification */}
                    <div className="border-t border-teal-200 mt-6 pt-6">
                        <h5 className="font-bold text-gray-900 mb-4 text-sm">Dimensions of the Unit</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>
            </div>
        </div>
    );

    const renderValuationTab = () => {
        // Helper function to format numbers as Indian currency
        const formatIndianCurrency = (value) => {
            if (!value) return '₹0.00';
            const num = parseFloat(value) || 0;
            return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // Helper function to round to nearest 1000
        const roundToNearestThousand = (value) => {
            const num = parseFloat(value) || 0;
            return Math.round(num / 1000) * 1000;
        };

        // Calculate total valuation from all items
        const calculateTotalValuation = () => {
            const values = [
                parseFloat(formData.pdfDetails?.presentValue) || 0,
                parseFloat(formData.pdfDetails?.wardrobes) || 0,
                parseFloat(formData.pdfDetails?.showcases) || 0,
                parseFloat(formData.pdfDetails?.kitchenArrangements) || 0,
                parseFloat(formData.pdfDetails?.superfineFinish) || 0,
                parseFloat(formData.pdfDetails?.interiorDecorations) || 0,
                parseFloat(formData.pdfDetails?.electricityDeposits) || 0,
                parseFloat(formData.pdfDetails?.collapsibleGates) || 0,
                parseFloat(formData.pdfDetails?.potentialValue) || 0,
                parseFloat(formData.pdfDetails?.otherItems) || 0
            ];
            return values.reduce((sum, val) => sum + val, 0);
        };

        const totalValuation = calculateTotalValuation();
        const roundFigureTotal = roundToNearestThousand(totalValuation);
        const realisableValue = totalValuation * 0.9;
        const distressValue = totalValuation * 0.8;
        const insurableValue = totalValuation * 0.35;

        return (
            <div className="space-y-6">
                {/* VALUATION ITEMS TABLE */}
                <div className="mb-6 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Valuation Details Table</h4>
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-rose-100 border border-rose-200">
                                    <th className="px-2 py-3 text-left font-bold text-gray-900 border border-rose-200 min-w-[50px]">Sr. No.</th>
                                    <th className="px-2 py-3 text-left font-bold text-gray-900 border border-rose-200 min-w-[200px]">Description</th>
                                    <th className="px-2 py-3 text-left font-bold text-gray-900 border border-rose-200 min-w-[120px]">Qty/Sq. ft.</th>
                                    <th className="px-2 py-3 text-left font-bold text-gray-900 border border-rose-200 min-w-[140px]">Rate</th>
                                    <th className="px-2 py-3 text-left font-bold text-gray-900 border border-rose-200 min-w-[150px]">Estimated Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Present Value of Flat */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">1</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Present Value of Hard Built up area</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.presentValueQty || ""} onChange={(e) => handleValuationChange('presentValueQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.presentValueRate || ""} onChange={(e) => handleValuationChange('presentValueRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.presentValue || ""} onChange={(e) => handleValuationChange('presentValue', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Wardrobes */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">2</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Wardrobes</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.wardrobesQty || ""} onChange={(e) => handleValuationChange('wardrobesQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.wardrobesRate || ""} onChange={(e) => handleValuationChange('wardrobesRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.wardrobes || ""} onChange={(e) => handleValuationChange('wardrobes', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Showcases */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">3</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Show cases, Almirah</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.showcasesQty || ""} onChange={(e) => handleValuationChange('showcasesQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.showcasesRate || ""} onChange={(e) => handleValuationChange('showcasesRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.showcases || ""} onChange={(e) => handleValuationChange('showcases', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Kitchen Arrangements */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">4</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Kitchen arrangements</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.kitchenArrangementsQty || ""} onChange={(e) => handleValuationChange('kitchenArrangementsQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.kitchenArrangementsRate || ""} onChange={(e) => handleValuationChange('kitchenArrangementsRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.kitchenArrangements || ""} onChange={(e) => handleValuationChange('kitchenArrangements', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Superficial Finish */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">5</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Superfine Finish</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.superfineFinishQty || ""} onChange={(e) => handleValuationChange('superfineFinishQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.superfineFinishRate || ""} onChange={(e) => handleValuationChange('superfineFinishRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.superfineFinish || ""} onChange={(e) => handleValuationChange('superfineFinish', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Interiors, Decorations */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">6</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Interior Decorations</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.interiorDecorationsQty || ""} onChange={(e) => handleValuationChange('interiorDecorationsQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.interiorDecorationsRate || ""} onChange={(e) => handleValuationChange('interiorDecorationsRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.interiorDecorations || ""} onChange={(e) => handleValuationChange('interiorDecorations', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Electrical Deposits */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">7</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Electricity Deposits</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.electricityDepositsQty || ""} onChange={(e) => handleValuationChange('electricityDepositsQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.electricityDepositsRate || ""} onChange={(e) => handleValuationChange('electricityDepositsRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.electricityDeposits || ""} onChange={(e) => handleValuationChange('electricityDeposits', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Collapsible Gates */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">8</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Collapsible Gates</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.collapsibleGatesQty || ""} onChange={(e) => handleValuationChange('collapsibleGatesQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.collapsibleGatesRate || ""} onChange={(e) => handleValuationChange('collapsibleGatesRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.collapsibleGates || ""} onChange={(e) => handleValuationChange('collapsibleGates', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Potential Value */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">9</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Potential Value</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.potentialValueQty || ""} onChange={(e) => handleValuationChange('potentialValueQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.potentialValueRate || ""} onChange={(e) => handleValuationChange('potentialValueRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.potentialValue || ""} onChange={(e) => handleValuationChange('potentialValue', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Others */}
                                <tr className="border border-rose-200">
                                    <td className="px-2 py-2 border border-rose-200 text-xs font-bold text-center">10</td>
                                    <td className="px-2 py-2 border border-rose-200 text-xs">Others</td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.otherItemsQty || ""} onChange={(e) => handleValuationChange('otherItemsQty', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.otherItemsRate || ""} onChange={(e) => handleValuationChange('otherItemsRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                    <td className="px-2 py-2 border border-rose-200"><Input type="number" value={formData.pdfDetails?.otherItems || ""} onChange={(e) => handleValuationChange('otherItems', e.target.value)} disabled={!canEdit} className="h-7 text-xs border border-neutral-300 bg-white rounded-lg px-2 py-1 w-full" /></td>
                                </tr>
                                {/* Total Row */}
                                <tr className="bg-rose-200 border border-rose-300 font-bold">
                                    <td colSpan="4" className="px-2 py-3 border border-rose-300 text-xs text-right">TOTAL</td>
                                    <td className="px-2 py-3 border border-rose-300 text-xs text-gray-900">{formatIndianCurrency(totalValuation)}</td>
                                </tr>
                                {/* Round Figure Row */}
                                <tr className="bg-orange-200 border border-orange-300 font-bold">
                                    <td colSpan="4" className="px-2 py-3 border border-orange-300 text-xs text-right">ROUND FIGURE</td>
                                    <td className="px-2 py-3 border border-orange-300 text-xs text-gray-900">{formatIndianCurrency(roundFigureTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* VALUE OF FLAT - AUTO-CALCULATED RESULTS SECTION */}
                <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Value of Flat - Auto-Calculated Results</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-gray-900">Total Valuation (Market Value)</Label>
                            <Input
                                type="number"
                                placeholder="Auto-calculated or enter value"
                                value={formData.pdfDetails?.fairMarketValue || ""}
                                onChange={(e) => handleValuationChange('fairMarketValue', e.target.value)}
                                disabled={!canEdit}
                                className="h-9 text-xs rounded-lg border border-teal-300 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 px-3 w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-gray-900">Realisable Value (90%)</Label>
                            <Input
                                type="number"
                                placeholder="Auto-calculated or enter value"
                                value={formData.pdfDetails?.realizableValue || ""}
                                onChange={(e) => handleValuationChange('realizableValue', e.target.value)}
                                disabled={!canEdit}
                                className="h-9 text-xs rounded-lg border border-teal-300 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 px-3 w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-gray-900">Distress Value (80%)</Label>
                            <Input
                                type="number"
                                placeholder="Auto-calculated or enter value"
                                value={formData.pdfDetails?.distressValue || ""}
                                onChange={(e) => handleValuationChange('distressValue', e.target.value)}
                                disabled={!canEdit}
                                className="h-9 text-xs rounded-lg border border-teal-300 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 px-3 w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-gray-900">Insurable Value (35%)</Label>
                            <Input
                                type="number"
                                placeholder="Auto-calculated or enter value"
                                value={formData.pdfDetails?.insurableValue || ""}
                                onChange={(e) => handleValuationChange('insurableValue', e.target.value)}
                                disabled={!canEdit}
                                className="h-9 text-xs rounded-lg border border-teal-300 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 px-3 w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-gray-900">Agreement Value</Label>
                            <Input
                                type="number"
                                placeholder="Enter Agreement Value"
                                value={formData.pdfDetails?.agreementValue || ""}
                                onChange={(e) => handleValuationChange('agreementValue', e.target.value)}
                                disabled={!canEdit}
                                className="h-9 text-xs rounded-lg border border-teal-300 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 px-3 w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-gray-900">Value as per Circle Rate</Label>
                            <Input
                                type="number"
                                placeholder="Enter Value as per Circle Rate"
                                value={formData.pdfDetails?.valueCircleRate || ""}
                                onChange={(e) => handleValuationChange('valueCircleRate', e.target.value)}
                                disabled={!canEdit}
                                className="h-9 text-xs rounded-lg border border-teal-300 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 px-3 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* APARTMENT NATURE & LOCATION */}
                <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-4">Apartment Nature & Location</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Nature of the Apartment</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Location</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">C.T.S. No.</Label>
                            <Input
                                placeholder="e.g., Plot number"
                                value={formData.pdfDetails?.apartmentCTSNo || ""}
                                onChange={(e) => handleValuationChange('apartmentCTSNo', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Sector No.</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Block No.</Label>
                            <Input
                                placeholder="e.g., A"
                                value={formData.pdfDetails?.apartmentBlockNo || ""}
                                onChange={(e) => handleValuationChange('apartmentBlockNo', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Ward No.</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Village / Municipality / Corporation</Label>
                            <Input
                                placeholder="e.g., CIDCO"
                                value={formData.pdfDetails?.apartmentVillageMunicipalityCounty || ""}
                                onChange={(e) => handleValuationChange('apartmentVillageMunicipalityCounty', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Door No. / Street or Road</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Pin Code</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Description of the locality (Residential / Commercial / Mixed)</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Year of Construction</Label>
                            <Input
                                placeholder="e.g., 1993"
                                value={formData.pdfDetails?.yearOfConstruction || ""}
                                onChange={(e) => handleValuationChange('yearOfConstruction', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Number of Floors</Label>
                            <Input
                                placeholder="e.g., 5"
                                value={formData.pdfDetails?.numberOfFloors || ""}
                                onChange={(e) => handleValuationChange('numberOfFloors', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Type of structure</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Number of dwelling units in the building</Label>
                            <Input
                                placeholder="e.g., 10"
                                value={formData.pdfDetails?.numberOfDwellingUnitsInBuilding || ""}
                                onChange={(e) => handleValuationChange('numberOfDwellingUnitsInBuilding', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Quality of Construction</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Appearance of the Building</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Maintenance of the Building</Label>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Lift</Label>
                            <select value={formData.pdfDetails?.liftAvailable || ""} onChange={(e) => handleValuationChange('liftAvailable', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                                <option value="">Select</option>
                                <option value="Available">Available</option>
                                <option value="Not Available">Not Available</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Protected water supply</Label>
                            <select value={formData.pdfDetails?.protectedWaterSupply || ""} onChange={(e) => handleValuationChange('protectedWaterSupply', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                                <option value="">Select</option>
                                <option value="Available">Available</option>
                                <option value="Not Available">Not Available</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Underground Sewerage</Label>
                            <select value={formData.pdfDetails?.undergroundSewerage || ""} onChange={(e) => handleValuationChange('undergroundSewerage', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                                <option value="">Select</option>
                                <option value="Available">Available</option>
                                <option value="Not Available">Not Available</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Car parking (Open/Covered)</Label>
                            <select value={formData.pdfDetails?.carParkingOpenCovered || ""} onChange={(e) => handleValuationChange('carParkingOpenCovered', e.target.value)} disabled={!canEdit} className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                                <option value="">Select</option>
                                <option value="Open">Open</option>
                                <option value="Covered">Covered</option>
                                <option value="Not Available">Not Available</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Compound Wall</Label>
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
                        {formData.pdfDetails?.othersFacility === "Yes" && (
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-900">Please specify other facilities</Label>
                                <Input
                                    placeholder="e.g., Swimming pool, Gym, etc..."
                                    value={formData.pdfDetails?.facilityOthers || ""}
                                    onChange={(e) => handleValuationChange('facilityOthers', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderMarketAnalysisTab = () => (
        <div className="space-y-6">
            {/* MARKETABILITY & RATE ANALYSIS SECTION */}
            <div className="mb-6 p-6 bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-2xl border border-cyan-200">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Marketability & Rate Analysis</h4>
                <div className="space-y-4">
                    {/* Marketability Section */}
                    <div className="pt-2">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Marketability</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            <div className="space-y-1.5">
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


                    {/* Rate Analysis Section */}
                    <div className="pt-2">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Rate Analysis</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            <div className="space-y-1.5">
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
                </div>
            </div>

            {/* BREAK-UP FOR THE RATE & TOTAL COMPOSITE RATE */}
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-green-50 rounded-2xl border border-purple-200">
                <h4 className="font-bold text-gray-900 mb-4">Break-up & Total Composite Rate</h4>
                <div className="space-y-4">
                    {/* Break-up Section */}
                    <div className="pt-2">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Break-up for the above Rate</h5>
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



                    {/* Composite Rate After Depreciation Section */}
                    <div className="pt-2">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Composite Rate after Depreciation</h5>
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



                    {/* Total Composite Rate Section */}
                    <div className="pt-2">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Total Composite Rate</h5>
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

    const renderFlatTab = () => (
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

            {/* UNIT AREA DETAILS */}
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
                </div>
            </div>

            {/* UNIT MAINTENANCE */}
            <div className="mb-6 p-6 bg-fuchsia-50 rounded-2xl border border-fuchsia-100">
                <h4 className="font-bold text-gray-900 mb-4">Unit Maintenance</h4>
                <div className="grid grid-cols-1 gap-4">
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

            {/* UNIT CLASSIFICATION */}
            <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <h4 className="font-bold text-gray-900 mb-4">Unit Classification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Classification - Posh</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.classificationPosh || ""}
                            onChange={(e) => handleValuationChange('classificationPosh', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-900">Classification - Usage</Label>
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
                </div>
            </div>
        </div>
    );

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
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">BOF Maharashtra Valuation Form</h1>
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
                                    <p className="text-sm font-medium text-neutral-900">{valuation?.status ? valuation.status.charAt(0).toUpperCase() + valuation.status.slice(1) : 'Pending'}</p>
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
                            <CardHeader className="bg-neutral-50 text-neutral-900 p-4 border-b border-neutral-200">
                                <CardTitle className="text-sm font-bold text-neutral-900">BOF Maharashtra Details</CardTitle>
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
                                                areaImagePreviews={formData.areaImages || {}}
                                                formType="bomFlat"
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
                                                    { id: 'market', label: 'MARKET' }
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
                                                {activeValuationSubTab === 'market' && renderMarketAnalysisTab()}
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

                                    {/* Submit Buttons */}
                                    <div className="flex gap-2 pt-3 border-t border-neutral-200">
                                        <Button
                                            type="button"
                                            onClick={handleDownloadPDF}
                                            disabled={loading}
                                            className="flex-1 h-9 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-1.5 whitespace-nowrap"
                                        >
                                            <FaDownload size={12} />
                                            PDF
                                        </Button>
                                        {canEdit && (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={onFinish}
                                                    disabled={loading}
                                                    className="flex-1 h-9 text-xs font-bold rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 whitespace-nowrap"
                                                >
                                                    {loading ? "Saving..." : "Save"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => navigate("/dashboard")}
                                                    disabled={loading}
                                                    className="flex-1 h-9 text-xs font-bold rounded-lg border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-900 transition-all whitespace-nowrap"
                                                >
                                                    Back
                                                </Button>
                                            </>
                                        )}

                                        {canApprove && (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleManagerAction("approve")}
                                                    disabled={loading}
                                                    className="flex-1 h-9 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 whitespace-nowrap"
                                                >
                                                    {loading ? "Processing..." : "Approve"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleManagerAction("reject")}
                                                    disabled={loading}
                                                    className="flex-1 h-9 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 whitespace-nowrap"
                                                >
                                                    {loading ? "Processing..." : "Reject"}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Approval/Rejection Dialog */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {modalAction === "approve" ? "Approve Form" : "Reject Form"}
                        </DialogTitle>
                        <DialogDescription>
                            {modalAction === "approve" ? "Enter approval notes (optional)" : "Please provide feedback for rejection"}
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        placeholder={modalAction === "approve" ? "Enter approval notes (optional)" : "Please provide feedback for rejection"}
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
                            variant={modalAction === "approve" ? "default" : "destructive"}
                            onClick={handleModalOk}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : (modalAction === "approve" ? "Approve" : "Reject")}
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

export default BOfMaharastraEditForm; 