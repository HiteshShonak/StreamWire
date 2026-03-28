import { v2 as cloudinary } from "cloudinary";
import { safeUnlink } from "./tempFileCleanup.js";

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
    if (!localFilePath) return null;

    try {
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
            // Upload video as-is and let Cloudinary process it async.
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
        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:");
        console.error("   Error:", error.message);
        console.error("   File:", localFilePath);
        console.error("   Type:", fileType);
        if (error.http_code) console.error("   HTTP Code:", error.http_code);
        return null;
    } finally {
        safeUnlink(localFilePath, { reason: `cloudinary-${fileType}` });
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

// Build a thumbnail URL from the video.
const generateAutoThumbnail = (videoPublicId, options = {}) => {
    const {
        time = "1",
        width = 1280,
        height = 720,
        crop = "fill",
        gravity = "auto"
    } = options;

    // Build the URL directly.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const transformations = `so_${time},c_${crop},w_${width},h_${height},g_${gravity},q_auto`;

    return `https://res.cloudinary.com/${cloudName}/video/upload/${transformations}/${videoPublicId}.jpg`;
};

export { uploadOnCloudinary, deleteFromCloudinary, sanitizeFilename, generateAutoThumbnail };