import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'os';
import path from 'path';
import fs from 'fs';
import express from 'express';
import request from 'supertest';
import { upload } from '../src/middlewares/multer.middleware.js';
import { ApiError } from '../src/utils/ApiError.js';
import { MAX_THUMBNAIL_UPLOAD_MB, MAX_VIDEO_UPLOAD_MB } from '../src/constants.js';

const cleanupUploadedTempFiles = (req) => {
    const paths = [];

    if (req.file?.path) {
        paths.push(req.file.path);
    }

    const files = req.files;
    if (files && typeof files === 'object') {
        Object.values(files).forEach((entry) => {
            if (Array.isArray(entry)) {
                entry.forEach((file) => {
                    if (file?.path) paths.push(file.path);
                });
                return;
            }

            if (entry?.path) {
                paths.push(entry.path);
            }
        });
    }

    paths.forEach((filePath) => {
        try {
            fs.unlinkSync(filePath);
        } catch {}
    });
};

const createTestApp = () => {
    const app = express();

    app.post(
        '/api/v1/videos/publish',
        upload.fields([
            { name: 'videoFile', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
        ]),
        (req, res, next) => {
            const videoPath = req.files?.videoFile?.[0]?.path;

            if (!videoPath) {
                return next(new ApiError(400, 'Video file is required'));
            }

            try {
                fs.unlinkSync(videoPath);
            } catch {}

            return res.status(201).json({ success: true });
        }
    );

    app.use((err, req, res, _next) => {
        cleanupUploadedTempFiles(req);

        let statusCode = err.statusCode || 500;
        let message = err.message || 'Internal Server Error';

        if (err?.name === 'MulterError') {
            statusCode = 400;
            if (err.code === 'LIMIT_FILE_SIZE') {
                message = `File too large. Max video size is ${MAX_VIDEO_UPLOAD_MB}MB and max thumbnail size is ${MAX_THUMBNAIL_UPLOAD_MB}MB.`;
            }
        }

        return res.status(statusCode).json({
            success: false,
            statusCode,
            message,
            errors: err.errors || [],
        });
    });

    return app;
};

const createLargeTempFile = async (sizeBytes) => {
    const filePath = path.join(os.tmpdir(), `streamwire-test-${Date.now()}-${Math.random().toString(16).slice(2)}.mp4`);
    const handle = await fs.promises.open(filePath, 'w');
    await handle.truncate(sizeBytes);
    await handle.close();
    return filePath;
};

test('publish rejects unsupported file type with 400', async () => {
    const app = createTestApp();

    const response = await request(app)
        .post('/api/v1/videos/publish')
        .field('title', 'Bad file')
        .attach('videoFile', Buffer.from('hello world'), {
            filename: 'not-video.txt',
            contentType: 'text/plain',
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'File type not supported. Only images and videos are allowed.');
});

test('publish rejects oversized video with 400', async () => {
    const app = createTestApp();
    const oversizedFilePath = await createLargeTempFile((MAX_VIDEO_UPLOAD_MB * 1024 * 1024) + 1);

    try {
        const response = await request(app)
            .post('/api/v1/videos/publish')
            .field('title', 'Too large')
            .attach('videoFile', oversizedFilePath, {
                contentType: 'video/mp4',
                filename: 'big-video.mp4',
            });

        assert.equal(response.status, 400);
        assert.match(response.body.message, /File too large/i);
    } finally {
        try {
            await fs.promises.unlink(oversizedFilePath);
        } catch {}
    }
});

test('publish rejects missing file with 400', async () => {
    const app = createTestApp();

    const response = await request(app)
        .post('/api/v1/videos/publish')
        .field('title', 'No file');

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Video file is required');
});
