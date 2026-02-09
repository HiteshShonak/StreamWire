/**
 * 🖼️ IMAGE COMPRESSION UTILITY
 * Compresses images to WebP format for optimal performance
 * Uses 3x multiplier for Retina displays
 */

/**
 * Compresses an image file to WebP format
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1800px for 3x 600px display)
 * @param {number} options.quality - WebP quality 0-1 (default: 0.85)
 * @returns {Promise<File>} - Compressed WebP file
 */
export const compressImage = async (file, options = {}) => {
    const {
        maxWidth = 1800, // 3x of 600px base width for retina displays
        quality = 0.85    // High quality WebP
    } = options;

    return new Promise((resolve, reject) => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }

        // Create an image element
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        img.onload = () => {
            try {
                // Calculate new dimensions maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                
                // Enable image smoothing for better quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }

                        // Create a new File object from the blob
                        const compressedFile = new File(
                            [blob],
                            file.name.replace(/\.[^.]+$/, '.webp'), // Replace extension with .webp
                            {
                                type: 'image/webp',
                                lastModified: Date.now()
                            }
                        );

                        console.log('📊 Image Compression Stats:');
                        console.log(`  Original: ${(file.size / 1024).toFixed(2)} KB`);
                        console.log(`  Compressed: ${(compressedFile.size / 1024).toFixed(2)} KB`);
                        console.log(`  Saved: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`);
                        console.log(`  Dimensions: ${width}x${height}`);

                        resolve(compressedFile);
                    },
                    'image/webp',
                    quality
                );
            } catch (error) {
                reject(new Error(`Image processing failed: ${error.message}`));
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        // Read the file
        reader.readAsDataURL(file);
    });
};

/**
 * Compresses multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} - Array of compressed files
 */
export const compressImages = async (files, options = {}) => {
    const promises = files.map(file => compressImage(file, options));
    return Promise.all(promises);
};

/**
 * Validates if a file is an acceptable image type
 * @param {File} file - The file to validate
 * @returns {boolean} - True if valid image
 */
export const isValidImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
};

/**
 * Gets a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} - Data URL for preview
 */
export const getImagePreview = (file) => {
    return URL.createObjectURL(file);
};
