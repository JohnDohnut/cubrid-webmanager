
export const setObjectLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Get data from localStorage
export const getObjectLocalStorage = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};
