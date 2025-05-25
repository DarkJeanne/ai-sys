import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState(window.location.pathname);
  const settingsRef = useRef();

  // Ẩn menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (path) => {
    setActiveTab(path);
    window.location.href = path;
  };

  return (
    <nav className="bg-white shadow-sm relative">
      <div className="px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-16">

          {/* Left: Logo / Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/logoDas.png"
              alt="Logo"
              className="h-12 w-12 object-contain"
            />
            <h1 className="text-2xl font-bold text-center">
              <span className="text-[#0b1f3a]">Tomato Quality </span>
              <span className="text-[#3dd9e6]">Inspection</span>
            </h1>
          </div>

          {/* Center: Navigation Buttons */}
          <div className="hidden md:flex space-x-12 ml-12 relative" ref={settingsRef}>
            <button
              onClick={() => handleTabClick('/')}
              className={`text-l font-medium transition ${
                activeTab === '/' ? 'text-[#3dd9e6]' : 'text-[#0b1f3a] hover:text-[#3dd9e6]'
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => handleTabClick('/aboutus')}
              className={`text-l font-medium transition ${
                activeTab === '/aboutus' ? 'text-[#3dd9e6]' : 'text-[#0b1f3a] hover:text-[#3dd9e6]'
              }`}
            >
              Về chúng tôi
            </button>
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setActiveTab('/settings');
              }}
              className={`text-l font-medium transition ${
                activeTab === '/settings' ? 'text-[#3dd9e6]' : 'text-[#0b1f3a] hover:text-[#3dd9e6]'
              }`}
            >
              Cài đặt
            </button>

            {/* Dropdown: Hồ sơ + Đăng xuất */}
            {user && showSettings && (
              <div className="absolute top-12 right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button
                  onClick={() => handleTabClick('/profile')}
                  className="block w-full text-left px-4 py-2 text-m text-[#0b1f3a] hover:bg-gray-100"
                >
                  Hồ sơ
                </button>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-m text-red-600 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
