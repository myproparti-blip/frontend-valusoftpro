import React, { useRef, useState, useCallback, useMemo } from "react";
import {
    FaMapMarkerAlt,
    FaImage,
    FaLocationArrow,
    FaUpload,
    FaFileAlt
} from "react-icons/fa";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Textarea
} from "./ui";

const DocumentsPanel = ({
    formData,
    canEdit,
    locationImagePreviews,
    imagePreviews,
    documentPreviews,
    handleLocationImageUpload,
    handleImageUpload,
    handleDocumentUpload,
    removeLocationImage,
    removeImage,
    removeDocument,
    handleInputChange,
    handleCoordinateChange,
    setFormData,
    locationFileInputRef,
    bankFileInputRef,
    fileInputRef1,
    fileInputRef2,
    fileInputRef3,
    fileInputRef4,
    documentFileInputRef,
    bankImagePreview,
    handleBankImageUpload,
    removeBankImage,
    areaImagePreviews = {},
    formType = ''
}) => {
    // All property areas - memoized to prevent recreating on each render
    const propertyAreas = useMemo(() => [
        'Front Elevation', 'Main Entrance', 'Living Hall', 'Drawing Room', 'Dining Area',
        'Kitchen', 'Modular Kitchen', 'Utility Area', 'Master Bedroom', 'Bedroom 2',
        'Bedroom 3', 'Guest Bedroom', 'Master Bathroom', 'Common Bathroom', 'Attached Bathroom',
        'Balcony', 'Front Balcony', 'Rear Balcony', 'Staircase', 'Lobby Area',
        'Passage / Corridor', 'Study Room', 'Home Office', 'Pooja Room', 'Store Room',
        'Washing Area', 'Parking Area', 'Covered Parking', 'Open Parking', 'Terrace',
        'Roof View', 'Backyard', 'Garden Area', 'Compound Wall', 'Main Gate',
        'Side Elevation', 'Rear Elevation', 'Lift Area', 'Lift Interior', 'Electrical Panel',
        'Plumbing Area', 'Water Tank', 'Borewell / Sump', 'Flooring Detail', 'Wall Finish',
        'Ceiling Design', 'Window View', 'Door Finish', 'Security Area', 'Overall Property View'
    ], []);

    // State for selected areas and their uploads
    const [selectedAreas, setSelectedAreas] = useState(() => {
        // Initialize selected areas from formData or areaImagePreviews if they exist
        const source = formData.areaImages || areaImagePreviews;
        if (source && Object.keys(source).length > 0) {
            const selected = {};
            Object.keys(source).forEach(area => {
                if (source[area] && source[area].length > 0) {
                    selected[area] = true;
                }
            });
            return selected;
        }
        // If no areaImages but imagePreviews exist, initialize a default area for them
        if (imagePreviews && Array.isArray(imagePreviews) && imagePreviews.length > 0) {
            return { 'Front Elevation': true };
        }
        return {};
    });

    const [areaUploads, setAreaUploads] = useState(() => {
        // Initialize uploads from formData or areaImagePreviews if they exist
        const source = formData.areaImages || areaImagePreviews;
        if (source && Object.keys(source).length > 0) {
            // Ensure all images have proper structure (url fallback for database images)
            const normalized = {};
            Object.keys(source).forEach(area => {
                if (Array.isArray(source[area])) {
                    normalized[area] = source[area].map(img => ({
                        preview: img.preview || img.url,
                        url: img.url || img.preview,
                        fileName: img.fileName || `Image`,
                        size: img.size || 0,
                        file: img.file || null
                    }));
                }
            });
            return normalized;
        }
        // If no areaImages but imagePreviews exist, initialize them under 'Front Elevation'
        if (imagePreviews && Array.isArray(imagePreviews) && imagePreviews.length > 0) {
            return {
                'Front Elevation': imagePreviews.map(img => ({
                    preview: img.preview || img.url,
                    url: img.url || img.preview,
                    fileName: img.name || img.fileName || 'Property Image',
                    size: img.size || 0,
                    file: img.file || null
                }))
            };
        }
        return {};
    });

    const areaFileRefs = useRef({});

    // Sync imagePreviews prop changes to areaUploads if not already initialized from areaImages
    React.useEffect(() => {
        if (imagePreviews && Array.isArray(imagePreviews) && imagePreviews.length > 0) {
            // Only sync if we don't have areaImages already
            if (!formData.areaImages || Object.keys(formData.areaImages).length === 0) {
                // Check if areaUploads is empty or doesn't have images
                if (!areaUploads['Front Elevation'] || areaUploads['Front Elevation'].length === 0) {
                    setSelectedAreas(prev => ({
                        ...prev,
                        'Front Elevation': true
                    }));
                    setAreaUploads(prev => ({
                        ...prev,
                        'Front Elevation': imagePreviews.map(img => ({
                            preview: img.preview || img.url,
                            url: img.url || img.preview,
                            fileName: img.name || img.fileName || 'Property Image',
                            size: img.size || 0,
                            file: img.file || null
                        }))
                    }));
                }
            }
        }
    }, [imagePreviews, formData.areaImages]);

    // Toggle area selection
    const toggleAreaSelection = useCallback((area) => {
        setSelectedAreas(prev => ({
            ...prev,
            [area]: !prev[area]
        }));
        // Initialize uploads for this area if not exists
        if (!areaUploads[area]) {
            setAreaUploads(prev => ({
                ...prev,
                [area]: []
            }));
        }
    }, [areaUploads]);

    // Handle area image upload
    const handleAreaImageUpload = useCallback((e, area) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAreaUploads(prev => {
                    const updated = {
                        ...prev,
                        [area]: [
                            ...(prev[area] || []),
                            {
                                preview: event.target.result,
                                file: file,
                                fileName: file.name,
                                size: file.size
                            }
                        ]
                    };
                    // Sync to formData
                    setFormData(prevFormData => ({
                        ...prevFormData,
                        areaImages: updated
                    }));
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        });
        // Reset input
        if (areaFileRefs.current[area]) {
            areaFileRefs.current[area].value = '';
        }
    }, [areaUploads, setFormData]);

    // Remove uploaded image for an area
    const removeAreaImage = useCallback((area, index) => {
        setAreaUploads(prev => {
            const updated = {
                ...prev,
                [area]: prev[area].filter((_, i) => i !== index)
            };
            // Sync to formData
            setFormData(prevFormData => ({
                ...prevFormData,
                areaImages: updated
            }));
            return updated;
        });
    }, [setFormData]);

    // Set file ref for area
    const setAreaFileRef = useCallback((area, ref) => {
        areaFileRefs.current[area] = ref;
    }, []);

    return (
        <div className="space-y-8">
            {/* Bank Image Section */}
            {!['ubiShop', 'ubiApf', 'bomFlat'].includes(formType) && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaImage className="h-5 w-5 text-orange-600" />
                        Bank Image
                    </h3>
                    <div className="space-y-6">
                        {/* Bank Image Upload */}
                        <Card className="border">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <FaImage className="h-5 w-5" />
                                    Bank Logo/Image
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <input
                                        type="file"
                                        ref={bankFileInputRef}
                                        accept="image/*"
                                        onChange={handleBankImageUpload}
                                        style={{ display: 'none' }}
                                        disabled={!canEdit}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => bankFileInputRef?.current?.click()}
                                        className="flex items-center gap-2"
                                        disabled={!canEdit || !bankFileInputRef}
                                    >
                                        <FaUpload className="h-4 w-4" />
                                        Upload Bank Image
                                    </Button>

                                    {/* Bank Image Preview */}
                                    {bankImagePreview && (
                                        <Card className="relative w-32 h-32 border-2 border-dashed">
                                            <CardContent className="p-0 h-full">
                                                <img
                                                    src={bankImagePreview.preview}
                                                    alt="Bank Image Preview"
                                                    className="w-full h-full object-contain rounded"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={removeBankImage}
                                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={!canEdit}
                                                >
                                                    ×
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Location Images Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="h-5 w-5 text-orange-600" />
                    Location Images & Coordinates
                </h3>
                <div className="space-y-6">

                    {/* Location Images Upload */}
                    <Card className="border">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <FaImage className="h-5 w-5" />
                                Location Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    ref={locationFileInputRef}
                                    accept="image/*"
                                    onChange={handleLocationImageUpload}
                                    style={{ display: 'none' }}
                                    disabled={!canEdit}
                                />
                                <Button
                                    type="button"
                                    onClick={() => locationFileInputRef?.current?.click()}
                                    className="flex items-center gap-2"
                                    disabled={!canEdit || !locationFileInputRef}
                                >
                                    <FaUpload className="h-4 w-4" />
                                    Upload Location Images
                                </Button>

                                {/* Location Image Preview - Single Image Only */}
                                {locationImagePreviews.length > 0 && (
                                    <Card className="relative w-32 h-32 border-2 border-dashed">
                                        <CardContent className="p-0 h-full">
                                            <img
                                                src={locationImagePreviews[0].preview}
                                                alt="Location Preview"
                                                className="w-full h-full object-cover rounded"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => removeLocationImage(0)}
                                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                                                variant="destructive"
                                                size="sm"
                                                disabled={!canEdit}
                                            >
                                                ×
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coordinates Card */}
                    <Card className="border">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <FaLocationArrow className="h-5 w-5" />
                                GPS Coordinates
                                {formData.coordinates.latitude && formData.coordinates.longitude && " (from image metadata)"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {/* Coordinate Input Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Latitude</Label>
                                        <Input
                                            placeholder="Enter latitude"
                                            value={formData.coordinates.latitude || ''}
                                            onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                                            className="mt-2"
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Longitude</Label>
                                        <Input
                                            placeholder="Enter longitude"
                                            value={formData.coordinates.longitude || ''}
                                            onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                                            className="mt-2"
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Supporting Images Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaImage className="h-5 w-5 text-orange-600" />
                    Supporting Images
                </h3>
                <div className="space-y-6">

                    {/* Supporting Images Upload Card - Matching Location Images structure */}
                    <Card className="border">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <FaImage className="h-5 w-5" />
                                Supporting Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {documentFileInputRef && (
                                    <input
                                        type="file"
                                        ref={documentFileInputRef}
                                        accept="image/*"
                                        multiple
                                        onChange={handleDocumentUpload}
                                        style={{ display: 'none' }}
                                        disabled={!canEdit}
                                    />
                                )}
                                <Button
                                    type="button"
                                    onClick={() => documentFileInputRef?.current?.click()}
                                    className="flex items-center gap-2"
                                    disabled={!canEdit || !documentFileInputRef}
                                >
                                    <FaUpload className="h-4 w-4" />
                                    Upload Supporting Images
                                </Button>

                                {/* Uploaded Supporting Images Grid Preview */}
                                {documentPreviews?.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {documentPreviews.map((doc, index) => (
                                            <Card key={index} className="relative border border-gray-200 shadow-sm">
                                                <CardContent className="p-0">
                                                    {doc.url ? (
                                                        <>
                                                            <img
                                                                src={doc.url}
                                                                alt={doc.fileName}
                                                                className="w-full h-32 object-cover rounded-t-lg"
                                                            />
                                                            <div className="p-3 rounded-b-lg">
                                                                <p className="text-xs font-medium text-gray-900 truncate" title={doc.fileName}>{doc.fileName}</p>
                                                                <p className="text-xs text-gray-500">{doc.size ? Math.round(doc.size / 1024) : ''}KB</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
                                                            <FaImage className="h-8 w-8 text-gray-300" />
                                                        </div>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeDocument(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 bg-red-500 hover:bg-red-600"
                                                        size="sm"
                                                        disabled={!canEdit}
                                                    >
                                                        ×
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Property Images Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUpload className="h-5 w-5 text-orange-600" />
                    Property Images
                </h3>
                <p className="text-sm text-gray-600 mb-4">Select property areas to upload images</p>
                <div className="space-y-6">

                    {/* Area Selection Chips */}
                    <Card className="border">
                        <CardHeader className="border-b">
                            <CardTitle>Select Areas to Upload</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {propertyAreas.map((area) => (
                                    <div key={area}>
                                        <input
                                            type="file"
                                            ref={(ref) => setAreaFileRef(area, ref)}
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                // Auto-select the area when files are chosen
                                                if (!selectedAreas[area]) {
                                                    setSelectedAreas(prev => ({
                                                        ...prev,
                                                        [area]: true
                                                    }));
                                                    if (!areaUploads[area]) {
                                                        setAreaUploads(prev => ({
                                                            ...prev,
                                                            [area]: []
                                                        }));
                                                    }
                                                }
                                                // Upload the files
                                                handleAreaImageUpload(e, area);
                                            }}
                                            style={{ display: 'none' }}
                                            disabled={!canEdit}
                                        />
                                        <button
                                            key={area}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Open file picker directly
                                                areaFileRefs.current[area]?.click();
                                            }}
                                            disabled={!canEdit}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedAreas[area]
                                                    ? 'bg-orange-600 text-white border border-orange-700 shadow-md'
                                                    : 'bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300'
                                                } ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {area}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload Panels for Selected Areas */}
                    {Object.keys(selectedAreas).filter(area => selectedAreas[area]).length > 0 && (
                        <div className="space-y-4">
                            {Object.keys(selectedAreas)
                                .filter(area => selectedAreas[area])
                                .map((area) => {
                                    const uploads = areaUploads[area] || [];
                                    return (
                                        <Card key={area} className="border">
                                            <CardHeader className="border-b">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <FaImage className="h-4 w-4" />
                                                    {area}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    {/* Uploaded Images Grid */}
                                                    {uploads.length > 0 && (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                            {uploads.map((upload, index) => {
                                                                // Handle both new uploads (with preview) and database images (with url)
                                                                const imageSrc = upload.preview || upload.url;
                                                                const fileName = upload.fileName || `Image ${index + 1}`;
                                                                const fileSize = upload.size || 0;

                                                                return (
                                                                    <Card key={index} className="relative border border-gray-200 shadow-sm">
                                                                        <CardContent className="p-0">
                                                                            <img
                                                                                src={imageSrc}
                                                                                alt={fileName}
                                                                                className="w-full h-32 object-cover rounded-t-lg"
                                                                            />
                                                                            <div className="p-3 rounded-b-lg">
                                                                                <p className="text-xs font-medium text-gray-900 truncate" title={fileName}>{fileName}</p>
                                                                                <p className="text-xs text-gray-500">{fileSize ? Math.round(fileSize / 1024) : ''}KB</p>
                                                                            </div>
                                                                            <Button
                                                                                type="button"
                                                                                onClick={() => removeAreaImage(area, index)}
                                                                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 bg-red-500 hover:bg-red-600"
                                                                                size="sm"
                                                                                disabled={!canEdit}
                                                                            >
                                                                                ×
                                                                            </Button>
                                                                        </CardContent>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaFileAlt className="h-5 w-5 text-orange-600" />
                    Additional Notes
                </h3>
                <div className="space-y-2">
                    <Textarea
                        placeholder="Enter any additional notes or comments..."
                        name="notes"
                        value={formData.notes || ""}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                        rows={4}
                        className="rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:ring-orange-200 font-medium"
                    />
                </div>
            </div>
        </div>
    );
};

export default DocumentsPanel;