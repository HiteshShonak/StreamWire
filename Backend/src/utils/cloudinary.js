import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const sanitizeFilename = (text) => {
    if (!text) return "";
    return text.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").substring(0, 30);
};

const uploadOnCloudinary = async (localFilePath, fileType = "others", filename = null) => {
    try {
        if (!localFilePath) return null;

        const isVideo = localFilePath.match(/\.(mp4|mkv|mov|avi)$/i);

        let options = {
            resource_type: "auto",
            public_id: filename,
            use_filename: !!filename,
            unique_filename: false,
        };

        if (isVideo) {
            options.folder = "streamwire_videos";
            options.resource_type = "video";
            // Video is already compressed locally, just upload as-is
            // Use eager_async for longer videos to avoid timeout
            options.eager_async = true;
            options.eager = [
                { format: "mp4", video_codec: "h264" }
            ];
        }

        else if (fileType === "avatar") {
            options.folder = "streamwire_users";
            options.transformation = [
                { width: 500, height: 500, crop: "fill" },
                { quality: "auto:best" },
                { fetch_format: "webp" }
            ];
        }

        else if (fileType === "cover") {
            options.folder = "streamwire_users";
            options.transformation = [
                { width: 1280, crop: "limit" },
                { quality: "auto:best" },
                { fetch_format: "webp" }
            ];
        }

        else if (fileType === "thumbnail") {
            options.folder = "streamwire_videos";
            options.transformation = [
                { width: 1280, crop: "limit" },
                { quality: "auto:best" },
                { fetch_format: "webp" }
            ];
        }

        else if (fileType === "tweet") {
            options.folder = "streamwire_tweets";
            options.transformation = [
                { width: 1200, crop: "limit" },
                { quality: "auto:best" },
                { fetch_format: "webp" }
            ];
        }

        else {
            options.folder = "streamwire_others";
            options.transformation = [
                { quality: "auto:best" },
                { fetch_format: "auto" }
            ];
        }

        const response = await cloudinary.uploader.upload(localFilePath, options);
        console.log(`Cloudinary upload success: ${response.public_id}`);
        fs.unlinkSync(localFilePath); // Clean local temp file
        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:");
        console.error("   Error:", error.message);
        console.error("   File:", localFilePath);
        console.error("   Type:", fileType);
        if (error.http_code) console.error("   HTTP Code:", error.http_code);
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true
        });

        return result;

    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
}

/**
 * Generate auto-thumbnail URL from video
 * Cloudinary can grab a frame from any video automatically!
 * Just swap the extension from .mp4 to .jpg
 * 
 * @param {string} videoPublicId - The public_id of the video (includes folder path)
 * @param {object} options - Optional transformations
 * @returns {string} - The auto-generated thumbnail URL
 * 
 * Docs: https://cloudinary.com/documentation/video_effects_and_enhancements#video_thumbnails
 */
const generateAutoThumbnail = (videoPublicId, options = {}) => {
    const {
        time = "1",  // Time offset in seconds (e.g., "5" for 5 seconds in)
        width = 1280,
        height = 720,
        crop = "fill",
        gravity = "auto" // Smart crop to focus on content
    } = options;

    // Build URL manually for maximum control
    // Format: https://res.cloudinary.com/{cloud}/video/upload/{transformations}/{public_id}.jpg
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const transformations = `so_${time},c_${crop},w_${width},h_${height},g_${gravity},q_auto`;

    return `https://res.cloudinary.com/${cloudName}/video/upload/${transformations}/${videoPublicId}.jpg`;
};

export { uploadOnCloudinary, deleteFromCloudinary, sanitizeFilename, generateAutoThumbnail };