// src/components/Header.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
    const { isAuthenticated, userName, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Chuyển về trang chủ sau khi đăng xuất
    };

    return (
        <header className="bg-indigo-700 shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Tên ứng dụng */}
                    <Link to="/" className="text-2xl font-bold text-white tracking-wider hover:text-indigo-200 transition">
                        Marketing AI 🤖
                    </Link>

                    {/* Menu và Auth Buttons */}
                    <nav className="flex items-center space-x-4">
                        <Link 
                            to="/" 
                            className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                        >
                            Trang chủ
                        </Link>
                        <Link 
                            to="/generator" 
                            className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                        >
                            Tạo nội dung
                        </Link>
                        <Link 
                            to="/poster" 
                            className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                        >
                            Tạo ảnh
                        </Link>
                        
                        <Link 
                            to="/competitor-analysis" 
                            className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                        >
                            Phân tích Đối thủ
                        </Link>
                           {isAuthenticated && (
                            <Link 
                                to="/history/analyses" 
                                className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                            >
                                Lịch sử
                            </Link>
                        )}
                
                        
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-indigo-200 text-sm font-semibold">
                                    Xin chào, {userName}!
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-150"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className="bg-white text-indigo-700 hover:bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium transition duration-150 shadow"
                                >
                                    Đăng nhập
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-150 shadow"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;