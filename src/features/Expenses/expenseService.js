import apiInstance from "../../shared/services/api/apiInstance";

export const getExpenses = async () => {
  try {
    const response = await apiInstance.get('expenses/get_expenses.php');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addExpense = async (data) => {
  try {
    const response = await apiInstance.post('expenses/add_expense.php', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateExpense = async (data) => {
  try {
    const response = await apiInstance.post('expenses/update_expense.php', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await apiInstance.post('expenses/delete_expense.php', { id });
    return response.data;
  } catch (error) {
    throw error;
  }
};
