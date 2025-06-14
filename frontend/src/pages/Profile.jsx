import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  useEffect(() => {
    console.log('Current password in formData:', formData.currentPassword);
  }, [formData.currentPassword]);

  const handleEditClick = () => {
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    setIsEditing(true);
  };
  useEffect(() => {
    if (isEditing) {  // Chỉ set formData tự động khi không đang chỉnh sửa
      setFormData({
        username: user?.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, isEditing]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    try {
      await updateProfile({
        username: formData.username,
        password: formData.currentPassword,
        newPassword: formData.newPassword || null,
      });

      setSuccess('Thông tin cá nhân đã được cập nhật!');
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Cập nhật thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Cài đặt thông tin cá nhân</h2>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="bg-[#3dd9e6] text-white px-4 py-2 rounded hover:bg-[#0b1f3a] flex items-center justify-center"
                >
                  <img
                    src="/edit.png"
                    alt="Edit"
                    className="h-6 w-6 object-contain"
                  />
                </button>

              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-2 border-gray-00 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              {isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      autoComplete="off"
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-2 border-gray-00 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-2 border-gray-00 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-2 border-gray-00 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                    />
                  </div>

                </>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Hủy thay đổi
                  </button>
                  <button
                    type="submit"
                    className="bg-[#3dd9e6] text-white px-4 py-2 rounded hover:bg-[#0b1f3a]"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;

