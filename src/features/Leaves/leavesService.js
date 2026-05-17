import apiInstance from "../../shared/services/api/apiInstance";

export const getLeaves = async () => {
    try {
        const response = await apiInstance.get('leaves/get_leaves.php');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateLeaveStatus = async (leave_id, status, admin_notes = "") => {
    try {
        const response = await apiInstance.post('leaves/update_leave_status.php', {
            leave_id: Number(leave_id),
            status,
            admin_notes
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
