import apiInstance from "../../shared/services/api/apiInstance";

export const getAllStaff = async () => {
    try {
        const response = await apiInstance.get('employees/get_employees.php');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addStaff = async (data) => {
    try {
        const response = await apiInstance.post('employees/add_employee.php', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateStaff = async (formData) => {
    try {
        const response = await apiInstance.post('employees/update_employee.php', formData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteStaff = async (employee_id) => {
    try {
        const response = await apiInstance.post(`employees/delete_employee.php`, { employee_id });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getStaffById = async (employee_id) => {
    
}

export const toggleEmployeeStatus = async (employee_id) => {
    try {
        const response = await apiInstance.post(`employees/toggle_status.php`, { employee_id });
        return response.data;
    } catch (error) {
        throw error;
    }
}