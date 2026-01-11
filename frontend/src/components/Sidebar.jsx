import {
  LuX,
  LuClipboardList,
  LuFolderKanban,
  LuLayoutDashboard,
  LuLogOut,
  LuUser,
  LuUserCheck,
} from "react-icons/lu";
import { useAuthStore } from "../store/userAuthStore";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links =
    user?.role === "ADMIN"
      ? [
          {
            name: "Dashboard",
            path: "/admin/panel",
            icon: <LuLayoutDashboard />,
          },
          {
            name: "Manage Users",
            path: "/admin/manage-users",
            icon: <LuUser />,
          },
          { name: "My Tasks", path: "/my-tasks", icon: <LuClipboardList /> },
        ]
      : [
          { name: "My Projects", path: "/dashboard", icon: <LuFolderKanban /> },
          { name: "My Tasks", path: "/my-tasks", icon: <LuClipboardList /> },
          { name: "Profile", path: "/profile", icon: <LuUserCheck /> },
        ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
      `}
      >
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">TaskFlow</h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
              {user?.role} Panel
            </p>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-500"
          >
            <LuX size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                location.pathname === link.path
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-100 rounded-xl transition font-semibold"
          >
            <LuLogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
