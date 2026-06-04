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
