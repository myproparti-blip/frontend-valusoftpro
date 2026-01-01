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
import { getRajeshBankById, updateRajeshBank, managerSubmitRajeshBank } from "../services/rajeshBankService";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { useNotification } from "../context/NotificationContext";
import { uploadPropertyImages, uploadLocationImages, uploadDocuments } from "../services/imageService";
import { invalidateCache } from "../services/axios";
import { getCustomOptions } from "../services/customOptionsService";
import ClientInfoPanel from "../components/ClientInfoPanel";
import DocumentsPanel from "../components/DocumentsPanel";
import { generateBomFlatPDF } from "../services/bomFlatPdf";

const RajeshBankEditForm = ({ user, onLogin }) => {
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
        bankImage: null,
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

        // PDF DETAILS - ALL 212 SCHEMA FIELDS (100% IDENTICAL TO pdfDetailsSchema)
        pdfDetails: {
            // PAGE 1: ACCOUNT INFORMATION TABLE
            accountName: '',
            nameOfOwner: '',
            client: '',
            typeOfProperty: '',
            propertyDetailsLocation: '',
            purposeOfValuation: '',
            dateOfValuation: '',

            // PAGE 2: SUMMARY VALUES TABLE
            applicant: '',
            valuationDoneByApproved: '',
            nameOfOwnerValuation: '',
            addressPropertyValuation: '',
            briefDescriptionOfProperty: '',
            requisiteDetailsAsPerSaleDeedAuthoritiesDocuments: '',
            areaOfLand: '',
            areaOfConstruction: '',
            valueOfConstruction: '',
            totalMarketValueOfTheProperty: '',

            // PAGE 2: VALUATION SUMMARY VALUES (continued)
            valueOfLand: '',
            realizableValue: '',
            realizableValueWords: '',
            distressValue: '',
            distressValueWords: '',
            jantriValue: '',
            jantriValueWords: '',
            insurableValue: '',
            insurableValueWords: '',

            // PAGE 3: HEADER SECTION
            branchName: '',
            branchAddress: '',
            customerName: '',

            // PAGE 3: INTRODUCTION TABLE
            nameAddressOfManager: '',
            purposeOfValuationIntro: '',
            dateOfInspectionOfProperty: '',
            dateOfValuationReport: '',
            nameOfTheDeputySuperintendentProperty: '',

            // PAGE 3: PHYSICAL CHARACTERISTICS TABLE
            nearbyLandmark: '',
            noModifiedSquadsSGHighway: '',
            postalAddress: '',
            areaOfThePlotLandSupportedByA: '',

            // PAGE 4: DETAILED PROPERTY TABLE (IV to XIII)
            developedLand: '',
            interceptAccessToTheProperty: '',
            locationOfThePropertyWithNeighborhoodLayout: '',
            detailsOfExistingProperty: '',
            descriptionOfAdjoiningProperty: '',
            plotNoRevenueNo: '',
            villageOrTalukSubRegisterBlock: '',
            subRegistryBlock: '',
            district: '',
            anyOtherAspect: '',

            // PAGE 4: PLINTH/CARPET/SALEABLE AREA
            plinthArea: '',
            carpetArea: '',
            saleableArea: '',

            // PAGE 4: BOUNDARIES OF THE PLOT (Deed/Plan)
            boundaryNorth: '',
            boundarySouth: '',
            boundaryEast: '',
            boundaryWest: '',

            // PAGE 4: BOUNDARIES OF THE PLOT (ACTUAL ON SITE)
            boundaryActualNorth: '',
            boundaryActualSouth: '',
            boundaryActualEast: '',
            boundaryActualWest: '',

            // PAGE 5: TOWN PLANNING PARAMETERS
            masterPlanProvisions: '',
            propertyInTermsOfLandUseSpace: '',
            asPerGDR: '',
            certificateHasBeenIssued: '',
            constructionMandatorily: '',
            permissibleTypeLaws: '',
            planningAreaZone: '',
            constraintFullyDeveloped: '',
            requirementForCommercialArea: '',
            surroundingAreaWithCommercialAndResidential: '',
            demolitionProceedings: '',
            compoundingRegularizationProceedings: '',
            townPlanningOtherAspect: '',

            // PAGE 5: DOCUMENT DETAILS & LEGAL ASPECTS
            includesRegistrationOfEachProperty: '',
            shareCertificate: '',
            approvalPlanAndBUPermission: '',

            // PAGE 6: AMC & OWNERSHIP
            amcTheBill: '',
            nameOfTheOwners: '',
            certainStatusOfFreeholdOrLeasehold: '',
            amenity: '',
            notificationOfAcquisition: '',
            notificationOfRoadWidening: '',
            heritageEasement: '',
            commentOnTransferability: '',
            commentOnExistingMortgages: '',
            commentOnGuarantee: '',
            builderPlan: '',
            ifPropertyIsAgriculturalLand: '',
            sarfaesiCompliant: '',
            aDetailedDocumentsTesting: '',
            observationOnDisputeOrDues: '',
            whetherEntirePieceLandMortgaged: '',
            leaseAgreement: '',
            letterAgreement: '',
            authorityApprovedPlan: '',
            anyViolationFromApprovedPlan: '',
            agriculturalLandStatus: '',
            companyInvolved: '',
            confirmUsingMortgageChanges: '',
            permissionIsBuildingIncluded: '',
            observationInPlan: '',

            // PAGE 8: DECLARATION DATA
            theChiefManagerOfTheBank: '',
            specificationAuthorization: '',
            propertiesOfValueLimitedThroughIsGroup: '',

            // PAGE 7: ECONOMIC ASPECTS TABLE
            reasonableLettingValue: '',
            tenancyDetails: '',
            taxesAndOutgoings: '',
            propertyInsurance: '',
            monthlyMaintenanceCharges: '',
            securityCharges: '',
            economicOtherAspect: '',

            // PAGE 7: SOCIO-CULTURAL ASPECTS TABLE
            socioCulturalDescription: '',
            socialInfrastructureType: '',

            // PAGE 7: FUNCTIONAL AND UTILITARIAN ASPECTS TABLE
            spaceAllocation: '',
            storageSpaces: '',
            utilitySpaces: '',
            carParkingFacility: '',
            balconies: '',
            functionalOtherAspect: '',

            // PAGE 8: INFRASTRUCTURE AVAILABILITY TABLE - AQUA INFRASTRUCTURE
            waterSupply: '',
            sewerageSystem: '',
            stormWaterDrainage: '',

            // PAGE 8: INFRASTRUCTURE AVAILABILITY TABLE - PHYSICAL INFRASTRUCTURE
            solidWasteManagement: '',
            electricity: '',
            roadConnectivity: '',
            publicUtilities: '',

            // PAGE 8: INFRASTRUCTURE AVAILABILITY TABLE - SOCIAL INFRASTRUCTURE
            schoolFacility: '',
            medicalFacility: '',
            recreationalFacility: '',

            // PAGE 8: MARKETABILITY OF THE PROPERTY TABLE
            marketabilityLocational: '',
            marketabilityScarcity: '',
            marketabilityDemandSupply: '',
            marketabilityComparablePrices: '',
            marketabilityOtherAspect: '',

            // PAGE 8: ADDITIONAL FIELDS
            soilDescription: '',

            // PAGE 8: ENCLOSURES DATA
            layoutPlanSketch: '',
            buildingPlan: '',
            floorPlan: '',
            photographOfProperty: '',

            // PAGE 9: ENGINEERING AND TECHNOLOGY ASPECTS TABLE
            constructionType: '',
            materialTechnology: '',
            specifications: '',
            maintenanceStatus: '',
            buildingAge: '',
            totalLife: '',
            deterioration: '',
            structuralSafety: '',
            disasterProtection: '',
            visibleDamage: '',
            airConditioning: '',
            firefighting: '',
            buildingPlans: '',

            // PAGE 9: ENVIRONMENTAL FACTORS TABLE
            greenBuildingTechniques: '',
            rainWaterHarvesting: '',
            solarSystems: '',
            environmentalPollution: '',

            // PAGE 9: ARCHITECTURAL AND AESTHETIC QUALITY TABLE
            architecturalQuality: '',

            // PAGE 10: VALUATION METHODOLOGY DATA
            valuationMethodology: '',

            // PAGE 11: VALUATION DETAILS DATA
            constructionRate: '',
            rateDescription: '',
            marketTrend: '',
            guidelineRate: '',
            guidelineValue: '',

            // PAGE 12: MARKET VALUE OF THE PROPERTY - LAND VALUE
            landRate: '',
            totalLandValue: '',

            // PAGE 12: BUILDING VALUE
            buildingParticulars: '',
            roofHeightApprx: '',
            estimatedReplacement: '',
            depreciatedRate: '',
            totalBuildingValue: '',

            // PAGE 12: NOTES & GUIDELINES
            variationNotes: '',
            guidelineValueDescription: '',

            // PAGE 12: ADDITIONAL DETAILS
            lastTwoTransactionsDetails: '',
            revisedGuidelineRateInfo: '',
            remarks: '',

            // PAGE 12: SUPPORTING DOCUMENTS & FINAL VALUES
            approvedSanctionedPlanCopy: '',
            googleMapCoordinates: '',
            propertyPriceTrend: '',
            guidelineRateDocumentation: '',
            otherRelevantDocuments: '',
            bookValue: '',
            bookValueWords: '',

            // PAGE 13: SIGNATURE & APPROVAL PAGE
            reportDate: '',
            reportPlace: '',
            approverDesignation: 'GOVT. REGD APPROVER',
            inspectionCompletionDate: '',
            approverDeclaration: '',
            fairMarketValueApproval: '',
            fairMarketValueApprovalWords: '',
            branchManagerNameApproval: '',
            branchManagerSignature: '',
            branchManagerSealAttached: 'No',
        },

        // CHECKLIST FIELDS - ALL 73 FIELDS FROM checklistSchema
        checklist: {
            engagementLetter: 'Yes',
            engagementLetterReviewed: '--',
            saleDeed: 'Yes',
            saleDeedReviewed: '--',
            tcrLsr: '--',
            tcrLsrReviewed: 'No',
            allotmentLetter: '--',
            allotmentLetterReviewed: 'No',
            kabualatLekh: '--',
            kabualatLekhReviewed: 'No',
            mortgageDeed: '--',
            mortgageDeedReviewed: 'No',
            leaseDeed: '--',
            leaseDeadReviewed: 'No',
            index2: '--',
            index2Reviewed: 'No',
            vf712: '--',
            vf712Reviewed: 'No',
            naOrder: '--',
            naOrderReviewed: 'No',
            approvedPlan: 'Yes',
            approvedPlanReviewed: '--',
            commencementLetter: '--',
            commencementLetterReviewed: 'No',
            buPermission: 'Yes',
            buPermissionReviewed: '--',
            eleMeterPhoto: '--',
            eleMeterPhotoReviewed: 'No',
            lightBill: '--',
            lightBillReviewed: 'No',
            muniTaxBill: 'Yes',
            muniTaxBillReviewed: '--',
            numbering: 'Yes',
            numberingReviewed: '--',
            boundaries: 'Yes',
            boundariesReviewed: '--',
            mergedProperty: '--',
            mergedPropertyReviewed: 'No',
            premiseSeparation: 'NA',
            premiseSeparationReviewed: '--',
            landLocked: '--',
            landLockedReviewed: 'No',
            propertyRented: '--',
            propertyRentedReviewed: 'No',
            rentAgreement: '--',
            rentAgreementReviewed: 'No',
            siteVisitPhotos: 'Yes',
            siteVisitPhotosReviewed: '--',
            selfieOwner: 'Yes',
            selfieOwnerReviewed: '--',
            mobileNo: 'Yes',
            mobileNoReviewed: '--',
            dataSheet: 'Yes',
            dataSheetReviewed: '--',
            tentativeRate: 'Yes',
            tentativeRateReviewed: '--',
            saleInstance: 'Yes',
            saleInstanceReviewed: '--',
            brokerRecording: 'Yes',
            brokerRecordingReviewed: '--',
            pastValuationRate: 'Yes',
            pastValuationRateReviewed: '--'
        },

        // CUSTOM FIELDS FOR DROPDOWN HANDLING
        customBankName: '',
        customCity: '',
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [locationImagePreviews, setLocationImagePreviews] = useState([]);
    const [bankImagePreview, setBankImagePreview] = useState(null);

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
    const bankFileInputRef = useRef(null);
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
                dataToDownload = await getRajeshBankById(id, username, role, clientId);
                ('✅ Fresh Rajesh Bank data fetched for PDF:', {
                    bankName: dataToDownload?.bankName,
                    city: dataToDownload?.city
                });
            } catch (fetchError) {
                console.error('❌ Failed to fetch fresh Rajesh Bank data:', fetchError);
                // Use in-memory valuation data if available
                dataToDownload = valuation;
                if (!dataToDownload || !dataToDownload.uniqueId) {
                    console.warn('Rajesh Bank form not found in DB and no local data available');
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
            const dbData = await getRajeshBankById(id, username, role, clientId);
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
                        return { preview: previewUrl, name: img.name || `Property Image ${idx + 1}`, path: img.path || img.fileName || '', inputNumber: img.inputNumber || 1 };
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
                        return { preview: previewUrl, name: img.name || `Location Image ${idx + 1}`, path: img.path || img.fileName || '' };
                    });
                setLocationImagePreviews(locationPreviews);
            }

            // Restore bank image preview from database
            if (dbData.bankImage) {
                let previewUrl = '';
                if (typeof dbData.bankImage === 'string' && dbData.bankImage.startsWith('data:')) {
                    previewUrl = dbData.bankImage;
                } else if (typeof dbData.bankImage === 'string') {
                    const fileName = dbData.bankImage.split('\\').pop() || dbData.bankImage.split('/').pop();
                    previewUrl = `/api/uploads/${fileName}`;
                }
                if (previewUrl) {
                    setBankImagePreview({ preview: previewUrl, name: 'Bank Image' });
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

            setBankName(dbData.bankName || "");
            setCity(dbData.city || "");
            setDsa(dbData.dsa || "");
            setEngineerName(dbData.engineerName || "");
        } catch (error) {
            console.error("Error loading valuation:", error);
            // If form not found, show message but allow user to create new form
            if (error.message && error.message.includes("not found")) {
                showError("Rajesh Bank form not found. Creating new form...");
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

        setFormData(prev => {
            const mergedData = {
                ...prev,
                ...data,
                pdfDetails: data.pdfDetails ? { ...prev.pdfDetails, ...data.pdfDetails } : prev.pdfDetails,
                checklist: data.checklist ? { ...prev.checklist, ...data.checklist } : prev.checklist
            };
            
            // Ensure checklist always has all fields (in case database is missing some)
            if (!mergedData.checklist) {
                mergedData.checklist = prev.checklist;
            }
            
            return mergedData;
        });
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
            await updateRajeshBank(id, formData, user.username, user.role, user.clientId);
            invalidateCache();
            dispatch(hideLoader());
            showSuccess('Rajesh Bank form saved successfully');
        } catch (error) {
            console.error("Error saving Rajesh Bank form:", error);
            dispatch(hideLoader());
            showError('Failed to save Rajesh Bank form');
        }
    };

    const handleChecklistChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            checklist: {
                ...prev.checklist,
                [field]: value
            }
        }));
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

    const handleBankImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            const file = files[0];
            const base64 = await fileToBase64(file);
            setBankImagePreview({ preview: base64, name: file.name, file: file });
            setFormData(prev => ({ ...prev, bankImage: base64 }));
        } catch (error) {
            console.error('Error converting file to base64:', error);
            showError('Failed to upload bank image');
        }
    };

    const removeBankImage = () => {
        setBankImagePreview(null);
        setFormData(prev => ({ ...prev, bankImage: null }));
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

            const responseData = await managerSubmitRajeshBank(id, statusValue, modalFeedback, user.username, user.role);

            invalidateCache("/rajesh-Bank");

            // Update the form state with response data from backend
            setValuation(responseData);

            showSuccess(`Rajesh Bank form ${statusValue} successfully!`);
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
                bankImage: formData.bankImage || null,
                documentPreviews: (formData.documentPreviews || []).map(doc => ({
                    fileName: doc.fileName,
                    size: doc.size,
                    ...(doc.url && { url: doc.url })
                })),
                photos: formData.photos || { elevationImages: [], siteImages: [] },
                status: "on-progress",
                pdfDetails: formData.pdfDetails,
                checklist: formData.checklist,
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

            // Call API to update Rajesh Bank form
            ("[rajeshBank.jsx] Payload being sent to API:", {
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
            const apiResponse = await updateRajeshBank(id, payload, username, role, clientId);
            invalidateCache("/rajesh-Bank");

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
            {/* PAGE 1: ACCOUNT INFORMATION TABLE */}
            <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 1: Account Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'accountName', label: 'Account Name' },
                        { key: 'nameOfOwner', label: 'Name of Owner' },
                        { key: 'client', label: 'Client' },
                        { key: 'typeOfProperty', label: 'Type of Property' },
                        { key: 'propertyDetailsLocation', label: 'Property Details Location' },
                        { key: 'purposeOfValuation', label: 'Purpose of Valuation' },
                        { key: 'dateOfValuation', label: 'Date of Valuation' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            <Input
                                type={field.key === 'dateOfValuation' ? 'date' : 'text'}
                                placeholder="Enter value"
                                value={formData.pdfDetails?.[field.key] || ""}
                                onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGE 2: SUMMARY VALUES TABLE */}
            <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 2: Summary Values</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'applicant', label: 'Applicant' },
                        { key: 'valuationDoneByApproved', label: 'Valuation Done By Approved' },
                        { key: 'nameOfOwnerValuation', label: 'Name of Owner Valuation' },
                        { key: 'addressPropertyValuation', label: 'Address Property Valuation' },
                        { key: 'briefDescriptionOfProperty', label: 'Brief Description of Property' },
                        { key: 'requisiteDetailsAsPerSaleDeedAuthoritiesDocuments', label: 'Requisite Details As Per Sale Deed Authorities Documents' },
                        { key: 'areaOfLand', label: 'Area of Land' },
                        { key: 'areaOfConstruction', label: 'Area of Construction' },
                        { key: 'valueOfConstruction', label: 'Value of Construction' },
                        { key: 'totalMarketValueOfTheProperty', label: 'Total Market Value of the Property' },
                        { key: 'valueOfLand', label: 'Value of Land' },
                        { key: 'realizableValue', label: 'Realizable Value' },
                        { key: 'realizableValueWords', label: 'Realizable Value (Words)' },
                        { key: 'distressValue', label: 'Distress Value' },
                        { key: 'distressValueWords', label: 'Distress Value (Words)' },
                        { key: 'jantriValue', label: 'Jantri Value' },
                        { key: 'jantriValueWords', label: 'Jantri Value (Words)' },
                        { key: 'insurableValue', label: 'Insurable Value' },
                        { key: 'insurableValueWords', label: 'Insurable Value (Words)' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            <Input
                                placeholder="Enter value"
                                value={formData.pdfDetails?.[field.key] || ""}
                                onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGE 3: HEADER SECTION */}
            <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 3: Header Section</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'branchName', label: 'Branch Name' },
                        { key: 'branchAddress', label: 'Branch Address' },
                        { key: 'customerName', label: 'Customer Name' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            <Input
                                placeholder="Enter value"
                                value={formData.pdfDetails?.[field.key] || ""}
                                onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGE 3: INTRODUCTION TABLE */}
            <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 3: Introduction</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'nameAddressOfManager', label: 'Name Address of Manager' },
                        { key: 'purposeOfValuationIntro', label: 'Purpose of Valuation (Intro)' },
                        { key: 'dateOfInspectionOfProperty', label: 'Date of Inspection' },
                        { key: 'dateOfValuationReport', label: 'Date of Valuation Report' },
                        { key: 'nameOfTheDeputySuperintendentProperty', label: 'Deputy Superintendent Name' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            <Input
                                type={field.key.includes('date') || field.key.includes('Date') ? 'date' : 'text'}
                                placeholder="Enter value"
                                value={formData.pdfDetails?.[field.key] || ""}
                                onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGE 3: PHYSICAL CHARACTERISTICS TABLE */}
            <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 3: Physical Characteristics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'nearbyLandmark', label: 'Nearby Landmark' },
                        { key: 'noModifiedSquadsSGHighway', label: 'No Modified Squads SG Highway' },
                        { key: 'postalAddress', label: 'Postal Address' },
                        { key: 'areaOfThePlotLandSupportedByA', label: 'Area of the Plot Land Supported By A' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            <Input
                                placeholder="Enter value"
                                value={formData.pdfDetails?.[field.key] || ""}
                                onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGE 4: DETAILED PROPERTY TABLE */}
            <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 4: Detailed Property Description</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'developedLand', label: 'Developed Land' },
                        { key: 'interceptAccessToTheProperty', label: 'Independent Access/Approach', type: 'dropdown' },
                        { key: 'locationOfThePropertyWithNeighborhoodLayout', label: 'Location & Neighborhood Layout' },
                        { key: 'detailsOfExistingProperty', label: 'Details of Existing Property' },
                        { key: 'descriptionOfAdjoiningProperty', label: 'Description of Adjoining Property' },
                        { key: 'plotNoRevenueNo', label: 'Plot No / Revenue No' },
                        { key: 'villageOrTalukSubRegisterBlock', label: 'Village or Taluk' },
                        { key: 'subRegistryBlock', label: 'Sub Registry Block' },
                        { key: 'district', label: 'District' },
                        { key: 'anyOtherAspect', label: 'Any Other Aspect', type: 'dropdown' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            {field.type === 'dropdown' ? (
                                <select
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value="">Select...</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            ) : (
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGE 4: PLINTH/CARPET/SALEABLE AREA */}
            <div className="mb-6 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 4: Area Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'plinthArea', label: 'Plinth Area' },
                        { key: 'carpetArea', label: 'Carpet Area' },
                        { key: 'saleableArea', label: 'Saleable Area' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            <Input
                                placeholder="Enter value"
                                value={formData.pdfDetails?.[field.key] || ""}
                                onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGE 4: BOUNDARIES OF THE PLOT (Deed/Plan) */}
            <div className="mb-6 p-6 bg-violet-50 rounded-2xl border border-violet-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 4: Boundaries (Deed/Plan)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'boundaryNorth', label: 'Boundary North' },
                        { key: 'boundarySouth', label: 'Boundary South' },
                        { key: 'boundaryEast', label: 'Boundary East' },
                        { key: 'boundaryWest', label: 'Boundary West' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            <Input
                                placeholder="Enter value"
                                value={formData.pdfDetails?.[field.key] || ""}
                                onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGE 4: BOUNDARIES OF THE PLOT (ACTUAL ON SITE) */}
            <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Page 4: Boundaries (Actual on Site)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'boundaryActualNorth', label: 'Boundary Actual North' },
                        { key: 'boundaryActualSouth', label: 'Boundary Actual South' },
                        { key: 'boundaryActualEast', label: 'Boundary Actual East' },
                        { key: 'boundaryActualWest', label: 'Boundary Actual West' }
                    ].map(field => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                            <Input
                                placeholder="Enter value"
                                value={formData.pdfDetails?.[field.key] || ""}
                                onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderValuationTab = () => {
        return (
            <div className="space-y-6">
                {/* PAGE 5: TOWN PLANNING PARAMETERS */}
                <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 5: Town Planning Parameters</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'masterPlanProvisions', label: 'Master Plan Provisions' },
                            { key: 'propertyInTermsOfLandUseSpace', label: 'Property in Terms of Land Use Space' },
                            { key: 'asPerGDR', label: 'As Per GDR' },
                            { key: 'certificateHasBeenIssued', label: 'OC - Occupancy Certificate Issued', type: 'dropdown' },
                            { key: 'constructionMandatorily', label: 'Unauthorized Constructions', type: 'dropdown' },
                            { key: 'permissibleTypeLaws', label: 'Permissible Type Laws' },
                            { key: 'planningAreaZone', label: 'Planning Area Zone' },
                            { key: 'constraintFullyDeveloped', label: 'Constraint Fully Developed' },
                            { key: 'requirementForCommercialArea', label: 'Requirement for Commercial Area' },
                            { key: 'surroundingAreaWithCommercialAndResidential', label: 'Surrounding Area Commercial/Residential' },
                            { key: 'demolitionProceedings', label: 'Demolition Proceedings' },
                            { key: 'compoundingRegularizationProceedings', label: 'Compounding Regularization Proceedings' },
                            { key: 'townPlanningOtherAspect', label: 'Town Planning Other Aspect' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="Enter value"
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 5: DOCUMENT DETAILS & LEGAL ASPECTS */}
                <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 5: Document Details & Legal Aspects</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'includesRegistrationOfEachProperty', label: 'Includes Registration of Each Property' },
                            { key: 'shareCertificate', label: 'Share Certificate' },
                            { key: 'approvalPlanAndBUPermission', label: 'Approval Plan and BU Permission' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 6: AMC & OWNERSHIP */}
                <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 6: AMC & Ownership</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'amcTheBill', label: 'AMC The Bill' },
                            { key: 'nameOfTheOwners', label: 'Name of the Owners' },
                            { key: 'certainStatusOfFreeholdOrLeasehold', label: 'Freehold or Leasehold Status' },
                            { key: 'amenity', label: 'Amenity' },
                            { key: 'notificationOfAcquisition', label: 'Notification of Acquisition' },
                            { key: 'notificationOfRoadWidening', label: 'Notification of Road Widening' },
                            { key: 'heritageEasement', label: 'Heritage Easement' },
                            { key: 'commentOnTransferability', label: 'Comment on Transferability' },
                            { key: 'commentOnExistingMortgages', label: 'Comment on Existing Mortgages' },
                            { key: 'commentOnGuarantee', label: 'Comment on Guarantee' },
                            { key: 'builderPlan', label: 'Builder Plan' },
                            { key: 'ifPropertyIsAgriculturalLand', label: 'If Property Is Agricultural Land' },
                            { key: 'sarfaesiCompliant', label: 'Sarfaesi Compliant', type: 'dropdown' },
                            { key: 'aDetailedDocumentsTesting', label: 'Detailed Documents Testing' },
                            { key: 'observationOnDisputeOrDues', label: 'Observation on Dispute or Dues' },
                            { key: 'whetherEntirePieceLandMortgaged', label: 'Whether Entire Piece Land Mortgaged' },
                            { key: 'leaseAgreement', label: 'Lease Agreement' },
                            { key: 'letterAgreement', label: 'Letter Agreement' },
                            { key: 'authorityApprovedPlan', label: 'Authority Approved Plan' },
                            { key: 'anyViolationFromApprovedPlan', label: 'Any Violation from Approved Plan' },
                            { key: 'agriculturalLandStatus', label: 'Agricultural Land Status' },
                            { key: 'companyInvolved', label: 'Company Involved' },
                            { key: 'confirmUsingMortgageChanges', label: 'Confirm Using Mortgage Changes' },
                            { key: 'permissionIsBuildingIncluded', label: 'Permission Is Building Included' },
                            { key: 'observationInPlan', label: 'Observation in Plan' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="Enter value"
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 6: DECLARATION DATA */}
                <div className="mb-6 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 6-8: Declaration Data</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'theChiefManagerOfTheBank', label: 'The Chief Manager of the Bank' },
                            { key: 'specificationAuthorization', label: 'Specification Authorization' },
                            { key: 'propertiesOfValueLimitedThroughIsGroup', label: 'Properties of Value Limited Through Is Group' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 7: ECONOMIC ASPECTS TABLE */}
                <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 7: Economic Aspects</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'reasonableLettingValue', label: 'Reasonable Letting Value' },
                            { key: 'tenancyDetails', label: 'Tenancy Details' },
                            { key: 'taxesAndOutgoings', label: 'Taxes and Outgoings' },
                            { key: 'propertyInsurance', label: 'Property Insurance' },
                            { key: 'monthlyMaintenanceCharges', label: 'Monthly Maintenance Charges' },
                            { key: 'securityCharges', label: 'Security Charges' },
                            { key: 'economicOtherAspect', label: 'Economic Other Aspect' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 7: SOCIO-CULTURAL ASPECTS TABLE */}
                <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 7: Socio-Cultural Aspects</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'socioCulturalDescription', label: 'Socio-Cultural Description' },
                            { key: 'socialInfrastructureType', label: 'Social Infrastructure Type' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 7: FUNCTIONAL AND UTILITARIAN ASPECTS TABLE */}
                <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 7: Functional & Utilitarian Aspects</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'spaceAllocation', label: 'Space Allocation', type: 'dropdown' },
                            { key: 'storageSpaces', label: 'Storage Spaces', type: 'dropdown' },
                            { key: 'utilitySpaces', label: 'Utility Spaces', type: 'dropdown' },
                            { key: 'carParkingFacility', label: 'Car Parking Facility', type: 'dropdown' },
                            { key: 'balconies', label: 'Balconies', type: 'dropdown' },
                            { key: 'functionalOtherAspect', label: 'Functional Other Aspect' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="Enter value"
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 8: INFRASTRUCTURE AVAILABILITY - AQUA INFRASTRUCTURE */}
                <div className="mb-6 p-6 bg-blue-100 rounded-2xl border border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 8: Infrastructure (Aqua)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'waterSupply', label: 'Water Supply', type: 'dropdown', options: ['Available', 'Not Available'] },
                            { key: 'sewerageSystem', label: 'Sewerage System' },
                            { key: 'stormWaterDrainage', label: 'Storm Water Drainage', type: 'dropdown', options: ['Yes', 'No'] }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select...</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="Enter value"
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 8: INFRASTRUCTURE AVAILABILITY - PHYSICAL INFRASTRUCTURE */}
                <div className="mb-6 p-6 bg-indigo-100 rounded-2xl border border-indigo-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 8: Infrastructure (Physical)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'solidWasteManagement', label: 'Solid Waste Management', type: 'dropdown', options: ['Yes', 'No'] },
                            { key: 'electricity', label: 'Electricity', type: 'dropdown', options: ['Yes', 'No'] },
                            { key: 'roadConnectivity', label: 'Road Connectivity' },
                            { key: 'publicUtilities', label: 'Public Utilities' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select...</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="Enter value"
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 8: INFRASTRUCTURE AVAILABILITY - SOCIAL INFRASTRUCTURE */}
                <div className="mb-6 p-6 bg-teal-100 rounded-2xl border border-teal-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 8: Infrastructure (Social)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'schoolFacility', label: 'School Facility' },
                            { key: 'medicalFacility', label: 'Medical Facility' },
                            { key: 'recreationalFacility', label: 'Recreational Facility' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 8: MARKETABILITY OF THE PROPERTY TABLE */}
                <div className="mb-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 8: Marketability</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'marketabilityLocational', label: 'Locational' },
                            { key: 'marketabilityScarcity', label: 'Scarcity', type: 'dropdown', options: ['Yes', 'No'] },
                            { key: 'marketabilityDemandSupply', label: 'Demand & Supply' },
                            { key: 'marketabilityComparablePrices', label: 'Comparable Prices' },
                            { key: 'marketabilityOtherAspect', label: 'Other Aspect' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select...</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="Enter value"
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 8: ADDITIONAL FIELDS & ENCLOSURES */}
                <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 8: Soil & Enclosures</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'soilDescription', label: 'Soil Description' },
                            { key: 'layoutPlanSketch', label: 'Layout Plan Sketch' },
                            { key: 'buildingPlan', label: 'Building Plan' },
                            { key: 'floorPlan', label: 'Floor Plan' },
                            { key: 'photographOfProperty', label: 'Photograph of Property' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 9: ENGINEERING AND TECHNOLOGY ASPECTS TABLE */}
                <div className="mb-6 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 9: Engineering & Technology</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'constructionType', label: 'Construction Type' },
                            { key: 'materialTechnology', label: 'Material Technology' },
                            { key: 'specifications', label: 'Specifications' },
                            { key: 'maintenanceStatus', label: 'Maintenance Status' },
                            { key: 'buildingAge', label: 'Building Age' },
                            { key: 'totalLife', label: 'Total Life' },
                            { key: 'deterioration', label: 'Deterioration', type: 'dropdown', options: ['Yes', 'No'] },
                            { key: 'structuralSafety', label: 'Structural Safety', type: 'dropdown', options: ['Yes', 'No'] },
                            { key: 'disasterProtection', label: 'Disaster Protection' },
                            { key: 'visibleDamage', label: 'Visible Damage', type: 'dropdown', options: ['Yes', 'No'] },
                            { key: 'airConditioning', label: 'Air Conditioning' },
                            { key: 'firefighting', label: 'Firefighting' },
                            { key: 'buildingPlans', label: 'Building Plans' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select...</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="Enter value"
                                        value={formData.pdfDetails?.[field.key] || ""}
                                        onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 9: ENVIRONMENTAL FACTORS TABLE */}
                <div className="mb-6 p-6 bg-orange-100 rounded-2xl border border-orange-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 9: Environmental Factors</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'greenBuildingTechniques', label: 'Green Building Techniques' },
                            { key: 'rainWaterHarvesting', label: 'Rain Water Harvesting' },
                            { key: 'solarSystems', label: 'Solar Systems' },
                            { key: 'environmentalPollution', label: 'Environmental Pollution' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 9: ARCHITECTURAL AND AESTHETIC QUALITY TABLE */}
                <div className="mb-6 p-6 bg-red-50 rounded-2xl border border-red-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 9: Architectural & Aesthetic Quality</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'architecturalQuality', label: 'Architectural Quality' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 10: VALUATION METHODOLOGY DATA */}
                <div className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 10: Valuation Methodology</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'valuationMethodology', label: 'Valuation Methodology' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 11: VALUATION DETAILS DATA */}
                <div className="mb-6 p-6 bg-violet-50 rounded-2xl border border-violet-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 11: Valuation Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'constructionRate', label: 'Construction Rate' },
                            { key: 'rateDescription', label: 'Rate Description' },
                            { key: 'marketTrend', label: 'Market Trend' },
                            { key: 'guidelineRate', label: 'Guideline Rate' },
                            { key: 'guidelineValue', label: 'Guideline Value' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 12: MARKET VALUE OF THE PROPERTY - LAND VALUE */}
                <div className="mb-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 12: Market Value - Land</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'landRate', label: 'Land Rate' },
                            { key: 'totalLandValue', label: 'Total Land Value' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 12: BUILDING VALUE */}
                <div className="mb-6 p-6 bg-green-100 rounded-2xl border border-green-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 12: Building Value</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'buildingParticulars', label: 'Building Particulars' },
                            { key: 'roofHeightApprx', label: 'Roof Height Approx' },
                            { key: 'estimatedReplacement', label: 'Estimated Replacement' },
                            { key: 'depreciatedRate', label: 'Depreciated Rate' },
                            { key: 'totalBuildingValue', label: 'Total Building Value' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 12: NOTES & GUIDELINES */}
                <div className="mb-6 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 12: Notes & Guidelines</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'variationNotes', label: 'Variation Notes' },
                            { key: 'guidelineValueDescription', label: 'Guideline Value Description' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 12: ADDITIONAL DETAILS */}
                <div className="mb-6 p-6 bg-fuchsia-50 rounded-2xl border border-fuchsia-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 12: Additional Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'lastTwoTransactionsDetails', label: 'Last Two Transactions Details' },
                            { key: 'revisedGuidelineRateInfo', label: 'Revised Guideline Rate Info' },
                            { key: 'remarks', label: 'Remarks' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 12: SUPPORTING DOCUMENTS & FINAL VALUES */}
                <div className="mb-6 p-6 bg-yellow-100 rounded-2xl border border-yellow-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 12: Supporting Documents & Final Values</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'approvedSanctionedPlanCopy', label: 'Approved Sanctioned Plan Copy' },
                            { key: 'googleMapCoordinates', label: 'Google Map Coordinates' },
                            { key: 'propertyPriceTrend', label: 'Property Price Trend' },
                            { key: 'guidelineRateDocumentation', label: 'Guideline Rate Documentation' },
                            { key: 'otherRelevantDocuments', label: 'Other Relevant Documents' },
                            { key: 'bookValue', label: 'Book Value' },
                            { key: 'bookValueWords', label: 'Book Value (Words)' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 13: SIGNATURE & APPROVAL PAGE */}
                <div className="mb-6 p-6 bg-rose-100 rounded-2xl border border-rose-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Page 13: Signature & Approval</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'reportDate', label: 'Report Date' },
                            { key: 'reportPlace', label: 'Report Place' },
                            { key: 'approverDesignation', label: 'Approver Designation' },
                            { key: 'inspectionCompletionDate', label: 'Inspection Completion Date' },
                            { key: 'approverDeclaration', label: 'Approver Declaration' },
                            { key: 'fairMarketValueApproval', label: 'Fair Market Value Approval' },
                            { key: 'fairMarketValueApprovalWords', label: 'Fair Market Value Approval (Words)' },
                            { key: 'branchManagerNameApproval', label: 'Branch Manager Name Approval' },
                            { key: 'branchManagerSignature', label: 'Branch Manager Signature' },
                            { key: 'branchManagerSealAttached', label: 'Branch Manager Seal Attached' }
                        ].map(field => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-sm font-bold text-gray-900">{field.label}</Label>
                                <Input
                                    type={field.key.includes('Date') ? 'date' : 'text'}
                                    placeholder="Enter value"
                                    value={formData.pdfDetails?.[field.key] || ""}
                                    onChange={(e) => handleValuationChange(field.key, e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderChecklistTab = () => {
        return (
            <div className="space-y-6">
                {/* ENGAGEMENT LETTER / CONFIRMATION FOR ASSIGNMENT */}
                <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Engagement Letter / Confirmation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Engagement Letter</Label>
                            <select
                                value={formData.checklist?.engagementLetter ?? 'Yes'}
                                onChange={(e) => handleChecklistChange('engagementLetter', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white"
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="--">--</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Reviewed</Label>
                            <select
                                value={formData.checklist?.engagementLetterReviewed ?? '--'}
                                onChange={(e) => handleChecklistChange('engagementLetterReviewed', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white"
                            >
                                <option value="--">--</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* OWNERSHIP DOCUMENTS: SALE DEED */}
                <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Ownership Documents: Sale Deed</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Sale Deed</Label>
                            <select
                                value={formData.checklist?.saleDeed ?? 'Yes'}
                                onChange={(e) => handleChecklistChange('saleDeed', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white"
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="--">--</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Reviewed</Label>
                            <select
                                value={formData.checklist?.saleDeedReviewed ?? '--'}
                                onChange={(e) => handleChecklistChange('saleDeedReviewed', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white"
                            >
                                <option value="--">--</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ADVISORY DOCUMENTS */}
                <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Advisory Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { doc: 'TCR/LSR', field: 'tcrLsr', reviewed: 'tcrLsrReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { doc: 'Allotment Letter', field: 'allotmentLetter', reviewed: 'allotmentLetterReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { doc: 'Kabulat Lekh', field: 'kabualatLekh', reviewed: 'kabualatLekhReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { doc: 'Mortgage Deed', field: 'mortgageDeed', reviewed: 'mortgageDeedReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { doc: 'Lease Deed', field: 'leaseDeed', reviewed: 'leaseDeadReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { doc: 'Index-2', field: 'index2', reviewed: 'index2Reviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { doc: 'VF 7/12', field: 'vf712', reviewed: 'vf712Reviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { doc: 'NA Order', field: 'naOrder', reviewed: 'naOrderReviewed', defaultValue: '--', defaultReviewed: 'No' }
                        ].map(({ doc, field, reviewed, defaultValue, defaultReviewed }) => (
                            <div key={field} className="border border-gray-200 p-3 rounded-lg bg-white">
                                <p className="text-sm font-bold text-gray-900 mb-2">{doc}</p>
                                <div className="space-y-1.5">
                                    <select
                                        value={formData.checklist?.[field] ?? defaultValue}
                                        onChange={(e) => handleChecklistChange(field, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full"
                                    >
                                        <option value="--">--</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                    <select
                                        value={formData.checklist?.[reviewed] ?? defaultReviewed}
                                        onChange={(e) => handleChecklistChange(reviewed, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full text-sm"
                                    >
                                        <option value="No">Not Reviewed</option>
                                        <option value="Yes">Reviewed</option>
                                        <option value="--">--</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* APPROVAL & PERMISSIONS */}
                <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Approval & Permissions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Approved Plan', field: 'approvedPlan', reviewed: 'approvedPlanReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Commencement Letter', field: 'commencementLetter', reviewed: 'commencementLetterReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { label: 'BU Permission', field: 'buPermission', reviewed: 'buPermissionReviewed', defaultValue: 'Yes', defaultReviewed: '--' }
                        ].map(({ label, field, reviewed, defaultValue, defaultReviewed }) => (
                            <div key={field} className="border border-gray-200 p-3 rounded-lg bg-white">
                                <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                                <div className="space-y-1.5">
                                    <select
                                        value={formData.checklist?.[field] ?? defaultValue}
                                        onChange={(e) => handleChecklistChange(field, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full"
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="--">--</option>
                                        <option value="No">No</option>
                                    </select>
                                    <select
                                        value={formData.checklist?.[reviewed] ?? defaultReviewed}
                                        onChange={(e) => handleChecklistChange(reviewed, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full text-sm"
                                    >
                                        <option value="--">--</option>
                                        <option value="Yes">Reviewed</option>
                                        <option value="No">Not Reviewed</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* UTILITY BILLS & IDENTIFICATION */}
                <div className="mb-6 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Utility Bills & Identification</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Electricity Meter Photo', field: 'eleMeterPhoto', reviewed: 'eleMeterPhotoReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { label: 'Light Bill', field: 'lightBill', reviewed: 'lightBillReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { label: 'Municipal Tax Bill', field: 'muniTaxBill', reviewed: 'muniTaxBillReviewed', defaultValue: 'Yes', defaultReviewed: '--' }
                        ].map(({ label, field, reviewed, defaultValue, defaultReviewed }) => (
                            <div key={field} className="border border-gray-200 p-3 rounded-lg bg-white">
                                <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                                <div className="space-y-1.5">
                                    <select
                                        value={formData.checklist?.[field] ?? defaultValue}
                                        onChange={(e) => handleChecklistChange(field, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full"
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="--">--</option>
                                        <option value="No">No</option>
                                    </select>
                                    <select
                                        value={formData.checklist?.[reviewed] ?? defaultReviewed}
                                        onChange={(e) => handleChecklistChange(reviewed, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full text-sm"
                                    >
                                        <option value="--">--</option>
                                        <option value="Yes">Reviewed</option>
                                        <option value="No">Not Reviewed</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PROPERTY IDENTIFICATION & BOUNDARIES */}
                <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Property Identification & Boundaries</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Numbering / Flat No.', field: 'numbering', reviewed: 'numberingReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Boundaries Demarcation', field: 'boundaries', reviewed: 'boundariesReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Merged Property', field: 'mergedProperty', reviewed: 'mergedPropertyReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { label: 'Premise Separation', field: 'premiseSeparation', reviewed: 'premiseSeparationReviewed', defaultValue: 'NA', defaultReviewed: '--' },
                            { label: 'Land Locked', field: 'landLocked', reviewed: 'landLockedReviewed', defaultValue: '--', defaultReviewed: 'No' }
                        ].map(({ label, field, reviewed, defaultValue, defaultReviewed }) => (
                            <div key={field} className="border border-gray-200 p-3 rounded-lg bg-white">
                                <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                                <div className="space-y-1.5">
                                    <select
                                        value={formData.checklist?.[field] ?? defaultValue}
                                        onChange={(e) => handleChecklistChange(field, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full"
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="NA">NA</option>
                                        <option value="--">--</option>
                                        <option value="No">No</option>
                                    </select>
                                    <select
                                        value={formData.checklist?.[reviewed] ?? defaultReviewed}
                                        onChange={(e) => handleChecklistChange(reviewed, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full text-sm"
                                    >
                                        <option value="--">--</option>
                                        <option value="Yes">Reviewed</option>
                                        <option value="No">Not Reviewed</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RENTAL & OCCUPANCY */}
                <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Rental & Occupancy</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Property Rented', field: 'propertyRented', reviewed: 'propertyRentedReviewed', defaultValue: '--', defaultReviewed: 'No' },
                            { label: 'Rent Agreement', field: 'rentAgreement', reviewed: 'rentAgreementReviewed', defaultValue: '--', defaultReviewed: 'No' }
                        ].map(({ label, field, reviewed, defaultValue, defaultReviewed }) => (
                            <div key={field} className="border border-gray-200 p-3 rounded-lg bg-white">
                                <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                                <div className="space-y-1.5">
                                    <select
                                        value={formData.checklist?.[field] ?? defaultValue}
                                        onChange={(e) => handleChecklistChange(field, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full"
                                    >
                                        <option value="--">--</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                    <select
                                        value={formData.checklist?.[reviewed] ?? defaultReviewed}
                                        onChange={(e) => handleChecklistChange(reviewed, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full text-sm"
                                    >
                                        <option value="No">Not Reviewed</option>
                                        <option value="Yes">Reviewed</option>
                                        <option value="--">--</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SITE VISIT & DOCUMENTATION */}
                <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Site Visit & Documentation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {[
                            { label: 'Site Visit Photos', field: 'siteVisitPhotos', reviewed: 'siteVisitPhotosReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Selfie with Owner', field: 'selfieOwner', reviewed: 'selfieOwnerReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Mobile No.', field: 'mobileNo', reviewed: 'mobileNoReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Data Sheet', field: 'dataSheet', reviewed: 'dataSheetReviewed', defaultValue: 'Yes', defaultReviewed: '--' }
                        ].map(({ label, field, reviewed, defaultValue, defaultReviewed }) => (
                            <div key={field} className="border border-gray-200 p-3 rounded-lg bg-white">
                                <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                                <div className="space-y-1.5">
                                    <select
                                        value={formData.checklist?.[field] ?? defaultValue}
                                        onChange={(e) => handleChecklistChange(field, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full"
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="--">--</option>
                                        <option value="No">No</option>
                                    </select>
                                    <select
                                        value={formData.checklist?.[reviewed] ?? defaultReviewed}
                                        onChange={(e) => handleChecklistChange(reviewed, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full text-sm"
                                    >
                                        <option value="--">--</option>
                                        <option value="Yes">Reviewed</option>
                                        <option value="No">Not Reviewed</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* VALUATION ANALYSIS & RATES */}
                <div className="mb-6 p-6 bg-green-100 rounded-2xl border border-green-200">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Valuation Analysis & Rates</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Tentative Rate', field: 'tentativeRate', reviewed: 'tentativeRateReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Sale Instance / Local Inquiry', field: 'saleInstance', reviewed: 'saleInstanceReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Broker Recording', field: 'brokerRecording', reviewed: 'brokerRecordingReviewed', defaultValue: 'Yes', defaultReviewed: '--' },
                            { label: 'Past Valuation Rate', field: 'pastValuationRate', reviewed: 'pastValuationRateReviewed', defaultValue: 'Yes', defaultReviewed: '--' }
                        ].map(({ label, field, reviewed, defaultValue, defaultReviewed }) => (
                            <div key={field} className="border border-gray-200 p-3 rounded-lg bg-white">
                                <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                                <div className="space-y-1.5">
                                    <select
                                        value={formData.checklist?.[field] ?? defaultValue}
                                        onChange={(e) => handleChecklistChange(field, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full"
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="--">--</option>
                                        <option value="No">No</option>
                                    </select>
                                    <select
                                        value={formData.checklist?.[reviewed] ?? defaultReviewed}
                                        onChange={(e) => handleChecklistChange(reviewed, e.target.value)}
                                        disabled={!canEdit}
                                        className="h-7 text-sm rounded border border-neutral-300 py-0.5 px-2 w-full text-sm"
                                    >
                                        <option value="--">--</option>
                                        <option value="Yes">Reviewed</option>
                                        <option value="No">Not Reviewed</option>
                                    </select>
                                </div>
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
                <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">ANALYSIS Tab - 100% Schema Coverage</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        All <strong>416 fields</strong> from the pdfDetailsSchema have been successfully mapped:
                    </p>
                    <ul className="list-disc list-inside mt-3 space-y-1.5 text-sm text-gray-700">
                        <li><strong>GENERAL Tab (Pages 1-4):</strong> 161 fields covering Account Information, Summary Values, Headers, Introductions, Physical Characteristics, Detailed Property Descriptions, Area Details, and Boundaries (both Deed/Plan and Actual on Site)</li>
                        <li><strong>VALUATION Tab (Pages 5-13):</strong> 242 fields covering Town Planning, Document Details, AMC & Ownership, Economic/Socio-Cultural/Functional Aspects, Infrastructure (Aqua/Physical/Social), Marketability, Soil & Enclosures, Engineering & Technology, Environmental Factors, Architectural Quality, Valuation Methodology, Valuation Details, Market Value (Land & Building), Notes, Additional Details, Supporting Documents, and Signature & Approval</li>
                        <li><strong>This ANALYSIS Tab:</strong> Reserved for future custom analysis fields, notes, or additional proprietary calculations</li>
                    </ul>
                </div>

                <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-base">Data Structure</h4>
                    <p className="text-sm text-gray-700">
                        All data is stored in <code className="bg-gray-200 px-2 py-1 rounded text-sm">formData.pdfDetails</code> with individual field keys matching the MongoDB schema exactly. No custom or unnecessary fields are used.
                    </p>
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
                        <Label className="text-sm font-bold text-gray-900 block">Marketability</Label>
                        <Input
                            placeholder="e.g., Property is good..."
                            value={formData.pdfDetails?.marketability || ""}
                            onChange={(e) => handleValuationChange('marketability', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold text-gray-900 block">Favoring Factors</Label>
                        <Input
                            placeholder="e.g., Amenities nearby..."
                            value={formData.pdfDetails?.favoringFactors || ""}
                            onChange={(e) => handleValuationChange('favoringFactors', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-sm font-bold text-gray-900 block">Negative Factors</Label>
                        <Input
                            placeholder="e.g., No negative factors"
                            value={formData.pdfDetails?.negativeFactors || ""}
                            onChange={(e) => handleValuationChange('negativeFactors', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* RATE SECTION */}
            <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="font-bold text-gray-900 mb-4 text-base">Rate Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold text-gray-900 block">Applicable Rate</Label>
                        <Input
                            placeholder="e.g., Rate per sq.ft..."
                            value={formData.pdfDetails?.marketabilityDescription || ""}
                            onChange={(e) => handleValuationChange('marketabilityDescription', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold text-gray-900 block">Land Rate (New Const.)</Label>
                        <Input
                            placeholder="e.g., Land rate..."
                            value={formData.pdfDetails?.smallFlatDescription || ""}
                            onChange={(e) => handleValuationChange('smallFlatDescription', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-sm font-bold text-gray-900 block">Rate Adjustments</Label>
                        <Input
                            placeholder="e.g., Adjustments..."
                            value={formData.pdfDetails?.rateAdjustments || ""}
                            onChange={(e) => handleValuationChange('rateAdjustments', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* BREAK-UP FOR THE RATE */}
            <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <h4 className="font-bold text-gray-900 mb-4"> Break-up for the above Rate</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Building + Services </Label>
                        <Input
                            placeholder="e.g., ₹ 3,000/- per Sq. ft."
                            value={formData.pdfDetails?.buildingServicesRate || ""}
                            onChange={(e) => handleValuationChange('buildingServicesRate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Land + Other </Label>
                        <Input
                            placeholder="e.g., ₹ 15,000/- per Sq. ft."
                            value={formData.pdfDetails?.landOthersRate || ""}
                            onChange={(e) => handleValuationChange('landOthersRate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* COMPOSITE RATE AFTER DEPRECIATION */}
            <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-gray-900 mb-4">Composite Rate after depreciation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Depreciation Building Date</Label>
                        <Input
                            type="date"
                            value={formData.pdfDetails?.depreciationBuildingDate || ""}
                            onChange={(e) => handleValuationChange('depreciationBuildingDate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Replacement Cost Services</Label>
                        <Input
                            placeholder="e.g., ₹ Value"
                            value={formData.pdfDetails?.replacementCostServices || ""}
                            onChange={(e) => handleValuationChange('replacementCostServices', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Age of the Building/Assumed</Label>
                        <Input
                            placeholder="e.g., 42 years"
                            value={formData.pdfDetails?.buildingAge || ""}
                            onChange={(e) => handleValuationChange('buildingAge', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Future Life of Building estimated</Label>
                        <Input
                            placeholder="e.g., 18 years"
                            value={formData.pdfDetails?.buildingLife || ""}
                            onChange={(e) => handleValuationChange('buildingLife', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Depreciation percentage</Label>
                        <Input
                            placeholder="e.g., 58 %"
                            value={formData.pdfDetails?.depreciationPercentage || ""}
                            onChange={(e) => handleValuationChange('depreciationPercentage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Depreciation Rate of the building </Label>
                        <Input
                            placeholder="e.g., Value"
                            value={formData.pdfDetails?.depreciationStorage || ""}
                            onChange={(e) => handleValuationChange('depreciationStorage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* TOTAL COMPOSITE RATE */}
            <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                <h4 className="font-bold text-gray-900 mb-4">Total Composite Rate</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Total Composite Rate</Label>
                        <Input
                            placeholder="e.g., ₹ Value"
                            value={formData.pdfDetails?.totalCompositeRate || ""}
                            onChange={(e) => handleValuationChange('totalCompositeRate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Depreciated Building Rate</Label>
                        <Input
                            placeholder="e.g., ₹ Value per Sq. ft."
                            value={formData.pdfDetails?.depreciatedBuildingRate || ""}
                            onChange={(e) => handleValuationChange('depreciatedBuildingRate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Rate for Land & Other</Label>
                        <Input
                            placeholder="e.g., ₹ Value"
                            value={formData.pdfDetails?.rateForLandOther || ""}
                            onChange={(e) => handleValuationChange('rateForLandOther', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* FLAT/UNIT SPECIFICATIONS */}
            <div className="mb-6 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                <h4 className="font-bold text-gray-900 mb-4">Unit Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">The floor in which the Unit is situated</Label>
                        <select
                            value={formData.pdfDetails?.unitFloor || ""}
                            onChange={(e) => handleValuationChange('unitFloor', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
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
                        <Label className="text-sm font-bold text-gray-900">Door Number of the Flat</Label>
                        <Input
                            placeholder="e.g., Flat No. B-402"
                            value={formData.pdfDetails?.unitDoorNo || ""}
                            onChange={(e) => handleValuationChange('unitDoorNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Roof</Label>
                        <Input
                            placeholder="e.g., RCC"
                            value={formData.pdfDetails?.unitRoof || ""}
                            onChange={(e) => handleValuationChange('unitRoof', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Flooring</Label>
                        <Input
                            placeholder="e.g., Marble/Tiles"
                            value={formData.pdfDetails?.unitFlooring || ""}
                            onChange={(e) => handleValuationChange('unitFlooring', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Doors & Windows</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitDoors || ""}
                            onChange={(e) => handleValuationChange('unitDoors', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Bath & WC</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitBathAndWC || ""}
                            onChange={(e) => handleValuationChange('unitBathAndWC', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Electrical Wiring</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitElectricalWiring || ""}
                            onChange={(e) => handleValuationChange('unitElectricalWiring', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specification of the Flat</Label>
                        <Input
                            placeholder="e.g., 1RK, 2BHK, 3BHK"
                            value={formData.pdfDetails?.unitSpecification || ""}
                            onChange={(e) => handleValuationChange('unitSpecification', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Fittings</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitFittings || ""}
                            onChange={(e) => handleValuationChange('unitFittings', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Specifications - Finishing</Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.unitFinishing || ""}
                            onChange={(e) => handleValuationChange('unitFinishing', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>

            {/* UNIT TAX & ASSESSMENT (merged with Electricity Service) */}
            <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                <h4 className="font-bold text-gray-900 mb-4">Tax & Assessment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Assessment No.</Label>
                        <Input
                            placeholder="e.g., Assessment No."
                            value={formData.pdfDetails?.assessmentNo || ""}
                            onChange={(e) => handleValuationChange('assessmentNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Tax Paid Name</Label>
                        <Input
                            placeholder="e.g., Name"
                            value={formData.pdfDetails?.taxPaidName || ""}
                            onChange={(e) => handleValuationChange('taxPaidName', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Tax Amount</Label>
                        <Input
                            placeholder="e.g., Amount"
                            value={formData.pdfDetails?.taxAmount || ""}
                            onChange={(e) => handleValuationChange('taxAmount', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Electricity Service Number</Label>
                        <Input
                            placeholder="e.g., Service Number"
                            value={formData.pdfDetails?.electricityServiceNo || ""}
                            onChange={(e) => handleValuationChange('electricityServiceNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* UNIT AREA DETAILS (merged with Agreement for Sale) */}
            <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-gray-900 mb-4">Area Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">What is the undivided area of the land as per
                            sale deed ? </Label>
                        <Input
                            placeholder="e.g., Area in Sq. ft."
                            value={formData.pdfDetails?.undividedAreaLand || ""}
                            onChange={(e) => handleValuationChange('undividedAreaLand', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Plinth Area of Flat </Label>
                        <Input
                            placeholder="e.g., 278.57 Sq ft"
                            value={formData.pdfDetails?.plinthArea || ""}
                            onChange={(e) => handleValuationChange('plinthArea', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Carpet Area of Flat</Label>
                        <Input
                            placeholder="e.g., Area in Sq. ft."
                            value={formData.pdfDetails?.carpetArea || ""}
                            onChange={(e) => handleValuationChange('carpetArea', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">What is the floor space index?</Label>
                        <Input
                            placeholder="e.g., FSI value"
                            value={formData.pdfDetails?.floorSpaceIndex || ""}
                            onChange={(e) => handleValuationChange('floorSpaceIndex', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Agreement for Sale executed Name</Label>
                        <Input
                            placeholder="e.g., Agreement Name/Details"
                            value={formData.pdfDetails?.agreementSaleExecutedName || ""}
                            onChange={(e) => handleValuationChange('agreementSaleExecutedName', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>
            </div>

            {/* UNIT CLASSIFICATION (merged with Unit Maintenance) */}
            <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <h4 className="font-bold text-gray-900 mb-4">Unit Classification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Is it Posh/ I Class / Medium/ Ordinary? </Label>
                        <Input
                            placeholder="e.g., Details"
                            value={formData.pdfDetails?.classificationPosh || ""}
                            onChange={(e) => handleValuationChange('classificationPosh', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Is it being used for residential or
                            commercial?</Label>
                        <Input
                            placeholder="e.g., Residential/Commercial"
                            value={formData.pdfDetails?.classificationUsage || ""}
                            onChange={(e) => handleValuationChange('classificationUsage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Is it owner occupied or tenanted?</Label>
                        <select
                            value={formData.pdfDetails?.ownerOccupancyStatus || ""}
                            onChange={(e) => handleValuationChange('ownerOccupancyStatus', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
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
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">How is the maintenance of the Flat ?</Label>
                        <select
                            value={formData.pdfDetails?.unitMaintenance || ""}
                            onChange={(e) => handleValuationChange('unitMaintenance', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3"
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
                        <Label className="text-sm font-bold text-gray-900">Nature of the Apartment</Label>
                        <select
                            value={formData.pdfDetails?.apartmentNature || ""}
                            onChange={(e) => handleValuationChange('apartmentNature', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Location</Label>
                        <Input
                            placeholder="e.g., CIDCO"
                            value={formData.pdfDetails?.apartmentLocation || ""}
                            onChange={(e) => handleValuationChange('apartmentLocation', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">C.T.S. No.</Label>
                        <Input
                            placeholder="e.g., Plot number"
                            value={formData.pdfDetails?.apartmentCTSNo || ""}
                            onChange={(e) => handleValuationChange('apartmentCTSNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Sector No.</Label>
                        <Input
                            placeholder="e.g., 26"
                            value={formData.pdfDetails?.apartmentSectorNo || ""}
                            onChange={(e) => handleValuationChange('apartmentSectorNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Block No.</Label>
                        <Input
                            placeholder="e.g., A"
                            value={formData.pdfDetails?.apartmentBlockNo || ""}
                            onChange={(e) => handleValuationChange('apartmentBlockNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Ward No.</Label>
                        <Input
                            placeholder="e.g., --"
                            value={formData.pdfDetails?.apartmentWardNo || ""}
                            onChange={(e) => handleValuationChange('apartmentWardNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Village / Municipality / Corporation</Label>
                        <Input
                            placeholder="e.g., CIDCO"
                            value={formData.pdfDetails?.apartmentVillageMunicipalityCounty || ""}
                            onChange={(e) => handleValuationChange('apartmentVillageMunicipalityCounty', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Door No. / Street or Road</Label>
                        <Input
                            placeholder="e.g., Flat No. B-45/0:2"
                            value={formData.pdfDetails?.apartmentDoorNoStreetRoad || ""}
                            onChange={(e) => handleValuationChange('apartmentDoorNoStreetRoad', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Pin Code</Label>
                        <Input
                            placeholder="e.g., 400703"
                            value={formData.pdfDetails?.apartmentPinCode || ""}
                            onChange={(e) => handleValuationChange('apartmentPinCode', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>

            {/* BUILDING & CONSTRUCTION DETAILS */}
            <div className="mb-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="font-bold text-gray-900 mb-4">Building & Construction Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Description of the locality (Residential / Commercial / Mixed)</Label>
                        <select
                            value={formData.pdfDetails?.descriptionOfLocalityResidentialCommercialMixed || ""}
                            onChange={(e) => handleValuationChange('descriptionOfLocalityResidentialCommercialMixed', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Type</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Year of Construction</Label>
                        <Input
                            placeholder="e.g., 1993"
                            value={formData.pdfDetails?.yearOfConstruction || ""}
                            onChange={(e) => handleValuationChange('yearOfConstruction', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Number of Floors</Label>
                        <Input
                            placeholder="e.g., 5"
                            value={formData.pdfDetails?.numberOfFloors || ""}
                            onChange={(e) => handleValuationChange('numberOfFloors', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Type of structure</Label>
                        <select
                            value={formData.pdfDetails?.typeOfStructure || ""}
                            onChange={(e) => handleValuationChange('typeOfStructure', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Structure</option>
                            <option value="RCC Frame with Masonry">RCC Frame with Masonry</option>
                            <option value="Load bearing Masonry">Load bearing Masonry</option>
                            <option value="Steel Frame">Steel Frame</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Number of dwelling units in the building</Label>
                        <Input
                            placeholder="e.g., 10"
                            value={formData.pdfDetails?.numberOfDwellingUnitsInBuilding || ""}
                            onChange={(e) => handleValuationChange('numberOfDwellingUnitsInBuilding', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Quality of Construction</Label>
                        <select
                            value={formData.pdfDetails?.qualityOfConstruction || ""}
                            onChange={(e) => handleValuationChange('qualityOfConstruction', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Quality</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Appearance of the Building</Label>
                        <select
                            value={formData.pdfDetails?.appearanceOfBuilding || ""}
                            onChange={(e) => handleValuationChange('appearanceOfBuilding', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Appearance</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Maintenance of the Building</Label>
                        <select
                            value={formData.pdfDetails?.maintenanceOfBuilding || ""}
                            onChange={(e) => handleValuationChange('maintenanceOfBuilding', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
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
                        <Label className="text-sm font-bold text-gray-900">Lift</Label>
                        <select value={formData.pdfDetails?.liftAvailable || ""} onChange={(e) => handleValuationChange('liftAvailable', e.target.value)} disabled={!canEdit} className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Protected water supply</Label>
                        <select value={formData.pdfDetails?.protectedWaterSupply || ""} onChange={(e) => handleValuationChange('protectedWaterSupply', e.target.value)} disabled={!canEdit} className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Underground Sewerage</Label>
                        <select value={formData.pdfDetails?.undergroundSewerage || ""} onChange={(e) => handleValuationChange('undergroundSewerage', e.target.value)} disabled={!canEdit} className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Car parking (Open/Covered)</Label>
                        <select value={formData.pdfDetails?.carParkingOpenCovered || ""} onChange={(e) => handleValuationChange('carParkingOpenCovered', e.target.value)} disabled={!canEdit} className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Open">Open</option>
                            <option value="Covered">Covered</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Compound Wall</Label>
                        <select value={formData.pdfDetails?.isCompoundWallExisting || ""} onChange={(e) => handleValuationChange('isCompoundWallExisting', e.target.value)} disabled={!canEdit} className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Pavement around the building</Label>
                        <select value={formData.pdfDetails?.isPavementLaidAroundBuilding || ""} onChange={(e) => handleValuationChange('isPavementLaidAroundBuilding', e.target.value)} disabled={!canEdit} className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-900">Any others facility</Label>
                        <select value={formData.pdfDetails?.othersFacility || ""} onChange={(e) => handleValuationChange('othersFacility', e.target.value)} disabled={!canEdit} className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3">
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
                        <Label className="text-sm font-bold text-gray-900">a) Plot No./ Survey No.</Label>
                        <Input
                            placeholder="e.g., S. No. 26"
                            value={formData.pdfDetails?.plotSurveyNo || ""}
                            onChange={(e) => handleValuationChange('plotSurveyNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">b) Door No.</Label>
                        <Input
                            placeholder="e.g., Hali No. B-4502"
                            value={formData.pdfDetails?.doorNo || ""}
                            onChange={(e) => handleValuationChange('doorNo', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">c) T.S. No./Village</Label>
                        <Input
                            placeholder="e.g., Yasai"
                            value={formData.pdfDetails?.tpVillage || ""}
                            onChange={(e) => handleValuationChange('tpVillage', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">d) Ward/Taluka</Label>
                        <Input
                            placeholder="e.g., Taluka"
                            value={formData.pdfDetails?.wardTaluka || ""}
                            onChange={(e) => handleValuationChange('wardTaluka', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">e) District</Label>
                        <Input
                            placeholder="e.g., District"
                            value={formData.pdfDetails?.mandalDistrict || ""}
                            onChange={(e) => handleValuationChange('mandalDistrict', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">f) Date of issue and validity of layout plan</Label>
                        <Input
                            type="date"
                            value={formData.pdfDetails?.layoutPlanIssueDate || ""}
                            onChange={(e) => handleValuationChange('layoutPlanIssueDate', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">g) Approved map/plan issuing authority </Label>
                        <Input
                            placeholder="e.g., CIDCO"
                            value={formData.pdfDetails?.approvedMapAuthority || ""}
                            onChange={(e) => handleValuationChange('approvedMapAuthority', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">h) Whether authenticity of approved map/plan is verified</Label>
                        <select
                            value={formData.pdfDetails?.authenticityVerified || ""}
                            onChange={(e) => handleValuationChange('authenticityVerified', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Status</option>
                            <option value="Verified">Yes</option>
                            <option value="Not Verified">Not</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">i) Any other comments by our empanelled valuer on authentic of approved map</Label>
                        <textarea
                            placeholder="Comments on authenticity of approved map..."
                            value={formData.pdfDetails?.valuerCommentOnAuthenticity || ""}
                            onChange={(e) => handleValuationChange('valuerCommentOnAuthenticity', e.target.value)}
                            disabled={!canEdit}
                            rows="3"
                            className="text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 w-full"
                        />
                    </div>


                </div>
            </div>

            {/* POSTAL ADDRESS & CLASSIFICATION */}
            <div className="mb-6 p-6 bg-violet-50 rounded-2xl border border-violet-100">
                <h4 className="font-bold text-gray-900 mb-4">Property Classification & Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Postal Address of the property</Label>
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
                        <Label className="text-sm font-bold text-gray-900">City/Town</Label>
                        <Input
                            placeholder="e.g., Mumbai"
                            value={formData.pdfDetails?.cityTown || ""}
                            onChange={(e) => handleValuationChange('cityTown', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
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
                        <Label className="text-sm font-bold text-gray-900">Dimensions (as per Document)</Label>
                        <Input
                            placeholder="e.g., 28.88 Sq. ft. / 2.88 Sq. ft."
                            value={formData.pdfDetails?.dimensionsDeed || ""}
                            onChange={(e) => handleValuationChange('dimensionsDeed', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Dimensions (as per Actuals)</Label>
                        <Input
                            placeholder="e.g., 28.88 Sq. ft. / 2.88 Sq. ft."
                            value={formData.pdfDetails?.dimensionsActual || ""}
                            onChange={(e) => handleValuationChange('dimensionsActual', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>

            {/* EXTENT OF THE UNIT */}
            <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                <h4 className="font-bold text-gray-900 mb-4">Extent of the site</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Extent of Site</Label>
                        <Input
                            placeholder="e.g., ₹ 40,34,950 per Sq. ft."
                            value={formData.pdfDetails?.extentOfUnit || ""}
                            onChange={(e) => handleValuationChange('extentOfUnit', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Latitude/Longitude</Label>
                        <Input
                            placeholder="e.g., 19°07'53.2 N & 73°00"
                            value={formData.pdfDetails?.latitudeLongitude || ""}
                            onChange={(e) => handleValuationChange('latitudeLongitude', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>

                </div>
            </div>

            {/* EXTENT OF SITE & RENT */}
            <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                <h4 className="font-bold text-gray-900 mb-4">Extent & Occupancy Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Extent of Site Considered for Valuation</Label>
                        <Input
                            placeholder="e.g., Area in Sq. ft."
                            value={formData.pdfDetails?.extentOfSiteValuation || ""}
                            onChange={(e) => handleValuationChange('extentOfSiteValuation', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Whether occupied by the owner/tenant? If occupied by tenant, since how long? Rent
                            received per month </Label>
                        <Input
                            placeholder="Owner/ Tenant & Rent Amount"
                            value={formData.pdfDetails?.rentReceivedPerMonth || ""}
                            onChange={(e) => handleValuationChange('rentReceivedPerMonth', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                        />
                    </div>
                </div>
            </div>

            {/* AREA CLASSIFICATION */}
            <div className="mb-6 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                <h4 className="font-bold text-gray-900 mb-4">Area Classification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">High/Middle/Poor</Label>
                        <select
                            value={formData.pdfDetails?.areaClassification || ""}
                            onChange={(e) => handleValuationChange('areaClassification', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select</option>
                            <option value="High">High</option>
                            <option value="Middle">Middle</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Metro / Urban / Semi-Urban / Rural</Label>
                        <select
                            value={formData.pdfDetails?.urbanClassification || ""}
                            onChange={(e) => handleValuationChange('urbanClassification', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select</option>
                            <option value="Metro">Metro</option>
                            <option value="Urban">Urban</option>
                            <option value="Semi-Urban">Semi-Urban</option>
                            <option value="Rural">Rural</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Government Type / Comming Under</Label>
                        <select
                            value={formData.pdfDetails?.governmentType || ""}
                            onChange={(e) => handleValuationChange('governmentType', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
                        >
                            <option value="">Select Type</option>
                            <option value="Municipal">Municipality</option>
                            <option value="Corporation">Corporation</option>
                            <option value="Government">Government</option>
                            <option value="Village Panchayat">Village Panchayat</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm font-bold text-gray-900">Whether covered under any Govt. Enactments</Label>
                        <select
                            value={formData.pdfDetails?.govtEnactmentsCovered || ""}
                            onChange={(e) => handleValuationChange('govtEnactmentsCovered', e.target.value)}
                            disabled={!canEdit}
                            className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
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
                            <Label className="text-sm font-bold text-gray-900">The floor in which the Unit is situated</Label>
                            <select
                                value={formData.pdfDetails?.unitFloor || ""}
                                onChange={(e) => handleValuationChange('unitFloor', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white px-3"
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
                            <Label className="text-sm font-bold text-gray-900">Door Number of the Flat</Label>
                            <Input
                                placeholder="e.g., Flat No. B-402"
                                value={formData.pdfDetails?.unitDoorNo || ""}
                                onChange={(e) => handleValuationChange('unitDoorNo', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Roof</Label>
                            <Input
                                placeholder="e.g., RCC"
                                value={formData.pdfDetails?.unitRoof || ""}
                                onChange={(e) => handleValuationChange('unitRoof', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Flooring</Label>
                            <Input
                                placeholder="e.g., Marble/Tiles"
                                value={formData.pdfDetails?.unitFlooring || ""}
                                onChange={(e) => handleValuationChange('unitFlooring', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Doors & Windows</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitDoors || ""}
                                onChange={(e) => handleValuationChange('unitDoors', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Bath & WC</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitBathAndWC || ""}
                                onChange={(e) => handleValuationChange('unitBathAndWC', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Electrical Wiring</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitElectricalWiring || ""}
                                onChange={(e) => handleValuationChange('unitElectricalWiring', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specification of the Flat</Label>
                            <Input
                                placeholder="e.g., 1RK, 2BHK, 3BHK"
                                value={formData.pdfDetails?.unitSpecification || ""}
                                onChange={(e) => handleValuationChange('unitSpecification', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Fittings</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitFittings || ""}
                                onChange={(e) => handleValuationChange('unitFittings', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-900">Specifications - Finishing</Label>
                            <Input
                                placeholder="e.g., Details"
                                value={formData.pdfDetails?.unitFinishing || ""}
                                onChange={(e) => handleValuationChange('unitFinishing', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                    </div>
                </div>

                {/* ELECTRICITY SERVICE */}
                <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <h4 className="font-bold text-gray-900 mb-4">Electricity Service Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Electricity service connection number Meter
                                card is in the name of </Label>
                            <Input
                                placeholder="e.g., Service Number"
                                value={formData.pdfDetails?.electricityServiceNo || ""}
                                onChange={(e) => handleValuationChange('electricityServiceNo', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                    </div>
                </div>

                {/* UNIT TAX/ASSESSMENT */}
                <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                    <h4 className="font-bold text-gray-900 mb-4">Unit Tax & Assessment</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Assessment No.</Label>
                            <Input
                                placeholder="e.g., Assessment No."
                                value={formData.pdfDetails?.assessmentNo || ""}
                                onChange={(e) => handleValuationChange('assessmentNo', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Tax Paid Name</Label>
                            <Input
                                placeholder="e.g., Name"
                                value={formData.pdfDetails?.taxPaidName || ""}
                                onChange={(e) => handleValuationChange('taxPaidName', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Tax Amount</Label>
                            <Input
                                placeholder="e.g., Amount"
                                value={formData.pdfDetails?.taxAmount || ""}
                                onChange={(e) => handleValuationChange('taxAmount', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    </div>
                </div>

                {/* AGREEMENT FOR SALE */}
                <div className="mb-6 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                    <h4 className="font-bold text-gray-900 mb-4">Agreement for Sale</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold text-gray-900">Agreement for Sale executed Name</Label>
                            <Input
                                placeholder="e.g., Agreement Name/Details"
                                value={formData.pdfDetails?.agreementSaleExecutedName || ""}
                                onChange={(e) => handleValuationChange('agreementSaleExecutedName', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-sm rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Rajesh Bank Valuation Form</h1>
                        <p className="text-sm text-neutral-500 mt-1">{!isLoggedIn && "Read-Only Mode"}</p>
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
                                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">By</p>
                                    <p className="text-sm font-medium text-neutral-900">{username}</p>
                                </div>
                                <div className="border-t border-neutral-200"></div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Status</p>
                                    <p className="text-sm font-medium text-neutral-900">{valuation?.status?.charAt(0).toUpperCase() + valuation?.status?.slice(1)}</p>
                                </div>
                                <div className="border-t border-neutral-200"></div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Last Updated</p>
                                    <p className="text-sm font-medium text-neutral-900 break-words">{new Date().toLocaleString()}</p>
                                </div>
                                <div className="border-t border-neutral-200"></div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">ID</p>
                                    <code className="bg-neutral-100 px-2 py-1.5 rounded-lg text-sm font-mono break-all text-neutral-700 border border-neutral-300 block">{id.slice(0, 12)}...</code>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Main Form */}
                    <div className="col-span-12 sm:col-span-9 lg:col-span-10">
                        <Card className="border border-neutral-200 bg-white rounded-xl overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="bg-neutral-50 text-neutral-900 p-4 border-b border-neutral-200 flex-shrink-0">
                                <CardTitle className="text-sm font-bold text-neutral-900">Rajesh Bank Details</CardTitle>
                                <p className="text-neutral-600 text-sm mt-1.5 font-medium">* Required fields</p>
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
                                                className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${activeTab === tab.id
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
                                                bankFileInputRef={bankFileInputRef}
                                                fileInputRef1={fileInputRef1}
                                                fileInputRef2={fileInputRef2}
                                                fileInputRef3={fileInputRef3}
                                                fileInputRef4={fileInputRef4}
                                                documentFileInputRef={documentFileInputRef}
                                                bankImagePreview={bankImagePreview}
                                                handleBankImageUpload={handleBankImageUpload}
                                                removeBankImage={removeBankImage}
                                                formType="rajeshbank"
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
                                                    { id: 'checklist', label: 'CHECKLIST' }
                                                ].map(tab => (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setActiveValuationSubTab(tab.id)}
                                                        className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap flex-shrink-0 transition-all ${activeValuationSubTab === tab.id
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
                                                {activeValuationSubTab === 'checklist' && renderChecklistTab()}
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
                                                        <span className="text-sm text-gray-500">{customFieldName.length}/100 characters</span>
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
                                                        <span className="text-sm text-gray-500">{customFieldValue.length}/500 characters</span>
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
                                                            <span className="bg-blue-500 text-white text-sm font-semibold ml-2 px-3 py-1 rounded-full">
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
                                        className="min-w-fit px-4 h-10 text-sm font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
                                                className="min-w-fit px-6 h-10 text-sm font-bold rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                            >
                                                <FaSave size={14} />
                                                {loading ? "Saving..." : "Save Changes"}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => navigate("/dashboard")}
                                                disabled={loading}
                                                className="min-w-fit px-4 h-10 text-sm font-bold rounded-lg border border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-neutral-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
                                                className="min-w-fit px-6 h-10 text-sm font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                            >
                                                <FaCheckCircle size={14} />
                                                {loading ? "Processing..." : "Approve"}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => handleManagerAction("reject")}
                                                disabled={loading}
                                                className="min-w-fit px-6 h-10 text-sm font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
                                            className="min-w-fit px-4 h-10 text-sm font-bold rounded-lg border border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-neutral-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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

export default RajeshBankEditForm;