import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import path from 'path';
import fs from 'fs';

// Set ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const compressVideo = async (inputPath, targetSizeMB = 90) => {
    return new Promise((resolve, reject) => {
        const inputDir = path.dirname(inputPath);
        const inputExt = path.extname(inputPath);
        const inputBase = path.basename(inputPath, inputExt);
        const outputPath = path.join(inputDir, `${inputBase}_compressed.mp4`);

        // Get input file size
        const inputStats = fs.statSync(inputPath);
        const inputSizeMB = inputStats.size / (1024 * 1024);

        // skip if already small enough
        if (inputSizeMB <= targetSizeMB - 5) {
            resolve(inputPath);
            return;
        }

        // Get video duration first
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                console.error('FFprobe error:', err);
                reject(err);
                return;
            }

            const duration = metadata.format.duration || 60;

            // target bitrate with 15% safety margin
            const safeTargetMB = targetSizeMB * 0.85;
            const totalBitrate = Math.floor((safeTargetMB * 8 * 1024) / duration);
            const audioBitrate = 96;
            const videoBitrate = Math.max(200, totalBitrate - audioBitrate);

            // downscale if bitrate is too low for decent quality
            const needsDownscale = videoBitrate < 400;

            console.log(`   Duration: ${duration.toFixed(2)}s (${(duration / 60).toFixed(1)} min)`);
            console.log(`   Target bitrate: ${videoBitrate}kbps video + ${audioBitrate}kbps audio`);
            if (needsDownscale) console.log(`   Low bitrate - will downscale to 720p`);

            const outputOptions = [
                '-c:v libx264',
                '-preset medium',              // Better compression than 'fast'
                `-b:v ${videoBitrate}k`,
                `-maxrate ${videoBitrate}k`,   // Strict max bitrate
                `-bufsize ${videoBitrate}k`,   // Match bufsize to bitrate
                '-c:a aac',
                `-b:a ${audioBitrate}k`,
                '-movflags +faststart',
                '-y'
            ];

            // add downscale filter for low-bitrate encodes
            if (needsDownscale) {
                outputOptions.push('-vf scale=-2:720');  // 720p
            }

            ffmpeg(inputPath)
                .outputOptions(outputOptions)
                .output(outputPath)
                .on('start', () => {
                    console.log('   FFmpeg encoding...');
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        process.stdout.write(`\r   Progress: ${progress.percent.toFixed(1)}%`);
                    }
                })
                .on('end', async () => {
                    console.log('\n   First pass complete!');

                    const outputStats = fs.statSync(outputPath);
                    const outputSizeMB = outputStats.size / (1024 * 1024);
                    console.log(`   Output: ${outputSizeMB.toFixed(2)} MB`);

                    // second pass if first wasn't enough
                    if (outputSizeMB > targetSizeMB) {
                        console.log(`   Still over ${targetSizeMB}MB, doing aggressive recompress...`);

                        const secondPassPath = path.join(inputDir, `${inputBase}_final.mp4`);

                        const ratio = targetSizeMB / outputSizeMB;
                        const newBitrate = Math.floor(videoBitrate * ratio * 0.85);

                        ffmpeg(outputPath)
                            .outputOptions([
                                '-c:v libx264',
                                '-preset medium',
                                `-b:v ${newBitrate}k`,
                                `-maxrate ${newBitrate}k`,
                                `-bufsize ${newBitrate}k`,
                                '-vf scale=-2:720',  // Force 720p
                                '-c:a aac',
                                '-b:a 64k',          // Lower audio
                                '-movflags +faststart',
                                '-y'
                            ])
                            .output(secondPassPath)
                            .on('progress', (progress) => {
                                if (progress.percent) {
                                    process.stdout.write(`\r   Second pass: ${progress.percent.toFixed(1)}%`);
                                }
                            })
                            .on('end', () => {
                                console.log('\n   Second pass complete!');

                                const finalStats = fs.statSync(secondPassPath);
                                const finalSizeMB = finalStats.size / (1024 * 1024);
                                console.log(`   Final size: ${finalSizeMB.toFixed(2)} MB`);
                                console.log(`   Total saved: ${((1 - finalSizeMB / inputSizeMB) * 100).toFixed(1)}%`);

                                try {
                                    fs.unlinkSync(inputPath);
                                    fs.unlinkSync(outputPath);
                                } catch (e) { }

                                resolve(secondPassPath);
                            })
                            .on('error', (err) => {
                                console.error('\n   Second pass error:', err.message);
                                try { fs.unlinkSync(inputPath); } catch (e) { }
                                resolve(outputPath);
                            })
                            .run();
                    } else {
                        console.log(`   Saved: ${((1 - outputSizeMB / inputSizeMB) * 100).toFixed(1)}%`);
                        try {
                            fs.unlinkSync(inputPath);
                        } catch (e) { }
                        resolve(outputPath);
                    }
                })
                .on('error', (err) => {
                    console.error('\n   FFmpeg error:', err.message);
                    if (fs.existsSync(outputPath)) {
                        fs.unlinkSync(outputPath);
                    }
                    reject(err);
                })
                .run();
        });
    });
};

export default compressVideo;
