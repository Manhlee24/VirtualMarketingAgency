// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BASE_URL = "http://127.0.0.1:8000/api/v1";

export const AuthProvider = ({ children }) => {
    // Lấy token từ localStorage khi khởi tạo
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        setIsAuthenticated(!!token);
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const login = async (email, password) => {
        setAuthLoading(true);
        setAuthError(null);
        try {
            const response = await axios.post(` http://127.0.0.1:8000/api/auth/login`, { email, password });
            
            const { access_token, name, message } = response.data;
            
            setToken(access_token);
            setUserName(name);
            localStorage.setItem('userName', name); // Lưu tên user
            setAuthLoading(false);
            return { success: true, message: message };
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            setAuthError(error.response?.data?.detail || "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
            setAuthLoading(false);
            return { success: false, message: authError };
        }
    };

    const register = async (email, name, password) => {
        setAuthLoading(true);
        setAuthError(null);
        try {
            const response = await axios.post(` http://127.0.0.1:8000/api/auth/register`, { email, name, password });
            
            const { access_token, message } = response.data;
            
            // Tự động đăng nhập sau khi đăng ký
            setToken(access_token);
            setUserName(name);
            localStorage.setItem('userName', name);
            setAuthLoading(false);
            return { success: true, message: message };
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            setAuthError(error.response?.data?.detail || "Đăng ký thất bại. Email có thể đã tồn tại.");
            setAuthLoading(false);
            return { success: false, message: authError };
        }
    };

    const logout = () => {
        setToken(null);
        setUserName(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        // Chuyển hướng người dùng về trang chủ hoặc login (sẽ xử lý bằng hook trong component)
    };

    return (
        <AuthContext.Provider value={{ 
            token, 
            userName,
            isAuthenticated, 
            authLoading, 
            authError, 
            login, 
            register, 
            logout,
            BASE_URL // Truyền BASE_URL để sử dụng cho các API khác
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);