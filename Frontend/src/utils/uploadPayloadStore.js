const DB_NAME = 'streamwire-uploads';
const STORE_NAME = 'payloads';
const DB_VERSION = 1;

const canUseIndexedDb = () =>
    typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const openDb = () =>
    new Promise((resolve, reject) => {
        if (!canUseIndexedDb()) {
            resolve(null);
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Failed to open upload store'));
    });

const runStoreRequest = async (mode, work) => {
    const db = await openDb();
    if (!db) return null;

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);

        work(store, resolve, reject);

        tx.oncomplete = () => db.close();
        tx.onerror = () => {
            db.close();
            reject(tx.error || new Error('Upload store transaction failed'));
        };
        tx.onabort = () => {
            db.close();
            reject(tx.error || new Error('Upload store transaction aborted'));
        };
    });
};

export const saveUploadPayload = async (id, payload) => {
    if (!canUseIndexedDb()) return false;

    await runStoreRequest('readwrite', (store, resolve, reject) => {
        const request = store.put({
            id,
            payload,
            updatedAt: Date.now(),
        });

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error || new Error('Failed to save upload payload'));
    });

    return true;
};

export const getUploadPayload = async (id) => {
    if (!canUseIndexedDb()) return null;

    return runStoreRequest('readonly', (store, resolve, reject) => {
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result?.payload || null);
        };
        request.onerror = () => reject(request.error || new Error('Failed to read upload payload'));
    });
};

export const deleteUploadPayload = async (id) => {
    if (!canUseIndexedDb()) return false;

    await runStoreRequest('readwrite', (store, resolve, reject) => {
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error || new Error('Failed to delete upload payload'));
    });

    return true;
};
