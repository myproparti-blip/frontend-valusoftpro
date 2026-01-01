import api, { invalidateCache as clearAxiosCache } from './axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Create a new Rajesh House form
 * @param {Object} data - Form data to create
 * @returns {Promise} Created form data
 */
export const createRajeshHouse = async (data) => {
  try {
    const response = await api.post(`${API_BASE_URL}/rajesh-house`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create Rajesh House form');
    }

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get all Rajesh House forms with filters
 * @param {Object} filters - Filter criteria (username, userRole, clientId, status, etc.)
 * @returns {Promise} List of forms with pagination
 */
export const getAllRajeshHouse = async (filters = {}) => {
  try {
    const response = await api.get(`${API_BASE_URL}/rajesh-house`, {
      params: filters
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch Rajesh House forms');
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get a single Rajesh House form by ID
 * @param {String} id - Form unique ID
 * @param {String} username - Current user
 * @param {String} userRole - User role (user/manager/admin)
 * @param {String} clientId - Client identifier
 * @returns {Promise} Form data
 */
export const getRajeshHouseById = async (id, username, userRole, clientId) => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid form ID format');
    }

    const response = await api.get(`${API_BASE_URL}/rajesh-house/${id}`, {
      params: { username, userRole, clientId }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch Rajesh House form');
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
 * Update a Rajesh House form
 * @param {String} id - Form unique ID
 * @param {Object} data - Updated form data
 * @param {String} username - Current user
 * @param {String} userRole - User role
 * @param {String} clientId - Client identifier
 * @returns {Promise} Updated form data
 */
export const updateRajeshHouse = async (id, data, username, userRole, clientId) => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid form ID format');
    }

    if (!username || !userRole || !clientId) {
      throw new Error('Missing required user information');
    }

    const response = await api.put(`${API_BASE_URL}/rajesh-house/${id}`, data, {
      params: { username, userRole, clientId }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update Rajesh House form');
    }

    clearAxiosCache('rajesh-house');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Manager/Admin submit (approve or reject) a Rajesh House form
 * @param {String} id - Form unique ID
 * @param {String} action - Action: 'approved' or 'rejected'
 * @param {String} feedback - Optional feedback/comments
 * @param {String} username - Manager username
 * @param {String} userRole - Manager role
 * @returns {Promise} Updated form data 
 */
export const managerSubmitRajeshHouse = async (id, action, feedback, username, userRole) => {
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
      `${API_BASE_URL}/rajesh-house/${id}/manager-submit`,
      requestBody
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit Rajesh House form');
    }

    clearAxiosCache('rajesh-house');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Request rework on an approved Rajesh House form
 * @param {String} id - Form unique ID
 * @param {String} comments - Rework comments/instructions
 * @param {String} username - Manager username
 * @param {String} userRole - Manager role
 * @returns {Promise} Updated form data
 */
export const requestReworkRajeshHouse = async (id, comments, username, userRole) => {
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
      `${API_BASE_URL}/rajesh-house/${id}/request-rework`,
      requestBody
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to request rework');
    }

    clearAxiosCache('rajesh-house');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const deleteRajeshHouse = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/rajesh-house/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete Rajesh House form');
    }
    clearAxiosCache('rajesh-house');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const deleteMultipleRajeshHouse = async (ids) => {
  try {
    const response = await api.post(`${API_BASE_URL}/rajesh-house/bulk/delete`, { ids });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete Rajesh House forms');
    }
    clearAxiosCache('rajesh-house');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Invalidate Rajesh House cache
 * @param {String} pattern - Optional cache pattern
 */
export const invalidateCache = (pattern = 'rajesh-house') => {
  clearAxiosCache(pattern);
};
