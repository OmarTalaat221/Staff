import apiInstance from "../../shared/services/api/apiInstance";

export const getCategories = async () => {
    try {
        const response = await apiInstance.get('instructions/get_categories.php');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addCategory = async (name) => {
    try {
        const response = await apiInstance.post('instructions/add_category.php', { name });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addSOP = async (data) => {
    try {
        const response = await apiInstance.post('instructions/add_sop.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
