import axios from 'axios';

// CHANGE THIS to your actual .NET API URL
const API_URL = 'https://localhost:7018/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Call Failed:", error);
    return Promise.reject(error);
  }
);

export const LicenseService = {
  getAll: () => api.get('/Licenses'),
  getById: (id) => api.get(`/Licenses/${id}`),
  create: (data) => api.post('/Licenses', data),
  update: (id, data) => api.put(`/Licenses/${id}`, data),
  delete: (id) => api.delete(`/Licenses/${id}`),
  renew: (id) => api.post(`/Licenses/Renew/${id}`),
  import: (formData) => api.post('/Licenses/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const DeviceService = {
  getAll: () => api.get('/Devices'),
  getById: (id) => api.get(`/Devices/${id}`),
  onboard: (data) => api.post('/Devices', data),
  update: (id, data) => api.put(`/Devices/${id}`, data),
  delete: (id) => api.delete(`/Devices/${id}`),
  
  // Software Installation Endpoints
  installSoftware: (data) => api.post('/Devices/Install', data),
  // NEW Methods
  deleteInstallation: (id) => api.delete(`/Devices/Install/${id}`),
  updateInstallation: (id, data) => api.put(`/Devices/Install/${id}`, data),
};

export const ComplianceService = {
  runCheck: () => api.post('/Compliance/RunCheck'),
  getAlerts: () => api.get('/Compliance/Alerts'),
};

export const ReportService = {
  getDashboard: () => api.get('/Reports/Dashboard'),
  getAllocations: () => api.get('/CostAllocation'),
  createAllocation: (data) => api.post('/CostAllocation', data),
  getByDepartment: () => api.get('/CostAllocation/ByDepartment'),
  getLogs: () => api.get('/Audit'),
};

export default api;