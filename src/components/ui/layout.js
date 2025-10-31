import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { base44 } from '../../api/base44Client';

export function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          {/* Logo */}
          <div className="flex items-center p-4 border-b">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-xl">🧠</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold">SkillSync</h1>
              <p className="text-xs text-gray-600">AI Career Guide</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <p className="text-xs font-semibold text-gray-400 mb-4">NAVIGATION</p>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/dashboard"
                  className="flex items-center p-2 hover:bg-purple-50 rounded-lg text-gray-700"
                >
                  <span className="mr-3">🏠</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile"
                  className="flex items-center p-2 hover:bg-purple-50 rounded-lg text-gray-700"
                >
                  <span className="mr-3">👤</span>
                  My Profile
                </Link>
              </li>
              <li>
                <Link 
                  to="/career-explorer"
                  className="flex items-center p-2 hover:bg-purple-50 rounded-lg text-gray-700"
                >
                  <span className="mr-3">🔍</span>
                  Career Explorer
                </Link>
              </li>
              <li>
                <Link 
                  to="/skills-roadmap"
                  className="flex items-center p-2 hover:bg-purple-50 rounded-lg text-gray-700"
                >
                  <span className="mr-3">🎯</span>
                  Skills Roadmap
                </Link>
              </li>
              <li>
                <Link 
                  to="/learning-path"
                  className="flex items-center p-2 hover:bg-purple-50 rounded-lg text-gray-700"
                >
                  <span className="mr-3">📚</span>
                  Learning Path
                </Link>
              </li>
              <li>
                <Link 
                  to="/portfolio"
                  className="flex items-center p-2 hover:bg-purple-50 rounded-lg text-gray-700"
                >
                  <span className="mr-3">💼</span>
                  Portfolio Builder
                </Link>
              </li>
              <li>
                <Link 
                  to="/assessment"
                  className="flex items-center p-2 hover:bg-purple-50 rounded-lg text-gray-700 bg-purple-100"
                >
                  <span className="mr-3">🧪</span>
                  Assessment
                </Link>
              </li>
            </ul>
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 w-64 border-t">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                  <span className="text-purple-700 text-lg">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate" style={{ maxWidth: '150px' }}>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}