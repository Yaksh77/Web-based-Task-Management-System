import { LuMenu } from "react-icons/lu";
import { useAuthStore } from "../store/userAuthStore";
import { Link } from "react-router-dom";
function Navbar({ toggleSidebar }) {
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden text-gray-600"
            >
              <LuMenu size={24} />
            </button>
          )}
          <Link
            to="/"
            className="text-xl font-bold text-gray-800 hidden md:block"
          >
            Task Management System
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-800 leading-none">
                {user.name}
              </p>
              <p className="text-[10px] text-gray-500 uppercase mt-1">
                {user.role}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
