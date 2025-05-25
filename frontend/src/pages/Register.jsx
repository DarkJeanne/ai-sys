import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Register() {
    const {register} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register({
                username,
                password,
                email,
                Role: "user"
            });
            alert('Đăng ký thành công');
            window.location.href = '/login';
        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            setError('Đăng ký thất bại');
        }
    };

    const handleBackToLogin = () => {
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Đăng ký tài khoản</h2>

                        {error && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    autoComplete="off"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                />
                            </div>

                            {/* Nút quay lại + đăng ký cùng dòng, căn phải */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleBackToLogin}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Quay lại đăng nhập
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#3dd9e6] text-white px-4 py-2 rounded hover:bg-[#0b1f3a]"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default Register;
