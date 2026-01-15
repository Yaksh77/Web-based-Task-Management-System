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
          { name: "Task Management", path: "/my-tasks", icon: <LuClipboardList /> },
        ]
      : [
          { name: "My Projects", path: "/dashboard", icon: <LuFolderKanban /> },
          { name: "My Tasks", path: "/my-tasks", icon: <LuClipboardList /> },
        ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-300 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
      `}
      >
        <div className="p-8 flex justify-between items-center border-b border-slate-300">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tighter">TASK<span className="text-indigo-600">LY</span></h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-[0.2em]">
              {user?.role} Mode
            </p>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl"
          >
            <LuX size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto border-b border-slate-300 pb-4">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`}
              >
                <span className={`text-xl ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`}>
                  {link.icon}
                </span>
                <span className="text-sm tracking-tight">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-6 border-t border-slate-50">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-200 rounded-2xl transition-all font-bold text-sm"
          >
            <LuLogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;