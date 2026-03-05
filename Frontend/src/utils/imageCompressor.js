// image compression helpers

// compress single image to webp
export const compressImage = async (file, options = {}) => {
    const {
        maxWidth = 1800, // 3x of 600px base width for retina displays
        quality = 0.85    // High quality WebP
    } = options;

    return new Promise((resolve, reject) => {
        
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }

        
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
                // scale down if needed
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                
                const ctx = canvas.getContext('2d');

                
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height);

                // convert to webp
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }

                        
                        const compressedFile = new File(
                            [blob],
                            file.name.replace(/\.[^.]+$/, '.webp'), // Replace extension with .webp
                            {
                                type: 'image/webp',
                                lastModified: Date.now()
                            }
                        );

                        console.log('Image Compression Stats:');
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

        
        reader.readAsDataURL(file);
    });
};

// compress multiple images
export const compressImages = async (files, options = {}) => {
    const promises = files.map(file => compressImage(file, options));
    return Promise.all(promises);
};

// check if file is a valid image type
export const isValidImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
};

// get preview url for an image
export const getImagePreview = (file) => {
    return URL.createObjectURL(file);
};
