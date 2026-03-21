import multer from "multer";
import path from "path";
import fs from "fs";


const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // strip codec params e.g. "video/webm;codecs=vp9,opus" → "video/webm"
    const baseType = file.mimetype.split(';')[0].trim();
    if (baseType.startsWith('video/') || baseType.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error("File type not supported. Only images and videos are allowed."), false);
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB limit
    fileFilter: fileFilter
});