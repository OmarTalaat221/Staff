import apiInstance from "../../shared/services/api/apiInstance";

export const getTaskLists = async () => {
  try {
    const response = await apiInstance.get("tasks/get_lists.php");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addTaskList = async (data) => {
  try {
    const response = await apiInstance.post("tasks/add_list.php", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTaskList = async (data) => {
  try {
    const response = await apiInstance.post("tasks/update_list.php", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTaskList = async (id) => {
  try {
    const response = await apiInstance.post("tasks/delete_list.php", { id });
    return response.data;
  } catch (error) {
    throw error;
  }
};
