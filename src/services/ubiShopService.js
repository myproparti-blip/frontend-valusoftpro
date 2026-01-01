import api, { invalidateCache as clearAxiosCache } from './axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;
export const createValuation = async (data) => {
  try {
    const response = await api.post(`${API_BASE_URL}/valuations`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getValuationById = async (id, username, userRole, clientId) => {
  try {
    // Ensure all parameters are defined
    const params = {
      username: username || '',
      userRole: userRole || 'user',
      clientId: clientId || ''
    };
    
    const response = await api.get(`${API_BASE_URL}/valuations/${id}`, {
      params
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getAllValuations = async (filters = {}) => {
  try {
    const response = await api.get(`${API_BASE_URL}/valuations`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const updateValuation = async (id, data, username, userRole, clientId) => {
  try {
    // Ensure parameters are properly set - CRITICAL FOR API CALLS
    const safeUsername = String(username || 'admin').trim();
    const safeUserRole = String(userRole || 'user').trim();
    const safeClientId = String(clientId || 'c1908090').trim();
    
    // Validate minimum required params
    if (!safeUsername || !safeUserRole || !safeClientId || !id) {
      throw new Error('Missing required parameters: username, userRole, clientId, or id');
    }
    
    // Try PUT first (for existing records)
    try {
      const response = await api.put(`${API_BASE_URL}/valuations/${id}`, data, {
        params: { username: safeUsername, userRole: safeUserRole, clientId: safeClientId }
      });
      return response.data.data;
    } catch (putError) {
      // If PUT fails with 404 (not found), try POST to create instead
      if (putError.response?.status === 404) {
        // CRITICAL: Include all required fields for creation
        const createData = {
          ...data,
          uniqueId: id, // Use the provided ID as uniqueId
          username: safeUsername,
          userRole: safeUserRole,
          clientId: safeClientId,
          // Ensure minimum required fields for schema
          bankName: data.bankName || 'Unknown',
          city: data.city || 'Unknown',
          clientName: data.clientName || 'Unknown',
          mobileNumber: data.mobileNumber || '',
          address: data.address || '',
          payment: data.payment || '',
          dsa: data.dsa || 'Unknown',
          engineerName: data.engineerName || 'Unknown'
        };
        
        try {
          const response = await api.post(`${API_BASE_URL}/valuations`, createData);
          return response.data.data;
        } catch (postError) {
          throw postError;
        }
      }
      // For any other error, re-throw
      throw putError;
    }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const managerSubmit = async (id, actionOrPayload, feedback, username, userRole) => {
  try {
    const user = localStorage.getItem("user");
    const userData = user ? JSON.parse(user) : {};
    const clientId = userData.clientId || "unknown";
    
    let requestBody;
    if (typeof actionOrPayload === 'object' && actionOrPayload !== null) {
      requestBody = {
        status: actionOrPayload.status,
        managerFeedback: actionOrPayload.managerFeedback,
        clientId
      };
    } else {
      requestBody = {
        action: actionOrPayload,
        feedback,
        username,
        userRole,
        clientId
      };
    }
    
    const response = await api.post(
      `${API_BASE_URL}/valuations/${id}/manager-submit`,
      requestBody
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const managerSubmitValuation = async (id, action, feedback, username, userRole) => {
  return managerSubmit(id, action, feedback, username, userRole);
};

export const requestRework = async (id, comments, username, userRole) => {
  try {
    const response = await api.post(
      `${API_BASE_URL}/valuations/${id}/request-rework`,
      { comments, username, userRole }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteValuation = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/valuations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMultipleValuations = async (ids) => {
  try {
    const response = await api.post(`${API_BASE_URL}/valuations/bulk/delete`, { ids });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};



export const invalidateCache = (pattern) => {
  clearAxiosCache(pattern);
};


export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.error) {
    return error.error;
  }
  return "An unexpected error occurred";
};

export const formatSuccessMessage = (response) => {
  if (typeof response === 'string') {
    return response;
  }
  if (response?.message) {
    return response.message;
  }
  return "Operation completed successfully";
};


