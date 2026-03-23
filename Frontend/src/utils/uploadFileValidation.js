import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_EXTENSIONS,
  ALLOWED_VIDEO_MIME_PREFIXES,
} from '../constants/upload.constants';

const toLower = (value = '') => String(value).toLowerCase();

const getExtension = (name = '') => {
  const cleanName = String(name || '');
  const dotIndex = cleanName.lastIndexOf('.');
  return dotIndex >= 0 ? toLower(cleanName.slice(dotIndex)) : '';
};

const hasAllowedVideoMime = (mime = '') => {
  const normalized = toLower(mime).split(';')[0].trim();
  if (!normalized) return false;
  return ALLOWED_VIDEO_MIME_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

const hasAllowedImageMime = (mime = '') => {
  const normalized = toLower(mime).split(';')[0].trim();
  if (!normalized) return false;
  return ALLOWED_IMAGE_MIMES.includes(normalized);
};

const hasAllowedExtension = (extension, allowedExtensions) =>
  allowedExtensions.includes(toLower(extension));

export const validateVideoFileType = (file) => {
  if (!file) {
    return { ok: false, code: 'missing-file', message: 'Please select a video file.' };
  }

  const extension = getExtension(file.name);
  const extOk = hasAllowedExtension(extension, ALLOWED_VIDEO_EXTENSIONS);
  const mimeOk = hasAllowedVideoMime(file.type);

  if (!extOk || !mimeOk) {
    return {
      ok: false,
      code: 'invalid-video-type',
      message: 'Unsupported video format. Use MP4, MOV, MKV, or WebM.',
    };
  }

  return { ok: true };
};

export const validateImageFileType = (file) => {
  if (!file) {
    return { ok: false, code: 'missing-file', message: 'Please select an image file.' };
  }

  const extension = getExtension(file.name);
  const extOk = hasAllowedExtension(extension, ALLOWED_IMAGE_EXTENSIONS);
  const mimeOk = hasAllowedImageMime(file.type);

  if (!extOk || !mimeOk) {
    return {
      ok: false,
      code: 'invalid-image-type',
      message: 'Unsupported image format. Use JPG, PNG, WebP, or GIF.',
    };
  }

  return { ok: true };
};
