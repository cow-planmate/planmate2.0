const STORAGE_KEY = 'temp_plan_data';

export const saveTempPlan = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event("tempPlanUpdated"));
    } catch (e) {
        console.error("Failed to save temp plan", e);
    }
};

export const getTempPlan = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error("Failed to load temp plan", e);
        return null;
    }
};

export const clearTempPlan = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("tempPlanUpdated"));
};

export const hasTempPlan = () => {
    return !!localStorage.getItem(STORAGE_KEY);
};
