import api, { invalidateCache as clearAxiosCache } from './axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Create a new BOF Maharashtra form
 * @param {Object} data - Form data to create
 * @returns {Promise} Created form data
 */
export const createBofMaharashtra = async (data) => {
  try {
    ("[createBofMaharashtra] Sending request:", { 
      uniqueId: data.uniqueId,
      clientId: data.clientId ? data.clientId.substring(0, 8) + "..." : "missing"
    });

    const response = await api.post(`${API_BASE_URL}/bof-maharashtra`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create BOF form');
    }

    ("[createBofMaharashtra] Success");
    return response.data.data;
  } catch (error) {
    console.error("[createBofMaharashtra] Error:", error.message);
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get all BOF Maharashtra forms with filters
 * @param {Object} filters - Filter criteria (username, userRole, clientId, status, etc.)
 * @returns {Promise} List of forms with pagination
 */
export const getAllBofMaharashtra = async (filters = {}) => {
  try {
    ("[getAllBofMaharashtra] Fetching with filters:", {
      userRole: filters.userRole,
      status: filters.status,
      page: filters.page
    });

    const response = await api.get(`${API_BASE_URL}/bof-maharashtra`, {
      params: filters
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch BOF forms');
    }

    ("[getAllBofMaharashtra] Success:", {
      total: response.data.pagination?.total,
      returned: response.data.data?.length
    });
    return response.data;
  } catch (error) {
    console.error("[getAllBofMaharashtra] Error:", error.message);
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get a single BOF Maharashtra form by ID
 * @param {String} id - Form unique ID
 * @param {String} username - Current user
 * @param {String} userRole - User role (user/manager/admin)
 * @param {String} clientId - Client identifier
 * @returns {Promise} Form data
 */
export const getBofMaharastraById = async (id, username, userRole, clientId) => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid form ID format');
    }

    ("[getBofMaharastraById] Fetching form:", {
      id,
      username,
      userRole,
      clientId: clientId ? clientId.substring(0, 8) + "..." : "missing"
    });

    const response = await api.get(`${API_BASE_URL}/bof-maharashtra/${id}`, {
      params: { username, userRole, clientId }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch BOF form');
    }

    ("[getBofMaharastraById] Success");
    return response.data.data;
  } catch (error) {
    console.error("[getBofMaharastraById] Error:", error.message);
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Update a BOF Maharashtra form
 * @param {String} id - Form unique ID
 * @param {Object} data - Updated form data
 * @param {String} username - Current user
 * @param {String} userRole - User role
 * @param {String} clientId - Client identifier
 * @returns {Promise} Updated form data
 */
export const updateBofMaharashtra = async (id, data, username, userRole, clientId) => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid form ID format');
    }

    if (!username || !userRole || !clientId) {
      throw new Error('Missing required user information');
    }

    ("[updateBofMaharashtra] Sending update request:", {
      id,
      username,
      userRole,
      clientId: clientId ? clientId.substring(0, 8) + "..." : "missing",
      dataSize: JSON.stringify(data).length
    });

    const response = await api.put(`${API_BASE_URL}/bof-maharashtra/${id}`, data, {
      params: { username, userRole, clientId }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update BOF form');
    }

    ("[updateBofMaharashtra] Success");
    clearAxiosCache('bof-maharashtra');
    return response.data.data;
  } catch (error) {
    console.error("[updateBofMaharashtra] Error:", error.message);
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Manager/Admin submit (approve or reject) a BOF Maharashtra form
 * @param {String} id - Form unique ID
 * @param {String} action - Action: 'approved' or 'rejected'
 * @param {String} feedback - Optional feedback/comments
 * @param {String} username - Manager username
 * @param {String} userRole - Manager role
 * @returns {Promise} Updated form data
 */
export const managerSubmitBofMaharashtra = async (id, action, feedback, username, userRole) => {
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

    ("[managerSubmitBofMaharashtra] Sending:", {
      id,
      action,
      username,
      clientId: clientId.substring(0, 8) + "..."
    });

    const response = await api.post(
      `${API_BASE_URL}/bof-maharashtra/${id}/manager-submit`,
      requestBody
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit BOF form');
    }

    ("[managerSubmitBofMaharashtra] Success:", { action });
    clearAxiosCache('bof-maharashtra');
    return response.data.data;
  } catch (error) {
    console.error("[managerSubmitBofMaharashtra] Error:", error.message);
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Request rework on an approved BOF Maharashtra form
 * @param {String} id - Form unique ID
 * @param {String} comments - Rework comments/instructions
 * @param {String} username - Manager username
 * @param {String} userRole - Manager role
 * @returns {Promise} Updated form data
 */
export const requestReworkBofMaharashtra = async (id, comments, username, userRole) => {
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

    ("[requestReworkBofMaharashtra] Sending request:", {
      id,
      username,
      clientId: clientId.substring(0, 8) + "..."
    });

    const response = await api.post(
      `${API_BASE_URL}/bof-maharashtra/${id}/request-rework`,
      requestBody
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to request rework');
    }

    ("[requestReworkBofMaharashtra] Success");
    clearAxiosCache('bof-maharashtra');
    return response.data.data;
  } catch (error) {
    console.error("[requestReworkBofMaharashtra] Error:", error.message);
    throw error.response?.data || { message: error.message };
  }
};

export const deleteBofMaharashtra = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/bof-maharashtra/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete BOF form');
    }
    clearAxiosCache('bof-maharashtra');
    return response.data;
  } catch (error) {
    console.error("Error deleting BOF form:", error);
    throw error.response?.data || { message: error.message };
  }
};

export const deleteMultipleBofMaharashtra = async (ids) => {
  try {
    const response = await api.post(`${API_BASE_URL}/bof-maharashtra/bulk/delete`, { ids });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete BOF forms');
    }
    clearAxiosCache('bof-maharashtra');
    return response.data;
  } catch (error) {
    console.error("Error deleting BOF forms:", error);
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Invalidate BOF Maharashtra cache
 * @param {String} pattern - Optional cache pattern
 */
export const invalidateCache = (pattern = 'bof-maharashtra') => {
  clearAxiosCache(pattern);
};
