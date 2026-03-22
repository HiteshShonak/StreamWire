import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import express from 'express';
import request from 'supertest';
import { upload } from '../src/middlewares/multer.middleware.js';
import {
    cancelChunkedUpload,
    completeChunkedUpload,
    getChunkUploadStatus,
    initChunkedUpload,
    uploadChunkPart,
} from '../src/controllers/chunkUpload.controller.js';
import { deleteChunkUploadSession } from '../src/services/chunkUpload.service.js';

const CHUNK_BASE_PATH = '/api/v1/videos/publish/chunk';

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

const createChunkTestApp = (userId = 'user-1') => {
    const app = express();
    app.use(express.json());

    app.use((req, res, next) => {
        req.user = { _id: userId };
        next();
    });

    app.post(`${CHUNK_BASE_PATH}/init`, initChunkedUpload);
    app.get(`${CHUNK_BASE_PATH}/:sessionId/status`, getChunkUploadStatus);
    app.post(`${CHUNK_BASE_PATH}/:sessionId`, upload.single('chunk'), uploadChunkPart);
    app.delete(`${CHUNK_BASE_PATH}/:sessionId`, cancelChunkedUpload);
    app.post(`${CHUNK_BASE_PATH}/:sessionId/complete`, upload.single('thumbnail'), completeChunkedUpload);

    app.use((err, req, res, _next) => {
        cleanupUploadedTempFiles(req);

        const statusCode = err.statusCode || 500;
        const message = err.message || 'Internal Server Error';

        return res.status(statusCode).json({
            success: false,
            statusCode,
            message,
            expectedChunkIndex: err.expectedChunkIndex,
        });
    });

    return app;
};

const buildInitPayload = (overrides = {}) => ({
    title: 'Chunk integration test',
    description: '',
    tags: '',
    isStealthMode: false,
    fileName: 'demo.mp4',
    mimeType: 'video/mp4',
    totalSize: 8,
    totalChunks: 2,
    chunkSize: 4,
    ...overrides,
});

const startChunkSession = async (app, overrides = {}) => {
    const response = await request(app)
        .post(`${CHUNK_BASE_PATH}/init`)
        .send(buildInitPayload(overrides));

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.ok(response.body.data?.sessionId);
    return response.body.data.sessionId;
};

test('chunk init creates a new session', async () => {
    const app = createChunkTestApp();
    let sessionId = null;

    try {
        const response = await request(app)
            .post(`${CHUNK_BASE_PATH}/init`)
            .send(buildInitPayload());

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.nextChunkIndex, 0);
        assert.equal(response.body.data.totalChunks, 2);
        assert.equal(response.body.data.bytesReceived, 0);
        assert.ok(response.body.data.sessionId);

        sessionId = response.body.data.sessionId;
    } finally {
        if (sessionId) {
            await deleteChunkUploadSession(sessionId);
        }
    }
});

test('chunk upload updates status progress', async () => {
    const app = createChunkTestApp();
    const sessionId = await startChunkSession(app);

    try {
        const uploadResponse = await request(app)
            .post(`${CHUNK_BASE_PATH}/${sessionId}`)
            .field('chunkIndex', '0')
            .attach('chunk', Buffer.from([1, 2, 3, 4]), {
                filename: 'chunk-0.mp4',
                contentType: 'video/mp4',
            });

        assert.equal(uploadResponse.status, 200);
        assert.equal(uploadResponse.body.success, true);
        assert.equal(uploadResponse.body.data.nextChunkIndex, 1);
        assert.equal(uploadResponse.body.data.bytesReceived, 4);

        const statusResponse = await request(app).get(`${CHUNK_BASE_PATH}/${sessionId}/status`);

        assert.equal(statusResponse.status, 200);
        assert.equal(statusResponse.body.success, true);
        assert.equal(statusResponse.body.data.nextChunkIndex, 1);
        assert.equal(statusResponse.body.data.bytesReceived, 4);
        assert.equal(statusResponse.body.data.totalSize, 8);
    } finally {
        await deleteChunkUploadSession(sessionId);
    }
});

test('chunk upload rejects out-of-order chunk index with 409', async () => {
    const app = createChunkTestApp();
    const sessionId = await startChunkSession(app);

    try {
        const response = await request(app)
            .post(`${CHUNK_BASE_PATH}/${sessionId}`)
            .field('chunkIndex', '1')
            .attach('chunk', Buffer.from([9, 9, 9, 9]), {
                filename: 'chunk-1.mp4',
                contentType: 'video/mp4',
            });

        assert.equal(response.status, 409);
        assert.match(response.body.message, /out of order/i);
        assert.equal(response.body.expectedChunkIndex, 0);
    } finally {
        await deleteChunkUploadSession(sessionId);
    }
});

test('chunk complete rejects incomplete session with 400', async () => {
    const app = createChunkTestApp();
    const sessionId = await startChunkSession(app);

    try {
        const response = await request(app).post(`${CHUNK_BASE_PATH}/${sessionId}/complete`);

        assert.equal(response.status, 400);
        assert.match(response.body.message, /upload incomplete/i);
    } finally {
        await deleteChunkUploadSession(sessionId);
    }
});

test('chunk cancel deletes session and second cancel is idempotent', async () => {
    const app = createChunkTestApp();
    const sessionId = await startChunkSession(app);

    const cancelResponse = await request(app).delete(`${CHUNK_BASE_PATH}/${sessionId}`);
    assert.equal(cancelResponse.status, 200);
    assert.equal(cancelResponse.body.success, true);
    assert.match(cancelResponse.body.message, /canceled/i);

    const statusResponse = await request(app).get(`${CHUNK_BASE_PATH}/${sessionId}/status`);
    assert.equal(statusResponse.status, 404);
    assert.match(statusResponse.body.message, /not found|expired/i);

    const cancelAgainResponse = await request(app).delete(`${CHUNK_BASE_PATH}/${sessionId}`);
    assert.equal(cancelAgainResponse.status, 200);
    assert.match(cancelAgainResponse.body.message, /already removed/i);
});

test('chunk status forbids access from another user', async () => {
    const ownerApp = createChunkTestApp('owner-1');
    const otherUserApp = createChunkTestApp('owner-2');
    const sessionId = await startChunkSession(ownerApp);

    try {
        const response = await request(otherUserApp).get(`${CHUNK_BASE_PATH}/${sessionId}/status`);

        assert.equal(response.status, 403);
        assert.match(response.body.message, /not allowed/i);
    } finally {
        await deleteChunkUploadSession(sessionId);
    }
});