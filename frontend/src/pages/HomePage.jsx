// src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function HomePage() {
    const { isAuthenticated, userName } = useAuth();
    
    return (
        <div className="text-center py-20 bg-white shadow-xl rounded-xl max-w-4xl mx-auto my-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                Chào mừng đến với Virtual Marketing AI 👋
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Tự động hóa quy trình phân tích sản phẩm, tạo nội dung marketing và sản xuất media bằng trí tuệ nhân tạo.
            </p>

            {isAuthenticated ? (
                <>
                    <p className="text-2xl text-indigo-600 font-bold mb-6">
                        Bạn đã đăng nhập dưới tên: {userName}! 🎉
                    </p>
                    <Link
                        to="/generator"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-green-600 hover:bg-green-700 transition transform hover:scale-105"
                    >
                        Bắt đầu Tạo Content Ngay!
                    </Link>
                </>
            ) : (
                <>
                    <p className="text-lg text-gray-700 mb-6">
                        Vui lòng **Đăng ký** hoặc **Đăng nhập** để trải nghiệm toàn bộ sức mạnh của AI Marketing.
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/register"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
                        >
                            Đăng ký Tài khoản
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 transition"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default HomePage;