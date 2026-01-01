import api from "./axios";

// Use the shared axios instance which has authentication interceptor

// Helper function to get user auth params from localStorage
const getAuthParams = () => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      const params = {
        username: userData.username,
        userRole: userData.role,
        clientId: userData.clientId
      };
      ("[billService] Auth params:", params);
      return params;
    } catch (e) {
      console.error("[billService] Error parsing user data:", e);
      return {};
    }
  }
  console.warn("[billService] No user in localStorage");
  return {};
};

// Create a new bill
export const createBill = async (billData) => {
  ("[billService] Creating bill with data:", billData);
  const response = await api.post("/bills", billData);
  ("[billService] Bill created response:", response.data);
  return response.data;
};

// Get all bills
export const getAllBills = async () => {
  const authParams = getAuthParams();
  const response = await api.get("/bills", { params: authParams });
  return response.data;
};

// Get bill by ID
export const getBillById = async (billNumber) => {
  const authParams = getAuthParams();
  const response = await api.get(`/bills/${billNumber}`, { params: authParams });
  return response.data;
};

// Update bill
export const updateBill = async (billNumber, billData) => {
  ("[billService] Updating bill with data:", billData);
  const authParams = getAuthParams();
  const response = await api.put(`/bills/${billNumber}`, billData, { params: authParams });
  ("[billService] Bill updated response:", response.data);
  return response.data;
};

// Approve bill
export const approveBill = async (billNumber) => {
  const authParams = getAuthParams();
  const response = await api.post(`/bills/${billNumber}/approve`, {}, { params: authParams });
  return response.data;
};

// Reject bill
export const rejectBill = async (billNumber, reason) => {
  const authParams = getAuthParams();
  const response = await api.post(`/bills/${billNumber}/reject`, { reason }, { params: authParams });
  return response.data;
};

// Delete bill
export const deleteBill = async (billNumber) => {
  const authParams = getAuthParams();
  const response = await api.delete(`/bills/${billNumber}`, { params: authParams });
  return response.data;
};

export default api;
