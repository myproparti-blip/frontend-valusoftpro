import axios from "axios";

// Request cache for GET requests
const requestCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (increased for better cache hit rate)

let notificationHandler = null;
let unauthorizedErrorShown = false;

export const setNotificationHandler = (handler) => {
    notificationHandler = handler;
};

export const resetUnauthorizedErrorFlag = () => {
    unauthorizedErrorShown = false;
};

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Separate axios instance for refresh token (no interceptors to prevent recursion)
const refreshApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Refresh token handler
const refreshTokenHelper = async () => {
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) throw new Error("No user data in localStorage");

        const user = JSON.parse(userStr);
        if (!user.refreshToken) throw new Error("No refresh token available");

        ("[refreshToken] 🔄 Calling refresh-token endpoint...");
        const response = await refreshApi.post("/auth/refresh-token", {
            refreshToken: user.refreshToken,
        });

        // Update localStorage with new token
        const updatedUser = { ...user, token: response.data.token };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        ("[refreshToken] ✅ Token refreshed successfully");
        return updatedUser;
    } catch (error) {
        console.error("[refreshToken] ❌ Failed:", error.message);
        localStorage.removeItem("user");
        throw error;
    }
};

// Request interceptor - Add auth headers and user data to params
api.interceptors.request.use((config) => {
    // Skip auth for login and refresh-token endpoints
    if (config.url.includes("/auth/login") || config.url.includes("/auth/refresh-token")) {
        return config;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) return config;

    try {
        const userData = JSON.parse(userStr);

        // Add Bearer token to Authorization header
        if (userData.token) {
            config.headers["Authorization"] = `Bearer ${userData.token}`;
        }

        // Add user data to params for GET requests (backend requirement)
        if (config.method === "get") {
            config.params = {
                ...config.params,
                username: userData.username || "",
                userRole: userData.role || "",
                clientId: userData.clientId || "",
            };
        }

        return config;
    } catch (e) {
        console.error("[axios] Error in request interceptor:", e);
        return config;
    }
});

// Token refresh state
let isRefreshing = false;
let pendingRequests = [];

const executeQueuedRequests = (token) => {
    pendingRequests.forEach((cb) => cb(token));
    pendingRequests = [];
};

const addPendingRequest = (cb) => {
    pendingRequests.push(cb);
};

// Response interceptor - Handle 401 and refresh token
api.interceptors.response.use(
    (response) => {
        // Cache GET responses
        if (response.config.method === "get" && response.status === 200) {
            const cacheKey = `${response.config.url}?${new URLSearchParams(
                response.config.params
            ).toString()}`;
            requestCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now(),
            });
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors
        if (error?.response?.status !== 401) {
            return Promise.reject(error);
        }

        // Prevent infinite retry loop
        if (originalRequest._retry) {
            localStorage.removeItem("user");
            if (!unauthorizedErrorShown && notificationHandler) {
                unauthorizedErrorShown = true;
                notificationHandler.showUnauthorizedError("Session expired – please login again.");
            }
            return Promise.reject(error);
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // No refresh token available
        if (!user?.refreshToken) {
            if (!unauthorizedErrorShown && notificationHandler) {
                unauthorizedErrorShown = true;
                notificationHandler.showUnauthorizedError("Please login to continue.");
            }
            return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve) => {
                addPendingRequest((token) => {
                    originalRequest.headers["Authorization"] = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
            });
        }

        // Mark as retry and start refresh
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newUser = await refreshTokenHelper();
            const newToken = newUser.token;

            // Update the failed request header
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            // Execute queued requests with new token
            executeQueuedRequests(newToken);

            // Retry the original request
            return api(originalRequest);
        } catch (refreshError) {
            // Refresh failed - reject all queued requests
            pendingRequests = [];
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// Cache utilities
export const clearCache = () => requestCache.clear();
export const invalidateCache = (pattern) => {
    for (const key of requestCache.keys()) {
        if (key.includes(pattern)) requestCache.delete(key);
    }
};

export default api;
