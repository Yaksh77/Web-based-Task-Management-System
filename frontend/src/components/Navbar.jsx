import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";

function Navbar() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="text-xl font-bold hover:text-blue-200 transition"
        >
          Task Management System
        </Link>

        {/* User Section */}
        {user ? (
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div
              className="w-10 h-10 flex items-center justify-center bg-blue-800 rounded-full text-white font-bold text-lg hover:bg-blue-900 transition cursor-default"
              title={user.name}
            >
              {user.name.slice(0, 1).toUpperCase()}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="hover:text-blue-200 transition font-semibold"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="hover:text-blue-200 transition font-semibold"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
