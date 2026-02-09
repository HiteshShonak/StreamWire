import NodeCache from "node-cache";

const tempUserCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

export const saveTempUser = (email, userData) => {
    return tempUserCache.set(email, userData);
};

export const getTempUser = (email) => {
    return tempUserCache.get(email);
};

export const deleteTempUser = (email) => {
    return tempUserCache.del(email);
};