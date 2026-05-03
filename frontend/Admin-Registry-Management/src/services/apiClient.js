import axios from 'axios';

// 1. Create the base instance using your Environment Variable
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_REGISTRY_URL || 'http://localhost:5001',
  timeout: 10000, // Automatically cancel if backend takes longer than 10s
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. The Request Interceptor (Auto-attach Tokens)
apiClient.interceptors.request.use(
  (config) => {
    // Grab the token from wherever the Central Shell stored it (e.g., localStorage)
    const token = localStorage.getItem('authz_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. The Response Interceptor (Global Error Handling)
apiClient.interceptors.response.use(
  (response) => response.data, // Strip away the axios wrapper, just return the raw data
  (error) => {
    // If the token expired, automatically log the user out!
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      window.location.href = '/login'; 
    }
    
    // Format the error nicely for the UI
    const customError = new Error(error.response?.data?.error || "An unexpected network error occurred");
    return Promise.reject(customError);
  }
);

export default apiClient;