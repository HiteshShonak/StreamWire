export const MAX_VIDEO_UPLOAD_MB = 100;
export const MAX_VIDEO_UPLOAD_BYTES = MAX_VIDEO_UPLOAD_MB * 1024 * 1024;

export const MAX_THUMBNAIL_UPLOAD_MB = 5;
export const MAX_THUMBNAIL_UPLOAD_BYTES = MAX_THUMBNAIL_UPLOAD_MB * 1024 * 1024;

export const ALLOWED_VIDEO_EXTENSIONS = [
	'.mp4',
	'.mov',
	'.mkv',
	'.webm',
	'.avi',
	'.flv',
	'.wmv',
	'.mpeg',
	'.mpg',
	'.m4v',
	'.3gp',
	'.ts',
];

export const ALLOWED_VIDEO_MIME_PREFIXES = ['video/'];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const ALLOWED_IMAGE_MIMES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
];

export const ENABLE_CHUNKED_UPLOAD = String(import.meta.env.VITE_ENABLE_CHUNKED_UPLOAD || 'false').toLowerCase() === 'true';
export const CHUNK_UPLOAD_SIZE_MB = Number(import.meta.env.VITE_UPLOAD_CHUNK_SIZE_MB || 5);
export const CHUNK_UPLOAD_SIZE_BYTES = Math.max(1, CHUNK_UPLOAD_SIZE_MB) * 1024 * 1024;
