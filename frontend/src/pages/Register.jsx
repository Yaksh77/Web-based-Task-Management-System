import { useState } from "react";
import api from "../../api.js";
import { useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", formData);
      console.log("User Registered successfully:", data);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Create Account
        </h2>

        <div className="space-y-4">
          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg outline-none transition
              hover:border-blue-400
              focus:ring-2 focus:ring-blue-400"
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded-lg outline-none transition
              hover:border-blue-400
              focus:ring-2 focus:ring-blue-400"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-lg outline-none transition
                hover:border-blue-400
                focus:ring-2 focus:ring-blue-400"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
            >
              {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold
            hover:bg-blue-700 active:scale-95 transition duration-300"
        >
          Register
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
