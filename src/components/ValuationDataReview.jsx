// import React, { useState, useMemo, useCallback } from 'react';
// import './ValuationDataReview.css';

// /**
//  * Valuation Data Review & Update Component
//  * Dynamic form with all valuation data fields
//  * Real-time form state management with edit, save, and reset functionality
//  */
// const ValuationDataReview = ({ initialData = {}, onSave, onCancel }) => {
//   const defaultData = {
//     // Header & Identification
//     bankName: 'Gujarat Gramin Bank',
//     branchName: 'Manjalpur Branch',
//     fileNo: '06GGB1025 10',
//     valuationDate: '31-Oct-2025',
//     inspectionDate: '30-Oct-2025',
    
//     // Property Type & Owner
//     propertyType: 'FLAT/HOUSE/INDUSTRIAL/SHOP',
//     ownerName: 'Hemanshu Haribhai Patel',
    
//     // Property Address
//     propertyAddress: 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020',
//     plotSurveyNo: 'R.S. No. 101, 102/2, 106/2 Paiki 2, T.P.S. No. 29, F.P. No. 9+24, At: Manjalpur, Sub District & District: Vadodara.',
    
//     // Property Details
//     carpetArea: '68.93',
//     builtUpArea: 'NA',
//     city: 'Vadodara',
    
//     // Valuation Results
//     fairMarketValue: '59,51,499.40',
//     realizeableValue: '56,63,924.43',
//     distressValue: '47,61,199.52',
//     saleDeadValue: 'NA',
//     jantriValue: '16,12,962.00',
//     insurableValue: '20,83,024.79',
    
//     // Building Details
//     numberOfFloors: 'Basement + Ground Floor + 7 Upper Floors',
//     structureType: 'RCC Structure',
//     commencementYear: '2025',
//     qualityOfConstruction: 'Standard',
//     appearanceOfBuilding: 'Good',
//     maintenanceOfBuilding: 'Good',
    
//     // Flat Details
//     flatFloor: '5th Floor',
//     flatNo: 'Flat No. A-503',
//     flatSpecification: '3BHK Residential Flat',
//     roofType: 'RCC Slab',
//     flooringType: 'Vitrified Tiles',
//     doorType: 'Wooden Framed Flush Door',
//     windowType: 'Section Windows',
//     fittingsType: 'Good',
//     finishingType: 'Interior Finishing',
    
//     // Area Classification
//     areaClass: 'Middle Class Area',
//     areaType: 'Urban',
//     occupancy: 'Vacant',
//     classificationArea: 'Middle Class Area',
//     municipality: 'Vadodara Municipal Corporation',
    
//     // Marketability
//     marketability: 'Good',
//     positiveFactors: 'Proposed Fully Developed Scheme',
//     negativeFactors: 'The Unforeseen Events',
    
//     // Rate Details
//     marketRange: 'Rs. 60000-65000 per sq. Mt.',
//     adoptedRate: '₹ 64,580.00',
//     jantriRate: 'Rs. 23400/- per sq. mt.',
//     buildingServices: '24 x 7 Water Supply & Security',
//     landOthers: 'Fully Developed Scheme & Interior',
    
//     // Valuation Calculation
//     flatValue: '₹ 44,51,499.40',
//     furnitureFixtures: '₹ 15,00,000.00',
//     totalFlatValue: '₹ 59,51,499.40',
//     totalFlatValueWords: 'Fifty Nine Lac Fifty One Thousand Four Hundred & Ninety Nine Rupees Only',
    
//     // Documents
//     documentsCopies: 'Mortgage Deed, Approved Plan, Previous Valuation Report',
    
//     // Declaration Details
//     inspectionDateDecl: '30th October, 2025',
//     place: 'Vadodara',
//     reportDate: '31/10/2025',
//     valuationCompany: 'MAHIM ARCHITECTS',
//   };

//   const [formData, setFormData] = useState({ ...defaultData, ...initialData });
//   const [editMode, setEditMode] = useState(false);
//   const [activeTab, setActiveTab] = useState('header');
//   const [hasChanges, setHasChanges] = useState(false);

//   const handleInputChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setHasChanges(true);
//   }, []);

//   const handleSave = useCallback(() => {
//     if (onSave) {
//       onSave(formData);
//     }
//     setEditMode(false);
//     setHasChanges(false);
//   }, [formData, onSave]);

//   const handleReset = useCallback(() => {
//     setFormData({ ...defaultData, ...initialData });
//     setHasChanges(false);
//   }, [defaultData, initialData]);

//   const handleCancel = useCallback(() => {
//     if (onCancel) {
//       onCancel();
//     }
//     setEditMode(false);
//     setHasChanges(false);
//     setFormData({ ...defaultData, ...initialData });
//   }, [onCancel, defaultData, initialData]);

//   const renderField = useCallback((label, fieldName, isTextArea = false, required = false) => {
//     const value = formData[fieldName] || '';
    
//     return (
//       <div className="form-group" key={fieldName}>
//         <label htmlFor={fieldName}>
//           {label}
//           {required && <span className="required">*</span>}
//         </label>
//         {editMode ? (
//           isTextArea ? (
//             <textarea
//               id={fieldName}
//               name={fieldName}
//               value={value}
//               onChange={handleInputChange}
//               rows={3}
//               className="form-input"
//             />
//           ) : (
//             <input
//               type="text"
//               id={fieldName}
//               name={fieldName}
//               value={value}
//               onChange={handleInputChange}
//               className="form-input"
//             />
//           )
//         ) : (
//           <div className="form-display">{value}</div>
//         )}
//       </div>
//     );
//   }, [editMode, formData, handleInputChange]);

//   const sections = useMemo(() => ({
//      header: {
//        title: 'Header & Identification',
//        fields: [
//          ['Bank Name', 'bankName'],
//          ['Branch Name', 'branchName'],
//          ['File Number', 'fileNo'],
//          ['Valuation Date', 'valuationDate'],
//          ['Inspection Date', 'inspectionDate'],
//        ]
//      },
//      property: {
//        title: 'Property Information',
//        fields: [
//          ['Property Type', 'propertyType'],
//          ['Owner Name', 'ownerName'],
//          ['Property Address', 'propertyAddress', true],
//          ['Plot/Survey No', 'plotSurveyNo', true],
//        ]
//      },
//      details: {
//        title: 'Property Details',
//        fields: [
//          ['City', 'city'],
//          ['Carpet Area (Sq.Mt)', 'carpetArea'],
//          ['Built Up Area', 'builtUpArea'],
//          ['Number of Floors', 'numberOfFloors'],
//          ['Structure Type', 'structureType'],
//          ['Commencement Year', 'commencementYear'],
//          ['Quality of Construction', 'qualityOfConstruction'],
//          ['Appearance of Building', 'appearanceOfBuilding'],
//          ['Maintenance of Building', 'maintenanceOfBuilding'],
//        ]
//      },
//      flat: {
//        title: 'Flat Details',
//        fields: [
//          ['Flat Floor', 'flatFloor'],
//          ['Flat Number', 'flatNo'],
//          ['Flat Specification', 'flatSpecification'],
//          ['Roof Type', 'roofType'],
//          ['Flooring Type', 'flooringType'],
//          ['Door Type', 'doorType'],
//          ['Window Type', 'windowType'],
//          ['Fittings Type', 'fittingsType'],
//          ['Finishing Type', 'finishingType'],
//        ]
//      },
//      area: {
//        title: 'Area Classification',
//        fields: [
//          ['Area Class', 'areaClass'],
//          ['Area Type', 'areaType'],
//          ['Occupancy Status', 'occupancy'],
//          ['Municipality', 'municipality'],
//          ['Marketability', 'marketability'],
//          ['Positive Factors', 'positiveFactors', true],
//          ['Negative Factors', 'negativeFactors', true],
//        ]
//      },
//      rates: {
//        title: 'Rate & Valuation',
//        fields: [
//          ['Market Range', 'marketRange'],
//          ['Adopted Rate (₹/Sq.Mt)', 'adoptedRate'],
//          ['Jantri Rate', 'jantriRate'],
//          ['Building Services', 'buildingServices'],
//          ['Land + Others', 'landOthers'],
//          ['Flat Value', 'flatValue'],
//          ['Furniture & Fixtures', 'furnitureFixtures'],
//          ['Total Flat Value', 'totalFlatValue'],
//          ['Total Value (In Words)', 'totalFlatValueWords', true],
//        ]
//      },
//      valuation: {
//        title: 'Valuation Results',
//        fields: [
//          ['Fair Market Value', 'fairMarketValue'],
//          ['Realizable Value (95% FMV)', 'realizeableValue'],
//          ['Distress Value (80% FMV)', 'distressValue'],
//          ['Sale Deed Value', 'saleDeadValue'],
//          ['Jantri Value', 'jantriValue'],
//          ['Insurable Value', 'insurableValue'],
//        ]
//      },
//      documents: {
//        title: 'Documents & Declaration',
//        fields: [
//          ['Documents Copies', 'documentsCopies', true],
//          ['Inspection Date (Declaration)', 'inspectionDateDecl'],
//          ['Place', 'place'],
//          ['Report Date', 'reportDate'],
//          ['Valuation Company', 'valuationCompany'],
//        ]
//      }
//    }), []);

//   return (
//     <div className="valuation-review-container">
//       <div className="review-header">
//         <h1>Valuation Data Review & Update</h1>
//         <div className="header-actions">
//           {!editMode && (
//             <button className="btn btn-primary" onClick={() => setEditMode(true)}>
//               ✎ Edit Data
//             </button>
//           )}
//           {editMode && (
//             <>
//               <button 
//                 className="btn btn-success" 
//                 onClick={handleSave}
//                 disabled={!hasChanges}
//               >
//                 ✓ Save Changes
//               </button>
//               <button 
//                 className="btn btn-warning" 
//                 onClick={handleReset}
//                 disabled={!hasChanges}
//               >
//                 ↻ Reset
//               </button>
//               <button className="btn btn-danger" onClick={handleCancel}>
//                 ✕ Cancel
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="review-status">
//         {editMode && <span className="status-editing">✎ EDITING MODE</span>}
//         {!editMode && <span className="status-view">👁 VIEW MODE</span>}
//         {hasChanges && <span className="status-changed">⚠ Unsaved Changes</span>}
//       </div>

//       <div className="review-tabs">
//         {Object.entries(sections).map(([key, section]) => (
//           <button
//             key={key}
//             className={`tab-button ${activeTab === key ? 'active' : ''}`}
//             onClick={() => setActiveTab(key)}
//           >
//             {section.title}
//           </button>
//         ))}
//       </div>

//       <div className="review-content">
//         {Object.entries(sections).map(([key, section]) => (
//           <div
//             key={key}
//             className={`tab-content ${activeTab === key ? 'active' : ''}`}
//           >
//             <h2>{section.title}</h2>
//             <div className="fields-grid">
//               {section.fields.map(([label, fieldName, isTextArea]) =>
//                 renderField(label, fieldName, isTextArea)
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="review-footer">
//         <div className="summary">
//           <h3>Summary</h3>
//           <table className="summary-table">
//             <tbody>
//               <tr>
//                 <td><strong>File:</strong></td>
//                 <td>{formData.fileNo}</td>
//               </tr>
//               <tr>
//                 <td><strong>Owner:</strong></td>
//                 <td>{formData.ownerName}</td>
//               </tr>
//               <tr>
//                 <td><strong>Fair Market Value:</strong></td>
//                 <td className="value-highlight">₹ {formData.fairMarketValue}</td>
//               </tr>
//               <tr>
//                 <td><strong>Carpet Area:</strong></td>
//                 <td>{formData.carpetArea} Sq.Mt</td>
//               </tr>
//               <tr>
//                 <td><strong>Location:</strong></td>
//                 <td>{formData.city}</td>
//               </tr>
//               <tr>
//                 <td><strong>Last Updated:</strong></td>
//                 <td>{formData.reportDate}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ValuationDataReview;
