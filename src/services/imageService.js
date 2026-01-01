import api from "./axios";
import { compressImage, compressMultipleImages } from "../utils/imageCompression";

const handleError = (error, defaultMessage) => {
  let errorMessage = defaultMessage;
  
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  throw new Error(errorMessage);
};

/**
 * Upload images to Cloudinary via server
 * @param {File[]} files - Array of image files
 * @param {String} folderPath - Cloudinary folder path (e.g., 'valuations/properties')
 * @returns {Promise} Response with uploaded images data
 */
export const uploadImages = async (files, folderPath) => {
  try {
    const formData = new FormData();
    
    // Append all files
    if (Array.isArray(files)) {
      files.forEach((file) => {
        if (file) {
          formData.append('images', file);
        }
      });
    } else {
      formData.append('images', files);
    }
    
    formData.append('folderPath', folderPath);

    const response = await api.post("/images/upload", formData);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to upload images");
  }
};

/**
 * Upload base64 image to Cloudinary
 * @param {String} base64String - Base64 encoded image string
 * @param {String} folderPath - Cloudinary folder path
 * @param {String} fileName - Original file name
 * @returns {Promise} Response with uploaded image data
 */
export const uploadBase64Image = async (base64String, folderPath, fileName = "") => {
  try {
    const response = await api.post("/images/upload-base64", {
      base64String,
      folderPath,
      fileName
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to upload image");
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID of the image
 * @returns {Promise} Response confirming deletion
 */
export const deleteImage = async (publicId) => {
  try {
    const response = await api.post("/images/delete", {
      publicId
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to delete image");
  }
};

/**
 * Upload multiple images and return array of results
 * @param {Object[]} imageArray - Array of image objects with file property
 * @param {String} folderPath - Cloudinary folder path
 * @returns {Promise} Array of uploaded image data
 */
export const uploadMultipleImages = async (imageArray, folderPath) => {
  try {
    const files = imageArray
      .filter(img => img && img.file)
      .map(img => img.file);

    if (files.length === 0) {
      return [];
    }

    const result = await uploadImages(files, folderPath);
    return result.images || [];
  } catch (error) {
    handleError(error, "Failed to upload multiple images");
  }
};

/**
 * Upload images from file inputs and maintain structure
 * @param {Object[]} imagePreviews - Array of preview objects with file property
 * @param {String} baseFolder - Base folder path in Cloudinary
 * @returns {Promise} Array of uploaded image data with original structure
 */
export const uploadPropertyImages = async (imagePreviews, uniqueId) => {
  try {
    // Filter valid images - must have actual File/Blob object
    const validImages = imagePreviews.filter(img => 
      img && img.file && (img.file instanceof Blob || img.file instanceof File)
    );
    
    if (validImages.length === 0) {
      return [];
    }

    // Compress all images in parallel
    const compressionPromises = validImages.map((imagePreview, i) =>
      compressImage(imagePreview.file)
        .then(compressedFile => ({ compressedFile, imagePreview, index: i }))
        .catch(error => {
          console.error('Error compressing image:', error);
          return null;
        })
    );
    
    const compressedImages = (await Promise.all(compressionPromises)).filter(img => img !== null);

    // Upload all compressed images in parallel
    const uploadPromises = compressedImages.map(({ compressedFile, imagePreview, index }) => {
      const formData = new FormData();
      formData.append('images', compressedFile);
      formData.append('folderPath', `valuations/${uniqueId}/property_images`);
      
      return api.post("/images/upload", formData)
        .then(response => {
          if (response.data.images && response.data.images.length > 0) {
            return {
              ...response.data.images[0],
              inputNumber: imagePreview.inputNumber || index + 1
            };
          }
          return null;
        });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages.filter(img => img !== null);
  } catch (error) {
    handleError(error, "Failed to upload property images");
  }
};

/**
 * Upload location images
 * @param {Object[]} locationImagePreviews - Array of location image preview objects
 * @param {String} uniqueId - Unique ID for the valuation
 * @returns {Promise} Array of uploaded location images
 */
export const uploadLocationImages = async (locationImagePreviews, uniqueId) => {
  try {
    // Filter valid images - must have actual File/Blob object
    const validImages = locationImagePreviews.filter(img => 
      img && img.file && (img.file instanceof Blob || img.file instanceof File)
    );
    
    if (validImages.length === 0) {
      return [];
    }

    // Compress all images in parallel
    const compressionPromises = validImages.map((imagePreview, i) =>
      compressImage(imagePreview.file)
        .then(compressedFile => ({ compressedFile, imagePreview, index: i }))
        .catch(error => {
          console.error('Error compressing location image:', error);
          return null;
        })
    );
    
    const compressedImages = (await Promise.all(compressionPromises)).filter(img => img !== null);

    // Upload all compressed images in parallel
    const uploadPromises = compressedImages.map(({ compressedFile }) => {
      const formData = new FormData();
      formData.append('images', compressedFile);
      formData.append('folderPath', `valuations/${uniqueId}/location_images`);
      
      return api.post("/images/upload", formData)
        .then(response => {
          if (response.data.images && response.data.images.length > 0) {
            return response.data.images[0];
          }
          return null;
        });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages.filter(img => img !== null);
  } catch (error) {
    handleError(error, "Failed to upload location images");
  }
};

/**
 * Upload documents (PDFs, reports, etc.)
 * @param {Object[]} documentPreviews - Array of document preview objects
 * @param {String} uniqueId - Unique ID for the valuation
 * @returns {Promise} Array of uploaded document data
 */
export const uploadDocuments = async (documentPreviews, uniqueId) => {
   try {
     // Filter valid documents - must have a File object and it must be a File instance
     const validDocuments = documentPreviews.filter(doc => 
       doc && doc.file && (doc.file instanceof File || (doc.file.constructor && doc.file.constructor.name === 'File'))
     );
     
     ('📄 uploadDocuments - Filtering:', {
       total: documentPreviews.length,
       valid: validDocuments.length,
       previews: documentPreviews.map(d => ({ hasFile: !!d?.file, fileType: d?.file?.constructor?.name }))
     });
     
     if (validDocuments.length === 0) {
       ('⚠️ No valid documents to upload, returning empty array');
       return [];
     }

     // Upload all documents in parallel
     const uploadPromises = validDocuments.map(({ file, fileName }) => {
       const formData = new FormData();
       formData.append('documents', file);
       formData.append('folderPath', `valuations/${uniqueId}/documents`);
       
       ('📤 Uploading document:', fileName, 'Size:', file.size);
       
       return api.post("/documents/upload", formData)
         .then(response => {
           if (response.data.documents && response.data.documents.length > 0) {
             return response.data.documents[0];
           }
           return null;
         });
     });

     const uploadedDocuments = await Promise.all(uploadPromises);
     return uploadedDocuments.filter(doc => doc !== null);
   } catch (error) {
     handleError(error, "Failed to upload documents");
   }
};

/**
 * Upload supporting images (similar to property images)
 * @param {Object[]} documentPreviews - Array of document preview objects with file property
 * @param {String} uniqueId - Unique ID for the valuation
 * @returns {Promise} Array of uploaded supporting images data
 */
export const uploadSupportingDocuments = async (documentPreviews, uniqueId) => {
    try {
      // Filter valid documents - must have actual File/Blob object
      const validDocuments = documentPreviews.filter(doc => 
        doc && doc.file && (doc.file instanceof Blob || doc.file instanceof File)
      );
      
      if (validDocuments.length === 0) {
        return [];
      }

      // Compress all images in parallel
      const compressionPromises = validDocuments.map((doc, i) =>
        compressImage(doc.file)
          .then(compressedFile => ({ compressedFile, doc, index: i }))
          .catch(error => {
            console.error('Error compressing supporting document:', error);
            return null;
          })
      );
      
      const compressedDocuments = (await Promise.all(compressionPromises)).filter(doc => doc !== null);

     // Upload all compressed images in parallel
     const uploadPromises = compressedDocuments.map(({ compressedFile, doc }) => {
       const formData = new FormData();
       formData.append('images', compressedFile);
       formData.append('folderPath', `valuations/${uniqueId}/supporting_documents`);
       
       return api.post("/images/upload", formData)
         .then(response => {
           if (response.data.images && response.data.images.length > 0) {
             return {
               ...response.data.images[0],
               fileName: doc.fileName || doc.file?.name || 'Document'
             };
           }
           return null;
         });
     });

     const uploadedDocuments = await Promise.all(uploadPromises);
     return uploadedDocuments.filter(doc => doc !== null);
   } catch (error) {
     handleError(error, "Failed to upload supporting documents");
   }
};