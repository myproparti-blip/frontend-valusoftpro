import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
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
import { getUbiApfFormById, updateUbiApfForm, managerSubmitUbiApfForm, requestReworkUbiApfForm } from "../services/ubiApfService";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { useNotification } from "../context/NotificationContext";
import { uploadPropertyImages, uploadLocationImages, uploadDocuments } from "../services/imageService";
import { invalidateCache } from "../services/axios";
import { getCustomOptions } from "../services/customOptionsService";
import ClientInfoPanel from "../components/ClientInfoPanel";
import DocumentsPanel from "../components/DocumentsPanel";
import { generateUbiApfPDF } from "../services/ubiApfPdf";

const UbiApfEditForm = ({ user, onLogin }) => {
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

        // CUSTOM FIELDS (NOT IN PDF DETAILS)
        customFields: [],
        customExtentOfSiteFields: [],
        customFloorAreaBalconyFields: [],

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
        supportingDocuments: [],
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
            // PAGE 1 - COST OF CONSTRUCTION AS PER ACTUAL MEASUREMENT
            subArea: '',
            basementFloor: '',
            groundArea: '',
            socketFloor: '',
            terraceArea: '',
            firstFloorConstruction: '',
            secondFloorConstruction: '',
            thirdFloorConstruction: '',
            fourthFloorConstruction: '',
            fifthFloorConstruction: '',
            sixthFloorConstruction: '',
            glassHouseFloor: '',
            totalAreaAmount: '',
            valueCostAmount: '',
            ratePerSqftAmount: '',

            // PAGE 2 - TOTAL ABSTRACT OF THE ENTIRE PROPERTY (OWNED)
            partA: '',
            partB: '',
            partC: '',
            partD: '',
            partE: '',
            partF: '',

            // PAGE 3 - GENERAL INFORMATION
            theMarketValueOfAbovePropertyIs: '',
            theRealisableValueOfAbovePropertyIs: '',
            theInsurableValueOfAbovePropertyIs: '',
            place: '',
            date: '',
            signatureOfBranchManagerWithOfficeSeal: '',
            shashilantRDhumalSignatureOfApprover: '',
            theUndersignedHasInspectedThePropertyDetailedInTheValuationReportCrossVerifyTheFollowingDetailsAndFoundToBeAccurate: '',
            thePropertyIsReasonablyMarketValueOn: '',
            theUndersignedHasInspectedAndSatisfiedThatTheFairAndReasonableMarketValueOn: '',

            // PAGE 4 - TOTAL ABSTRACT OF ENTIRE PROPERTY
            abstractLand: '',
            abstractBuilding: '',
            abstractExtraItems: '',
            abstractAmenities: '',
            abstractMiscellaneous: '',
            abstractServices: '',
            abstractTotalValue: '',
            abstractRoundedValue: '',

            // TOTAL ABSTRACT OF ENTIRE PROPERTY (AS PER REQUIREMENT OF OWNER)
            ownerAbstractLand: '',
            ownerAbstractBuilding: '',
            ownerAbstractExtraItems: '',
            ownerAbstractAmenities: '',
            ownerAbstractMiscellaneous: '',
            ownerAbstractServices: '',
            ownerAbstractTotalValue: '',
            ownerAbstractRoundedValue: '',

            asAResultOfMyAppraisalAndAnalysisItIsMyConsideredOpinionThatThePresentFairMarketValue: '',
            valueOfTheAbovePropertyAsOnTheValuationDateIs: '',
            preValuationRatePercentageWithDeductionWithRespectToTheAgreementValuePropertyDeed: '',

            // PAGE 5 - PART A - SERVICES
            srNo: '',
            description1: '',
            amountInRupees1: '',

            // PAGE 5 - PART A - CONTINUED
            part1SrNo1: '',
            part1Description1: '',
            part1Amount1: '',
            part1SrNo2: '',
            part1Description2: '',
            part1Amount2: '',
            part1SrNo3: '',
            part1Description3: '',
            part1Amount3: '',
            part1SrNo4: '',
            part1Description4: '',
            part1Amount4: '',
            part1SrNo5: '',
            part1Description5: '',
            part1Amount5: '',

            // PAGE 6 - PART A - AMENITIES
            part2SrNo: '',
            part2Description: '',
            part2Workbeds: '',
            part2Item1Description: '',
            part2Item1Amount: '',
            part2Item2Description: '',
            part2Item2Amount: '',
            part2Item3Description: '',
            part2Item3Amount: '',
            part2Item4Description: '',
            part2Item4Amount: '',
            part2Item5Description: '',
            part2Item5Amount: '',
            part2Item6Description: '',
            part2Item6Amount: '',
            part2Item7Description: '',
            part2Item7Amount: '',
            part2Item8Description: '',
            part2Item8Amount: '',
            part2Item9Description: '',
            part2Item9Amount: '',
            part2Total: '',

            // PAGE 7 - PART C - MISCELLANEOUS
            part3SrNo: '',
            part3Description: '',
            part3Item1Description: '',
            part3Item1Amount: '',
            part3Item2Description: '',
            part3Item2Amount: '',
            part3Item3Description: '',
            part3Item3Amount: '',
            part3Item4Description: '',
            part3Item4Amount: '',
            part3Item5Description: '',
            part3Item5Amount: '',
            part3Total: '',

            // PAGE 10 - PART F - SERVICES
            partFSrNo: '',
            partFDescription: '',
            partFPortico: '',
            partFItem1Description: '',
            partFItem1Amount: '',
            partFItem2Description: '',
            partFItem2Amount: '',
            partFItem3Description: '',
            partFItem3Amount: '',
            partFItem4Description: '',
            partFItem4Amount: '',
            partFItem5Description: '',
            partFItem5Amount: '',
            partFItem6Description: '',
            partFItem6Amount: '',
            partFTotal: '',

            // PAGE 11 - PART C EXTRA ITEMS
            partCExtraSrNo: '',
            partCExtraDescription: '',
            partCExtraWorksItems: '',
            partCExtraItem1Description: '',
            partCExtraItem1Amount: '',
            partCExtraItem2Description: '',
            partCExtraItem2Amount: '',
            partCExtraItem3Description: '',
            partCExtraItem3Amount: '',
            partCExtraItem4Description: '',
            partCExtraItem4Amount: '',
            partCExtraItem5Description: '',
            partCExtraItem5Amount: '',
            partCExtraTotal: '',

            // PAGE 12 - PART E - MISCELLANEOUS
            partESrNo: '',
            partEDescription: '',
            partEItem1Description: '',
            partEItem1Amount: '',
            partEItem2Description: '',
            partEItem2Amount: '',
            partEItem3Description: '',
            partEItem3Amount: '',
            partEItem4Description: '',
            partEItem4Amount: '',
            partETotal: '',

            // PAGE 9 - DETAILS OF VALUATION OF BUILDING
            ornamentalFloor: '',
            ornamentalFloorAmount: '',
            stuccoVeranda: '',
            stuccoVerandaAmount: '',
            sheetGrills: '',
            sheetGrillsAmount: '',
            overheadWaterTank: '',
            overheadWaterTankAmount: '',
            extraShedPossibleGates: '',
            extraShedPossibleGatesAmount: '',

            formId: '',
            branch: '',
            valuationPurpose: '',
            dateOfInspection: '',
            dateOnWhichValuationIsMade: '',

            // GENERAL SECTION - DOCUMENTS
            purposeForValuation: '',
            refNo: '',
            dateOfAppointment: '',

            briefDescriptionOfProperty: '',
            sanctionedPlanStatus: '',
            buildingCompletionCertificate: '',
            ownerAddressJointOwners: '',

            ownerName: '',

            // PROPERTY DESCRIPTION / LOCATION OF PROPERTY
            surveyNo: '',
            doorNo: '',
            apartmentVillageMunicipalityCounty: '',
            taluka: '',
            mandal: '',
            district: '',
            layoutPlanIssueDate: '',
            approvedMapAuthority: '',
            authenticityVerified: '',
            valuerCommentOnAuthenticity: '',
            otherApprovedPlanDetails: '',
            valuesApprovedPlan: '',

            // Location Property Additional Fields
            plotSurveyNo: '',
            tpVillage: '',
            wardTaluka: '',
            mandalDistrict: '',

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
            northBoundary: '',
            southBoundary: '',
            eastBoundary: '',
            westBoundary: '',

            // BOUNDARIES OF PROPERTY - PLOT (As per Deed & Actual)
            boundariesPlotNorthDeed: '',
            boundariesPlotNorthActual: '',
            boundariesPlotSouthDeed: '',
            boundariesPlotSouthActual: '',
            boundariesPlotEastDeed: '',
            boundariesPlotEastActual: '',
            boundariesPlotWestDeed: '',
            boundariesPlotWestActual: '',

            // BOUNDARIES OF PROPERTY - SHOP (As per Deed & Actual)
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

            // APARTMENT BUILDING DETAILS - From Table II
            classificationOfLocality: '',
            developmentOfSurroundingAreas: '',
            possibilityOfFrequentFlooding: '',
            feasibilityToCivicAmenities: '',
            levelOfLandWithTopographicalConditions: '',
            shapeOfLand: '',
            typeOfUseToWhichItCanBePut: '',
            anyUsageRestriction: '',
            isPlotInTownPlanningApprovedLayout: '',
            cornerPlotOrIntermittentPlot: '',
            roadFacilities: '',
            typeOfRoadAvailableAtPresent: '',
            widthOfRoad: '',
            isItALandLockedLand: '',
            waterPotentiality: '',
            undergroundSewerageSystem: '',
            isPowerSupplyAvailableAtSite: '',
            advantageOfSite: '',
            specialRemarksIfAnyThreatOfAcquisition: '',

            // VALUATION OF LAND - Part A
            sizeOfLandNorthSouth: '',
            sizeOfLandEastWest: '',
            plotAreaSqm: '',
            plotAreaSqft: '',
            totalExtentOfLand: '',
            totalExtentOfLandSqm: '',
            totalExtentOfLandSqft: '',
            prevailingMarketRate: '',
            prevailingMarketRatePerAcre: '',
            guidelineRate: '',
            guidelineRatePerSqm: '',
            assessedAdoptedRate: '',
            assessedAdoptedRatePerSqft: '',
            estimatedValueOfLand: '',
            estimatedValueOfLandAmount: '',

            // VALUATION OF BUILDING - Part B
            buildingType: '',
            typeOfConstruction: '',
            yearOfConstruction: '',
            ageOfProperty: '',
            residualLifeBuilding: '',
            numberOfFloors: '',
            buildingCondition: '',
            exteriorCondition: '',
            interiorCondition: '',
            layoutApprovalDetails: '',
            approvedMapAuthorityBuilding: '',
            authenticityOfApprovedPlan: '',
            otherCommentsOnApprovedPlan: '',
            basementFloorSqm: '',
            basementFloorSqft: '',
            groundFloorSqm: '',
            groundFloorSqft: '',
            entranceCanopyAreaSqm: '',
            entranceCanopyAreaSqft: '',
            serviceFloorSqm: '',
            serviceFloorSqft: '',
            terraceAreaAboveCanopySqm: '',
            terraceAreaAboveCanopySqft: '',
            firstFloorSqm: '',
            firstFloorSqft: '',
            secondFloorSqm: '',
            secondFloorSqft: '',
            thirdFloorSqm: '',
            thirdFloorSqft: '',
            forthFloorSqm: '',
            forthFloorSqft: '',
            fifthFloorSqm: '',
            fifthFloorSqft: '',
            sixthFloorSqm: '',
            sixthFloorSqft: '',
            terraceFloorSqm: '',
            terraceFloorSqft: '',
            glassHouseFloorSqm: '',
            glassHouseFloorSqft: '',
            helipadFloorSqm: '',
            helipadFloorSqft: '',
            totalAreaSqm: '',
            totalAreaSqft: '',
            totalBuiltUpSqm: '',
            totalBuiltUpSqft: '',
            totalFloorAreaBalconySqm: '',
            totalFloorAreaBalconySqft: '',

            // FLOOR AREA INCLUDING BALCONY & TERRACE (SQM & SQFT)
            basementFloorBalconySqm: '',
            basementFloorBalconySqft: '',
            groundFloorBalconySqm: '',
            groundFloorBalconySqft: '',
            canopyAreaBalconySqm: '',
            canopyAreaBalconySqft: '',
            serviceFloorBalconySqm: '',
            serviceFloorBalconySqft: '',
            terraceAreaAboveCanopyBalconySqm: '',
            terraceAreaAboveCanopyBalconySqft: '',
            firstFloorBalconySqm: '',
            firstFloorBalconySqft: '',
            secondFloorBalconySqm: '',
            secondFloorBalconySqft: '',
            thirdFloorBalconySqm: '',
            thirdFloorBalconySqft: '',
            fourthFloorBalconySqm: '',
            fourthFloorBalconySqft: '',
            fifthFloorBalconySqm: '',
            fifthFloorBalconySqft: '',
            sixthFloorBalconySqm: '',
            sixthFloorBalconySqft: '',

            // CARPET AREA (AS PER MEASUREMENT) - CARPET AREA FLOOR-WISE (SQM & SQFT)
            customCarpetAreaFields: [],

            // COST OF CONSTRUCTION OF AS PER ACTUAL MEASUREMENT - CUSTOM FLOORS
            customCostOfConstructionFields: [],

            // RATE OF BUILT-UP AREA - CUSTOM FLOORS
            customBuiltUpAreaFields: [],
            basementFloorCarpetAreaSqm: '',
            basementFloorCarpetAreaSqft: '',
            groundFloorCarpetAreaSqm: '',
            groundFloorCarpetAreaSqft: '',
            canopyAreaCarpetAreaSqm: '',
            canopyAreaCarpetAreaSqft: '',
            serviceFloorCarpetAreaSqm: '',
            serviceFloorCarpetAreaSqft: '',
            terraceAreaAboveCanopyCarpetAreaSqm: '',
            terraceAreaAboveCanopyCarpetAreaSqft: '',
            firstFloorCarpetAreaSqm: '',
            firstFloorCarpetAreaSqft: '',
            secondFloorCarpetAreaSqm: '',
            secondFloorCarpetAreaSqft: '',
            thirdFloorCarpetAreaSqm: '',
            thirdFloorCarpetAreaSqft: '',
            fourthFloorCarpetAreaSqm: '',
            fourthFloorCarpetAreaSqft: '',
            fifthFloorCarpetAreaSqm: '',
            fifthFloorCarpetAreaSqft: '',
            sixthFloorCarpetAreaSqm: '',
            sixthFloorCarpetAreaSqft: '',

            // Built-up Area Table Fields - Terrace, Glass House, Helipad
            terraceFloorBuiltUpSqft: '',
            terraceFloorRateConstruction: '',
            terraceFloorValueConstruction: '',
            glassHouseFloorBuiltUpSqft: '',
            glassHouseFloorRateConstruction: '',
            glassHouseFloorValueConstruction: '',
            helipadFloorBuiltUpSqft: '',
            helipadFloorRateConstruction: '',
            helipadFloorValueConstruction: '',

            // VALUATION DETAILS TABLE FIELDS
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

            // SPECIFICATIONS OF CONSTRUCTION (FLOOR-WISE)
            constructionFoundation: '',
            constructionBasement: '',
            constructionSuperstructure: '',
            constructionEntranceDoor: '',
            constructionOtherDoor: '',
            constructionWindows: '',
            constructionFlooring: '',
            constructionSpecialFinish: '',
            constructionRoofing: '',
            constructionDrainage: '',

            // COMPOUND WALL SPECIFICATIONS
            height: '',
            length: '',
            typeOfConstruction: '',

            // ELECTRICAL INSTALLATION SPECIFICATIONS
            typeOfWiring: '',
            classOfFittings: '',
            numberOfLightPoints: '',
            farPlugs: '',
            sparePlug: '',
            anyOtherElectricalItem: '',

            // PLUMBING INSTALLATION SPECIFICATIONS
            numberOfWaterClassAndTaps: '',
            noWashBasins: '',
            noUrinals: '',
            noOfBathtubs: '',
            waterMeterTapsEtc: '',
            anyOtherPlumbingFixture: '',

            // DETAILS OF VALUATION OF BUILDING
            replacementCostGround: '',
            replacementCostUpperFloors: '',
            replacementCostService: '',
            replacementCostBasement: '',
            buildingAge: '',
            buildingLifeEstimated: '',
            depreciationPercentage: '',
            depreciatedBuildingRate: '',

            // COST OF CONSTRUCTION OF AS PER ACTUAL MEASUREMENT - FLOOR-WISE
            basementFloorCostSqft: '',
            basementFloorCostRate: '',
            basementFloorCostValue: '',
            groundFloorCostSqft: '',
            groundFloorCostRate: '',
            groundFloorCostValue: '',
            firstFloorCostSqft: '',
            firstFloorCostRate: '',
            firstFloorCostValue: '',

            groundFloorBuiltUpSqft: '',
            groundFloorRateConstruction: '',
            groundFloorValueConstruction: '',
            serviceFloorBuiltUpSqft: '',
            serviceFloorRateConstruction: '',
            serviceFloorValueConstruction: '',
            firstFloorBuiltUpSqft: '',
            firstFloorRateConstruction: '',
            firstFloorValueConstruction: '',
            secondFloorBuiltUpSqft: '',
            secondFloorRateConstruction: '',
            secondFloorValueConstruction: '',
            thirdFloorBuiltUpSqft: '',
            thirdFloorRateConstruction: '',
            thirdFloorValueConstruction: '',
            fourthFloorBuiltUpSqft: '',
            fourthFloorRateConstruction: '',
            fourthFloorValueConstruction: '',
            fifthFloorBuiltUpSqft: '',
            fifthFloorRateConstruction: '',
            fifthFloorValueConstruction: '',
            sixthFloorBuiltUpSqft: '',
            sixthFloorRateConstruction: '',
            sixthFloorValueConstruction: '',
            basementInteriorBuiltUpSqft: '',
            basementInteriorRateConstruction: '',
            basementInteriorValueConstruction: '',
            canopyAreaBuiltUpSqft: '',
            canopyAreaRateConstruction: '',
            canopyAreaValueConstruction: '',
            totalBuiltUpSqft: '',
            totalValueConstruction: '',

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
            purposeForValuation: '',

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
            doorsAndWindows: '',

            // DOCUMENTS AND PHOTOCOPY
            documentsPhotocopy: '',

            // FLOOR AREA INCLUDING BALCONY & TERRACE (SQM & SQFT)
            basementFloorBalconySqm: '',
            basementFloorBalconySqft: '',
            groundFloorBalconySqm: '',
            groundFloorBalconySqft: '',
            canopyAreaBalconySqm: '',
            canopyAreaBalconySqft: '',
            serviceFloorBalconySqm: '',
            serviceFloorBalconySqft: '',
            terraceAreaAboveCanopyBalconySqm: '',
            terraceAreaAboveCanopyBalconySqft: '',
            firstFloorBalconySqm: '',
            firstFloorBalconySqft: '',
            secondFloorBalconySqm: '',
            secondFloorBalconySqft: '',
            thirdFloorBalconySqm: '',
            thirdFloorBalconySqft: '',
            fourthFloorBalconySqm: '',
            fourthFloorBalconySqft: '',
            fifthFloorBalconySqm: '',
            fifthFloorBalconySqft: '',
            sixthFloorBalconySqm: '',
            sixthFloorBalconySqft: '',

            // FLOOR AREA (WITH "Area" NAMING) - EXTENT OF SITE & OCCUPANCY DETAILS
            groundFloorSqm: '',
            groundFloorSqft: '',
            serviceFloorSqm: '',
            serviceFloorSqft: '',
            firstFloorSqm: '',
            firstFloorSqft: '',
            secondFloorSqm: '',
            secondFloorSqft: '',
            thirdFloorSqm: '',
            thirdFloorSqft: '',
            forthFloorSqm: '',
            forthFloorSqft: '',
            fifthFloorSqm: '',
            fifthFloorSqft: '',
            sixthFloorSqm: '',
            sixthFloorSqft: '',
            totalBuiltUpSqm: '',
            totalBuiltUpSqft: '',
            groundCoverageAreaSqm: '',
            groundCoverageAreaSqft: '',
            basementFloorAreaSqm: '',
            basementFloorAreaSqft: '',
            canopyAreaSqm: '',
            canopyAreaSqft: ''
        },

        // CUSTOM FIELDS FOR DROPDOWN HANDLING
        customBankName: '',
        customCity: '',
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [locationImagePreviews, setLocationImagePreviews] = useState([]);
    const [documentPreviews, setDocumentPreviews] = useState([]);
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
    const documentFileInputRef = useRef(null);
    const locationFileInputRef = useRef(null);
    const dropdownFetchedRef = useRef(false);


    const username = user?.username || "";
    const role = user?.role || "";
    const clientId = user?.clientId || "";

    // Helper function to navigate to the correct form based on selectedForm or bank name

const handleDownloadPDF = useCallback(async () => {
        try {
            // Show a temporary loader with message
            dispatch(showLoader());
            // ALWAYS fetch fresh data from DB - do not use local state which may be stale
            let dataToDownload;
            try {
                dataToDownload = await getUbiApfFormById(id, username, role, clientId);
                console.log(':white_tick: Fresh UBI APF data fetched for PDF:', {
                    bankName: dataToDownload?.bankName,
                    city: dataToDownload?.city,
                    supportingDocuments: dataToDownload?.supportingDocuments?.length || 0
                });
            } catch (fetchError) {
                console.error(':x: Failed to fetch fresh UBI APF data:', fetchError);
                // Only fallback to valuation/formData if fetch fails
                dataToDownload = valuation;
                if (!dataToDownload) {
                    console.warn('UBI APF form data is null, using formData');
                    dataToDownload = formData;
                }
            }
            // Ensure documentPreviews is included from local state (has latest unsaved docs)
            if (documentPreviews && documentPreviews.length > 0) {
                console.log(':page_facing_up: Merging local documentPreviews:', documentPreviews.length);
                dataToDownload = {
                    ...dataToDownload,
                    documentPreviews: documentPreviews
                };
            }
            // Generate PDF (happens quickly on client side)
            await generateUbiApfPDF(dataToDownload);
            // Hide loader after PDF is generated
            dispatch(hideLoader());
            // Show success with slight delay to ensure loader is hidden
            setTimeout(() => {
                showSuccess('PDF downloaded successfully');
            }, 300);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            dispatch(hideLoader());
            showError('Failed to download PDF');
        }
    }, [id, username, role, clientId, valuation, formData, dispatch, showSuccess, showError]);
    useLayoutEffect(() => {
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

    // Sync customFields state with formData.customFields
    useEffect(() => {
        if (formData.customFields && Array.isArray(formData.customFields) && formData.customFields.length > 0) {
            // Only update if different to avoid infinite loops
            if (JSON.stringify(customFields) !== JSON.stringify(formData.customFields)) {
                ('🔄 Syncing customFields from formData:', formData.customFields.length);
                setCustomFields(formData.customFields);
            }
        }
    }, [formData.customFields]);

    // Sync customFields state back to formData whenever customFields state changes
    useEffect(() => {
        if (customFields && Array.isArray(customFields)) {
            setFormData(prev => ({
                ...prev,
                customFields: customFields
            }));
        }
    }, [customFields]);

    // Monitor custom fields state changes for debugging
    useEffect(() => {
        if (formData.customExtentOfSiteFields?.length > 0) {
            ('📊 STATE UPDATE - customExtentOfSiteFields changed:', {
                length: formData.customExtentOfSiteFields.length,
                items: formData.customExtentOfSiteFields
            });
        }
    }, [formData.customExtentOfSiteFields]);

    useEffect(() => {
        if (formData.customFloorAreaBalconyFields?.length > 0) {
            ('📊 STATE UPDATE - customFloorAreaBalconyFields changed:', {
                length: formData.customFloorAreaBalconyFields.length,
                items: formData.customFloorAreaBalconyFields
            });
        }
    }, [formData.customFloorAreaBalconyFields]);

    // Save current ubiApf form data to localStorage whenever formData updates
    // This ensures the data is available for prefilling the next ubiApf form
    useEffect(() => {
        if (formData && formData.pdfDetails && id) {
            // Check if ANY prefillable field has data
            const prefillableFields = [
                // Page 1 fields
                formData.pdfDetails.subArea,
                formData.pdfDetails.basementFloor,
                formData.pdfDetails.groundArea,
                formData.pdfDetails.terraceArea,
                formData.pdfDetails.place,
                formData.pdfDetails.date,

                // Page 2 fields
                formData.pdfDetails.partA,
                formData.pdfDetails.partB,
                formData.pdfDetails.partC,

                // Valuation fields
                formData.pdfDetails.marketability,
                formData.pdfDetails.favoringFactors,
                formData.pdfDetails.negativeFactors,
                formData.pdfDetails.fairMarketValue,
                formData.pdfDetails.realizableValue,

                // Facilities
                formData.pdfDetails.liftAvailable,
                formData.pdfDetails.protectedWaterSupply,
                formData.pdfDetails.undergroundSewerage,

                // Rates
                formData.pdfDetails.comparableRate,
                formData.pdfDetails.adoptedBasicCompositeRate,
                formData.pdfDetails.guidelineRate
            ];

            const hasMeaningfulData = prefillableFields.some(field => !!field);

            if (hasMeaningfulData) {
                try {
                    ('[DEBUG] Saving ubiApf data to localStorage:', {
                        id: id,
                        place: formData.pdfDetails.place,
                        marketability: formData.pdfDetails.marketability,
                        customFieldsCount: customFields.length,
                        customExtentOfSiteFieldsCount: formData.customExtentOfSiteFields?.length || 0,
                        customFloorAreaBalconyFieldsCount: formData.customFloorAreaBalconyFields?.length || 0,
                        hasMeaningfulData: true
                    });
                    localStorage.setItem('last_ubiApf_form_data', JSON.stringify({
                        pdfDetails: formData.pdfDetails,
                        customFields: customFields,
                        customExtentOfSiteFields: formData.customExtentOfSiteFields || [],
                        customFloorAreaBalconyFields: formData.customFloorAreaBalconyFields || []
                    }));
                    ('[DEBUG] UbiApf data saved successfully to localStorage');
                } catch (error) {
                    console.error('Error saving current ubiApf data:', error);
                }
            } else {
                ('[DEBUG] Form has no meaningful prefillable data - not saving');
            }
        }
    }, [formData, customFields, id]);

    const loadValuation = async () => {
        const savedData = localStorage.getItem(`valuation_draft_${username}`);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.uniqueId === id) {
                setValuation(parsedData);
                mapDataToForm(parsedData);
                // Prefill and load tab data for draft (new form)
                prefillAndLoadTabData(parsedData, true);
                return;
            }
        }

        try {
            // Pass user info for authentication
            const dbData = await getUbiApfFormById(id, username, role, clientId);
            ('🔍 Full dbData from backend:', dbData);
            ('📄 dbData.supportingDocuments:', dbData?.supportingDocuments);
            ('🏠 dbData.locationImages:', dbData?.locationImages);
            ('🏢 dbData.propertyImages:', dbData?.propertyImages);
            ('🎯 dbData.customFloorAreaBalconyFields:', dbData?.customFloorAreaBalconyFields);

            // Determine if this is a new form BEFORE mapping
            const isNewForm = !dbData.customFields || dbData.customFields.length === 0;
            ('[DEBUG] ===== FORM LOAD START =====');
            ('[DEBUG] isNewForm determination:', isNewForm);
            ('[DEBUG] dbData.customFields exists:', !!dbData?.customFields);
            ('[DEBUG] dbData.customFields.length:', dbData?.customFields?.length || 0);
            ('[DEBUG] dbData.customExtentOfSiteFields:', dbData?.customExtentOfSiteFields?.length || 0);
            ('[DEBUG] dbData.customFloorAreaBalconyFields:', dbData?.customFloorAreaBalconyFields?.length || 0);

            setValuation(dbData);
            // Merge backend data with current form data (preserve user's unsaved changes)
            mapDataToForm(dbData);

            // Prefill and load tab data synchronously after mapping
            // Only prefill if this is a new form (no customFields from database)
            if (isNewForm) {
                ('[DEBUG] Calling prefillAndLoadTabData for NEW form');
                prefillAndLoadTabData(dbData, isNewForm);
            } else {
                ('[DEBUG] Skipping prefill - existing form with customFields');
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

            // Restore custom fields from database
            if (dbData.customFields && Array.isArray(dbData.customFields)) {
                setCustomFields(dbData.customFields);
                ('✅ Restored customFields from backend:', dbData.customFields.length);
            }

            // Restore custom floor area balcony fields from database
            if (dbData.customFloorAreaBalconyFields && Array.isArray(dbData.customFloorAreaBalconyFields)) {
                ('✅ Restored customFloorAreaBalconyFields from backend:', dbData.customFloorAreaBalconyFields.length);
                // Ensure each field has an ID
                const fieldsWithIds = dbData.customFloorAreaBalconyFields.map((field, idx) => ({
                    ...field,
                    id: field.id || `balcony_${Date.now()}_${idx}`
                }));
                setFormData(prev => ({
                    ...prev,
                    customFloorAreaBalconyFields: fieldsWithIds
                }));
            } else {
                ('ℹ️ No customFloorAreaBalconyFields in backend response');
            }

            // Restore custom extent of site fields from database
            if (dbData.customExtentOfSiteFields && Array.isArray(dbData.customExtentOfSiteFields)) {
                ('✅ Restored customExtentOfSiteFields from backend:', dbData.customExtentOfSiteFields.length);
                // Ensure each field has an ID
                const fieldsWithIds = dbData.customExtentOfSiteFields.map((field, idx) => ({
                    ...field,
                    id: field.id || `extent_${Date.now()}_${idx}`
                }));
                setFormData(prev => ({
                    ...prev,
                    customExtentOfSiteFields: fieldsWithIds
                }));
            } else {
                ('ℹ️ No customExtentOfSiteFields in backend response');
            }

            // Restore supporting documents previews from localStorage (primary) or database (fallback)
            let docsToRestore = [];

            // PRIORITY 1: Check localStorage first (more reliable)
            const savedDocs = localStorage.getItem(`ubiApf_supportingDocs_${id}`);
            if (savedDocs) {
                try {
                    const parsed = JSON.parse(savedDocs);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Ensure all documents have file: null (File objects can't be JSON serialized anyway)
                        docsToRestore = parsed.map(doc => ({
                            ...doc,
                            file: null  // Always clear file property when loading from localStorage
                        }));
                        ('📄 Loaded supporting documents from localStorage:', docsToRestore.length);
                    }
                } catch (e) {
                    console.error('❌ Error parsing saved documents from localStorage:', e);
                }
            }

            // PRIORITY 2: Fallback to backend if localStorage is empty
            if (docsToRestore.length === 0 && dbData.supportingDocuments && Array.isArray(dbData.supportingDocuments) && dbData.supportingDocuments.length > 0) {
                ('📄 Loading supporting documents from database:', dbData.supportingDocuments.length);
                docsToRestore = dbData.supportingDocuments
                    .filter(doc => doc && typeof doc === 'object')
                    .map((doc, idx) => {
                        // Use URL directly if available (from Cloudinary or DB storage)
                        const previewUrl = doc.url || doc.path || doc.fileName || '';
                        return {
                            preview: previewUrl,
                            url: previewUrl,
                            fileName: doc.fileName || doc.name || `Document ${idx + 1}`,
                            size: doc.size || 0,
                            file: null
                        };
                    });
            }

            if (docsToRestore.length > 0) {
                ('✅ Setting document previews:', docsToRestore.length);
                setDocumentPreviews(docsToRestore);
                // Also store in formData for consistency with bomflat
                setFormData(prev => ({
                    ...prev,
                    documentPreviews: docsToRestore
                }));
            } else {
                ('ℹ️ No supporting documents found');
            }

            // Restore bank, city, DSA, engineer selections from backend or localStorage
            const bankFromStorage = localStorage.getItem(`ubiApf_bankName_${id}`);
            const cityFromStorage = localStorage.getItem(`ubiApf_city_${id}`);
            const dsaFromStorage = localStorage.getItem(`ubiApf_dsa_${id}`);
            const engineerFromStorage = localStorage.getItem(`ubiApf_engineer_${id}`);

            // Use localStorage first (more up-to-date), fallback to backend
            const finalBankName = bankFromStorage !== null ? bankFromStorage : (dbData.bankName || "");
            const finalCity = cityFromStorage !== null ? cityFromStorage : (dbData.city || "");
            const finalDsa = dsaFromStorage !== null ? dsaFromStorage : (dbData.dsa || "");
            const finalEngineer = engineerFromStorage !== null ? engineerFromStorage : (dbData.engineerName || "");

            ('🏦 Restoring bank:', finalBankName, '(from', bankFromStorage ? 'localStorage' : 'backend', ')');
            ('🏙️ Restoring city:', finalCity, '(from', cityFromStorage ? 'localStorage' : 'backend', ')');
            ('👤 Restoring DSA:', finalDsa, '(from', dsaFromStorage ? 'localStorage' : 'backend', ')');
            ('🔧 Restoring engineer:', finalEngineer, '(from', engineerFromStorage ? 'localStorage' : 'backend', ')');

            setBankName(finalBankName);
            setCity(finalCity);
            setDsa(finalDsa);
            setEngineerName(finalEngineer);
        } catch (error) {
            console.error("Error loading valuation:", error);
            // Show error to user
            const errorMessage = error?.message || error?.data?.message || 'Failed to load form';
            if (errorMessage && typeof errorMessage === 'string') {
                if (errorMessage.includes('not found') || errorMessage.includes('404')) {
                    showError('Form not found. Please create a new UBI APF form.');
                } else {
                    showError(errorMessage);
                }
            } else {
                showError('Failed to load form. Please refresh the page.');
            }
            setValuation({}); // Set empty object so form renders with empty fields
        }
    };

    const mapDataToForm = (data) => {
        setFormData(prev => {
            // CRITICAL: Deep copy pdfDetails to prevent shared references between forms
            const mergedPdfDetails = JSON.parse(JSON.stringify(prev.pdfDetails));

            ('=== mapDataToForm called ===');
            ('Input data keys:', Object.keys(data));
            ('Input pdfDetails exists:', !!data.pdfDetails);
            if (data.pdfDetails) {
                ('Input pdfDetails keys count:', Object.keys(data.pdfDetails).length);
                ('First 20 pdfDetails keys:', Object.keys(data.pdfDetails).slice(0, 20));
            }

            // Merge all pdfDetails fields from backend response
            if (data.pdfDetails && typeof data.pdfDetails === 'object') {
                Object.keys(data.pdfDetails).forEach(key => {
                    let value = data.pdfDetails[key];

                    // Convert string booleans to actual booleans for boolean fields
                    if (key === 'residentialArea' || key === 'commercialArea' || key === 'industrialArea') {
                        if (value === 'true' || value === true) {
                            value = true;
                        } else if (value === 'false' || value === false) {
                            value = false;
                        } else {
                            value = false;
                        }
                    }

                    // Only update if value is defined (not undefined or null)
                    if (value !== undefined && value !== null) {
                        mergedPdfDetails[key] = value;
                    }
                });
            }

            // Preserve custom fields arrays - CRITICAL: never overwrite user's unsaved custom fields
            // CRITICAL: Use deep copies to prevent shared references between forms
            const preservedCustomFloorAreaBalconyFields = prev.customFloorAreaBalconyFields && prev.customFloorAreaBalconyFields.length > 0
                ? JSON.parse(JSON.stringify(prev.customFloorAreaBalconyFields))
                : [];
            const preservedCustomExtentOfSiteFields = prev.customExtentOfSiteFields && prev.customExtentOfSiteFields.length > 0
                ? JSON.parse(JSON.stringify(prev.customExtentOfSiteFields))
                : [];
            const preservedCustomFields = prev.customFields && prev.customFields.length > 0
                ? JSON.parse(JSON.stringify(prev.customFields))
                : [];

            // PRIORITY: Keep user's current custom fields if they have any, only load from data if user has none
            const customFloorAreaBalconyFields = preservedCustomFloorAreaBalconyFields.length > 0
                ? preservedCustomFloorAreaBalconyFields
                : (data.customFloorAreaBalconyFields ? JSON.parse(JSON.stringify(data.customFloorAreaBalconyFields)) : []);
            const customExtentOfSiteFields = preservedCustomExtentOfSiteFields.length > 0
                ? preservedCustomExtentOfSiteFields
                : (data.customExtentOfSiteFields ? JSON.parse(JSON.stringify(data.customExtentOfSiteFields)) : []);
            const customFields = preservedCustomFields.length > 0
                ? preservedCustomFields
                : (data.customFields ? JSON.parse(JSON.stringify(data.customFields)) : []);

            const newFormData = {
                ...prev,
                ...data,
                pdfDetails: mergedPdfDetails,
                customFloorAreaBalconyFields,
                customExtentOfSiteFields,
                customFields
            };

            ('🔧 mapDataToForm - Custom fields after merge:', {
                preservedExtent: preservedCustomExtentOfSiteFields.length,
                preservedBalcony: preservedCustomFloorAreaBalconyFields.length,
                finalExtent: customExtentOfSiteFields.length,
                finalBalcony: customFloorAreaBalconyFields.length
            });

            // Debug log to see what's loaded
            ('=== Form data after merge ===');
            ('Total fields in pdfDetails:', Object.keys(mergedPdfDetails).length);

            // Log fields with values
            const fieldsWithValues = {};
            Object.keys(mergedPdfDetails).forEach(key => {
                if (mergedPdfDetails[key] && mergedPdfDetails[key] !== '' && mergedPdfDetails[key] !== false) {
                    fieldsWithValues[key] = mergedPdfDetails[key];
                }
            });
            ('PDF fields with NON-EMPTY values:', fieldsWithValues);
            ('Total fields with values:', Object.keys(fieldsWithValues).length);
            ('Custom Floor Area Balcony Fields restored:', newFormData.customFloorAreaBalconyFields?.length || 0);

            return newFormData;
        });
    };

    // Helper function to prefill tabs and load tab data after DB data is loaded
    // INCLUDES ALL FIELDS FROM THE THREE TABS
    const prefillAndLoadTabData = (dbData, isNewForm = true) => {
        // Schedule prefill to happen AFTER mapDataToForm state update completes
        setTimeout(() => {
            // Declare custom fields to prefill at function scope (outside try block)
            let customExtentOfSiteFieldsToPrefill = [];
            let customFloorAreaBalconyFieldsToPrefill = [];

            try {
                ('[DEBUG] prefillAndLoadTabData called, isNewForm:', isNewForm);
                ('[DEBUG] dbData.pdfDetails exists:', !!dbData?.pdfDetails);

                // Guard against missing pdfDetails
                if (!dbData || !dbData.pdfDetails) {
                    ('[DEBUG] No dbData or pdfDetails found, skipping prefill');
                    return;
                }

                // First, get last ubiApf data and tab-specific data from localStorage
                const lastUbiApfData = localStorage.getItem('last_ubiApf_form_data');
                const generalTabData = localStorage.getItem(`ubiApf_general_${id}`);
                const valuationTabData = localStorage.getItem(`ubiApf_valuation_${id}`);
                const marketTabData = localStorage.getItem(`ubiApf_market_${id}`);

                ('[DEBUG] LocalStorage check:', {
                    lastUbiApfData: !!lastUbiApfData,
                    generalTabData: !!generalTabData,
                    valuationTabData: !!valuationTabData,
                    marketTabData: !!marketTabData,
                    isNewForm: isNewForm
                });

                // Debug: Log what's in localStorage
                if (lastUbiApfData) {
                    try {
                        const parsed = JSON.parse(lastUbiApfData);
                        ('[DEBUG] lastUbiApfData structure:', {
                            hasPdfDetails: !!parsed.pdfDetails,
                            hasCustomFields: !!parsed.customFields,
                            hasCustomExtent: !!parsed.customExtentOfSiteFields,
                            hasCustomFloor: !!parsed.customFloorAreaBalconyFields,
                            pdfDetailsKeysCount: Object.keys(parsed.pdfDetails || {}).length
                        });
                    } catch (e) {
                        console.error('[DEBUG] Error parsing lastUbiApfData for logging:', e);
                    }
                }

                // Build the merged pdfDetails starting from current form state (which was updated by mapDataToForm)
                // CRITICAL: Deep copy to prevent shared references between forms
                let mergedPdfDetails = JSON.parse(JSON.stringify(dbData.pdfDetails));

                // 1. If we have last ubiApf data and this IS a new form, apply it as base (prefill)
                // Only prefill for new forms, not for existing ones
                if (isNewForm && lastUbiApfData) {
                    ('[DEBUG] ===== PREFILL STARTING =====');
                    ('[DEBUG] Applying lastUbiApfData as prefill base for NEW form');
                    try {
                        const parsedLastData = JSON.parse(lastUbiApfData);
                        ('[DEBUG] ===== PREFILL DATA LOADED =====');
                        ('[DEBUG] parsedLastData customFields:', parsedLastData?.customFields?.length || 0);
                        ('[DEBUG] parsedLastData customExtentOfSiteFields:', parsedLastData?.customExtentOfSiteFields?.length || 0);
                        ('[DEBUG] parsedLastData customFloorAreaBalconyFields:', parsedLastData?.customFloorAreaBalconyFields?.length || 0);
                        if (parsedLastData && parsedLastData.pdfDetails) {
                            // ========== GENERAL TAB - ALL FIELDS ==========
                            const generalFields = {
                                // Purpose of Valuation Section
                                refNo: parsedLastData.pdfDetails.refNo || '',
                                branch: parsedLastData.pdfDetails.branch || '',
                                place: parsedLastData.pdfDetails.place || '',
                                dateOfAppointment: parsedLastData.pdfDetails.dateOfAppointment || '',
                                briefDescriptionOfProperty: parsedLastData.pdfDetails.briefDescriptionOfProperty || '',
                                documentsPhotocopy: parsedLastData.pdfDetails.documentsPhotocopy || '',
                                sanctionedPlanStatus: parsedLastData.pdfDetails.sanctionedPlanStatus || '',
                                buildingCompletionCertificate: parsedLastData.pdfDetails.buildingCompletionCertificate || '',
                                dateOfInspection: parsedLastData.pdfDetails.dateOfInspection || '',
                                dateOnWhichValuationIsMade: parsedLastData.pdfDetails.dateOnWhichValuationIsMade || '',
                                ownerAddressJointOwners: parsedLastData.pdfDetails.ownerAddressJointOwners || '',

                                // Location of the property
                                plotNo: parsedLastData.pdfDetails.plotNo || '',
                                doorNo: parsedLastData.pdfDetails.doorNo || '',
                                tpVillage: parsedLastData.pdfDetails.tpVillage || '',
                                wardTaluka: parsedLastData.pdfDetails.wardTaluka || '',
                                district: parsedLastData.pdfDetails.district || '',
                                layoutPlanIssueDate: parsedLastData.pdfDetails.layoutPlanIssueDate || '',
                                approvedMapAuthority: parsedLastData.pdfDetails.approvedMapAuthority || '',
                                authenticityVerified: parsedLastData.pdfDetails.authenticityVerified || '',
                                valuerCommentOnAuthenticity: parsedLastData.pdfDetails.valuerCommentOnAuthenticity || '',

                                // Property Classification & Address
                                postalAddress: parsedLastData.pdfDetails.postalAddress || '',
                                cityTown: parsedLastData.pdfDetails.cityTown || '',
                                residentialArea: parsedLastData.pdfDetails.residentialArea || false,
                                commercialArea: parsedLastData.pdfDetails.commercialArea || false,
                                industrialArea: parsedLastData.pdfDetails.industrialArea || false,

                                // Boundaries of Property
                                boundariesPlotNorthDeed: parsedLastData.pdfDetails.boundariesPlotNorthDeed || '',
                                boundariesPlotNorthActual: parsedLastData.pdfDetails.boundariesPlotNorthActual || '',
                                boundariesPlotSouthDeed: parsedLastData.pdfDetails.boundariesPlotSouthDeed || '',
                                boundariesPlotSouthActual: parsedLastData.pdfDetails.boundariesPlotSouthActual || '',
                                boundariesPlotEastDeed: parsedLastData.pdfDetails.boundariesPlotEastDeed || '',
                                boundariesPlotEastActual: parsedLastData.pdfDetails.boundariesPlotEastActual || '',
                                boundariesPlotWestDeed: parsedLastData.pdfDetails.boundariesPlotWestDeed || '',
                                boundariesPlotWestActual: parsedLastData.pdfDetails.boundariesPlotWestActual || '',

                                // Dimensions
                                dimensionsDeed: parsedLastData.pdfDetails.dimensionsDeed || '',
                                dimensionsActual: parsedLastData.pdfDetails.dimensionsActual || '',

                                // Extent of Unit - Floor Area Balcony & Terrace
                                basementFloorBalconySqm: parsedLastData.pdfDetails.basementFloorBalconySqm || '',
                                basementFloorBalconySqft: parsedLastData.pdfDetails.basementFloorBalconySqft || '',
                                groundFloorBalconySqm: parsedLastData.pdfDetails.groundFloorBalconySqm || '',
                                groundFloorBalconySqft: parsedLastData.pdfDetails.groundFloorBalconySqft || '',
                                canopyAreaBalconySqm: parsedLastData.pdfDetails.canopyAreaBalconySqm || '',
                                canopyAreaBalconySqft: parsedLastData.pdfDetails.canopyAreaBalconySqft || '',
                                serviceFloorBalconySqm: parsedLastData.pdfDetails.serviceFloorBalconySqm || '',
                                serviceFloorBalconySqft: parsedLastData.pdfDetails.serviceFloorBalconySqft || '',
                                terraceAreaAboveCanopyBalconySqm: parsedLastData.pdfDetails.terraceAreaAboveCanopyBalconySqm || '',
                                terraceAreaAboveCanopyBalconySqft: parsedLastData.pdfDetails.terraceAreaAboveCanopyBalconySqft || '',
                                firstFloorBalconySqm: parsedLastData.pdfDetails.firstFloorBalconySqm || '',
                                firstFloorBalconySqft: parsedLastData.pdfDetails.firstFloorBalconySqft || '',
                                secondFloorBalconySqm: parsedLastData.pdfDetails.secondFloorBalconySqm || '',
                                secondFloorBalconySqft: parsedLastData.pdfDetails.secondFloorBalconySqft || '',
                                thirdFloorBalconySqm: parsedLastData.pdfDetails.thirdFloorBalconySqm || '',
                                thirdFloorBalconySqft: parsedLastData.pdfDetails.thirdFloorBalconySqft || '',
                                fourthFloorBalconySqm: parsedLastData.pdfDetails.fourthFloorBalconySqm || '',
                                fourthFloorBalconySqft: parsedLastData.pdfDetails.fourthFloorBalconySqft || '',
                                fifthFloorBalconySqm: parsedLastData.pdfDetails.fifthFloorBalconySqm || '',
                                fifthFloorBalconySqft: parsedLastData.pdfDetails.fifthFloorBalconySqft || '',
                                sixthFloorBalconySqm: parsedLastData.pdfDetails.sixthFloorBalconySqm || '',
                                sixthFloorBalconySqft: parsedLastData.pdfDetails.sixthFloorBalconySqft || '',

                                // Facilities Available
                                liftAvailable: parsedLastData.pdfDetails.liftAvailable || false,
                                protectedWaterSupply: parsedLastData.pdfDetails.protectedWaterSupply || false,
                                undergroundSewerage: parsedLastData.pdfDetails.undergroundSewerage || false,
                                carParkingOpenCovered: parsedLastData.pdfDetails.carParkingOpenCovered || false,
                                isCompoundWallExisting: parsedLastData.pdfDetails.isCompoundWallExisting || false,
                                isPavementLaidAroundBuilding: parsedLastData.pdfDetails.isPavementLaidAroundBuilding || false,
                                othersFacility: parsedLastData.pdfDetails.othersFacility || '',
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
                                meterCardName: parsedLastData.pdfDetails.meterCardName || '',
                                electricityServiceConnectionNo: parsedLastData.pdfDetails.electricityServiceConnectionNo || '',

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

                                // Other Details
                                areaUsage: parsedLastData.pdfDetails.areaUsage || '',
                                ownerOccupiedOrLetOut: parsedLastData.pdfDetails.ownerOccupiedOrLetOut || '',
                                rentReceivedPerMonth: parsedLastData.pdfDetails.rentReceivedPerMonth || '',
                                valuationPlace: parsedLastData.pdfDetails.valuationPlace || '',
                                valuationMadeDate: parsedLastData.pdfDetails.valuationMadeDate || '',
                                valuersName: parsedLastData.pdfDetails.valuersName || '',
                                doorsAndWindows: parsedLastData.pdfDetails.doorsAndWindows || '',
                                residentialOrCommercial: parsedLastData.pdfDetails.residentialOrCommercial || '',
                                facilityOthers: parsedLastData.pdfDetails.facilityOthers || '',
                                guidelineRatePerSqm: parsedLastData.pdfDetails.guidelineRatePerSqm || '',
                            };

                            // Merge ALL prefilled data
                            mergedPdfDetails = {
                                ...mergedPdfDetails,
                                ...generalFields,
                                ...valuationFields,
                                ...marketFields,
                                ...unitSpecificationsFields
                            };

                            ('[DEBUG] Prefilled ALL fields from lastUbiApfData');
                        }

                        // Prefill all custom field arrays from last ubiApf data (only for new forms)
                        if (isNewForm) {
                            if (parsedLastData.customFields && Array.isArray(parsedLastData.customFields)) {
                                ('[DEBUG] Prefilling customFields from lastUbiApfData:', parsedLastData.customFields.length);
                                // CRITICAL: Deep copy to prevent shared references between forms
                                customExtentOfSiteFieldsToPrefill = Array.isArray(parsedLastData.customExtentOfSiteFields) ? JSON.parse(JSON.stringify(parsedLastData.customExtentOfSiteFields)) : [];
                                customFloorAreaBalconyFieldsToPrefill = Array.isArray(parsedLastData.customFloorAreaBalconyFields) ? JSON.parse(JSON.stringify(parsedLastData.customFloorAreaBalconyFields)) : [];
                                // Set customFields state AFTER the current batch completes - with deep copy
                                setTimeout(() => setCustomFields(JSON.parse(JSON.stringify(parsedLastData.customFields))), 0);
                            }
                            if (parsedLastData.customExtentOfSiteFields && Array.isArray(parsedLastData.customExtentOfSiteFields)) {
                                ('[DEBUG] Prefilling customExtentOfSiteFields from lastUbiApfData:', parsedLastData.customExtentOfSiteFields.length);
                                // CRITICAL: Deep copy to prevent shared references between forms
                                customExtentOfSiteFieldsToPrefill = JSON.parse(JSON.stringify(parsedLastData.customExtentOfSiteFields));
                            }
                            if (parsedLastData.customFloorAreaBalconyFields && Array.isArray(parsedLastData.customFloorAreaBalconyFields)) {
                                ('[DEBUG] Prefilling customFloorAreaBalconyFields from lastUbiApfData:', parsedLastData.customFloorAreaBalconyFields.length);
                                // CRITICAL: Deep copy to prevent shared references between forms
                                customFloorAreaBalconyFieldsToPrefill = JSON.parse(JSON.stringify(parsedLastData.customFloorAreaBalconyFields));
                            }
                        }
                    } catch (parseError) {
                        console.error('[DEBUG] Error parsing lastUbiApfData:', parseError);
                    }
                } else {
                    ('[DEBUG] ===== PREFILL SKIPPED =====');
                    ('[DEBUG] Skipping prefill - isNewForm:', isNewForm, 'hasLastData:', !!lastUbiApfData);
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

                // Apply merged data to form state only if we have changes to apply
                const hasChanges = JSON.stringify(mergedPdfDetails) !== JSON.stringify(dbData.pdfDetails) ||
                    customExtentOfSiteFieldsToPrefill.length > 0 ||
                    customFloorAreaBalconyFieldsToPrefill.length > 0;
                if (hasChanges) {
                    ('[DEBUG] Applying merged data to form state', {
                        pdfDetailsChanged: JSON.stringify(mergedPdfDetails) !== JSON.stringify(dbData.pdfDetails),
                        customExtentOfSiteFieldsCount: customExtentOfSiteFieldsToPrefill.length,
                        customFloorAreaBalconyFieldsCount: customFloorAreaBalconyFieldsToPrefill.length
                    });
                    setFormData(prev => ({
                        ...prev,
                        pdfDetails: JSON.parse(JSON.stringify(mergedPdfDetails)),
                        customExtentOfSiteFields: customExtentOfSiteFieldsToPrefill.length > 0
                            ? JSON.parse(JSON.stringify(customExtentOfSiteFieldsToPrefill))
                            : (prev.customExtentOfSiteFields || []),
                        customFloorAreaBalconyFields: customFloorAreaBalconyFieldsToPrefill.length > 0
                            ? JSON.parse(JSON.stringify(customFloorAreaBalconyFieldsToPrefill))
                            : (prev.customFloorAreaBalconyFields || [])
                    }));
                    ('[DEBUG] ===== PREFILL COMPLETED =====');
                    ('[DEBUG] Applied:', {
                        pdfDetailsFields: Object.keys(mergedPdfDetails).length,
                        customExtentCount: customExtentOfSiteFieldsToPrefill.length,
                        customFloorCount: customFloorAreaBalconyFieldsToPrefill.length
                    });
                    ('[DEBUG] prefillAndLoadTabData completed - all data updated with prefilled values');
                } else {
                    ('[DEBUG] No changes in prefilled data, skipping setFormData');
                }
            } catch (error) {
                console.error('[DEBUG] Error in prefillAndLoadTabData:', error);
            }
        }, 0); // Execute after current batch of state updates
    };

    // Save current ubiApf form data as last form for future prefilling
    const saveCurrentUbiApfDataAsLast = useCallback(() => {
        try {
            // Save the complete current form data including all custom field arrays
            // CRITICAL: Deep copy all arrays to prevent shared references between forms
            const dataToSave = {
                pdfDetails: JSON.parse(JSON.stringify(formData.pdfDetails)),
                customFields: JSON.parse(JSON.stringify(customFields)),
                customExtentOfSiteFields: JSON.parse(JSON.stringify(formData.customExtentOfSiteFields || [])),
                customFloorAreaBalconyFields: JSON.parse(JSON.stringify(formData.customFloorAreaBalconyFields || []))
            };
            ('[DEBUG] Saving to last_ubiApf_form_data', {
                customFieldsCount: customFields.length,
                customExtentOfSiteFieldsCount: formData.customExtentOfSiteFields?.length || 0,
                customFloorAreaBalconyFieldsCount: formData.customFloorAreaBalconyFields?.length || 0
            });
            localStorage.setItem('last_ubiApf_form_data', JSON.stringify(dataToSave));
            ('[DEBUG] Successfully saved last_ubiApf_form_data with all custom field arrays');
        } catch (error) {
            console.error('Error saving current ubiApf data as last form:', error);
        }
    }, [formData, customFields]);

    // Save tab-specific data to localStorage
    const saveTabDataToLocalStorage = useCallback((tabName, fields) => {
        try {
            const tabKey = `ubiApf_${tabName}_${id}`;
            const existingData = localStorage.getItem(tabKey);
            const parsedExistingData = existingData ? JSON.parse(existingData) : {};

            // Merge new fields with existing data
            const mergedData = { ...parsedExistingData, ...fields };
            localStorage.setItem(tabKey, JSON.stringify(mergedData));
        } catch (error) {
            console.error(`Error saving ${tabName} tab data to localStorage:`, error);
        }
    }, [id]);

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

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleIntegerInputChange = useCallback((e, callback) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (callback) callback(value);
    }, []);

    const handleLettersOnlyInputChange = useCallback((e, callback) => {
        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        if (callback) callback(value);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            ('🔴 HANDLE SAVE CALLED - Current formData state:', {
                hasExtent: formData.customExtentOfSiteFields?.length,
                hasBalcony: formData.customFloorAreaBalconyFields?.length,
                extentData: formData.customExtentOfSiteFields,
                balconyData: formData.customFloorAreaBalconyFields
            });

            if (!user) {
                showError('Authentication required. Please log in.');
                onLogin?.();
                return;
            }
            dispatch(showLoader());

            // Merge images and selections into formData before saving
            // CRITICAL: Build dataToSave WITHOUT spreading formData first to avoid overwriting arrays
            // Filter out the array fields from formData, then add them back explicitly
            const { customFloorAreaBalconyFields: _, customExtentOfSiteFields: __, customFields: ___, ...formDataWithoutArrays } = formData;

            const dataToSave = {
                ...formDataWithoutArrays,
                bankName,
                city,
                dsa,
                engineerName,
                locationImages: locationImagePreviews,
                propertyImages: imagePreviews,
                supportingDocuments: documentPreviews,
                // CRITICAL: Explicitly set arrays AFTER spread to prevent overwriting
                customFloorAreaBalconyFields: Array.isArray(formData.customFloorAreaBalconyFields) ? formData.customFloorAreaBalconyFields : [],
                customExtentOfSiteFields: Array.isArray(formData.customExtentOfSiteFields) ? formData.customExtentOfSiteFields : [],
                customFields: Array.isArray(customFields) ? customFields : []
            };

            // Debug: Log the exact arrays being sent
            ('🚀 SENDING TO API:');
            ('   formData.customExtentOfSiteFields (from state):', formData.customExtentOfSiteFields);
            ('   dataToSave.customExtentOfSiteFields:', dataToSave.customExtentOfSiteFields);
            ('   JSON stringified:', JSON.stringify(dataToSave.customExtentOfSiteFields));
            ('   customFloorAreaBalconyFields:', JSON.stringify(dataToSave.customFloorAreaBalconyFields));
            ('   customFields:', JSON.stringify(dataToSave.customFields));

            ('💾 Saving form with custom fields:');
            ('   - customFloorAreaBalconyFields:', formData.customFloorAreaBalconyFields);
            ('   - customExtentOfSiteFields:', formData.customExtentOfSiteFields);
            ('   - customFields:', customFields);

            // Triple-check the exact structure being sent
            ('🔴 PRE-API VALIDATION:');
            ('   Type of customExtentOfSiteFields:', typeof dataToSave.customExtentOfSiteFields);
            ('   Is Array?:', Array.isArray(dataToSave.customExtentOfSiteFields));
            ('   Length:', dataToSave.customExtentOfSiteFields?.length);
            ('   Content:', dataToSave.customExtentOfSiteFields);
            ('   Individual items:');
            dataToSave.customExtentOfSiteFields?.forEach((item, i) => {
                (`      [${i}]:`, item);
            });

            ('📊 FULL DATA TO SAVE:', {
                hasCustomExtent: formData.customExtentOfSiteFields?.length,
                hasCustomBalcony: formData.customFloorAreaBalconyFields?.length,
                customExtentData: JSON.stringify(formData.customExtentOfSiteFields),
                customBalconyData: JSON.stringify(formData.customFloorAreaBalconyFields),
                totalBuiltUpSqm: formData.pdfDetails?.totalBuiltUpSqm,
                totalBuiltUpSqft: formData.pdfDetails?.totalBuiltUpSqft,
                totalFloorAreaBalconySqm: formData.pdfDetails?.totalFloorAreaBalconySqm,
                totalFloorAreaBalconySqft: formData.pdfDetails?.totalFloorAreaBalconySqft
            });
            ('🔍 COMPLETE formData object:', formData);

            const apiResponse = await updateUbiApfForm(id, dataToSave, user.username, user.role, user.clientId);

            // Debug: Log the response from the backend
            ('📡 API Response received:');
            ('   customExtentOfSiteFields:', apiResponse?.customExtentOfSiteFields?.length || 0, apiResponse?.customExtentOfSiteFields);
            ('   customFloorAreaBalconyFields:', apiResponse?.customFloorAreaBalconyFields?.length || 0, apiResponse?.customFloorAreaBalconyFields);
            ('   customFields:', apiResponse?.customFields?.length || 0, apiResponse?.customFields);

            invalidateCache();

            // Save supporting documents to localStorage as backup (backend may not return it)
            if (documentPreviews.length > 0) {
                localStorage.setItem(`ubiApf_supportingDocs_${id}`, JSON.stringify(documentPreviews));
                ('💾 Supporting documents saved to localStorage:', documentPreviews.length);
            }

            // Save selections to localStorage
            localStorage.setItem(`ubiApf_bankName_${id}`, bankName);
            localStorage.setItem(`ubiApf_city_${id}`, city);
            localStorage.setItem(`ubiApf_dsa_${id}`, dsa);
            localStorage.setItem(`ubiApf_engineer_${id}`, engineerName);

            // Save current form data as last ubiApf form for prefilling next form
            saveCurrentUbiApfDataAsLast();

            // Clear tab-specific localStorage after successful save
            localStorage.removeItem(`ubiApf_general_${id}`);
            localStorage.removeItem(`ubiApf_valuation_${id}`);
            localStorage.removeItem(`ubiApf_market_${id}`);

            dispatch(hideLoader());
            showSuccess('UBI APF form saved successfully');
        } catch (error) {
            console.error("Error saving UBI APF form:", error);
            dispatch(hideLoader());
            showError('Failed to save UBI APF form');
        }
    }, [user, dispatch, formData, bankName, city, dsa, engineerName, customFields, imagePreviews, locationImagePreviews, documentPreviews, id, onLogin, showError, showSuccess]);

    const handleValuationChange = useCallback((field, value) => {
        setFormData(prev => {
            // Only update if value actually changed
            if (prev.pdfDetails[field] === value) return prev;

            // CRITICAL: Deep copy to prevent shared references between forms
            const newPdfDetails = {
                ...JSON.parse(JSON.stringify(prev.pdfDetails)),
                [field]: value
            };

            // Auto-conversion from Sqm to Sqft (1 Sqm = 10.7639 Sqft)
            const conversionFactor = 10.7639;
            const sqmToSqftMappings = [
                // Extent of Site & Occupancy Details
                { sqmField: 'plotAreaSqm', sqftField: 'plotAreaSqft' },
                { sqmField: 'groundFloorSqm', sqftField: 'groundFloorSqft' },
                { sqmField: 'serviceFloorSqm', sqftField: 'serviceFloorSqft' },
                { sqmField: 'firstFloorSqm', sqftField: 'firstFloorSqft' },
                { sqmField: 'secondFloorSqm', sqftField: 'secondFloorSqft' },
                { sqmField: 'thirdFloorSqm', sqftField: 'thirdFloorSqft' },
                { sqmField: 'forthFloorSqm', sqftField: 'forthFloorSqft' },
                { sqmField: 'fifthFloorSqm', sqftField: 'fifthFloorSqft' },
                { sqmField: 'sixthFloorSqm', sqftField: 'sixthFloorSqft' },
                { sqmField: 'basementFloorSqm', sqftField: 'basementFloorSqft' },
                { sqmField: 'entranceCanopyAreaSqm', sqftField: 'entranceCanopyAreaSqft' },
                { sqmField: 'terraceAreaAboveCanopySqm', sqftField: 'terraceAreaAboveCanopySqft' },
                { sqmField: 'terraceFloorSqm', sqftField: 'terraceFloorSqft' },
                { sqmField: 'glassHouseFloorSqm', sqftField: 'glassHouseFloorSqft' },
                { sqmField: 'helipadFloorSqm', sqftField: 'helipadFloorSqft' },
                { sqmField: 'totalAreaSqm', sqftField: 'totalAreaSqft' },
                // Floor Area including Balcony & Terrace
                { sqmField: 'basementFloorBalconySqm', sqftField: 'basementFloorBalconySqft' },
                { sqmField: 'groundFloorBalconySqm', sqftField: 'groundFloorBalconySqft' },
                { sqmField: 'canopyAreaBalconySqm', sqftField: 'canopyAreaBalconySqft' },
                { sqmField: 'serviceFloorBalconySqm', sqftField: 'serviceFloorBalconySqft' },
                { sqmField: 'terraceAreaAboveCanopyBalconySqm', sqftField: 'terraceAreaAboveCanopyBalconySqft' },
                { sqmField: 'firstFloorBalconySqm', sqftField: 'firstFloorBalconySqft' },
                { sqmField: 'secondFloorBalconySqm', sqftField: 'secondFloorBalconySqft' },
                { sqmField: 'thirdFloorBalconySqm', sqftField: 'thirdFloorBalconySqft' },
                { sqmField: 'fourthFloorBalconySqm', sqftField: 'fourthFloorBalconySqft' },
                { sqmField: 'fifthFloorBalconySqm', sqftField: 'fifthFloorBalconySqft' },
                { sqmField: 'sixthFloorBalconySqm', sqftField: 'sixthFloorBalconySqft' },
                // Carpet Area (As per Measurement) - Carpet Area Floor-wise
                { sqmField: 'basementFloorCarpetAreaSqm', sqftField: 'basementFloorCarpetAreaSqft' },
                { sqmField: 'groundFloorCarpetAreaSqm', sqftField: 'groundFloorCarpetAreaSqft' },
                { sqmField: 'canopyAreaCarpetAreaSqm', sqftField: 'canopyAreaCarpetAreaSqft' },
                { sqmField: 'serviceFloorCarpetAreaSqm', sqftField: 'serviceFloorCarpetAreaSqft' },
                { sqmField: 'terraceAreaAboveCanopyCarpetAreaSqm', sqftField: 'terraceAreaAboveCanopyCarpetAreaSqft' },
                { sqmField: 'firstFloorCarpetAreaSqm', sqftField: 'firstFloorCarpetAreaSqft' },
                { sqmField: 'secondFloorCarpetAreaSqm', sqftField: 'secondFloorCarpetAreaSqft' },
                { sqmField: 'thirdFloorCarpetAreaSqm', sqftField: 'thirdFloorCarpetAreaSqft' },
                { sqmField: 'fourthFloorCarpetAreaSqm', sqftField: 'fourthFloorCarpetAreaSqft' },
                { sqmField: 'fifthFloorCarpetAreaSqm', sqftField: 'fifthFloorCarpetAreaSqft' },
                { sqmField: 'sixthFloorCarpetAreaSqm', sqftField: 'sixthFloorCarpetAreaSqft' }
            ];

            // Check if the changed field is a Sqm field and auto-calculate Sqft
            sqmToSqftMappings.forEach(mapping => {
                if (field === mapping.sqmField && value) {
                    const sqmValue = parseFloat(value);
                    if (!isNaN(sqmValue) && sqmValue > 0) {
                        const sqftValue = (sqmValue * conversionFactor).toFixed(2);
                        newPdfDetails[mapping.sqftField] = sqftValue;
                    }
                }
            });

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
            let hasCalculationFields = false;
            items.forEach(item => {
                if (field === item.qtyField || field === item.rateField) {
                    hasCalculationFields = true;
                    const qty = parseFloat(newPdfDetails[item.qtyField]) || 0;
                    const rate = parseFloat(newPdfDetails[item.rateField]) || 0;
                    const estimatedValue = qty * rate;
                    newPdfDetails[item.valueField] = estimatedValue > 0 ? estimatedValue.toString() : '';
                }
            });

            // Only recalculate value of flat if we modified a calculation field
            if (hasCalculationFields) {
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

            // Auto-calculate TOTAL AREA for Carpet Area (As per Measurement) section
            const carpetAreaFields = [
                'basementFloorSqm',
                'groundFloorSqm',
                'entranceCanopyAreaSqm',
                'serviceFloorSqm',
                'terraceAreaAboveCanopySqm',
                'firstFloorSqm',
                'secondFloorSqm',
                'thirdFloorSqm',
                'forthFloorSqm',
                'fifthFloorSqm',
                'sixthFloorSqm',
                'terraceFloorSqm',
                'glassHouseFloorSqm',
                'helipadFloorSqm'
            ];

            const carpetAreaSqftFields = [
                'basementFloorSqft',
                'groundFloorSqft',
                'entranceCanopyAreaSqft',
                'serviceFloorSqft',
                'terraceAreaAboveCanopySqft',
                'firstFloorSqft',
                'secondFloorSqft',
                'thirdFloorSqft',
                'forthFloorSqft',
                'fifthFloorSqft',
                'sixthFloorSqft',
                'terraceFloorSqft',
                'glassHouseFloorSqft',
                'helipadFloorSqft'
            ];

            // Check if any carpet area field was updated
            if (carpetAreaFields.includes(field) || carpetAreaSqftFields.includes(field)) {
                // Calculate total Sqm
                const totalSqm = carpetAreaFields.reduce((sum, fieldName) => {
                    const value = parseFloat(newPdfDetails[fieldName]) || 0;
                    return sum + value;
                }, 0);

                // Calculate total Sqft
                const totalSqft = carpetAreaSqftFields.reduce((sum, fieldName) => {
                    const value = parseFloat(newPdfDetails[fieldName]) || 0;
                    return sum + value;
                }, 0);

                // Update totals
                newPdfDetails.totalAreaSqm = totalSqm > 0 ? totalSqm.toFixed(2) : '';
                newPdfDetails.totalAreaSqft = totalSqft > 0 ? totalSqft.toFixed(2) : '';
            }

            // Auto-calculate TOTAL BUILT UP (Extent of Site & Occupancy Details)
            const extentOfSiteFields = [
                'basementFloorAreaSqm',
                'groundFloorSqm',
                'firstFloorSqm'
            ];

            const extentOfSiteSqftFields = [
                'basementFloorAreaSqft',
                'groundFloorSqft',
                'firstFloorSqft'
            ];

            // Check if any extent field was updated
            if (extentOfSiteFields.includes(field) || extentOfSiteSqftFields.includes(field)) {
                // Calculate total Sqm
                const totalBuiltUpSqm = extentOfSiteFields.reduce((sum, fieldName) => {
                    const value = parseFloat(newPdfDetails[fieldName]) || 0;
                    return sum + value;
                }, 0);

                // Calculate total Sqft
                const totalBuiltUpSqft = extentOfSiteSqftFields.reduce((sum, fieldName) => {
                    const value = parseFloat(newPdfDetails[fieldName]) || 0;
                    return sum + value;
                }, 0);

                // Update totals
                newPdfDetails.totalBuiltUpSqm = totalBuiltUpSqm > 0 ? totalBuiltUpSqm.toFixed(2) : '';
                newPdfDetails.totalBuiltUpSqft = totalBuiltUpSqft > 0 ? totalBuiltUpSqft.toFixed(2) : '';
            }

            // Auto-calculate TOTAL FLOOR AREA INCLUDING BALCONY & TERRACE
            const balconyAreaFields = [
                'basementFloorBalconySqm',
                'groundFloorBalconySqm',
                'firstFloorBalconySqm'
            ];

            const balconyAreaSqftFields = [
                'basementFloorBalconySqft',
                'groundFloorBalconySqft',
                'firstFloorBalconySqft'
            ];

            // Check if any balcony area field was updated
            if (balconyAreaFields.includes(field) || balconyAreaSqftFields.includes(field)) {
                // Calculate total Sqm
                const totalFloorAreaBalconySqm = balconyAreaFields.reduce((sum, fieldName) => {
                    const value = parseFloat(newPdfDetails[fieldName]) || 0;
                    return sum + value;
                }, 0);

                // Calculate total Sqft
                const totalFloorAreaBalconySqft = balconyAreaSqftFields.reduce((sum, fieldName) => {
                    const value = parseFloat(newPdfDetails[fieldName]) || 0;
                    return sum + value;
                }, 0);

                // Update totals
                newPdfDetails.totalFloorAreaBalconySqm = totalFloorAreaBalconySqm > 0 ? totalFloorAreaBalconySqm.toFixed(2) : '';
                newPdfDetails.totalFloorAreaBalconySqft = totalFloorAreaBalconySqft > 0 ? totalFloorAreaBalconySqft.toFixed(2) : '';
            }

            // Auto-calculate Value of Construction for Ground Floor and First Floor in Rate of Built-up Area
            const builtUpAreaMappings = [
                { sqftField: 'groundFloorBuiltUpSqft', rateField: 'groundFloorRateConstruction', valueField: 'groundFloorValueConstruction' },
                { sqftField: 'firstFloorBuiltUpSqft', rateField: 'firstFloorRateConstruction', valueField: 'firstFloorValueConstruction' },
                { sqftField: 'serviceFloorBuiltUpSqft', rateField: 'serviceFloorRateConstruction', valueField: 'serviceFloorValueConstruction' },
                { sqftField: 'secondFloorBuiltUpSqft', rateField: 'secondFloorRateConstruction', valueField: 'secondFloorValueConstruction' },
                { sqftField: 'thirdFloorBuiltUpSqft', rateField: 'thirdFloorRateConstruction', valueField: 'thirdFloorValueConstruction' },
                { sqftField: 'fourthFloorBuiltUpSqft', rateField: 'fourthFloorRateConstruction', valueField: 'fourthFloorValueConstruction' },
                { sqftField: 'fifthFloorBuiltUpSqft', rateField: 'fifthFloorRateConstruction', valueField: 'fifthFloorValueConstruction' },
                { sqftField: 'sixthFloorBuiltUpSqft', rateField: 'sixthFloorRateConstruction', valueField: 'sixthFloorValueConstruction' },
                { sqftField: 'basementInteriorBuiltUpSqft', rateField: 'basementInteriorRateConstruction', valueField: 'basementInteriorValueConstruction' },
                { sqftField: 'canopyAreaBuiltUpSqft', rateField: 'canopyAreaRateConstruction', valueField: 'canopyAreaValueConstruction' },
                { sqftField: 'terraceFloorBuiltUpSqft', rateField: 'terraceFloorRateConstruction', valueField: 'terraceFloorValueConstruction' },
                { sqftField: 'glassHouseFloorBuiltUpSqft', rateField: 'glassHouseFloorRateConstruction', valueField: 'glassHouseFloorValueConstruction' },
                { sqftField: 'helipadFloorBuiltUpSqft', rateField: 'helipadFloorRateConstruction', valueField: 'helipadFloorValueConstruction' }
            ];

            // Check if any built-up area field was updated and auto-calculate value
            builtUpAreaMappings.forEach(mapping => {
                if (field === mapping.sqftField || field === mapping.rateField) {
                    const sqft = parseFloat(newPdfDetails[mapping.sqftField]) || 0;
                    const rate = parseFloat(newPdfDetails[mapping.rateField]) || 0;
                    const value = sqft * rate;
                    newPdfDetails[mapping.valueField] = value > 0 ? value.toString() : '';
                }
            });

            // Auto-calculate Value of Construction (Sqft × Rate) for Cost of Construction table
            const costOfConstructionMappings = [
                { sqftField: 'basementFloorCostSqft', rateField: 'basementFloorCostRate', valueField: 'basementFloorCostValue' },
                { sqftField: 'groundFloorCostSqft', rateField: 'groundFloorCostRate', valueField: 'groundFloorCostValue' },
                { sqftField: 'firstFloorCostSqft', rateField: 'firstFloorCostRate', valueField: 'firstFloorCostValue' }
            ];

            // Check if any cost of construction field was updated and auto-calculate value
            costOfConstructionMappings.forEach(mapping => {
                if (field === mapping.sqftField || field === mapping.rateField) {
                    const sqft = parseFloat(newPdfDetails[mapping.sqftField]) || 0;
                    const rate = parseFloat(newPdfDetails[mapping.rateField]) || 0;
                    const value = sqft * rate;
                    newPdfDetails[mapping.valueField] = value > 0 ? value.toFixed(2) : '';
                }
            });

            // Define field arrays for auto-calculation
            const partCFields = ['partCExtraItem1Amount', 'partCExtraItem2Amount', 'partCExtraItem3Amount', 'partCExtraItem4Amount', 'partCExtraItem5Amount'];
            const partDFields = ['part2Item1Amount', 'part2Item2Amount', 'part2Item3Amount', 'part2Item4Amount', 'part2Item5Amount', 'part2Item6Amount', 'part2Item7Amount', 'part2Item8Amount', 'part2Item9Amount'];
            const partEFields = ['part3Item1Amount', 'part3Item2Amount', 'part3Item3Amount', 'part3Item4Amount'];
            const partFFields = ['partFItem1Amount', 'partFItem2Amount', 'partFItem3Amount', 'partFItem4Amount', 'partFItem5Amount', 'partFItem6Amount'];
            const allPartFields = [...partCFields, ...partDFields, ...partEFields, ...partFFields, 'abstractLand', 'abstractBuilding', 'abstractExtraItems', 'abstractAmenities', 'abstractMiscellaneous', 'abstractServices'];

            if (partCFields.includes(field)) {
                const partCTotal = partCFields.reduce((sum, f) => sum + (parseFloat(newPdfDetails[f]) || 0), 0);
                newPdfDetails.partCExtraTotal = partCTotal > 0 ? partCTotal.toString() : '';
                newPdfDetails.abstractExtraItems = partCTotal > 0 ? partCTotal.toString() : '';
            }
            if (partDFields.includes(field)) {
                const partDTotal = partDFields.reduce((sum, f) => sum + (parseFloat(newPdfDetails[f]) || 0), 0);
                newPdfDetails.part2Total = partDTotal > 0 ? partDTotal.toString() : '';
                newPdfDetails.abstractAmenities = partDTotal > 0 ? partDTotal.toString() : '';
            }
            if (partEFields.includes(field)) {
                const partETotal = partEFields.reduce((sum, f) => sum + (parseFloat(newPdfDetails[f]) || 0), 0);
                newPdfDetails.part3Total = partETotal > 0 ? partETotal.toString() : '';
                newPdfDetails.abstractMiscellaneous = partETotal > 0 ? partETotal.toString() : '';
            }
            if (partFFields.includes(field)) {
                const partFTotal = partFFields.reduce((sum, f) => sum + (parseFloat(newPdfDetails[f]) || 0), 0);
                newPdfDetails.partFTotal = partFTotal > 0 ? partFTotal.toString() : '';
            }

            // Recalculate Abstract Total when any part is updated
            if (allPartFields.includes(field)) {
                const abstractTotal =
                    (parseFloat(newPdfDetails.abstractLand) || 0) +
                    (parseFloat(newPdfDetails.abstractBuilding) || 0) +
                    (parseFloat(newPdfDetails.abstractExtraItems) || 0) +
                    (parseFloat(newPdfDetails.abstractAmenities) || 0) +
                    (parseFloat(newPdfDetails.abstractMiscellaneous) || 0) +
                    (parseFloat(newPdfDetails.abstractServices) || 0);
                newPdfDetails.abstractTotalValue = abstractTotal > 0 ? abstractTotal.toString() : '';
                // Auto-calculate rounded value (round to nearest 1000)
                const roundedValue = abstractTotal > 0 ? Math.round(abstractTotal / 1000) * 1000 : 0;
                newPdfDetails.abstractRoundedValue = roundedValue > 0 ? roundedValue.toString() : '';
            }

            // Recalculate Owner Abstract Total when any owner abstract part is updated
            const ownerAbstractFields = ['ownerAbstractLand', 'ownerAbstractBuilding', 'ownerAbstractExtraItems', 'ownerAbstractAmenities', 'ownerAbstractMiscellaneous', 'ownerAbstractServices'];
            if (ownerAbstractFields.includes(field)) {
                const ownerAbstractTotal =
                    (parseFloat(newPdfDetails.ownerAbstractLand) || 0) +
                    (parseFloat(newPdfDetails.ownerAbstractBuilding) || 0) +
                    (parseFloat(newPdfDetails.ownerAbstractExtraItems) || 0) +
                    (parseFloat(newPdfDetails.ownerAbstractAmenities) || 0) +
                    (parseFloat(newPdfDetails.ownerAbstractMiscellaneous) || 0) +
                    (parseFloat(newPdfDetails.ownerAbstractServices) || 0);
                newPdfDetails.ownerAbstractTotalValue = ownerAbstractTotal > 0 ? ownerAbstractTotal.toString() : '';
                // Auto-calculate rounded value (round to nearest 1000)
                const ownerRoundedValue = ownerAbstractTotal > 0 ? Math.round(ownerAbstractTotal / 1000) * 1000 : 0;
                newPdfDetails.ownerAbstractRoundedValue = ownerRoundedValue > 0 ? ownerRoundedValue.toString() : '';
            }

            return {
                ...prev,
                pdfDetails: newPdfDetails
            };
        });
    }, []);

    const handleLocationImageUpload = useCallback(async (e) => {
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
    }, [showError]);

    const handleImageUpload = useCallback(async (e) => {
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
    }, [showError]);

    const removeLocationImage = useCallback((index) => {
        setLocationImagePreviews(prev => prev.filter((_, i) => i !== index));
    }, []);

    const removeImage = useCallback((index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleDocumentUpload = useCallback(async (e) => {
        const files = e.target.files;
        if (!files) return;

        ('📄 Documents selected:', files.length);

        for (let file of files) {
            try {
                const base64 = await fileToBase64(file);
                ('✅ Document converted to base64:', file.name);
                setDocumentPreviews(prev => {
                    const updated = [
                        ...prev,
                        { preview: base64, url: base64, fileName: file.name, size: file.size, file: file }
                    ];
                    ('✅ Document preview added:', file.name, 'Total documents:', updated.length);

                    // Save to localStorage immediately after adding
                    localStorage.setItem(`ubiApf_supportingDocs_${id}`, JSON.stringify(updated));
                    ('💾 Document saved to localStorage immediately');

                    return updated;
                });
            } catch (error) {
                console.error('❌ Error converting file to base64:', error);
                showError('Failed to upload document');
            }
        }
        // Reset file input
        if (documentFileInputRef.current) {
            documentFileInputRef.current.value = '';
        }
    }, [id, showError]);

    const removeDocument = useCallback((index) => {
        setDocumentPreviews(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // Update localStorage when documents are removed
            if (updated.length > 0) {
                localStorage.setItem(`ubiApf_supportingDocs_${id}`, JSON.stringify(updated));
            } else {
                localStorage.removeItem(`ubiApf_supportingDocs_${id}`);
            }
            ('📄 Document removed, updated localStorage');
            return updated;
        });
    }, [id]);

    const handleCoordinateChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            coordinates: {
                ...prev.coordinates,
                [field]: value
            }
        }));
    }, []);

    const handleDirectionChange = useCallback((direction, value) => {
        setFormData(prev => ({
            ...prev,
            directions: {
                ...prev.directions,
                [direction]: value
            }
        }));
    }, []);

    // Handle Add Custom Field
    const handleAddCustomField = useCallback(() => {
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
    }, [customFieldName, customFieldValue, customFields, showError, showSuccess]);

    // Handle Remove Custom Field
    const handleRemoveCustomField = useCallback((index) => {
        const fieldName = customFields[index]?.name;
        const updatedFields = customFields.filter((_, i) => i !== index);
        setCustomFields(updatedFields);
        showSuccess(`Field "${fieldName}" removed successfully`);
    }, [customFields, showSuccess]);

    // Handle Add Carpet Area Floor
    const handleAddCarpetAreaFloor = useCallback(() => {
        const newFloorIndex = (formData.pdfDetails?.customCarpetAreaFields?.length || 0) + 1;
        const newFloor = {
            id: `custom-carpet-floor-${Date.now()}`,
            floorName: `Custom Floor ${newFloorIndex}`,
            sqm: '',
            sqft: ''
        };

        setFormData(prev => ({
            ...prev,
            pdfDetails: {
                ...prev.pdfDetails,
                customCarpetAreaFields: [...(prev.pdfDetails?.customCarpetAreaFields || []), newFloor]
            }
        }));
    }, [formData.pdfDetails]);

    // Handle Remove Carpet Area Floor
    const handleRemoveCarpetAreaFloor = useCallback((id) => {
        setFormData(prev => ({
            ...prev,
            pdfDetails: {
                ...prev.pdfDetails,
                customCarpetAreaFields: prev.pdfDetails?.customCarpetAreaFields?.filter(floor => floor.id !== id) || []
            }
        }));
    }, []);

    // Handle Update Carpet Area Floor
    const handleUpdateCarpetAreaFloor = useCallback((id, field, value) => {
        setFormData(prev => {
            // CRITICAL: Deep copy to prevent shared references between forms
            const newPdfDetails = JSON.parse(JSON.stringify(prev.pdfDetails));
            const updatedFloors = newPdfDetails.customCarpetAreaFields?.map(floor => {
                if (floor.id === id) {
                    const updated = { ...floor, [field]: value };

                    // Auto-convert Sqm to Sqft if Sqm is updated
                    if (field === 'sqm' && value) {
                        const sqmValue = parseFloat(value);
                        if (!isNaN(sqmValue) && sqmValue > 0) {
                            const conversionFactor = 10.764;
                            updated.sqft = (sqmValue * conversionFactor).toFixed(2);
                        }
                    }

                    return updated;
                }
                return floor;
            }) || [];

            // Recalculate totals after update
            const allCarpetAreaFields = [
                { sqm: newPdfDetails.basementFloorSqm, sqft: newPdfDetails.basementFloorSqft },
                { sqm: newPdfDetails.groundFloorSqm, sqft: newPdfDetails.groundFloorSqft },
                { sqm: newPdfDetails.entranceCanopyAreaSqm, sqft: newPdfDetails.entranceCanopyAreaSqft },
                { sqm: newPdfDetails.serviceFloorSqm, sqft: newPdfDetails.serviceFloorSqft },
                { sqm: newPdfDetails.terraceAreaAboveCanopySqm, sqft: newPdfDetails.terraceAreaAboveCanopySqft },
                { sqm: newPdfDetails.firstFloorSqm, sqft: newPdfDetails.firstFloorSqft },
                { sqm: newPdfDetails.secondFloorSqm, sqft: newPdfDetails.secondFloorSqft },
                { sqm: newPdfDetails.thirdFloorSqm, sqft: newPdfDetails.thirdFloorSqft },
                { sqm: newPdfDetails.forthFloorSqm, sqft: newPdfDetails.forthFloorSqft },
                { sqm: newPdfDetails.fifthFloorSqm, sqft: newPdfDetails.fifthFloorSqft },
                { sqm: newPdfDetails.sixthFloorSqm, sqft: newPdfDetails.sixthFloorSqft },
                { sqm: newPdfDetails.terraceFloorSqm, sqft: newPdfDetails.terraceFloorSqft },
                { sqm: newPdfDetails.glassHouseFloorSqm, sqft: newPdfDetails.glassHouseFloorSqft },
                { sqm: newPdfDetails.helipadFloorSqm, sqft: newPdfDetails.helipadFloorSqft },
                ...updatedFloors.map(f => ({ sqm: f.sqm, sqft: f.sqft }))
            ];

            const totalSqm = allCarpetAreaFields.reduce((sum, field) => {
                const value = parseFloat(field.sqm) || 0;
                return sum + value;
            }, 0);

            const totalSqft = allCarpetAreaFields.reduce((sum, field) => {
                const value = parseFloat(field.sqft) || 0;
                return sum + value;
            }, 0);

            newPdfDetails.customCarpetAreaFields = updatedFloors;
            newPdfDetails.totalAreaSqm = totalSqm > 0 ? totalSqm.toFixed(2) : '';
            newPdfDetails.totalAreaSqft = totalSqft > 0 ? totalSqft.toFixed(2) : '';

            return {
                ...prev,
                pdfDetails: newPdfDetails
            };
        });
    }, []);

    // Handle Add Cost of Construction Floor
    const handleAddCostOfConstructionFloor = useCallback(() => {
        setFormData(prev => {
            const newFloorIndex = (prev.pdfDetails?.customCostOfConstructionFields?.length || 0) + 1;
            const newFloor = {
                id: `custom-cost-construction-floor-${Date.now()}`,
                slabArea: `Custom Floor ${newFloorIndex}`,
                sqft: '',
                rate: '',
                value: ''
            };
            return {
                ...prev,
                pdfDetails: {
                    ...prev.pdfDetails,
                    customCostOfConstructionFields: [...(prev.pdfDetails?.customCostOfConstructionFields || []), newFloor]
                }
            };
        });
    }, []);

    // Handle Remove Cost of Construction Floor
    const handleRemoveCostOfConstructionFloor = useCallback((id) => {
        setFormData(prev => ({
            ...prev,
            pdfDetails: {
                ...prev.pdfDetails,
                customCostOfConstructionFields: prev.pdfDetails?.customCostOfConstructionFields?.filter(floor => floor.id !== id) || []
            }
        }));
    }, []);

    // Handle Update Cost of Construction Floor
    const handleUpdateCostOfConstructionFloor = useCallback((id, field, value) => {
        setFormData(prev => {
            // CRITICAL: Deep copy to prevent shared references between forms
            const newPdfDetails = JSON.parse(JSON.stringify(prev.pdfDetails));
            const updatedFloors = newPdfDetails.customCostOfConstructionFields?.map(floor => {
                if (floor.id === id) {
                    const updated = { ...floor, [field]: value };

                    // Auto-calculate Value = Sqft × Rate
                    if ((field === 'sqft' || field === 'rate') && updated.sqft && updated.rate) {
                        const sqftValue = parseFloat(updated.sqft);
                        const rateValue = parseFloat(updated.rate);
                        if (!isNaN(sqftValue) && !isNaN(rateValue) && sqftValue > 0 && rateValue > 0) {
                            updated.value = (sqftValue * rateValue).toFixed(2);
                        }
                    }

                    return updated;
                }
                return floor;
            }) || [];

            newPdfDetails.customCostOfConstructionFields = updatedFloors;

            return {
                ...prev,
                pdfDetails: newPdfDetails
            };
        });
    }, []);

    // Handle Add Built-up Area Floor
    const handleAddBuiltUpAreaFloor = useCallback(() => {
        setFormData(prev => {
            const newFloorIndex = (prev.pdfDetails?.customBuiltUpAreaFields?.length || 0) + 1;
            const newFloor = {
                id: `custom-builtup-floor-${Date.now()}`,
                floorName: `Custom Floor ${newFloorIndex}`,
                sqft: '',
                rateConstruction: '',
                valueConstruction: ''
            };
            return {
                ...prev,
                pdfDetails: {
                    ...prev.pdfDetails,
                    customBuiltUpAreaFields: [...(prev.pdfDetails?.customBuiltUpAreaFields || []), newFloor]
                }
            };
        });
    }, []);

    // Handle Remove Built-up Area Floor
    const handleRemoveBuiltUpAreaFloor = useCallback((id) => {
        setFormData(prev => ({
            ...prev,
            pdfDetails: {
                ...prev.pdfDetails,
                customBuiltUpAreaFields: prev.pdfDetails?.customBuiltUpAreaFields?.filter(floor => floor.id !== id) || []
            }
        }));
    }, []);

    // Handle Update Built-up Area Floor
    const handleUpdateBuiltUpAreaFloor = useCallback((id, field, value) => {
        setFormData(prev => ({
            ...prev,
            pdfDetails: {
                ...prev.pdfDetails,
                customBuiltUpAreaFields: prev.pdfDetails?.customBuiltUpAreaFields?.map(floor => {
                    if (floor.id === id) {
                        const updated = { ...floor, [field]: value };

                        // Auto-calculate Value of Construction = Sqft × Rate
                        if ((field === 'sqft' || field === 'rateConstruction') && (updated.sqft || updated.rateConstruction)) {
                            const sqft = parseFloat(updated.sqft) || 0;
                            const rate = parseFloat(updated.rateConstruction) || 0;
                            updated.valueConstruction = sqft && rate ? (sqft * rate).toString() : '';
                        }

                        return updated;
                    }
                    return floor;
                }) || []
            }
        }));
    }, []);

    const validateForm = useCallback(() => {
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
        if (!engineerName || !engineerName.trim()) {
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
    }, [formData, bankName, city, engineerName]);

    const validatePdfDetails = useCallback(() => {
        const errors = [];
        return errors;
    }, []);

    const handleManagerAction = useCallback(async (action) => {
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
                                customFields: customFields,
                                customExtentOfSiteFields: formData.customExtentOfSiteFields || [],
                                customFloorAreaBalconyFields: formData.customFloorAreaBalconyFields || []
                            };
                            await updateUbiApfForm(id, dataToSave, user.username, user.role, user.clientId);
                            invalidateCache();

                            // Save current form data as last ubiApf form for prefilling next form
                            saveCurrentUbiApfDataAsLast();

                            // Clear tab-specific localStorage after successful save
                            localStorage.removeItem(`ubiApf_general_${id}`);
                            localStorage.removeItem(`ubiApf_valuation_${id}`);
                            localStorage.removeItem(`ubiApf_market_${id}`);

                            showSuccess('UBI APF form saved successfully');
                            saveSucceeded = true;
                            resolve();
                        } catch (error) {
                            console.error("Error saving UBI APF form:", error);
                            showError('Failed to save UBI APF form');
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
    }, [user, onLogin, showError, showSuccess, dispatch, formData, customFields, id, saveCurrentUbiApfDataAsLast]);

    const handleModalOk = useCallback(async () => {
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

            const responseData = await managerSubmitUbiApfForm(id, statusValue, modalFeedback, user.username, user.role);

            invalidateCache("/ubi-apf");

            // Update the form state with response data from backend
            setValuation(responseData);

            // Save current form data as last ubiApf form for prefilling next form
            saveCurrentUbiApfDataAsLast();

            showSuccess(`UBI APF form ${statusValue} successfully!`);
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
    }, [id, modalAction, modalFeedback, user, onLogin, showError, showSuccess, dispatch, navigate, saveCurrentUbiApfDataAsLast]);

    const onFinish = useCallback(async (e) => {
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
                bankName: bankName === "other" ? (formData.customBankName || "").trim() : bankName,
                city: city === "other" ? (formData.customCity || "").trim() : city,
                clientName: formData.clientName,
                mobileNumber: formData.mobileNumber,
                address: formData.address,
                payment: formData.payment,
                collectedBy: formData.collectedBy,
                dsa: dsa === "other" ? (formData.customDsa || "").trim() : dsa,
                engineerName: engineerName,
                notes: formData.notes,
                elevation: formData.elevation,
                directions: formData.directions,
                coordinates: formData.coordinates,
                propertyImages: formData.propertyImages || [],
                locationImages: formData.locationImages || [],
                supportingDocuments: formData.supportingDocuments || [],
                photos: formData.photos || { elevationImages: [], siteImages: [] },
                status: "on-progress",
                pdfDetails: {
                    ...formData.pdfDetails,
                    // Include dynamic table arrays
                    customCarpetAreaFields: Array.isArray(formData.pdfDetails?.customCarpetAreaFields) ? formData.pdfDetails.customCarpetAreaFields : [],
                    customBuiltUpAreaFields: Array.isArray(formData.pdfDetails?.customBuiltUpAreaFields) ? formData.pdfDetails.customBuiltUpAreaFields : []
                },
                // CRITICAL FIX: Include all custom field arrays
                customFields: customFields,
                customExtentOfSiteFields: Array.isArray(formData.customExtentOfSiteFields) ? formData.customExtentOfSiteFields : [],
                customFloorAreaBalconyFields: Array.isArray(formData.customFloorAreaBalconyFields) ? formData.customFloorAreaBalconyFields : [],
                managerFeedback: formData.managerFeedback || "",
                submittedByManager: formData.submittedByManager || false,
                lastUpdatedBy: username,
                lastUpdatedByRole: role
            };

            // Handle image uploads - parallel
            const [uploadedPropertyImages, uploadedLocationImages, uploadedSupportingDocs, uploadedAreaImages] = await Promise.all([
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
                    const newSupportingDocs = documentPreviews.filter(p => p && p.file);
                    ('📄 Checking documents for upload:', {
                        totalDocuments: documentPreviews.length,
                        newDocsToUpload: newSupportingDocs.length,
                        docs: documentPreviews.map(d => ({
                            fileName: d?.fileName,
                            hasFile: !!d?.file,
                            fileType: d?.file?.constructor?.name
                        }))
                    });
                    if (newSupportingDocs.length > 0) {
                        return await uploadDocuments(newSupportingDocs, valuation.uniqueId);
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
                .filter(p => p && !p.file && (p.preview || p.url))
                .map((preview, idx) => ({
                    url: preview.preview || preview.url,
                    index: idx
                }));

            // For location images: keep existing docs (no .file) and add newly uploaded ones
            const previousLocationImages = locationImagePreviews
                .filter(p => p && !p.file && (p.url || p.preview))
                .map((img, idx) => ({
                    url: img.url || img.preview,
                    fileName: img.fileName,
                    size: img.size,
                    index: idx
                }));

            // For supporting documents: keep existing docs (no .file) and add newly uploaded ones
            const previousSupportingDocs = documentPreviews
                .filter(p => p && !p.file && (p.url || p.preview))
                .map((doc, idx) => ({
                    url: doc.url || doc.preview,
                    fileName: doc.fileName,
                    size: doc.size,
                    index: idx
                }));

            ('📍 Location Images Summary:');
            ('  - locationImagePreviews count:', locationImagePreviews.length);
            ('  - uploadedLocationImages count:', uploadedLocationImages.length);
            ('  - previousLocationImages count:', previousLocationImages.length);
            ('  - Final payload.locationImages count:', previousLocationImages.length + uploadedLocationImages.length);

            ('📄 Supporting Documents Summary:');
            ('  - documentPreviews count:', documentPreviews.length);
            ('  - uploadedSupportingDocs count:', uploadedSupportingDocs.length);
            ('  - previousSupportingDocs count:', previousSupportingDocs.length);
            ('  - Final payload.supportingDocuments count:', previousSupportingDocs.length + uploadedSupportingDocs.length);

            payload.propertyImages = [...previousPropertyImages, ...uploadedPropertyImages];
            payload.locationImages = [...previousLocationImages, ...uploadedLocationImages];
            payload.supportingDocuments = [...previousSupportingDocs, ...uploadedSupportingDocs];
            payload.areaImages = uploadedAreaImages || {};

            // Clear draft before API call
            localStorage.removeItem(`valuation_draft_${username}`);

            // Call API to update UBI APF form
            ("[bomflat.jsx] Payload being sent to API:", {
                clientId: payload.clientId,
                uniqueId: payload.uniqueId,
                bankName: payload.bankName,
                city: payload.city,
                pdfDetailsKeys: Object.keys(payload.pdfDetails || {}).length,
                customFields: payload.customFields?.length || 0,
                customExtentOfSiteFields: payload.customExtentOfSiteFields?.length || 0,
                customFloorAreaBalconyFields: payload.customFloorAreaBalconyFields?.length || 0,
                pdfDetailsSample: payload.pdfDetails ? {
                    purposeOfValuation: payload.pdfDetails.purposeOfValuation,
                    plotSurveyNo: payload.pdfDetails.plotSurveyNo,
                    fairMarketValue: payload.pdfDetails.fairMarketValue
                } : null
            });

            // CRITICAL DEBUG: Show exact custom arrays being sent
            ("[bomflat.jsx] CUSTOM ARRAYS DETAIL:", {
                customFields: JSON.stringify(payload.customFields),
                customExtentOfSiteFields: JSON.stringify(payload.customExtentOfSiteFields),
                customFloorAreaBalconyFields: JSON.stringify(payload.customFloorAreaBalconyFields),
                customCarpetAreaFields: JSON.stringify(payload.pdfDetails?.customCarpetAreaFields),
                customBuiltUpAreaFields: JSON.stringify(payload.pdfDetails?.customBuiltUpAreaFields)
            });

            const apiResponse = await updateUbiApfForm(id, payload, username, role, clientId);
            invalidateCache("/ubi-apf");

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

            // Update property images with uploaded ones and clear file references
            const updatedPropertyImages = imagePreviews.map(img => ({
                ...img,
                file: null
            }));
            const finalPropertyImages = [
                ...updatedPropertyImages.filter(i => !i.file),
                ...uploadedPropertyImages
            ];
            setImagePreviews(finalPropertyImages);

            // Update location images with uploaded ones and clear file references
            const updatedLocationImages = locationImagePreviews.map(img => ({
                ...img,
                file: null
            }));
            const finalLocationImages = uploadedLocationImages.length > 0
                ? uploadedLocationImages
                : updatedLocationImages.filter(i => !i.file);
            setLocationImagePreviews(finalLocationImages);

            // Update documents state: replace with uploaded URLs, clear file references
            // Build a map of fileName -> uploadedDoc for quick lookup
            const uploadedDocMap = new Map();
            uploadedSupportingDocs.forEach(doc => {
                if (doc.fileName) {
                    uploadedDocMap.set(doc.fileName, doc);
                }
            });

            // Merge: use uploaded docs for new files, keep others as-is with file: null
            const finalDocuments = documentPreviews.map(doc => {
                if (uploadedDocMap.has(doc.fileName)) {
                    // Return the uploaded version with the new URL
                    return {
                        ...uploadedDocMap.get(doc.fileName),
                        file: null
                    };
                }
                // Keep existing docs, just clear file property
                return {
                    ...doc,
                    file: null
                };
            });

            setDocumentPreviews(finalDocuments);

            // Save to localStorage for persistence
            if (finalDocuments.length > 0) {
                localStorage.setItem(`ubiApf_supportingDocs_${id}`, JSON.stringify(finalDocuments));
            } else {
                localStorage.removeItem(`ubiApf_supportingDocs_${id}`);
            }

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
    }, [formData, imagePreviews, locationImagePreviews, documentPreviews, bankName, city, dsa, engineerName, role, valuation, validateForm, validatePdfDetails, user, onLogin, showError, showSuccess, dispatch, navigate, id, banks, cities]);

    const renderGeneralTab = () => (
        <div className="space-y-6">
            <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-3">Purpose of Valuation</h4>
                <div className="space-y-2">
                    <div className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Ref. No</Label>
                                <Input
                                    placeholder="e.g., REF001"
                                    value={formData.pdfDetails?.refNo || ""}
                                    onChange={(e) => handleValuationChange('refNo', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Branch</Label>
                                <Input
                                    placeholder="e.g., Main Branch"
                                    value={formData.pdfDetails?.branch || ""}
                                    onChange={(e) => handleValuationChange('branch', e.target.value)}
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
                                <Label className="text-xs font-bold text-gray-900">Date of Appointment</Label>
                                <Input
                                    type="date"
                                    placeholder="Select date"
                                    value={formData.pdfDetails?.dateOfAppointment || ""}
                                    onChange={(e) => handleValuationChange('dateOfAppointment', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Brief Description of Property</Label>
                                <Textarea
                                    placeholder="Enter brief description of the property"
                                    value={formData.pdfDetails?.briefDescriptionOfProperty || ""}
                                    onChange={(e) => handleValuationChange('briefDescriptionOfProperty', e.target.value)}
                                    disabled={!canEdit}
                                    className="text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-20"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Photocopy of documents</Label>
                                <Textarea
                                    placeholder="Enter document details"
                                    value={formData.pdfDetails?.documentsPhotocopy || ""}
                                    onChange={(e) => handleValuationChange('documentsPhotocopy', e.target.value)}
                                    disabled={!canEdit}
                                    className="text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-20"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Sanctioned Plan (Commencement)</Label>
                                <Input
                                    placeholder="e.g., Plan reference number"
                                    value={formData.pdfDetails?.sanctionedPlanStatus || ""}
                                    onChange={(e) => handleValuationChange('sanctionedPlanStatus', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Building Completion Certificate</Label>
                                <Input
                                    placeholder="e.g., Certificate number"
                                    value={formData.pdfDetails?.buildingCompletionCertificate || ""}
                                    onChange={(e) => handleValuationChange('buildingCompletionCertificate', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
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
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ maxWidth: '770px' }}>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Date of Valuation Made</Label>
                                <Input
                                    type="date"
                                    value={formData.pdfDetails?.dateOnWhichValuationIsMade || ""}
                                    onChange={(e) => handleValuationChange('dateOnWhichValuationIsMade', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Name of the owner and his / their address with Phone no.</Label>
                                <Input
                                    placeholder="Enter owner name and address"
                                    value={formData.pdfDetails?.ownerAddressJointOwners || ""}
                                    onChange={(e) => handleValuationChange('ownerAddressJointOwners', e.target.value)}
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
                            value={formData.pdfDetails?.plotNo || ""}
                            onChange={(e) => handleValuationChange('plotNo', e.target.value)}
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
                            value={formData.pdfDetails?.district || ""}
                            onChange={(e) => handleValuationChange('district', e.target.value)}
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

                </div>
            </div>

            {/* EXTENT OF THE UNIT & OCCUPANCY DETAILS + AREA CLASSIFICATION */}
            <div className="mb-6 space-y-6">
                {/* EXTENT OF THE SITE & OCCUPANCY DETAILS - TWO COLUMN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* RIGHT SIDE: Extent of the Site & Occupancy Details */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1 h-6 bg-green-500 rounded"></div>
                            <h4 className="font-bold text-lg text-gray-900">Extent of the Site & Occupancy Details</h4>
                        </div>

                        {/* TABLE 1: Plot Area & Built up area (As per Sanctioned Plan) */}
                        <div className="space-y-4 mb-6">

                            {/* PLOT AREA SECTION - TOP */}
                            <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-300">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 mb-2">PLOT AREA</p>
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="e.g., 6709.14"
                                            value={formData.pdfDetails?.plotAreaSqm || ""}
                                            onChange={(e) => handleValuationChange('plotAreaSqm', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="e.g., 72217.18"
                                            value={formData.pdfDetails?.plotAreaSqft || ""}
                                            onChange={(e) => handleValuationChange('plotAreaSqft', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-green-200 bg-white shadow-sm">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                            <th className="px-4 py-3 text-left font-bold">Floor</th>
                                            <th className="px-4 py-3 text-center font-bold">Area in Sqm.</th>
                                            <th className="px-4 py-3 text-center font-bold">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>Area in Sqft.</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const updated = formData.customExtentOfSiteFields ? [...formData.customExtentOfSiteFields] : [];
                                                            updated.push({
                                                                id: `extent_${Date.now()}_${Math.random()}`,
                                                                name: '',
                                                                sqm: '',
                                                                sqft: ''
                                                            });
                                                            ('🟢 ADD EXTENT FIELD - Before:', formData.customExtentOfSiteFields);
                                                            ('🟢 ADD EXTENT FIELD - After:', updated);
                                                            ('🟢 ADD EXTENT FIELD - Setting state with:', JSON.stringify(updated));
                                                            setFormData({ ...formData, customExtentOfSiteFields: updated });
                                                        }}
                                                        disabled={!canEdit}
                                                        className="px-1.5 py-0.5 bg-white hover:bg-gray-100 text-green-600 text-sm font-bold rounded disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                                        title="Add Custom Field"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white hover:bg-green-50 border-b border-green-100">
                                            <td className="px-4 py-3 text-gray-800 font-medium">Basement Floor</td>
                                            <td className="px-4 py-3 border-l border-green-200">
                                                <Input
                                                    placeholder="Area in Sqm."
                                                    value={formData.pdfDetails?.basementFloorAreaSqm || ""}
                                                    onChange={(e) => {
                                                        const sqmValue = e.target.value;
                                                        handleValuationChange('basementFloorAreaSqm', sqmValue);
                                                        if (sqmValue) {
                                                            const sqftValue = (parseFloat(sqmValue) * 10.764).toFixed(2);
                                                            handleValuationChange('basementFloorAreaSqft', sqftValue);
                                                        }
                                                    }}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-l border-green-200">
                                                <Input
                                                    placeholder="e.g., 5299.98"
                                                    value={formData.pdfDetails?.basementFloorAreaSqft || ""}
                                                    onChange={(e) => handleValuationChange('basementFloorAreaSqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                                />
                                            </td>
                                        </tr>
                                        <tr className="bg-white hover:bg-green-50 border-b border-green-100">
                                            <td className="px-4 py-3 text-gray-800 font-medium">Ground Floor</td>
                                            <td className="px-4 py-3 border-l border-green-200">
                                                <Input
                                                    placeholder="Area in Sqm."
                                                    value={formData.pdfDetails?.groundFloorSqm || ""}
                                                    onChange={(e) => {
                                                        const sqmValue = e.target.value;
                                                        handleValuationChange('groundFloorSqm', sqmValue);
                                                        if (sqmValue) {
                                                            const sqftValue = (parseFloat(sqmValue) * 10.764).toFixed(2);
                                                            handleValuationChange('groundFloorSqft', sqftValue);
                                                        }
                                                    }}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-l border-green-200">
                                                <Input
                                                    placeholder="e.g., 6043.66"
                                                    value={formData.pdfDetails?.groundFloorSqft || ""}
                                                    onChange={(e) => handleValuationChange('groundFloorSqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                                />
                                            </td>
                                        </tr>

                                        <tr className="bg-white hover:bg-green-50 border-b border-green-100">
                                            <td className="px-4 py-3 text-gray-800 font-medium">First Floor</td>
                                            <td className="px-4 py-3 border-l border-green-200">
                                                <Input
                                                    placeholder="Area in Sqm."
                                                    value={formData.pdfDetails?.firstFloorSqm || ""}
                                                    onChange={(e) => {
                                                        const sqmValue = e.target.value;
                                                        handleValuationChange('firstFloorSqm', sqmValue);
                                                        if (sqmValue) {
                                                            const sqftValue = (parseFloat(sqmValue) * 10.764).toFixed(2);
                                                            handleValuationChange('firstFloorSqft', sqftValue);
                                                        }
                                                    }}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-l border-green-200">
                                                <Input
                                                    placeholder="e.g., 6233.21"
                                                    value={formData.pdfDetails?.firstFloorSqft || ""}
                                                    onChange={(e) => handleValuationChange('firstFloorSqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                                />
                                            </td>
                                        </tr>

                                        {/* Custom Rows */}
                                        {formData.customExtentOfSiteFields && formData.customExtentOfSiteFields.map((field, idx) => (
                                            <tr key={field.id || idx} className="bg-white hover:bg-green-50 border-b border-green-100">
                                                <td className="px-4 py-3 border-l border-green-200">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Input
                                                            placeholder="Enter field name"
                                                            value={field.name || ""}
                                                            onChange={(e) => {
                                                                const updated = [...formData.customExtentOfSiteFields];
                                                                updated[idx].name = e.target.value;
                                                                setFormData({ ...formData, customExtentOfSiteFields: updated });
                                                            }}
                                                            disabled={!canEdit}
                                                            className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 flex-1 focus:ring-green-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const updated = formData.customExtentOfSiteFields.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, customExtentOfSiteFields: updated });
                                                            }}
                                                            disabled={!canEdit}
                                                            className="text-red-500 hover:text-red-700 disabled:text-gray-300 text-lg font-bold hover:bg-red-50 rounded p-1 transition-colors"
                                                            title="Delete field"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-l border-green-200">
                                                    <Input
                                                        placeholder="e.g., 0.00"
                                                        value={field.sqm || ""}
                                                        onChange={(e) => {
                                                            const updated = [...formData.customExtentOfSiteFields];
                                                            const sqmValue = e.target.value;
                                                            updated[idx].sqm = sqmValue;
                                                            if (sqmValue) {
                                                                const sqftValue = (parseFloat(sqmValue) * 10.764).toFixed(2);
                                                                updated[idx].sqft = sqftValue;
                                                            }
                                                            setFormData({ ...formData, customExtentOfSiteFields: updated });
                                                        }}
                                                        disabled={!canEdit}
                                                        className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-l border-green-200">
                                                    <Input
                                                        placeholder="e.g., 0.00"
                                                        value={field.sqft || ""}
                                                        onChange={(e) => {
                                                            const updated = [...formData.customExtentOfSiteFields];
                                                            updated[idx].sqft = e.target.value;
                                                            setFormData({ ...formData, customExtentOfSiteFields: updated });
                                                        }}
                                                        disabled={!canEdit}
                                                        className="h-8 text-xs rounded-lg border border-green-300 py-1 px-2 w-full focus:ring-green-200"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                        <tr className="bg-gradient-to-r from-green-200 to-emerald-100 border-b border-green-300">
                                            <td className="px-4 py-3 font-bold text-green-800">TOTAL Built up area</td>
                                            <td className="px-4 py-3 border-l border-green-300">
                                                <Input
                                                    placeholder="e.g., 3768.33"
                                                    value={(() => {
                                                        const basementSqm = parseFloat(formData.pdfDetails?.basementFloorAreaSqm) || 0;
                                                        const groundSqm = parseFloat(formData.pdfDetails?.groundFloorSqm) || 0;
                                                        const firstSqm = parseFloat(formData.pdfDetails?.firstFloorSqm) || 0;
                                                        const customSqm = formData.customExtentOfSiteFields?.reduce((sum, field) => sum + (parseFloat(field.sqm) || 0), 0) || 0;
                                                        const total = basementSqm + groundSqm + firstSqm + customSqm;
                                                        return total > 0 ? total.toFixed(2) : "";
                                                    })()}
                                                    onChange={(e) => handleValuationChange('totalBuiltUpSqm', e.target.value)}
                                                    disabled
                                                    className="h-8 text-xs rounded-lg border border-green-400 py-1 px-2 w-full focus:ring-green-300 font-semibold bg-green-50"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-l border-green-300">
                                                <Input
                                                    placeholder="e.g., 40562.34"
                                                    value={(() => {
                                                        const basementSqft = parseFloat(formData.pdfDetails?.basementFloorAreaSqft) || 0;
                                                        const groundSqft = parseFloat(formData.pdfDetails?.groundFloorSqft) || 0;
                                                        const firstSqft = parseFloat(formData.pdfDetails?.firstFloorSqft) || 0;
                                                        const customSqft = formData.customExtentOfSiteFields?.reduce((sum, field) => sum + (parseFloat(field.sqft) || 0), 0) || 0;
                                                        const total = basementSqft + groundSqft + firstSqft + customSqft;
                                                        return total > 0 ? total.toFixed(2) : "";
                                                    })()}
                                                    onChange={(e) => handleValuationChange('totalBuiltUpSqft', e.target.value)}
                                                    disabled
                                                    className="h-8 text-xs rounded-lg border border-green-400 py-1 px-2 w-full focus:ring-green-300 font-semibold bg-green-50"
                                                />
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* LEFT SIDE: Floor Area including Balcony & Terrace */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1 h-6 bg-blue-500 rounded"></div>
                            <h4 className="font-bold text-lg text-gray-900">Floor Area including Balcony & Terrace</h4>
                        </div>

                        {/* TABLE 2: Floor Area including Balcony & Terrace */}
                        <div className="space-y-4">
                            <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white shadow-sm">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                            <th className="px-4 py-3 text-left font-bold">Floor Area including Balcony & Terrace</th>
                                            <th className="px-4 py-3 text-center font-bold">Sqm.</th>
                                            <th className="px-4 py-3 text-center font-bold">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>Sqft.</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const updated = formData.customFloorAreaBalconyFields ? [...formData.customFloorAreaBalconyFields] : [];
                                                            updated.push({
                                                                id: `balcony_${Date.now()}_${Math.random()}`,
                                                                name: '',
                                                                sqm: '',
                                                                sqft: ''
                                                            });
                                                            ('🔵 ADD BALCONY FIELD - Before:', formData.customFloorAreaBalconyFields);
                                                            ('🔵 ADD BALCONY FIELD - After:', updated);
                                                            ('🔵 ADD BALCONY FIELD - Setting state with:', JSON.stringify(updated));
                                                            setFormData({ ...formData, customFloorAreaBalconyFields: updated });
                                                        }}
                                                        disabled={!canEdit}
                                                        className="px-1.5 py-0.5 bg-white hover:bg-gray-100 text-blue-600 text-sm font-bold rounded disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                                        title="Add Custom Field"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white hover:bg-blue-50 border-b border-blue-100">
                                            <td className="px-4 py-3 text-gray-800 font-medium">Basement Floor</td>
                                            <td className="px-4 py-3 border-l border-blue-200">
                                                <Input
                                                    placeholder="e.g., 492.38"
                                                    value={formData.pdfDetails?.basementFloorBalconySqm || ""}
                                                    onChange={(e) => handleValuationChange('basementFloorBalconySqm', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 w-full focus:ring-blue-200"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-l border-blue-200">
                                                <Input
                                                    placeholder="e.g., 5300.00"
                                                    value={formData.pdfDetails?.basementFloorBalconySqft || ""}
                                                    onChange={(e) => handleValuationChange('basementFloorBalconySqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 w-full focus:ring-blue-200"
                                                />
                                            </td>
                                        </tr>
                                        <tr className="bg-white hover:bg-blue-50 border-b border-blue-100">
                                            <td className="px-4 py-3 text-gray-800 font-medium">Ground Floor</td>
                                            <td className="px-4 py-3 border-l border-blue-200">
                                                <Input
                                                    placeholder="e.g., 539.86"
                                                    value={formData.pdfDetails?.groundFloorBalconySqm || ""}
                                                    onChange={(e) => handleValuationChange('groundFloorBalconySqm', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 w-full focus:ring-blue-200"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-l border-blue-200">
                                                <Input
                                                    placeholder="e.g., 5811.00"
                                                    value={formData.pdfDetails?.groundFloorBalconySqft || ""}
                                                    onChange={(e) => handleValuationChange('groundFloorBalconySqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 w-full focus:ring-blue-200"
                                                />
                                            </td>
                                        </tr>
                                        <tr className="bg-white hover:bg-blue-50 border-b border-blue-100">
                                            <td className="px-4 py-3 text-gray-800 font-medium">First Floor</td>
                                            <td className="px-4 py-3 border-l border-blue-200">
                                                <Input
                                                    placeholder="e.g., 655.98"
                                                    value={formData.pdfDetails?.firstFloorBalconySqm || ""}
                                                    onChange={(e) => handleValuationChange('firstFloorBalconySqm', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 w-full focus:ring-blue-200"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-l border-blue-200">
                                                <Input
                                                    placeholder="e.g., 7061.00"
                                                    value={formData.pdfDetails?.firstFloorBalconySqft || ""}
                                                    onChange={(e) => handleValuationChange('firstFloorBalconySqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 w-full focus:ring-blue-200"
                                                />
                                            </td>
                                        </tr>

                                        {/* Custom Rows */}
                                        {formData.customFloorAreaBalconyFields && formData.customFloorAreaBalconyFields.map((field, idx) => (
                                            <tr key={field.id || idx} className="bg-white hover:bg-blue-50 border-b border-blue-100">
                                                <td className="px-4 py-3 border-l border-blue-200">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Input
                                                            placeholder="Enter field name"
                                                            value={field.name || ""}
                                                            onChange={(e) => {
                                                                const updated = [...formData.customFloorAreaBalconyFields];
                                                                updated[idx].name = e.target.value;
                                                                setFormData({ ...formData, customFloorAreaBalconyFields: updated });
                                                            }}
                                                            disabled={!canEdit}
                                                            className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 flex-1 focus:ring-blue-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const updated = formData.customFloorAreaBalconyFields.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, customFloorAreaBalconyFields: updated });
                                                            }}
                                                            disabled={!canEdit}
                                                            className="text-red-500 hover:text-red-700 disabled:text-gray-300 text-lg font-bold hover:bg-red-50 rounded p-1 transition-colors"
                                                            title="Delete field"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-l border-blue-200">
                                                    <Input
                                                        placeholder="e.g., 0.00"
                                                        value={field.sqm || ""}
                                                        onChange={(e) => {
                                                            const sqmValue = parseFloat(e.target.value) || 0;
                                                            const sqftValue = (sqmValue * 10.764).toFixed(2);
                                                            const updated = [...formData.customFloorAreaBalconyFields];
                                                            updated[idx].sqm = e.target.value;
                                                            updated[idx].sqft = sqftValue;
                                                            setFormData({ ...formData, customFloorAreaBalconyFields: updated });
                                                        }}
                                                        disabled={!canEdit}
                                                        className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 w-full focus:ring-blue-200"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-l border-blue-200">
                                                    <Input
                                                        placeholder="e.g., 0.00"
                                                        value={field.sqft || ""}
                                                        onChange={(e) => {
                                                            const updated = [...formData.customFloorAreaBalconyFields];
                                                            updated[idx].sqft = e.target.value;
                                                            setFormData({ ...formData, customFloorAreaBalconyFields: updated });
                                                        }}
                                                        disabled={!canEdit}
                                                        className="h-8 text-xs rounded-lg border border-blue-300 py-1 px-2 w-full focus:ring-blue-200"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                        <tr className="bg-gradient-to-r from-blue-200 to-cyan-100 border-b border-blue-300">
                                            <td className="px-4 py-3 font-bold text-blue-800">TOTAL AREA</td>
                                            <td className="px-4 py-3 border-l border-blue-300">
                                                <Input
                                                    placeholder="e.g., 6008.82"
                                                    value={(() => {
                                                        const total = (
                                                            (parseFloat(formData.pdfDetails?.basementFloorBalconySqm) || 0) +
                                                            (parseFloat(formData.pdfDetails?.groundFloorBalconySqm) || 0) +
                                                            (parseFloat(formData.pdfDetails?.firstFloorBalconySqm) || 0) +
                                                            (formData.customFloorAreaBalconyFields?.reduce((sum, field) => sum + (parseFloat(field.sqm) || 0), 0) || 0)
                                                        ).toFixed(2);
                                                        return total;
                                                    })()}
                                                    onChange={(e) => handleValuationChange('totalFloorAreaBalconySqm', e.target.value)}
                                                    disabled={true}
                                                    className="h-8 text-xs rounded-lg border border-blue-400 py-1 px-2 w-full focus:ring-blue-300 font-semibold bg-gray-100"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-l border-blue-300">
                                                <Input
                                                    placeholder="e.g., 64679.00"
                                                    value={(() => {
                                                        const total = (
                                                            (parseFloat(formData.pdfDetails?.basementFloorBalconySqft) || 0) +
                                                            (parseFloat(formData.pdfDetails?.groundFloorBalconySqft) || 0) +
                                                            (parseFloat(formData.pdfDetails?.firstFloorBalconySqft) || 0) +
                                                            (formData.customFloorAreaBalconyFields?.reduce((sum, field) => sum + (parseFloat(field.sqft) || 0), 0) || 0)
                                                        ).toFixed(2);
                                                        return total;
                                                    })()}
                                                    onChange={(e) => handleValuationChange('totalFloorAreaBalconySqft', e.target.value)}
                                                    disabled={true}
                                                    className="h-8 text-xs rounded-lg border border-blue-400 py-1 px-2 w-full focus:ring-blue-300 font-semibold bg-gray-100"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>

                {/* OCCUPANCY DETAILS & AREA CLASSIFICATION */}
                <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-6 bg-teal-500 rounded"></div>
                        <h4 className="font-bold text-lg text-gray-900">Occupancy Details & Area Classification</h4>
                    </div>

                    {/* Occupancy Details Section */}
                    <div className="mb-6 p-4 bg-white rounded-xl border border-teal-200">
                        <h5 className="font-bold text-gray-900 mb-3 text-sm">Occupancy Details & Coordinates</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">Latitude/Longitude</Label>
                                <Input
                                    placeholder="e.g., 19°07'53.2 N & 73°00"
                                    value={formData.pdfDetails?.latitudeLongitude || ""}
                                    onChange={(e) => handleValuationChange('latitudeLongitude', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-2 focus:ring-teal-200 w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">Extent of Site for Valuation</Label>
                                <Input
                                    placeholder="e.g., Area in Sq. ft."
                                    value={formData.pdfDetails?.extentOfSiteValuation || ""}
                                    onChange={(e) => handleValuationChange('extentOfSiteValuation', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-2 focus:ring-teal-200 w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">Occupancy & Rent</Label>
                                <Input
                                    placeholder="Owner/Tenant & Rent Amount"
                                    value={formData.pdfDetails?.rentReceivedPerMonth || ""}
                                    onChange={(e) => handleValuationChange('rentReceivedPerMonth', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-2 focus:ring-teal-200 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Area Classification Section */}
                    <div className="mb-6 p-4 bg-white rounded-xl border border-teal-200">
                        <h5 className="font-bold text-gray-900 mb-3 text-sm">Area Classification</h5>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">High / Middle / Poor</Label>
                                <select
                                    value={formData.pdfDetails?.areaClassification || ""}
                                    onChange={(e) => handleValuationChange('areaClassification', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-3 bg-white hover:border-teal-400 focus:ring-teal-200 w-full"
                                >
                                    <option value="">Select</option>
                                    <option value="High">High</option>
                                    <option value="Middle">Middle</option>
                                    <option value="Poor">Poor</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">Urban Classification</Label>
                                <select
                                    value={formData.pdfDetails?.urbanClassification || ""}
                                    onChange={(e) => handleValuationChange('urbanClassification', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-3 bg-white hover:border-teal-400 focus:ring-teal-200 w-full"
                                >
                                    <option value="">Select</option>
                                    <option value="Metro">Metro</option>
                                    <option value="Urban">Urban</option>
                                    <option value="Semi-Urban">Semi-Urban</option>
                                    <option value="Rural">Rural</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">Government Type / Coming Under</Label>
                                <select
                                    value={formData.pdfDetails?.governmentType || ""}
                                    onChange={(e) => handleValuationChange('governmentType', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-3 bg-white w-full"
                                >
                                    <option value="">Select Type</option>
                                    <option value="Municipal">Municipality</option>
                                    <option value="Corporation">Corporation</option>
                                    <option value="Government">Government</option>
                                    <option value="Village Panchayat">Village Panchayat</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">Covered Under Govt. Enactments</Label>
                                <select
                                    value={formData.pdfDetails?.govtEnactmentsCovered || ""}
                                    onChange={(e) => handleValuationChange('govtEnactmentsCovered', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-3 bg-white w-full"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Dimensions of the Unit */}
                    <div className="p-4 bg-white rounded-xl border border-teal-200">
                        <h5 className="font-bold text-gray-900 mb-3 text-sm">Dimensions of the Unit</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">Dimensions (as per Document)</Label>
                                <Input
                                    placeholder="e.g., 28.88 Sq. ft. / 2.88 Sq. ft."
                                    value={formData.pdfDetails?.dimensionsDeed || ""}
                                    onChange={(e) => handleValuationChange('dimensionsDeed', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-2 focus:ring-teal-200 w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-800">Dimensions (as per Actuals)</Label>
                                <Input
                                    placeholder="e.g., 28.88 Sq. ft. / 2.88 Sq. ft."
                                    value={formData.pdfDetails?.dimensionsActual || ""}
                                    onChange={(e) => handleValuationChange('dimensionsActual', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-teal-300 py-1 px-2 focus:ring-teal-200 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* APARTMENT BUILDING DETAILS - Section II */}
                <div className="mb-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-6 bg-amber-500 rounded"></div>
                        <h4 className="font-bold text-lg text-gray-900">II. Apartment Building Details</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* SELECT FIELDS FIRST */}

                            {/* 2. Development of Surrounding Areas */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">1. Development of surrounding areas</Label>
                                <select
                                    value={formData.pdfDetails?.developmentOfSurroundingAreas || ""}
                                    onChange={(e) => handleValuationChange('developmentOfSurroundingAreas', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Developed">Developed</option>
                                    <option value="Under Development">Under Development</option>
                                    <option value="Semi-developed">Semi-developed</option>
                                </select>
                            </div>

                            {/* 3. Possibility of Frequent Flooding / Sub-merging */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">2. Possibility of frequent flooding / sub-merging</Label>
                                <select
                                    value={formData.pdfDetails?.possibilityOfFrequentFlooding || ""}
                                    onChange={(e) => handleValuationChange('possibilityOfFrequentFlooding', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No.">No.</option>
                                </select>
                            </div>

                            {/* 5. Level of Land with Topographical Conditions */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">3. Level of land with topographical conditions</Label>
                                <select
                                    value={formData.pdfDetails?.levelOfLandWithTopographicalConditions || ""}
                                    onChange={(e) => handleValuationChange('levelOfLandWithTopographicalConditions', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Plain Topography">Plain Topography</option>
                                    <option value="Sloped">Sloped</option>
                                    <option value="Hilly">Hilly</option>
                                </select>
                            </div>

                            {/* 6. Shape of Land */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">4. Shape of land</Label>
                                <select
                                    value={formData.pdfDetails?.shapeOfLand || ""}
                                    onChange={(e) => handleValuationChange('shapeOfLand', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Rectangular">Rectangular</option>
                                    <option value="Square">Square</option>
                                    <option value="Irregular">Irregular</option>
                                    <option value="L-Shaped">L-Shaped</option>
                                </select>
                            </div>

                            {/* 7. Type of Use to which it can be put */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">5. Type of use to which it can be put</Label>
                                <select
                                    value={formData.pdfDetails?.typeOfUseToWhichItCanBePut || ""}
                                    onChange={(e) => handleValuationChange('typeOfUseToWhichItCanBePut', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Commercial purpose">Commercial purpose</option>
                                    <option value="Residential purpose">Residential purpose</option>
                                    <option value="Mixed purpose">Mixed purpose</option>
                                </select>
                            </div>

                            {/* 8. Any Usage Restriction */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">6. Any usage restriction</Label>
                                <select
                                    value={formData.pdfDetails?.anyUsageRestriction || ""}
                                    onChange={(e) => handleValuationChange('anyUsageRestriction', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Residential">Residential</option>
                                    <option value="No restriction">No restriction</option>
                                </select>
                            </div>

                            {/* 9. Is plot in town planning approved layout? */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">7. Is plot in town planning approved layout?</Label>
                                <select
                                    value={formData.pdfDetails?.isPlotInTownPlanningApprovedLayout || ""}
                                    onChange={(e) => handleValuationChange('isPlotInTownPlanningApprovedLayout', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>

                            {/* 10. Corner plot or Intermittent plot? */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">8. Corner plot or Intermittent plot?</Label>
                                <select
                                    value={formData.pdfDetails?.cornerPlotOrIntermittentPlot || ""}
                                    onChange={(e) => handleValuationChange('cornerPlotOrIntermittentPlot', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Corner Plot">Corner Plot</option>
                                    <option value="Intermittent Plot">Intermittent Plot</option>
                                    <option value="Neither">Neither</option>
                                </select>
                            </div>

                            {/* 11. Road Facilities */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">9. Road facilities</Label>
                                <select
                                    value={formData.pdfDetails?.roadFacilities || ""}
                                    onChange={(e) => handleValuationChange('roadFacilities', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes, Available">Yes, Available</option>
                                    <option value="Not Available">Not Available</option>
                                </select>
                            </div>

                            {/* 12. Type of Road Available at Present */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">10. Type of road available at present</Label>
                                <select
                                    value={formData.pdfDetails?.typeOfRoadAvailableAtPresent || ""}
                                    onChange={(e) => handleValuationChange('typeOfRoadAvailableAtPresent', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Asphalt">Asphalt</option>
                                    <option value="Concrete">Concrete</option>
                                    <option value="Mud">Mud</option>
                                </select>
                            </div>

                            {/* 14. Is it a Land - locked land? */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">11. Is it a land - locked land?</Label>
                                <select
                                    value={formData.pdfDetails?.isItALandLockedLand || ""}
                                    onChange={(e) => handleValuationChange('isItALandLockedLand', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No.">No.</option>
                                </select>
                            </div>

                            {/* 15. Water Potentiality */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">12. Water potentiality</Label>
                                <select
                                    value={formData.pdfDetails?.waterPotentiality || ""}
                                    onChange={(e) => handleValuationChange('waterPotentiality', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>

                            {/* 17. Is Power Supply Available at the Site? */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">13. Is power supply available at the site?</Label>
                                <select
                                    value={formData.pdfDetails?.isPowerSupplyAvailableAtSite || ""}
                                    onChange={(e) => handleValuationChange('isPowerSupplyAvailableAtSite', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>

                            {/* INPUT & TEXTAREA FIELDS AFTER */}

                            {/* 1. Classification of Locality */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">14. Classification of locality</Label>
                                <Input
                                    placeholder="e.g., Commercial & residential area"
                                    value={formData.pdfDetails?.classificationOfLocality || ""}
                                    onChange={(e) => handleValuationChange('classificationOfLocality', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                />
                            </div>

                            {/* 4. Feasibility to the Civic amenities */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">15. Feasibility to the Civic amenities </Label>
                                <Input
                                    placeholder="e.g., Approx. 1-2 kms"
                                    value={formData.pdfDetails?.feasibilityToCivicAmenities || ""}
                                    onChange={(e) => handleValuationChange('feasibilityToCivicAmenities', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                />
                            </div>

                            {/* 13. Width of Road */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">16. Width of road – is it below 20 ft. or more than 20 ft.</Label>
                                <Input
                                    placeholder="e.g., More than 20 Feet wide road"
                                    value={formData.pdfDetails?.widthOfRoad || ""}
                                    onChange={(e) => handleValuationChange('widthOfRoad', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                />
                            </div>

                            {/* 16. Underground Sewerage System */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">17. Underground sewerage system</Label>
                                <Input
                                    placeholder="e.g., Under Ground Sewerage system not available. Proposed ETP Plant as per MPCB Norms."
                                    value={formData.pdfDetails?.undergroundSewerageSystem || ""}
                                    onChange={(e) => handleValuationChange('undergroundSewerageSystem', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white"
                                />
                            </div>

                            {/* 18. Advantage of the Site */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">18. Advantage of the site</Label>
                                <textarea
                                    placeholder="e.g., Proposed three star Hotel with 48 rooms..."
                                    value={formData.pdfDetails?.advantageOfSite || ""}
                                    onChange={(e) => handleValuationChange('advantageOfSite', e.target.value)}
                                    disabled={!canEdit}
                                    rows="3"
                                    className="text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white w-full"
                                />
                            </div>

                            {/* 19. Special Remarks */}
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">19. Special remarks, if any, like threat of acquisition of land for public service purposes, road widening or applicability of CRZ provisions etc.</Label>
                                <textarea
                                    placeholder="e.g., Not Applicable"
                                    value={formData.pdfDetails?.specialRemarksIfAnyThreatOfAcquisition || ""}
                                    onChange={(e) => handleValuationChange('specialRemarksIfAnyThreatOfAcquisition', e.target.value)}
                                    disabled={!canEdit}
                                    rows="3"
                                    className="text-xs rounded-lg border border-amber-300 py-1 px-2 bg-white w-full"
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

        return (
            <div className="space-y-6">
                {/* PART A: VALUATION OF LAND */}
                <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    <h4 className="font-bold text-gray-900 mb-4">Part - A (Valuation of Land)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">1. Size of land North & South (East & West)</Label>
                            <Input
                                placeholder="North & South & East & West"
                                value={formData.pdfDetails?.sizeOfLandNorthSouth || ""}
                                onChange={(e) => handleValuationChange('sizeOfLandNorthSouth', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">2. Total extent of the land</Label>
                            <Input
                                placeholder="e.g., 6709.14 Sq.m"
                                value={formData.pdfDetails?.totalExtentOfLandSqm || ""}
                                onChange={(e) => handleValuationChange('totalExtentOfLandSqm', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">3. Prevailing market rate (per acre)</Label>
                            <Input
                                placeholder="Details / reference of latest deals"
                                value={formData.pdfDetails?.prevailingMarketRatePerAcre || ""}
                                onChange={(e) => handleValuationChange('prevailingMarketRatePerAcre', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">4. Guideline rate (from Registrar's/Mandal office)</Label>
                            <Input
                                placeholder="e.g., ₹ 3260/- per Sq. m."
                                value={formData.pdfDetails?.guidelineRate || ""}
                                onChange={(e) => handleValuationChange('guidelineRate', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">5. Assessed / adopted rate for valuation</Label>
                            <Input
                                placeholder="e.g., ₹ 500/- per Sqft."
                                value={formData.pdfDetails?.assessedAdoptedRate || ""}
                                onChange={(e) => handleValuationChange('assessedAdoptedRate', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">6. Estimated value of land</Label>
                            <Input
                                placeholder="= Plot area X Market rate"
                                value={formData.pdfDetails?.estimatedValueOfLand || ""}
                                onChange={(e) => handleValuationChange('estimatedValueOfLand', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                    </div>
                </div>

                {/* CARPET AREA, COST OF CONSTRUCTION, AND RATE OF BUILT-UP AREA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* CARPET AREA (AS PER MEASUREMENT) */}
                    <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-900 text-sm">Carpet Area (As per Measurement) - Carpet Area Floor-wise</h4>
                            <button
                                type="button"
                                onClick={handleAddCarpetAreaFloor}
                                disabled={!canEdit}
                                className="flex items-center gap-2 px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs"
                            >
                                <span>+</span> Add
                            </button>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr className="bg-teal-100 border border-teal-300">
                                        <th className="border border-teal-300 p-2 text-left font-bold text-gray-900 w-1/4">Floor</th>
                                        <th className="border border-teal-300 p-2 text-left font-bold text-gray-900 w-1/4">Sqm.</th>
                                        <th className="border border-teal-300 p-2 text-left font-bold text-gray-900 w-1/4">Sqft.</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    <tr className="border border-teal-300">
                                        <td className="border border-teal-300 p-2">Basement Floor</td>
                                        <td className="border border-teal-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.basementFloorSqm || ""} onChange={(e) => handleValuationChange('basementFloorSqm', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-teal-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.basementFloorSqft || ""} onChange={(e) => handleValuationChange('basementFloorSqft', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full" /></td>
                                    </tr>
                                    <tr className="border border-teal-300">
                                        <td className="border border-teal-300 p-2">Ground Floor</td>
                                        <td className="border border-teal-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.groundFloorSqm || ""} onChange={(e) => handleValuationChange('groundFloorSqm', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-teal-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.groundFloorSqft || ""} onChange={(e) => handleValuationChange('groundFloorSqft', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full" /></td>
                                    </tr>

                                    <tr className="border border-teal-300">
                                        <td className="border border-teal-300 p-2">First Floor</td>
                                        <td className="border border-teal-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.firstFloorSqm || ""} onChange={(e) => handleValuationChange('firstFloorSqm', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-teal-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.firstFloorSqft || ""} onChange={(e) => handleValuationChange('firstFloorSqft', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full" /></td>
                                    </tr>

                                    {/* Dynamic Custom Carpet Area Floors */}
                                    {formData.pdfDetails?.customCarpetAreaFields?.map((floor) => (
                                        <tr key={floor.id} className="border border-teal-300 bg-teal-50">
                                            <td className="border border-teal-300 p-2">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Floor name"
                                                        value={floor.floorName || ""}
                                                        onChange={(e) => handleUpdateCarpetAreaFloor(floor.id, 'floorName', e.target.value)}
                                                        disabled={!canEdit}
                                                        className="h-7 text-xs rounded border border-teal-300 py-1 px-2 flex-1"
                                                    />
                                                    {canEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCarpetAreaFloor(floor.id)}
                                                            disabled={!canEdit}
                                                            className="text-red-500 hover:text-red-700 disabled:opacity-50 flex-shrink-0 font-bold text-sm"
                                                            title="Remove floor"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-teal-300 p-2">
                                                <Input
                                                    placeholder="0"
                                                    value={floor.sqm || ""}
                                                    onChange={(e) => handleUpdateCarpetAreaFloor(floor.id, 'sqm', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full"
                                                />
                                            </td>
                                            <td className="border border-teal-300 p-2">
                                                <Input
                                                    placeholder="0"
                                                    value={floor.sqft || ""}
                                                    onChange={(e) => handleUpdateCarpetAreaFloor(floor.id, 'sqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full"
                                                />
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="border border-teal-300 bg-teal-100 font-bold">
                                        <td className="border border-teal-300 p-2">TOTAL AREA </td>
                                        <td className="border border-teal-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.totalAreaSqm || ""} onChange={(e) => handleValuationChange('totalAreaSqm', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-teal-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.totalAreaSqft || ""} onChange={(e) => handleValuationChange('totalAreaSqft', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-teal-300 py-1 px-2 w-full" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* COST OF CONSTRUCTION OF AS PER ACTUAL MEASUREMENT */}
                    <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-900 text-sm">Cost of Construction of As Per Actual Measurement</h4>
                            <button
                                type="button"
                                onClick={handleAddCostOfConstructionFloor}
                                disabled={!canEdit}
                                className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs"
                            >
                                <span>+</span> Add
                            </button>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr className="bg-orange-100 border border-orange-300">
                                        <th className="border border-orange-300 p-2 text-left font-bold text-gray-900">Slab Area</th>
                                        <th className="border border-orange-300 p-2 text-left font-bold text-gray-900">Sqft.</th>
                                        <th className="border border-orange-300 p-2 text-left font-bold text-gray-900">Rate Per Sqft.</th>
                                        <th className="border border-orange-300 p-2 text-left font-bold text-gray-900">Value of Constr.</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    {/* Basement Floor */}
                                    <tr className="border border-orange-300">
                                        <td className="border border-orange-300 p-2">Basement Floor</td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.basementFloorCostSqft || ""} onChange={(e) => handleValuationChange('basementFloorCostSqft', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.basementFloorCostRate || ""} onChange={(e) => handleValuationChange('basementFloorCostRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.basementFloorCostValue || ""} disabled className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full bg-orange-50 font-semibold" /></td>
                                    </tr>

                                    {/* Ground Floor */}
                                    <tr className="border border-orange-300">
                                        <td className="border border-orange-300 p-2">Ground Floor</td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.groundFloorCostSqft || ""} onChange={(e) => handleValuationChange('groundFloorCostSqft', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.groundFloorCostRate || ""} onChange={(e) => handleValuationChange('groundFloorCostRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.groundFloorCostValue || ""} disabled className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full bg-orange-50 font-semibold" /></td>
                                    </tr>

                                    {/* First Floor */}
                                    <tr className="border border-orange-300">
                                        <td className="border border-orange-300 p-2">First Floor</td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.firstFloorCostSqft || ""} onChange={(e) => handleValuationChange('firstFloorCostSqft', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.firstFloorCostRate || ""} onChange={(e) => handleValuationChange('firstFloorCostRate', e.target.value)} disabled={!canEdit} className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full" /></td>
                                        <td className="border border-orange-300 p-2"><Input placeholder="0" value={formData.pdfDetails?.firstFloorCostValue || ""} disabled className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full bg-orange-50 font-semibold" /></td>
                                    </tr>

                                    {/* Dynamic Custom Cost of Construction Floors */}
                                    {formData.pdfDetails?.customCostOfConstructionFields?.map((floor) => (
                                        <tr key={floor.id} className="border border-orange-300 bg-orange-50">
                                            <td className="border border-orange-300 p-2">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Slab area name"
                                                        value={floor.slabArea || ""}
                                                        onChange={(e) => handleUpdateCostOfConstructionFloor(floor.id, 'slabArea', e.target.value)}
                                                        disabled={!canEdit}
                                                        className="h-7 text-xs rounded border border-orange-300 py-1 px-2 flex-1"
                                                    />
                                                    {canEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCostOfConstructionFloor(floor.id)}
                                                            disabled={!canEdit}
                                                            className="text-red-500 hover:text-red-700 disabled:opacity-50 flex-shrink-0 font-bold text-sm"
                                                            title="Remove floor"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-orange-300 p-2">
                                                <Input
                                                    placeholder="0"
                                                    value={floor.sqft || ""}
                                                    onChange={(e) => handleUpdateCostOfConstructionFloor(floor.id, 'sqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full"
                                                />
                                            </td>
                                            <td className="border border-orange-300 p-2">
                                                <Input
                                                    placeholder="0"
                                                    value={floor.rate || ""}
                                                    onChange={(e) => handleUpdateCostOfConstructionFloor(floor.id, 'rate', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full"
                                                />
                                            </td>
                                            <td className="border border-orange-300 p-2">
                                                <Input
                                                    placeholder="0"
                                                    value={floor.value || ""}
                                                    onChange={(e) => handleUpdateCostOfConstructionFloor(floor.id, 'value', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full"
                                                />
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="border border-orange-300 bg-orange-100 font-bold">
                                        <td className="border border-orange-300 p-2">TOTAL AREA</td>
                                        <td className="border border-orange-300 p-2">
                                            <Input
                                                placeholder="0"
                                                value={
                                                    (
                                                        (parseFloat(formData.pdfDetails?.basementFloorCostSqft) || 0) +
                                                        (parseFloat(formData.pdfDetails?.groundFloorCostSqft) || 0) +
                                                        (parseFloat(formData.pdfDetails?.firstFloorCostSqft) || 0) +
                                                        (formData.pdfDetails?.customCostOfConstructionFields?.reduce((sum, floor) => {
                                                            return sum + (parseFloat(floor.sqft) || 0);
                                                        }, 0) || 0)
                                                    ).toFixed(2)
                                                }
                                                disabled
                                                className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full bg-orange-100 font-bold"
                                            />
                                        </td>
                                        <td className="border border-orange-300 p-2"></td>
                                        <td className="border border-orange-300 p-2">
                                            <Input
                                                placeholder="0"
                                                value={
                                                    (
                                                        (parseFloat(formData.pdfDetails?.basementFloorCostValue) || 0) +
                                                        (parseFloat(formData.pdfDetails?.groundFloorCostValue) || 0) +
                                                        (parseFloat(formData.pdfDetails?.firstFloorCostValue) || 0) +
                                                        (formData.pdfDetails?.customCostOfConstructionFields?.reduce((sum, floor) => {
                                                            return sum + (parseFloat(floor.value) || 0);
                                                        }, 0) || 0)
                                                    ).toFixed(2)
                                                }
                                                disabled
                                                className="h-7 text-xs rounded border border-orange-300 py-1 px-2 w-full bg-orange-100 font-bold"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RATE OF BUILT-UP AREA */}
                    <div className="p-6 bg-lime-50 rounded-2xl border border-lime-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-900 text-sm">Rate of Built-up Area</h4>
                            <button
                                type="button"
                                onClick={handleAddBuiltUpAreaFloor}
                                disabled={!canEdit}
                                className="flex items-center gap-2 px-3 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs"
                            >
                                <span>+</span> Add
                            </button>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr className="bg-lime-100 border border-lime-300">
                                        <th className="border border-lime-300 p-2 text-left font-bold text-gray-900">Floor Name</th>
                                        <th className="border border-lime-300 p-2 text-left font-bold text-gray-900">Sqft.</th>
                                        <th className="border border-lime-300 p-2 text-left font-bold text-gray-900">Rate</th>
                                        <th className="border border-lime-300 p-2 text-left font-bold text-gray-900">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    <tr className="border border-lime-300">
                                        <td className="border border-lime-300 p-2 font-semibold">Ground Floor</td>
                                        <td className="border border-lime-300 p-2"><Input type="number" placeholder="0" value={formData.pdfDetails?.groundFloorBuiltUpSqft || ""} onChange={(e) => handleValuationChange('groundFloorBuiltUpSqft', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full" /></td>
                                        <td className="border border-lime-300 p-2"><Input type="number" placeholder="0" value={formData.pdfDetails?.groundFloorRateConstruction || ""} onChange={(e) => handleValuationChange('groundFloorRateConstruction', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full" /></td>
                                        <td className="border border-lime-300 p-2"><Input type="number" placeholder="0" value={formData.pdfDetails?.groundFloorValueConstruction || ""} onChange={(e) => handleValuationChange('groundFloorValueConstruction', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full" /></td>
                                    </tr>
                                    <tr className="border border-lime-300">
                                        <td className="border border-lime-300 p-2 font-semibold">First Floor</td>
                                        <td className="border border-lime-300 p-2"><Input type="number" placeholder="0" value={formData.pdfDetails?.firstFloorBuiltUpSqft || ""} onChange={(e) => handleValuationChange('firstFloorBuiltUpSqft', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full" /></td>
                                        <td className="border border-lime-300 p-2"><Input type="number" placeholder="0" value={formData.pdfDetails?.firstFloorRateConstruction || ""} onChange={(e) => handleValuationChange('firstFloorRateConstruction', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full" /></td>
                                        <td className="border border-lime-300 p-2"><Input type="number" placeholder="0" value={formData.pdfDetails?.firstFloorValueConstruction || ""} onChange={(e) => handleValuationChange('firstFloorValueConstruction', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full" /></td>
                                    </tr>

                                    {/* Dynamic Custom Built-up Area Floors */}
                                    {formData.pdfDetails?.customBuiltUpAreaFields?.map((floor) => (
                                        <tr key={floor.id} className="border border-lime-300 bg-lime-50">
                                            <td className="border border-lime-300 p-2">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Floor name"
                                                        value={floor.floorName || ""}
                                                        onChange={(e) => handleUpdateBuiltUpAreaFloor(floor.id, 'floorName', e.target.value)}
                                                        disabled={!canEdit}
                                                        className="h-6 text-xs rounded border border-lime-300 py-0 px-1 flex-1"
                                                    />
                                                    {canEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBuiltUpAreaFloor(floor.id)}
                                                            disabled={!canEdit}
                                                            className="text-red-500 hover:text-red-700 disabled:opacity-50 flex-shrink-0 font-bold text-sm"
                                                            title="Remove floor"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-lime-300 p-2">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={floor.sqft || ""}
                                                    onChange={(e) => handleUpdateBuiltUpAreaFloor(floor.id, 'sqft', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full"
                                                />
                                            </td>
                                            <td className="border border-lime-300 p-2">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={floor.rateConstruction || ""}
                                                    onChange={(e) => handleUpdateBuiltUpAreaFloor(floor.id, 'rateConstruction', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full"
                                                />
                                            </td>
                                            <td className="border border-lime-300 p-2">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={floor.valueConstruction || ""}
                                                    onChange={(e) => handleUpdateBuiltUpAreaFloor(floor.id, 'valueConstruction', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full"
                                                />
                                            </td>
                                        </tr>
                                    ))}

                                    {/* TOTAL ROW */}
                                    <tr className="border border-lime-300 bg-lime-100 font-bold">
                                        <td className="border border-lime-300 p-2">TOTAL VALUE OF CONSTRUCTION</td>
                                        <td className="border border-lime-300 p-2"></td>
                                        <td className="border border-lime-300 p-2"></td>
                                        <td className="border border-lime-300 p-2">
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={
                                                    (
                                                        (parseFloat(formData.pdfDetails?.groundFloorValueConstruction) || 0) +
                                                        (parseFloat(formData.pdfDetails?.firstFloorValueConstruction) || 0) +
                                                        (formData.pdfDetails?.customBuiltUpAreaFields?.reduce((sum, floor) => {
                                                            return sum + (parseFloat(floor.valueConstruction) || 0);
                                                        }, 0) || 0)
                                                    ).toFixed(2)
                                                }
                                                disabled
                                                className="h-6 text-xs rounded border border-lime-300 py-0 px-1 w-full bg-lime-100 font-bold"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* PART B: VALUATION OF BUILDING */}
                <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-gray-900 mb-4">Part - B (Valuation of Building)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">1. Type of Building (Residential/Commercial/Industrial)</Label>
                            <Input
                                placeholder="e.g., Commercial Hotel Building"
                                value={formData.pdfDetails?.buildingType || ""}
                                onChange={(e) => handleValuationChange('buildingType', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">2. Type of Construction (Load bearing/RCC/Steel Framed)</Label>
                            <Input
                                placeholder="e.g., RCC framed Structure"
                                value={formData.pdfDetails?.typeOfConstruction || ""}
                                onChange={(e) => handleValuationChange('typeOfConstruction', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">3. Year of Construction</Label>
                            <Input
                                placeholder="e.g., 2016-2025"
                                value={formData.pdfDetails?.yearOfConstruction || ""}
                                onChange={(e) => handleValuationChange('yearOfConstruction', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">4. Age of Property</Label>
                            <Input
                                placeholder="e.g., 5 Years old"
                                value={formData.pdfDetails?.ageOfProperty || ""}
                                onChange={(e) => handleValuationChange('ageOfProperty', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">5. Residual Life of Building</Label>
                            <Input
                                placeholder="e.g., 55 Years with proper maintenance"
                                value={formData.pdfDetails?.residualLifeBuilding || ""}
                                onChange={(e) => handleValuationChange('residualLifeBuilding', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">6. Number of Floors</Label>
                            <Input
                                placeholder="e.g., Basement + Ground + Service + Terrace"
                                value={formData.pdfDetails?.numberOfFloors || ""}
                                onChange={(e) => handleValuationChange('numberOfFloors', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">7. Condition of Building</Label>
                            <Input
                                placeholder="Excellent, Good, Normal, Poor"
                                value={formData.pdfDetails?.buildingCondition || ""}
                                onChange={(e) => handleValuationChange('buildingCondition', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">8. Exterior Condition</Label>
                            <Input
                                placeholder="e.g., Finishing work in Progress"
                                value={formData.pdfDetails?.exteriorCondition || ""}
                                onChange={(e) => handleValuationChange('exteriorCondition', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">9. Interior Condition</Label>
                            <Input
                                placeholder="e.g., Finishing work in Progress"
                                value={formData.pdfDetails?.interiorCondition || ""}
                                onChange={(e) => handleValuationChange('interiorCondition', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">10. Layout Approval Details</Label>
                            <Input
                                placeholder="e.g., Building plan Sanctioned by Collector Office"
                                value={formData.pdfDetails?.layoutApprovalDetails || ""}
                                onChange={(e) => handleValuationChange('layoutApprovalDetails', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">11. Approved Map Authority</Label>
                            <Input
                                placeholder="e.g., Collector Office Satara"
                                value={formData.pdfDetails?.approvedMapAuthorityBuilding || ""}
                                onChange={(e) => handleValuationChange('approvedMapAuthorityBuilding', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">12. Authenticity of Approved Plan</Label>
                            <Input
                                placeholder="e.g., Yes"
                                value={formData.pdfDetails?.authenticityOfApprovedPlan || ""}
                                onChange={(e) => handleValuationChange('authenticityOfApprovedPlan', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                    </div>
                </div>

                {/* SPECIFICATIONS OF CONSTRUCTION (FLOOR-WISE) */}
                <div className="mb-6 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-teal-500 rounded"></div>
                        <h4 className="font-bold text-lg text-gray-900">Specifications of Construction (Floor-wise)</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">1. Foundation</Label>
                            <Input
                                placeholder="e.g., R.C.C. Column, footing foundation"
                                value={formData.pdfDetails?.constructionFoundation || ""}
                                onChange={(e) => handleValuationChange('constructionFoundation', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">2. Basement</Label>
                            <Input
                                placeholder="e.g., One Basement"
                                value={formData.pdfDetails?.constructionBasement || ""}
                                onChange={(e) => handleValuationChange('constructionBasement', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">3. Superstructure</Label>
                            <Input
                                placeholder="e.g., Ground Floor + Service Floor + Upper Floors + Helipad"
                                value={formData.pdfDetails?.constructionSuperstructure || ""}
                                onChange={(e) => handleValuationChange('constructionSuperstructure', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">4. Entrance Door</Label>
                            <Input
                                placeholder="e.g., Proposed As per required of Interior Design"
                                value={formData.pdfDetails?.constructionEntranceDoor || ""}
                                onChange={(e) => handleValuationChange('constructionEntranceDoor', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">5. Other Door</Label>
                            <Input
                                placeholder="e.g., Proposed As per required of Interior Design"
                                value={formData.pdfDetails?.constructionOtherDoor || ""}
                                onChange={(e) => handleValuationChange('constructionOtherDoor', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">6. Windows</Label>
                            <Input
                                placeholder="e.g., Proposed As per required of Interior Design"
                                value={formData.pdfDetails?.constructionWindows || ""}
                                onChange={(e) => handleValuationChange('constructionWindows', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">7. Flooring, Skirting, Dadoing</Label>
                            <Input
                                placeholder="e.g., Vitrified/Granite/Italian Marbles & Carpets"
                                value={formData.pdfDetails?.constructionFlooring || ""}
                                onChange={(e) => handleValuationChange('constructionFlooring', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">8. Special Finish</Label>
                            <Input
                                placeholder="e.g., Marble, granite, wooden paneling, grills"
                                value={formData.pdfDetails?.constructionSpecialFinish || ""}
                                onChange={(e) => handleValuationChange('constructionSpecialFinish', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">9. Roofing & Weather Proof</Label>
                            <Input
                                placeholder="e.g., R.C.C. Slab roof"
                                value={formData.pdfDetails?.constructionRoofing || ""}
                                onChange={(e) => handleValuationChange('constructionRoofing', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">10. Drainage</Label>
                            <Input
                                placeholder="e.g., ETP Plant as per MPCB Norms"
                                value={formData.pdfDetails?.constructionDrainage || ""}
                                onChange={(e) => handleValuationChange('constructionDrainage', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                    </div>
                </div>

                {/* COMPOUND WALL & UTILITIES SPECIFICATIONS */}
                <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-orange-500 rounded"></div>
                        <h4 className="font-bold text-lg text-gray-900">Compound Wall & Utilities Specifications</h4>
                    </div>

                    {/* Compound Wall Section */}
                    <div className="mb-4">
                        <h5 className="text-sm font-bold text-gray-800 mb-2">2. Compound Wall</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Height</Label>
                                <Input
                                    placeholder="e.g., 5 feet"
                                    value={formData.pdfDetails?.height || ""}
                                    onChange={(e) => handleValuationChange('height', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Length</Label>
                                <Input
                                    placeholder="e.g., Around the plot"
                                    value={formData.pdfDetails?.length || ""}
                                    onChange={(e) => handleValuationChange('length', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Type of Construction</Label>
                                <Input
                                    placeholder="e.g., UCR masonry walls up to plinth"
                                    value={formData.pdfDetails?.typeOfConstruction || ""}
                                    onChange={(e) => handleValuationChange('typeOfConstruction', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Electrical Installation Section */}
                    <div className="mb-4">
                        <h5 className="text-sm font-bold text-gray-800 mb-2">3. Electrical Installation</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Type of Wiring</Label>
                                <Input
                                    placeholder="e.g., As per Interior Design & specification"
                                    value={formData.pdfDetails?.typeOfWiring || ""}
                                    onChange={(e) => handleValuationChange('typeOfWiring', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Class of Fittings</Label>
                                <Input
                                    placeholder="e.g., Superior / Ordinary / Poor"
                                    value={formData.pdfDetails?.classOfFittings || ""}
                                    onChange={(e) => handleValuationChange('classOfFittings', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Number of Light Points</Label>
                                <Input
                                    placeholder="e.g., Number of points"
                                    value={formData.pdfDetails?.numberOfLightPoints || ""}
                                    onChange={(e) => handleValuationChange('numberOfLightPoints', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Fan Points</Label>
                                <Input
                                    placeholder="e.g., Number of fan points"
                                    value={formData.pdfDetails?.farPlugs || ""}
                                    onChange={(e) => handleValuationChange('farPlugs', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Spare Plug Points</Label>
                                <Input
                                    placeholder="e.g., Number of spare points"
                                    value={formData.pdfDetails?.sparePlug || ""}
                                    onChange={(e) => handleValuationChange('sparePlug', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Any Other Item</Label>
                                <Input
                                    placeholder="e.g., Additional electrical items"
                                    value={formData.pdfDetails?.anyOtherElectricalItem || ""}
                                    onChange={(e) => handleValuationChange('anyOtherElectricalItem', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Plumbing Installation Section */}
                    <div>
                        <h5 className="text-sm font-bold text-gray-800 mb-2">4. Plumbing Installation</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">No. of Water Closets & Type</Label>
                                <Input
                                    placeholder="e.g., As per Interior Design & specification"
                                    value={formData.pdfDetails?.numberOfWaterClassAndTaps || ""}
                                    onChange={(e) => handleValuationChange('numberOfWaterClassAndTaps', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">No. of Wash Basins</Label>
                                <Input
                                    placeholder="e.g., Number of wash basins"
                                    value={formData.pdfDetails?.noWashBasins || ""}
                                    onChange={(e) => handleValuationChange('noWashBasins', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">No. of Urinals</Label>
                                <Input
                                    placeholder="e.g., Number of urinals"
                                    value={formData.pdfDetails?.noUrinals || ""}
                                    onChange={(e) => handleValuationChange('noUrinals', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">No. of Bathtubs</Label>
                                <Input
                                    placeholder="e.g., Number of bathtubs"
                                    value={formData.pdfDetails?.noOfBathtubs || ""}
                                    onChange={(e) => handleValuationChange('noOfBathtubs', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Water Meter, Taps, etc</Label>
                                <Input
                                    placeholder="e.g., Water fixtures details"
                                    value={formData.pdfDetails?.waterMeterTapsEtc || ""}
                                    onChange={(e) => handleValuationChange('waterMeterTapsEtc', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Any Other Fixtures</Label>
                                <Input
                                    placeholder="e.g., Additional plumbing fixtures"
                                    value={formData.pdfDetails?.anyOtherPlumbingFixture || ""}
                                    onChange={(e) => handleValuationChange('anyOtherPlumbingFixture', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* DETAILS OF VALUATION OF BUILDING */}
                <div className="mb-6 p-4 bg-lime-50 rounded-2xl border border-lime-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-lime-500 rounded"></div>
                        <h4 className="font-bold text-lg text-gray-900">Details of Valuation of Building</h4>
                    </div>



                    {/* Building Parameters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ml-4 mb-4">
                        <div className="space-y-1">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-gray-900">Estimated Replacement Cost of Construction</Label>
                                <Input
                                    placeholder="e.g., Rs. 3000/sq.ft"
                                    value={formData.pdfDetails?.replacementCostGround || ""}
                                    onChange={(e) => handleValuationChange('replacementCostGround', e.target.value)}
                                    disabled={!canEdit}
                                    className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                                />
                            </div>
                            <Label className="text-xs font-bold text-gray-900">Age of Building</Label>
                            <Input
                                placeholder="e.g., 2016-2025"
                                value={formData.pdfDetails?.buildingAge || ""}
                                onChange={(e) => handleValuationChange('buildingAge', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Life of Building Estimated</Label>
                            <Input
                                placeholder="e.g., 55 Years"
                                value={formData.pdfDetails?.buildingLifeEstimated || ""}
                                onChange={(e) => handleValuationChange('buildingLifeEstimated', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Depreciation % (10% salvage)</Label>
                            <Input
                                placeholder="e.g., 0.5% to 5%"
                                value={formData.pdfDetails?.depreciationPercentage || ""}
                                onChange={(e) => handleValuationChange('depreciationPercentage', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-900">Depreciated Building Rate</Label>
                            <Input
                                placeholder="e.g., 100%"
                                value={formData.pdfDetails?.depreciatedBuildingRate || ""}
                                onChange={(e) => handleValuationChange('depreciatedBuildingRate', e.target.value)}
                                disabled={!canEdit}
                                className="h-8 text-xs rounded-lg border border-neutral-300 py-1 px-2"
                            />
                        </div>
                    </div>
                </div>

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
            </div>
        );
    };

    const renderMarketAnalysisTab = () => (
        <div className="space-y-6">
            {/* Part C & Part D TABLES - SIDE BY SIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Part C - EXTRA ITEMS TABLE */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Part C – Extra Items</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left w-8">Sr.</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left">Description</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">1</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Portico</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <Input
                                            placeholder="₹"
                                            value={formData.pdfDetails?.partCExtraItem1Amount || ""}
                                            onChange={(e) => handleValuationChange('partCExtraItem1Amount', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">2</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Ornamental Front door</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <Input
                                            placeholder="₹"
                                            value={formData.pdfDetails?.partCExtraItem2Amount || ""}
                                            onChange={(e) => handleValuationChange('partCExtraItem2Amount', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">3</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Sit out/Verandah with Steel grills</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <Input
                                            placeholder="₹"
                                            value={formData.pdfDetails?.partCExtraItem3Amount || ""}
                                            onChange={(e) => handleValuationChange('partCExtraItem3Amount', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">4</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Overhead Water Tank</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <Input
                                            placeholder="₹"
                                            value={formData.pdfDetails?.partCExtraItem4Amount || ""}
                                            onChange={(e) => handleValuationChange('partCExtraItem4Amount', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">5</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Extra Steel/collapsible gates</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <Input
                                            placeholder="₹"
                                            value={formData.pdfDetails?.partCExtraItem5Amount || ""}
                                            onChange={(e) => handleValuationChange('partCExtraItem5Amount', e.target.value)}
                                            disabled={!canEdit}
                                            className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right"
                                        />
                                    </td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-xs">
                                    <td colSpan="2" className="border border-gray-300 px-2 py-1 text-right">Total</td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        <Input
                                            placeholder="₹"
                                            value={formData.pdfDetails?.partCExtraTotal || ""}
                                            readOnly
                                            disabled
                                            className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right font-bold bg-gray-100"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Part D - AMENITIES TABLE */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Part D – Amenities</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left w-8">Sr.</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left">Description</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">1</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Wardrobes</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item1Amount || ""} onChange={(e) => handleValuationChange('part2Item1Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">2</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Glazed tiles</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item2Amount || ""} onChange={(e) => handleValuationChange('part2Item2Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">3</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Extra Sink and bath tub</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item3Amount || ""} onChange={(e) => handleValuationChange('part2Item3Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">4</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Marble / Ceramic tiles</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item4Amount || ""} onChange={(e) => handleValuationChange('part2Item4Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">5</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Interior Decorations</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item5Amount || ""} onChange={(e) => handleValuationChange('part2Item5Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">6</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Arch. elevation works</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item6Amount || ""} onChange={(e) => handleValuationChange('part2Item6Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">7</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Panelling work</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item7Amount || ""} onChange={(e) => handleValuationChange('part2Item7Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">8</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Aluminium hand rails</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item8Amount || ""} onChange={(e) => handleValuationChange('part2Item8Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">9</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">False Ceiling</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Item9Amount || ""} onChange={(e) => handleValuationChange('part2Item9Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-xs">
                                    <td colSpan="2" className="border border-gray-300 px-2 py-1 text-right">Total</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part2Total || ""} readOnly disabled className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right font-bold bg-gray-100" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Part E & Part F TABLES - SIDE BY SIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Part E - MISCELLANEOUS TABLE */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Part E – Miscellaneous</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left w-8">Sr.</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left">Description</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">1</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Separate Toilet room</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part3Item1Amount || ""} onChange={(e) => handleValuationChange('part3Item1Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">2</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Separate Lumber room</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part3Item2Amount || ""} onChange={(e) => handleValuationChange('part3Item2Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">3</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Separate water Tank / sump</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part3Item3Amount || ""} onChange={(e) => handleValuationChange('part3Item3Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">4</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Trees Gardening</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part3Item4Amount || ""} onChange={(e) => handleValuationChange('part3Item4Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-xs">
                                    <td colSpan="2" className="border border-gray-300 px-2 py-1 text-right">Total</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.part3Total || ""} readOnly disabled className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right font-bold bg-gray-100" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Part F - SERVICES TABLE */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Part F – Services</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left w-8">Sr.</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left">Description</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">1a</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Water supply RCC Tank 2L</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.partFItem1Amount || ""} onChange={(e) => handleValuationChange('partFItem1Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">1b</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Overhead RCC Tank 20K</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.partFItem2Amount || ""} onChange={(e) => handleValuationChange('partFItem2Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">2</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Drainage arrangements</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.partFItem3Amount || ""} onChange={(e) => handleValuationChange('partFItem3Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">3</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Compound wall</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.partFItem4Amount || ""} onChange={(e) => handleValuationChange('partFItem4Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">4</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Site Development</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.partFItem5Amount || ""} onChange={(e) => handleValuationChange('partFItem5Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs">5</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Swimming pool</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.partFItem6Amount || ""} onChange={(e) => handleValuationChange('partFItem6Amount', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-xs">
                                    <td colSpan="2" className="border border-gray-300 px-2 py-1 text-right">Total</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.partFTotal || ""} readOnly disabled className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right font-bold bg-gray-100" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* TOTAL ABSTRACT OF THE ENTIRE PROPERTY - Side by Side Tables */}
            <div className="flex gap-4">
                {/* Left Table - Total Abstract of the Entire Property */}
                <div className="p-3 bg-white rounded-lg border border-gray-200 flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Total Abstract of the Entire Property</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left w-8">Part</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left">Description</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">A</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Land</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.abstractLand || ""} onChange={(e) => handleValuationChange('abstractLand', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">B</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Building</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.abstractBuilding || ""} onChange={(e) => handleValuationChange('abstractBuilding', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">C</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Extra Items</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.abstractExtraItems || ""} onChange={(e) => handleValuationChange('abstractExtraItems', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">D</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Amenities</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.abstractAmenities || ""} onChange={(e) => handleValuationChange('abstractAmenities', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">E</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Miscellaneous</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.abstractMiscellaneous || ""} onChange={(e) => handleValuationChange('abstractMiscellaneous', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">F</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Services</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.abstractServices || ""} onChange={(e) => handleValuationChange('abstractServices', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-xs">
                                    <td colSpan="2" className="border border-gray-300 px-2 py-1 text-right">Total Value</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.abstractTotalValue || ""} readOnly disabled className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right font-bold bg-gray-100" /></td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-xs">
                                    <td colSpan="2" className="border border-gray-300 px-2 py-1 text-right">Say</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.abstractRoundedValue || ""} readOnly disabled className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right font-bold bg-gray-100" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Table - Total Abstract of the Entire Property (As Per Requirement of Owner) */}
                <div className="p-3 bg-white rounded-lg border border-gray-200 flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Total Abstract of the Entire Property (As Per Requirement of Owner)</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left w-8">Part</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-left">Description</th>
                                    <th className="border border-gray-300 px-2 py-1 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">A</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Land</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.ownerAbstractLand || ""} onChange={(e) => handleValuationChange('ownerAbstractLand', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">B</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Building</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.ownerAbstractBuilding || ""} onChange={(e) => handleValuationChange('ownerAbstractBuilding', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">C</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Extra Items</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.ownerAbstractExtraItems || ""} onChange={(e) => handleValuationChange('ownerAbstractExtraItems', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">D</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Amenities</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.ownerAbstractAmenities || ""} onChange={(e) => handleValuationChange('ownerAbstractAmenities', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">E</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Miscellaneous</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.ownerAbstractMiscellaneous || ""} onChange={(e) => handleValuationChange('ownerAbstractMiscellaneous', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 font-bold text-xs">F</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs">Services</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.ownerAbstractServices || ""} onChange={(e) => handleValuationChange('ownerAbstractServices', e.target.value)} disabled={!canEdit} className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right" /></td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-xs">
                                    <td colSpan="2" className="border border-gray-300 px-2 py-1 text-right">Total Value</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.ownerAbstractTotalValue || ""} readOnly disabled className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right font-bold bg-gray-100" /></td>
                                </tr>
                                <tr className="bg-gray-50 font-bold text-xs">
                                    <td colSpan="2" className="border border-gray-300 px-2 py-1 text-right">Say</td>
                                    <td className="border border-gray-300 px-2 py-1"><Input placeholder="₹" value={formData.pdfDetails?.ownerAbstractRoundedValue || ""} readOnly disabled className="h-6 text-xs rounded border border-neutral-300 py-0 px-1 w-full text-right font-bold bg-gray-100" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">UBI APF Valuation Form</h1>
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
                                    <p className="text-sm font-medium text-neutral-900">{valuation && valuation.status ? valuation.status.charAt(0).toUpperCase() + valuation.status.slice(1) : 'Pending'}</p>
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
                                <CardTitle className="text-sm font-bold text-neutral-900">UBI APF Details</CardTitle>
                                <p className="text-neutral-600 text-xs mt-1.5 font-medium">* Required fields</p>
                            </CardHeader>
                            <CardContent className="p-4 overflow-y-auto flex-1">
                                <form className="space-y-3" onSubmit={onFinish}>

                                    {/* Main Tab Navigation - Client/Documents/Valuation/Add Fields */}
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
                                                documentPreviews={documentPreviews}
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
                                                formType="ubiApf"
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
                                                    { id: 'market', label: 'MARKET ANALYSIS' }
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
        </div>
    );
};

export default React.memo(UbiApfEditForm); 