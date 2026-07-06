import apiInstance from "../../shared/services/api/apiInstance";

export const getEmployeesAttendanceStats = async (page = 1, pageSize = 10, search = "", department = "") => {
  try {
    const response = await apiInstance.get("dashboard/get_employees_attendance_stats.php", {
      params: {
        page,
        pageSize,
        search,
        department,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEmployeeLogs = async (employeeId, date) => {
  try {
    const response = await apiInstance.get("employees/get_employee_logs.php", {
      params: {
        employee_id: employeeId,
        date: date,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAttendanceLog = async (payload) => {
  try {
    const response = await apiInstance.post("employees/update_attendance.php", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
