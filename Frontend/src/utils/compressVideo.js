/**
 * Quick first-pass video compression using browser-native canvas + MediaRecorder.
 * Zero dependencies. Works on all modern browsers (Chrome, Edge, Firefox).
 *
 * Strategy:
 * - Skip if file is < 50MB (already small)
 * - Draw video frames onto a canvas and record with MediaRecorder at a target bitrate
 * - Play at 4x speed to compress ~4x faster than real time
 * - Target ~1.5 Mbps video — good enough for streaming, fast to produce
 */

const SKIP_THRESHOLD_MB = 0; // Compress all videos regardless of size
const TARGET_VIDEO_BITRATE = 8_000_000; // 8 Mbps - High Quality 1080p retention
const PLAYBACK_RATE = 4; // 4x speed = compress in 1/4 the video duration

/** Clamp a dimension to the nearest even number (required by some codecs) */
const even = (n) => Math.floor(n / 2) * 2;

/**
 * Compress a video File using canvas + MediaRecorder.
 *
 * @param {File} file - The original video file
 * @param {function} onProgress - Called with (percent: 0–100, label: string)
 * @returns {Promise<File>} - Compressed file, or original if skipped/unsupported
 */
export async function compressVideo(file, onProgress = () => {}) {
  const fileMB = file.size / (1024 * 1024);

  // Skip small files
  if (fileMB < SKIP_THRESHOLD_MB) {
    onProgress(100, 'Skipped (file already small)');
    return file;
  }

  // Check browser support
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    console.warn('compressVideo: MediaRecorder or captureStream not supported, skipping compression.');
    onProgress(100, 'Skipped (browser unsupported)');
    return file;
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);

    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      const vw = even(video.videoWidth || 1280);
      const vh = even(video.videoHeight || 720);

      // Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext('2d');

      // Pick best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm';

      // Capture canvas stream + record
      const stream = canvas.captureStream(30);
      let recorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: TARGET_VIDEO_BITRATE,
        });
      } catch {
        // Fallback: unsupported options
        recorder = new MediaRecorder(stream);
      }

      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        URL.revokeObjectURL(video.src);
        const blob = new Blob(chunks, { type: mimeType });

        // Only use compressed if it's actually smaller
        if (blob.size >= file.size) {
          resolve(file); // Original was somehow smaller
          return;
        }

        const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.webm'), {
          type: mimeType,
          lastModified: Date.now(),
        });
        onProgress(100, 'Done');
        resolve(compressed);
      };

      // Draw frames at playback speed
      video.playbackRate = PLAYBACK_RATE;

      const drawFrame = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, vw, vh);

        // Report progress based on video position
        const pct = Math.min(99, Math.round((video.currentTime / duration) * 100));
        onProgress(pct, `Compressing ${pct}%...`);

        requestAnimationFrame(drawFrame);
      };

      video.addEventListener('play', () => {
        recorder.start(250); // collect chunks every 250ms
        drawFrame();
      });

      video.addEventListener('ended', () => {
        recorder.stop();
      });

      // Error fallback — just return original
      video.addEventListener('error', () => {
        URL.revokeObjectURL(video.src);
        onProgress(100, 'Skipped (video error)');
        resolve(file);
      });

      video.play().catch(() => {
        URL.revokeObjectURL(video.src);
        onProgress(100, 'Skipped (play error)');
        resolve(file);
      });
    });

    video.addEventListener('error', () => {
      URL.revokeObjectURL(video.src);
      onProgress(100, 'Skipped (load error)');
      resolve(file);
    });
  });
}
