const isProduction = process.env.NODE_ENV === "production";

// Keep debug traces in development without polluting production logs.
export const logDebug = (...args) => {
    if (!isProduction) {
        console.log(...args);
    }
};
