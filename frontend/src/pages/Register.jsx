import { useState } from "react";
import api from "../../api.js";
import { useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // બીજા ફિલ્ડ માટે
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.name.trim()) {
      tempErrors.name = "Full Name is required.";
    }

    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Invalid email format.";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      tempErrors.password =
        "Must be 8+ chars with Uppercase, Number & Special char.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", formData);

      console.log("User Registered successfully:", data);
      navigate("/login");
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Create Account
        </h2>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {errors.form}
          </div>
        )}

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg outline-none transition ${
                errors.name
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-400 focus:border-blue-400"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="text"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg outline-none transition ${
                errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-400 focus:border-blue-400"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg outline-none transition ${
                errors.password
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-400 focus:border-blue-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[14px] text-gray-400 hover:text-blue-600 transition"
            >
              {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.password}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold transition duration-300 active:scale-95 ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-blue-700 shadow-lg shadow-blue-200"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 font-semibold hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
