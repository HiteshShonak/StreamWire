import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import Groq from "groq-sdk";
import { Video } from "../models/video.model.js";
import { ApiError } from "./ApiError.js";

// Configure FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Lazy-load Groq
let groq = null;
const getGroq = () => {
    if (!groq) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groq;
};

// Safely delete file if it exists
const safeDelete = (path) => {
    try {
        if (path && fs.existsSync(path)) fs.unlinkSync(path);
    } catch (e) {
        console.log(`[System] Failed to delete temp file: ${path}`, e.message);
    }
};

// Download file from URL to temp location
const downloadFromUrl = async (url, destPath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const protocol = url.startsWith('https') ? https : http;

        const request = (targetUrl) => {
            protocol.get(targetUrl, (response) => {
                // Handle redirects
                if (response.statusCode === 301 || response.statusCode === 302) {
                    const redirectUrl = response.headers.location;
                    const redirectProtocol = redirectUrl.startsWith('https') ? https : http;
                    redirectProtocol.get(redirectUrl, (redirectResponse) => {
                        redirectResponse.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            resolve(destPath);
                        });
                    }).on('error', reject);
                } else if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve(destPath);
                    });
                } else {
                    reject(new Error(`HTTP ${response.statusCode}`));
                }
            }).on('error', (err) => {
                fs.unlink(destPath, () => { }); // Cleanup on error
                reject(err);
            });
        };

        request(url);
    });
};

// Retry helper with backoff (handles rate limiting)
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 3000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimited = error.message?.includes('429') || error.message?.includes('quota');
            const isLastAttempt = attempt === maxRetries;

            if (isLastAttempt || !isRateLimited) {
                throw error;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1); // 3s, 6s, 12s
            console.log(`[AI Worker] Rate limited. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Background task wrapper (replaces asyncHandler for non-HTTP tasks)
const executeBackgroundTask = async (taskName, resourcesToCleanup, taskLogic) => {
    try {
        console.log(`[AI Worker] Starting: ${taskName}`);
        await taskLogic();
        console.log(`[AI Worker] Completed: ${taskName}`);
    } catch (error) {
        const errorMsg = error instanceof ApiError ? error.message : "Internal AI Service Error";
        console.error(`[AI Worker] Failed (${taskName}):`, errorMsg);
        if (error.stack && !(error instanceof ApiError)) console.error(error.stack);
    } finally {
        if (resourcesToCleanup && Array.isArray(resourcesToCleanup)) {
            resourcesToCleanup.forEach(path => safeDelete(path));
        }
    }
};

/**
 * Generate metadata from Cloudinary URL
 * Downloads video → Extracts audio with FFmpeg → Transcribes with Groq Whisper
 * Can also generate description if user didn't provide one
 * This saves bandwidth and processing time!
 * 
 * @param {string} cloudinaryUrl - The Cloudinary URL of the video
 * @param {string} videoId - The MongoDB video ID
 * @param {object} options - Optional settings
 * @param {boolean} options.generateDescription - Whether to AI-generate description
 */
export const generateVideoMetadataFromUrl = async (cloudinaryUrl, videoId, options = {}) => {
    const { generateDescription = false } = options;
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    const videoPath = path.join(tempDir, `temp_${videoId}.mp4`);
    const audioPath = path.join(tempDir, `temp_${videoId}.mp3`);

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    await executeBackgroundTask(
        `Metadata Gen from URL for ${videoId}`,
        [videoPath, audioPath], // Files to auto-delete in 'finally'
        async () => {

            // 1. Validation
            if (!videoId) throw new ApiError(400, "Video ID is missing for AI processing");
            if (!cloudinaryUrl) throw new ApiError(400, "Cloudinary URL is missing");

            console.log(`[AI Worker] Downloading video from Cloudinary...`);

            // 2. Download video from Cloudinary
            await downloadFromUrl(cloudinaryUrl, videoPath);

            if (!fs.existsSync(videoPath)) {
                throw new ApiError(500, "Failed to download video from Cloudinary");
            }

            const videoStats = fs.statSync(videoPath);
            console.log(`[AI Worker] Video downloaded (${(videoStats.size / 1024 / 1024).toFixed(2)} MB). Extracting audio...`);

            // 3. Extract optimized audio with FFmpeg (saves bandwidth!)
            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .noVideo()
                    .audioCodec('libmp3lame')
                    .audioBitrate('64k') // Compressed for efficiency
                    .audioChannels(1)    // Mono (halves file size)
                    .audioFrequency(16000) // 16kHz is perfect for speech
                    .output(audioPath)
                    .on('start', (cmd) => console.log(`[FFmpeg] Starting: ${cmd}`))
                    .on('end', () => {
                        console.log(`[FFmpeg] Audio extraction complete`);
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error(`[FFmpeg] Error: ${err.message}`);
                        reject(new ApiError(500, `FFmpeg processing failed: ${err.message}`));
                    })
                    .run();
            });

            if (!fs.existsSync(audioPath)) {
                throw new ApiError(500, "Failed to extract audio from video");
            }

            const audioStats = fs.statSync(audioPath);
            const savings = ((1 - audioStats.size / videoStats.size) * 100).toFixed(1);
            console.log(`[AI Worker] Audio extracted (${(audioStats.size / 1024 / 1024).toFixed(2)} MB) - ${savings}% smaller!`);

            // 4. Transcribe with Groq Whisper (best-in-class accuracy!)
            console.log(`[AI Worker] Transcribing with Groq Whisper...`);

            const transcription = await retryWithBackoff(async () => {
                return await getGroq().audio.transcriptions.create({
                    file: fs.createReadStream(audioPath),
                    model: "whisper-large-v3-turbo", // Best accuracy, still fast
                    response_format: "text",
                    language: "en", // Set to auto-detect if needed
                });
            }, 3, 2000);

            const transcript = transcription || "";
            console.log(`[AI Worker] Transcript received (${transcript.length} chars). Generating tags...`);

            // 5. Generate Tags with Llama (super fast on Groq!)
            const tagsResponse = await retryWithBackoff(async () => {
                return await getGroq().chat.completions.create({
                    model: "llama-3.3-70b-versatile", // Fast & capable
                    messages: [
                        {
                            role: "system",
                            content: "You are a video SEO expert. Generate 5-8 relevant, searchable tags for videos. Return ONLY a JSON array of strings, no explanation."
                        },
                        {
                            role: "user",
                            content: `Generate SEO tags for this video transcript:\n\n"${transcript.substring(0, 2000)}"\n\nReturn only a JSON array like: ["tag1", "tag2", "tag3"]`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 200,
                });
            }, 3, 2000);

            // 6. Parse Tags
            let tags = [];
            try {
                const tagsText = tagsResponse.choices[0]?.message?.content || "[]";
                tags = JSON.parse(tagsText.replace(/```json|```/g, "").trim());
                if (!Array.isArray(tags)) tags = [];
            } catch (e) {
                console.log(`[AI Worker] Failed to parse tags, using empty array`);
            }

            // 7. Generate Description (if needed)
            let description = "";
            if (generateDescription && transcript) {
                console.log(`[AI Worker] Generating AI description...`);
                const descriptionResponse = await retryWithBackoff(async () => {
                    return await getGroq().chat.completions.create({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            {
                                role: "system",
                                content: "You are a video content writer. Write engaging, SEO-friendly video descriptions. Keep it concise (2-3 sentences), informative, and appealing. Don't use emojis or hashtags."
                            },
                            {
                                role: "user",
                                content: `Write a brief, engaging description for a video with this transcript:\n\n"${transcript.substring(0, 1500)}"\n\nReturn ONLY the description text, nothing else.`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 200,
                    });
                }, 3, 2000);

                description = descriptionResponse.choices[0]?.message?.content?.trim() || "";
                console.log(`[AI Worker] Description generated: "${description.substring(0, 50)}..."`);
            }

            // 8. Update Database
            const updateData = {
                $set: {
                    transcript: transcript,
                },
                $addToSet: { tags: { $each: tags } }
            };

            // Only update description if AI generated one
            if (generateDescription && description) {
                updateData.$set.description = description;
            }

            const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, { new: true });

            if (!updatedVideo) throw new ApiError(404, "Video not found in DB during update");

            // SUCCESS SUMMARY
            console.log(`\n${'='.repeat(60)}`);
            console.log(`AI PROCESSING COMPLETE - Video ID: ${videoId}`);
            console.log(`${'='.repeat(60)}`);
            console.log(`Transcript Generated: ${transcript ? 'YES' : 'NO'}`);
            console.log(`   └─ Length: ${transcript.length || 0} characters`);
            console.log(`   └─ Preview: "${transcript.substring(0, 100)}${transcript.length > 100 ? '...' : ''}"`);
            console.log(`Tags Generated: ${tags.length || 0} tags`);
            console.log(`   └─ Tags: [${tags.join(', ') || 'none'}]`);
            if (generateDescription) {
                console.log(`Description Generated: ${description ? 'YES' : 'NO'}`);
                console.log(`   └─ Preview: "${description.substring(0, 80)}${description.length > 80 ? '...' : ''}"`);
            }
            console.log(`Video Stats:`);
            console.log(`   └─ Title: ${updatedVideo.title}`);
            console.log(`   └─ Total Tags: ${updatedVideo.tags?.length || 0}`);
            console.log(`${'='.repeat(60)}\n`);
        }
    );
};
