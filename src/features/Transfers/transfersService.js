import apiInstance from "../../shared/services/api/apiInstance";

export const getTransfers = async () => {
    try {
        const response = await apiInstance.get('transfers/get_transfers.php');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addTransfer = async (formData) => {
    try {
        const response = await apiInstance.post('transfers/add_transfer.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteTransfer = async (transfer_id) => {
    try {
        const response = await apiInstance.post('transfers/delete_transfer.php', { transfer_id });
        return response.data;
    } catch (error) {
        throw error;
    }
}
