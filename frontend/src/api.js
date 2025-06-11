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
    }
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.baseURL + config.url);
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
        console.log('Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

export default api; 