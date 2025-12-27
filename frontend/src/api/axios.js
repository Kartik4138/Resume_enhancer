import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    // No refresh token, logout
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Call backend to refresh token
                // Based on spec: POST /auth/refresh
                // The spec implies it might need the refresh token in the body or header. 
                // Usually it's Authorization: Bearer <refresh_token> or body.
                // Let's assume standard Bearer for now, or check detailed spec if available.
                // Spec says: "Use refresh token to obtain new access token."
                // Let's try sending it as a bearer token in this specific request

                const response = await axios.post('http://localhost:8000/auth/refresh', {}, {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`
                    }
                });

                const { access_token } = response.data;

                localStorage.setItem('access_token', access_token);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
