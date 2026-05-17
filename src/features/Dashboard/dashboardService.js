import apiInstance from "../../shared/services/api/apiInstance";

export const getDashboardData = async () => {
  try {
    const response = await apiInstance.get('dashboard/get_dashboard.php');
    return response.data;
  } catch (error) {
    throw error;
  }
};
