import api from "./axios";

const API_BASE_URL = "/options";

const handleError = (error, defaultMessage) => {
  const errorMessage = error?.response?.data?.message || 
                      error?.message || 
                      defaultMessage;
  throw new Error(errorMessage);
};

// Get custom options for a type
export const getCustomOptions = async (type) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${type}`);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

// Add a custom option
export const addCustomOption = async (type, value) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${type}`, {
      value,
    });
    return response.data.data || null;
  } catch (error) {
    handleError(error, `Error adding ${type} option`);
  }
};

// Delete a custom option
export const deleteCustomOption = async (type, value) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/${type}/${value}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
