import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Hiển thị thông tin gỡ lỗi
    if (requireAdmin) {
      console.log('User info:', user);
      setDebugInfo(JSON.stringify(user, null, 2));
    }
  }, [user, requireAdmin]);

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  // Kiểm tra vai trò admin hoặc tài khoản admin
  if (requireAdmin && user.role === 'admin') {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">You do not have permission to access this page.</p>
          <p>Current user role: {user.role || 'undefined'}</p>
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="whitespace-pre-wrap bg-gray-200 p-2 rounded text-xs">
            {debugInfo}
          </pre>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;