import fs from 'fs';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { MAX_VIDEO_UPLOAD_BYTES } from '../constants.js';
import {
    appendChunkToSession,
    createChunkUploadSession,
    deleteChunkUploadSession,
    getChunkUploadSession,
} from '../services/chunkUpload.service.js';
import { publishAVideo } from './video.controller.js';

const parseSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const initChunkedUpload = asyncHandler(async (req, res) => {
    const title = String(req.body?.title || '').trim();
    const description = String(req.body?.description || '');
    const tags = req.body?.tags || '';
    const isStealthMode = req.body?.isStealthMode;
    const fileName = String(req.body?.fileName || 'video-upload');
    const mimeType = String(req.body?.mimeType || 'application/octet-stream');
    const totalSize = parseSafeNumber(req.body?.totalSize);
    const totalChunks = parseSafeNumber(req.body?.totalChunks);
    const chunkSize = parseSafeNumber(req.body?.chunkSize);

    if (!title) throw new ApiError(400, 'Title is required');
    if (!totalSize || totalSize <= 0) throw new ApiError(400, 'Invalid total video size');
    if (!totalChunks || totalChunks <= 0) throw new ApiError(400, 'Invalid total chunk count');
    if (!chunkSize || chunkSize <= 0) throw new ApiError(400, 'Invalid chunk size');
    if (totalSize > MAX_VIDEO_UPLOAD_BYTES) throw new ApiError(400, 'Video file exceeds the max upload size');

    const session = await createChunkUploadSession({
        ownerId: req.user?._id,
        title,
        description,
        tags,
        isStealthMode,
        fileName,
        mimeType,
        totalSize,
        totalChunks,
        chunkSize,
    });

    return res.status(201).json(
        new ApiResponse(201, {
            sessionId: session.sessionId,
            nextChunkIndex: session.nextChunkIndex,
            totalChunks: session.totalChunks,
            bytesReceived: session.bytesReceived,
        }, 'Chunk upload session started')
    );
});

export const uploadChunkPart = asyncHandler(async (req, res) => {
    const sessionId = req.params?.sessionId;
    const chunkIndex = parseSafeNumber(req.body?.chunkIndex, -1);

    if (!sessionId) throw new ApiError(400, 'Chunk session id is required');
    if (chunkIndex < 0) throw new ApiError(400, 'Chunk index is required');
    if (!req.file?.path) throw new ApiError(400, 'Chunk file is required');

    const session = await getChunkUploadSession(sessionId);
    if (!session) throw new ApiError(404, 'Chunk session not found or expired');
    if (String(session.ownerId) !== String(req.user?._id)) throw new ApiError(403, 'Not allowed for this chunk session');

    const updatedSession = await appendChunkToSession({
        session,
        chunkIndex,
        chunkFilePath: req.file.path,
        chunkSize: req.file.size || 0,
    });

    return res.status(200).json(
        new ApiResponse(200, {
            sessionId,
            nextChunkIndex: updatedSession.nextChunkIndex,
            totalChunks: updatedSession.totalChunks,
            bytesReceived: updatedSession.bytesReceived,
        }, 'Chunk accepted')
    );
});

export const getChunkUploadStatus = asyncHandler(async (req, res) => {
    const sessionId = req.params?.sessionId;
    if (!sessionId) throw new ApiError(400, 'Chunk session id is required');

    const session = await getChunkUploadSession(sessionId);
    if (!session) throw new ApiError(404, 'Chunk session not found or expired');
    if (String(session.ownerId) !== String(req.user?._id)) throw new ApiError(403, 'Not allowed for this chunk session');

    return res.status(200).json(
        new ApiResponse(200, {
            sessionId,
            nextChunkIndex: session.nextChunkIndex,
            totalChunks: session.totalChunks,
            bytesReceived: session.bytesReceived,
            totalSize: session.totalSize,
        }, 'Chunk session status')
    );
});

export const completeChunkedUpload = asyncHandler(async (req, res, next) => {
    const sessionId = req.params?.sessionId;
    if (!sessionId) throw new ApiError(400, 'Chunk session id is required');

    const session = await getChunkUploadSession(sessionId);
    if (!session) throw new ApiError(404, 'Chunk session not found or expired');
    if (String(session.ownerId) !== String(req.user?._id)) throw new ApiError(403, 'Not allowed for this chunk session');

    if (session.nextChunkIndex < session.totalChunks) {
        throw new ApiError(400, `Upload incomplete. Next chunk expected: ${session.nextChunkIndex}`);
    }

    if (!fs.existsSync(session.uploadPath)) {
        throw new ApiError(400, 'Uploaded file data is missing. Please restart upload.');
    }

    let didCleanup = false;
    const cleanupSessionArtifacts = () => {
        if (didCleanup) return;
        didCleanup = true;
        deleteChunkUploadSession(sessionId).catch(() => {});
    };

    res.once('finish', cleanupSessionArtifacts);
    res.once('close', cleanupSessionArtifacts);

    req.body = {
        ...req.body,
        title: session.title,
        description: session.description,
        tags: session.tags,
        isStealthMode: session.isStealthMode,
    };

    req.files = {
        videoFile: [{
            path: session.uploadPath,
            originalname: session.fileName,
            mimetype: session.mimeType,
        }],
    };

    if (req.file?.path) {
        req.files.thumbnail = [{
            path: req.file.path,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
        }];
    }

    return publishAVideo(req, res, next);
});

export const cancelChunkedUpload = asyncHandler(async (req, res) => {
    const sessionId = req.params?.sessionId;
    if (!sessionId) throw new ApiError(400, 'Chunk session id is required');

    const session = await getChunkUploadSession(sessionId);
    if (!session) {
        return res.status(200).json(new ApiResponse(200, { sessionId }, 'Chunk session already removed'));
    }

    if (String(session.ownerId) !== String(req.user?._id)) {
        throw new ApiError(403, 'Not allowed for this chunk session');
    }

    await deleteChunkUploadSession(sessionId);

    return res.status(200).json(new ApiResponse(200, { sessionId }, 'Chunk session canceled'));
});
