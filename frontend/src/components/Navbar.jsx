import { LuMenu } from "react-icons/lu";
import { useAuthStore } from "../store/userAuthStore";
import { Link } from "react-router-dom";

function Navbar({ toggleSidebar }) {
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="bg-white border-b border-slate-300 px-4 md:px-8 py-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={toggleSidebar}
              className="p-2.5 hover:bg-slate-50 rounded-xl lg:hidden text-slate-500 transition-colors"
            >
              <LuMenu size={24} />
            </button>
          )}
          <Link
            to="/"
            className="text-xl font-extrabold text-slate-900 tracking-tight hidden md:block"
          >
            Task<span className="text-indigo-600">Ly</span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">
                {user.role}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 ring-2 ring-indigo-50">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;