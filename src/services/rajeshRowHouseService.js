import api, { invalidateCache as clearAxiosCache } from './axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Create a new Rajesh RowHouse form
 * @param {Object} data - Form data to create
 * @returns {Promise} Created form data
 */
export const createRajeshRowHouse = async (data) => {
  try {
    const response = await api.post(`${API_BASE_URL}/rajesh-RowHouse`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create Rajesh RowHouse form');
    }

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get all Rajesh RowHouse forms with filters
 * @param {Object} filters - Filter criteria (username, userRole, clientId, status, etc.)
 * @returns {Promise} List of forms with pagination
 */
export const getAllRajeshRowHouse = async (filters = {}) => {
  try {
    const response = await api.get(`${API_BASE_URL}/rajesh-RowHouse`, {
      params: filters
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch Rajesh RowHouse forms');
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get a single Rajesh RowHouse form by ID
 * @param {String} id - Form unique ID
 * @param {String} username - Current user
 * @param {String} userRole - User role (user/manager/admin)
 * @param {String} clientId - Client identifier
 * @returns {Promise} Form data
 */
export const getRajeshRowHouseById = async (id, username, userRole, clientId) => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid form ID format');
    }

    const response = await api.get(`${API_BASE_URL}/rajesh-RowHouse/${id}`, {
      params: { username, userRole, clientId }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch Rajesh RowHouse form');
    }

    return response.data.data;
  } catch (error) {
    // If this is an axios error response, throw the response data; otherwise throw the error message
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { message: error.message };
  }
};

/**
 * Update a Rajesh RowHouse form
 * @param {String} id - Form unique ID
 * @param {Object} data - Updated form data
 * @param {String} username - Current user
 * @param {String} userRole - User role
 * @param {String} clientId - Client identifier
 * @returns {Promise} Updated form data
 */
export const updateRajeshRowHouse = async (id, data, username, userRole, clientId) => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid form ID format');
    }

    if (!username || !userRole || !clientId) {
      throw new Error('Missing required user information');
    }

    const response = await api.put(`${API_BASE_URL}/rajesh-RowHouse/${id}`, data, {
      params: { username, userRole, clientId }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update Rajesh RowHouse form');
    }

    clearAxiosCache('rajesh-RowHouse');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Manager/Admin submit (approve or reject) a Rajesh RowHouse form
 * @param {String} id - Form unique ID
 * @param {String} action - Action: 'approved' or 'rejected'
 * @param {String} feedback - Optional feedback/comments
 * @param {String} username - Manager username
 * @param {String} userRole - Manager role
 * @returns {Promise} Updated form data 
 */
export const managerSubmitRajeshRowHouse = async (id, action, feedback, username, userRole) => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid form ID format');
    }

    if (!['approved', 'rejected'].includes(action)) {
      throw new Error('Invalid action. Must be "approved" or "rejected"');
    }

    // Get clientId from localStorage
    const user = localStorage.getItem("user");
    const userData = user ? JSON.parse(user) : {};
    const clientId = userData.clientId || "unknown";

    const requestBody = {
      action,
      feedback: feedback ? feedback.trim() : "",
      username,
      userRole,
      clientId
    };

    const response = await api.post(
      `${API_BASE_URL}/rajesh-RowHouse/${id}/manager-submit`,
      requestBody
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit Rajesh RowHouse form');
    }

    clearAxiosCache('rajesh-RowHouse');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Request rework on an approved Rajesh RowHouse form
 * @param {String} id - Form unique ID
 * @param {String} comments - Rework comments/instructions
 * @param {String} username - Manager username
 * @param {String} userRole - Manager role
 * @returns {Promise} Updated form data
 */
export const requestReworkRajeshRowHouse = async (id, comments, username, userRole) => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid form ID format');
    }

    // Get clientId from localStorage
    const user = localStorage.getItem("user");
    const userData = user ? JSON.parse(user) : {};
    const clientId = userData.clientId || "unknown";

    const requestBody = {
      comments: comments ? comments.trim() : "",
      username,
      userRole,
      clientId
    };

    const response = await api.post(
      `${API_BASE_URL}/rajesh-RowHouse/${id}/request-rework`,
      requestBody
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to request rework');
    }

    clearAxiosCache('rajesh-RowHouse');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const deleteRajeshRowHouse = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/rajesh-RowHouse/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete Rajesh RowHouse form');
    }
    clearAxiosCache('rajesh-RowHouse');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const deleteMultipleRajeshRowHouse = async (ids) => {
  try {
    const response = await api.post(`${API_BASE_URL}/rajesh-RowHouse/bulk/delete`, { ids });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete Rajesh RowHouse forms');
    }
    clearAxiosCache('rajesh-RowHouse');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Invalidate Rajesh RowHouse cache
 * @param {String} pattern - Optional cache pattern
 */
export const invalidateCache = (pattern = 'rajesh-RowHouse') => {
  clearAxiosCache(pattern);
};
