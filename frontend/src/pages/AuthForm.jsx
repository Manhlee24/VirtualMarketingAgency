// src/pages/AuthForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function AuthForm({ type }) {
    const isLogin = type === 'login';
    const navigate = useNavigate();
    const { login, register, authLoading, authError } = useAuth();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        if (!email || !password || (!isLogin && !name)) {
            setLocalError("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await register(email, name, password);
        }

        if (result.success) {
            navigate('/generator'); // Chuyển đến trang tạo content sau khi thành công
        }
    };

    return (
        <div className="max-w-md mx-auto my-16 p-8 bg-white shadow-2xl rounded-xl">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                {isLogin ? 'Đăng nhập vào Hệ thống' : 'Đăng ký Tài khoản Mới'}
            </h2>
            
            {(authError || localError) && (
                <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                    Lỗi: {authError || localError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                
                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên của bạn</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required={!isLogin}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={authLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-300 ${
                        authLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {authLoading ? (
                        `${isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}`
                    ) : (
                        isLogin ? 'Đăng nhập' : 'Đăng ký'
                    )}
                </button>
            </form>
            
            <div className="mt-6 text-center">
                {isLogin ? (
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản? <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Đăng ký ngay</Link>
                    </p>
                ) : (
                    <p className="text-sm text-gray-600">
                        Đã có tài khoản? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Đăng nhập</Link>
                    </p>
                )}
            </div>
        </div>
    );
}

export default AuthForm;