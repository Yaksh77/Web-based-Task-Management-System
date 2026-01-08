import React, { useState } from "react";
import { useAuthStore } from "../store/userAuthStore";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({}); 
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } 

    if (!formData.password) {
      tempErrors.password = "Password is required.";
    } 

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", formData);
      console.log(data);
      
      useAuthStore.getState().login(data.user, data.token);

      if (data.user.role === "ADMIN") {
        navigate("/admin/panel");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrors({ 
        form: err.response?.data?.message || "Login failed. Please try again." 
      });
      console.log(err);
      (err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Login</h2>

        {/* Global Error (Backend) */}
        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {errors.form}
          </div>
        )}

        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <input
              type="text"
              name="email" 
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg outline-none transition ${
                errors.email ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-400 focus:border-blue-400"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg outline-none transition ${
                errors.password ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-400 focus:border-blue-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[14px] text-gray-400 hover:text-blue-600"
            >
              {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold transition duration-300 active:scale-95 ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 shadow-lg shadow-blue-200"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <button
            type="button"
            className="text-blue-600 font-semibold hover:underline"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;