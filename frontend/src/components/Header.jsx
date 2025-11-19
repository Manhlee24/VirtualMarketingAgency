// src/components/Header.jsx

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
    const { isAuthenticated, userName, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to decide active classes
    const navLinkClass = (to, options = {}) => {
        const { startsWith } = options;
        const isActive = startsWith
            ? location.pathname.startsWith(startsWith)
            : location.pathname === to;
        const base = 'px-3 py-2 rounded-md text-sm font-medium transition duration-150';
        const inactive = 'text-white hover:text-indigo-200 hover:bg-indigo-600/40';
        const active = 'bg-white text-indigo-700 font-semibold shadow ring-2 ring-indigo-300';
        return `${base} ${isActive ? active : inactive}`;
    };

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
                            className={navLinkClass('/')}
                            aria-current={location.pathname === '/' ? 'page' : undefined}
                        >Trang chủ</Link>
                        <Link
                            to="/generator"
                            className={navLinkClass('/generator')}
                            aria-current={location.pathname === '/generator' ? 'page' : undefined}
                        >Tạo nội dung</Link>
                        <Link
                            to="/poster"
                            className={navLinkClass('/poster')}
                            aria-current={location.pathname === '/poster' ? 'page' : undefined}
                        >Tạo ảnh</Link>
                        <Link
                            to="/competitor-analysis"
                            className={navLinkClass('/competitor-analysis')}
                            aria-current={location.pathname === '/competitor-analysis' ? 'page' : undefined}
                        >Phân tích Đối thủ</Link>
                        {isAuthenticated && (
                            <Link
                                to="/history/analyses"
                                className={navLinkClass('/history/analyses', { startsWith: '/history' })}
                                aria-current={location.pathname.startsWith('/history') ? 'page' : undefined}
                            >Lịch sử</Link>
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
                                    className={navLinkClass('/login')}
                                    aria-current={location.pathname === '/login' ? 'page' : undefined}
                                >Đăng nhập</Link>
                                <Link
                                    to="/register"
                                    className={navLinkClass('/register')}
                                    aria-current={location.pathname === '/register' ? 'page' : undefined}
                                >Đăng ký</Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;