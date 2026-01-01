import api from "./axios";

const API_BASE_URL = "/auth";

const handleError = (error, defaultMessage) => {
  const errorMessage = error?.response?.data?.message || 
                       error?.message || 
                       defaultMessage;
  throw new Error(errorMessage);
};

/**
 * Login user with clientId, username, and password
 * @param {string} clientId - The client identifier
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {object} Response with { message, role, username, clientId }
 */
export const loginUser = async (clientId, username, password) => {
  try {
    const response = await api.post("/auth/login", { clientId, username, password });
    localStorage.setItem("user", JSON.stringify(response.data)); // Save JWT & user info
    return response.data;
  } catch (error) {
    handleError(error, "Login failed");
  }
};


/**
 * Logout user
 * Sends user context (including clientId) via Authorization header
 * @returns {object} Response with { message, username, clientId }
 */
export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    // Error logged but logout should succeed even if server request fails
    return { message: "Logout completed" };
  }
};
/**
 * Refresh JWT token using refresh token stored in localStorage
 * @returns {object} New JWT token and user info
 */
export const refreshToken = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.refreshToken) throw new Error("No refresh token available");

    const response = await api.post("/auth/refresh-token", {
      refreshToken: user.refreshToken,
    });

    // Update localStorage with new token
    const newUser = { ...user, token: response.data.token };
    localStorage.setItem("user", JSON.stringify(newUser));
    return newUser;
  } catch (error) {
    console.error("Refresh token failed:", error);
    localStorage.removeItem("user"); // optional: logout user
    throw error;
  }
};
