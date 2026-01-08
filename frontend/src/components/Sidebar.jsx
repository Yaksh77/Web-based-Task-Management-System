import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/userAuthStore';
import { LuClipboardList, LuFolderKanban, LuLayoutDashboard, LuLogOut, LuUser, LuUserCheck } from 'react-icons/lu';


function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();    
  if(!user) return null;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/panel', icon: <LuLayoutDashboard /> },
    { name: 'Manage Users', path: '/admin/manage-users', icon: <LuUser /> },
    { name: 'Task Management', path: '/my-tasks', icon: <LuClipboardList /> },
  ];

  const userLinks = [
    { name: 'My Projects', path: '/dashboard', icon: <LuFolderKanban /> },
    { name: 'My Tasks', path: '/my-tasks', icon: <LuClipboardList /> },
    { name: 'Profile', path: '/profile', icon: <LuUserCheck /> },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">TaskFlow</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{user?.role} Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              location.pathname === link.path
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            {link.name}
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name} ({user?.role})</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          <LuLogOut className="text-xl" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;