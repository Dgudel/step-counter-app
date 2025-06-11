import axios from 'axios';

// Log the environment variable for debugging
console.log('API Configuration - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Use the environment variable if available, otherwise fallback to localhost
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Add a build-time check
if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
  console.error('REACT_APP_API_URL is not set in production!');
}

console.log('Using baseURL:', baseURL);

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Add this to handle CORS credentials
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.baseURL + config.url);
        console.log('Request config:', {
            method: config.method,
            headers: config.headers,
            data: config.data,
            withCredentials: config.withCredentials
        });
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to log responses
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response error:', {
            message: error.message,
            response: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            } : 'No response received',
            request: error.request ? 'Request was made but no response received' : 'No request was made'
        });
        return Promise.reject(error);
    }
);

export default api; 