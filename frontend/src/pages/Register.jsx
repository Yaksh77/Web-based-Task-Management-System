import { useState } from "react";
import api from "../../api.js";
import { useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";
import toast from "react-hot-toast";
import Loader from "../components/Loader.jsx";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
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
      if(data) toast.success("User Registered successfully!");
      navigate("/login");
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      });
      toast.error(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] p-4 text-slate-900">
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl w-full max-w-md border border-slate-100"
    >
      <h2 className="text-3xl font-extrabold mb-2 text-center text-slate-900">
        Create Account
      </h2>
      <p className="text-center text-slate-500 mb-8 text-sm">Join our workspace today</p>

      {errors.form && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
          {errors.form}
        </div>
      )}

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Yaksh Chudasama"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-3.5 bg-slate-50 border rounded-2xl outline-none transition placeholder-slate-400 ${
              errors.name
                ? "border-red-300 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email Address</label>
          <input
            type="text"
            name="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3.5 bg-slate-50 border rounded-2xl outline-none transition placeholder-slate-400 ${
              errors.email
                ? "border-red-300 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-3.5 bg-slate-50 border rounded-2xl outline-none transition placeholder-slate-400 ${
              errors.password
                ? "border-red-300 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-slate-400 hover:text-indigo-600 transition"
          >
            {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-bold transition duration-300 active:scale-[0.98] shadow-xl shadow-indigo-100 ${
          loading
            ? "opacity-70 cursor-not-allowed"
            : "hover:bg-indigo-700 hover:shadow-indigo-200"
        }`}
      >
        {loading ? <Loader variant="button" /> : "Create Account"}
      </button>

      <p className="mt-6 text-center text-slate-500 text-sm font-medium">
        Already have an account?{" "}
        <button
          type="button"
          className="text-indigo-600 font-bold hover:text-indigo-800 transition"
          onClick={() => navigate("/login")}
        >
          Sign In
        </button>
      </p>
    </form>
  </div>
);
}
