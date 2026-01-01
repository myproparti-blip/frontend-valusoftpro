/**
 * Compress image to small file size while maintaining reasonable quality
 * Optimized for basic compression with minimal visual quality loss
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 480)
 * @param {number} maxHeight - Maximum height in pixels (default: 360)
 * @param {number} quality - Quality from 0-1 (default: 0.5 for small file size)
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file, maxWidth = 480, maxHeight = 360, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    // Validate that file is a Blob instance
    if (!file || !(file instanceof Blob)) {
      reject(new Error(`Invalid file: expected Blob object, got ${typeof file}`));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob with low quality
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Compress multiple images
 * @param {File[]} files - Array of image files to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 480)
 * @param {number} maxHeight - Maximum height in pixels (default: 360)
 * @param {number} quality - Quality from 0-1 (default: 0.5)
 * @returns {Promise<File[]>} Array of compressed image files
 */
export const compressMultipleImages = async (files, maxWidth = 480, maxHeight = 360, quality = 0.5) => {
  try {
    const compressedFiles = await Promise.all(
      files.map(file => compressImage(file, maxWidth, maxHeight, quality))
    );
    return compressedFiles;
  } catch (error) {
    throw error;
  }
};
