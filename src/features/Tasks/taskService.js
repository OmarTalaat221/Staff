import apiInstance from "../../shared/services/api/apiInstance";

export const getTasks = async () => {
  try {
    const response = await apiInstance.get("tasks/get_tasks.php");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addTask = async (data) => {
  try {
    const response = await apiInstance.post("tasks/add_task.php", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (data) => {
  try {
    const response = await apiInstance.post("tasks/update_task.php", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await apiInstance.post("tasks/delete_task.php", { id });
    return response.data;
  } catch (error) {
    throw error;
  }
};
