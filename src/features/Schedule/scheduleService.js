import apiInstance from "../../shared/services/api/apiInstance";

export const getAllShifts = async () => {
    try {
        const response = await apiInstance.get('shifts/get_shifts.php');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addShift = async (data) => {
    try {
        const response = await apiInstance.post('shifts/add_shift.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateShift = async (data) => {
    try {
        const response = await apiInstance.post('shifts/update_shift.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteShift = async (shift_id) => {
    try {
        const response = await apiInstance.post('shifts/delete_shift.php', { shift_id });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getRotaTemplates = async () => {
    try {
        const response = await apiInstance.get('shifts/get_rota_templates.php');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getRotaDetails = async (rota_id) => {
    try {
        const response = await apiInstance.post('shifts/get_rota_details.php', { rota_id });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addRota = async (data) => {
    try {
        const response = await apiInstance.post('shifts/add_rota.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const applyRotaTemplate = async (data) => {
    try {
        const response = await apiInstance.post('shifts/apply_rota_template.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const addRotaItem = async (data) => {
    try {
        const response = await apiInstance.post('shifts/add_rota_item.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateRotaItem = async (data) => {
    try {
        const response = await apiInstance.post('shifts/update_rota_item.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteRotaItem = async (data) => {
    try {
        const response = await apiInstance.post('shifts/delete_rota_item.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
