import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Admin() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ total_users: 0, total_classifications: 0 });
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch stats.');
      }
    };

    const fetchData = async () => {
      try {
        const response = await api.get('/admin/data');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch data.');
      }
    };

    fetchStats();
    fetchData();
  }, []);

  // Mock data
  const users = [
    { id: 1, username: 'admin', role: 'admin', lastLogin: '2024-03-20 10:00' },
    { id: 2, username: 'user1', role: 'user', lastLogin: '2024-03-19 15:30' },
  ];

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
    <div className="bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.lastLogin}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {/* Nút chỉnh sửa */}
                  <button className="text-blue-600 hover:text-blue-900">
                    <img
                      src="/edit.png"
                      alt="Edit"
                      className="h-6 w-6 object-contain"
                    />
                  </button>

                  {/* Nút xoá */}
                  <button className="text-red-600 hover:text-red-900">
                    <img
                      src="/delete.png"
                      alt="Delete"
                      className="h-8 w-8 object-contain"
                    />
                  </button>
                </div>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderActivityLogs = () => (
    <div className="bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activityLogs.map((log) => (
            <tr key={log.id}>
              <td className="px-6 py-4 whitespace-nowrap">{log.action}</td>
              <td className="px-6 py-4 whitespace-nowrap">{log.user}</td>
              <td className="px-6 py-4 whitespace-nowrap">{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
              <button
                onClick={() => setActiveTab('logs')}
                className={`${activeTab === 'logs'
                  ? 'border-[#3dd9e6] text-[#3dd9e6]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Activity Logs
              </button>
            </nav>
          </div>

          <div className="mt-4">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'logs' && renderActivityLogs()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin; 