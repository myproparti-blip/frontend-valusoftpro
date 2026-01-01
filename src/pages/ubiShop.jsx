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
import { getValuationById, updateValuation, managerSubmit } from "../services/ubiShopService";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { useNotification } from "../context/NotificationContext";
import { uploadPropertyImages, uploadLocationImages, uploadDocuments } from "../services/imageService";
import { invalidateCache } from "../services/axios";
import { getCustomOptions } from "../services/customOptionsService";
import ClientInfoPanel from "../components/ClientInfoPanel";
import DocumentsPanel from "../components/DocumentsPanel";
import { generateRecordPDFOffline } from "../services/ubiShopPdf";

const EditValuationPage = ({ user, onLogin }) => {
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
    const [activeValuationSubTab, setActiveValuationSubTab] = useState("documents");
    const [customFields, setCustomFields] = useState([]);
    const [customFieldName, setCustomFieldName] = useState("");
    const [customFieldValue, setCustomFieldValue] = useState("");
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [isFirstSave, setIsFirstSave] = useState(true); // Track if this is the first save of a new form
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
            referenceNo: '',
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
            agreementForSale: '',
            commencementCertificate: '',
            occupancyCertificate: '',
            ownerNameAddress: '',
            briefDescriptionProperty: '',

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
            // Legacy fields (for backward compatibility)
            boundariesPlotNorth: '',
            boundariesPlotSouth: '',
            boundariesPlotEast: '',
            boundariesPlotWest: '',
            boundariesShopNorth: '',
            boundariesShopSouth: '',
            boundariesShopEast: '',
            boundariesShopWest: '',

            // DIMENSIONS OF THE UNIT - Section 13
            dimensionsDeed: '',
            dimensionsActual: '',

            // EXTENT OF THE UNIT - Section 14
            extentOfUnit: '',
            latitudeLongitude: '',

            // EXTENT OF SITE CONSIDERED FOR VALUATION - Section 15
            extentOfSiteValuation: '',

            // SECTION 16 - OCCUPANCY
            rentReceivedPerMonth: '',

            // APARTMENT BUILDING DETAILS - Section II
            apartmentNature: '',
            apartmentLocation: '',
            apartmentTSNo: '',
            apartmentBlockNo: '',
            apartmentWardNo: '',
            apartmentVillageMunicipalityCounty: '',
            apartmentDoorNoStreetRoadPinCode: '',

            // APARTMENT BUILDING SUBSECTIONS
            descriptionOfLocalityResidentialCommercialMixed: '',
            yearOfConstruction: '',
            numberOfFloors: '',
            typeOfStructure: '',
            numberOfDwellingUnitsInBuilding: '',
            qualityOfConstruction: '',
            appearanceOfBuilding: '',
            maintenanceOfBuilding: '',





            fairMarketValue: '',
            realizableValue: '',
            distressValue: '',
            saleDeedValue: '',
            insurableValue: '',
            totalJantriValue: '',

            // FLAT SPECIFICATIONS EXTENDED
            areaUsage: '',
            carpetAreaFlat: '',

            // MONTHLY RENT
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
            compositeRateAfterDepreciation: '',
            deprecatedRatio: '',

            // TOTAL COMPOSITE RATE
            totalCompositeRate: '',
            rateForLandOther: '',

            // VALUATION DETAILS - Items
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
            totalValueSay: '',

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

            // SECTION 3: UNIT SPECIFICATIONS
            unitFloor: '',
            unitDoorNo: '',
            unitRoof: '',
            unitFlooring: '',
            unitDoors: '',
            unitWindows: '',
            unitFittings: '',
            unitFinishing: '',

            // SECTION 4: UNIT TAX
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

            // VALUER DETAILS & SIGNATURE
            valuersName: '',
            valuersCompany: '',
            valuersLicense: '',
            valuationPlace: '',
            valuationDate: '',
            bankerSignatureDate: '',
            memberSinceDate: '',

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
            caveatsLimitations: ''
        },

        // BUILDING CONSTRUCTION DETAILS
        buildingConstruction: {
            localityDescription: '',
            yearOfConstruction: '',
            numberOfFloors: '',
            typeOfStructure: '',
            numberOfDwellingUnits: '',
            qualityOfConstruction: '',
            appearanceOfBuilding: '',
            maintenanceOfBuilding: ''
        },

        // CUSTOM FIELDS FOR DROPDOWN HANDLING
        customBankName: '',
        customCity: ''
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

    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);
    const fileInputRef3 = useRef(null);
    const fileInputRef4 = useRef(null);
    const locationFileInputRef = useRef(null);
    const documentFileInputRef = useRef(null);
    const dropdownFetchedRef = useRef(false);

    const { showSuccess, showError } = useNotification();
    const username = user?.username || "";
    const role = user?.role || "";
    const clientId = user?.clientId || "";

    // Helper function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Helper function to calculate Say value from table items
    const calculateSayValue = () => {
        const total = [
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
        ].reduce((sum, val) => sum + val, 0);
        // Always auto-round based on current table values
        return Math.round(total / 1000) * 1000;
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
    useLayoutEffect(() => {
        setFormData(prev => ({
            ...prev,
            bankName: bankName,
            city: city,
            dsa: dsa,
            engineerName: engineerName
        }));
    }, [bankName, city, dsa, engineerName]);

    // Save current ubiShop form data to localStorage whenever formData updates
    // This ensures the data is available for prefilling the next ubiShop form
    useEffect(() => {
        if (formData && formData.pdfDetails && id) {
            // Check if ANY prefillable field has data
            const prefillableFields = [
                // General/Location fields
                formData.pdfDetails.ownerNameAddress,
                formData.pdfDetails.briefDescriptionProperty,
                formData.pdfDetails.postalAddress,
                formData.pdfDetails.cityTown,
                formData.pdfDetails.plotSurveyNo,
                formData.pdfDetails.doorNo,
                formData.pdfDetails.tpVillage,
                formData.pdfDetails.wardTaluka,
                formData.pdfDetails.mandalDistrict,
                // Building/Construction fields
                formData.pdfDetails.yearOfConstruction,
                formData.pdfDetails.numberOfFloors,
                formData.pdfDetails.typeOfStructure,
                formData.pdfDetails.numberOfDwellingUnitsInBuilding,
                formData.pdfDetails.qualityOfConstruction,
                formData.pdfDetails.appearanceOfBuilding,
                formData.pdfDetails.maintenanceOfBuilding,
                // Facilities
                formData.pdfDetails.liftAvailable,
                formData.pdfDetails.protectedWaterSupply,
                formData.pdfDetails.undergroundSewerage,
                formData.pdfDetails.carParkingOpenCovered,
                // Valuation fields
                formData.pdfDetails.fairMarketValue,
                formData.pdfDetails.realizableValue,
                formData.pdfDetails.distressValue,
            ];

            const hasMeaningfulData = prefillableFields.some(field => !!field);

            if (hasMeaningfulData) {
                try {
                    ('[DEBUG] Saving ubiShop data to localStorage:', {
                        id: id,
                        ownerNameAddress: formData.pdfDetails.ownerNameAddress,
                        postalAddress: formData.pdfDetails.postalAddress,
                        customFieldsCount: customFields.length,
                        hasMeaningfulData: true
                    });
                    localStorage.setItem('last_ubiShop_form_data', JSON.stringify({
                        pdfDetails: formData.pdfDetails,
                        customFields: customFields
                    }));
                    ('[DEBUG] UbiShop data saved successfully to localStorage with customFields:', customFields.length);
                } catch (error) {
                    console.error('Error saving current ubiShop data:', error);
                }
            } else {
                ('[DEBUG] Form has no meaningful prefillable data - not saving');
            }
        }
    }, [formData, customFields, id]);

    const handleDownloadPDF = async () => {
        try {
            dispatch(showLoader());
            // ALWAYS fetch fresh data from DB - do not use local state which may be stale
            let dataToDownload;

            try {
                dataToDownload = await getValuationById(id, username, role, clientId);
                ('✅ Fresh data fetched for PDF:', {
                    agreementForSale: dataToDownload?.agreementForSale || dataToDownload?.documentsProduced?.photocopyCopyAgreement,
                    bankName: dataToDownload?.bankName
                });
            } catch (fetchError) {
                console.error('❌ Failed to fetch fresh data:', fetchError);
                // Only fallback to valuation/formData if fetch fails
                dataToDownload = valuation;
                if (!dataToDownload) {
                    console.warn('Valuation state is null, using formData');
                    dataToDownload = formData;
                }
            }

            await generateRecordPDFOffline(dataToDownload);
            showSuccess('PDF downloaded successfully');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            const errorMessage = error?.message || 'Failed to download PDF';
            showError(errorMessage);
        } finally {
            dispatch(hideLoader());
        }
    };

    // Immediately load and prefill form when component mounts
    useLayoutEffect(() => {
        if (id) {
            ('[DEBUG] Component mounted - fetchValuation for id:', id);
            fetchValuation();
        }
    }, [id]);

    // Immediately prefill from previous data on mount (additional safety)
    useEffect(() => {
        if (id && !valuation?._id) {
            // This is a new form (no ID from DB), prefill immediately
            ('[DEBUG] New form detected - immediate prefill triggered');
            setTimeout(() => {
                prefillFromPreviousUbiShopData();
            }, 100);
        }
    }, [id, valuation?._id]);

    const fetchValuation = async () => {
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
            const dbData = await getValuationById(id, username, role, clientId);
            setValuation(dbData);
            mapDataToForm(dbData);

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
        } catch (err) {
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setValuation(parsedData);
                mapDataToForm(parsedData);
            } else {
                // This is a new form - create new record and prefill from previous data
                const newValuation = {
                    username: username,
                    uniqueId: id,
                    dateTime: new Date().toLocaleString(),
                    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
                    status: "pending"
                };
                setValuation(newValuation);

                // Prefill form with data from previous ubiShop form
                prefillFromPreviousUbiShopData();
            }
        }
    };

    // Save current ubiShop form data as last form for future prefilling
    const saveCurrentUbiShopDataAsLast = () => {
        try {
            // Save the complete current form data including custom fields
            const dataToSave = {
                pdfDetails: formData.pdfDetails,
                customFields: customFields,
                bankName: bankName,
                city: city,
                dsa: dsa,
                engineerName: engineerName
            };
            ('[DEBUG] ✅ SAVING to last_ubiShop_form_data:', {
                pdfDetailsFields: Object.keys(formData.pdfDetails || {}).length,
                customFieldsCount: customFields.length,
                bankName: bankName,
                city: city,
                dsa: dsa,
                engineerName: engineerName
            });
            localStorage.setItem('last_ubiShop_form_data', JSON.stringify(dataToSave));
            ('[DEBUG] ✅ Successfully saved last_ubiShop_form_data with ALL data');
        } catch (error) {
            console.error('Error saving current ubiShop data as last form:', error);
        }
    };

    // Prefill from previous ubiShop form data when opening a NEW form
    const prefillFromPreviousUbiShopData = () => {
        try {
            // Get the last previous ubiShop form data from localStorage
            const lastUbiShopData = localStorage.getItem('last_ubiShop_form_data');
            ('[DEBUG] Prefill - Retrieved lastUbiShopData from localStorage:', lastUbiShopData ? 'FOUND' : 'NOT FOUND');

            if (lastUbiShopData) {
                const parsedLastData = JSON.parse(lastUbiShopData);
                ('[DEBUG] Prefill - Parsed data:', {
                    ownerNameAddress: parsedLastData.pdfDetails?.ownerNameAddress,
                    postalAddress: parsedLastData.pdfDetails?.postalAddress,
                    cityTown: parsedLastData.pdfDetails?.cityTown,
                    bankName: parsedLastData.bankName,
                    city: parsedLastData.city,
                    dsa: parsedLastData.dsa,
                    engineerName: parsedLastData.engineerName
                });

                // Restore bank, city, dsa, engineer values
                if (parsedLastData.bankName) {
                    ('[DEBUG] Restoring bankName:', parsedLastData.bankName);
                    setBankName(parsedLastData.bankName);
                }
                if (parsedLastData.city) {
                    ('[DEBUG] Restoring city:', parsedLastData.city);
                    setCity(parsedLastData.city);
                }
                if (parsedLastData.dsa) {
                    ('[DEBUG] Restoring dsa:', parsedLastData.dsa);
                    setDsa(parsedLastData.dsa);
                }
                if (parsedLastData.engineerName) {
                    ('[DEBUG] Restoring engineerName:', parsedLastData.engineerName);
                    setEngineerName(parsedLastData.engineerName);
                }

                // Extract ALL pdfDetails from last ubiShop form - copy everything
                if (parsedLastData.pdfDetails) {
                    ('[DEBUG] Copying ALL pdfDetails from last form to new form');

                    // Apply ALL previous pdfDetails to new form (complete data transfer)
                    setFormData(prev => ({
                        ...prev,
                        pdfDetails: {
                            ...prev.pdfDetails,
                            ...parsedLastData.pdfDetails  // Copy ALL fields from previous form
                        }
                    }));

                    ('[DEBUG] ✅ Prefilled form with ALL previous ubiShop data');
                }

                // Prefill custom fields from last ubiShop data
                if (parsedLastData.customFields && Array.isArray(parsedLastData.customFields)) {
                    ('[DEBUG] ✅ Prefilling custom fields from lastUbiShopData:', parsedLastData.customFields.length);
                    setCustomFields(parsedLastData.customFields);
                }
            } else {
                ('[DEBUG] No previous ubiShop data found in localStorage');
            }
        } catch (error) {
            console.error('Error prefilling from previous ubiShop data:', error);
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
            // Core info
            uniqueId: data.uniqueId || prev.uniqueId,
            username: data.username || prev.username,
            dateTime: data.dateTime || prev.dateTime,
            day: data.day || prev.day,
            bankName: data.bankName || prev.bankName,
            city: data.city || prev.city,
            clientName: data.clientName || prev.clientName,
            mobileNumber: data.mobileNumber || prev.mobileNumber,
            address: data.address || prev.address,
            payment: data.payment || prev.payment,
            collectedBy: data.collectedBy || prev.collectedBy,
            dsa: data.dsa || prev.dsa,
            engineerName: data.engineerName || prev.engineerName,
            notes: data.notes || prev.notes,
            status: data.status || prev.status,
            managerFeedback: data.managerFeedback || prev.managerFeedback,
            submittedByManager: data.submittedByManager || prev.submittedByManager,
            lastUpdatedBy: data.lastUpdatedBy || prev.lastUpdatedBy,
            lastUpdatedByRole: data.lastUpdatedByRole || prev.lastUpdatedByRole,

            // Nested objects from evaluation model
            elevation: data.elevation || prev.elevation,
            directions: data.directions || prev.directions,
            coordinates: data.coordinates || prev.coordinates,
            propertyImages: data.propertyImages || [],
            locationImages: data.locationImages || [],
            areaImages: data.areaImages || {},
            buildingConstruction: data.buildingConstruction || prev.buildingConstruction,

            // Map new nested objects to pdfDetails for backward compatibility
            pdfDetails: {
                ...prev.pdfDetails,
                // From documentInformation
                branch: data.documentInformation?.branch || data.pdfDetails?.branch || '',
                referenceNo: data.documentInformation?.referenceNo || data.pdfDetails?.referenceNo || '',
                dateOfInspection: data.documentInformation?.dateOfInspection || data.pdfDetails?.dateOfInspection || '',
                dateOfValuation: data.documentInformation?.dateOfValuation || data.pdfDetails?.dateOfValuation || '',

                // From ownerDetails
                ownerNameAddress: data.ownerDetails?.ownerNameAddress || data.pdfDetails?.ownerNameAddress || '',
                briefDescriptionProperty: data.ownerDetails?.propertyDescription || data.pdfDetails?.briefDescriptionProperty || '',

                // From locationOfProperty
                plotSurveyNo: data.locationOfProperty?.plotSurveyNo || data.pdfDetails?.plotSurveyNo || '',
                doorNo: data.locationOfProperty?.doorNo || data.pdfDetails?.doorNo || '',
                tpVillage: data.locationOfProperty?.tsVillage || data.pdfDetails?.tpVillage || '',
                wardTaluka: data.locationOfProperty?.wardTaluka || data.pdfDetails?.wardTaluka || '',
                mandalDistrict: data.locationOfProperty?.mandalDistrict || data.pdfDetails?.mandalDistrict || '',
                layoutPlanIssueDate: data.locationOfProperty?.dateLayoutIssueValidity || data.pdfDetails?.layoutPlanIssueDate || '',
                approvedMapAuthority: data.locationOfProperty?.approvedMapIssuingAuthority || data.pdfDetails?.approvedMapAuthority || '',
                authenticityVerified: data.locationOfProperty?.authenticityVerified || data.pdfDetails?.authenticityVerified || '',
                valuerCommentOnAuthenticity: data.locationOfProperty?.valuationCommentsAuthenticity || data.pdfDetails?.valuerCommentOnAuthenticity || '',

                // From postalAddress
                postalAddress: data.postalAddress?.fullAddress || data.pdfDetails?.postalAddress || '',

                // From cityAreaType
                cityTown: data.cityAreaType?.cityTown || data.pdfDetails?.cityTown || '',
                residentialArea: data.cityAreaType?.isResidentialArea || data.pdfDetails?.residentialArea || false,
                commercialArea: data.cityAreaType?.isCommercialArea || data.pdfDetails?.commercialArea || false,
                industrialArea: data.cityAreaType?.isIndustrialArea || data.pdfDetails?.industrialArea || false,

                // From areaClassification
                areaClassification: data.areaClassification?.areaClassification || data.pdfDetails?.areaClassification || '',
                urbanClassification: data.areaClassification?.areaType || data.pdfDetails?.urbanClassification || '',
                governmentType: data.areaClassification?.govGovernance || data.pdfDetails?.governmentType || '',
                govtEnactmentsCovered: data.areaClassification?.stateGovernmentEnactments || data.pdfDetails?.govtEnactmentsCovered || '',

                // From propertyBoundaries
                boundariesPlotNorthDeed: data.pdfDetails?.boundariesPlotNorthDeed || '',
                boundariesPlotNorthActual: data.pdfDetails?.boundariesPlotNorthActual || '',
                boundariesPlotSouthDeed: data.pdfDetails?.boundariesPlotSouthDeed || '',
                boundariesPlotSouthActual: data.pdfDetails?.boundariesPlotSouthActual || '',
                boundariesPlotEastDeed: data.pdfDetails?.boundariesPlotEastDeed || '',
                boundariesPlotEastActual: data.pdfDetails?.boundariesPlotEastActual || '',
                boundariesPlotWestDeed: data.pdfDetails?.boundariesPlotWestDeed || '',
                boundariesPlotWestActual: data.pdfDetails?.boundariesPlotWestActual || '',
                boundariesShopNorthDeed: data.pdfDetails?.boundariesShopNorthDeed || '',
                boundariesShopNorthActual: data.pdfDetails?.boundariesShopNorthActual || '',
                boundariesShopSouthDeed: data.pdfDetails?.boundariesShopSouthDeed || '',
                boundariesShopSouthActual: data.pdfDetails?.boundariesShopSouthActual || '',
                boundariesShopEastDeed: data.pdfDetails?.boundariesShopEastDeed || '',
                boundariesShopEastActual: data.pdfDetails?.boundariesShopEastActual || '',
                boundariesShopWestDeed: data.pdfDetails?.boundariesShopWestDeed || '',
                boundariesShopWestActual: data.pdfDetails?.boundariesShopWestActual || '',
                // Legacy fields (for backward compatibility)
                boundariesPlotNorth: data.propertyBoundaries?.plotBoundaries?.north || data.pdfDetails?.boundariesPlotNorth || '',
                boundariesPlotSouth: data.propertyBoundaries?.plotBoundaries?.south || data.pdfDetails?.boundariesPlotSouth || '',
                boundariesPlotEast: data.propertyBoundaries?.plotBoundaries?.east || data.pdfDetails?.boundariesPlotEast || '',
                boundariesPlotWest: data.propertyBoundaries?.plotBoundaries?.west || data.pdfDetails?.boundariesPlotWest || '',

                // From propertyDimensions
                dimensionsDeed: data.propertyDimensions?.dimensionsAsPerDeed || data.pdfDetails?.dimensionsDeed || '',
                dimensionsActual: data.propertyDimensions?.actualDimensions || data.pdfDetails?.dimensionsActual || '',
                extentOfUnit: data.propertyDimensions?.extent || data.pdfDetails?.extentOfUnit || '',
                latitudeLongitude: data.propertyDimensions?.latitudeLongitudeCoordinates || data.pdfDetails?.latitudeLongitude || '',
                extentOfSiteValuation: data.propertyDimensions?.extentSiteConsideredValuation || data.pdfDetails?.extentOfSiteValuation || '',

                // From rateInfo
                comparableRate: data.rateInfo?.comparableRateSimilarUnit || data.pdfDetails?.comparableRate || '',
                adoptedBasicCompositeRate: data.rateInfo?.adoptedBasicCompositeRate || data.pdfDetails?.adoptedBasicCompositeRate || '',
                buildingServicesRate: data.rateInfo?.buildingServicesRate || data.pdfDetails?.buildingServicesRate || '',
                landOthersRate: data.rateInfo?.landOthersRate || data.pdfDetails?.landOthersRate || '',

                // From compositeRate
                depreciatedBuildingRate: data.compositeRate?.depreciatedBuildingRate || data.pdfDetails?.depreciatedBuildingRate || '',
                replacementCostServices: data.compositeRate?.replacementCostUnitServices || data.pdfDetails?.replacementCostServices || '',
                buildingAge: data.compositeRate?.ageOfBuilding || data.pdfDetails?.buildingAge || '',
                buildingLife: data.compositeRate?.lifeOfBuildingEstimated || data.pdfDetails?.buildingLife || '',
                depreciationPercentage: data.compositeRate?.depreciationPercentageSalvage || data.pdfDetails?.depreciationPercentage || '',
                compositeRateAfterDepreciation: data.compositeRate?.compositeRateAfterDepreciation || data.pdfDetails?.compositeRateAfterDepreciation || '',
                deprecatedRatio: data.compositeRate?.depreciatedRatioBuilding || data.pdfDetails?.deprecatedRatio || '',
                totalCompositeRate: data.compositeRate?.totalCompositeRate || data.pdfDetails?.totalCompositeRate || '',
                rateForLandOther: data.compositeRate?.rateLandOtherV3II || data.pdfDetails?.rateForLandOther || '',
                guidelineRate: data.compositeRate?.guidelineRateRegistrar || data.pdfDetails?.guidelineRate || '',

                // From valuationResults
                fairMarketValue: data.valuationResults?.fairMarketValue || data.pdfDetails?.fairMarketValue || '',
                realizableValue: data.valuationResults?.realizableValue || data.pdfDetails?.realizableValue || '',
                distressValue: data.valuationResults?.distressValue || data.pdfDetails?.distressValue || '',
                saleDeedValue: data.valuationResults?.saleDeedValue || data.pdfDetails?.saleDeedValue || '',
                insurableValue: data.valuationResults?.insurableValue || data.pdfDetails?.insurableValue || '',
                totalJantriValue: data.valuationResults?.totalJantriValue || data.pdfDetails?.totalJantriValue || '',
                fairMarketValueWords: data.valuationResults?.fairMarketValueInWords || data.pdfDetails?.fairMarketValueWords || '',

                // From valuationDetailsTable
                presentValueQty: data.valuationDetailsTable?.details?.[0]?.qty || data.pdfDetails?.presentValueQty || '',
                presentValueRate: data.valuationDetailsTable?.details?.[0]?.ratePerUnit || data.pdfDetails?.presentValueRate || '',
                presentValue: data.valuationDetailsTable?.details?.[0]?.estimatedValue || data.pdfDetails?.presentValue || '',
                wardrobesQty: data.valuationDetailsTable?.details?.[1]?.qty || data.pdfDetails?.wardrobesQty || '',
                wardrobesRate: data.valuationDetailsTable?.details?.[1]?.ratePerUnit || data.pdfDetails?.wardrobesRate || '',
                wardrobes: data.valuationDetailsTable?.details?.[1]?.estimatedValue || data.pdfDetails?.wardrobes || '',
                showcasesQty: data.valuationDetailsTable?.details?.[2]?.qty || data.pdfDetails?.showcasesQty || '',
                showcasesRate: data.valuationDetailsTable?.details?.[2]?.ratePerUnit || data.pdfDetails?.showcasesRate || '',
                showcases: data.valuationDetailsTable?.details?.[2]?.estimatedValue || data.pdfDetails?.showcases || '',
                kitchenArrangementsQty: data.valuationDetailsTable?.details?.[3]?.qty || data.pdfDetails?.kitchenArrangementsQty || '',
                kitchenArrangementsRate: data.valuationDetailsTable?.details?.[3]?.ratePerUnit || data.pdfDetails?.kitchenArrangementsRate || '',
                kitchenArrangements: data.valuationDetailsTable?.details?.[3]?.estimatedValue || data.pdfDetails?.kitchenArrangements || '',
                superfineFinishQty: data.valuationDetailsTable?.details?.[4]?.qty || data.pdfDetails?.superfineFinishQty || '',
                superfineFinishRate: data.valuationDetailsTable?.details?.[4]?.ratePerUnit || data.pdfDetails?.superfineFinishRate || '',
                superfineFinish: data.valuationDetailsTable?.details?.[4]?.estimatedValue || data.pdfDetails?.superfineFinish || '',
                interiorDecorationsQty: data.valuationDetailsTable?.details?.[5]?.qty || data.pdfDetails?.interiorDecorationsQty || '',
                interiorDecorationsRate: data.valuationDetailsTable?.details?.[5]?.ratePerUnit || data.pdfDetails?.interiorDecorationsRate || '',
                interiorDecorations: data.valuationDetailsTable?.details?.[5]?.estimatedValue || data.pdfDetails?.interiorDecorations || '',
                electricityDepositsQty: data.valuationDetailsTable?.details?.[6]?.qty || data.pdfDetails?.electricityDepositsQty || '',
                electricityDepositsRate: data.valuationDetailsTable?.details?.[6]?.ratePerUnit || data.pdfDetails?.electricityDepositsRate || '',
                electricityDeposits: data.valuationDetailsTable?.details?.[6]?.estimatedValue || data.pdfDetails?.electricityDeposits || '',
                collapsibleGatesQty: data.valuationDetailsTable?.details?.[7]?.qty || data.pdfDetails?.collapsibleGatesQty || '',
                collapsibleGatesRate: data.valuationDetailsTable?.details?.[7]?.ratePerUnit || data.pdfDetails?.collapsibleGatesRate || '',
                collapsibleGates: data.valuationDetailsTable?.details?.[7]?.estimatedValue || data.pdfDetails?.collapsibleGates || '',
                potentialValueQty: data.valuationDetailsTable?.details?.[8]?.qty || data.pdfDetails?.potentialValueQty || '',
                potentialValueRate: data.valuationDetailsTable?.details?.[8]?.ratePerUnit || data.pdfDetails?.potentialValueRate || '',
                potentialValue: data.valuationDetailsTable?.details?.[8]?.estimatedValue || data.pdfDetails?.potentialValue || '',
                otherItemsQty: data.valuationDetailsTable?.details?.[9]?.qty || data.pdfDetails?.otherItemsQty || '',
                otherItemsRate: data.valuationDetailsTable?.details?.[9]?.ratePerUnit || data.pdfDetails?.otherItemsRate || '',
                otherItems: data.valuationDetailsTable?.details?.[9]?.estimatedValue || data.pdfDetails?.otherItems || '',
                totalValuationItems: data.valuationDetailsTable?.valuationTotal || data.pdfDetails?.totalValuationItems || '',
                totalValueSay: data.valuationDetailsTable?.valuationTotal || data.pdfDetails?.totalValueSay || '',

                // From additionalFlatDetails
                areaUsage: data.additionalFlatDetails?.areaUsage || data.pdfDetails?.areaUsage || '',
                carpetAreaFlat: data.additionalFlatDetails?.carpetAreaFlat || data.pdfDetails?.carpetAreaFlat || '',

                // From signatureReport
                place: data.signatureReport?.place || data.pdfDetails?.place || '',
                signatureDate: data.signatureReport?.signatureDate || data.pdfDetails?.signatureDate || '',
                signerName: data.signatureReport?.signerName || data.pdfDetails?.signerName || '',
                reportDate: data.signatureReport?.reportDate || data.pdfDetails?.reportDate || '',

                // From buildingConstruction (nested in main object)
                yearOfConstruction: data.buildingConstruction?.yearOfConstruction || data.pdfDetails?.yearOfConstruction || '',
                numberOfFloors: data.buildingConstruction?.numberOfFloors || data.pdfDetails?.numberOfFloors || '',
                typeOfStructure: data.buildingConstruction?.typeOfStructure || data.pdfDetails?.typeOfStructure || '',
                numberOfDwellingUnitsInBuilding: data.buildingConstruction?.numberOfDwellingUnits || data.pdfDetails?.numberOfDwellingUnitsInBuilding || '',
                qualityOfConstruction: data.buildingConstruction?.qualityOfConstruction || data.pdfDetails?.qualityOfConstruction || '',
                appearanceOfBuilding: data.buildingConstruction?.appearanceOfBuilding || data.pdfDetails?.appearanceOfBuilding || '',
                maintenanceOfBuilding: data.buildingConstruction?.maintenanceOfBuilding || data.pdfDetails?.maintenanceOfBuilding || '',

                // From facilities
                liftAvailable: data.facilities?.liftAvailable || data.pdfDetails?.liftAvailable || '',
                protectedWaterSupply: data.facilities?.protectedWaterSupply || data.pdfDetails?.protectedWaterSupply || '',
                undergroundSewerage: data.facilities?.undergroundSewerage || data.pdfDetails?.undergroundSewerage || '',
                carParkingOpenCovered: data.facilities?.carParkingType || data.pdfDetails?.carParkingOpenCovered || '',
                isCompoundWallExisting: data.facilities?.compoundWallExisting || data.pdfDetails?.isCompoundWallExisting || '',
                isPavementLaidAroundBuilding: data.facilities?.pavementAroundBuilding || data.pdfDetails?.isPavementLaidAroundBuilding || '',

                // From unitSpecifications (Section 3)
                unitFloor: data.unitSpecifications?.floorLocation || data.pdfDetails?.unitFloor || '',
                unitDoorNo: data.unitSpecifications?.doorNoUnit || data.pdfDetails?.unitDoorNo || '',
                unitRoof: data.unitSpecifications?.roof || data.pdfDetails?.unitRoof || '',
                unitFlooring: data.unitSpecifications?.flooring || data.pdfDetails?.unitFlooring || '',
                unitDoors: data.unitSpecifications?.doors || data.pdfDetails?.unitDoors || '',
                unitWindows: data.unitSpecifications?.windows || data.pdfDetails?.unitWindows || '',
                unitFittings: data.unitSpecifications?.fittings || data.pdfDetails?.unitFittings || '',
                unitFinishing: data.unitSpecifications?.finishing || data.pdfDetails?.unitFinishing || '',

                // From unitTax (Section 4)
                // assessmentNo already included above
                taxPaidName: data.unitTax?.taxPaidName || data.pdfDetails?.taxPaidName || '',
                taxAmount: data.unitTax?.taxAmount || data.pdfDetails?.taxAmount || '',

                // From electricityService (Section 5)
                electricityServiceNo: data.electricityService?.electricityServiceConnectionNo || data.pdfDetails?.electricityServiceNo || '',
                meterCardName: data.electricityService?.meterCardName || data.pdfDetails?.meterCardName || '',

                // From unitMaintenance (Section 6)
                unitMaintenance: data.unitMaintenance?.unitMaintenanceStatus || data.pdfDetails?.unitMaintenance || '',

                // From agreementForSale (Section 7)
                agreementSaleExecutedName: data.agreementForSale?.agreementForSaleExecutedName || data.pdfDetails?.agreementSaleExecutedName || '',

                // From unitAreaDetails (Section 8 & 9)
                undividedAreaLand: data.unitAreaDetails?.undividedLandAreaSaleDeed || data.pdfDetails?.undividedAreaLand || '',
                plinthArea: data.unitAreaDetails?.plinthAreaUnit || data.pdfDetails?.plinthArea || '',
                carpetArea: data.unitAreaDetails?.carpetAreaUnit || data.pdfDetails?.carpetArea || '',

                // From unitClassification (Section 10-14)
                floorSpaceIndex: data.unitClassification?.floorSpaceIndex || data.pdfDetails?.floorSpaceIndex || '',
                classificationPosh: data.unitClassification?.unitClassification || data.pdfDetails?.classificationPosh || '',
                classificationUsage: data.unitClassification?.residentialOrCommercial || data.pdfDetails?.classificationUsage || '',
                classificationOwnership: data.unitClassification?.ownerOccupiedOrLetOut || data.pdfDetails?.classificationOwnership || '',

                // Valuer Details & Signature
                valuersName: data.signatureReport?.signerName || data.pdfDetails?.valuersName || '',
                valuersCompany: data.signatureReport?.valuersCompany || data.pdfDetails?.valuersCompany || '',
                valuersLicense: data.signatureReport?.valuersLicense || data.pdfDetails?.valuersLicense || '',
                valuationPlace: data.signatureReport?.place || data.pdfDetails?.valuationPlace || '',
                valuationDate: data.signatureReport?.signatureDate || data.pdfDetails?.valuationDate || '',
                bankerSignatureDate: data.bankerDetails?.bankerSignatureDate || data.pdfDetails?.bankerSignatureDate || '',
                memberSinceDate: data.valuerDetails?.memberSinceDate || data.pdfDetails?.memberSinceDate || '',

                // Declarations
                declarationB: data.declarations?.declarationB || data.pdfDetails?.declarationB || '',
                declarationD: data.declarations?.declarationD || data.pdfDetails?.declarationD || '',
                declarationE: data.declarations?.declarationE || data.pdfDetails?.declarationE || '',
                declarationI: data.declarations?.declarationI || data.pdfDetails?.declarationI || '',
                declarationJ: data.declarations?.declarationJ || data.pdfDetails?.declarationJ || '',

                // Valuation Information Details
                assetBackgroundInfo: data.valuationInformationDetails?.assetBackgroundInfo || data.pdfDetails?.assetBackgroundInfo || '',
                valuationPurposeAuthority: data.valuationInformationDetails?.valuationPurposeAuthority || data.pdfDetails?.valuationPurposeAuthority || '',
                valuersIdentity: data.valuationInformationDetails?.valuersIdentity || data.pdfDetails?.valuersIdentity || '',
                valuersConflictDisclosure: data.valuationInformationDetails?.valuersConflictDisclosure || data.pdfDetails?.valuersConflictDisclosure || '',
                dateOfAppointment: data.valuationInformationDetails?.dateOfAppointment || data.pdfDetails?.dateOfAppointment || '',
                inspectionsUndertaken: data.valuationInformationDetails?.inspectionsUndertaken || data.pdfDetails?.inspectionsUndertaken || '',
                informationSources: data.valuationInformationDetails?.informationSources || data.pdfDetails?.informationSources || '',
                valuationProcedures: data.valuationInformationDetails?.valuationProcedures || data.pdfDetails?.valuationProcedures || '',
                reportRestrictions: data.valuationInformationDetails?.reportRestrictions || data.pdfDetails?.reportRestrictions || '',
                majorFactors: data.valuationInformationDetails?.majorFactors || data.pdfDetails?.majorFactors || '',
                additionalFactors: data.valuationInformationDetails?.additionalFactors || data.pdfDetails?.additionalFactors || '',
                caveatsLimitations: data.valuationInformationDetails?.caveatsLimitations || data.pdfDetails?.caveatsLimitations || '',

                // Preserve existing pdfDetails fields
                ...data.pdfDetails
            },

            // Dropdown custom values - preserve from data
            customBankName: data.customBankName || prev.customBankName || "",
            customCity: data.customCity || prev.customCity || "",
            customDsa: data.customDsa || prev.customDsa || "",
            customEngineerName: data.customEngineerName || prev.customEngineerName || ""
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLettersOnlyInputChange = (e, callback) => {
        const { name, value } = e.target;
        const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
        if (callback) {
            callback(lettersOnly);
        } else {
            setFormData(prev => ({ ...prev, [name]: lettersOnly }));
        }
    };

    const handleIntegerInputChange = (e, callback) => {
        const { name, value } = e.target;
        const numbersOnly = value.replace(/[^0-9]/g, '');
        if (callback) {
            callback(numbersOnly);
        } else {
            setFormData(prev => ({ ...prev, [name]: numbersOnly }));
        }
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

    const handleCoordinateChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            coordinates: {
                ...prev.coordinates,
                [field]: value
            }
        }));
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

    const handleLocationImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        // Only take the first file for location images (single image only)
        if (files.length === 0) return;

        const file = files[0];
        let gpsCoordinates = null;

        try {
            // Try to extract GPS from EXIF
            const exifData = await exifr.parse(file);

            if (exifData?.latitude && exifData?.longitude) {
                gpsCoordinates = {
                    latitude: String(exifData.latitude),
                    longitude: String(exifData.longitude)
                };
            }
        } catch (error) {
            // Error reading EXIF data
        }

        const preview = URL.createObjectURL(file);

        // Remove old location image and add new one (replace instead of append)
        if (locationImagePreviews.length > 0) {
            URL.revokeObjectURL(locationImagePreviews[0].preview);
        }

        setLocationImagePreviews([{ file, preview }]);

        setFormData(prev => {
            const newCoordinates = gpsCoordinates ? gpsCoordinates : prev.coordinates;
            return {
                ...prev,
                locationImages: [file],
                coordinates: newCoordinates
            };
        });
    };

    const handleImageUpload = async (e, inputNumber) => {
        const files = Array.from(e.target.files);

        for (const file of files) {
            // No GPS extraction for property images - only for location images
            const preview = URL.createObjectURL(file);
            setImagePreviews(prev => [...prev, { file, preview, inputNumber }]);
            setFormData(prev => ({
                ...prev,
                propertyImages: [...prev.propertyImages, { file, inputNumber }]
            }));
        }
    };
    const removeLocationImage = (index) => {
        setLocationImagePreviews(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });

        setFormData(prev => ({
            ...prev,
            locationImages: prev.locationImages.filter((_, i) => i !== index)
        }));
    };

    const removeImage = (index) => {
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });

        setFormData(prev => ({
            ...prev,
            propertyImages: prev.propertyImages.filter((_, i) => i !== index)
        }));
    };

    const handleDocumentUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;

        // Add local previews immediately
        const filesToAdd = Array.from(files).map((file, index) => {
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

    // Validation function
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
            dispatch(showLoader("Loading Data..."));

            // Build complete payload with evaluation model structure
            const payload = {
                // Core Info
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
                engineerName: engineerName || "",
                notes: formData.notes,

                // Property Basic Details
                elevation: formData.elevation,
                directions: formData.directions,
                coordinates: formData.coordinates,

                // Status fields
                ...(valuation?._id && { status: "on-progress" }),
                managerFeedback: formData.managerFeedback,
                submittedByManager: formData.submittedByManager,

                // Nested objects in evaluation model
                buildingConstruction: {
                    localityDescription: formData.pdfDetails?.localityDescription || formData.buildingConstruction?.localityDescription || "",
                    yearOfConstruction: formData.pdfDetails?.yearOfConstruction || formData.buildingConstruction?.yearOfConstruction || "",
                    numberOfFloors: formData.pdfDetails?.numberOfFloors || formData.buildingConstruction?.numberOfFloors || "",
                    typeOfStructure: formData.pdfDetails?.typeOfStructure || formData.buildingConstruction?.typeOfStructure || "",
                    numberOfDwellingUnits: formData.pdfDetails?.numberOfDwellingUnitsInBuilding || formData.buildingConstruction?.numberOfDwellingUnits || "",
                    qualityOfConstruction: formData.pdfDetails?.qualityOfConstruction || formData.buildingConstruction?.qualityOfConstruction || "",
                    appearanceOfBuilding: formData.pdfDetails?.appearanceOfBuilding || formData.buildingConstruction?.appearanceOfBuilding || "",
                    maintenanceOfBuilding: formData.pdfDetails?.maintenanceOfBuilding || formData.buildingConstruction?.maintenanceOfBuilding || ""
                },

                // Document Information
                documentInformation: {
                    branch: formData.pdfDetails?.branch || "",
                    referenceNo: formData.pdfDetails?.referenceNo || "",
                    dateOfInspection: formData.pdfDetails?.dateOfInspection || "",
                    dateOfValuation: formData.pdfDetails?.dateOfValuation || formData.pdfDetails?.dateOfValuationMade || ""
                },

                // Owner Details
                ownerDetails: {
                    ownerNameAddress: formData.pdfDetails?.ownerNameAddress || "",
                    propertyDescription: formData.pdfDetails?.briefDescriptionProperty || ""
                },

                // Location of Property
                locationOfProperty: {
                    plotSurveyNo: formData.pdfDetails?.plotSurveyNo || "",
                    doorNo: formData.pdfDetails?.doorNo || "",
                    tsVillage: formData.pdfDetails?.tpVillage || "",
                    wardTaluka: formData.pdfDetails?.wardTaluka || "",
                    mandalDistrict: formData.pdfDetails?.mandalDistrict || "",
                    dateLayoutIssueValidity: formData.pdfDetails?.layoutPlanIssueDate || "",
                    approvedMapIssuingAuthority: formData.pdfDetails?.approvedMapAuthority || "",
                    authenticityVerified: formData.pdfDetails?.authenticityVerified || "",
                    valuationCommentsAuthenticity: formData.pdfDetails?.valuerCommentOnAuthenticity || ""
                },

                // Postal Address
                postalAddress: {
                    fullAddress: formData.pdfDetails?.postalAddress || ""
                },

                // City Area Type
                cityAreaType: {
                    cityTown: formData.pdfDetails?.cityTown || "",
                    isResidentialArea: formData.pdfDetails?.residentialArea || false,
                    isCommercialArea: formData.pdfDetails?.commercialArea || false,
                    isIndustrialArea: formData.pdfDetails?.industrialArea || false
                },

                // Area Classification
                areaClassification: {
                    areaClassification: formData.pdfDetails?.areaClassification || "",
                    areaType: formData.pdfDetails?.urbanClassification || "",
                    govGovernance: formData.pdfDetails?.governmentType || "",
                    stateGovernmentEnactments: formData.pdfDetails?.govtEnactmentsCovered || ""
                },

                // Property Boundaries
                propertyBoundaries: {
                    plotBoundaries: {
                        north: formData.pdfDetails?.boundariesPlotNorth || "",
                        south: formData.pdfDetails?.boundariesPlotSouth || "",
                        east: formData.pdfDetails?.boundariesPlotEast || "",
                        west: formData.pdfDetails?.boundariesPlotWest || ""
                    },
                    shopBoundaries: {
                        north: formData.pdfDetails?.boundariesShopNorth || "",
                        south: formData.pdfDetails?.boundariesShopSouth || "",
                        east: formData.pdfDetails?.boundariesShopEast || "",
                        west: formData.pdfDetails?.boundariesShopWest || ""
                    }
                },

                // Property Dimensions
                propertyDimensions: {
                    dimensionsAsPerDeed: formData.pdfDetails?.dimensionsDeed || "",
                    actualDimensions: formData.pdfDetails?.dimensionsActual || "",
                    extent: formData.pdfDetails?.extentOfUnit || "",
                    latitudeLongitudeCoordinates: formData.pdfDetails?.latitudeLongitude || "",
                    extentSiteConsideredValuation: formData.pdfDetails?.extentOfSiteValuation || ""
                },

                // Rate Info / V. Rate Section
                rateValuation: {
                    comparableRateSimilarUnitPerSqft: parseFloat(formData.pdfDetails?.comparableRate) || 0,
                    adoptedBasicCompositeRatePerSqft: parseFloat(formData.pdfDetails?.adoptedBasicCompositeRate) || 0,
                    buildingServicesRatePerSqft: parseFloat(formData.pdfDetails?.buildingServicesRate) || 0,
                    landOthersRatePerSqft: parseFloat(formData.pdfDetails?.landOthersRate) || 0
                },

                // Composite Rate
                compositeRateDepreciation: {
                    guidelineRatePerSqm: parseFloat(formData.pdfDetails?.guidelineRate) || 0,
                    depreciatedBuildingRatePerSqft: parseFloat(formData.pdfDetails?.depreciatedBuildingRate) || 0,
                    replacementCostUnitServicesPerSqft: parseFloat(formData.pdfDetails?.replacementCostServices) || 0,
                    ageOfBuildingYears: parseFloat(formData.pdfDetails?.buildingAge) || 0,
                    lifeOfBuildingEstimatedYears: parseFloat(formData.pdfDetails?.buildingLife) || 0,
                    depreciationPercentageSalvage: parseFloat(formData.pdfDetails?.depreciationPercentage) || 0,
                    depreciatedRatioBuilding: parseFloat(formData.pdfDetails?.deprecatedRatio) || 0,
                    rateLandOtherV3IIPerSqft: parseFloat(formData.pdfDetails?.rateForLandOther) || 0,
                    totalCompositeRatePerSqft: parseFloat(formData.pdfDetails?.totalCompositeRate) || 0
                },

                // Valuation Results
                valuationResults: {
                    fairMarketValue: parseFloat(formData.pdfDetails?.fairMarketValue) || 0,
                    realizableValue: parseFloat(formData.pdfDetails?.realizableValue) || 0,
                    distressValue: parseFloat(formData.pdfDetails?.distressValue) || 0,
                    saleDeedValue: parseFloat(formData.pdfDetails?.saleDeedValue) || 0,
                    insurableValue: parseFloat(formData.pdfDetails?.insurableValue) || 0,
                    totalJantriValue: parseFloat(formData.pdfDetails?.totalJantriValue) || 0,
                    fairMarketValueInWords: formData.pdfDetails?.fairMarketValueWords || ""
                },

                // Additional Flat Details
                additionalFlatDetails: {
                    areaUsage: formData.pdfDetails?.areaUsage || "",
                    carpetAreaFlat: formData.pdfDetails?.carpetAreaFlat || ""
                },

                // Signature Report
                signatureReport: {
                    place: formData.pdfDetails?.place || "",
                    signatureDate: formData.pdfDetails?.signatureDate || "",
                    signerName: formData.pdfDetails?.signerName || "",
                    reportDate: formData.pdfDetails?.reportDate || ""
                },

                // Unit Classification (Section 10-14)
                unitClassification: {
                    floorSpaceIndex: formData.pdfDetails?.floorSpaceIndex || "",
                    unitClassification: formData.pdfDetails?.classificationPosh || "",
                    residentialOrCommercial: formData.pdfDetails?.classificationUsage || "",
                    ownerOccupiedOrLetOut: formData.pdfDetails?.classificationOwnership || ""
                },

                // Electricity Service (Section 5)
                electricityService: {
                    electricityServiceConnectionNo: formData.pdfDetails?.electricityServiceNo || "",
                    meterCardName: formData.pdfDetails?.meterCardName || ""
                },

                // Unit Maintenance (Section 6)
                unitMaintenance: {
                    unitMaintenanceStatus: formData.pdfDetails?.unitMaintenance || ""
                },

                // Agreement for Sale (Section 7)
                agreementForSale: {
                    agreementForSaleExecutedName: formData.pdfDetails?.agreementSaleExecutedName || ""
                },

                // Unit Area Details (Section 8 & 9)
                unitAreaDetails: {
                    undividedLandAreaSaleDeed: formData.pdfDetails?.undividedAreaLand || "",
                    plinthAreaUnit: formData.pdfDetails?.plinthArea || "",
                    carpetAreaUnit: formData.pdfDetails?.carpetArea || ""
                },

                // Unit Specifications (Section 3)
                unitSpecifications: {
                    floorLocation: formData.pdfDetails?.unitFloor || "",
                    doorNoUnit: formData.pdfDetails?.unitDoorNo || "",
                    roof: formData.pdfDetails?.unitRoof || "",
                    flooring: formData.pdfDetails?.unitFlooring || "",
                    doors: formData.pdfDetails?.unitDoors || "",
                    windows: formData.pdfDetails?.unitWindows || "",
                    fittings: formData.pdfDetails?.unitFittings || "",
                    finishing: formData.pdfDetails?.unitFinishing || ""
                },

                // Unit Tax (Section 4)
                unitTax: {
                    assessmentNo: formData.pdfDetails?.assessmentNo || "",
                    taxPaidName: formData.pdfDetails?.taxPaidName || "",
                    taxAmount: formData.pdfDetails?.taxAmount || ""
                },

                // Facilities Available
                facilities: {
                    liftAvailable: formData.pdfDetails?.liftAvailable || "",
                    protectedWaterSupply: formData.pdfDetails?.protectedWaterSupply || "",
                    undergroundSewerage: formData.pdfDetails?.undergroundSewerage || "",
                    carParkingType: formData.pdfDetails?.carParkingOpenCovered || "",
                    compoundWallExisting: formData.pdfDetails?.isCompoundWallExisting || "",
                    pavementAroundBuilding: formData.pdfDetails?.isPavementLaidAroundBuilding || ""
                },

                // Apartment Location - Location of Apartment/Unit
                apartmentLocation: {
                    apartmentNature: formData.pdfDetails?.apartmentNature || "",
                    apartmentLocation: formData.pdfDetails?.apartmentLocation || "",
                    tsNo: formData.pdfDetails?.apartmentTSNo || "",
                    blockNo: formData.pdfDetails?.apartmentBlockNo || "",
                    wardNo: formData.pdfDetails?.apartmentWardNo || "",
                    villageOrMunicipality: formData.pdfDetails?.apartmentVillageMunicipalityCounty || "",
                    doorNoStreetRoadPinCode: formData.pdfDetails?.apartmentDoorNoStreetRoadPinCode || ""
                },

                // Monthly Rent Details
                monthlyRent: {
                    ifRentedMonthlyRent: formData.pdfDetails?.monthlyRent || ""
                },

                // Marketability Section
                marketability: {
                    howIsMarketability: formData.pdfDetails?.marketability || "",
                    factorsFavouringExtraPotential: formData.pdfDetails?.favoringFactors || "",
                    negativeFactorsAffectingValue: formData.pdfDetails?.negativeFactors || ""
                },

                // Valuation Details Table
                valuationDetailsTable: {
                    details: [
                        { srNo: 1, description: "Present value of the Unit (Carpet Area)", qty: formData.pdfDetails?.presentValueQty || "", ratePerUnit: formData.pdfDetails?.presentValueRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.presentValueQty) || 0) * (parseFloat(formData.pdfDetails?.presentValueRate) || 0) || 0 },
                        { srNo: 2, description: "Wardrobes", qty: formData.pdfDetails?.wardrobesQty || "", ratePerUnit: formData.pdfDetails?.wardrobesRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.wardrobesQty) || 0) * (parseFloat(formData.pdfDetails?.wardrobesRate) || 0) || 0 },
                        { srNo: 3, description: "Showcases", qty: formData.pdfDetails?.showcasesQty || "", ratePerUnit: formData.pdfDetails?.showcasesRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.showcasesQty) || 0) * (parseFloat(formData.pdfDetails?.showcasesRate) || 0) || 0 },
                        { srNo: 4, description: "Kitchen Arrangements", qty: formData.pdfDetails?.kitchenArrangementsQty || "", ratePerUnit: formData.pdfDetails?.kitchenArrangementsRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.kitchenArrangementsQty) || 0) * (parseFloat(formData.pdfDetails?.kitchenArrangementsRate) || 0) || 0 },
                        { srNo: 5, description: "Superfine Finish", qty: formData.pdfDetails?.superfineFinishQty || "", ratePerUnit: formData.pdfDetails?.superfineFinishRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.superfineFinishQty) || 0) * (parseFloat(formData.pdfDetails?.superfineFinishRate) || 0) || 0 },
                        { srNo: 6, description: "Interior Decorations", qty: formData.pdfDetails?.interiorDecorationsQty || "", ratePerUnit: formData.pdfDetails?.interiorDecorationsRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.interiorDecorationsQty) || 0) * (parseFloat(formData.pdfDetails?.interiorDecorationsRate) || 0) || 0 },
                        { srNo: 7, description: "Electricity deposits / electrical fittings, etc.", qty: formData.pdfDetails?.electricityDepositsQty || "", ratePerUnit: formData.pdfDetails?.electricityDepositsRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.electricityDepositsQty) || 0) * (parseFloat(formData.pdfDetails?.electricityDepositsRate) || 0) || 0 },
                        { srNo: 8, description: "Extra collapsible gates / grill works, etc.", qty: formData.pdfDetails?.collapsibleGatesQty || "", ratePerUnit: formData.pdfDetails?.collapsibleGatesRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.collapsibleGatesQty) || 0) * (parseFloat(formData.pdfDetails?.collapsibleGatesRate) || 0) || 0 },
                        { srNo: 9, description: "Potential value, if any", qty: formData.pdfDetails?.potentialValueQty || "", ratePerUnit: formData.pdfDetails?.potentialValueRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.potentialValueQty) || 0) * (parseFloat(formData.pdfDetails?.potentialValueRate) || 0) || 0 },
                        { srNo: 10, description: "Others", qty: formData.pdfDetails?.otherItemsQty || "", ratePerUnit: formData.pdfDetails?.otherItemsRate || "", estimatedValue: (parseFloat(formData.pdfDetails?.otherItemsQty) || 0) * (parseFloat(formData.pdfDetails?.otherItemsRate) || 0) || 0 }
                    ],
                    valuationTotal: [
                        (parseFloat(formData.pdfDetails?.presentValueQty) || 0) * (parseFloat(formData.pdfDetails?.presentValueRate) || 0),
                        (parseFloat(formData.pdfDetails?.wardrobesQty) || 0) * (parseFloat(formData.pdfDetails?.wardrobesRate) || 0),
                        (parseFloat(formData.pdfDetails?.showcasesQty) || 0) * (parseFloat(formData.pdfDetails?.showcasesRate) || 0),
                        (parseFloat(formData.pdfDetails?.kitchenArrangementsQty) || 0) * (parseFloat(formData.pdfDetails?.kitchenArrangementsRate) || 0),
                        (parseFloat(formData.pdfDetails?.superfineFinishQty) || 0) * (parseFloat(formData.pdfDetails?.superfineFinishRate) || 0),
                        (parseFloat(formData.pdfDetails?.interiorDecorationsQty) || 0) * (parseFloat(formData.pdfDetails?.interiorDecorationsRate) || 0),
                        (parseFloat(formData.pdfDetails?.electricityDepositsQty) || 0) * (parseFloat(formData.pdfDetails?.electricityDepositsRate) || 0),
                        (parseFloat(formData.pdfDetails?.collapsibleGatesQty) || 0) * (parseFloat(formData.pdfDetails?.collapsibleGatesRate) || 0),
                        (parseFloat(formData.pdfDetails?.potentialValueQty) || 0) * (parseFloat(formData.pdfDetails?.potentialValueRate) || 0),
                        (parseFloat(formData.pdfDetails?.otherItemsQty) || 0) * (parseFloat(formData.pdfDetails?.otherItemsRate) || 0)
                    ].reduce((sum, val) => sum + val, 0)
                },

                // Guideline Rate
                guidelineRate: {
                    guidelineRatePerSqm: parseFloat(formData.pdfDetails?.guidelineRate) || 0
                },

                // Documents Produced for Perusal
                documentsProduced: {
                    photocopyCopyAgreement: formData.pdfDetails?.agreementForSale || "",
                    commencementCertificate: formData.pdfDetails?.commencementCertificate || "",
                    occupancyCertificate: formData.pdfDetails?.occupancyCertificate || ""
                },

                // Custom Fields
                customFields: customFields,

                // Keep pdfDetails for backward compatibility
                pdfDetails: formData.pdfDetails
            };

            // Parallel image uploads (including supporting images and area images)
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

            // Combine previously saved images with newly uploaded Cloudinary URLs
            const previousPropertyImages = imagePreviews
                .filter(p => p && !p.file && p.preview)
                .map((preview, idx) => ({
                    url: preview.preview,
                    inputNumber: preview.inputNumber,
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

            // Debug: Log payload to verify pdfDetails is included
            ("ONFINISH - Sending payload with pdfDetails:", payload.pdfDetails ? "YES" : "NO");
            ("ONFINISH - pdfDetails keys count:", payload.pdfDetails ? Object.keys(payload.pdfDetails).length : 0);

            // Call API to update valuation with complete JSON payload
            const apiResponse = await updateValuation(id, payload, username, role, clientId);

            // Debug logging
            ("📤 onFinish - API Response:", {
                success: apiResponse?.success,
                status: apiResponse?.status,
                message: apiResponse?.message,
                data: apiResponse?.data ? { ...apiResponse.data, status: apiResponse.data.status } : "NO DATA"
            });

            // Save current form data as last ubiShop form for prefilling next form
            saveCurrentUbiShopDataAsLast();

            // Invalidate cache to ensure fresh data on dashboard
            invalidateCache("/valuations");

            // Get the actual status from API response (server updates to on-progress on save)
            // Status will be on-progress after successful save for any role
            const newStatus = apiResponse?.status || apiResponse?.data?.status || "on-progress";

            ("🔄 onFinish - Status Update:", {
                responseStatus: apiResponse?.status,
                dataStatus: apiResponse?.data?.status,
                finalStatus: newStatus
            });

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

            // Update component state
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

            // Show success and navigate
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

    const handleManagerAction = async (action) => {
        // For Approve action, trigger Save first
        if (action === "approve") {
            try {
                // Create a promise to handle the async save
                const savePromise = new Promise((resolve, reject) => {
                    dispatch(showLoader("Saving form..."));
                    
                    // Call the save logic (from onFinish but without redirect)
                    (async () => {
                        try {
                            if (!user) {
                                showError('Authentication required. Please log in.');
                                onLogin?.();
                                reject(new Error('Not authenticated'));
                                return;
                            }

                            setLoading(true);

                            // Build the same complete payload as onFinish does
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
                                engineerName: engineerName || "",
                                notes: formData.notes,
                                elevation: formData.elevation,
                                directions: formData.directions,
                                coordinates: formData.coordinates,
                                ...(valuation?._id && { status: "on-progress" }),
                                managerFeedback: formData.managerFeedback,
                                submittedByManager: formData.submittedByManager,
                                buildingConstruction: {
                                    localityDescription: formData.pdfDetails?.localityDescription || formData.buildingConstruction?.localityDescription || "",
                                    yearOfConstruction: formData.pdfDetails?.yearOfConstruction || formData.buildingConstruction?.yearOfConstruction || "",
                                    numberOfFloors: formData.pdfDetails?.numberOfFloors || formData.buildingConstruction?.numberOfFloors || "",
                                    typeOfStructure: formData.pdfDetails?.typeOfStructure || formData.buildingConstruction?.typeOfStructure || "",
                                    numberOfDwellingUnits: formData.pdfDetails?.numberOfDwellingUnitsInBuilding || formData.buildingConstruction?.numberOfDwellingUnits || "",
                                    qualityOfConstruction: formData.pdfDetails?.qualityOfConstruction || formData.buildingConstruction?.qualityOfConstruction || "",
                                    appearanceOfBuilding: formData.pdfDetails?.appearanceOfBuilding || formData.buildingConstruction?.appearanceOfBuilding || "",
                                    maintenanceOfBuilding: formData.pdfDetails?.maintenanceOfBuilding || formData.buildingConstruction?.maintenanceOfBuilding || ""
                                },
                                documentInformation: {
                                    branch: formData.pdfDetails?.branch || "",
                                    referenceNo: formData.pdfDetails?.referenceNo || "",
                                    dateOfInspection: formData.pdfDetails?.dateOfInspection || "",
                                    dateOfValuation: formData.pdfDetails?.dateOfValuation || formData.pdfDetails?.dateOfValuationMade || ""
                                },
                                ownerDetails: {
                                    ownerNameAddress: formData.pdfDetails?.ownerNameAddress || "",
                                    propertyDescription: formData.pdfDetails?.briefDescriptionProperty || ""
                                },
                                locationOfProperty: {
                                    plotSurveyNo: formData.pdfDetails?.plotSurveyNo || "",
                                    doorNo: formData.pdfDetails?.doorNo || "",
                                    tsVillage: formData.pdfDetails?.tpVillage || "",
                                    wardTaluka: formData.pdfDetails?.wardTaluka || "",
                                    mandalDistrict: formData.pdfDetails?.mandalDistrict || "",
                                    dateLayoutIssueValidity: formData.pdfDetails?.layoutPlanIssueDate || "",
                                    approvedMapIssuingAuthority: formData.pdfDetails?.approvedMapAuthority || "",
                                    authenticityVerified: formData.pdfDetails?.authenticityVerified || "",
                                    valuationCommentsAuthenticity: formData.pdfDetails?.valuerCommentOnAuthenticity || ""
                                },
                                customFields: customFields,
                                pdfDetails: formData.pdfDetails
                            };

                            // Parallel image uploads
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
                                    const newSupportingImages = (formData.documentPreviews || []).filter(d => d && d.file);
                                    if (newSupportingImages.length > 0) {
                                        return await uploadPropertyImages(newSupportingImages, valuation.uniqueId);
                                    }
                                    return [];
                                })(),
                                (async () => {
                                    const areaImagesObj = {};
                                    const areaImagesToUpload = {};
                                    for (const [key, file] of Object.entries(formData.areaImages || {})) {
                                        if (file instanceof File) {
                                            areaImagesToUpload[key] = { file, inputNumber: key };
                                        } else {
                                            areaImagesObj[key] = file;
                                        }
                                    }
                                    if (Object.keys(areaImagesToUpload).length > 0) {
                                        const uploadedAreaImgs = await uploadPropertyImages(Object.values(areaImagesToUpload), valuation.uniqueId);
                                        uploadedAreaImgs.forEach((img, index) => {
                                            const keys = Object.keys(areaImagesToUpload);
                                            if (keys[index]) {
                                                areaImagesObj[keys[index]] = img.url;
                                            }
                                        });
                                    }
                                    return areaImagesObj;
                                })()
                            ]);

                            const previousPropertyImages = (valuation?.propertyImages || [])
                                .filter(img => img && !imagePreviews.some(p => p && p.preview === img.preview))
                                .map(img => (typeof img === 'string' ? { url: img } : img));

                            const previousLocationImages = uploadedLocationImages.length === 0 ? (valuation?.locationImages || []) : [];

                            const previousSupportingImages = (valuation?.documentPreviews || [])
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

                            localStorage.removeItem(`valuation_draft_${username}`);

                            // Call API to update valuation
                            await updateValuation(id, payload, username, role, clientId);
                            invalidateCache("/valuations");
                            
                            // Save current form data as last ubiShop form for prefilling next form
                            saveCurrentUbiShopDataAsLast();

                            showSuccess('UbiShop form saved successfully');
                            setLoading(false);
                            resolve();
                        } catch (error) {
                            console.error("Error saving UbiShop form:", error);
                            showError('Failed to save UbiShop form');
                            setLoading(false);
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
            setLoading(true);
            dispatch(showLoader(`${actionLabel}ing form...`));

            const payload = {
                status: statusValue,
                managerFeedback: modalFeedback.trim()
            };

            const responseData = await managerSubmit(id, payload);
            invalidateCache("/valuations");

            // Update the valuation state with response data from backend
            setValuation(responseData.data || responseData);

            showSuccess(`Form ${statusValue} successfully!`);
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

    if (!valuation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-80">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-muted-foreground"></p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            "pending": "warning",
            "on-progress": "default",
            "approved": "success",
            "rejected": "destructive",
            "rework": "outline"
        };
        return colors[status] || "default";
    };

    // Permission checks
    const canEdit = isLoggedIn && (
        (role === "admin") ||
        (role === "manager" && (valuation.status === "pending" || valuation.status === "rejected" || valuation.status === "on-progress" || valuation.status === "rework")) ||
        ((role === "user") && (valuation.status === "rejected" || valuation.status === "pending" || valuation.status === "rework"))
    );

    const canApprove = isLoggedIn && (role === "manager" || role === "admin") &&
        (valuation.status === "pending" || valuation.status === "on-progress" || valuation.status === "rejected" || valuation.status === "rework");

    // Fields that only managers and admin can edit (users can only read)
    const restrictedEditFields = ["bankName", "city", "clientName", "mobileNumber", "address", "payment", "collectedBy", "dsa", "engineerName"];

    // Check if a specific field is editable for the current user
    const canEditField = (fieldName) => {
        // If user is admin or manager, they can edit all fields
        if (role === "admin" || role === "manager") {
            return canEdit;
        }
        // If user is regular user, they cannot edit restricted fields
        if (role === "user") {
            return canEdit && !restrictedEditFields.includes(fieldName);
        }
        return canEdit;
    };

    const statusColors = {
        "pending": { bg: "bg-yellow-100", text: "text-yellow-800" },
        "on-progress": { bg: "bg-blue-100", text: "text-blue-800" },
        "approved": { bg: "bg-green-100", text: "text-green-800" },
        "rejected": { bg: "bg-red-100", text: "text-red-800" },
        "rework": { bg: "bg-orange-100", text: "text-orange-800" }
    };

    const statusIcons = {
        "pending": <FaCog className="h-4 w-4" />,
        "on-progress": <FaArrowLeft className="h-4 w-4" />,
        "approved": <FaCheckCircle className="h-4 w-4" />,
        "rejected": <FaTimesCircle className="h-4 w-4" />,
        "rework": <FaRedo className="h-4 w-4" />
    };

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

                {/* Header - Premium */}
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
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">UbiShop Edit Valuation Form</h1>
                        <p className="text-xs text-neutral-500 mt-1">{!isLoggedIn && "Read-Only Mode"}</p>
                    </div>
                </div>



                {/* Main Content - 2-Column Layout (Full Height Optimized) */}
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
                                <CardTitle className="text-sm font-bold text-neutral-900">Property Details</CardTitle>
                                <p className="text-neutral-600 text-xs mt-1.5 font-medium">* Required fields</p>
                            </CardHeader>
                            <CardContent className="p-4 overflow-y-auto flex-1">
                                <form className="space-y-3">

                                    {/* Tab Navigation */}
                                    <div className="flex flex-wrap gap-2 p-0 bg-transparent rounded-none border-0">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("client")}
                                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === "client"
                                                ? "bg-blue-500 text-white border border-blue-600 shadow-sm"
                                                : "bg-white border border-neutral-300 text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                                }`}
                                        >
                                            Client Info
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("documents")}
                                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === "documents"
                                                ? "bg-blue-500 text-white border border-blue-600 shadow-sm"
                                                : "bg-white border border-neutral-300 text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                                }`}
                                        >
                                            Documents & Notes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("valuation")}
                                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === "valuation"
                                                ? "bg-blue-500 text-white border border-blue-600 shadow-sm"
                                                : "bg-white border border-neutral-300 text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                                }`}
                                        >
                                            Valuation
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("addfields")}
                                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === "addfields"
                                                ? "bg-blue-500 text-white border border-blue-600 shadow-sm"
                                                : "bg-white border border-neutral-300 text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                                }`}
                                        >
                                            Add Fields
                                        </button>
                                    </div>

                                    {/* CLIENT INFORMATION Section */}
                                    {activeTab === "client" && (
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
                                            engineerName={formData.engineerName || ""}
                                            setEngineerName={(value) => setFormData(prev => ({ ...prev, engineerName: value }))}
                                            engineerNames={engineerNames}
                                        />
                                    )}



                                    {/* PROPERTY & PAYMENT Section - MOVED TO CLIENT INFO TAB */}
                                    {false && activeTab === "property" && (
                                        <>

                                            {/* Property Basic Details Section - NOW IN CLIENT INFO */}
                                            {/* REMOVED */}

                                        </>
                                    )}

                                    {/* DOCUMENTS & NOTES Section */}
                                    {activeTab === "documents" && (
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
                                            formType="ubiShop"
                                        />
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

                                    {/* VALUATION Section */}
                                    {activeTab === "valuation" && (
                                        <>

                                            {/* Valuation Sub-Tabs Navigation */}
                                            <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-2xl border border-gray-200 mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveValuationSubTab("documents")}
                                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeValuationSubTab === "documents"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                                        }`}
                                                >
                                                    Documents
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveValuationSubTab("building")}
                                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeValuationSubTab === "building"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                                        }`}
                                                >
                                                    Building Details
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveValuationSubTab("results")}
                                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeValuationSubTab === "results"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                                        }`}
                                                >
                                                    Results & Signature
                                                </button>
                                            </div>

                                            {/* PDF Details Section */}
                                            {activeValuationSubTab === "documents" && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                        <FaFileAlt className="h-5 w-5 text-orange-600" />
                                                        PDF Details
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-6">Property valuation details</p>

                                                    {/* Basic Document Info */}
                                                    <div className="mb-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                                                        <h4 className="font-bold text-gray-900 mb-4">Document Information</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Branch</Label>
                                                                <Input
                                                                    placeholder="Branch"
                                                                    value={formData.pdfDetails?.branch || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, branch: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Reference No</Label>
                                                                <Input
                                                                    placeholder="Reference No"
                                                                    value={formData.pdfDetails?.referenceNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, referenceNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                        </div>
                                                    </div>

                                                    {/* GENERAL SECTION - Inspection Dates */}
                                                    <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Inspection Dates</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Date of Inspection</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.dateOfInspection || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, dateOfInspection: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Date on which Valuation is Made</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.dateOfValuationMade || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, dateOfValuationMade: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* DOCUMENTS & OWNER DETAILS SECTION */}
                                                    <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-green-50 rounded-2xl border border-amber-200">
                                                        <h4 className="font-bold text-gray-900 mb-4">Documents Produced & Owner Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Documents Produced for Perusal */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Photocopy of Agreement for Sale</Label>
                                                                <Input
                                                                    placeholder="Enter details"
                                                                    value={formData.pdfDetails?.agreementForSale || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, agreementForSale: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Commencement Certificate</Label>
                                                                <Input
                                                                    placeholder="Enter details"
                                                                    value={formData.pdfDetails?.commencementCertificate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, commencementCertificate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Occupancy Certificate</Label>
                                                                <Input
                                                                    placeholder="Enter details"
                                                                    value={formData.pdfDetails?.occupancyCertificate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, occupancyCertificate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                            {/* Owner Details & Property Description */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Name of Owner(s) and Address</Label>
                                                                <Input
                                                                    placeholder="Enter owner name and address"
                                                                    value={formData.pdfDetails?.ownerNameAddress || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, ownerNameAddress: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Brief Description of Property</Label>
                                                                <Input
                                                                    placeholder="Enter property description"
                                                                    value={formData.pdfDetails?.briefDescriptionProperty || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, briefDescriptionProperty: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* LOCATION OF PROPERTY - Section 6 */}
                                                    <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Location of Property</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Plot No. / Survey No.</Label>
                                                                <Input
                                                                    placeholder="Enter plot/survey number"
                                                                    value={formData.pdfDetails?.plotSurveyNo || "S. No. , Hissa No. , Part Tika No , Final Plot No. , Sub Plot No , T.P. Scheme No. "}

                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, plotSurveyNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Door No.</Label>
                                                                <Input
                                                                    placeholder="Enter door number"
                                                                    value={formData.pdfDetails?.doorNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, doorNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">T.S. No. / Village</Label>
                                                                <Input
                                                                    placeholder="Enter village"
                                                                    value={formData.pdfDetails?.tpVillage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, tpVillage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Ward / Taluka</Label>
                                                                <Input
                                                                    placeholder="Enter ward/taluka"
                                                                    value={formData.pdfDetails?.wardTaluka || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, wardTaluka: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Mandal / District</Label>
                                                                <Input
                                                                    placeholder="Enter district"
                                                                    value={formData.pdfDetails?.mandalDistrict || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, mandalDistrict: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Date of Layout Issue & Validity</Label>
                                                                <Input
                                                                    placeholder="Enter date"
                                                                    value={formData.pdfDetails?.layoutPlanIssueDate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, layoutPlanIssueDate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Approved Map Issuing Authority</Label>
                                                                <Input
                                                                    placeholder="Enter authority"
                                                                    value={formData.pdfDetails?.approvedMapAuthority || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, approvedMapAuthority: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Authenticity Verified</Label>
                                                                <ChipSelect
                                                                    options={["Yes", "No"]}
                                                                    value={formData.pdfDetails?.authenticityVerified || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, authenticityVerified: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Valuer Comments on Authenticity</Label>
                                                                <Input
                                                                    placeholder="Enter comments"
                                                                    value={formData.pdfDetails?.valuerCommentOnAuthenticity || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, valuerCommentOnAuthenticity: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Postal Address of Property</Label>
                                                                <Input
                                                                    placeholder="Enter complete postal address"
                                                                    value={formData.pdfDetails?.postalAddress || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, postalAddress: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                        </div>
                                                    </div>




                                                    {/* CITY/TOWN & AREA - Section 8 */}
                                                    <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">City/Town & Area Type</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">City / Town</Label>
                                                                <Input
                                                                    placeholder="Enter city/town name"
                                                                    value={formData.pdfDetails?.cityTown || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, cityTown: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Residential Area</Label>
                                                                <div className="flex items-center h-10">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.pdfDetails?.residentialArea || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, residentialArea: e.target.checked } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-gray-300"
                                                                    />
                                                                    <span className="ml-2 text-sm text-gray-700">Is this a residential area?</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Commercial Area</Label>
                                                                <div className="flex items-center h-10">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.pdfDetails?.commercialArea || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, commercialArea: e.target.checked } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-gray-300"
                                                                    />
                                                                    <span className="ml-2 text-sm text-gray-700">Is this a commercial area?</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Industrial Area</Label>
                                                                <div className="flex items-center h-10">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.pdfDetails?.industrialArea || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, industrialArea: e.target.checked } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-gray-300"
                                                                    />
                                                                    <span className="ml-2 text-sm text-gray-700">Is this an industrial area?</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* INDUSTRIAL AREA DETAILS - Section 9 */}
                                                    <div className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Classification of Area</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">High / Middle / Poor</Label>
                                                                <ChipSelect
                                                                    options={["High", "Middle", "Poor"]}
                                                                    value={formData.pdfDetails?.areaClassification || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, areaClassification: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Urban / Semi Urban / Rural</Label>
                                                                <ChipSelect
                                                                    options={["Urban", "Semi Urban", "Rural"]}
                                                                    value={formData.pdfDetails?.urbanClassification || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, urbanClassification: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Coming under Corporation / Village Panchayat / Municipality</Label>
                                                                <ChipSelect
                                                                    options={["Corporation", "Panchayat", "Municipality"]}
                                                                    value={formData.pdfDetails?.governmentType || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, governmentType: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">State / Central Govt. Enactments Coverage</Label>
                                                                <ChipSelect
                                                                    options={["Yes", "No"]}
                                                                    value={formData.pdfDetails?.govtEnactmentsCovered || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, govtEnactmentsCovered: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* BOUNDARIES OF PROPERTY - Section 12 */}
                                                    <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Boundaries of the Property</h4>

                                                        <div className="w-full overflow-x-auto mb-6">
                                                            <table className="min-w-full text-sm border-collapse">
                                                                <thead>
                                                                    <tr className="bg-indigo-200 border border-indigo-300">
                                                                        <th className="px-3 py-2 text-left font-bold text-gray-900 border border-indigo-300 min-w-[100px]">12a</th>
                                                                        <th className="px-3 py-2 text-left font-bold text-gray-900 border border-indigo-300 min-w-[180px]">Boundaries of the property - Plot</th>
                                                                        <th className="px-3 py-2 text-center font-bold text-gray-900 border border-indigo-300 min-w-[180px]">As per Deed</th>
                                                                        <th className="px-3 py-2 text-center font-bold text-gray-900 border border-indigo-300 min-w-[180px]">As per Actual</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr className="border border-indigo-300">
                                                                        <td className="px-3 py-2 border border-indigo-300"></td>
                                                                        <td className="px-3 py-2 border border-indigo-300 font-semibold">North</td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesPlotNorthDeed || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesPlotNorthDeed: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesPlotNorthActual || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesPlotNorthActual: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                    </tr>
                                                                    <tr className="border border-indigo-300">
                                                                        <td className="px-3 py-2 border border-indigo-300"></td>
                                                                        <td className="px-3 py-2 border border-indigo-300 font-semibold">South</td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesPlotSouthDeed || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesPlotSouthDeed: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesPlotSouthActual || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesPlotSouthActual: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                    </tr>
                                                                    <tr className="border border-indigo-300">
                                                                        <td className="px-3 py-2 border border-indigo-300"></td>
                                                                        <td className="px-3 py-2 border border-indigo-300 font-semibold">East</td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesPlotEastDeed || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesPlotEastDeed: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesPlotEastActual || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesPlotEastActual: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                    </tr>
                                                                    <tr className="border border-indigo-300">
                                                                        <td className="px-3 py-2 border border-indigo-300"></td>
                                                                        <td className="px-3 py-2 border border-indigo-300 font-semibold">West</td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesPlotWestDeed || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesPlotWestDeed: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesPlotWestActual || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesPlotWestActual: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="w-full overflow-x-auto">
                                                            <table className="min-w-full text-sm border-collapse">
                                                                <thead>
                                                                    <tr className="bg-indigo-200 border border-indigo-300">
                                                                        <th className="px-3 py-2 text-left font-bold text-gray-900 border border-indigo-300 min-w-[100px]">12b</th>
                                                                        <th className="px-3 py-2 text-left font-bold text-gray-900 border border-indigo-300 min-w-[180px]">Boundaries of the property - Shop</th>
                                                                        <th className="px-3 py-2 text-center font-bold text-gray-900 border border-indigo-300 min-w-[180px]">As per Deed</th>
                                                                        <th className="px-3 py-2 text-center font-bold text-gray-900 border border-indigo-300 min-w-[180px]">As per Actual</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr className="border border-indigo-300">
                                                                        <td className="px-3 py-2 border border-indigo-300"></td>
                                                                        <td className="px-3 py-2 border border-indigo-300 font-semibold">North</td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesShopNorthDeed || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesShopNorthDeed: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesShopNorthActual || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesShopNorthActual: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                    </tr>
                                                                    <tr className="border border-indigo-300">
                                                                        <td className="px-3 py-2 border border-indigo-300"></td>
                                                                        <td className="px-3 py-2 border border-indigo-300 font-semibold">South</td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesShopSouthDeed || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesShopSouthDeed: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesShopSouthActual || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesShopSouthActual: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                    </tr>
                                                                    <tr className="border border-indigo-300">
                                                                        <td className="px-3 py-2 border border-indigo-300"></td>
                                                                        <td className="px-3 py-2 border border-indigo-300 font-semibold">East</td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesShopEastDeed || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesShopEastDeed: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesShopEastActual || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesShopEastActual: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                    </tr>
                                                                    <tr className="border border-indigo-300">
                                                                        <td className="px-3 py-2 border border-indigo-300"></td>
                                                                        <td className="px-3 py-2 border border-indigo-300 font-semibold">West</td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesShopWestDeed || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesShopWestDeed: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-3 py-2 border border-indigo-300"><Input type="text" placeholder="NA" value={formData.pdfDetails?.boundariesShopWestActual || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesShopWestActual: e.target.value } }))} className="h-8 text-xs" disabled={!canEdit} /></td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* DIMENSIONS OF THE UNIT - Section 13 */}
                                                    <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Dimensions of the Unit</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">As per Deed</Label>
                                                                <Input
                                                                    placeholder="Dimensions as per deed"
                                                                    value={formData.pdfDetails?.dimensionsDeed || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, dimensionsDeed: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Actual</Label>
                                                                <Input
                                                                    placeholder="Actual dimensions"
                                                                    value={formData.pdfDetails?.dimensionsActual || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, dimensionsActual: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* EXTENT OF THE UNIT & EXTENT OF SITE CONSIDERED FOR VALUATION - Sections 14 & 15 */}
                                                    <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Extent of the Unit & Site Valuation</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Extent of Unit (Sq. m. / Sq. ft.)</Label>
                                                                <Input
                                                                    placeholder="e.g., 44.59 Sq.m. = sq.m/sq.ft."
                                                                    value={formData.pdfDetails?.extentOfUnit || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, extentOfUnit: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Latitude, Longitude & Coordinates</Label>
                                                                <Input
                                                                    placeholder="e.g., 19°11'59.12 N & 72°58'19.12 E"
                                                                    value={formData.pdfDetails?.latitudeLongitude || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, latitudeLongitude: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Extent of Site for Valuation (Lease 13 A & 13 B)</Label>
                                                                <Input
                                                                    placeholder="e.g., 44.59 Sq.m. = 480.00 Sq.ft."
                                                                    value={formData.pdfDetails?.extentOfSiteValuation || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, extentOfSiteValuation: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            )}


                                            {/* Building Details Section - Page 4 */}
                                            {activeValuationSubTab === "building" && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Building Details & Occupancy</h3>
                                                    {/* Apartment Building - Location Details */}
                                                    <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Apartment Building - Location</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">
                                                                    Nature of the Apartment
                                                                </Label>

                                                                <select
                                                                    value={formData.pdfDetails?.apartmentNature || ""}
                                                                    onChange={(e) =>
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            pdfDetails: {
                                                                                ...prev.pdfDetails,
                                                                                apartmentNature: e.target.value,
                                                                            },
                                                                        }))
                                                                    }
                                                                    disabled={!canEdit}
                                                                    className="h-10 w-full text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                >
                                                                    <option value="">Select Nature</option>
                                                                    <option value="Residential">Residential</option>
                                                                    <option value="Commercial">Commercial</option>
                                                                    <option value="Industrial">Industrial</option>
                                                                    <option value="Special">Special</option>
                                                                </select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Location</Label>
                                                                <Input
                                                                    placeholder="e.g., Makhamali Talao"
                                                                    value={formData.pdfDetails?.apartmentLocation || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentLocation: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">T.S. No.</Label>
                                                                <Input
                                                                    placeholder="Survey number"
                                                                    value={formData.pdfDetails?.apartmentTSNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentTSNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Block No.</Label>
                                                                <Input
                                                                    placeholder="Block number"
                                                                    value={formData.pdfDetails?.apartmentBlockNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentBlockNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Ward No.</Label>
                                                                <Input
                                                                    placeholder="Ward number"
                                                                    value={formData.pdfDetails?.apartmentWardNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentWardNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Village / Municipality / Corporation</Label>
                                                                <Input
                                                                    placeholder="e.g., Thane Municipal Corporation"
                                                                    value={formData.pdfDetails?.apartmentVillageMunicipalityCounty || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentVillageMunicipalityCounty: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Door No., Street or Road (Pin Code)</Label>
                                                                <Input
                                                                    placeholder="e.g., 400 601"
                                                                    value={formData.pdfDetails?.apartmentDoorNoStreetRoadPinCode || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentDoorNoStreetRoadPinCode: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>


                                                    </div>

                                                    {/* Building Construction & Description Details */}
                                                    <div className="mb-6 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Building Construction & Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Description of Locality (Residential / Commercial / Mixed)</Label>
                                                                <Input
                                                                    placeholder="e.g., Commercial"
                                                                    value={formData.pdfDetails?.descriptionOfLocalityResidentialCommercialMixed || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, descriptionOfLocalityResidentialCommercialMixed: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Year of Construction</Label>
                                                                <Input
                                                                    placeholder="e.g., Approx. 2002"
                                                                    value={formData.pdfDetails?.yearOfConstruction || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, yearOfConstruction: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Number of Floors</Label>
                                                                <Input
                                                                    placeholder="e.g., Ground + Upper 3 Floors"
                                                                    value={formData.pdfDetails?.numberOfFloors || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, numberOfFloors: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Type of Structure</Label>
                                                                <Input
                                                                    placeholder="e.g., R.C.C. Structure"
                                                                    value={formData.pdfDetails?.typeOfStructure || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, typeOfStructure: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Number of Dwelling Units in Building</Label>
                                                                <Input
                                                                    placeholder="e.g., 3 Shops"
                                                                    value={formData.buildingConstruction?.numberOfDwellingUnits || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, buildingConstruction: { ...prev.buildingConstruction, numberOfDwellingUnits: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Quality of Construction</Label>
                                                                <ChipSelect
                                                                    options={["Good", "Average", "Bad"]}
                                                                    value={formData.pdfDetails?.qualityOfConstruction || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, qualityOfConstruction: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Appearance of the Building</Label>
                                                                <ChipSelect
                                                                    options={["Good", "Average", "Bad"]}
                                                                    value={formData.pdfDetails?.appearanceOfBuilding || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, appearanceOfBuilding: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Maintenance of the Building</Label>
                                                                <ChipSelect
                                                                    options={["Good", "Average", "Bad"]}
                                                                    value={formData.pdfDetails?.maintenanceOfBuilding || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, maintenanceOfBuilding: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Facilities Available */}
                                                    <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Facilities Available</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Lift</Label>
                                                                <ChipSelect
                                                                    options={["Available", "Not Available"]}
                                                                    value={formData.pdfDetails?.liftAvailable || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, liftAvailable: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Protected Water Supply</Label>
                                                                <Input
                                                                    placeholder="e.g., Municipal Water Supply"
                                                                    value={formData.pdfDetails?.protectedWaterSupply || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, protectedWaterSupply: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Underground Sewerage</Label>
                                                                <ChipSelect
                                                                    options={["Available", "Not Available"]}
                                                                    value={formData.pdfDetails?.undergroundSewerage || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, undergroundSewerage: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Car Parking (Open / Covered)</Label>
                                                                <ChipSelect
                                                                    options={["Open", "Covered", "Both"]}
                                                                    value={formData.pdfDetails?.carParkingOpenCovered || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, carParkingOpenCovered: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Is Compound Wall Existing?</Label>
                                                                <ChipSelect
                                                                    options={["Yes", "No"]}
                                                                    value={formData.pdfDetails?.isCompoundWallExisting || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, isCompoundWallExisting: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Is Pavement Laid Around the Building?</Label>
                                                                <ChipSelect
                                                                    options={["Yes", "No"]}
                                                                    value={formData.pdfDetails?.isPavementLaidAroundBuilding || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, isPavementLaidAroundBuilding: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 3: Unit Specifications */}
                                                    <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Section 3: Specifications of the Unit</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">The floor on which the Unit is situated</Label>
                                                                <ChipSelect
                                                                    options={["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "Basement", "Terrace"]}
                                                                    value={formData.pdfDetails?.unitFloor || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitFloor: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Door No. of the Unit</Label>
                                                                <Input
                                                                    placeholder="e.g., Flat (Shop) No. G5"
                                                                    value={formData.pdfDetails?.unitDoorNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitDoorNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Roof</Label>
                                                                <ChipSelect
                                                                    options={["R.C.C. Slabs", "Asbestos Sheets", "Concrete Slabs", "Tiles"]}
                                                                    value={formData.pdfDetails?.unitRoof || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitRoof: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flooring</Label>
                                                                <ChipSelect
                                                                    options={["Ceramic Tile flooring", "vitrified Tiles", "Mosaic Tiles", "Marble", "Granite", "Wooden", "Cement"]}
                                                                    value={formData.pdfDetails?.unitFlooring || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitFlooring: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Doors</Label>
                                                                <ChipSelect
                                                                    options={["Rolling Shutter", "Wooden", "Steel", "Aluminum"]}
                                                                    value={formData.pdfDetails?.unitDoors || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitDoors: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Windows</Label>
                                                                <ChipSelect
                                                                    options={["Nil", "Section", "Slider",]}
                                                                    value={formData.pdfDetails?.unitWindows || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitWindows: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Fittings</Label>
                                                                <ChipSelect
                                                                    options={["Concealed Electric fitting", "Open Wiring", "Surface Wiring"]}
                                                                    value={formData.pdfDetails?.unitFittings || ""}
                                                                    onChange={(value) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitFittings: value } }))}
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Finishing</Label>
                                                                <Textarea
                                                                    placeholder="e.g., Externally sand faced plaster with apex paint Internally neeru finish plaster with oil bond distemper."
                                                                    value={formData.pdfDetails?.unitFinishing || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitFinishing: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 4: Unit Tax */}
                                                    <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Section 4: Unit Tax</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Assessment No.</Label>
                                                                <Input
                                                                    placeholder="e.g., N.A."
                                                                    value={formData.pdfDetails?.assessmentNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, assessmentNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Tax paid in the name of</Label>
                                                                <Input
                                                                    placeholder="e.g., N.A."
                                                                    value={formData.pdfDetails?.taxPaidName || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, taxPaidName: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Tax amount</Label>
                                                                <Input
                                                                    placeholder="e.g., N.A."
                                                                    value={formData.pdfDetails?.taxAmount || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, taxAmount: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 5-9: Combined Details */}
                                                    <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                                                        <h4 className="font-bold text-gray-900 mb-4">Section 5-9: Property & Unit Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Whether occupied by the owner / tenant? */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Whether occupied by the owner / tenant?</Label>
                                                                <select
                                                                    value={formData.pdfDetails?.occupancyType || ""}
                                                                    onChange={(e) =>
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            pdfDetails: {
                                                                                ...prev.pdfDetails,
                                                                                occupancyType: e.target.value,
                                                                                tenantSince: "",
                                                                                rentReceivedPerMonth: "",
                                                                                vacantRemarks: "",
                                                                                constructionStatus: "",
                                                                                builderRemarks: "",
                                                                            },
                                                                        }))
                                                                    }
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
                                                                >
                                                                    <option value="">Select Occupancy Type</option>
                                                                    <option value="Owner">Owner Occupied</option>
                                                                    <option value="Rented">Tenant</option>
                                                                    <option value="Vacant">Vacant</option>
                                                                    <option value="UnderConstruction">Under Construction</option>
                                                                    <option value="Builder">Builder Possession</option>
                                                                </select>
                                                            </div>

                                                            {/* Occupancy Type Additional Fields */}
                                                            {formData.pdfDetails?.occupancyType === "Rented" && (
                                                                <>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Tenant since</Label>
                                                                        <Input
                                                                            placeholder="e.g. Jan 2022 / 2 years"
                                                                            value={formData.pdfDetails?.tenantSince || ""}
                                                                            onChange={(e) =>
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    pdfDetails: {
                                                                                        ...prev.pdfDetails,
                                                                                        tenantSince: e.target.value,
                                                                                    },
                                                                                }))
                                                                            }
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Rent received per month</Label>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="e.g., 50000"
                                                                            value={formData.pdfDetails?.rentReceivedPerMonth || ""}
                                                                            onChange={(e) =>
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    pdfDetails: {
                                                                                        ...prev.pdfDetails,
                                                                                        rentReceivedPerMonth: e.target.value,
                                                                                    },
                                                                                }))
                                                                            }
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}

                                                            {formData.pdfDetails?.occupancyType === "Vacant" && (
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">Vacant since / reason</Label>
                                                                    <Input
                                                                        placeholder="e.g. since Mar 2024, unsold, renovation, etc."
                                                                        value={formData.pdfDetails?.vacantRemarks || ""}
                                                                        onChange={(e) =>
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                pdfDetails: {
                                                                                    ...prev.pdfDetails,
                                                                                    vacantRemarks: e.target.value,
                                                                                },
                                                                            }))
                                                                        }
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                    />
                                                                </div>
                                                            )}

                                                            {formData.pdfDetails?.occupancyType === "UnderConstruction" && (
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">Expected completion date / stage</Label>
                                                                    <Input
                                                                        placeholder="e.g., Dec 2024 / 80% complete"
                                                                        value={formData.pdfDetails?.constructionStatus || ""}
                                                                        onChange={(e) =>
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                pdfDetails: {
                                                                                    ...prev.pdfDetails,
                                                                                    constructionStatus: e.target.value,
                                                                                },
                                                                            }))
                                                                        }
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                    />
                                                                </div>
                                                            )}

                                                            {formData.pdfDetails?.occupancyType === "Builder" && (
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">Builder possession remarks</Label>
                                                                    <Input
                                                                        placeholder="e.g., handover status, reason, etc."
                                                                        value={formData.pdfDetails?.builderRemarks || ""}
                                                                        onChange={(e) =>
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                pdfDetails: {
                                                                                    ...prev.pdfDetails,
                                                                                    builderRemarks: e.target.value,
                                                                                },
                                                                            }))
                                                                        }
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Section 5: Electricity Service */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Electricity Service Connection no.</Label>
                                                                <Input
                                                                    placeholder="e.g., CA No. 000027326048"
                                                                    value={formData.pdfDetails?.electricityServiceNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, electricityServiceNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Meter Card is in the name of</Label>
                                                                <Input
                                                                    placeholder="e.g., Mr. Arun Motiram Wankhede"
                                                                    value={formData.pdfDetails?.meterCardName || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, meterCardName: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                            {/* Section 6: Unit Maintenance */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">How is the maintenance of the Unit?</Label>
                                                                <select
                                                                    value={formData.pdfDetails?.unitMaintenance || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, unitMaintenance: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
                                                                >
                                                                    <option value="">Select Maintenance Status</option>
                                                                    <option value="Good">Good</option>
                                                                    <option value="Average">Average</option>
                                                                    <option value="Poor">Poor</option>
                                                                    <option value="Excellent">Excellent</option>
                                                                </select>
                                                            </div>

                                                            {/* Section 7: Agreement for Sale */}
                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label className="text-sm font-bold text-gray-900">Agreement for Sale executed in the name of</Label>
                                                                <Input
                                                                    placeholder="e.g., Mr. Arun Motiram Wankhede"
                                                                    value={formData.pdfDetails?.agreementSaleExecutedName || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, agreementSaleExecutedName: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                            {/* Section 8 & 9: Unit Area Details */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Undivided area of land (as per Sale Deed)</Label>
                                                                <Input
                                                                    placeholder="e.g., 944.64 sqm"
                                                                    value={formData.pdfDetails?.undividedAreaLand || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, undividedAreaLand: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Plinth area of the Unit</Label>
                                                                <Input
                                                                    placeholder="e.g., 53.51 Sqm. = 576.00 SqFt."
                                                                    value={formData.pdfDetails?.plinthArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, plinthArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Carpet Area of the Unit</Label>
                                                                <Input
                                                                    placeholder="e.g., 44.59 Sqm. = 480.00 SqFt."
                                                                    value={formData.pdfDetails?.carpetArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, carpetArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 10-14: Unit Classification */}
                                                    <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Section 10-14: Unit Classification</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">What is the floor space index (app.)</Label>
                                                                <Input
                                                                    placeholder="e.g., To be Verify"
                                                                    value={formData.pdfDetails?.floorSpaceIndex || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, floorSpaceIndex: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Is it Posh / I class / Medium / Ordinary?</Label>
                                                                <select
                                                                    value={formData.pdfDetails?.classificationPosh || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, classificationPosh: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
                                                                >
                                                                    <option value="">Select Classification</option>
                                                                    <option value="Posh">Posh</option>
                                                                    <option value="I class">I class</option>
                                                                    <option value="Medium">Medium</option>
                                                                    <option value="Ordinary">Ordinary</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Is it being used for Residential or Commercial purpose?</Label>
                                                                <select
                                                                    value={formData.pdfDetails?.classificationUsage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, classificationUsage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
                                                                >
                                                                    <option value="">Select Usage</option>
                                                                    <option value="Residential">Residential</option>
                                                                    <option value="Commercial">Commercial</option>
                                                                    <option value="Mixed">Mixed</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Is it Owner-occupied or let out?</Label>
                                                                <select
                                                                    value={formData.pdfDetails?.classificationOwnership || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, classificationOwnership: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
                                                                >
                                                                    <option value="">Select Status</option>
                                                                    <option value="Owner-occupied">Owner-occupied</option>
                                                                    <option value="Tenant">Tenant</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Valuation Results & Signature Section */}
                                            {activeValuationSubTab === "results" && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Results & Signature</h3>

                                                    {/* Monthly Rent Details & Marketability Section */}
                                                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                                                        <h4 className="font-bold text-gray-900 mb-4"> Marketability</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">How is the marketability?</Label>
                                                                <select
                                                                    value={formData.pdfDetails?.marketability || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, marketability: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
                                                                >
                                                                    <option value="">Select Marketability</option>
                                                                    <option value="Good">Good</option>
                                                                    <option value="Average">Average</option>
                                                                    <option value="Poor">Poor</option>
                                                                    <option value="Excellent">Excellent</option>
                                                                </select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Factors favouring for extra Potential Value</Label>
                                                                <Input
                                                                    placeholder="e.g., No. / Describe factors"
                                                                    value={formData.pdfDetails?.favoringFactors || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, favoringFactors: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Negative factors affecting market value</Label>
                                                                <Input
                                                                    placeholder="e.g., No. / Describe negative factors"
                                                                    value={formData.pdfDetails?.negativeFactors || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, negativeFactors: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Rate Section */}
                                                    <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">V. RATE</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Comparable Rate for similar unit (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 30,700/- per Sqft."
                                                                    value={formData.pdfDetails?.comparableRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, comparableRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Adopted Basic Composite Rate (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 30,700/- per Sqft."
                                                                    value={formData.pdfDetails?.adoptedBasicCompositeRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, adoptedBasicCompositeRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Building + Services Rate (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 3,000.00/- per Sqft."
                                                                    value={formData.pdfDetails?.buildingServicesRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, buildingServicesRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Land + Others Rate (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 27,700.00/- per Sqft."
                                                                    value={formData.pdfDetails?.landOthersRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, landOthersRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Guideline Rate from Registrar's Office (per Sqm)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 2,43,100.00/- per Sqm."
                                                                    value={formData.pdfDetails?.guidelineRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, guidelineRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Composite Rate After Depreciation */}
                                                    <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">VI. COMPOSITE RATE ADOPTED AFTER DEPRECIATION</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Depreciated Building Rate (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 2,310.00/- per Sqft."
                                                                    value={formData.pdfDetails?.depreciatedBuildingRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, depreciatedBuildingRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Replacement Cost of Unit with Services (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 3,000.00/- per Sqft."
                                                                    value={formData.pdfDetails?.replacementCostServices || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, replacementCostServices: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Age of the Building (Years)</Label>
                                                                <Input
                                                                    placeholder="e.g., 23 Years"
                                                                    value={formData.pdfDetails?.buildingAge || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, buildingAge: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Life of the Building Estimated (Years)</Label>
                                                                <Input
                                                                    placeholder="e.g., 37 Years"
                                                                    value={formData.pdfDetails?.buildingLife || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, buildingLife: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Depreciation Percentage assuming salvage value as 10%</Label>
                                                                <Input
                                                                    placeholder="e.g., 23 %"
                                                                    value={formData.pdfDetails?.depreciationPercentage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, depreciationPercentage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Depreciated Ratio of the Building</Label>
                                                                <Input
                                                                    placeholder="e.g., 77 %"
                                                                    value={formData.pdfDetails?.deprecatedRatio || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, deprecatedRatio: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Total Composite Rate */}
                                                    <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Total Composite Rate Arrived For Valuation</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Depreciated Building Rate VI (a) (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 2,310.00/- per Sqft."
                                                                    value={formData.pdfDetails?.depreciatedBuildingRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, depreciatedBuildingRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Rate for Land & Other V (3)ii (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 27,700.00/- per Sqft."
                                                                    value={formData.pdfDetails?.rateForLandOther || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, rateForLandOther: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Total Composite Rate (per Sqft)</Label>
                                                                <Input
                                                                    placeholder="e.g., ₹ 30,010.00/- per Sqft."
                                                                    value={formData.pdfDetails?.totalCompositeRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, totalCompositeRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Details of Valuation */}
                                                    <div className="mb-6 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                                        <h4 className="font-bold text-gray-900 mb-3">Details of Valuation</h4>
                                                        <div className="w-full overflow-x-auto">
                                                            <table className="min-w-full text-sm border-collapse">
                                                                <thead>
                                                                    <tr className="bg-rose-100 border border-rose-200">
                                                                        <th className="px-2 py-2 text-left font-bold text-gray-900 border border-rose-200 min-w-[50px]">Sr. No.</th>
                                                                        <th className="px-2 py-2 text-left font-bold text-gray-900 border border-rose-200 min-w-[200px]">Description</th>
                                                                        <th className="px-2 py-2 text-left font-bold text-gray-900 border border-rose-200 min-w-[120px]">Qty.(Sqft)</th>
                                                                        <th className="px-2 py-2 text-left font-bold text-gray-900 border border-rose-200 min-w-[140px]">Rate per unit (Rs.)</th>
                                                                        <th className="px-2 py-2 text-left font-bold text-gray-900 border border-rose-200 min-w-[150px]">Estimated Value (Rs.)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">1</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Present value of the Unit (Carpet Area)</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="480.00 Sqft" value={formData.pdfDetails?.presentValueQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, presentValueQty: e.target.value, presentValue: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.presentValueRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.presentValueRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, presentValueRate: e.target.value, presentValue: ((parseFloat(prev.pdfDetails?.presentValueQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Estimated Value" value={formData.pdfDetails?.presentValue || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">2</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Wardrobes</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.wardrobesQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, wardrobesQty: e.target.value, wardrobes: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.wardrobesRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.wardrobesRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, wardrobesRate: e.target.value, wardrobes: ((parseFloat(prev.pdfDetails?.wardrobesQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.wardrobes || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">3</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Showcases</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.showcasesQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, showcasesQty: e.target.value, showcases: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.showcasesRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.showcasesRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, showcasesRate: e.target.value, showcases: ((parseFloat(prev.pdfDetails?.showcasesQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.showcases || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">4</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Kitchen Arrangements</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.kitchenArrangementsQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, kitchenArrangementsQty: e.target.value, kitchenArrangements: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.kitchenArrangementsRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.kitchenArrangementsRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, kitchenArrangementsRate: e.target.value, kitchenArrangements: ((parseFloat(prev.pdfDetails?.kitchenArrangementsQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.kitchenArrangements || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">5</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Superfine Finish</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.superfineFinishQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, superfineFinishQty: e.target.value, superfineFinish: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.superfineFinishRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.superfineFinishRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, superfineFinishRate: e.target.value, superfineFinish: ((parseFloat(prev.pdfDetails?.superfineFinishQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.superfineFinish || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">6</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Interior Decorations</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.interiorDecorationsQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, interiorDecorationsQty: e.target.value, interiorDecorations: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.interiorDecorationsRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.interiorDecorationsRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, interiorDecorationsRate: e.target.value, interiorDecorations: ((parseFloat(prev.pdfDetails?.interiorDecorationsQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.interiorDecorations || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">7</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Electricity deposits / electrical fittings, etc.</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.electricityDepositsQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, electricityDepositsQty: e.target.value, electricityDeposits: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.electricityDepositsRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.electricityDepositsRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, electricityDepositsRate: e.target.value, electricityDeposits: ((parseFloat(prev.pdfDetails?.electricityDepositsQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.electricityDeposits || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">8</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Extra collapsible gates / grill works, etc.</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.collapsibleGatesQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, collapsibleGatesQty: e.target.value, collapsibleGates: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.collapsibleGatesRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.collapsibleGatesRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, collapsibleGatesRate: e.target.value, collapsibleGates: ((parseFloat(prev.pdfDetails?.collapsibleGatesQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.collapsibleGates || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">9</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Potential value, if any</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.potentialValueQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, potentialValueQty: e.target.value, potentialValue: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.potentialValueRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.potentialValueRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, potentialValueRate: e.target.value, potentialValue: ((parseFloat(prev.pdfDetails?.potentialValueQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.potentialValue || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="border border-rose-200">
                                                                        <td className="px-2 py-2 border border-rose-200 text-center font-bold">10</td>
                                                                        <td className="px-2 py-2 border border-rose-200">Others</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Qty" value={formData.pdfDetails?.otherItemsQty || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, otherItemsQty: e.target.value, otherItems: ((parseFloat(e.target.value) || 0) * (parseFloat(prev.pdfDetails?.otherItemsRate) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Rate" value={formData.pdfDetails?.otherItemsRate || ""} onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, otherItemsRate: e.target.value, otherItems: ((parseFloat(prev.pdfDetails?.otherItemsQty) || 0) * (parseFloat(e.target.value) || 0)).toString() } }))} className="h-7 text-xs" disabled={!canEdit} /></td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Value" value={formData.pdfDetails?.otherItems || ""} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="bg-rose-100 border border-rose-200 font-bold">
                                                                        <td colSpan="4" className="px-2 py-2 border border-rose-200 text-right">Total</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="text" placeholder="" value={(() => {
                                                                            const total = [
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
                                                                            ].reduce((sum, val) => sum + val, 0);
                                                                            return total.toString();
                                                                        })()} disabled className="h-7 text-xs bg-gray-100" /></td>
                                                                    </tr>
                                                                    <tr className="bg-amber-100 border border-rose-200 font-bold">
                                                                        <td colSpan="4" className="px-2 py-2 border border-rose-200 text-right">Say (Rounded)</td>
                                                                        <td className="px-2 py-2 border border-rose-200"><Input type="number" placeholder="Auto-rounded" value={(() => {
                                                                            const total = [
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
                                                                            ].reduce((sum, val) => sum + val, 0);
                                                                            const rounded = Math.round(total / 1000) * 1000;
                                                                            return rounded.toString();
                                                                        })()} className="h-7 text-xs bg-amber-50" disabled /></td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* Auto-Calculated Valuation Results */}
                                                    <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Auto-Calculated Valuation Results</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Total Valuation (Say/Market Value)</Label>
                                                                <Input
                                                                    placeholder="Based on Say (Rounded) value"
                                                                    value={calculateSayValue().toLocaleString('en-IN')}
                                                                    disabled
                                                                    className="h-10 text-sm rounded-lg border border-teal-300 bg-teal-100 font-bold"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Realisable Value (90% of Say)</Label>
                                                                <Input
                                                                    placeholder="90% of Say value"
                                                                    value={Math.round((calculateSayValue() * 90) / 100).toLocaleString('en-IN')}
                                                                    disabled
                                                                    className="h-10 text-sm rounded-lg border border-teal-300 bg-teal-100 font-bold"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Distress Value (80% of Say)</Label>
                                                                <Input
                                                                    placeholder="80% of Say value"
                                                                    value={Math.round((calculateSayValue() * 80) / 100).toLocaleString('en-IN')}
                                                                    disabled
                                                                    className="h-10 text-sm rounded-lg border border-teal-300 bg-teal-100 font-bold"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Insurable Value (35% of Say)</Label>
                                                                <Input
                                                                    placeholder="35% of Say value"
                                                                    value={Math.round((calculateSayValue() * 35) / 100).toLocaleString('en-IN')}
                                                                    disabled
                                                                    className="h-10 text-sm rounded-lg border border-teal-300 bg-teal-100 font-bold"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Ready Reckoner Value</Label>
                                                                <Input
                                                                    placeholder="Auto-calculated: Extent × Guideline Rate"
                                                                    value={(() => {
                                                                        const extent = parseFloat(formData.pdfDetails?.extentOfUnit || formData.pdfDetails?.dimensionsDeed || 1);
                                                                        const guidelineRate = parseFloat(formData.pdfDetails?.guidelineRate || 0);
                                                                        const reckoner = Math.round(extent * guidelineRate);
                                                                        return reckoner.toLocaleString('en-IN');
                                                                    })()}
                                                                    disabled
                                                                    className="h-10 text-sm rounded-lg border border-teal-300 bg-teal-100 font-bold"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Valuation Results */}
                                                    <div className="mb-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Valuation Results</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Fair Market Value</Label>
                                                                <Input
                                                                    placeholder="Fair market value"
                                                                    value={formData.pdfDetails?.fairMarketValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, fairMarketValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Realizable Value</Label>
                                                                <Input
                                                                    placeholder="Realizable value"
                                                                    value={formData.pdfDetails?.realizableValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, realizableValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Distress Value</Label>
                                                                <Input
                                                                    placeholder="Distress value"
                                                                    value={formData.pdfDetails?.distressValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, distressValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Sale Deed Value</Label>
                                                                <Input
                                                                    placeholder="Sale deed value"
                                                                    value={formData.pdfDetails?.saleDeedValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, saleDeedValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Insurable Value</Label>
                                                                <Input
                                                                    placeholder="Insurable value"
                                                                    value={formData.pdfDetails?.insurableValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, insurableValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Total Jantri Value</Label>
                                                                <Input
                                                                    placeholder="Total jantri value"
                                                                    value={formData.pdfDetails?.totalJantriValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, totalJantriValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                        </div>
                                                    </div>

                                                    {/* Additional Flat Details */}
                                                    <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Additional Flat Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Area Usage</Label>
                                                                <Input
                                                                    placeholder="Area usage"
                                                                    value={formData.pdfDetails?.areaUsage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, areaUsage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Carpet Area (Flat)</Label>
                                                                <Input
                                                                    placeholder="Carpet area flat"
                                                                    value={formData.pdfDetails?.carpetAreaFlat || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, carpetAreaFlat: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Signature & Report Details */}
                                                    <div className="mb-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Signature & Report Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Place</Label>
                                                                <Input
                                                                    placeholder="Place"
                                                                    value={formData.pdfDetails?.place || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, place: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Signature Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.signatureDate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, signatureDate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Signer Name</Label>
                                                                <Input
                                                                    placeholder="Signer name"
                                                                    value={formData.pdfDetails?.signerName || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, signerName: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Report Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.reportDate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, reportDate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border border-neutral-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </>
                                    )}

                                    {/* Submit Buttons */}
                                    <div className="flex gap-2.5 pt-3 border-t border-neutral-200">
                                        <Button
                                            type="button"
                                            onClick={handleDownloadPDF}
                                            disabled={loading}
                                            className="h-9 px-4 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                                        >
                                            <FaDownload size={14} />
                                            Download PDF
                                        </Button>
                                        {canEdit && (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={onFinish}
                                                    disabled={loading}
                                                    className="flex-1 h-9 text-xs font-bold rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                                                >
                                                    {loading ? "Saving..." : "Save Changes"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => navigate("/dashboard")}
                                                    disabled={loading}
                                                    className="flex-1 h-9 text-xs font-bold rounded-lg border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-900 transition-all"
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
                                                    className="flex-1 h-9 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                                                >
                                                    {loading ? "Processing..." : "Approve"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleManagerAction("reject")}
                                                    disabled={loading}
                                                    className="flex-1 h-9 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60"
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

export default EditValuationPage;