import api, { invalidateCache as clearAxiosCache } from './axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Create a new UBI APF form
 * @param {Object} data - Form data to create
 * @returns {Promise} Created form data
 */
export const createUbiApfForm = async (data) => {
  try {
    const response = await api.post(`${API_BASE_URL}/ubi-apf`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create UBI APF form');
    }

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get all UBI APF forms with filters
 * @param {Object} filters - Filter criteria (username, userRole, clientId, status, etc.)
 * @returns {Promise} List of forms with pagination
 */
export const getAllUbiApfForms = async (filters = {}) => {
  try {
    const response = await api.get(`${API_BASE_URL}/ubi-apf`, {
      params: filters
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch UBI APF forms');
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get a single UBI APF form by ID
 * @param {String} id - Form unique ID
 * @param {String} username - Current user
 * @param {String} userRole - User role (user/manager/admin)
 * @param {String} clientId - Client identifier
 * @returns {Promise} Form data
 */
export const getUbiApfFormById = async (id, username, userRole, clientId) => {
   try {
     if (!id || typeof id !== 'string') {
       throw new Error('Invalid form ID format');
     }

     const response = await api.get(`${API_BASE_URL}/ubi-apf/${id}`, {
       params: { username, userRole, clientId }
     });

     if (!response.data.success) {
       throw new Error(response.data.message || 'Failed to fetch UBI APF form');
     }

     const returnedData = response.data.data;
     return returnedData;
   } catch (error) {
     throw error.response?.data || { message: error.message };
   }
};

/**
 * Update a UBI APF form
 * @param {String} id - Form unique ID
 * @param {Object} data - Updated form data
 * @param {String} username - Current user
 * @param {String} userRole - User role
 * @param {String} clientId - Client identifier
 * @returns {Promise} Updated form data
 */
export const updateUbiApfForm = async (id, data, username, userRole, clientId) => {
   try {
     if (!id || typeof id !== 'string') {
       throw new Error('Invalid form ID format');
     }

     if (!username || !userRole || !clientId) {
       throw new Error('Missing required user information');
     }

     const response = await api.put(`${API_BASE_URL}/ubi-apf/${id}`, data, {
       params: { username, userRole, clientId }
     });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update UBI APF form');
    }

    clearAxiosCache('ubi-apf');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Manager/Admin submit (approve or reject) a UBI APF form
 * @param {String} id - Form unique ID
 * @param {String} action - Action: 'approved' or 'rejected'
 * @param {String} feedback - Optional feedback/comments
 * @param {String} username - Manager username
 * @param {String} userRole - Manager role
 * @returns {Promise} Updated form data
 */
export const managerSubmitUbiApfForm = async (id, action, feedback, username, userRole) => {
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
      `${API_BASE_URL}/ubi-apf/${id}/manager-submit`,
      requestBody
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit UBI APF form');
    }

    clearAxiosCache('ubi-apf');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Request rework on an approved UBI APF form
 * @param {String} id - Form unique ID
 * @param {String} comments - Rework comments/instructions
 * @param {String} username - Manager username
 * @param {String} userRole - Manager role
 * @returns {Promise} Updated form data
 */
export const requestReworkUbiApfForm = async (id, comments, username, userRole) => {
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
      `${API_BASE_URL}/ubi-apf/${id}/request-rework`,
      requestBody
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to request rework');
    }

    clearAxiosCache('ubi-apf');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const deleteUbiApfForm = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/ubi-apf/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete UBI APF form');
    }
    clearAxiosCache('ubi-apf');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const deleteMultipleUbiApfForms = async (ids) => {
  try {
    const response = await api.post(`${API_BASE_URL}/ubi-apf/bulk/delete`, { ids });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete UBI APF forms');
    }
    clearAxiosCache('ubi-apf');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Invalidate UBI APF cache
 * @param {String} pattern - Optional cache pattern
 */
export const invalidateCache = (pattern = 'ubi-apf') => {
  clearAxiosCache(pattern);
};