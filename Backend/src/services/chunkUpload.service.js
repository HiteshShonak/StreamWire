import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { deleteStaleFiles } from '../utils/tempFileCleanup.js';
import { logDebug } from '../utils/logger.js';

const CHUNK_TEMP_DIR = path.resolve('public/temp/chunks');
const CHUNK_SESSION_FILE_REGEX = /^[a-f0-9-]{36}\.json$/i;
const CHUNK_UPLOAD_FILE_REGEX = /^[a-f0-9-]{36}\.upload$/i;
const CHUNK_SESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const CHUNK_ORPHAN_UPLOAD_TTL_MS = 60 * 60 * 1000; // 1 hour
const CHUNK_SWEEP_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

let lastChunkSweepAt = 0;

const ensureChunkTempDir = async () => {
    await fs.promises.mkdir(CHUNK_TEMP_DIR, { recursive: true });
};

const getSessionPath = (sessionId) => path.join(CHUNK_TEMP_DIR, `${sessionId}.json`);

const getAssembledPath = (sessionId) => path.join(CHUNK_TEMP_DIR, `${sessionId}.upload`);

const extractSessionIdFromName = (name) => name.replace(/\.(json|upload)$/i, '');

const writeSession = async (session) => {
    await ensureChunkTempDir();
    await fs.promises.writeFile(getSessionPath(session.sessionId), JSON.stringify(session), 'utf8');
};

const readSession = async (sessionId) => {
    try {
        const data = await fs.promises.readFile(getSessionPath(sessionId), 'utf8');
        return JSON.parse(data);
    } catch {
        return null;
    }
};

const sweepStaleChunkArtifacts = async () => {
    const now = Date.now();
    if ((now - lastChunkSweepAt) < CHUNK_SWEEP_THROTTLE_MS) return;

    lastChunkSweepAt = now;
    await ensureChunkTempDir();

    const deletedSessions = await deleteStaleFiles({
        dirPath: CHUNK_TEMP_DIR,
        fileNamePattern: CHUNK_SESSION_FILE_REGEX,
        maxAgeMs: CHUNK_SESSION_TTL_MS,
        reason: 'chunk-stale-session',
    });

    const orphanUploads = await deleteStaleFiles({
        dirPath: CHUNK_TEMP_DIR,
        fileNamePattern: CHUNK_UPLOAD_FILE_REGEX,
        maxAgeMs: CHUNK_ORPHAN_UPLOAD_TTL_MS,
        reason: 'chunk-orphan-upload',
    });

    if (deletedSessions > 0 || orphanUploads > 0) {
        logDebug(`[ChunkCleanup] Removed stale artifacts. sessions=${deletedSessions}, uploads=${orphanUploads}`);
    }

    let entries = [];
    try {
        entries = await fs.promises.readdir(CHUNK_TEMP_DIR, { withFileTypes: true });
    } catch {
        return;
    }

    const knownSessionIds = new Set(
        entries
            .filter((entry) => entry.isFile() && CHUNK_SESSION_FILE_REGEX.test(entry.name))
            .map((entry) => extractSessionIdFromName(entry.name))
    );

    await Promise.all(
        entries
            .filter((entry) => entry.isFile() && CHUNK_UPLOAD_FILE_REGEX.test(entry.name))
            .filter((entry) => !knownSessionIds.has(extractSessionIdFromName(entry.name)))
            .map(async (entry) => {
                const orphanPath = path.join(CHUNK_TEMP_DIR, entry.name);
                try {
                    await fs.promises.unlink(orphanPath);
                    logDebug('[ChunkCleanup] Removed unpaired upload artifact:', orphanPath);
                } catch {
                    // best-effort cleanup
                }
            })
    );
};

export const createChunkUploadSession = async ({
    ownerId,
    title,
    description,
    tags,
    isStealthMode,
    fileName,
    mimeType,
    totalSize,
    totalChunks,
    chunkSize,
}) => {
    await sweepStaleChunkArtifacts();

    const sessionId = crypto.randomUUID();
    const uploadPath = getAssembledPath(sessionId);

    const session = {
        sessionId,
        ownerId: String(ownerId),
        title,
        description,
        tags,
        isStealthMode,
        fileName,
        mimeType,
        totalSize,
        totalChunks,
        chunkSize,
        nextChunkIndex: 0,
        bytesReceived: 0,
        uploadPath,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await writeSession(session);
    return session;
};

export const getChunkUploadSession = async (sessionId) => {
    await sweepStaleChunkArtifacts();
    return readSession(sessionId);
};

export const appendChunkToSession = async ({ session, chunkIndex, chunkFilePath, chunkSize }) => {
    await sweepStaleChunkArtifacts();

    if (chunkIndex !== session.nextChunkIndex) {
        const error = new Error('Chunk index out of order');
        error.statusCode = 409;
        error.expectedChunkIndex = session.nextChunkIndex;
        throw error;
    }

    await ensureChunkTempDir();

    await pipeline(
        createReadStream(chunkFilePath),
        createWriteStream(session.uploadPath, { flags: 'a' })
    );

    try {
        await fs.promises.unlink(chunkFilePath);
    } catch {}

    const nextSession = {
        ...session,
        nextChunkIndex: session.nextChunkIndex + 1,
        bytesReceived: session.bytesReceived + chunkSize,
        updatedAt: Date.now(),
    };

    await writeSession(nextSession);
    return nextSession;
};

export const deleteChunkUploadSession = async (sessionId) => {
    await sweepStaleChunkArtifacts();

    const session = await readSession(sessionId);

    const targets = [getSessionPath(sessionId), getAssembledPath(sessionId), session?.uploadPath].filter(Boolean);
    await Promise.all(
        targets.map(async (targetPath) => {
            try {
                await fs.promises.unlink(targetPath);
            } catch {}
        })
    );
};
