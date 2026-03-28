import fs from "fs";
import path from "path";
import { logDebug } from "./logger.js";

export const safeUnlink = (targetPath, { reason = "cleanup" } = {}) => {
    if (!targetPath) return false;

    try {
        if (!fs.existsSync(targetPath)) return false;
        fs.unlinkSync(targetPath);
        logDebug(`[TempCleanup] Removed file (${reason}):`, targetPath);
        return true;
    } catch (error) {
        console.error(`[TempCleanup] Failed to remove file (${reason}):`, targetPath, error.message);
        return false;
    }
};

export const safeUnlinkMany = (paths, { reason = "cleanup" } = {}) => {
    if (!Array.isArray(paths) || paths.length === 0) return 0;

    return paths.reduce((count, targetPath) => {
        const removed = safeUnlink(targetPath, { reason });
        return removed ? count + 1 : count;
    }, 0);
};

export const collectRequestFilePaths = (req) => {
    const filePaths = new Set();

    if (req?.file?.path) {
        filePaths.add(req.file.path);
    }

    const files = req?.files;
    if (!files) return [...filePaths];

    if (Array.isArray(files)) {
        files.forEach((file) => {
            if (file?.path) filePaths.add(file.path);
        });
        return [...filePaths];
    }

    Object.values(files).forEach((entry) => {
        if (Array.isArray(entry)) {
            entry.forEach((file) => {
                if (file?.path) filePaths.add(file.path);
            });
            return;
        }

        if (entry?.path) {
            filePaths.add(entry.path);
        }
    });

    return [...filePaths];
};

export const cleanupRequestTempFiles = (req, { reason = "request-error" } = {}) => {
    const paths = collectRequestFilePaths(req);
    return safeUnlinkMany(paths, { reason });
};

export const deleteStaleFiles = async ({
    dirPath,
    fileNamePattern,
    maxAgeMs,
    reason = "stale-cleanup",
}) => {
    if (!dirPath || !fileNamePattern || !Number.isFinite(maxAgeMs) || maxAgeMs <= 0) {
        return 0;
    }

    let entries;
    try {
        entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    } catch {
        return 0;
    }

    const now = Date.now();
    let deletedCount = 0;

    for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!fileNamePattern.test(entry.name)) continue;

        const targetPath = path.join(dirPath, entry.name);
        try {
            const stats = await fs.promises.stat(targetPath);
            const ageMs = now - stats.mtimeMs;
            if (ageMs < maxAgeMs) continue;

            await fs.promises.unlink(targetPath);
            deletedCount += 1;
            logDebug(`[TempCleanup] Removed stale file (${reason}):`, targetPath);
        } catch (error) {
            console.error(`[TempCleanup] Failed stale cleanup (${reason}):`, targetPath, error.message);
        }
    }

    return deletedCount;
};