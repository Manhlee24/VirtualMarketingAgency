// src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function HomePage() {
    const { isAuthenticated, userName } = useAuth();
    
    return (
        <div className="max-w-6xl mx-auto my-12 space-y-8">
            {/* Main Welcome Section */}
            <div className="text-center py-20 bg-white shadow-xl rounded-xl">
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

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Content Generator Feature */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Tạo Nội Dung Marketing</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Phân tích sản phẩm và tự động tạo nội dung marketing chuyên nghiệp với AI. 
                        Hỗ trợ nhiều định dạng và giọng điệu khác nhau.
                    </p>
                    <Link
                        to="/generator"
                        className="inline-flex items-center px-5 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                    >
                        Trải nghiệm ngay
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>

                {/* Competitor Analysis Feature */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Phân Tích Đối Thủ</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Phân tích chuyên sâu chiến lược thị trường của đối thủ cạnh tranh. 
                        Khám phá USPs, khách hàng mục tiêu, và cơ hội thị trường.
                    </p>
                    <Link
                        to="/competitor-analysis"
                        className="inline-flex items-center px-5 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                    >
                        Bắt đầu phân tích
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                    <div className="mt-4 inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                        ✨ Tính năng mới
                    </div>
                </div>

                {/* Poster Generator (Direct) */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-rose-600 rounded-lg flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4-4-4m6 8h10" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Tạo Poster từ Ảnh Mẫu</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Bỏ qua Giai đoạn 1 và 2. Cung cấp ảnh mẫu bắt buộc, tên sản phẩm và (tuỳ chọn) phong cách để AI chỉnh sửa/tạo poster.
                    </p>
                    <Link
                        to="/poster"
                        className="inline-flex items-center px-5 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition"
                    >
                        Tạo Poster nhanh
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomePage;