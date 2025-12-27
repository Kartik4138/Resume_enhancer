import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for tokens on load
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            setIsAuthenticated(true);
            // Optionally decode token to get user info if needed
            setUser({ email: 'User' }); // Placeholder until we have a /me endpoint or decode logic
        }
        setLoading(false);
    }, []);

    const requestOtp = async (email) => {
        try {
            await api.post('/auth/request-otp', { email });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.detail || 'Failed to request OTP'
            };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            const { access_token, refresh_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            setIsAuthenticated(true);
            setUser({ email });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.detail || 'Invalid OTP'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        requestOtp,
        verifyOtp,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
