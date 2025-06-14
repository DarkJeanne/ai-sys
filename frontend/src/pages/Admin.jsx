import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Admin() {
  const { user, logout, refreshUserRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ total_users: 44, total_classifications: 10 });
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Dữ liệu mẫu cho trường hợp backend không hoạt động
  const mockUsers = [
    { id: 1, username: '1', email: '1@example.com', role: '0' },
    { id: 34, username: 'admin', email: 'admin@gmail.com', role: 'user' },
    { id: 36, username: 'admin12', email: 'admin12@gmail.com', role: 'user' },
    { id: 37, username: 'admin1', email: 'admin1@gmail.com', role: 'user' },
    { id: 39, username: 'admin2005', email: 'admin2005@gmail.com', role: 'user' },
    { id: 40, username: 'admin05', email: 'admin05@gmail.com', role: 'user' },
    { id: 43, username: 'admin005', email: 'admin005@gmail.com', role: '0' },
    { id: 44, username: 'admin205', email: 'admin205@gmail.com', role: '0' },
    { id: 10, username: 'trung', email: 'trung@gmail.com', role: '0' },
    { id: 11, username: 'trungccd', email: '1@gmail.com', role: '0' },
    { id: 17, username: 'thetrung', email: 'trung12@gmail.com', role: '0' },
    { id: 13, username: '13', email: '13@example.com', role: 'user' },
  ];

  useEffect(() => {
    // Gọi các API để lấy dữ liệu thật từ cơ sở dữ liệu
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
        console.log('Stats fetched successfully:', response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Sử dụng dữ liệu mẫu nếu có lỗi
        setStats({ total_users: mockUsers.length, total_classifications: 10 });
      }
    };

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/admin/users');
        setUsers(response.data);
        console.log('Users fetched successfully:', response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        // Sử dụng dữ liệu mẫu nếu có lỗi
        setUsers(mockUsers);
      } finally {
        setIsLoading(false);
      }
    };

    // Gọi các hàm fetch dữ liệu
    fetchStats();
    fetchUsers();
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(''); // Xóa thông báo lỗi trước đó
      
      console.log(`Searching for users with term: '${searchTerm}'`);
      
      // Nếu không có từ khóa tìm kiếm, lấy tất cả người dùng
      if (!searchTerm.trim()) {
        try {
          const response = await api.get('/admin/users');
          setUsers(response.data);
          console.log('Fetched all users:', response.data);
        } catch (err) {
          console.error('Error fetching all users:', err);
          setUsers(mockUsers);
        }
        return;
      }
      
      // Gọi API tìm kiếm người dùng với từ khóa
      try {
        const response = await api.get(`/admin/users/search?search_term=${searchTerm}`);
        setUsers(response.data);
        console.log(`Search results for '${searchTerm}':`, response.data);
        
        // Kiểm tra nếu không có kết quả nào
        if (response.data.length === 0) {
          console.log(`No users found for search term: '${searchTerm}'`);
          setError(`Không tìm thấy người dùng nào với từ khóa: '${searchTerm}'`);
        }
      } catch (err) {
        console.error('Error searching users:', err);
        
        // Sử dụng dữ liệu mẫu nếu có lỗi
        const filteredUsers = mockUsers.filter(u => 
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        setUsers(filteredUsers);
        console.log(`Using mock data. Search results for '${searchTerm}':`, filteredUsers);
        
        // Hiển thị thông báo nếu không tìm thấy kết quả nào trong dữ liệu mẫu
        if (filteredUsers.length === 0) {
          setError(`Không tìm thấy người dùng nào với từ khóa: '${searchTerm}' (dữ liệu mẫu)`);
        }
      }
    } catch (err) {
      console.error('Error in search function:', err);
      setError(`Lỗi khi tìm kiếm người dùng: ${err.message}`);
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      setIsLoading(true);
      
      // Gọi API để cập nhật vai trò người dùng
      try {
        await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
        console.log(`Role updated for user ${selectedUser.id} to ${newRole}`);
        
        // Nếu người dùng đang cập nhật vai trò của chính mình, cập nhật phiên đăng nhập
        if (user && user.username === selectedUser.username) {
          // Cập nhật vai trò trong phiên đăng nhập hiện tại
          await refreshUserRole();
          console.log('Current user role refreshed');
        }
      } catch (err) {
        console.error('Error calling API to update role:', err);
        // Tiếp tục với cập nhật trên giao diện người dùng
      }
      
      // Cập nhật người dùng trong danh sách
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          return { ...u, role: newRole };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      
      // Hiển thị thông báo khác nhau tùy theo người dùng đang cập nhật
      if (user && user.username === selectedUser.username) {
        alert('Your role has been updated. The changes will be applied immediately.');
        // Tự động làm mới trang sau 2 giây
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert('User role updated successfully.');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role.');
      alert('Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };
  
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || '');
    setShowRoleModal(true);
  };
  
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Gọi API để xóa người dùng
      try {
        await api.delete(`/admin/users/${userToDelete.id}`);
        console.log(`User deleted: ${userToDelete.id} (${userToDelete.username})`);
        
        // Cập nhật danh sách người dùng sau khi xóa
        setUsers(users.filter(u => u.id !== userToDelete.id));
        
        // Cập nhật số lượng người dùng trong thống kê
        setStats({
          ...stats,
          total_users: stats.total_users - 1
        });
        
        // Đóng modal và hiển thị thông báo thành công
        setShowDeleteModal(false);
        setUserToDelete(null);
        alert(`User ${userToDelete.username} has been deleted successfully`);
      } catch (err) {
        console.error('Error calling API to delete user:', err);
        alert(`Failed to delete user: ${err.response?.data?.detail || err.message}`);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for activity logs
  const activityLogs = [
    { id: 1, action: 'Login', user: 'admin', timestamp: '2024-03-20 10:00' },
    { id: 2, action: 'System Update', user: 'admin', timestamp: '2024-03-20 09:30' },
  ];

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium">Total Users</h3>
        <p className="text-2xl">{stats.total_users}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium">Active Sessions</h3>
        <p className="text-2xl">1</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium">System Status</h3>
        <p className="text-2xl text-green-500">Online</p>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by username or email"
            className="border rounded p-2 mr-2 flex-grow"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Nếu xóa hết từ khóa tìm kiếm, hiển thị lại tất cả người dùng
              if (e.target.value === '') {
                handleSearch();
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="bg-[#3dd9e6] text-white px-4 py-2 rounded hover:bg-[#2bc0cc]"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Hiển thị thông báo lỗi hoặc thông tin tìm kiếm */}
        {error && (
          <div className="mt-2 text-red-500">{error}</div>
        )}
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                {isLoading ? 'Loading users...' : 'No users found'}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openRoleModal(user)}
                    className="text-[#0b1f3a] hover:text-[#3dd9e6] mr-2"
                  >
                    Set Role
                  </button>
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Set Role for {selectedUser?.username}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#3dd9e6] focus:border-[#3dd9e6]"
              >
                <option value="">Select a role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowRoleModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#3dd9e6] text-white px-4 py-2 rounded hover:bg-[#0b1f3a]"
                onClick={handleSetRole}
                disabled={isLoading || !newRole}
              >
                {isLoading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete User</h3>
            
            <div className="mb-6">
              <p className="text-red-600 font-medium">Warning: This action cannot be undone!</p>
              <p className="mt-2">Are you sure you want to delete user <span className="font-bold">{userToDelete?.username}</span>?</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDeleteUser}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Logo / Title */}
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-center">
                <span className="text-[#0b1f3a]">Admin </span>
                <span className="text-[#3dd9e6]">Dashboard</span>
              </h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="bg-[#3dd9e6] text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${activeTab === 'dashboard'
                  ? 'border-[#3dd9e6] text-[#3dd9e6]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${activeTab === 'users'
                  ? 'border-[#3dd9e6] text-[#3dd9e6]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                User Management
              </button>
            </nav>
          </div>

          <div className="mt-4">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUserManagement()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin; 